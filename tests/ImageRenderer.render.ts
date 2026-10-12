import {mkdtempSync, readFileSync, readdirSync, statSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {PNG} from 'pngjs';
import {beforeAll, describe, expect, it} from 'vitest';
import {IMAGE_TEMPLATES} from '../src/Images/ImageTemplateRegistry';
import {renderImage, renderImageToOutputs} from '../src/Images/Renderers/ImageRenderer';
import {IMAGE_SIZES, IMAGE_SIZE_NAMES} from '../src/Images/Schemas/ImageSizes';
import {VideoJobValidationError} from '../src/Renderers/VideoJob';
import {bundleProject} from '../src/Renderers/VideoRenderer';

/**
 * Real image renders through headless Chrome: every design in every size,
 * every output format, palettes, long Turkish text, carousels and the
 * numbered output folder.
 */
const outputDirectory = mkdtempSync(path.join(os.tmpdir(), 'sinavika-images-'));
const sampleJob = (variant: string, overrides: Record<string, unknown> = {}) => {
	const template = IMAGE_TEMPLATES.find((entry) => entry.variant === variant)!;
	return {category: template.category, variant, content: template.sampleContent, ...overrides};
};
const pixels = (file: string) => PNG.sync.read(readFileSync(file));
const differingShare = (a: PNG, b: PNG): number => {
	let different = 0;
	for (let offset = 0; offset < a.data.length; offset += 4) {
		if (Math.abs(a.data[offset] - b.data[offset]) + Math.abs(a.data[offset + 1] - b.data[offset + 1]) + Math.abs(a.data[offset + 2] - b.data[offset + 2]) > 24) different++;
	}
	return different / (a.data.length / 4);
};

beforeAll(async () => {
	await bundleProject();
});

describe.each(IMAGE_TEMPLATES.map((template) => [`${template.category}/${template.variant}`, template] as const))('%s', (_id, template) => {
	it.each(IMAGE_SIZE_NAMES)('renders in %s at the right size, with nothing overflowing', async (size) => {
		const result = await renderImage(
			{category: template.category, variant: template.variant, size, content: template.sampleContent},
			{outputPath: path.join(outputDirectory, `${template.category}-${template.variant}-${size}.png`)},
		);
		expect(result.warnings).toEqual([]);
		for (const file of result.files) {
			const image = pixels(file);
			expect([image.width, image.height]).toEqual([IMAGE_SIZES[size].width, IMAGE_SIZES[size].height]);
			expect(statSync(file).size, 'is not a blank canvas').toBeGreaterThan(20_000);
		}
	});
});

describe('output formats', () => {
	const signatures = {
		png: (file: Buffer) => file.subarray(1, 4).toString('latin1') === 'PNG',
		jpeg: (file: Buffer) => file[0] === 0xff && file[1] === 0xd8,
		webp: (file: Buffer) => file.subarray(0, 4).toString('latin1') === 'RIFF' && file.subarray(8, 12).toString('latin1') === 'WEBP',
	};

	it.each(['png', 'jpeg', 'webp'] as const)('writes a real %s file', async (format) => {
		const result = await renderImage(sampleJob('BoldQuestion', {format}), {outputPath: path.join(outputDirectory, `Format.${format}`)});
		const file = readFileSync(result.files[0]);
		expect(signatures[format](file)).toBe(true);
		expect(file.length).toBeGreaterThan(10_000);
	});

	it('renders custom dimensions', async () => {
		const result = await renderImage(sampleJob('Update', {size: {width: 1200, height: 628}}), {outputPath: path.join(outputDirectory, 'Custom.png')});
		const image = pixels(result.files[0]);
		expect([image.width, image.height]).toEqual([1200, 628]);
		expect(result.warnings).toEqual([]);
	});
});

describe('themes and palettes', () => {
	it('changes the look when a palette or another theme is applied, and only then', async () => {
		const render = async (name: string, overrides: Record<string, unknown>) =>
			pixels((await renderImage(sampleJob('ConceptCard', {size: 'Square', ...overrides}), {outputPath: path.join(outputDirectory, `${name}.png`)})).files[0]);

		const base = await render('Look-Base', {});
		const again = await render('Look-Again', {});
		const named = await render('Look-Named', {palette: 'MidnightGoldV1'});
		const inline = await render('Look-Inline', {palette: {primary: '#0057B8', accent: '#FFD700', background: '#FFFFFF', surface: '#F5F7FA', text: '#0B1F33'}});
		const themed = await render('Look-Theme', {theme: 'TechDark'});

		expect(differingShare(base, again)).toBeLessThan(0.0005);
		expect(differingShare(base, named)).toBeGreaterThan(0.3);
		expect(differingShare(base, inline)).toBeGreaterThan(0.05);
		expect(differingShare(base, themed)).toBeGreaterThan(0.3);
		expect(differingShare(named, inline)).toBeGreaterThan(0.3);
	});
});

describe('lesson colours', () => {
	const render = async (name: string, overrides: Record<string, unknown>) =>
		pixels((await renderImage(sampleJob('QuestionCard', {size: 'Portrait', ...overrides}), {outputPath: path.join(outputDirectory, `${name}.png`)})).files[0]);

	it('tints the accent by lesson on the brand themes and leaves the older themes alone', async () => {
		const maths = await render('Lesson-Maths', {theme: 'SinavikaLight'});
		const turkish = await render('Lesson-Turkish', {theme: 'SinavikaLight', lesson: 'Türkçe'});
		const unknown = await render('Lesson-Unknown', {theme: 'SinavikaLight', lesson: 'Rehberlik'});
		const oldMaths = await render('Lesson-Old-Maths', {theme: 'SinavikaBrand'});
		const oldTurkish = await render('Lesson-Old-Turkish', {theme: 'SinavikaBrand', lesson: 'Türkçe'});

		// A controlled difference: visible, but only in the accents.
		expect(differingShare(maths, turkish)).toBeGreaterThan(0.002);
		expect(differingShare(maths, turkish)).toBeLessThan(0.2);
		expect(differingShare(maths, unknown)).toBeGreaterThan(0.002);
		expect(differingShare(oldMaths, oldTurkish)).toBeLessThan(0.0005);
	});
});

describe('carousel without page indicators', () => {
	it('leaves the footer of every slide to the brand mark alone', async () => {
		const result = await renderImage(sampleJob('SlideDeck', {theme: 'SinavikaLight'}), {outputPath: path.join(outputDirectory, 'Clean.png')});
		const [cover, first, second] = result.files.map(pixels);
		// Content slides differ only in their content area: with no counter or progress strip, the bottom band is identical.
		const bottomBand = (page: PNG) => page.data.subarray(page.width * 4 * (page.height - 140)).toString('hex');
		expect(bottomBand(first)).toBe(bottomBand(second));
		expect(result.warnings).toEqual([]);
		expect(cover.height).toBe(1350);
	});
});

describe('long Turkish content', () => {
	it('fits a long question with long options instead of overflowing', async () => {
		const job = sampleJob('QuestionCard', {
			size: 'Square',
			content: {
				subject: 'Türkçe',
				source: 'Örnek deneme sınavı',
				question:
					'Çağdaş Türk şiirinde imge, şairin iç dünyasını dış gerçeklikle buluşturan en önemli araçlardan biridir. Aşağıdaki cümlelerin hangisinde, altı çizili sözcük grubu bu tanıma uygun biçimde, yani somut bir görüntüyle soyut bir duyguyu anlatacak şekilde kullanılmıştır? Öğrencinin ığdır, çığlık, gölge ve şüphe gibi sözcüklere dikkat etmesi beklenir.',
				options: [
					'Gökyüzü, üşüyen bir çocuğun yüzü gibi solgundu o sabah.',
					'Ağaçların gölgesi öğleden sonra iyice uzamıştı.',
					'İstanbul’un ışıkları uzaktan görünüyordu.',
					'Çığlık çığlığa koşan çocuklar bahçeyi doldurdu.',
					'Şüphesiz ki bu iş böyle sürmeyecekti.',
				],
			},
		});
		const result = await renderImage(job, {outputPath: path.join(outputDirectory, 'Long.png')});
		expect(result.warnings).toEqual([]);
	});

	it('refuses text that is too long for the design instead of drawing it badly', async () => {
		const job = sampleJob('BoldQuestion', {content: {hook: 'Çok uzun bir başlık '.repeat(20)}});
		await expect(renderImage(job, {outputPath: path.join(outputDirectory, 'Never.png')})).rejects.toBeInstanceOf(VideoJobValidationError);
	});
});

describe('carousel', () => {
	it('renders one image per slide, same size, each different, numbered in order', async () => {
		const result = await renderImage(sampleJob('SlideDeck'), {outputPath: path.join(outputDirectory, 'Deck.png')});
		expect(result.files.map((file) => path.basename(file))).toEqual(['Deck_1.png', 'Deck_2.png', 'Deck_3.png', 'Deck_4.png', 'Deck_5.png']);
		const pages = result.files.map(pixels);
		pages.forEach((page) => expect([page.width, page.height]).toEqual([1080, 1350]));
		for (let index = 1; index < pages.length; index++) expect(differingShare(pages[index - 1], pages[index])).toBeGreaterThan(0.02);
		// The content slides share one frame: outside the text area they are pixel-identical.
		const corner = (page: PNG) => page.data.subarray(0, page.width * 4 * 40).toString('hex');
		expect(corner(pages[1])).toBe(corner(pages[2]));
		expect(corner(pages[2])).toBe(corner(pages[3]));
	});
});

describe('numbered image outputs', () => {
	it('saves 01, 02, then a carousel under 03, and never overwrites', async () => {
		const rootDirectory = mkdtempSync(path.join(os.tmpdir(), 'sinavika-image-outputs-'));
		const first = await renderImageToOutputs(sampleJob('BoldQuestion'), {rootDirectory});
		const second = await renderImageToOutputs(sampleJob('BoldQuestion'), {rootDirectory});
		const deck = await renderImageToOutputs(sampleJob('SlideDeck', {format: 'webp'}), {rootDirectory});

		const saved = readdirSync(path.join(rootDirectory, 'Images')).filter((file) => /^\d+_/.test(file)).sort();
		expect(saved).toEqual([
			'01_Gunun_Sorusu_Hook.png',
			'02_Gunun_Sorusu_Hook.png',
			'03_Matematik_Uslu_Sayilarda_3_Kural_1.webp',
			'03_Matematik_Uslu_Sayilarda_3_Kural_2.webp',
			'03_Matematik_Uslu_Sayilarda_3_Kural_3.webp',
			'03_Matematik_Uslu_Sayilarda_3_Kural_4.webp',
			'03_Matematik_Uslu_Sayilarda_3_Kural_5.webp',
		]);
		expect([first.number, second.number, deck.number]).toEqual([1, 2, 3]);
		expect(first).toMatchObject({category: 'HookContent', variant: 'BoldQuestion', theme: 'SinavikaBrand', width: 1080, height: 1080, format: 'png'});
		expect(new Date(first.createdAt).getTime()).toBeGreaterThan(Date.now() - 600_000);
	});

	it('saves nothing for an invalid job', async () => {
		const rootDirectory = mkdtempSync(path.join(os.tmpdir(), 'sinavika-image-outputs-'));
		await expect(renderImageToOutputs({category: 'HookContent', content: {}}, {rootDirectory})).rejects.toBeInstanceOf(VideoJobValidationError);
		expect(readdirSync(rootDirectory)).toEqual([]);
	});
});
