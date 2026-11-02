"""Bir dersteki revizyon kayıtlarında aynı soru içinde tekrar eden çeldirici açıklamalarını listeler."""
import glob
import json
import os
import sys

for f in sorted(glob.glob(sys.argv[1] + '/*.jsonl')):
    for line in open(f, encoding='utf-8'):
        if not line.strip():
            continue
        r = json.loads(line)
        y = [v for v in r['cozum']['yanlis'].values() if v != '—']
        d = {v for v in y if y.count(v) > 1}
        if d:
            print(r['id'][:8], os.path.basename(f), d)
