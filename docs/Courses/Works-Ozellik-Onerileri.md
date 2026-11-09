# Works için yeni adım önerileri (TYT üretimi sırasında, 2-3 Kasım 2026)

**Kapsam:** 2 Kasım'da eklenen 12 özellik TYT'nin çoğunu karşılıyor. Bu belge, TYT'yi yazarken ve AYT ile KPSS'ye bakarken eksikliği hissedilen adımları toplar. Karar ve sıra sahibindir. İçerik motorda yazılır; API, web ve mobil işi "api+web+mobile" oturumundadır.

## Öncelikli öneriler

| Öneri | Öğrenci ne yapar | En çok yarayacağı dersler | Neden |
|---|---|---|---|
| **Çoklu boşluk** | Bir cümlede ya da formülde birden çok boşluğu doldurur | Kimya (denklem denkleştirme: katsayılar), Matematik (çözümleme), Türkçe (yazım, ek) | Bugün her boşluk ayrı adım. Denklem denkleştirme gibi işler tek adımda ve birlikte anlamlı |
| **Tablo doldurma** | Tablonun bazı hücrelerini yazar ya da seçer | Matematik (fonksiyon değer tablosu), Kimya (periyodik özellikler), Coğrafya (iklim tipleri), Fizik (birimler) | Motorda 822 tablo var; çoğu "boş hücreyi doldur" alıştırmasına hazır |
| **Şekilde etiketleme / noktaya dokunma** | Görselde bir parçaya ya da bölgeye dokunur, ya da parçalara ad yerleştirir | Biyoloji (hücre, nefron, kalp), Coğrafya ve Tarih (harita: il, bölge, akarsu, sefer yolu), Geometri (açı, kenar) | Motor görselleri zaten adlı parçalardan oluşuyor (`p1`, `t2`…). Etkileşim için parçanın kimliği yeter. 371 harita görseli var |
| **Sayısal cevapta birim** | Değeri yazar ve birimi seçer | Fizik, Kimya | TYT'de birim tuzağı çok (m/s ile km/h, g ile kg). Bugün birim ancak metinde sorulabiliyor |
| **Zaman çizelgesine yerleştirme** | Olayları çizelgede doğru yere koyar | Tarih, Felsefe, Edebiyat (dönemler) | Sıralama (Order) yalnız sırayı soruyor; aradaki mesafeyi ve dönemi öğretmiyor. 209 zaman çizelgesi görseli var |

## İkinci sırada

| Öneri | Öğrenci ne yapar | Ders |
|---|---|---|
| **Hatalı sözcüğü düzelt** | Dokunarak seçme ile boşluğun birleşimi: metindeki yanlış yazılmış sözcüğe dokunur, doğrusunu yazar | Türkçe yazım ve noktalama, anlatım bozukluğu |
| **Grafik üzerinde işaretleme** | Eğrinin bir noktasına ya da aralığına dokunur ("hız hangi aralıkta sabit?") | Fizik (hareket grafikleri), Matematik (fonksiyon), Kimya (tepkime hızı) |
| **Kaydırıcıyla tahmin** | Bir değeri kaydırarak tahmin eder, sonra doğruyla karşılaştırır | Fizik, Matematik (oran, yüzde). Motorun `plot.parameters` alanı buna uygun |
| **Akıl yürütme zinciri** | Öncülleri ve sonucu yerine koyar | Felsefe, Mantık (AYT). Bugün gruplara ayırma ile yaklaşık yapılıyor |

## TYT yazarken içerikle çözülenler

Bunlar yeni adım gerektirmedi:
- **Paragrafta düşüncenin akışını bozan cümle:** dokunarak seçme, cümle kipi.
- **Cümle sıralama:** flow görseli, uygulamada sıralama adımı olur.
- **Öncüllü sorular:** çoklu seçim.
