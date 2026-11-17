/**
 * Renders the store pictures (src/Store/StoreSet.tsx, look "Turuncu") in
 * every size App Store and Google Play ask for (Store/StoreListing.ts
 * STORE_FORMATS), Turkish and English:
 *
 *   <out>/<tr|en>/<ios|android>/<folder>[-WxH]/<NN-name>.png        shots
 *   <out>/<tr|en>/ios/<ust-gorsel|arama-sonucu>-WxH/sinavika-<…>-<lang>[-metinsiz].png
 *   <out>/<tr|en>/android/ozellik-grafigi/sinavika-ozellik-grafigi-<lang>.png
 *
 *   npm run store -- --out <folder> [--lang tr|en] [--only <folder prefix, e.g. ios/ipad>] [--resume: skip pictures already there] [--look turuncu|krem|lacivert|seritli]
 *
 * Turuncu is the main set (magaza-gorselleri); the other looks go to alternatifler/<look>.
 *
 * Every phone and iPad picture is checked after rendering (Store/StoreShotCheck):
 * the device stands where StoreLayout puts it and is not cut by any edge. A
 * picture that fails is deleted and the run stops (fix the source, run again).
 */
import path from 'node:path';
import {existsSync, mkdirSync, rmSync} from 'node:fs';
import {parseArgs} from 'node:util';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import {bundleProject} from '../src/Renderers/VideoRenderer';
import {checkShot} from '../src/Store/StoreShotCheck';
import {FEATURE_GRAPHIC, STORE_CREATIVE, STORE_FORMATS, STORE_LANGUAGES, STORE_SLIDES, WATCH_SHOTS} from '../src/Store/StoreListing';
import {STORE_LOOKS, STORE_SET_ID, type StoreSetProps} from '../src/Store/StoreProps';

const {values} = parseArgs({options: {out: {type: 'string'}, lang: {type: 'string'}, only: {type: 'string'}, resume: {type: 'boolean', default: false}, look: {type: 'string', default: 'turuncu'}}});
if (!values.out) throw new Error('--out gerekli (ör. C:\\Users\\onurc\\Desktop\\sinavika-mobileheader\\magaza-gorselleri)');
const out = values.out;
const look = values.look as StoreSetProps['look'];
if (!STORE_LOOKS.includes(look)) throw new Error(`--look: ${STORE_LOOKS.join(', ')}`);
const langs = STORE_LANGUAGES.filter((lang) => !values.lang || lang === values.lang);

const jobs: {file: string; props: StoreSetProps}[] = [];
for (const lang of langs) {
	for (const format of STORE_FORMATS) {
		for (const [width, height] of format.sizes) {
			const folder = `${format.platform}/${format.folder}${format.sizes.length > 1 ? `-${width}x${height}` : ''}`;
			const base = {look, slide: 0, textless: false, lang, width, height, device: 'iphone'} as const;
			if (format.device === 'feature') {
				jobs.push({file: `${lang}/${folder}/${FEATURE_GRAPHIC.file}-${lang}.png`, props: {...base, kind: 'feature'}});
			} else if (format.device === 'header' || format.device === 'search') {
				for (const textless of [false, true]) {
					jobs.push({file: `${lang}/${folder}/sinavika-${STORE_CREATIVE[format.device].file}-${lang}${textless ? '-metinsiz' : ''}.png`, props: {...base, kind: format.device, textless}});
				}
			} else if (format.device === 'applewatch' || format.device === 'wearos') {
				// Watch screenshots are the app's own screens only: the same in every look, so they go with the main set.
				if (look !== 'turuncu') continue;
				for (const [name, screen] of WATCH_SHOTS[format.device]) jobs.push({file: `${lang}/${folder}/${name}.png`, props: {...base, kind: 'watch', screen}});
			} else {
				const device = format.device;
				STORE_SLIDES.forEach((slide, index) => jobs.push({file: `${lang}/${folder}/${slide.file}.png`, props: {...base, kind: 'shot', device, slide: index}}));
			}
		}
	}
}
const selected = (values.only ? jobs.filter((job) => job.file.split('/').slice(1).join('/').startsWith(values.only!)) : jobs).filter((job) => !values.resume || !existsSync(path.join(out, job.file)));

const serveUrl = await bundleProject();
const browser = await openBrowser('chrome');
for (const job of selected) {
	const composition = await selectComposition({serveUrl, id: STORE_SET_ID, inputProps: job.props, puppeteerInstance: browser});
	const output = path.join(out, job.file);
	mkdirSync(path.dirname(output), {recursive: true});
	await renderStill({composition, serveUrl, output, inputProps: job.props, imageFormat: 'png', puppeteerInstance: browser, chromiumOptions: {gl: 'angle'}});
	const problems = checkShot(output, job.props);
	if (problems.length > 0) {
		rmSync(output);
		await browser.close({silent: true});
		throw new Error(`${job.file}: ${problems.join('; ')}`);
	}
	console.log('✓', job.file);
}
await browser.close({silent: true});
console.log(`${selected.length} görsel → ${out}`);
