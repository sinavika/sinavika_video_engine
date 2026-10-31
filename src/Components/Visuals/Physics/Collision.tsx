import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useBeatStartFor} from '../VisualTimeline';
import {arrowHead} from './ArrowHead';

type Collision = Extract<CourseVisual, {kind: 'collision'}>;

/** The stage (CourseVisual keeps this ratio). */
export const COLLISION_STAGE = {width: 1600, height: 860};

/**
 * Velocities after a head-on collision on a line (positive to the right). Elastic: both momentum and kinetic energy
 * are kept, v₁' = ((m₁ − m₂)v₁ + 2m₂v₂) / (m₁ + m₂) and alike. Inelastic: they stick, V = (m₁v₁ + m₂v₂) / (m₁ + m₂).
 * An explosion takes the velocities it is given.
 */
export const collisionResult = (visual: Pick<Collision, 'bodies' | 'type' | 'after'>): [number, number] => {
	const [a, b] = visual.bodies;
	const total = a.mass + b.mass;
	if (visual.type === 'elastic') return [((a.mass - b.mass) * a.v + 2 * b.mass * b.v) / total, ((b.mass - a.mass) * b.v + 2 * a.mass * a.v) / total];
	if (visual.type === 'inelastic') {
		const common = (a.mass * a.v + b.mass * b.v) / total;
		return [common, common];
	}
	return visual.after ?? [a.v, b.v];
};

const format = (value: number) => (Math.round(value * 100) / 100).toString().replace('.', ',').replace(/^-/, '−');

/** The moment of contact, in simulated seconds; the whole run lasts twice as long. */
const CONTACT = 1;

/**
 * Two carts on a track meet head-on (or, in an explosion, push apart from rest together). They move at their real
 * velocities, meet at the middle and leave with the velocities the collision gives. Under the track the momentum
 * of each cart is an arrow, before and after, with the total beside them: the totals match. With `energy` the
 * kinetic energy before and after is written too. Beats point at b1, b2, `before`, `after`, `energy` and `run`.
 */
export const CollisionVisual: React.FC<VisualBoxProps & {visual: Collision}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const k = Math.min(width / COLLISION_STAGE.width, height / COLLISION_STAGE.height);
	const ox = (width - COLLISION_STAGE.width * k) / 2;
	const oy = (height - COLLISION_STAGE.height * k) / 2;
	const [a, b] = visual.bodies;
	const after = collisionResult(visual);
	const appear = useReveal(delaySeconds, 0.5);
	const runStart = useBeatStartFor('run', 'show') ?? delaySeconds + 1;
	const run = visual.motion ? Math.max(0, Math.min(1, (seconds - runStart) / visual.duration)) : 0;
	const t = run * 2 * CONTACT;
	const afterAt = useBeatStartFor('after', 'show');
	const afterIn = afterAt === undefined ? (t >= CONTACT ? easeFrom(seconds, runStart + visual.duration / 2, 0.5) : 0) : easeFrom(seconds, afterAt, 0.5);
	const beforeAt = useBeatStartFor('before', 'show');
	const beforeIn = beforeAt === undefined ? easeFrom(seconds, delaySeconds + 0.4, 0.5) : easeFrom(seconds, beforeAt, 0.5);
	const energyAt = useBeatStartFor('energy', 'show');
	const energyIn = visual.energy ? (energyAt === undefined ? afterIn : easeFrom(seconds, energyAt, 0.5)) : 0;
	const fontSize = 56;

	// Carts are drawn wide enough for their labels (wider for more mass) and touch at the middle at the moment of
	// contact; the motion's scale (stage units per metre) is the largest that keeps both carts on the track.
	const heaviest = Math.max(a.mass, b.mass);
	const widthOf = (mass: number) => 190 + 70 * Math.cbrt(mass / heaviest);
	const [wa, wb] = [widthOf(a.mass), widthOf(b.mass)];
	// Room at both ends for a velocity arrow running ahead of a cart.
	const trackLeft = 270;
	const trackRight = COLLISION_STAGE.width - 270;
	const middle = (trackLeft + trackRight) / 2;
	const half = (trackRight - trackLeft) / 2;
	const speeds = [Math.abs(a.v), Math.abs(b.v), Math.abs(after[0]), Math.abs(after[1])];
	const metre = Math.min(...[[wa, speeds[0]], [wb, speeds[1]], [wa, speeds[2]], [wb, speeds[3]]].filter(([, speed]) => speed > 1e-9).map(([w, speed]) => (half - w) / (speed * CONTACT)), 400);
	const centre = (index: 0 | 1, time: number) => {
		const w = index === 0 ? wa : wb;
		const start = (index === 0 ? -1 : 1) * (w / 2);
		const v = time < CONTACT ? (index === 0 ? a.v : b.v) : after[index];
		return middle + start + v * metre * (time - CONTACT);
	};
	const trackY = 300;
	const cartHeight = 130;
	const colours = [palette.lesson, palette.brand];
	const velocity = (index: 0 | 1) => (t < CONTACT ? (index === 0 ? a.v : b.v) : after[index]);

	// Momentum rows: one scale for every arrow, the largest momentum gets 300 units.
	const momenta = [a.mass * a.v, b.mass * b.v, a.mass * after[0], b.mass * after[1]];
	const totalBefore = momenta[0] + momenta[1];
	const totalAfter = momenta[2] + momenta[3];
	const pScale = 300 / Math.max(1e-9, ...momenta.map(Math.abs), Math.abs(totalBefore));
	const kinetic = (m: number, v: number) => 0.5 * m * v * v;
	const energyBefore = kinetic(a.mass, a.v) + kinetic(b.mass, b.v);
	const energyAfter = kinetic(a.mass, after[0]) + kinetic(b.mass, after[1]);

	const pArrow = (x: number, y: number, p: number, colour: string, key: string) => {
		const length = p * pScale;
		if (Math.abs(length) < 8) {
			return <circle key={key} cx={x} cy={y} r={9} fill={colour} />;
		}
		return (
			<g key={key}>
				<line x1={x} y1={y} x2={x + length - Math.sign(length) * 18} y2={y} stroke={colour} strokeWidth={14} strokeLinecap="round" />
				<path d={arrowHead(x + length, y, length > 0 ? 0 : Math.PI, 34)} fill={colour} />
			</g>
		);
	};
	const row = (label: string, y: number, values: [number, number], total: number, opacity: number, id: string) => (
		<Part key={id} id={id}>
			{(look) => (
				<g opacity={opacity * look.opacity}>
					<text x={140} y={y + 30 + fontSize * 0.35} fill={palette.ink} fontSize={fontSize * 0.85} fontWeight={800}>
						{label}
					</text>
					{pArrow(560, y, values[0], colours[0], 'p1')}
					{pArrow(560, y + 60, values[1], colours[1], 'p2')}
					<text x={560 + 330} y={y + fontSize * 0.3} fill={palette.ink} fontSize={fontSize * 0.75} fontWeight={700}>
						{`${a.label}: ${format(values[0])}`}
					</text>
					<text x={560 + 330} y={y + 60 + fontSize * 0.3} fill={palette.ink} fontSize={fontSize * 0.75} fontWeight={700}>
						{`${b.label}: ${format(values[1])}`}
					</text>
					<text x={COLLISION_STAGE.width - 120} y={y + 30 + fontSize * 0.35} fill={palette.ink} fontSize={fontSize * 0.85} fontWeight={800} textAnchor="end">
						{`toplam ${format(total)}`}
					</text>
				</g>
			)}
		</Part>
	);

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<g transform={`translate(${ox} ${oy}) scale(${k})`}>
				<g opacity={appear}>
					<line x1={trackLeft - 200} y1={trackY + cartHeight + 18} x2={trackRight + 200} y2={trackY + cartHeight + 18} stroke={palette.ink} strokeWidth={8} />
					<text x={560 - 20} y={590 - 50} fill={palette.muted} fontSize={fontSize * 0.7} fontWeight={700} textAnchor="end">
						{visual.unit}
					</text>
					<line x1={560} y1={590 - 30} x2={560} y2={830} stroke={palette.grid} strokeWidth={4} />
				</g>
				{([0, 1] as const).map((index) => {
					const body = visual.bodies[index];
					const x = centre(index, t);
					const w = index === 0 ? wa : wb;
					const v = velocity(index);
					const arrow = Math.min(200, Math.abs(v) * 50);
					return (
						<Part key={index} id={`b${index + 1}`}>
							{(look) => (
								<g opacity={appear * look.opacity}>
									<rect x={x - w / 2} y={trackY} width={w} height={cartHeight} rx={18} fill={colours[index]} stroke={palette.ink} strokeWidth={look.scale > 1 ? 8 : 5} />
									<circle cx={x - w * 0.28} cy={trackY + cartHeight + 4} r={14} fill={palette.ink} />
									<circle cx={x + w * 0.28} cy={trackY + cartHeight + 4} r={14} fill={palette.ink} />
									<text x={x} y={trackY + 58} fill={palette.surface} fontSize={fontSize * 0.85} fontWeight={800} textAnchor="middle">
										{body.label}
									</text>
									<text x={x} y={trackY + 106} fill={palette.surface} fontSize={fontSize * 0.7} fontWeight={700} textAnchor="middle">
										{`${format(body.mass)} kg`}
									</text>
									{arrow > 10 ? (
										<g>
											<line x1={x} y1={trackY - 46} x2={x + Math.sign(v) * arrow} y2={trackY - 46} stroke={colours[index]} strokeWidth={11} strokeLinecap="round" />
											<path d={arrowHead(x + Math.sign(v) * (arrow + 18), trackY - 46, v > 0 ? 0 : Math.PI, 32)} fill={colours[index]} />
										</g>
									) : null}
									<text x={x} y={trackY - 76} fill={palette.ink} fontSize={fontSize * 0.75} fontWeight={800} textAnchor="middle">
										{`${format(v)} m/s`}
									</text>
								</g>
							)}
						</Part>
					);
				})}
				{row('Önce', 590, [momenta[0], momenta[1]], totalBefore, beforeIn, 'before')}
				{row('Sonra', 730, [momenta[2], momenta[3]], totalAfter, afterIn, 'after')}
				{visual.energy ? (
					<Part id="energy">
						{(look) => (
							<text x={COLLISION_STAGE.width / 2} y={80} fill={palette.ink} fontSize={fontSize * 0.85} fontWeight={800} textAnchor="middle" opacity={energyIn * look.opacity}>
								{`Eₖ: önce ${format(energyBefore)} J → sonra ${format(energyAfter)} J`}
							</text>
						)}
					</Part>
				) : null}
			</g>
		</svg>
	);
};
