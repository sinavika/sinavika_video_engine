import json, sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from paths import DATA
h = json.load(open(os.path.join(DATA, 'hiyerarsi.json'), encoding='utf-8'))
sub, ders = sys.argv[1], sys.argv[2]
konu = sys.argv[3] if len(sys.argv) > 3 else None
for l in h:
    if l['categorySub'] == sub and l['lessonMainCode'] == ders:
        for s in l['subs']:
            if konu and s['code'] != konu: continue
            print(s['code'], '-', s['name'])
            if konu:
                for m in s['mikros']: print('   ', m['code'], '-', m['name'])
