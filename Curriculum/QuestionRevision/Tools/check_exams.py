"""Bir ayın deneme sorularını denetler ve veritabanına yazılacak hâle getirir.
Kullanım: python check_exams.py <ay> [<kitapçık>] [--ders DERS]
          python check_exams.py 2026-11                       (bütün kitapçıklar)
          python check_exams.py 2026-11 TYT-FEN --ders FIZ    (yazar denetimi: yalnız o dersin dosyası; çıktı _ders/<DERS> altına)
Girdi:  Curriculum/QuestionRevision/Exams/<ay>/plan.json ve <ay>/<kitapçık>/<ders>.jsonl (exam_generator.py yazar)
        Results/Exams/<ay>/<kitapçık>/stills.json (render_figures.py Exams/<ay>/<kitapçık> yazar)
Çıktı:  Results/Exams/<ay>/<kitapçık>/sonuc.jsonl, soru-figurleri-….jsonl (motorun çizeceği görseller), figurler.html

Denetimler: plan uyumu (slot, konu, mikro, doğru harf, beş şık), quiz denetimleri (metin, altı çizili işaretleme, çözüm,
yanlış şık analizleri), API'nin kendi figür denetimi (FigureCheck), hazır resim, ay içinde tekrar eden kök ve
EgitimVerileri kaynağına fazla benzeyen kök (örnek alınır, birebir kopyalanmaz)."""
import glob, hashlib, json, os, re, sys, uuid
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from check_revisions import cozum_metni, denetle, figur_denetle, figur_sayfasi
from common import gorsel_ozeti, liste_adi, oku
from exam_common import EXAM_RESULTS, EXAMS, OSYM_DERS, OSYM_KLASOR, katalog, plan, soru_dosyasi
from paths import EDUCATION_DATA

sys.stdout.reconfigure(encoding="utf-8")
NS = uuid.UUID("6f1d9a52-3c47-4e0b-9a3e-5b1f0c7d2e81")
KOD_HARF = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
ZORLUK = {"Easy": 0, "Medium": 1, "Hard": 2}


def kimlik(*parca):
    return str(uuid.uuid5(NS, "/".join(parca))).upper()


def kod8(tohum):
    h = hashlib.sha256(tohum.encode()).digest()
    return "".join(KOD_HARF[b % len(KOD_HARF)] for b in h[:8])


def norm(t):
    t = re.sub(r"\{\{fig:[^}]+\}\}|</?u>", " ", t or "")
    t = t.replace("İ", "i").replace("I", "ı").lower()
    return re.findall(r"[0-9a-zçğıöşüâîû]+", t)


def parcalar(t, n=6):
    w = norm(t)
    return {" ".join(w[i:i + n]) for i in range(max(0, len(w) - n + 1))}


def benzerlik(a, b):
    """a'nın 6 sözcüklük parçalarından b'de geçenlerin oranı."""
    return len(a & b) / len(a) if a else 0.0


ay = sys.argv[1]
args = [a for a in sys.argv[2:] if not a.startswith("--")]
ders_modu = sys.argv[sys.argv.index("--ders") + 1] if "--ders" in sys.argv else None
if ders_modu and ders_modu in args:
    args.remove(ders_modu)
pl, kat = plan(ay), katalog()
hedefler = [b for b in pl["kitapciklar"] if not args or b["anahtar"] in args]
if not hedefler:
    sys.exit(f"Kitapçık yok: {args}")

# Ay içindeki bütün yazılmış kökler (tekrar denetimi) ve konu başına kaynak kökleri (kopya denetimi)
tum = []
for b in pl["kitapciklar"]:
    for d in b["dersler"]:
        p = soru_dosyasi(ay, b["anahtar"], d)
        if os.path.exists(p):
            tum += [(b["anahtar"], r) for r in oku(p)]
# Ayna kitapçık (KPSS Ortaöğretim = Önlisans) soruları kaynağının kopyasıdır: bir soru ile aynası benzer sayılmaz.
grup = {r["soruId"]: r.get("aynaSoruId") or r["soruId"] for _, r in tum}
tum_parca = [(a, r["soruId"], parcalar(r["stem"] + " " + " ".join(r["options"]))) for a, r in tum]
kaynak_onbellek = {}


def kaynak_parcalari(sub, ders, konu):
    k = (OSYM_KLASOR[sub], OSYM_DERS.get((sub, ders), ders), konu)
    if k not in kaynak_onbellek:
        kok = os.path.join(EDUCATION_DATA, *k[0].split("/"))
        L = []
        for p in (os.path.join(kok, "CikmisSorular", k[1] + ".jsonl"), os.path.join(kok, "Sorular", k[1], konu + ".jsonl")):
            if os.path.exists(p):
                for l in open(p, encoding="utf-8"):
                    d = json.loads(l)
                    if d.get("lessonSubCode") == konu:
                        L.append((d.get("id"), parcalar((d.get("question") or "") + " " + " ".join(o.get("text", "") for o in d.get("options", [])))))
        kaynak_onbellek[k] = L
    return kaynak_onbellek[k]


genel_hata = 0
for kb in hedefler:
    sub = kat["subs"][kb["sub"]]
    agac = {m["code"]: m for m in sub["lessons"]}
    dersler = [ders_modu] if ders_modu else kb["dersler"]
    if ders_modu and ders_modu not in kb["dersler"]:
        sys.exit(f"{kb['anahtar']}: {ders_modu} dersi yok")
    klasor = os.path.join(EXAM_RESULTS, ay, kb["anahtar"], *(["_ders", ders_modu] if ders_modu else []))
    os.makedirs(klasor, exist_ok=True)
    stills_yolu = os.path.join(EXAM_RESULTS, ay, kb["anahtar"], "stills.json")
    stills = json.load(open(stills_yolu, encoding="utf-8")) if os.path.exists(stills_yolu) else {}
    slot_by = {s["slotId"]: s for s in kb["slotlar"]}
    hatali, kayitlar, figur_girdi, liste, eksik = 0, [], [], {}, 0
    for ders in dersler:
        planli = [s for s in kb["slotlar"] if s["ders"] == ders]
        p = soru_dosyasi(ay, kb["anahtar"], ders)
        yazili = oku(p) if os.path.exists(p) else []
        eksik += len(planli) - len(yazili)
        mikro_id = {s["code"]: {k["code"]: k["id"] for k in s["mikros"] if k["active"]} for s in agac[ders]["subs"] if s["active"]}
        for r in yazili:
            s = slot_by.get(r["slotId"])
            h = []
            if not s or s["ders"] != ders or s["soruId"] != r["soruId"]:
                print(f"{kb['anahtar']}/{ders} {r.get('dersSira')}: slot planla tutmuyor")
                hatali += 1
                continue
            if r["konu"] != s["konu"]:
                h.append(f"konu planda {s['konu']}")
            if r["correct"] != s["dogru"]:
                h.append(f"doğru harf planda {s['dogru']}")
            q = {"options": [{"key": k} for k in "ABCDE"], "correctKey": s["dogru"]}
            hs, spans = denetle({**r, "karar": "yeniden_yazildi"}, q, mikro_id.get(s["konu"], {}))
            h += hs
            ben = parcalar(r["stem"] + " " + " ".join(r["options"]))
            for a, qid, pr in tum_parca:
                if grup.get(qid, qid) != grup.get(r["soruId"], r["soruId"]) and benzerlik(ben, pr) > 0.5:
                    h.append(f"ay içinde benzer soru var: {a} {qid[:8]}")
                    break
            for kid, pr in kaynak_parcalari(kb["sub"], ders, s["konu"]):
                if benzerlik(ben, pr) > 0.5:
                    h.append(f"kaynağa çok benziyor (birebir kopya yasak): {kid}")
                    break
            if h:
                hatali += 1
                print(f"{kb['anahtar']}/{ders} {r['dersSira']:2} ({s['konu']}): " + " | ".join(h))
                continue
            content, structured = cozum_metni(r["cozum"], "abcde")
            figs = []
            for i, f in enumerate(r.get("figures") or []):
                anahtar = f"{r['soruId']}_{f['code']}"
                liste[anahtar] = f["visual"]
                st = stills.get(anahtar)
                guncel = st if st and st["hash"] == gorsel_ozeti(f["visual"]) else None
                figs.append({"Id": kimlik("figur", r["soruId"], f["code"]), "Code": f["code"], "Kind": None, "Title": f.get("title"), "Alt": f.get("alt"),
                             "DataJson": None, "OrderIndex": i, "Visual": f["visual"],
                             "Still": {k: guncel[k] for k in ("light", "dark", "width", "height")} if guncel else None,
                             "StillFiles": guncel["files"] if guncel else None})
            figur_girdi.append({"id": r["soruId"], "stem": r["stem"], "options": r["options"], "graphicExpectation": None,
                                "figures": [{"code": f["Code"], "title": f["Title"], "alt": f["Alt"], "visual": f["Visual"], "still": f["Still"]} for f in figs]})
            konu = next(x for x in agac[ders]["subs"] if x["code"] == s["konu"])
            kayitlar.append({
                "soruId": r["soruId"], "soruKodu": r["soruKodu"], "slotId": r["slotId"], "sectionId": s["sectionId"], "bolum": s["bolum"],
                "sira": s["sira"], "ders": ders, "dersSira": r["dersSira"], "lessonMainId": s["lessonMainId"], "sectionLessonId": s["sectionLessonId"],
                "lessonSubId": konu["id"], "lessonSubCode": konu["code"], "lessonMikroId": mikro_id[s["konu"]][r["mikro"]], "lessonMikroCode": r["mikro"],
                "zorluk": ZORLUK[s["zorluk"]], "stem": r["stem"],
                "options": [{"id": kimlik("secenek", r["soruId"], k), "key": k, "text": r["options"][i]} for i, k in enumerate("ABCDE")],
                "correctKey": r["correct"], "correctOptionId": kimlik("secenek", r["soruId"], r["correct"]), "spans": spans,
                "figures": figs, "kaynak": r.get("kaynak", []),
                "solution": {"id": kimlik("cozum", r["soruId"]), "code": kod8("cozum/" + r["soruId"]), "ContentText": content, "StructuredContentJson": structured},
            })

    with open(os.path.join(klasor, liste_adi(f"Exams/{ay}/{kb['anahtar']}")), "w", encoding="utf-8", newline="\n") as f:
        for k in sorted(liste):
            f.write(json.dumps({"id": k, "visual": liste[k]}, ensure_ascii=False) + "\n")
    sonuclar = figur_denetle(figur_girdi, klasor)
    gorsel, resim_bekleyen = [], 0
    for k in kayitlar:
        s = sonuclar.get(k["soruId"])
        if not s:
            continue
        if s["hatalar"]:
            hatali += 1
            if all(h.startswith("motor:") and "hazır resim yok" in h for h in s["hatalar"]):
                resim_bekleyen += 1
            print(f"{kb['anahtar']}/{k['ders']} {k['dersSira']:2}: API denetimi: " + " | ".join(s["hatalar"]))
            k["_gecersiz"] = True
            continue
        by = {f["code"]: f for f in s["figures"]}
        for f in k["figures"]:
            f["Kind"], f["DataJson"] = by[f["Code"]]["kind"], by[f["Code"]]["dataJson"]
        if s["figures"]:
            dosyalar = {f["Code"]: f["StillFiles"] for f in k["figures"] if f.get("StillFiles")}
            gorsel.append((f"{k['ders']} {k['dersSira']}", k["stem"], [{**x, "files": dosyalar.get(x["code"])} for x in s["figures"]]))
    kayitlar = [k for k in kayitlar if not k.get("_gecersiz")]
    figur_sayfasi(gorsel, klasor)
    for k in kayitlar:
        for f in k["figures"]:
            f.pop("Visual", None)
    with open(os.path.join(klasor, "sonuc.jsonl"), "w", encoding="utf-8", newline="\n") as f:
        for k in sorted(kayitlar, key=lambda k: (k["bolum"], k["sira"])):
            f.write(json.dumps(k, ensure_ascii=False) + "\n")
    planli_n = sum(1 for s in kb["slotlar"] if s["ders"] in dersler)
    print(f"{kb['anahtar']}{'/' + ders_modu if ders_modu else ''}: plan {planli_n} · geçerli {len(kayitlar)} · hatalı {hatali} "
          f"(hazır resim bekleyen {resim_bekleyen}) · yazılmamış {eksik} · figürlü soru {len(gorsel)} · motor görseli {len(liste)}")
    genel_hata += hatali + eksik
sys.exit(1 if genel_hata else 0)
