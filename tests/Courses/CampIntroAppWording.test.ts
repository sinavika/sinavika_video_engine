import {readFileSync, readdirSync} from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {ChecklistSchema} from '../../src/Courses/Curriculum';
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

/**
 * Episode 0 videos already on YouTube are left as they went out: the checklist records them
 * (`npm run curriculum -- mark INTRO:<camp> --stage published`). Every other episode 0 follows the rules.
 */
const PUBLISHED_CAMPS = new Set(Object.entries(ChecklistSchema.parse(JSON.parse(readFileSync(path.join(ROOT, 'Curriculum', 'Production', 'Checklist.json'), 'utf8'))).intros).filter(([, intro]) => intro.published).map(([camp]) => camp));

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
	it('records only camps that exist', () => {
		const camps = new Set(intros.map((intro) => intro.ref.split('/')[0]));
		expect([...PUBLISHED_CAMPS].filter((camp) => !camps.has(camp))).toEqual([]);
	});

	it('follows the app wording rules in every episode 0 not yet on YouTube', () => {
		const broken = intros
			.filter((intro) => !PUBLISHED_CAMPS.has(intro.ref.split('/')[0]))
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
