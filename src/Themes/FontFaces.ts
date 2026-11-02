/**
 * Browser-only module: bundles the font files and KaTeX styles.
 * Import it only from code that runs inside the Remotion bundle (VideoFrame),
 * never from schemas, templates or Node scripts.
 */
import '@fontsource-variable/manrope/index.css';
import '@fontsource-variable/jetbrains-mono/index.css';
import 'katex/dist/katex.min.css';
import {FONT_FAMILIES} from './FontFamilies';
import {fontSourceUrl, withRetries} from './FontRetry';

// Forces the latin and latin-ext subsets (Turkish, German, Dutch, French, Polish…) to download before the first frame.
const GLYPH_SAMPLE = 'ABCÇĞİÖŞÜ abcçğıöşü âîû Äẞßéèêàñœąłřșő 0123456789';

/** How often a failed font file is fetched again, and the first wait between tries (doubling). */
const FONT_RETRIES = 4;
const FONT_RETRY_MS = 400;

let pending: Promise<void> | null = null;

const familyOf = (name: string) => name.replace(/["']/g, '').trim();

const settle = async (): Promise<void> => {
	await Promise.all(Object.values(FONT_FAMILIES).map((family) => document.fonts.load(`400 16px "${family}"`, GLYPH_SAMPLE)));
	const mathFaces = Array.from(document.fonts).filter((face) => familyOf(face.family).startsWith('KaTeX'));
	await Promise.all(mathFaces.map((face) => face.load()));
	await document.fonts.ready;
};

/** The @font-face rules of the bundled style sheets. */
const fontFaceRules = (): CSSFontFaceRule[] =>
	Array.from(document.styleSheets)
		.flatMap((sheet) => {
			try {
				return Array.from(sheet.cssRules);
			} catch {
				return [];
			}
		})
		.filter((rule): rule is CSSFontFaceRule => rule instanceof CSSFontFaceRule);

/**
 * A font file the page could not load (the render server reset the connection under load, 1 Nov 2026) leaves its face
 * in the error state for good. Every face of that family is fetched again here, with retries, and added as a new face
 * with the same descriptors; the failed one is then skipped when text is drawn.
 */
const replaceFailedFaces = async (): Promise<void> => {
	const failed = new Set(Array.from(document.fonts).filter((face) => face.status === 'error').map((face) => familyOf(face.family)));
	if (failed.size === 0) return;
	const faces = await Promise.all(
		fontFaceRules()
			.filter((rule) => failed.has(familyOf(rule.style.getPropertyValue('font-family'))))
			.map(async (rule) => {
				const url = fontSourceUrl(rule.style.getPropertyValue('src'));
				if (!url) return null;
				const data = await withRetries(() => fetch(new URL(url, rule.parentStyleSheet?.href ?? document.baseURI).href).then((response) => (response.ok ? response.arrayBuffer() : Promise.reject(new Error(`${url}: ${response.status}`)))), FONT_RETRIES, FONT_RETRY_MS);
				const descriptor = (name: string) => rule.style.getPropertyValue(name) || undefined;
				const face = new FontFace(familyOf(rule.style.getPropertyValue('font-family')), data, {weight: descriptor('font-weight'), style: descriptor('font-style'), stretch: descriptor('font-stretch'), unicodeRange: descriptor('unicode-range'), display: 'block'});
				document.fonts.add(face);
				return face.load();
			}),
	);
	if (faces.some((face) => face === null)) throw new Error(`A failed font face has no source to fetch again: ${[...failed].join(', ')}`);
	await document.fonts.ready;
};

/**
 * Resolves once every text and math font is ready. Rendering must wait for
 * this, otherwise early frames are drawn with fallback fonts and text
 * measurements differ between frames. A font file that fails to load is
 * fetched again (replaceFailedFaces) instead of failing the whole render.
 */
export const loadFontFaces = (): Promise<void> => {
	pending ??= settle().catch(async (error: unknown) => {
		console.warn(`Font yüklenemedi, yeniden deneniyor: ${error instanceof Error ? error.message : String(error)}`);
		await replaceFailedFaces();
	});
	return pending;
};
