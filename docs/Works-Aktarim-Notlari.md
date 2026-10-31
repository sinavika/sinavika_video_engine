# Works içe aktarma: motor senaryolarıyla uyum (31 Ekim 2026)

**Kime:** API (`sinavika`) tarafında Works'ü yürüten ajan.
**Uç:** `POST /api/admin/works/imports`. Eşleme `Services/Works/Helpers/WorkScriptMapper.cs` ile, figürler `Services/Content/Conversion/ContentFigureVideoEngineConverter.cs` ile yapılır.

## 0. Works artık `Curriculum/Works` klasöründen aktarır (31 Ekim 2026)

- **Klasör:** `C:\Users\onurc\source\repos\sinavika_video_engine\Curriculum\Works\<KATEGORİ>\<DERS>\<KONU>.json`. Kontrol listesindeki her konu için bir dosya vardır. Alt konularının hepsi anlatılmamış konunun dosyası yazılmaz; yani Works hiçbir zaman yarım konu almaz.
- **Biçim:** API'nin bugünkü `WorkScriptDto` biçimiyle birebir aynıdır: `topic` (category, lesson, code, ayrıca id), `title`, `lesson.hook`, `lesson.objectives`, `lesson.sections` (subtopic, subtopics, title, cards), `lesson.summary`, `camp.task`, `works.additions`. API'de değişiklik gerekmez. Ek alan `sourceScripts`, dosyanın hangi video senaryolarından kurulduğunu gösterir.
- **Neden:** Video senaryosu bir bölümdür; bir konu birden çok bölüme yayılabilir, bir bölüm de birden çok konuya hizmet edebilir. Works dosyasında her bölüm yalnız o konunun kendi alt konu kodlarını taşır.
  - KPSS: tek video seti üç seviyeye hizmet eder ve aynı alt konu kodu seviyeden seviyeye farklı alt konuyu gösterir (§7).
  - AYT Tarih-2 ve Coğrafya-2: artık kendi dosyaları var (§5'teki bağlama işi motor tarafında çözüldü).
- **Üretim:** motor `npm run curriculum -- works [KATEGORİ ÖNEKİ]` ile yazar. 31 Ekim'de TYT için 168/168, AYT için 277/277 dosya üretildi. TYT ve AYT dosyaları senaryoyla bölüm bölüm aynı sıradadır (445 dosyanın hepsinde doğrulandı); yalnız video alanları yoktur.
- **Öneri:** Aktarım `Curriculum/Scripts` yerine `Curriculum/Works` klasörünü okusun. KPSS için bu zorunludur: `Curriculum/Scripts/KPSS` altındaki ortak senaryolar doğrudan aktarılırsa yalnız tek seviyeye ve eksik içerikle gider. `WorkEngineScenarioDryRunTests` de `SINAVIKA_ENGINE_SCRIPTS` yerine bu klasörle çalıştırılabilir.

## Senaryoların durumu (31 Ekim)

| Kapsam | Konu | Senaryo dosyası | Not |
|---|---|---|---|
| YKS TYT | 168 / 168 | 168 | `YKS_TYT/` altında 10 ders; hepsinde `works.additions` dolu |
| YKS AYT | 277 / 277 | 219 | `YKS_AYT/` altında 13 ders klasörü. Tarih-2 ve Coğrafya-2 konuları `TAR1` ve `COG1` senaryolarını kullanır (§5); hepsinde `works.additions` dolu |

- Toplam 387 senaryo var. Hepsi motorun `curriculum check` ve `validate` denetimlerinden geçti. YDT kapsam dışı.
- 31 Ekim'den beri her senaryoda en az 2 Works notu zorunlu; notu olmayan senaryo motorda "Hazırlandı" işaretlenmiyor.
- Sorular özgündür; MEB ve ÖSYM malzemesi yalnız örnek alındı. Her sorunun `origin.changes` alanı dolu.

## 1. Tanınmayan görsel türleri: 56 AYT senaryosu reddediliyor

`ConvertValidated`, `EngineKinds` listesinde olmayan ve hazır resmi (`still`) bulunmayan görselde `ArgumentException` atıyor. Bu yüzden bütün senaryo yüklenmiyor.

- API 65 türü tanıyor. TYT'nin bütün türleri ve 29 Ekim listesi (`poem`, `division`, `membrane`, `cell`, `punnett`, `pedigree`, `foodweb`, `trophic`, `taxonomy`, `tonicity`) artık tamam; TYT'de reddedilen senaryo yok.
- Senaryolarda kullanılan 53 tür eksik; hepsi AYT'de:

| Ders | Reddedilen senaryo | Soru figürü | Eksik türler |
|---|---|---|---|
| AYT Fizik | 18 / 21 | 21 | `bohr`, `centreOfMass`, `circular`, `collision`, `doppler`, `electricField`, `energyTrack`, `gears`, `halfLife`, `induction`, `interference`, `kepler`, `kinematics`, `lever`, `magneticField`, `nuclear`, `oscillator`, `parallelPlates`, `photoelectric`, `projectile`, `pulley` |
| AYT Kimya | 18 / 22 | 3 | `distillation`, `electrochemicalCell`, `energyProfile`, `equilibrium`, `gas`, `greenhouse`, `intermolecular`, `micelle`, `nuclear`, `orbitals`, `phaseDiagram`, `rutherford`, `solution`, `stoichiometry`, `titration`, `tyndall` |
| AYT Biyoloji | 8 / 15 | 2 | `circulation`, `digestion`, `eye`, `feedback`, `geneExpression`, `nephron`, `neuron`, `sarcomere` |
| AYT Felsefe | 7 / 14 | 0 | `cave`, `emanation`, `hierarchy`, `retrograde`, `theseus`, `trolley` |
| AYT Mantık | 2 / 4 | 0 | `euler`, `hierarchy`, `opposition`, `truthTable` |
| AYT Din, Psikoloji, Sosyoloji | birer | 0 | `hierarchy` |

Bu türlerin şemaları `src/Components/Visuals/<Ders>/<Ders>Schema.ts` dosyalarında (birleşim `VisualSchema.ts`), çizimleri `src/Components/Visuals/<Ders>/` altındadır.

**Öneri:**
- Çizilebilen türler `SameAsEngine` ile eklenir: veri olduğu gibi saklanır, merkezde aynı şemayla doğrulanıp çizilir.
- Geçici yol: bilinmeyen tür bütün senaryoyu reddetmesin. Kart, mapper'ın zaten yaptığı gibi açıklama adımı olsun ve aktarım raporunda uyarı olarak görünsün. Bugün bu yola gelinmeden `ConvertValidated` hata atıyor.
- Animasyonlu süreç görselleri (titrasyon, Doppler, sera etkisi gibi) yazılı derste hazır resimle daha iyi durur. Motor bunların hazır resmini (`still`) üretebilir (API deposunda `docs/works/Motor-Hazir-Resimleri.md`); `still` taşıyan görsel bugün de yüklenir. Yükleme sahibin onayıyla yapılır.

## 2. Soru figürleri: API'de çözüldü

`WorkScriptMapper` artık `question.figure` alanını soru adımının figürü, çözümdeki görseli de cevaptan sonra açılan figür yapıyor (31 Ekim kontrolü).

## 3. `works.additions`: API'de çözüldü

Mapper `works.additions` alanını okuyor ve motorun kuralıyla denetliyor: en çok 12 madde, her biri 10–400 karakter. Tanımı motorda `docs/Courses.md` içinde, "Works notları" başlığı altında.

## 4. Küçük notlar

- **`mistake` kartı:** Kart `TrueFalse` adımına dönüşüyor ve ifade olarak `wrong` alanı kullanılıyor. Eski senaryolarda `wrong` bazen bir yargı değil bir davranış ("… saymak", "… sanmak"). Motor bundan sonra `wrong` alanını doğru/yanlış diye sorulabilecek bir yargı cümlesi olarak yazacak. Eski kartlar için adımın sorusu "Bu yaklaşım doğru mu?" olabilir.
- **Yalnız videoda kullanılan alanlar:** Bölüm `narration` alanı ile adımların `mark`, `eliminate` ve `sentences` alanları yalnız video içindir; yok sayılmaları doğru.
- **Birlikte işlenen alt konular:** AYT Edebiyat'ın bütün alt konuları bir bölüme bağlıdır. Bazıları komşu bir bölümde birlikte işlendi ve o bölümün `subtopics` alanında yer alır (ör. `TDE_HALK_06`, `TDE_HALK_03` bölümünde). Aktarım bunları kapsama olarak saymalıdır.

## 5. İkiz dersler: Tarih-2 ve Coğrafya-2 (30 Ekim 2026)

- **Sahip kararı:** AYT'de ikiye bölünmüş dersler tek ders sayılır. Tek kamp iki tarafın bütün konularını ve alt konularını anlatıyorsa ikinci video ve ikinci senaryo yapılmaz.
- **Veri:** Tarih-2 (`TAR2`) ile Tarih-1 (`TAR1`) aynı. Coğrafya-2 (`COG2`) ile Coğrafya-1 (`COG1`) de aynı.
  - Konu ve alt konu kodları birebir aynı, yalnız kimlikleri (id) farklı.
  - Konu anlatımı metinleri içerik olarak aynı.
  - ÖSYM çıkmış soruları `TAR1.jsonl` ve `COG1.jsonl` içinde, `twinLessons` alanında ikizini taşıyor.
- **Motor:** Senaryolar yalnız `Curriculum/Scripts/YKS_AYT/TAR1` ve `COG1` altında. Kontrol listesinde `TAR2` ve `COG2` konuları ikizlerinin senaryosuyla "Hazırlandı" işaretli.
- **Çözüldü (31 Ekim):** `Curriculum/Works/YKS_AYT/TAR2` ve `COG2` altında her konunun kendi dosyası var; içerik `TAR1` ve `COG1` senaryolarından, kodlar kendi konusundan gelir. API'de ayrı bağlama gerekmez.

## 6. `outOfScope`: başka konuya kopyalanmış alt konular

- **Ne olduğu:** Senaryonun üst düzeyindeki isteğe bağlı `outOfScope` alanı: `[{codes: [...], reason: "..."}]`.
- **Ne zaman kullanılır:** Ders listesinde bir konunun altına başka bir ünitenin alt konuları kopyalanmışsa (VeriDuzeltmeleri satır 82 ve 83: Coğrafya'nın çevre alt konuları 11 konuda tekrar ediyor), bu alt konular o derste anlatılmaz. Kampın kendi dersinde anlatılır, `outOfScope` de bunu gerekçesiyle kaydeder.
- **Öneri:** Aktarım `outOfScope` kodlarını bu konu için kapsanmış saysın; eksik alt konu diye reddetmesin.

## 7. KPSS: üç seviyeye tek video seti (31 Ekim 2026)

- **Sahip kararı:** KPSS Lisans, Önlisans ve Ortaöğretim için tek video seti yapılır; üç seviyenin hiçbir konusu ve alt konusu atlanmaz. Plan: `Curriculum/Production/KPSS-Kapsam-Analizi.md` (6 kamp, 105 bölüm).
- **Senaryolar:** `Curriculum/Scripts/KPSS/<Ders>/<Kod>.json`. `topic` ana kayıttır: kod Lisans'ta varsa `KPSS_LISANS`, yoksa `KPSS_ONLISANS`.
- **Alt konu kodları seviyeler arasında aynı şeyi göstermez:** `SES_BILGISI_01` Lisans'ta "Sesler", Önlisans'ta "Büyük Ünlü Uyumu". Bölümün `subtopic` ve `subtopics` alanları ana kaydın seviyesindedir; başka seviyenin alt konusunu da anlatan bölüm onu yeni `alsoTeaches` alanına `KPSS_ONLISANS:SES_BILGISI_03` biçiminde yazar.
- **Ortaöğretim, Önlisans'ın ikizidir:** aynı konular, aynı kodlar, aynı adlar; `KPSS_ONLISANS:X` yazan bölüm `KPSS_ORTAOGRETIM:X`'i de anlatır.
- **14 konunun kendi senaryosu yok** (ör. Önlisans `TAR_INKILAP`, `COG_EKONOMIK`, `VAT_VATANDASLIK`; Lisans `TAR_MILLI_MUCADELE`). Alt konuları birkaç senaryoya dağılır. Kontrol listesinde bu kayıtların `files.scripts` alanı onları anlatan bütün senaryoları listeler.
- **Works tarafı:** toplama işini motor yapar. `Curriculum/Works/KPSS_LISANS`, `KPSS_ONLISANS` ve `KPSS_ORTAOGRETIM` altında 256 konunun her biri kendi seviyesinin kodlarıyla ayrı dosyadır. Geniş konuların (`TAR_INKILAP`, `COG_EKONOMIK`) dosyası birden çok bölümden kurulur. Aktarım bu dosyaları okur; `Curriculum/Scripts/KPSS` doğrudan aktarılmaz. Dosyalar bölümler yazıldıkça çoğalır.
