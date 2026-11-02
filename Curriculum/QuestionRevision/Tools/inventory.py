"""Dışa aktarılmış soruların yapısal hata envanteri. Veritabanına bağlanmaz.
Çıktı: ../rapor/envanter.json (soru başına bulgular) ve ../rapor/Envanter.md (özet)."""
import json, os, re, glob, hashlib
from collections import Counter, defaultdict

from paths import DATA, REPORTS as RAPOR
VERI = os.path.join(DATA, "sorular")
os.makedirs(RAPOR, exist_ok=True)

hiy = json.load(open(os.path.join(DATA, "hiyerarsi.json"), encoding="utf-8"))
sub_info, mikro_info = {}, {}
for m in hiy:
    for sb in m["subs"]:
        sub_info[sb["id"]] = {"main": m["lessonMainId"], "active": sb["isActive"], "mikroCount": len(sb["mikros"])}
        for mk in sb["mikros"]:
            mikro_info[mk["id"]] = {"sub": sb["id"], "active": mk["isActive"]}

TAG = re.compile(r"<\s*/?\s*(\p{L}[\p{L}0-9]*)\b[^>]*>" if False else r"<\s*/?\s*([A-Za-zÇĞİÖŞÜçğıöşü][\wÇĞİÖŞÜçğıöşü]*)\b[^>]*>")
U_PAIR = re.compile(r"<u>(.*?)</u>", re.S | re.I)
FIG_REF = re.compile(r"\{\{\s*fig:([^}]+?)\s*\}\}")
CLAIM_UNDERLINE = re.compile(r"altı\s*çizil(?:i|miş)|\bunderlined\b", re.I)
CLAIM_EMPH = re.compile(r"\b(?:koyu|kalın|eğik|italik)\s+(?:olarak\s+)?(?:yazıl|basıl|dizil|gösteril)\w*|\b(?:vurgulan(?:an|mış)|işaretli|işaretlenmiş)\s+(?:sözcü|söz\b|sözler|kelime|ifade|bölüm)", re.I)
VISUAL = re.compile(
    r"(aşağıdaki|yukarıdaki|verilen)\s+(grafik|tablo|şekil|harita|diyagram|çizelge|görsel|resim|şema|soyağacı|kroki)"
    r"|\b(grafiğ|grafikte|tabloda|tablodaki|tabloya|şekilde|şekildeki|şekle|haritada|haritadaki|haritaya|diyagramda|şemada|çizelgede|görselde|görseldeki|soyağacında)\w*"
    r"|\b(the\s+(following\s+)?(graph|table|figure|chart|map|diagram)|shown\s+(above|below)|graph\s+shown)\b", re.I)
QUOTED_TARGET = re.compile(r"[\"'“‘«]([^\"'”’»]{1,40})[\"'”’»]\s+(sözcüğ|kelime|ifade|sözü|deyim)", re.I)
OPTION_LEAK = re.compile(r"(?:^|\s)[A-E]\)\s+\S+.*?\s[B-E]\)\s+\S+", re.S)
ROMAN = re.compile(r"(?:^|\s)(I{1,3}|IV|V)\.\s")
OCR_JUNK = re.compile(r"(\n-\n-)|�|�|[\u0000-\u0008]")
DOLLAR = re.compile(r"(?<!\\)\$")


def plain(t):
    return re.sub(r"</?u>", "", t or "", flags=re.I)


def norm_text(t):
    t = plain(t).lower().replace("−", "-").replace("’", "'")
    return re.sub(r"\s+", " ", t).strip(" .")


def check(q):
    f = []  # (kod, ayrıntı)
    h = q["hierarchy"]
    stem = q["stem"] or ""
    opts = q["options"]
    # --- Hiyerarşi
    if not h.get("lessonMainId"):
        f.append(("hiy_ders_yok", ""))
    if not h.get("lessonSubId"):
        f.append(("hiy_konu_yok", ""))
    elif h["lessonSubId"] not in sub_info:
        f.append(("hiy_konu_gecersiz", h["lessonSubId"]))
    else:
        si = sub_info[h["lessonSubId"]]
        if not si["active"]:
            f.append(("hiy_konu_pasif", h.get("lessonSubCode")))
        if not h.get("lessonMikroId") and si["mikroCount"] > 0:
            f.append(("hiy_altkonu_yok", ""))
    if h.get("lessonMikroId"):
        if h["lessonMikroId"] not in mikro_info:
            f.append(("hiy_altkonu_gecersiz", h["lessonMikroId"]))
        elif h.get("mikroBelongsToSub") is False:
            f.append(("hiy_altkonu_baska_konuda", h.get("lessonMikroCode")))
        elif not mikro_info[h["lessonMikroId"]]["active"]:
            f.append(("hiy_altkonu_pasif", h.get("lessonMikroCode")))
    srcs = set(v for v in (h.get("mainSources") or {}).values() if v)
    if len(srcs) > 1:
        f.append(("hiy_kaynaklar_celisiyor", json.dumps(h["mainSources"])))
    b = q.get("booklet")
    if b and b.get("targetLessonSubId") and h.get("lessonSubId") and b["targetLessonSubId"] != h["lessonSubId"]:
        f.append(("hiy_slot_konusu_farkli", ""))
    for qz in q.get("quizzes") or []:
        if qz.get("lessonSubId") and h.get("lessonSubId") and qz["lessonSubId"] != h["lessonSubId"]:
            f.append(("hiy_quiz_konusu_farkli", qz.get("title") or ""))
            break
    # --- Kök ve şıklar
    if len(plain(stem).strip()) < 15:
        f.append(("kok_bos_veya_kisa", str(len(stem))))
    if OCR_JUNK.search(stem):
        f.append(("kok_bozuk_karakter", ""))
    if OPTION_LEAK.search(plain(stem)):
        f.append(("kok_icinde_siklar", ""))
    keys = [o["key"] for o in opts]
    n = len(opts)
    if n < 4:
        f.append(("sik_sayisi_az", str(n)))
    exp = "ABCDE"[:n]
    if "".join(keys) != exp:
        f.append(("sik_harfleri_bozuk", "".join(keys)))
    texts = [norm_text(o["text"]) for o in opts]
    if any(not t for t in texts) and not any(o.get("imageUrl") for o in opts):
        f.append(("sik_bos", ""))
    if len(set(t for t in texts if t)) < len([t for t in texts if t]):
        f.append(("sik_tekrar", ""))
    if any(re.match(r"^\s*[A-Ea-e][\)\.]\s", o["text"] or "") for o in opts):
        f.append(("sik_harf_artigi", ""))
    if not q.get("correctKey"):
        f.append(("cevap_yok", ""))
    # --- İşaretleme
    alltext = [("stem", stem)] + [("option:" + o["key"], o["text"] or "") for o in opts]
    for seg, t in alltext:
        for m in TAG.finditer(t):
            if m.group(1).lower() != "u":
                f.append(("isaret_izinsiz_etiket", f"{seg}:{m.group(0)[:20]}"))
                break
        if len(re.findall(r"<u>", t, re.I)) != len(re.findall(r"</u>", t, re.I)):
            f.append(("isaret_dengesiz_u", seg))
    has_u = any(U_PAIR.search(t) for _, t in alltext)
    claim = any(CLAIM_UNDERLINE.search(plain(t)) for _, t in alltext)
    if claim and not has_u:
        f.append(("altcizgi_iddia_var_isaret_yok", ""))
    if has_u and not claim:
        f.append(("altcizgi_isaret_var_iddia_yok", ""))
    if has_u and not q["markupSpans"]:
        f.append(("altcizgi_span_kaydi_yok", ""))
    if claim:
        m = re.search(r"altı\s*çizil(?:i|miş)\s+(bir|iki|üç|dört|beş|\d+)\b", plain(stem), re.I)
        if m:
            want = {"bir": 1, "iki": 2, "üç": 3, "dört": 4, "beş": 5}.get(m.group(1).lower(), None) or (int(m.group(1)) if m.group(1).isdigit() else None)
            got = sum(len(U_PAIR.findall(t)) for _, t in alltext)
            if want and got and want != got:
                f.append(("altcizgi_sayi_uyusmuyor", f"{want}≠{got}"))
    segs = {seg: plain(t) for seg, t in alltext}
    for sp in q["markupSpans"]:
        t = segs.get(sp["SegmentId"])
        if t is None or t[sp["Start"]:sp["Start"] + sp["Length"]] != sp["ExpectedText"]:
            f.append(("altcizgi_span_uyusmuyor", sp["SegmentId"]))
            break
    if CLAIM_EMPH.search(plain(stem)):
        f.append(("vurgu_gosterilemiyor", ""))
    if QUOTED_TARGET.search(plain(stem)) and not has_u:
        f.append(("hedef_tirnakla_verilmis", ""))
    # --- Figürler
    figs = q["figures"]
    codes = {(x["Code"] or "").lower() for x in figs}
    refs = [r.lower() for r in FIG_REF.findall(stem + " " + " ".join(o["text"] or "" for o in opts))]
    for r in refs:
        if r not in codes:
            f.append(("figur_atif_karsiliksiz", r))
    for x in figs:
        if (x["Code"] or "").lower() not in refs:
            f.append(("figur_atifsiz", x["Code"]))
        if x["Kind"] == 0 and not x.get("ImageUrl"):
            f.append(("figur_resim_adresi_yok", x["Code"]))
        if x["Kind"] != 0:
            try:
                d = json.loads(x["DataJson"] or "")
                if not d:
                    f.append(("figur_veri_bos", x["Code"]))
            except Exception:
                f.append(("figur_veri_bozuk_json", x["Code"]))
    has_visual = bool(figs) or bool(q.get("stemImageUrl")) or any(o.get("imageUrl") for o in opts)
    if VISUAL.search(plain(stem)) and not has_visual:
        f.append(("gorsel_atif_var_figur_yok", VISUAL.search(plain(stem)).group(0)))
    ge = (q.get("meta") or {}).get("GraphicExpectation")
    if ge not in (None, 0) and not has_visual:
        f.append(("gorsel_beklentisi_var_figur_yok", str(ge)))
    if ge == 5 and not any(x["Kind"] == 5 for x in figs):
        f.append(("harita_beklentisi_harita_yok", ""))
    # --- LaTeX
    for seg, t in alltext:
        if len(DOLLAR.findall(t)) % 2:
            f.append(("latex_dolar_dengesiz", seg))
            break
    # --- Çözüm
    sols = [s for s in q["solutions"] if s.get("IsActive")]
    if not sols or not any((s.get("ContentText") or "").strip() or (s.get("StructuredContentJson") or "").strip() for s in sols):
        f.append(("cozum_yok", ""))
    return f


bulgular = {}
ozet = Counter()
ders_ozet = defaultdict(Counter)
ders_toplam = Counter()
kok_ozet = defaultdict(set)
hash_index = defaultdict(list)
toplam = 0
for path in sorted(glob.glob(os.path.join(VERI, "**", "*.jsonl"), recursive=True)):
    rel = os.path.relpath(path, VERI).replace("\\", "/")
    for line in open(path, encoding="utf-8"):
        q = json.loads(line)
        toplam += 1
        ders_toplam[rel] += 1
        h = hashlib.sha1((norm_text(q["stem"]) + "|" + "|".join(sorted(norm_text(o["text"]) for o in q["options"]))).encode()).hexdigest()
        hash_index[h].append(q["id"])
        fs = check(q)
        if fs:
            bulgular[q["id"]] = {"file": rel, "code": q["code"], "usage": q["usageKind"], "source": q["sourceKind"], "findings": fs}
        for kod in {k for k, _ in fs}:
            ozet[kod] += 1
            ders_ozet[rel][kod] += 1

for h, ids in hash_index.items():
    if len(ids) > 1:
        for i in ids:
            bulgular.setdefault(i, {"findings": []})["findings"].append(("tekrar_eden_soru", str(len(ids))))
            ozet["tekrar_eden_soru"] += 1

json.dump(bulgular, open(os.path.join(RAPOR, "envanter.json"), "w", encoding="utf-8"), ensure_ascii=False)
hatali = len(bulgular)
json.dump({"toplam": toplam, "bulgulu": hatali, "ozet": ozet.most_common(),
           "ders": {k: {"toplam": ders_toplam[k], **dict(v)} for k, v in ders_ozet.items()}},
          open(os.path.join(RAPOR, "envanter_ozet.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("toplam", toplam, "bulgulu", hatali)
for k, v in ozet.most_common():
    print(f"{v:>7}  {k}")
