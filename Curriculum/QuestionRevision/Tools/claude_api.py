"""Claude içerik API'si istemcisi (sinavika docs/claude/Claude-Icerik-API.md). Adres ve anahtar motorun .env dosyasından okunur
(SINAVIKA_API_URL, SINAVIKA_SOCIALHUB_KEY); ekrana yazılmaz."""
import json, os, time, urllib.error, urllib.request

from paths import ENGINE


def ortam():
    d = {}
    for satir in open(os.path.join(ENGINE, ".env"), encoding="utf-8"):
        if "=" in satir and not satir.lstrip().startswith("#"):
            k, v = satir.split("=", 1)
            d[k.strip()] = v.strip().strip('"')
    return d["SINAVIKA_API_URL"].rstrip("/"), d["SINAVIKA_SOCIALHUB_KEY"]


def cagir(yontem, yol, govde=None, deneme=4):
    adres, anahtar = ortam()
    veri = json.dumps(govde, ensure_ascii=False).encode("utf-8") if govde is not None else None
    for n in range(deneme):
        istek = urllib.request.Request(adres + yol, data=veri, method=yontem,
                                       headers={"X-SocialHub-Key": anahtar, "Content-Type": "application/json; charset=utf-8"})
        try:
            with urllib.request.urlopen(istek, timeout=900) as y:
                govde_ = y.read().decode("utf-8")
                return y.status, (json.loads(govde_) if govde_ else None)
        except urllib.error.HTTPError as e:
            metin = e.read().decode("utf-8", "replace")
            # Yayın sonrası kapsayıcı değişirken gövdesiz 500 gelebilir: kısa bekleyip yeniden dene. Gövdeli hata gerçektir.
            if e.code >= 500 and not metin.strip() and n + 1 < deneme:
                time.sleep(15)
                continue
            try:
                return e.code, json.loads(metin)
            except ValueError:
                return e.code, {"Error": metin[:2000]}
