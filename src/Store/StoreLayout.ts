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

/** The headline and subline block. */
export type TextBlock = {x: number; y: number; width: number; size: number; subSize: number; subGap: number; subWidth: number; lineHeight: number; subLineHeight: number; maxLines: number; maxSubLines: number};

/** Least room between the end of the text and the top of the device, and between the device and the picture's bottom edge. */
export const GAP = {textToDevice: 50, bottom: 70} as const;

export const PHONE_STAGE = {
	width: 1206,
	height: 2622,
	text: {x: 96, y: 170, width: 1014, size: 124, subSize: 46, subGap: 34, subWidth: 940, lineHeight: 1.12, subLineHeight: 1.3, maxLines: 2, maxSubLines: 2} satisfies TextBlock,
	/** The phone: one size and place for every shot, centred. */
	phoneWidth: 880,
	phoneTop: 690,
	/** The floating UI card: same left edge, width and baseline on every shot that has one. */
	float: {x: 36, width: 720, bottom: 2300},
} as const;

export const TABLET_STAGE = {
	width: 2064,
	height: 2752,
	text: {x: 130, y: 190, width: 1800, size: 176, subSize: 68, subGap: 44, subWidth: 1600, lineHeight: 1.12, subLineHeight: 1.3, maxLines: 2, maxSubLines: 2} satisfies TextBlock,
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
	return {lines, subLines, bottom: text.y + lines * text.size * text.lineHeight + text.subGap + subLines * text.subSize * text.subLineHeight};
};
