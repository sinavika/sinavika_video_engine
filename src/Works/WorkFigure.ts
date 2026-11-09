/**
 * The app's lesson figures (Works): every visual of a lesson drawn as a still, its last frame, for the app to show
 * instead of drawing it itself (API docs/works/Motor-Hazir-Resimleri.md). This module decides what is drawn and how:
 * which visuals of a script, the beats that bring a figure to its final state, the app's "Dersler" colours and the
 * box a figure is drawn in. The rendering is in Renderers/WorkFigureRenderer, the command in scripts/WorkFigures.
 */
import {mixColors} from '../Themes/ColorPalette';
import type {Theme} from '../Themes/Theme';
import {getTheme} from '../Themes/ThemeRegistry';
import {MODULES} from '../UIUX/ModuleIdentity';
import {naturalAspect, type CourseVisual, type VisualBeat} from '../Components/Visuals/VisualSchema';
import {worldRatio} from '../Components/Visuals/CourseVisual';
import {periodsStillHeight} from '../Components/Visuals/Humanities/PeriodChart';
import {treeRatio} from '../Components/Visuals/Structure/Tree';

export type WorkFigureMode = 'light' | 'dark';

/** A visual of a script to draw: where it sits (a JSON pointer, also the file name), its data and its card's beats. */
export type WorkFigureEntry = {pointer: string; name: string; visual: CourseVisual; beats?: readonly VisualBeat[]};

/** `flow` becomes an ordering activity in the app; its picture is not used (contract §1). */
const SKIPPED_KINDS = new Set(['flow']);

/** Figures with depth or a photograph: drawn as pictures (WebP); everything else becomes a vector drawing (SVG). */
export const isRasterFigure = (visual: CourseVisual): boolean =>
	visual.kind === 'solid' || visual.kind === 'molecule3d' || visual.kind === 'picture' || (visual.kind === 'earthquake' && visual.view === 'block3d');

type ScriptLike = {lesson?: {sections?: {cards?: Record<string, unknown>[]}[]}};

/**
 * The visuals of a script the app shows as figures, in reading order: each card's `visual` (with the card's beats),
 * each question's `figure`, and the visual of each solution step. Names are short and stable: s2c1-visual,
 * s3c4-figure, s3c4-step2.
 */
export const collectWorkFigures = (script: ScriptLike): WorkFigureEntry[] => {
	const entries: WorkFigureEntry[] = [];
	const add = (pointer: string, name: string, visual: unknown, beats?: unknown) => {
		if (!visual || typeof visual !== 'object' || SKIPPED_KINDS.has((visual as {kind?: string}).kind ?? '')) return;
		entries.push({pointer, name, visual: visual as CourseVisual, ...(Array.isArray(beats) && beats.length ? {beats: beats as VisualBeat[]} : {})});
	};
	(script.lesson?.sections ?? []).forEach((section, s) =>
		(section.cards ?? []).forEach((card, c) => {
			const base = `/lesson/sections/${s}/cards/${c}`;
			const tag = `s${s + 1}c${c + 1}`;
			// A worked example's steps move its figure the way beats do.
			add(`${base}/visual`, `${tag}-visual`, card.visual, Array.isArray(card.steps) && card.steps.length ? card.steps : card.beats);
			const question = card.question as {figure?: unknown; steps?: {visual?: unknown}[]} | undefined;
			if (question) {
				add(`${base}/question/figure`, `${tag}-figure`, question.figure);
				(question.steps ?? []).forEach((step, k) => add(`${base}/question/steps/${k}/visual`, `${tag}-step${k + 1}`, step.visual));
			}
		}),
	);
	return entries;
};

/**
 * The beats that leave a figure as the lesson leaves it: every part shown, every slide made, the last stage on, but
 * nothing pointed at, no zoom and no note (contract §2: the last frame without focus or dimming, the camera on the
 * whole figure).
 */
export const finalBeats = (beats: readonly VisualBeat[] | undefined): VisualBeat[] | undefined => {
	if (!beats?.length) return undefined;
	return beats.map((beat, index) => (index === beats.length - 1 ? {...beat, focus: [], zoom: null, note: undefined} : beat));
};

/**
 * The app's "Dersler" colours (contract §3): the module's blue instead of the lesson colour, ink and muted text of the
 * app, the deep blue instead of the brand orange for a second series, the figure card's colour behind halos and chips.
 */
const DERSLER = {
	light: {accent: MODULES.lessons.color.light, accentText: '#015C8B', ink: '#0B1C30', muted: '#6B7280', card: '#FAFAFA'},
	dark: {accent: MODULES.lessons.color.dark, accentText: '#88D7FB', ink: '#F4F4F5', muted: '#A1A1AA', card: '#0F1115'},
} as const;

export const workFigureColours = (mode: WorkFigureMode) => DERSLER[mode];

export const workFigureTheme = (mode: WorkFigureMode): Theme => {
	const base = getTheme(mode === 'light' ? 'SinavikaLight' : 'SinavikaDark');
	const {accent, accentText, ink, muted, card} = DERSLER[mode];
	const onAccent = mode === 'light' ? '#FFFFFF' : '#0B1C30';
	return {
		...base,
		name: `Dersler ${mode === 'light' ? 'açık' : 'koyu'}`,
		colors: {
			...base.colors,
			background: card,
			surface: card,
			surfaceAlt: mixColors(card, ink, 0.05),
			text: ink,
			textMuted: muted,
			onSurface: ink,
			onSurfaceMuted: muted,
			canvasAccent: accentText,
			border: mixColors(card, ink, 0.16),
			// The second series (a second curve, the brand's place): the module colour's deep tone. Towards the ink it was the
			// deep blue of the light theme but a paler blue of the dark one, and two curves looked alike (2 Nov 2026).
			primary: mode === 'light' ? mixColors(accent, ink, 0.45) : mixColors(accent, card, 0.5),
			primaryText: accentText,
			onPrimary: onAccent,
			accent,
			onAccent,
			lesson: {fill: accent, on: onAccent},
		},
	};
};

/**
 * The width figures are drawn at, in layout units (1080 short edge). The app shows a still about 360 pixels wide, where
 * text under 1/45 of the width (28 of 1280 pixels) cannot be read (contract §2): at 860 units, text of 20 units comes out
 * at 28 pixels. At 1000 the labels of plots and timelines came out at 20-27 (Soru revizyonu, 1 Nov 2026).
 */
const WORK_FIGURE_BOX_WIDTH = 860;

/** The pixel width of every still (contract §2), and how many still pixels a layout unit takes. */
export const WORK_FIGURE_STILL_WIDTH = 1280;

/** Room kept around what is drawn when a still is cut, in layout units. */
export const WORK_FIGURE_ROOM = 20;

/** The smallest text a still may carry, in still pixels: 1/45 of its width (contract §2). */
export const WORK_FIGURE_MIN_TEXT_PX = 28;

/**
 * The smallest text a figure draws as a still, in layout units: 28 still pixels when the still is cut to the box and
 * its room (900 units to 1280 pixels), rounded up. Figures were drawn for a 1920 x 1080 lesson, where a label of 13
 * units reads well; in the app's still the same label came out at 17-19 pixels in 700 figures (battles, processes,
 * maps, matching; 2 Nov 2026). A video keeps its sizes.
 */
export const WORK_FIGURE_TEXT_FLOOR = Math.ceil((WORK_FIGURE_MIN_TEXT_PX * (WORK_FIGURE_BOX_WIDTH + 2 * WORK_FIGURE_ROOM)) / WORK_FIGURE_STILL_WIDTH);

/**
 * Kinds whose figure needs a taller box than a 16:10 card gives. A timeline lays close dates in a second row of labels
 * above and below the line only when there is height for it; in a short box "Nasuh Paşa Antlaşması" (1612) and
 * "Kasr-ı Şirin Antlaşması" (1639), or 1362 and 1364, printed over each other (Soru revizyonu, 1 Nov 2026). Verses and
 * paragraphs are fitted to their box: three verses fitted into 16:10 printed their sources at 19 pixels (2 Nov 2026).
 * The still is cut to what is drawn, so the extra height costs nothing.
 */
const FIGURE_RATIOS: Partial<Record<CourseVisual['kind'], number>> = {timeline: 1, verses: 0.75, paragraph: 0.75};

/**
 * A matching board's shape in a still: a row of about 110 units a pair (two lines of the still's smallest text and
 * the chip's border) under its titles. In a 16:10 box six pairs of quotes came out at 22 pixels (2 Nov 2026).
 */
const matchingRatio = (pairs: number): number => WORK_FIGURE_BOX_WIDTH / (64 + pairs * 110);

/**
 * The shape a figure's still needs from its own content: a matching board's rows, a period chart's rows, a cycle of
 * five or more steps drawn round a circle (in a 16:10 box its two-row loop put three 206-unit steps 165 apart, each
 * over the next; 2 Nov 2026).
 */
const stillRatio = (visual: CourseVisual): number | undefined => {
	if (visual.kind === 'matching') return Math.min(1.6, matchingRatio(visual.pairs.length));
	if (visual.kind === 'periods') return WORK_FIGURE_BOX_WIDTH / Math.max(WORK_FIGURE_BOX_WIDTH / 1.6, periodsStillHeight(visual, WORK_FIGURE_BOX_WIDTH));
	if (visual.kind === 'cycle' && visual.nodes.length >= 5) return 1;
	return undefined;
};

/**
 * The box a figure is drawn in, in layout units: 860 wide, as tall as its natural shape asks (a geometry view, a
 * world map, a battle field), 16:10 when it has none (the still is cut to what is drawn afterwards), never taller than
 * wide by more than 1.6.
 */
export const workFigureBox = (visual: CourseVisual): {width: number; height: number} => {
	// A tree is laid out for the still's smallest text: its rows grow and its shape with them.
	const tree = visual.kind === 'tree' ? treeRatio(visual, undefined, WORK_FIGURE_TEXT_FLOOR / WORK_FIGURE_BOX_WIDTH) : undefined;
	const ratio = naturalAspect(visual) ?? tree ?? worldRatio(visual) ?? stillRatio(visual) ?? FIGURE_RATIOS[visual.kind] ?? 1.6;
	const height = Math.round(Math.min(WORK_FIGURE_BOX_WIDTH * 1.6, Math.max(WORK_FIGURE_BOX_WIDTH / 6, WORK_FIGURE_BOX_WIDTH / ratio)));
	return {width: WORK_FIGURE_BOX_WIDTH, height};
};
