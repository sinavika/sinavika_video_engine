import json, glob, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from paths import REVISIONS
from show_batch import tekiller
ders = sys.argv[1]
ids = {q['id'] for q in tekiller(ders)}
seen = {}; bad = 0
for p in sorted(glob.glob(os.path.join(REVISIONS, *ders.split('/'), '*.jsonl'))):
    for l in open(p, encoding='utf-8'):
        r = json.loads(l)
        if r['id'] not in ids: print('bilinmeyen', p, r['id']); bad += 1
        if r['id'] in seen: print('tekrar', r['id']); bad += 1
        seen[r['id']] = p
print('kimlik kontrolü:', len(seen), 'kayıt,', bad, 'sorun')
