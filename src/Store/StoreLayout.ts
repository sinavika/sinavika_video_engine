/**
 * Where everything sits on a store picture: one fixed layout per picture kind,
 * so the phone stands in the same place, at the same size, on every shot of a
 * gallery and is never cut by the picture's edge (owner, 16 Nov 2026: the
 * phone used to run off the bottom and cut buttons, and moved sideways when a
 * slide had a floating card).
 *
 * Numbers are in stage units: the phone stage is 1206 × 2622 (iPhone 6.3"),
 * the iPad stage 2064 × 2752. A picture of another size scales the stage to
 * fit (`fitStage`) and centres it, so nothing on the stage can leave the
 * picture. StoreSet.tsx draws from these numbers and tests/Store/StoreLayout
 * checks them for every slide, language and store size; the render script
 * checks the rendered pixels against them.
 */
import {UI_CANVAS} from '../UIUX/Tokens';
import {textWidth} from '../Components/Typography/TextMeasure';

export type Box = {x: number; y: number; width: number; height: number};

/** Device frames, as fractions of the outer width (StoreSet.tsx Phone / Tablet). */
export const FRAME = {
	iphone: {bezel: 0.035, radius: 0.155, screenRadius: 0.125},
	android: {bezel: 0.028, radius: 0.11, screenRadius: 0.085},
	tablet: {bezel: 0.022, radius: 0.045, screenRadius: 0.025},
} as const;

/** Outer height of a phone `width` wide around a mobile drawing. */
export const phoneHeight = (width: number, android: boolean): number => {
	const bezel = width * FRAME[android ? 'android' : 'iphone'].bezel;
	return (width - bezel * 2) * (UI_CANVAS.mobile.height / UI_CANVAS.mobile.width) + bezel * 2;
};

/** Outer height of a landscape iPad `width` wide around a tablet drawing. */
const tabletHeight = (width: number): number => {
	const bezel = width * FRAME.tablet.bezel;
	return (width - bezel * 2) * (UI_CANVAS.tablet.height / UI_CANVAS.tablet.width) + bezel * 2;
};

/**
 * Manrope's vertical metrics in em, read from the font file
 * (@fontsource-variable/manrope, head/hhea/OS2, unitsPerEm 2000) on 18 Nov 2026:
 * ascent 2132, descent 600, deepest glyph yMin -510, cap height 1440.
 * `accent` is the allowance above cap height for Ü, Ö, İ, Ğ.
 */
export const MANROPE_METRICS = {ascent: 1.066, descent: 0.3, deepest: 0.255, capHeight: 0.72, accent: 0.17} as const;

/**
 * The headline and the box behind its key words (owner, 18 Nov 2026: the box
 * on "çalışacağını" cut into "Bugün ne" above it, no gap). The box hugs the
 * glyphs (top `top` em above the baseline, bottom `bottom` em below) instead of
 * the font's whole content area, and the lines stand far enough apart that the
 * box keeps `minGap` em from the letters above and below it.
 */
export const MARK = {lineHeight: 1.2, top: 0.86, bottom: 0.27, minGap: 0.035} as const;

/** Room in em between the box and the deepest letter of the line above, and between the box and the tallest letter of the line below. */
export const markGaps = (mark: {lineHeight: number; top: number; bottom: number} = MARK): {above: number; below: number} => ({
	above: mark.lineHeight - mark.top - MANROPE_METRICS.deepest,
	below: mark.lineHeight - mark.bottom - (MANROPE_METRICS.capHeight + MANROPE_METRICS.accent),
});

/** CSS for the box: an inline block whose inner line height puts the baseline `top` em under its top edge. */
export const markBoxStyle = (mark: {top: number; bottom: number} = MARK) => {
	const {ascent, descent} = MANROPE_METRICS;
	// In a line of height h the baseline sits h/2 + (ascent - descent)/2 below the top.
	const inner = 2 * (mark.top - (ascent - descent) / 2);
	return {display: 'inline-block', lineHeight: inner, paddingTop: 0, paddingBottom: `${mark.bottom - (inner - mark.top)}em`} as const;
};

/** How much a line holding the box grows (em): the box may reach below the line's own strut. */
export const markLineGrowth = (mark: {lineHeight: number; bottom: number} = MARK): number => {
	const {ascent, descent} = MANROPE_METRICS;
	const strutBottom = descent + (mark.lineHeight - ascent - descent) / 2;
	return Math.max(0, mark.bottom - strutBottom);
};

/** The headline and subline block. */
export type TextBlock = {x: number; y: number; width: number; size: number; subSize: number; subGap: number; subWidth: number; lineHeight: number; subLineHeight: number; maxLines: number; maxSubLines: number};

/** Least room between the end of the text and the top of the device, and between the device and the picture's bottom edge. */
export const GAP = {textToDevice: 50, bottom: 70} as const;

export const PHONE_STAGE = {
	width: 1206,
	height: 2622,
	text: {x: 96, y: 170, width: 1014, size: 124, subSize: 46, subGap: 34, subWidth: 940, lineHeight: MARK.lineHeight, subLineHeight: 1.3, maxLines: 2, maxSubLines: 2} satisfies TextBlock,
	/** The phone: one size and place for every shot, centred. */
	phoneWidth: 880,
	phoneTop: 690,
	/** The floating UI card: same left edge, width and baseline on every shot that has one. */
	float: {x: 36, width: 720, bottom: 2300},
} as const;

export const TABLET_STAGE = {
	width: 2064,
	height: 2752,
	text: {x: 130, y: 190, width: 1800, size: 176, subSize: 68, subGap: 44, subWidth: 1600, lineHeight: MARK.lineHeight, subLineHeight: 1.3, maxLines: 2, maxSubLines: 2} satisfies TextBlock,
	tabletWidth: 1880,
	tabletTop: 1060,
	/** A slide without a tablet drawing shows the phone, centred. */
	phoneWidth: 800,
	phoneTop: 980,
	float: {x: 60, width: 864, bottom: 2560},
} as const;

/** Stage scale and offset for a picture `w` × `h`: the whole stage fits and is centred. */
export const fitStage = (stage: {width: number; height: number}, w: number, h: number): {u: number; x0: number; y0: number} => {
	const u = Math.min(w / stage.width, h / stage.height);
	return {u, x0: (w - stage.width * u) / 2, y0: (h - stage.height * u) / 2};
};

/** The phone box on the phone stage, in stage units. */
export const phoneBox = (android: boolean): Box => {
	const {width, phoneWidth, phoneTop} = PHONE_STAGE;
	return {x: (width - phoneWidth) / 2, y: phoneTop, width: phoneWidth, height: phoneHeight(phoneWidth, android)};
};

/** The device box on the iPad stage, in stage units. */
export const tabletStageDevice = (hasTablet: boolean): Box => {
	const s = TABLET_STAGE;
	if (hasTablet) return {x: (s.width - s.tabletWidth) / 2, y: s.tabletTop, width: s.tabletWidth, height: tabletHeight(s.tabletWidth)};
	return {x: (s.width - s.phoneWidth) / 2, y: s.phoneTop, width: s.phoneWidth, height: phoneHeight(s.phoneWidth, false)};
};

/** A stage box in picture pixels. */
export const toPicture = (box: Box, fit: {u: number; x0: number; y0: number}): Box => ({x: fit.x0 + box.x * fit.u, y: fit.y0 + box.y * fit.u, width: box.width * fit.u, height: box.height * fit.u});

const HEADLINE = {weight: 800, letterSpacingEm: -0.03} as const;
/** The browser measure: the tables match Chrome to the pixel here (16 Nov 2026, "adım adım öğren" 994 px both). */
const FIT = 1;

/**
 * Lines a headline takes: the `*marked*` words never break (nowrap) and their
 * box adds 0.32 em; wrapped greedily like the browser (text-wrap: balance only
 * evens the lines, it never adds one).
 */
const headlineLines = (headline: string, box: number, size: number): number => {
	const match = /^(.*?)\*([^*]+)\*(.*)$/.exec(headline);
	const tokens: number[] = [];
	const plain = (text: string) =>
		text
			.split(/\s+/)
			.filter(Boolean)
			.forEach((word) => tokens.push(textWidth(word, {size, ...HEADLINE})));
	if (match) {
		plain(match[1]);
		tokens.push(textWidth(match[2], {size, ...HEADLINE}) + 0.32 * size);
		plain(match[3]);
	} else plain(headline);
	const space = textWidth(' ', {size, ...HEADLINE});
	const room = box * FIT;
	let lines = 1;
	let line = 0;
	for (const width of tokens) {
		if (width > room) return Infinity;
		if (line === 0) line = width;
		else if (line + space + width <= room) line += space + width;
		else {
			lines += 1;
			line = width;
		}
	}
	return lines;
};

/** Lines a subline takes. */
const sublineLines = (subline: string, box: number, size: number): number => {
	const room = box * FIT;
	let lines = 1;
	let line = '';
	for (const word of subline.split(/\s+/).filter(Boolean)) {
		const trial = line ? `${line} ${word}` : word;
		if (textWidth(trial, {size, weight: 700}) <= room) line = trial;
		else {
			lines += 1;
			line = word;
		}
	}
	return lines;
};

/** Where the text block ends (stage units), with the lines it takes. */
export const textBottom = (text: TextBlock, headline: string, subline: string): {bottom: number; lines: number; subLines: number} => {
	const lines = headlineLines(headline, text.width, text.size);
	const subLines = sublineLines(subline, text.subWidth, text.subSize);
	return {lines, subLines, bottom: text.y + lines * text.size * text.lineHeight + text.size * markLineGrowth() + text.subGap + subLines * text.subSize * text.subLineHeight};
};
