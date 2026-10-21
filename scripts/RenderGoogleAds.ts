/**
 * Exports the Google Ads set (docs/GoogleAds/Icerik-Plani.md): pictures in the
 * three Google sizes with and without copy, HTML5 banners as ZIPs, the text
 * assets as CSV and the logo assets, sorted by language, exam and promotion.
 *
 *   npm run google-ads                                   (everything, to Desktop\Sinavika-GoogleAds)
 *   npm run google-ads -- --lang tr --exam yks --platform mobile --format kare --concept net-kaybi
 *   npm run google-ads -- --no-images | --no-html5 | --no-banners | --banners-only | --texts-only
 *
 * <out>/tr/<yks|kpss>/… and <out>/en/<sat|act>/…, each <mobil-uygulama|web-sitesi>/
 *   gorseller/<yatay-1200x628|kare-1200x1200|dikey-1200x1500>/NN-<concept>.png
 *   gorseller-metinsiz/<…>/NN-<concept>.png
 *   html5/<exam>-<platform>-<lang>-<320x480|480x320>.zip
 *   banner/<300x250|…|320x50>/NN-<concept>.jpg   (web-sitesi only)
 *   metinler.csv
 * <out>/ortak/logo/…, <out>/Metinler.md
 * <out>/arama/google-ads-editor-arama.csv, site-baglantilari.csv, ek-aciklamalar.csv, yapilandirilmis-snippet.csv, negatif-kelimeler.txt, Arama-Plani.md
 */
import {mkdir, readdir, readFile, rm, stat, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {parseArgs} from 'node:util';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import {zipSync} from 'fflate';
import {bundleProject} from '../src/Renderers/VideoRenderer';
import {buildBannerHtml} from '../src/Ads/Google/Html5Banner';
import {buildCalloutsCsv, buildEditorCsv, buildNegativeList, buildSearchMarkdown, buildSitelinksCsv, buildSnippetCsv} from '../src/Ads/Google/SearchExport';
import {AD_EXAMS, AD_FORMATS, EXAM_LANG, AD_LANGS, AD_PLATFORMS, AD_TEXT, conceptsFor, DISPLAY_MAX_BYTES, DISPLAY_SIZES, displayConceptsFor, HTML5_SIZES, PLATFORM_FOLDER, type AdExam, type AdFormat, type AdLang, type AdPlatform} from '../src/Ads/Google/GoogleAdsPlan';
import {GOOGLE_AD_BANNER_ID, type GoogleAdBannerProps, GOOGLE_AD_IMAGE_ID, GOOGLE_AD_LAYER_ID, GOOGLE_AD_LOGO_ID, type GoogleAdImageProps, type GoogleAdLayerProps, type GoogleAdLogoProps} from '../src/Ads/Google/GoogleAdsProps';

const {values} = parseArgs({
	options: {
		out: {type: 'string', default: path.join(process.env.USERPROFILE ?? '', 'Desktop', 'Sinavika-GoogleAds')},
		lang: {type: 'string'},
		exam: {type: 'string'},
		platform: {type: 'string'},
		format: {type: 'string'},
		concept: {type: 'string'},
		'no-images': {type: 'boolean', default: false},
		'no-html5': {type: 'boolean', default: false},
		'no-textless': {type: 'boolean', default: false},
		'texts-only': {type: 'boolean', default: false},
		'no-banners': {type: 'boolean', default: false},
		'banners-only': {type: 'boolean', default: false},
	},
});

const pick = <T extends string>(all: readonly T[], value?: string): T[] => (value ? (value.split(',') as T[]) : [...all]);
const langs = pick<AdLang>(AD_LANGS, values.lang);
const exams = pick<AdExam>(AD_EXAMS, values.exam);
const platforms = pick<AdPlatform>(AD_PLATFORMS, values.platform);
const formats = pick<AdFormat>(Object.keys(AD_FORMATS) as AdFormat[], values.format);
const MAX_BYTES = 5 * 1024 * 1024;
const root = path.resolve(values.out);
const groupDir = (lang: AdLang, exam: AdExam, platform: AdPlatform) => path.join(root, lang, exam, PLATFORM_FOLDER[platform]);
const csvCell = (text: string) => `"${text.replace(/"/g, '""')}"`;

// ---------------------------------------------------------------- text assets (no rendering needed)
const md: string[] = ['# Sınavika Google Ads metinleri', '', 'Türkiye (tr): YKS ve KPSS, Türkçe. ABD (en): SAT ve ACT, İngilizce.', '', 'Kaynak: `src/Ads/Google/GoogleAdsPlan.ts`. Sınırlar: başlık 30, uzun başlık 90, açıklama 90 karakter (ilk açıklama 60, kısa açıklama gereken yerler için).', ''];
for (const lang of langs) {
	for (const exam of exams.filter((entry) => EXAM_LANG[entry] === lang)) {
		for (const platform of platforms) {
			const set = AD_TEXT[exam][platform];
			const rows = [['Tür', 'Metin', 'Karakter'], ...set.headlines.map((text) => ['Başlık', text, String(text.length)]), ...set.longHeadlines.map((text) => ['Uzun başlık', text, String(text.length)]), ...set.descriptions.map((text) => ['Açıklama', text, String(text.length)])];
			const dir = groupDir(lang, exam, platform);
			await mkdir(dir, {recursive: true});
			await writeFile(path.join(dir, 'metinler.csv'), `﻿${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}\r\n`, 'utf8');
			md.push(`## ${lang.toUpperCase()} · ${exam.toUpperCase()} · ${PLATFORM_FOLDER[platform]}`, '', '| Tür | Metin | Karakter |', '|---|---|---|', ...rows.slice(1).map(([kind, text, count]) => `| ${kind} | ${text} | ${count} |`), '');
		}
	}
}
await writeFile(path.join(root, 'Metinler.md'), `${md.join('\n')}\n`, 'utf8');
console.log(`✓ metinler · ${langs.reduce((sum, lang) => sum + exams.filter((exam) => EXAM_LANG[exam] === lang).length, 0) * platforms.length} grup`);

// ---------------------------------------------------------------- search campaigns (Google Ads Editor import + assets)
if (!values.lang && !values.exam) {
	const searchDir = path.join(root, 'arama');
	await mkdir(searchDir, {recursive: true});
	await writeFile(path.join(searchDir, 'google-ads-editor-arama.csv'), buildEditorCsv(), 'utf8');
	await writeFile(path.join(searchDir, 'site-baglantilari.csv'), buildSitelinksCsv(), 'utf8');
	await writeFile(path.join(searchDir, 'ek-aciklamalar.csv'), buildCalloutsCsv(), 'utf8');
	await writeFile(path.join(searchDir, 'yapilandirilmis-snippet.csv'), buildSnippetCsv(), 'utf8');
	await writeFile(path.join(searchDir, 'negatif-kelimeler.txt'), buildNegativeList(), 'utf8');
	await writeFile(path.join(searchDir, 'Arama-Plani.md'), buildSearchMarkdown(), 'utf8');
	console.log('✓ arama · Editor CSV, öğeler, negatif kelimeler');
}
if (values['texts-only']) process.exit(0);

const serveUrl = await bundleProject();
const browser = await openBrowser('chrome', {chromiumOptions: {gl: 'angle'}});
const oversize: string[] = [];
let count = 0;

const still = async (id: string, inputProps: Record<string, unknown>, output: string, scale = 1) => {
	await mkdir(path.dirname(output), {recursive: true});
	const composition = await selectComposition({serveUrl, id, inputProps, puppeteerInstance: browser});
	await renderStill({composition, serveUrl, output, inputProps, imageFormat: 'png', scale, puppeteerInstance: browser, chromiumOptions: {gl: 'angle'}});
	const {size} = await stat(output);
	if (size > MAX_BYTES) oversize.push(output);
	count += 1;
	console.log(`✓ ${path.relative(root, output)}  ${Math.round(composition.width * scale)}x${Math.round(composition.height * scale)}  ${(size / 1024 / 1024).toFixed(2)} MB`);
	return output;
};

// ---------------------------------------------------------------- display banners (web site, JPEG ≤ 150 KB)
if (!values['no-banners'] && platforms.includes('web')) {
	for (const lang of langs)
		for (const exam of exams.filter((entry) => EXAM_LANG[entry] === lang))
			for (const [index, concept] of displayConceptsFor(exam).entries()) {
				if (values.concept && !values.concept.split(',').includes(concept.id)) continue;
				for (const size of DISPLAY_SIZES) {
					const props: GoogleAdBannerProps = {lang, exam, concept: concept.id, size};
					const output = path.join(groupDir(lang, exam, 'web'), 'banner', size, `${String(index + 1).padStart(2, '0')}-${concept.id}.jpg`);
					await mkdir(path.dirname(output), {recursive: true});
					const composition = await selectComposition({serveUrl, id: GOOGLE_AD_BANNER_ID, inputProps: props, puppeteerInstance: browser});
					let quality = 92;
					let bytes = Infinity;
					while (quality >= 50) {
						await renderStill({composition, serveUrl, output, inputProps: props, imageFormat: 'jpeg', jpegQuality: quality, puppeteerInstance: browser, chromiumOptions: {gl: 'angle'}});
						bytes = (await stat(output)).size;
						if (bytes <= DISPLAY_MAX_BYTES) break;
						quality -= 8;
					}
					if (bytes > DISPLAY_MAX_BYTES) oversize.push(output);
					count += 1;
					console.log(`✓ ${path.relative(root, output)}  q${quality}  ${(bytes / 1024).toFixed(0)} KB`);
				}
			}
}
if (values['banners-only']) {
	await browser.close({silent: true});
	console.log(`${count} dosya → ${root}`);
	process.exit(oversize.length ? 1 : 0);
}

// ---------------------------------------------------------------- logo assets
if (!values['no-images'] && !values.lang && !values.exam) {
	for (const kind of ['kare', 'yatay'] as const) {
		const props: GoogleAdLogoProps = {kind};
		await still(GOOGLE_AD_LOGO_ID, props, path.join(root, 'ortak', 'logo', kind === 'kare' ? 'logo-kare-1200x1200.png' : 'logo-yatay-1200x300.png'));
	}
}

// ---------------------------------------------------------------- pictures
if (!values['no-images']) {
	for (const lang of langs)
		for (const exam of exams.filter((entry) => EXAM_LANG[entry] === lang))
			for (const platform of platforms) {
				const concepts = conceptsFor(exam);
				for (const [index, concept] of concepts.entries()) {
					if (values.concept && !values.concept.split(',').includes(concept.id)) continue;
					for (const format of formats)
						for (const textless of values['no-textless'] ? [false] : [false, true]) {
							const props: GoogleAdImageProps = {lang, exam, concept: concept.id, platform, format, textless};
							const folder = textless ? 'gorseller-metinsiz' : 'gorseller';
							await still(GOOGLE_AD_IMAGE_ID, props, path.join(groupDir(lang, exam, platform), folder, AD_FORMATS[format].folder, `${String(index + 1).padStart(2, '0')}-${concept.id}.png`));
						}
				}
			}
}

// ---------------------------------------------------------------- HTML5 banners
if (!values['no-html5']) {
	const fontDir = path.resolve('node_modules', '@fontsource-variable', 'manrope', 'files');
	const fonts = await Promise.all(['manrope-latin-wght-normal.woff2', 'manrope-latin-ext-wght-normal.woff2'].map((file) => readFile(path.join(fontDir, file))));
	const wordmark = await readFile(path.resolve('public', 'Brand', 'SinavikaWordmark.svg'));
	const temp = path.join(root, '.katmanlar');
	for (const lang of langs)
		for (const exam of exams.filter((entry) => EXAM_LANG[entry] === lang))
			for (const platform of platforms) {
				const concept = conceptsFor(exam).find((entry) => entry.html5);
				if (!concept) continue;
				const layer = async (kind: GoogleAdLayerProps['layer']) => {
					const props: GoogleAdLayerProps = {lang, exam, concept: concept.id, platform, layer: kind};
					return readFile(await still(GOOGLE_AD_LAYER_ID, props, path.join(temp, `${lang}-${exam}-${platform}-${kind}.png`), 2));
				};
				const [device, proof] = [await layer('device'), await layer('proof')];
				for (const size of HTML5_SIZES) {
					const html = buildBannerHtml({concept, lang, platform, size, files: {device: 'cihaz.png', proof: 'kanit.png', wordmark: 'logo.svg', fonts: ['manrope-latin.woff2', 'manrope-latin-ext.woff2']}});
					const zip = zipSync({'index.html': new TextEncoder().encode(html), 'cihaz.png': device, 'kanit.png': proof, 'logo.svg': wordmark, 'manrope-latin.woff2': fonts[0], 'manrope-latin-ext.woff2': fonts[1]}, {level: 9});
					const output = path.join(groupDir(lang, exam, platform), 'html5', `${exam}-${PLATFORM_FOLDER[platform]}-${lang}-${size.name}.zip`);
					await mkdir(path.dirname(output), {recursive: true});
					await writeFile(output, zip);
					if (zip.byteLength > MAX_BYTES) oversize.push(output);
					count += 1;
					console.log(`✓ ${path.relative(root, output)}  ${(zip.byteLength / 1024).toFixed(0)} KB`);
				}
			}
	await rm(temp, {recursive: true, force: true});
}

await browser.close({silent: true});
await writePreview(root);
console.log(`${count} dosya → ${root}`);
if (oversize.length) {
	console.error(`5 MB sınırını aşanlar:\n${oversize.join('\n')}`);
	process.exit(1);
}
process.exit(0);

/** onizleme/index.html: every picture and banner of the set on one page, grouped by market, exam and promotion. */
async function writePreview(out: string): Promise<void> {
	const list = async (dir: string): Promise<string[]> => {
		const entries = await readdir(dir, {withFileTypes: true}).catch(() => []);
		const nested = await Promise.all(entries.map((entry) => (entry.isDirectory() ? list(path.join(dir, entry.name)) : Promise.resolve(/\.(png|jpg)$/.test(entry.name) ? [path.join(dir, entry.name)] : []))));
		return nested.flat();
	};
	const sections: string[] = [];
	for (const lang of AD_LANGS)
		for (const exam of AD_EXAMS.filter((entry) => EXAM_LANG[entry] === lang))
			for (const platform of AD_PLATFORMS) {
				const files = (await list(groupDir(lang, exam, platform))).sort();
				if (!files.length) continue;
				const tiles = files.map((file) => {
					const rel = path.relative(path.join(out, 'onizleme'), file).split(path.sep).join('/');
					return `<figure><img loading="lazy" src="${rel}"><figcaption>${path.relative(groupDir(lang, exam, platform), file).split(path.sep).join(' / ')}</figcaption></figure>`;
				});
				sections.push(`<h2>${lang.toUpperCase()} · ${exam.toUpperCase()} · ${PLATFORM_FOLDER[platform]}</h2><div class="grid">${tiles.join('')}</div>`);
			}
	const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>Sınavika Google Ads önizleme</title><style>body{font-family:Manrope,Arial,sans-serif;margin:24px;background:#F3F6FB;color:#0F172A}h2{margin:32px 0 12px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px}figure{margin:0;background:#fff;border-radius:12px;padding:8px}img{width:100%;height:auto;display:block;border-radius:6px}figcaption{font-size:11px;color:#64748B;margin-top:6px;word-break:break-all}</style></head><body><h1>Sınavika Google Ads önizleme</h1>${sections.join('')}</body></html>`;
	await mkdir(path.join(out, 'onizleme'), {recursive: true});
	await writeFile(path.join(out, 'onizleme', 'index.html'), html, 'utf8');
}
