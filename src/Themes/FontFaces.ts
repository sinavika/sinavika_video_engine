/**
 * Browser-only module: bundles the font files and KaTeX styles.
 * Import it only from code that runs inside the Remotion bundle (VideoFrame),
 * never from schemas, templates or Node scripts.
 */
import '@fontsource-variable/inter/index.css';
import '@fontsource-variable/plus-jakarta-sans/index.css';
import '@fontsource-variable/source-serif-4/index.css';
import '@fontsource-variable/space-grotesk/index.css';
import '@fontsource-variable/jetbrains-mono/index.css';
import '@fontsource-variable/nunito/index.css';
import '@fontsource-variable/caveat/index.css';
import 'katex/dist/katex.min.css';
import {FONT_FAMILIES} from './FontFamilies';

// Forces the latin and latin-ext subsets (Turkish) to download before the first frame.
const GLYPH_SAMPLE = 'ABCÇĞİÖŞÜ abcçğıöşü âîû 0123456789';

let pending: Promise<void> | null = null;

/**
 * Resolves once every text and math font is ready. Rendering must wait for
 * this, otherwise early frames are drawn with fallback fonts and text
 * measurements differ between frames.
 */
export const loadFontFaces = (): Promise<void> => {
	pending ??= (async () => {
		await Promise.all(
			Object.values(FONT_FAMILIES).map((family) =>
				document.fonts.load(`400 16px "${family}"`, GLYPH_SAMPLE),
			),
		);
		const mathFaces = Array.from(document.fonts).filter((face) =>
			face.family.replace(/["']/g, '').startsWith('KaTeX'),
		);
		await Promise.all(mathFaces.map((face) => face.load()));
		await document.fonts.ready;
	})();
	return pending;
};
