import React from 'react';
import {clamp01, lerp, smooth, smoothStep} from '../../../../Animations/Motion';
import {withAlpha} from '../../../../Themes/Theme';
import {useVisualPalette, type VisualBoxProps} from '../../VisualFrame';
import type {CourseVisual} from '../../VisualSchema';
import {pathOf} from '../../VisualWorld';
import {ProcessFrame, ProcessLabel, processCamera, sampled, useProcessClock, type CameraBox} from '../ProcessScene';

type ProcessSpec = Extract<CourseVisual, {kind: 'process'}>;

/**
 * Pressure in four panels: the same brick sinks deeper into foam on its small face than on its large one (P = G / S);
 * water spurts further from the lowest hole of a tall can, because pressure grows with depth; in Torricelli's tube
 * the mercury falls until 76 cm of it balances the air at sea level, less on a mountain; and in a hydraulic press a
 * small push on the small piston lifts a car on the large one, the pressure passing unchanged through the liquid.
 */

const PANELS = {
	kati: {x0: 50, x1: 410},
	derinlik: {x0: 430, x1: 790},
	acikhava: {x0: 810, x1: 1170},
	pascal: {x0: 1190, x1: 1550},
} as const;
const TITLES = {kati: 'Katı', derinlik: 'Sıvı', acikhava: 'Açık hava', pascal: 'Pascal'} as const;
const FOAM_Y = 470;
const CAN = {x0: 466, x1: 540, y0: 200, y1: 410};
const HOLES = [270, 330, 390];
/** The can stands on a table: the jets fall to this floor. */
const FLOOR = 600;
const TUBE = {x: 900, top: 190, dish: 560};
const CM = 3.6;

const FRAMING: Record<string, CameraBox> = {
	kati: [20, 120, 470, 620],
	derinlik: [400, 120, 820, 620],
	acikhava: [780, 120, 1200, 620],
	pascal: [1160, 120, 1580, 620],
};

export const PressureProcess: React.FC<VisualBoxProps & {visual: ProcessSpec}> = ({width, height, delaySeconds = 0, visual}) => {
	const palette = useVisualPalette();
	const clock = useProcessClock('pressure', visual.stages, delaySeconds);
	const camera = processCamera(clock, (stage) => FRAMING[stage]);
	const {time, amount} = clock;
	const lit = (id: keyof typeof PANELS) => (clock.current === id ? 1 : 0.45);

	const press = smoothStep(clamp01(amount('kati') * 1.5));
	const jets = smooth(clamp01(amount('derinlik') * 2));
	const fall = smooth(clamp01(amount('acikhava') * 1.6));
	const lift = smooth(clamp01(amount('pascal') * 1.4));
	const column = lerp(100, 76, fall) * CM;
	const mountainColumn = lerp(100, 60, fall) * CM * 0.55;

	return (
		<ProcessFrame process="pressure" clock={clock} camera={camera} width={width} height={height} backdrop="#F4F7FA">
			{(Object.keys(PANELS) as (keyof typeof PANELS)[]).map((id) => (
				<g key={id} opacity={lit(id)}>
					<rect x={PANELS[id].x0} y={110} width={PANELS[id].x1 - PANELS[id].x0} height={510} rx={18} fill="#FFFFFF" stroke={withAlpha(palette.ink, 0.12)} strokeWidth={2} />
					<text x={(PANELS[id].x0 + PANELS[id].x1) / 2} y={150} textAnchor="middle" fontFamily={palette.fontDisplay} fontWeight={800} fontSize={28} fill={palette.ink}>
						{TITLES[id]}
					</text>
				</g>
			))}
			{/* Solid: the same brick on its large face and on its small face. */}
			<g opacity={lit('kati')}>
				<rect x={70} y={FOAM_Y} width={320} height={110} rx={8} fill="#F2D27E" />
				{[
					{x: 90, w: 140, h: 60, sink: 10},
					{x: 290, w: 60, h: 140, sink: 40},
				].map((brick, index) => {
					const y = FOAM_Y - brick.h + brick.sink * press;
					return (
						<g key={index}>
							<path d={pathOf([[brick.x - 10, FOAM_Y], [brick.x - 4, FOAM_Y + brick.sink * press], [brick.x + brick.w + 4, FOAM_Y + brick.sink * press], [brick.x + brick.w + 10, FOAM_Y]], true)} fill="#D9B45E" />
							<rect x={brick.x} y={y} width={brick.w} height={brick.h} rx={4} fill="#B5523B" stroke="#6E2F21" strokeWidth={2} />
							<path d={`M${brick.x + brick.w / 2} ${y - 60} l0 40 m-10 -12 l10 12 l10 -12`} stroke={palette.ink} strokeWidth={4} fill="none" />
							<text x={brick.x + brick.w / 2} y={y - 68} textAnchor="middle" fontFamily={palette.fontBody} fontWeight={800} fontSize={22} fill={palette.ink}>
								G
							</text>
						</g>
					);
				})}
			</g>
			{/* Liquid: water spurts further from deeper holes. */}
			<g opacity={lit('derinlik')}>
				<rect x={CAN.x0} y={CAN.y0} width={CAN.x1 - CAN.x0} height={CAN.y1 - CAN.y0} rx={8} fill="#CFE6F7" stroke="#7D8791" strokeWidth={4} />
				<rect x={CAN.x0 + 4} y={CAN.y0 + 30} width={CAN.x1 - CAN.x0 - 8} height={CAN.y1 - CAN.y0 - 34} fill="#5A97CF" opacity={0.75} />
				<rect x={CAN.x0 - 10} y={CAN.y1} width={CAN.x1 - CAN.x0 + 20} height={10} fill="#7D8791" />
				<rect x={CAN.x0} y={CAN.y1 + 10} width={10} height={FLOOR - CAN.y1 - 10} fill="#9AA3AC" />
				<rect x={CAN.x1 - 10} y={CAN.y1 + 10} width={10} height={FLOOR - CAN.y1 - 10} fill="#9AA3AC" />
				<rect x={CAN.x0 - 10} y={FLOOR} width={330} height={8} fill="#7D8791" />
				{HOLES.map((y, index) => {
					// Torricelli: the water leaves at v = √(2gh) and falls the rest of the way, so it lands 2√(h · fall) away
					// (drawn at 0.55 scale to fit the panel). The deeper the hole, the faster and further the jet.
					const depth = y - (CAN.y0 + 30);
					const fallHeight = FLOOR - y;
					const reach = 0.55 * 2 * Math.sqrt(depth * fallHeight) * jets;
					const path = sampled((x) => y + fallHeight * ((x - CAN.x1) / Math.max(1, reach)) ** 2, CAN.x1, CAN.x1 + reach, 6);
					return (
						<g key={y}>
							<circle cx={CAN.x1} cy={y} r={5} fill="#2F4F6B" />
							{jets > 0.02 ? <path d={pathOf(path)} fill="none" stroke="#3E7FC0" strokeWidth={5} strokeLinecap="round" strokeDasharray="10 7" strokeDashoffset={-time * 60} /> : null}
							{jets > 0.02 ? <text x={CAN.x1 + reach} y={FLOOR + 30} textAnchor="middle" fontFamily={palette.fontBody} fontWeight={800} fontSize={20} fill={palette.ink}>{index + 1}</text> : null}
						</g>
					);
				})}
			</g>
			{/* Open air: the mercury column settles at 76 cm at sea level, lower on a mountain. */}
			<g opacity={lit('acikhava')}>
				<rect x={TUBE.x - 60} y={TUBE.dish} width={120} height={40} rx={6} fill="#B8BEC5" />
				<rect x={TUBE.x - 54} y={TUBE.dish + 6} width={108} height={30} rx={4} fill="#8E969F" />
				<rect x={TUBE.x - 14} y={TUBE.top} width={28} height={TUBE.dish - TUBE.top + 20} rx={10} fill="#FFFFFF" stroke="#7D8791" strokeWidth={3} />
				<rect x={TUBE.x - 9} y={TUBE.dish + 14 - column} width={18} height={column} rx={6} fill="#8E969F" />
				<path d={`M${TUBE.x + 30} ${TUBE.dish + 14} L${TUBE.x + 30} ${TUBE.dish + 14 - column}`} stroke={palette.lesson} strokeWidth={3} />
				<text x={TUBE.x + 40} y={TUBE.dish + 14 - column / 2} fontFamily={palette.fontBody} fontWeight={800} fontSize={24} fill={palette.lesson}>
					{`${Math.round(column / CM)} cm`}
				</text>
				<text x={TUBE.x} y={TUBE.top - 12} textAnchor="middle" fontFamily={palette.fontBody} fontWeight={700} fontSize={18} fill={palette.muted}>
					boşluk
				</text>
				{/* On a mountain: less air above, a shorter column. */}
				<path d="M1040 600 L1110 420 L1160 600 Z" fill="#9DA79A" />
				<rect x={1100} y={420 - mountainColumn} width={14} height={mountainColumn} rx={5} fill="#8E969F" stroke="#7D8791" strokeWidth={2} />
				<text x={1107} y={410 - mountainColumn} textAnchor="middle" fontFamily={palette.fontBody} fontWeight={700} fontSize={18} fill={palette.ink}>
					dağda
				</text>
			</g>
			{/* Pascal: a small push lifts a car. */}
			<g opacity={lit('pascal')}>
				<path d="M1230 560 L1230 380 L1270 380 L1270 520 L1440 520 L1440 380 L1530 380 L1530 560 Z" fill="#5A97CF" opacity={0.8} stroke="#2F6A9F" strokeWidth={3} />
				<rect x={1228} y={380 + 70 * lift} width={44} height={14} fill="#5E5E5E" />
				<rect x={1438} y={380 - 16 * lift} width={94} height={16} fill="#5E5E5E" />
				<g transform={`translate(1485 ${364 - 16 * lift})`}>
					<path d="M-40 0 L-40 -18 L-24 -22 L-14 -36 L18 -36 L28 -22 L42 -18 L42 0 Z" fill="#3E6FA3" stroke="#22405E" strokeWidth={2} />
					<circle cx={-22} cy={0} r={8} fill="#222" />
					<circle cx={24} cy={0} r={8} fill="#222" />
				</g>
				<path d={`M1250 ${300 + 70 * lift} l0 50 m-10 -14 l10 14 l10 -14`} stroke={palette.lesson} strokeWidth={6} fill="none" opacity={1 - 0.5 * lift} />
				<text x={1250} y={290 + 70 * lift} textAnchor="middle" fontFamily={palette.fontBody} fontWeight={800} fontSize={22} fill={palette.lesson}>
					küçük F
				</text>
				{[1300, 1350, 1400, 1480].map((x) => (
					<path key={x} d={`M${x} 545 l0 -24 m-7 9 l7 -9 l7 9`} stroke="#FFFFFF" strokeWidth={3} fill="none" opacity={0.4 + 0.6 * lift} />
				))}
			</g>
			<ProcessLabel id="yuzey" at={[320, FOAM_Y + 30]} to={[310, 230]} text="Küçük yüzey, derin iz" show={clock.now('kati') * press} size={22} />
			<ProcessLabel id="derinlik" at={[CAN.x1, HOLES[2]]} to={[680, 250]} text="Derindeki delik en uzağa" show={clock.now('derinlik') * jets} size={22} />
			<ProcessLabel id="civa" at={[TUBE.x, TUBE.dish - column / 2]} to={[960, 230]} text="Deniz seviyesinde 76 cm" show={clock.now('acikhava') * fall} size={22} />
			<ProcessLabel id="pascal" at={[1380, 540]} to={[1380, 240]} text="Basınç her yere aynen iletilir" show={clock.now('pascal')} size={21} />
		</ProcessFrame>
	);
};
