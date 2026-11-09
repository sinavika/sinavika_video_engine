"""Bir konunun EgitimVerileri'ndeki örnek sorularını ve konu anlatımını gösterir (revizyonda üslup, soru tipi ve bilgi kaynağı).
Önce ÖSYM çıkmış soruları, sonra cevabı bilinen öteki sorular gelir; alt konu (mikro) verilirse ona göre süzülür.
Kullanım: python show_sources.py <ders_kodu> <konu_kodu> [adet] [mikro_kodu] [--anlatim]
Örnek:    python show_sources.py YKS/YKS_TYT/TRK SOZ_YORUMU 12
          python show_sources.py YKS/YKS_TYT/TRK SOZ_YORUMU 0 --anlatim"""
import json, os, re, sys

from paths import EDUCATION_DATA as EGITIM
from common import temizle
KLASOR = {"YKS_TYT": "YKS/TYT", "YKS_AYT": "YKS/AYT", "YKS_YDT": "YKS/YDT", "KPSS_LISANS": "KPSS/Lisans",
          "KPSS_ONLISANS": "KPSS/OnlisansOrtaogretim", "KPSS_ORTAOGRETIM": "KPSS/OnlisansOrtaogretim"}


def kaynak_turu(d):
    """Quiz revizyonu için kaynak türü. Telif izni: örnek ve referans alınır, birebir kopyalanmaz.
    test: soru bankası, dörtdörtlük, tarama testi, MEB beceri/kelime kitapları, kamp kitabı (quiz için öncelikli)
    osym: ÖSYM çıkmış sorular (yalnız kök ve şık yapısı için)
    dislandi: deneme kitapları ve sistemin kendi ürettiği kitapçıklar (sinavika-bank); quiz için referans alınmaz"""
    baslik = ((d.get("source") or {}).get("title") or "").lower()
    if "deneme" in baslik or "kitapçık" in baslik or d.get("answerSource") == "sinavika-bank" or (d.get("match") or {}).get("method") == "sinavika-bank":
        return "dislandi"
    if "ösym" in baslik:
        return "osym"
    return "test"


def yol(ders_kodu, alt, konu):
    _, kat, ders = ders_kodu.split("/")
    return os.path.join(EGITIM, *KLASOR[kat].split("/"), alt, ders, konu)


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    ders, konu = args[0], args[1]
    adet = int(args[2]) if len(args) > 2 else 12
    mikro = args[3] if len(args) > 3 else None
    if "--anlatim" in sys.argv:
        d = json.load(open(yol(ders, "KonuAnlatimi", konu) + ".json", encoding="utf-8"))
        print("ALT KONULAR:", ", ".join(f"{m['code'][-2:]} {m['name']}" for m in d.get("lessonMikros", [])))
        for e in d.get("explanations", [])[:40]:
            # İki biçim var: düz anlatım (text/content) ya da kaynağın bölümleri (sections[].heading/text/lessonMikroCode).
            bolumler = e.get("sections") or [e]
            if e.get("sections"):
                print(f"\n=== {e.get('title') or ''} ({e.get('source') or ''})")
            for b in bolumler[:60]:
                if mikro and b.get("lessonMikroCode") and b.get("lessonMikroCode") != mikro:
                    continue
                print(f"\n[{b.get('lessonMikroCode') or ''}] {b.get('title') or b.get('heading') or ''}\n  " + temizle(b.get("text") or b.get("content") or "")[:1200])
        for k in d.get("knowledgePacks", [])[:20]:
            print("\nBİLGİ PAKETİ:", json.dumps(k, ensure_ascii=False)[:700])
    p = yol(ders, "Sorular", konu) + ".jsonl"
    if adet and os.path.exists(p):
        L = [json.loads(l) for l in open(p, encoding="utf-8")]
        if mikro:
            L = [d for d in L if d.get("lessonMikroCode") == mikro]
        tur = {id(d): kaynak_turu(d) for d in L}
        test = [d for d in L if tur[id(d)] == "test" and d.get("answer")]
        osym = [d for d in L if tur[id(d)] == "osym"]
        disli = sum(1 for d in L if tur[id(d)] == "dislandi")
        print(f"\n{konu}{' / ' + mikro if mikro else ''}: {len(L)} örnek · test {len(test)} · ÖSYM {len(osym)} · dışlanan (deneme/sistem) {disli}")
        for d in (test + osym)[:adet]:
            print(f"\n[{d.get('id')}] {d.get('lessonMikroCode') or '-'} · {(d.get('source') or {}).get('title', '')[:40]} · cevap {d.get('answer')}")
            print("  " + temizle(d.get("question"))[-900:])
            print("   " + " | ".join(f"{o['key']}) {temizle(o['text'])[:90]}" for o in d.get("options", [])))
