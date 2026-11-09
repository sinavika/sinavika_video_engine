# Kamp dersi değerlendirmesi: TYT Türkçe Paragraf, 9 Kasım 2026

- **Ne:** TYT Türkçe kampının 5. dersi Paragraf ([youtu.be/bzxcU27xQ00](https://youtu.be/bzxcU27xQ00), 39:24, 1 Kasım'da render edildi). İlk 6 dakika, saniyede 2 kareyle Google AI Studio'da Gemini 3.8 Flash'a izletildi (geçici sohbet, arama kapalı).
- **Neden bu ders:** kampın en çok gösterim alan dersi (6.969 gösterim). Tıklama oranı %0,3; izleyicilerin %42'si 24. saniyede, %18'i 71. saniyede kalıyor; ortalama izleme 1:53 (%4,8). Veri: [2026-11-08-Kamp-ve-Reels-Analizi.md](2026-11-08-Kamp-ve-Reels-Analizi.md).
- **İstek:** sahip, 9 Kasım: kamp videolarında da iyileştirme gerekiyor mu, ona göre senaryo ya da video altyapısı iyileştirilir.

## Gemini'nin gördüğü

| An | Ekranda ve seste | Sorun |
|---|---|---|
| 0:00–0:20 | Pembe zemin, sağda ses küresi. "Merhaba. Ben SinoAI. TYT Türkçe kampına hoş geldin." "Ders 5/15", ilerleme noktaları, "geçen derste…" | 20 saniye boyunca bilgi, soru ya da merak yok. Ekranda yalnız küre kıpırdıyor. |
| 0:20–0:44 | "Bu videoda" listesi (4 madde) | Liste 24 saniye hareketsiz duruyor; ses maddeleri takip etmiyor. Sonunda "Hazırsan başlayalım." |
| 0:46–0:56 | Pembe "Bölüm 1/12" başlık ekranı | İkinci kez açılış: öğrenci 1 dakikadır tek bir paragraf yöntemi görmedi. |
| 0:56– | "Giriş, gelişme, sonuç" şeması | İlkokuldan bilinen bilgiyle başlıyor; sınav tuzağı yok. |
| 1:22–1:51 | 4 maddelik kural listesi | Uzun. |
| 1:52, 2:50 | "Önce tahmin et" alıştırması, TYT tarzı soru | İyi kurgulanmış; ancak 2:15–2:49 arasında tablo okunurken ekran ~34 sn neredeyse hiç değişmiyor. Soru ekranında yazı solda, sağ yarı boş. 5 sn'lik sessiz sayaç akışı durduruyor. |
| Genel | Ses | Telaffuz net, vurgu mekanik; "buraya dikkat" enerjisi yok. |

- **Hata:** ilk 6 dakikada bilgi ya da soru hatası yok. Arı/bal sorusu ve Kutup ayısı metni doğru.
- **Gemini'nin önerdiği ve kullanılmayacak olanlar:** "40 sorunun 26'sı paragraf" doğrulanmamış bir sayı; başlıkta "2025" yanlış yıl. İkisi de alınmadı.

## Motorda zaten düzelenler (8 Kasım, bu render'dan sonra)

Paragraf 1 Kasım'da render edildi. Bulguların ilk ikisini 8 Kasım iyileştirmeleri karşılıyor, ancak **yayındaki 15 TYT Türkçe dersine uygulanmadı** (sahip, 8 Kasım: bu derslerle uğraşılmayacak):

1. "Merhaba, ben SinoAI" kalktı; karşılama "Hoş geldin" ve tek nefes ("geçen derste", "hazırsan başlayalım" yok).
2. Ders açılışla başlıyor (`lesson.opening`: soru, yaygın hata ya da görsel problem; tuzağı adlandıran ≤40 kelime, ≤25 kelimelik vaat). AYT, KPSS ve diğer bütün kamp senaryolarında yazılı; TYT Türkçe 15 dersinde yok.
3. Kapakta kanca satırı var (`cover.hook`); TYT Türkçe kapakları bundan önce çizildi.

## Henüz düzelmeyenler (öneri, sahibin kararıyla)

**Video altyapısı (CampLesson):**
- **"Bu videoda" listesi seslendikçe gelsin.** Maddeler söylendikçe tek tek belirsin; liste bir bütün olarak 8–10 sn'den uzun durmasın.
- **Aynı ekran en çok ~10 sn.** Tablo ya da soru okunurken her cümlede bir öğe vurgulansın ya da belirsin. Engine'e "10 sn'den uzun değişmeyen sahne" denetimi eklenebilir (validate uyarısı).
- **Bölüm başlığı açılışın hemen ardından gelmesin.** İlk bölümün başlık kartı açılış ve "Bu videoda"dan sonra ikinci bir açılış gibi duruyor; ilk bölümde başlık kartı atlanabilir ya da 2,4 sn ile sınırlanabilir.
- **Ekranın sağ yarısı boş kalmasın.** Soru ve tablo sahnelerinde sağ yarı ses küresine kalıyor; küre küçülsün, boşluğa "Tuzak" / "İpucu" kutusu ya da sorunun vurgulanan satırı gelsin.
- **Düşünme sayacı 5 sn → 3 sn** (`COURSE_DESIGN.questionThinkSeconds`); ekranda "Durdur ve dene" yazsın.

**Senaryo:**
- **İlk bölüm sınavla açılsın.** Tanım bölümü kısa tutulsun; öğrencinin zaten bildiği yapı bilgisi (giriş-gelişme-sonuç) tuzakla ya da soruyla bağlansın.
- **Uzun dersler bölünsün.** 39 dakikalık Paragraf gibi dersler 12–15 dakikalık iki ya da üç derse ayrılsın; bölüm damgaları (chapters) zaten var.
- **Seste vurgu.** Tuzak ve uyarı cümleleri kısa ve vurgulu yazılsın ("Dikkat: …").

**Başlık ve kapak:** tıklama oranı %0,3. Başlık şu an kurala göre hep A ("… Konu Anlatımı | Kamp Ders N"). Gemini'nin yönü: soru tipini ve tuzağı söyleyen başlık ("Paragrafta İki Şık Arasında Kalma | TYT Türkçe") ve kapakta tek, büyük tuzak cümlesi. Başlık kuralını değiştirmek sahibin kararı.

## Uygulananlar (9 Kasım 2026, sahip: "Evet, işle")

Genel kural olarak [`Courses/CourseNarration.md`](../Courses/CourseNarration.md) §2 ve §12'de:
- "Bu videoda" maddeleri söylendikçe geliyor.
- İlk bölümün başlığı söylenmiyor.
- Düşünme sayacı 3 sn, altında "Durdur ve dene".
- 10 sn'den uzun değişmeyen ekran `curriculum check` önerisi oldu. Şablonun zamanlamasıyla ölçülünce 442 senaryoda 3.007 yer çıktı (2.205 görsel adımı, 771 kart); düzeltmek bir yazma geçişi, otomatik vurgu yeterli olmadı ([`CourseNarration.md`](../Courses/CourseNarration.md) §12).

**Yapılmayan:** soru ekranının sağ yarısına "Tuzak / İpucu" kutusu. Soru verisinde bunun metni yok; her soruya tuzak cümlesi yazmak bir senaryo geçişi ister. Ses küresi sahibin seçtiği kimlik parçası olduğu için küçültülmedi. İkisi de sahibin kararı.

