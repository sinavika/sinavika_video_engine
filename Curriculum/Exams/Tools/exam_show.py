"""Bir kitapçığın bir dersinin deneme planını gösterir: sıra, konu, önerilen mikro, zorluk, doğru harf; yazılmışsa durum.
Kullanım: python exam_show.py <ay> <kitapçık> <ders>       örn. python exam_show.py 2026-11 TYT-GENEL TRK
          python exam_show.py <ay>                        (bütün kitapçıklar: ders başına yazılan / planlanan)"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from exam_common import katalog, kitapcik, plan, soru_dosyasi

ay = sys.argv[1]
pl = plan(ay)
if len(sys.argv) == 2:
    toplam = yazilan = 0
    for b in pl["kitapciklar"]:
        parca = []
        for d in b["dersler"]:
            n = sum(1 for s in b["slotlar"] if s["ders"] == d)
            p = soru_dosyasi(ay, b["anahtar"], d)
            y = sum(1 for _ in open(p, encoding="utf-8")) if os.path.exists(p) else 0
            toplam, yazilan = toplam + n, yazilan + y
            parca.append(f"{d} {y}/{n}")
        print(f"{b['anahtar']:24} " + " · ".join(parca))
    print(f"Toplam yazılan {yazilan}/{toplam}")
    sys.exit()

anahtar, ders = sys.argv[2], sys.argv[3]
kb = kitapcik(pl, anahtar)
sub = katalog()["subs"][kb["sub"]]
agac = next(m for m in sub["lessons"] if m["code"] == ders)
p = soru_dosyasi(ay, anahtar, ders)
yazili = {r["dersSira"]: r for r in map(json.loads, open(p, encoding="utf-8"))} if os.path.exists(p) else {}
slotlar = [s for s in kb["slotlar"] if s["ders"] == ders]
print(f"{kb['ad']} · {ders} · {len(slotlar)} soru · kitapçık bölümleri {', '.join(kb['bolumler'])}")
diger = [b["anahtar"] for b in pl["kitapciklar"] if b["anahtar"] != anahtar and ders in b["dersler"] and b["sub"] == kb["sub"]]
if diger:
    print(f"Aynı dersin bu aydaki öbür kitapçıkları (sorular onlardakinden farklı olmalı): {', '.join(diger)}")
for i, s in enumerate(slotlar, 1):
    y = yazili.get(i)
    durum = ("yazıldı" + (" · figürlü" if y.get("figures") else "") + (" · MOTOR BEKLİYOR" if y.get("motorIstegi") else "")) if y else "—"
    print(f"{i:3} (bölüm sırası {s['sira']:3}) {s['konu']:34} öneri {s['mikro']:26} {s['mikroAd'][:34]:34} {s['zorluk']:6} doğru {s['dogru']}  {durum}")
print("\nKonunun etkin mikroları:")
for k in sorted({s["konu"] for s in slotlar}, key=lambda k: next(x["order"] for x in agac["subs"] if x["code"] == k)):
    x = next(x for x in agac["subs"] if x["code"] == k)
    print(f"  {k} {x['name']}: " + "; ".join(f"{m['code'][-2:]} {m['name']}" for m in x["mikros"] if m["active"]))
