import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useBeatStartFor, useShownAt} from '../VisualTimeline';
import {gearTrain} from './GearTrain';

type Gears = Extract<CourseVisual, {kind: 'gears'}>;

/** Teeth per unit of radius: wheels of radius r, 2r, 3r get 10, 20, 30 teeth of one size, so meshing teeth match. */
const TEETH_PER_UNIT = 10;

const format = (value: number) => (Math.round(value * 100) / 100).toString().replace('.', ',');

/** A gear's outline around (0, 0): `count` trapezoid teeth on a rim of `radius`, `depth` deep. */
const gearPath = (radius: number, count: number, depth: number) => {
	const step = (2 * Math.PI) / count;
	const points: string[] = [];
	for (let tooth = 0; tooth < count; tooth++) {
		const a = tooth * step;
		const at = (angle: number, r: number) => `${(Math.cos(angle) * r).toFixed(2)} ${(Math.sin(angle) * r).toFixed(2)}`;
		points.push(at(a - step * 0.5, radius - depth / 2), at(a - step * 0.2, radius - depth / 2), at(a - step * 0.12, radius + depth / 2), at(a + step * 0.12, radius + depth / 2), at(a + step * 0.2, radius - depth / 2));
	}
	return `M${points.join(' L')} Z`;
};

/** Where a belt leaves two wheels: the outer tangents for an open belt, the crossing ones for a crossed belt. */
const beltLines = (a: [number, number], ra: number, b: [number, number], rb: number, crossed: boolean) => {
	const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
	const phi = Math.atan2(b[1] - a[1], b[0] - a[0]);
	const spread = Math.acos(Math.max(-1, Math.min(1, crossed ? -(ra + rb) / d : (rb - ra) / d)));
	return [phi + spread, phi - spread].map((normal) => {
		const n = [Math.cos(normal), Math.sin(normal)];
		const from: [number, number] = [a[0] - ra * n[0], a[1] - ra * n[1]];
		const to: [number, number] = crossed ? [b[0] + rb * n[0], b[1] + rb * n[1]] : [b[0] - rb * n[0], b[1] - rb * n[1]];
		return [from, to] as const;
	});
};

/**
 * Gears and belt wheels (kasnak) that turn together: the first wheel turns `turns` times and every other follows its
 * link, at the speed and in the direction it must. A coloured mark on each wheel makes its turning countable; under
 * each wheel a counter runs to its number of turns with ↻ or ↺. A load hung from a wheel rises or falls by the rope
 * wound, 2πr per turn. Beats point at wheels w1…, `turn` (starts the motion) and `counts`.
 */
export const GearVisual: React.FC<VisualBoxProps & {visual: Gears}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const seconds = useSceneSeconds();
	const train = gearTrain(visual.wheels);
	const fontSize = u(34);
	// The world in units: every wheel, a rope's whole travel and room for the counters under the wheels.
	const travel = visual.motion ? 2 * Math.PI * visual.turns : 0;
	const hangs = visual.wheels.map((wheel, index) => {
		if (!wheel.hang) return null;
		const side = wheel.hang.side === 'left' ? -1 : 1;
		const x = train[index].x + side * wheel.radius;
		// Clockwise turning lowers a load on the right and lifts one on the left; a rising load starts low enough to
		// stay under its wheel.
		const shift = side * wheel.radius * train[index].turns * travel;
		// The load hangs below the largest wheel on this axle, so it never sits inside a crank wheel.
		const below = Math.max(...visual.wheels.filter((_, j) => Math.hypot(train[j].x - train[index].x, train[j].y - train[index].y) < 1e-6).map((other) => other.radius));
		const top = train[index].y + below + 0.8 + Math.max(0, -shift);
		return {x, top, shift, side};
	});
	const bottomRoom = 1.4;
	const xs = train.flatMap((wheel, index) => [wheel.x - visual.wheels[index].radius - 0.6, wheel.x + visual.wheels[index].radius + 0.6]);
	const ys = [
		...train.flatMap((wheel, index) => [wheel.y - visual.wheels[index].radius - 0.6, wheel.y + visual.wheels[index].radius + bottomRoom]),
		...hangs.flatMap((hang) => (hang ? [hang.top, hang.top + hang.shift, hang.top + 1.8, hang.top + hang.shift + 1.8] : [])),
	];
	const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
	const margin = u(24);
	const unit = Math.min((width - 2 * margin) / (maxX - minX), (height - 2 * margin) / (maxY - minY));
	const left = (width - unit * (maxX - minX)) / 2;
	const top = (height - unit * (maxY - minY)) / 2;
	const at = (x: number, y: number): [number, number] => [left + (x - minX) * unit, top + (y - minY) * unit];
	const appear = useReveal(delaySeconds, 0.5);
	const turnStart = useBeatStartFor('turn', 'show') ?? delaySeconds + 1.2;
	const duration = 1.6 + 1.2 * Math.min(3, visual.turns);
	const progress = visual.motion ? easeFrom(seconds, turnStart, duration) : 0;
	const countsAt = useBeatStartFor('counts', 'show');
	const counts = visual.motion && visual.counters ? (countsAt === undefined ? Math.min(1, progress * 3) : easeFrom(seconds, countsAt, 0.5)) : 0;
	const shown = visual.wheels.map((_, index) => easeFrom(seconds, useShownAt(`w${index + 1}`) ?? delaySeconds + index * 0.25, 0.5));
	const angles = train.map((wheel) => wheel.turns * visual.turns * 2 * Math.PI * progress);
	// Teeth of meshing gears interleave: each gear starts half a tooth off the one it meshes with at the contact.
	const offsets: number[] = [];
	visual.wheels.forEach((wheel, index) => {
		if (index === 0 || wheel.link !== 'mesh') {
			offsets.push(index > 0 && wheel.link === 'axle' ? offsets[index - 1] : 0);
			return;
		}
		const before = visual.wheels[index - 1];
		const contact = Math.atan2(train[index].y - train[index - 1].y, train[index].x - train[index - 1].x);
		const pitchBefore = (2 * Math.PI) / Math.max(6, Math.round(before.radius * TEETH_PER_UNIT));
		const count = Math.max(6, Math.round(wheel.radius * TEETH_PER_UNIT));
		// How far the previous gear's nearest tooth sits from the contact, carried across the contact.
		const lag = (((contact - offsets[index - 1]) % pitchBefore) + pitchBefore) % pitchBefore;
		offsets.push(contact + Math.PI - (lag * before.radius) / wheel.radius + Math.PI / count);
	});
	// Back layers first; on one axle the larger first, so the smaller riveted on it stays in sight.
	const order = visual.wheels.map((_, index) => index).sort((a, b) => {
		if (train[a].layer !== train[b].layer) return train[a].layer - train[b].layer;
		const same = Math.hypot(train[a].x - train[b].x, train[a].y - train[b].y) < 1e-6;
		return same ? visual.wheels[b].radius - visual.wheels[a].radius : a - b;
	});

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			{/* Belts first, under the wheels; the dashes run with the belt. */}
			{visual.wheels.map((wheel, index) => {
				if (index === 0 || (wheel.link !== 'belt' && wheel.link !== 'crossed')) return null;
				const before = visual.wheels[index - 1];
				const lines = beltLines(at(train[index - 1].x, train[index - 1].y), before.radius * unit, at(train[index].x, train[index].y), wheel.radius * unit, wheel.link === 'crossed');
				const run = Math.abs(angles[index - 1]) * before.radius * unit;
				return (
					<g key={`b${index}`} opacity={Math.min(shown[index - 1], shown[index]) * appear}>
						{lines.map(([from, to], line) => (
							<line key={line} x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} stroke={palette.ink} strokeWidth={u(7)} strokeDasharray={`${u(22)} ${u(8)}`} strokeDashoffset={line === 0 ? -run : run} />
						))}
					</g>
				);
			})}
			{order.map((index) => {
				const wheel = visual.wheels[index];
				const [cx, cy] = at(train[index].x, train[index].y);
				const radius = wheel.radius * unit;
				const colour = index % 2 === 0 ? palette.lesson : palette.lessonDeep;
				const rotation = ((angles[index] + offsets[index]) * 180) / Math.PI;
				// With a smaller wheel riveted on top, the labels sit on the ring between the two rims.
				const inner = Math.max(0, ...visual.wheels.filter((other, j) => j !== index && other.radius < wheel.radius && Math.hypot(train[j].x - train[index].x, train[j].y - train[index].y) < 1e-6).map((other) => other.radius));
				const labelAt = (inner > 0 ? (wheel.radius + inner) / 2 : wheel.radius * 0.3) * unit;
				return (
					<Part key={index} id={`w${index + 1}`}>
						{(look) => (
							<g opacity={shown[index] * appear * look.opacity}>
								<g transform={`translate(${cx} ${cy}) rotate(${rotation})`}>
									{wheel.teeth ? (
										<path d={gearPath(radius, Math.max(6, Math.round(wheel.radius * TEETH_PER_UNIT)), Math.min(u(22), radius * 0.16))} fill={colour} stroke={palette.ink} strokeWidth={u(3) * look.scale} strokeLinejoin="round" />
									) : (
										<>
											<circle r={radius} fill={colour} stroke={palette.ink} strokeWidth={u(3) * look.scale} />
											<circle r={radius - u(9)} fill="none" stroke={palette.surface} strokeOpacity={0.5} strokeWidth={u(3)} />
										</>
									)}
									<circle r={radius * 0.62} fill={palette.surface} fillOpacity={0.22} />
									{/* The mark that makes turning countable. */}
									<line x1={0} y1={0} x2={radius * 0.8} y2={0} stroke={palette.surface} strokeWidth={u(8)} strokeLinecap="round" />
									<circle cx={radius * 0.8} cy={0} r={u(10)} fill={palette.brand} stroke={palette.surface} strokeWidth={u(3)} />
									<circle r={u(10)} fill={palette.ink} />
								</g>
								<text x={cx} y={cy - labelAt + (inner > 0 ? fontSize * 0.35 : 0)} fill={palette.onLesson} fontSize={fontSize} fontWeight={800} textAnchor="middle" stroke={colour} strokeWidth={u(6)} paintOrder="stroke">
									{wheel.label}
								</text>
								{wheel.radiusLabel ? (
									<text x={cx} y={cy + labelAt + (inner > 0 ? fontSize * 0.3 : fontSize * 0.7)} fill={palette.onLesson} fontSize={fontSize * 0.8} fontWeight={700} textAnchor="middle" stroke={colour} strokeWidth={u(6)} paintOrder="stroke">
										{wheel.radiusLabel}
									</text>
								) : null}
							</g>
						)}
					</Part>
				);
			})}
			{/* Loads on ropes wound round a wheel. */}
			{visual.wheels.map((wheel, index) => {
				const hang = hangs[index];
				if (!hang || !wheel.hang) return null;
				const shift = hang.shift * progress;
				const [rx, ry] = at(hang.x, train[index].y);
				const [, boxTop] = at(hang.x, hang.top + shift);
				const side = u(70);
				return (
					<g key={`h${index}`} opacity={shown[index] * appear}>
						<line x1={rx} y1={ry} x2={rx} y2={boxTop} stroke={palette.ink} strokeWidth={u(4)} />
						<rect x={rx - side / 2} y={boxTop} width={side} height={side} rx={u(8)} fill={palette.brand} stroke={palette.ink} strokeWidth={u(3)} />
						<text x={rx + (hang.side > 0 ? side / 2 + u(12) : -side / 2 - u(12))} y={boxTop + side / 2 + fontSize * 0.35} fill={palette.ink} fontSize={fontSize} fontWeight={800} textAnchor={hang.side > 0 ? 'start' : 'end'}>
							{wheel.hang.label}
						</text>
					</g>
				);
			})}
			{/* Turn counters with their direction. */}
			<Part id="counts">
				{(look) => (
					<g opacity={counts * look.opacity}>
						{visual.wheels.map((wheel, index) => {
							const sharesAxle = visual.wheels.some((other, j) => j !== index && Math.hypot(train[j].x - train[index].x, train[j].y - train[index].y) < 1e-6 && (other.radius > wheel.radius || (other.radius === wheel.radius && j < index)));
							if (sharesAxle) return null;
							const [cx, cy] = at(train[index].x, train[index].y);
							const turned = Math.abs(train[index].turns * visual.turns * progress);
							const clockwise = train[index].turns > 0;
							const [ax, ay] = [cx, cy + wheel.radius * unit + u(26)];
							return (
								<g key={index}>
									<text x={ax} y={ay + fontSize} fill={palette.ink} fontSize={fontSize} fontWeight={800} textAnchor="middle">
										{`${clockwise ? '↻' : '↺'} ${format(turned)} tur`}
									</text>
								</g>
							);
						})}
					</g>
				)}
			</Part>
		</svg>
	);
};
