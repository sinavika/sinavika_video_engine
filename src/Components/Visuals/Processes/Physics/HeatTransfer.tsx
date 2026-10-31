import React from 'react';
import {clamp01, lerp, noise, smooth} from '../../../../Animations/Motion';
import {withAlpha} from '../../../../Themes/Theme';
import {useVisualPalette, type VisualBoxProps} from '../../VisualFrame';
import type {CourseVisual} from '../../VisualSchema';
import {pathOf} from '../../VisualWorld';
import {ProcessFrame, ProcessLabel, processCamera, useProcessClock, type CameraBox} from '../ProcessScene';

type ProcessSpec = Extract<CourseVisual, {kind: 'process'}>;

/**
 * The three ways heat travels and where it stops, in four panels: along a metal rod heated at one end, particle
 * jostling particle, the wax beads under it dropping one by one as the heat reaches them (conduction); in a pot of
 * water that rises warm over the flame and sinks cool at the sides (convection); from the Sun across empty space to
 * the ground (radiation); and between a hot and a cold block in contact until both show the same temperature.
 */

const PANELS = {
	iletim: {x0: 50, x1: 410},
	konveksiyon: {x0: 430, x1: 790},
	isima: {x0: 810, x1: 1170},
	denge: {x0: 1190, x1: 1550},
} as const;
const TITLES = {iletim: 'İletim', konveksiyon: 'Konveksiyon', isima: 'Işıma', denge: 'Isıl denge'} as const;
const ROD = {x0: 90, x1: 390, y: 330};
const WAX = [150, 210, 270, 330, 380];
const POT = {x0: 470, x1: 750, y0: 300, y1: 560};

const hot = (share: number) => `rgb(${Math.round(lerp(150, 230, share))}, ${Math.round(lerp(160, 80, share))}, ${Math.round(lerp(170, 50, share))})`;

const FRAMING: Record<string, CameraBox> = {
	iletim: [20, 120, 470, 620],
	konveksiyon: [400, 120, 820, 620],
	isima: [780, 120, 1200, 620],
	denge: [1160, 120, 1580, 620],
};

export const HeatTransferProcess: React.FC<VisualBoxProps & {visual: ProcessSpec}> = ({width, height, delaySeconds = 0, visual}) => {
	const palette = useVisualPalette();
	const clock = useProcessClock('heattransfer', visual.stages, delaySeconds);
	const camera = processCamera(clock, (stage) => FRAMING[stage]);
	const {time, amount} = clock;
	const lit = (id: keyof typeof PANELS) => (clock.current === id ? 1 : 0.45);

	const front = lerp(ROD.x0, ROD.x1 + 20, smooth(amount('iletim')));
	const rising = smooth(clamp01(amount('konveksiyon') * 2)) || (clock.current === 'konveksiyon' ? 0.2 : 0);
	const sunshine = smooth(amount('isima'));
	const balance = smooth(amount('denge'));
	const hotT = lerp(80, 50, balance);
	const coldT = lerp(20, 50, balance);

	return (
		<ProcessFrame process="heattransfer" clock={clock} camera={camera} width={width} height={height} backdrop="#F4F7FA">
			{(Object.keys(PANELS) as (keyof typeof PANELS)[]).map((id) => (
				<g key={id} opacity={lit(id)}>
					<rect x={PANELS[id].x0} y={110} width={PANELS[id].x1 - PANELS[id].x0} height={510} rx={18} fill="#FFFFFF" stroke={withAlpha(palette.ink, 0.12)} strokeWidth={2} />
					<text x={(PANELS[id].x0 + PANELS[id].x1) / 2} y={150} textAnchor="middle" fontFamily={palette.fontDisplay} fontWeight={800} fontSize={28} fill={palette.ink}>
						{TITLES[id]}
					</text>
				</g>
			))}
			{/* Conduction: the rod warms from the flame end; the wax beads drop as the heat reaches them. */}
			<g opacity={lit('iletim')}>
				<rect x={ROD.x0} y={ROD.y - 20} width={ROD.x1 - ROD.x0} height={40} rx={8} fill="#B9C2CB" stroke="#7D8791" strokeWidth={2} />
				{Array.from({length: 26}, (_, index) => {
					const x = ROD.x0 + 10 + (index % 13) * 23;
					const y = ROD.y - 8 + Math.floor(index / 13) * 16;
					const warm = clamp01((front - x) / 60);
					const shake = 1 + 4 * warm;
					return <circle key={index} cx={x + shake * Math.sin(time * 16 + index)} cy={y + shake * Math.cos(time * 15 + index * 2)} r={6} fill={hot(warm)} />;
				})}
				{WAX.map((x, index) => {
					const drop = clamp01((front - x) / 40);
					return <ellipse key={index} cx={x} cy={ROD.y + 30 + drop * drop * 220} rx={9} ry={11} fill="#F3E3A8" stroke="#C9B26A" strokeWidth={1.5} opacity={drop >= 1 ? 0.4 : 1} />;
				})}
				{Array.from({length: 4}, (_, index) => {
					const flicker = 0.75 + 0.25 * Math.sin(time * 9 + index);
					const x = ROD.x0 + 6 + index * 10;
					return <path key={index} d={`M${x - 10} 420 Q${x - 6} ${420 - 40 * flicker} ${x} ${420 - 70 * flicker} Q${x + 6} ${420 - 40 * flicker} ${x + 10} 420 Z`} fill={index % 2 ? '#FFD25A' : '#F28C28'} />;
				})}
			</g>
			{/* Convection: warm water rises over the flame, cools and sinks at the sides. */}
			<g opacity={lit('konveksiyon')}>
				<rect x={POT.x0} y={POT.y0} width={POT.x1 - POT.x0} height={POT.y1 - POT.y0} rx={12} fill="#CFE6F7" stroke="#7D8791" strokeWidth={4} />
				{[-1, 1].map((side) => {
					const cx = (POT.x0 + POT.x1) / 2 + side * 70;
					return <ellipse key={side} cx={cx} cy={(POT.y0 + POT.y1) / 2 + 10} rx={58} ry={100} fill="none" stroke={withAlpha(palette.lesson, 0.35)} strokeWidth={3} strokeDasharray="10 8" />;
				})}
				{Array.from({length: 24}, (_, index) => {
					const side = index % 2 ? 1 : -1;
					const phase = (noise(index * 3.3) + time * 0.25 * (0.4 + rising)) % 1;
					// Up through the middle, out along the top, down the side, back along the bottom.
					const angle = Math.PI * 2 * phase;
					const cx = (POT.x0 + POT.x1) / 2 + side * 70;
					const x = cx - side * 58 * Math.cos(angle);
					const y = (POT.y0 + POT.y1) / 2 + 10 + 100 * Math.sin(angle) * -1;
					const warm = clamp01(0.5 - Math.sin(angle) * 0.5 + (Math.abs(x - (POT.x0 + POT.x1) / 2) < 40 ? 0.3 : 0));
					return <circle key={index} cx={x} cy={y} r={7} fill={hot(warm)} />;
				})}
				{Array.from({length: 4}, (_, index) => {
					const flicker = 0.75 + 0.25 * Math.sin(time * 9 + index);
					const x = (POT.x0 + POT.x1) / 2 - 30 + index * 20;
					return <path key={index} d={`M${x - 10} 600 Q${x - 6} ${600 - 26 * flicker} ${x} ${600 - 40 * flicker} Q${x + 6} ${600 - 26 * flicker} ${x + 10} 600 Z`} fill={index % 2 ? '#FFD25A' : '#F28C28'} />;
				})}
			</g>
			{/* Radiation: rays cross empty space and warm the ground. */}
			<g opacity={lit('isima')}>
				<rect x={PANELS.isima.x0 + 10} y={170} width={PANELS.isima.x1 - PANELS.isima.x0 - 20} height={260} rx={12} fill="#1E2A44" />
				{Array.from({length: 30}, (_, index) => (
					<circle key={index} cx={PANELS.isima.x0 + 20 + noise(index * 2.1) * 330} cy={180 + noise(index * 3.7) * 240} r={1.6} fill="#FFFFFF" opacity={0.7} />
				))}
				<circle cx={870} cy={230} r={42} fill="#FFC93C" />
				{[0, 1, 2, 3].map((index) => {
					const end = [1000 + index * 40, 540] as const;
					return <path key={index} d={pathOf([[890 + index * 6, 260], end])} stroke="#FFC93C" strokeWidth={4} strokeDasharray="14 12" strokeDashoffset={-time * 80} opacity={0.4 + 0.6 * sunshine} />;
				})}
				<rect x={PANELS.isima.x0 + 10} y={520} width={PANELS.isima.x1 - PANELS.isima.x0 - 20} height={90} rx={10} fill={hot(0.25 + 0.6 * sunshine)} />
				<text x={(PANELS.isima.x0 + PANELS.isima.x1) / 2} y={470} textAnchor="middle" fontFamily={palette.fontBody} fontWeight={700} fontSize={22} fill="#FFFFFF">
					Boşluk: tanecik yok
				</text>
			</g>
			{/* Equilibrium: heat flows from the hot block to the cold one until they are equal. */}
			<g opacity={lit('denge')}>
				<rect x={1220} y={330} width={150} height={150} rx={10} fill={hot(clamp01((hotT - 20) / 60))} />
				<rect x={1370} y={330} width={150} height={150} rx={10} fill={hot(clamp01((coldT - 20) / 60))} />
				<g fontFamily={palette.fontDisplay} fontWeight={800} fontSize={34} fill="#FFFFFF" textAnchor="middle">
					<text x={1295} y={415}>{`${Math.round(hotT)} °C`}</text>
					<text x={1445} y={415}>{`${Math.round(coldT)} °C`}</text>
				</g>
				<g opacity={1 - balance}>
					<path d={`M1320 290 L1420 290`} stroke={palette.lesson} strokeWidth={8} strokeLinecap="round" strokeDasharray="16 10" strokeDashoffset={-time * 40} />
					<path d="M1420 278 L1440 290 L1420 302 Z" fill={palette.lesson} />
					<text x={1370} y={270} textAnchor="middle" fontFamily={palette.fontBody} fontWeight={800} fontSize={24} fill={palette.lesson}>
						Isı
					</text>
				</g>
			</g>
			<ProcessLabel id="iletim" at={[(ROD.x0 + front) / 2, ROD.y]} to={[230, 230]} text="Tanecikten taneciğe" show={clock.now('iletim')} size={23} />
			<ProcessLabel id="konveksiyon" at={[(POT.x0 + POT.x1) / 2, POT.y0 + 60]} to={[610, 230]} text="Sıcak yükselir, soğuk çöker" show={clock.now('konveksiyon')} size={22} />
			<ProcessLabel id="isima" at={[990, 400]} to={[990, 200]} text="Boşlukta da yayılır" show={clock.now('isima')} size={23} />
			<ProcessLabel id="sicak" at={[1295, 470]} to={[1295, 560]} text="Sıcak" show={clock.now('denge')} />
			<ProcessLabel id="soguk" at={[1445, 470]} to={[1445, 560]} text="Soğuk" show={clock.now('denge')} />
		</ProcessFrame>
	);
};
