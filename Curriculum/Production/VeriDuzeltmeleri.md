# Veri düzeltmeleri (bekleyen)

Ders hazırlarken ya da kaynak işlerken eğitim verilerinde bulunan hatalar burada birikir; sonra toplu düzeltilir. Bulunan her yeni hata bu tabloya eklenir. Düzeltilen satır "Yapıldı" bölümüne taşınır.

Veri: `Desktop/EgitimVerileri` (asıl) → `Curriculum/Data` (motor kopyası, `robocopy /MIR` + `npm run curriculum -- import`). Düzeltme asıl veride yapılır, sonra kopya yenilenir.

## Bekleyenler

| # | Bulunduğu tarih | Yer | Sorun | Önerilen düzeltme | Etkisi |
|---|---|---|---|---|---|
| 1 | 27 Eki 2026 | `YKS/TYT/KonuAnlatimi/TRK/CUMLEDE_ANLAM.json`, yeni baskı s. 19, "İçerik Cümleleri" | Bölüm `CUMLEDE_ANLAM_02` (Kesin Yargı) alt konusuna bağlanmış | `CUMLEDE_ANLAM_24` (İçerik-Üslup) alt konusuna bağla | Ders 4'e yok (senaryo elle yazıldı); veriyi kullanan üretimler yanlış alt konuyu görür |
| 2 | 27 Eki 2026 | Aynı dosya, eski baskı s. 31, "KRİTİK BİLGİ" örnek paragrafı ("Hiç üzülmez miydim?…") | `CUMLEDE_ANLAM_01` (Cümlenin İletisi) alt konusuna bağlanmış; metin öznel/duygusal anlatım örneği | Kontrol et; büyük olasılıkla `CUMLEDE_ANLAM_05` (Öznel-Nesnel) | Küçük |
| 3 | 27 Eki 2026 | Aynı dosya, birkaç bölüm başlığı | Başlıklar birleşik ya da kesik ayrıştırılmış ("Örnek: — ANLAM İLİŞKİLERİNE GÖRE CÜMLELER Neden-So…"); bir bölümün metni önceki bölümün örneğiyle başlıyor (Osmancık, Küçük Ağa) | Ayrıştırıcıda başlık ve örnek sınırını düzelt (`sinavika_parse`) | Küçük; senaryo yazarken okunurken dikkat ister |
| 4 | 26 Eki 2026 | OGM YKS Kampı TYT Kitabı (`yks_tyt_sr_karma_ogm-yks-kamp-tyt-kitabi.pdf`) | Cevap anahtarı okunamadı (karışık ızgara biçimi): 1.107 sorudan yalnız 57'sinin cevabı var | `keys.py` için bu ızgara biçimine okuyucu ekle, yeniden çalıştır | Bu kitabın soruları havuzda cevapsız |
| 5 | 27 Eki 2026 | `YKS/TYT/Sorular/TRK/CUMLEDE_ANLAM.jsonl` | `CUMLEDE_ANLAM_19` (Uyarı) için ne anlatım ne soru var; `CUMLEDE_ANLAM_21` (Pişmanlık) için soru yok | Soru eşleştirmesini bu iki alt konu için yeniden dene; yoksa kaynak eksikliği olarak kalır | Ders 4'te genel dil bilgisiyle anlatıldı |
| 6 | 27 Eki 2026 | `YKS/TYT/KonuAnlatimi/TRK/PARAGRAF.json` | Yanlış alt konuya bağlı bölümler: "Örneklendirme" → `_02` (olmalı `_25`); "Her bilimsel araştırma…" örneği → `_04` (yardımcı düşünce örneği, `_05`); "Paragraf Düzenleme" → bağsız (olmalı `_18`); giriş cümlesi, bağlayıcı ve kronoloji maddeleri → `_30` (paragraf oluşturma, `_17`); "Kinaye-Tariz-Benzetme" → `_28` (kinaye ve tariz söz sanatı, düşünceyi geliştirme yolu değil); Bedri Rahmi örneği eski baskıda `_22` (betimleme), yeni baskıda açıklayıcı anlatım altında | Bölümleri doğru alt konulara bağla; Bedri Rahmi örneğini kontrol et | Ders 5'e yok (senaryo elle yazıldı) |
| 7 | 27 Eki 2026 | Aynı dosya | Birleşik başlıklar: "Benzetme — ANLATIMIN ÖZELLİKLERİ" (`_28` + `_29`), "Özgünlük/Özlülük — PARAGRAFTA KONU" (`_29` + `_06`), "Saptama Cümleleri — Dilek / İstek Cümleleri — Öyküleyici Anlatım" (ilk ikisi Cümlede Anlam konusu) | Ayrıştırıcıda başlık sınırlarını düzelt (`sinavika_parse`), sonra yeniden eşle | Küçük |
| 8 | 27 Eki 2026 | `YKS/TYT/Sorular/TRK/PARAGRAF.jsonl` | Alt konu eşlemesi gürültülü: 861 soru `_30`'da (çıkarım) yığılmış; ÖSYM "iki paragrafa ayrılmak istense" sorusu `_03`'te (olmalı `_16`); Yaşar Kemal'in sözleri sorusu `_25`'te (tanık gösterme, `_26`); Edison sözü `_24`'te; "değinilmemiştir" sorusu `_19`'da. `_11`, `_20`, `_26`, `_27`, `_28` için yalnız 1'er soru var. İlk kayıt felsefe soru bankasından (eşleme "claude-unsure", alternatif FEL) | Soru kökü kalıbına göre kural tabanlı yeniden eşleme (kök → alt konu); başka dersten gelen soruları ayıkla | Havuzdan soru seçen üretimler yanlış alt konu görür |

| 9 | 27 Eki 2026 | `YKS/{TYT,AYT,YDT}/Sorular`, ÖSYM çıkmış sorular (MEB derlemesi) | `source.year` boş: TYT 149, AYT 278, YDT 9 soru | Yılı MEB derlemesindeki soru kutusundan oku (`ogm` verisi) | Soru dağılımında yıl başına sayılar eksik çıkıyor ([KapsamDenetimi.md](KapsamDenetimi.md) D2) |
| 10 | 27 Eki 2026 | `YKS/AYT/Sorular/MAT` | MEB başlığı "İkinci Dereceden Denklemler, Karmaşık Sayılar…" olan 16 soru `MAT_IKINCI_DER`/eşitsizliklere kodlu; Karmaşık Sayılar konusu 0 görünüyor. "Dönüşümler" başlıklı 8 soru katalogda konusu olmadığı için Fonksiyon/Türev/Trigonometri'ye dağılmış | Karmaşık sayı sorularını `MAT_KARMASIK`'a taşı; Dönüşüm sorularını yeni `MAT_DONUSUM` konusuna eşle (27 Eki'de eklendi, [DersListesiEklemeleri.md](DersListesiEklemeleri.md)). KPSS sayısal mantık soruları da yeni `SAYISAL_MANTIK` konusuna, 1945 sonrası tarih soruları `TAR_CAGDAS_TURK_DUNYA`'ya | AYT dağılımında Karmaşık Sayılar ve Dönüşümler yanlış görünüyor |
| 11 | 27 Eki 2026 | `YKS/TYT/Sorular/GEO` | "Dik Üçgen ve Trigonometri" başlıklı 11 ÖSYM sorusu Pisagor (`GEO_OZEL_UCGEN_09`) ve başka alt başlıklara kodlu; trigonometrik oran alt başlığı yok | Yeni alt başlık `GEO_OZEL_UCGEN_10`'a (27 Eki'de eklendi) yeniden eşle | Küçük |

## Yapıldı

(henüz yok)
