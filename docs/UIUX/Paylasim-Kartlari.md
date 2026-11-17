# Paylaşım kartları: tasarım tanımı

**Tarih:** 15 Kasım 2026
**Kime:** api, web ve mobil ekipleri
**Kimden:** UI/UX (içerik motoru yalnız tasarımı çizer)

Öğrenci bir sonucunu uygulamadan sosyal medyada paylaşır. Kart öğrencinin kendi verisiyle çizilir:
- mobilde React Native görünümü PNG olarak kaydedilir;
- web'de aynı tasarım `next/og` (Satori) ile çizilir.

**Örnek PNG'ler** (sahte veri):
- `Desktop\Sinavika-UIUX3\acik\paylasim\` ve `koyu\paylasim\` (10'ar dosya);
- pano: `panolar\49-paylasim-paylasim-kartlari.png`.

**Çizim kaynağı:** `sinavika_video_engine/src/UIUX/Screens/Share/ShareCards.tsx`. Sayılar `SHARE` sabitinde.

**Revizyon (15 Kasım 2026, sahibin dört notu):**
1. Hikâyede ana panelin alt yarısı boş kalıyordu; artık anlamlı bir görselle doluyor (§3a).
2. Deneme kartında en iyi ders ölçü kartında sıkışıyordu; ana panelde ayrı bir satıra taşındı.
3. Seri hikâyesinde basamaklar büyüdü; altına "son 7 gün" satırı eklendi.
4. Soru kartının hikâyesinde soru kutusu paneli dolduruyor; soru metni 46 px, şıklar iki sütunda 42 px.

Gönderiler aynı kaldı; yalnız boşluklar alt kenar payına (72 px) sığacak kadar sıkılaştırıldı.

## 1. Türler ve biçimler

| Kimlik (hikâye / gönderi) | Tür | Modül rengi |
|---|---|---|
| `p-deneme-hikaye` / `p-deneme-gonderi` | Deneme sonucu | Denemeler |
| `p-seri-hikaye` / `p-seri-gonderi` | Seri rozeti (3 · 7 · 14 · 30 gün) | Marka (turuncu) |
| `p-konu-hikaye` / `p-konu-gonderi` | Konu bitirme | Dersler |
| `p-hafta-hikaye` / `p-hafta-gonderi` | Haftalık özet | Ders Planı |
| `p-soru-hikaye` / `p-soru-gonderi` | Bu soruyu çözdüm | Testler |

**Biçimler:**
- Hikâye: 1080 × 1920 px.
- Gönderi: 1080 × 1080 px.
- Çıktı: PNG, sRGB, saydamlık yok.

## 2. Izgara ve boşluklar (px, 1080 genişlikte)

| Ölçü | Hikâye | Gönderi |
|---|---|---|
| Yan kenar payı | 72 | 72 |
| Üst / alt kenar payı | 250 (Instagram arayüzü bu bölgeyi kaplar; içerik girmez) | 72 |
| Bloklar arası | 32 | 22 |
| Ana panel köşesi | 48 | 48 |
| Ana panel iç boşluğu | 64 | 44 |
| Ölçü kartı köşesi / iç boşluk | 32 / 28 | 32 / 18 × 24 |
| Ölçü kartları arası | 24 | 24 |

**Dikey düzen** (yukarıdan aşağı, tek sütun, flex):
1. **Üst satır**, 72 yüksek:
   - solda logo (yükseklik 56);
   - sağda modül çipi (72 yüksek, simge dairesi 44, metin 32).
2. **Ana panel**: kalan yüksekliği doldurur (`flex: 1`), içerik dikeyde ortalı.
   - üst yazı (kicker), 36, büyük harf, aralık %6;
   - başlık, hikâyede 64, gönderide 52;
   - büyük sayı, hikâyede 168, gönderide 136; birimi 64 / 52;
   - yardımcı satırlar.
3. **Ölçü kartları**: tek satır. Hikâyede en çok 4, gönderide en çok 3.
   - simge 40;
   - değer hikâyede 56, gönderide 48 (7 karakteri geçerse 44, satır kırılmaz);
   - etiket 32.
4. **Alt satır**: solda `sinavika.com` (32), sağda mağaza rozetleri (yükseklik 64).

Gönderi biçiminde bileşenler aynıdır; ölçü kartlarından ilk üçü gösterilir.

**Hiçbir içerik güvenli alana taşmaz:** hikâyede 250–1670 px, gönderide 72–1008 px. Gerçek veri uzun gelirse (uzun konu adı, çok basamaklı sayı) önce yazı küçülür (en küçük 32 px), sonra satır kırılır. Görsel kısalabilir; alt satır hiçbir zaman güvenli alana girmez.

### 3a. Hikâyede panelin görseli

| Kart | Görsel | Ölçü |
|---|---|---|
| Deneme sonucu | Son 5 denemenin net sütunları (D1…D5). Geçmiş denemeler `rgba(255,255,255,0.4)`, bugünkü beyaz; değer sütunun üstünde, etiket altında (32 px). En düşük deneme %30, en yüksek tam boy, arası doğrusal: fark okunur. Altında "En iyi ders: Türkçe · 31,25 net" hapı | Sütun alanı 136 px, sütunlar arası 18, köşe 18 |
| Seri rozeti | "ROZET BASAMAKLARI": 3 · 7 · 14 · 30 gün. Ulaşılan beyaz, tik ve turuncu yazı; ulaşılmamış yarı saydam ve kesikli çerçeve. Altında "SON 7 GÜN": bugünden geriye 7 gün, etiketler o günden (paylaşım cumartesi yapıldıysa Pa…Ct); çalışılan gün beyaz ve tikli | Basamak 128 px (yazı 40, tik 44); gün 96 px (yazı 34, tik 30); aralar 16 |
| Konu bitirme | "BÖLÜMLER · 5 / 5": her bölüm bir sayaç, biten beyaz ve tikli | Sayaç 170 px (yazı 40, tik 44) |
| Haftalık özet | Günlük dakika sütunları; en çok çalışılan gün beyaz | Sütun alanı 260 px |
| Bu soruyu çözdüm | Beyaz soru kutusu panelin kalanını doldurur: soru 46 px (satır 1.35), şıklar iki sütunda 42 px (kutu iç boşluğu 26 × 32, köşe 26), altında not 32 px | Kutu iç boşluğu 56 |

**Uzun soru (Bu soruyu çözdüm):**
- Paylaşılabilir sınır: soru metni en çok 240, şık en çok 40 karakter.
- Metin uzunsa önce yazı küçülür (en küçük 32 px), sonra şıklar iki sütun yerine tek sütuna dizilir.
- Sınırı aşan soru paylaşılmaz; paylaş düğmesi görünmez.

Web çizicisi `/api/share-card` bu tanımla birebir (api+web+mobile oturumu, 15 Kasım 2026).

Gönderide bu görseller yoktur (alan yetmez). Deneme gönderisinde en iyi ders gösterilmez, seri gönderisinde basamaklar tek satır haptır (76 px).

## 3. Yazı

- Yalnız Manrope; kalınlık 600–800. Satori'ye font dosyası gömülür (Manrope 600, 700, 800).
- **En küçük yazı 32 px.** Telefonda 12 pt'ye denk.
- Satır yüksekliği 1.15; soru metninde 1.35.
- Sayı biçimi dile göre: TR `78,5`, EN `78.5`.

## 4. Renk jetonları

| Jeton | Açık | Koyu |
|---|---|---|
| Zemin (`bg`) | `#F7F7F8` | `#0F1115` |
| Kart (`card`) | `#FFFFFF` | `#17191E` |
| Kenar (`line`, 3 px) | `#E7EAEE` | `#2A2E37` |
| Yazı (`ink`) | `#0B1C30` | `#F4F4F5` |
| Soluk yazı (`muted`) | `#5F6B7D` | `#A1A1AA` |
| Mağaza rozeti zemini / yazısı | `#0B1C30` / `#FFFFFF` | `#FFFFFF` / `#0B1C30` |

**Ana panel:** modülün düğme rengi (`moduleAction`). Beyaz yazıyla en az 4,5:1; iki temada aynı.

| Kart | Ana panel |
|---|---|
| Deneme sonucu (Denemeler) | `moduleAction('exam')` |
| Konu bitirme (Dersler) | `moduleAction('lessons')` |
| Haftalık özet (Ders Planı) | `moduleAction('studyPlan')` |
| Bu soruyu çözdüm (Testler) | `moduleAction('tests')` |
| Seri rozeti (marka yüzeyi) | `#C2410C` |

Kesin hex değerleri `src/UIUX/ModuleIdentity.ts`'teki `moduleAction` ile hesaplanır. Web ve mobil aynı fonksiyonu ya da çıkardığı sabit tabloyu kullanır, elle hex yazmaz.

- Panel içi yazı beyaz; ikincil satırlar `rgba(255,255,255,0.85)`; hap zemini `rgba(255,255,255,0.18)`.
- Ölçü kartlarındaki simge panelin rengindedir.
- **Turuncu yalnız iki yerde:** Denemeler modülünde ve seri kartında (marka yüzeyi). Logo her zaman turuncu (açık) ya da beyaz (koyu).

## 5. Logo ve alt satır

**Logo** yalnız `Desktop\Sinavika-Logo\png\` dosyalarından gelir:
- açık temada `sinavika-logo-yatay-turuncu-1000.png`;
- koyu temada `sinavika-logo-yatay-beyaz-1000.png`.
- Yükseklik 56 px, sol üstte.
- Çizimdeki maske yalnız önizleme içindir.

**Alt satır:**
- `sinavika.com` ve iki mağaza rozeti (App Store, Google Play).
- Rozet metni "App Store" ve "Google Play"; "indir" yazılmaz.
- Resmî rozet görselleri kullanılacaksa tek kaynaktan alınır (Sosyal-Kimlik-Standardi §3).

## 6. İçerik kuralları

- **Kişisel veri yok.** Ad soyad ve e-posta karta yazılmaz.
  - İleride isteğe bağlı ad eklenirse kicker satırına gelir ve öğrenci açıkça seçer.
- **Deneme sonucu:** net ve geçen denemeye göre fark gösterilir.
  - Puan türü yalnız etiket olur ("TYT"); sayısal puan ya da sıralama tahmini yoktur.
  - Kartta "Deneme neti; ÖSYM puanı değildir." satırı durur.
- **Doğru / yanlış / boş renkle değil simge ve sözcükle ayrılır:** tik "doğru", çarpı "yanlış", çizgi "boş".
- **Seri basamakları:**
  - ulaşılan: beyaz zemin, tik;
  - ulaşılmamış: kesikli çerçeve.
  - Fark yalnız renkte değil.
- **Bu soruyu çözdüm:** soru metni ya da görseli ve şıklar görünür; cevap ve çözüm görünmez. "Cevap ve çözüm kartta yok; sen de dene." satırı durur.
  - Soru görseli varsa beyaz kutunun içine en-boy oranı korunarak konur.
- **Marka dili:**
  - Türkçede "test" yazılır, "quiz" yazılmaz.
  - Asistanın adı SinoAI.
  - "İndir" yok; başarı iddiası ya da tahmin vaadi yok.
- Haftalık özette en çok çalışılan gün sütunu beyazdır, diğerleri yarı saydam. Sütunun altında gün adı yazar.

## 7. Satori ve React Native için

- Yalnız flex düzeni.
- Gölge, `filter`, bulanıklık, maske ve karmaşık SVG yok. Simgeler basit çizgi SVG ya da PNG.
- Kesikli çerçeve (`border-style: dashed`) Satori'de çalışır; çalışmazsa düz 3 px çerçeve kullanılır.
- Görsel boyutu sabit: 1080 × 1920 ve 1080 × 1080. Telefonda görünüm bu boyutta ekran dışında çizilip kaydedilir.
- Sahte veri yerine gelecek alanlar. Ek API alanı gerekmedi: son netler sonuç kartlarından, gün dizisi ve bölüm sayısı mevcut verilerden gelir.

| Kart | Alanlar |
|---|---|
| Deneme sonucu | deneme adı, net, önceki denemeye fark, doğru / yanlış / boş, en iyi ders ve neti, son 5 denemenin adı ve neti |
| Seri | gün sayısı, son 7 günün süresi ve soru sayısı, son 7 günün çalışılan günleri, sıradaki basamak |
| Konu bitirme | ders, konu, bölüm sayısı ve bitenler, adım sayısı, ilk denemede doğru oranı, toplam süre |
| Haftalık özet | tarih aralığı, toplam süre, günlük dakikalar, çözülen soru, deneme sayısı, seri |
| Bu soruyu çözdüm | ders, konu, soru metni ya da görseli, şıklar, süre, seviye |
