"""Ayna kitapçıklarının sorularını kaynak kitapçıktan kopyalar: KPSS Ortaöğretim kitapçıkları Önlisans'ın sorularını aynen kullanır
(sahip kararı, 2 Kasım 2026: "herkesin kendi sorusu ama soru aynı olsun"). Her kayıt ayna kitapçığın kendi slot, soru kimliği ve
kodunu alır; kök, şıklar, doğru harf, çözüm, mikro ve figürler aynıdır. Konu ağacı iki sınavda birebir aynı olduğu için mikro kodu korunur.
Kullanım: python exam_mirror.py <ay>          (kaynak dosyası olan her ders kopyalanır; yeniden çalıştırmak güvenlidir)
Çıktı:    Curriculum/Exams/<ay>/<ayna kitapçık>/<ders>.jsonl"""
import paths  # noqa: F401,E402  Curriculum/Tools (ortak araçlar) içe aktarılabilir olur
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import oku
from exam_common import katalog, plan, soru_dosyasi

ay = sys.argv[1]
pl, kat = plan(ay), katalog()
kitap = {b["anahtar"]: b for b in pl["kitapciklar"]}
for b in [b for b in pl["kitapciklar"] if b.get("ayna")]:
    kaynak = kitap[b["ayna"]]
    agac = {m["code"]: m for m in kat["subs"][b["sub"]]["lessons"]}
    by_ayna = {s["aynaSoruId"]: s for s in b["slotlar"]}
    for ders in b["dersler"]:
        p = soru_dosyasi(ay, kaynak["anahtar"], ders)
        if not os.path.exists(p):
            print(f"{b['anahtar']}/{ders}: kaynak ({kaynak['anahtar']}) henüz yazılmadı")
            continue
        mikrolar = {k["code"] for s in agac[ders]["subs"] for k in s["mikros"] if k["active"]}
        out = []
        for r in oku(p):
            s = by_ayna[r["soruId"]]
            assert r["mikro"] in mikrolar, (b["anahtar"], ders, r["mikro"], "mikro ayna kataloğunda yok")
            out.append({**r, "slotId": s["slotId"], "soruId": s["soruId"], "soruKodu": s["soruKodu"], "bolum": s["bolum"], "sira": s["sira"],
                        "aynaSoruId": r["soruId"]})
        hedef = soru_dosyasi(ay, b["anahtar"], ders)
        os.makedirs(os.path.dirname(hedef), exist_ok=True)
        with open(hedef + ".tmp", "w", encoding="utf-8", newline="\n") as f:
            for r in out:
                f.write(json.dumps(r, ensure_ascii=False) + "\n")
        os.replace(hedef + ".tmp", hedef)
        print(f"{b['anahtar']}/{ders}: {len(out)} soru {kaynak['anahtar']} kitapçığından kopyalandı")
