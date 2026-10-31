import {readdirSync, readFileSync, statSync} from 'node:fs';
import path from 'node:path';
import type React from 'react';
import {describe, expect, it} from 'vitest';
import {BRAND_COLORS} from '../../src/Configurations/BrandColors';
import {APP_END_CARD, COVER_STANDARD, POST_TYPE, STORE_BADGES, titleLinesAllowed} from '../../src/Configurations/SocialIdentity';
import * as November from '../../src/Campaigns/Tanitim2026Kasim';
import {lineCount, seriesSize} from '../../src/Images/Components/TextMeasure';
import {IMAGE_TEMPLATES} from '../../src/Images/ImageTemplateRegistry';
import {resolveImageJob} from '../../src/Images/Renderers/ImageJob';
import {resolveVideoJob} from '../../src/Renderers/VideoJob';
import {readVideoJob} from '../../src/Renderers/VideoJobFile';
import {coverJobOf} from '../../src/Services/VideoCoverGenerator';
import {appEndScenes, OUTRO_SCENE_ID} from '../../src/Scenes/AppEndScene';
import {createNarrator} from '../../src/Scenes/Voiceover';
import {TEMPLATES} from '../../src/Templates/TemplateRegistry';
import {ROOT} from '../Support/Paths';

/** The component a scene draws. */
const componentOf = (node: React.ReactNode) => (node as React.ReactElement).type;
/** The app card component, taken from the scene builder so the test needs no export of it. */
const AppEndCard = componentOf(appEndScenes(true)[0].element);

/**
 * Videos that end elsewhere on purpose: Google Ads films show the ad's own
 * exam screen in three shapes and two languages, the store film is a 16:9
 * landscape piece, holiday videos end on the logo alone (Configurations/
 * SpecialDay), and the camp lessons end on the next lesson (YouTube series).
 */
const OWN_ENDING = new Set(['GoogleVideoAd', 'AppShowcase', 'RepublicDay', 'AtaturkMemorial', 'Basogretmen', 'CampIntro', 'CampLesson', 'CampShort', 'CourseLesson', 'CourseShort']);

describe('the one app card every reel ends on', () => {
	const endingTemplates = TEMPLATES.filter((template) => !OWN_ENDING.has(template.id));

	it.each(endingTemplates.map((template) => [template.id, template] as const))('%s ends on the shared app card', (_, template) => {
		const content = template.contentSchema.parse(template.sampleContent);
		const last = template.buildScenes(content).at(-1)!;
		expect(last.id).toBe(OUTRO_SCENE_ID);
		expect(componentOf(last.element)).toBe(AppEndCard);
		expect(last.seconds).toBeGreaterThanOrEqual(APP_END_CARD.seconds);
	});

	it('says the same line for the same time in every reel; a script cannot change it', () => {
		const say = createNarrator({}, {[APP_END_CARD.voiceId]: 'Başka bir cümle.'});
		const [scene] = appEndScenes(true, say);
		expect(scene.voice?.[0].text).toBe(APP_END_CARD.narration);
		expect(scene.seconds).toBe(APP_END_CARD.seconds);
		expect(appEndScenes(true)[0]).toMatchObject({seconds: APP_END_CARD.seconds, silent: true});
		expect(appEndScenes(false)).toEqual([]);
	});

	it('shows one call: "Ücretsiz indir", never a free start or trial', () => {
		expect(APP_END_CARD.cta).toBe('Ücretsiz indir');
		expect(APP_END_CARD.narration).not.toMatch(/ücretsiz\s+(başla|dene|kullan)/i);
	});
});

describe('the one cover and the store badges', () => {
	const palette = new Set<string>([...Object.values(BRAND_COLORS.brand), ...Object.values(BRAND_COLORS.light), ...Object.values(BRAND_COLORS.dark), '#FFFFFF']);

	it('paints every cover from the brand palette: navy ground, white title, orange mark, white logo', () => {
		expect(COVER_STANDARD.ground).toBe(BRAND_COLORS.brand.textPrimary);
		expect(COVER_STANDARD.mark).toBe(BRAND_COLORS.brand.primary);
		for (const color of [COVER_STANDARD.ground, COVER_STANDARD.title, COVER_STANDARD.mark, COVER_STANDARD.markText, COVER_STANDARD.logoColor]) expect(palette.has(color), color).toBe(true);
	});

	it('draws the badges in brand charcoal with both stores, App Store first', () => {
		expect(STORE_BADGES.fill).toBe(BRAND_COLORS.brand.charcoal);
		expect(STORE_BADGES.stores.map((store) => store.name)).toEqual(['App Store', 'Google Play']);
	});

	/** Every source file under a folder. */
	const sources = (folder: string): string[] =>
		readdirSync(folder).flatMap((name) => {
			const full = path.join(folder, name);
			return statSync(full).isDirectory() ? sources(full) : /\.tsx?$/.test(name) ? [full] : [];
		});

	it('leaves the store marks, the store names line and the covers to the shared pieces', () => {
		const offenders = [...sources(path.join(ROOT, 'src', 'Templates')), ...sources(path.join(ROOT, 'src', 'Images')), ...sources(path.join(ROOT, 'src', 'Scenes'))]
			.map((file) => ({file: path.relative(ROOT, file).replace(/\\/g, '/'), text: readFileSync(file, 'utf8')}))
			.filter(({text}) => /<StoreLogo\b|App Store · Google Play|iOS · Android|PromoEndCard/.test(text))
			.map(({file}) => file);
		expect(offenders).toEqual([]);
	});

	it('gives the video cover and the first image of a post the same cover component', () => {
		const videoCover = readFileSync(path.join(ROOT, 'src/Images/Templates/Thumbnails/VideoCover.tsx'), 'utf8');
		const promoDeck = readFileSync(path.join(ROOT, 'src/Images/Templates/Campaigns/PromoDeck.tsx'), 'utf8');
		expect(videoCover).toMatch(/<BrandCover\b/);
		expect(promoDeck).toMatch(/if \(page === 0 && slide\.kind !== 'closing'\) return <CoverSlide/);
		expect(promoDeck).toMatch(/<BrandCover\b/);
	});
});

describe('cover type: one size, fixed places, nothing cut', () => {
	/** Text boxes in reference pixels: a 9:16 reel and a 16:9 YouTube cover (gridInsets margin 72, wide text on 58%). */
	const BOX = {tall: 1080 - 144, wide: 0.58 * (1920 - 144)} as const;
	const spacing = COVER_STANDARD.titleLetterSpacingEm;
	const titleLines = (title: string, size: number, box: number, letterSpacingEm: number) => lineCount(title, box, {size, weight: COVER_STANDARD.titleWeight, letterSpacingEm});
	const camps = readdirSync(path.join(ROOT, 'Curriculum', 'Camps')).map((file) => JSON.parse(readFileSync(path.join(ROOT, 'Curriculum', 'Camps', file), 'utf8')) as {name: string; lessons: {title: string}[]});

	it('measures lines like the browser draws them', () => {
		// Rendered 29 Oct 2026: "yalan söylüyor." took 738 px at 108 px; the cover breaks "Netin sana yalan söylüyor." into two lines.
		expect(titleLines('Netin sana yalan söylüyor.', 124, BOX.tall - 10, spacing)).toBe(2);
		expect(titleLines('Söz Yorumu', 150, BOX.tall - 12, spacing)).toBe(1);
		expect(titleLines('Sınıflandırılması', 150, BOX.tall - 12, spacing)).toBe(Infinity);
	});

	it('gives every camp one title size that fits all its lessons, never below 104 px, and never cuts a title', () => {
		for (const camp of camps) {
			const titles = camp.lessons.map((lesson) => lesson.title);
			for (const shape of ['tall', 'wide'] as const) {
				const {size, lines} = seriesSize(titles, COVER_STANDARD.seriesTitleSteps, BOX[shape] - 12, (step) => titleLinesAllowed(shape, step), {weight: COVER_STANDARD.titleWeight, letterSpacingEm: spacing});
				expect(size, `${camp.name} ${shape}`).toBeGreaterThanOrEqual(104);
				expect(lines, `${camp.name} ${shape}`).toBeLessThanOrEqual(titleLinesAllowed(shape, size));
				for (const title of titles) expect(titleLines(title, size, BOX[shape] - 0.08 * size, spacing), `${camp.name}: ${title}`).toBeLessThanOrEqual(titleLinesAllowed(shape, size));
				expect(size * lines, `${camp.name} ${shape}: room for the title`).toBeLessThanOrEqual(COVER_STANDARD.titleBlock[shape]);
			}
		}
	});

	it('fits every November reel hook on its cover at the one reel size', () => {
		for (const entry of November.CAMPAIGN_FEED.filter((candidate) => candidate.kind === 'reel')) {
			const size = COVER_STANDARD.titleSizes.tall;
			expect(titleLines(entry.hook, size, BOX.tall - 0.08 * size, spacing), entry.id).toBeLessThanOrEqual(titleLinesAllowed('tall', size));
		}
	});
});

/**
 * Owner, 30 Oct 2026: punto sabitliği "sosyal medya için hazırlanan içerikler
 * ve kapaklar için de geçerli… merkezi olarak kur, koru, gelecekte bu tarz
 * hatalar yapma". Every social image has one size per role (POST_TYPE,
 * COVER_STANDARD), measured lines, and a check that refuses text that does
 * not fit before anything is rendered (checkLayout, resolveImageJob).
 */
describe('post type: one size per role, measured, refused when it does not fit', () => {
	const walk = (dir: string): string[] => readdirSync(dir).flatMap((name) => {
		const file = path.join(dir, name);
		return statSync(file).isDirectory() ? walk(file) : file.endsWith('.json') ? [file] : [];
	});
	const jobs = [...walk(path.join(ROOT, 'Posts')), ...walk(path.join(ROOT, 'samples', 'Images'))]
		.map((file) => ({file: path.relative(ROOT, file), job: JSON.parse(readFileSync(file, 'utf8')) as {category?: string; template?: string}}));
	const imageJobs = jobs.filter(({job}) => typeof job.category === 'string' && 'content' in job && IMAGE_TEMPLATES.some((template) => template.category === job.category));
	// Camp jobs name their script; readVideoJob loads it (Renderers/VideoJobFile).
	const videoJobs = [...jobs, ...walk(path.join(ROOT, 'Curriculum', 'Jobs')).map((file) => ({file: path.relative(ROOT, file), job: readVideoJob(file) as {template?: string}}))].filter(({job}) => typeof job.template === 'string');

	/** The designs that make social posts and covers: each must check its own fit. */
	const SOCIAL = ['PromoDeck', 'PromoStory', 'VideoCover', 'CampCover', 'BoldQuestion', 'GrowthLine', 'AppTrio'];

	it('gives every social design a layout check', () => {
		for (const variant of SOCIAL) expect(IMAGE_TEMPLATES.find((template) => template.variant === variant)?.checkLayout, variant).toBeTypeOf('function');
	});

	it('lets the sample of every design through its own check', () => {
		for (const template of IMAGE_TEMPLATES) expect(() => resolveImageJob({category: template.category, variant: template.variant, content: template.sampleContent}), template.variant).not.toThrow();
	});

	it('lets every post image job in Posts/ and samples/ through (fixed sizes, nothing cut or run into a picture)', () => {
		expect(imageJobs.length).toBeGreaterThan(20);
		for (const {file, job} of imageJobs) expect(() => resolveImageJob(job), file).not.toThrow();
	}, 60_000);

	it('lets the cover of every video job through (reels, camp lessons, YouTube)', () => {
		let covers = 0;
		for (const {file, job} of videoJobs) {
			let resolved;
			try {
				resolved = resolveVideoJob(job);
			} catch {
				continue; // A job the video side refuses is that side's test.
			}
			covers += 1;
			expect(() => resolveImageJob(coverJobOf(resolved)), file).not.toThrow();
		}
		expect(covers).toBeGreaterThan(100);
	}, 120_000);

	it('refuses a carousel page title that does not fit at the smallest page size, and says what to shorten', () => {
		// One word wider than the column even at the smallest page size: it would be broken in the middle.
		const job = {category: 'Campaigns', variant: 'PromoDeck', content: {name: 'Deneme', look: 'rail', slides: [{kind: 'cover', title: 'Kapak'}, {kind: 'step', number: '1', title: 'Çalışmaprogramıhazırlamanınenkolayyolu'}, {kind: 'closing', title: 'Son'}]}};
		expect(() => resolveImageJob(job)).toThrow(/2\. sayfa: başlık .* puntoda .*Kısalt/);
	});

	it('refuses a story whose text would reach its picture', () => {
		const job = {category: 'Campaigns', variant: 'PromoStory', content: {name: 'Deneme', label: 'Bu akşam reels’te', hook: 'Bugün kaç soru çözdün ve kaçını yanlış yaptın, söyle bakalım?', sub: 'Yanlışlarını Bilgi Kartları’na ekle, unutmadan önce sana hatırlatsın, tekrar et.', visual: {kind: 'numeral', value: '3'}}};
		expect(() => resolveImageJob(job)).toThrow(/görsel .* başlıyor/);
	});

	it('keeps the pages of a carousel after its cover at one title size', () => {
		const titles = ['Kısa başlık.', 'Bu başlık biraz daha uzun ve iki satır tutuyor.', 'Orta uzunlukta bir başlık.'];
		const {size} = seriesSize(titles, POST_TYPE.page.titleSteps, 758, () => POST_TYPE.page.titleLines, {weight: POST_TYPE.page.titleWeight, letterSpacingEm: POST_TYPE.page.titleLetterSpacingEm});
		expect(POST_TYPE.page.titleSteps).toContain(size);
		for (const title of titles) expect(lineCount(title, 758, {size, weight: POST_TYPE.page.titleWeight, letterSpacingEm: POST_TYPE.page.titleLetterSpacingEm})).toBeLessThanOrEqual(POST_TYPE.page.titleLines);
	});

	it('never picks a type size from the length of the text (sizes come from POST_TYPE or are measured)', () => {
		// The old way: `size={title.length > 40 ? 60 : 72}`, so one carousel mixed 60 and 72 and a long title still overflowed.
		const files = readdirSync(path.join(ROOT, 'src', 'Images'), {recursive: true}).map(String).filter((file) => /\.tsx?$/.test(file));
		const offenders = files.filter((file) => /(size|fontSize)\b[^\n]{0,120}\.length\s*[<>]=?\s*\d/.test(readFileSync(path.join(ROOT, 'src', 'Images', file), 'utf8')));
		expect(offenders).toEqual([]);
	});
});
