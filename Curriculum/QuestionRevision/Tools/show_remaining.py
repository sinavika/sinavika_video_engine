import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from show_batch import tekiller, revize_edilenler
ders, konu = sys.argv[1], sys.argv[2]
n = int(sys.argv[3]) if len(sys.argv) > 3 else 400
yap = revize_edilenler()
qs = [q for q in tekiller(ders, konu) if q['id'] not in yap]
print(len(qs))
for q in qs:
    f = ' FIG' + str([x['Kind'] for x in q['figures']]) if q['figures'] else ''
    u = ' U' if '<u>' in q['stem'] else ''
    print(f"{q['id']} {q['correctKey']}{f}{u} m={q['hierarchy'].get('lessonMikroCode')} | {q['stem'][:n].replace(chr(10),' / ')}")
    print('    ' + ' | '.join(f"{o['key']}){o['text'][:70]}" for o in q['options']))
