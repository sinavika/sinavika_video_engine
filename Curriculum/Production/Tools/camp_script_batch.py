"""Kamp senaryolarını Claude ile baştan yazar (Message Batches, yarı fiyat; sistem istemi 1 saat önbellekte).

  python Curriculum/Production/Tools/camp_script_batch.py paket  <KAT/DERS/KONU> ...          → paketleri Outputs/Camps/Scripts/Paketler'e yazar (bakmak için)
  python ... gonder --model opus --etiket <ad> [--bulgular <json>] <KAT/DERS/KONU> ...           → toplu işi gönderir
  python ... topla <batch_id>                                                                  → sonuçları Outputs/Camps/Scripts/<etiket>/ altına yazar, maliyeti ve önbelleği söyler
  python ... duzelt --model opus --etiket <ad> <KAT/DERS/KONU> ...                              → <etiket>/sorunlar.json'daki sorunlarla yeniden yazdırır

Ücretli model çağrısı sahibin sohbetteki açık onayıyla yapılır (model ve tutar sorulur).
Yazılan senaryo doğrudan Curriculum/Scripts'e gitmez: önce motorla denetlenir (camp_check.mts), soruları yeniden çözülür.

Önbellek (Console uyarısı, 9 Kasım 2026): sistem istemi iki sabit bloktur, yönerge ve motorun sözleşmesi
(camp_contract.mts, bayt bayt aynı üretilir). Önbellek noktası sözleşmenin sonundadır ve 1 saat yaşar; toplu işler
5 dakikayı aştığı için kısa ömürlü önbellek tutmuyordu. Derse göre değişen her şey (paket) kullanıcı mesajındadır.
"""
import argparse
import json
import os
import random
import re
import subprocess
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.normpath(os.path.join(HERE, '..', '..', 'Tools')))
from engine_paths import ENGINE, CURRICULUM, OUTPUTS, EDUCATION_DATA  # noqa: E402
import anthropic_api as api  # noqa: E402

OUT = os.path.join(OUTPUTS, 'Camps', 'Scripts')
STATE = os.path.join(OUT, 'batches.jsonl')
CONTRACT = os.path.join(OUT, 'contract.md')
GUIDE = os.path.join(CURRICULUM, 'Production', 'KampSenaryoYonergesi.md')
MODELS = {'opus': 'claude-opus-5-5', 'sonnet': 'claude-sonnet-5-5'}
# USD / milyon token: girdi, çıktı, önbellek okuma, 1 saatlik önbellek yazma. Toplu işlerde hepsi yarı fiyat.
PRICES = {'claude-opus-5-5': (4.0, 20.0, 0.20, 8.0), 'claude-sonnet-5-5': (2.0, 10.0, 0.20, 4.0)}
# Bir dersin toplu işteki tahmini tutarı (pilot ölçümü: Opus ≈1,3 $; 20–30 dk hedefiyle daha az). Tavan denetimi için.
ESTIMATE = {'opus': 1.4, 'sonnet': 0.7}
CATEGORY_FOLDERS = {'YKS_TYT': ('YKS', 'TYT'), 'YKS_AYT': ('YKS', 'AYT')}


def ref_parts(ref):
    category, lesson, topic = ref.split('/')
    return category, lesson, topic


def script_path(ref):
    category, lesson, topic = ref_parts(ref)
    return os.path.join(CURRICULUM, 'Scripts', category, lesson, f'{topic}.json')


def data_dir(category):
    exam, level = CATEGORY_FOLDERS[category]
    return os.path.join(EDUCATION_DATA, exam, level)


def read_json(path):
    with open(path, encoding='utf-8') as handle:
        return json.load(handle)


def read_jsonl(path):
    if not os.path.exists(path):
        return []
    with open(path, encoding='utf-8') as handle:
        return [json.loads(line) for line in handle if line.strip()]


def meb_text(category, lesson, topic):
    """MEB konu anlatımı: alt konular ve bölümlerin metni."""
    path = os.path.join(data_dir(category), 'KonuAnlatimi', lesson, f'{topic}.json')
    if not os.path.exists(path):
        return {'altKonular': [], 'metin': '(Bu konunun MEB anlatımı veride yok.)'}
    data = read_json(path)
    blocks = []
    for explanation in data.get('explanations', []):
        source = explanation.get('source', {})
        blocks.append(f"[Kaynak: {source.get('publisher', '')} · {source.get('title', '')} · s. {source.get('pages', '')}]")
        for part in explanation.get('sections', []):
            blocks.append(f"## {part.get('heading', '').strip()}\n{part.get('text', '').strip()}")
    for pack in data.get('knowledgePacks', []) or []:
        blocks.append('[Bilgi paketi] ' + json.dumps(pack, ensure_ascii=False))
    return {'altKonular': data.get('lessonMikros', []), 'metin': '\n\n'.join(blocks)}


def osym_questions(category, lesson, topic):
    rows = read_jsonl(os.path.join(data_dir(category), 'CikmisSorular', f'{lesson}.jsonl'))
    out = []
    for row in rows:
        if row.get('lessonSubCode') != topic:
            continue
        out.append({'yıl': row.get('year'), 'altKonu': row.get('lessonMikroCode'), 'şekilli': row.get('hasFigure'),
                    'soru': row.get('question'), 'şıklar': {o['key']: o['text'] for o in row.get('options', [])}, 'cevap': row.get('answer')})
    return sorted(out, key=lambda item: (item['yıl'] or 0, item['altKonu'] or ''))


def pool_sample(category, lesson, topic, per_subtopic=4, limit=40):
    """Havuzdan cevabı ve şıkları belli sorular; alt konu başına birkaç tane, çözümlü olanlar önce. Sabit tohum: aynı paket."""
    rows = read_jsonl(os.path.join(data_dir(category), 'Sorular', lesson, f'{topic}.jsonl'))
    usable = [r for r in rows if r.get('answer') and all((o.get('text') or '').strip() for o in r.get('options', [])) and r.get('question')]
    rng = random.Random(f'{category}/{lesson}/{topic}')
    by_sub = {}
    for row in usable:
        by_sub.setdefault(row.get('lessonMikroCode') or '-', []).append(row)
    picked = []
    for sub in sorted(by_sub):
        group = sorted(by_sub[sub], key=lambda r: (not r.get('solution'), r['id']))
        head, tail = group[:per_subtopic * 2], group[per_subtopic * 2:]
        rng.shuffle(head)
        picked += head[:per_subtopic]
    picked = picked[:limit]
    return [{'altKonu': r.get('lessonMikroCode'), 'soru': r['question'], 'şıklar': {o['key']: o['text'] for o in r['options']},
             'cevap': r['answer'], 'çözüm': (r.get('solution') or '')[:600]} for r in picked]


def package_of(ref, findings=None, previous=None, problems=None):
    category, lesson, topic = ref_parts(ref)
    script = read_json(script_path(ref))
    meb = meb_text(category, lesson, topic)
    body = {
        'görev': 'Bu dersin kamp senaryosunu yönergeye ve motorun sözleşmesine göre baştan yaz.' if previous is None
        else 'Önceki çıktın motor denetiminden sorunlarla döndü. Sorunları gider ve dersin tam senaryosunu yeniden ver.',
        'konu': {'kod': topic, 'ad': script['title'], 'ders': script['lessonName'], 'kategori': category},
        'resmiAltKonular': meb['altKonular'],
        'korunacakAlanlar': {'topic': script['topic'], 'camp': script.get('camp')},
        'denetimBulgulari': findings or [],
        'mebKonuAnlatimi': meb['metin'],
        'osymCikmisSorular': osym_questions(category, lesson, topic),
        'havuzOrnekSorular': pool_sample(category, lesson, topic),
        'bugunkuSenaryo': script,
    }
    if previous is not None:
        body['oncekiCikti'] = previous
        body['sorunlar'] = problems or []
        del body['bugunkuSenaryo']
    return body


def system_blocks():
    if not os.path.exists(CONTRACT):
        build_contract()
    guide = open(GUIDE, encoding='utf-8').read()
    contract = open(CONTRACT, encoding='utf-8').read()
    # The cache point sits after the contract, so guide + contract are one cached prefix (shared helper, 1 h).
    return [{'type': 'text', 'text': guide}, *api.cached_system(contract, ttl='1h')]


def build_contract():
    subprocess.run(['npx', 'tsx', os.path.join('Curriculum', 'Production', 'Tools', 'camp_contract.mts'), CONTRACT], cwd=ENGINE, check=True, shell=os.name == 'nt')


def params_of(model, body, effort='high'):
    # 'high' can spend the whole 128K on thinking for a long lesson (Temel Kavramlar, 9 Nov 2026); 'medium' leaves room.
    return {'model': MODELS[model], 'max_tokens': 128000, 'thinking': {'type': 'adaptive'}, 'output_config': {'effort': effort},
            'system': system_blocks(),
            'messages': [{'role': 'user', 'content': json.dumps(body, ensure_ascii=False, indent=1)}]}


def custom_id(ref):
    return ref.replace('/', '__')


def submit(model, tag, refs, findings_file=None, previous=None, effort='high', cap=None):
    if cap is not None:
        expected = spent() + ESTIMATE[model] * len(refs)
        if expected > cap:
            raise SystemExit(f'tavan aşılır: harcanan {spent():.2f} $ + tahmin {ESTIMATE[model] * len(refs):.2f} $ > {cap} $; gönderilmedi.')
    build_contract()
    findings = read_json(findings_file) if findings_file else {}
    requests = []
    for ref in refs:
        topic = ref_parts(ref)[2]
        if previous:
            prev = previous[ref]
            body = package_of(ref, findings.get(topic), prev['output'], prev['problems'])
        else:
            body = package_of(ref, findings.get(topic))
        requests.append({'custom_id': custom_id(ref), 'params': params_of(model, body, effort)})
    batch_id = api.submit_batch(requests)
    os.makedirs(OUT, exist_ok=True)
    with open(STATE, 'a', encoding='utf-8') as handle:
        handle.write(json.dumps({'batch': batch_id, 'tag': tag, 'model': model, 'refs': refs, 'at': time.strftime('%Y-%m-%dT%H:%M:%S'),
                                 'fix': bool(previous)}, ensure_ascii=False) + '\n')
    print(f'gönderildi: {batch_id} ({len(refs)} ders, {MODELS[model]}, etiket {tag})')
    return batch_id


def state_of(batch_id):
    for entry in read_jsonl(STATE):
        if entry['batch'] == batch_id:
            return entry
    raise SystemExit(f'{batch_id} kayıtlı değil')


def usd(model, usage):
    p_in, p_out, p_read, p_write = PRICES[model]
    fresh = usage.get('input_tokens', 0)
    read = usage.get('cache_read_input_tokens', 0)
    write = usage.get('cache_creation_input_tokens', 0)
    return 0.5 * (fresh * p_in + read * p_read + write * p_write + usage.get('output_tokens', 0) * p_out) / 1_000_000


def script_json(text):
    match = re.search(r'```json\s*(\{.*\})\s*```', text, re.S)
    raw = match.group(1) if match else text[text.find('{'):text.rfind('}') + 1]
    return json.loads(raw)


def collect(batch_id):
    entry = state_of(batch_id)
    status = api.wait_batch(batch_id, poll=60)
    folder = os.path.join(OUT, entry['tag'])
    os.makedirs(folder, exist_ok=True)
    total, read_total, input_total = 0.0, 0, 0
    for result in api.batch_results(batch_id):
        ref = result['custom_id'].replace('__', '/')
        topic = ref_parts(ref)[2]
        if result['result']['type'] != 'succeeded':
            print(f'  {ref}: {result["result"]["type"]} {json.dumps(result["result"], ensure_ascii=False)[:300]}')
            continue
        message = result['result']['message']
        usage = message.get('usage', {})
        model = MODELS[entry['model']]
        cost = usd(model, usage)
        total += cost
        read_total += usage.get('cache_read_input_tokens', 0)
        input_total += usage.get('input_tokens', 0) + usage.get('cache_read_input_tokens', 0) + usage.get('cache_creation_input_tokens', 0)
        api.record_usage('kamp-senaryo', model, usage, True)
        text = api.text_of(message)
        with open(os.path.join(folder, f'{topic}.txt'), 'w', encoding='utf-8') as handle:
            handle.write(text)
        try:
            data = script_json(text)
            data.pop('works', None)
            with open(os.path.join(folder, f'{topic}.json'), 'w', encoding='utf-8', newline='\n') as handle:
                handle.write(json.dumps(data, ensure_ascii=False, indent=1) + '\n')
            state = 'yazıldı'
        except (ValueError, json.JSONDecodeError) as error:
            state = f'JSON okunamadı: {error}'
        print(f"  {ref}: {state} · {message.get('stop_reason')} · girdi {usage.get('input_tokens', 0)} + önbellek okuma {usage.get('cache_read_input_tokens', 0)}"
              f" / yazma {usage.get('cache_creation_input_tokens', 0)} · çıktı {usage.get('output_tokens', 0)} · {cost:.2f} $")
    rate = 100 * read_total / max(1, input_total)
    print(f'toplam {total:.2f} $ · önbellek isabeti %{rate:.0f} · {status.get("request_counts")}')
    with open(os.path.join(OUT, 'harcama.jsonl'), 'a', encoding='utf-8') as handle:
        handle.write(json.dumps({'batch': batch_id, 'tag': entry['tag'], 'usd': round(total, 4), 'cacheRate': round(rate, 1), 'at': time.strftime('%Y-%m-%dT%H:%M:%S')}) + '\n')


def spent():
    return sum(item['usd'] for item in read_jsonl(os.path.join(OUT, 'harcama.jsonl')))


def main():
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest='command', required=True)
    p = sub.add_parser('paket'); p.add_argument('refs', nargs='+'); p.add_argument('--bulgular')
    g = sub.add_parser('gonder'); g.add_argument('refs', nargs='+'); g.add_argument('--model', choices=MODELS, required=True); g.add_argument('--etiket', required=True); g.add_argument('--bulgular'); g.add_argument('--effort', default='high', choices=['low', 'medium', 'high', 'xhigh']); g.add_argument('--tavan', type=float, required=True, help='onaylı toplam harcama üst sınırı ($)')
    t = sub.add_parser('topla'); t.add_argument('batch')
    d = sub.add_parser('duzelt'); d.add_argument('refs', nargs='+'); d.add_argument('--model', choices=MODELS, required=True); d.add_argument('--etiket', required=True)
    sub.add_parser('harcama')
    args = parser.parse_args()
    if args.command == 'paket':
        findings = read_json(args.bulgular) if args.bulgular else {}
        folder = os.path.join(OUT, 'Paketler')
        os.makedirs(folder, exist_ok=True)
        for ref in args.refs:
            body = package_of(ref, findings.get(ref_parts(ref)[2]))
            text = json.dumps(body, ensure_ascii=False, indent=1)
            with open(os.path.join(folder, f'{ref_parts(ref)[2]}.json'), 'w', encoding='utf-8') as handle:
                handle.write(text)
            print(f'{ref}: {len(text)} karakter · ÖSYM {len(body["osymCikmisSorular"])} · havuz {len(body["havuzOrnekSorular"])}')
    elif args.command == 'gonder':
        submit(args.model, args.etiket, args.refs, args.bulgular, effort=args.effort, cap=args.tavan)
    elif args.command == 'topla':
        collect(args.batch)
    elif args.command == 'duzelt':
        folder = os.path.join(OUT, args.etiket)
        problems = read_json(os.path.join(folder, 'sorunlar.json'))
        previous = {ref: {'output': read_json(os.path.join(folder, f'{ref_parts(ref)[2]}.json')), 'problems': problems[ref_parts(ref)[2]]} for ref in args.refs}
        submit(args.model, args.etiket + '-duzeltme', args.refs, previous=previous)
    elif args.command == 'harcama':
        print(f'kamp senaryosu harcaması: {spent():.2f} $')


if __name__ == '__main__':
    main()
