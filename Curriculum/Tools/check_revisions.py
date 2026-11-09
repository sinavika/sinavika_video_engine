"""Bir dersin quiz revizyonlarını denetler ve veritabanına yazılacak hâle getirir.
Kullanım: python check_revisions.py <ders_kodu>      örn. YKS/YKS_TYT/TRK
Girdi:  Revisions/<ders_kodu>/*.jsonl  (temsilci soruların revizyonları)
        Results/<ders_kodu>/stills.json (motorun çizdiği hazır resimler; render_figures.py yazar)
Çıktı:  Results/<ders_kodu>/sonuc.jsonl (kopyalar dahil kayıt başına bir satır), figur_*.jsonl, svg/, figurler.html
        Results/<ders_kodu>/soru-figurleri-<ders>.jsonl (motorun çizeceği görseller; render_figures.py kullanır)

Revizyon kaydı:
{"id", "karar": "yeniden_yazildi|duzeltildi", "sorun", "mikro": "KOD", "stem", "options": [şık metinleri], "correct": "B",
 "cozum": {"kisa","gerekce","dogru","yanlis":{"a".."e"},"onbilgi":[..],"yanilgi":[..]},
 "figures": [{"code","title","alt","visual":{motorun görseli}}]  (isteğe bağlı; verilmezse eski figürler silinir)
 "eskiFigurleriKoru": true          (isteğe bağlı; eski figürler aynen kalır, "figures" verilmez)
 "motorIstegi": "…"                 (motorun henüz çizemediği figür: soru bekletilir, canlıya yazılmaz)}
Figürleri motor çizer (1 Kasım 2026): figür motorun görseli olarak yazılır; hazır resmi olmayan ya da görseli resminden
sonra değişmiş figürün sorusu çıktıya girmez."""
import json, os, re, sys, glob, uuid, subprocess
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import KOK, VERI, REVIZYON, SONUC, hiyerarsi, oku, kopya_indeksi, ders_dosyalari, gorsel_ozeti, liste_adi

from engine_paths import FIGURE_CHECK as FIGUR_DENETLE
CLAIM = re.compile(r"altı\s*çizil(?:i|miş)|\bunderlined\b|unterstrichen|soulign[ée]|подчёркнут|подчеркнут|تحته\s*خط|المسطر", re.I)
COUNT = re.compile(r"altı\s*çizil(?:i|miş)\s+(bir|iki|üç|dört|beş|\d+)\b", re.I)
NUM = {"bir": 1, "iki": 2, "üç": 3, "dört": 4, "beş": 5}
BAD_EMPH = re.compile(r"\b(?:koyu|kalın|eğik|italik)\s+(?:olarak\s+)?(?:yazıl|basıl|dizil|gösteril)\w*|\b(?:vurgulan(?:an|mış)|işaretli|işaretlenmiş)\s+(?:sözcü|söz\b|sözler|kelime|ifade|bölüm)|\bin\s+bold\b|\bbold(?:ed|face)\b|\bitalici[sz]ed\b", re.I)
# Etiket: "<" ya da "</" ardından boşluksuz, harfle başlayan bir ad. Boşluklu eşitsizlik ("0 < x ≤ 5 … x > 5") etiket sayılmaz.
TAG = re.compile(r"</?([A-Za-z][A-Za-z0-9]*)(?:\s[^<>]*)?/?>")
U = re.compile(r"<u>(.*?)</u>", re.S)
QUOTES = "\"'“”‘’«»"


def u16(s):
    return len(s.encode("utf-16-le")) // 2


def derle(seg, text, h):
    for m in TAG.finditer(text):
        if m.group(1).lower() != "u":
            h.append(f"{seg}: izinsiz etiket {m.group(0)}")
    if text.count("<u>") != text.count("</u>") or re.search(r"<u>[^<]*<u>", text):
        h.append(f"{seg}: <u> dengesiz")
    if re.search(r"(?<!\\)\$", text):
        h.append(f"{seg}: $…$ quiz ekranında çizilmez")
    if re.search(r"\*\*|(?<![\w_])__(?=\S)", text):
        h.append(f"{seg}: ** ya da __ kullanılmış")
    plain, spans, pos = "", [], 0
    for m in U.finditer(text):
        plain += text[pos:m.start()]
        inner = m.group(1)
        if not inner or inner != inner.strip():
            h.append(f"{seg}: <u> boş ya da boşlukla başlıyor/bitiyor: '{inner}'")
        start = len(plain)
        plain += inner
        spans.append((start, inner))
        pos = m.end()
    plain += text[pos:]
    out = []
    for i, (start, inner) in enumerate(spans, 1):
        before = plain[start - 1] if start > 0 else " "
        after = plain[start + len(inner)] if start + len(inner) < len(plain) else " "
        if before in QUOTES or after in QUOTES:
            h.append(f"{seg}: çizili hedef tırnak içinde '{inner}'")
        if before.isalnum() or after.isalnum():
            h.append(f"{seg}: çizgi sözcük ortasında '{inner}'")
        if len(inner) > 512:
            h.append(f"{seg}: çizili metin 512 karakteri aşıyor")
        occ = 1 + sum(1 for _ in re.finditer(re.escape(inner), plain[:start]))
        out.append({"SegmentId": seg, "SpanId": f"u{i}", "Start": u16(plain[:start]), "Length": u16(inner),
                    "ExpectedText": inner, "Role": "underline_target", "Occurrence": occ})
    return plain, out


def cozum_metni(c, keys):
    yanlis = {k: c["yanlis"].get(k, "") for k in keys}
    st = {"short_explanation": c["kisa"], "full_reasoning": c["gerekce"], "why_correct": c["dogru"],
          "wrong_option_analysis": yanlis, "prerequisite_knowledge": c.get("onbilgi", []), "common_misconceptions": c.get("yanilgi", [])}
    lines = [f"Kısa: {c['kisa'].strip()}", f"Gerekçe: {c['gerekce'].strip()}", f"Doğru şık: {c['dogru'].strip()}"]
    for k in "abcde":
        t = (yanlis.get(k) or "").strip()
        if t and t.strip("—–-.").strip():
            lines.append(f"Yanlış {k.upper()}: {t}")
    if st["prerequisite_knowledge"]:
        lines.append("Ön bilgi: " + "; ".join(st["prerequisite_knowledge"]))
    if st["common_misconceptions"]:
        lines.append("Yaygın yanılgılar: " + "; ".join(st["common_misconceptions"]))
    return "\n\n".join(lines), json.dumps(st, ensure_ascii=False)


def denetle(r, q, mikro_ids):
    h = []
    n = len(q["options"])
    keys = "ABCDE"[:n]
    if r.get("karar") not in ("yeniden_yazildi", "duzeltildi"):
        h.append("karar geçersiz")
    if r.get("mikro") not in mikro_ids:
        h.append(f"mikro bu konuda yok: {r.get('mikro')}")
    opts = r.get("options") or []
    if len(opts) != n:
        h.append(f"şık sayısı {len(opts)} (özgün {n})")
    if r.get("correct") != q["correctKey"]:
        h.append(f"doğru harf değişmiş {q['correctKey']}→{r.get('correct')}")
    norm = [re.sub(r"\s+", " ", re.sub(r"</?u>", "", o)).strip().lower() for o in opts]
    if len(set(norm)) != len(norm) or any(not x for x in norm):
        h.append("şıklar boş ya da tekrar")
    if any(re.match(r"^\s*[A-Ea-e][\)\.]\s", o) for o in opts):
        h.append("şık harfle başlıyor")
    segs = [("stem", r["stem"])] + [(f"option:{keys[i]}", o) for i, o in enumerate(opts[:n])]
    plains, spans = {}, []
    for seg, t in segs:
        p, s = derle(seg, t, h)
        plains[seg] = p
        spans += s
    # İşaret kimliği soru içinde tekil olmalı (canlıda QuestionMarkupSpans (QuestionId, SpanId) tekil dizini): kök, sonra şıklar.
    for n, sp in enumerate(spans, 1):
        sp["SpanId"] = f"u{n}"
    claim = any(CLAIM.search(p) for p in plains.values())
    if claim and not spans:
        h.append("altı çizili deniyor, çizgi yok")
    if spans and not claim:
        h.append("çizgi var, altı çizili denmiyor")
    m = COUNT.search(plains["stem"])
    if m:
        want = NUM.get(m.group(1).lower()) or (int(m.group(1)) if m.group(1).isdigit() else None)
        if want and want != len(spans):
            h.append(f"altı çizili sayısı {want} ≠ {len(spans)}")
    for seg, p in plains.items():
        if BAD_EMPH.search(p):
            h.append(f"{seg}: gösterilemeyen vurgu ifadesi")
        # Noktalama sorularında kısa çizgi (ara söz, kök gösterimi) bilerek kullanılır.
        if not str(r.get("mikro") or "").startswith("NOKTALAMA") and re.search(r"[a-zçğıöşü]-\s[a-zçğıöşü]", p):
            h.append(f"{seg}: satır sonu tiresi artığı")
    figs = r.get("figures") or []
    if r.get("eskiFigurleriKoru") and figs:
        h.append("eskiFigurleriKoru ile yeni figür birlikte verilmiş")
    if r.get("motorIstegi"):
        h.append("motor öğesi bekleniyor: " + r["motorIstegi"])
    for f in figs:
        if not re.fullmatch(r"[A-Za-z0-9_\-]{1,64}", f.get("code", "")):
            h.append(f"figür kodu geçersiz: {f.get('code')}")
        if not isinstance(f.get("visual"), dict) or not f["visual"].get("kind"):
            h.append(f"figür {f.get('code')}: motorun görseli olarak yazılmalı (visual)")
    c = r.get("cozum") or {}
    for k in ("kisa", "gerekce", "dogru"):
        if not (c.get(k) or "").strip():
            h.append(f"çözüm {k} boş")
    y = c.get("yanlis") or {}
    for k in keys.lower():
        v = (y.get(k) or "").strip()
        if k.upper() == r.get("correct"):
            if v.strip("—–-. ") != "":
                h.append(f"çözüm: doğru şık {k} için yanlış analizi yazılmış (— olmalı)")
        elif len(v) < 15:
            h.append(f"çözüm: yanlış {k} analizi eksik")
    return h, spans


def figur_denetle(girdiler, klasor):
    """API'nin koduyla figür ve işaretleme denetimi. Dönüş: {id: sonuç}"""
    if not girdiler:
        return {}
    gp, cp = os.path.join(klasor, "figur_girdi.jsonl"), os.path.join(klasor, "figur_cikti.jsonl")
    with open(gp, "w", encoding="utf-8") as f:
        for g in girdiler:
            f.write(json.dumps(g, ensure_ascii=False) + "\n")
    p = subprocess.run(["dotnet", FIGUR_DENETLE, gp, cp, os.path.join(klasor, "svg")], capture_output=True, encoding="utf-8", errors="replace")
    if not os.path.exists(cp):
        raise RuntimeError("FigurDenetle çalışmadı: " + (p.stderr or p.stdout)[-500:])
    return {x["id"]: x for x in oku(cp)}


def figur_sayfasi(sonuclar, klasor):
    """Gözle kontrol için bütün figürleri tek sayfada toplar. Motor figürü uygulamanın kart renkleri üstünde, telefon
    genişliğinde (360 px) ve geniş hâliyle gösterilir."""
    parts = ["<!doctype html><meta charset=utf-8><title>Figür kontrolü</title><body style='font-family:sans-serif;margin:8px'>"]
    for kod, stem, figs in sonuclar:
        for f in figs:
            parts.append(f"<section style='border:1px solid #ccc;margin:6px 0;padding:6px'><div style='font-size:12px'><b>{kod}</b> · {f['code']} · tür {f['kind']}</div>"
                         f"<div style='font-size:12px;color:#555'>{stem[:300]}</div>")
            if f.get("files"):
                light, dark = (os.path.relpath(f["files"][t], klasor).replace("\\", "/") for t in ("light", "dark"))
                parts.append("<div style='display:flex;gap:6px;align-items:flex-start;flex-wrap:wrap'>"
                             f"<img src='{light}' style='width:360px;background:#FAFAFA'><img src='{dark}' style='width:360px;background:#0F1115'>"
                             f"<img src='{light}' style='width:640px;background:#FAFAFA'></div>")
            elif f.get("svgLight"):
                parts.append("<div style='display:flex;gap:6px'><div style='flex:1'>" + open(f["svgLight"], encoding="utf-8").read() + "</div>"
                             "<div style='flex:1;background:#111'>" + open(f["svgDark"], encoding="utf-8").read() + "</div></div>")
            else:
                parts.append("<pre style='font-size:11px;white-space:pre-wrap'>" + json.dumps(json.loads(f["dataJson"]), ensure_ascii=False, indent=1)[:3000] + "</pre>")
            parts.append("</section>")
    open(os.path.join(klasor, "figurler.html"), "w", encoding="utf-8").write("\n".join(parts))


if __name__ == "__main__":
    ders = sys.argv[1]
    # --konu KONU: yalnız o konunun soruları; çıktı Results/<ders>/_konu/<KONU> altına (aynı dersteki öbür işler ezilmez).
    konu = sys.argv[sys.argv.index("--konu") + 1] if "--konu" in sys.argv else None
    hiy = hiyerarsi()
    temsil = kopya_indeksi()
    qs = {q["id"]: q for q in oku(os.path.join(VERI, *ders.split("/")) + ".jsonl")}
    if konu:
        qs = {i: q for i, q in qs.items() if q["hierarchy"].get("lessonSubCode") == konu}
        if not qs:
            sys.exit(f"{ders}: {konu} konusunda soru yok")
    tum_q = {}
    for kod, p in ders_dosyalari():
        for q in oku(p):
            tum_q[q["id"]] = (kod, q)
    revs = {}
    for p in sorted(glob.glob(os.path.join(REVIZYON, "**", "*.jsonl"), recursive=True)):
        for n, r in enumerate(oku(p), 1):
            if r["id"] in revs:
                print(f"UYARI {r['id']} birden çok kez revize edilmiş; sonuncusu geçerli ({os.path.relpath(p, REVIZYON)}:{n})")
            revs[r["id"]] = r
    sub_mikro = {sb["id"]: {mk["code"]: mk["id"] for mk in sb["mikros"]} for m in hiy for sb in m["subs"]}
    klasor = os.path.join(SONUC, *ders.split("/"), *(["_konu", konu] if konu else []))
    os.makedirs(klasor, exist_ok=True)
    stills_yolu = os.path.join(SONUC, *ders.split("/"), "stills.json")
    stills = json.load(open(stills_yolu, encoding="utf-8")) if os.path.exists(stills_yolu) else {}
    liste = {}  # motorun çizeceği görseller: "<temsilci>_<kod>" → görsel

    hatali, kayitlar, figur_girdi = 0, [], []
    eksik = []
    for qid, q in qs.items():
        rep = temsil.get(qid, qid)
        r = revs.get(rep)
        if not r:
            eksik.append(qid)
            continue
        rq = tum_q[rep][1]
        mikrolar = sub_mikro.get(q["hierarchy"]["lessonSubId"], {})
        hs, spans = denetle(r, rq, mikrolar)
        if rep != qid:
            if [o["key"] for o in q["options"]] != [o["key"] for o in rq["options"]] or q["correctKey"] != rq["correctKey"]:
                hs.append(f"kopya {qid}: şıklar ya da doğru harf temsilciden farklı")
        if hs:
            hatali += 1
            print(f"{q['code']} ({'kopya, temsilci ' + rep[:8] if rep != qid else 'temsilci'}): " + " | ".join(hs))
            continue
        content, structured = cozum_metni(r["cozum"], "abcde"[:len(q["options"])])
        okeys = {o["key"]: o for o in q["options"]}
        yeni_fig = []
        for i, f in enumerate(r.get("figures") or []):
            anahtar = f"{rep}_{f['code']}"
            liste[anahtar] = f["visual"]
            st = stills.get(anahtar)
            guncel = st if st and st["hash"] == gorsel_ozeti(f["visual"]) else None
            yeni_fig.append({"Id": str(uuid.uuid5(uuid.UUID(qid), "fig:" + f["code"])).upper(), "Code": f["code"], "Kind": None,
                             "Title": f.get("title"), "Alt": f.get("alt"), "DataJson": None, "OrderIndex": i, "Engine": True,
                             "Visual": f["visual"], "Still": {k: guncel[k] for k in ("light", "dark", "width", "height")} if guncel else None,
                             "StillFiles": guncel["files"] if guncel else None})
        figur_girdi.append({"id": qid, "stem": r["stem"], "options": r["options"], "graphicExpectation": None,
                            "figures": [{"code": f["Code"], "title": f["Title"], "alt": f["Alt"], "visual": f["Visual"], "still": f["Still"]} for f in yeni_fig]
                            if not r.get("eskiFigurleriKoru") else
                            [{"code": f["Code"], "kind": f["Kind"], "title": f["Title"], "alt": f["Alt"], "dataJson": f["DataJson"]} for f in q["figures"]]})
        kayitlar.append({
            "id": qid, "code": q["code"], "kaynak": rep, "karar": r["karar"], "sorun": r.get("sorun", ""), "sourceKind": q["sourceKind"],
            "lessonSubId": q["hierarchy"]["lessonSubId"], "lessonSubCode": q["hierarchy"]["lessonSubCode"],
            "lessonMikroId": mikrolar[r["mikro"]], "lessonMikroCode": r["mikro"],
            "stem": r["stem"],
            "options": [{"id": okeys[k]["id"], "key": k, "text": r["options"][i]} for i, k in enumerate("ABCDE"[:len(q["options"])])],
            "correctOptionId": okeys[r["correct"]]["id"], "correctKey": r["correct"], "spans": spans,
            "silinecekFigurIds": [] if r.get("eskiFigurleriKoru") else [f["Id"] for f in q["figures"]],
            "eklenecekFigurler": [] if r.get("eskiFigurleriKoru") else yeni_fig,
            "solution": {"id": q["solutions"][0]["Id"], "ContentText": content, "StructuredContentJson": structured},
        })

    # Motorun çizeceği görseller (render_figures.py bu listeyi çizdirir)
    with open(os.path.join(klasor, liste_adi(ders)), "w", encoding="utf-8", newline="\n") as f:
        for anahtar in sorted(liste):
            f.write(json.dumps({"id": anahtar, "visual": liste[anahtar]}, ensure_ascii=False) + "\n")

    # API'nin koduyla figür ve işaretleme denetimi
    sonuclar = figur_denetle(figur_girdi, klasor)
    gorsel, resim_bekleyen = [], 0
    for k in kayitlar:
        s = sonuclar.get(k["id"])
        if not s:
            continue
        if s["hatalar"]:
            hatali += 1
            if all(h.startswith("motor:") and "hazır resim yok" in h for h in s["hatalar"]):
                resim_bekleyen += 1
            print(f"{k['code']}: API denetimi: " + " | ".join(s["hatalar"]))
            k["_gecersiz"] = True
            continue
        by = {f["code"]: f for f in s["figures"]}
        for f in k["eklenecekFigurler"]:
            # API'nin kaydedeceği biçim: motor görseli Works aktarımındaki gibi çevrilir (Plot örneklenir)
            f["Kind"], f["DataJson"] = by[f["Code"]]["kind"], by[f["Code"]]["dataJson"]
        if s["figures"] and k["id"] == k["kaynak"]:
            dosyalar = {f["Code"]: f["StillFiles"] for f in k["eklenecekFigurler"] if f.get("StillFiles")}
            gorsel.append((k["code"], k["stem"], [{**x, "files": dosyalar.get(x["code"])} for x in s["figures"]]))
    kayitlar = [k for k in kayitlar if not k.get("_gecersiz")]
    figur_sayfasi(gorsel, klasor)
    with open(os.path.join(klasor, "sonuc.jsonl"), "w", encoding="utf-8") as f:
        for k in kayitlar:
            f.write(json.dumps(k, ensure_ascii=False) + "\n")
    print(f"{ders}: soru {len(qs)} · geçerli kayıt {len(kayitlar)} · hatalı {hatali} (hazır resim bekleyen {resim_bekleyen}) · "
          f"revizyonu olmayan {len(eksik)} · figürlü {len(gorsel)} · motor görseli {len(liste)}")
    sys.exit(1 if hatali else 0)
