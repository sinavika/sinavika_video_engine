import React from 'react';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useBeatStartFor} from '../VisualTimeline';
import {arrowHead} from '../Physics/ArrowHead';

type ElectroCell = Extract<CourseVisual, {kind: 'electrochemicalCell'}>;

/** The stage (CourseVisual keeps this ratio). */
export const ELECTRO_CELL_STAGE = {width: 1600, height: 900};

/** A standard cell potential: cathode's reduction potential minus the anode's (V). */
export const cellPotential = (cathode: number, anode: number) => Math.round((cathode - anode) * 1000) / 1000;

/** A point along a polyline at a share of its length. */
const along = (points: [number, number][], share: number): [number, number] => {
	const lengths = points.slice(1).map((point, index) => Math.hypot(point[0] - points[index][0], point[1] - points[index][1]));
	let left = share * lengths.reduce((sum, length) => sum + length, 0);
	for (let index = 0; index < lengths.length; index++) {
		if (left <= lengths[index]) {
			const t = left / lengths[index];
			return [points[index][0] + (points[index + 1][0] - points[index][0]) * t, points[index][1] + (points[index + 1][1] - points[index][1]) * t];
		}
		left -= lengths[index];
	}
	return points[points.length - 1];
};

/**
 * An electrochemical cell. `galvanic`: two half-cells joined by a salt bridge and a voltmeter; electrons leave the
 * anode (left) through the wire to the cathode, anions in the bridge drift to the anode and cations to the cathode, the
 * anode thins and the cathode thickens. `electrolysis`: one vessel, a power supply drives electrons into the cathode;
 * gas products rise as bubbles. Beats point at `anode`, `cathode`, `wire`, `bridge`, `electrons`, `ions`, `meter`
 * and `run`.
 */
export const ElectroCellVisual: React.FC<VisualBoxProps & {visual: ElectroCell}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const k = Math.min(width / ELECTRO_CELL_STAGE.width, height / ELECTRO_CELL_STAGE.height);
	const ox = (width - ELECTRO_CELL_STAGE.width * k) / 2;
	const oy = (height - ELECTRO_CELL_STAGE.height * k) / 2;
	const appear = useReveal(delaySeconds, 0.5);
	const runStart = useBeatStartFor('run', 'show') ?? delaySeconds + 1;
	const fontSize = Math.max(64, 28 / k);
	const label = (x: number, y: number, text: string, anchor: 'start' | 'middle' | 'end' = 'middle', size = fontSize * 0.75) => (
		<text x={x} y={y} fill={palette.ink} fontSize={size} fontWeight={800} textAnchor={anchor} stroke={palette.surface} strokeWidth={8} paintOrder="stroke">
			{text}
		</text>
	);
	const elapsed = visual.motion ? Math.max(0, seconds - runStart) : 0;
	const running = visual.motion && seconds >= runStart;
	// The anode thins and the cathode thickens over 8 s, at most a quarter.
	const change = Math.min(1, elapsed / 8);
	const galvanic = visual.mode === 'galvanic';
	const [anodeX, cathodeX] = galvanic ? [370, 1230] : [560, 1040];
	const [plateTop, plateBottom] = [290, 760];
	const anodeWidth = 64 * (1 - (visual.anodeDissolves ? 0.4 : 0) * change);
	const cathodeWidth = 64 * (1 + (visual.cathodeGrows ? 0.4 : 0) * change);
	const wireY = 130;
	const wire: [number, number][] = [
		[anodeX, plateTop],
		[anodeX, wireY],
		[cathodeX, wireY],
		[cathodeX, plateTop],
	];
	// Electrons flow anode → cathode in both modes (in electrolysis the supply pushes them into the cathode).
	const electrons = Array.from({length: 7}, (_, index) => {
		const share = ((elapsed * 0.18 + index / 7) % 1 + 1) % 1;
		return along(wire, share);
	});
	const beaker = (left: number, right: number, solution: string) => (
		<g>
			<path d={`M ${left} 380 L ${left} 820 L ${right} 820 L ${right} 380`} fill="none" stroke={palette.ink} strokeWidth={7} />
			<rect x={left + 5} y={450} width={right - left - 10} height={366} fill={palette.lesson} opacity={0.1} />
			{label((left + right) / 2, 880, solution, 'middle', fontSize * 0.7)}
		</g>
	);
	const plate = (x: number, plateWidth: number, colour: string) => <rect x={x - plateWidth / 2} y={plateTop} width={plateWidth} height={plateBottom - plateTop} rx={6} fill={colour} stroke={palette.ink} strokeWidth={5} />;
	const bubbles = (x: number) =>
		Array.from({length: 6}, (_, index) => {
			const rise = (((elapsed * 0.5 + index / 6) % 1) + 1) % 1;
			return <circle key={index} cx={x + 50 + ((index * 37) % 30)} cy={740 - rise * 280} r={12} fill="none" stroke={palette.ink} strokeWidth={4} opacity={running ? 1 - rise * 0.6 : 0} />;
		});

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
				{galvanic ? (
					<>
						{beaker(120, 620, visual.anode.solution)}
						{beaker(980, 1480, visual.cathode.solution)}
					</>
				) : (
					beaker(300, 1300, visual.anode.solution)
				)}
				{galvanic ? (
					<Part id="bridge">
						{(look) => (
							<g opacity={look.opacity}>
								<path d="M 505 650 L 505 280 L 1095 280 L 1095 650 L 1025 650 L 1025 380 L 575 380 L 575 650 Z" fill={palette.fill} stroke={palette.ink} strokeWidth={5} strokeLinejoin="round" />
								{label(800, 450, `tuz köprüsü (${visual.bridge})`, 'middle', fontSize * 0.62)}
							</g>
						)}
					</Part>
				) : null}
				{galvanic ? (
					<Part id="ions">
						{(look) => (
							<g opacity={look.opacity * (running ? 1 : 0)}>
								{/* Anions drift to the anode side, cations to the cathode side. */}
								{[0, 1, 2].map((index) => {
									const share = (((elapsed * 0.12 + index / 3) % 1) + 1) % 1;
									const [ax, ay] = along([[1000, 306], [600, 306]], share);
									const [cx, cy] = along([[600, 354], [1000, 354]], (share + 0.5) % 1);
									return (
										<g key={index}>
											<circle cx={ax} cy={ay} r={21} fill={palette.ink} />
											<text x={ax} y={ay + 11} fill={palette.surface} fontSize={34} fontWeight={800} textAnchor="middle">−</text>
											<circle cx={cx} cy={cy} r={21} fill={palette.lesson} />
											<text x={cx} y={cy + 11} fill={palette.surface} fontSize={34} fontWeight={800} textAnchor="middle">+</text>
										</g>
									);
								})}
							</g>
						)}
					</Part>
				) : null}
				<Part id="wire">{(look) => <polyline points={wire.map((point) => point.join(',')).join(' ')} fill="none" stroke={palette.ink} strokeWidth={6} opacity={look.opacity} />}</Part>
				<Part id="meter">
					{(look) => (
						<g opacity={look.opacity}>
							{galvanic ? (
								<>
									<circle cx={800} cy={wireY} r={62} fill={palette.surface} stroke={palette.ink} strokeWidth={6} />
									<text x={800} y={wireY + 24} fill={palette.ink} fontSize={fontSize * 0.95} fontWeight={800} textAnchor="middle">
										V
									</text>
									{visual.voltage ? label(800, wireY - 82, visual.voltage, 'middle', fontSize * 0.75) : null}
								</>
							) : (
								<>
									<rect x={720} y={wireY - 50} width={160} height={100} fill={palette.surface} />
									<line x1={780} y1={wireY - 50} x2={780} y2={wireY + 50} stroke={palette.ink} strokeWidth={8} />
									<line x1={820} y1={wireY - 28} x2={820} y2={wireY + 28} stroke={palette.ink} strokeWidth={14} />
									{label(760, wireY - 64, '+', 'middle', fontSize * 0.8)}
									{label(840, wireY - 64, '−', 'middle', fontSize * 0.8)}
									{label(800, wireY + 110, 'güç kaynağı', 'middle', fontSize * 0.6)}
								</>
							)}
						</g>
					)}
				</Part>
				<Part id="anode">
					{(look) => (
						<g opacity={look.opacity}>
							{plate(anodeX, anodeWidth, palette.axis)}
							{label(anodeX - 50, plateTop - 30, `${visual.anode.label} (anot)`, 'end', fontSize * 0.7)}
							{visual.anodeGas ? bubbles(anodeX) : null}
						</g>
					)}
				</Part>
				<Part id="cathode">
					{(look) => (
						<g opacity={look.opacity}>
							{plate(cathodeX, cathodeWidth, palette.grid)}
							{label(cathodeX + 50, plateTop - 30, `${visual.cathode.label} (katot)`, 'start', fontSize * 0.7)}
							{visual.cathodeGas ? bubbles(cathodeX) : null}
						</g>
					)}
				</Part>
				<Part id="electrons">
					{(look) => (
						<g opacity={look.opacity * (running ? 1 : 0)}>
							{electrons.map(([x, y], index) => (
								<g key={index}>
									<circle cx={x} cy={y} r={16} fill={palette.brand} stroke={palette.ink} strokeWidth={3} />
								</g>
							))}
							<path d={arrowHead(galvanic ? 600 : 650, wireY - 40, 0, 26)} fill={palette.ink} />
							{label(galvanic ? 560 : 610, wireY - 26, 'e⁻', 'end', fontSize * 0.7)}
						</g>
					)}
				</Part>
			</g>
		</svg>
	);
};
