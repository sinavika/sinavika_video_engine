import {readFileSync, readdirSync} from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {ROOT} from '../Support/Paths';

/**
 * How an episode 0 speaks about the app (owner, 14 Nov 2026, after the first intros went out): names and flow follow
 * the live UIUX screens (docs/UIUX/Ekran-Envanteri.md), never "indir", the narrator is not SinoAI.
 */
const RULES: {name: string; field: 'narration' | 'caption'; pattern: RegExp; why: string}[] = [
	{name: 'indir', field: 'narration', pattern: /\bindir/iu, why: 'camp narration never says "indir" (KampSenaryoYonergesi §6); say what the app is for'},
	{name: 'ben varım', field: 'narration', pattern: /ben varım/iu, why: 'the narrator is not SinoAI (owner, 9 Nov 2026); name SinoAI in the third person'},
	{name: 'istatistik', field: 'narration', pattern: /istatistik/iu, why: 'the screen shown is Denemeler → Sonuçlar (m-deneme-gelisim); İstatistikler is a Profile screen'},
	{name: 'SinoAI caption', field: 'caption', pattern: /takıldığın yerde sinoai/iu, why: 'with the narrator speaking, this caption makes the narrator SinoAI'},
	{name: 'Bütün modüller', field: 'caption', pattern: /bütün modüller/iu, why: 'the home screen opens on Bugün (today\'s plan) since 5 Nov 2026, not on the module grid'},
];

/** Published before these rules; left as they went out. A new or rewritten episode 0 is not listed. */
const PUBLISHED = new Set([
	'kpss-cografya-kampi/00-cografya-kampi-tanitim-youtube.json',
	'kpss-geometri-kampi/00-geometri-kampi-tanitim-youtube.json',
	'kpss-matematik-kampi/00-matematik-kampi-tanitim-youtube.json',
	'kpss-tarih-kampi/00-tarih-kampi-tanitim-youtube.json',
	'kpss-turkce-kampi/00-turkce-kampi-tanitim-youtube.json',
	'kpss-vatandaslik-kampi/00-vatandaslik-kampi-tanitim-youtube.json',
	'yks-ayt-biyoloji-kampi/00-biyoloji-kampi-tanitim-youtube.json',
	'yks-ayt-cografya-kampi/00-cografya-kampi-tanitim-youtube.json',
	'yks-ayt-din-kulturu-kampi/00-din-kulturu-kampi-tanitim-youtube.json',
	'yks-ayt-edebiyat-kampi/00-ayt-kampi-tanitim-youtube.json',
	'yks-ayt-edebiyat-kampi/00-edebiyat-kampi-tanitim-youtube.json',
	'yks-ayt-felsefe-kampi/00-felsefe-kampi-tanitim-youtube.json',
	'yks-ayt-fizik-kampi/00-fizik-kampi-tanitim-youtube.json',
	'yks-ayt-geometri-kampi/00-geometri-kampi-tanitim-youtube.json',
	'yks-ayt-kimya-kampi/00-kimya-kampi-tanitim-youtube.json',
	'yks-ayt-mantik-kampi/00-mantik-kampi-tanitim-youtube.json',
	'yks-ayt-matematik-kampi/00-matematik-kampi-tanitim-youtube.json',
	'yks-ayt-psikoloji-kampi/00-psikoloji-kampi-tanitim-youtube.json',
	'yks-ayt-sosyoloji-kampi/00-sosyoloji-kampi-tanitim-youtube.json',
	'yks-ayt-tarih-kampi/00-tarih-kampi-tanitim-youtube.json',
	'yks-tyt-biyoloji-kampi/00-biyoloji-kampi-tanitim-youtube.json',
	'yks-tyt-cografya-kampi/00-cografya-kampi-tanitim-youtube.json',
	'yks-tyt-din-kulturu-ve-ahlak-bilgisi-kampi/00-din-kulturu-ve-ahlak-bilgisi-kampi-tanitim-youtube.json',
	'yks-tyt-felsefe-kampi/00-felsefe-kampi-tanitim-youtube.json',
	'yks-tyt-fizik-kampi/00-fizik-kampi-tanitim-youtube.json',
	'yks-tyt-geometri-kampi/00-geometri-kampi-tanitim-youtube.json',
	'yks-tyt-kimya-kampi/00-kimya-kampi-tanitim-youtube.json',
	'yks-tyt-matematik-kampi/00-matematik-kampi-tanitim-youtube.json',
	'yks-tyt-tarih-kampi/00-tarih-kampi-tanitim-youtube.json',
	'yks-tyt-turkce-kampi/00-turkce-kampi-tanitim-youtube.json',
	'yks-tyt-turkce-kampi/00-tyt-kampi-tanitim-youtube.json',
]);

const JOBS = path.join(ROOT, 'Curriculum', 'Jobs');
const intros = readdirSync(JOBS).flatMap((camp) =>
	readdirSync(path.join(JOBS, camp))
		.filter((name) => /^00-.*-youtube\.json$/u.test(name))
		.map((name) => ({ref: `${camp}/${name}`, content: JSON.parse(readFileSync(path.join(JOBS, camp, name), 'utf8')).content as unknown})),
);

/** Every narration and caption anywhere in a job's content. */
const texts = (value: unknown, out: {field: string; text: string}[] = []): {field: string; text: string}[] => {
	if (Array.isArray(value)) value.forEach((item) => texts(item, out));
	else if (value && typeof value === 'object')
		for (const [field, item] of Object.entries(value)) {
			if (typeof item === 'string') out.push({field, text: item});
			else texts(item, out);
		}
	return out;
};

describe('episode 0 speaks about the app as it is (owner, 14 Nov 2026)', () => {
	it('lists only episode 0 files that exist', () => {
		const refs = new Set(intros.map((intro) => intro.ref));
		expect([...PUBLISHED].filter((ref) => !refs.has(ref))).toEqual([]);
	});

	it('follows the app wording rules in every episode 0 not yet published', () => {
		const broken = intros
			.filter((intro) => !PUBLISHED.has(intro.ref))
			.flatMap((intro) =>
				texts(intro.content).flatMap(({field, text}) =>
					RULES.filter((rule) => rule.field === field && rule.pattern.test(text)).map((rule) => `${intro.ref}: ${rule.name}: ${rule.why}`),
				),
			);
		expect(broken).toEqual([]);
	});

	it('catches the published mistakes, so the rules work', () => {
		const flagged = intros.filter((intro) => texts(intro.content).some(({field, text}) => RULES.some((rule) => rule.field === field && rule.pattern.test(text))));
		expect(flagged.length).toBeGreaterThan(0);
	});
});
