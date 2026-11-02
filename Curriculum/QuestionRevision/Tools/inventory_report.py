"""envanter_ozet.json'dan ders bazlı Envanter.md yazar."""
import json, os

from paths import REPORTS
o = json.load(open(os.path.join(REPORTS, "envanter_ozet.json"), encoding="utf-8"))
B = json.load(open(os.path.join(REPORTS, "envanter.json"), encoding="utf-8"))

ACIKLAMA = {
    "hiy_altkonu_yok": "Alt konu (LessonMikro) atanmamış; konunun alt konuları var",
    "tekrar_eden_soru": "Aynı kök ve şıklar başka kayıtta da var (kategori kopyası ya da üçlü deneme kopyası)",
    "hiy_konu_yok": "Konu (LessonSub) atanmamış",
    "gorsel_atif_var_figur_yok": "Kök tabloya/grafiğe/şekle atıf yapıyor ama figür yok",
    "altcizgi_span_kaydi_yok": "Kökte <u> var ama doğrulanmış işaretleme kaydı (QuestionMarkupSpan) yok",
    "altcizgi_iddia_var_isaret_yok": "\"Altı çizili\" deniyor ama hiçbir yer çizili değil",
    "altcizgi_isaret_var_iddia_yok": "<u> var ama kök altı çizili demiyor (çoğu gereksiz ya da \"koyu yazılmış\" denmiş)",
    "hiy_kaynaklar_celisiyor": "Soru, kitapçıkta başka dersin bölümüne konmuş",
    "hedef_tirnakla_verilmis": "Hedef sözcük altı çizili değil, tırnakla verilmiş",
    "vurgu_gosterilemiyor": "Koyu/eğik/işaretli yazım iddiası; uygulama yalnız altı çiziliyi gösterir",
    "hiy_ders_yok": "Ders hiçbir kaynaktan belirlenemiyor",
    "latex_dolar_dengesiz": "Formül işareti $ tek kalmış",
    "gorsel_beklentisi_var_figur_yok": "Görsel beklentisi işaretli ama figür yok",
    "sik_harf_artigi": "Şık metni \"A)\" gibi harfle başlıyor",
    "figur_atifsiz": "Figür var ama metinde {{fig:…}} atfı yok",
    "sik_tekrar": "İki şık aynı",
    "kok_icinde_siklar": "Şıklar kökün içine de yazılmış",
    "kok_bozuk_karakter": "Kökte bozuk karakter / OCR artığı",
    "figur_veri_bozuk_json": "Figür verisi geçerli JSON değil",
    "isaret_izinsiz_etiket": "<u> dışında HTML etiketi",
    "altcizgi_sayi_uyusmuyor": "\"Altı çizili iki sözcük\" deniyor, çizili sayısı farklı",
    "altcizgi_span_uyusmuyor": "İşaretleme kaydı metinle uyuşmuyor",
    "sik_sayisi_az": "Dörtten az şık",
    "sik_harfleri_bozuk": "Şık harfleri sırasız",
    "sik_bos": "Boş şık",
    "cevap_yok": "Doğru cevap yok",
    "cozum_yok": "Çözüm yok",
    "kok_bos_veya_kisa": "Kök boş ya da çok kısa",
    "figur_resim_adresi_yok": "Resim figüründe adres yok",
    "figur_veri_bos": "Figür verisi boş",
    "harita_beklentisi_harita_yok": "Harita beklentisi var, harita figürü yok",
    "hiy_konu_gecersiz": "Konu kimliği listede yok",
    "hiy_konu_pasif": "Konu pasif",
    "hiy_altkonu_gecersiz": "Alt konu kimliği listede yok",
    "hiy_altkonu_baska_konuda": "Alt konu başka bir konuya ait",
    "hiy_altkonu_pasif": "Alt konu pasif",
    "hiy_slot_konusu_farkli": "Kitapçık slotunun konusu sorununkinden farklı",
    "hiy_quiz_konusu_farkli": "Quiz'in konusu sorununkinden farklı",
}
ICERIK = {"gorsel_atif_var_figur_yok", "altcizgi_span_kaydi_yok", "altcizgi_iddia_var_isaret_yok", "altcizgi_isaret_var_iddia_yok",
          "hedef_tirnakla_verilmis", "vurgu_gosterilemiyor", "latex_dolar_dengesiz", "gorsel_beklentisi_var_figur_yok",
          "sik_harf_artigi", "figur_atifsiz", "sik_tekrar", "kok_icinde_siklar", "kok_bozuk_karakter", "figur_veri_bozuk_json",
          "isaret_izinsiz_etiket", "altcizgi_sayi_uyusmuyor", "altcizgi_span_uyusmuyor", "sik_sayisi_az", "sik_harfleri_bozuk",
          "sik_bos", "cevap_yok", "cozum_yok", "kok_bos_veya_kisa", "figur_resim_adresi_yok", "figur_veri_bos", "harita_beklentisi_harita_yok"}
ISARET = {"altcizgi_span_kaydi_yok", "altcizgi_iddia_var_isaret_yok", "altcizgi_isaret_var_iddia_yok", "hedef_tirnakla_verilmis",
          "vurgu_gosterilemiyor", "altcizgi_sayi_uyusmuyor", "altcizgi_span_uyusmuyor", "isaret_izinsiz_etiket"}
GORSEL = {"gorsel_atif_var_figur_yok", "gorsel_beklentisi_var_figur_yok", "figur_atifsiz", "figur_veri_bozuk_json",
          "figur_resim_adresi_yok", "figur_veri_bos", "harita_beklentisi_harita_yok"}

icerik_ders = {}
for v in B.values():
    if "file" not in v:
        continue
    kods = {f[0] for f in v["findings"]}
    d = icerik_ders.setdefault(v["file"], {"icerik": 0, "isaret": 0, "gorsel": 0})
    d["icerik"] += bool(kods & ICERIK)
    d["isaret"] += bool(kods & ISARET)
    d["gorsel"] += bool(kods & GORSEL)

L = ["# Soru envanteri", "",
     f"Canlıdan 30 Ekim 2026'da salt okunur çekilen **{o['toplam']:,} soru** otomatik denetimden geçirildi. "
     "Bu denetim yalnız yapıyı görür (hiyerarşi, şık, işaretleme, figür atfı). **Cevap anahtarı ve içerik doğruluğu bu sayılarda yok**; "
     "onlar soru çözülerek bulunur (pilotta).".replace(",", "."), "",
     "## Bulgu türleri", "", "| Bulgu | Soru | Açıklama |", "|---|---:|---|"]
for k, v in o["ozet"]:
    L.append(f"| `{k}` | {v:,} | {ACIKLAMA.get(k, '')} |".replace(",", "."))
L += ["", "## Ders bazında", "",
      "İçerik: hiyerarşi ve kopya dışındaki en az bir bulgu. İşaretleme: altı çizili/vurgu sorunları. Görsel: figür sorunları.", "",
      "| Dosya | Soru | Konu yok | Alt konu yok | İçerik | İşaretleme | Görsel |", "|---|---:|---:|---:|---:|---:|---:|"]
for f, d in sorted(o["ders"].items()):
    e = icerik_ders.get(f, {"icerik": 0, "isaret": 0, "gorsel": 0})
    L.append(f"| {f.replace('.jsonl', '')} | {d['toplam']} | {d.get('hiy_konu_yok', 0)} | {d.get('hiy_altkonu_yok', 0)} | {e['icerik']} | {e['isaret']} | {e['gorsel']} |")
open(os.path.join(REPORTS, "Envanter.md"), "w", encoding="utf-8").write("\n".join(L) + "\n")
print("\n".join(L[-60:]))
