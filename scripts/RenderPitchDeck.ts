/**
 * Exports the investor deck (src/PitchDeck): every page as a PNG, all pages as
 * one PDF and the speaker notes as Markdown.
 *
 *   npm run pitch-deck                       (to Desktop\Sinavika-PitchDeck)
 *   npm run pitch-deck -- --only 11,12        (just these pages, PNG only)
 *   npm run pitch-deck -- --scale 1           (1920×1080 instead of 2x)
 *
 * <out>/sayfalar/NN.png, <out>/Sinavika-Yatirimci-Sunumu.pdf, <out>/Konusmaci-Notlari.md
 * The PDF is assembled with PyMuPDF (python -m fitz), one image per page.
 */
import {execFileSync} from 'node:child_process';
import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {parseArgs} from 'node:util';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import {bundleProject} from '../src/Renderers/VideoRenderer';
import {PITCH_DECK_ID, PITCH_DECK_NOTES, PITCH_DECK_PAGE_COUNT} from '../src/PitchDeck/PitchDeckDeck';

const {values} = parseArgs({
	options: {
		out: {type: 'string', default: path.join(process.env.USERPROFILE ?? '', 'Desktop', 'Sinavika-PitchDeck')},
		only: {type: 'string'},
		scale: {type: 'string', default: '2'},
	},
});

const root = path.resolve(values.out);
const scale = Number(values.scale);
const pages = values.only ? values.only.split(',').map(Number) : Array.from({length: PITCH_DECK_PAGE_COUNT}, (_, index) => index + 1);
const pageFile = (page: number) => path.join(root, 'sayfalar', `${String(page).padStart(2, '0')}.png`);

await mkdir(path.join(root, 'sayfalar'), {recursive: true});
const serveUrl = await bundleProject();
const browser = await openBrowser('chrome', {chromiumOptions: {gl: 'angle'}});
for (const slide of pages) {
	const inputProps = {slide};
	const composition = await selectComposition({serveUrl, id: PITCH_DECK_ID, inputProps, puppeteerInstance: browser});
	await renderStill({composition, serveUrl, output: pageFile(slide), inputProps, imageFormat: 'png', scale, puppeteerInstance: browser, chromiumOptions: {gl: 'angle'}});
	console.log(`✓ sayfa ${slide}`);
}
await browser.close({silent: true});

if (!values.only) {
	const pdf = path.join(root, 'Sinavika-Yatirimci-Sunumu.pdf');
	const script = ['import fitz, sys', 'doc = fitz.open()', 'for p in sys.argv[2:]:', '    page = doc.new_page(width=1920, height=1080)', '    page.insert_image(page.rect, filename=p)', 'doc.save(sys.argv[1], deflate=True)'].join('\n');
	execFileSync('python', ['-c', script, pdf, ...pages.map(pageFile)], {stdio: 'inherit'});
	console.log(`✓ ${path.relative(root, pdf)}`);

	const notes = ['# Sınavika yatırımcı sunumu · konuşmacı notları', '', 'Kaynak: `src/PitchDeck` (rakamlar `PitchDeckFacts.ts` ve `PitchDeckModel.ts`). Yeniden üretmek için `npm run pitch-deck`.', ''];
	PITCH_DECK_NOTES.forEach((note, index) => notes.push(`## ${index + 1}`, '', note, ''));
	await writeFile(path.join(root, 'Konusmaci-Notlari.md'), `${notes.join('\n')}\n`, 'utf8');
	console.log('✓ Konusmaci-Notlari.md');
}
