import React from 'react';
import {withAlpha} from '../../../Themes/Theme';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {useReveal, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part} from '../VisualTimeline';
import {arrowHead} from './ArrowHead';

type Charges = Extract<CourseVisual, {kind: 'charges'}>;

const CHARGE_COLOURS = {positive: '#D64545', negative: '#2F6FD6'} as const;

type ChargeSign = {x: number; y: number; sign: 'positive' | 'negative'};

/**
 * Where an object's charge signs go, relative to its centre: a charged object spreads one sign over its surface;
 * induction gathers one sign on the near side and the other on the far side; a neutral object without induction
 * shows none (its charges cancel).
 */
export const chargeSigns = (
	shape: 'sphere' | 'rod',
	charge: 'positive' | 'negative' | 'neutral',
	induced: {side: 'left' | 'right' | 'top'; sign: 'positive' | 'negative'} | undefined,
	size: number,
): ChargeSign[] => {
	const other = (sign: 'positive' | 'negative') => (sign === 'positive' ? 'negative' : 'positive');
	if (induced) {
		const near = induced.side === 'right' ? 1 : induced.side === 'left' ? -1 : 0;
		const spots = shape === 'rod' ? [-0.15, 0, 0.15] : [-0.45, 0, 0.45];
		const farSign = other(induced.sign);
		// Near side: three signs on the edge facing the inducer; far side: three on the opposite edge.
		const edge = (direction: number, sign: 'positive' | 'negative') =>
			spots.map((offset) => (near === 0 ? {x: offset * size, y: -direction * size * 0.62, sign} : {x: direction * near * size * (shape === 'rod' ? 0.8 : 0.62), y: offset * size * (shape === 'rod' ? 0.6 : 1), sign}));
		return [...edge(1, induced.sign), ...edge(-1, farSign)];
	}
	if (charge === 'neutral') return [];
	if (shape === 'rod') return [-0.75, -0.45, -0.15, 0.15, 0.45, 0.75].map((offset) => ({x: offset * size, y: 0, sign: charge}));
	return Array.from({length: 6}, (_, index) => {
		const angle = (index * Math.PI) / 3 + Math.PI / 6;
		return {x: Math.cos(angle) * size * 0.58, y: Math.sin(angle) * size * 0.58, sign: charge};
	});
};

const SignMark: React.FC<{x: number; y: number; sign: 'positive' | 'negative'; size: number}> = ({x, y, sign, size}) => {
	const colour = CHARGE_COLOURS[sign];
	return (
		<g stroke={colour} strokeWidth={size * 0.28} strokeLinecap="round">
			<line x1={x - size / 2} y1={y} x2={x + size / 2} y2={y} />
			{sign === 'positive' ? <line x1={x} y1={y - size / 2} x2={x} y2={y + size / 2} /> : null}
		</g>
	);
};

/**
 * Electric charges on spheres, rods and electroscopes: signs show where the charges are, induction moves them to
 * the sides, an electroscope's leaves open with its charge, and arrows show the pull or push between objects.
 */
export const ChargesVisual: React.FC<VisualBoxProps & {visual: Charges}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const appear = useReveal(delaySeconds, 0.5);
	const signsIn = useReveal(delaySeconds + 0.5, 0.6);
	const leavesOpen = useReveal(delaySeconds + 0.9, 1.2);
	const arrowsIn = useReveal(delaySeconds + 1.4, 0.6);
	const slot = width / visual.objects.length;
	// Objects fill the box's height: an electroscope stands about three sizes tall (knob, jar, label), a sphere with
	// its force arrows above it about two and a half; at a fixed share of the height they came out small (FIZ 8).
	const hasScope = visual.objects.some((object) => object.shape === 'electroscope');
	const size = Math.min(slot * 0.34, hasScope ? (height - u(70)) / 3.05 : (height - u(60)) / 2.5);
	const midY = hasScope ? u(10) + size * 1.6 : u(50) + size * 1.25;
	const sign = Math.max(u(18), size * 0.2);
	const fontSize = u(32);
	const centreOf = (index: number) => slot * (index + 0.5);
	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontBody}}>
			{visual.objects.map((object, index) => {
				const cx = centreOf(index);
				return (
					<Part key={index} id={`o${index + 1}`}>
						{(look) => {
							if (object.shape === 'electroscope') {
								// Knob on top, a rod into the jar, two leaves hanging from the rod's foot.
								const knob = {x: cx, y: midY - size * 1.05, r: size * 0.32};
								const foot = {x: cx, y: midY + size * 0.35};
								const leaf = size * 0.85;
								const angle = (object.leaves * 32 * Math.PI) / 180 * leavesOpen;
								const tip = (direction: number) => [foot.x + direction * Math.sin(angle) * leaf, foot.y + Math.cos(angle) * leaf];
								const knobSign = object.induced ? object.induced.sign : object.charge === 'neutral' ? undefined : object.charge;
								const leafSign = object.induced ? (object.induced.sign === 'positive' ? 'negative' : 'positive') : object.charge === 'neutral' ? undefined : object.charge;
								return (
									<g opacity={appear * look.opacity}>
										<rect x={cx - size * 0.95} y={midY - size * 0.45} width={size * 1.9} height={size * 1.85} rx={size * 0.3} fill={withAlpha(palette.ink, 0.04)} stroke={palette.muted} strokeWidth={u(4)} />
										<line x1={cx} y1={knob.y} x2={foot.x} y2={foot.y} stroke={palette.ink} strokeWidth={u(8) * look.scale} />
										<circle cx={knob.x} cy={knob.y} r={knob.r} fill={palette.surface} stroke={palette.ink} strokeWidth={u(6) * look.scale} />
										{[-1, 1].map((direction) => {
											const [x, y] = tip(direction);
											return <line key={direction} x1={foot.x} y1={foot.y} x2={x} y2={y} stroke="#C9A227" strokeWidth={u(10)} strokeLinecap="round" />;
										})}
										<g opacity={signsIn}>
											{/* Knob signs on an arc above the knob, spread so they never run into one line. */}
											{knobSign
												? [-145, -90, -35].map((degrees) => {
														const angle = (degrees * Math.PI) / 180;
														const radius = knob.r + sign * 0.9;
														return <SignMark key={degrees} x={knob.x + Math.cos(angle) * radius} y={knob.y + Math.sin(angle) * radius} sign={knobSign} size={sign * 0.85} />;
													})
												: null}
											{leafSign
												? [-1, 1].flatMap((direction) => {
														const [x, y] = tip(direction);
														return [0.55, 0.9].map((share) => <SignMark key={`${direction}${share}`} x={foot.x + (x - foot.x) * share + direction * sign * 0.9} y={foot.y + (y - foot.y) * share} sign={leafSign} size={sign * 0.85} />);
													})
												: null}
										</g>
										{object.label ? (
											<text x={cx} y={midY + size * 1.4 + fontSize * 1.2} textAnchor="middle" fill={palette.ink} fontSize={fontSize} fontWeight={800}>
												{object.label}
											</text>
										) : null}
									</g>
								);
							}
							const signs = chargeSigns(object.shape, object.charge, object.induced, size);
							return (
								<g opacity={appear * look.opacity}>
									{object.shape === 'rod' ? (
										<rect x={cx - size} y={midY - size * 0.22} width={size * 2} height={size * 0.44} rx={size * 0.22} fill={withAlpha(palette.ink, 0.06)} stroke={palette.ink} strokeWidth={u(5) * look.scale} />
									) : (
										<circle cx={cx} cy={midY} r={size * 0.85} fill={withAlpha(palette.ink, 0.06)} stroke={palette.ink} strokeWidth={u(5) * look.scale} />
									)}
									<g opacity={signsIn}>
										{signs.map((mark, signIndex) => (
											<SignMark key={signIndex} x={cx + mark.x} y={midY + mark.y} sign={mark.sign} size={sign} />
										))}
									</g>
									{object.label ? (
										<text x={cx} y={midY + size * (object.shape === 'rod' ? 0.6 : 1.05) + fontSize * 1.1} textAnchor="middle" fill={palette.ink} fontSize={fontSize} fontWeight={800}>
											{object.label}
										</text>
									) : null}
								</g>
							);
						}}
					</Part>
				);
			})}
			{visual.forces.map((force, index) => {
				const a = centreOf(force.from);
				const b = centreOf(force.to);
				const direction = Math.sign(b - a) || 1;
				const y = midY - size * 1.25;
				// Attraction: each object's arrow points at the other; repulsion: away from it.
				const arrow = (x: number, towards: number) => {
					const pointing = force.kind === 'attract' ? towards : -towards;
					const length = Math.min(slot * 0.32, u(110));
					const start = x - (pointing * length) / 2;
					const end = x + (pointing * length) / 2;
					return (
						<g>
							<line x1={start} y1={y} x2={end - pointing * u(16)} y2={y} stroke={palette.brand} strokeWidth={u(7)} strokeLinecap="round" />
							<path d={arrowHead(end, y, pointing > 0 ? 0 : Math.PI, u(24))} fill={palette.brand} />
						</g>
					);
				};
				return (
					<Part key={`f${index}`} id={`f${index + 1}`}>
						{(look) => (
							<g opacity={arrowsIn * look.opacity}>
								{arrow(a, direction)}
								{arrow(b, -direction)}
								<text x={(a + b) / 2} y={y - u(18)} textAnchor="middle" fill={palette.ink} fontSize={fontSize * 0.9} fontWeight={800}>
									{force.kind === 'attract' ? 'çeker' : 'iter'}
								</text>
							</g>
						)}
					</Part>
				);
			})}
		</svg>
	);
};
