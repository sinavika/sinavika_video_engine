import json

from paths import DATA, REVISIONS
EK = {'A': "A'dır", 'B': "B'dir", 'C': "C'dir", 'D': "D'dir", 'E': "E'dir"}
T = "Kök “tabloda” diyordu ama tablo yoktu."
I = []


def kay(s, ders='biyoloji', sinav='yks-tyt'):
    for a, b in (('dd-', 'dortdortluk-'), ('3a-', '3adim-soru-bankasi-'), ('ogm-', 'ogm-yks-kamp-testleri-'), ('tr-', 'tarama-testleri-')):
        if s.startswith(a):
            return f'{sinav}-sr-{ders}-' + b + s[len(a):]
    if s.startswith('karma-'):
        return f'{sinav}-sr-' + s
    if s.startswith(sinav):
        return s
    raise ValueError(s)


def q(s, m, k, so, st, o, c, ki, g, y, ob, ya, fig=None):
    I.append(dict(s=s, m=m, k=k, so=so, st=st, o=o, c=c, ki=ki, g=g, y=y, ob=ob, ya=ya, fig=fig))


def run(sinav_dir, lesson, topic, nfiles=3, per=20, kayf=kay):
    src = f'{DATA}/quiz/YKS/{sinav_dir}/{lesson}.jsonl'
    out_t = f'{REVISIONS}/YKS/{sinav_dir}/{lesson}/{topic}_0{{}}.jsonl'
    rows = [json.loads(l) for l in open(src, encoding='utf-8')]
    rows = sorted([r for r in rows if r['hierarchy'].get('lessonSubCode') == topic], key=lambda r: r['id'])
    by = {r['id'][:8]: r for r in rows}
    assert len(I) == len(rows) == len(by), (len(I), len(rows))
    assert len({x['s'] for x in I}) == len(I)
    out = []
    L = 'ABCDE'
    for x in I:
        r = by[x['s']]
        assert r['correctKey'] == x['c'], (x['s'], r['correctKey'], x['c'])
        assert len(x['o']) == len(r['options']), (x['s'], len(x['o']), len(r['options']))
        assert len(x['y']) == len(x['o'])
        for i, t in enumerate(x['y']):
            assert (t == '—') == (L[i] == x['c']), (x['s'], i)
        out.append((r['id'], {
            'id': r['id'], 'karar': 'yeniden_yazildi', 'sorun': x['so'], 'kaynak': [kayf(x['k'])],
            'mikro': f"{topic}_{x['m']:02d}", 'stem': x['st'], 'options': x['o'], 'correct': x['c'],
            'cozum': {'kisa': x['ki'], 'gerekce': x['g'], 'dogru': f"Doğru cevap {EK[x['c']]}.",
                      'yanlis': {L[i].lower(): t for i, t in enumerate(x['y'])},
                      'onbilgi': [x['ob']], 'yanilgi': [x['ya']]}}))
        if x.get('fig') == 'koru':
            out[-1][1]['eskiFigurleriKoru'] = True
        elif isinstance(x.get('fig'), str) and x['fig'].startswith('motor:'):
            # Motorun henüz çizemediği figür: soru sözele çevrilmez, bekletilir (check_revisions dışarıda bırakır).
            out[-1][1]['motorIstegi'] = x['fig'][len('motor:'):].strip()
        elif x.get('fig'):
            out[-1][1]['figures'] = x['fig']
        for f in (x['fig'] if isinstance(x.get('fig'), list) else []):
            assert x['st'].count('{{fig:%s}}' % f['code']) == 1, (x['s'], f['code'])
            # Figürleri motor çizer (1 Kasım 2026): figür motorun görseli olarak yazılır.
            assert isinstance(f.get('visual'), dict) and f['visual'].get('kind'), (x['s'], f.get('code'), 'figür motorun görseli olmalı (visual)')
    out.sort(key=lambda t: t[0])
    import os
    os.makedirs(os.path.dirname(out_t.format(1)), exist_ok=True)
    n = 0
    while n * per < len(out):
        # Atomik yazım: başka bir ajanın denetimi yarım dosya okumasın.
        hedef = out_t.format(n + 1)
        with open(hedef + '.tmp', 'w', encoding='utf-8', newline='\n') as f:
            for _, rec in out[n * per:(n + 1) * per]:
                f.write(json.dumps(rec, ensure_ascii=False) + '\n')
        os.replace(hedef + '.tmp', hedef)
        n += 1
    # Konu daha az dosyaya sığdıysa önceki yazımdan kalan fazla dosyalar silinir (yalnız bu konunun "<KONU>_0N.jsonl" dosyaları).
    import re
    klasor = os.path.dirname(out_t.format(1))
    yazilan = {os.path.basename(out_t.format(i + 1)) for i in range(n)}
    for ad in os.listdir(klasor):
        if re.fullmatch(re.escape(topic) + r'_0\d+\.jsonl', ad) and ad not in yazilan:
            os.remove(os.path.join(klasor, ad))
    print('yazildi', len(out), 'dosya', n)
