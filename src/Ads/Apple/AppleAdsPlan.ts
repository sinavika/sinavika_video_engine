/**
 * Apple Ads (App Store search ads) plan: one Search Results campaign per market,
 * one ad group per exam plus brand and discovery groups, the keywords, the negatives
 * and the custom product pages the ad groups can point to.
 *
 * Markets follow the Google Ads set: Türkiye = YKS + KPSS in Turkish, ABD = SAT + ACT in English.
 * Budgets are in the account currency (USD). The owner asked for $10 a day per campaign.
 *
 * Keywords are App Store searches, which are shorter than Google queries ("tyt deneme",
 * "sat practice"). Exam groups use exact match only; the discovery group carries broad
 * match plus Search Match so Apple can find new terms, which then move to an exam group.
 * Bids follow Apple's suggestion when the groups were created on 20 Oct 2026 (TR $1.32, US $1.46).
 */
import type {AdExam} from '../Google/GoogleAdsPlan';

export type AppleMarket = 'tr' | 'en';
export type AppleMatch = 'EXACT' | 'BROAD';

export type AppleAdGroup = {
	name: string;
	/** Exam the group sells; brand and discovery groups have none. */
	exam?: AdExam;
	match: AppleMatch;
	/** Apple's Search Match: lets Apple add searches it finds relevant. On only for discovery. */
	searchMatch: boolean;
	/** Max cost per tap in USD. */
	defaultBid: number;
	keywords: readonly string[];
};

export type AppleCampaign = {
	market: AppleMarket;
	name: string;
	/** App Store storefront, as Apple Ads lists it. */
	country: string;
	dailyBudget: number;
	adGroups: readonly AppleAdGroup[];
	negatives: readonly string[];
};

export const APPLE_DAILY_BUDGET_USD = 10;

const TR_NEGATIVES = [
	// Exams Sınavika does not offer (docs: exams-not-offered).
	'ales', 'dgs', 'lgs', 'yds', 'yökdil', 'öabt', 'oabt', 'ags', 'dhbt', 'msü', 'ehliyet', 'ehliyet sınavı',
	// Not students looking to prepare.
	'kpss sonuçları', 'kpss başvuru', 'kpss tercih', 'yks sonuç', 'yks başvuru', 'yks tercih', 'atama', 'memur alımı', 'taban puan',
	// Competitors by name.
	'ozard', 'derece', 'pusula', 'sınavbank', 'benim hocam',
] as const;

const EN_NEGATIVES = [
	// Other tests.
	'psat', 'lsat', 'mcat', 'gre', 'gmat', 'ged', 'toefl', 'ielts', 'ap exam', 'nclex', 'asvab', 'hesi', 'teas',
	// Unrelated meanings.
	'sat nav', 'act of', 'acting', 'actor', 'act now',
	// Not students looking to prepare.
	'sat scores release', 'act scores release', 'sat registration', 'act registration', 'sat test dates', 'act test dates',
] as const;

export const APPLE_CAMPAIGNS: readonly AppleCampaign[] = [
	{
		market: 'tr',
		name: 'Arama · TR (YKS + KPSS)',
		country: 'Türkiye',
		dailyBudget: APPLE_DAILY_BUDGET_USD,
		negatives: TR_NEGATIVES,
		adGroups: [
			{
				name: 'YKS',
				exam: 'yks',
				match: 'EXACT',
				searchMatch: false,
				defaultBid: 0.8,
				keywords: [
					'yks', 'tyt', 'ayt', 'yks deneme', 'tyt deneme', 'ayt deneme', 'yks hazırlık', 'tyt hazırlık',
					'tyt soru çöz', 'ayt soru çöz', 'yks soru çözme', 'tyt net hesaplama', 'yks net hesaplama',
					'yks çalışma programı', 'tyt çalışma programı', 'üniversite sınavı', 'türkiye geneli deneme',
				],
			},
			{
				name: 'KPSS',
				exam: 'kpss',
				match: 'EXACT',
				searchMatch: false,
				defaultBid: 0.8,
				keywords: [
					'kpss', 'kpss deneme', 'kpss hazırlık', 'kpss soru çöz', 'kpss uygulama', 'kpss lisans',
					'kpss önlisans', 'kpss ortaöğretim', 'kpss gy gk', 'kpss genel kültür', 'kpss tarih',
					'kpss net hesaplama', 'kpss puan hesaplama', 'kpss çalışma programı', 'kpss bilgi kartları',
				],
			},
			{
				name: 'Marka',
				match: 'EXACT',
				searchMatch: false,
				defaultBid: 0.3,
				// Apple treats 'sınavika' and 'sinavika' as one keyword and rejects the pair.
				keywords: ['sinavika', 'sinoai'],
			},
			{
				name: 'Keşif',
				match: 'BROAD',
				searchMatch: true,
				defaultBid: 0.5,
				keywords: ['deneme sınavı', 'soru çözme', 'sınav hazırlık', 'ders çalışma programı', 'soru çözüm uygulaması'],
			},
		],
	},
	{
		market: 'en',
		name: 'Search · US (SAT + ACT)',
		country: 'United States',
		dailyBudget: APPLE_DAILY_BUDGET_USD,
		negatives: EN_NEGATIVES,
		adGroups: [
			{
				name: 'SAT',
				exam: 'sat',
				match: 'EXACT',
				searchMatch: false,
				defaultBid: 1.5,
				keywords: [
					'sat', 'sat prep', 'sat practice', 'sat practice test', 'digital sat', 'digital sat prep',
					'sat prep app', 'sat math', 'sat math practice', 'sat reading and writing', 'sat score calculator',
					'sat study plan', 'sat questions',
				],
			},
			{
				name: 'ACT',
				exam: 'act',
				match: 'EXACT',
				searchMatch: false,
				defaultBid: 1.5,
				keywords: [
					'act', 'act prep', 'act practice', 'act practice test', 'act prep app', 'act math',
					'act math practice', 'act science', 'act english', 'act reading', 'act score calculator', 'act study plan',
				],
			},
			{
				name: 'Brand',
				match: 'EXACT',
				searchMatch: false,
				defaultBid: 0.5,
				keywords: ['sinavika', 'sinoai'],
			},
			{
				name: 'Discovery',
				match: 'BROAD',
				searchMatch: true,
				defaultBid: 1,
				keywords: ['test prep', 'college entrance exam', 'practice test app', 'study planner', 'homework helper'],
			},
		],
	},
];

/**
 * Custom product page (App Store Connect › Özel Ürün Sayfaları) for one exam. The screenshots are
 * the store set in a different order, so the page opens with what that exam's searchers want.
 * Promotional text is App Store's 170-character field.
 */
export type CustomProductPage = {
	exam: AdExam;
	market: AppleMarket;
	name: string;
	promotionalText: string;
	/** Store screenshot file names (iPhone set), first one shown first. */
	screenshots: readonly string[];
};

export const PROMOTIONAL_TEXT_MAX = 170;

const TR_STORE = {
	allInOne: '01-hepsi-tek-yerde.png',
	sinoai: '02-sinoai.png',
	snap: '03-fotograf-cek-coz.png',
	notes: '04-kendi-kaynaklarin.png',
	learn: '05-ogren-pekistir.png',
	mock: '06-deneme-gelisim.png',
	plan: '07-plan-takip.png',
	cards: '08-kartlarla-tekrar.png',
} as const;

const EN_STORE = {
	allInOne: '01-all-in-one.png',
	sinoai: '02-sinoai.png',
	snap: '03-snap-and-solve.png',
	notes: '04-your-own-notes.png',
	learn: '05-learn-and-practise.png',
	mock: '06-mock-exams.png',
	plan: '07-plan-and-track.png',
	cards: '08-flashcards.png',
} as const;

export const CUSTOM_PRODUCT_PAGES: readonly CustomProductPage[] = [
	{
		exam: 'yks',
		market: 'tr',
		name: 'YKS – deneme ve plan',
		promotionalText: 'TYT ve AYT denemesi çöz, netini nerede kaybettiğini gör. Ders Planı eksiklerini günlük görevlere çevirir, SinoAI takıldığın soruyu anlatır.',
		screenshots: [TR_STORE.mock, TR_STORE.plan, TR_STORE.snap, TR_STORE.sinoai, TR_STORE.learn, TR_STORE.cards, TR_STORE.notes, TR_STORE.allInOne],
	},
	{
		exam: 'kpss',
		market: 'tr',
		name: 'KPSS – deneme ve kartlar',
		promotionalText: 'KPSS denemesi çöz, puanını ve eksik konularını gör. Bilgi Kartları ile tarih ve coğrafyayı tekrar et, işten sonra da günlük planla hazırlan.',
		screenshots: [TR_STORE.mock, TR_STORE.cards, TR_STORE.plan, TR_STORE.sinoai, TR_STORE.snap, TR_STORE.learn, TR_STORE.notes, TR_STORE.allInOne],
	},
	{
		exam: 'sat',
		market: 'en',
		name: 'SAT – practice and plan',
		promotionalText: 'Take an SAT practice test and see where your score drops by section. Study Plan turns weak skills into daily tasks, and SinoAI explains any question.',
		screenshots: [EN_STORE.mock, EN_STORE.plan, EN_STORE.snap, EN_STORE.sinoai, EN_STORE.learn, EN_STORE.cards, EN_STORE.notes, EN_STORE.allInOne],
	},
	{
		exam: 'act',
		market: 'en',
		name: 'ACT – practice and plan',
		promotionalText: 'Take an ACT practice test and see your score by section. Study Plan turns weak skills into short daily tasks, and SinoAI explains the questions you miss.',
		screenshots: [EN_STORE.mock, EN_STORE.plan, EN_STORE.snap, EN_STORE.sinoai, EN_STORE.learn, EN_STORE.cards, EN_STORE.notes, EN_STORE.allInOne],
	},
];
