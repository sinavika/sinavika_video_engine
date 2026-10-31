import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useBeatStartFor, useShownAt} from '../VisualTimeline';
import {arrowHead} from './ArrowHead';

type Lever = Extract<CourseVisual, {kind: 'lever'}>;

/** The lever's stage: wide, so a long rod and its labels fit (CourseVisual keeps this ratio). */
export const LEVER_STAGE = {width: 1440, height: 720};

/**
 * Each force's torque about the pivot (anticlockwise positive: a downward force right of the pivot turns the rod
 * clockwise), the rod's own weight included, their sums each way, and how far the rod tilts: level when the torques
 * cancel, otherwise up to 9° towards the winning side, more the larger the imbalance.
 */
export const leverBalance = (lever: Pick<Lever, 'pivot' | 'forces' | 'weight' | 'length'>) => {
	const loads = [...lever.forces.map((force) => ({at: force.at, value: force.value, direction: force.direction})), ...(lever.weight ? [{at: lever.length / 2, value: lever.weight, direction: 'down' as const}] : [])];
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

const format = (value: number) => (Math.round(value * 100) / 100).toString().replace('.', ',');

/**
 * A rod on a pivot with forces and hanging loads. The forces come in one by one with their arms (the distance to
 * the pivot along the rod) and torques; then the rod settles: level when the torques cancel ("Denge"), otherwise
 * turning towards the side that wins. Forces stay vertical while the rod turns; loads hang on strings.
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
	// Forces shown as alternatives to compare are not summed: the rod stays still.
	const tilt = visual.verdict ? ((balance.tilt * Math.PI) / 180) * settle : 0;
	const rod = useReveal(delaySeconds, 0.5);
	const fontSize = 56;
	const largest = Math.max(...visual.forces.map((force) => force.value), visual.weight ?? 0);
	const arrowLength = (value: number) => 80 + 110 * (value / largest);
	// A point of the rod (x along it, from its left end) after the rod has turned about the pivot.
	const onRod = (x: number): [number, number] => {
		const along = (x - visual.pivot) * scale;
		return [pivotX + along * Math.cos(tilt), rodY + along * Math.sin(tilt)];
	};
	const colourOf = (torque: number) => (torque > 0 ? palette.brand : palette.lesson);
	const left = onRod(0);
	const right = onRod(visual.length);

	const force = (at: number, value: number, direction: 'down' | 'up', load: boolean, label: string, torque: number, index: number, id: string) => {
		const [x, y] = onRod(at);
		const grow = shown[index] ?? 1;
		const length = arrowLength(value) * grow;
		const colour = colourOf(torque);
		if (load) {
			const side = 56 + 56 * Math.sqrt(value / largest);
			const string = 64;
			return (
				<Part key={id} id={id}>
					{(look) => (
						<g opacity={Math.min(1, grow * 1.5) * look.opacity}>
							<line x1={x} y1={y} x2={x} y2={y + string * grow} stroke={palette.ink} strokeWidth={4} />
							<rect x={x - side / 2} y={y + string * grow} width={side} height={side} rx={8} fill={colour} stroke={palette.ink} strokeWidth={look.scale > 1 ? 7 : 4} />
							<text x={x} y={y + string * grow + side + fontSize * 1.1} fill={palette.ink} fontSize={fontSize} fontWeight={800} textAnchor="middle">
								{label}
							</text>
						</g>
					)}
				</Part>
			);
		}
		const down = direction === 'down';
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
							{label}
						</text>
					</g>
				)}
			</Part>
		);
	};

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<g transform={`translate(${ox} ${oy}) scale(${k})`}>
				{/* The rod, turning about the pivot once the forces are in place. */}
				<g opacity={rod}>
					<line x1={left[0]} y1={left[1]} x2={right[0]} y2={right[1]} stroke={palette.ink} strokeWidth={32} strokeLinecap="round" />
					<line x1={left[0]} y1={left[1]} x2={right[0]} y2={right[1]} stroke={palette.surface} strokeWidth={18} strokeLinecap="round" />
				</g>
				<Part id="pivot">
					{(look) => (
						<g opacity={rod * look.opacity}>
							<path d={`M${pivotX} ${rodY + 14} L${pivotX - 46} ${rodY + 96} L${pivotX + 46} ${rodY + 96} Z`} fill={palette.axis} stroke={palette.ink} strokeWidth={look.scale > 1 ? 7 : 4} strokeLinejoin="round" />
							<line x1={pivotX - 90} y1={rodY + 98} x2={pivotX + 90} y2={rodY + 98} stroke={palette.ink} strokeWidth={5} />
						</g>
					)}
				</Part>
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
				{visual.forces.map((item, index) => force(item.at, item.value, item.direction, item.load, item.label ?? `${format(item.value)} N`, balance.torques[index], index, `f${index + 1}`))}
				{visual.weight ? force(visual.length / 2, visual.weight, 'down', false, 'G', balance.weightTorque, visual.forces.length, 'weight') : null}
				{/* The sums each way (numbers only when torques are written), and the verdict once the rod has settled. */}
				{visual.verdict ? (
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
