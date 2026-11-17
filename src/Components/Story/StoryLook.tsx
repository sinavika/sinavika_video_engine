import React, {createContext, useContext} from 'react';
import {z} from 'zod';
import {contrastRatio, relativeLuminance} from '../../Themes/ColorPalette';

/**
 * The look of one story reel (Sosyal Medya, 17 Nov 2026): every sinavika.tr video takes its art direction from a
 * prompt-motion.com prompt, and no two videos in a row look the same (owner: the constant navy ground was boring).
 * A look is the ground (flat or two-colour gradient, plain or paper grain, with or without a lamp glow), a palette of
 * at most three colours besides black and white, the ink of the type on the ground, the accent, the cards' tones,
 * the chip and the closing card's ground. Every kit part reads it from `StoryLookProvider`; a template never draws
 * its own ground. `lookIssues` refuses a look whose type or cards would not read.
 */

export type StoryTone = 'light' | 'dark';

/** Text ink on the ground itself (not on paper): dark on a light ground, white on a dark one. */
export const STORY_INK: Record<StoryTone, string> = {light: '#0B1C30', dark: '#FFFFFF'};

/** The colours of paper and pens. Pen marks (right green, wrong red, the answers in blue) mean the same in every look. */
export const STORY_COLORS = {
	paper: '#FFFDF7',
	paperLine: '#C9D7EC',
	paperMargin: '#F2A5A5',
	ink: '#0B1C30',
	pencil: '#475569',
	redPen: '#DC2626',
	greenPen: '#16A34A',
	bluePen: '#1D4ED8',
	highlighter: '#FDE047',
	sticky: '#FDE68A',
	stickyPink: '#FBCFE8',
	stickyBlue: '#BAE6FD',
	orange: '#F97316',
} as const;

const hex = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Renk #RRGGBB biçiminde olmalı.');

const StoryLookSchema = z.object({
	ground: z.object({
		/** One colour (flat) or two (top to bottom). */
		colors: z.union([z.tuple([hex]), z.tuple([hex, hex])]),
		/** `paper`: the paper grain over the whole ground. */
		texture: z.enum(['none', 'paper']).default('none'),
		/** A lamp glow that breathes in the lower right, in this colour; null for none. */
		light: hex.nullable().default(null),
	}),
	/** The look's colours besides black, white and greys; every other colour of the look is one of these or its tint. */
	palette: z.array(hex).min(1).max(3),
	/** Type on the ground: key phrases, numbers, the logo. */
	ink: hex,
	/** Key words and numbers on the ground. */
	accent: hex,
	/** The accent on the cards' paper (bars). */
	cardAccent: hex,
	paper: hex,
	sticky: hex,
	chip: z.object({background: hex, ink: hex}),
	/** The closing card's ground (logo and store badges); the ground's first colour when not set. */
	card: hex.optional(),
	/** Key phrases and numbers drawn this much bigger (a bold-colour look sets big kinetic type). */
	typeScale: z.number().min(0.8).max(1.4).default(1),
});

export type StoryLook = z.output<typeof StoryLookSchema>;

const look = (value: z.input<typeof StoryLookSchema>): StoryLook => StoryLookSchema.parse(value);

/**
 * The ready looks, one per prompt-motion direction. Navy is the reels' first look and is used only when a job asks
 * for it; the default is warm grey.
 */
export const STORY_LOOKS = {
	/** "Shape morphing through UI states": a light warm grey, black-and-white parts, one accent. */
	warmGrey: look({ground: {colors: ['#E8E4DE']}, palette: ['#C2410C'], ink: '#111111', accent: '#C2410C', cardAccent: '#C2410C', paper: '#FFFFFF', sticky: '#FFFFFF', chip: {background: '#111111', ink: '#FFFFFF'}}),
	/** Cream paper with its grain, brown ink, a red pen accent. */
	paper: look({ground: {colors: ['#F4EBD9', '#EADCC2'], texture: 'paper'}, palette: ['#EADCC2', '#B91C1C'], ink: '#2B2118', accent: '#B91C1C', cardAccent: '#B91C1C', paper: '#FFFDF7', sticky: '#FDE68A', chip: {background: '#B91C1C', ink: '#FFFFFF'}}),
	/** A flat vivid ground and big kinetic type. */
	boldColour: look({ground: {colors: ['#C2410C']}, palette: ['#C2410C', '#FDE047'], ink: '#FFFFFF', accent: '#FDE047', cardAccent: '#C2410C', paper: '#FFFFFF', sticky: '#FEF08A', chip: {background: '#FDE047', ink: '#111111'}, typeScale: 1.2}),
	/** Dark but not navy: charcoal with a warm lamp. */
	ink: look({ground: {colors: ['#1A1A1A', '#262626'], light: '#FDBA74'}, palette: ['#F97316'], ink: '#FFFFFF', accent: '#F97316', cardAccent: '#EA580C', paper: '#FFFDF7', sticky: '#FED7AA', chip: {background: '#F97316', ink: '#111111'}}),
	/** The evening room the reels began with. */
	navy: look({ground: {colors: ['#0E1A30', '#172A4A'], light: '#FDE68A'}, palette: ['#0E1A30', '#F97316', '#FDE68A'], ink: '#FFFFFF', accent: '#F97316', cardAccent: '#EA580C', paper: '#FFFDF7', sticky: '#FDE68A', chip: {background: '#C2410C', ink: '#FFFFFF'}}),
} satisfies Record<string, StoryLook>;

export type StoryLookName = keyof typeof STORY_LOOKS;
const LOOK_NAMES = Object.keys(STORY_LOOKS) as [StoryLookName, ...StoryLookName[]];
export const DEFAULT_STORY_LOOK: StoryLookName = 'warmGrey';

/** The ground's tone: light or dark, by its first colour. */
export const storyTone = (value: StoryLook): StoryTone => (relativeLuminance(value.ground.colors[0]) > 0.3 ? 'light' : 'dark');

/** The closing card's ground. */
export const cardGround = (value: StoryLook): string => value.card ?? value.ground.colors[0];

const hsl = (color: string) => {
	const [r, g, b] = [1, 3, 5].map((index) => parseInt(color.slice(index, index + 2), 16) / 255);
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const lightness = (max + min) / 2;
	const delta = max - min;
	let hue = 0;
	if (delta > 0) hue = max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
	return {hue: (hue * 60 + 360) % 360, lightness};
};

/** How much colour there is: the spread of the channels, 0 for a grey. */
const chroma = (color: string) => {
	const channels = [1, 3, 5].map((index) => parseInt(color.slice(index, index + 2), 16) / 255);
	return Math.max(...channels) - Math.min(...channels);
};

/** Black, white or a grey, warm or cool (a warm grey ground, a near-white paper): free in every look. */
const neutral = (color: string) => chroma(color) < 0.06 || hsl(color).lightness > 0.97;

/** Colours within this many degrees of hue are one palette colour (its tints and shades). */
const HUE_FAMILY = 15;

const inPalette = (color: string, palette: readonly string[]) =>
	neutral(color) ||
	palette.some((entry) => {
		const distance = Math.abs(hsl(color).hue - hsl(entry).hue);
		return Math.min(distance, 360 - distance) <= HUE_FAMILY;
	});

/** Type on the ground and on cards: normal text (WCAG AA). */
const TEXT_CONTRAST = 4.5;
/** Key words, bars and large type: large text and graphics (WCAG AA). */
const LARGE_CONTRAST = 3;

/**
 * Why a look would not read, in Turkish; empty when it is fine. Checks the palette (at most three colours besides
 * black, white and greys, every colour of the look from it), the ink and the accent on every ground colour, the
 * cards' text on paper and sticky notes, the bars' accent on paper, the chip and the logo on the closing card.
 */
export const lookIssues = (value: StoryLook): string[] => {
	const issues: string[] = [];
	const ratio = (a: string, b: string) => contrastRatio(a, b);
	const need = (what: string, a: string, b: string, minimum: number) => {
		const measured = ratio(a, b);
		if (measured < minimum) issues.push(`${what}: kontrast ${measured.toFixed(2)}, en az ${minimum}.`);
	};
	const used = {
		'zemin': value.ground.colors,
		'ışık': value.ground.light ? [value.ground.light] : [],
		'vurgu': [value.accent],
		'kart vurgusu': [value.cardAccent],
		'kâğıt': [value.paper],
		'yapışkan not': [value.sticky],
		'etiket': [value.chip.background],
		'kapanış kartı': [cardGround(value)],
	};
	for (const [name, colors] of Object.entries(used)) for (const color of colors) if (!inPalette(color, value.palette)) issues.push(`${name} rengi ${color} paletin dışında (${value.palette.join(', ')}).`);
	for (const ground of value.ground.colors) {
		need(`Zemindeki yazı (${ground})`, value.ink, ground, TEXT_CONTRAST);
		need(`Zemindeki vurgu (${ground})`, value.accent, ground, LARGE_CONTRAST);
	}
	need('Kâğıttaki yazı', STORY_COLORS.ink, value.paper, TEXT_CONTRAST);
	need('Yapışkan nottaki yazı', STORY_COLORS.ink, value.sticky, TEXT_CONTRAST);
	need('Kâğıttaki çubuk vurgusu', value.cardAccent, value.paper, LARGE_CONTRAST);
	need('Etiket yazısı', value.chip.ink, value.chip.background, TEXT_CONTRAST);
	need('Kapanış kartındaki logo', value.ink, cardGround(value), TEXT_CONTRAST);
	return issues;
};

/**
 * A job's `look`: a ready look by name, or one with some fields changed (`{preset, ...}`). Defaults to warm grey,
 * never navy. Refused when it would not read (`lookIssues`).
 */
export const StoryLookFieldSchema = z
	.union([z.enum(LOOK_NAMES), StoryLookSchema.partial().extend({preset: z.enum(LOOK_NAMES)})])
	.default(DEFAULT_STORY_LOOK)
	.transform((value): StoryLook & {preset: StoryLookName} => {
		if (typeof value === 'string') return {...STORY_LOOKS[value], preset: value};
		const {preset, ...changes} = value;
		const defined = Object.fromEntries(Object.entries(changes).filter(([, field]) => field !== undefined));
		return {...STORY_LOOKS[preset], ...defined, preset};
	})
	.superRefine((value, context) => lookIssues(value).forEach((message) => context.addIssue({code: z.ZodIssueCode.custom, message})));

/** Which ready look a raw job file asks for (its preset), the default when it names none. */
export const lookNameOf = (job: unknown): StoryLookName => {
	const value = (job as {content?: {look?: unknown}} | undefined)?.content?.look;
	if (typeof value === 'string' && value in STORY_LOOKS) return value as StoryLookName;
	if (value && typeof value === 'object' && 'preset' in value && typeof value.preset === 'string' && value.preset in STORY_LOOKS) return value.preset as StoryLookName;
	return DEFAULT_STORY_LOOK;
};

/**
 * Two videos in a row of a series with the same look (owner, 17 Nov 2026: "art arda iki video aynı görünmemeli").
 * `series` in publishing order (the file names' numbers); one warning per repeat.
 */
export const repeatedLooks = (series: readonly {name: string; look: StoryLookName}[]): string[] =>
	series.slice(1).flatMap((entry, index) => (entry.look === series[index].look ? [`${series[index].name} ve ${entry.name} aynı görünümde (${entry.look}); art arda iki video aynı görünmemeli.`] : []));

const StoryLookContext = createContext<StoryLook>(STORY_LOOKS[DEFAULT_STORY_LOOK]);

export const StoryLookProvider: React.FC<{look: StoryLook; children?: React.ReactNode}> = ({look: value, children}) => <StoryLookContext.Provider value={value}>{children}</StoryLookContext.Provider>;

export const useStoryLook = (): StoryLook => useContext(StoryLookContext);
