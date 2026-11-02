import json, re, sys
p = sys.argv[1]
REP = [(r'\bharitadaki\b', 'harita üzerindeki'), (r'\bHaritadaki\b', 'Harita üzerindeki'),
       (r'\bharitada\b', 'harita üzerinde'), (r'\bHaritada\b', 'Harita üzerinde'),
       (r'\bgrafikteki\b', 'grafikte yer alan'), (r'\bşekildeki\b', 'çizimdeki')]
def fix(s):
    for a, b in REP: s = re.sub(a, b, s)
    return s
def walk(o):
    if isinstance(o, str): return fix(o)
    if isinstance(o, list): return [walk(x) for x in o]
    if isinstance(o, dict): return {k: (walk(v) if k not in ('id','mikro','kaynak','figures','correct','karar') else v) for k, v in o.items()}
    return o
out = []; n = 0
for ln in open(p, encoding='utf-8').read().splitlines():
    r = json.loads(ln)
    if not r.get('figures'):
        r2 = walk(r)
        if r2 != r: n += 1
        r = r2
    r['stem'] = r['stem'].replace('Haritaya göre', 'Bu izohips haritasına göre').replace('haritaya göre', 'bu izohips haritasına göre')
    out.append(json.dumps(r, ensure_ascii=False))
open(p, 'w', encoding='utf-8').write('\n'.join(out) + '\n')
print('değişen kayıt', n)
