import React from 'react';
import {clamp01, lerp, noise, smooth, smoothStep} from '../../../../Animations/Motion';
import {useVisualPalette, type VisualBoxProps} from '../../VisualFrame';
import type {CourseVisual} from '../../VisualSchema';
import {pathOf} from '../../VisualWorld';
import {ProcessFrame, ProcessLabel, processCamera, sampled, smoothPath, useProcessClock, type Point} from '../ProcessScene';

type ProcessSpec = Extract<CourseVisual, {kind: 'process'}>;

/**
 * Mitosis in one animal cell with four chromosomes (two homologous pairs, a long one in reds and a short one in blues,
 * 2n = 4): in interphase the threads of chromatin are copied; in prophase they coil into X-shaped chromosomes of two
 * sister chromatids, the nuclear envelope fades and the spindle grows between the poles; in metaphase they line up at
 * the equator; in anaphase the sisters are pulled apart to opposite poles; in telophase two nuclei form and the cell
 * pinches in two. Each daughter cell ends with the same four chromosomes: mitosis copies, it does not halve.
 */

const CELL = {x: 800, y: 380, rx: 330, ry: 215};
const POLE = 270;
const CHROMOSOMES = [
	{length: 70, colour: '#D9483B', light: '#F28A7E'},
	{length: 70, colour: '#E8833A', light: '#F5B27E'},
	{length: 44, colour: '#2F6FB5', light: '#7AA8DE'},
	{length: 44, colour: '#2BA3B8', light: '#7FD0DD'},
];
const SCATTER: Point[] = [
	[-70, -50],
	[60, -60],
	[-40, 55],
	[75, 40],
];

/** A chromatid as a rounded rod from its centromere, at an angle. */
const Chromatid: React.FC<{x: number; y: number; length: number; angle: number; colour: string; width?: number}> = ({x, y, length, angle, colour, width = 12}) => (
	<g transform={`translate(${x} ${y}) rotate(${angle})`}>
		<rect x={-width / 2} y={-length / 2} width={width} height={length} rx={width / 2} fill={colour} />
	</g>
);

export const MitosisProcess: React.FC<VisualBoxProps & {visual: ProcessSpec}> = ({width, height, delaySeconds = 0, visual}) => {
	const palette = useVisualPalette();
	const clock = useProcessClock('mitosis', visual.stages, delaySeconds);
	const camera = processCamera(clock, () => undefined);
	const {time, amount} = clock;

	const copy = smooth(amount('interfaz'));
	const coil = smooth(amount('profaz'));
	const align = smooth(amount('metafaz'));
	const pull = smoothStep(amount('anafaz'));
	const split = smooth(amount('telofaz'));
	const spindle = clamp01(coil * 1.4) * (1 - split);

	// The cell pinches at its equator in telophase.
	const outline = (side: -1 | 1): Point[] =>
		sampled((t) => t, -Math.PI / 2, Math.PI / 2, 0.05).map(([t]) => {
			const pinch = split * Math.exp(-((Math.cos(t) / 0.28) ** 2));
			const x = CELL.x + side * (CELL.rx * Math.cos(t) * (1 - 0.1 * split) + 26 * split);
			const y = CELL.y + CELL.ry * Math.sin(t) * (1 - pinch * 0.97);
			return [x, y] as Point;
		});
	const membrane = split > 0.02 ? [smoothPath(outline(-1), false), smoothPath(outline(1), false)] : [];

	const poles: Point[] = [
		[lerp(CELL.x - 30, CELL.x - POLE, coil), lerp(CELL.y - 150, CELL.y, coil)],
		[lerp(CELL.x + 30, CELL.x + POLE, coil), lerp(CELL.y - 150, CELL.y, coil)],
	];
	const plateY = (index: number) => CELL.y - 120 + index * 80;

	return (
		<ProcessFrame process="mitosis" clock={clock} camera={camera} width={width} height={height} backdrop="#F3F6F9">
			{/* The cell. */}
			{split > 0.02 ? (
				membrane.map((d, index) => <path key={index} d={`${d} Z`} fill="#FCEBD7" stroke="#C99A6A" strokeWidth={5} />)
			) : (
				<ellipse cx={CELL.x} cy={CELL.y} rx={CELL.rx} ry={CELL.ry} fill="#FCEBD7" stroke="#C99A6A" strokeWidth={5} />
			)}
			{/* The nuclear envelope: whole in interphase, gone in prophase, back as two in telophase. */}
			<circle cx={CELL.x} cy={CELL.y} r={130} fill="#F5D9BD" stroke="#B9865A" strokeWidth={4} strokeDasharray={coil > 0.2 ? '12 10' : undefined} opacity={clamp01(1 - coil)} />
			{[-1, 1].map((side) => (
				<circle key={side} cx={CELL.x + side * (POLE - 50)} cy={CELL.y} r={85} fill="#F5D9BD" stroke="#B9865A" strokeWidth={4} opacity={clamp01(split * 1.4 - 0.3)} />
			))}
			{/* Chromatin threads, copied in interphase, unwinding again in the new nuclei. */}
			<g opacity={clamp01(1 - coil * 1.5)}>
				{CHROMOSOMES.map((chromosome, index) =>
					[0, 1].map((copyIndex) => {
						const [ox, oy] = SCATTER[index];
						const points = sampled((t) => oy + 18 * Math.sin(t / 9 + index + copyIndex), -chromosome.length, chromosome.length, 4).map(([t, y]) => [CELL.x + ox + t * 0.9 + copyIndex * 6, CELL.y + y + copyIndex * 6] as Point);
						return <path key={`${index}${copyIndex}`} d={smoothPath(points)} fill="none" stroke={copyIndex ? chromosome.light : chromosome.colour} strokeWidth={5} strokeLinecap="round" opacity={copyIndex ? copy : 1} />;
					}),
				)}
			</g>
			{/* The spindle: fibres from each pole to the chromosomes (and on to the chromatids as they part). */}
			<g opacity={spindle}>
				{CHROMOSOMES.map((_, index) => {
					const target: Point = [CELL.x, lerp(CELL.y + SCATTER[index][1], plateY(index), align)];
					return [0, 1].map((side) => {
						const end: Point = [target[0] + (side ? 1 : -1) * lerp(0, POLE - 60, pull), target[1]];
						return <path key={`${index}${side}`} d={pathOf([poles[side], end])} stroke="#7C8C99" strokeWidth={2.5} opacity={0.8} />;
					});
				})}
				{poles.map(([x, y], index) => (
					<g key={index}>
						{Array.from({length: 7}, (_, ray) => {
							const angle = (ray / 7) * Math.PI * 2;
							return <line key={ray} x1={x} y1={y} x2={x + 30 * Math.cos(angle)} y2={y + 30 * Math.sin(angle)} stroke="#7C8C99" strokeWidth={2} />;
						})}
						<circle cx={x} cy={y} r={9} fill="#4E5D6A" />
					</g>
				))}
			</g>
			{/* Centrosomes before the spindle forms. */}
			<g opacity={copy * (1 - coil)}>
				<circle cx={CELL.x - 18} cy={CELL.y - 160} r={8} fill="#4E5D6A" />
				<circle cx={CELL.x + 18} cy={CELL.y - 160} r={8} fill="#4E5D6A" opacity={copy} />
			</g>
			{/* Condensed chromosomes: two sister chromatids at a centromere; parted in anaphase. */}
			<g opacity={clamp01(coil * 1.6) * clamp01(1 - (split - 0.5) * 2)}>
				{CHROMOSOMES.map((chromosome, index) => {
					const length = chromosome.length * lerp(1.4, 1, coil);
					const start: Point = [CELL.x + SCATTER[index][0], CELL.y + SCATTER[index][1]];
					const plate: Point = [CELL.x, plateY(index)];
					const at: Point = [lerp(start[0], plate[0], align), lerp(start[1], plate[1], align)];
					const apart = lerp(6, POLE - 60, pull);
					const wobble = 3 * Math.sin(time * 2 + index);
					return [-1, 1].map((side) => {
						const x = at[0] + side * apart;
						const angle = side * lerp(14, 70, pull) + wobble;
						return (
							<g key={`${index}${side}`}>
								<Chromatid x={x} y={at[1]} length={length} angle={angle} colour={side < 0 ? chromosome.colour : chromosome.light} />
								<circle cx={x - side * 2} cy={at[1]} r={5} fill="#3B2A20" />
							</g>
						);
					});
				})}
			</g>
			{/* The metaphase plate. */}
			<line x1={CELL.x} y1={CELL.y - 190} x2={CELL.x} y2={CELL.y + 190} stroke={palette.lesson} strokeWidth={3} strokeDasharray="10 8" opacity={clock.now('metafaz')} />
			{/* Daughter nuclei: the same four chromosomes in each. */}
			<g opacity={clamp01(split * 2 - 1)}>
				{[-1, 1].map((side) =>
					CHROMOSOMES.map((chromosome, index) => {
						const points = sampled((t) => 14 * Math.sin(t / 8 + index), -chromosome.length * 0.6, chromosome.length * 0.6, 4).map(([t, y]) => [CELL.x + side * (POLE - 50) + t * 0.6 + (noise(index) - 0.5) * 30, CELL.y - 40 + index * 26 + y * 0.6] as Point);
						return <path key={`${side}${index}`} d={smoothPath(points)} fill="none" stroke={side < 0 ? chromosome.colour : chromosome.light} strokeWidth={4.5} strokeLinecap="round" />;
					}),
				)}
			</g>
			<g fontFamily={palette.fontBody} fontWeight={800} fontSize={24} fill={palette.ink} textAnchor="middle" opacity={clamp01(split * 2 - 1)}>
				<text x={CELL.x - POLE + 20} y={CELL.y + 250}>2n = 4</text>
				<text x={CELL.x + POLE - 20} y={CELL.y + 250}>2n = 4</text>
			</g>
			<text x={CELL.x} y={CELL.y + 255} textAnchor="middle" fontFamily={palette.fontBody} fontWeight={800} fontSize={24} fill={palette.ink} opacity={1 - clamp01(split * 3)}>
				2n = 4
			</text>
			<ProcessLabel id="interfaz" at={[CELL.x + 60, CELL.y - 60]} to={[CELL.x + 300, 150]} text="DNA eşlenir" show={clock.now('interfaz')} />
			<ProcessLabel id="ig" at={[lerp(poles[1][0], CELL.x, 0.5), lerp(poles[1][1], CELL.y, 0.5) - 20]} to={[CELL.x + 330, 150]} text="İğ iplikleri" show={clock.now('profaz')} />
			<ProcessLabel id="ekvator" at={[CELL.x, CELL.y - 180]} to={[CELL.x - 200, 140]} text="Ekvator düzlemi" show={clock.now('metafaz')} />
			<ProcessLabel id="kromatit" at={[CELL.x + 40, plateY(0)]} to={[CELL.x + 300, 150]} text="Kardeş kromatitler ayrılır" show={clock.now('anafaz')} />
			<ProcessLabel id="bogum" at={[CELL.x, CELL.y - CELL.ry * (1 - split * 0.97) + 4]} to={[CELL.x, 120]} text="Boğumlanma" show={clock.now('telofaz') * split} />
		</ProcessFrame>
	);
};
