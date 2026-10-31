import React from 'react';
import {easeFrom, smoothStep} from '../../../Animations/Motion';
import {withAlpha} from '../../../Themes/Theme';
import {useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {usePartLook, World} from '../VisualWorld';

type Euler = Extract<CourseVisual, {kind: 'euler'}>;
type Pair = Euler['pairs'][number];

/** The figure's stage: up to three panels in a row or four in a grid, or one set of nested circles with its conclusion. */
export const EULER_STAGE = {width: 1500, height: 760} as const;

/** A label's size so it fits across `room` units: at most `largest`, never under 24. */
const eulerLabelSize = (label: string, room: number, largest = 36) => Math.max(24, Math.min(largest, room / (Math.max(1, label.length) * 0.58)));

/**
 * Where a pair's circles end up, relative to the panel's centre, for circles of radius `r`: equal circles on top of
 * each other, apart ones with a gap, `a` inside a larger `b`, overlapping ones sharing a lens.
 */
export const pairLayout = (relation: Pair['relation'], r: number) => {
	switch (relation) {
		case 'equal':
			return {a: {x: 0, y: 0, r}, b: {x: 0, y: 0, r}};
		case 'apart':
			return {a: {x: -r * 1.15, y: 0, r}, b: {x: r * 1.15, y: 0, r}};
		case 'inside':
			return {a: {x: -r * 0.1, y: r * 0.28, r: r * 0.56}, b: {x: 0, y: 0, r: r * 1.2}};
		case 'overlap':
			return {a: {x: -r * 0.62, y: 0, r}, b: {x: r * 0.62, y: 0, r}};
	}
};

/**
 * Euler circles of classical logic. `pairs`: how two concepts' extensions relate, one panel each (eşitlik, ayrıklık,
 * tam girişimlik, eksik girişimlik); the circles start apart and slide into their relation as the panel comes in, so
 * the relation is seen being made. `nested`: a syllogism's terms as circles one inside the other, outermost first,
 * with an optional `point` (an individual) dropping into the innermost one and the `conclusion` written beside them.
 * Parts p1… (panels), or n1… (circles), nokta and sonuc.
 */
export const EulerVisual: React.FC<VisualBoxProps & {visual: Euler}> = ({visual, width, height, delaySeconds = 0}) => (
	<World width={width} height={height} viewWidth={EULER_STAGE.width} viewHeight={EULER_STAGE.height}>
		{visual.pairs.length > 0 ? <Pairs pairs={visual.pairs} delaySeconds={delaySeconds} /> : <Nested visual={visual} delaySeconds={delaySeconds} />}
	</World>
);

const Pairs: React.FC<{pairs: Pair[]; delaySeconds: number}> = ({pairs, delaySeconds}) => {
	const seconds = useSceneSeconds();
	const grid = pairs.length === 4;
	const columns = grid ? 2 : pairs.length;
	const cellWidth = EULER_STAGE.width / columns;
	const cellHeight = grid ? EULER_STAGE.height / 2 : EULER_STAGE.height;
	// Apart circles need 4.3 radii side by side; `inside` needs 2.4 radii of height, the caption and the gap to the next row about 84 units.
	const r = Math.min(cellWidth * 0.21, (cellHeight - 84) / 2.4, 175);
	const block = 2.4 * r + 52;
	return (
		<>
			{pairs.map((pair, index) => {
				const column = index % columns;
				const row = grid ? Math.floor(index / 2) : 0;
				const cx = (column + 0.5) * cellWidth;
				const cy = row * cellHeight + (cellHeight - block) / 2 + 1.2 * r;
				return <PairPanel key={index} id={`p${index + 1}`} pair={pair} cx={cx} cy={cy} r={r} spread={cellWidth * 0.3} captionY={cy + Math.max(...Object.values(pairLayout(pair.relation, r)).map((circle) => circle.y + circle.r)) + 44} entrance={easeFrom(seconds, delaySeconds + 0.2 + index * 0.35, 1.1)} />;
			})}
		</>
	);
};

const PairPanel: React.FC<{id: string; pair: Pair; cx: number; cy: number; r: number; spread: number; captionY: number; entrance: number}> = ({id, pair, cx, cy, r, spread, captionY, entrance}) => {
	const palette = useVisualPalette();
	const look = usePartLook(id, entrance);
	const lit = look.focused > 0.5;
	const t = smoothStep(Math.min(1, look.drawn));
	const end = pairLayout(pair.relation, r);
	// Each circle starts beside the panel's centre and slides to where the relation puts it.
	const a = {x: cx + (-spread * (1 - t) + end.a.x * t), y: cy + end.a.y * t, r: end.a.r};
	const b = {x: cx + (spread * (1 - t) + end.b.x * t), y: cy + end.b.y * t, r: end.b.r};
	const aColour = palette.lesson;
	const bColour = palette.lessonDeep;
	const labelA = labelSpot(pair.relation, a, b, 'a');
	const labelB = labelSpot(pair.relation, a, b, 'b');
	return (
		<g opacity={look.opacity}>
			<circle cx={b.x} cy={b.y} r={b.r} fill={withAlpha(bColour, lit ? 0.16 : 0.1)} stroke={bColour} strokeWidth={lit ? 6 : 4} strokeDasharray={pair.relation === 'equal' ? '14 10' : undefined} />
			<circle cx={a.x} cy={a.y} r={a.r} fill={withAlpha(aColour, lit ? 0.24 : 0.16)} stroke={aColour} strokeWidth={lit ? 6 : 4} />
			<Label x={labelA.x} y={labelA.y} text={pair.a} size={eulerLabelSize(pair.a, labelA.room)} fill={aColour} />
			<Label x={labelB.x} y={labelB.y} text={pair.b} size={eulerLabelSize(pair.b, labelB.room)} fill={bColour} />
			{pair.caption ? (
				<text x={cx} y={captionY} textAnchor="middle" fontSize={38} fontWeight={800} fill={lit ? palette.lesson : palette.ink} fontFamily={palette.fontBody} opacity={0.4 + 0.6 * t}>
					{pair.caption}
				</text>
			) : null}
		</g>
	);
};

type Circle = {x: number; y: number; r: number};

/** Where a circle's name goes: in its own part of the figure, so two names never sit on each other. */
const labelSpot = (relation: Pair['relation'], a: Circle, b: Circle, which: 'a' | 'b') => {
	const own = which === 'a' ? a : b;
	switch (relation) {
		case 'equal':
			return {x: own.x, y: own.y + (which === 'a' ? -28 : 32), room: own.r * 1.6};
		case 'inside':
			return which === 'a' ? {x: a.x, y: a.y, room: a.r * 1.7} : {x: b.x, y: b.y - b.r + 50, room: b.r * 1.1};
		case 'overlap':
			return {x: own.x + (which === 'a' ? -own.r * 0.42 : own.r * 0.42), y: own.y, room: own.r * 1.05};
		case 'apart':
			return {x: own.x, y: own.y, room: own.r * 1.7};
	}
};

const Label: React.FC<{x: number; y: number; text: string; size: number; fill: string; weight?: number}> = ({x, y, text, size, fill, weight = 800}) => {
	const palette = useVisualPalette();
	return (
		<text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={size} fontWeight={weight} fill={fill} fontFamily={palette.fontBody} stroke={palette.background} strokeWidth={size * 0.28} strokeLinejoin="round" paintOrder="stroke">
			{text}
		</text>
	);
};

/** Each nested circle's place: the top gap leaves room for its name and role, the bottom gap is narrow. */
export const nestedCircles = (count: number) => {
	const outer = {x: 560, y: 380, r: 335};
	return Array.from({length: count}, (_, index) => ({x: outer.x, y: outer.y + index * 42, r: outer.r - index * 92}));
};

const Nested: React.FC<{visual: Euler; delaySeconds: number}> = ({visual, delaySeconds}) => {
	const seconds = useSceneSeconds();
	const palette = useVisualPalette();
	const circles = nestedCircles(visual.nested.length);
	const inner = circles[circles.length - 1];
	const pointLook = usePartLook('nokta', easeFrom(seconds, delaySeconds + 0.4 + visual.nested.length * 0.5, 0.8));
	const conclusionLook = usePartLook('sonuc', easeFrom(seconds, delaySeconds + 1.4 + visual.nested.length * 0.5, 0.6));
	const fall = smoothStep(Math.min(1, pointLook.drawn));
	const point = {x: inner.x, y: inner.y + inner.r * 0.2 - (1 - fall) * 260};
	return (
		<>
			{visual.nested.map((term, index) => (
				<NestedCircle key={index} id={`n${index + 1}`} circle={circles[index]} label={term.label} note={term.note} colour={index === 0 ? palette.lessonDeep : palette.lesson} fill={0.06 + index * 0.06} entrance={easeFrom(seconds, delaySeconds + 0.2 + index * 0.5, 0.7)} glow={conclusionLook.drawn * (index === 0 ? 1 : 0)} />
			))}
			{visual.point ? (
				<g opacity={pointLook.opacity}>
					<circle cx={point.x} cy={point.y} r={16 + 4 * pointLook.focused + 6 * conclusionLook.drawn} fill={palette.lesson} stroke={palette.background} strokeWidth={5} />
					<Label x={point.x} y={point.y + 50} text={visual.point.label} size={40} fill={palette.ink} />
					{visual.point.note ? <Label x={point.x} y={point.y + 88} text={visual.point.note} size={28} fill={palette.muted} weight={700} /> : null}
				</g>
			) : null}
			{visual.conclusion ? <Conclusion text={visual.conclusion} look={conclusionLook} /> : null}
		</>
	);
};

const NestedCircle: React.FC<{id: string; circle: Circle; label: string; note?: string; colour: string; fill: number; entrance: number; glow: number}> = ({id, circle, label, note, colour, fill, entrance, glow}) => {
	const palette = useVisualPalette();
	const look = usePartLook(id, entrance);
	const lit = look.focused > 0.5 || glow > 0.5;
	const grow = 0.7 + 0.3 * smoothStep(Math.min(1, look.drawn));
	const top = circle.y - circle.r * grow;
	return (
		<g opacity={look.opacity}>
			<circle cx={circle.x} cy={circle.y} r={circle.r * grow} fill={withAlpha(colour, lit ? fill + 0.08 : fill)} stroke={colour} strokeWidth={lit ? 7 : 4} />
			<Label x={circle.x} y={top + 52} text={label} size={eulerLabelSize(label, circle.r * 1.2, 44)} fill={lit ? palette.lesson : palette.ink} />
			{note ? <Label x={circle.x} y={top + 92} text={note} size={28} fill={palette.muted} weight={700} /> : null}
		</g>
	);
};

const Conclusion: React.FC<{text: string; look: ReturnType<typeof usePartLook>}> = ({text, look}) => {
	const palette = useVisualPalette();
	const lines = splitConclusion(text);
	const x = 940;
	const height = 100 + lines.length * 54;
	const y = 380 - height / 2;
	return (
		<g opacity={look.opacity} transform={`translate(${(1 - smoothStep(Math.min(1, look.drawn))) * 40} 0)`}>
			<rect x={x} y={y} width={540} height={height} rx={26} fill={withAlpha(palette.lesson, 0.12)} stroke={palette.lesson} strokeWidth={look.focused > 0.5 ? 6 : 4} />
			<text x={x + 36} y={y + 54} fontSize={28} fontWeight={800} fill={palette.lesson} fontFamily={palette.fontBody} letterSpacing={2}>
				SONUÇ
			</text>
			{lines.map((line, index) => (
				<text key={index} x={x + 36} y={y + 112 + index * 54} fontSize={42} fontWeight={800} fill={palette.ink} fontFamily={palette.fontBody}>
					{line}
				</text>
			))}
		</g>
	);
};

/** The conclusion in lines of at most 20 characters, broken between words. */
export const splitConclusion = (text: string, perLine = 20): string[] => {
	const lines: string[] = [];
	for (const word of text.split(/\s+/)) {
		const last = lines[lines.length - 1];
		if (last !== undefined && (last + ' ' + word).length <= perLine) lines[lines.length - 1] = last + ' ' + word;
		else lines.push(word);
	}
	return lines;
};
