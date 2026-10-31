import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {withAlpha} from '../../../Themes/Theme';
import {useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {usePartLook, World} from '../VisualWorld';

type Hierarchy = Extract<CourseVisual, {kind: 'hierarchy'}>;

/** The figure's stage: brackets on the left, the pyramid or the iceberg, the levels' details on the right. */
export const HIERARCHY_STAGE = {width: 1500, height: 680} as const;

const TOP = 40;
const BOTTOM = 650;
const WATER = '#3E7FC0';
const ICE = '#F4FAFE';
const DETAIL_SIZE = 25;
const DETAIL_LEFT = 960;
const DETAIL_WIDTH = 510;
/** Seconds between two levels coming in when no beat shows them. */
const LEVEL_GAP = 0.45;

/**
 * A detail broken into lines that fit the detail column (about 40 characters at the detail size). Two lines are cut
 * where they come out most even, after a semicolon, colon or comma when one is near, never leaving one word alone.
 */
export const detailLines = (text: string, size = DETAIL_SIZE, width = DETAIL_WIDTH): string[] => {
	const perLine = Math.max(12, Math.floor(width / (size * 0.52)));
	if (text.length <= perLine) return [text];
	const words = text.split(/\s+/);
	let best: string[] | null = null;
	let bestScore = Infinity;
	for (let cut = 1; cut < words.length; cut++) {
		const first = words.slice(0, cut).join(' ');
		const second = words.slice(cut).join(' ');
		if (first.length > perLine || second.length > perLine) continue;
		const pause = /[;:,]$/.test(first) ? 8 : 0;
		const score = Math.abs(first.length - second.length) - pause;
		if (score < bestScore) {
			bestScore = score;
			best = [first, second];
		}
	}
	if (best) return best;
	const lines: string[] = [];
	for (const word of words) {
		const last = lines[lines.length - 1];
		if (last !== undefined && (last + ' ' + word).length <= perLine) lines[lines.length - 1] = `${last} ${word}`;
		else lines.push(word);
	}
	return lines;
};

/** A label's font size so it fits a band `width` wide: `max` (30 unless the band is tall) at most, 19 at least. */
export const labelSize = (label: string, width: number, max = 30) => Math.max(19, Math.min(max, (width - 40) / (label.length * 0.56)));

/** A few levels get taller bands and larger type than many (a four-level pyramid filled half the stage, 30 Oct 2026). */
const isFew = (n: number) => n <= 4;
const detailSize = (n: number) => (isFew(n) ? 30 : DETAIL_SIZE);

/**
 * Levels of a hierarchy. A pyramid stacks them as steps narrowing upward, the first level at the base (Maslow's
 * needs, social strata): each step drops into place when the narration reaches it. An iceberg floats in water, the
 * first `above` levels over the surface and the rest below it, deeper and deeper (Freud's levels of the mind): the
 * water moves, the iceberg bobs, and each level's slice lights up when pointed at. Details stand on the right, tied to
 * their level; groups bracket runs of levels on the left. Parts: l1… (levels, in list order) and g1… (groups).
 */
export const HierarchyVisual: React.FC<VisualBoxProps & {visual: Hierarchy}> = ({visual, width, height, delaySeconds = 0}) => {
	const seconds = useSceneSeconds();
	const n = visual.levels.length;
	const hasDetails = visual.levels.some((level) => level.detail);
	const left = visual.groups.length ? 130 : 40;
	const right = hasDetails ? 900 : HIERARCHY_STAGE.width - 40;
	const cx = (left + right) / 2;
	// Where each level sits: its vertical middle and the band's top and bottom.
	const bands = visual.shape === 'pyramid' ? pyramidBands(n) : icebergBands(n, visual.above);
	const entrance = (index: number) => easeFrom(seconds, delaySeconds + 0.3 + index * LEVEL_GAP, 0.5);
	const groupsStart = delaySeconds + 0.4 + n * LEVEL_GAP;
	// How far right of the centre a level's shape reaches: where its detail line starts.
	const edge = (index: number) => (visual.shape === 'pyramid' ? pyramidWidth(index, n, right - left, visual) / 2 : halfWidth(bands[index].middle, waterline(visual.above)) + 12);

	return (
		<World width={width} height={height} viewWidth={HIERARCHY_STAGE.width} viewHeight={HIERARCHY_STAGE.height}>
			{visual.shape === 'pyramid' ? (
				<Pyramid visual={visual} bands={bands} cx={cx} span={right - left} entrance={entrance} />
			) : (
				<Iceberg visual={visual} bands={bands} cx={cx} span={right - left} entrance={entrance} seconds={seconds} delaySeconds={delaySeconds} />
			)}
			{hasDetails
				? visual.levels.map((level, index) =>
						level.detail ? <Detail key={index} id={`l${index + 1}`} text={level.detail} size={detailSize(n)} y={bands[index].middle} from={cx + edge(index) + 14} entrance={entrance(index)} /> : null,
					)
				: null}
			{visual.groups.map((group, index) => {
				const top = Math.min(...bands.slice(group.from - 1, group.to).map((band) => band.top));
				const bottom = Math.max(...bands.slice(group.from - 1, group.to).map((band) => band.bottom));
				return <Bracket key={index} id={`g${index + 1}`} label={group.label} x={left - 24} top={top + 6} bottom={bottom - 6} entrance={easeFrom(seconds, groupsStart + index * 0.4, 0.6)} />;
			})}
		</World>
	);
};

type Band = {top: number; bottom: number; middle: number};

/** Pyramid steps: the base at the bottom, at most 110 tall (150 for four levels or fewer), centred in the stage. */
const pyramidBands = (n: number): Band[] => {
	const step = Math.min(isFew(n) ? 150 : 110, (BOTTOM - TOP) / n);
	const base = (TOP + BOTTOM + n * step) / 2;
	return Array.from({length: n}, (_, index) => ({top: base - (index + 1) * step + 6, bottom: base - index * step - 6, middle: base - (index + 0.5) * step}));
};

/** Iceberg slices: the first `above` share the tip over the water, the rest share the depth below it. */
const icebergBands = (n: number, above: number): Band[] => {
	const water = waterline(above);
	const upper = (water - TOP - 20) / above;
	const lower = (BOTTOM - water) / (n - above);
	return Array.from({length: n}, (_, index) =>
		index < above
			? {top: TOP + 20 + index * upper, bottom: TOP + 20 + (index + 1) * upper, middle: TOP + 20 + (index + 0.62) * upper}
			: {top: water + (index - above) * lower, bottom: water + (index - above + 1) * lower, middle: water + (index - above + 0.5) * lower},
	);
};

const waterline = (above: number) => TOP + Math.min(330, 70 + above * 120);

/** A pyramid step's width: the base fills the span, the top keeps room for its label. */
const pyramidWidth = (index: number, n: number, span: number, visual: Hierarchy) => {
	const base = Math.min(span, 860);
	const topLabel = visual.levels[n - 1].label;
	const top = Math.min(base * 0.62, Math.max(300, topLabel.length * (isFew(n) ? 36 : 30) * 0.56 + 60));
	return base - (index * (base - top)) / Math.max(1, n - 1);
};

const Pyramid: React.FC<{visual: Hierarchy; bands: Band[]; cx: number; span: number; entrance: (index: number) => number}> = ({visual, bands, cx, span, entrance}) => {
	const n = visual.levels.length;
	return (
		<g>
			{visual.levels.map((level, index) => (
				<Step key={index} index={index} count={n} label={level.label} band={bands[index]} cx={cx} w={pyramidWidth(index, n, span, visual)} entrance={entrance(index)} />
			))}
		</g>
	);
};

const Step: React.FC<{index: number; count: number; label: string; band: Band; cx: number; w: number; entrance: number}> = ({index, count, label, band, cx, w, entrance}) => {
	const palette = useVisualPalette();
	const look = usePartLook(`l${index + 1}`, entrance);
	const lit = look.focused;
	const strength = 0.18 + (index / Math.max(1, count - 1)) * 0.5;
	const ink = lit > 0.5 || strength > 0.6 ? palette.onLesson : palette.ink;
	const h = band.bottom - band.top;
	const size = labelSize(label, w, h >= 120 ? 36 : 30);
	// The step drops into place from above as it comes in.
	const drop = -(1 - look.drawn) * 70;
	return (
		<g opacity={look.opacity} transform={`translate(0 ${drop}) translate(${cx} ${band.middle}) scale(${1 + 0.04 * lit}) translate(${-cx} ${-band.middle})`}>
			<rect x={cx - w / 2} y={band.top} width={w} height={h} rx={14} fill={lit > 0.5 ? palette.lesson : withAlpha(palette.lesson, strength)} stroke={palette.lesson} strokeWidth={2} />
			<text x={cx} y={band.middle + size * 0.36} textAnchor="middle" fontSize={size} fontWeight={800} fill={ink} fontFamily={palette.fontBody}>
				{label}
			</text>
		</g>
	);
};

/** The iceberg's half width at height `y`: a narrow tip, widest some way under the water, narrowing to the bottom. */
const halfWidth = (y: number, water: number) => {
	if (y <= water) return 26 + 154 * Math.pow(Math.max(0, (y - TOP) / (water - TOP)), 0.8);
	const u = (y - water) / (BOTTOM - water);
	return u < 0.55 ? 180 + 190 * Math.sin((u / 0.55) * (Math.PI / 2)) : 370 - 150 * Math.pow((u - 0.55) / 0.45, 1.4);
};

const icebergPath = (cx: number, water: number) => {
	const rows = 26;
	const points = Array.from({length: rows + 1}, (_, k) => TOP + ((BOTTOM - TOP) * k) / rows);
	// A fixed, uneven edge: ice is never smooth.
	const jag = (k: number, side: number) => (k === 0 ? 0 : 12 * Math.sin(k * 2.7 + side * 1.9) + 6 * Math.sin(k * 5.3 + side));
	const rightSide = points.map((y, k) => `${(cx + halfWidth(y, water) + jag(k, 1)).toFixed(1)} ${y.toFixed(1)}`);
	const leftSide = points.map((y, k) => `${(cx - halfWidth(y, water) - jag(k, 2)).toFixed(1)} ${y.toFixed(1)}`).reverse();
	return `M${cx} ${TOP} L${rightSide.join(' L')} L${leftSide.join(' L')} Z`;
};

const Iceberg: React.FC<{visual: Hierarchy; bands: Band[]; cx: number; span: number; entrance: (index: number) => number; seconds: number; delaySeconds: number}> = ({
	visual,
	bands,
	cx,
	span,
	entrance,
	seconds,
	delaySeconds,
}) => {
	const clip = `iceberg-${React.useId().replace(/[^a-zA-Z0-9]/g, '')}`;
	const n = visual.levels.length;
	const water = waterline(visual.above);
	const shown = easeFrom(seconds, delaySeconds, 0.7);
	const bob = 5 * Math.sin(seconds * 0.9);
	const outline = icebergPath(cx, water);
	const reach = Math.min(span / 2 + 90, cx - 10, 560);
	const surface = (offset: number) => {
		const points = Array.from({length: 41}, (_, k) => {
			const x = cx - reach + (2 * reach * k) / 40;
			return `${x.toFixed(1)} ${(water + 5 * Math.sin(x / 55 + seconds * 1.7 + offset)).toFixed(1)}`;
		});
		return points;
	};
	return (
		<g opacity={shown}>
			<defs>
				<linearGradient id={`${clip}-sea`} x1="0" x2="1" y1="0" y2="0">
					<stop offset="0" stopColor={WATER} stopOpacity={0} />
					<stop offset="0.14" stopColor={WATER} stopOpacity={0.26} />
					<stop offset="0.86" stopColor={WATER} stopOpacity={0.26} />
					<stop offset="1" stopColor={WATER} stopOpacity={0} />
				</linearGradient>
				<linearGradient id={`${clip}-surface`} x1="0" x2="1" y1="0" y2="0">
					<stop offset="0" stopColor={WATER} stopOpacity={0} />
					<stop offset="0.12" stopColor={WATER} stopOpacity={1} />
					<stop offset="0.88" stopColor={WATER} stopOpacity={1} />
					<stop offset="1" stopColor={WATER} stopOpacity={0} />
				</linearGradient>
				<clipPath id={clip}>
					<path d={outline} transform={`translate(0 ${bob})`} />
				</clipPath>
			</defs>
			<g transform={`translate(0 ${bob})`}>
				<path d={outline} fill={ICE} stroke={withAlpha(WATER, 0.7)} strokeWidth={3} strokeLinejoin="round" />
			</g>
			{/* Each level's slice of ice, lit while its level is pointed at. */}
			<g clipPath={`url(#${clip})`}>
				{visual.levels.map((_, index) => (
					<Slice key={index} index={index} band={bands[index]} cx={cx} entrance={entrance(index)} bob={bob} last={index === n - 1} />
				))}
			</g>
			{/* The sea over the submerged ice, its surface moving. */}
			<path d={`M${surface(0).join(' L')} L${cx + reach} ${BOTTOM + 24} L${cx - reach} ${BOTTOM + 24} Z`} fill={`url(#${clip}-sea)`} />
			<path d={`M${surface(0).join(' L')}`} fill="none" stroke={`url(#${clip}-surface)`} strokeWidth={4} strokeLinecap="round" />
			<path d={`M${surface(1.6).join(' L')}`} fill="none" stroke={`url(#${clip}-surface)`} strokeOpacity={0.35} strokeWidth={2} transform="translate(0 16)" />
			{visual.levels.map((level, index) => (
				<SliceLabel key={index} index={index} label={level.label} y={bands[index].middle + bob} cx={cx} room={2 * Math.min(halfWidth(bands[index].middle, water), 330)} entrance={entrance(index)} />
			))}
		</g>
	);
};

const Slice: React.FC<{index: number; band: Band; cx: number; entrance: number; bob: number; last: boolean}> = ({index, band, cx, entrance, bob, last}) => {
	const palette = useVisualPalette();
	const look = usePartLook(`l${index + 1}`, entrance);
	return (
		<g opacity={look.opacity}>
			<rect x={cx - 420} y={band.top + bob} width={840} height={band.bottom - band.top} fill={withAlpha(palette.lesson, 0.12 + 0.5 * look.focused)} />
			{last ? null : <line x1={cx - 420} x2={cx + 420} y1={band.bottom + bob} y2={band.bottom + bob} stroke={withAlpha(palette.lesson, 0.6)} strokeWidth={3} strokeDasharray="12 10" />}
		</g>
	);
};

const SliceLabel: React.FC<{index: number; label: string; y: number; cx: number; room: number; entrance: number}> = ({index, label, y, cx, room, entrance}) => {
	const palette = useVisualPalette();
	const look = usePartLook(`l${index + 1}`, entrance);
	const size = labelSize(label, room);
	return (
		<text
			x={cx}
			y={y + size * 0.36}
			opacity={look.opacity}
			textAnchor="middle"
			fontSize={size * (1 + 0.05 * look.focused)}
			fontWeight={800}
			fill={look.focused > 0.5 ? palette.lessonDeep : palette.ink}
			fontFamily={palette.fontBody}
			stroke={ICE}
			strokeWidth={6}
			paintOrder="stroke"
		>
			{label}
		</text>
	);
};

/** A level's detail on the right, tied to its level by a dotted line; lesson-coloured while the level is pointed at. */
const Detail: React.FC<{id: string; text: string; size: number; y: number; from: number; entrance: number}> = ({id, text, size, y, from, entrance}) => {
	const palette = useVisualPalette();
	const look = usePartLook(id, entrance);
	const lines = detailLines(text, size);
	const lineHeight = size * 1.25;
	const first = y - ((lines.length - 1) * lineHeight) / 2 + size * 0.36;
	return (
		<g opacity={look.opacity}>
			<line x1={from} x2={from + (DETAIL_LEFT - 16 - from) * look.drawn} y1={y} y2={y} stroke={withAlpha(palette.lesson, 0.55)} strokeWidth={2.5} strokeDasharray="3 7" strokeLinecap="round" />
			<circle cx={from} cy={y} r={5} fill={palette.lesson} />
			{lines.map((line, index) => (
				<text
					key={index}
					x={DETAIL_LEFT}
					y={first + index * lineHeight}
					fontSize={size}
					fontWeight={look.focused > 0.5 ? 800 : 600}
					fill={look.focused > 0.5 ? palette.lessonDeep : palette.ink}
					fontFamily={palette.fontBody}
				>
					{line}
				</text>
			))}
		</g>
	);
};

/** A bracket on the left over a run of levels, its name written up along it. */
const Bracket: React.FC<{id: string; label: string; x: number; top: number; bottom: number; entrance: number}> = ({id, label, x, top, bottom, entrance}) => {
	const palette = useVisualPalette();
	const look = usePartLook(id, entrance);
	const colour = look.focused > 0.5 ? palette.lesson : withAlpha(palette.ink, 0.6);
	const middle = (top + bottom) / 2;
	const reach = (bottom - top) * look.drawn;
	return (
		<g opacity={look.opacity}>
			<path
				d={`M${x + 14} ${middle - reach / 2} L${x} ${middle - reach / 2} L${x} ${middle + reach / 2} L${x + 14} ${middle + reach / 2}`}
				fill="none"
				stroke={colour}
				strokeWidth={4}
				strokeLinejoin="round"
			/>
			<text
				x={x - 18}
				y={middle}
				transform={`rotate(-90 ${x - 18} ${middle})`}
				textAnchor="middle"
				fontSize={Math.max(22, Math.min(26, ((bottom - top) / Math.max(1, label.length)) * 1.7))}
				fontWeight={800}
				fill={colour}
				fontFamily={palette.fontBody}
			>
				{label}
			</text>
		</g>
	);
};
