import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {NATURE_COLORS as C} from '../../../Configurations/NatureColors';
import {withAlpha} from '../../../Themes/Theme';
import {useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import {useElementState} from '../VisualTimeline';
import {type CourseVisual} from '../VisualSchema';
import {pathOf, Tag, usePartLook, World} from '../VisualWorld';

// ---------------------------------------------------------------- climate graph

type Climate = Extract<CourseVisual, {kind: 'climate'}>;

const MONTH_LETTERS = ['O', 'Ş', 'M', 'N', 'M', 'H', 'T', 'A', 'E', 'E', 'K', 'A'];
/** Months of each season (0 = Ocak), as Turkish lessons count them: winter is Aralık, Ocak, Şubat. */
const SEASONS: {id: string; name: string; months: number[]}[] = [
	{id: 'kis', name: 'Kış', months: [11, 0, 1]},
	{id: 'ilkbahar', name: 'İlkbahar', months: [2, 3, 4]},
	{id: 'yaz', name: 'Yaz', months: [5, 6, 7]},
	{id: 'sonbahar', name: 'Sonbahar', months: [8, 9, 10]},
];
const niceCeiling = (value: number, step: number) => Math.max(step, Math.ceil(value / step) * step);

/**
 * A climate graph (sıcaklık-yağış grafiği) as Turkish atlases and ÖSYM draw it: monthly precipitation as blue bars
 * on the left axis (mm), monthly mean temperature as a red line on the right axis (°C), months by their initials.
 * Parts: yagis (the bars), sicaklik (the line), sifir (the 0 °C line, when the line goes below it), kis, ilkbahar,
 * yaz, sonbahar (a season's months lit), ozet (the annual total and the annual temperature range).
 */
export const ClimateVisual: React.FC<VisualBoxProps & {visual: Climate}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const enter = (index: number) => easeFrom(seconds, delaySeconds + index * 0.4, 0.8);
	const bars = usePartLook('yagis', enter(0));
	const line = usePartLook('sicaklik', enter(1));
	const zero = usePartLook('sifir', enter(1.5));
	const summary = usePartLook('ozet', visual.summary ? enter(2) : 0);
	const seasons = {kis: useElementState('kis'), ilkbahar: useElementState('ilkbahar'), yaz: useElementState('yaz'), sonbahar: useElementState('sonbahar')};

	const left = 120;
	const right = 880;
	const top = visual.title || visual.summary ? 96 : 50;
	const bottom = 520;
	const step = (right - left) / 12;
	// Round ticks: the smallest step that needs at most six of them (0–50 by 10, 0–300 by 50, 0–400 by 100).
	const wettest = Math.max(...visual.precipitation, 1);
	const rainStep = [5, 10, 20, 25, 50, 100, 200].find((candidate) => niceCeiling(wettest, candidate) / candidate <= 6) ?? 200;
	const rainTop = niceCeiling(wettest, rainStep);
	const coldest = Math.min(...visual.temperature);
	const warmest = Math.max(...visual.temperature);
	const tempLow = coldest < 0 ? -niceCeiling(-coldest, 10) : 0;
	const tempHigh = niceCeiling(warmest, 10);
	const yRain = (mm: number) => bottom - (mm / rainTop) * (bottom - top);
	const yTemp = (c: number) => bottom - ((c - tempLow) / (tempHigh - tempLow)) * (bottom - top);
	const rainTicks = Array.from({length: rainTop / rainStep + 1}, (_, index) => rainStep * index);
	const tempTicks = Array.from({length: Math.round((tempHigh - tempLow) / 10) + 1}, (_, index) => tempLow + index * 10);
	const linePath = pathOf(visual.temperature.map((c, month) => [left + step * (month + 0.5), yTemp(c)] as const));
	const total = visual.precipitation.reduce((sum, mm) => sum + mm, 0);
	const range = Math.round((warmest - coldest) * 10) / 10;
	const bandOf = (id: string) => seasons[id as keyof typeof seasons];

	return (
		<World width={width} height={height}>
			{/* Seasons lit when a beat points at them; winter wraps round the year's two ends. */}
			{SEASONS.map((season) => {
				const state = bandOf(season.id);
				if (state.emphasis <= 0) return null;
				return season.months.map((month) => (
					<rect key={`${season.id}${month}`} x={left + step * month} y={top - 10} width={step} height={bottom - top + 10} fill={withAlpha(palette.lesson, 0.14 * state.emphasis)} />
				));
			})}
			{SEASONS.map((season) => {
				const state = bandOf(season.id);
				if (state.emphasis <= 0) return null;
				const middle = season.id === 'kis' ? null : left + step * (season.months[1] + 0.5);
				return middle === null ? (
					<g key={season.id} opacity={state.emphasis}>
						<Tag x={left + step * 1} y={top - 22} text="Kış" anchor="middle" size={19} focused={1} />
						<Tag x={left + step * 11.5} y={top - 22} text="Kış" anchor="middle" size={19} focused={1} />
					</g>
				) : (
					<g key={season.id} opacity={state.emphasis}>
						<Tag x={middle} y={top - 22} text={season.name} anchor="middle" size={19} focused={1} />
					</g>
				);
			})}
			{/* Axes: precipitation on the left, temperature on the right. */}
			{rainTicks.map((mm) => (
				<g key={`r${mm}`}>
					<line x1={left} y1={yRain(mm)} x2={right} y2={yRain(mm)} stroke={palette.grid} strokeWidth={1.4} />
					<Tag x={left - 12} y={yRain(mm)} text={String(Math.round(mm))} anchor="end" size={17} weight={600} fill={C.waterDeep} />
				</g>
			))}
			{tempTicks.map((c) => (
				<Tag key={`t${c}`} x={right + 12} y={yTemp(c)} text={String(c)} size={17} weight={600} fill="#C0392B" />
			))}
			<Tag x={left - 12} y={top - 34} text="Yağış (mm)" anchor="end" size={17} fill={C.waterDeep} />
			<Tag x={right + 12} y={top - 34} text="Sıcaklık (°C)" size={17} fill="#C0392B" />
			<line x1={left} y1={bottom} x2={right} y2={bottom} stroke={palette.axis} strokeWidth={2} />
			{/* Precipitation bars, growing month by month. */}
			<g opacity={Math.min(1, bars.opacity * 1.2)}>
				{visual.precipitation.map((mm, month) => {
					const grow = easeFrom(seconds, delaySeconds + 0.2 + month * 0.06, 0.5) * (bars.opacity > 0 ? 1 : 0);
					const y = yRain(mm * grow);
					return <rect key={month} x={left + step * month + step * 0.16} y={y} width={step * 0.68} height={bottom - y} rx={4} fill={bars.focused > 0.5 ? palette.lesson : C.water} opacity={0.85} />;
				})}
			</g>
			{/* The freezing line, when some month is below it. */}
			{coldest < 0 ? (
				<g opacity={zero.opacity}>
					<line x1={left} y1={yTemp(0)} x2={right} y2={yTemp(0)} stroke="#C0392B" strokeWidth={zero.focused > 0.5 ? 3.5 : 2} strokeDasharray="10 7" />
					<Tag x={left + 8} y={yTemp(0) - 16} text="0 °C" size={17} fill="#C0392B" focused={zero.focused} />
				</g>
			) : null}
			{/* Temperature line, drawn across the year. */}
			<path d={linePath} fill="none" stroke={line.focused > 0.5 ? palette.lesson : '#C0392B'} strokeWidth={line.focused > 0.5 ? 6 : 4.5} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - line.drawn} opacity={line.drawn > 0 ? Math.max(0.35, line.opacity / Math.max(line.drawn, 0.01)) : 0} />
			<g opacity={line.opacity}>
				{visual.temperature.map((c, month) => (
					<circle key={month} cx={left + step * (month + 0.5)} cy={yTemp(c)} r={5.5} fill="#C0392B" stroke={palette.surface} strokeWidth={2} />
				))}
			</g>
			{/* Months. */}
			{MONTH_LETTERS.map((letter, month) => (
				<Tag key={month} x={left + step * (month + 0.5)} y={bottom + 26} text={letter} anchor="middle" size={19} weight={700} />
			))}
			{visual.title ? <Tag x={left} y={30} text={visual.title} size={24} weight={800} /> : null}
			<g opacity={summary.opacity}>
				<Tag x={right} y={30} text={`Yıllık yağış ≈ ${total.toLocaleString('tr-TR')} mm · Sıcaklık farkı ${String(range).replace('.', ',')} °C`} anchor="end" size={18} focused={summary.focused} />
			</g>
		</World>
	);
};
