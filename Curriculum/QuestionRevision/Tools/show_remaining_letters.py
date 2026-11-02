import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from show_batch import tekiller, revize_edilenler
ders, konu = sys.argv[1], sys.argv[2]
yap = revize_edilenler()
qs = [q for q in tekiller(ders, konu) if q['id'] not in yap]
L = 'ABCDE'
out = []
for q in qs:
    out.append(f"{q['id']} {q['correctKey']}{'' if len(q['options'])==5 else len(q['options'])}{' F' if q['figures'] else ''}")
print(len(qs)); print(' | '.join(out))
