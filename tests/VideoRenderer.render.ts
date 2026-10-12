import {execSync} from 'node:child_process';
import {existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {PNG} from 'pngjs';
import {beforeAll, describe, expect, it} from 'vitest';
import {VIDEO_FORMAT_IDS} from '../src/Configurations/VideoFormats';
import {VideoJobValidationError} from '../src/Renderers/VideoJob';
import {bundleProject, renderFrame, renderVideo, sceneFrames, type RenderProgress} from '../src/Renderers/VideoRenderer';
import {THEME_IDS} from '../src/Themes/ThemeRegistry';
import {TEMPLATES} from '../src/Templates/TemplateRegistry';

/**
 * Real renders through headless Chrome. These catch what unit tests cannot:
 * compositions that fail to load, fonts and formulas that fail to draw, and
 * text that does not fit (reported by FitBox as a render warning).
 */
const outputDirectory = mkdtempSync(path.join(os.tmpdir(), 'sinavika-render-'));
const sampleJob = (templateId: string, overrides: Record<string, unknown> = {}) => ({
	template: templateId,
	quality: '720p',
	content: TEMPLATES.find((template) => template.id === templateId)?.sampleContent,
	...overrides,
});

beforeAll(async () => {
	await bundleProject();
});

describe.each(TEMPLATES.map((template) => template.id))('%s', (templateId) => {
	it.each(VIDEO_FORMAT_IDS)('renders every scene in %s without layout warnings', async (format) => {
		const job = sampleJob(templateId, {format});
		for (const scene of sceneFrames(job)) {
			const settled = await renderFrame(job, {
				outputPath: path.join(outputDirectory, `${templateId}-${format}-${scene.sceneId}.png`),
				frame: scene.frame,
			});
			expect(statSync(settled.outputPath).size, `${scene.sceneId} is not blank`).toBeGreaterThan(8_000);
			expect(settled.warnings, `${scene.sceneId} warnings`).toEqual([]);

			// A render tab can start anywhere, so fitting must also hold while elements are mid-animation.
			const entering = await renderFrame(job, {
				outputPath: path.join(outputDirectory, `${templateId}-${format}-${scene.sceneId}-entering.png`),
				frame: scene.enteringFrame,
			});
			expect(entering.warnings, `${scene.sceneId} warnings while entering`).toEqual([]);
		}
	});
});

describe('themes', () => {
	it.each(THEME_IDS)('renders QuestionSolution with %s', async (theme) => {
		const job = sampleJob('QuestionSolution', {theme, format: 'Square'});
		const solution = sceneFrames(job).find((scene) => scene.sceneId === 'solution')!;
		const result = await renderFrame(job, {
			outputPath: path.join(outputDirectory, `Theme-${theme}.png`),
			frame: solution.frame,
		});
		expect(result.warnings).toEqual([]);
	});
});

/** Decoded pixels of a PNG file, as RGBA bytes. */
const readPixels = (file: string): Buffer => PNG.sync.read(readFileSync(file)).data;

/** Pixels whose colour differs by more than `tolerance` levels in any channel. */
const countDifferentPixels = (a: Buffer, b: Buffer, tolerance: number): number => {
	let different = 0;
	for (let offset = 0; offset < a.length; offset += 4) {
		for (let channel = 0; channel < 4; channel++) {
			if (Math.abs(a[offset + channel] - b[offset + channel]) > tolerance) {
				different++;
				break;
			}
		}
	}
	return different;
};

describe('determinism', () => {
	it.each(['ConceptExplanation', 'QuickRevision'])('renders the same %s frame to the same pixels every time', async (templateId) => {
		const job = sampleJob(templateId, {format: 'Horizontal'});
		// A frame with elements mid-animation, where timing differences would show.
		const frame = sceneFrames(job)[1].enteringFrame;
		const render = async (attempt: number) => {
			const outputPath = path.join(outputDirectory, `Determinism-${templateId}-${attempt}.png`);
			await renderFrame(job, {outputPath, frame});
			return readPixels(outputPath);
		};
		const [first, second, third] = [await render(1), await render(2), await render(3)];

		// Layout, text and animation state must match exactly. Chrome's rasteriser may still
		// round an antialiased edge pixel one level differently, so a 2-level tolerance is allowed.
		expect(first.length).toBe(second.length);
		expect(countDifferentPixels(first, second, 2)).toBe(0);
		expect(countDifferentPixels(first, third, 2)).toBe(0);
		// And even that rounding noise must stay negligible: at most 0.01% of the pixels.
		expect(countDifferentPixels(first, second, 0)).toBeLessThan(first.length / 4 / 10_000);
	});
});

describe('video output', () => {
	it('renders an MP4 and reports progress up to 100%', async () => {
		const progress: RenderProgress[] = [];
		const result = await renderVideo(sampleJob('QuickRevision', {format: 'Vertical'}), {
			outputPath: path.join(outputDirectory, 'QuickRevision.mp4'),
			onProgress: (update) => progress.push(update),
		});

		expect([result.width, result.height, result.fps]).toEqual([720, 1280, 30]);
		expect(result.durationSeconds).toBeGreaterThanOrEqual(15);
		expect(result.durationSeconds).toBeLessThanOrEqual(64);
		expect(result.warnings).toEqual([]);

		const file = readFileSync(result.outputPath);
		expect(file.length).toBeGreaterThan(200_000);
		expect(file.subarray(4, 8).toString('latin1')).toBe('ftyp');

		expect(progress.some((update) => update.stage === 'rendering')).toBe(true);
		expect(progress.at(-1)?.progress).toBe(1);
		const rendering = progress.filter((update) => update.stage !== 'bundling').map((update) => update.progress);
		expect(rendering).toEqual([...rendering].sort((a, b) => a - b));
	});

	it('narrates a video: audio is audible and the timeline follows the clips', async () => {
		// Offline stand-in for the speech provider: every line gets the same short clip.
		// A made-up voice name keeps these clips out of the cache of real voices.
		const clip = readFileSync(path.resolve(__dirname, 'Fixtures', 'Voice.mp3'));
		const cacheDirectory = path.resolve(__dirname, '..', 'public', 'Voiceovers');
		const cachedBefore = new Set(existsSync(cacheDirectory) ? readdirSync(cacheDirectory) : []);
		const job = sampleJob('QuickRevision', {format: 'Square', voiceover: {voice: 'Test-Fixture-Voice'}});

		try {
			const silent = await renderVideo(job, {
				outputPath: path.join(outputDirectory, 'Silent.mp4'),
				withoutVoiceover: true,
			});
			const narrated = await renderVideo(job, {
				outputPath: path.join(outputDirectory, 'Narrated.mp4'),
				speechSynthesizer: async () => clip,
			});

			expect(silent.voiceLineCount).toBe(0);
			expect(narrated.voiceLineCount).toBe(9);
			expect(narrated.durationSeconds).not.toBe(silent.durationSeconds);
			expect(narrated.warnings).toEqual([]);

			const peakOf = (video: string): number => {
				const wave = `${video}.wav`;
				execSync(`npx remotion ffmpeg -y -v error -i "${video}" -vn -ac 1 -ar 8000 -c:a pcm_s16le -f wav "${wave}"`);
				const samples = readFileSync(wave);
				let peak = 0;
				for (let offset = samples.indexOf('data') + 8; offset + 1 < samples.length; offset += 2) {
					peak = Math.max(peak, Math.abs(samples.readInt16LE(offset)));
				}
				return peak;
			};
			expect(peakOf(silent.outputPath)).toBeLessThan(50);
			expect(peakOf(narrated.outputPath)).toBeGreaterThan(3_000);
		} finally {
			for (const file of existsSync(cacheDirectory) ? readdirSync(cacheDirectory) : []) {
				if (!cachedBefore.has(file)) rmSync(path.join(cacheDirectory, file));
			}
		}
	});

	it('rejects an invalid job before rendering anything', async () => {
		const broken = sampleJob('QuestionSolution', {content: {title: 'Eksik içerik'}});
		const startedAt = Date.now();
		await expect(renderVideo(broken, {outputPath: path.join(outputDirectory, 'Never.mp4')})).rejects.toBeInstanceOf(
			VideoJobValidationError,
		);
		expect(Date.now() - startedAt).toBeLessThan(2_000);
	});
});
