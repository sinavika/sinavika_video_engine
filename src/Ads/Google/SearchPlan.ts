/**
 * Google Ads search campaigns (docs/GoogleAds/Arama-Plani.md): one campaign per
 * exam plus a brand campaign, ad groups that each land on their own exam page,
 * phrase and exact keywords, one responsive search ad per group, account-wide
 * negative keywords and the assets (sitelinks, callouts, snippets).
 *
 * The keywords come from the account's real search terms (Feb–Oct 2026): KPSS
 * searches were mostly "deneme çöz", "ortaöğretim", "önlisans", "net hesaplama"
 * and "çalışma programı"; a large share asked for PDFs, past papers to download,
 * competitors or exams Sınavika does not offer, which are now negatives.
 *
 * Search is Turkish only: students search Turkish exams in Turkish. Everything
 * is imported paused; the student page is the landing page, never the store.
 */

export const SEARCH_LIMITS = {headline: 30, description: 90, path: 15, sitelinkText: 25, sitelinkDescription: 35, callout: 25, snippetValue: 25} as const;

export const SITE = 'https://sinavika.com/tr';

type SearchAdGroup = {
	name: string;
	landing: string;
	/** Display path after sinavika.com (two parts, 15 characters each). */
	paths: [string, string];
	keywords: string[];
	/** Group-specific headlines; the campaign's shared headlines fill the ad up to 15. */
	headlines: string[];
};

export type SearchCampaign = {
	name: string;
	/** Daily budget in TRY (chosen by the owner on 20 Oct 2026); campaigns are imported enabled and serve once the account is paid. */
	dailyBudget: number;
	/** Max CPC cap for "Maximize clicks" until sign-ups are imported as conversions. */
	maxCpc: number;
	sharedHeadlines: string[];
	descriptions: [string, string, string, string];
	groups: SearchAdGroup[];
};

const KPSS_SHARED = [
	'Sınavika ile KPSS’ye hazırlan',
	'Puanını nerede kaybettin?',
	'Eksiklerini konu konu gör',
	'Her gün kısa görevlerle çalış',
	'İşten sonra da hazırlan',
	'GY-GK denemeleri çöz',
	'Bilgi Kartları ile tekrar et',
	'SinoAI takıldığın yeri anlatır',
	'Web’de ve mobilde aynı hesap',
	'Ücretsiz başla',
];

const YKS_SHARED = [
	'Sınavika ile YKS’ye hazırlan',
	'Netini nerede kaybettin?',
	'Bugün ne çalışacağını bil',
	'Eksiklerini konu konu gör',
	'TYT ve AYT denemeleri',
	'Türkiye geneli sıralamanı gör',
	'Çözemediğin soruyu çek',
	'SinoAI takıldığın yeri anlatır',
	'Web’de ve mobilde aynı hesap',
	'Ücretsiz başla',
];

export const SEARCH_CAMPAIGNS: readonly SearchCampaign[] = [
	{
		name: 'Arama · KPSS · Web',
		dailyBudget: 75,
		maxCpc: 3,
		sharedHeadlines: KPSS_SHARED,
		descriptions: [
			'Deneme çöz, netini ve puanını gör. Eksik konuların günlük plana dönüşsün.',
			'Ders Planı eksiklerinden kısa görevler kurar; işten sonra da düzenli çalış.',
			'Bilgi Kartları tarih, coğrafya ve vatandaşlığı unutmadan tekrar ettirir.',
			'SinoAI hedefini ve eksiklerini bilerek anlatır. sinavika.com’da ücretsiz başla.',
		],
		groups: [
			{
				name: 'KPSS deneme',
				landing: `${SITE}/kpss-deneme-sinavi`,
				paths: ['kpss', 'deneme'],
				keywords: ['kpss deneme', 'kpss deneme çöz', 'kpss online deneme', 'kpss deneme sınavı', 'online kpss deneme', 'kpss deneme çöz online', 'kpss türkiye geneli deneme'],
				headlines: ['KPSS deneme çöz', 'Online KPSS denemesi', 'Denemeden sonra analizini gör', 'Türkiye geneli KPSS denemesi', 'Netini ve sıralamanı gör'],
			},
			{
				name: 'KPSS ortaöğretim',
				landing: `${SITE}/kpss-ortaogretim`,
				paths: ['kpss', 'ortaogretim'],
				keywords: ['kpss ortaöğretim', 'ortaöğretim kpss', 'kpss ortaöğretim deneme', 'kpss ortaöğretim deneme çöz', 'kpss ortaöğretim soru çöz', 'kpss ortaöğretim test çöz', 'kpss ortaöğretim konuları'],
				headlines: ['KPSS ortaöğretim hazırlık', 'Ortaöğretim denemeleri çöz', 'Ortaöğretim konuları tek yerde', 'Ortaöğretim için günlük plan', 'Ortaöğretim GY-GK testleri'],
			},
			{
				name: 'KPSS önlisans',
				landing: `${SITE}/kpss-onlisans`,
				paths: ['kpss', 'onlisans'],
				keywords: ['kpss önlisans', 'önlisans kpss', 'kpss önlisans deneme', 'kpss önlisans deneme çöz', 'kpss önlisans soru çöz', 'önlisans kpss deneme çöz'],
				headlines: ['KPSS önlisans hazırlık', 'Önlisans denemeleri çöz', 'Önlisans konuları tek yerde', 'Önlisans için günlük plan', 'Önlisans GY-GK testleri'],
			},
			{
				name: 'KPSS lisans',
				landing: `${SITE}/kpss-lisans`,
				paths: ['kpss', 'lisans'],
				keywords: ['kpss lisans', 'kpss lisans deneme', 'kpss gy gk deneme', 'kpss genel yetenek genel kültür', 'kpss lisans deneme çöz'],
				headlines: ['KPSS lisans hazırlık', 'Lisans GY-GK denemeleri', 'Genel yetenek ve genel kültür', 'Lisans için günlük plan', 'GY-GK’da eksiğini gör'],
			},
			{
				name: 'KPSS net hesaplama',
				landing: `${SITE}/kpss-net-hesaplama`,
				paths: ['kpss', 'net-hesaplama'],
				keywords: ['kpss net hesaplama', 'kpss puan hesaplama', 'net hesaplama kpss', 'kpss önlisans puan hesaplama', 'kpss ortaöğretim puan hesaplama'],
				headlines: ['KPSS net hesaplama', 'KPSS puanını hesapla', 'Netini hesapla, eksiğini gör', 'Ücretsiz net hesaplama aracı', 'Hedef puanına ne kadar var?'],
			},
			{
				name: 'KPSS çalışma programı',
				landing: `${SITE}/urunler/ders-plani`,
				paths: ['kpss', 'calisma-plani'],
				keywords: ['kpss çalışma programı', 'kpss ders çalışma programı', 'kpss çalışma planı', 'kpss hazırlık', 'kpss nasıl çalışılır'],
				headlines: ['KPSS çalışma programı', 'Sana göre KPSS planı', 'Bugün ne çalışacağını bil', 'Eksiklerinden günlük görevler', 'Plan sınav tarihine göre'],
			},
			{
				name: 'KPSS uygulama',
				landing: `${SITE}/kpss-deneme-sinavi`,
				paths: ['kpss', 'uygulama'],
				keywords: ['kpss uygulaması', 'kpss uygulama', 'ücretsiz kpss uygulamaları', 'kpss hazırlık uygulaması', 'kpss soru çözme uygulaması'],
				headlines: ['KPSS uygulaması', 'Telefonunda KPSS hazırlığı', 'iOS ve Android’de Sınavika', 'Deneme, plan ve kartlar', 'Kısa görevlerle her gün çalış'],
			},
		],
	},
	{
		name: 'Arama · YKS · Web',
		dailyBudget: 75,
		maxCpc: 3,
		sharedHeadlines: YKS_SHARED,
		descriptions: [
			'Deneme çöz, netini ve sıralamanı gör. Eksik konuların günlük plana dönüşsün.',
			'Ders Planı eksiklerinden günlük görevler kurar; bugün ne çalışacağını bil.',
			'Akıllı Özet çözemediğin soruyu adım adım çözer ve konusunu söyler.',
			'SinoAI hedefini ve eksiklerini bilerek anlatır. sinavika.com’da ücretsiz başla.',
		],
		groups: [
			{
				name: 'YKS deneme',
				landing: `${SITE}/yks-deneme-sinavi`,
				paths: ['yks', 'deneme'],
				keywords: ['yks deneme', 'yks deneme çöz', 'tyt deneme çöz', 'online tyt deneme', 'tyt deneme sınavı', 'ayt deneme çöz', 'yks online deneme'],
				headlines: ['TYT ve AYT deneme çöz', 'Online YKS denemesi', 'Denemeden sonra analizini gör', 'Netini ve sıralamanı gör', 'Hangi konuda net kaybettin?'],
			},
			{
				name: 'Türkiye geneli deneme',
				landing: `${SITE}/turkiye-geneli-deneme-sinavi`,
				paths: ['deneme', 'turkiye-geneli'],
				keywords: ['türkiye geneli deneme', 'türkiye geneli tyt deneme', 'türkiye geneli deneme sınavı', 'online türkiye geneli deneme'],
				headlines: ['Türkiye geneli deneme', 'Sıralamanı Türkiye ile kıyasla', 'Türkiye geneli TYT denemesi', 'Puanını ve yerini öğren', 'Denemeden sonra analizini gör'],
			},
			{
				name: 'TYT hazırlık',
				landing: `${SITE}/tyt-hazirlik`,
				paths: ['tyt', 'hazirlik'],
				keywords: ['tyt hazırlık', 'tyt çalışma', 'tyt konuları', 'tyt soru çöz', 'tyt test çöz'],
				headlines: ['TYT’ye hazırlan', 'TYT konuları ve testleri', 'TYT için günlük plan', 'Mikro derslerle TYT', 'TYT netini artır'],
			},
			{
				name: 'AYT hazırlık',
				landing: `${SITE}/ayt-hazirlik`,
				paths: ['ayt', 'hazirlik'],
				keywords: ['ayt hazırlık', 'ayt çalışma', 'ayt konuları', 'ayt soru çöz', 'ayt test çöz'],
				headlines: ['AYT’ye hazırlan', 'AYT konuları ve testleri', 'AYT için günlük plan', 'Mikro derslerle AYT', 'AYT netini artır'],
			},
			{
				name: 'YKS net hesaplama',
				landing: `${SITE}/yks-net-hesaplama`,
				paths: ['yks', 'net-hesaplama'],
				keywords: ['yks net hesaplama', 'tyt net hesaplama', 'yks puan hesaplama', 'tyt puan hesaplama', 'ayt net hesaplama'],
				headlines: ['YKS net hesaplama', 'TYT puanını hesapla', 'Netini hesapla, eksiğini gör', 'Ücretsiz net hesaplama aracı', 'Hedef puanına ne kadar var?'],
			},
			{
				name: 'YKS çalışma programı',
				landing: `${SITE}/urunler/ders-plani`,
				paths: ['yks', 'calisma-plani'],
				keywords: ['yks çalışma programı', 'tyt çalışma programı', 'yks çalışma planı', 'yks ders çalışma programı', 'yks nasıl çalışılır'],
				headlines: ['YKS çalışma programı', 'Sana göre YKS planı', 'Plan sınav tarihine göre', 'Eksiklerinden günlük görevler', 'Netine göre günlük görevler'],
			},
		],
	},
	{
		name: 'Arama · Marka',
		dailyBudget: 15,
		maxCpc: 1.5,
		sharedHeadlines: ['Sınavika', 'Sınavika’ya giriş yap', 'Deneme, plan ve SinoAI', 'Web’de ve mobilde aynı hesap', 'Ücretsiz başla', 'YKS ve KPSS hazırlığı', 'Netini nerede kaybettin?', 'Bugün ne çalışacağını bil', 'iOS ve Android’de Sınavika', 'Kaldığın yerden devam et'],
		descriptions: [
			'Sınavika’nın resmi sitesi. Deneme çöz, analizini gör, planınla çalış.',
			'YKS ve KPSS için denemeler, testler, mikro dersler ve Bilgi Kartları.',
			'Ders Planı eksiklerinden günlük görevler kurar; SinoAI takıldığın yeri anlatır.',
			'Web’de ve mobilde aynı hesap. sinavika.com’da ücretsiz başla.',
		],
		groups: [
			{
				name: 'Sınavika',
				landing: `${SITE}`,
				paths: ['', ''],
				keywords: ['sınavika', 'sinavika', 'sınavika giriş', 'sinavika com', 'sınavika uygulama'],
				headlines: ['Sınavika resmi sitesi', 'Sınavika’da ücretsiz başla', 'Sınavika uygulaması', 'Sınavika ile hazırlan', 'Sınavika hesabına gir'],
			},
		],
	},
];

/**
 * Account-wide negative keywords (phrase match). Reasons: downloads and PDFs
 * (the student wants a file, not an app), competitors' brands, exams Sınavika
 * does not offer, and job or application searches around KPSS. Publishers are not
 * negatives: they sell their mock exams on Sınavika.
 */
export const NEGATIVE_KEYWORDS: readonly {keyword: string; reason: string}[] = [
	...['pdf', 'indir', 'yazdır', 'çıktı al', 'cevap anahtarı', 'kitap', 'kitabı'].map((keyword) => ({keyword, reason: 'Dosya/kitap arayan'})),
	...['ozard', 'derece', 'pusula', 'ders platosu', 'sınavbank', 'astra ai', 'yerles net', 'çalışma odam', 'benim hocam'].map((keyword) => ({keyword, reason: 'Rakip marka'})),
	...['ags', 'ales', 'öabt', 'oabt', 'dhbt', 'lgs', 'dgs', 'yds', 'ehliyet', 'msü', 'alan bilgisi'].map((keyword) => ({keyword, reason: 'Sunulmayan sınav'})),
	...['başvuru', 'tercih', 'atama', 'ilan', 'maaş', 'memur alımı', 'sonuç', 'sonuçları', 'iş ilanı', 'kadro', 'taban puan'].map((keyword) => ({keyword, reason: 'İş/başvuru araması'})),
];

export const SITELINKS: readonly {text: string; line1: string; line2: string; url: string}[] = [
	{text: 'Türkiye geneli deneme', line1: 'Netini ve sıralamanı gör', line2: 'Denemeden sonra analizini oku', url: `${SITE}/turkiye-geneli-deneme-sinavi`},
	{text: 'Ders Planı', line1: 'Bugün ne çalışacağını bil', line2: 'Eksiklerinden günlük görevler', url: `${SITE}/urunler/ders-plani`},
	{text: 'SinoAI', line1: 'Takıldığın konuyu sor', line2: 'Hedefini bilerek anlatır', url: `${SITE}/urunler/sinoai`},
	{text: 'Net hesaplama', line1: 'Netini ve puanını hesapla', line2: 'YKS ve KPSS için ücretsiz', url: `${SITE}/net-hesaplama`},
	{text: 'Sınav takvimi', line1: 'Sınavına kaç gün kaldı?', line2: 'YKS ve KPSS tarihleri', url: `${SITE}/sinav-takvimi`},
	{text: 'Ücretsiz kayıt ol', line1: 'Hesabını bir dakikada aç', line2: 'Web’de ve mobilde aynı hesap', url: `${SITE}/student/register`},
];

export const CALLOUTS: readonly string[] = ['Web ve mobilde aynı hesap', 'Türkiye geneli sıralama', 'Günlük çalışma planı', 'Adım adım çözümler', 'Mikro dersler ve testler', 'Ücretsiz başla'];

/** Structured snippet: header must be one of Google's fixed headers ("Kurslar" is Turkish for "Courses"). */
export const SNIPPET = {header: 'Kurslar', values: ['Denemeler', 'Testler', 'Mikro dersler', 'Bilgi Kartları', 'Ders Planı', 'SinoAI']} as const;

/** The 15 headlines of a group's ad: its own first, then the campaign's shared ones, without repeats. */
export const headlinesFor = (campaign: SearchCampaign, group: SearchAdGroup): string[] => [...new Set([...group.headlines, ...campaign.sharedHeadlines])].slice(0, 15);
