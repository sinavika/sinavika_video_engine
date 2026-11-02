"""Bir dersin motor figürü resimlerini API'nin kabına yükler (guncelle.sql'den ÖNCE). Canlıya dokunduğu için onayla çalışır.
Kullanım: python upload_stills.py <ders_kodu>             → yalnız denetler: dosyalar var mı, adları içeriğin özeti mi, boyut sınırı
          python upload_stills.py <ders_kodu> --yukle     → yükler ve dönen adresleri SQL'deki adreslerle karşılaştırır
          python upload_stills.py <ders_kodu> --var-mi    → adreslerin hepsi depoda var mı (SQL'den hemen önce)
Uç: POST {SINAVIKA_API_URL}/api/claude/works/stills (multipart `files`, en çok 20 dosya, dosya en çok 5 MB), başlık X-SocialHub-Key.
Adres ve anahtar motorun .env dosyasından okunur, ekrana yazılmaz. Aynı içerik aynı adrese yazılır; yarım kalan yükleme
tekrar çalıştırılınca tamamlanır ve hiçbir veriyi bozmaz (SQL resimler tamamlanmadan çalıştırılmaz)."""
import hashlib, json, os, sys, uuid, urllib.request, urllib.error

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import SONUC
from paths import ENGINE

ders = sys.argv[1]
klasor = os.path.join(SONUC, *ders.split("/"))
liste = json.load(open(os.path.join(klasor, "yuklenecek-resimler.json"), encoding="utf-8"))
EN_COK_DOSYA, EN_BUYUK = 20, 5 * 1024 * 1024


def ortam():
    degerler = {}
    for satir in open(os.path.join(ENGINE, ".env"), encoding="utf-8"):
        if "=" in satir and not satir.lstrip().startswith("#"):
            k, v = satir.split("=", 1)
            degerler[k.strip()] = v.strip().strip('"')
    return degerler["SINAVIKA_API_URL"].rstrip("/"), degerler["SINAVIKA_SOCIALHUB_KEY"]


# 1) Yerel denetim: her dosya var, adı içeriğinin SHA-256 özeti, boyutu sınırda
toplam = 0
for r in liste:
    veri = open(r["dosya"], "rb").read()
    uzanti = r["ad"].rsplit(".", 1)[1]
    assert f"{hashlib.sha256(veri).hexdigest()}.{uzanti}" == r["ad"], f"{r['dosya']}: içerik adıyla tutmuyor (yeniden çizilmiş olabilir; check_revisions ve build_sql yeniden çalışmalı)"
    assert len(veri) <= EN_BUYUK, f"{r['dosya']}: 5 MB'tan büyük"
    toplam += len(veri)
print(f"{ders}: {len(liste)} dosya, toplam {toplam / 1024 / 1024:.1f} MB; yerel denetim tamam")

if "--var-mi" in sys.argv:
    eksik = []
    for r in liste:
        try:
            urllib.request.urlopen(urllib.request.Request(r["url"], method="HEAD"), timeout=30)
        except urllib.error.HTTPError:
            eksik.append(r["ad"])
    print(f"depoda olmayan: {len(eksik)}" + (" → " + ", ".join(eksik[:5]) if eksik else ""))
    sys.exit(1 if eksik else 0)

if "--yukle" not in sys.argv:
    print("Yüklenmedi (yüklemek için --yukle).")
    sys.exit(0)

api, anahtar = ortam()
for i in range(0, len(liste), EN_COK_DOSYA):
    parca = liste[i:i + EN_COK_DOSYA]
    sinir = uuid.uuid4().hex
    govde = b""
    for r in parca:
        tur = "image/svg+xml" if r["ad"].endswith(".svg") else "image/webp"
        govde += (f"--{sinir}\r\nContent-Disposition: form-data; name=\"files\"; filename=\"{r['ad']}\"\r\nContent-Type: {tur}\r\n\r\n").encode("utf-8")
        govde += open(r["dosya"], "rb").read() + b"\r\n"
    govde += f"--{sinir}--\r\n".encode("utf-8")
    istek = urllib.request.Request(f"{api}/api/claude/works/stills", data=govde, method="POST",
                                   headers={"Content-Type": f"multipart/form-data; boundary={sinir}", "X-SocialHub-Key": anahtar})
    try:
        yanit = json.loads(urllib.request.urlopen(istek, timeout=300).read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        sys.exit(f"Yükleme durdu ({i}. dosyadan sonra): HTTP {e.code} {e.read().decode('utf-8', 'replace')[:500]}")
    beklenen = {r["ad"]: r["url"] for r in parca}
    for y in yanit:
        if beklenen.get(y["fileName"]) != y["url"]:
            sys.exit(f"Dönen adres SQL'dekiyle aynı değil: {y['fileName']} → {y['url']}")
    print(f"{min(i + EN_COK_DOSYA, len(liste))}/{len(liste)} yüklendi")
print("Hepsi yüklendi; adresler SQL'dekilerle aynı.")
