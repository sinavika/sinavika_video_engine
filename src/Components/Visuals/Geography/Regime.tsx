import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {NATURE_COLORS as C} from '../../../Configurations/NatureColors';
import {withAlpha} from '../../../Themes/Theme';
import {useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import {useElementState} from '../VisualTimeline';
import {type CourseVisual} from '../VisualSchema';
import {pathOf, Tag, usePartLook, World} from '../VisualWorld';
import {MONTH_LETTERS, SEASONS} from './Climate';

// ---------------------------------------------------------------- river regime

type Regime = Extract<CourseVisual, {kind: 'regime'}>;

/** The rivers' line colours: water blues and a violet, apart enough to tell three rivers apart. */
const RIVER_COLOURS = [C.waterDeep, '#3FA7D6', '#7A4FD6'];

/** The months of the spring snowmelt in Türkiye's mountains (Mart, Nisan, Mayıs). */
export const SNOWMELT_MONTHS = [2, 3, 4];

/**
 * A river's flow as it is drawn: in percent of its largest month (`relative`, a schematic where the shape matters) or
 * as given (m³/s), with the months of its highest and lowest flow (the first of equals).
 */
export const regimeSeries = (flow: readonly number[], unit: Regime['unit']) => {
	const largest = Math.max(...flow, 0);
	const values = unit === 'relative' && largest > 0 ? flow.map((value) => (value / largest) * 100) : [...flow];
	const high = values.indexOf(Math.max(...values));
	const low = values.indexOf(Math.min(...values));
	return {values, high, low};
};

/**
 * Where each river's flood and low-water labels go: above (flood) or below (low) its point, moved one line further for
 * every earlier river whose label would land on the same spot (two rivers peaking in the same month).
 */
export const markLabelOffsets = (marks: readonly {month: number; y: number}[], line: number): number[] =>
	marks.map((mark, index) => line * marks.slice(0, index).filter((other) => other.month === mark.month && Math.abs(other.y - mark.y) < line * 1.5).length);

/** The legend's items in one row from `left`: each a colour swatch and the river's name. */
export const legendRow = (names: readonly string[], left: number, letter = 9.6, gap = 34) => {
	let x = left;
	return names.map((name) => {
		const at = x;
		x += 38 + name.length * letter + gap;
		return at;
	});
};

/** The largest value an axis needs and its step: a round top with at most five steps. */
export const regimeAxis = (largest: number) => {
	const step = [10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 2500, 5000].find((candidate) => Math.ceil(largest / candidate) <= 5) ?? 5000;
	return {top: Math.max(step, Math.ceil(largest / step) * step), step};
};

/**
 * A river regime (akarsu rejimi) as atlases draw it: the mean monthly flow of one to three rivers as lines over the
 * months, January first. Parts: r1, r2, r3 (a river's line), taskin (each river's highest month), kurak (its lowest),
 * kar (the snowmelt months, with `snowmelt`), and the seasons kis, ilkbahar, yaz, sonbahar.
 */
export const RegimeVisual: React.FC<VisualBoxProps & {visual: Regime}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const enter = (index: number) => easeFrom(seconds, delaySeconds + index * 0.5, 0.8);
	const looks = [usePartLook('r1', enter(0)), usePartLook('r2', enter(0.6)), usePartLook('r3', enter(1.2))];
	const flood = usePartLook('taskin', enter(2));
	const low = usePartLook('kurak', enter(2.4));
	const melt = usePartLook('kar', visual.snowmelt ? enter(1.6) : 0);
	const seasons = {kis: useElementState('kis'), ilkbahar: useElementState('ilkbahar'), yaz: useElementState('yaz'), sonbahar: useElementState('sonbahar')};

	const left = 120;
	const right = 900;
	const legendY = visual.title ? 66 : 30;
	const top = legendY + 70;
	const bottom = 520;
	const step = (right - left) / 12;
	const series = visual.rivers.map((river) => regimeSeries(river.flow, visual.unit));
	const axis = regimeAxis(Math.max(...series.flatMap((item) => item.values), 1));
	const yOf = (value: number) => bottom - (value / axis.top) * (bottom - top);
	const xOf = (month: number) => left + step * (month + 0.5);
	const ticks = Array.from({length: axis.top / axis.step + 1}, (_, index) => axis.step * index);
	const legend = legendRow(visual.rivers.map((river) => river.name), left);
	const highs = series.map((item) => ({month: item.high, y: yOf(item.values[item.high])}));
	const lows = series.map((item) => ({month: item.low, y: yOf(item.values[item.low])}));
	const highShift = markLabelOffsets(highs, 24);
	const lowShift = markLabelOffsets(lows, 24);

	return (
		<World width={width} height={height}>
			{/* The snowmelt months, then seasons lit when a beat points at them. */}
			<g opacity={melt.opacity}>
				<rect x={left + step * SNOWMELT_MONTHS[0]} y={top - 14} width={step * SNOWMELT_MONTHS.length} height={bottom - top + 14} fill={withAlpha('#9CC3E6', 0.35 + 0.25 * melt.focused)} />
				{/* Inside the band at its foot, clear of the peaks the snowmelt makes. */}
				<Tag x={left + step * (SNOWMELT_MONTHS[0] + SNOWMELT_MONTHS.length / 2)} y={bottom - 18} text="Kar erimesi" anchor="middle" size={18} focused={melt.focused} />
			</g>
			{SEASONS.map((season) =>
				seasons[season.id as keyof typeof seasons].emphasis > 0
					? season.months.map((month) => (
							<rect key={`${season.id}${month}`} x={left + step * month} y={top - 10} width={step} height={bottom - top + 10} fill={withAlpha(palette.lesson, 0.14 * seasons[season.id as keyof typeof seasons].emphasis)} />
						))
					: null,
			)}
			{ticks.map((value) => (
				<g key={value}>
					<line x1={left} y1={yOf(value)} x2={right} y2={yOf(value)} stroke={palette.grid} strokeWidth={1.4} />
					<Tag x={left - 12} y={yOf(value)} text={value.toLocaleString('tr-TR')} anchor="end" size={17} weight={600} fill={C.waterDeep} />
				</g>
			))}
			{/* The axis name runs up the axis, out of the way of the title and the legend. */}
			<g transform={`rotate(-90 ${left - 78} ${(top + bottom) / 2})`}>
				<Tag x={left - 78} y={(top + bottom) / 2} text={visual.unit === 'relative' ? 'Akım (en yüksek ay = 100)' : 'Akım (m³/sn)'} anchor="middle" size={17} fill={C.waterDeep} />
			</g>
			<line x1={left} y1={bottom} x2={right} y2={bottom} stroke={palette.axis} strokeWidth={2} />
			{/* Each river's line, drawn across the year, with a light fill under the first. */}
			{series.map((item, index) => {
				const look = looks[index];
				const colour = RIVER_COLOURS[index];
				const points = item.values.map((value, month) => [xOf(month), yOf(value)] as const);
				return (
					<g key={index}>
						{index === 0 ? <path d={pathOf([[xOf(0), bottom], ...points, [xOf(11), bottom]], true)} fill={withAlpha(colour, 0.12)} opacity={look.opacity} /> : null}
						<path d={pathOf(points)} fill="none" stroke={colour} strokeWidth={look.focused > 0.5 ? 7 : 4.5} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - look.drawn} opacity={look.drawn > 0 ? Math.max(0.3, look.opacity / Math.max(look.drawn, 0.01)) : 0} />
						<g opacity={look.opacity}>
							{points.map(([x, y], month) => (
								<circle key={month} cx={x} cy={y} r={5} fill={colour} stroke={palette.surface} strokeWidth={2} />
							))}
						</g>
						{/* The river's name, in its colour, in the legend row. */}
						<g opacity={look.opacity}>
							<line x1={legend[index]} y1={legendY} x2={legend[index] + 28} y2={legendY} stroke={colour} strokeWidth={5} strokeLinecap="round" />
							<Tag x={legend[index] + 38} y={legendY} text={visual.rivers[index].name} size={18} focused={look.focused} />
						</g>
						{/* Highest and lowest months. */}
						<g opacity={flood.opacity * look.opacity}>
							<circle cx={xOf(item.high)} cy={yOf(item.values[item.high])} r={11} fill="none" stroke={colour} strokeWidth={3.5} />
							<Tag x={xOf(item.high)} y={yOf(item.values[item.high]) - 26 - highShift[index]} text="Taşkın" anchor="middle" size={17} focused={flood.focused} />
						</g>
						<g opacity={low.opacity * look.opacity}>
							<circle cx={xOf(item.low)} cy={yOf(item.values[item.low])} r={11} fill="none" stroke={colour} strokeWidth={3.5} strokeDasharray="5 4" />
							<Tag x={xOf(item.low)} y={yOf(item.values[item.low]) + 26 + lowShift[index]} text="Kurak" anchor="middle" size={17} focused={low.focused} />
						</g>
					</g>
				);
			})}
			{MONTH_LETTERS.map((letter, month) => (
				<Tag key={month} x={xOf(month)} y={bottom + 26} text={letter} anchor="middle" size={19} weight={700} />
			))}
			{visual.title ? <Tag x={left} y={28} text={visual.title} size={22} weight={800} /> : null}
			{visual.unit === 'relative' ? <Tag x={right} y={bottom + 60} text="Şematik: değerler biçimi göstermek içindir" anchor="end" size={15} fill={palette.muted} /> : null}
		</World>
	);
};
