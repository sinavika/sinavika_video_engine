# TYT kaynak durumu: lesson sub listesi ile kaynaklarımız

**Güncelleme 26 Ekim 2026 (gece).** OGM Materyal'den eklenenler:
- MEBİ konu özetleri: TYT Temel Matematik, TYT Din, AYT Din, TYT Türkçe ve AYT Edebiyat'ın yeni baskıları.
- YKS Kampı testleri: yaklaşık 4.000 soru.

Bunlar eşleştirildi. Ayrıca bütün YKS konu özetlerinde "konu dışı" denen bölümlere ikinci bakış yapıldı: 437'si başlık adından, 739'u yeniden sorularak konusuna bağlandı. Eski baskılar ayrı kaynak olarak kaldı.

**Ölçüm** (`Curriculum/Data/YKS/TYT`, `lesson.csv` ile):
- **Anlatım:** konuya bağlı konu anlatımı metni (bin karakter).
- **Kaynak kitap:** o konuya bölüm veren kitap sayısı.
- **Alt başlık:** anlatımın bağlandığı alt başlık / toplam.
- **Soru, ÖSYM:** havuzdaki soru sayısı.
- **Sorusuz alt başlık:** havuzda hiç sorusu olmayan alt başlık.

**Kural:** TYT dersleri yalnız TYT kaynaklarıyla yazılır; KPSS kaynakları ana kaynak yapılmaz.

## Özet

| Ders | Konu | Anlatımı yok | İnce (<2k) | Önceki durum (26 Ekim öğlen) |
|---|---|---|---|---|
| Türkçe | 15 | 0 | 1 | 1 yok, 3 ince |
| Tarih | 22 | 0 | 1 | 1 yok, 2 ince |
| Coğrafya | 19 | 0 | 2 | 3 ince |
| Felsefe | 13 | 0 | 2 | 2 ince |
| Din Kültürü ve Ahlak Bilgisi | 22 | 2 | 6 | **22 yok** |
| Matematik | 23 | 0 | 3 | **23 yok** |
| Geometri | 23 | 7 | 13 | **23 yok** |
| Fizik | 11 | 0 | 0 | 3 ince |
| Kimya | 10 | 0 | 0 | 1 ince |
| Biyoloji | 10 | 0 | 0 | 0 |

## Kalan boşluklar

- **Sayısal derslerde (Matematik, Geometri) az anlatım metni normaldir** (sahip, 27 Ekim):
  - Anlatım formül, tanım, şekil ve çözümlü örnektir. Şekil ve formül metne az ve bozuk geçtiği için karakter sayısı kapsamı göstermez.
  - Bu derslerde ölçü soru havuzudur. Videolar tanım, kural ve formülden sonra çözümlü sorularla kurulur; şekilleri motor çizer.
  - Gerçek boşluk yalnız sorusu da az olan konulardır: Çember ve Daire (10 soru), Analitik Geometri (16 soru).
- **Geometri en zayıf ders.**
  - MEB'in TYT Matematik konu özeti geometriyi kısa geçiyor.
  - 7 konunun anlatımı yok: Açılar ve Üçgenler, Ek Çizimler, Üçgende Merkezler, Deltoid, Grafik Okuma, Çember ve Daire, Analitik Geometri.
  - 13 konuda anlatım ince.
  - Soru havuzu ilk konularda güçlü. Çember ve Daire ile Analitik Geometri'de soru da az.
- **Din Kültürü:** artık 20 konunun anlatımı var.
  - Yok: Kur'an-ı Kerim'de Gençler, Din ve Ekonomi.
  - 10. sınıf konularında hem anlatım hem soru az.
- **Diğer ince konular:**
  - Türkçe: Söz Yorumu, artık iki baskıdan 1k.
  - Tarih: İnsanlığın İlk Dönemleri.
  - Coğrafya: Jeolojik Zamanlar, Türkiye'de Nüfus.
  - Felsefe: 2.–15. yy ve 15.–17. yy.
  - Matematik: Sayı Basamakları, İşlem, Modüler Aritmetik.
- **YKS Kampı TYT Kitabı:** 1.107 soru konulara bağlandı, ama cevapları okunamadı.
  - Kitabın anahtarı iki dersi yan yana koyan karışık bir ızgara.
  - Yalnız 57 sorunun cevabı var.
  - Ders ders kamp testlerinin anahtarları tam okundu.

## Ders ders tablo

### Türkçe

| Konu | Anlatım | Kaynak kitap | Alt başlık | Soru | ÖSYM | Sorusuz alt başlık |
|---|---|---|---|---|---|---|
| Sözcükte Anlam | 7k | 2 | 10/13 | 437 | 22 | 3 |
| Söz Yorumu | 1k | 2 | 3/7 | 98 | 9 | 1 |
| Deyim ve Atasözü | 3k | 2 | 2/7 | 36 | 3 | 0 |
| Cümlede Anlam | 8k | 2 | 17/26 | 518 | 27 | 2 |
| Paragraf | 20k | 2 | 22/30 | 2569 | 224 | 2 |
| Ses Bilgisi | 5k | 2 | 12/14 | 399 | 4 | 1 |
| Tamlamalar ve Sözcük Grupları | 3k | 2 | 4/11 | 126 | 2 | 5 |
| Yazım Kuralları | 13k | 2 | 7/13 | 537 | 18 | 1 |
| Noktalama İşaretleri | 9k | 2 | 14/15 | 525 | 18 | 2 |
| Sözcükte Yapı | 5k | 2 | 8/10 | 399 | 4 | 0 |
| Sözcük Türleri | 21k | 2 | 20/23 | 1440 | 8 | 0 |
| Fiiller | 20k | 2 | 18/23 | 712 | 5 | 2 |
| Cümlenin Ögeleri | 10k | 2 | 8/11 | 325 | 12 | 1 |
| Cümle Türleri | 2k | 2 | 7/14 | 290 | 1 | 1 |
| Anlatım Bozukluğu | 13k | 2 | 13/15 | 273 | 1 | 0 |

### Tarih

| Konu | Anlatım | Kaynak kitap | Alt başlık | Soru | ÖSYM | Sorusuz alt başlık |
|---|---|---|---|---|---|---|
| Tarih ve Zaman | 5k | 1 | 4/6 | 192 | 0 | 0 |
| İnsanlığın İlk Dönemleri | <1k | 1 | 0/9 | 127 | 0 | 2 |
| İlk ve Orta Çağlarda Türk Dünyası | 16k | 1 | 9/10 | 260 | 9 | 0 |
| İslam Medeniyetinin Doğuşu ve İlk İslam Devletleri | 8k | 1 | 7/7 | 233 | 0 | 0 |
| Türklerin İslamiyet'i Kabulü ve İlk Türk İslam Devletleri | 15k | 1 | 5/8 | 235 | 7 | 0 |
| Orta Çağ'da Dünya | 3k | 1 | 4/7 | 29 | 0 | 1 |
| Yerleşme ve Devletleşme Sürecinde Selçuklu Türkiyesi | 11k | 1 | 5/6 | 85 | 2 | 0 |
| Beylikten Devlete Osmanlı Siyaseti | 8k | 1 | 6/9 | 118 | 2 | 0 |
| Devletleşme Sürecinde Savaşçılar ve Askerler | 4k | 1 | 5/6 | 86 | 0 | 0 |
| Beylikten Devlete Osmanlı Medeniyeti | 9k | 1 | 4/7 | 80 | 0 | 0 |
| Dünya Gücü Osmanlı | 12k | 1 | 7/8 | 83 | 0 | 1 |
| Sultan ve Osmanlı Merkez Teşkilatı | 6k | 1 | 4/5 | 116 | 2 | 0 |
| Klasik Çağda Osmanlı Toplum Düzeni | 6k | 1 | 4/6 | 139 | 1 | 0 |
| Değişen Dünya Dengeleri Karşısında Osmanlı Siyaseti | 13k | 1 | 4/6 | 74 | 1 | 0 |
| Değişim Çağında Avrupa ve Osmanlı | 8k | 1 | 6/7 | 96 | 0 | 0 |
| Uluslararası İlişkilerde Denge Stratejisi (1774-1914) | 16k | 1 | 7/8 | 149 | 0 | 0 |
| Devrimler Çağında Değişen Devlet-Toplum İlişkileri | 13k | 1 | 7/7 | 86 | 2 | 0 |
| Sermaye ve Emek | 4k | 1 | 2/6 | 83 | 1 | 0 |
| XIX. ve XX. Yüzyılda Değişen Gündelik Hayat | 2k | 1 | 3/5 | 52 | 0 | 0 |
| XX. Yüzyıl Başlarında Osmanlı Devleti ve Dünya | 13k | 1 | 5/7 | 109 | 2 | 0 |
| Milli Mücadele | 33k | 1 | 11/12 | 159 | 13 | 0 |
| Atatürkçülük ve Türk İnkılabı | 13k | 1 | 8/10 | 175 | 3 | 0 |

### Coğrafya

| Konu | Anlatım | Kaynak kitap | Alt başlık | Soru | ÖSYM | Sorusuz alt başlık |
|---|---|---|---|---|---|---|
| Doğa ve İnsan | 8k | 1 | 4/5 | 296 | 2 | 0 |
| Dünya'nın Şekli ve Hareketleri | 14k | 1 | 7/7 | 258 | 2 | 0 |
| Coğrafi Konum | 6k | 1 | 5/6 | 179 | 0 | 0 |
| Harita Bilgisi | 9k | 1 | 7/7 | 228 | 1 | 0 |
| İklim Bilgisi | 29k | 1 | 7/8 | 444 | 6 | 0 |
| Dünya'nın Tektonik Oluşumu | 3k | 1 | 3/6 | 73 | 2 | 0 |
| Jeolojik Zamanlar | 1k | 1 | 3/6 | 20 | 0 | 1 |
| İç Kuvvetler / Dış Kuvvetler | 23k | 1 | 9/10 | 149 | 2 | 0 |
| Kayaçlar | 3k | 1 | 2/5 | 26 | 0 | 0 |
| Türkiye'nin Yer Şekilleri | 6k | 1 | 4/6 | 90 | 0 | 0 |
| Su – Toprak ve Bitkiler | 31k | 1 | 7/7 | 251 | 4 | 0 |
| Nüfus | 27k | 1 | 6/6 | 160 | 4 | 0 |
| Türkiye'de Nüfus | 1k | 1 | 1/5 | 49 | 1 | 1 |
| Göç | 10k | 1 | 5/6 | 112 | 0 | 0 |
| Ekonomik Faaliyetler | 7k | 1 | 6/7 | 88 | 1 | 0 |
| Bölgeler | 5k | 1 | 4/5 | 126 | 5 | 0 |
| Uluslararası Ulaşım Hatları | 6k | 1 | 4/6 | 83 | 0 | 0 |
| Çevre ve Toplum | 5k | 1 | 3/5 | 103 | 0 | 0 |
| Doğal Afetler | 16k | 1 | 9/9 | 196 | 6 | 0 |

### Felsefe

| Konu | Anlatım | Kaynak kitap | Alt başlık | Soru | ÖSYM | Sorusuz alt başlık |
|---|---|---|---|---|---|---|
| Felsefe'nin Konusu | 14k | 1 | 5/5 | 414 | 11 | 0 |
| Bilgi Felsefesi | 44k | 1 | 10/10 | 435 | 9 | 0 |
| Varlık Felsefesi | 23k | 1 | 8/8 | 291 | 4 | 0 |
| Ahlak Felsefesi | 31k | 1 | 8/8 | 338 | 6 | 0 |
| Sanat Felsefesi | 9k | 1 | 6/6 | 218 | 4 | 1 |
| Din Felsefesi | 11k | 1 | 6/8 | 131 | 4 | 0 |
| Siyaset Felsefesi | 27k | 1 | 6/6 | 182 | 2 | 0 |
| Bilim Felsefesi | 12k | 1 | 7/12 | 227 | 5 | 2 |
| İlk Çağ Felsefesi | 11k | 1 | 2/6 | 183 | 7 | 0 |
| 2. Yüzyıl ve 15. Yüzyıl Felsefeleri | <1k | 1 | 1/6 | 158 | 5 | 0 |
| 15. Yüzyıl ve 17. Yüzyıl Felsefeleri | 1k | 1 | 1/6 | 121 | 4 | 0 |
| 18. Yüzyıl ve 19. Yüzyıl Felsefeleri | 6k | 1 | 3/6 | 112 | 9 | 0 |
| 20. Yüzyıl Felsefesi | 3k | 1 | 2/6 | 163 | 7 | 0 |

### Din Kültürü ve Ahlak Bilgisi

| Konu | Anlatım | Kaynak kitap | Alt başlık | Soru | ÖSYM | Sorusuz alt başlık |
|---|---|---|---|---|---|---|
| Bilgi ve İnanç | 7k | 1 | 4/4 | 120 | 4 | 0 |
| Din ve İslam | 4k | 1 | 3/4 | 103 | 3 | 0 |
| İslam ve İbadet | 11k | 1 | 3/4 | 121 | 3 | 0 |
| Gençlik ve Değerler | 4k | 1 | 2/4 | 92 | 2 | 0 |
| İslam Medeniyeti ve Özellikleri | 14k | 1 | 4/4 | 104 | 2 | 0 |
| Allah İnancı ve İnsan | 1k | 1 | 1/4 | 24 | 2 | 1 |
| Allah'ın Varlığı ve Birliği | 6k | 1 | 3/5 | 23 | 3 | 0 |
| Allah'ın İsim ve Sıfatları | 16k | 1 | 10/20 | 27 | 4 | 11 |
| Kur'an-ı Kerim'de İnsan ve Özellikleri | 2k | 1 | 2/6 | 18 | 1 | 2 |
| İnsanın Allah İle İrtibatı | 4k | 1 | 3/6 | 7 | 1 | 4 |
| Kur'an-ı Kerim'de Gençler | **yok** | 0 | 0/6 | 2 | 0 | 5 |
| Bir Genç Olarak Hz. Muhammed | <1k | 1 | 0/6 | 7 | 3 | 3 |
| Hz. Muhammed ve Gençler | 5k | 1 | 3/6 | 11 | 4 | 2 |
| Bazı Genç Sahabiler | 1k | 1 | 1/6 | 3 | 0 | 4 |
| Din ve Aile | 3k | 1 | 2/6 | 8 | 1 | 4 |
| Din, Kültür ve Sanat | 4k | 1 | 0/6 | 9 | 2 | 3 |
| Din ve Çevre | 1k | 1 | 0/6 | 2 | 0 | 4 |
| Din ve Sosyal Değişim | 1k | 1 | 0/6 | 1 | 1 | 5 |
| Din ve Ekonomi | **yok** | 0 | 0/6 | 0 | 0 | 6 |
| Din ve Sosyal Adalet | 1k | 1 | 1/6 | 2 | 1 | 4 |
| Ahlaki Tutum ve Davranışlar | 19k | 1 | 2/6 | 27 | 5 | 0 |
| İslam Düşüncesinde İtikadi, Siyasi ve Fıkhi Yorumlar | 6k | 1 | 2/6 | 7 | 0 | 3 |

### Matematik

| Konu | Anlatım | Kaynak kitap | Alt başlık | Soru | ÖSYM | Sorusuz alt başlık |
|---|---|---|---|---|---|---|
| Temel Kavramlar | 5k | 1 | 8/9 | 256 | 15 | 0 |
| Sayı Basamakları | 1k | 1 | 2/6 | 204 | 14 | 0 |
| Bölme ve Bölünebilme | 5k | 1 | 3/5 | 226 | 9 | 0 |
| EBOB – EKOK | 5k | 1 | 6/8 | 206 | 2 | 0 |
| Rasyonel Sayılar | 4k | 1 | 3/6 | 147 | 8 | 0 |
| Basit Eşitsizlikler | 5k | 1 | 5/5 | 207 | 7 | 0 |
| Mutlak Değer | 3k | 1 | 4/5 | 244 | 8 | 0 |
| Üslü Sayılar | 4k | 1 | 6/6 | 222 | 7 | 0 |
| Köklü Sayılar | 3k | 1 | 3/7 | 187 | 8 | 0 |
| Çarpanlara Ayırma | 4k | 1 | 4/5 | 219 | 2 | 0 |
| Oran Orantı | 3k | 1 | 4/7 | 225 | 7 | 0 |
| Denklem Çözme | 3k | 1 | 3/5 | 243 | 4 | 0 |
| Problemler | 11k | 1 | 15/18 | 2084 | 111 | 1 |
| Kümeler | 10k | 1 | 9/11 | 304 | 11 | 0 |
| Mantık | 9k | 1 | 7/8 | 256 | 6 | 0 |
| İşlem | 1k | 1 | 5/7 | 31 | 3 | 4 |
| Modüler Aritmetik | <1k | 1 | 1/5 | 17 | 1 | 4 |
| Fonksiyonlar | 14k | 1 | 7/8 | 418 | 11 | 0 |
| Polinomlar | 5k | 1 | 4/6 | 231 | 1 | 0 |
| 2.Dereceden Denklemler | 6k | 1 | 5/5 | 306 | 0 | 0 |
| Permütasyon ve Kombinasyon | 9k | 1 | 4/6 | 336 | 10 | 1 |
| Olasılık | 2k | 1 | 3/6 | 240 | 9 | 0 |
| Veri – İstatistik | 5k | 1 | 6/9 | 281 | 14 | 1 |

### Geometri

| Konu | Anlatım | Kaynak kitap | Alt başlık | Soru | ÖSYM | Sorusuz alt başlık |
|---|---|---|---|---|---|---|
| Doğruda Açı | 2k | 1 | 4/7 | 136 | 2 | 1 |
| Üçgende Açı | 1k | 1 | 1/4 | 181 | 9 | 0 |
| Açılar ve Üçgenler | **yok** | 0 | 0/4 | 13 | 1 | 0 |
| Ek Çizimler | **yok** | 0 | 0/5 | 113 | 0 | 2 |
| Özel Üçgenler | 1k | 1 | 5/9 | 467 | 10 | 1 |
| Açıortay | 1k | 1 | 2/4 | 170 | 0 | 0 |
| Kenarortay | <1k | 1 | 1/4 | 153 | 1 | 0 |
| Üçgende Eşlik – Benzerlik | 4k | 1 | 5/7 | 308 | 9 | 1 |
| Açı – Kenar Bağıntıları | 1k | 1 | 2/4 | 162 | 3 | 1 |
| Üçgende Alan | 1k | 1 | 1/6 | 95 | 2 | 0 |
| Üçgende Merkezler | **yok** | 0 | 0/5 | 22 | 0 | 2 |
| Çokgenler | <1k | 1 | 1/5 | 81 | 8 | 0 |
| Dörtgenler | 1k | 1 | 2/4 | 93 | 1 | 0 |
| Deltoid | **yok** | 0 | 0/3 | 35 | 2 | 0 |
| Paralelkenar | <1k | 1 | 0/3 | 56 | 0 | 0 |
| Eşkenar Dörtgen | <1k | 1 | 1/3 | 31 | 1 | 0 |
| Dikdörtgen | <1k | 1 | 1/3 | 85 | 7 | 0 |
| Kare | <1k | 1 | 1/3 | 59 | 5 | 0 |
| Yamuk | 1k | 1 | 4/5 | 92 | 5 | 0 |
| Grafik Okuma | **yok** | 0 | 0/4 | 6 | 2 | 1 |
| Çember ve Daire | **yok** | 0 | 0/11 | 10 | 2 | 6 |
| Analitik Geometri | **yok** | 0 | 0/9 | 16 | 2 | 5 |
| Katı Cisimler | 2k | 1 | 3/13 | 201 | 18 | 5 |

### Fizik

| Konu | Anlatım | Kaynak kitap | Alt başlık | Soru | ÖSYM | Sorusuz alt başlık |
|---|---|---|---|---|---|---|
| Fizik Bilimine Giriş | 5k | 1 | 6/7 | 191 | 1 | 0 |
| Madde ve Özellikleri | 16k | 1 | 6/6 | 234 | 5 | 0 |
| Hareket ve Kuvvet | 27k | 1 | 9/9 | 397 | 9 | 0 |
| İş, Güç ve Enerji | 10k | 1 | 5/7 | 271 | 1 | 0 |
| Isı, Sıcaklık ve Genleşme | 26k | 1 | 7/7 | 286 | 9 | 0 |
| Basınç | 20k | 1 | 5/5 | 240 | 2 | 0 |
| Kaldırma Kuvveti | 3k | 1 | 3/6 | 245 | 4 | 0 |
| Elektrostatik | 19k | 1 | 6/6 | 173 | 4 | 0 |
| Elektrik ve Manyetizma | 15k | 1 | 7/9 | 315 | 4 | 0 |
| Dalgalar | 25k | 1 | 8/9 | 271 | 6 | 0 |
| Optik | 30k | 1 | 8/9 | 424 | 12 | 1 |

### Kimya

| Konu | Anlatım | Kaynak kitap | Alt başlık | Soru | ÖSYM | Sorusuz alt başlık |
|---|---|---|---|---|---|---|
| Kimya Bilimi | 11k | 1 | 5/5 | 414 | 7 | 0 |
| Atom ve Periyodik Sistem | 15k | 1 | 8/8 | 484 | 10 | 0 |
| Kimyasal Türler Arası Etkileşimler | 10k | 1 | 7/8 | 387 | 10 | 0 |
| Maddenin Halleri | 16k | 1 | 7/8 | 363 | 8 | 0 |
| Doğa ve Kimya | 15k | 1 | 5/6 | 288 | 0 | 0 |
| Kimyanın Temel Kanunları | 2k | 1 | 3/5 | 162 | 2 | 1 |
| Kimyasal Hesaplamalar | 7k | 1 | 6/8 | 367 | 5 | 0 |
| Karışımlar | 15k | 1 | 7/7 | 284 | 9 | 0 |
| Asit, Baz ve Tuz | 4k | 1 | 6/7 | 284 | 9 | 0 |
| Kimya Her Yerde | 13k | 1 | 7/8 | 200 | 1 | 0 |

### Biyoloji

| Konu | Anlatım | Kaynak kitap | Alt başlık | Soru | ÖSYM | Sorusuz alt başlık |
|---|---|---|---|---|---|---|
| Canlıların Ortak Özellikleri | 11k | 1 | 9/11 | 238 | 2 | 0 |
| Canlıların Temel Bileşenleri | 47k | 1 | 9/9 | 538 | 5 | 0 |
| Hücre ve Organelleri | 27k | 1 | 14/14 | 311 | 6 | 0 |
| Hücre Zarından Madde Geçişi | 11k | 1 | 5/9 | 232 | 2 | 0 |
| Canlıların Sınıflandırılması | 40k | 1 | 10/10 | 358 | 7 | 0 |
| Mitoz ve Eşeysiz Üreme | 17k | 1 | 9/11 | 230 | 6 | 0 |
| Mayoz ve Eşeyli Üreme | 8k | 1 | 4/7 | 192 | 2 | 0 |
| Kalıtım | 25k | 1 | 8/11 | 495 | 9 | 0 |
| Ekosistem Ekolojisi | 23k | 1 | 7/9 | 192 | 5 | 0 |
| Güncel Çevre Sorunları | 29k | 1 | 6/9 | 169 | 3 | 0 |
