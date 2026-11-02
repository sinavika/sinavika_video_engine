import json, sys
p, rid, code, marker = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
lines = open(p, encoding='utf-8').read().splitlines()
out = []
n = 0
for ln in lines:
    r = json.loads(ln)
    if r['id'].upper().startswith(rid.upper()):
        assert r['stem'].count(marker) == 1
        r['stem'] = r['stem'].replace(marker, marker + '\n\n{{fig:%s}}' % code)
        n += 1
    out.append(json.dumps(r, ensure_ascii=False))
assert n == 1
open(p, 'w', encoding='utf-8').write('\n'.join(out) + '\n')
print('ok')
