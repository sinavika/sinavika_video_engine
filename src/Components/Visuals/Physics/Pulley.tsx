import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useBeatStartFor, useShownAt} from '../VisualTimeline';
import {arrowHead} from './ArrowHead';

type Pulley = Extract<CourseVisual, {kind: 'pulley'}>;

/** The gap between neighbouring rope segments: a pulley's diameter. */
const GAP = 116;

/** The pulley's stage, as wide as its ropes plus room for the labels either side (CourseVisual keeps this ratio). */
export const pulleyStage = (ropes: number) => ({width: ropes * GAP + 700, height: 900});

/** Where the first rope hangs: room on the left for the h mark and a moving pulley's weight. */
const LEFT = 300;

/**
 * A block and tackle with `ropes` supporting segments, numbered 0…n−1 from the left; the free end comes down on the
 * right of the last upper pulley. Each pulley joins two neighbouring segments, alternately over an upper pulley and
 * under a lower one, counted back from the free end. With an even count the rope is tied to the ceiling, with an odd
 * count to the lower block; a single rope is one fixed pulley with the load on the rope.
 */
export const pulleyLayout = (ropes: number) => {
	const pulleys = Array.from({length: ropes}, (_, index) => ({index, upper: (ropes - 1 - index) % 2 === 0}));
	return {pulleys, anchor: ropes === 1 ? ('load' as const) : ropes % 2 === 0 ? ('ceiling' as const) : ('block' as const), lower: pulleys.filter((pulley) => !pulley.upper).length};
};

/**
 * The force that holds the load (or lifts it at constant speed): the load and the lower (moving) pulleys share the
 * supporting ropes equally, F = (G + moving pulleys' weight) / n. Pulling the free end by x lifts the load by x / n.
 */
export const pulleyForce = (visual: Pick<Pulley, 'ropes' | 'load' | 'pulleyWeight'>) => (visual.load + pulleyLayout(visual.ropes).lower * (visual.pulleyWeight ?? 0)) / visual.ropes;

const format = (value: number) => (Math.round(value * 100) / 100).toString().replace('.', ',');

/** How far the free end is pulled, in stage units. */
const PULL = 200;

/**
 * Ropes and pulleys from a ceiling, the load on the lower block and the pull F on the free end. The supporting ropes
 * are counted (1…n) when shown; then the free end is pulled down by x and the load rises by x / n while every pulley
 * turns: the upper ones clockwise, the moving ones the other way. A dashed outline keeps the load's first place and
 * the two lengths h and x = n·h are marked: the force shrinks n times, the rope pulled grows n times.
 */
export const PulleyVisual: React.FC<VisualBoxProps & {visual: Pulley}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const n = visual.ropes;
	const stage = pulleyStage(n);
	const k = Math.min(width / stage.width, height / stage.height);
	const ox = (width - stage.width * k) / 2;
	const oy = (height - stage.height * k) / 2;
	const {pulleys, anchor} = pulleyLayout(n);
	const gap = GAP;
	const r = gap / 2;
	const x0 = LEFT;
	const xs = Array.from({length: n + 1}, (_, index) => x0 + index * gap);
	const ceiling = 64;
	const upperY = 180;
	const appear = useReveal(delaySeconds, 0.5);
	const loadIn = easeFrom(seconds, useShownAt('load') ?? delaySeconds + 0.3, 0.5);
	const forceIn = easeFrom(seconds, useShownAt('f') ?? delaySeconds + 0.7, 0.5);
	const pullStart = useBeatStartFor('pull', 'show') ?? delaySeconds + 1.8;
	// A question's figure stands still: the pull and its lengths would give the answer away.
	const pulled = visual.motion ? PULL * easeFrom(seconds, pullStart, 2.4) : 0;
	const marks = visual.motion ? easeFrom(seconds, useBeatStartFor('h', 'show') ?? pullStart + 2.6, 0.5) : 0;
	// The supporting ropes are numbered only when a beat counts them.
	const countShown = useBeatStartFor('ropes', 'show');
	const countFocused = useBeatStartFor('ropes', 'focus');
	const counted = countShown ?? countFocused;
	const count = counted === undefined ? 0 : easeFrom(seconds, counted, 0.5);
	const rise = pulled / n;
	// The lower block (moving pulleys' axles) and the load under it; with one rope the rope holds the load itself.
	const lowerY0 = 480;
	const lowerY = lowerY0 - rise;
	const loadTop = (y: number) => (n === 1 ? y : y + r + 46);
	const loadW = 170;
	const loadH = 120;
	const lowers = pulleys.filter((pulley) => !pulley.upper).map((pulley) => (xs[pulley.index] + xs[pulley.index + 1]) / 2);
	const blockLeft = Math.min(...lowers, anchor === 'block' ? xs[0] : Infinity);
	const blockRight = Math.max(...lowers, anchor === 'block' ? xs[0] : -Infinity);
	const loadX = n === 1 ? xs[0] : (blockLeft + blockRight) / 2;
	const freeY0 = 470;
	const freeY = freeY0 + pulled;
	const fontSize = 46;
	const force = pulleyForce(visual);
	const spokes = (cx: number, cy: number, angle: number, colour: string) =>
		[0, 1, 2].map((spoke) => {
			const a = angle + (spoke * Math.PI) / 3;
			return <line key={spoke} x1={cx - Math.cos(a) * r * 0.72} y1={cy - Math.sin(a) * r * 0.72} x2={cx + Math.cos(a) * r * 0.72} y2={cy + Math.sin(a) * r * 0.72} stroke={colour} strokeWidth={5} />;
		});
	const rope = palette.ink;

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<g transform={`translate(${ox} ${oy}) scale(${k})`}>
				<g opacity={appear}>
					{/* The ceiling, hatched. */}
					<line x1={xs[0] - 70} y1={ceiling} x2={xs[n] + 70} y2={ceiling} stroke={palette.ink} strokeWidth={8} />
					{Array.from({length: Math.ceil((xs[n] - xs[0] + 140) / 36)}, (_, index) => (
						<line key={index} x1={xs[0] - 70 + index * 36} y1={ceiling} x2={xs[0] - 70 + index * 36 + 24} y2={ceiling - 24} stroke={palette.axis} strokeWidth={4} />
					))}
					{/* Upper pulleys hang from the ceiling. */}
					{pulleys
						.filter((pulley) => pulley.upper)
						.map((pulley) => {
							const cx = (xs[pulley.index] + xs[pulley.index + 1]) / 2;
							return <line key={`h${pulley.index}`} x1={cx} y1={ceiling} x2={cx} y2={upperY} stroke={palette.axis} strokeWidth={8} />;
						})}
				</g>
				{/* The supporting ropes: segment i from the top (a pulley's side, or the ceiling knot) down to the lower block. */}
				<Part id="ropes">
					{(look) => (
						<g opacity={appear}>
							{xs.slice(0, n).map((x, index) => {
								const top = index === 0 && anchor === 'ceiling' ? ceiling : upperY;
								const bottom = n === 1 ? loadTop(lowerY) : lowerY;
								return <line key={index} x1={x} y1={top} x2={x} y2={bottom} stroke={look.scale > 1 ? palette.lesson : rope} strokeWidth={6 * look.scale} />;
							})}
							{count > 0
								? xs.slice(0, n).map((x, index) => (
										<g key={`c${index}`} opacity={count}>
											<circle cx={x} cy={(upperY + lowerY) / 2 + (index % 2) * 34} r={27} fill={palette.lesson} />
											<text x={x} y={(upperY + lowerY) / 2 + (index % 2) * 34 + 12} fill={palette.onLesson} fontSize={32} fontWeight={800} textAnchor="middle">
												{index + 1}
											</text>
										</g>
									))
								: null}
						</g>
					)}
				</Part>
				{/* The free end, from the last upper pulley down to the hand. */}
				<g opacity={appear}>
					<line x1={xs[n]} y1={upperY} x2={xs[n]} y2={freeY} stroke={rope} strokeWidth={6} />
					{pulleys.map((pulley) => {
						const cx = (xs[pulley.index] + xs[pulley.index + 1]) / 2;
						const cy = pulley.upper ? upperY : lowerY;
						// Rope runs over the top of an upper pulley and under a lower one.
						const arc = pulley.upper ? `M${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}` : `M${cx - r} ${cy} A ${r} ${r} 0 0 0 ${cx + r} ${cy}`;
						const turn = (((pulley.index + 1) / n) * pulled) / r;
						return (
							<g key={`p${pulley.index}`}>
								<circle cx={cx} cy={cy} r={r - 3} fill={palette.surface} stroke={palette.ink} strokeWidth={6} />
								{spokes(cx, cy, pulley.upper ? turn : -turn, palette.axis)}
								<circle cx={cx} cy={cy} r={9} fill={palette.ink} />
								<path d={arc} fill="none" stroke={rope} strokeWidth={6} />
							</g>
						);
					})}
					{n > 1 ? <line x1={Math.min(blockLeft, loadX) - 12} y1={lowerY} x2={Math.max(blockRight, loadX) + 12} y2={lowerY} stroke={palette.ink} strokeWidth={12} strokeLinecap="round" /> : null}
					{n > 1 ? <line x1={loadX} y1={lowerY} x2={loadX} y2={loadTop(lowerY)} stroke={palette.ink} strokeWidth={6} /> : null}
				</g>
				{/* The load, with a dashed outline where it started. */}
				<Part id="load">
					{(look) => (
						<g opacity={loadIn * look.opacity}>
							<rect x={loadX - loadW / 2} y={loadTop(lowerY)} width={loadW} height={loadH} rx={12} fill={palette.lesson} stroke={palette.ink} strokeWidth={look.scale > 1 ? 7 : 4} />
							<text x={loadX} y={loadTop(lowerY) + loadH / 2 + fontSize * 0.36} fill={palette.onLesson} fontSize={fontSize} fontWeight={800} textAnchor="middle">
								{visual.loadLabel ?? `${format(visual.load)} N`}
							</text>
							{visual.pulleyWeight && lowers.length > 0 ? (
								<text x={blockLeft - r - 20} y={lowerY + 14} fill={palette.muted} fontSize={fontSize * 0.7} fontWeight={700} textAnchor="end">
									{`makara ${format(visual.pulleyWeight)} N`}
								</text>
							) : null}
						</g>
					)}
				</Part>
				<Part id="f">
					{(look) => (
						<g opacity={forceIn * look.opacity}>
							<line x1={xs[n]} y1={freeY} x2={xs[n]} y2={freeY + 110} stroke={palette.brand} strokeWidth={12 * look.scale} strokeLinecap="round" />
							<path d={arrowHead(xs[n], freeY + 140, Math.PI / 2, 40)} fill={palette.brand} />
							<text x={xs[n] + 34} y={freeY + 100} fill={palette.ink} fontSize={fontSize} fontWeight={800}>
								{visual.forceLabel ?? `F = ${format(force)} N`}
							</text>
						</g>
					)}
				</Part>
				{/* What the pull did: the load rose h, the rope came down n·h. */}
				<Part id="h">
					{(look) => (
						<g opacity={marks * look.opacity} fontSize={fontSize} fontWeight={800}>
							<rect x={loadX - loadW / 2} y={loadTop(lowerY0)} width={loadW} height={loadH} rx={12} fill="none" stroke={palette.muted} strokeWidth={4} strokeDasharray="14 10" />
							<line x1={loadX - loadW / 2 - 30} y1={loadTop(lowerY0) + loadH} x2={loadX - loadW / 2 - 30} y2={loadTop(lowerY) + loadH} stroke={palette.lesson} strokeWidth={6} />
							<path d={arrowHead(loadX - loadW / 2 - 30, loadTop(lowerY) + loadH, -Math.PI / 2, 24)} fill={palette.lesson} />
							<text x={loadX - loadW / 2 - 50} y={(loadTop(lowerY0) + loadTop(lowerY)) / 2 + loadH + 16} fill={palette.ink} textAnchor="end">
								h
							</text>
							<line x1={xs[n] + 40} y1={freeY0} x2={xs[n] + 40} y2={freeY} stroke={palette.brand} strokeWidth={6} />
							<path d={arrowHead(xs[n] + 40, freeY, Math.PI / 2, 24)} fill={palette.brand} />
							<text x={xs[n] + 62} y={(freeY0 + freeY) / 2 + 16} fill={palette.ink} textAnchor="start">
								{n === 1 ? 'x = h' : `x = ${n}h`}
							</text>
						</g>
					)}
				</Part>
			</g>
		</svg>
	);
};
