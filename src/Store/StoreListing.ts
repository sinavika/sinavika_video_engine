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
 * highlighter stroke. A Turkish headline made of commands with a comma ends
 * with a full stop. English is written for English-speaking students, not
 * translated word for word.
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
		headline: {tr: 'Bugün *ne çalışacağını* bil', en: 'Know *what to study* today'},
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
		headline: {tr: 'Denemeni çöz, *netini* gör.', en: 'Take mock exams, *see your score*.'},
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
		headline: {tr: 'Kartlarla *unutma*', en: 'Remember it *with flashcards*'},
		subline: {tr: 'Bilgi Kartları tekrarı doğru günde önüne getirir.', en: 'Flashcards come back on the right day.'},
		screens: {phone: 'm-kart-on', tablet: 't-kart-el-yazisi', web: 'w-kart-bugun'},
		float: 'none',
	},
	{
		file: '07-akilli-ozet',
		headline: {tr: 'Sorunun *fotoğrafını* çek', en: 'Snap *a question*'},
		subline: {tr: 'Akıllı Özet çözümü, kazanımı ve hatanı gösterir.', en: 'Smart Summary shows the solution and where you went wrong.'},
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
	search: {file: 'arama-sonucu', headline: {tr: 'Planlı çalış, *netini* artır.', en: 'Study *with a plan*'}},
};

/** What a picture shows. iPad pictures show the tablet drawing; Android tablets (9:16) the phone. */
type StoreDevice = 'iphone' | 'android' | 'ipad' | 'desktop' | 'feature' | StoreCreativeKind;

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
	{platform: 'ios', folder: 'ipad-ikinci-grup', device: 'ipad', sizes: [[2007, 2853], [1398, 2034]], note: 'Listede adı yazmayan ikinci grup'},
	{platform: 'ios', folder: 'ust-gorsel', device: 'header', sizes: [[5244, 2950], [3840, 1646]], note: 'App Store Header (iOS 27+): 16:9 ya da 21:9; PNG, alfa yok; metinli ve metinsiz'},
	{platform: 'ios', folder: 'arama-sonucu', device: 'search', sizes: [[5244, 2950], [3840, 2560], [1920, 1280]], note: 'App Store Search Results (iOS 27+): 16:9 ya da 3:2; PNG, alfa yok; metinli ve metinsiz'},
	{platform: 'android', folder: 'telefon', device: 'android', sizes: [[1080, 1920]], note: 'Telefon ekran görüntüleri, 9:16 (2–8 adet)'},
	{platform: 'android', folder: 'tablet-7-inc', device: 'android', sizes: [[1440, 2560]], note: '7 inç tablet, 9:16'},
	{platform: 'android', folder: 'tablet-10-inc', device: 'android', sizes: [[2160, 3840]], note: '10 inç tablet, 9:16'},
	{platform: 'android', folder: 'masaustu', device: 'desktop', sizes: [[1920, 1080]], note: 'Masaüstü (Chromebook), 16:9 (4–8 adet)'},
	{platform: 'android', folder: 'ozellik-grafigi', device: 'feature', sizes: [[1024, 500]], note: 'Özellik grafiği 1024 × 500'},
];
