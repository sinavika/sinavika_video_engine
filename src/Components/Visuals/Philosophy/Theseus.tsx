import React, {useId} from 'react';
import {clamp01, smoothStep} from '../../../Animations/Motion';
import {mixColors} from '../../../Themes/ColorPalette';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useBeatStartFor} from '../VisualTimeline';

type Theseus = Extract<CourseVisual, {kind: 'theseus'}>;

/** The stage (CourseVisual keeps this ratio). */
export const THESEUS_STAGE = {width: 1600, height: 640};

const ROWS = 3;
const COLUMNS = 8;
/** Planks on the hull: three strakes of eight. */
export const PLANKS = ROWS * COLUMNS;
const DECK = 330;
const PLANK = {width: 66, height: 52};
const WATER = 460;

/** Where a hull is drawn: its deck runs from `left` for eight planks. */
const hullAt = (left: number) => {
	const right = left + COLUMNS * PLANK.width;
	const bottom = DECK + ROWS * PLANK.height;
	return {
		left,
		right,
		bottom,
		path: `M ${left - 40} ${DECK} L ${right + 50} ${DECK} Q ${right + 10} ${bottom - 10} ${right - 70} ${bottom + 8} L ${left + 50} ${bottom + 8} Q ${left - 10} ${bottom - 20} ${left - 40} ${DECK} Z`,
	};
};

const FIRST = hullAt(170);
const SECOND = hullAt(930);

/**
 * The order the planks are replaced in: every plank once, scattered over the hull (a fixed shuffle, so the same
 * frames always show the same planks).
 */
export const replacementOrder = (): number[] => {
	const order = Array.from({length: PLANKS}, (_, index) => index);
	let seed = 7;
	for (let index = order.length - 1; index > 0; index--) {
		seed = (seed * 9301 + 49297) % 233280;
		const swap = Math.floor((seed / 233280) * (index + 1));
		[order[index], order[swap]] = [order[swap], order[index]];
	}
	return order;
};

const ORDER = replacementOrder();
const ease = (value: number) => smoothStep(clamp01(value));

/**
 * Philosophy: the ship of Theseus, the puzzle of identity through change. On the beat that shows `replace` the old
 * planks are swapped for new ones one at a time (`period` seconds each) while a counter keeps the score, and each old
 * plank lands on a pile at the dock. On the beat that shows `second` the pile is rebuilt into a second ship of only old
 * planks (Hobbes's twist): which one is Theseus's ship? Without beats every plank is new and the second ship stands.
 * Parts: ship, replace, pile, second.
 */
export const TheseusVisual: React.FC<VisualBoxProps & {visual: Theseus}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const id = useId().replace(/:/g, '');
	const k = Math.min(width / THESEUS_STAGE.width, height / THESEUS_STAGE.height);
	const ox = (width - THESEUS_STAGE.width * k) / 2;
	const oy = (height - THESEUS_STAGE.height * k) / 2;
	const appear = useReveal(delaySeconds, 0.5);
	const replaceAt = useBeatStartFor('replace', 'show');
	const secondAt = useBeatStartFor('second', 'show');
	const fontSize = Math.max(44, 24 / k);
	const text = (x: number, y: number, value: string, anchor: 'start' | 'middle' | 'end' = 'middle', size = fontSize) => (
		<text x={x} y={y} fill={palette.ink} fontSize={size} fontWeight={800} textAnchor={anchor} dominantBaseline="central" stroke={palette.surface} strokeWidth={8} paintOrder="stroke">
			{value}
		</text>
	);
	const old = mixColors(palette.lessonDeep, palette.surface, 0.15);
	const fresh = mixColors(palette.lesson, palette.surface, 0.55);
	// How many planks are new: all of them when nothing times the swap (a still, or a card without beats).
	const replaced = !visual.motion || replaceAt === undefined ? PLANKS : Math.max(0, Math.min(PLANKS, Math.floor((seconds - replaceAt) / visual.period)));
	const isNew = new Set(ORDER.slice(0, replaced));
	// The second ship is rebuilt only once every plank has come off the first, even if its beat comes early.
	const rebuildAt = secondAt === undefined ? undefined : Math.max(secondAt, replaceAt === undefined ? secondAt : replaceAt + PLANKS * visual.period);
	const rebuilt = !visual.motion ? 1 : rebuildAt === undefined ? (replaceAt === undefined ? 1 : 0) : ease((seconds - rebuildAt) / 1.2);
	const bob = visual.motion ? Math.sin(seconds * 1.6) * 4 : 0;

	const ship = (hull: ReturnType<typeof hullAt>, plankFill: (index: number) => string, key: string) => (
		<g transform={`translate(0 ${bob})`}>
			<clipPath id={`${id}-${key}`}>
				<path d={hull.path} />
			</clipPath>
			<g clipPath={`url(#${id}-${key})`}>
				{Array.from({length: PLANKS}, (_, index) => {
					const [row, column] = [Math.floor(index / COLUMNS), index % COLUMNS];
					const x = hull.left - 40 + column * ((hull.right + 50 - (hull.left - 40)) / COLUMNS);
					const w = (hull.right + 50 - (hull.left - 40)) / COLUMNS;
					return (
						<rect key={index} x={x} y={DECK + row * PLANK.height} width={w} height={row === ROWS - 1 ? PLANK.height + 20 : PLANK.height} fill={plankFill(index)} stroke={palette.ink} strokeWidth={3} />
					);
				})}
			</g>
			<path d={hull.path} fill="none" stroke={palette.ink} strokeWidth={6} strokeLinejoin="round" />
			<line x1={(hull.left + hull.right) / 2} y1={DECK} x2={(hull.left + hull.right) / 2} y2={70} stroke={palette.ink} strokeWidth={10} strokeLinecap="round" />
			<path
				d={`M ${(hull.left + hull.right) / 2 + 10} 90 L ${(hull.left + hull.right) / 2 + 10} ${DECK - 40} L ${hull.right + 20} ${DECK - 40} Z`}
				fill={mixColors(palette.surface, palette.lesson, 0.25)}
				stroke={palette.ink}
				strokeWidth={4}
				strokeLinejoin="round"
			/>
		</g>
	);
	const water = (left: number, right: number) => (
		<path
			d={`M ${left} ${WATER} ${Array.from({length: Math.ceil((right - left) / 80)}, (_, index) => `q 20 ${index % 2 ? 10 : -10} 40 0 t 40 0`).join(' ')}`}
			fill="none"
			stroke={palette.lesson}
			strokeWidth={5}
			strokeLinecap="round"
			opacity={0.7}
		/>
	);
	// The pile of old planks at the dock, one more for every plank swapped.
	const pile = Array.from({length: replaced}, (_, index) => ({x: SECOND.left + 40 + (index % 6) * 72, y: WATER + 40 - Math.floor(index / 6) * 18}));

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
				<Part id="ship">
					{(look) => (
						<g opacity={look.opacity}>
							{water(80, 860)}
							{ship(FIRST, (index) => (isNew.has(index) ? fresh : old), 'first')}
							{text((FIRST.left + FIRST.right) / 2, 600, visual.firstLabel)}
						</g>
					)}
				</Part>
				<Part id="replace">
					{(look) => (
						<g opacity={look.opacity}>
							<rect x={FIRST.left - 30} y={22} width={400} height={70} rx={35} fill={palette.surface} stroke={palette.ink} strokeWidth={4} />
							<rect x={FIRST.left - 30} y={22} width={400 * (replaced / PLANKS)} height={70} rx={35} fill={fresh} />
							{text(FIRST.left + 170, 57, `${visual.counterLabel}: ${replaced} / ${PLANKS}`, 'middle', fontSize * 0.7)}
						</g>
					)}
				</Part>
				<Part id="pile">
					{(look) => (
						<g opacity={look.opacity * (1 - rebuilt)}>
							{pile.map((plank, index) => (
								<rect key={index} x={plank.x} y={plank.y} width={64} height={16} rx={4} fill={old} stroke={palette.ink} strokeWidth={2} />
							))}
							{replaced > 0 ? text(SECOND.left + 250, WATER + 100, visual.pileLabel, 'middle', fontSize * 0.75) : null}
						</g>
					)}
				</Part>
				<Part id="second">
					{(look) => (
						<g opacity={look.opacity * rebuilt}>
							{water(SECOND.left - 60, SECOND.right + 120)}
							{ship(SECOND, () => old, 'second')}
							{text((SECOND.left + SECOND.right) / 2, 600, visual.secondLabel)}
						</g>
					)}
				</Part>
			</g>
		</svg>
	);
};
