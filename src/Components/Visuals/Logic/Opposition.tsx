import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {withAlpha} from '../../../Themes/Theme';
import {useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {usePartLook, World} from '../VisualWorld';

type Opposition = Extract<CourseVisual, {kind: 'opposition'}>;

/** The figure's stage: the square in the middle, each corner's proposition outside it. */
export const OPPOSITION_STAGE = {width: 1500, height: 760} as const;

const LEFT = 470;
const RIGHT = 1030;
const TOP = 170;
const BOTTOM = 590;
const CORNER = 46;

type Corner = 'a' | 'e' | 'i' | 'o';
const CORNERS: Record<Corner, {x: number; y: number; letter: string; name: string; side: 'left' | 'right'; up: boolean}> = {
	a: {x: LEFT, y: TOP, letter: 'A', name: 'Tümel olumlu', side: 'left', up: true},
	e: {x: RIGHT, y: TOP, letter: 'E', name: 'Tümel olumsuz', side: 'right', up: true},
	i: {x: LEFT, y: BOTTOM, letter: 'I', name: 'Tikel olumlu', side: 'left', up: false},
	o: {x: RIGHT, y: BOTTOM, letter: 'O', name: 'Tikel olumsuz', side: 'right', up: false},
};

/** The relations between corners, as the square of opposition draws them. */
export const OPPOSITION_RELATIONS = [
	{id: 'karsitlik', label: 'Karşıtlık', lines: [['a', 'e']]},
	{id: 'altkarsitlik', label: 'Alt karşıtlık', lines: [['i', 'o']]},
	{
		id: 'altiklik',
		label: 'Altıklık',
		lines: [
			['a', 'i'],
			['e', 'o'],
		],
	},
	{
		id: 'celisiklik',
		label: 'Çelişiklik',
		lines: [
			['a', 'o'],
			['e', 'i'],
		],
	},
] as const;

const TRUTH_TEXT = {D: 'Doğru', Y: 'Yanlış', '?': 'Belirsiz'} as const;

/**
 * The square of opposition (karşıtlık karesi) of classical logic: the four propositions A, E, I, O with the same
 * subject and predicate at its corners, and the relations between them drawn as its sides and diagonals: contrariety
 * (karşıtlık) on top, subcontrariety (alt karşıtlık) below, subalternation (altıklık) down each side, contradiction
 * (çelişiklik) across. Corners come in first, then each relation draws its lines when the narration reaches it.
 * `truth` writes a truth value on corners (D, Y, or ? when it cannot be known), shown with part `deger`, to work out
 * "if A is true, what of the others". Parts: a, e, i, o, karsitlik, altkarsitlik, altiklik, celisiklik, deger.
 */
export const OppositionVisual: React.FC<VisualBoxProps & {visual: Opposition}> = ({visual, width, height, delaySeconds = 0}) => {
	const seconds = useSceneSeconds();
	const relationStart = delaySeconds + 1.6;
	return (
		<World width={width} height={height} viewWidth={OPPOSITION_STAGE.width} viewHeight={OPPOSITION_STAGE.height}>
			{OPPOSITION_RELATIONS.map((relation, index) => (
				<Relation key={relation.id} id={relation.id} label={relation.label} lines={relation.lines} entrance={easeFrom(seconds, relationStart + index * 0.6, 0.8)} />
			))}
			{(Object.keys(CORNERS) as Corner[]).map((corner, index) => (
				<CornerBox
					key={corner}
					corner={corner}
					text={visual[corner]}
					truth={visual.truth[corner]}
					entrance={easeFrom(seconds, delaySeconds + 0.2 + index * 0.3, 0.5)}
					truthEntrance={easeFrom(seconds, relationStart + 3, 0.5)}
				/>
			))}
		</World>
	);
};

const Relation: React.FC<{id: string; label: string; lines: readonly (readonly [string, string])[]; entrance: number}> = ({id, label, lines, entrance}) => {
	const palette = useVisualPalette();
	const look = usePartLook(id, entrance);
	const lit = look.focused > 0.5;
	const colour = lit ? palette.lesson : withAlpha(palette.ink, 0.55);
	const at = (corner: string) => CORNERS[corner as Corner];
	// Each line is drawn from its first corner towards the second as the relation comes in.
	const segments = lines.map(([from, to]) => {
		const start = at(from);
		const end = at(to);
		const dx = end.x - start.x;
		const dy = end.y - start.y;
		const length = Math.hypot(dx, dy);
		const [ux, uy] = [dx / length, dy / length];
		const x0 = start.x + ux * CORNER;
		const y0 = start.y + uy * CORNER;
		const span = (length - 2 * CORNER) * look.drawn;
		return {x0, y0, x1: x0 + ux * span, y1: y0 + uy * span, mid: {x: (start.x + end.x) / 2, y: (start.y + end.y) / 2}, vertical: Math.abs(dx) < 1, diagonal: Math.abs(dx) > 1 && Math.abs(dy) > 1};
	});
	const first = segments[0];
	// Where the relation's name goes: above the top side, below the bottom one, beside the vertical sides, at the crossing.
	const labelAt = first.diagonal
		? {x: first.mid.x, y: first.mid.y - 22, rotate: 0, anchor: 'middle' as const}
		: first.vertical
			? {x: first.mid.x - 26, y: first.mid.y, rotate: -90, anchor: 'middle' as const}
			: {x: first.mid.x, y: first.mid.y + (first.mid.y < 400 ? -18 : 40), rotate: 0, anchor: 'middle' as const};
	return (
		<g opacity={look.opacity}>
			{segments.map((segment, index) => (
				<line
					key={index}
					x1={segment.x0}
					y1={segment.y0}
					x2={segment.x1}
					y2={segment.y1}
					stroke={colour}
					strokeWidth={lit ? 6 : 4}
					strokeLinecap="round"
					strokeDasharray={id === 'celisiklik' ? undefined : id === 'altiklik' ? '2 12' : undefined}
				/>
			))}
			{lines.length > 1 && !first.diagonal ? (
				<text
					x={segments[1].mid.x + 26}
					y={segments[1].mid.y}
					transform={`rotate(90 ${segments[1].mid.x + 26} ${segments[1].mid.y})`}
					textAnchor="middle"
					fontSize={28}
					fontWeight={800}
					fill={colour}
					fontFamily={palette.fontBody}
					opacity={look.drawn}
				>
					{label}
				</text>
			) : null}
			<text
				x={labelAt.x}
				y={labelAt.y}
				transform={labelAt.rotate ? `rotate(${labelAt.rotate} ${labelAt.x} ${labelAt.y})` : undefined}
				textAnchor={labelAt.anchor}
				fontSize={28}
				fontWeight={800}
				fill={colour}
				fontFamily={palette.fontBody}
				stroke={palette.background}
				strokeWidth={8}
				paintOrder="stroke"
				opacity={look.drawn}
			>
				{label}
			</text>
		</g>
	);
};

const CornerBox: React.FC<{corner: Corner; text: string; truth?: 'D' | 'Y' | '?'; entrance: number; truthEntrance: number}> = ({corner, text, truth, entrance, truthEntrance}) => {
	const palette = useVisualPalette();
	const look = usePartLook(corner, entrance);
	const truthLook = usePartLook('deger', truthEntrance);
	const spot = CORNERS[corner];
	const lit = look.focused > 0.5;
	const textX = spot.side === 'left' ? spot.x - CORNER - 26 : spot.x + CORNER + 26;
	const anchor = spot.side === 'left' ? 'end' : 'start';
	const lines = splitStatement(text);
	const truthColour = truth === 'D' ? '#2E8B57' : truth === 'Y' ? '#C0392B' : palette.muted;
	return (
		<g opacity={look.opacity} transform={`translate(${spot.x} ${spot.y}) scale(${(0.85 + 0.15 * entrance) * (1 + 0.06 * look.focused)}) translate(${-spot.x} ${-spot.y})`}>
			<circle cx={spot.x} cy={spot.y} r={CORNER} fill={lit ? palette.lesson : palette.surface} stroke={palette.lesson} strokeWidth={5} />
			<text x={spot.x} y={spot.y + 18} textAnchor="middle" fontSize={50} fontWeight={800} fill={lit ? palette.onLesson : palette.lesson} fontFamily={palette.fontDisplay}>
				{spot.letter}
			</text>
			<text x={textX} y={spot.y - 34} textAnchor={anchor} fontSize={24} fontWeight={700} fill={palette.muted} fontFamily={palette.fontBody}>
				{spot.name}
			</text>
			{lines.map((line, index) => (
				<text
					key={index}
					x={textX}
					y={spot.y + 4 + index * 34}
					textAnchor={anchor}
					fontSize={30}
					fontWeight={lit ? 800 : 700}
					fill={lit ? palette.lessonDeep : palette.ink}
					fontFamily={palette.fontBody}
				>
					{line}
				</text>
			))}
			{truth ? (
				<g opacity={truthLook.opacity}>
					<rect
						x={spot.side === 'left' ? textX - 150 : textX}
						y={spot.y + 4 + lines.length * 34 - 8}
						width={150}
						height={40}
						rx={20}
						fill={withAlpha(truthColour, 0.14)}
						stroke={truthColour}
						strokeWidth={2}
					/>
					<text
						x={(spot.side === 'left' ? textX - 150 : textX) + 75}
						y={spot.y + 4 + lines.length * 34 + 20}
						textAnchor="middle"
						fontSize={24}
						fontWeight={800}
						fill={truthColour}
						fontFamily={palette.fontBody}
					>
						{TRUTH_TEXT[truth]}
					</text>
				</g>
			) : null}
		</g>
	);
};

/** A corner's proposition in at most two lines of about 24 characters, cut at the most even word break. */
export const splitStatement = (text: string, perLine = 24): string[] => {
	if (text.length <= perLine) return [text];
	const words = text.split(/\s+/);
	let best: string[] = [text];
	let bestScore = Infinity;
	for (let cut = 1; cut < words.length; cut++) {
		const first = words.slice(0, cut).join(' ');
		const second = words.slice(cut).join(' ');
		const score = Math.max(first.length, second.length);
		if (score < bestScore) {
			bestScore = score;
			best = [first, second];
		}
	}
	return best;
};
