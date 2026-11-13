# E-postalarda Sınavika logosu (BIMI)

11 Kasım 2026. Amaç: sinavika.com adresinden giden e-postalarda, alıcının gelen kutusunda baş harf yerine Sınavika logosu görünsün.

## Neden şu an görünmüyor

- info@sinavika.com hesabında profil fotoğrafı yüklü ve "Herkes" görünürlüğünde. Ayar doğru.
- Gmail, Workspace hesabının profil fotoğrafını alan dışındaki alıcılara (örneğin @gmail.com, @hotmail.com) güvenilir biçimde göstermez. Outlook ve Apple Mail ise Google profil fotoğrafını hiç kullanmaz.
- Logoyu alıcı tarafında gösteren standart **BIMI**'dir. BIMI için alan adının sahte e-postayı engellemesi (DMARC "quarantine" ya da "reject") ve Gmail ile Apple için bir logo sertifikası gerekir.

## Bugünkü durum (11 Kasım DNS kontrolü)

| Kayıt | Değer | Durum |
|---|---|---|
| MX | `SMTP.GOOGLE.com` | Doğru |
| SPF | `v=spf1 include:_spf.google.com ~all` | 11 Kasım'da sahibin onayıyla güncellendi; kullanılmayan Natro satırları silindi |
| DKIM | `google._domainkey` kaydı var | Açık: Yönetici Konsolu "DKIM ile e-postanın kimliği doğrulanıyor" (11 Kasım); DNS'teki anahtar panelle aynı |
| DMARC | `v=DMARC1; p=none; rua=mailto:info@sinavika.com` | Yalnız izliyor; BIMI için yetmez |
| BIMI | `default._bimi` yok | Kurulacak |

Sinavika API'nin e-postaları (bildirim, doğrulama) Gmail SMTP üzerinden gider (`GmailSmtp` ayarı). Yani Google'ın SPF ve DKIM'iyle imzalanır; DMARC sıkılaşınca etkilenmez.

## 11 Kasım kontrolü: e-postalar spam'e düşüyor mu

- **DMARC raporları (23 Eylül – 10 Kasım, 30 rapor, 243 e-posta):** 214 e-posta Google'dan sinavika.com imzasıyla geçti (SPF + DKIM pass). Bizim gönderdiğimiz hiçbir e-posta kimlik doğrulamasında kalmadı.
- **Kalan 29 e-posta:** Hepsi yatırımcılara gönderdiğimiz e-postaların alıcı tarafında grup adresi ya da yönlendirmeyle iletilen kopyaları (e2.vc 11, Anka Ventures 5, 500.co 3, StartupCentrum 3, DCP 2, Inventures 2, Collective Spark 2, OBSS 1). İletirken e-postayı değiştirdikleri için imzamız bozuluyor. `p=none` iken teslim ediliyorlar.
- **Geri dönen e-postalar (son 60 gün):** Hiçbiri spam/itibar nedeniyle değil. Test adresleri (`example.com`, `test.com`), olmayan adresler, dolu kutular. `girisim@kayacanventures.com` "Recipient address rejected: Access denied" verdi: adres karşı tarafta yok ya da dışarıya kapalı; başka bir adres bulunmalı.
- **Dizin paylaşımı:** Yönetici Konsolu → Dizin ayarları → Paylaşım ayarları → Harici dizin paylaşımı zaten en açık seçenekte ("Kuruluş verileri ve kimliği doğrulanmış kullanıcılar için temel profil alanları"). Profil fotoğrafı için panelde açılacak başka ayar yok.

**Karar (11 Kasım):** DMARC şimdilik `p=none` kalıyor. Sıkılaştırınca yatırımcıların grup adreslerinden iletilen kopyalar spam'e düşebilir. Üstelik Gmail logoyu sertifika (VMC) olmadan zaten göstermiyor. DMARC, VMC hazır olduğunda ve aktif yatırımcı yazışması sakinleşince sıkılaştırılır. O zamana kadar e-postalar bugünkü gibi teslim edilir.

## Adımlar

### 1. Gönderenleri doğrula (bugün, 10 dakika)

1. Yönetici Konsolu → Uygulamalar → Google Workspace → Gmail → **E-postanın kimliğini doğrulama**. sinavika.com için durum "E-postanın kimliği DKIM ile doğrulanıyor" olmalı. "Kimlik doğrulamayı başlat" düğmesi görünüyorsa ona bas.
2. **Natro (11 Kasım panelde bakıldı):** Natro hesabında web hosting de mail hosting de yok; Natro yalnız alan adı kaydı ve DNS sunucusu (`ns1/ns2.natrohost.com`). Site Vercel'de, API Azure'da, e-posta Google'da. SPF'teki iki Natro satırı Natro'nun varsayılan DNS şablonundan kalmış, kullanılmıyor.
   - **Yapıldı (11 Kasım):** Natro → sinavika.com → Profesyonel DNS Servisi → Yönet; SPF TXT kaydı `v=spf1 include:_spf.google.com ~all` oldu. Eski değer: `v=spf1 include:_spf.google.com include:_spfcls.natrohost.com include:_netblockshalon.natrohost.com ~all` (geri almak gerekirse).
   - Bu değişiklik e-posta gönderimini bozmaz: sinavika.com adına gönderen tek servis Google.
3. Başka bir servis de sinavika.com adına gönderiyor mu: bülten aracı, fatura (Paraşüt), Buffer bildirimleri vb. Gönderen adresi `@sinavika.com` olan her servis listelenmeli. Paraşüt ve benzerleri genelde kendi alan adlarından gönderir; o durumda etkilenmezler.

### 2. DMARC raporlarını oku (1–2 hafta)

`rua=mailto:info@sinavika.com` olduğu için Google, Microsoft ve Yahoo info@ adresine günlük XML raporları gönderiyor (konu: "Report domain: sinavika.com"). Bu raporlarda sinavika.com adına gönderen her IP ve SPF/DKIM sonucu var.

- Raporları okumak için ücretsiz bir DMARC analiz aracına (örneğin dmarcian, Postmark DMARC, EasyDMARC ücretsiz katmanı) `rua` adresi eklenebilir. Bu bir DNS değişikliğidir, sahibin onayıyla yapılır.
- Hedef: 1–2 hafta boyunca tanımadığımız ve DKIM/SPF'ten geçemeyen meşru bir gönderen kalmasın.

### 3. DMARC'ı sıkılaştır

Raporlar temizse DNS'teki `_dmarc.sinavika.com` TXT kaydını değiştir:

```
v=DMARC1; p=quarantine; pct=100; rua=mailto:info@sinavika.com; adkim=r; aspf=r
```

- `pct=100` zorunlu: Gmail, BIMI için politikanın bütün e-postalara uygulanmasını ister.
- 2–4 hafta sorun çıkmazsa `p=reject` yapılabilir. BIMI için `quarantine` yeterli.
- Geri alma: kaydı eski hâline (`p=none`) döndürmek yeterli.

### 4. Logoyu yayınla

BIMI biçimindeki (SVG Tiny PS) logo hazır:

`C:\Users\onurc\Desktop\Sinavika-Logo\bimi\sinavika-bimi.svg`

- Uygulama ikonu A ile aynı: turuncu `#EA580C` zemin, beyaz Rafine ikon. Kare, daire kırpmada ikon kesilmez, 690 bayt.
- Kaynak ikondaki maske (Tiny PS'te yok) aynı görünümü veren turuncu daireyle değiştirildi.
- Herkese açık HTTPS adreste durmalı. Önerilen: `https://sinavika.com/bimi/sinavika-bimi.svg`. Dosya web reposunda (`sinavika_frontend_student`, `public/bimi/`) yayınlanır; bu iş web oturumunun işi.
- Yayınlandıktan sonra BIMI Group'un denetleyicisiyle (bimigroup.org → BIMI Inspector) doğrula.

### 5. Logo sertifikası (Gmail ve Apple Mail için şart)

Gmail ve Apple Mail, logoyu yalnız sertifikayla gösterir. Yahoo ve AOL sertifikasız da gösterebilir.

| Sertifika | Şart | Bizim için |
|---|---|---|
| **VMC** (Verified Mark Certificate) | Logo, kabul edilen bir marka ofisinde **tescilli marka** olmalı. Gmail'de mavi onay işareti de çıkar. | Natro'da marka tescil kaydı yok (11 Kasım). Başka yoldan TÜRKPATENT başvurusu yapıldıysa kontrol edilmeli; yapılmadıysa önce logo (şekil) markası tescili gerekir. Sertifika veren firmanın TÜRKPATENT'i kabul edip etmediği de sorulmalı. |
| **CMC** (Common Mark Certificate) | Tescil gerekmez; logonun alan adında **en az 12 ay** herkese açık kullanıldığı kanıtlanmalı (genelde web arşivi kaydı). Onay işareti çıkmaz. | Logo Kasım 2026'da değişti (Rafine). 12 ay şartı en erken Kasım 2027'de dolar. |

- Sertifikayı verenler: DigiCert, Sectigo, GlobalSign, Entrust. Fiyatlar yıllık ve yüksek (genelde yılda 1.000 $ civarı ve üstü; güncel fiyat teklifle alınmalı).
- Başvuruda 4. adımdaki SVG dosyası gönderilir; sertifika logoyu içine gömer. Logo değişirse sertifika yenilenir.
- Firma, sertifika dosyasını (`.pem`) verir. Bu da logonun yanına konur: `https://sinavika.com/bimi/sinavika-vmc.pem`.

### 6. BIMI DNS kaydı

`default._bimi.sinavika.com` için TXT kaydı:

Sertifikalıyken:

```
v=BIMI1; l=https://sinavika.com/bimi/sinavika-bimi.svg; a=https://sinavika.com/bimi/sinavika-vmc.pem
```

Sertifikasız (yalnız Yahoo/AOL vb. için, sertifika gelene kadar):

```
v=BIMI1; l=https://sinavika.com/bimi/sinavika-bimi.svg; a=
```

### 7. Test

1. BIMI Inspector ve MXToolbox BIMI Lookup'ta kayıt, logo ve sertifika yeşil olmalı.
2. info@sinavika.com'dan kişisel bir @gmail.com adresine yeni bir e-posta gönder. Alıcıda sinavika.com kayıtlı bir kişi olmamalı; kişi fotoğrafı sonucu bozar.
3. Gmail'in logoyu önbelleğe alması birkaç gün sürebilir.

## Sıra ve kimin işi

| # | İş | Kim | Ne zaman |
|---|---|---|---|
| 1 | SPF düzeltildi, DKIM açık | Yapıldı | 11 Kasım |
| 2 | DMARC raporları okundu: bizim gönderimimiz temiz, yalnız yatırımcı tarafı yönlendirmeler kalıyor | Yapıldı | 11 Kasım |
| 3 | DMARC `p=quarantine; pct=100` | Sahip (DNS) | VMC hazır olunca; yatırımcı yazışması sakinleşince |
| 4 | SVG'yi `sinavika.com/bimi/` altında yayınla | Web oturumu | 3. adımla aynı hafta |
| 5 | Logo için TÜRKPATENT şekil markası başvurusu (asıl engel), sonra VMC teklifi | Sahip | Paralel |
| 6 | BIMI DNS kaydı | Sahip (DNS) | 4. adımdan sonra; `a=` sertifika gelince |
| 7 | Test | Biz | 6. adımdan sonra |

DNS ve hesap değişiklikleri sahibin onayıyla, sahibin hesaplarından yapılır.
