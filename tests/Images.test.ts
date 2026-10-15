import {readFileSync, readdirSync} from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {imageCompositionId} from '../src/Images/ImageTemplateDefinition';
import {IMAGE_CATEGORIES, IMAGE_TEMPLATES, findImageTemplate, imageVariantsOf} from '../src/Images/ImageTemplateRegistry';
import {resolveImageJob} from '../src/Images/Renderers/ImageJob';
import {IMAGE_SIZES, IMAGE_SIZE_NAMES} from '../src/Images/Schemas/ImageSizes';
import {VideoJobValidationError} from '../src/Renderers/VideoJob';
import {applyPalette, contrastRatio, mixColors, readableOn, type ColorPalette} from '../src/Themes/ColorPalette';
import {PALETTES, PALETTE_NAMES} from '../src/Themes/Palettes';
import {THEMES, THEME_IDS} from '../src/Themes/ThemeRegistry';
import {TEMPLATES} from '../src/Templates/TemplateRegistry';

const SAMPLES = path.resolve(__dirname, '..', 'samples', 'Images');
const sampleFiles = readdirSync(SAMPLES).filter((file) => file.endsWith('.json'));
const readSample = (file: string) => JSON.parse(readFileSync(path.join(SAMPLES, file), 'utf8'));
const issuesOf = (job: unknown): string[] => {
	try {
		resolveImageJob(job);
		return [];
	} catch (error) {
		if (error instanceof VideoJobValidationError) return error.issues;
		throw error;
	}
};

describe('image template registry', () => {
	it('covers the thirteen image categories', () => {
		expect([...IMAGE_CATEGORIES].sort()).toEqual(
			[
				'Announcements',
				'Campaigns',
				'Carousel',
				'ExamTips',
				'FeatureSpotlight',
				'HookContent',
				'Infographics',
				'MobilePromotion',
				'ProfileGrid',
				'QuestionSolution',
				'Thumbnails',
				'TopicExplanation',
				'WebPromotion',
			].sort(),
		);
		IMAGE_CATEGORIES.forEach((category) => expect(imageVariantsOf(category).length).toBeGreaterThanOrEqual(1));
	});

	it('gives every design a unique, Remotion-safe composition id', () => {
		const ids = IMAGE_TEMPLATES.map((template) => imageCompositionId(template.category, template.variant));
		expect(new Set(ids).size).toBe(ids.length);
		ids.forEach((id) => expect(id).toMatch(/^[a-zA-Z0-9-]+$/));
	});

	it('is independent of the video registry', () => {
		const videoIds = TEMPLATES.map((template) => template.id);
		expect(videoIds).toEqual(['QuestionSolution', 'TopicExplanation', 'QuickRevision', 'ConceptExplanation', 'ExamPreparation', 'AppPromotion', 'ExamJourney', 'SinoAIFilm', 'ProfilePicker', 'OrbReveal', 'Keynote', 'KineticType', 'NightDesk', 'FlatMorph', 'CountdownChat', 'BeforeAfter', 'CourseLesson', 'CourseShort']);
		// Same-named categories exist on both sides; composition ids must still not collide.
		IMAGE_TEMPLATES.forEach((template) => expect(imageCompositionId(template.category, template.variant).startsWith('Image-')).toBe(true));
	});

	it('falls back to the first design of a category when no variant is named', () => {
		expect(findImageTemplate('HookContent')?.variant).toBe('BoldQuestion');
		expect(findImageTemplate('HookContent', 'MythFact')?.variant).toBe('MythFact');
		expect(findImageTemplate('HookContent', 'Nope')).toBeUndefined();
		expect(findImageTemplate('Nope')).toBeUndefined();
	});
});

describe.each(IMAGE_TEMPLATES.map((template) => [`${template.category}/${template.variant}`, template] as const))('%s', (_id, template) => {
	it('ships sample content that passes its own schema', () => {
		expect(template.contentSchema.safeParse(template.sampleContent).success).toBe(true);
	});

	it('names its output after the content', () => {
		const content = template.contentSchema.parse(template.sampleContent);
		expect(template.outputName(content).trim().length).toBeGreaterThan(2);
	});

	it('rejects content with a required field missing', () => {
		const required = Object.keys(template.sampleContent).find((key) => !template.contentSchema.safeParse({...template.sampleContent, [key]: undefined}).success);
		expect(required, 'has at least one required field').toBeDefined();
	});

	it('resolves for every named size and every theme', () => {
		for (const size of IMAGE_SIZE_NAMES) {
			const job = resolveImageJob({category: template.category, variant: template.variant, size, content: template.sampleContent});
			expect([job.width, job.height]).toEqual([IMAGE_SIZES[size].width, IMAGE_SIZES[size].height]);
		}
		for (const theme of THEME_IDS) {
			expect(issuesOf({category: template.category, variant: template.variant, theme, content: template.sampleContent})).toEqual([]);
		}
	});
});

describe('image jobs', () => {
	const base = {category: 'HookContent', content: IMAGE_TEMPLATES.find((template) => template.variant === 'BoldQuestion')!.sampleContent};

	it('has one sample job file per design, all valid', () => {
		expect(sampleFiles).toHaveLength(IMAGE_TEMPLATES.length);
		sampleFiles.forEach((file) => expect(issuesOf(readSample(file)), file).toEqual([]));
	});

	it('applies defaults: first variant, the design’s size and theme, PNG', () => {
		const job = resolveImageJob(base);
		expect(job).toMatchObject({compositionId: 'Image-HookContent-BoldQuestion', width: 1080, height: 1080, format: 'png', pageCount: 1, paletteName: null});
		expect(job.inputProps.theme).toBe('SinavikaBrand');
	});

	it('accepts custom dimensions and every output format', () => {
		expect(resolveImageJob({...base, size: {width: 1200, height: 628}})).toMatchObject({width: 1200, height: 628});
		for (const format of ['png', 'jpeg', 'webp']) expect(resolveImageJob({...base, format}).format).toBe(format);
		expect(issuesOf({...base, format: 'gif'})[0]).toMatch(/^format:/);
		expect(issuesOf({...base, size: {width: 10, height: 10}}).length).toBeGreaterThan(0);
		expect(issuesOf({...base, size: 'Banner'}).length).toBeGreaterThan(0);
	});

	it('takes a palette by name or inline', () => {
		expect(resolveImageJob({...base, palette: 'MidnightGoldV1'})).toMatchObject({paletteName: 'MidnightGoldV1'});
		expect(resolveImageJob({...base, palette: 'MidnightGoldV1'}).inputProps.palette).toEqual(PALETTES.MidnightGoldV1);
		const inline = {primary: '#0057B8', accent: '#FFD700', background: '#FFFFFF', surface: '#F5F7FA', text: '#0B1F33'};
		expect(resolveImageJob({...base, palette: inline})).toMatchObject({paletteName: 'custom'});
		expect(issuesOf({...base, palette: 'NoSuchPalette'}).length).toBeGreaterThan(0);
		expect(issuesOf({...base, palette: {...inline, primary: 'blue'}}).some((issue) => issue.includes('6-digit hex'))).toBe(true);
	});

	it('names the category, variant and content field that is wrong', () => {
		expect(issuesOf({category: 'Billboards', content: {}})[0]).toMatch(/unknown image category "Billboards"/);
		expect(issuesOf({...base, variant: 'Neon'})[0]).toMatch(/unknown variant "Neon" for HookContent\. Available: BoldQuestion, MythFact/);
		expect(issuesOf({...base, content: {}}).some((issue) => issue.startsWith('content.hook:'))).toBe(true);
		expect(issuesOf({...base, theme: 'Neon'})[0]).toMatch(/^theme:/);
	});

	it('requires highlighted words to be part of the text they highlight', () => {
		const issues = issuesOf({...base, content: {...base.content, emphasis: 'başka kelime'}});
		expect(issues[0]).toMatch(/content\.emphasis: emphasis must be a part of the hook/);
	});

	it('takes the lesson from the job or the content subject', () => {
		const question = IMAGE_TEMPLATES.find((template) => template.variant === 'QuestionCard')!;
		expect(resolveImageJob({category: 'QuestionSolution', content: question.sampleContent}).inputProps.lesson).toBe('Matematik');
		expect(resolveImageJob({category: 'QuestionSolution', lesson: 'Fizik', content: question.sampleContent}).inputProps.lesson).toBe('Fizik');
		expect(resolveImageJob(base).inputProps.lesson).toBeUndefined();
	});

	it('counts the images of a carousel and names files from the content or the job', () => {
		const carousel = IMAGE_TEMPLATES.find((template) => template.category === 'Carousel')!;
		const job = resolveImageJob({category: 'Carousel', content: carousel.sampleContent});
		expect(job.pageCount).toBe(carousel.sampleContent.slides.length + 2);
		expect(job.outputName).toBe('Matematik Üslü sayılarda 3 kural');
		expect(resolveImageJob({category: 'Carousel', name: 'Özel İsim', content: carousel.sampleContent}).outputName).toBe('Özel İsim');
	});
});

describe('colour palettes', () => {
	const hostile: ColorPalette = {primary: '#FFE600', accent: '#FFFFFF', background: '#FFFFFF', surface: '#FFFFFF', text: '#777777'};

	it.each([...PALETTE_NAMES.map((name) => [name, PALETTES[name] as ColorPalette] as const), ['a hostile palette', hostile] as const])(
		'keeps %s readable once applied',
		(_name, palette) => {
			const {colors} = applyPalette(THEMES.SinavikaBrand, palette);
			// A palette may fix the text colour on its brand colour (white on Sınavika orange); it then has to reach large-text contrast.
			expect(contrastRatio(colors.onPrimary, colors.primary)).toBeGreaterThanOrEqual(palette.onPrimary ? 3 : 4.5);
			expect(contrastRatio(colors.onAccent, colors.accent)).toBeGreaterThanOrEqual(palette.onAccent ? 3 : 4.5);
			expect(contrastRatio(colors.onSurface, colors.surface)).toBeGreaterThanOrEqual(4.5);
			expect(contrastRatio(colors.primaryText, colors.surface)).toBeGreaterThanOrEqual(4.5);
			expect(contrastRatio(colors.canvasAccent, colors.background)).toBeGreaterThanOrEqual(3);
			colors.categorical.forEach((pair) => expect(contrastRatio(pair.on, pair.fill)).toBeGreaterThanOrEqual(4.5));
		},
	);

	it('takes colours from the palette and everything else from the base theme', () => {
		const themed = applyPalette(THEMES.AcademicLight, PALETTES.MidnightGoldV1);
		expect(themed.colors).toMatchObject({primary: '#F5B83D', background: '#0B1226', text: '#F2F5FF'});
		expect(themed.typography).toEqual(THEMES.AcademicLight.typography);
		expect(themed.shape).toEqual(THEMES.AcademicLight.shape);
		expect(themed.gradient).toEqual(PALETTES.MidnightGoldV1.gradient);
	});

	it('never changes an existing theme: video themes stay exactly as they were', () => {
		const before = JSON.stringify(THEMES);
		THEME_IDS.forEach((id) => PALETTE_NAMES.forEach((name) => applyPalette(THEMES[id], PALETTES[name])));
		expect(JSON.stringify(THEMES)).toBe(before);
		// Themes keep their own colours; a palette only exists where a job asks for it.
		expect(THEMES.SinavikaBrand.colors.primary).toBe('#5B3DF5');
	});

	it('uses a declared text colour only when it is readable enough', () => {
		const base = {primary: '#EA580C', accent: '#EA580C', background: '#FAFAFA', surface: '#FFFFFF', text: '#0B1C30'};
		expect(applyPalette(THEMES.SinavikaBrand, {...base, onPrimary: '#FFFFFF'}).colors.onPrimary).toBe('#FFFFFF');
		expect(applyPalette(THEMES.SinavikaBrand, base).colors.onPrimary).toBe('#111827');
		expect(applyPalette(THEMES.SinavikaBrand, {...base, primary: '#FDE68A', onPrimary: '#FFFFFF'}).colors.onPrimary).toBe('#111827');
	});

	it('has working colour helpers', () => {
		expect(readableOn('#000000')).toBe('#FFFFFF');
		expect(readableOn('#FFFFFF')).toBe('#111827');
		expect(mixColors('#000000', '#FFFFFF', 0.5)).toBe('#808080');
		expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 0);
	});
});
