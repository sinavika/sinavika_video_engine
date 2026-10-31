import React, {useId} from 'react';
import {clamp01, smoothStep} from '../../../Animations/Motion';
import {mixColors} from '../../../Themes/ColorPalette';
import {withAlpha} from '../../../Themes/Theme';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useBeatStartFor} from '../VisualTimeline';

type Cave = Extract<CourseVisual, {kind: 'cave'}>;
type Point = {x: number; y: number};

/** The stage (CourseVisual keeps this ratio). */
export const CAVE_STAGE = {width: 1600, height: 680};

const FLOOR = 600;
const SURFACE = 200;
const CEILING = 250;
/** The wall the prisoners face, drawn flat so the shadows can be seen; its right edge is the plane they fall on. */
const WALL = {left: 70, right: 400, top: 285, bottom: 560};
const WALL_CENTRE = (WALL.left + WALL.right) / 2;
const FIRE: Point = {x: 960, y: 380};
/** Where a carried object rests above the low wall (its centre). */
const OBJECT: Point = {x: 760, y: 400};
const PARAPET = {left: 715, right: 805, top: FLOOR - 140};
const SEATS = [460, 550, 640];
const RAMP = {from: {x: 1040, y: FLOOR}, to: {x: 1320, y: SURFACE}};
const OPENING = {left: 1180, right: RAMP.to.x};
const SUN = {x: 1535, y: 60, r: 28};
const TREE = {x: 1440, y: SURFACE};
const POND = {cx: 1480, cy: SURFACE + 24, rx: 105, ry: 15};
/** How far an object sinks behind the low wall between two carriers. */
const HIDDEN = 150;
/** Every carried shape fits in ±45 × ±41 around its centre. */
const SHAPE_HALF_HEIGHT = 41;

const SHAPES: Record<Cave['objects'][number], string> = {
	vase: 'M -14 -40 L 14 -40 L 10 -30 Q 30 -14 28 8 Q 26 32 0 40 Q -26 32 -28 8 Q -30 -14 -10 -30 Z',
	horse:
		'M -34 -14 Q -10 -22 22 -16 L 36 -38 Q 40 -42 44 -38 L 48 -22 Q 46 -18 40 -19 L 34 -16 L 31 -2 L 31 40 L 24 40 L 22 6 L -22 6 L -24 40 L -31 40 L -33 4 Q -40 -4 -34 -14 Z M -36 -12 Q -46 -4 -44 16 L -40 16 Q -40 0 -33 -8 Z',
	tree: 'M -6 40 L -6 12 Q -38 14 -36 -8 Q -42 -34 -16 -36 Q -2 -46 16 -36 Q 42 -34 36 -8 Q 38 14 6 12 L 6 40 Z',
	bird: 'M -44 -6 Q -22 -34 0 -8 Q 22 -34 44 -6 Q 22 -18 0 6 Q -22 -18 -44 -6 Z',
};

/**
 * The shadow of a point of the carried object at height `y` (the object at OBJECT.x): the fire's light through it
 * meets the wall plane at `y` returned, and the whole shape is enlarged by `scale` (similar triangles).
 */
export const shadowOf = (y: number): {y: number; scale: number} => {
	const scale = (FIRE.x - WALL.right) / (FIRE.x - OBJECT.x);
	return {y: FIRE.y + scale * (y - FIRE.y), scale};
};

/** The wall the shadows fall on and the room a carried shape has at rest. */
export const CAVE_WALL = {...WALL, objectY: OBJECT.y, halfHeight: SHAPE_HALF_HEIGHT};

const PATH: Point[] = [{x: SEATS[2], y: FLOOR}, RAMP.from, RAMP.to, {x: RAMP.to.x + 22, y: SURFACE}];

/** Where the freed prisoner's feet are at `progress` (0 at the seat, 1 outside, by distance walked). */
export const walkerAt = (progress: number): Point => {
	const lengths = PATH.slice(1).map((point, index) => Math.hypot(point.x - PATH[index].x, point.y - PATH[index].y));
	let left = clamp01(progress) * lengths.reduce((sum, length) => sum + length, 0);
	for (let index = 0; index < lengths.length; index++) {
		if (left <= lengths[index] || index === lengths.length - 1) {
			const t = lengths[index] === 0 ? 1 : Math.min(1, left / lengths[index]);
			return {x: PATH[index].x + (PATH[index + 1].x - PATH[index].x) * t, y: PATH[index].y + (PATH[index + 1].y - PATH[index].y) * t};
		}
		left -= lengths[index];
	}
	return PATH[PATH.length - 1];
};

const ease = (value: number) => smoothStep(clamp01(value));
const STAND = 0.8;
const WALK = 6.5;

/**
 * Philosophy: Plato's cave. Chained prisoners face a wall; behind them carriers lift objects over a low wall in front
 * of a fire, one after another, and the fire casts their enlarged shadows on the wall (computed from the fire's
 * position, so the light lines through the object meet the shadow's edges). On the beat that shows `freed` one
 * prisoner stands, is dazzled by the fire, climbs the slope and steps out into the sunlight, where he first sees the
 * tree's reflection in the pond, then the tree and the sun (`outside` false leaves the world outside undrawn). Parts:
 * wall, prisoners, objects, fire, exit, outside, sun, freed.
 */
export const CaveVisual: React.FC<VisualBoxProps & {visual: Cave}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const id = useId().replace(/:/g, '');
	const k = Math.min(width / CAVE_STAGE.width, height / CAVE_STAGE.height);
	const ox = (width - CAVE_STAGE.width * k) / 2;
	const oy = (height - CAVE_STAGE.height * k) / 2;
	const appear = useReveal(delaySeconds, 0.5);
	const freedAt = useBeatStartFor('freed', 'show');
	const fontSize = Math.max(60, 28 / k) * 0.68;
	const text = (x: number, y: number, value: string, anchor: 'start' | 'middle' | 'end' = 'middle') => (
		<text x={x} y={y} fill={palette.ink} fontSize={fontSize} fontWeight={800} textAnchor={anchor} dominantBaseline="central" stroke={palette.surface} strokeWidth={8} paintOrder="stroke">
			{value}
		</text>
	);
	const t = Math.max(0, seconds - delaySeconds);
	const rock = mixColors(palette.surface, palette.lessonDeep, 0.3);
	const hollow = mixColors(palette.surface, palette.ink, 0.12);
	const figure = palette.lessonDeep;

	// The carried object in sight: each one rises over the low wall, stays and sinks again.
	const turn = visual.motion ? t / visual.period : 0.5;
	const shape = SHAPES[visual.objects[Math.floor(turn) % visual.objects.length]];
	const phase = turn - Math.floor(turn);
	const lift = visual.motion ? ease(phase / 0.2) * (1 - ease((phase - 0.8) / 0.2)) : 1;
	const objectY = OBJECT.y + HIDDEN * (1 - lift);
	const shadow = shadowOf(objectY);
	const flicker = visual.motion ? 1 + 0.07 * Math.sin(t * 11) + 0.04 * Math.sin(t * 17 + 1) : 1;

	// The freed prisoner: stands up, walks past the fire, climbs out.
	const freed = freedAt !== undefined || visual.freed;
	const since = freedAt === undefined ? Infinity : seconds - freedAt;
	const standing = !freed ? 0 : visual.motion ? ease(since / STAND) : 1;
	const walk = !freed ? 0 : visual.motion ? clamp01((since - STAND) / WALK) : 1;
	const feet = walkerAt(smoothStep(walk));
	const outsideFor = visual.motion ? since - STAND - WALK : Infinity;
	const nearFire = Math.abs(feet.x - FIRE.x) < 140 && feet.y > FLOOR - 1;
	const dazzled = freed && (nearFire || (outsideFor > -0.3 && outsideFor < 2.2));
	const daylight = freed ? (visual.motion ? ease(outsideFor / 1.5) : 1) : 0;
	const stride = visual.motion && walk > 0 && walk < 1 ? Math.sin(since * 9) : 0;

	const caveShape = `M 50 ${FLOOR} L ${RAMP.from.x} ${FLOOR} L ${RAMP.to.x} ${SURFACE} L ${OPENING.left} ${SURFACE} L 1040 ${CEILING + 30} Q 980 ${CEILING} 880 ${CEILING} L 120 ${CEILING} Q 50 ${CEILING} 50 ${CEILING + 70} Z`;
	const seated = (x: number) => (
		<g stroke={figure} strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" fill="none">
			<circle cx={x} cy={FLOOR - 128} r={24} fill={figure} stroke="none" />
			<path d={`M ${x + 2} ${FLOOR - 98} L ${x + 14} ${FLOOR - 34} L ${x - 40} ${FLOOR - 34} L ${x - 46} ${FLOOR - 4}`} />
			<path d={`M ${x + 4} ${FLOOR - 86} L ${x - 34} ${FLOOR - 40}`} strokeWidth={14} />
		</g>
	);
	const chain = (x: number, broken: boolean) => (
		<g stroke={palette.ink} strokeWidth={5} fill="none" opacity={0.75}>
			<path d={broken ? `M ${x - 74} ${FLOOR} L ${x - 58} ${FLOOR - 6}` : `M ${x - 74} ${FLOOR} L ${x - 46} ${FLOOR - 6}`} strokeDasharray="8 6" />
			<circle cx={x - 76} cy={FLOOR - 2} r={7} />
		</g>
	);

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<defs>
				<radialGradient id={`${id}-glow`} cx={FIRE.x} cy={FIRE.y} r={620} gradientUnits="userSpaceOnUse">
					<stop offset="0" stopColor={palette.brand} stopOpacity={0.34 * flicker} />
					<stop offset="1" stopColor={palette.brand} stopOpacity={0} />
				</radialGradient>
				<clipPath id={`${id}-cave`}>
					<path d={caveShape} />
				</clipPath>
				<clipPath id={`${id}-wall`}>
					<rect x={WALL.left} y={WALL.top} width={WALL.right - WALL.left} height={WALL.bottom - WALL.top} rx={10} />
				</clipPath>
				<clipPath id={`${id}-pond`}>
					<ellipse cx={POND.cx} cy={POND.cy} rx={POND.rx} ry={POND.ry} />
				</clipPath>
				<filter id={`${id}-soft`} x="-20%" y="-20%" width="140%" height="140%">
					<feGaussianBlur stdDeviation={2} />
				</filter>
			</defs>
			<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
				{/* The hill and the ground with the cave hollowed out of it. */}
				<path d={`M 0 150 Q 420 60 900 130 Q 1100 160 ${OPENING.left} ${SURFACE} L ${CAVE_STAGE.width} ${SURFACE} L ${CAVE_STAGE.width} ${CAVE_STAGE.height} L 0 ${CAVE_STAGE.height} Z`} fill={rock} />
				<path d={caveShape} fill={hollow} stroke={palette.ink} strokeWidth={5} strokeLinejoin="round" />
				<rect x={0} y={0} width={CAVE_STAGE.width} height={CAVE_STAGE.height} fill={`url(#${id}-glow)`} clipPath={`url(#${id}-cave)`} />
				<Part id="exit">
					{(look) => (
						<g opacity={look.opacity}>
							<path
								d={`M ${OPENING.left + 6} ${SURFACE + 2} L ${OPENING.right - 4} ${SURFACE + 2} L 1150 ${FLOOR - 160} L 1030 ${FLOOR - 220} Z`}
								fill={withAlpha(palette.brand, 0.1 + 0.1 * daylight)}
								clipPath={`url(#${id}-cave)`}
							/>
							{text(OPENING.left + 10, 95, visual.exitLabel, 'end')}
						</g>
					)}
				</Part>
				<Part id="wall">
					{(look) => (
						<g opacity={look.opacity}>
							<rect
								x={WALL.left}
								y={WALL.top}
								width={WALL.right - WALL.left}
								height={WALL.bottom - WALL.top}
								rx={10}
								fill={mixColors(palette.surface, palette.brand, 0.1)}
								stroke={palette.ink}
								strokeWidth={4}
							/>
							<g clipPath={`url(#${id}-wall)`}>
								<path d={shape} transform={`translate(${WALL_CENTRE} ${shadow.y}) scale(${shadow.scale})`} fill={palette.ink} opacity={0.6} filter={`url(#${id}-soft)`} />
							</g>
							{text(WALL_CENTRE, FLOOR + 40, visual.wallLabel)}
						</g>
					)}
				</Part>
				<Part id="prisoners">
					{(look) => (
						<g opacity={look.opacity}>
							{SEATS.map((x, index) => {
								const leaving = index === SEATS.length - 1 && freed;
								return (
									<g key={x}>
										{chain(x, leaving)}
										<g opacity={leaving ? 1 - standing : 1}>{seated(x)}</g>
									</g>
								);
							})}
							{text(SEATS[1] - 10, FLOOR + 40, visual.prisonersLabel)}
						</g>
					)}
				</Part>
				<Part id="objects">
					{(look) => (
						<g opacity={look.opacity}>
							<line x1={OBJECT.x} y1={objectY + 36} x2={OBJECT.x} y2={PARAPET.top + 40} stroke={palette.ink} strokeWidth={6} />
							<path d={shape} transform={`translate(${OBJECT.x} ${objectY})`} fill={palette.lesson} stroke={palette.ink} strokeWidth={3} />
							<rect x={PARAPET.left} y={PARAPET.top} width={PARAPET.right - PARAPET.left} height={FLOOR - PARAPET.top} fill={rock} stroke={palette.ink} strokeWidth={5} />
							{text(OBJECT.x, FLOOR + 40, visual.objectsLabel)}
						</g>
					)}
				</Part>
				<Part id="fire">
					{(look) => (
						<g opacity={look.opacity}>
							{/* The light from the fire past the object's top and bottom meets the shadow's edges on the wall. */}
							{lift > 0.95
								? [OBJECT.y - SHAPE_HALF_HEIGHT, OBJECT.y + SHAPE_HALF_HEIGHT].map((y) => (
										<line key={y} x1={FIRE.x} y1={FIRE.y} x2={WALL.right} y2={shadowOf(y).y} stroke={palette.brand} strokeWidth={3} strokeDasharray="10 10" opacity={0.6} />
									))
								: null}
							<path d={`M 858 ${FLOOR} L 880 ${FLOOR - 168} Q 960 ${FLOOR - 192} 1012 ${FLOOR - 174} L ${RAMP.from.x} ${FLOOR} Z`} fill={rock} stroke={palette.ink} strokeWidth={5} />
							<path
								d={`M ${FIRE.x - 40} ${FLOOR - 184} L ${FIRE.x + 40} ${FLOOR - 202} M ${FIRE.x - 40} ${FLOOR - 202} L ${FIRE.x + 40} ${FLOOR - 184}`}
								stroke={palette.ink}
								strokeWidth={10}
								strokeLinecap="round"
							/>
							<g transform={`translate(${FIRE.x} ${FLOOR - 192}) scale(${flicker})`}>
								<path d="M -36 0 Q -44 -40 -14 -70 Q -10 -40 0 -36 Q 4 -76 22 -96 Q 26 -56 36 -42 Q 46 -22 36 0 Z" fill={palette.brand} />
								<path d="M -16 0 Q -20 -24 -4 -40 Q 2 -24 8 -22 Q 18 -14 14 0 Z" fill={palette.surface} opacity={0.7} />
							</g>
							{text(FIRE.x + 20, FLOOR + 40, visual.fireLabel)}
						</g>
					)}
				</Part>
				{visual.outside ? (
					<>
						<Part id="outside">
							{(look) => (
								<g opacity={look.opacity}>
									<ellipse cx={POND.cx} cy={POND.cy} rx={POND.rx} ry={POND.ry} fill={mixColors(palette.surface, palette.lesson, 0.35)} stroke={palette.ink} strokeWidth={3} />
									{/* The tree's reflection: upside down in the water, paler. */}
									<g clipPath={`url(#${id}-pond)`} opacity={0.45}>
										<path d={SHAPES.tree} transform={`translate(${TREE.x} ${POND.cy + 4 + 40}) scale(1.3 -0.9)`} fill={palette.lessonDeep} />
									</g>
									<path d={SHAPES.tree} transform={`translate(${TREE.x} ${TREE.y - 52}) scale(1.3)`} fill={palette.lesson} stroke={palette.ink} strokeWidth={3} />
									{visual.outsideLabel ? text(CAVE_STAGE.width - 8, SURFACE + 110, visual.outsideLabel, 'end') : null}
								</g>
							)}
						</Part>
						<Part id="sun">
							{(look) => (
								<g opacity={look.opacity}>
									<circle cx={SUN.x} cy={SUN.y} r={SUN.r * (1.5 + 0.5 * daylight)} fill={palette.brand} opacity={0.15 + 0.2 * daylight} />
									{Array.from({length: 10}, (_, index) => {
										const angle = (index / 10) * Math.PI * 2 + (visual.motion ? t * 0.3 : 0);
										const [inner, outer] = [SUN.r + 8, SUN.r + 20 + 10 * daylight];
										return (
											<line
												key={index}
												x1={SUN.x + inner * Math.cos(angle)}
												y1={SUN.y + inner * Math.sin(angle)}
												x2={SUN.x + outer * Math.cos(angle)}
												y2={SUN.y + outer * Math.sin(angle)}
												stroke={palette.brand}
												strokeWidth={6}
												strokeLinecap="round"
											/>
										);
									})}
									<circle cx={SUN.x} cy={SUN.y} r={SUN.r} fill={palette.brand} />
									{text(SUN.x - SUN.r - 30, 30, visual.sunLabel, 'end')}
								</g>
							)}
						</Part>
					</>
				) : null}
				{freed ? (
					<Part id="freed">
						{(look) => (
							<g opacity={look.opacity * standing}>
								<g stroke={figure} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" fill="none">
									<circle cx={feet.x} cy={feet.y - 118} r={22} fill={figure} stroke="none" />
									<path d={`M ${feet.x} ${feet.y - 94} L ${feet.x} ${feet.y - 48}`} />
									<path d={`M ${feet.x + 18 * stride} ${feet.y} L ${feet.x} ${feet.y - 48} L ${feet.x - 18 * stride} ${feet.y}`} />
									<path d={`M ${feet.x - 16 * stride} ${feet.y - 52} L ${feet.x} ${feet.y - 86} L ${feet.x + (dazzled ? 26 : 16 * stride)} ${dazzled ? feet.y - 124 : feet.y - 52}`} strokeWidth={12} />
								</g>
								{dazzled
									? Array.from({length: 6}, (_, index) => {
											const angle = -Math.PI / 2 + ((index - 2.5) / 6) * Math.PI;
											return (
												<line
													key={index}
													x1={feet.x + 34 * Math.cos(angle)}
													y1={feet.y - 118 + 34 * Math.sin(angle)}
													x2={feet.x + 54 * Math.cos(angle)}
													y2={feet.y - 118 + 54 * Math.sin(angle)}
													stroke={palette.brand}
													strokeWidth={5}
													strokeLinecap="round"
												/>
											);
										})
									: null}
							</g>
						)}
					</Part>
				) : null}
			</g>
		</svg>
	);
};
