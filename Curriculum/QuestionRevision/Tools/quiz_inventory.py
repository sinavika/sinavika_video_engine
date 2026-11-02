"""Quiz sorularının yapısal envanteri, çalışma sırasına göre. Veritabanına bağlanmaz.
Çıktı: ../rapor/QuizEnvanteri.md ve ../rapor/quiz_envanter.json"""
import json, os, re, sys
from collections import Counter, defaultdict
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import KOK, ders_dosyalari, oku, kopya_indeksi, hiyerarsi

RAPOR = os.path.join(KOK, "Reports")
os.makedirs(RAPOR, exist_ok=True)
CLAIM = re.compile(r"altı\s*çizil(?:i|miş)|\bunderlined\b|unterstrichen|soulign[ée]|подчёркнут|подчеркнут", re.I)
VISUAL = re.compile(r"(aşağıdaki|yukarıdaki|verilen)\s+(grafik|tablo|şekil|harita|diyagram|çizelge|görsel|şema|soyağacı)|\b(grafikte|grafikteki|tabloda|tablodaki|şekildeki|haritada|haritadaki|diyagramda|görselde)\b|\bthe\s+(following\s+)?(graph|table|figure|chart|map|diagram)\b", re.I)
EMPH = re.compile(r"\b(koyu|kalın|eğik)\s+(olarak\s+)?(yazıl|gösteril)\w*|\bvurgulan(an|mış)\s+(sözcü|kelime|ifade)", re.I)


def bulgular(q):
    f = set()
    texts = [q["stem"]] + [o["text"] or "" for o in q["options"]]
    duz = [re.sub(r"</?u>", "", t) for t in texts]
    has_u = any("<u>" in t for t in texts)
    claim = any(CLAIM.search(t) for t in duz)
    if not q["hierarchy"].get("lessonMikroId"):
        f.add("alt_konu_yok")
    if claim and not has_u:
        f.add("altcizgi_iddia_var_cizgi_yok")
    if has_u and not claim:
        f.add("cizgi_var_iddia_yok")
    if EMPH.search(duz[0]):
        f.add("gosterilemeyen_vurgu")
    if any(re.search(r"(?<!\\)\$", t) for t in texts):
        f.add("dolar_formul")
    if any(re.search(r"\*\*|(?<![\w_])__\S", t) for t in texts):
        f.add("yildiz_alt_cizgi_kalintisi")
    if any(re.search(r"<(?!/?u>)[a-zA-Z/][^>]*>", t) for t in texts):
        f.add("izinsiz_etiket")
    has_visual = bool(q["figures"]) or bool(q.get("stemImageUrl")) or any(o.get("imageUrl") for o in q["options"])
    if VISUAL.search(duz[0]) and not has_visual:
        f.add("gorsel_atif_var_figur_yok")
    refs = {r.lower() for r in re.findall(r"\{\{fig:([^}]+)\}\}", " ".join(texts))}
    codes = {(x["Code"] or "").lower() for x in q["figures"]}
    if refs - codes:
        f.add("figur_atfi_karsiliksiz")
    if codes - refs:
        f.add("figur_atifsiz")
    if any(x["Kind"] == 0 for x in q["figures"]):
        f.add("resim_figuru")
    if any(x["Kind"] > 46 for x in q["figures"]):
        f.add("canlida_olmayan_figur_turu")
    norm = [re.sub(r"\s+", " ", t).strip().lower() for t in duz[1:]]
    if len(set(norm)) < len(norm) or any(not t for t in norm):
        f.add("sik_bos_ya_da_tekrar")
    if any(re.match(r"^\s*[A-Ea-e][\)\.]\s", t) for t in duz[1:]):
        f.add("sik_harf_artigi")
    if not q.get("correctKey"):
        f.add("cevap_yok")
    if not q["solutions"] or not (q["solutions"][0].get("StructuredContentJson") or q["solutions"][0].get("ContentText")):
        f.add("cozum_yok")
    return f


temsil = kopya_indeksi()
hiy = hiyerarsi()
toplam = Counter()
satirlar, detay = [], {}
for kod, p in ders_dosyalari():
    qs = oku(p)
    main = next((m for m in hiy if f'{m["category"]}/{m["categorySub"]}/{m["lessonMainCode"]}' == kod), None)
    c = Counter()
    konular = Counter()
    for q in qs:
        tek = temsil.get(q["id"], q["id"]) == q["id"]
        c["soru"] += 1
        c["tekil"] += tek
        c[q["sourceKind"]] += 1
        qz = q["quizzes"][0] if q["quizzes"] else {}
        c["ogrenciye_ozel"] += bool(qz.get("ogrenciyeOzel"))
        c["cozulmus"] += bool(sum(z.get("timesAnswered") or 0 for z in q["quizzes"]))
        c["figurlu"] += bool(q["figures"])
        c[f"sik_{len(q['options'])}"] += 1
        konular[q["hierarchy"].get("lessonSubCode")] += 1
        for b in bulgular(q):
            c[b] += 1
    c["konu"] = len(konular)
    toplam.update(c)
    detay[kod] = {"ad": main and main["lessonMainName"], **c, "konular": dict(konular)}
    satirlar.append((kod, main and main["lessonMainName"], c))

json.dump({"toplam": toplam, "dersler": detay}, open(os.path.join(RAPOR, "quiz_envanter.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
K = ["alt_konu_yok", "altcizgi_iddia_var_cizgi_yok", "cizgi_var_iddia_yok", "gorsel_atif_var_figur_yok", "dolar_formul", "yildiz_alt_cizgi_kalintisi",
     "izinsiz_etiket", "figur_atfi_karsiliksiz", "figur_atifsiz", "resim_figuru", "canlida_olmayan_figur_turu", "sik_bos_ya_da_tekrar", "sik_harf_artigi",
     "gosterilemeyen_vurgu", "cevap_yok", "cozum_yok"]
L = ["# Quiz soruları envanteri", "",
     f"Canlıdan salt okunur çekilen **{toplam['soru']:,} quiz sorusu** (deneme soruları hariç). Kopyalar çıkarıldığında **{toplam['tekil']:,} tekil soru** revize edilecek.".replace(",", "."), "",
     "Bu sayılar yalnız yapıyı gösterir; cevap anahtarı ve içerik doğruluğu soru çözülerek bulunur (pilotta tekil soruların hepsinde en az bir hata çıktı).", "",
     "## Toplam", "", "| | Soru |", "|---|---:|"]
for k in ["System", "SinoAI", "AdminTest", "ogrenciye_ozel", "cozulmus", "figurlu", "sik_4", "sik_5"] + K:
    L.append(f"| `{k}` | {toplam.get(k, 0):,} |".replace(",", "."))
L += ["", "## Çalışma sırasıyla dersler", "",
      "| # | Ders | Soru | Tekil | System | SinoAI | AdminTest | Çözülmüş | Konu | Figürlü | Alt konu yok | Altı çizili sorunu | Görsel atfı, figür yok | `$` formül |",
      "|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|"]
for i, (kod, ad, c) in enumerate(satirlar, 1):
    L.append(f"| {i} | {kod} {ad or ''} | {c['soru']} | {c['tekil']} | {c['System']} | {c['SinoAI']} | {c['AdminTest']} | {c['cozulmus']} | {c['konu']} | {c['figurlu']} | "
             f"{c['alt_konu_yok']} | {c['altcizgi_iddia_var_cizgi_yok'] + c['cizgi_var_iddia_yok']} | {c['gorsel_atif_var_figur_yok']} | {c['dolar_formul']} |")
open(os.path.join(RAPOR, "QuizEnvanteri.md"), "w", encoding="utf-8").write("\n".join(L) + "\n")
print("\n".join(L))
