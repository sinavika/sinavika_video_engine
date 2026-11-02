import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useBeatStartFor, useShownAt} from '../VisualTimeline';
import {arrowHead} from './ArrowHead';

type Lever = Extract<CourseVisual, {kind: 'lever'}>;
type LeverForce = Lever['forces'][number];

/** The lever's stage: wide, so a long rod and its labels fit (CourseVisual keeps this ratio). */
export const LEVER_STAGE = {width: 1440, height: 720};

/**
 * The colour of a force's arrow: by the way its torque turns the rod (anticlockwise brand, clockwise lesson) only when
 * the figure tells the torques or the verdict; otherwise every force in one colour. Coloured by turn, a question's
 * figure ("Hangi kuvvet çubuğu saat yönünde döndürür?") gave its answer away (Soru revizyonu, 2 Nov 2026).
 */
export const forceTone = (torque: number, reveals: boolean): 'brand' | 'lesson' => (reveals && torque > 0 ? 'brand' : 'lesson');

const radians = (degrees: number) => (degrees * Math.PI) / 180;

/**
 * Each force's torque about the pivot (anticlockwise positive: a downward force right of the pivot turns the rod
 * clockwise), only its part across the rod counting (F · sin of its angle), the rod's own weight included at its
 * middle or at `weightAt`, their sums each way, and how far the rod tilts: level when the torques cancel, otherwise up
 * to 9° towards the winning side, more the larger the imbalance.
 */
export const leverBalance = (lever: Pick<Lever, 'pivot' | 'forces' | 'weight' | 'length'> & {weightAt?: number}) => {
	const loads = [
		...lever.forces.map((force) => ({at: force.at, value: force.value * (force.angle === undefined ? 1 : Math.sin(radians(force.angle))), direction: force.direction})),
		...(lever.weight ? [{at: lever.weightAt ?? lever.length / 2, value: lever.weight, direction: 'down' as const}] : []),
	];
	const torques = loads.map((load) => (load.at - lever.pivot) * (load.direction === 'up' ? load.value : -load.value));
	const anticlockwise = torques.filter((torque) => torque > 0).reduce((sum, torque) => sum + torque, 0);
	const clockwise = -torques.filter((torque) => torque < 0).reduce((sum, torque) => sum + torque, 0);
	const net = anticlockwise - clockwise;
	const scale = Math.max(anticlockwise, clockwise, 1e-9);
	const balanced = Math.abs(net) <= scale * 1e-9;
	// Screen degrees: positive turns the rod clockwise on screen.
	const tilt = balanced ? 0 : -Math.sign(net) * Math.min(9, 3 + 6 * (Math.abs(net) / scale));
	return {torques: torques.slice(0, lever.forces.length), weightTorque: lever.weight ? torques[torques.length - 1] : 0, anticlockwise, clockwise, net, balanced, tilt};
};

/**
 * A force's line on screen (radians from the screen's x axis, y down) for a rod turned by `tilt`: the rod's own
 * direction turned by the force's angle, up or down; straight up or down when it has no angle.
 */
export const forceLine = (force: Pick<LeverForce, 'angle' | 'direction'>, tilt: number): number => tilt + (force.direction === 'up' ? -1 : 1) * radians(force.angle ?? 90);

/**
 * The arc marking a force's angle with the rod: from the rod's side the force leans to (its right end below 90°, its
 * left end above) round to the force's line, and the angle it shows (the smaller one, 30° for a rope at 150°).
 */
export const angleArc = (angle: number, line: number, tilt: number): {from: number; to: number; degrees: number} => ({from: angle <= 90 ? tilt : tilt + Math.PI, to: line, degrees: Math.min(angle, 180 - angle)});

const format = (value: number) => (Math.round(value * 100) / 100).toString().replace('.', ',');

/** A label whose `_x` letters are written as indices: N_K → N with K below. */
const Indexed: React.FC<{text: string; size: number}> = ({text, size}) => (
	<>
		{text.split(/_(\w)/).map((part, index) =>
			index % 2 === 1 ? (
				<tspan key={index} dy={size * 0.22} fontSize={size * 0.68}>
					{part}
				</tspan>
			) : (
				<tspan key={index} dy={index > 0 ? -size * 0.22 : 0}>
					{part}
				</tspan>
			),
		)}
	</>
);

/**
 * A rod on a pivot with forces and hanging loads. The forces come in one by one with their arms (the distance to
 * the pivot along the rod) and torques; then the rod settles: level when the torques cancel ("Denge"), otherwise
 * turning towards the side that wins. Forces stay vertical while the rod turns, unless they have an angle with it;
 * loads hang on strings. The rod rests on a pivot, hangs on a rope, lies free or on two supports (`support`).
 */
export const LeverVisual: React.FC<VisualBoxProps & {visual: Lever}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const k = Math.min(width / LEVER_STAGE.width, height / LEVER_STAGE.height);
	const ox = (width - LEVER_STAGE.width * k) / 2;
	const oy = (height - LEVER_STAGE.height * k) / 2;
	const balance = leverBalance(visual);
	const margin = 130;
	const scale = (LEVER_STAGE.width - 2 * margin) / visual.length;
	const rodY = 280;
	const pivotX = margin + visual.pivot * scale;
	const seconds = useSceneSeconds();
	// The forces, then the rod's own weight, come in one after another, or each when a beat shows it; the rod settles
	// once the sum is shown (hooks run the same number of times on every frame: the count is fixed by the visual).
	const ids = [...visual.forces.map((_, index) => `f${index + 1}`), ...(visual.weight ? ['weight'] : [])];
	const shown = ids.map((id, index) => easeFrom(seconds, useShownAt(id) ?? delaySeconds + 0.5 + index * 0.45, 0.45));
	const settle = easeFrom(seconds, useBeatStartFor('sum', 'show') ?? delaySeconds + 0.6 + ids.length * 0.45, 1.2);
	// A rod on two supports does not turn; forces shown as alternatives to compare are not summed: the rod stays still.
	const verdict = visual.verdict && visual.support !== 'two';
	const tilt = verdict ? ((balance.tilt * Math.PI) / 180) * settle : 0;
	const rod = useReveal(delaySeconds, 0.5);
	const fontSize = 56;
	const largest = Math.max(...visual.forces.map((force) => force.value), visual.weight ?? 0);
	const arrowLength = (value: number) => 80 + 110 * (value / largest);
	// A point of the rod (x along it, from its left end) after the rod has turned about the pivot.
	const onRod = (x: number): [number, number] => {
		const along = (x - visual.pivot) * scale;
		return [pivotX + along * Math.cos(tilt), rodY + along * Math.sin(tilt)];
	};
	const colourOf = (torque: number) => (forceTone(torque, visual.torques || verdict) === 'brand' ? palette.brand : palette.lesson);
	const left = onRod(0);
	const right = onRod(visual.length);

	const force = (item: Pick<LeverForce, 'at' | 'value' | 'direction' | 'load' | 'angle' | 'angleLabel' | 'rope'>, label: string, torque: number, index: number, id: string) => {
		const [x, y] = onRod(item.at);
		const grow = shown[index] ?? 1;
		const length = arrowLength(item.value) * grow;
		const colour = colourOf(torque);
		if (item.load) {
			const side = 56 + 56 * Math.sqrt(item.value / largest);
			const string = 64;
			return (
				<Part key={id} id={id}>
					{(look) => (
						<g opacity={Math.min(1, grow * 1.5) * look.opacity}>
							<line x1={x} y1={y} x2={x} y2={y + string * grow} stroke={palette.ink} strokeWidth={4} />
							<rect x={x - side / 2} y={y + string * grow} width={side} height={side} rx={8} fill={colour} stroke={palette.ink} strokeWidth={look.scale > 1 ? 7 : 4} />
							<text x={x} y={y + string * grow + side + fontSize * 1.1} fill={palette.ink} fontSize={fontSize} fontWeight={800} textAnchor="middle">
								<Indexed text={label} size={fontSize} />
							</text>
						</g>
					)}
				</Part>
			);
		}
		if (item.angle === undefined && !item.rope) {
			const down = item.direction === 'down';
			const tail: [number, number] = down ? [x, y] : [x, y + length];
			const tip: [number, number] = down ? [x, y + length] : [x, y + 6];
			const angle = down ? Math.PI / 2 : -Math.PI / 2;
			return (
				<Part key={id} id={id}>
					{(look) => (
						<g opacity={grow <= 0 ? 0 : look.opacity}>
							<line x1={tail[0]} y1={tail[1]} x2={tip[0]} y2={tip[1]} stroke={colour} strokeWidth={13 * look.scale} strokeLinecap="round" />
							<path d={arrowHead(tip[0], tip[1], angle, 40)} fill={colour} />
							<text x={x} y={y + length + fontSize * 1.2} fill={palette.ink} fontSize={fontSize} fontWeight={800} textAnchor="middle">
								<Indexed text={label} size={fontSize} />
							</text>
						</g>
					)}
				</Part>
			);
		}
		// A force at an angle pulls along its line from the rod; a rope runs on along it to a wall or the ceiling.
		const angle = item.angle ?? 90;
		const line = forceLine(item, tilt);
		const [dx, dy] = [Math.cos(line), Math.sin(line)];
		const tip: [number, number] = [x + dx * length, y + dy * length];
		const ropeEnd: [number, number] = [x + dx * 330, y + dy * 330];
		const [px, py] = [-dy, dx];
		const arc = angleArc(angle, line, tilt);
		const sweep = Math.atan2(Math.sin(arc.to - arc.from), Math.cos(arc.to - arc.from));
		const radius = 78;
		const middle = arc.from + sweep / 2;
		// The label past the arrow's tip; beside the tip, off the line, where a rope goes on past it ("T" sat on its rope)
		// or the stage's top edge is near (a force rising from a tilted rod lost its "F" above the still).
		const up = py > 0 ? -1 : 1;
		const ahead: [number, number] = [tip[0] + dx * fontSize * 0.9, tip[1] + dy * fontSize * 0.9 + fontSize * 0.35];
		const overRope: [number, number] = [tip[0] - dx * fontSize * 0.6 + px * up * fontSize * 0.95, tip[1] - dy * fontSize * 0.6 + py * up * fontSize * 0.95 + fontSize * 0.35];
		const aside: [number, number] = [tip[0] + (dx >= 0 ? 1 : -1) * fontSize * 0.9, tip[1] + fontSize * 0.85];
		const labelAt = item.rope ? overRope : ahead[1] - fontSize < 0 ? aside : ahead;
		// A rope running more across than up ends at a wall, one running up at the ceiling; hatched on the far side.
		const wall = Math.abs(dx) >= Math.abs(dy);
		const [plateX, plateY] = wall ? [0, 1] : [1, 0];
		const [hatchX, hatchY] = wall ? [Math.sign(dx) || 1, 0] : [0, Math.sign(dy) || -1];
		return (
			<Part key={id} id={id}>
				{(look) => (
					<g opacity={grow <= 0 ? 0 : look.opacity}>
						{item.rope ? (
							<g stroke={palette.ink} strokeLinecap="round">
								<line x1={x} y1={y} x2={ropeEnd[0]} y2={ropeEnd[1]} strokeWidth={5} />
								{/* The wall or ceiling the rope is tied to, hatched on its far side. */}
								<line x1={ropeEnd[0] - plateX * 60} y1={ropeEnd[1] - plateY * 60} x2={ropeEnd[0] + plateX * 60} y2={ropeEnd[1] + plateY * 60} strokeWidth={7} />
								{[-48, -24, 0, 24, 48].map((offset) => (
									<line key={offset} x1={ropeEnd[0] + plateX * offset} y1={ropeEnd[1] + plateY * offset} x2={ropeEnd[0] + plateX * (offset - 14) + hatchX * 22} y2={ropeEnd[1] + plateY * (offset - 14) + hatchY * 22} strokeWidth={3} />
								))}
							</g>
						) : null}
						<line x1={x} y1={y} x2={tip[0] - dx * 20} y2={tip[1] - dy * 20} stroke={colour} strokeWidth={13 * look.scale} strokeLinecap="round" />
						<path d={arrowHead(tip[0], tip[1], line, 40)} fill={colour} />
						{Math.abs(angle - 90) > 0.5 || item.angleLabel ? (
							<g>
								<path d={`M${x + radius * Math.cos(arc.from)} ${y + radius * Math.sin(arc.from)} A${radius} ${radius} 0 0 ${sweep > 0 ? 1 : 0} ${x + radius * Math.cos(arc.to)} ${y + radius * Math.sin(arc.to)}`} fill="none" stroke={palette.ink} strokeWidth={4} />
								<text x={x + (radius + 46) * Math.cos(middle)} y={y + (radius + 46) * Math.sin(middle) + fontSize * 0.3} fill={palette.ink} fontSize={fontSize * 0.8} fontWeight={800} textAnchor="middle" stroke={palette.surface} strokeWidth={8} paintOrder="stroke">
									{item.angleLabel ?? `${format(arc.degrees)}°`}
								</text>
							</g>
						) : null}
						<text x={labelAt[0]} y={labelAt[1]} fill={palette.ink} fontSize={fontSize} fontWeight={800} textAnchor="middle" stroke={palette.surface} strokeWidth={8} paintOrder="stroke">
							<Indexed text={label} size={fontSize} />
						</text>
					</g>
				)}
			</Part>
		);
	};

	/** What holds the rod: a pivot under it, a rope from the ceiling, two supports, or nothing (with its turning point named). */
	const holder = (look: {scale: number}) => {
		const edge = look.scale > 1 ? 7 : 4;
		const pivotTriangle = (x: number) => (
			<>
				<path d={`M${x} ${rodY + 14} L${x - 46} ${rodY + 96} L${x + 46} ${rodY + 96} Z`} fill={palette.axis} stroke={palette.ink} strokeWidth={edge} strokeLinejoin="round" />
				<line x1={x - 90} y1={rodY + 98} x2={x + 90} y2={rodY + 98} stroke={palette.ink} strokeWidth={5} />
			</>
		);
		switch (visual.support) {
			case 'pivot':
				return pivotTriangle(pivotX);
			case 'rope': {
				const ceiling = rodY - 230;
				return (
					<g stroke={palette.ink} strokeLinecap="round">
						<line x1={pivotX - 130} y1={ceiling} x2={pivotX + 130} y2={ceiling} strokeWidth={7} />
						{[-110, -70, -30, 10, 50, 90].map((offset) => (
							<line key={offset} x1={pivotX + offset} y1={ceiling} x2={pivotX + offset + 22} y2={ceiling - 24} strokeWidth={3} />
						))}
						<line x1={pivotX} y1={ceiling} x2={pivotX} y2={rodY - 12} strokeWidth={5} />
						<circle cx={pivotX} cy={rodY - 12} r={9} fill={palette.surface} strokeWidth={edge} />
					</g>
				);
			}
			case 'two':
				return (visual.supports ?? []).map((at, index) => {
					const x = margin + at * scale;
					const name = visual.supportLabels[index];
					return (
						<g key={index}>
							{pivotTriangle(x)}
							<text x={x} y={rodY + 98 + fontSize * 1.05} fill={palette.ink} fontSize={fontSize} fontWeight={800} textAnchor="middle">
								{name}
							</text>
							{/* Its reaction on the rod, upwards, named N with the support's name as an index. */}
							<line x1={x} y1={rodY - 18} x2={x} y2={rodY - 150} stroke={palette.ink} strokeWidth={11} strokeLinecap="round" />
							<path d={arrowHead(x, rodY - 170, -Math.PI / 2, 38)} fill={palette.ink} />
							<text x={x + 30} y={rodY - 150} fill={palette.ink} fontSize={fontSize} fontWeight={800} textAnchor="start">
								<Indexed text={`N_${name}`} size={fontSize} />
							</text>
						</g>
					);
				});
			case 'none':
				return visual.pivotLabel ? (
					<g>
						<circle cx={pivotX} cy={rodY} r={12} fill={palette.ink} stroke={palette.surface} strokeWidth={4} />
						<text x={pivotX} y={rodY + 34 + fontSize * 0.8} fill={palette.ink} fontSize={fontSize} fontWeight={800} textAnchor="middle">
							{visual.pivotLabel}
						</text>
					</g>
				) : null;
		}
	};

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<g transform={`translate(${ox} ${oy}) scale(${k})`}>
				{/* A rope holding the rod is drawn under it. */}
				{visual.support === 'rope' ? (
					<Part id="pivot">{(look) => <g opacity={rod * look.opacity}>{holder(look)}</g>}</Part>
				) : null}
				{/* The rod, turning about the pivot once the forces are in place. */}
				<g opacity={rod}>
					<line x1={left[0]} y1={left[1]} x2={right[0]} y2={right[1]} stroke={palette.ink} strokeWidth={32} strokeLinecap="round" />
					<line x1={left[0]} y1={left[1]} x2={right[0]} y2={right[1]} stroke={palette.surface} strokeWidth={18} strokeLinecap="round" />
				</g>
				{visual.support !== 'rope' ? (
					<Part id="pivot">{(look) => <g opacity={rod * look.opacity}>{holder(look)}</g>}</Part>
				) : null}
				{/* Arms: from the pivot to each force, along the rod, above it. */}
				{visual.forces.map((item, index) => {
					const distance = Math.abs(item.at - visual.pivot);
					if (distance === 0) return null;
					const [ax, ay] = onRod(visual.pivot);
					const [bx, by] = onRod(item.at);
					const lift = 52 + (index % 2) * 66;
					const nx = Math.sin(tilt) * lift;
					const ny = -Math.cos(tilt) * lift;
					const torque = balance.torques[index];
					return (
						<Part key={`a${index}`} id={`a${index + 1}`}>
							{(look) => (
								<g opacity={(shown[index] ?? 1) * look.opacity}>
									<line x1={ax + nx} y1={ay + ny} x2={bx + nx} y2={by + ny} stroke={palette.muted} strokeWidth={5 * look.scale} strokeDasharray="16 11" />
									<line x1={bx} y1={by} x2={bx + nx} y2={by + ny} stroke={palette.muted} strokeWidth={3} />
									<text x={(ax + bx) / 2 + nx} y={(ay + by) / 2 + ny - 12} fill={palette.ink} fontSize={fontSize * 0.86} fontWeight={700} textAnchor="middle">
										{item.arm ?? `${format(distance)}${visual.unit ? ` ${visual.unit}` : ''}${visual.torques ? ` · ${format(Math.abs(torque))} ${torque > 0 ? '↺' : '↻'}` : ''}`}
									</text>
								</g>
							)}
						</Part>
					);
				})}
				{visual.forces.map((item, index) => force(item, item.label ?? `${format(item.value)} N`, balance.torques[index], index, `f${index + 1}`))}
				{visual.weight ? force({at: visual.weightAt ?? visual.length / 2, value: visual.weight, direction: 'down', load: false, rope: false}, 'G', balance.weightTorque, visual.forces.length, 'weight') : null}
				{/* The sums each way (numbers only when torques are written), and the verdict once the rod has settled. */}
				{verdict ? (
					<Part id="sum">
						{(look) => (
							<g opacity={settle * look.opacity} fontSize={fontSize} fontWeight={800}>
								<text x={LEVER_STAGE.width / 2} y={LEVER_STAGE.height - (visual.torques ? 96 : 34)} fill={palette.ink} textAnchor="middle">
									{balance.balanced ? 'Denge' : balance.net < 0 ? 'Saat yönünde döner' : 'Saatin tersine döner'}
								</text>
								{visual.torques ? (
									<>
										{/* Each total beside a dot in its arrows' colour (text stays ink: the brand colour is never text). */}
										<circle cx={LEVER_STAGE.width / 2 - 40 - `↻ ${format(balance.clockwise)}`.length * fontSize * 0.6 - fontSize * 0.45} cy={LEVER_STAGE.height - 28 - fontSize * 0.36} r={fontSize * 0.26} fill={palette.lesson} />
										<text x={LEVER_STAGE.width / 2 - 40} y={LEVER_STAGE.height - 28} fill={palette.ink} textAnchor="end">
											{`↻ ${format(balance.clockwise)}`}
										</text>
										<circle cx={LEVER_STAGE.width / 2 + 40 + fontSize * 0.3} cy={LEVER_STAGE.height - 28 - fontSize * 0.36} r={fontSize * 0.26} fill={palette.brand} />
										<text x={LEVER_STAGE.width / 2 + 40 + fontSize * 0.75} y={LEVER_STAGE.height - 28} fill={palette.ink} textAnchor="start">
											{`↺ ${format(balance.anticlockwise)}`}
										</text>
									</>
								) : null}
							</g>
						)}
					</Part>
				) : null}
			</g>
		</svg>
	);
};
