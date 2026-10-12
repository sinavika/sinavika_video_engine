import {readFileSync, readdirSync} from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {VIDEO_FORMATS, resolveVideoLayout} from '../src/Configurations/VideoFormats';
import {VideoJobValidationError, resolveVideoJob} from '../src/Renderers/VideoJob';
import {withAlpha} from '../src/Themes/Theme';
import {THEMES} from '../src/Themes/ThemeRegistry';
import {TEMPLATES} from '../src/Templates/TemplateRegistry';

const SAMPLES = path.resolve(__dirname, '..', 'samples');
const sampleFiles = readdirSync(SAMPLES).filter((file) => file.endsWith('.json'));
const readSample = (file: string) => JSON.parse(readFileSync(path.join(SAMPLES, file), 'utf8'));

const issuesOf = (job: unknown): string[] => {
	try {
		resolveVideoJob(job);
		return [];
	} catch (error) {
		if (error instanceof VideoJobValidationError) return error.issues;
		throw error;
	}
};

describe('sample jobs', () => {
	it('has one JSON sample per template', () => {
		expect(sampleFiles.map((file) => readSample(file).template).sort()).toEqual(TEMPLATES.map((template) => template.id).sort());
	});

	it.each(sampleFiles)('%s resolves to a renderable composition', (file) => {
		const job = resolveVideoJob(readSample(file));
		expect(job.compositionId).toBe(`${job.template.id}-${job.formatId}`);
		expect(job.durationInFrames).toBeGreaterThan(job.fps * 10);
		expect(job.width % 2).toBe(0);
		expect(job.height % 2).toBe(0);
	});
});

describe('resolveVideoJob', () => {
	const base = readSample('QuestionSolution.json');

	it('applies defaults: vertical, 1080p, 30 fps, the template theme', () => {
		const job = resolveVideoJob({template: base.template, content: base.content});
		expect(job).toMatchObject({formatId: 'Vertical', quality: '1080p', fps: 30, width: 1080, height: 1920, scale: 1});
		expect(job.inputProps.theme).toBe('SinavikaBrand');
	});

	it('changes resolution through quality without changing the layout size', () => {
		const job = resolveVideoJob({...base, format: 'Horizontal', quality: '720p'});
		expect([job.width, job.height]).toEqual([1280, 720]);
		expect(job.scale).toBeCloseTo(2 / 3);
		expect(resolveVideoJob({...base, format: 'Square', quality: '2160p'})).toMatchObject({width: 2160, height: 2160});
	});

	it('keeps the length in seconds when fps changes', () => {
		const at30 = resolveVideoJob({...base, fps: 30});
		const at60 = resolveVideoJob({...base, fps: 60});
		expect(at60.durationInFrames / 60).toBeCloseTo(at30.durationInFrames / 30, 0);
	});

	it('names the template, theme, format and fps when they are wrong', () => {
		expect(issuesOf({...base, template: 'Karaoke'})[0]).toMatch(/unknown template "Karaoke"/);
		expect(issuesOf({...base, theme: 'Neon'})[0]).toMatch(/^theme:/);
		expect(issuesOf({...base, format: 'Cinema'})[0]).toMatch(/^format:/);
		expect(issuesOf({...base, fps: 29})[0]).toMatch(/fps must be one of/);
	});

	it('reports content problems with their JSON path', () => {
		const content = structuredClone(base.content);
		content.steps[1].formula = '\\frac{1}{';
		delete content.title;
		const issues = issuesOf({...base, content});
		expect(issues.some((issue) => issue.startsWith('content.title:'))).toBe(true);
		expect(issues.some((issue) => issue.startsWith('content.steps.1.formula:') && issue.includes('Invalid LaTeX'))).toBe(true);
	});

	it('rejects input that is not a job at all', () => {
		expect(issuesOf(null).length).toBeGreaterThan(0);
		expect(issuesOf('QuestionSolution').length).toBeGreaterThan(0);
		expect(issuesOf({content: {}}).length).toBeGreaterThan(0);
	});
});

describe('video formats', () => {
	it('defines 9:16, 16:9 and 1:1 with even dimensions', () => {
		expect(Object.values(VIDEO_FORMATS).map((format) => format.aspectRatio)).toEqual(['9:16', '16:9', '1:1']);
		Object.values(VIDEO_FORMATS).forEach((format) => {
			expect(format.width % 2).toBe(0);
			expect(format.height % 2).toBe(0);
		});
	});

	it('derives orientation, unit and safe area from the canvas size', () => {
		expect(resolveVideoLayout(1080, 1920)).toMatchObject({orientation: 'portrait', unit: 1});
		expect(resolveVideoLayout(1920, 1080)).toMatchObject({orientation: 'landscape', unit: 1});
		expect(resolveVideoLayout(1080, 1080)).toMatchObject({orientation: 'square', unit: 1});
		const half = resolveVideoLayout(540, 960);
		expect(half.unit).toBe(0.5);
		expect(half.safeArea.top).toBe(VIDEO_FORMATS.Vertical.safeArea.top / 2);
		expect(half.contentWidth).toBe(540 - half.safeArea.left - half.safeArea.right);
	});
});

const luminance = (hex: string): number => {
	const channels = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16) / 255);
	const [r, g, b] = channels.map((value) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: string, b: string): number => {
	const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (light + 0.05) / (dark + 0.05);
};

describe.each(Object.entries(THEMES))('theme %s', (_id, theme) => {
	const {colors} = theme;

	it('uses 6-digit hex colours so they can be tinted', () => {
		const flat = Object.values(colors).flatMap((value) =>
			Array.isArray(value) ? value.flatMap((pair) => [pair.fill, pair.on]) : [value],
		);
		flat.forEach((color) => expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/));
		expect(withAlpha(colors.primary, 0.5)).toMatch(/^rgba\(\d+, \d+, \d+, 0\.5\)$/);
	});

	it('keeps body text readable on its backdrop (WCAG AA)', () => {
		expect(contrast(colors.text, colors.background)).toBeGreaterThanOrEqual(4.5);
		expect(contrast(colors.onSurface, colors.surface)).toBeGreaterThanOrEqual(4.5);
		expect(contrast(colors.onSurface, colors.surfaceAlt)).toBeGreaterThanOrEqual(4.5);
		expect(contrast(colors.primaryText, colors.surface)).toBeGreaterThanOrEqual(4.5);
	});

	it('keeps large text readable on filled blocks', () => {
		expect(contrast(colors.onPrimary, colors.primary)).toBeGreaterThanOrEqual(3);
		expect(contrast(colors.onAccent, colors.accent)).toBeGreaterThanOrEqual(3);
		expect(contrast(colors.onStatus, colors.success)).toBeGreaterThanOrEqual(3);
		expect(contrast(colors.onStatus, colors.danger)).toBeGreaterThanOrEqual(3);
		colors.categorical.forEach((pair) => expect(contrast(pair.on, pair.fill)).toBeGreaterThanOrEqual(3));
	});
});
