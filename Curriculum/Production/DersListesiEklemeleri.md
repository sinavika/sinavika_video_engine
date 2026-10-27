# Ders listesi eklemeleri

Ders listesine (`lesson.csv`) sonradan eklenen konu ve alt başlıklar. Kaynak, gerekçe ve kimlikler burada tutulur. Backend ve uygulama tarafı (başka ajan) bu satırları kendi tablolarına aynı kimliklerle eklemelidir.

## 27 Ekim 2026: kapsam denetimi A1–A4

Gerekçe: [KapsamDenetimi.md](KapsamDenetimi.md) §4 A. Sahibin onayıyla eklendi.

Toplam 52 satır eklendi: 7 yeni konu (6'şar ya da 9'ar alt başlıkla) ve mevcut bir konuya 1 alt başlık. Kimlikler yeni üretildi (uuid4, büyük harf).

Aynı içerik şu dosyalara yazıldı:
- `Desktop\lesson.csv` (asıl)
- `Curriculum/Sources/LessonList.csv`
- `Desktop\sinavika_parse\data\LessonList.csv`

Ardından `npm run curriculum -- import` çalıştırıldı. Katalog ve üretim listesi güncellendi; mevcut konuların ilerlemesi korundu. Eski hâl: `git show HEAD:Curriculum/Sources/LessonList.csv`.

| Kategori | Ders | Konu | Konu kimliği | Alt başlıklar |
|---|---|---|---|---|
| KPSS_LISANS | TAR | TAR_CAGDAS_TURK_DUNYA · Çağdaş Türk ve Dünya Tarihi | `3793DB87-6F7D-463A-8022-81BB3FA4C294` | TAR_CAGDAS_TURK_DUNYA_01 `A9F595A3-400D-44A7-B294-397FB51DF7F2` İki Savaş Arası Dönemde Dünya<br>TAR_CAGDAS_TURK_DUNYA_02 `2027056C-AE10-482A-9BDA-362DC973832B` II. Dünya Savaşı<br>TAR_CAGDAS_TURK_DUNYA_03 `5B577298-32E7-4689-8A3D-9D836573DCBA` II. Dünya Savaşı’nda Türkiye<br>TAR_CAGDAS_TURK_DUNYA_04 `A24CB05D-F96B-456A-9385-2F0FB670E20E` Soğuk Savaş Dönemi<br>TAR_CAGDAS_TURK_DUNYA_05 `7145617B-59C0-4A1F-A496-C4B71E090AE6` Yumuşama Dönemi<br>TAR_CAGDAS_TURK_DUNYA_06 `0E53A144-94DC-4E5B-96D7-1B67056E0BB0` Soğuk Savaş Sonrası ve Küreselleşme<br>TAR_CAGDAS_TURK_DUNYA_07 `5D05A53A-4350-49D7-83DB-781F38B17C3C` 1945 Sonrası Türkiye’de Siyasi Hayat<br>TAR_CAGDAS_TURK_DUNYA_08 `FFB49D3C-F852-4122-B607-42860CFB9102` 1945 Sonrası Türk Dış Politikası<br>TAR_CAGDAS_TURK_DUNYA_09 `BB28293D-37C9-4946-B963-6EA6477EB2BE` 1945 Sonrası Türkiye’de Ekonomik ve Sosyal Gelişmeler |
| KPSS_LISANS | MAT | SAYISAL_MANTIK · Sayısal Mantık | `A1A6562E-678E-4ADB-A624-595FB9F75632` | SAYISAL_MANTIK_01 `D0108EA2-6409-41E0-941B-D20B1565FF4A` Sayı Örüntüleri<br>SAYISAL_MANTIK_02 `5A63A076-4BB1-4451-ACEE-26FA04173E0D` Şekil Örüntüleri<br>SAYISAL_MANTIK_03 `040EC5EE-75BC-4261-8F05-5B3646E774B8` Tablo ve Grafik Yorumlama<br>SAYISAL_MANTIK_04 `69D55F1D-08A9-4384-BFA4-DB1E029D0772` Sıralama ve Yerleştirme<br>SAYISAL_MANTIK_05 `F9568019-DA4A-4AFA-BC8D-D98734AE4A56` Eşleştirme ve Gruplama<br>SAYISAL_MANTIK_06 `DFB3E783-4F97-4E24-BD1A-48DDA59CA1DA` Sayısal Akıl Yürütme Problemleri |
| KPSS_ONLISANS | TAR | TAR_CAGDAS_TURK_DUNYA · Çağdaş Türk ve Dünya Tarihi | `B6901F4B-59B6-49B2-81CC-06C27186AD5A` | TAR_CAGDAS_TURK_DUNYA_01 `CB252E9D-5ACD-4924-AB33-6BBA38242DB0` İki Savaş Arası Dönemde Dünya<br>TAR_CAGDAS_TURK_DUNYA_02 `8B045E75-AADD-4974-8732-F481E9EE260A` II. Dünya Savaşı<br>TAR_CAGDAS_TURK_DUNYA_03 `07C47020-802C-462C-96DC-E311E94E39ED` II. Dünya Savaşı’nda Türkiye<br>TAR_CAGDAS_TURK_DUNYA_04 `3EE3E86E-FE90-4C2B-8EF4-55ADCC8F1D34` Soğuk Savaş Dönemi<br>TAR_CAGDAS_TURK_DUNYA_05 `B17348FC-372B-46B1-A2AD-EFCE66B1D01A` Yumuşama Dönemi<br>TAR_CAGDAS_TURK_DUNYA_06 `61592230-581C-4EE3-8D07-BA44560FC8D7` Soğuk Savaş Sonrası ve Küreselleşme<br>TAR_CAGDAS_TURK_DUNYA_07 `BE9B45A2-9D18-475C-B408-554E78B54780` 1945 Sonrası Türkiye’de Siyasi Hayat<br>TAR_CAGDAS_TURK_DUNYA_08 `B7516ED3-5546-4E04-ACEC-4A41742513F8` 1945 Sonrası Türk Dış Politikası<br>TAR_CAGDAS_TURK_DUNYA_09 `1C2C6CD0-6A80-4DE0-A89E-FE1ED956D842` 1945 Sonrası Türkiye’de Ekonomik ve Sosyal Gelişmeler |
| KPSS_ONLISANS | MAT | SAYISAL_MANTIK · Sayısal Mantık | `E093030C-FF8B-4328-8032-DB195C4EAA14` | SAYISAL_MANTIK_01 `05BFAD3E-A603-4361-9CB7-82EFF6E425CE` Sayı Örüntüleri<br>SAYISAL_MANTIK_02 `FB186FB2-1894-42E9-9C00-AEDAD4CED408` Şekil Örüntüleri<br>SAYISAL_MANTIK_03 `22BE9801-8F3B-46C0-9901-5184A70B822B` Tablo ve Grafik Yorumlama<br>SAYISAL_MANTIK_04 `38F89DCB-859D-4413-8D7A-65CE5DC3807D` Sıralama ve Yerleştirme<br>SAYISAL_MANTIK_05 `81DF849F-2368-4E03-B3CE-3EB36FFC7F98` Eşleştirme ve Gruplama<br>SAYISAL_MANTIK_06 `9CC0C3CE-19C2-4708-A5EF-61662EF53856` Sayısal Akıl Yürütme Problemleri |
| KPSS_ORTAOGRETIM | TAR | TAR_CAGDAS_TURK_DUNYA · Çağdaş Türk ve Dünya Tarihi | `85F852B0-7678-43B3-B74A-ABEF80E654F4` | TAR_CAGDAS_TURK_DUNYA_01 `F7FA746D-CEBE-479A-865F-787BD145AEF9` İki Savaş Arası Dönemde Dünya<br>TAR_CAGDAS_TURK_DUNYA_02 `34379E09-ECA9-4EF0-AD10-407CE3AC3692` II. Dünya Savaşı<br>TAR_CAGDAS_TURK_DUNYA_03 `94D26557-E161-47FB-A024-76684EDD69A2` II. Dünya Savaşı’nda Türkiye<br>TAR_CAGDAS_TURK_DUNYA_04 `095D0CAB-65B9-4524-A1D0-2EAC562367A2` Soğuk Savaş Dönemi<br>TAR_CAGDAS_TURK_DUNYA_05 `AAB5D04E-6193-407C-8BD1-1B82853744C6` Yumuşama Dönemi<br>TAR_CAGDAS_TURK_DUNYA_06 `F19F0ED9-3A85-417A-B329-69B0F062863F` Soğuk Savaş Sonrası ve Küreselleşme<br>TAR_CAGDAS_TURK_DUNYA_07 `3D26BFE6-55F4-4E37-A6CD-2BBE638EE75A` 1945 Sonrası Türkiye’de Siyasi Hayat<br>TAR_CAGDAS_TURK_DUNYA_08 `100B7A5F-4F94-42A7-A355-71937569562E` 1945 Sonrası Türk Dış Politikası<br>TAR_CAGDAS_TURK_DUNYA_09 `18805AE7-CF56-4472-8312-B75DB07F23D6` 1945 Sonrası Türkiye’de Ekonomik ve Sosyal Gelişmeler |
| KPSS_ORTAOGRETIM | MAT | SAYISAL_MANTIK · Sayısal Mantık | `D9F36DD5-4E18-412D-AF80-BB8899FFE09D` | SAYISAL_MANTIK_01 `68458D26-47D0-434B-AEE0-4751D9012232` Sayı Örüntüleri<br>SAYISAL_MANTIK_02 `E3B39DA2-9AB2-4056-B618-1D47DA1EF775` Şekil Örüntüleri<br>SAYISAL_MANTIK_03 `ED1F8746-2452-428F-85D3-AB550D4C073B` Tablo ve Grafik Yorumlama<br>SAYISAL_MANTIK_04 `48D7F523-5818-4A97-8DAC-FAC4BE96FB33` Sıralama ve Yerleştirme<br>SAYISAL_MANTIK_05 `DB1D95F6-91A7-4073-B9EC-24A78357E66A` Eşleştirme ve Gruplama<br>SAYISAL_MANTIK_06 `A6E11A95-B6F5-43D7-BD3C-39721A4E4FC6` Sayısal Akıl Yürütme Problemleri |
| YKS_AYT | MAT | MAT_DONUSUM · Dönüşümler (Diziler'den sonra) | `49692030-9F9A-492B-A1DF-9CBBCC769C4C` | MAT_DONUSUM_01 `BFF48008-FE4E-4C65-B0AA-294A14CC6151` Öteleme Dönüşümü<br>MAT_DONUSUM_02 `B77F7A11-1B64-4A37-A30F-DA563A277CC9` Noktanın Noktaya ve Eksenlere Göre Simetrisi<br>MAT_DONUSUM_03 `6AE4F7A9-1F45-4889-B8DA-E6A9A082FB00` Noktanın Doğruya Göre Simetrisi<br>MAT_DONUSUM_04 `C46CD2D1-5BDB-4DBF-B236-C46B6F22A76F` Doğrunun Noktaya Göre Simetrisi<br>MAT_DONUSUM_05 `9F394703-5162-4E68-9563-0686F9DDD71F` Dönme Dönüşümü<br>MAT_DONUSUM_06 `FC36DEC9-39AC-4B99-9436-2B0848C5C775` Dönüşümlerin Bileşkesi |
| YKS_TYT | GEO | GEO_OZEL_UCGEN · Özel Üçgenler (mevcut konu) | `905C3A40-9990-F9A0-1021-CB4516014995` | GEO_OZEL_UCGEN_10 `1DA961CE-4EB0-4C58-93EE-0DDEA485CE03` Dik Üçgende Trigonometrik Oranlar |

Alt başlıkların dayanağı:
- **Çağdaş Türk ve Dünya Tarihi:** ÖSYM 2026 KPSS kılavuzu Tablo-1 (ç). XX. yüzyılın başından günümüze dünya; II. Dünya Savaşı'ndan günümüze Türkiye. Alt başlık adları AYT Tarih'in aynı dönem ünitelerine yakın tutuldu.
- **Sayısal Mantık:** Kılavuzdaki "sayısal ve mantıksal akıl yürütme" ifadesi ve Türkçe'deki Sözel Mantık konusunun yapısı esas alındı.
- **Dönüşümler:** MEB 12.4.1, kazanım 12.4.1.1 ve 12.4.1.2. Doğrunun doğruya göre simetrisi MEB'de yok, alınmadı.
- **Dik Üçgende Trigonometrik Oranlar:** MEB 9.4.4.3.

## Bekleyen işler

1. **Backend ve uygulama:** Bu konu ve alt başlıklar uygulamanın ders tablolarına aynı kimliklerle eklenmeli. Bu bir veritabanı yazımıdır; sahibin onayı gerekir. İş başka ajandadır.
2. **Soru havuzu:** `EgitimVerileri`'deki ÖSYM ve kaynak sorular yeni konulara yeniden eşlenmeli (`VeriDuzeltmeleri.md` #10, #11). KPSS Sayısal Mantık soruları şu an büyük olasılıkla Problemler'de duruyor.
3. **Konu anlatımı:** Yeni konuların anlatım dosyası yok. Senaryo yazılırken kaynak durumu ayrıca raporlanır.
