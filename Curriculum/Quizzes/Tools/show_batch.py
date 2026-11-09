"""Bir dersin revize edilecek quiz sorularını kısa biçimde gösterir. Kopyalar gösterilmez (temsilci revize edilir).
Kullanım: python show_batch.py <ders_kodu> <başlangıç> <adet> [konu_kodu]
Örnek:    python show_batch.py YKS/YKS_TYT/TRK 0 15 SOZCUKTE_ANLAM"""
import paths  # noqa: F401,E402  Curriculum/Tools (ortak araçlar) içe aktarılabilir olur
import json, os, sys, glob
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import VERI, REVIZYON, oku, kopya_indeksi

ZORLUK = {0: "Kolay", 1: "Orta", 2: "Zor"}


def revize_edilenler():
    ids = set()
    for p in glob.glob(os.path.join(REVIZYON, "**", "*.jsonl"), recursive=True):
        ids |= {r["id"] for r in oku(p)}
    return ids


def tekiller(ders_kodu, konu=None):
    temsil = kopya_indeksi()
    qs = oku(os.path.join(VERI, *ders_kodu.split("/")) + ".jsonl")
    qs = [q for q in qs if temsil.get(q["id"], q["id"]) == q["id"]]
    if konu:
        qs = [q for q in qs if q["hierarchy"].get("lessonSubCode") == konu]
    return qs


if __name__ == "__main__":
    ders, bas, adet = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
    konu = sys.argv[4] if len(sys.argv) > 4 else None
    yapilan = revize_edilenler()
    qs = tekiller(ders, konu)
    kalan = [q for q in qs if q["id"] not in yapilan]
    print(f"{ders} {konu or ''}: tekil {len(qs)}, revize edilmiş {len(qs) - len(kalan)}, kalan {len(kalan)}")
    for n, q in enumerate(kalan[bas:bas + adet], start=bas):
        h = q["hierarchy"]
        qz = q["quizzes"][0] if q["quizzes"] else {}
        figs = [f"{f['Code']}:{f['Kind']}" for f in q["figures"]]
        print(f"\n#{n} id={q['id']} {q['sourceKind']} | «{qz.get('title')}» {ZORLUK.get(qz.get('difficulty'), '')} çözülme={qz.get('timesAnswered')} | "
              f"konu={h.get('lessonSubCode')} mikro={h.get('lessonMikroCode')} | şık={len(q['options'])}" + (f" | figür={figs}" if figs else ""))
        print("  KÖK:", q["stem"].replace("\n", " ⏎ "))
        for o in q["options"]:
            print(f"   {'*' if o['key'] == q['correctKey'] else ' '}{o['key']}) {o['text']}")
        for f in q["figures"]:
            print(f"  FİGÜR {f['Code']} kind={f['Kind']}: {(f['DataJson'] or f['ImageUrl'] or '')[:400]}")
