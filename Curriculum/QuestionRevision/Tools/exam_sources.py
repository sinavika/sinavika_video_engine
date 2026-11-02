"""Deneme yazımı için bir konunun EgitimVerileri örnekleri: önce ÖSYM çıkmışları, sonra deneme kitapları (MEB, 3 Adım,
Pegem, Data, branş denemeleri). Sistemin kendi ürettiği kitapçıklar ("… Kitapçık", sinavika-bank) gösterilmez.
Örnekler yalnız soru tipi, kök kalıbı, şık yapısı ve zorluk içindir; birebir kopyalanmaz (MEB/ÖSYM izni: örnek ve referans).
Kullanım: python exam_sources.py <sub> <ders> <konu> [adet] [mikro] [--test] [--anlatim]
Örnek:    python exam_sources.py YKS_TYT FIZ FIZ_OPTIK 10
          python exam_sources.py KPSS_LISANS VAT VAT_GUNCEL_BILGILER 15 --anlatim
--test: deneme örneği azsa soru bankası ve test kitaplarını da gösterir."""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from exam_common import OSYM_DERS, OSYM_KLASOR
from paths import EDUCATION_DATA
from show_sources import temizle

sys.stdout.reconfigure(encoding="utf-8")


def tur(d):
    baslik = ((d.get("source") or {}).get("title") or "").lower()
    if d.get("answerSource") == "sinavika-bank" or (d.get("match") or {}).get("method") == "sinavika-bank" or "kitapçık" in baslik:
        return "sistem"
    if "ösym" in baslik:
        return "osym"
    if "deneme" in baslik:
        return "deneme"
    return "test"


args = [a for a in sys.argv[1:] if not a.startswith("--")]
sub, ders, konu = args[0], args[1], args[2]
adet = int(args[3]) if len(args) > 3 else 10
mikro = args[4] if len(args) > 4 else None
kok = os.path.join(EDUCATION_DATA, *OSYM_KLASOR[sub].split("/"))
d_ders = OSYM_DERS.get((sub, ders), ders)
if "--anlatim" in sys.argv:
    p = os.path.join(kok, "KonuAnlatimi", d_ders, konu + ".json")
    if os.path.exists(p):
        d = json.load(open(p, encoding="utf-8"))
        print("ALT KONULAR:", ", ".join(f"{m['code'][-2:]} {m['name']}" for m in d.get("lessonMikros", [])))
        # Anlatım: explanations[].sections[] (heading, text); eski biçimde doğrudan text/content.
        yazilan = 0
        for e in d.get("explanations", [])[:40]:
            print(f"\n## {e.get('title') or e.get('heading') or ''} ({(e.get('source') or {}).get('publisher', '')})")
            for b in e.get("sections") or [{"heading": e.get("lessonMikroCode") or "", "text": e.get("text") or e.get("content") or ""}]:
                if yazilan > 20000:
                    break
                metin = temizle(b.get("text") or "")
                print(f"[{b.get('heading') or ''}] {metin[:900]}")
                yazilan += min(len(metin), 900)
        for k in d.get("knowledgePacks", [])[:3]:
            pack = {a: v for a, v in (k.get("pack") or {}).items() if a not in ("binding", "schemaVersion", "packId", "locale")}
            print("\nBİLGİ PAKETİ:", json.dumps(pack, ensure_ascii=False)[:2500])
    else:
        print("Konu anlatımı yok:", p)
L = []
for p in (os.path.join(kok, "CikmisSorular", d_ders + ".jsonl"), os.path.join(kok, "Sorular", d_ders, konu + ".jsonl")):
    if os.path.exists(p):
        L += [json.loads(l) for l in open(p, encoding="utf-8")]
gor, secim = set(), []
for d in L:
    if d.get("lessonSubCode") != konu or (mikro and d.get("lessonMikroCode") != mikro) or d.get("id") in gor:
        continue
    gor.add(d.get("id"))
    secim.append(d)
gruplar = {t: [d for d in secim if tur(d) == t] for t in ("osym", "deneme", "test", "sistem")}
print(f"\n{sub} {ders} {konu}{' / ' + mikro if mikro else ''}: ÖSYM {len(gruplar['osym'])} · deneme {len(gruplar['deneme'])} · "
      f"test {len(gruplar['test'])} · sistem (gösterilmez) {len(gruplar['sistem'])}")
sira = gruplar["osym"][:adet] + gruplar["deneme"][:adet] + (gruplar["test"][:adet] if "--test" in sys.argv else [])
for d in sira:
    print(f"\n[{d.get('id')}] {tur(d).upper()} · {d.get('year') or ''} · {d.get('lessonMikroCode') or '-'} · {(d.get('source') or {}).get('title', '')[:45]} · cevap {d.get('answer')}"
          + (" · FİGÜRLÜ" if d.get("hasFigure") else ""))
    print("  " + temizle(d.get("question"))[-1100:])
    print("   " + " | ".join(f"{o['key']}) {temizle(o['text'])[:110]}" for o in d.get("options", [])))
