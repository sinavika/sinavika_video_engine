import React from 'react';
import {DuoCentered, DuoInner, DuoOuter} from './Parts/Duo';
import {DUO_EXTRA} from './Screens/Duo/DuoPoses';
import type {ModuleKey} from './ModuleIdentity';
import * as Account from './Screens/Mobile/Account';
import * as Assist from './Screens/Mobile/Assist';
import * as Auth from './Screens/Mobile/Auth';
import * as Exam from './Screens/Mobile/Exam';
import * as Gaps from './Screens/Mobile/Gaps';
import * as Insights from './Screens/Mobile/Insights';
import {HubDayDoneScreen, HubExpiredScreen, HubNoPlanScreen, HubScreen, HubScrolledScreen, HubTipScreen} from './Screens/Mobile/Hub';
import * as Tests from './Screens/Mobile/Learn';
import * as Lessons from './Screens/Mobile/Lessons';
import * as Notif from './Screens/Mobile/Notifications';
import * as Steps from './Screens/Mobile/LessonSteps';
import * as States from './Screens/Mobile/States';
import * as Onb from './Screens/Mobile/Onboarding';
import * as Plan from './Screens/Mobile/Plan';
import * as Sino from './Screens/Mobile/SinoAI';
import * as SiteP from './Screens/Site/Site';
import * as TLearn from './Screens/Tablet/Learn';
import * as TSolve from './Screens/Tablet/Solve';
import * as TParity from './Screens/Tablet/Parity';
import * as TWide from './Screens/Tablet/Wide';
import * as WAssist from './Screens/Web/AssistWeb';
import * as WExam from './Screens/Web/ExamWeb';
import * as WGaps from './Screens/Web/GapsWeb';
import * as WLessons from './Screens/Web/LessonsWeb';
import * as WOnb from './Screens/Web/OnboardingWeb';
import * as WPanel from './Screens/Web/Panel';
import * as WPlan from './Screens/Web/PlanWeb';
import * as WSino from './Screens/Web/SinoWeb';
import * as WStudy from './Screens/Web/StudyWeb';
import * as WTests from './Screens/Web/TestsWeb';
import * as Watch from './Screens/Watch/Watch';
import * as Share from './Screens/Share/ShareCards';
import * as Print from './Screens/Print/StatsReport';

/**
 * Every UI/UX drawing, by id. The export (`npm run uiux`), the boards and the
 * screen inventory (docs/UIUX/Ekran-Envanteri.md) read this list.
 *
 * Ids: m-<group>-<name> mobile, w-<group>-<name> web panel, s-<name> site, t-<group>-<name> tablet, f-dis|ic-<name> iPhone Duo (outer / inner display),
 * k-<apple|wear>-<name> watch (kol saati), p-<card>-<hikaye|gonderi> share cards (paylaşım), r-<document>-<page> PDF pages (rapor, A4).
 * `route` names the screen in the app (mobile route name or web path), so a
 * drawing maps to the code that draws it. `note` says what the screen does.
 */
export type UIPlatform = 'mobile' | 'web' | 'site' | 'tablet' | 'fold' | 'watch' | 'share' | 'print';

export type UIScreen = {
	id: string;
	platform: UIPlatform;
	/** Board the drawing belongs to. */
	group: string;
	title: string;
	/** The module the screen belongs to, if any. */
	module?: ModuleKey;
	/** Mobile route name or web path in the app. */
	route: string;
	/** What the screen does, one or two sentences. */
	note: string;
	Component: React.FC;
	/** Site pages: full page height in points. */
	height?: number;
	/** Tablet screens drawn upright (834 × 1194) instead of landscape. */
	portrait?: boolean;
	/** iPhone Duo: outer display upright (466 × 678), inner open wide (951 × 669) or inner held tall (669 × 951). */
	pose?: 'outer' | 'inner' | 'innerTall';
	/** Watch screens on a round Wear OS face (227 × 227) instead of Apple Watch (208 × 248); share cards as a 1080 × 1080 post instead of a 1080 × 1920 story. */
	round?: boolean;
};

const mobile = (id: string, group: string, title: string, route: string, Component: React.FC, note = '', module?: ModuleKey): UIScreen => ({id, platform: 'mobile', group, title, route, Component, note, module});
const web = (id: string, group: string, title: string, route: string, Component: React.FC, note = '', module?: ModuleKey): UIScreen => ({id, platform: 'web', group, title, route, Component, note, module});
const site = (id: string, group: string, title: string, route: string, Component: React.FC, height: number, note = ''): UIScreen => ({id, platform: 'site', group, title, route, Component, note, height});
const watch = (id: string, group: string, title: string, route: string, Component: React.FC, note = '', round?: boolean, module?: ModuleKey): UIScreen => ({id, platform: 'watch', group, title, route, Component, note, module, round});
const share = (id: string, title: string, Component: React.FC, note: string, square: boolean, module?: ModuleKey): UIScreen => ({id, platform: 'share', group: 'Paylaşım kartları', title, route: 'ShareCard (mobil: görünümden PNG · web: next/og)', Component, note, module, round: square});
const print = (id: string, group: string, title: string, route: string, Component: React.FC, note: string): UIScreen => ({id, platform: 'print', group, title, route, Component, note});
const tablet = (id: string, group: string, title: string, route: string, Component: React.FC, note = '', module?: ModuleKey, portrait?: boolean): UIScreen => ({id, platform: 'tablet', group, title, route, Component, note, module, portrait});

const BASE_SCREENS: UIScreen[] = [
	mobile('m-hub-moduller', 'Modüller', 'Modüller (ana ekran)', 'ModuleHubHome', HubScreen, 'Ana ekran (5 Kas 2026 revizyonu; 17 Kas sahip kararları): önce “bugün ne yapacağım”. Selamın üstünde tarih yok; hedef selamın karşısında, seri hedefin altında. Hafta şeridi (bugünün halkası); günün planı ve sıradaki görev tek düğmeyle; iki eylem kartı (kaldığın yer, sıradaki deneme); modüller üç sütun. Veri: engagement/today, study-plan calendar, works continue, yaklaşan deneme.'),
	mobile('m-hub-moduller-kaydir', 'Modüller', 'Modüller · aşağı kaydırılmış', 'ModuleHubHome', HubScrolledScreen, 'Modüller ızgarası, SinoAI, Bugün tekrar (Dersler adımları + Bilgi Kartları) ve Destek.'),
	mobile('m-hub-ipucu', 'Modüller', 'İlk açılış ipucu', 'ModuleHubHome', HubTipScreen, 'İlk açılışta tek ipucu, günün planı kartında. Tur yok.'),
	mobile('m-hub-plansiz', 'Modüller', 'Ana ekran · planı olmayan öğrenci', 'ModuleHubHome', HubNoPlanScreen, 'Plan kartı kayıttaki cevapları gösterir ve tek düğmeyle planı hazırlar; ilk konu plansız da başlar.'),
	mobile('m-hub-gun-bitti', 'Modüller', 'Ana ekran · günün planı bitti', 'ModuleHubHome', HubDayDoneScreen, 'Bitti kartı: görev, dakika, seri; Yarına bak ve isteğe bağlı fazladan 10 soru.'),
	mobile('m-hub-abonelik-bitti', 'Modüller', 'Ana ekran · deneme süresi bitti', 'ModuleHubHome', HubExpiredScreen, 'Ödeme yoksa erişim yok: ilerleme korunur, modüller kilitli; Paketleri gör ve mağaza alımını geri yükle.'),
	mobile('m-giris-karsilama', 'Giriş ve kayıt', 'Karşılama', '—', Auth.WelcomeScreen, 'Oturumu kapatmış öğrencinin karşılaması: modül slaytlarıyla ürün bir bakışta; Başlayalım ve Zaten hesabım var. Uygulamanın ilk açılışı m-onb-0-karsilama’dır.'),
	mobile('m-giris-oturum-ac', 'Giriş ve kayıt', 'Oturum aç veya kaydol', 'AuthLogin', Auth.SignInScreen, 'E-posta ve şifreyle açılır; “E-postama kod gönder” ikincil. Apple ve Google üstte.'),
	mobile('m-giris-kod', 'Giriş ve kayıt', 'Doğrulama kodu', 'AuthLogin', Auth.SignInCodeScreen, '6 kutulu kod, yeniden gönderme süresi, şifreyle giriş seçeneği.'),
	mobile('m-kayit-eposta', 'Giriş ve kayıt', 'Hesap oluştur', 'AuthRegister', Auth.SignUpScreen, 'Apple ve Google önde; e-postayla devam edene kod gider.'),
	mobile('m-sifre-unuttum', 'Giriş ve kayıt', 'Şifremi unuttum', 'AuthForgotPassword', Auth.ForgotPasswordScreen, ''),
	mobile('m-sifre-yeni', 'Giriş ve kayıt', 'Kod ve yeni şifre', 'AuthForgotPassword', Auth.NewPasswordScreen, ''),
	mobile('m-giris-sayfa', 'Giriş ve kayıt', 'Misafir · hesap gerekli', 'AuthEntrySheet', Auth.AuthSheetScreen, 'Misafir hesap isteyen bir şeye dokununca alt sayfa açılır; her bağlamda aynı: marka tonunda kişi simgesi, modül simgesi yok.'),
	mobile('m-onb-0-karsilama', 'Onboarding', 'Onboarding 0 · Karşılama', 'Onboarding · OnboardingWelcomeStep', Gaps.OnbWelcomeScreen, 'Uygulamanın ilk ekranı: tek cümle, iki örnek kart (kaldığın yer, deneme), Başlayalım ve Hesabım var.'),
	mobile('m-onb-0-bolge', 'Onboarding', 'Onboarding 0 · Bölge', 'Onboarding · OnboardingRegionStep', Gaps.OnbRegionScreen, 'Yalnız cihaz bölgesi belirsizse: Türkiye (YKS, KPSS) ya da United States (SAT, ACT).'),
	mobile('m-onb-1-sinav', 'Onboarding', 'Onboarding 1 · Sınav ve oturum', 'Onboarding · OnboardingCategoryExamStep', Onb.OnbExamScreen, 'Sınav, oturumlar ve puan türü tek ekranda. Seçili olan koyu çerçeve ve tikle gösterilir.'),
	mobile('m-onb-2-net', 'Onboarding', 'Onboarding 2 · Mevcut ve hedef net', 'Onboarding · OnboardingStudyNetStep', Onb.OnbScoreScreen, 'Tek kaydırıcı ve gerçekçilik yorumu. Netini bilmeyen öğrenci için “Netimi bilmiyorum”.'),
	mobile('m-onb-3-tempo', 'Onboarding', 'Onboarding 3 · Tempo ve günler', 'Onboarding · OnboardingStudyTempoStep', Onb.OnbTempoScreen, 'Saat ve soru sayısı hazır tempo kartlarında; günler kısaltmalarıyla (Pzt … Paz).'),
	mobile('m-onb-4-dersler', 'Onboarding', 'Onboarding 4 · Zorlandığın dersler', 'Onboarding · OnboardingStudyWeakStep', Onb.OnbWeakScreen, 'İsteğe bağlı; planda bu derslere daha çok yer ayrılır.'),
	mobile('m-onb-5-plan', 'Onboarding', 'Onboarding 5 · Planın hazır', 'Onboarding · plan özeti (OnboardingStudyWeakStep sonrası)', Onb.OnbPlanScreen, 'Ayrı adım, ödemeden önce (mobil 5/5). Hafta modül renkleriyle; ilk görev kartında ok yok, ödeme öncesi görev açılmaz.'),
	mobile('m-onb-7-deneme', 'Onboarding', '3 gün ücretsiz', 'Onboarding · OnboardingTrialStep', Onb.OnbTrialScreen, 'Bugün, hatırlatma günü ve ücret günü açıkça. Ödemeden sonra ana ekran açılır; ilk konu kendiliğinden açılmaz. Hesap adımı yok: mağaza satın alması hesapsız.'),
	mobile('m-onb-8-bildirim', 'Onboarding', 'Bildirim izni · ilk çalışmadan sonra', '—', Onb.OnbNotificationsScreen, 'İzin, ilk çalışma bitince ve hatırlatmanın değeri belliyken istenir; sistem penceresinden önce kendi açıklamamız.'),
	mobile('m-deneme-vitrin', 'Denemeler', 'Denemeler', 'ExamDashboard', Exam.ExamHomeScreen, 'Aylık deneme setinden şerit (yaklaşan: tarih, kalan süre, Hatırlat; açık: Canlı, kapanış, Başla), devam eden deneme (1 saat 14 dk kaldı), Bu ay sırada.', 'exam'),
	mobile('m-deneme-katalog', 'Denemeler', 'Tüm denemeler', 'ExamDashboard (tüm denemeler)', Exam.ExamCatalogScreen, '', 'exam'),
	mobile('m-deneme-detay', 'Denemeler', 'Deneme detayı', 'ExamStudentPublicDetail', Exam.ExamDetailScreen, 'Yaklaşan: Açılış Cumartesi 10:00 · kalan süre, Hatırlat (tek dokunuş; yeniden dokunmak kapatır).', 'exam'),
	mobile('m-deneme-detay-acik', 'Denemeler', 'Deneme detayı · açık', 'ExamStudentPublicDetail', Exam.ExamDetailOpenScreen, 'Açık · kapanmasına kalan süre ve Başla.', 'exam'),
	mobile('m-deneme-detay-kapali', 'Denemeler', 'Deneme detayı · süre dışında', 'ExamStudentPublicDetail', Exam.ExamDetailClosedScreen, 'Pencere dışında Başla pasif, nedeni üstünde.', 'exam'),
	mobile('m-deneme-detay-bitti', 'Denemeler', 'Biten denemenin detayı', 'ExamStudentPublicDetail', Exam.ExamDoneDetailScreen, 'Canlı hata #3: biten denemede “Denemeye gir” ve hatırlatma yok; önce sonuç, sonra Sonuç belgesi, Çözümler, Analiz ve net kaybettiren konular.', 'exam'),
	mobile('m-deneme-baslangic', 'Denemeler', 'Başlamadan önce', 'ExamStudentStarting', Exam.ExamStartingScreen, '', 'exam'),
	mobile('m-deneme-coz', 'Denemeler', 'Deneme çözme', 'ExamStudentSolve', Exam.ExamSolveScreen, 'Odak modu: sekme çubuğu yok, süre ve soru haritası üstte. Cevap teslime kadar değişir ve boşaltılır; çıkış her zaman ara ver penceresi, iptal yolu yok. Doğru ve yanlış teslimden sonra açılır.', 'exam'),
	mobile('m-deneme-teslim', 'Denemeler', 'Teslim onayı', 'ExamStudentSolve', Exam.ExamSubmitScreen, 'Gri sistem penceresi yerine uygulamanın alt sayfası: cevaplı, boş, işaretli sayıları ve boş soruların numaraları; Boşlara dön / Teslim et.', 'exam'),
	mobile('m-deneme-baglanti', 'Denemeler', 'Deneme · bağlantı koptu', 'ExamStudentSolve', States.ExamOfflineScreen, 'Ortak “gönderilecek” görünümü: seçilen şık kilitli, altında nötr satır; süre işler, bağlanınca kendiliğinden gönderilir.', 'exam'),
	mobile('m-deneme-denemelerim', 'Denemeler', 'Denemelerim', 'MyExams · ExamMyExams', Exam.MyExamsScreen, 'Yaklaşan, devam eden ve biten denemeler; takvim aynı sekmede.', 'exam'),
	mobile('m-deneme-ay', 'Denemeler', 'Geçmiş ay', 'ExamMonth', Gaps.ExamMonthScreen, 'Geçmiş bir ayın deneme haritası: girilenlerin neti, sonuç ve çözüm; kaçırılan yazılı.', 'exam'),
	mobile('m-deneme-sonuclar', 'Denemeler', 'Sonuçlar', 'ExamResultsHub · ExamResultsList', Exam.ExamResultsScreen, 'Net gelişimi sütunlarla (değer sütunun üstünde, dışarıda çözülen çizgili), üç giriş: Sınavika denemelerim, Analizlerim, Deneme ekle; son sonuçlar.', 'exam'),
	mobile('m-deneme-sonuclar-disarida', 'Denemeler', 'Sonuçlar · dışarıda çözülen', 'ExamResultsHub', Exam.ExamResultsExternalScreen, 'Çizgili sütuna dokununca: ne olduğu ve Sil (onaylı).', 'exam'),
	mobile('m-deneme-sonuclar-bos', 'Denemeler', 'Sonuçlar · henüz deneme yok', 'ExamResultsHub · ExamResultsList', States.ExamResultsEmptyScreen, 'İlk denemeden önce: ne birikeceği, sıradaki deneme ve Deneme ekle.', 'exam'),
	mobile('m-deneme-ekle', 'Denemeler', 'Deneme ekle', 'ExamExternalResult', Exam.ExamAddExternalScreen, 'Dışarıda çözülen denemenin sonucu (yayın, ad, tarih, ders ders doğru/yanlış, net canlı hesaplanır). API: student/external-exams.', 'exam'),
	mobile('m-deneme-sonuc', 'Denemeler', 'Sonuç', 'ExamResultDocument · ExamResults', Exam.ExamResultScreen, '', 'exam'),
	mobile('m-deneme-analiz', 'Denemeler', 'Eksik konu analizi', 'ExamStatsLessonOverview · ExamStatistics', Exam.ExamAnalysisScreen, 'Analiz eylemle biter: konu anlatımı, konunun testinin gerçek soru sayısı (test yoksa pasif), plana ekle.', 'exam'),
	mobile('m-deneme-analiz-eklendi', 'Denemeler', 'Eksik konu analizi · plana eklendi', 'ExamStatsLessonOverview', Exam.ExamAnalysisAddedScreen, 'Düğme modül yumuşak tonunda Planına eklendi; kısa bildirim.', 'exam'),
	mobile('m-deneme-gelisim', 'Denemeler', 'Ders gelişimi', 'ExamStatsLessonTrend', Exam.ExamTrendScreen, '', 'exam'),
	mobile('m-deneme-net', 'Denemeler', 'Deneme neti', 'ExamStatsExamNet', Gaps.ExamNetScreen, 'Toplam net, ders ders D/Y/B ve net kaybettiren konular (Konuyu çalış, Test).', 'exam'),
	mobile('m-deneme-cozumler', 'Denemeler', 'Çözümler', 'ExamSolutionExamCards', Exam.ExamSolutionsScreen, '', 'exam'),
	mobile('m-deneme-cozum', 'Denemeler', 'Soru çözümü', 'ExamSolutionBookletReview', Exam.ExamBookletScreen, 'Tümü / Yanlışlar · N / Boşlar · N sorunun üstünde, Yanlışlar ile açılır; koyu SinoAI’ye sor, altında Derse git.', 'exam'),
	mobile('m-ders-vitrin', 'Dersler', 'Dersler', 'WorkHome · WorkOverview', Lessons.LessonsHomeScreen, 'Kaydırılan slaytlar (Kaldığın yerden, Tekrar, Ders çalış), modülün haftası (istatistik kartı) ve sınavın dersleri yüzde ilerlemeyle (GET lessons).', 'lessons'),
	mobile('m-ders-ilk', 'Dersler', 'Dersler · ilk giriş', 'WorkHome · WorkOverview', States.LessonsFirstVisitScreen, 'Kaldığın yer henüz yok: kayıtta zorlandığın dersten ilk konu ve Dersler’in nasıl işlediği üç satırda.', 'lessons'),
	mobile('m-ders-konular', 'Dersler', 'Konular', 'WorkLesson · WorkCatalog', Lessons.LessonsTopicsScreen, 'Ders hapları, Tümü / Süren / Biten süzgeci; konular müfredat sırasıyla: adım sayısı, süre, yüzde ilerleme ve ilk denemede doğru. Konuya basınca oynatıcı kaldığın yerden açılır.', 'lessons'),
	mobile('m-ders-tekrar', 'Dersler', 'Tekrar', 'WorkReviewHome · WorkReview', Lessons.LessonsReviewScreen, 'İlk denemede yanlış yapılan adımlar 1, 3 ve 7 gün sonra; her adım tek denemede.', 'lessons'),
	mobile('m-ders-tekrar-bos', 'Dersler', 'Tekrar · bugün yok', 'WorkReviewHome', States.LessonsReviewEmptyScreen, 'Sıradaki tekrarın günü ve adım sayısı; kaldığın derse dönüş.', 'lessons'),
	mobile('m-ders-tekrar-oturum', 'Dersler', 'Tekrar oturumu', 'WorkReviewSession', Gaps.LessonReviewSessionScreen, 'Tekrarda bir adım: tekrar sırası, kaynağı, tek deneme; doğruysa bir sonraki aralık yazılır.', 'lessons'),
	mobile('m-ders-tanim', 'Dersler', 'Adım · Tanım', 'WorkMikro', Lessons.LessonConceptScreen, 'Concept: cümle sözcük kartlarında, vurgulu sözcüğün rolü; Dinle.', 'lessons'),
	mobile('m-ders-baglanti', 'Dersler', 'Oynatıcı · bağlantı yok', 'WorkMikro', Lessons.LessonOfflineScreen, 'Ortak “gönderilecek” görünümü (Dersler, Testler, Denemeler aynı): adım seçimle kilitli, doğru/yanlış yok; altında nötr satır “Bağlantı yok; cevabın kaydedildi. Bağlanınca gönderilecek.”; Devam açık. Tek merkezi kuyruk.', 'lessons'),
	mobile('m-ders-ornek', 'Dersler', 'Adım · Örnek', 'WorkMikro', Lessons.LessonExampleScreen, 'Example: örnek cümle, açıklama ve dikkat notu.', 'lessons'),
	mobile('m-ders-kural', 'Dersler', 'Adım · Kural', 'WorkMikro', Lessons.LessonRuleScreen, 'Rule: numaralı kural listesi.', 'lessons'),
	mobile('m-ders-gorsel', 'Dersler', 'Adım · Görsel', 'WorkMikro', Lessons.LessonVisualScreen, 'Visual: merkezi figür (burada karşılaştırma tablosu) ve kısa açıklama.', 'lessons'),
	mobile('m-ders-tahmin', 'Dersler', 'Adım · Önce sen tahmin et', 'WorkMikro', Lessons.LessonPredictScreen, 'Choice: seçimden sonra açıklama ve Gerçek/Mecaz karşılaştırması.', 'lessons'),
	mobile('m-ders-dogru-yanlis', 'Dersler', 'Adım · Doğru mu, yanlış mı?', 'WorkMikro', Lessons.LessonTrueFalseScreen, 'TrueFalse: sık yapılan hata yargı olarak sorulur; doğrusu ve nedeni.', 'lessons'),
	mobile('m-ders-grupla', 'Dersler', 'Adım · Grupla', 'WorkMikro', Steps.LessonGroupScreen, 'Gruplar alt alta, kutudaki metin tam (kesilmez), hedef sözcük koyu; kalan kart sayısı Kontrol et’in üstünde.', 'lessons'),
	mobile('m-ders-eslestir', 'Dersler', 'Adım · Eşleştir', 'WorkMikro', Steps.LessonMatchScreen, 'Eşleşen ikili aynı numarayı alır; Kontrol et sabit altta, kaydırmadan görünür.', 'lessons'),
	mobile('m-ders-cevir', 'Dersler', 'Adım · Çevir', 'WorkMikro', Steps.LessonFlipScreen, 'Arka yüzde içeriğin açıklaması da görünür; Biliyordum / Bilmiyordum kartın içinde.', 'lessons'),
	mobile('m-ders-sec', 'Dersler', 'Adım · Seç (sözcüğe dokun)', 'WorkMikro', Steps.LessonPickWordsScreen, 'Cümlenin sözcükleri dokunulabilir; seçilen sayısı yazılı.', 'lessons'),
	mobile('m-ders-coklu', 'Dersler', 'Adım · Çoklu seçim', 'WorkMikro', Steps.LessonMultiScreen, 'Sonuçta yanlış seçilen ve kaçırılan ayrı işaretli.', 'lessons'),
	mobile('m-ders-sirala', 'Dersler', 'Adım · Sırala', 'WorkMikro', Lessons.LessonOrderScreen, 'Order: basılı tutup sürükle ya da sırayla dokun; Baştan diz.', 'lessons'),
	mobile('m-ders-bosluk', 'Dersler', 'Adım · Boşluk doldur', 'WorkMikro', Lessons.LessonFillScreen, 'FillBlank: tek deneme; yanlışta doğru sözcük ve nedeni gösterilir, adım tekrar listesine girer.', 'lessons'),
	mobile('m-ders-yazmali', 'Dersler', 'Adım · Yazmalı boşluk', 'WorkMikro', Steps.LessonTypedBlankScreen, 'Satırdaki boşluk giriş alanının kendisi; klavye açıkken Kontrol et klavyenin üstünde.', 'lessons'),
	mobile('m-ders-formul', 'Dersler', 'Adım · Formül ve tablo', 'WorkMikro', Steps.LessonFormulaScreen, 'Kesir üst üste, eksi kesrin önünde; kök çizgisi içini örter; üs harfe yakın; tablo hücresi en az 15 pt.', 'lessons'),
	mobile('m-ders-soru', 'Dersler', 'Adım · Sınav tarzı soru', 'WorkMikro', Lessons.LessonQuestionScreen, 'Question: her yanlışta bir çözüm adımı açılır, öğrenci yeniden seçer; kalan deneme yazılı. SinoAI’ye sor.', 'lessons'),
	mobile('m-ders-sekilli-soru', 'Dersler', 'Adım · Şekilli soru', 'WorkMikro', Lessons.LessonFigureQuestionScreen, 'Question ve soru şekli (figure): şekil kökle birlikte, şıklardan önce.', 'lessons'),
	mobile('m-ders-konu-sonu', 'Dersler', 'Konu sonu', 'WorkSubSummary', Lessons.LessonTopicDoneScreen, 'İlk denemede doğru sayısı ve Paylaş; özet, dikkat notları, kamp görevi; Testler’in Kolay seviyesine geçiş (Testler renginde); Konuyu baştan oku, Konulara dön; içerik anketi (Beğendim / Beğenmedim).', 'lessons'),
	mobile('m-ders-hak', 'Dersler', 'Günlük konu hakkı', 'WorkSub (PAYWALL)', Lessons.LessonQuotaScreen, 'Abonelik yokken ya da günün konu hakkı bitince alt sayfa; metin konu adı içermez; arkada düz zemin (oynatıcı açılamadı, giriş ekranı yok). Ödeme marka yüzeyi olduğu için düğmesi turuncu.', 'lessons'),
	mobile('m-test-vitrin', 'Testler', 'Testler', 'QuizHome', Tests.TestsHomeScreen, 'Kaydırılan slaytlar (Senin için hazır, kaldığın yer, konular) ve noktalar; modül istatistik kartı; dersler çubuklu listede.', 'tests'),
	mobile('m-test-konular', 'Testler', 'Konular', 'QuizCatalog', Tests.TestsTopicsScreen, 'Bütün derslerin açılır ağacı; açık derste konular ve üç seviye.', 'tests'),
	mobile('m-test-detay', 'Testler', 'Test seviyeleri', 'QuizLessonSub · QuizOverview', Tests.TestOverviewScreen, 'Ders çipleri, konu, bu dersteki hafta kartı; Kolay, Orta, Zor · 20’şer soru; satırda Tekrar / Devam et / Başla ya da kilit.', 'tests'),
	mobile('m-test-coz', 'Testler', 'Doğru cevap', 'QuizSolve', Tests.TestSolveScreen, 'Anında geri bildirim (tek dokunuş): doğru şık, kısa çözüm; soru meta satırında İşaretle.', 'tests'),
	mobile('m-test-coz-yanlis', 'Testler', 'Yanlış cevap', 'QuizSolve', Tests.TestSolveWrongScreen, 'Doğru şık ve nedeni; konunun anlatımına (Dersler renginde) ya da SinoAI’ye geçiş.', 'tests'),
	mobile('m-test-baglanti', 'Testler', 'Bağlantı yok', 'QuizSolve', Tests.TestOfflineScreen, 'Cevap merkezi kuyrukta; seçili şık kalır, doğru/yanlış gönderilince görünür; ortak not ve Devam.', 'tests'),
	mobile('m-test-bitir-bekliyor', 'Testler', 'Testi bitir · bekleyen cevap', 'QuizSolve', Tests.TestFinishPendingScreen, 'Bekleyen cevap varken test bitmez; alt sayfada uyarı ve Tamam.', 'tests'),
	mobile('m-test-yanlislar', 'Testler', 'Yanlışlarım', 'QuizReview', Insights.TestWrongReviewScreen, 'İlk yanlıştan açılır; Yanlış / Boş / Tümü (boş süzgeç soluk, dokunulmaz); numara satırı yalnız süzgeçtekiler; İşaretli düğmesi; Bu soruyu paylaş, SinoAI’ye sor; konuyu çalış (Dersler renginde) ve Sonraki yanlış.', 'tests'),
	mobile('m-test-yanlislar-son', 'Testler', 'Yanlışlarım · son yanlış', 'QuizReview', Insights.TestWrongReviewLastScreen, 'Süzgeçteki son soruda ana düğme Bitti; Çözümler’e döner.', 'tests'),
	mobile('m-test-yanlislar-dogru', 'Testler', 'Yanlışlarım · yanlış yok', 'QuizReview', Insights.TestWrongReviewAllRightScreen, 'Yanlış yoksa ilk boştan, o da yoksa Tümü süzgeciyle 1. sorudan açılır; boş süzgeçler soluk.', 'tests'),
	mobile('m-test-bitti', 'Testler', 'Test bitti', 'QuizComplete', Tests.TestDoneScreen, '', 'tests'),
	mobile('m-test-cozumler', 'Testler', 'Çözümler', 'QuizSolutions · QuizReview', Tests.TestsSolutionsScreen, 'Tümü · Yanlışlar · N · İşaretli; tekrar testi satırı “Konu · Tekrar”; hazırsa tekrar testi kartı.', 'tests'),
	mobile('m-test-cozumler-isaretli', 'Testler', 'Çözümler · İşaretli', 'QuizSolutions', Tests.TestsSolutionsFlaggedScreen, 'İşaretli soru Yanlışlarım’da Tümü süzgeciyle açılır; bitmemiş testin sorusu kilitli: Test bitince açılır.', 'tests'),
	mobile('m-test-cozumler-bos', 'Testler', 'Çözümler · henüz test yok', 'QuizSolutions', States.TestsSolutionsEmptyScreen, 'Senin için hazır testle başla.', 'tests'),
	mobile('m-plan-bugun', 'Ders Planı', 'Bugün', 'StudyPlanHome', Plan.PlanTodayScreen, 'Örnek takvim yapısı: Gün/Hafta/Ay, modül süzgeçleri, hafta halkaları, günün yüzdesi ve süre; her görev kaynağını (sınav · ders · neden), konusunu, modül rozetini ve miktarını (soru, dakika, kart) ya da saatini söyler. + kendi görevin.', 'studyPlan'),
	mobile('m-plan-yok', 'Ders Planı', 'Planı olmayan öğrenci', 'StudyPlanHome (StudyPlanNoPlanEmpty)', States.PlanNoneScreen, 'Planın ne yaptığı, kayıt cevaplarından örnek bir gün; Planımı hazırla ya da kendim kurayım.', 'studyPlan'),
	mobile('m-plan-dunden', 'Ders Planı', 'Dünden kalan görevler', 'StudyPlanHome', States.PlanMissedScreen, 'Biten olmayan görev sessizce kaybolmaz: Bugüne ekle ya da haftaya yay (PATCH schedule).', 'studyPlan'),
	mobile('m-plan-gorev-ekle', 'Ders Planı', 'Görev ekle', 'StudyPlanManualTaskSheet', Plan.PlanAddTaskScreen, 'Kendi görevin: tür, ders ve konu, not, gün ve saat, süre (POST study-plan tasks).', 'studyPlan'),
	mobile('m-plan-gorev-islem', 'Ders Planı', 'Görev işlemleri', 'StudyPlanTaskActionSheet', Plan.PlanTaskActionScreen, 'Ana düğme görevin modülüne göre (Konuya başla, Testi başlat, Denemeye geç, Kartlara başla); odak sayacıyla başla (25 + 5 dk), yarına taşı, saati değiştir, yaptım, bugünden kaldır.', 'studyPlan'),
	mobile('m-plan-gorev-islem-kendi', 'Ders Planı', 'Görev işlemleri · kendi görevin', 'StudyPlanTaskActionSheet', Plan.PlanOwnTaskActionScreen, 'İçeriği olmayan görevde ana düğme Odak sayacıyla başla (25 dk + 5 dk mola); Yarına taşı, Saati değiştir, Yaptım, Bugünden kaldır.', 'studyPlan'),
	mobile('m-plan-odak', 'Ders Planı', 'Odak sayacı', 'StudyPlanFocus', Plan.PlanFocusScreen, '', 'studyPlan'),
	mobile('m-plan-ilerleme', 'Ders Planı', 'İlerleme', 'StudyPlanProgressHome', Plan.PlanProgressScreen, '', 'studyPlan'),
	mobile('m-plan-konu', 'Ders Planı', 'Konu ilerlemesi', 'StudyPlanLessonProgress', Plan.PlanLessonProgressScreen, '', 'studyPlan'),
	mobile('m-plan-program', 'Ders Planı', 'Program', 'StudyPlanSchedule · StudyPlanPlan', Plan.PlanScheduleScreen, 'Başlıkta Düzenle (Planım) ve Haftanı paylaş.', 'studyPlan'),
	mobile('m-plan-ayarlar', 'Ders Planı', 'Plan ayarları', 'StudyPlanCreate', Plan.PlanSettingsScreen, '', 'studyPlan'),
	mobile('m-ozet-vitrin', 'Akıllı Özet', 'Akıllı Özet', 'LensHome · LensAnalyses', Assist.SummaryHomeScreen, 'Geçmişte konu başlığı; başlıkta Kullanım %N (SinoAI ile ortak hak, aylık sayı yok); Tümü yok.', 'smartSummary'),
	mobile('m-ozet-yukle', 'Akıllı Özet', 'Soru yükle', 'LensNew · LensUpload', Assist.SummaryUploadScreen, 'Fotoğraf ya da galeri (PDF yok); Neler alacaksın? bilgi satırları.', 'smartSummary'),
	mobile('m-ozet-kamera', 'Akıllı Özet', 'Kamera', 'LensCamera', Assist.SummaryCameraScreen, 'Mod çipi yok; tek soru çekilir.', 'smartSummary'),
	mobile('m-ozet-isleniyor', 'Akıllı Özet', 'Analiz ediliyor', 'LensSessionProgress', Assist.SummaryProcessingScreen, 'İptal yok; kapatmak analizi durdurmaz.', 'smartSummary'),
	mobile('m-ozet-sonuc', 'Akıllı Özet', 'Çözüm', 'LensSessionDetail', Assist.SummaryResultScreen, 'Kart yapma yok; Konuyu çalış (Dersler · konu); Benzer 5 soru konunun testini açar; en altta Sorunun fotoğrafı.', 'smartSummary'),
	mobile('m-ozet-hak', 'Akıllı Özet', 'Aylık hak doldu', 'LensHome', States.SummaryQuotaScreen, 'Kullanım %100; yenilenme tarihi, geçmiş analizler açık; SinoAI’ye yönlendirme yok.', 'smartSummary'),
	mobile('m-ozet-okunamadi', 'Akıllı Özet', 'Fotoğraf okunamadı', 'LensUpload', States.SummaryFailedScreen, 'Neden ve üç çekim ipucu; hak düşmedi.', 'smartSummary'),
	mobile('m-ozet-pdf', 'Akıllı Özet', 'Analiz PDF', 'LensSessionPdf', Gaps.SummaryPdfScreen, 'PDF önizlemesi, sayfa sayısı; Paylaş ve PDF aç.', 'smartSummary'),
	mobile('m-ozet-video', 'Akıllı Özet', 'Video analizi', 'LensVideo', Assist.SummaryVideoScreen, '', 'smartSummary'),
	mobile('m-kart-vitrin', 'Bilgi Kartları', 'Bilgi Kartları', 'FlashcardMain', Assist.CardsHomeScreen, 'Sekmeler Kartlar · Bugün · Kaydedilenler. Dersler sınav başına bölümlü (başlık sınav adı, sağda N ders).', 'flashcards'),
	mobile('m-kart-vitrin-ilk', 'Bilgi Kartları', 'Bilgi Kartları · ilk kullanım', 'FlashcardMain', Assist.CardsHomeFirstScreen, 'N yeni kart seni bekliyor · Yeni kartlara başla; ders satırlarında Yeni.', 'flashcards'),
	mobile('m-kart-desteler', 'Bilgi Kartları', 'Ders · desteler', 'FlashcardLesson', Assist.CardsDecksScreen, 'Ders özeti (N deste · %X öğrenildi + halka); deste satırı: konu, x/y kart · %z, N zayıf.', 'flashcards'),
	mobile('m-kart-bugun', 'Bilgi Kartları', 'Bugün', 'FlashcardToday', Assist.CardsTodayScreen, '', 'flashcards'),
	mobile('m-kart-bugun-bos', 'Bilgi Kartları', 'Bugün · tekrar yok', 'FlashcardToday', Assist.CardsTodayEmptyScreen, 'Bugün tekrar edilecek kart yok · Derslere git.', 'flashcards'),
	mobile('m-kart-bitti', 'Bilgi Kartları', 'Bugün · kartlar bitti', 'FlashcardToday', States.CardsDoneScreen, 'Bugün modunda oturum sonu: kaç kart, kaçını bildin, yarın kaç kart; kart serisi.', 'flashcards'),
	mobile('m-kart-deste-bitti', 'Bilgi Kartları', 'Deste bitti', 'FlashcardSession', States.CardsDeckDoneScreen, 'Deste ve kaydedilenler oturumunun sonu; altında içerik anketi.', 'flashcards'),
	mobile('m-kart-on', 'Bilgi Kartları', 'Kart oturumu · ön yüz', 'FlashcardSession', Assist.CardSessionScreen, '', 'flashcards'),
	mobile('m-kart-arka', 'Bilgi Kartları', 'Kart oturumu · cevap', 'FlashcardSession', Assist.CardSessionBackScreen, '', 'flashcards'),
	mobile('m-kart-kaydedilen', 'Bilgi Kartları', 'Kaydedilenler', 'FlashcardSavedTab', Assist.CardsSavedScreen, 'Kaydettiğin N kart (yer imi); ders çipiyle süzülünce Kaydedilenleri tekrar et o dersle açılır.', 'flashcards'),
	mobile('m-sino-ana', 'SinoAI', 'SinoAI', 'SinoAi', Sino.SinoHomeScreen, '', 'sinoAi'),
	mobile('m-sino-sohbet', 'SinoAI', 'SinoAI · sohbet', 'SinoAiChat', Sino.SinoChatScreen, 'Yanıt eylemleri: yeniden üret, kopyala, paylaş, beğen, beğenme.', 'sinoAi'),
	mobile('m-sino-calisma', 'SinoAI', 'SinoAI · çalışma', 'SinoAiChat (Çalışma)', Sino.SinoStudyScreen, 'Deneme, tekrar kartları, test ve çalışma planı üretimi; kota yazılı.', 'sinoAi'),
	mobile('m-sino-sonuc', 'SinoAI', 'SinoAI · üretim sonucu', 'SinoAiChat (Çalışma sonucu)', Sino.SinoStudyResultScreen, 'Eylemler kartın içinde: Testi aç (Testler renginde), Değiştir.', 'sinoAi'),
	mobile('m-sino-kutuphane', 'SinoAI', 'SinoAI · kütüphane', 'SinoAiLibrary', Sino.SinoLibraryScreen, 'Tümü · Test · Deste · Özet sayılarla; satır N soru · ders · tarih; plan satırı yalnız Tümü’de.', 'sinoAi'),
	mobile('m-sino-kaynaklar', 'SinoAI', 'SinoAI · kaynaklarım', 'SinoAiSources', Gaps.SinoSourcesScreen, 'Kaynak ekle; okundu/okunuyor; 90 gün kuralı; çalışma notları.', 'sinoAi'),
	mobile('m-sino-not', 'SinoAI', 'SinoAI · çalışma notu', 'SinoAiStudyNote', Gaps.SinoStudyNoteScreen, 'Önemli noktalar ve terimler; Kart yap, Test üret; uyarı satırı.', 'sinoAi'),
	mobile('m-sino-menu', 'SinoAI', 'SinoAI · menü', 'SinoAiChat (menü)', Sino.SinoMenuScreen, 'Arama, yeni sohbet, kütüphane, Kaynaklarım, gün gün sohbetler; altta kullanım çubuğu ve SinoAI’den çık.', 'sinoAi'),
	mobile('m-sino-hak', 'SinoAI', 'SinoAI · aylık hak doldu', 'SinoAi', States.SinoLimitScreen, 'Hak aylık ve Akıllı Özet ile ortak: yenilenme tarihi, Kütüphaneme git, Bu arada kartı.', 'sinoAi'),
	mobile('m-profil', 'Profil ve hesap', 'Profil', 'ProfileMain', Account.ProfileScreen, 'Üç ölçü kartı yok; Hesabım: Hedefim, Kişisel bilgiler, Aboneliğim, İstatistiklerim; Uygulama: Görünüm, Dil, Bildirimler. Ayrı Paketler, İletişim tercihleri, Puanla satırı yok.'),
	mobile('m-profil-devam', 'Profil ve hesap', 'Profil · alt bölüm', 'ProfileMain', Account.ProfileMoreScreen, ''),
	mobile('m-istatistik', 'İstatistikler', 'İstatistiklerim', 'ProfileStatistics', Insights.StatisticsScreen, 'Bu hafta: süre, soru, seri; günlük çalışma modüllere göre yığılı; net gelişimi; derslere göre doğru oranı ve süre.'),
	mobile('m-istatistik-ilk', 'İstatistikler', 'İstatistikler · ilk hafta', 'ProfileStatistics', Insights.StatisticsFirstWeekScreen, 'Sıfır duvarı yerine ilk üç adım; veri geldikçe grafikler açılır.'),
	mobile('m-istatistik-ders', 'İstatistikler', 'İstatistikler · tek ders', 'ProfileStatisticsLesson', Gaps.StatisticsLessonScreen, 'Bir dersin süresi, sorusu, başarısı ve konu konu başarı.'),
	mobile('m-profil-bilgiler', 'Profil ve hesap', 'Kişisel bilgiler', 'ProfileUserInfo / ProfileEdit', Account.ProfileDetailsScreen, 'Ad, soyad, e-posta, telefon; fotoğraf ve doğum yılı yok.'),
	mobile('m-profil-hedef', 'Profil ve hesap', 'Hedefim', 'ProfileAcademic', Account.ProfileGoalScreen, 'Sınav ve puan türü; hedef net, bölüm, tempo yok.'),
	mobile('m-profil-abonelik', 'Profil ve hesap', 'Aboneliğim', 'ProfileMySubscriptions', Account.SubscriptionScreen, 'Kullanım tek satır yapay zekâ yüzdesi (Akıllı Özet + SinoAI ortak).'),
	mobile('m-profil-abonelik-hediye', 'Profil ve hesap', 'Aboneliğim · hediye erişim', 'ProfileMySubscriptions', Account.SubscriptionGiftScreen, 'Admin hediyesi: … tarihine kadar açık; mağaza notu yok.'),
	mobile('m-profil-paketler', 'Profil ve hesap', 'Paketler', 'ProfileAvailablePackages', Account.PackagesScreen, ''),
	mobile('m-profil-gorunum', 'Profil ve hesap', 'Görünüm', 'ProfileAppearance', Account.AppearanceScreen, 'Yalnız tema.'),
	mobile('m-profil-dil', 'Profil ve hesap', 'Dil', 'ProfileLanguage', Account.LanguageScreen, 'Türkçe, English; yakında diller yok.'),
	mobile('m-profil-iletisim', 'Profil ve hesap', 'Bildirimler', 'ProfileCommunicationPreferences', Account.CommunicationScreen, ''),
	mobile('m-profil-guvenlik', 'Profil ve hesap', 'Hesap güvenliği', 'ProfileAccountSecurity', Account.SecurityScreen, 'Şifre satırı ve açık oturumlar; kodla giriş anahtarı ve Apple/Google bağlama yok.'),
	mobile('m-profil-kapat', 'Profil ve hesap', 'Hesabımı kapat', 'ProfileAccountClosure', Account.CloseAccountScreen, 'Neden seçimi isteğe bağlı.'),
	mobile('m-hakkinda', 'Profil ve hesap', 'Hakkında', 'ProfileAbout', Account.AboutScreen, '72 px kutu, sürüm, Kullanım koşulları, Gizlilik politikası, KVKK aydınlatma metni, Açık kaynak lisansları, telif satırı.'),
	mobile('m-hakkinda-lisanslar', 'Profil ve hesap', 'Açık kaynak lisansları', 'ProfileLicenses', Account.LicensesScreen, 'Paket adı, sürüm, lisans.'),
	mobile('m-geri-bildirim', 'Profil ve hesap', 'Geri bildirimlerim', 'FeedbackMy', Account.FeedbackScreen, 'Yalnız içerik tepkileri ve SinoAI işaretleri; SinoAI “hatalı” işareti Hata bildirimi. Yıldız kartı ve soru hata bildirimi yok.'),
	mobile('m-bildirimler', 'Bildirimler', 'Bildirimler', 'NotificationInbox', Account.NotificationsScreen, 'Son iki gün başlıksız, sonra BU HAFTA ve DAHA ÖNCE; haftalık özet nötr grafik simgesi.'),
	mobile('m-bildirimler-bos', 'Bildirimler', 'Bildirim yok', 'NotificationInbox', States.NotificationsEmptyScreen, 'Yeşil zil kutusu, neyin burada görüneceği ve Bildirim ayarları.'),
	mobile('m-bildirim-ayarlar', 'Bildirimler', 'Bildirim ayarları', 'ProfileNotificationSettings', Notif.NotificationSettingsScreen, 'Yeni: türlere göre aç/kapa. Günde en çok 2 hatırlatma, 22:00–08:00 sessiz; canlı etkinlikler ayrı; bağlı saat.'),
	mobile('m-bildirim-canli-deneme', 'Bildirimler · kilit ekranı ve canlı etkinlik', 'Canlı etkinlik · deneme başlıyor', 'iOS Live Activity (ActivityKit)', Notif.LockLiveExamScreen, 'Yeni: canlı denemeye 15 dk kala kilit ekranında geri sayım, katılan sayısı ve Hazırım. Uygulama simgesi yok (Apple), modül simgesi var. Sunucu push-to-start ile başlatır, deneme başlayınca biter.'),
	mobile('m-bildirim-canli-odak', 'Bildirimler · kilit ekranı ve canlı etkinlik', 'Canlı etkinlik · odak oturumu', 'iOS Live Activity (ActivityKit)', Notif.LockFocusScreen, 'Yeni: odak sayacı kilit ekranında; tek düğme (Duraklat) uygulamayı açmadan çalışır (App Intents, Apple: tek etkileşimli öğe). Öğrenci başlatır, süre bitince hemen kapanır.'),
	mobile('m-bildirim-ada', 'Bildirimler · kilit ekranı ve canlı etkinlik', 'Dynamic Island hâlleri', 'iOS Live Activity (ActivityKit)', Notif.IslandSheetScreen, 'Kompakt, minimal (iki etkinlik), genişletilmiş deneme ve konu. Deneme sürerken soru, kalan süre ve boşlar.'),
	mobile('m-bildirim-seri', 'Bildirimler · kilit ekranı ve canlı etkinlik', 'Canlı etkinlik · akşam serisi', 'iOS Live Activity (ActivityKit)', Notif.LockStreakScreen, 'Yeni: yalnız o gün çalışılmadıysa 20:00’de; gerçek son (23:59) ve tek kısa yol (12 kart · 5 dk). Sahte aciliyet yok.'),
	mobile('m-bildirim-zengin', 'Bildirimler · kilit ekranı ve canlı etkinlik', 'Zengin bildirimler', 'UNNotificationContent + attachment', Notif.RichNotificationsScreen, 'Yeni: her bildirim tek bilgi ve modül renginde küçük görsel (net sütunları, modül simgesi). Metinler sen dilinde, sayı somut.'),
	mobile('m-bildirim-genis', 'Bildirimler · kilit ekranı ve canlı etkinlik', 'Bildirim · uzun basınca', 'Notification Content Extension', Notif.ExpandedNotificationScreen, 'Yeni: deneme sonucu bildirimi açılınca ders ders net ve iki eylem (Yanlışlarımı çalış, Planıma ekle). Yalnız uygulamayı açan eylem yok: bildirime dokunmak açar.'),
	mobile('m-bildirim-android', 'Bildirimler · kilit ekranı ve canlı etkinlik', 'Android 16 · canlı güncelleme', 'Notification.ProgressStyle (Live Update)', Notif.AndroidLiveUpdateScreen, 'Yeni: odak oturumu durum çubuğunda süre çipi ve bildirimde görev dilimleri; deneme sonucu büyük görselle, kart hatırlatması eylemli.'),
	mobile('m-bildirim-widget-kilit', 'Bildirimler · kilit ekranı ve canlı etkinlik', 'Kilit ekranı widget’ları', 'WidgetKit (accessory)', Notif.LockWidgetsScreen, 'Yeni: dakika halkası, sıradaki görev, seri. Sabah plan bildirimi.'),
	mobile('m-bildirim-widget-ana', 'Bildirimler · kilit ekranı ve canlı etkinlik', 'Ana ekran widget’ları', 'WidgetKit (iOS)', Notif.HomeWidgetsScreen, 'Yeni: iOS ana ekranı. Bugün halkası, sıradaki deneme, etkileşimli plan listesi (görev uygulama açılmadan tamamlanır).'),
	mobile('m-bildirim-widget-android', 'Bildirimler · kilit ekranı ve canlı etkinlik', 'Android ana ekran widget’ları', 'Jetpack Glance (Android)', Notif.AndroidWidgetsScreen, 'Yeni: Material You, renkler duvar kâğıdından. 2×2 bugün halkası, 2×1 sıradaki deneme ve odak başlat, 4×2 etkileşimli plan listesi; boyutlandırılabilir. Dokunma hedefi 48 dp, köşe sistemin (Google, Tier 1).'),
	mobile('m-destek', 'Destek', 'Destek', 'Support · SupportHub', Account.SupportHubScreen, 'Karşılama kartı düz marka tonu (action), gradyan yok; yanıt süresi vaat edilmez.'),
	mobile('m-destek-talepler', 'Destek', 'Taleplerim', 'SupportTickets', Gaps.SupportTicketsScreen, 'Açılan taleplerin durumu (Yanıtlandı, İnceleniyor, Kapandı) ve Yeni talep.'),
	mobile('m-destek-yeni', 'Destek', 'Yeni talep', 'SupportNew', Account.SupportNewScreen, 'API’nin altı konusu (Öneri yok); ekran görüntüleri 72 pt küçük kutu + kaldır, en çok 3; e-posta alanı yok.'),
	mobile('m-destek-talep', 'Destek', 'Talep detayı', 'SupportTicketDetail', Account.SupportTicketScreen, 'Başlık sağında Çözüldü metin düğmesi; talep no kimliğin ilk 8 hanesi.'),
	mobile('m-durum-bos', 'Durumlar', 'Boş durum', '—', Account.EmptyStateScreen, ''),
	mobile('m-durum-hata', 'Durumlar', 'Yükleniyor, hata, çevrimdışı', '—', Account.ErrorStateScreen, ''),
	mobile('m-durum-guncelleme', 'Durumlar', 'Zorunlu güncelleme', 'ForceUpdateGate', States.ForceUpdateScreen, 'Desteklenmeyen sürüm: yüklü ve gerekli sürüm, tek düğme; ilerleme hesapta. API: app/version, mobil ForceUpdateGate.'),
	web('w-giris', 'Web · Giriş ve kayıt', 'Giriş yap', '/student/login', WOnb.WebSignInScreen, 'Solda form (Google ve Apple üstte, kodla giriş), sağda tanıtım paneli. Ticari ileti kutusu yok; altta yasal satır.'),
	web('w-giris-kod', 'Web · Giriş ve kayıt', 'Giriş kodu', '/student/login', WOnb.WebSignInCodeScreen, ''),
	web('w-kayit', 'Web · Giriş ve kayıt', 'Kayıt ol', '/student/register', WOnb.WebSignUpScreen, 'Kayıtta paket yok: önce plan, sonra paket. Şifre en az 6 karakter; Koşullar + KVKK kutusunun altında işaretsiz ticari ileti (İYS) kutusu; altta yasal satır.'),
	web('w-sifre-unuttum', 'Web · Giriş ve kayıt', 'Şifremi unuttum', '/student/forgot-password', WOnb.WebForgotScreen, ''),
	web('w-sifre-sifirla', 'Web · Giriş ve kayıt', 'Şifre sıfırla', '/student/reset-password', WOnb.WebResetScreen, ''),
	web('w-onb-1-sinav', 'Web · Onboarding', 'Web onboarding 1 · Sınav', '/student/baslangic', WOnb.WebOnbExamScreen, 'Mobil ile aynı adımlar, sağda canlı önizleme.'),
	web('w-onb-2-hedef', 'Web · Onboarding', 'Web onboarding 2 · Hedef', '/student/baslangic', WOnb.WebOnbGoalScreen, ''),
	web('w-onb-3-tempo', 'Web · Onboarding', 'Web onboarding 3 · Tempo', '/student/baslangic', WOnb.WebOnbTempoScreen, ''),
	web('w-onb-4-dersler', 'Web · Onboarding', 'Web onboarding 4 · Dersler', '/student/baslangic', WOnb.WebOnbWeakScreen, ''),
	web('w-onb-5-plan', 'Web · Onboarding', 'Web onboarding 5 · Planın hazır', '/student/baslangic', WOnb.WebOnbPlanScreen, 'Sağda aynı planın mobil hali.'),
	web('w-onb-6-paket', 'Web · Onboarding', 'Web onboarding 6 · Paketini seç', '/student/baslangic', WOnb.WebOnbPlanChoiceScreen, 'Web’de deneme süresi yok: paket seçilir, kartla ödenir. “Şimdilik paket seçme” yok: paketsiz panel açılmaz.'),
	web('w-panel-anasayfa', 'Web · Ana sayfa', 'Ana sayfa', '/student/dashboard', WStudy.WebHomeScreen, 'Mobil ile aynı Bugün düzeni: selam ve altında hedef (tarih yok); sağda seri ve Paylaş. Her satır aynı iki sütun (1,3 / 1), satırdaki kartlar eş boy: günün planı + hafta; Kaldığın yerden ve Sıradaki deneme sol sütunda, Bugün tekrar sağda; Bu hafta + Modüller.'),
	web('w-panel-tur', 'Web · Ana sayfa', 'İlk giriş ipucu', '/student/dashboard', WStudy.WebTourScreen, 'İlk girişte tek ipucu, günün adımının üstünde.'),
	web('w-panel-anasayfa-plansiz', 'Web · Ana sayfa', 'Ana sayfa · planı olmayan öğrenci', '/student/dashboard', WStudy.WebHomeNoPlanScreen, 'Plan kartı kayıt cevaplarını gösterir, Planımı hazırla; ilk konu plansız başlar.'),
	web('w-panel-anasayfa-gun-bitti', 'Web · Ana sayfa', 'Ana sayfa · günün planı bitti', '/student/dashboard', WStudy.WebHomeDoneScreen, ''),
	web('w-panel-anasayfa-abonelik-bitti', 'Web · Ana sayfa', 'Ana sayfa · deneme süresi bitti', '/student/dashboard', WStudy.WebHomeExpiredScreen, 'Ödeme yoksa erişim yok; ilerleme korunur.'),
	web('w-panel-moduller', 'Web · Ana sayfa', 'Tüm modüller', '/student/moduller (yeni sayfa: web uygulamasında yok)', WPanel.WebModulesScreen, ''),
	web('w-panel-bildirimler', 'Web · Bildirimler', 'Bildirimler', '/student/bildirimler', WPanel.WebNotificationsScreen, ''),
	web('w-panel-profil', 'Web · Profil ve hesap', 'Profil', '/student/profil', WPanel.WebProfileScreen, 'Sağ sütunda Hedefim özeti ve Hesabımı kapat (İncele).'),
	web('w-panel-abonelik', 'Web · Profil ve hesap', 'Profil · abonelik', '/student/profil', WPanel.WebSubscriptionScreen, 'Erişimin kartı (açık modüller, tarih, yapay zekâ kullanımı yüzdesi); altta paket seçimi, Paketi değiştir oraya kaydırır.'),
	web('w-panel-ayarlar', 'Web · Profil ve hesap', 'Profil · bildirimler', '/student/profil', WPanel.WebSettingsScreen, 'Çalışma · Denemeler · Pazarlama.'),
	web('w-panel-gorunum', 'Web · Profil ve hesap', 'Profil · görünüm', '/student/profil', WPanel.WebAppearanceScreen, 'Ayrı sekme; yalnız tema.'),
	web('w-panel-destek', 'Web · Destek', 'Destek', '/student/destek', WPanel.WebSupportScreen, ''),
	web('w-panel-destek-yeni', 'Web · Destek', 'Yeni talep', '/student/destek', WPanel.WebSupportNewScreen, 'Sayfa içi form: API’nin altı konusu, Başlık, Açıklama, en çok 3 ekran görüntüsü (72 pt, kaldır düğmesi), Gönder / Vazgeç. Giriş yapmış öğrencide e-posta alanı yok.'),
	web('w-panel-destek-talep', 'Web · Destek', 'Destek talebi', '/student/destek/[id]', WPanel.WebSupportTicketScreen, ''),
	web('w-panel-odeme', 'Web · Ödeme', 'Ödeme', '/student/odeme', WPanel.WebCheckoutScreen, ''),
	web('w-panel-odeme-basarili', 'Web · Ödeme', 'Ödeme başarılı', '/student/odeme/basarili', WPanel.WebPaySuccessScreen, ''),
	web('w-panel-odeme-basarisiz', 'Web · Ödeme', 'Ödeme başarısız', '/student/odeme/basarisiz', WPanel.WebPayFailScreen, ''),
	web('w-panel-durumlar', 'Web · Durumlar', 'Boş, yükleniyor, hata', '—', WPanel.WebStatesScreen, ''),
	web('w-deneme-vitrin', 'Web · Denemeler', 'Denemeler', '/student/sinavlarim', WExam.WebExamHomeScreen, '', 'exam'),
	web('w-deneme-denemelerim', 'Web · Denemeler', 'Denemelerim ve takvim', '/student/denemelerim', WExam.WebMyExamsScreen, 'Denemelerin ve sınav takvimi tek sekmede.', 'exam'),
	web('w-sinav-takvimi', 'Web · Denemeler', 'Sınav takvimi', '/student/sinav-takvimi', WGaps.WebExamCalendarScreen, 'Resmî sınavlara kalan gün ve bu ayın Sınavika denemeleri.', 'exam'),
	web('w-deneme-basla', 'Web · Denemeler', 'Başlamadan önce', '/student/sinav/[examId]/basla', WGaps.WebExamStartScreen, 'Mobildeki Başlamadan önce ile aynı kurallar ve geri sayım.', 'exam'),
	web('w-deneme-detay', 'Web · Denemeler', 'Deneme detayı', '/student/sinav/[examId]', WExam.WebExamDetailScreen, '', 'exam'),
	web('w-deneme-detay-bitti', 'Web · Denemeler', 'Biten denemenin detayı', '/student/sinav/[examId]', WStudy.WebExamDoneDetailScreen, 'Önce sonuç, sonra belge, çözüm, analiz ve net kaybettiren konular.'),
	web('w-deneme-coz', 'Web · Denemeler', 'Deneme çözme (odak)', '/student/sinav/coz/[examUserId]', WExam.WebExamSolveScreen, '', 'exam'),
	web('w-deneme-teslim', 'Web · Denemeler', 'Teslim onayı', '/student/sinav/coz/[examUserId]', WStudy.WebExamSubmitScreen, 'Mobil ile aynı: cevaplı, boş, işaretli; boş numaralar; Enter / Esc.'),
	web('w-deneme-sonuclar', 'Web · Denemeler', 'Sonuçlar', '/student/sinav-sonuclari', WStudy.WebResultsScreen, 'Sütun etiketleri tarih, dışarıdaki Dışarıda; ÖSYM düzeninde tablo (ders netleri, toplam net, Puan), satır sonunda Analiz, dışarıdakinde Sil.', 'exam'),
	web('w-deneme-sonuclar-bos', 'Web · Denemeler', 'Sonuçlar · henüz deneme yok', '/student/sinav-sonuclari', WStudy.WebResultsEmptyScreen, ''),
	web('w-deneme-ekle', 'Web · Denemeler', 'Deneme ekle', '/student/sinav-sonuclari', WStudy.WebExamAddScreen, 'API: student/external-exams.'),
	web('w-deneme-sonuc', 'Web · Denemeler', 'Sonuç ve analiz', '/student/sinav-sonuclari/[snapshotId]', WExam.WebResultScreen, '', 'exam'),
	web('w-deneme-cozumler', 'Web · Denemeler', 'Soru çözümleri', '/student/soru-cozumleri/[examAttemptId]', WExam.WebSolutionsScreen, 'Soru haritası ve çözüm.', 'exam'),
	web('w-deneme-cozum-liste', 'Web · Denemeler', 'Soru çözümleri listesi', '/student/soru-cozumleri', WGaps.WebExamSolutionsListScreen, '', 'exam'),
	web('w-istatistik', 'Web · İstatistikler', 'İstatistiklerim', '/student/raporlarim', WStudy.WebStatsScreen, 'Satırlarda ders adı. Hesap sayfası (modül değil, mobildeki gibi).'),
	web('w-ders-vitrin', 'Web · Dersler', 'Dersler', '/student/ders-cal', WLessons.WebLessonsHomeScreen, 'Kaldığın yerden, bugünkü tekrar ve sınavın dersleri; henüz içeriği olmayan ders “Yakında”.', 'lessons'),
	web('w-ders-konular', 'Web · Dersler', 'Konular', '/student/ders-cal/ders · /ders/[lessonMainId]', WLessons.WebLessonsTopicsScreen, 'Ders hapları ve Tümü / Süren / Biten süzgeci; konular: adım, süre, yüzde ilerleme, ilk denemede doğru; yanda ders ilerlemesi.', 'lessons'),
	web('w-ders-tekrar', 'Web · Dersler', 'Tekrar', '/student/ders-cal/tekrar', WLessons.WebLessonsReviewScreen, 'Günü gelen adımlar; 1, 3 ve 7 gün aralıkla.', 'lessons'),
	web('w-ders-tekrar-oturum', 'Web · Dersler', 'Tekrar oturumu', '/student/ders-cal/tekrar/oturum', WGaps.WebLessonReviewSessionScreen, 'Mobilin tekrar adımı oynatıcıda.', 'lessons'),
	web('w-ders-tanim', 'Web · Dersler', 'Oynatıcı · Tanım', '/student/ders-cal/mikro/[workMikroId]', WLessons.WebLessonConceptScreen, 'Ortada 700 px adım, üstte konu boyu ilerleme (Adım x / y), sağda Bu konuda ve SinoAI. Parça zaman çizelgesi yok.', 'lessons'),
	web('w-ders-tahmin', 'Web · Dersler', 'Oynatıcı · Önce sen tahmin et', '/student/ders-cal/mikro/[workMikroId]', WLessons.WebLessonPredictScreen, '', 'lessons'),
	web('w-ders-bosluk', 'Web · Dersler', 'Oynatıcı · Boşluk doldur', '/student/ders-cal/mikro/[workMikroId]', WLessons.WebLessonFillScreen, 'Tek deneme; yanlışta doğru sözcük ve nedeni.', 'lessons'),
	web('w-ders-dogru-yanlis', 'Web · Dersler', 'Oynatıcı · Doğru mu, yanlış mı?', '/student/ders-cal/mikro/[workMikroId]', WLessons.WebLessonTrueFalseScreen, '', 'lessons'),
	web('w-ders-sirala', 'Web · Dersler', 'Oynatıcı · Sırala', '/student/ders-cal/mikro/[workMikroId]', WLessons.WebLessonOrderScreen, '', 'lessons'),
	web('w-ders-grupla', 'Web · Dersler', 'Oynatıcı · Grupla', '/student/ders-cal/mikro/[workMikroId]', WStudy.WebLessonGroupScreen, 'Mobilin adım çizimi oynatıcının içinde (EmbedStep).'),
	web('w-ders-eslestir', 'Web · Dersler', 'Oynatıcı · Eşleştir', '/student/ders-cal/mikro/[workMikroId]', WStudy.WebLessonMatchScreen, ''),
	web('w-ders-formul', 'Web · Dersler', 'Oynatıcı · Formül ve tablo', '/student/ders-cal/mikro/[workMikroId]', WStudy.WebLessonFormulaScreen, ''),
	web('w-ders-soru', 'Web · Dersler', 'Oynatıcı · Sınav tarzı soru', '/student/ders-cal/mikro/[workMikroId]', WLessons.WebLessonQuestionScreen, 'Yanlış şıktan sonra çözüm adımı açılır, öğrenci yeniden seçer; 1–5 tuşları.', 'lessons'),
	web('w-ders-konu-sonu', 'Web · Dersler', 'Konu sonu', '/student/ders-cal/konu/[lessonSubId]/ozet', WLessons.WebLessonTopicDoneScreen, 'İlk denemede doğru ve Paylaş; özet, dikkat notları, kamp görevi, Testler’e geçiş; Konuyu baştan oku, Konulara dön; içerik anketi.', 'lessons'),
	web('w-ders-akis', 'Web · Dersler', 'Akış panosu', '—', WLessons.WebLessonFlowBoardScreen, 'Konuya dokun → oynatıcı (kaldığın adımdan, bölüm geçişi aynı ekranda) → konu sonu → Testler ve Kartlar; yanlışlar Tekrar’a.', 'lessons'),
	web('w-test-vitrin', 'Web · Testler', 'Testler', '/student/testler', WTests.WebTestsHomeScreen, '', 'tests'),
	web('w-test-konular', 'Web · Testler', 'Ders konuları', '/student/testler/[lessonMainId]', WTests.WebTestTopicsScreen, 'Ders çipleri yok; sağ üstte Tüm dersler Testler vitrinine döner.', 'tests'),
	web('w-test-konular-tum', 'Web · Testler', 'Konular', '/student/testler/konular', WGaps.WebTestTopicsAllScreen, 'Konu konu Kolay, Orta, Zor ilerlemesi.', 'tests'),
	web('w-test-cozumler', 'Web · Testler', 'Çözümler', '/student/testler/cozumler', WGaps.WebTestSolutionsListScreen, 'Mobildeki süzgeç ve tekrar testi kartı; satır sağında Yanlışlarım; tekrar testi satırı “Konu · Tekrar”.', 'tests'),
	web('w-test-cozumler-isaretli', 'Web · Testler', 'Çözümler · İşaretli', '/student/testler/cozumler', WGaps.WebTestSolutionsFlaggedScreen, 'Soruyu aç → Yanlışlarım, Tümü süzgeci; bitmemiş testin sorusu: Test bitince açılır.', 'tests'),
	web('w-test-coz', 'Web · Testler', 'Test çözme · doğru', '/student/testler/quiz/[quizId]', WTests.WebTestSolveScreen, '', 'tests'),
	web('w-test-coz-yanlis', 'Web · Testler', 'Test çözme · yanlış', '/student/testler/quiz/[quizId]', WTests.WebTestSolveWrongScreen, 'Doğru şık ve nedeni; konunun anlatımına ya da SinoAI’ye geçiş.', 'tests'),
	web('w-test-baglanti', 'Web · Testler', 'Test çözme · bağlantı yok', '/student/testler/quiz/[quizId]', WTests.WebTestOfflineScreen, 'Ortak çevrimdışı not; bekleyen cevap varken Testi bitir bitirmez, uyarı düğmenin yanında.', 'tests'),
	web('w-test-yanlislar', 'Web · Testler', 'Yanlışlarım', '/student/testler/cozumler/[attemptId]', WStudy.WebTestWrongReviewScreen, 'İlk yanlıştan açılır; ızgara bütün soruları gösterir (doğrular yeşil), süzgeç Sonraki’nin gezdiği soruları seçer.', 'tests'),
	web('w-test-yanlislar-son', 'Web · Testler', 'Yanlışlarım · son yanlış', '/student/testler/cozumler/[attemptId]', WStudy.WebTestWrongReviewLastScreen, 'Süzgeçteki son soruda Bitti; Çözümler’e döner.', 'tests'),
	web('w-plan-bugun', 'Web · Ders Planı', 'Bugün', '/student/ders-plani', WStudy.WebPlanTodayScreen, 'Kart gövdesi içeriği açar, sağ üstteki daire tamamlar, … Diğer işlemler.', 'studyPlan'),
	web('w-plan-gorev-menu', 'Web · Ders Planı', 'Bugün · Diğer işlemler', '/student/ders-plani', WStudy.WebPlanTaskMenuScreen, 'Odak sayacıyla başla, Yarına taşı, Saati değiştir, Bugünden kaldır.', 'studyPlan'),
	web('w-plan-yok', 'Web · Ders Planı', 'Planı olmayan öğrenci', '/student/ders-plani', WStudy.WebPlanNoneScreen, 'Ortalı kutu (Planımı hazırla · 1 dk, Kendi planımı kuracağım), sağda örnek gün.', 'studyPlan'),
	web('w-plan-dunden', 'Web · Ders Planı', 'Dünden kalan görevler', '/student/ders-plani', WStudy.WebPlanMissedScreen, 'Dünden kalan kutusu sol kartın üstünde: Haftaya yay, Bugüne ekle.', 'studyPlan'),
	web('w-plan-program', 'Web · Ders Planı', 'Program', '/student/ders-plani/program', WPlan.WebPlanScheduleScreen, '', 'studyPlan'),
	web('w-plan-oneriler', 'Web · Ders Planı', 'Öneriler', '/student/ders-plani/oneriler', WPlan.WebPlanSuggestionsScreen, '', 'studyPlan'),
	web('w-plan-istatistik', 'Web · Ders Planı', 'İstatistik', '/student/ders-plani/istatistik', WPlan.WebPlanStatsScreen, '', 'studyPlan'),
	web('w-plan-ilerleme', 'Web · Ders Planı', 'İlerleme', '/student/ders-plani/ilerleme', WPlan.WebPlanProgressScreen, '', 'studyPlan'),
	web('w-plan-ayarlar', 'Web · Ders Planı', 'Ayarlar', '/student/ders-plani/ayarlar', WPlan.WebPlanSettingsScreen, '', 'studyPlan'),
	web('w-plan-odak', 'Web · Ders Planı', 'Odak (çalış)', '/student/ders-plani/calis/[taskId]', WPlan.WebPlanFocusScreen, '', 'studyPlan'),
	web('w-ozet-vitrin', 'Web · Akıllı Özet', 'Akıllı Özet', '/student/lens', WAssist.WebSummaryHomeScreen, 'Geçmişte konu başlığı.', 'smartSummary'),
	web('w-ozet-gecmis', 'Web · Akıllı Özet', 'Geçmiş analizler', '/student/lens/gecmis', WGaps.WebSummaryHistoryScreen, '', 'smartSummary'),
	web('w-ozet-yeni', 'Web · Akıllı Özet', 'Yeni analiz', '/student/lens/yeni', WAssist.WebSummaryNewScreen, 'Çıktı seçimi yok; not alanı ve ipuçları; Analizi başlat.', 'smartSummary'),
	web('w-ozet-detay', 'Web · Akıllı Özet', 'Analiz detayı', '/student/lens/analiz/[id]', WAssist.WebSummaryDetailScreen, '', 'smartSummary'),
	web('w-ozet-video', 'Web · Akıllı Özet', 'Video analizi', '/student/lens/video/[id]', WAssist.WebSummaryVideoScreen, '', 'smartSummary'),
	web('w-kart-vitrin', 'Web · Bilgi Kartları', 'Bilgi Kartları', '/student/flashcard', WAssist.WebCardsHomeScreen, 'Yeni deste düğmesi yok (deste oluşturma yok).', 'flashcards'),
	web('w-kart-bugun', 'Web · Bilgi Kartları', 'Bugün', '/student/flashcard/bugun', WGaps.WebCardsTodayScreen, '', 'flashcards'),
	web('w-kart-gozat', 'Web · Bilgi Kartları', 'Gözat', '/student/flashcard/browse', WAssist.WebCardsBrowseScreen, 'Deste seçimi ızgaranın üstünde çip satırı; x/y kart · %z ve Bu desteyi çalış.', 'flashcards'),
	web('w-kart-oturum', 'Web · Bilgi Kartları', 'Kart oturumu (odak)', '/student/flashcard/session', WAssist.WebCardSessionScreen, 'Boşluk: çevir · 1–3: puanla; ←/→ ile kart gezme yok.', 'flashcards'),
	web('w-kart-kaydedilen', 'Web · Bilgi Kartları', 'Kaydedilenler', '/student/flashcard/kaydedilenler', WAssist.WebCardsSavedScreen, '', 'flashcards'),
	web('w-sino-sohbet', 'Web · SinoAI', 'SinoAI sohbet', '/student/sinoai', WSino.WebSinoChatScreen, 'Solda geçmiş, ortada tek sohbet sütunu.', 'sinoAi'),
	web('w-sino-hak', 'Web · SinoAI', 'SinoAI · aylık hak doldu', '/student/sinoai', WSino.WebSinoLimitScreen, 'Hak doldu bloğu sohbet sütununda; yazma alanı kapalı.', 'sinoAi'),
	web('w-sino-calisma', 'Web · SinoAI', 'SinoAI çalışma', '/student/sinoai/uret', WSino.WebSinoStudyScreen, '', 'sinoAi'),
	web('w-sino-kutuphane', 'Web · SinoAI', 'SinoAI kütüphane', '/student/sinoai/kutuphane', WSino.WebSinoLibraryScreen, '', 'sinoAi'),
	web('w-sino-kaynaklar', 'Web · SinoAI', 'Kaynaklarım', '/student/sinoai/kaynaklarim', WGaps.WebSinoSourcesScreen, '', 'sinoAi'),
	web('w-sino-not', 'Web · SinoAI', 'Çalışma notu', '/student/sinoai/kutuphane/not/[id]', WGaps.WebSinoStudyNoteScreen, '', 'sinoAi'),
	site('s-anasayfa', 'Web sitesi · Ana sayfa', 'Ana sayfa', '/', SiteP.SiteHomeScreen, 3718, 'Sitenin header’ı, ikonsuz logo; beyaz ve gri tonlar. Maketlerde gerçek panel ve uygulama çizimleri.'),
	site('s-urunler-menu', 'Web sitesi · Ana sayfa', 'Ürünler menüsü', 'header', SiteP.SiteMenuScreen, 900, 'Ürünler açılınca 7 modül, sitenin sade gri tonlarında.'),
	site('s-sinav-yks', 'Web sitesi · Sınavlar', 'Sınav sayfası · YKS', '/yks-hazirlik (şablon)', SiteP.SiteExamLandingScreen, 2657, 'Tüm sınav ve hazırlık sayfaları bu şablonla.'),
	site('s-net-hesaplama', 'Web sitesi · Sınavlar', 'Net hesaplama', '/net-hesaplama', SiteP.SiteNetCalcScreen, 1024, ''),
	site('s-paketler', 'Web sitesi · Paketler', 'Paketler', '/corporate/packages', SiteP.SitePlansScreen, 1200, 'Yalnız ücretli paketler; deneme süresi mobil uygulamada.'),
	site('s-urun-denemeler', 'Web sitesi · Ürünler', 'Ürün · Denemeler', '/urunler/denemeler (şablon)', SiteP.SiteProductExamScreen, 2068, 'Altı ürün sayfası tek şablon.'),
	site('s-urun-ozet', 'Web sitesi · Ürünler', 'Ürün · Akıllı Özet', '/urunler/lens', SiteP.SiteProductSummaryScreen, 2047, ''),
	site('s-blog', 'Web sitesi · Blog', 'Blog', '/blog', SiteP.SiteBlogScreen, 2680, '12 yazı ve Daha fazla yazı (N); arama kutusu çiplerin sağında.'),
	site('s-blog-yazi', 'Web sitesi · Blog', 'Blog yazısı', '/blog/[slug]', SiteP.SiteBlogPostScreen, 1362, ''),
	site('s-hakkimizda', 'Web sitesi · Kurumsal', 'Hakkımızda', '/corporate/about', SiteP.SiteAboutScreen, 1000, 'Sayı satırı yok; başlık ve Ölç / Öğren / Geliş kartları.'),
	site('s-sss-iletisim', 'Web sitesi · Kurumsal', 'SSS ve iletişim', '/corporate/sss + /contact', SiteP.SiteFaqContactScreen, 1116, ''),
	site('s-yasal', 'Web sitesi · Kurumsal', 'Yasal sayfa', '/corporate/yasal/[slug]', SiteP.SiteLegalScreen, 993, ''),
	site('s-sinoai-misafir', 'Web sitesi · SinoAI misafir', 'SinoAI · misafir', '/sinoai', SiteP.SiteSinoGuestScreen, 900, ''),

	/* Tablet (iPad 11", Android tablet): pen in exams, tests and lessons. Layout modes: tabletWide ≥ 900 pt (landscape), tabletPortrait 600–899 pt. */
	tablet('t-deneme-coz-taslak', 'Tablet · Denemeler', 'Deneme çözme · taslak kâğıdı', 'ExamStudentSolve', TSolve.ExamScratchScreen, 'Yatay: soru solda, Taslak kâğıdı sağda (%38). Araç çubuğu kâğıdın kenarında, metni kapatmaz. Taslak soruya kayıtlı; soru haritasında kalem rozeti.', 'exam'),
	tablet('t-deneme-coz-isaretleme', 'Tablet · Denemeler', 'Deneme çözme · soruya yaz', 'ExamStudentSolve', TSolve.ExamMarkupScreen, 'Soru üzeri işaretleme: fosforlu kalem, altını çizme, şık eleme, kenar notu. Kalem çizer, parmak kaydırır; Kaydır/Çiz yalnız parmakla çizim açıkken görünür.', 'exam'),
	tablet('t-deneme-coz-dikey', 'Tablet · Denemeler', 'Deneme çözme · dikey', 'ExamStudentSolve', TSolve.ExamPortraitScreen, 'Dikey: şıklar üç sütun, Taslak kâğıdı alt yarıda. Parmakla çizim açık olduğu için Kaydır/Çiz anahtarı araç çubuğunda.', 'exam', true),
	tablet('t-deneme-cozum-notlar', 'Tablet · Denemeler', 'Çözüm · notlarım', 'ExamSolutionBookletReview', TSolve.ExamSolutionNotesScreen, 'Çözümlerde öğrencinin kendi işaretleri salt okunur geri gelir (göster/gizle); taslağı resmî çözümün yanında.', 'exam'),
	tablet('t-deneme-kalem-ipucu', 'Tablet · Denemeler', 'Kalem · ilk açılış ipucu', 'ExamStudentSolve', TSolve.PenTipScreen, 'Kalemli tablette ilk çözümde tek ipucu, Soruya yaz düğmesinde. Tur yok.', 'exam'),
	tablet('t-deneme-detay', 'Tablet · Denemeler', 'Deneme detayı', 'ExamStudentPublicDetail', TParity.ExamDetailTabletScreen, 'Canlı deneme açılmadan önce: kalan süre ve Hatırlat (web ile aynı sayfa).', 'exam'),
	tablet('t-deneme-teslim', 'Tablet · Denemeler', 'Teslim onayı', 'ExamStudentSolve', TParity.ExamSubmitTabletScreen, 'Web ile aynı pencere; klavyede Enter / Esc.', 'exam'),
	tablet('t-deneme-detay-bitti', 'Tablet · Denemeler', 'Biten denemenin detayı', 'ExamStudentPublicDetail', TParity.ExamDoneTabletScreen, '', 'exam'),
	tablet('t-deneme-sonuclar', 'Tablet · Denemeler', 'Sonuçlar', 'ExamResultsHub', TParity.ResultsTabletScreen, 'Net sütunları, üç giriş satırı, son sonuçlar tablosu.', 'exam'),
	tablet('t-deneme-sonuclar-bos', 'Tablet · Denemeler', 'Sonuçlar · henüz deneme yok', 'ExamResultsHub', TParity.ResultsEmptyTabletScreen, '', 'exam'),
	tablet('t-deneme-ekle', 'Tablet · Denemeler', 'Deneme ekle', 'ExamExternalResult', TParity.ExamAddTabletScreen, 'API: student/external-exams.', 'exam'),
	tablet('t-test-coz-taslak', 'Tablet · Testler', 'Test çözme · taslak kâğıdı', 'QuizSolve', TSolve.TestScratchScreen, 'Yeni: Testler’e taslak kâğıdı. Anında geri bildirim soru sütununda, işlem yanda kalır.', 'tests'),
	tablet('t-test-coz-yanlis', 'Tablet · Testler', 'Yanlış cevap · taslağı göster', 'QuizSolve', TSolve.TestWrongScratchScreen, 'Yanlışta taslak yerinde kalır; “Taslağımı SinoAI’ye göster” yalnız öğrenci isterse gönderir ve okunanı önce gösterir.', 'tests'),
	tablet('t-test-sekilli-soru', 'Tablet · Testler', 'Şekilli soru · şekle yaz', 'QuizSolve', TSolve.TestFigureScreen, 'Kalem şeklin üstüne yazar: açı, bulunan değer. Şıklar sağ sütunda, elenenler çizili. Cevap şıkka tek dokunuşla; Cevapla düğmesi yok.', 'tests'),
	tablet('t-ders-vitrin', 'Tablet · Dersler', 'Dersler · yatay', 'WorkHome', TLearn.LessonsHomeTabletScreen, 'Yatayda sekme çubuğu yerine yan ray. Kaldığın yer ve tekrar yan yana, dersler üç sütun; Notlarım üstte.', 'lessons'),
	tablet('t-ders-tanim-not', 'Tablet · Dersler', 'Adım · Tanım · kenar notu', 'WorkMikro', TLearn.LessonConceptTabletScreen, 'Yeni: Dersler’e kalem. Okuma sütunu ve sağda kenar boşluğu; fosforlu kalem ve not adıma kayıtlı.', 'lessons'),
	tablet('t-ders-soru-eleme', 'Tablet · Dersler', 'Adım · Sınav tarzı soru · eleme', 'WorkMikro', TLearn.LessonQuestionTabletScreen, 'Şıklar kalemle elenir, seçilen daire içinde; cevap yine dokunarak verilir.', 'lessons'),
	tablet('t-ders-bosluk-el-yazisi', 'Tablet · Dersler', 'Adım · Boşluk doldur · el yazısı', 'WorkMikro', TLearn.LessonFillTabletScreen, 'Kalemle kutuya yazılır, okunan sözcük gösterilir, sonra kontrol edilir. Klavye her zaman seçenek.', 'lessons'),
	tablet('t-ders-notlarim', 'Tablet · Dersler', 'Notlarım', 'WorkNotes', TLearn.LessonNotesTabletScreen, 'Konunun tüm kenar notları ve taslakları bölüme göre; dokununca adımına götürür. API: student/notes/works.', 'lessons'),
	tablet('t-ders-grupla', 'Tablet · Dersler', 'Adım · Grupla', 'WorkMikro', TParity.LessonGroupTabletScreen, 'Mobilin adım çizimi tablet oynatıcısında (EmbedStep).', 'lessons'),
	tablet('t-ders-eslestir', 'Tablet · Dersler', 'Adım · Eşleştir', 'WorkMikro', TParity.LessonMatchTabletScreen, '', 'lessons'),
	tablet('t-ders-formul', 'Tablet · Dersler', 'Adım · Formül ve tablo', 'WorkMikro', TParity.LessonFormulaTabletScreen, '', 'lessons'),
	tablet('t-kart-el-yazisi', 'Tablet · Bilgi Kartları', 'Kart · önce kendin yaz', 'FlashcardSession', TLearn.CardWriteTabletScreen, 'Ön yüzde isteğe bağlı yazma alanı; kontrol edilmez, cevapla öğrenci kendisi karşılaştırır.', 'flashcards'),
	tablet('t-hub-moduller', 'Tablet · Modüller', 'Ana ekran · yatay', 'ModuleHubHome', TParity.HubTabletScreen, 'Web ana sayfasının kendisi tablet çerçevesinde (PanelInTablet): aynı Bugün düzeni. Hedef ve seri selamın karşısında yan yana; Modüller kartında Tümü yok, altında SinoAI ve Destek yan yana (sol menü yok).'),
	tablet('t-hub-plansiz', 'Tablet · Modüller', 'Ana ekran · planı olmayan öğrenci', 'ModuleHubHome', TParity.HubTabletNoPlanScreen, 'Kayıt cevaplarıyla Planımı hazırla; ilk konu plansız başlar.'),
	tablet('t-hub-gun-bitti', 'Tablet · Modüller', 'Ana ekran · günün planı bitti', 'ModuleHubHome', TParity.HubTabletDoneScreen, ''),
	tablet('t-hub-abonelik-bitti', 'Tablet · Modüller', 'Ana ekran · deneme süresi bitti', 'ModuleHubHome', TParity.HubTabletExpiredScreen, 'Ödeme yoksa erişim yok; ilerleme korunur.'),
	tablet('t-kalem-ayarlar', 'Tablet · Kalem', 'Profil · Kalem ve çizim', 'ProfilePenSettings', TLearn.PenSettingsScreen, 'Parmakla çizim, kalemde çift dokunuş, varsayılan renk ve kalınlık, taslak yeri, çözümlerde notlar, notların saklandığı yer.'),
	/* Tablet without the pen (5 Nov 2026): keyboard, two panes, side panel, week, dashboard, Split View. */
	tablet('t-deneme-klavye', 'Tablet · Kalemsiz', 'Deneme · klavye ve soru haritası', 'ExamStudentSolve', TWide.ExamKeyboardScreen, 'Bağlı klavyede A–E cevaplar, oklar gezdirir, İ işaretler; soru haritası yatayda hep açık.', 'exam'),
	tablet('t-ders-sinoai-panel', 'Tablet · Kalemsiz', 'Ders adımı · SinoAI yan panelde', 'WorkMikro', TWide.LessonSinoPanelScreen, '400 pt panel, adımı kapatmadan açılır; SinoAI sohbet oturumunun kendi üst çubuğu (menü, Sohbet · Çalışma, yeni sohbet); uyarı satırı panelin altında.', 'lessons'),
	tablet('t-ders-konular-iki-panel', 'Tablet · Kalemsiz', 'Dersler · konular iki panel', 'WorkCatalog + WorkSub', TWide.LessonTopicsSplitScreen, 'Konu listesi solda kalır, seçilen konunun özeti ve Bu konuda listesi sağda; konu değiştirmek tek dokunuş.', 'lessons'),
	tablet('t-test-yanlislar', 'Tablet · Testler', 'Yanlışlarım', 'QuizReview', TParity.WrongReviewTabletScreen, 'Web Yanlışlarım sayfası tablette: 5 sütunlu ızgara solda (bütün sorular), çözüm sağda.', 'tests'),
	tablet('t-test-yanlislar-son', 'Tablet · Testler', 'Yanlışlarım · son yanlış', 'QuizReview', TParity.WrongReviewLastTabletScreen, 'Son yanlışta Bitti; Çözümler’e döner.', 'tests'),
	tablet('t-plan-bugun', 'Tablet · Kalemsiz', 'Ders Planı · Bugün', 'StudyPlanHome', TParity.PlanDayTabletScreen, 'Web Ders Planı · Bugün sayfası tablette: Gün/Hafta/Ay, süzgeçler, görev kartları.', 'studyPlan'),
	tablet('t-plan-hafta', 'Tablet · Kalemsiz', 'Ders Planı · hafta', 'StudyPlanSchedule', TWide.PlanWeekScreen, 'Haftanın yedi günü yan yana, görevler sürüklenerek taşınır; bugünün görevleri sağda.', 'studyPlan'),
	tablet('t-istatistik-pano', 'Tablet · Kalemsiz', 'İstatistiklerim', 'ProfileStatistics', TParity.StatsTabletScreen, 'Web İstatistiklerim sayfasının kendisi tablette.'),
	tablet('t-bolunmus-ekran', 'Tablet · Kalemsiz', 'Bölünmüş ekran', 'Uygulama geneli', TWide.SplitViewScreen, 'Split View / Stage Manager: pencere 600 pt altına inince telefon düzeni; süre ve oturum kesilmez.'),
	watch('k-apple-bugun', 'Saat · Apple Watch', 'Bugün', 'watchOS app', Watch.AppleTodayScreen, 'Dakika halkası, görev sayısı, seri ve sıradaki görev; Başla odak sayacını saatte açar.'),
	watch('k-apple-plan', 'Saat · Apple Watch', 'Günün planı', 'watchOS app', Watch.ApplePlanScreen, 'Görevler modül renginde; yuvarlağa dokununca görev tamamlanır.'),
	watch('k-apple-odak', 'Saat · Apple Watch', 'Odak sayacı', 'watchOS app', Watch.AppleFocusScreen, 'Sayaç saatte çalışır, telefondaki canlı etkinlikle eşit; Duraklat ve Bitir.'),
	watch('k-apple-kart', 'Saat · Apple Watch', 'Hızlı kart tekrarı', 'watchOS app', Watch.AppleCardScreen, 'Saatte yapılabilen tek çalışma: Bilgi Kartları. Soru yüzü ve Cevabı göster.'),
	watch('k-apple-kart-cevap', 'Saat · Apple Watch', 'Kart · cevap', 'watchOS app', Watch.AppleCardAnswerScreen, 'Cevap ve iki düğme: bilmedim / bildim. Tekrar günü telefonla aynı.'),
	watch('k-apple-deneme', 'Saat · Apple Watch', 'Deneme geri sayımı', 'watchOS app', Watch.AppleExamScreen, 'Canlı denemeye kalan süre ve hatırlatma; deneme telefonda çözülür.'),
	watch('k-apple-kadran', 'Saat · Apple Watch', 'Kadran komplikasyonları', 'WidgetKit (watchOS)', Watch.AppleFaceScreen, 'Seri, sıradaki görev (dikdörtgen), dakika, kart ve deneme halkaları.'),
	watch('k-apple-yigin', 'Saat · Apple Watch', 'Akıllı Yığın', 'WidgetKit (watchOS)', Watch.AppleSmartStackScreen, 'Sabah ve canlı deneme öncesi Sınavika widget’ı yığının üstüne çıkar.'),
	watch('k-apple-bildirim', 'Saat · Apple Watch', 'Bildirim · eylemli', 'watchOS notification (long look)', Watch.AppleNotificationScreen, 'Odak bitince sonuç ve iki eylem: sıradaki görev ya da 5 dk mola.'),
	watch('k-wear-kutucuk', 'Saat · Wear OS', 'Kutucuk (Tile)', 'Wear OS Tile (ProtoLayout)', Watch.WearTileScreen, 'Kenarda dakika yayı (altta kenar düğmesi için boşluk), ortada 45/90 ve seri; sıradaki görev Material 3 kenar düğmesinde. Tek görev, fazla işlev yok (Google).', true),
	watch('k-wear-odak', 'Saat · Wear OS', 'Odak sayacı', 'Wear OS app (Compose for Wear OS)', Watch.WearFocusScreen, 'Kenarda kalan süre yayı, ortada sayaç, yuvarlak Duraklat ve Bitir; ongoing activity.', true),
	watch('k-wear-kadran', 'Saat · Wear OS', 'Kadran komplikasyonları', 'Wear OS complications', Watch.WearFaceScreen, 'Aralıklı değer (dakika), kısa metin (seri) ve uzun metin (sıradaki görev).', true),
	share('p-deneme-hikaye', 'Deneme sonucu · hikâye', Share.ExamStory, 'Net, geçen denemeye göre fark, D/Y/B (simge + sözcük), en iyi ders. “ÖSYM puanı değildir” notu; puan tahmini yok.', false, 'exam'),
	share('p-deneme-gonderi', 'Deneme sonucu · gönderi', Share.ExamPost, 'Aynı içerik 1080 × 1080; istatistikten ilk üçü.', true, 'exam'),
	share('p-seri-hikaye', 'Seri rozeti · hikâye', Share.StreakStory, '3 · 7 · 14 · 30 gün basamakları: ulaşılan beyaz ve tikli, sıradaki kesikli. Marka yüzeyi (turuncu).', false),
	share('p-seri-gonderi', 'Seri rozeti · gönderi', Share.StreakPost, 'Aynı içerik 1080 × 1080.', true),
	share('p-konu-hikaye', 'Konu bitirme · hikâye', Share.TopicStory, 'Dersler: konu adı, adım sayısı, ilk denemede doğru oranı.', false, 'lessons'),
	share('p-konu-gonderi', 'Konu bitirme · gönderi', Share.TopicPost, 'Aynı içerik 1080 × 1080.', true, 'lessons'),
	share('p-hafta-hikaye', 'Haftalık özet · hikâye', Share.WeekStory, 'Ders Planı: haftalık süre, günlük sütunlar (en çok çalışılan gün beyaz), soru, deneme, seri.', false, 'studyPlan'),
	share('p-hafta-gonderi', 'Haftalık özet · gönderi', Share.WeekPost, 'Aynı içerik 1080 × 1080.', true, 'studyPlan'),
	share('p-soru-hikaye', 'Bu soruyu çözdüm · hikâye', Share.SolvedStory, 'Testler: soru metni ya da görseli ve şıklar; cevap ve çözüm yok. Ders · konu etiketi, süre ve seviye.', false, 'tests'),
	share('p-soru-gonderi', 'Bu soruyu çözdüm · gönderi', Share.SolvedPost, 'Aynı içerik 1080 × 1080.', true, 'tests'),
	// İstatistik raporu PDF'i (19 Nov 2026): API QuestPDF, spec docs/UIUX/Kodlama/13-Istatistik-Raporu-PDF.md.
	print('r-istatistik-1', 'İstatistik raporu (PDF)', 'Son 30 gün · sayfa 1', 'API StatisticsReportPdf (QuestPDF) · w-istatistik “PDF olarak al”', Print.StatsReportPageOne, 'Üst bant (logo, rapor adı, dönem ve tarih aralığı, öğrenci), dört ölçü, günlük çalışma modüllere göre yığılı ve günlük ortalama, modüllere dağılım halkası ve tablosu.'),
	print('r-istatistik-2', 'İstatistik raporu (PDF)', 'Son 30 gün · sayfa 2', 'API StatisticsReportPdf (QuestPDF) · w-istatistik “PDF olarak al”', Print.StatsReportPageTwo, 'Sürekli üst satır; derslere göre tablo (en çok 8 ders), altında TYT net gelişimi; en verimli saatler (son 30 gün, hücrede yüzde).'),
	print('r-istatistik-hafta', 'İstatistik raporu (PDF)', 'Bu hafta · deneme yok · sayfa 1', 'API StatisticsReportPdf (QuestPDF) · w-istatistik “PDF olarak al”', Print.StatsReportWeek, 'Deneme yokken dördüncü ölçü seri; yedi sütunun üstünde süre, altında gün adı ve tarihi.'),
];

/* iPhone Duo (owner, 18 Nov 2026: every screen, outer and inner). Generated from the screens above so a fix on a screen is a fix on Duo. */
const DUO_SYSTEM_GROUP = 'Bildirimler · kilit ekranı ve canlı etkinlik';
const DUO_SHEET_GROUPS = ['Giriş ve kayıt', 'Onboarding'];
const duoOuter = (screen: UIScreen): UIScreen => {
	const Original = screen.Component;
	const Component: React.FC = () => React.createElement(DuoOuter, {children: React.createElement(Original)});
	return {...screen, id: `f-dis-${screen.id.slice(2)}`, platform: 'fold', group: `Duo dış · ${screen.group}`, Component, pose: 'outer', note: `Dış ekran 466 × 678 pt (dik), telefon düzeni; sağda iOS’un 84 pt şeridi: ada ve durum iOS'un, araç ve sekme simgeleri bizim. ${screen.note}`.trim()};
};
const duoInner = (screen: UIScreen): UIScreen => {
	const Original = screen.Component;
	const sheet = screen.platform === 'mobile';
	const Component: React.FC = () => (sheet ? React.createElement(DuoCentered, {children: React.createElement(Original)}) : React.createElement(DuoInner, {module: screen.module, children: React.createElement(Original)}));
	return {...screen, id: `f-ic-${screen.id.slice(2)}`, platform: 'fold', group: `Duo iç · ${screen.group.replace('Web · ', '')}`, Component, pose: 'inner', note: `${sheet ? 'İç ekran 951 × 669 pt: telefon akışı ortada 430 pt sütun.' : 'İç ekran 951 × 669 pt: tablet ve web sayfası; sağda iOS’un 84 pt şeridi.'} ${screen.note}`.trim()};
};

export const UI_SCREENS: readonly UIScreen[] = [
	...BASE_SCREENS,
	...BASE_SCREENS.filter((screen) => screen.platform === 'mobile' && screen.group !== DUO_SYSTEM_GROUP).map(duoOuter),
	...BASE_SCREENS.filter((screen) => screen.platform === 'mobile' && DUO_SHEET_GROUPS.includes(screen.group)).map(duoInner),
	...BASE_SCREENS.filter((screen) => screen.platform === 'web' && screen.route !== '—' && !screen.group.startsWith('Web · Giriş') && !screen.group.startsWith('Web · Onboarding')).map(duoInner),
	...DUO_EXTRA,
];

export const findScreen = (id: string): UIScreen => {
	const screen = UI_SCREENS.find((entry) => entry.id === id);
	if (!screen) throw new Error(`Bilinmeyen UI/UX ekranı: ${id}`);
	return screen;
};
