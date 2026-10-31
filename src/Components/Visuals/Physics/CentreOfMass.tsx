import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {type LabelBox, placeLabel, pointSpots, textWidth} from '../Mathematics/FigureLabel';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useBeatStartFor, useShownAt} from '../VisualTimeline';
import {arrowHead} from './ArrowHead';
import {bodyCentre, systemCentres} from './BodyCentre';

type CentreOfMass = Extract<CourseVisual, {kind: 'centreOfMass'}>;

const format = (value: number) => (Math.round(value * 100) / 100).toString().replace('.', ',');

/** Seconds the centre takes to move on to the next body's pull. */
const STEP = 0.8;

/**
 * Point masses, rods and plates on a square grid, and their centre of mass. The bodies come in one by one, each
 * with its own centre (a rod's middle, a plate's centroid; a point is its own). Then the system's centre appears on
 * the first body and slides as each further body is counted, pulled towards the heavier and away from a cut-out,
 * leaving a faint trail; at the end dashed lines read its coordinates off the axes.
 */
export const CentreOfMassVisual: React.FC<VisualBoxProps & {visual: CentreOfMass}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const seconds = useSceneSeconds();
	const [minX, minY, maxX, maxY] = visual.view;
	const margin = u(48);
	const unit = Math.min((width - 2 * margin) / (maxX - minX), (height - 2 * margin) / (maxY - minY));
	const left = (width - unit * (maxX - minX)) / 2;
	const top = (height - unit * (maxY - minY)) / 2;
	const at = ([x, y]: readonly [number, number]): [number, number] => [left + (x - minX) * unit, top + (maxY - y) * unit];
	const grid = useReveal(delaySeconds, 0.5);
	const fontSize = u(32);
	const centres = visual.bodies.map(bodyCentre);
	const running = systemCentres(visual.bodies);
	const heaviest = Math.max(...visual.bodies.map((body) => (body.kind === 'point' ? body.mass : 0)), 1e-9);
	const radiusOf = (mass: number) => Math.max(u(14), unit * (0.14 + 0.2 * Math.sqrt(mass / heaviest)));
	// Rods: thicker for more mass per length, and neighbours in two tones so rods joined end to end read as two.
	const densityOf = (body: CentreOfMass['bodies'][number]) => (body.kind === 'rod' ? body.mass / Math.max(1e-9, Math.hypot(body.to[0] - body.from[0], body.to[1] - body.from[1])) : 0);
	const densest = Math.max(...visual.bodies.map(densityOf), 1e-9);
	// Hooks run once per body on every frame: the count is fixed by the visual.
	const shown = visual.bodies.map((_, index) => easeFrom(seconds, useShownAt(`b${index + 1}`) ?? delaySeconds + 0.4 + index * 0.5, 0.5));
	const centreStart = useBeatStartFor('centre', 'show') ?? delaySeconds + 0.6 + visual.bodies.length * 0.5;
	const slideSeconds = STEP * (visual.bodies.length - 1);
	const coordinatesStart = useBeatStartFor('coordinates', 'show') ?? centreStart + 0.4 + slideSeconds + 0.3;
	const appear = easeFrom(seconds, centreStart, 0.4);
	// Where the centre is now: it starts on the first body and moves through each running centre in turn.
	const progress = Math.max(0, Math.min(visual.bodies.length - 1, (seconds - centreStart - 0.4) / STEP));
	const step = Math.floor(progress);
	const within = easeFrom(progress - step, 0, 1);
	const from = running[Math.min(step, running.length - 1)].at;
	const to = running[Math.min(step + 1, running.length - 1)].at;
	const now = at([from[0] + (to[0] - from[0]) * within, from[1] + (to[1] - from[1]) * within]);
	const trail = [...running.slice(0, step + 1).map((entry) => at(entry.at)), now];
	const final = running[running.length - 1].at;
	const read = easeFrom(seconds, coordinatesStart, 0.6);

	// Labels: beside each point mass or inside each plate, then the centre's, kept off the bodies and each other.
	// The centre's path counts too: a label must not sit where the centre will slide over it.
	const path: [number, number][] = visual.centre ? running.slice(1).flatMap((entry, index) => Array.from({length: 9}, (_, share) => at([running[index].at[0] + ((entry.at[0] - running[index].at[0]) * share) / 8, running[index].at[1] + ((entry.at[1] - running[index].at[1]) * share) / 8]))) : [];
	const obstacles: [number, number][] = [...path, at(final), ...visual.bodies.flatMap((body) => (body.kind === 'point' ? [at(body.at)] : body.kind === 'rod' ? [at(body.from), at(body.to), at(bodyCentre(body).at)] : body.corners.map((corner) => at(corner))))];
	const bounds: LabelBox = [0, 0, width, height];
	const taken: LabelBox[] = [];
	const labels = visual.bodies.map((body, index) => {
		if (!body.label) return null;
		const centre = at(centres[index].at);
		const gap = body.kind === 'point' ? radiusOf(body.mass) + u(6) : u(14);
		const place = placeLabel(pointSpots(centre, textWidth(body.label, fontSize), fontSize, gap), obstacles, taken, bounds);
		taken.push(place);
		return place;
	});
	const centreText = visual.coordinates ? `KM (${format(final[0])} ; ${format(final[1])})` : 'KM';
	const centreLabel = placeLabel(pointSpots(at(final), textWidth(centreText, fontSize), fontSize, u(26)), obstacles, taken, bounds);

	const xs = Array.from({length: Math.floor(maxX) - Math.ceil(minX) + 1}, (_, index) => Math.ceil(minX) + index);
	const ys = Array.from({length: Math.floor(maxY) - Math.ceil(minY) + 1}, (_, index) => Math.ceil(minY) + index);
	const tickEvery = Math.max(maxX - minX, maxY - minY) > 10 ? 2 : 1;
	const axisX = Math.min(maxY, Math.max(minY, 0));
	const axisY = Math.min(maxX, Math.max(minX, 0));
	const halo = {stroke: palette.surface, strokeWidth: u(7), paintOrder: 'stroke' as const};
	const cross = ([cx, cy]: [number, number], size: number, colour: string, opacity: number) => (
		<g opacity={opacity} stroke={colour} strokeWidth={u(4)} strokeLinecap="round">
			<line x1={cx - size} y1={cy - size} x2={cx + size} y2={cy + size} />
			<line x1={cx - size} y1={cy + size} x2={cx + size} y2={cy - size} />
		</g>
	);

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontBody}}>
			<g opacity={grid} stroke={palette.grid} strokeWidth={u(2)}>
				{xs.map((x) => (
					<line key={`x${x}`} x1={at([x, minY])[0]} x2={at([x, maxY])[0]} y1={at([x, minY])[1]} y2={at([x, maxY])[1]} />
				))}
				{ys.map((y) => (
					<line key={`y${y}`} x1={at([minX, y])[0]} x2={at([maxX, y])[0]} y1={at([minX, y])[1]} y2={at([maxX, y])[1]} />
				))}
			</g>
			{visual.axes ? (
				<g opacity={grid}>
					<line x1={at([minX, axisX])[0]} y1={at([minX, axisX])[1]} x2={at([maxX, axisX])[0]} y2={at([maxX, axisX])[1]} stroke={palette.axis} strokeWidth={u(4)} />
					<line x1={at([axisY, minY])[0]} y1={at([axisY, minY])[1]} x2={at([axisY, maxY])[0]} y2={at([axisY, maxY])[1]} stroke={palette.axis} strokeWidth={u(4)} />
					<path d={arrowHead(at([maxX, axisX])[0] + u(14), at([maxX, axisX])[1], 0, u(20))} fill={palette.axis} />
					<path d={arrowHead(at([axisY, maxY])[0], at([axisY, maxY])[1] - u(14), -Math.PI / 2, u(20))} fill={palette.axis} />
					<text x={at([maxX, axisX])[0] + u(30)} y={at([maxX, axisX])[1] + fontSize * 0.35} fill={palette.muted} fontSize={fontSize} fontWeight={700}>
						x
					</text>
					<text x={at([axisY, maxY])[0] + u(14)} y={at([axisY, maxY])[1] - u(16)} fill={palette.muted} fontSize={fontSize} fontWeight={700}>
						y
					</text>
					{xs
						.filter((x) => x !== axisY && x % tickEvery === 0)
						.map((x) => (
							<text key={`tx${x}`} x={at([x, axisX])[0]} y={at([x, axisX])[1] + fontSize * 1.05} fill={palette.muted} fontSize={fontSize * 0.8} textAnchor="middle">
								{x}
							</text>
						))}
					{ys
						.filter((y) => y !== axisX && y % tickEvery === 0)
						.map((y) => (
							<text key={`ty${y}`} x={at([axisY, y])[0] - u(12)} y={at([axisY, y])[1] + fontSize * 0.3} fill={palette.muted} fontSize={fontSize * 0.8} textAnchor="end">
								{y}
							</text>
						))}
				</g>
			) : null}
			{visual.bodies.map((body, index) => (
				<Part key={index} id={`b${index + 1}`}>
					{(look) => {
						const grow = shown[index];
						const centre = at(centres[index].at);
						const label = labels[index];
						const text = label ? (
							<text x={(label[0] + label[2]) / 2} y={label[3] - fontSize * 0.2} textAnchor="middle" fill={palette.ink} fontSize={fontSize} fontWeight={800} {...halo}>
								{body.label}
							</text>
						) : null;
						if (body.kind === 'point') {
							return (
								<g opacity={Math.min(1, grow * 1.5) * look.opacity}>
									<circle cx={centre[0]} cy={centre[1]} r={radiusOf(body.mass) * grow * look.scale} fill={palette.lesson} stroke={palette.ink} strokeWidth={u(3)} />
									{text}
								</g>
							);
						}
						if (body.kind === 'rod') {
							const [a, b] = [at(body.from), at(body.to)];
							return (
								<g opacity={look.opacity}>
									<line x1={a[0]} y1={a[1]} x2={a[0] + (b[0] - a[0]) * grow} y2={a[1] + (b[1] - a[1]) * grow} stroke={index % 2 === 0 ? palette.lesson : palette.lessonDeep} strokeWidth={Math.max(u(10), unit * (0.12 + 0.18 * Math.sqrt(densityOf(body) / densest))) * look.scale} strokeLinecap="butt" />
									{cross(centre, u(10), palette.ink, grow)}
									<g opacity={grow}>{text}</g>
								</g>
							);
						}
						const corners = body.corners.map((corner) => at(corner).join(' ')).join(' L');
						return (
							<g opacity={look.opacity}>
								<path
									d={`M${corners} Z`}
									fill={body.removed ? palette.surface : palette.fill}
									fillOpacity={grow}
									stroke={body.removed ? palette.muted : palette.lesson}
									strokeOpacity={grow}
									strokeWidth={u(4) * look.scale}
									strokeDasharray={body.removed ? `${u(12)} ${u(9)}` : undefined}
									strokeLinejoin="round"
								/>
								{cross(centre, u(10), body.removed ? palette.muted : palette.ink, grow)}
								<g opacity={grow}>{text}</g>
							</g>
						);
					}}
				</Part>
			))}
			{visual.centre ? (
				<>
					<Part id="coordinates">
						{(look) => (
							<g opacity={(visual.coordinates ? read : 0) * look.opacity}>
								<line x1={at(final)[0]} y1={at(final)[1]} x2={at([final[0], axisX])[0]} y2={at([final[0], axisX])[1]} stroke={palette.brand} strokeWidth={u(3)} strokeDasharray={`${u(10)} ${u(8)}`} />
								<line x1={at(final)[0]} y1={at(final)[1]} x2={at([axisY, final[1]])[0]} y2={at([axisY, final[1]])[1]} stroke={palette.brand} strokeWidth={u(3)} strokeDasharray={`${u(10)} ${u(8)}`} />
								<circle cx={at([final[0], axisX])[0]} cy={at([final[0], axisX])[1]} r={u(7)} fill={palette.brand} />
								<circle cx={at([axisY, final[1]])[0]} cy={at([axisY, final[1]])[1]} r={u(7)} fill={palette.brand} />
							</g>
						)}
					</Part>
					<Part id="centre">
						{(look) => (
							<g opacity={appear * look.opacity}>
								{trail.length > 1 ? <polyline points={trail.map((point) => point.join(',')).join(' ')} fill="none" stroke={palette.brand} strokeOpacity={0.45} strokeWidth={u(4)} strokeDasharray={`${u(6)} ${u(8)}`} /> : null}
								<circle cx={now[0]} cy={now[1]} r={u(19) * look.scale} fill={palette.brand} stroke={palette.surface} strokeWidth={u(4)} />
								<circle cx={now[0]} cy={now[1]} r={u(6)} fill={palette.surface} />
								<text x={(centreLabel[0] + centreLabel[2]) / 2} y={centreLabel[3] - fontSize * 0.2} textAnchor="middle" fill={palette.ink} fontSize={fontSize} fontWeight={800} opacity={progress >= visual.bodies.length - 1 ? 1 : 0} {...halo}>
									{read > 0 || !visual.coordinates ? centreText : 'KM'}
								</text>
							</g>
						)}
					</Part>
				</>
			) : null}
		</svg>
	);
};
