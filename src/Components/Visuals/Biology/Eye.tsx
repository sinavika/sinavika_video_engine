import React from 'react';
import {clamp01, smoothStep} from '../../../Animations/Motion';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useBeatStartFor} from '../VisualTimeline';

type Eye = Extract<CourseVisual, {kind: 'eye'}>;

/** The stage (CourseVisual keeps this ratio). */
export const EYE_STAGE = {width: 1600, height: 820};

const AXIS = 410;
const BALL = {cx: 900, cy: AXIS, r: 300};
const LENS_X = 690;
const GLASSES_X = 420;
const RETINA_X = BALL.cx + BALL.r;
const RAY_HEIGHTS = [-90, -45, 0, 45, 90];

/** Where a ray leaving (x, y) towards (tx, ty) meets the back of the eyeball (the retina). */
export const retinaHit = (x: number, y: number, tx: number, ty: number): {x: number; y: number} => {
	const [dx, dy] = [tx - x, ty - y];
	const [fx, fy] = [x - BALL.cx, y - BALL.cy];
	const a = dx * dx + dy * dy;
	const b = 2 * (fx * dx + fy * dy);
	const c = fx * fx + fy * fy - BALL.r * BALL.r;
	const t = (-b + Math.sqrt(Math.max(0, b * b - 4 * a * c))) / (2 * a);
	return {x: x + dx * t, y: y + dy * t};
};

/** Where the eye brings parallel light to a focus: on the retina, in front of it (myopia) or behind it (hypermetropia). */
export const focusX = (mode: 'normal' | 'myopia' | 'hyperopia'): number => (mode === 'myopia' ? RETINA_X - 130 : mode === 'hyperopia' ? RETINA_X + 140 : RETINA_X);

const ease = (value: number) => smoothStep(clamp01(value));

/**
 * The eye as an optical instrument. Light enters through the cornea, the lens bends it and it focuses on the retina
 * (the yellow spot). `normal`: distant light focuses on the retina; with `near`, light from a near point would focus
 * behind it until the lens thickens (accommodation) on the beat that shows `near`. `myopia`: the focus falls in
 * front of the retina, `hyperopia` behind it, and the retina gets a blurred spot; on the beat that shows `glasses` a
 * diverging (myopia) or converging (hyperopia) lens moves the focus onto the retina. Parts: eye, lens, retina, rays,
 * focus, glasses, near, run.
 */
export const EyeVisual: React.FC<VisualBoxProps & {visual: Eye}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const k = Math.min(width / EYE_STAGE.width, height / EYE_STAGE.height);
	const ox = (width - EYE_STAGE.width * k) / 2;
	const oy = (height - EYE_STAGE.height * k) / 2;
	const appear = useReveal(delaySeconds, 0.5);
	const runStart = useBeatStartFor('run', 'show') ?? delaySeconds + 0.8;
	const glassesAt = useBeatStartFor('glasses', 'show');
	const nearAt = useBeatStartFor('near', 'show');
	const fontSize = Math.max(60, 28 / k);
	const text = (x: number, y: number, value: string, anchor: 'start' | 'middle' | 'end' = 'middle', size = fontSize * 0.75) => (
		<text x={x} y={y} fill={palette.ink} fontSize={size} fontWeight={800} textAnchor={anchor} dominantBaseline="central" stroke={palette.surface} strokeWidth={8} paintOrder="stroke">
			{value}
		</text>
	);
	const draw = visual.motion ? ease((seconds - runStart) / 1.4) : 1;
	const corrected = visual.mode !== 'normal' && glassesAt !== undefined ? (visual.motion ? ease((seconds - glassesAt) / 1) : 1) : 0;
	const accommodated = visual.mode === 'normal' && visual.near && nearAt !== undefined ? (visual.motion ? ease((seconds - nearAt - 0.8) / 1.4) : 1) : 0;
	const nearSource = visual.mode === 'normal' && visual.near && nearAt !== undefined && seconds >= nearAt;
	const lensWidth = 34 + 26 * accommodated;
	// The focus: for a near object the relaxed lens focuses behind the retina, the thickened one on it.
	const relaxedFocus = nearSource ? RETINA_X + 150 : focusX(visual.mode);
	const focus = relaxedFocus + (RETINA_X - relaxedFocus) * Math.max(corrected, accommodated);
	const glassesLabel = visual.glassesLabel ?? (visual.mode === 'myopia' ? 'Kalın kenarlı mercek' : 'İnce kenarlı mercek');

	// Each ray: where it starts, where it crosses the eye's lens (heights spread by the glasses), then on to the focus and the retina.
	const rays = RAY_HEIGHTS.map((h) => {
		const spread = visual.mode === 'myopia' ? 1 + 0.35 * corrected : visual.mode === 'hyperopia' ? 1 - 0.25 * corrected : 1;
		const lensY = AXIS + h * spread;
		const start = nearSource ? {x: 300, y: AXIS} : {x: 60, y: AXIS + h};
		const glasses = {x: GLASSES_X, y: nearSource ? AXIS + (h * (GLASSES_X - 300)) / (LENS_X - 300) : AXIS + h};
		const hit = retinaHit(LENS_X, lensY, focus, AXIS);
		return {start, glasses, lens: {x: LENS_X, y: lensY}, hit, h};
	});
	const hits = rays.map((ray) => ray.hit.y);
	const blur = Math.max(...hits) - Math.min(...hits);
	const path = (points: {x: number; y: number}[]) => points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ');

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
				<Part id="eye">
					{(look) => (
						<g opacity={look.opacity}>
							<circle cx={BALL.cx} cy={BALL.cy} r={BALL.r} fill={palette.fill} stroke={palette.ink} strokeWidth={6} />
							{/* Cornea: the clear bulge at the front. */}
							<path d={`M 632 ${AXIS - 130} Q 560 ${AXIS} 632 ${AXIS + 130}`} fill={palette.surface} stroke={palette.ink} strokeWidth={6} />
							{/* Optic nerve leaving the back, a little below the yellow spot. */}
							<path d={`M ${RETINA_X - 12} ${AXIS + 60} L 1440 ${AXIS + 90} L 1440 ${AXIS + 140} L ${RETINA_X - 22} ${AXIS + 112} Z`} fill={palette.lessonDeep} opacity={0.85} />
							{text(570, AXIS - 215, visual.corneaLabel, 'end')}
							{text(1330, AXIS + 205, visual.nerveLabel)}
						</g>
					)}
				</Part>
				<Part id="retina">
					{(look) => (
						<g opacity={look.opacity}>
							<path d={`M ${BALL.cx + BALL.r * Math.cos(-1)} ${BALL.cy + BALL.r * Math.sin(-1)} A ${BALL.r} ${BALL.r} 0 0 1 ${BALL.cx + BALL.r * Math.cos(1)} ${BALL.cy + BALL.r * Math.sin(1)}`} fill="none" stroke={palette.lesson} strokeWidth={16} />
							<circle cx={RETINA_X} cy={AXIS} r={14} fill={palette.brand} />
							{text(BALL.cx + BALL.r * Math.cos(-1) + 30, BALL.cy + BALL.r * Math.sin(-1) - 40, visual.retinaLabel, 'start')}
							{text(RETINA_X + 30, AXIS - 30, visual.foveaLabel, 'start')}
						</g>
					)}
				</Part>
				<Part id="lens">
					{(look) => (
						<g opacity={look.opacity}>
							<ellipse cx={LENS_X} cy={AXIS} rx={lensWidth} ry={120} fill={palette.surface} stroke={palette.lessonDeep} strokeWidth={6} />
							{text(LENS_X + 20, AXIS - 175, visual.lensLabel, 'start')}
						</g>
					)}
				</Part>
				<Part id="rays">
					{(look) => (
						<g opacity={look.opacity}>
							{rays.map((ray, index) => {
								const points = [ray.start, ...(corrected > 0 || nearSource ? [ray.glasses] : []), ray.lens, ray.hit];
								return <path key={index} d={path(points)} fill="none" stroke={palette.brand} strokeWidth={5} strokeLinejoin="round" pathLength={1} strokeDasharray={`${draw} 1`} opacity={0.9} />;
							})}
							{nearSource ? <circle cx={300} cy={AXIS} r={14} fill={palette.ink} /> : null}
						</g>
					)}
				</Part>
				<Part id="focus">
					{(look) => (
						<g opacity={look.opacity * draw}>
							{Math.abs(focus - RETINA_X) > 8 && focus < RETINA_X ? <circle cx={focus} cy={AXIS} r={12} fill={palette.ink} /> : null}
							{/* The image on the retina: a sharp point, or a blurred patch when the focus misses it. */}
							{blur > 16 ? (
								<rect x={RETINA_X - 22} y={AXIS - blur / 2} width={44} height={blur} rx={18} fill={palette.ink} opacity={0.35} />
							) : (
								<circle cx={RETINA_X} cy={AXIS} r={18} fill={palette.ink} />
							)}
						</g>
					)}
				</Part>
				{visual.mode !== 'normal' ? (
					<Part id="glasses">
						{(look) =>
							corrected > 0 ? (
								<g opacity={look.opacity * corrected}>
									{visual.mode === 'myopia' ? (
										<path d={`M ${GLASSES_X - 30} ${AXIS - 150} Q ${GLASSES_X} ${AXIS} ${GLASSES_X - 30} ${AXIS + 150} L ${GLASSES_X + 30} ${AXIS + 150} Q ${GLASSES_X} ${AXIS} ${GLASSES_X + 30} ${AXIS - 150} Z`} fill={palette.surface} stroke={palette.ink} strokeWidth={5} />
									) : (
										<path d={`M ${GLASSES_X} ${AXIS - 150} Q ${GLASSES_X + 50} ${AXIS} ${GLASSES_X} ${AXIS + 150} Q ${GLASSES_X - 50} ${AXIS} ${GLASSES_X} ${AXIS - 150} Z`} fill={palette.surface} stroke={palette.ink} strokeWidth={5} />
									)}
									{text(GLASSES_X, AXIS + 210, glassesLabel, 'middle', fontSize * 0.7)}
								</g>
							) : null
						}
					</Part>
				) : null}
			</g>
		</svg>
	);
};
