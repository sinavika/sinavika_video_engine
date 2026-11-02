"""Deneme sorusu üreticisi: bir kitapçığın bir dersinin sorularını plana göre yazar.

Kullanım (üretici dosyasında):
    from exam_generator import deneme
    D = deneme("2026-11", "TYT-GENEL", "TRK")    # planı yükler
    D.Q(1, "SOZCUKTE_ANLAM_02", "kök", ["A şıkkı", "B", "C", "D", "E"], "C", "kısa çözüm", "gerekçe",
        ["yanlış A analizi", "yanlış B analizi", "—", "yanlış D", "yanlış E"], "ön bilgi", "yanılgı",
        kaynak=["yks-tyt-sr-karma-cikmis-2018-2026-0-006"], fig=None)
    D.run()

- İlk sayı dersin bu kitapçıktaki sırasıdır (1..n, plan sırası). `python exam_show.py <ay> <kitapçık> <ders>` planı gösterir.
- Mikro konu planlanan konunun (LessonSub) etkin mikrolarından biri olmalı; plandaki öneriden farklı olabilir.
- Doğru harf plandaki harftir; doğru içerik o harfe yazılır. Beş şık.
- kaynak: soru tipi ve üslup için bakılan EgitimVerileri soru kimlikleri (örnek ve referans; birebir kopya yok).
- fig: [{"code","title","alt","visual":{motorun görseli}}] ya da "motor:<tür>: <eksik öğe>" (motor çizemiyorsa; soru bekletilir).
Çıktı: Curriculum/QuestionRevision/Exams/<ay>/<kitapçık>/<ders>.jsonl (atomik yazım)."""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from exam_common import katalog, kitapcik, plan, soru_dosyasi

EK = {'A': "A'dır", 'B': "B'dir", 'C': "C'dir", 'D': "D'dir", 'E': "E'dir"}


class deneme:
    def __init__(self, ay, anahtar, ders):
        self.ay, self.anahtar, self.ders = ay, anahtar, ders
        self.kb = kitapcik(plan(ay), anahtar)
        if self.kb.get("ayna"):
            raise SystemExit(f"{anahtar} {self.kb['ayna']} kitapçığının aynası: soruları yazılmaz, exam_mirror.py ile kopyalanır.")
        self.slotlar = [s for s in self.kb["slotlar"] if s["ders"] == ders]
        if not self.slotlar:
            raise SystemExit(f"{anahtar}: {ders} dersi bu kitapçıkta yok.")
        sub = katalog()["subs"][self.kb["sub"]]
        agac = next(m for m in sub["lessons"] if m["code"] == ders)
        self.mikrolar = {s["code"]: {k["code"] for k in s["mikros"] if k["active"]} for s in agac["subs"] if s["active"]}
        self.kayit = {}

    def Q(self, n, mikro, stem, options, correct, kisa, gerekce, yanlis, onbilgi, yanilgi, kaynak=None, fig=None):
        assert 1 <= n <= len(self.slotlar), (n, "sıra plan dışında")
        assert n not in self.kayit, (n, "aynı sıra iki kez yazılmış")
        s = self.slotlar[n - 1]
        assert mikro in self.mikrolar.get(s["konu"], set()), (n, mikro, f"mikro {s['konu']} konusunun etkin mikrosu değil")
        assert correct == s["dogru"], (n, f"doğru harf planda {s['dogru']}, yazılan {correct}")
        assert len(options) == 5, (n, "beş şık olmalı")
        assert len(yanlis) == 5, (n, "beş yanlış analizi olmalı (doğru şık için —)")
        for i, t in enumerate(yanlis):
            assert (t == "—") == ("ABCDE"[i] == correct), (n, i, "yalnız doğru şığın analizi — olur")
        r = {"slotId": s["slotId"], "soruId": s["soruId"], "soruKodu": s["soruKodu"], "bolum": s["bolum"], "sira": s["sira"],
             "dersSira": n, "ders": self.ders, "konu": s["konu"], "mikro": mikro, "zorluk": s["zorluk"],
             "stem": stem, "options": options, "correct": correct, "kaynak": list(kaynak or []),
             "cozum": {"kisa": kisa, "gerekce": gerekce, "dogru": f"Doğru cevap {EK[correct]}.",
                       "yanlis": {"abcde"[i]: t for i, t in enumerate(yanlis)},
                       "onbilgi": [onbilgi] if isinstance(onbilgi, str) else list(onbilgi),
                       "yanilgi": [yanilgi] if isinstance(yanilgi, str) else list(yanilgi)}}
        if isinstance(fig, str):
            assert fig.startswith("motor:"), (n, "fig metniyse 'motor:' ile başlar")
            r["motorIstegi"] = fig[len("motor:"):].strip()
        elif fig:
            for f in fig:
                assert isinstance(f.get("visual"), dict) and f["visual"].get("kind"), (n, f.get("code"), "figür motorun görseli olmalı (visual)")
                assert stem.count("{{fig:%s}}" % f["code"]) == 1, (n, f["code"], "kökte {{fig:kod}} tam bir kez geçmeli")
            r["figures"] = fig
        self.kayit[n] = r

    def run(self):
        eksik = [i + 1 for i in range(len(self.slotlar)) if i + 1 not in self.kayit]
        hedef = soru_dosyasi(self.ay, self.anahtar, self.ders)
        os.makedirs(os.path.dirname(hedef), exist_ok=True)
        with open(hedef + ".tmp", "w", encoding="utf-8", newline="\n") as f:
            for n in sorted(self.kayit):
                f.write(json.dumps(self.kayit[n], ensure_ascii=False) + "\n")
        os.replace(hedef + ".tmp", hedef)
        print(f"{self.anahtar}/{self.ders}: yazıldı {len(self.kayit)}/{len(self.slotlar)}" + (f" · eksik sıra {eksik}" if eksik else ""))
