# KPSS kapsam analizi: Lisans, Önlisans ve Ortaöğretim için tek video seti (31 Ekim 2026)

**Sahip kararı:** "Kpss lisans önlisans ve ortaöğretim için tek video seti hazırlanacak. tüm dersleri analiz edeceksin ve hiçbir konu kaçırıp atlamadan 3 alt alan için tek detay video seti olacak." TYT/AYT ile aynı kodlu konulara KPSS'e özel yeni senaryo yazılır.

## Sayılar

| Ders | Lisans konu | Önlisans konu | Lisans alt konu | Önlisans alt konu | Lisans'ta adıyla eşleşmeyen Önlisans alt konusu |
|---|---|---|---|---|---|
| Türkçe | 20 | 20 | 236 | 189 | 94 |
| Matematik | 18 | 18 | 133 | 89 | 33 |
| Geometri | 11 | 14 | 78 | 68 | 30 |
| Tarih | 16 | 19 | 192 | 136 | 64 |
| Coğrafya | 23 | 6 | 195 | 54 | 33 |
| Vatandaşlık | 9 | 4 | 62 | 45 | 34 |
| **Toplam** | **97** | **81** | **896** | **581** | **288** |

- **Ortaöğretim, Önlisans'ın birebir ikizi:** aynı 81 konu, aynı alt konu kodları, aynı adlar (yalnız kimlikleri farklı). Önlisans'ı kapsayan bölüm Ortaöğretim'i de kapsar.
- **Lisans ile Önlisans 58 konu kodunu paylaşıyor, ama alt konu kodları seviyeler arasında aynı şeyi göstermiyor.** Aynı koddaki 352 alt konunun 258'inin adı farklı: `SES_BILGISI_01` Lisans'ta "Sesler", Önlisans'ta "Büyük Ünlü Uyumu"; `SOZCUKTE_ANLAM_01` Lisans'ta "Sözcüğün Anlam Özellikleri", Önlisans'ta "Gerçek Anlam". Bu yüzden kapsam kodla değil, **seviye ve kod birlikte** (`KPSS_ONLISANS:SES_BILGISI_01`) ölçülür.
- Önlisans'ın 581 alt konusundan 293 tanesi Lisans'taki bir alt konuyla adıyla birebir eşleşiyor. Kalan 288 tanesi her kamp yazılırken içeriğine bakılarak eşlenir: çoğu aynı kavramın başka adıdır ("Terim Anlam" ile "Terimsel Anlam"), bir kısmı yalnız Önlisans'ta olan alt konudur (Cümlenin Ögeleri'nde özne, nesne, tümleçler) ve ayrıca anlatılır.

## Model

- Her ders için tek kamp: 6 kamp, **106 bölüm** (ders videosu + kısa video).
- Her bölüm tek senaryodur ve gerçek bir konu koduna bağlıdır (Works konuyu bu kodla tanır). Kod Lisans'ta varsa Lisans kaydı, yoksa Önlisans kaydı ana kayıttır.
- Bir bölümün `subtopic` ve `subtopics` alanları ana kaydın seviyesindeki kodlardır. Aynı bölüm başka seviyenin alt konusunu da anlatıyorsa bunu `alsoTeaches` alanına `KPSS_ONLISANS:SES_BILGISI_03` biçiminde yazar.
- 14 konu kodunun kendi bölümü yok: alt konuları aşağıdaki tabloda yazan bölümlerde anlatılır (aynı konunun başka seviyedeki karşılığı ya da birkaç Lisans konusunu toplayan geniş Önlisans konusu).
- Kapsamı `npm run curriculum -- coverage KPSS` denetler: üç seviyedeki 259 kaydın her alt konusu en az bir bölümde anlatılmalıdır. Eksik alt konusu kalan kayıt "Hazırlandı" olmaz; `--mark` yalnız alt konularının hepsi hazır bölümlerde anlatılan kayıtları işaretler.
- Senaryolar `Curriculum/Scripts/KPSS/<Ders>/<Kod>.json`, kamp planları `Curriculum/Camps/kpss-<ders>-kampi.json` altındadır.

## KPSS Türkçe kampı (21 bölüm)

| No | Bölüm | Ana kod | Seviye | Lisans alt konu | Önlisans alt konu | Ayrıca anlattığı konular |
|---|---|---|---|---|---|---|
| 1 | Ses Bilgisi | `SES_BILGISI` | LÖO | 13 | 12 | — |
| 2 | Sözcükte Yapı | `YAPI_BILGISI` | LÖO | 5 | 8 | — |
| 3 | Sözcükte Anlam | `SOZCUKTE_ANLAM` | LÖO | 28 | 15 | — |
| 4 | Söz Sanatları | `SOZ_SANATLARI` | LÖO | 10 | 9 | — |
| 5 | Cümlede Anlam | `CUMLEDE_ANLAM` | LÖO | 42 | 19 | — |
| 6 | Paragrafın Yapısı ve Anlamı | `PARAGRAFTA_ANLAM` | L | 18 | — | — |
| 7 | Paragrafta Anlatım Biçimleri ve Düşünceyi Geliştirme | `PARAGRAF` | ÖO | — | 21 | — |
| 8 | İsimler | `ISIMLER` | LÖO | 15 | 5 | — |
| 9 | Sıfatlar | `SIFATLAR` | LÖO | 10 | 7 | — |
| 10 | Zamirler | `ZAMIRLER` | LÖO | 8 | 7 | — |
| 11 | Zarflar | `ZARFLAR` | LÖO | 6 | 5 | — |
| 12 | Edat, Bağlaç ve Ünlem | `EDAT_BAGLAC_UNLEM` | LÖO | 8 | 6 | — |
| 13 | Fiiller | `FIILLER` | LÖO | 14 | 8 | — |
| 14 | Fiilimsiler | `FIILIMSILER` | LÖO | 7 | 5 | — |
| 15 | Fiilde Çatı | `FIILDE_CATI` | LÖO | 11 | 4 | — |
| 16 | Cümlenin Ögeleri | `CUMLENIN_OGELERI` | LÖO | 1 | 8 | — |
| 17 | Cümle Türleri | `CUMLE_TURLERI` | LÖO | 1 | 8 | — |
| 18 | Yazım Kuralları | `YAZIM_KURALLARI` | LÖO | 9 | 10 | — |
| 19 | Noktalama İşaretleri | `NOKTALAMA_ISARETLERI` | L | 12 | — | Noktalama İşaretleri (`NOKTALAMA`) |
| 20 | Anlatım Bozukluğu | `ANLATIM_BOZUKLUKLARI` | L | 17 | — | Anlatım Bozukluğu (`ANLATIM_BOZUKLUGU`) |
| 21 | Sözel Mantık | `SOZEL_MUHAKEME_MANTIK` | L | 1 | — | Sözel Mantık (`SOZEL_MANTIK`) |

## KPSS Matematik kampı (18 bölüm)

| No | Bölüm | Ana kod | Seviye | Lisans alt konu | Önlisans alt konu | Ayrıca anlattığı konular |
|---|---|---|---|---|---|---|
| 1 | Temel Kavramlar | `TEMEL_KAVRAMLAR` | LÖO | 13 | 8 | — |
| 2 | Bölme ve Bölünebilme | `BOLME_BOLUNEBILME` | LÖO | 11 | 4 | — |
| 3 | Asal Çarpanlara Ayırma | `ASAL_CARPANLARA_AYIRMA` | LÖO | 6 | 4 | — |
| 4 | OBEB ve OKEK | `EBOB_EKOK` | LÖO | 7 | 4 | — |
| 5 | Rasyonel Sayılar | `RASYONEL_SAYILAR` | LÖO | 2 | 6 | — |
| 6 | Basit Eşitsizlikler | `BASIT_ESITSIZLIKLER` | LÖO | 6 | 4 | — |
| 7 | Mutlak Değer | `MUTLAK_DEGER` | LÖO | 5 | 4 | — |
| 8 | Üslü Sayılar | `USLU_SAYILAR` | LÖO | 7 | 4 | — |
| 9 | Köklü Sayılar | `KOKLU_SAYILAR` | LÖO | 7 | 4 | — |
| 10 | Çarpanlara Ayırma | `CARPANLARA_AYIRMA` | LÖO | 6 | 4 | — |
| 11 | Oran ve Orantı | `ORAN_ORANTI` | LÖO | 7 | 6 | — |
| 12 | Birinci Dereceden Denklemler | `DENKLEMLER` | LÖO | 5 | 4 | — |
| 13 | Problemler | `PROBLEMLER` | LÖO | 14 | 8 | — |
| 14 | Kümeler | `KUMELER` | LÖO | 11 | 6 | — |
| 15 | İşlem ve Modüler Aritmetik | `ISLEM_MODULER_ARITMETIK` | LÖO | 2 | 2 | — |
| 16 | Fonksiyonlar | `FONKSIYONLAR` | LÖO | 10 | 5 | — |
| 17 | Permütasyon, Kombinasyon ve Olasılık | `PERMUTASYON_KOMBINASYON_OLASILIK` | LÖO | 8 | 6 | — |
| 18 | Sayısal Mantık | `SAYISAL_MANTIK` | LÖO | 6 | 6 | — |

## KPSS Geometri kampı (14 bölüm)

| No | Bölüm | Ana kod | Seviye | Lisans alt konu | Önlisans alt konu | Ayrıca anlattığı konular |
|---|---|---|---|---|---|---|
| 1 | Doğruda Açılar | `GEO_DOGRU_ACI` | LÖO | 7 | 4 | — |
| 2 | Üçgende Açılar | `GEO_UCGEN_ACI` | L | 6 | — | Üçgenler (`GEO_UCGENLER`) |
| 3 | Üçgende Açı-Kenar Bağıntıları | `GEO_ACI_KENAR` | LÖO | 4 | 3 | — |
| 4 | Üçgende Eşlik ve Benzerlik | `GEO_UCGEN_BENZERLIK` | L | 7 | — | Üçgende Eşlik (`GEO_UCGEN_ESLIK`) |
| 5 | Üçgenin Yardımcı Elemanları | `GEO_YARDIMCI_ELEMANLAR` | LÖO | 8 | 5 | — |
| 6 | Dik Üçgen ve Trigonometri | `GEO_DIK_UCGEN_TRIG` | LÖO | 9 | 5 | Üçgenler (`GEO_UCGENLER`) |
| 7 | Üçgenin Alanı | `GEO_UCGEN_ALAN` | LÖO | 6 | 4 | — |
| 8 | Çokgenler | `GEO_COKGEN` | LÖO | 5 | 4 | — |
| 9 | Dörtgenler | `GEO_DORTGEN` | ÖO | — | 8 | — |
| 10 | Çember ve Daire | `GEO_CEMBER` | LÖO | 11 | 6 | — |
| 11 | Doğrunun Analitik İncelenmesi | `GEO_ANALITIK` | LÖO | 8 | 6 | — |
| 12 | Prizmalar | `GEO_PRIZMALAR` | LÖO | 7 | 6 | — |
| 13 | Piramitler | `GEO_PIRAMITLER` | ÖO | — | 4 | — |
| 14 | Silindir | `GEO_SILINDIR` | ÖO | — | 4 | — |

## KPSS Tarih kampı (21 bölüm)

| No | Bölüm | Ana kod | Seviye | Lisans alt konu | Önlisans alt konu | Ayrıca anlattığı konular |
|---|---|---|---|---|---|---|
| 1 | İslamiyet Öncesi Türk Tarihi | `TAR_ISLAM_ONCESI` | LÖO | 15 | 9 | — |
| 2 | Türk-İslam Tarihi | `TAR_ILK_TURK_ISLAM` | LÖO | 13 | 7 | — |
| 3 | Türkiye Tarihi | `TAR_TURKIYE` | LÖO | 9 | 7 | — |
| 4 | Osmanlı Devleti Kuruluş Dönemi | `TAR_OSM_KURULUS` | L | 11 | — | Osmanlı Devleti’nin Genel Özellikleri (`TAR_OSM_GENEL`) |
| 5 | Osmanlı Devleti Yükselme Dönemi | `TAR_OSM_YUKSELME` | L | 12 | — | Osmanlı Devleti’nin Genel Özellikleri (`TAR_OSM_GENEL`) |
| 6 | Osmanlı Kültür ve Medeniyeti | `TAR_OSM_KULTUR_UYGARLIK` | LÖO | 13 | 8 | — |
| 7 | Avrupa’daki Gelişmeler ve Osmanlı | `TAR_OSM_AVRUPA_ETKI` | ÖO | — | 9 | — |
| 8 | XVII. Yüzyılda Osmanlı | `TAR_OSM_17` | LÖO | 11 | 6 | — |
| 9 | XVIII. Yüzyılda Osmanlı | `TAR_OSM_18` | LÖO | 10 | 5 | — |
| 10 | XIX. Yüzyılda Osmanlı | `TAR_OSM_19` | LÖO | 14 | 10 | Türkiye Cumhuriyeti İnkılap Tarihi (`TAR_INKILAP`) |
| 11 | I. Dünya Savaşı | `TAR_1_DUNYA_SAVASI` | ÖO | — | 7 | — |
| 12 | Mustafa Kemal’in Hayatı | `TAR_ATATURK_HAYATI` | L | 9 | — | — |
| 13 | Mondros, İşgaller ve Cemiyetler | `TAR_MONDROS_CEMIYETLER` | ÖO | — | 5 | Millî Mücadele Dönemi (`TAR_MILLI_MUCADELE`) |
| 14 | Kurtuluş Savaşı Hazırlık Dönemi | `TAR_KURTULUS_HAZIRLIK` | ÖO | — | 8 | Türkiye Cumhuriyeti İnkılap Tarihi (`TAR_INKILAP`), Millî Mücadele Dönemi (`TAR_MILLI_MUCADELE`) |
| 15 | I. TBMM Dönemi | `TAR_TBMM_1` | ÖO | — | 6 | Millî Mücadele Dönemi (`TAR_MILLI_MUCADELE`) |
| 16 | Kurtuluş Savaşı Muharebeleri ve Lozan | `TAR_KURTULUS_MUHAREBELER` | ÖO | — | 9 | Türkiye Cumhuriyeti İnkılap Tarihi (`TAR_INKILAP`), Millî Mücadele Dönemi (`TAR_MILLI_MUCADELE`) |
| 17 | Cumhuriyet Dönemi İç Politika | `TAR_CUMHURIYET_IC` | L | 10 | — | Türkiye Cumhuriyeti İnkılap Tarihi (`TAR_INKILAP`) |
| 18 | Atatürk İnkılapları | `TAR_ATATURK_INKILAPLARI` | LÖO | 13 | 5 | Türkiye Cumhuriyeti İnkılap Tarihi (`TAR_INKILAP`) |
| 19 | Atatürk İlkeleri | `TAR_ATATURK_ILKELERI` | LÖO | 10 | 7 | — |
| 20 | Atatürk Dönemi Dış Politika | `TAR_ATATURK_DIS_POLITIKA` | LÖO | 9 | 7 | Türkiye Cumhuriyeti İnkılap Tarihi (`TAR_INKILAP`) |
| 21 | Çağdaş Türk ve Dünya Tarihi | `TAR_CAGDAS_TURK_DUNYA` | LÖO | 9 | 9 | — |

## KPSS Coğrafya kampı (23 bölüm)

| No | Bölüm | Ana kod | Seviye | Lisans alt konu | Önlisans alt konu | Ayrıca anlattığı konular |
|---|---|---|---|---|---|---|
| 1 | Türkiye’nin Coğrafi Konumu | `COG_KONUM` | LÖO | 4 | 4 | — |
| 2 | Türkiye’nin Özel Tarihlerdeki Durumu | `COG_OZEL_TARIH` | L | 9 | — | — |
| 3 | Türkiye’nin Jeolojik Geçmişi | `COG_JEOLOJIK_ZAMAN` | L | 8 | — | Türkiye’nin Yeryüzü Şekilleri (`COG_YER_SEKILLERI`) |
| 4 | Türkiye’de İç Kuvvetler | `COG_IC_KUVVETLER` | L | 8 | — | — |
| 5 | Türkiye’de Dış Kuvvetler | `COG_DIS_KUVVETLER` | L | 7 | — | Türkiye’nin Yeryüzü Şekilleri (`COG_YER_SEKILLERI`) |
| 6 | Türkiye’nin Yüzey Şekilleri | `COG_YUZEY_SEKILLERI` | L | 8 | — | Türkiye’nin Yeryüzü Şekilleri (`COG_YER_SEKILLERI`) |
| 7 | Türkiye’nin Su Varlığı | `COG_SU_VARLIGI` | L | 8 | — | Türkiye’nin Yeryüzü Şekilleri (`COG_YER_SEKILLERI`) |
| 8 | Türkiye’de Topraklar | `COG_TOPRAKLAR` | L | 7 | — | Türkiye’nin Yeryüzü Şekilleri (`COG_YER_SEKILLERI`) |
| 9 | Türkiye’nin İklimi | `COG_IKLIM` | L | 9 | — | Türkiye’nin İklimi ve Bitki Örtüsü (`COG_IKLIM_BITKI`) |
| 10 | Türkiye’nin Bitki Örtüsü | `COG_BITKILER` | L | 8 | — | Türkiye’nin İklimi ve Bitki Örtüsü (`COG_IKLIM_BITKI`) |
| 11 | Türkiye’de Doğal Afetler | `COG_DOGAL_AFETLER` | L | 9 | — | Türkiye’nin Yeryüzü Şekilleri (`COG_YER_SEKILLERI`) |
| 12 | Türkiye’de Nüfus | `COG_NUFUS` | L | 8 | — | Türkiye Beşerî Coğrafyası (`COG_NUFUS_YERLESME`) |
| 13 | Türkiye’de Göçler | `COG_GOCLER` | L | 8 | — | Türkiye Beşerî Coğrafyası (`COG_NUFUS_YERLESME`) |
| 14 | Türkiye’de Yerleşme | `COG_YERLESME` | L | 7 | — | Türkiye Beşerî Coğrafyası (`COG_NUFUS_YERLESME`) |
| 15 | Türkiye’de Tarım | `COG_TARIM_EKONOMI` | L | 11 | — | Türkiye’nin Ekonomik Coğrafyası (`COG_EKONOMIK`) |
| 16 | Türkiye’de Hayvancılık | `COG_HAYVANCILIK` | L | 8 | — | Türkiye’nin Ekonomik Coğrafyası (`COG_EKONOMIK`) |
| 17 | Türkiye’de Madenler ve Enerji | `COG_MADEN_ENERJI` | L | 15 | — | Türkiye’nin Ekonomik Coğrafyası (`COG_EKONOMIK`) |
| 18 | Türkiye’de Sanayi | `COG_SANAYI` | L | 10 | — | Türkiye’nin Ekonomik Coğrafyası (`COG_EKONOMIK`) |
| 19 | Türkiye’de Ulaşım | `COG_ULASIM` | L | 9 | — | Türkiye’nin Ekonomik Coğrafyası (`COG_EKONOMIK`) |
| 20 | Türkiye’de Ticaret | `COG_TICARET` | L | 7 | — | Türkiye’nin Ekonomik Coğrafyası (`COG_EKONOMIK`) |
| 21 | Türkiye’de Turizm | `COG_TURIZM` | L | 9 | — | Türkiye’nin Ekonomik Coğrafyası (`COG_EKONOMIK`) |
| 22 | Türkiye’de Bölgeler ve Kalkınma Projeleri | `COG_BOLGELER` | LÖO | 11 | 11 | Türkiye’nin Ekonomik Coğrafyası (`COG_EKONOMIK`) |
| 23 | Türkiye’nin Jeopolitik Konumu | `COG_JEOPOLITIK` | L | 7 | — | — |

## KPSS Vatandaşlık kampı (9 bölüm)

| No | Bölüm | Ana kod | Seviye | Lisans alt konu | Önlisans alt konu | Ayrıca anlattığı konular |
|---|---|---|---|---|---|---|
| 1 | Hukukun Temel Kavramları | `VAT_HUKUK_TEMEL` | L | 9 | — | Değerlendirme (`VAT_DEGERLENDIRME`), Vatandaşlık (`VAT_VATANDASLIK`) |
| 2 | Devlet, Anayasa ve Türk Anayasa Tarihi | `VAT_ANAYASA_GIRIS_TARIH` | L | 11 | — | Değerlendirme (`VAT_DEGERLENDIRME`), Vatandaşlık (`VAT_VATANDASLIK`) |
| 3 | Temel Hak ve Hürriyetler | `VAT_TEMEL_HAKLAR` | L | 2 | — | Vatandaşlık (`VAT_VATANDASLIK`) |
| 4 | Yasama | `VAT_YASAMA` | L | 6 | — | Vatandaşlık (`VAT_VATANDASLIK`) |
| 5 | Yürütme | `VAT_YURUTME` | L | 5 | — | Vatandaşlık (`VAT_VATANDASLIK`) |
| 6 | Yargı | `VAT_YARGI` | L | 9 | — | Değerlendirme (`VAT_DEGERLENDIRME`), Vatandaşlık (`VAT_VATANDASLIK`) |
| 7 | İdare Hukuku | `VAT_IDARE_HUKUKU` | L | 4 | — | Değerlendirme (`VAT_DEGERLENDIRME`), Vatandaşlık (`VAT_VATANDASLIK`) |
| 8 | Temel Ekonomi Bilgisi | `VAT_EKONOMI` | LÖO | 3 | 3 | — |
| 9 | Güncel Bilgiler | `VAT_GUNCEL_BILGILER` | LÖO | 13 | 11 | Değerlendirme (`VAT_DEGERLENDIRME`) |

## Kendi bölümü olmayan 14 konu

| Konu | Seviye | Alt konu | Anlatıldığı bölümler |
|---|---|---|---|
| Anlatım Bozukluğu (`ANLATIM_BOZUKLUGU`) | ÖO | 11 | `ANLATIM_BOZUKLUKLARI` |
| Noktalama İşaretleri (`NOKTALAMA`) | ÖO | 13 | `NOKTALAMA_ISARETLERI` |
| Sözel Mantık (`SOZEL_MANTIK`) | ÖO | 8 | `SOZEL_MUHAKEME_MANTIK` |
| Üçgenler (`GEO_UCGENLER`) | ÖO | 4 | `GEO_UCGEN_ACI`, `GEO_DIK_UCGEN_TRIG` |
| Üçgende Eşlik (`GEO_UCGEN_ESLIK`) | ÖO | 5 | `GEO_UCGEN_BENZERLIK` |
| Osmanlı Devleti’nin Genel Özellikleri (`TAR_OSM_GENEL`) | ÖO | 7 | `TAR_OSM_KURULUS`, `TAR_OSM_YUKSELME` |
| Türkiye Cumhuriyeti İnkılap Tarihi (`TAR_INKILAP`) | ÖO | 5 | `TAR_OSM_19`, `TAR_KURTULUS_HAZIRLIK`, `TAR_KURTULUS_MUHAREBELER`, `TAR_CUMHURIYET_IC`, `TAR_ATATURK_INKILAPLARI`, `TAR_ATATURK_DIS_POLITIKA` |
| Millî Mücadele Dönemi (`TAR_MILLI_MUCADELE`) | L | 24 | `TAR_MONDROS_CEMIYETLER`, `TAR_KURTULUS_HAZIRLIK`, `TAR_TBMM_1`, `TAR_KURTULUS_MUHAREBELER` |
| Türkiye’nin Yeryüzü Şekilleri (`COG_YER_SEKILLERI`) | ÖO | 9 | `COG_YUZEY_SEKILLERI`, `COG_JEOLOJIK_ZAMAN`, `COG_DIS_KUVVETLER`, `COG_TOPRAKLAR`, `COG_SU_VARLIGI`, `COG_DOGAL_AFETLER` |
| Türkiye’nin İklimi ve Bitki Örtüsü (`COG_IKLIM_BITKI`) | ÖO | 6 | `COG_IKLIM`, `COG_BITKILER` |
| Türkiye Beşerî Coğrafyası (`COG_NUFUS_YERLESME`) | ÖO | 8 | `COG_NUFUS`, `COG_GOCLER`, `COG_YERLESME` |
| Türkiye’nin Ekonomik Coğrafyası (`COG_EKONOMIK`) | ÖO | 16 | `COG_TARIM_EKONOMI`, `COG_HAYVANCILIK`, `COG_MADEN_ENERJI`, `COG_SANAYI`, `COG_ULASIM`, `COG_TICARET`, `COG_TURIZM`, `COG_BOLGELER` |
| Vatandaşlık (`VAT_VATANDASLIK`) | ÖO | 25 | `VAT_HUKUK_TEMEL`, `VAT_ANAYASA_GIRIS_TARIH`, `VAT_TEMEL_HAKLAR`, `VAT_YASAMA`, `VAT_YURUTME`, `VAT_YARGI`, `VAT_IDARE_HUKUKU` |
| Değerlendirme (`VAT_DEGERLENDIRME`) | ÖO | 6 | `VAT_HUKUK_TEMEL`, `VAT_ANAYASA_GIRIS_TARIH`, `VAT_YARGI`, `VAT_IDARE_HUKUKU`, `VAT_GUNCEL_BILGILER` |

## Dikkat edilecekler

- **Güncel Bilgiler** (`VAT_GUNCEL_BILGILER`) zamanla eskir. Bu bölüm en son, tarihi belirtilerek ve doğrulanmış kaynaklarla yazılır; her sınav döneminden önce yenilenmesi gerekir.
- Vatandaşlık anlatımı 2017 anayasa değişikliğinden sonraki Cumhurbaşkanlığı hükümet sistemine göredir (kanun hükmünde kararname yerine Cumhurbaşkanlığı kararnamesi); eski düzen yalnız Türk anayasa tarihi içinde anlatılır.
- Seviyeler arasında zorluk farkı olan konularda bölüm, temel kuraldan başlayıp Lisans düzeyindeki soru tiplerine kadar çıkar.
- Sorular KPSS'in üç seviyesinin ÖSYM çıkmış sorularından örnek alınarak yeniden kurulur; birebir kopyalanmaz.
- **Works (API) için:** KPSS senaryosu birden çok seviyenin konusunu besler. Bir seviyenin konusu için Works içeriği, `alsoTeaches` alanında o seviyenin alt konusunu adlandıran bölümlerden toplanmalıdır; ayrıntı `docs/Works-Aktarim-Notlari.md` içinde.
