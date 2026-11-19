/**
 * The App Store and Google Play listing: the pictures' copy, the UI/UX
 * drawings they show, and every size the two stores ask for. Drawn by
 * Store/StoreSet.tsx (look "Turuncu", owner 14 Nov 2026), rendered by
 * `npm run store`.
 *
 * A study app first, SinoAI last (owner, 14 Nov 2026): the first three
 * pictures are a day's plan, a lesson step and mock exam scores. Phones,
 * iPads and browsers show the current UI/UX drawings (src/UIUX, the same
 * drawings exported to Desktop\Sinavika-UIUX3), never captures of the live
 * app or hand-drawn copies, so a redesign reaches the store at the next
 * render.
 *
 * Headlines name the benefit; the key words sit between *stars* and get the
 * mark (a navy box on orange). Headlines are short phrases with no comma and
 * no full stop (review, 14 Nov 2026: one rule for all). English is written
 * for English-speaking students, not translated word for word.
 */
export const STORE_LANGUAGES = ['tr', 'en'] as const;
type StoreLanguage = (typeof STORE_LANGUAGES)[number];

type StoreText = Record<StoreLanguage, string>;

/** A real UI piece floating off the device's edge: the picture's focus. */
export type StoreFloat = 'today' | 'step' | 'nets' | 'kpi' | 'none';

export type StoreSlide = {
	/** File name stem (the same in every size folder and language). */
	file: string;
	headline: StoreText;
	/** To the student: short, with closing punctuation. */
	subline: StoreText;
	/** UI/UX drawing ids: phone, iPad (landscape tablet drawing; without one the iPad picture shows the phone) and browser. */
	screens: {phone: string; tablet?: string; web: string};
	float: StoreFloat;
};

export const STORE_SLIDES: readonly StoreSlide[] = [
	{
		file: '01-bugun-ne-calisacagini-bil',
		headline: {tr: 'Bugün ne *çalışacağını* bil', en: 'Know what to *study* today'},
		subline: {tr: 'Planın her gün sıradaki işi önüne koyar.', en: 'Your plan puts the next task in front of you.'},
		screens: {phone: 'm-hub-moduller', tablet: 't-hub-moduller', web: 'w-panel-anasayfa'},
		float: 'today',
	},
	{
		file: '02-adim-adim-ogren',
		headline: {tr: 'Konuyu *adım adım* öğren', en: 'Learn it *step by step*'},
		subline: {tr: 'Kısa mikro dersler; her adımda sen de cevaplarsın.', en: 'Short micro-lessons where you answer every step.'},
		screens: {phone: 'm-ders-grupla', tablet: 't-ders-grupla', web: 'w-ders-grupla'},
		float: 'step',
	},
	{
		file: '03-deneme-net',
		headline: {tr: 'Denemeni çözüp *netini* gör', en: 'Take exams and *see your score*'},
		subline: {tr: 'Türkiye geneli denemeler, net gelişimin ve eksik konuların.', en: 'Mock exams, your score trend and your weak topics.'},
		screens: {phone: 'm-deneme-sonuclar', tablet: 't-deneme-sonuclar', web: 'w-deneme-sonuclar'},
		float: 'nets',
	},
	{
		file: '04-testle-eksik-kapat',
		headline: {tr: 'Eksik konunu *testle* kapat', en: 'Fix weak topics *with tests*'},
		subline: {tr: 'Kolay, Orta, Zor; her yanlışın nedeni hemen yanında.', en: 'Easy, Medium, Hard, with the reason beside every mistake.'},
		screens: {phone: 'm-test-coz', tablet: 't-test-coz-taslak', web: 'w-test-coz'},
		float: 'none',
	},
	{
		file: '05-istatistik',
		headline: {tr: 'Çalışmanı *gün gün* gör', en: 'See your study *day by day*'},
		subline: {tr: 'Süren, doğru oranın ve en verimli saatlerin.', en: 'Your time, accuracy and best study hours.'},
		screens: {phone: 'm-istatistik', tablet: 't-istatistik-pano', web: 'w-istatistik'},
		float: 'kpi',
	},
	{
		file: '06-bilgi-kartlari',
		headline: {tr: 'Kartlarla *aklında* tut', en: 'Remember it *with flashcards*'},
		subline: {tr: 'Bilgi Kartları tekrarı doğru günde önüne getirir.', en: 'Flashcards come back on the right day.'},
		screens: {phone: 'm-kart-arka', tablet: 't-kart-el-yazisi', web: 'w-kart-bugun'},
		float: 'none',
	},
	{
		file: '07-akilli-ozet',
		headline: {tr: 'Hatanı *adım adım* gör', en: 'See your mistake *step by step*'},
		subline: {tr: 'Akıllı Özet sorunun çözümünü, kazanımını ve hatanı gösterir.', en: 'Smart Summary shows the solution, the skill and where you went wrong.'},
		screens: {phone: 'm-ozet-sonuc', web: 'w-ozet-detay'},
		float: 'none',
	},
	{
		file: '08-sinoai',
		headline: {tr: "Takıldığında *SinoAI'ye* sor", en: 'Stuck? *Ask SinoAI*'},
		subline: {tr: 'Konuyu anlatır, sorunu adım adım çözer.', en: 'It explains the topic and solves step by step.'},
		screens: {phone: 'm-sino-sohbet', tablet: 't-ders-sinoai-panel', web: 'w-sino-sohbet'},
		float: 'none',
	},
];

/**
 * Watch screenshots: only the app's own screen, as the stores ask. The phone and
 * tablet sets carry no watch (owner, 16 Nov 2026); the watch has its own shots.
 * Google Play (Wear OS, WO-G5): 1:1, at least 384 px, no device frame, no extra text or graphics, no transparency or masking.
 * App Store: one of Apple's Apple Watch sizes (416 × 496 = Series 10–12 at 2x), no alpha. Same files in every look.
 */
export const WATCH_SHOTS: Record<'applewatch' | 'wearos', readonly (readonly [string, string])[]> = {
	applewatch: [
		['01-bugun', 'k-apple-bugun'],
		['02-plan', 'k-apple-plan'],
		['03-odak', 'k-apple-odak'],
		['04-kart', 'k-apple-kart'],
		['05-kart-cevap', 'k-apple-kart-cevap'],
		['06-deneme', 'k-apple-deneme'],
		['07-bildirim', 'k-apple-bildirim'],
	],
	wearos: [
		['01-kutucuk', 'k-wear-kutucuk'],
		['02-odak', 'k-wear-odak'],
		['03-kadran', 'k-wear-kadran'],
	],
};

/**
 * Google Play subscription icons (one per subscription product, the same in
 * every language): 32-bit PNG, 1:1, 512–1080 px, a distinct picture per
 * product, only the app's own logo (Play Console, 18 Nov 2026). `id` is the
 * Play product id; `exam` is the big word, `level` the KPSS level in the box.
 */
export const SUBSCRIPTION_ICONS = [
	{id: 'sinavika_yks_monthly', file: 'abonelik-yks', exam: 'YKS'},
	{id: 'sinavika_kpss_lisans_monthly', file: 'abonelik-kpss-lisans', exam: 'KPSS', level: 'Lisans'},
	{id: 'sinavika_kpss_onlisans_monthly', file: 'abonelik-kpss-onlisans', exam: 'KPSS', level: 'Önlisans'},
	{id: 'sinavika_kpss_ortaogretim_monthly', file: 'abonelik-kpss-ortaogretim', exam: 'KPSS', level: 'Ortaöğretim'},
	{id: 'com.sinavika.sat.monthly', file: 'abonelik-sat', exam: 'SAT'},
	{id: 'com.sinavika.act.monthly', file: 'abonelik-act', exam: 'ACT'},
] as const satisfies readonly {id: string; file: string; exam: string; level?: string}[];

/** Play subscription icon size: inside 512–1080, square. */
export const SUBSCRIPTION_ICON_SIZE = 1024;

/** The Google Play feature graphic (1024 × 500): no device, no white or dark ground, no badge. */
export const FEATURE_GRAPHIC = {
	file: 'sinavika-ozellik-grafigi',
	headline: {tr: 'Sana göre *sınav* hazırlığı', en: 'Exam prep *built around you*'},
	subline: {tr: 'Ders, test, deneme ve günlük plan.', en: 'Lessons, tests, mock exams and a daily plan.'},
} satisfies {file: string; headline: StoreText; subline: StoreText};

/**
 * App Store creative (iOS / iPadOS 27 and later): the product page header and
 * the search results picture. Each size also comes without its phrase.
 */
type StoreCreativeKind = 'header' | 'search';

export const STORE_CREATIVE: Record<StoreCreativeKind, {file: string; headline: StoreText}> = {
	header: {file: 'ust-gorsel', headline: {tr: 'Her gün *bir adım* öne', en: 'One step *ahead* every day'}},
	search: {file: 'arama-sonucu', headline: {tr: 'Planlı çalışıp *netini* artır', en: 'Study *with a plan*'}},
};

/** What a picture shows. iPad pictures show the tablet drawing; Android tablets (9:16) the phone. */
type StoreDevice = 'iphone' | 'android' | 'ipad' | 'desktop' | 'duoOuter' | 'duoInner' | 'feature' | 'applewatch' | 'wearos' | StoreCreativeKind;

type StoreFormat = {
	platform: 'ios' | 'android';
	/** Folder name; with several sizes, `-WxH` is added. */
	folder: string;
	device: StoreDevice;
	sizes: readonly (readonly [number, number])[];
	note: string;
};

/** Every picture the stores ask for (App Store Connect and Google Play Console, November 2026). */
export const STORE_FORMATS: readonly StoreFormat[] = [
	{platform: 'ios', folder: 'iphone-6.3', device: 'iphone', sizes: [[1206, 2622]], note: 'iPhone 6.3" (6.1" de bunu kabul eder)'},
	{platform: 'ios', folder: 'iphone-6.1', device: 'iphone', sizes: [[1179, 2556]], note: 'iPhone 6.1"'},
	{platform: 'ios', folder: 'ipad-13-inc', device: 'ipad', sizes: [[2064, 2752], [2048, 2732]], note: 'iPad 12.9" / 13"'},
	{platform: 'ios', folder: 'iphone-duo-ic-ekran', device: 'duoInner', sizes: [[2853, 2007]], note: 'iPhone Duo iç ekran (açık, enine 2853 × 2007; Apple dik 2007 × 2853 de kabul eder): açık Duo f-ic-* çizimiyle (951 × 669 pt), yanında kapalı Duo. Duo görseli gönderilince ürün sayfasında "iPhone Duo için yapıldı" rozeti çıkar: uygulama Duo çalışması bitmeden yüklenmez'},
	{platform: 'ios', folder: 'iphone-duo-dis-ekran', device: 'duoOuter', sizes: [[1398, 2034]], note: 'iPhone Duo dış ekran (kapalı, dik 1398 × 2034; uygulama dış ekranda dik açılır, Xcode simülatörü 19 Kasım): kapalı Duo f-dis-* çizimiyle. Uygulama Duo çalışması bitmeden yüklenmez'},
	{platform: 'ios', folder: 'ust-gorsel', device: 'header', sizes: [[5244, 2950], [3840, 1646]], note: 'App Store Header (iOS 27+): 16:9 ya da 21:9; PNG, alfa yok; metinli ve metinsiz'},
	{platform: 'ios', folder: 'arama-sonucu', device: 'search', sizes: [[5244, 2950], [3840, 2560], [1920, 1280]], note: 'App Store Search Results (iOS 27+): 16:9 ya da 3:2; PNG, alfa yok; metinli ve metinsiz'},
	{platform: 'android', folder: 'telefon', device: 'android', sizes: [[1080, 1920]], note: 'Telefon ekran görüntüleri, 9:16 (2–8 adet)'},
	{platform: 'android', folder: 'tablet-7-inc', device: 'android', sizes: [[1440, 2560]], note: '7 inç tablet, 9:16'},
	{platform: 'android', folder: 'tablet-10-inc', device: 'android', sizes: [[2160, 3840]], note: '10 inç tablet, 9:16'},
	{platform: 'android', folder: 'masaustu', device: 'desktop', sizes: [[1920, 1080]], note: 'Masaüstü (Chromebook), 16:9 (4–8 adet)'},
	{platform: 'android', folder: 'ozellik-grafigi', device: 'feature', sizes: [[1024, 500]], note: 'Özellik grafiği 1024 × 500'},
	{platform: 'ios', folder: 'apple-watch', device: 'applewatch', sizes: [[416, 496]], note: 'Apple Watch Series 10–12 (46 mm); yalnız arayüz, alfa yok'},
	{platform: 'android', folder: 'wear-os', device: 'wearos', sizes: [[454, 454]], note: 'Wear OS 1:1, en az 384 px; yalnız arayüz, çerçeve, yazı ve maske yok'},
];
