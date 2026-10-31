/**
 * Renders the App Store and Google Play pictures: every size of every slide,
 * in Turkish and English.
 *
 *   npm run store                                   (light look, tr + en, every size)
 *   npm run store -- --look koyu --only telefon     (an alternative look, phones only)
 *   npm run store -- --lang en --slides 0,1
 *   npm run store -- --source real --out <folder>    (emulator captures instead of drawn screens)
 *
 * Files: Outputs/MobileHeader/<lang>/<ios|android>/<format>/<NN>-<name>.png. The App Store
 * creative (ust-gorsel, arama-sonucu) is one picture per size, with and without copy.
 * Alternative looks go to Outputs/MobileHeader/_alternatifler/<look>/… so the
 * upload folders only ever hold the chosen look.
 */
import {copyFile, mkdir, stat} from 'node:fs/promises';
import path from 'node:path';
import {parseArgs} from 'node:util';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import {bundleProject} from '../src/Renderers/VideoRenderer';
import {STORE_CREATIVE, STORE_FORMATS, STORE_LANGUAGES, STORE_SLIDES, STORE_STYLES, type StoreLanguage, type StoreStyle} from '../src/Store/StoreListing';
import {STORE_COMPOSITION_ID, type StoreScreenshotProps} from '../src/Store/StoreProps';
import {STORE_SOURCES, type StoreSource} from '../src/Store/StoreRealScreens';

const {values} = parseArgs({
	options: {
		look: {type: 'string', default: 'acik'},
		source: {type: 'string', default: 'drawn'},
		lang: {type: 'string'},
		only: {type: 'string'},
		slides: {type: 'string'},
		out: {type: 'string', default: path.join('Outputs', 'MobileHeader')},
		icon: {type: 'string', default: path.join(process.env.USERPROFILE ?? '', 'Desktop', 'Sinavika-Logo', 'web', 'public', 'logos', 'icon-512.png')},
	},
});

const source = values.source as StoreSource;
if (!(STORE_SOURCES as readonly string[]).includes(source)) {
	console.error(`Bilinmeyen kaynak: ${values.source}. Seçenekler: ${STORE_SOURCES.join(', ')}.`);
	process.exit(2);
}
const looks = (values.look === 'all' ? STORE_STYLES : [values.look]) as StoreStyle[];
const langs = (values.lang ? values.lang.split(',') : STORE_LANGUAGES) as StoreLanguage[];
const slides = values.slides ? values.slides.split(',').map(Number) : STORE_SLIDES.map((_, index) => index);
if (looks.some((look) => !(STORE_STYLES as readonly string[]).includes(look))) {
	console.error(`Bilinmeyen görünüm: ${values.look}. Seçenekler: ${STORE_STYLES.join(', ')}, all.`);
	process.exit(2);
}

const MAX_BYTES = 8 * 1024 * 1024;
const serveUrl = await bundleProject();
const browser = await openBrowser('chrome', {chromiumOptions: {gl: 'angle'}});
let count = 0;
const oversize: string[] = [];

for (const look of looks) {
	const root = look === 'acik' ? values.out : path.join(values.out, '_alternatifler', look);
	for (const lang of langs) {
		for (const format of STORE_FORMATS) {
			if (values.only && !format.folder.includes(values.only)) continue;
			for (const [width, height] of format.sizes) {
				const folder = format.sizes.length > 1 ? `${format.folder}-${width}x${height}` : format.folder;
				const indices = format.single ? [0] : slides;
				const creative = format.device === 'header' || format.device === 'search' ? STORE_CREATIVE[format.device] : undefined;
				for (const slide of indices) {
					for (const textless of format.textless ? [false, true] : [false]) {
						const props: StoreScreenshotProps = {
							lang,
							look,
							source,
							platform: format.platform,
							device: format.device,
							textless,
							slide,
							width,
							height,
							tabletAspect: format.tablet?.aspect ?? 0.75,
							canvasWidth: format.tablet?.canvasWidth ?? 680,
						};
						const name = creative
							? `sinavika-${creative.file}-${lang}${textless ? '-metinsiz' : ''}`
							: format.single
								? `sinavika-ozellik-grafigi-${lang}`
								: `${String(slide + 1).padStart(2, '0')}-${STORE_SLIDES[slide].file[lang]}`;
						const output = path.resolve(root, lang, format.platform, folder, `${name}.png`);
						await mkdir(path.dirname(output), {recursive: true});
						const composition = await selectComposition({serveUrl, id: STORE_COMPOSITION_ID, inputProps: props, puppeteerInstance: browser});
						await renderStill({composition, serveUrl, output, inputProps: props, imageFormat: 'png', puppeteerInstance: browser, chromiumOptions: {gl: 'angle'}});
						const {size} = await stat(output);
						if (size > MAX_BYTES) oversize.push(output);
						count += 1;
						console.log(`✓ ${path.relative(process.cwd(), output)}  ${width}x${height}  ${(size / 1024 / 1024).toFixed(1)} MB`);
					}
				}
			}
		}
		// Google Play's app icon: the 512 icon of the logo delivery, copied as is.
		if (look === 'acik' && (!values.only || 'uygulama-simgesi'.includes(values.only))) {
			const icon = path.resolve(root, lang, 'android', 'uygulama-simgesi', 'sinavika-uygulama-simgesi-512.png');
			await mkdir(path.dirname(icon), {recursive: true});
			await copyFile(values.icon, icon).then(
				() => console.log(`✓ ${path.relative(process.cwd(), icon)}  512x512`),
				() => console.warn(`  Uygulama simgesi kopyalanamadı: ${values.icon}`),
			);
		}
	}
}

await browser.close({silent: true});
console.log(`${count} görsel.${oversize.length > 0 ? ` 8 MB'ı aşanlar: ${oversize.join(', ')}` : ' Hepsi 8 MB altında.'}`);
process.exit(0);
