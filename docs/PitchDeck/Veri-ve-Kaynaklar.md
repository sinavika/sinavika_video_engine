# Yatırımcı sunumu: veri, model ve kaynaklar

Sunum `src/PitchDeck` altındadır ve `npm run pitch-deck` ile üretilir. Çıktı `Desktop\Sinavika-PitchDeck` klasörüne gider: sayfa PNG'leri, PDF ve konuşmacı notları.

Sayfalardaki her rakam iki dosyadan gelir:
- `PitchDeckFacts.ts`: ölçülen veri ve kaynakları.
- `PitchDeckModel.ts`: bu veriden hesaplanan model.

Rapor değişirse yalnız bu iki dosya güncellenir.

## Ölçülen veri (25 Eylül 2026 kesimi)

| Veri | Değer | Kaynak | Ne değildir |
|---|---|---|---|
| Android yükleme / harcama | 6.399 / 17.936,96 TL | Google Ads, tüm zamanlar | — |
| Yükleme başına maliyet | 2,80 TL | 17.936,96 / 6.399 | Ücretli müşteri maliyeti (CAC) |
| Dönem reklam harcaması | 21.381,79 TL | Google Ads, 1 Haziran–25 Eylül | Tüm işletme gideri |
| Google Play tahsilat | 69 işlem, 7 iade, 11.039,38 TL | Satış raporu, Mayıs–25 Eylül | 69 benzersiz müşteri; net gelir |
| Eşit dönem büyümesi | 1.439,88 → 4.919,83 TL (%242) | 1–25 Ağustos / 1–25 Eylül | Yalnız talep artışı (fiyat da arttı) |
| Tekrar ödeme | 12 seride 2., 6 seride 3. ödeme; 18 ek tahsilat | Sipariş kökleri | Retention oranı |
| İkinci ay yenileme | 11 / 32 = %34,4 | 40 gün gözlenen seriler | Uzun vadeli elde tutma |
| Yüklemeden ilk ödemeye | 29 / 3.106 = %0,934 | Haziran–Temmuz | Reklam atfı |
| İade payı | 1.559,93 / 12.599,31 = %12,4 | Tahsilat tutarı | Abonelik iptal oranı |
| Fiyat | 359,99 TL (299,99 TL + KDV) | Eylül satış raporu | — |
| YKS 2026 | 2.425.560 başvuru | ÖSYM (YÖK açıklaması) | Benzersiz kişi |
| KPSS Ön Lisans 2026 | 1.593.198 başvuru | ÖSYM | Benzersiz kişi |
| ÖSYM 2025 | 8 milyon+ başvuru | AA, 31.12.2025 | Benzersiz kişi |
| SAT 2025 | 2 milyon+ öğrenci | College Board | ABD talep kanıtı |

## Reklam modeli (sayfa 11–12)

**Kapsam:** 12 ay. Bütçe kademeli harcanır: önce 3 test ayı × 4.000 $, ardından 9 ay × 9.778 $; toplam 100.000 $. Kur 1 $ = 48,9 TL; eski modelde 2,80 TL = 0,0573 $ alınmıştı, aynı kur kullanıldı.

**Ay ay hesap:**
- Yükleme = harcama ÷ yükleme maliyeti.
- İlk ödeme = yükleme × ilk ödeme oranı.
- Ödeyenlerin bir kısmı 2. ayda, sonra her ay yenilenir.
- Tahsilat = ödeyen × 359,99 TL.

**Kesintiler:** Tahsil edilen her 1 TL'den 0,62 TL kalır (`NET_SHARE`). Hesap: önce iade (%12,4) düşülür, sonra KDV (%20), sonra mağaza kesintisi (%15).

**Kapsam dışı:** Ekip, altyapı, yapay zekâ kullanımı ve hukuk giderleri. 13. aya devreden aboneler de gelire eklenmez.

| Senaryo | Yükleme maliyeti | İlk ödeme | 2. ay | Sonraki aylar | 12 ay net katkı |
|---|---|---|---|---|---|
| Bugünkü huni | 4,20 TL | %0,934 | %34,4 | %34,4 | −28,2 bin $ |
| Ara hedef | 4,20 TL | %1,2 | %45 | %70 | +29,3 bin $ |
| Hedef huni | 4,20 TL | %1,4 | %50 | %75 | +68,5 bin $ |

Yükleme maliyeti ölçülen 2,80 TL'nin 1,5 katı alındı, çünkü bütçe bugünkü dönem harcamasının yaklaşık 230 katı. Duyarlılık tablosu 2,80, 4,20 ve 5,60 TL için üç huniyi de gösterir.

Hedef hunideki 12 ay sonucu:
- Brüt satış 271.507 $.
- Kesintiler sonrası gelir 168.506 $.
- Reklam sonrası katkı +68.506 $; birikimli başa baş 3. ay.
- 12. ay brüt satışı 33.405 $.

## Bilinçli dürüstlük notları

- Bugünkü huniyle, ölçekteki yükleme maliyetinde reklam tek başına kâr etmiyor. Sunum bunu saklamıyor (sayfa 12).
  - Kâr, ilk ödeme ve yenileme oranlarının hedefe çıkmasına bağlı (sayfa 13).
  - Eşik kuralı, bu olmazsa kaybı test bütçesiyle sınırlar.
- Hedef oranlar ölçüm değil, ürün hedefidir. Dayanakları:
  - 3 gün ücretsiz deneme ve kişisel planla açılan yeni onboarding;
  - ders planı;
  - SinoAI kişisel üretimleri.
- Yapay zekâ kullanım maliyeti modele dahil değildir. Paket başına kota kuralıyla sınırlıdır.
  - Tavan, yani 359,99 TL'lik pakette 100 TL, tamamen kullanılırsa hedef hunideki katkı başa başa iner.
  - Gerçek ortalama kullanım ölçülünce modele eklenmelidir.

## Eski sunumdan farklar

İçerik korundu. Yalnız şu düzeltmeler yapıldı:

1. **Finans modeli:** 10 $ / ay fiyat varsayımı kaldırıldı; gerçek fiyat 359,99 TL (≈ 7,36 $). Sabit 2,80 TL yükleme maliyeti yerine ölçek etkisi ve duyarlılık tablosu eklendi. Bütçe eşit değil, kademeli harcanır.
2. **Pazar sayfası:**
   - 2026 YKS ve KPSS Ön Lisans başvuruları eklendi.
   - "12.500 ücretli kullanıcı / 500 bin $ / yıl" hedefi, modelin kendi çıktısıyla değiştirildi: 16.300 ilk ödeme ve 12. ayda ≈ 400 bin $ yıllık koşu hızı.
3. **Yeni sayfalar:** "Huniyi büyütecek ürün adımları" ile "İş modeli". Eski 12, 13 ve 14. sayfalar "Yatırım talebi" sayfasında birleşti.
4. **Görsel düzen:** Şablon görselleri ve dünya haritası kaldırıldı. Yerlerine gerçek ürün ekranları (UI/UX v3) ve marka paleti geldi.
