import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useBeatStartFor} from '../VisualTimeline';
import {arrowHead} from './ArrowHead';

type Projectile = Extract<CourseVisual, {kind: 'projectile'}>;

/** The stage (CourseVisual keeps this ratio). */
export const PROJECTILE_STAGE = {width: 1600, height: 900};

/**
 * A throw from height h with speed v₀ at `angle` degrees above the horizontal (negative: below): the components,
 * the time of flight to the ground (or `time` when there is none), the top of the path and the range.
 * x = vₓt, y = h + vᵧt − ½gt².
 */
export const projectilePath = (visual: Pick<Projectile, 'v0' | 'angle' | 'height' | 'g' | 'ground' | 'time'>) => {
	const angle = (visual.angle * Math.PI) / 180;
	const vx = visual.v0 * Math.cos(angle);
	const vy = visual.v0 * Math.sin(angle);
	const flight = visual.ground ? (vy + Math.sqrt(vy * vy + 2 * visual.g * visual.height)) / visual.g : (visual.time ?? ((2 * Math.max(vy, 0)) / visual.g || 1));
	const apexTime = Math.max(0, Math.min(flight, vy / visual.g));
	const at = (t: number) => ({x: vx * t, y: visual.height + vy * t - 0.5 * visual.g * t * t, vx, vy: vy - visual.g * t});
	return {vx, vy, flight, apexTime, top: at(apexTime).y, range: vx * flight, at};
};

const format = (value: number) => (Math.round(value * 100) / 100).toString().replace('.', ',').replace(/^-/, '−');

/**
 * A throw drawn as it happens: the body leaves its trail, its velocity arrow turns as it flies, and its two
 * components are drawn from it: the horizontal one never changes, the vertical one shrinks, vanishes at the top and
 * grows downwards. Ghost positions at equal times show equal horizontal steps. At the end the top of the path and
 * the range are measured. Beats point at `body`, `components`, `strobe`, `apex`, `range` and `run`.
 */
export const ProjectileVisual: React.FC<VisualBoxProps & {visual: Projectile}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const k = Math.min(width / PROJECTILE_STAGE.width, height / PROJECTILE_STAGE.height);
	const ox = (width - PROJECTILE_STAGE.width * k) / 2;
	const oy = (height - PROJECTILE_STAGE.height * k) / 2;
	const path = projectilePath(visual);
	const appear = useReveal(delaySeconds, 0.5);
	const runStart = useBeatStartFor('run', 'show') ?? delaySeconds + 1;
	const progress = visual.motion ? Math.max(0, Math.min(1, (seconds - runStart) / visual.duration)) : 1;
	const t = path.flight * progress;
	// A still figure (a question's) shows the whole path with the body at the start and its first velocity.
	const now = path.at(visual.motion ? t : 0);
	const arrows = visual.motion ? progress < 1 || !visual.ground : true;
	const marksAt = useBeatStartFor('apex', 'show');
	const rangeAt = useBeatStartFor('range', 'show');
	const apexIn = visual.marks ? (marksAt === undefined ? (progress >= 1 ? easeFrom(seconds, runStart + visual.duration, 0.5) : 0) : easeFrom(seconds, marksAt, 0.5)) : 0;
	// A straight-up throw has no range worth measuring.
	const rangeIn = visual.marks && visual.ground && path.range > 1e-3 ? (rangeAt === undefined ? apexIn : easeFrom(seconds, rangeAt, 0.5)) : 0;
	const fontSize = 48;

	// The world: from the launch to the landing, ground to the top, one scale on both axes.
	const xMax = Math.max(path.range, 1e-6);
	const yMin = Math.min(0, path.at(path.flight).y);
	const yMax = Math.max(path.top, visual.height, 1e-6);
	const area = {left: 170, top: 120, width: 1300, height: 640};
	const scale = Math.min(area.width / xMax, area.height / (yMax - yMin));
	// Centred in the area: a straight-up throw stands in the middle, not on the left edge.
	const px = (x: number) => area.left + (area.width - xMax * scale) / 2 + x * scale;
	const py = (y: number) => area.top + area.height - (area.height - (yMax - yMin) * scale) / 2 - (y - yMin) * scale;
	const samples = 80;
	const trail = Array.from({length: samples + 1}, (_, index) => path.at((t * index) / samples)).map((point) => `${px(point.x)},${py(point.y)}`).join(' ');
	const ghosts = visual.strobe > 0 ? Array.from({length: visual.strobe + 1}, (_, index) => (path.flight * index) / visual.strobe).filter((time) => time <= t + 1e-9) : [];
	// Velocity arrows: the fastest speed of the flight gets 220 units.
	const fastest = Math.max(visual.v0, Math.hypot(path.vx, path.vy - visual.g * path.flight));
	const unit = 220 / Math.max(1e-9, fastest);
	const [bx, by] = [px(now.x), py(now.y)];
	// Labels stay apart: the speed beyond the arrow's tip, vx under its arrow, vy left of its arrow; a short arrow
	// (a component near zero) keeps no label.
	const arrow = (dx: number, dy: number, colour: string, label: string, place: 'tip' | 'below' | 'left') => {
		const length = Math.hypot(dx, dy);
		if (length < 6) return null;
		const angle = Math.atan2(dy, dx);
		const [ex, ey] = [bx + dx, by + dy];
		const spot =
			place === 'tip'
				? {x: ex + Math.cos(angle) * 30 + 10, y: ey + Math.sin(angle) * 30 + fontSize * 0.3, anchor: Math.cos(angle) >= 0 ? 'start' : 'end'}
				: place === 'below'
					? {x: bx + dx / 2, y: by + fontSize * 1.05, anchor: 'middle'}
					: {x: bx - 22, y: by + dy / 2 + fontSize * 0.3, anchor: 'end'};
		return (
			<g>
				<line x1={bx} y1={by} x2={ex - Math.cos(angle) * 18} y2={ey - Math.sin(angle) * 18} stroke={colour} strokeWidth={10} strokeLinecap="round" />
				<path d={arrowHead(ex, ey, angle, 30)} fill={colour} />
				{length > 50 ? (
					<text x={spot.x} y={spot.y} fill={palette.ink} fontSize={fontSize * 0.75} fontWeight={800} textAnchor={spot.anchor as 'start' | 'end' | 'middle'} stroke={palette.surface} strokeWidth={8} paintOrder="stroke">
						{label}
					</text>
				) : null}
			</g>
		);
	};

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<g transform={`translate(${ox} ${oy}) scale(${k})`}>
				<g opacity={appear}>
					{visual.ground ? <line x1={Math.min(px(0) - 160, area.left)} y1={py(0)} x2={Math.max(px(xMax) + 80, area.left + area.width)} y2={py(0)} stroke={palette.ink} strokeWidth={8} /> : null}
					{/* A launch from a height stands on a block whose right edge is the launch point. */}
					{visual.height > 0 ? <rect x={px(0) - 140} y={py(visual.height)} width={140} height={py(0) - py(visual.height)} fill={palette.fill} stroke={palette.ink} strokeWidth={5} /> : null}
					{visual.height > 0 ? (
						<text x={px(0) - 70} y={(py(0) + py(visual.height)) / 2 + fontSize * 0.3} fill={palette.ink} fontSize={fontSize * 0.75} fontWeight={800} textAnchor="middle">
							{`${format(visual.height)} m`}
						</text>
					) : null}
				</g>
				<Part id="path">
					{(look) => <polyline points={trail} fill="none" stroke={palette.lesson} strokeWidth={6} strokeDasharray="4 12" strokeLinecap="round" opacity={appear * look.opacity} />}
				</Part>
				<Part id="strobe">
					{(look) => (
						<g opacity={appear * look.opacity}>
							{ghosts.map((time) => {
								const ghost = path.at(time);
								return (
									<g key={time}>
										<circle cx={px(ghost.x)} cy={py(ghost.y)} r={16} fill={palette.lesson} fillOpacity={0.35} />
										{visual.ground ? <line x1={px(ghost.x)} y1={py(ghost.y) + 18} x2={px(ghost.x)} y2={py(0)} stroke={palette.grid} strokeWidth={3} strokeDasharray="8 8" /> : null}
									</g>
								);
							})}
						</g>
					)}
				</Part>
				<Part id="apex">
					{(look) =>
						path.apexTime > 0 && path.top > visual.height ? (
							<g opacity={apexIn * look.opacity}>
								<line x1={px(path.at(path.apexTime).x)} y1={py(path.top)} x2={px(path.at(path.apexTime).x)} y2={py(0)} stroke={palette.brand} strokeWidth={4} strokeDasharray="12 10" />
								<text x={px(path.at(path.apexTime).x) + 16} y={(py(path.top) + py(0)) / 2} fill={palette.ink} fontSize={fontSize * 0.8} fontWeight={800}>
									{`h = ${format(path.top)} m`}
								</text>
							</g>
						) : null
					}
				</Part>
				<Part id="range">
					{(look) => (
						<g opacity={rangeIn * look.opacity}>
							<line x1={px(0)} y1={py(0) + 40} x2={px(path.range)} y2={py(0) + 40} stroke={palette.brand} strokeWidth={5} />
							<line x1={px(0)} y1={py(0) + 26} x2={px(0)} y2={py(0) + 54} stroke={palette.brand} strokeWidth={5} />
							<line x1={px(path.range)} y1={py(0) + 26} x2={px(path.range)} y2={py(0) + 54} stroke={palette.brand} strokeWidth={5} />
							<text x={(px(0) + px(path.range)) / 2} y={py(0) + 40 + fontSize} fill={palette.ink} fontSize={fontSize * 0.8} fontWeight={800} textAnchor="middle">
								{`${visual.rangeLabel} = ${format(path.range)} m`}
							</text>
						</g>
					)}
				</Part>
				<Part id="body">
					{(look) => (
						<g opacity={appear * look.opacity}>
							<circle cx={bx} cy={by} r={24 * look.scale} fill={palette.brand} stroke={palette.ink} strokeWidth={5} />
							{arrows ? arrow(now.vx * unit, -now.vy * unit, palette.ink, `${format(Math.hypot(now.vx, now.vy))} m/s`, 'tip') : null}
						</g>
					)}
				</Part>
				<Part id="components">
					{(look) =>
						visual.components && arrows ? (
							<g opacity={appear * look.opacity}>
								{arrow(now.vx * unit, 0, palette.lesson, `vx = ${format(now.vx)}`, 'below')}
								{arrow(0, -now.vy * unit, palette.lessonDeep, `vy = ${format(now.vy)}`, 'left')}
							</g>
						) : null
					}
				</Part>
			</g>
		</svg>
	);
};
