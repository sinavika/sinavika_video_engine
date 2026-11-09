"""Works yazılı derslerini Claude Message Batches ile yazdırır (yarı fiyat), motorun denetiminden geçirir, hatalıları düzeltme turuna yollar.

Kullanım (motor kökünden):
  python Curriculum/WorksWritten/Tools/works_batch.py paket  YKS_TYT/MAT/MAT_BASAMAK          → paketi Outputs/WorksWritten/Paketler'e yazar (bakmak için)
  python ... gonder  --model opus|sonnet --hedef <klasör> [--etiket ad] <KAT/DERS/KONU | KAT/DERS> ...
  python ... topla   <batch_id>                                                             → biter bitmez sonuçları hedef klasöre yazar, maliyeti söyler
  python ... denetle --hedef <klasör> <KAT/DERS/KONU | KAT/DERS> ...                        → motor denetimi (works --dry); sorunları Outputs/WorksWritten/sorunlar.json'a yazar
  python ... duzelt  --model opus|sonnet --hedef <klasör> [<KAT/DERS/KONU> ...]             → sorunlu (ya da çıktısı okunamayan) konuları önceki çıktı + sorunlarla yeniden yollar
  python ... maliyet                                                                        → bu araçla harcanan toplam

Girdi: konunun bugünkü Works dosyası (temel; yazılı dersi olan konuda git HEAD'deki videodan kurulan hâli) ve EgitimVerileri'nden
MEB anlatımı, ÖSYM çıkmış soruları, cevabı doğrulanmış havuz soruları. Yönerge: Tools/Yonerge.md (önbellekte).
Anthropic anahtarı Desktop/sinavika_parse istemcisinden okunur, hiçbir yere yazılmaz. Kullanım EgitimVerileri/_Claude/usage.jsonl'a da işlenir.
"""
import argparse, copy, glob, json, os, re, subprocess, sys, time

ENGINE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
WORKS = os.path.join(ENGINE, 'Curriculum', 'Works')
WRITTEN = os.path.join(ENGINE, 'Curriculum', 'WorksWritten')
OUT = os.path.join(ENGINE, 'Outputs', 'WorksWritten')
EV = os.path.join(os.path.expanduser('~'), 'Desktop', 'EgitimVerileri')
YONERGE = os.path.join(os.path.dirname(__file__), 'Yonerge.md')
STATE = os.path.join(OUT, 'batches.jsonl')
COSTS = os.path.join(OUT, 'kullanim.jsonl')
ISSUES = os.path.join(OUT, 'sorunlar.json')
sys.path.insert(0, os.path.join(os.path.expanduser('~'), 'Desktop', 'sinavika_parse'))
from sourceparsing import claude_api as api  # noqa: E402

MODELS = {'opus': 'claude-opus-5-5', 'sonnet': 'claude-sonnet-5-5'}
PRICES = {'claude-opus-5-5': (4.0, 20.0), 'claude-sonnet-5-5': (2.0, 10.0)}
EXAMS = {'YKS_TYT': 'YKS/TYT', 'YKS_AYT': 'YKS/AYT', 'KPSS_LISANS': 'KPSS/Lisans', 'KPSS_ONLISANS': 'KPSS/OnlisansOrtaogretim', 'KPSS_ORTAOGRETIM': 'KPSS/OnlisansOrtaogretim'}


def refs_of(items):
    """KAT/DERS/KONU ya da KAT/DERS (dersin bütün konuları)."""
    out = []
    for item in (i.strip() for i in items if i.strip()):
        parts = item.strip('/').split('/')
        if len(parts) == 3:
            out.append(item.strip('/'))
        else:
            out += sorted(os.path.relpath(p, WORKS).replace(os.sep, '/')[:-5] for p in glob.glob(os.path.join(WORKS, *parts, '*.json')))
    return out


def base_of(ref):
    """Videodan kurulan Works dosyası: yazılı dersi olan konuda Curriculum/Works artık yazılı derstir, temel git HEAD'den gelir."""
    if os.path.exists(os.path.join(WRITTEN, ref + '.json')):
        shown = subprocess.run(['git', 'show', f'HEAD:Curriculum/Works/{ref}.json'], cwd=ENGINE, capture_output=True, text=True, encoding='utf-8')
        if shown.returncode == 0:
            return json.loads(shown.stdout)
    return json.load(open(os.path.join(WORKS, ref + '.json'), encoding='utf-8'))


def compact(node):
    """Seslendirme/kurgu alanlarını atar, anlatımı korur: beats yalnız cümleleri, soru adımları text + narration (+ görsel)."""
    if isinstance(node, list):
        return [compact(x) for x in node]
    if not isinstance(node, dict):
        return node
    out = {}
    for key, value in node.items():
        if key in ('thinkSeconds', 'eliminate', 'mark', 'sentences', 'show', 'focus', 'swap', 'zoom', 'still') or value in (None, [], ''):
            continue
        if key == 'beats':
            out['beats'] = [b.get('narration') for b in value if isinstance(b, dict) and b.get('narration')]
            continue
        out[key] = compact(value)
    return out


def cut(text, limit):
    text = (text or '').strip()
    return text if len(text) <= limit else text[:limit] + ' …'


def sources_of(ref):
    category, lesson, topic = ref.split('/')
    root = os.path.join(EV, *EXAMS[category].split('/'))
    pack = {'meb': [], 'osym': [], 'havuz': []}
    sub_names = []
    path = os.path.join(root, 'KonuAnlatimi', lesson, topic + '.json')
    if os.path.exists(path):
        data = json.load(open(path, encoding='utf-8'))
        sub_names = data.get('lessonMikros', [])
        budget = 16000
        for book in data.get('explanations', []):
            for section in book.get('sections', []):
                text = cut(section.get('text'), 2500)
                if budget - len(text) < 0:
                    break
                budget -= len(text)
                pack['meb'].append({'altKonu': section.get('lessonMikroCode'), 'baslik': cut(section.get('heading'), 160), 'metin': text, 'kitap': book.get('title')})
        if data.get('knowledgePacks'):
            pack['mebBilgi'] = cut(json.dumps(data['knowledgePacks'], ensure_ascii=False), 3000)
    path = os.path.join(root, 'CikmisSorular', lesson + '.jsonl')
    if os.path.exists(path):
        rows = [json.loads(line) for line in open(path, encoding='utf-8') if f'"{topic}"' in line]
        for row in [r for r in rows if r.get('lessonSubCode') == topic][:12]:
            pack['osym'].append({'yil': row.get('year'), 'altKonu': row.get('lessonMikroCode'), 'soru': cut(row.get('question'), 900),
                                 'secenekler': [o.get('text') for o in row.get('options') or []], 'cevap': row.get('answer')})
    path = os.path.join(root, 'Sorular', lesson, topic + '.jsonl')
    if os.path.exists(path):
        rows = [json.loads(line) for line in open(path, encoding='utf-8')]
        good = [r for r in rows if r.get('answer') and not (r.get('match') or {}).get('needsReview') and not r.get('warnings') and not r.get('hasFigure')]
        good.sort(key=lambda r: (not r.get('solution'), r.get('id')))
        for row in good[:6]:
            pack['havuz'].append({'altKonu': row.get('lessonMikroCode'), 'soru': cut(row.get('question'), 600),
                                  'secenekler': [o.get('text') for o in row.get('options') or []], 'cevap': row.get('answer'), 'cozum': cut(row.get('solution'), 400)})
    return pack, sub_names


#: 'video': temel, videodan kurulan Works dosyasıdır (ilk yazım). 'yazili': temel, konunun bugünkü yazılı dersidir (sonraki geçişler; iyileştirmeler korunur).
BASE_MODE = {'value': 'video'}


def package_of(ref, previous=None, problems=None):
    written_path = os.path.join(WRITTEN, ref + '.json')
    if BASE_MODE['value'] == 'yazili' and os.path.exists(written_path):
        base = json.load(open(written_path, encoding='utf-8'))
        notes = [a['note'] for a in base.get('written', {}).get('additions', [])]
        kind = 'yazili'
    else:
        base = base_of(ref)
        notes = (base.get('works') or {}).get('additions', [])
        kind = 'video'
    pack, sub_names = sources_of(ref)
    body = {'konu': ref, 'temelTuru': kind, 'altKonular': sub_names, 'worksNotlari': notes,
            'temel': compact({k: v for k, v in base.items() if k != 'works'}), 'kaynaklar': pack}
    if previous is not None:
        body['oncekiCikti'] = previous
        body['sorunlar'] = problems
    return body


#: Hesaplı ve şekilli dersler yüksek düşünme düzeyiyle; sözel dersler orta düzeyle yazılır (ölçüm, 3 Kasım 2026: düşünme çıktının çoğu).
HIGH_EFFORT = {'MAT', 'GEO', 'FIZ', 'KIM'}


def params_of(model, body):
    text = ('Konu paketi aşağıda. ' + ('Bu bir düzeltme turu: yalnız `sorunlar`ı gider, `oncekiCikti`nın geri kalanını koru. ' if 'sorunlar' in body else '')
            + ('`temel` zaten yazılı derstir: içeriğini, etkileşimli kartlarını ve düzeltmelerini koru; yönergedeki öğretim sırasına göre eksikleri tamamla (tanım, anlam, çözümlü örnekler) ve hataları düzelt. ' if body.get('temelTuru') == 'yazili' else '')
            + 'Yönergeye göre yazılı dersi yaz; yalnız JSON döndür.\n\n' + json.dumps(body, ensure_ascii=False))
    effort = 'high' if body['konu'].split('/')[1] in HIGH_EFFORT else 'medium'
    return {'model': MODELS[model], 'max_tokens': 128000, 'thinking': {'type': 'adaptive'}, 'output_config': {'effort': effort},
            'system': [{'type': 'text', 'text': open(YONERGE, encoding='utf-8').read(), 'cache_control': {'type': 'ephemeral'}}],
            'messages': [{'role': 'user', 'content': text}]}


def custom_id(ref):
    return ref.replace('/', '__')


def submit(model, target, refs, tag, previous=None):
    requests = []
    for ref in refs:
        prev = previous.get(ref) if previous else None
        body = package_of(ref, *(prev if prev else (None, None)))
        requests.append({'custom_id': custom_id(ref), 'params': params_of(model, body)})
    batch_id = api.submit_batch(requests)
    os.makedirs(OUT, exist_ok=True)
    with open(STATE, 'a', encoding='utf-8') as handle:
        handle.write(json.dumps({'id': batch_id, 'model': model, 'target': os.path.abspath(target), 'refs': refs, 'tag': tag, 'at': time.strftime('%Y-%m-%dT%H:%M:%S')}, ensure_ascii=False) + '\n')
    print(f'{len(refs)} konu gönderildi ({MODELS[model]}): {batch_id}')
    return batch_id


def lesson_json(text):
    text = text.strip()
    text = re.sub(r'^```(?:json)?\s*|\s*```$', '', text)
    start, end = text.find('{'), text.rfind('}')
    text = text[start:end + 1]
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    # Sık görülen bozukluklar: \' ve tek ters bölülü LaTeX (geçersiz kaçış), kapanmayan kart ("…}},{"kind"), sonda eksik parantez.
    text = re.sub(r'\\(?![\"\\/bfnrtu])', r'\\\\', text.replace("\\'", "'"))
    for _ in range(30):
        try:
            data = json.loads(text)
            lesson = data.get('lesson') or {}
            for key in [k for k in lesson if k in ('camp', 'topic', 'title', 'lessonName', 'exams', 'sourceScripts', 'written')]:
                data[key] = lesson.pop(key)
            return data
        except json.JSONDecodeError as error:
            p = error.pos
            if error.msg.startswith('Expecting property name') and text[p:p + 1] == '{' and text[p - 1:p] == ',':
                text = text[:p - 1] + '}' + text[p - 1:]
            elif error.msg.startswith("Expecting ',' delimiter") and p >= len(text) - 1:
                text += '}'
            else:
                raise


def price(model, usage):
    p_in, p_out = PRICES[model]
    fresh = usage.get('input_tokens', 0)
    return 0.5 * (fresh * p_in + usage.get('cache_read_input_tokens', 0) * p_in * 0.1 + usage.get('cache_creation_input_tokens', 0) * p_in * 1.25 + usage.get('output_tokens', 0) * p_out) / 1e6


def collect(batch_id):
    entry = next(json.loads(l) for l in open(STATE, encoding='utf-8') if json.loads(l)['id'] == batch_id)
    while api.batch_status(batch_id)['processing_status'] != 'ended':
        time.sleep(60)
    total, ok, bad = 0.0, 0, []
    for result in api.batch_results(batch_id):
        ref = result['custom_id'].replace('__', '/')
        res = result['result']
        if res['type'] != 'succeeded':
            bad.append(f'{ref}: {res["type"]}')
            continue
        message = res['message']
        usage = message.get('usage', {})
        total += price(message['model'] if message['model'] in PRICES else MODELS[entry['model']], usage)
        api.record_usage('works-yazili', message.get('model', MODELS[entry['model']]), usage, True)
        with open(COSTS, 'a', encoding='utf-8') as handle:
            handle.write(json.dumps({'batch': batch_id, 'ref': ref, 'model': message.get('model'), 'usage': usage, 'stop': message.get('stop_reason'), 'usd': round(price(MODELS[entry['model']], usage), 4)}) + '\n')
        target = os.path.join(entry['target'], *ref.split('/')) + '.json'
        os.makedirs(os.path.dirname(target), exist_ok=True)
        raw = api.text_of(message)
        try:
            lesson = lesson_json(raw)
            json.dump(lesson, open(target, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
            ok += 1
        except (json.JSONDecodeError, ValueError) as error:
            open(target + '.ham.txt', 'w', encoding='utf-8').write(raw)
            bad.append(f'{ref}: JSON okunamadı ({error}; durma nedeni {message.get("stop_reason")})')
    print(f'{batch_id}: {ok} ders yazıldı, {len(bad)} sorun, bu paketin maliyeti {total:.2f} $')
    for line in bad:
        print('  -', line)


def check(target, refs):
    """Motor denetimi: works --dry --written; konu başına sorunlar."""
    by_category = {}
    for ref in refs:
        by_category.setdefault(ref.split('/')[0], []).append(ref)
    issues = json.load(open(ISSUES, encoding='utf-8')) if os.path.exists(ISSUES) else {}
    for category, items in by_category.items():
        present = [r for r in items if os.path.exists(os.path.join(target, *r.split('/')) + '.json')]
        for ref in set(items) - set(present):
            issues[ref] = ['Çıktı yok ya da JSON okunamadı.']
        if not present:
            continue
        run = subprocess.run(['npx', 'tsx', 'scripts/Curriculum.ts', 'works', category, '--topic', ','.join(present), '--dry', '--written', os.path.abspath(target)],
                             cwd=ENGINE, capture_output=True, text=True, encoding='utf-8', shell=os.name == 'nt')
        found, current, warning = {}, None, False
        for line in (run.stdout + run.stderr).splitlines():
            if line.startswith('Öğretim sırası uyarıları'):
                warning = True
            elif line.startswith('Yazılı ders kullanılmadı'):
                warning = False
            m = re.match(r'^\s{2}(\S+/\S+/\S+):$', line)
            if m:
                current = m.group(1)
                found.setdefault(current, [])
            elif current and line.startswith('    - '):
                found[current].append(('uyarı: ' if warning else '') + line[6:])
        for ref in present:
            issues[ref] = found.get(ref, [])
    json.dump(issues, open(ISSUES, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    failed = {r: v for r, v in issues.items() if r in refs and any(not p.startswith('uyarı: ') for p in v)}
    warned = {r: v for r, v in issues.items() if r in refs and v and r not in failed}
    print(f'{len(refs)} konu denetlendi: {len(refs) - len(failed) - len(warned)} temiz, {len(warned)} yalnız öğretim sırası uyarılı, {len(failed)} reddedilen')
    for ref, problems in failed.items():
        print(f'  {ref}: {len(problems)} sorun — {problems[0][:160]}')


def fix(model, target, refs):
    issues = json.load(open(ISSUES, encoding='utf-8'))
    todo = [r for r in (refs or issues) if issues.get(r)]
    previous = {}
    for ref in todo:
        path = os.path.join(target, *ref.split('/')) + '.json'
        prev = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else None
        previous[ref] = (prev, issues[ref]) if prev else None
    if todo:
        submit(model, target, todo, 'duzeltme', previous)
    else:
        print('Düzeltilecek konu yok.')


#: Kart türlerinin alanları (src/Courses/WorksWritten.ts ile aynı); onarım bunların dışındaki alanları atar.
CARD_KEYS = {
    'concept': {'title', 'text', 'caption', 'narration', 'visual'}, 'rule': {'title', 'items', 'narration', 'visual'},
    'example': {'title', 'example', 'explanation', 'narration', 'visual'}, 'visual': {'title', 'visual', 'caption', 'narration'},
    'predict': {'title', 'context', 'prompt', 'choices', 'answer', 'explanation', 'choiceFeedback', 'visual'},
    'mistake': {'title', 'wrong', 'right', 'why'}, 'question': {'question'},
    'blank': {'title', 'visual', 'prompt', 'before', 'after', 'answers', 'input', 'numeric', 'choices', 'choiceFeedback', 'wrongAnswers', 'explanation'},
    'findError': {'title', 'problem', 'prompt', 'steps', 'wrongStep', 'choiceFeedback', 'explanation', 'visual'},
    'match': {'title', 'prompt', 'titles', 'pairs', 'explanation', 'visual'}, 'classify': {'title', 'prompt', 'groups', 'explanation', 'visual'},
    'tap': {'title', 'prompt', 'mode', 'segments', 'answers', 'feedback', 'explanation', 'visual'}, 'split': {'title', 'prompt', 'word', 'cuts', 'parts', 'explanation'},
    'multi': {'title', 'context', 'stem', 'options', 'answers', 'choiceFeedback', 'explanation', 'visual'}, 'flip': {'title', 'prompt', 'cards', 'explanation'},
    'guided': {'title', 'stem', 'figure', 'steps'},
}
QUESTION_KEYS = {'style', 'context', 'stem', 'figure', 'options', 'answer', 'choiceFeedback', 'steps', 'origin'}


def fit_feedback(holder, count, correct, key='choiceFeedback'):
    """Boş açıklamaları null yapar, doğru şıkları null'lar; bir eksikse doğru şıkkın yerine null ekler; sayısı tutmuyorsa atar."""
    notes = holder.get(key)
    if not isinstance(notes, list):
        holder.pop(key, None)
        return
    notes = [n if isinstance(n, str) and n.strip() else None for n in notes]
    if len(notes) == count - 1 and len(correct) == 1:
        notes.insert(correct[0], None)
    if len(notes) != count:
        holder.pop(key, None)
        return
    for index in correct:
        if 0 <= index < count:
            notes[index] = None
    holder[key] = notes


def tidy(node):
    """null ve boş metin alanlarını atar (dizilerin içine dokunmaz)."""
    for key in [k for k, v in node.items() if v is None or (isinstance(v, str) and not v.strip())]:
        node.pop(key)


def repair(lesson):
    """Yalnız biçim onarımı: yer değiştiren alanlar, fazla alanlar, şık açıklamalarının uzunluğu; içerik değişmez."""
    written = lesson.setdefault('written', {})
    for key in ('lesson', 'camp'):
        if key in written:
            lesson[key] = written.pop(key)
    for key in [k for k in written if k not in ('sources', 'additions', 'fixes')]:
        written.pop(key)
    written['fixes'] = [f[:400] for f in written.get('fixes') or [] if isinstance(f, str) and f.strip()]
    for section in (lesson.get('lesson') or {}).get('sections', []):
        tidy(section)
        for card in section.get('cards', []):
            if 'choiceFeedback:' in card:
                card['choiceFeedback'] = card.pop('choiceFeedback:')
            kind = card.get('kind')
            for key in [k for k in card if k != 'kind' and k not in CARD_KEYS.get(kind, set(card))]:
                card.pop(key)
            tidy(card)
            if kind == 'question' and isinstance(card.get('question'), dict):
                q = card['question']
                for key in [k for k in q if k not in QUESTION_KEYS]:
                    q.pop(key)
                tidy(q)
                for step in q.get('steps', []):
                    tidy(step)
                fit_feedback(q, len(q.get('options', [])), [q.get('answer', -1)])
            elif kind == 'predict':
                fit_feedback(card, len(card.get('choices', [])), [card.get('answer', -1)])
            elif kind == 'multi':
                fit_feedback(card, len(card.get('options', [])), card.get('answers', []))
            elif kind == 'findError':
                fit_feedback(card, len(card.get('steps', [])), [card.get('wrongStep', -1)])
            elif kind == 'blank' and card.get('choices'):
                fit_feedback(card, len(card['choices']), [i for i, c in enumerate(card['choices']) if c in card.get('answers', [])][:1])
            elif kind == 'tap' and isinstance(card.get('feedback'), list) and len(card['feedback']) != len(card.get('segments', [])):
                card.pop('feedback')
            elif kind == 'guided':
                for step in card.get('steps', []):
                    tidy(step)
                    if step.get('choices'):
                        fit_feedback(step, len(step['choices']), [step.get('answer', -1)])
    return lesson


def repair_all(target, refs):
    count = 0
    for ref in refs:
        path = os.path.join(target, *ref.split('/')) + '.json'
        if os.path.exists(path):
            lesson = json.load(open(path, encoding='utf-8'))
            json.dump(repair(lesson), open(path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
            count += 1
    print(f'{count} dosyada biçim onarımı yapıldı')


PATCH_RULES = """## Yama turu

Bu turda dersi yeniden yazmıyorsun. Sana `ders` (yazılmış yazılı ders) ve motor denetiminin bulduğu `sorunlar` verilir.
Yalnız sorunları gideren **JSON yamaları** döndür:
{"patches": [{"op": "replace" | "add" | "remove", "path": "/lesson/sections/0/cards/3/visual/rows/2/1", "value": …}]}

- `path` JSON işaretçisidir ve indeksler **0'dan** başlar. Sorunlardaki "s4 c2" ifadesi 1'den sayar: `/lesson/sections/3/cards/1`.
- `add` dizide o sıraya ekler ("-" sona ekler); `remove`'da `value` yazılmaz.
- Bir kartı bütünüyle değiştirmek için kartın yolunu `replace` ile ver.
- Sorun olmayan yere dokunma. Düzeltme yönergedeki kurallara ve sınırlara uyar.
- Ortak sorunlar:
  - "formula read aloud": "bölü", "çarpı", "artı", "eksi" sözcüklerini formüle çevir ($F/S$, $m \\cdot g$), ya da cümleyi formülsüz yaz.
  - Tablo hücresi en çok 40 karakter: kısalt ya da bilgiyi kartın narration'ına taşı.
  - "gives the answer away": açıklama doğru cevabı söylemesin; yalnız o şıkkın neden yanlış olduğunu anlatsın.
  - "belongs to the video": video sözünü çıkar.
  - "Two sections share a subtopic": bölümlerin subtopic ve subtopics alanlarını temeldeki gibi ayrı tut.
  - "uyarı:" ile başlayanlar öğretim sırası uyarılarıdır:
    - "does not open with a definition": bölümün başına (`add`, sıra 0) alt konuyu tanımlayan bir `concept` kartı ekle.
    - "a formula before its meaning": formül kartından önce fikri sözle ve basit sayılarla anlatan bir `concept` kartı ekle.
    - "worked example(s) before the first question": ilk sorudan önce tam çözümlü `example` kartları ekle.
- Yamalar sırayla uygulanır ve her `add` sonraki indeksleri kaydırır. Bu yüzden ekleme yamalarını dersin **sonundan başına** doğru sırala: büyük bölüm ve kart indeksleri önce.
- Yalnız JSON döndür."""


def pointer_parts(path):
    return [p.replace('~1', '/').replace('~0', '~') for p in path.lstrip('/').split('/')] if path not in ('', '/') else []


def apply_patches(doc, patches):
    """RFC 6902'nin replace/add/remove işlemleri; uygulanamayan yama sayısını döner."""
    failed = 0
    for patch in patches:
        try:
            parts = pointer_parts(patch['path'])
            parent = doc
            for part in parts[:-1]:
                parent = parent[int(part)] if isinstance(parent, list) else parent[part]
            last = parts[-1]
            op = patch['op']
            if isinstance(parent, list):
                index = len(parent) if last == '-' else int(last)
                if op == 'remove':
                    parent.pop(index)
                elif op == 'add':
                    parent.insert(index, patch['value'])
                else:
                    parent[index] = patch['value']
            elif op == 'remove':
                parent.pop(last)
            else:
                parent[last] = patch['value']
        except (KeyError, IndexError, ValueError, TypeError):
            failed += 1
    return failed


def submit_patches(model, target, refs):
    issues = json.load(open(ISSUES, encoding='utf-8'))
    requests = []
    system = PATCH_RULES + '\n\n' + open(YONERGE, encoding='utf-8').read()
    for ref in refs:
        lesson = json.load(open(os.path.join(target, *ref.split('/')) + '.json', encoding='utf-8'))
        text = 'Yama turu. Yalnız JSON döndür.\n\n' + json.dumps({'konu': ref, 'sorunlar': issues[ref], 'ders': lesson}, ensure_ascii=False)
        # Çözümlü örnek ekleyen yamada hesap doğruluğu önemli: sayısal derslerde yüksek düşünme düzeyi.
        effort = 'high' if ref.split('/')[1] in HIGH_EFFORT and any(p.startswith('uyarı: ') for p in issues[ref]) else 'medium'
        requests.append({'custom_id': custom_id(ref), 'params': {'model': MODELS[model], 'max_tokens': 128000, 'thinking': {'type': 'adaptive'}, 'output_config': {'effort': effort},
                                                                 'system': [{'type': 'text', 'text': system, 'cache_control': {'type': 'ephemeral'}}], 'messages': [{'role': 'user', 'content': text}]}})
    batch_id = api.submit_batch(requests)
    with open(STATE, 'a', encoding='utf-8') as handle:
        handle.write(json.dumps({'id': batch_id, 'model': model, 'target': os.path.abspath(target), 'refs': refs, 'tag': 'yama', 'at': time.strftime('%Y-%m-%dT%H:%M:%S')}, ensure_ascii=False) + '\n')
    print(f'{len(refs)} konuya yama istendi ({MODELS[model]}): {batch_id}')


def collect_patches(batch_id):
    entry = next(json.loads(l) for l in open(STATE, encoding='utf-8') if json.loads(l)['id'] == batch_id)
    while api.batch_status(batch_id)['processing_status'] != 'ended':
        time.sleep(60)
    total, done, bad = 0.0, 0, []
    for result in api.batch_results(batch_id):
        ref = result['custom_id'].replace('__', '/')
        res = result['result']
        if res['type'] != 'succeeded':
            bad.append(f'{ref}: {res["type"]}')
            continue
        message = res['message']
        usage = message.get('usage', {})
        total += price(MODELS[entry['model']], usage)
        api.record_usage('works-yazili-yama', message.get('model', MODELS[entry['model']]), usage, True)
        with open(COSTS, 'a', encoding='utf-8') as handle:
            handle.write(json.dumps({'batch': batch_id, 'ref': ref, 'model': message.get('model'), 'usage': usage, 'stop': message.get('stop_reason'), 'usd': round(price(MODELS[entry['model']], usage), 4)}) + '\n')
        path = os.path.join(entry['target'], *ref.split('/')) + '.json'
        try:
            patches = lesson_json(api.text_of(message)).get('patches', [])
        except (json.JSONDecodeError, ValueError):
            bad.append(f'{ref}: yama JSON okunamadı')
            continue
        lesson = json.load(open(path, encoding='utf-8'))
        failed = apply_patches(lesson, patches)
        json.dump(repair(lesson), open(path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        done += 1
        if failed:
            bad.append(f'{ref}: {failed}/{len(patches)} yama uygulanamadı')
    print(f'{batch_id}: {done} derse yama uygulandı, {len(bad)} sorun, maliyet {total:.2f} $')
    for line in bad:
        print('  -', line)


def spent():
    rows = [json.loads(l) for l in open(COSTS, encoding='utf-8')] if os.path.exists(COSTS) else []
    by = {}
    for row in rows:
        by[row['model']] = by.get(row['model'], 0) + row['usd']
    print(f'{len(rows)} istek, toplam {sum(by.values()):.2f} $', {k: round(v, 2) for k, v in by.items()})


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('komut', choices=['paket', 'gonder', 'topla', 'onar', 'denetle', 'duzelt', 'yama', 'yamatopla', 'maliyet'])
    parser.add_argument('konular', nargs='*')
    parser.add_argument('--model', choices=list(MODELS))
    parser.add_argument('--hedef', default=WRITTEN)
    parser.add_argument('--etiket', default='')
    parser.add_argument('--temel', choices=['video', 'yazili'], default='video', help='video: ilk yazım; yazili: bugünkü yazılı ders üzerinden yeni geçiş')
    args = parser.parse_args()
    BASE_MODE['value'] = args.temel
    if args.komut == 'paket':
        for ref in refs_of(args.konular):
            path = os.path.join(OUT, 'Paketler', *ref.split('/')) + '.json'
            os.makedirs(os.path.dirname(path), exist_ok=True)
            body = package_of(ref)
            json.dump(body, open(path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
            print(f'{ref}: {len(json.dumps(body, ensure_ascii=False))} karakter → {path}')
    elif args.komut == 'gonder':
        submit(args.model, args.hedef, refs_of(args.konular), args.etiket)
    elif args.komut == 'topla':
        collect(args.konular[0])
    elif args.komut == 'yama':
        issues = json.load(open(ISSUES, encoding='utf-8'))
        refs = [r for r in (refs_of(args.konular) or list(issues)) if issues.get(r) and os.path.exists(os.path.join(args.hedef, *r.split('/')) + '.json')]
        submit_patches(args.model, args.hedef, refs)
    elif args.komut == 'yamatopla':
        collect_patches(args.konular[0])
    elif args.komut == 'onar':
        repair_all(args.hedef, refs_of(args.konular))
    elif args.komut == 'denetle':
        check(args.hedef, refs_of(args.konular))
    elif args.komut == 'duzelt':
        fix(args.model, args.hedef, refs_of(args.konular))
    else:
        spent()


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main()
