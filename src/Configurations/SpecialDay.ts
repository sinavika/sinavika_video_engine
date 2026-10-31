/**
 * National and religious holidays and the brand's special days. On these days
 * Sınavika does not advertise (owner, 29 Oct 2026: "sakın reklam yapma, sadece
 * logo"; extended the same day to every national and religious holiday):
 *
 * - no product, no call ("indir", link, "profilde"), no brand name in the text
 *   and no #sinavika, only the day's own hashtags;
 * - the visual carries only the small corner logo;
 * - every post of that day follows this, stories too.
 *
 * The campaign tests and `npm run social -- submit` check posts dated on these
 * days against `checkSpecialDayCopy`, so an advert never leaves on a holiday.
 * Religious holidays move every year: add the next year from Diyanet's
 * calendar (diyanet.gov.tr) before planning that year.
 */

type SpecialDayKind = 'milli-bayram' | 'dini-bayram' | 'anma' | 'ozel-gun';

type SpecialDay = {
	id: string;
	name: string;
	kind: SpecialDayKind;
	/** The day's own hashtags, used instead of the brand's. */
	hashtags: readonly string[];
};

type FixedDay = SpecialDay & {monthDay: string};
type MovingDay = SpecialDay & {dates: readonly string[]};

/** Same date every year. */
const FIXED_DAYS: readonly FixedDay[] = [
	{id: '23-nisan', monthDay: '04-23', name: '23 Nisan Ulusal Egemenlik ve Çocuk Bayramı', kind: 'milli-bayram', hashtags: ['#23Nisan', '#UlusalEgemenlikVeÇocukBayramı']},
	{id: '19-mayis', monthDay: '05-19', name: '19 Mayıs Atatürk’ü Anma, Gençlik ve Spor Bayramı', kind: 'milli-bayram', hashtags: ['#19Mayıs', '#GençlikVeSporBayramı', '#Atatürk']},
	{id: '30-agustos', monthDay: '08-30', name: '30 Ağustos Zafer Bayramı', kind: 'milli-bayram', hashtags: ['#30Ağustos', '#ZaferBayramı']},
	{id: '29-ekim', monthDay: '10-29', name: '29 Ekim Cumhuriyet Bayramı', kind: 'milli-bayram', hashtags: ['#29Ekim', '#CumhuriyetBayramı', '#Atatürk']},
	{id: '10-kasim', monthDay: '11-10', name: '10 Kasım Atatürk’ü Anma Günü', kind: 'anma', hashtags: ['#10Kasım', '#Atatürk', '#SaygıylaAnıyoruz']},
	{id: '24-kasim', monthDay: '11-24', name: '24 Kasım Öğretmenler Günü', kind: 'ozel-gun', hashtags: ['#24Kasım', '#ÖğretmenlerGünü', '#Başöğretmen']},
];

/** Diyanet's calendar; every day of the holiday counts (arefe does not). */
const MOVING_DAYS: readonly MovingDay[] = [
	{id: 'ramazan-bayrami-2026', dates: ['2026-03-20', '2026-03-21', '2026-03-22'], name: 'Ramazan Bayramı', kind: 'dini-bayram', hashtags: ['#RamazanBayramı', '#BayramınızMübarekOlsun']},
	{id: 'kurban-bayrami-2026', dates: ['2026-05-27', '2026-05-28', '2026-05-29', '2026-05-30'], name: 'Kurban Bayramı', kind: 'dini-bayram', hashtags: ['#KurbanBayramı', '#BayramınızMübarekOlsun']},
	{id: 'ramazan-bayrami-2027', dates: ['2027-03-09', '2027-03-10', '2027-03-11'], name: 'Ramazan Bayramı', kind: 'dini-bayram', hashtags: ['#RamazanBayramı', '#BayramınızMübarekOlsun']},
	{id: 'kurban-bayrami-2027', dates: ['2027-05-16', '2027-05-17', '2027-05-18', '2027-05-19'], name: 'Kurban Bayramı', kind: 'dini-bayram', hashtags: ['#KurbanBayramı', '#BayramınızMübarekOlsun']},
];

/** The years whose religious holidays are entered; planning past them needs Diyanet's next calendar first. */
export const SPECIAL_DAY_YEARS = [...new Set(MOVING_DAYS.flatMap((day) => day.dates.map((date) => Number(date.slice(0, 4)))))];

const strip = ({id, name, kind, hashtags}: SpecialDay): SpecialDay => ({id, name, kind, hashtags});

/** Every special day falling on a date (`YYYY-MM-DD`, Turkish local date); 19 May 2027 is both a national and a religious holiday. */
export const specialDaysOn = (date: string): SpecialDay[] => {
	const day = date.slice(0, 10);
	return [...FIXED_DAYS.filter((fixed) => fixed.monthDay === day.slice(5)), ...MOVING_DAYS.filter((moving) => moving.dates.includes(day))].map(strip);
};

export const isSpecialDay = (date: string): boolean => specialDaysOn(date).length > 0;

/** The Turkish local date of a timestamp with offset (`2026-11-10T09:05:00+03:00` → `2026-11-10`). */
const localDateOf = (timestamp: string): string => {
	if (/^\d{4}-\d{2}-\d{2}$/.test(timestamp)) return timestamp;
	const instant = new Date(timestamp);
	if (Number.isNaN(instant.getTime())) return timestamp.slice(0, 10);
	return new Date(instant.getTime() + 3 * 3600 * 1000).toISOString().slice(0, 10);
};

/**
 * What an advert sounds like: the brand, the product, a call to download,
 * follow or click. Matched on the Turkish lower case of the text, so
 * "SINAVİKA", "İndir" and "#sinavika" are all caught.
 */
const ADVERT_TERMS: readonly {pattern: RegExp; message: string}[] = [
	{pattern: /s[ıi]navika|sinoai/gu, message: 'Marka ya da ürün adı (logo yeterli; #sinavika da yok).'},
	{pattern: /(?<!\p{L})(indir|yükle)\p{L}*/gu, message: 'İndirme çağrısı.'},
	{pattern: /(?<!\p{L})(uygulama|abone|takip et|profilde|bağlantı|link|ücretsiz|kayıt ol|hemen dene)\p{L}*/gu, message: 'Ürün ya da çağrı.'},
	{pattern: /https?:\/\/|www\./gu, message: 'Bağlantı.'},
];

type SpecialDayIssue = {term: string; message: string};

/** The advert terms found in a special day's texts (title, caption, hashtags, voice-over, on-screen words). */
export const checkSpecialDayCopy = (texts: readonly (string | undefined)[]): SpecialDayIssue[] =>
	texts.flatMap((text) => {
		if (!text) return [];
		const lower = text.toLocaleLowerCase('tr');
		return ADVERT_TERMS.flatMap((rule) => [...lower.matchAll(rule.pattern)].map((match) => ({term: match[0], message: rule.message})));
	});

class SpecialDayCopyError extends Error {
	constructor(
		readonly day: SpecialDay,
		readonly issues: SpecialDayIssue[],
	) {
		super(`${day.name}: özel günde reklam yapılmaz, yalnız logo. Metinde: ${issues.map((issue) => `"${issue.term}" (${issue.message})`).join('; ')}`);
	}
}

/** Throws when a text dated on a special day advertises. */
export const assertSpecialDayCopy = (date: string, texts: readonly (string | undefined)[]): void => {
	const [day] = specialDaysOn(localDateOf(date));
	if (!day) return;
	const issues = checkSpecialDayCopy(texts);
	if (issues.length) throw new SpecialDayCopyError(day, issues);
};
