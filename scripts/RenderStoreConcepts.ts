/**
 * Renders the new store concepts (src/Store/StoreConcept.tsx) for review:
 * every look × (first three iPhone shots, iOS 27 search, header, Play feature
 * graphic), in Turkish.
 *
 *   npx tsx scripts/RenderStoreConcepts.ts --out <folder>
 */
import path from 'node:path';
import {mkdirSync} from 'node:fs';
import {parseArgs} from 'node:util';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import {bundleProject} from '../src/Renderers/VideoRenderer';
import {STORE_CONCEPT_ID, type StoreConceptProps} from '../src/Store/StoreProps';

const {values} = parseArgs({options: {out: {type: 'string'}, lang: {type: 'string', default: 'tr'}}});
if (!values.out) throw new Error('--out gerekli');
const out = values.out;
const lang = values.lang === 'en' ? 'en' : 'tr';

const jobs: {file: string; props: Partial<StoreConceptProps>}[] = [];
for (const concept of ['defter', 'turuncu', 'lacivert'] as const) {
	for (const slide of [0, 1, 2]) jobs.push({file: `${concept}/iphone-${slide + 1}.png`, props: {concept, kind: 'shot', slide, width: 1206, height: 2622}});
	jobs.push({file: `${concept}/arama-sonucu-3840x2560.png`, props: {concept, kind: 'search', width: 3840, height: 2560}});
	jobs.push({file: `${concept}/ust-gorsel-3840x1646.png`, props: {concept, kind: 'header', width: 3840, height: 1646}});
	jobs.push({file: `${concept}/ozellik-grafigi-1024x500.png`, props: {concept, kind: 'feature', width: 1024, height: 500}});
}

const serveUrl = await bundleProject();
const browser = await openBrowser('chrome');
for (const job of jobs) {
	const props = {lang, ...job.props} as StoreConceptProps;
	const composition = await selectComposition({serveUrl, id: STORE_CONCEPT_ID, inputProps: props, puppeteerInstance: browser});
	const output = path.join(out, lang, job.file);
	mkdirSync(path.dirname(output), {recursive: true});
	await renderStill({composition, serveUrl, output, inputProps: props, imageFormat: 'png', puppeteerInstance: browser, chromiumOptions: {gl: 'angle'}});
	console.log('✓', path.relative(out, output));
}
await browser.close({silent: true});
