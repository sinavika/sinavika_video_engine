# Kamp API isterleri: Camps servisi (10 Kasım 2026, 2. sürüm)

Kamp senaryoları için bir sunucu servisinin isterleri. Senaryoların doğru kaynağı artık sunucu olur:
- Claude senaryoyu hazırlar ve sunucuya yazar (`ClaudeCampController`). Yerelde bırakmaz.
- Sahip admin panelinde okur, kart kart yorum yazar, düzeltir ve onaylar (`AdminCampController`).
- Ders YouTube'da yayınlanınca linki aynı senaryoya eklenir.

**Bu sürümde yalnız senaryo var.** Video dosyası sunucuya yüklenmez; Blob depolaması şişmesin diye askıya alındı (sahip, 10 Kasım). Video yükleme ileride eklenecek; yeri §11'de ayrıldı.

Bu belge kod içermez. API ve admin paneli kodunu api+web oturumu yazar; motordaki istemciyi (`npm run camp -- …`) bu oturum yazar.

Dayandığı yapı:
- Backend:
  - `Entity/Categories` (Category, CategorySub);
  - `Entity/Lessons` (Lesson, LessonMain, LessonSub, LessonMikro);
  - `Entity/SocialHubs/*` (sürüm, `If-Match`, geçmiş deneyimi).
- Motor:
  - `Curriculum/Camps/*.json` (29 kamp);
  - `Curriculum/Scripts/<Kategori>/<Ders>/<Konu>.json`;
  - işlerin yanındaki `-youtube.md` notları.

---

## 1. Model: SocialHub'dan farkı

SocialHub'da her gönderi tek seferliktir. Gönderilir, onaylanır ya da reddedilir. Reddedilenin yerine yeni gönderi açılır ve eskisi silinebilir.

Kampta mantık başkadır:
- **Her konu için tek bir senaryo vardır**, ve kalıcıdır.
- Senaryonun üzerinde **sürüm sürüm** çalışılır. Claude yeni sürüm yazar, sahip düzeltir ve yeni sürüm çıkar, Claude yorumu işler ve yeni sürüm çıkar.
- Onay bir **sürüme** verilir. "Senaryonun onaylı sürümü 4, en son sürümü 6" denebilir.
- Hiçbir sürüm silinmez. Eski bir sürüme dönmek, o sürümün kopyası olan yeni bir sürüm açmaktır; geçmiş kaybolmaz.
- Senaryo silinmez. Konu kamptan çıkarsa senaryo `Archived` olur.

Bu yüzden SocialHub'dan şunlar alınır:
- sürüm numarası ve `If-Match` ile çakışma denetimi;
- `hold`/`release` (Claude çalışırken onay kilitlenir);
- gerekçe zorunluluğu;
- geçmiş tablosu;
- kuru deneme (validate);
- "yapılacaklar" listesi.

SocialHub'dan şunlar alınmaz: "reddet ve yenisini gönder", `replacesId`, gönderi silme.

---

## 2. Hiyerarşi

Kamp yapısı, backend'deki müfredat ağacının üstüne oturur. Yeni bir ağaç kurulmaz.

```
Category              YKS, KPSS
└─ CategorySub        TYT, AYT, KPSS Lisans …
   └─ Lesson          (CategorySub'ın ders listesi)
      └─ LessonMain   Matematik           ← Camp (kamp)        bir LessonMain = bir kamp
         └─ LessonSub Üslü Sayılar        ← CampScript (senaryo)  bir LessonSub = bir senaryo = bir ders videosu
            └─ LessonMikro  Üslü ifadenin tanımı, çarpma ve bölme …  ← senaryonun kapsadığı alt konular
```

- **Kamp = LessonMain.** TYT Matematik kampı, TYT'nin Matematik LessonMain'idir. Bir LessonMain'in en çok bir kampı olur.
- **Senaryo = LessonSub.** "Üslü Sayılar" dersi, o konunun bütün mikro konularını içinde taşır. Senaryodaki `topic.id`, LessonSub kimliğidir (MAT_USLU = `D91FC8C5-…`).
- **Mikro kapsama:**
  - Senaryonun her bölümü (`section`), işlediği mikro konuların kodlarını taşır: `subtopic` ya da `subtopics` (`MAT_USLU_01` …).
  - Sunucu bu kodları LessonMikro kayıtlarıyla eşler.
  - Panel, konunun mikro listesini senaryoyla yan yana gösterir: hangi mikro hangi bölümde işleniyor, hangisi eksik.
  - Bir bölüm mikroya bağlı olmayabilir (ör. "Bilimsel gösterim" ek bölümü).
- **Bölüm 0 (kamp tanıtımı):** Bir LessonSub'a bağlı değildir; kampa bağlı tanıtım senaryosudur (`Kind = CampIntro`).
- **KPSS:** Bir KPSS kampı Lisans, Önlisans ve Ortaöğretim düzeylerinin üçüne birden hizmet eder. Kodlar düzeye göre farklıdır.
  - Kamp ana LessonMain'e (Lisans) bağlanır; öteki düzeylerin LessonMain'leri `CampLessonMain` ara tablosuna yazılır.
  - Senaryo ana LessonSub'a bağlanır; öteki düzeylerdeki karşılıkları `CampScriptLessonSub` ara tablosuna yazılır (motordaki `alsoTeaches`).

Admin paneli bu ağaçla gezilir: Kategori → Alt kategori → Ders (kamp) → Konu (senaryo) → Mikro kapsama.

---

## 3. Temel kurallar

1. **Claude onaylamaz, onay geri almaz, yayın işaretlemez, arşivlemez.** Bunlar yalnız admindedir.
2. **Claude ve admin yeni sürüm açabilir.**
   - Yeni sürüm açan, bildiği son sürüm numarasını gönderir (`baseVersionNo`).
   - Arada başka bir sürüm açıldıysa 409 `{error, latestVersionNo}` döner (git'teki çakışma gibi).
   - Claude 409'da durur, son sürümü okur, gerekirse sahibe sorar.
3. **Senaryo kaydındaki değişiklikler** (durum, YouTube bilgisi, başlık) `If-Match: "<rowVersion>"` ister. Başlık yoksa 428, kayıt arada değiştiyse 409 döner.
4. **Claude çalışırken kilit:** Claude bir senaryoyu düzeltmeye başlayınca `hold` ile `ClaudeRevising` yapar. Bu arada admin onaylayamaz. Claude yeni sürümü yazınca ya da `release` deyince kilit açılır.
5. **Gerekçe zorunlu:**
   - Claude her sürümde `changeSummary` (ne değişti) ve `reason` (neden) yazar.
   - Sahibin "değişiklik iste" işlemi not ister.
6. **Admin düzenlemesi doğrudan onaylanamaz.**
   - Senaryonun kuralları motorda denetlenir: anlatımın örneği birebir okuması, işaretlenen sözün kökte geçmesi, 10 saniyeden uzun duran ekran olmaması, hesabın tutması.
   - Admin bir sözcüğü değiştirince bunlardan biri bozulabilir. Bu yüzden admin düzenlemesi yeni sürüm açar ve sürüm "denetim bekliyor" olur.
   - Claude denetimi çalıştırıp raporu ekler. Temizse sürüm incelemeye döner ve admin onaylar.
7. **Sunucu içerik kuralı denetlemez, motor denetler.**
   - Sunucu JSON'un yalnız kimlik alanlarını (konu, kamp, mikro kodları) okur ve doğrular.
   - Şema, okunuş, duran ekran ve aritmetik denetimi motorun işidir; sunucu yalnız sonucu (`checkReport`) saklar ve gösterir.
8. **Hiçbir sürüm, yorum ya da geçmiş satırı silinmez.**
9. **Claude sorgu döngüsü kurmaz.** "Yapılacaklar" ucunu sahip "bak" deyince okur (SocialHub kuralı).

---

## 4. Entity'ler ve alanları

Önerilen klasörler: `Entity/Camps/` ve `Entity/Camps/Enum/`. Kimlikler Guid, tarihler UTC.

### 4.1 `Camp`: kamp (bir LessonMain)

| Alan | Tür | Açıklama |
|---|---|---|
| `Id` | Guid | |
| `LessonMainId` | Guid → `LessonMain`, benzersiz | TYT Matematik. CategorySub ve Category bunun üstünden gelir; ayrıca tutulmaz. |
| `Slug` | string(80), benzersiz | Motordaki kimlik: `yks-tyt-matematik-kampi` |
| `Name` | string(120) | "TYT Matematik kampı" |
| `Exams` | string(60) | "YKS,TYT" (kapak ve açıklamada görünür) |
| `Promise` | string(200) | "Matematik konularının hepsi, sırayla ve soru çözerek." |
| `Description` | string(4000)? | Oynatma listesi ve kanal açıklaması |
| `LessonColor` | string(9)? | Ders rengi (motor `LessonColors.ts`'ten gönderir; panel rozeti için) |
| `PlaylistUrl` | string(300)? | YouTube oynatma listesi (admin girer) |
| `Status` | `CampStatus` | §5.1 |
| `OrderIndex` | int | Yayın sırası (ör. TYT Türkçe → TYT Matematik → …) |
| `PlannedStartAt` | DateTime? | |
| `RowVersion` | int | Eşzamanlılık |
| `CreatedAt`, `UpdatedAt` | DateTime | |

Ara tablo `CampLessonMain (CampId, LessonMainId)`: KPSS kampının öteki düzeylerdeki LessonMain'leri (Önlisans, Ortaöğretim).

### 4.2 `CampScript`: senaryo (bir LessonSub, kampın bir dersi)

Kalıcı kayıttır. İçerik sürümlerde durur; bu kayıt kimliği, sırayı, durumu, onaylı sürümü ve yayın bilgisini tutar.

| Alan | Tür | Açıklama |
|---|---|---|
| `Id` | Guid | |
| `CampId` | Guid → `Camp` | |
| `Kind` | `CampScriptKind` | §5.2: `CampIntro` (Bölüm 0) ya da `Lesson` |
| `LessonSubId` | Guid? → `LessonSub` | Konu. Tanıtımda boş. `(CampId, LessonSubId)` benzersiz. LessonSub kampın LessonMain'ine (ya da `CampLessonMain`'deki birine) bağlı olmalı. |
| `Code` | string(60) | `MAT_USLU` (tanıtımda `INTRO`). Motor eşlemesi ve okunabilirlik için. |
| `Number` | int | Kamptaki ders numarası; 0 = tanıtım. `(CampId, Number)` benzersiz. |
| `Title` | string(120) | "Üslü Sayılar" |
| `Status` | `CampScriptStatus` | §5.3 |
| `LatestVersionNo` | int | En son sürüm |
| `ApprovedVersionNo` | int? | Onaylı sürüm. Render bunu kullanır. |
| `ApprovedAt`, `ApprovedByAdminId` | DateTime?, Guid? | |
| `ReviewNote` | string(4000)? | Sahibin son "değişiklik iste" notu (ayrıntı yorumlarda) |
| `RenderedVersionNo` | int? | Videosu hangi sürümden üretildi. Claude bildirir; dosya yüklenmez. |
| `RenderedAt` | DateTime? | |
| `RenderNote` | string(1000)? | Süre, AudioCheck özeti, render uyarısı (kısa metin) |
| `YouTubeUrl` | string(300)? | Yayın linki (admin girer) |
| `YouTubeVideoId` | string(16)? | Linkten çıkarılır |
| `PublishedAt` | DateTime? | |
| `PublishedVersionNo` | int? | Yayındaki videonun sürümü |
| `PublishState` | `CampPublishState` | §5.5 |
| `ShortSocialHubPostId` | Guid? → `SocialHubPost` | Kısa video (CampShort) SocialHub'dan paylaşıldıysa bağlantı |
| `PlannedPublishAt` | DateTime? | Planlanan yayın günü |
| `RowVersion` | int | Eşzamanlılık |
| `CreatedAt`, `UpdatedAt` | DateTime | |

Hesaplanan alan (DTO'da, saklanmaz): `NeedsRerender = RenderedVersionNo != null && ApprovedVersionNo > RenderedVersionNo`. Senaryo yayından sonra düzeltildiyse panelde "yeniden render gerekir" rozeti çıkar.

Ara tablo `CampScriptLessonSub (ScriptId, LessonSubId)`: KPSS'te aynı dersin öteki düzeylerdeki konuları (`alsoTeaches`).

### 4.3 `CampScriptVersion`: senaryonun bir sürümü (değişmez)

| Alan | Tür | Açıklama |
|---|---|---|
| `Id` | Guid | |
| `ScriptId` | Guid → `CampScript` | |
| `VersionNo` | int | 1, 2, 3… `(ScriptId, VersionNo)` benzersiz |
| `BaseVersionNo` | int? | Hangi sürümün üstüne yazıldı. Geri dönüşte dönülen sürüm. |
| `Content` | nvarchar(max) | Senaryonun tam JSON'u (LessonScript). TYT Matematik dersi yaklaşık 150–300 KB. Üst sınır önerisi 2 MB. |
| `ContentHash` | string(64) | SHA-256. Motor, render öncesinde yereldeki dosyanın onaylı sürümle aynı olduğunu bununla doğrular. |
| `SchemaVersion` | string(20) | Motorun senaryo şeması sürümü (ör. "2026-11-09") |
| `Author` | `CampActor` | Claude / Admin |
| `AdminId` | Guid? | |
| `Origin` | `CampVersionOrigin` | §5.6 |
| `ChangeSummary` | string(2000) | Ne değişti (sürüm listesinde görünür): "s3-c4 adım 2 düzeltildi; Olasılık s3-c4 açıklaması" |
| `Reason` | string(2000)? | Neden |
| `ResolvesCommentIdsJson` | string? | Bu sürümün kapattığı yorumlar |
| `Model` | string(40)? | "claude-opus-5-5" (API ile yazıldıysa) |
| `CostUsd` | decimal(8,2)? | |
| `EstimatedSeconds` | int? | Motorun tahmin ettiği anlatım süresi. Panel 20–35 dk (büyük konu ≤ 40 dk) kuralını renkle gösterir. |
| `StatsJson` | string? | `{sections, concept, example, rule, mistake, question, visual, predict, practice, shortSeconds}` |
| `CheckState` | `CampCheckState` | §5.4 |
| `CheckReportJson` | string? | `{issues:[], suggestions:[], stillScreens:[], warnings:[], checkedAt, engineCommit}` |
| `CheckedAt` | DateTime? | |
| `CreatedAt` | DateTime | |

Sürüm değişmez. Yalnız denetim alanları (`CheckState`, `CheckReportJson`, `CheckedAt`) sonradan yazılabilir: admin sürümüne motor raporu eklenir.

### 4.4 `CampScriptMikro`: sürümün mikro kapsaması

Sunucu, sürüm kaydedilirken JSON'daki bölüm kodlarından bu tabloyu doldurur.

| Alan | Tür | Açıklama |
|---|---|---|
| `VersionId` | Guid → `CampScriptVersion` | |
| `LessonMikroId` | Guid → `LessonMikro` | |
| `SectionIndex` | int | Mikronun işlendiği bölüm (1'den başlar) |
| `SectionTitle` | string(120) | |

Panel bu tabloyla konunun bütün LessonMikro'larını listeler: işlenenler bölüm numarasıyla, eksikler kırmızı. Eksik mikro sürümü engellemez; aynı ders içinde başka bir konuda işleniyorsa motor zaten bilir. Ama sahibin görmesi gerekir.

### 4.5 `CampScriptComment`: karta bağlı yorum

Tek bir red notu yetmiyor; SocialHub'da 28 red notunu ayrıştırmak zor oldu. Yorum senaryonun bir yerine bağlanır.

| Alan | Tür | Açıklama |
|---|---|---|
| `Id` | Guid | |
| `ScriptId` | Guid → `CampScript` | |
| `VersionNo` | int | Yorumun yazıldığı sürüm |
| `Anchor` | string(120)? | Yer: `s3-c4` (bölüm 3, kart 4), `s3-c4.steps[2]`, `hook`, `opening`, `summary`, `short.rounds[1]`, `camp.task`. Boşsa genel yorum. |
| `Field` | string(60)? | `narration`, `stem`, `options`, `steps`, `explanation`… |
| `Quote` | string(500)? | Yorumlanan metin parçası; sonraki sürümlerde yeri bununla bulunur |
| `Body` | string(4000) | |
| `Kind` | `CampCommentKind` | §5.7 |
| `Status` | `CampCommentStatus` | §5.7 |
| `Author` | `CampActor` | |
| `AdminId` | Guid? | |
| `ParentCommentId` | Guid? | Cevap (Claude'un "düzelttim, şöyle" cevabı ya da sahibin karşılığı) |
| `ResolvedInVersionNo` | int? | Hangi sürümde düzeldi |
| `CreatedAt`, `ResolvedAt` | DateTime / DateTime? | |

### 4.6 `CampHistory`: geçmiş

SocialHub'daki `SocialHubPostRevision`'ın kamp karşılığıdır.

| Alan | Tür | Açıklama |
|---|---|---|
| `Id` | Guid | |
| `CampId` | Guid | Kampın tüm geçmişi tek sorguda |
| `ScriptId` | Guid? | Kamp düzeyindeki işlemlerde boş |
| `VersionNo` | int? | İlgili sürüm |
| `Actor` | `CampActor` | |
| `Action` | `CampHistoryAction` | §5.8 |
| `Reason` | string(2000)? | |
| `Changes` | string(1000)? | Değişen alanlar, JSON: `["status","youtubeUrl"]` ya da `["content:s3-c4","content:short"]` |
| `AdminId` | Guid? | |
| `CreatedAt` | DateTime | |

---

## 5. Enum'lar ve durum geçişleri

### 5.1 `CampStatus`

| Değer | Ad | Anlamı |
|---|---|---|
| 0 | `Planned` | Ders listesi var, senaryolar yazılmadı |
| 1 | `InProduction` | Senaryolar yazılıyor ya da inceleniyor |
| 2 | `Publishing` | İlk ders yayında, seri sürüyor |
| 3 | `Completed` | Bütün dersler yayında |
| 4 | `Paused` | Sahip durdurdu |
| 5 | `Archived` | Kaldırıldı; panelde gizli |

Geçişleri admin yapar. Sunucu `Publishing` ve `Completed` durumlarını yayın bilgilerinden önerir.

### 5.2 `CampScriptKind`

| Değer | Ad |
|---|---|
| 0 | `CampIntro` (Bölüm 0) |
| 1 | `Lesson` (konu dersi) |

### 5.3 `CampScriptStatus`: senaryonun inceleme durumu

| Değer | Ad | Anlamı |
|---|---|---|
| 0 | `Draft` | Henüz sürümü yok ya da Claude hazırlıyor, incelemeye açılmadı |
| 1 | `InReview` | En son sürüm incelemeni bekliyor |
| 2 | `ChangesRequested` | Değişiklik istedin; açık yorumlar Claude'u bekliyor |
| 3 | `ClaudeRevising` | Claude tuttu, düzeltiyor; onay kilitli |
| 4 | `CheckRequired` | Sen düzenledin; motor denetimi gelmeden onaylanamaz |
| 5 | `Approved` | En son sürüm onaylı |
| 6 | `Archived` | Konu kamptan çıktı; sürümler durur, kayıt gizlenir |

Not: "Onaylı ama sonra yeni sürüm geldi" durumu ayrı bir değer değildir. Durum `InReview` olur, `ApprovedVersionNo` eski onaylı sürümü göstermeye devam eder. Render, yeni sürüm onaylanana kadar eski onaylı sürümle yapılabilir.

Geçişler:

| Nereden | Nereye | Kim | Uç |
|---|---|---|---|
| Draft, InReview, ChangesRequested, Approved | ClaudeRevising | Claude | `hold` |
| ClaudeRevising | InReview | Claude | yeni sürüm (`POST versions`) ya da `release` |
| Draft | InReview | Claude | ilk sürüm |
| InReview | Approved | Admin | `approve` (`versionNo` = en son sürüm). `ApprovedVersionNo` güncellenir. |
| InReview | ChangesRequested | Admin | `request-changes` (not zorunlu) |
| ChangesRequested | InReview | Claude | yeni sürüm (`resolvesCommentIds` ile) ya da `reply` (gerekçeli itiraz) |
| Approved | InReview | Admin | `revoke-approval` (`ApprovedVersionNo` bir önceki onaylı sürüme döner ya da boşalır) |
| herhangi biri (ClaudeRevising hariç) | CheckRequired | Admin | admin sürümü (`PATCH content` / `PUT content` / `restore`) |
| CheckRequired | InReview | Claude | `check-report` (denetim temiz) |
| CheckRequired | ClaudeRevising | Claude | `hold` (denetim sorun buldu; Claude düzeltip yeni sürüm yazar) |
| herhangi biri | Archived | Admin | `archive` |
| Archived | Draft / InReview | Admin | `unarchive` |

### 5.4 `CampCheckState`

| Değer | Ad |
|---|---|
| 0 | `NotChecked` |
| 1 | `Clean` (0 sorun, 0 öneri) |
| 2 | `HasSuggestions` (0 sorun, öneri var) |
| 3 | `HasIssues` (engelleyici sorun var; onay düğmesi uyarır, `force: true` ister) |

### 5.5 `CampPublishState`

| Değer | Ad | Anlamı |
|---|---|---|
| 0 | `NotRendered` | Video yok |
| 1 | `Rendered` | Claude render ettiğini bildirdi (`RenderedVersionNo`) |
| 2 | `Scheduled` | YouTube'da zamanlandı (link ve saat girildi) |
| 3 | `Published` | Yayında |
| 4 | `Unpublished` | YouTube'dan kaldırıldı ya da gizlendi |

### 5.6 `CampVersionOrigin`

| Değer | Ad |
|---|---|
| 0 | `ClaudeApi` (API/Batch ile yazıldı; model ve maliyet dolu) |
| 1 | `ClaudeManual` (Claude elle düzeltti) |
| 2 | `AdminEdit` (panelde alan düzeltmesi ya da tam JSON) |
| 3 | `Restore` (eski bir sürüme dönüş; `BaseVersionNo` dönülen sürüm) |
| 4 | `Imported` (ilk aktarımda git'ten) |

### 5.7 Yorumlar: `CampCommentKind`, `CampCommentStatus`

| `Kind` | | `Status` | |
|---|---|---|---|
| 0 | `ContentError` (yanlış bilgi, yanlış cevap, tuzak tutmuyor) | 0 | `Open` |
| 1 | `Language` (dil, okunuş, ton) | 1 | `Resolved` |
| 2 | `Pedagogy` (sıra, eksik mikro, sıkıcı ya da uzun bölüm) | 2 | `WontFix` (Claude gerekçe yazar; sahip kapatır ya da yeniden açar) |
| 3 | `Visual` (sahne/görsel isteği; altyapı oturumuna gider) | 3 | `Reopened` |
| 4 | `Other` | | |

### 5.8 `CampActor`, `CampHistoryAction`

- `CampActor`: 0 `Claude`, 1 `Admin`, 2 `System`.
- `CampHistoryAction`:

| Değer | Ad | Değer | Ad |
|---|---|---|---|
| 0 | `CampCreated` | 11 | `ApprovalRevoked` |
| 1 | `CampUpdated` | 12 | `ChangesRequested` |
| 2 | `ScriptCreated` | 13 | `CheckReported` |
| 3 | `ScriptUpdated` (başlık, sıra, konu) | 14 | `Commented` |
| 4 | `VersionCreated` | 15 | `CommentResolved` |
| 5 | `AdminEdited` | 16 | `Rendered` |
| 6 | `Restored` | 17 | `Scheduled` |
| 7 | `Held` | 18 | `Published` |
| 8 | `Released` | 19 | `Unpublished` |
| 9 | `Approved` | 20 | `Archived` |
| 10 | `StatusChanged` | 21 | `Unarchived` |

---

## 6. Claude uçları: `api/claude/camp`

Kimlik doğrulama SocialHub ile aynı şemadan yapılır (`ClaudeAuthenticationHandler`). Anahtar için önerim ayrı bir değer (`SINAVIKA_CAMP_KEY`); karar sahibin ve API oturumunun. Route tekil yazılır, takma ad açılmaz.

### 6.1 Ağaç ve kamp

| Uç | İş |
|---|---|
| `GET tree?category=YKS` | Kategori → alt kategori → LessonMain → kamp (varsa) → senaryolar (durum, sürümler, yayın) |
| `GET camps` | Kamplar ve durum sayıları |
| `GET camps/{slug}` | Kamp ve senaryoları (sıra, durum, en son ve onaylı sürüm, yayın bilgisi) |
| `POST camps/sync` | Motordaki `Curriculum/Camps/*.json` listesini toplu gönderir: kamp ve senaryo kaydı açar, başlık ve sırayı günceller (`dryRun=true` yalnız farkı döner). Silmez; motorda olmayan konuyu yalnız raporlar. |
| `GET lesson-subs/{id}/mikros` | Konunun mikro listesi (kod, ad, sıra). Senaryo yazımında kapsama denetimi için. |

### 6.2 Senaryo ve sürüm

| Uç | İş |
|---|---|
| `GET scripts?camp=&status=` | |
| `GET scripts/{id}` | Kayıt, sürüm listesi (içeriksiz), açık yorumlar |
| `GET scripts/{id}/versions/{no}` | Sürüm ve içeriği |
| `GET scripts/{id}/approved` | Onaylı sürümün JSON'u ve hash'i. Motor render öncesinde bunu yerele çeker. |
| `POST scripts/{id}/versions/validate` | Kuru deneme. Konu ve kamp kimliği, mikro kodları, boyut, hash, `baseVersionNo` ve "aynı içerik zaten var mı" denetlenir. Kaydetmez. |
| `POST scripts/{id}/versions` | Yeni sürüm. Gövde: `baseVersionNo`, `content`, `contentHash`, `schemaVersion`, `origin`, `changeSummary`, `reason`, `resolvesCommentIds[]`, `model?`, `costUsd?`, `estimatedSeconds`, `stats`, `checkReport`. Durum `InReview` olur. |
| `POST scripts/{id}/hold`, `release` | `reason`, `If-Match` |
| `POST scripts/{id}/versions/{no}/check-report` | Admin sürümünün motor denetimi. Temizse `CheckRequired → InReview`. |
| `PUT scripts/{id}/render` | Render bildirimi, dosyasız: `versionNo`, `renderedAt`, `note` (süre, AudioCheck özeti). Sürüm onaylı olmalı. |
| `PUT scripts/{id}/short-post` | Kısa videonun SocialHub gönderi kimliği |
| `GET todo` | Claude'un yapacakları: `ChangesRequested` senaryolar ve notları, açık yorumlar (yer ve alıntıyla), `CheckRequired` sürümler, yeniden render gerekenler (yalnız listelenir; render Render oturumunun işi). |

### 6.3 Yorum

| Uç | İş |
|---|---|
| `GET scripts/{id}/comments?status=` | |
| `POST scripts/{id}/comments` | Claude notu, ör. "şekil isteği altyapı oturumuna iletildi" |
| `POST comments/{id}/reply` | Cevap ya da gerekçeli itiraz |
| `POST comments/{id}/resolve` | `resolvedInVersionNo`, not |
| `POST comments/{id}/wont-fix` | Gerekçe zorunlu |

### 6.4 Yayın metni ve linkler

| Uç | İş |
|---|---|
| `PUT scripts/{id}/youtube-text` | YouTube başlık seçenekleri (A/B/C), açıklama, etiketler, bölüm zamanları (`-youtube.md`'nin karşılığı). Alanlar `CampScript`'e değil ayrı bir küçük tabloya yazılır: `CampScriptYouTubeText (ScriptId, TitleOptionsJson, ChosenTitle, Description, Tags, Chapters, UpdatedAt, RowVersion)`. Böylece sahip başlığı panelde seçer. |
| `GET camps/{slug}/links` | Yayınlanmış derslerin linkleri. Motor "Sıradaki ders", "Bölüm 0" ve kısa video açıklamasındaki "Dersin tamamı YouTube'da" satırlarını buradan doldurur; ders yayında değilse kısa video gönderilmez. |

### 6.5 Geçmiş

- `GET scripts/{id}/history`, `GET camps/{slug}/history?from=`.

---

## 7. Admin uçları: `api/admin/camp`

`[Authorize(Roles = "Admin")]`.

### 7.1 Ağaç ve pano

| Uç | İş |
|---|---|
| `GET tree?category=` | Panelin sol ağacı: Kategori → Alt kategori → Ders (kamp) → Konu (senaryo), her düğümde durum sayıları |
| `GET dashboard` | Seni bekleyen senaryolar (`InReview`), açık yorumlar, denetim bekleyenler, yeniden render gerekenler, bu hafta planlanan yayınlar |
| `GET review-queue` | İnceleme kuyruğu: kamp sırasına göre, en eski önce |

### 7.2 Kamp (tam CRUD)

| Uç | İş |
|---|---|
| `GET camps`, `GET camps/{id}` | Filtre: kategori, alt kategori, durum |
| `POST camps` | Yeni kamp (LessonMain seçilir; genelde motor `sync` ile gelir) |
| `PUT camps/{id}` | Ad, vaat, açıklama, oynatma listesi, planlanan başlangıç, KPSS düzeyleri (`If-Match`) |
| `PUT camps/{id}/status` | `CampStatus` geçişi |
| `PUT camps/{id}/order` | Senaryo sırası; numaralar yeniden verilir, yayınlanmış dersin numarası değişmez |
| `DELETE camps/{id}` | Yalnız hiç sürümü olmayan kamp; yoksa `Archived` |

### 7.3 Senaryo

| Uç | İş |
|---|---|
| `GET scripts?camp=&status=&checkState=&publishState=` | |
| `POST camps/{id}/scripts` | Konu ekle (LessonSub seçilir) |
| `PUT scripts/{id}` | Başlık, konu, numara, planlanan yayın günü (`If-Match`) |
| `GET scripts/{id}` | Kayıt, sürümler, mikro kapsama, açık yorumlar, YouTube metni |
| `GET scripts/{id}/versions/{no}` | Sürüm, içerik, istatistik, denetim raporu |
| `GET scripts/{id}/versions/{no}/readable` | Okunur görünüm: bölüm → kart → anlatım, soru, şıklar, cevap, adımlar. Sunucuda tek yerde üretilmesi önerilir; karar API oturumunun. |
| `GET scripts/{id}/diff?from=3&to=5` | Sürüm farkı, kart düzeyinde: eklenen, silinen ve değişen kartlar ve alanlar. İncelemeyi en çok hızlandıracak uç budur. |
| `GET scripts/{id}/mikros?version=` | Mikro kapsama: konunun bütün mikroları; işlendiği bölüm ya da "eksik" |
| `PATCH scripts/{id}/content` | Alan düzeltmesi. Gövde: `baseVersionNo`, `edits: [{path:"lesson.sections[2].cards[3].question.steps[1].narration", value}]`, `reason`. Yeni sürüm açar (`AdminEdit`), durum `CheckRequired`. |
| `PUT scripts/{id}/content` | Tam JSON ile yeni sürüm (ileri düzey); aynı sonuç |
| `POST scripts/{id}/restore` | `versionNo` sürümünün kopyasıyla yeni sürüm (`Restore`), durum `CheckRequired` (eski sürüm bugünkü kurallardan geçmeyebilir) |
| `POST scripts/{id}/approve` | `versionNo` (en son sürüm olmalı), `note?`, `force?` (`HasIssues` için) |
| `POST scripts/approve` | Toplu onay: `[{scriptId, versionNo}]` (ilk aktarım için) |
| `POST scripts/{id}/request-changes` | `note` zorunlu; yorumlar ayrıca |
| `POST scripts/{id}/revoke-approval` | `note` |
| `POST scripts/{id}/archive`, `unarchive` | |
| `DELETE scripts/{id}` | Yalnız hiç sürümü yoksa |

### 7.4 Yorum

- `POST scripts/{id}/comments` (yer, alan, alıntı, tür, metin)
- `POST comments/{id}/reply`
- `PUT comments/{id}` (yalnız kendi ve açık)
- `POST comments/{id}/close` (Resolved ya da WontFix'i kabul et)
- `POST comments/{id}/reopen`
- `DELETE comments/{id}` (yalnız kendi, cevapsız ve açık)

### 7.5 Yayın

| Uç | İş |
|---|---|
| `GET scripts/{id}/youtube-text`, `PUT scripts/{id}/youtube-text` | Başlık seç, açıklamayı düzelt |
| `POST scripts/{id}/scheduled` | `youtubeUrl`, `scheduledAt` |
| `POST scripts/{id}/published` | `youtubeUrl`, `publishedAt?`. Sunucu kimliği linkten çıkarır; `PublishedVersionNo = RenderedVersionNo`. |
| `POST scripts/{id}/unpublished` | Not zorunlu |
| `PUT scripts/{id}/youtube-url` | Link düzeltme |

### 7.6 Geçmiş

- `GET scripts/{id}/history`, `GET camps/{id}/history`.

---

## 8. Sunucu doğrulamaları

1. Kampın `LessonMainId`'si gerçek ve etkin olmalı. Bir LessonMain'in en çok bir kampı olur.
2. Senaryonun `LessonSubId`'si kampın LessonMain'ine ya da `CampLessonMain`'deki birine bağlı olmalı.
3. Sürüm içeriğinde:
   - `topic.id` senaryonun `LessonSubId`'si ile, `camp.id` kampın `Slug`'ı ile aynı olmalı;
   - bölümlerdeki `subtopic`/`subtopics` kodları o konunun LessonMikro kodları olmalı (bilinmeyen kod 400 döner).

   Sunucu JSON'un yalnız bu alanlarını okur.
4. `ContentHash`, gövdenin SHA-256'sı ile tutmalı. En son sürümle aynı hash'teki yeni sürüm 409 döner (boş sürüm açılmaz).
5. `baseVersionNo` en son sürüm değilse 409 `{latestVersionNo}`.
6. Onay yalnız en son sürüme verilir. `CheckRequired` ya da `ClaudeRevising` iken onay 409; `HasIssues` iken `force` olmadan 409.
7. Render bildirimi yalnız onaylı sürüme yapılır.
8. YouTube linki `youtube.com/watch?v=`, `youtu.be/`, `youtube.com/live/` ya da `youtube.com/shorts/` biçiminde olmalı; kimlik 11 karakter. Başlık en çok 100, açıklama en çok 5000 karakter.
9. Claude değişikliklerinde `reason`, "değişiklik iste" işleminde `note` zorunlu; durum değiştiren her işlem `If-Match` ister.
10. Sürüm, yorum ve geçmiş satırı silinmez. Senaryo yalnız hiç sürümü yoksa silinir.

---

## 9. Motor tarafı (bu oturumun yapacağı istemci)

API canlıya çıkınca motora `npm run camp -- …` eklenir. `scripts/SocialHub.ts` ve `src/Social/SocialHubClient.ts` örnek alınır.

| Komut | İş |
|---|---|
| `camp sync [--dry]` | `Curriculum/Camps/*.json` → `camps/sync` |
| `camp push <Konu.json> --summary "…" --reason "…"` | Önce `camp_check`. Sorunlu senaryo gönderilmez. Rapor, istatistik, süre ve hash ile yeni sürüm açar. |
| `camp pull <kamp\|konu> [--approved]` | Sunucudaki sürümü `Curriculum/Scripts`'e yazar (sahibin düzeltmeleri git'e de girer; commit kullanıcının) |
| `camp todo` | Değişiklik istenenler, açık yorumlar (yer ve alıntıyla), denetim bekleyen admin sürümleri |
| `camp check-admin-edits` | `CheckRequired` sürümleri çeker, denetler, raporu gönderir |
| `camp rendered <iş.json>` | Render bildirimi (sürüm, süre, AudioCheck özeti); dosya gönderilmez |
| `camp youtube-text <iş.json>` | `-youtube.md` metnini gönderir |
| `camp links <kamp>` | Yayın linklerini çeker, açıklamalardaki "(yayın linki)" yerlerini doldurur |

Render kapısı: `npm run render`, kamp işinde yereldeki senaryonun hash'i **onaylı sürümün hash'i** ile aynı değilse durur. Böylece onaylanmamış senaryo render edilmez. Render, Render oturumunun işidir; kapı yalnız denetler.

---

## 10. İlk aktarım

1. `camp sync`: 29 kamp ve konuları.
2. Bütün senaryolar sürüm 1 (`Imported`) olarak gönderilir; durum `InReview`.
3. Sahip kamp kamp toplu onaylar ya da tek tek inceler. Önerim:
   - TYT Matematik'in yeni 23 dersi tek tek incelensin, çünkü baştan yazıldılar;
   - ötekiler toplu onaylansın.
4. Yayında olan dersler (Bölüm 0'lar, TYT Türkçe) için:
   - sahip linkleri girer;
   - Claude render bildirimini eski sürümle yapar;
   - yeni sürüm onaylanınca "yeniden render gerekir" rozeti çıkar.

---

## 11. İleride: video yükleme (şimdi yok)

Sahip 10 Kasım'da askıya aldı: 4K ders 1–3 GB, Blob şişer. Eklenince yapı şöyle olur:
- `CampVideo` (senaryo sürümüne bağlı, 1080p önizleme, kapak, render raporu, inceleme durumu) ve `CampVideoComment` (dakikaya bağlı not).
- Dosya API'den geçmez. Yalnız yazma izinli kısa ömürlü Blob bağlantısı (SAS) ile doğrudan yüklenir, sonra "tamamla" ucu doğrular.
- Yalnız önizleme yüklenir. 4K ana dosya yerelde kalır; YouTube'a sahip yükler.

Bugünkü tasarım buna hazır: `RenderedVersionNo` ve `PublishState` alanları, video tablosu gelince ona taşınır.

---

## 12. Açık sorular (sahibin kararı)

1. **Anahtar:** SocialHub anahtarı mı, ayrı anahtar mı (`SINAVIKA_CAMP_KEY`)? Önerim ayrı.
2. **Admin düzenlemesi:** Panelde yalnız alan düzeltmesi (`PATCH`) yeterli mi, yoksa tam JSON düzenleyici de olsun mu? Önerim önce alan düzeltmesi: okunur görünümde bir metne tıkla, düzelt, kaydet.
3. **Eksik mikro:** Senaryonun işlemediği bir mikro konu onayı engellesin mi, yalnız uyarsın mı? Önerim uyarsın; bazı mikrolar başka derste işleniyor.
4. **Kısa video (CampShort):** Senaryo JSON'unun içinde (`short` alanı), aynı sürümle onaylanıyor. Ayrı onay istenir mi? Önerim aynı onay yeter; paylaşımı SocialHub'da ayrıca onaylanıyor.
