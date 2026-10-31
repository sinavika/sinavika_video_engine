import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {withAlpha} from '../../../Themes/Theme';
import {useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import {useElementState} from '../VisualTimeline';
import {type CourseVisual} from '../VisualSchema';
import {PYRAMID_SHAPES} from './GeographySchema';
import {H, Tag, usePartLook, W, World} from '../VisualWorld';

// ---------------------------------------------------------------- population pyramid

type Pyramid = Extract<CourseVisual, {kind: 'pyramid'}>;
type PyramidShape = (typeof PYRAMID_SHAPES)[number];

/** The seventeen five-year age groups, youngest first, as TÜİK and ÖSYM draw them. */
export const AGE_GROUPS = ['0-4', '5-9', '10-14', '15-19', '20-24', '25-29', '30-34', '35-39', '40-44', '45-49', '50-54', '55-59', '60-64', '65-69', '70-74', '75-79', '80+'];
/** Rows of the three broad age groups: children 0–14, working age 15–64, elderly 65+. */
const BANDS = [
	{id: 'cocuk', name: '0-14 yaş', rows: [0, 1, 2]},
	{id: 'calisma', name: '15-64 yaş', rows: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12]},
	{id: 'yasli', name: '65+ yaş', rows: [13, 14, 15, 16]},
] as const;

/**
 * Relative size of each age group for the five pyramid types of the MEB textbook. `wide`: high births and high
 * deaths, a broad base narrowing fast (least developed); `triangle`: births still high, deaths falling, fast growth
 * (developing); `asymmetric`: births have fallen sharply, so the base is narrower than the groups above it;
 * `beehive`: low births and deaths, long lives, many elderly (developed); `bell`: births low for a while, then rising
 * again, so the base widens again.
 */
const SHAPE_WEIGHTS: Record<PyramidShape, number[]> = {
	wide: AGE_GROUPS.map((_, index) => 0.82 ** index),
	triangle: AGE_GROUPS.map((_, index) => Math.max(0.03, 1 - index / 16.5) ** 1.15),
	asymmetric: AGE_GROUPS.map((_, index) => (index < 3 ? (1 - 3 / 18) * [0.78, 0.86, 0.94][index] : 1 - index / 18)),
	beehive: [0.75, 0.75, 0.75, 0.85, 0.85, 0.85, 1, 1, 1, 1, 1, 1, 1, 0.85, 0.7, 0.55, 0.55],
	bell: [1.05, 1, 0.92, 0.85, 0.85, 0.85, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.75, 0.6, 0.45, 0.4],
};

/**
 * Percent of the whole population in each age group and sex (male, female), from a shape or from given data;
 * the two sides together sum to 100. Women outlive men, so older female groups are a little wider.
 */
export const pyramidShares = (pyramid: Pyramid['pyramids'][number]): {male: number[]; female: number[]} => {
	if (pyramid.male && pyramid.female) return {male: pyramid.male, female: pyramid.female};
	const weights = SHAPE_WEIGHTS[pyramid.shape ?? 'triangle'];
	const male = weights.map((weight) => weight * 0.51);
	const female = weights.map((weight, index) => weight * 0.49 * (1 + 0.06 * Math.max(0, index - 11)));
	const total = [...male, ...female].reduce((sum, value) => sum + value, 0);
	return {male: male.map((value) => (value / total) * 100), female: female.map((value) => (value / total) * 100)};
};

/** Share (%) of children, working-age and elderly people, and of each sex, rounded to whole percents. */
export const pyramidSummary = (pyramid: Pyramid['pyramids'][number]) => {
	const {male, female} = pyramidShares(pyramid);
	const sumRows = (rows: readonly number[]) => rows.reduce((sum, row) => sum + male[row] + female[row], 0);
	const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);
	const all = sum(male) + sum(female);
	return {
		cocuk: Math.round((sumRows(BANDS[0].rows) / all) * 100),
		calisma: Math.round((sumRows(BANDS[1].rows) / all) * 100),
		yasli: Math.round((sumRows(BANDS[2].rows) / all) * 100),
		erkek: Math.round((sum(male) / all) * 1000) / 10,
		kadin: Math.round((sum(female) / all) * 1000) / 10,
	};
};

const MALE = '#4A86C5';
const FEMALE = '#D9667B';
const percent = (value: number) => `%${String(value).replace('.', ',')}`;

/**
 * One to four population pyramids side by side, men on the left, women on the right, age groups up the middle and
 * the share of the population along the bottom, all on one scale so they can be compared. Bars grow outwards from
 * the youngest group up. Parts: erkek, kadin (a sex lit), cocuk, calisma, yasli (an age band lit, the rest dimmed;
 * with `shares` its share is written under each pyramid), p1…p4 (each pyramid).
 */
export const PyramidVisual: React.FC<VisualBoxProps & {visual: Pyramid}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const looks = [usePartLook('p1', easeFrom(seconds, delaySeconds, 0.6)), usePartLook('p2', easeFrom(seconds, delaySeconds + 0.25, 0.6)), usePartLook('p3', easeFrom(seconds, delaySeconds + 0.5, 0.6)), usePartLook('p4', easeFrom(seconds, delaySeconds + 0.75, 0.6))];
	const sexes = {erkek: useElementState('erkek'), kadin: useElementState('kadin')};
	const bands = {cocuk: useElementState('cocuk'), calisma: useElementState('calisma'), yasli: useElementState('yasli')};
	const bandFocus = Math.max(bands.cocuk.emphasis, bands.calisma.emphasis, bands.yasli.emphasis);

	const count = visual.pyramids.length;
	// Side by side in one row, or (`grid`, three or four pyramids) two rows of two: taller pyramids in a narrow box.
	const rows = visual.layout === 'grid' && count > 2 ? 2 : 1;
	const cols = Math.ceil(count / rows);
	const grid = rows === 2;
	const cellW = W / cols;
	const cellH = H / rows;
	const gap = grid ? 76 : count <= 2 ? 88 : 66;
	const half = (cellW - gap - 36) / 2;
	const data = visual.pyramids.map(pyramidShares);
	const widest = Math.max(...data.flatMap((side) => [...side.male, ...side.female]));
	const scaleStep = widest > 8 ? 2 : 1;
	const scaleTop = Math.max(scaleStep, Math.ceil(widest / scaleStep) * scaleStep);
	const ticks = count >= 3 ? [scaleTop] : [scaleTop / 2, scaleTop].filter((tick) => Number.isInteger(tick));
	// Fewer, larger age labels as pyramids get smaller: every group alone, every other one for two, every fourth for more.
	const ageEvery = count === 1 ? 1 : count === 2 ? 2 : 4;
	const ageSize = grid ? 18 : count === 1 ? 19 : count === 2 ? 21 : 18;
	const geometry = (p: number) => {
		const cellLeft = (p % cols) * cellW;
		const cellTop = Math.floor(p / cols) * cellH;
		const top = cellTop + (grid ? 50 : 104);
		const bottom = cellTop + cellH - (grid ? 40 : 94);
		const row = (bottom - top) / AGE_GROUPS.length;
		return {centre: cellLeft + cellW / 2, cellTop, top, bottom, row, yOf: (index: number) => bottom - (index + 1) * row};
	};

	return (
		<World width={width} height={height}>
			{visual.pyramids.map((pyramid, p) => {
				const look = looks[p];
				const {centre, cellTop, top, bottom, row, yOf} = geometry(p);
				const side = data[p];
				const summary = pyramidSummary(pyramid);
				const outline = look.focused > 0.5 ? palette.lesson : 'none';
				return (
					<g key={p} opacity={look.opacity}>
						{/* An age band pointed at: tinted behind the bars. */}
						{BANDS.map((band) => {
							const state = bands[band.id];
							if (state.emphasis <= 0) return null;
							const high = yOf(band.rows[band.rows.length - 1]);
							const low = yOf(band.rows[0]) + row;
							return <rect key={band.id} x={centre - half - gap / 2 - 6} y={high - 2} width={half * 2 + gap + 12} height={low - high + 4} rx={8} fill={withAlpha(palette.lesson, 0.13 * state.emphasis)} stroke={withAlpha(palette.lesson, 0.6 * state.emphasis)} strokeWidth={2} />;
						})}
						{AGE_GROUPS.map((age, index) => {
							const grow = easeFrom(seconds, delaySeconds + 0.2 + p * 0.25 + index * 0.035, 0.45);
							const inBand = BANDS.find((band) => (band.rows as readonly number[]).includes(index));
							const bandLit = inBand ? bands[inBand.id].emphasis : 0;
							const rowOpacity = 1 - 0.6 * bandFocus * (1 - bandLit);
							const maleWidth = (side.male[index] / scaleTop) * half * grow;
							const femaleWidth = (side.female[index] / scaleTop) * half * grow;
							const y = yOf(index) + row * 0.09;
							const barHeight = row * 0.82;
							const maleFill = sexes.erkek.emphasis > 0.5 ? palette.lesson : MALE;
							const femaleFill = sexes.kadin.emphasis > 0.5 ? palette.lesson : FEMALE;
							return (
								<g key={age} opacity={rowOpacity}>
									<rect x={centre - gap / 2 - maleWidth} y={y} width={maleWidth} height={barHeight} rx={2} fill={maleFill} opacity={1 - 0.5 * sexes.kadin.emphasis} />
									<rect x={centre + gap / 2} y={y} width={femaleWidth} height={barHeight} rx={2} fill={femaleFill} opacity={1 - 0.5 * sexes.erkek.emphasis} />
									{index % ageEvery === 0 ? <Tag x={centre} y={y + barHeight / 2} text={age} anchor="middle" size={ageSize} weight={600} focused={bandLit > 0.5 ? 0.4 : 0} /> : null}
								</g>
							);
						})}
						{/* Axis: share of the whole population, the same scale on every pyramid. */}
						<line x1={centre - gap / 2 - half} y1={bottom + 4} x2={centre - gap / 2} y2={bottom + 4} stroke={palette.axis} strokeWidth={2} />
						<line x1={centre + gap / 2} y1={bottom + 4} x2={centre + gap / 2 + half} y2={bottom + 4} stroke={palette.axis} strokeWidth={2} />
						{(grid && visual.shares ? [] : [0, ...ticks]).map((tick) => (
							<g key={tick}>
								<Tag x={centre - gap / 2 - (tick / scaleTop) * half} y={bottom + (grid ? 18 : 26)} text={tick === 0 ? '0' : percent(tick)} anchor={tick === scaleTop ? 'start' : 'middle'} size={grid ? 16 : 18} weight={600} fill={palette.muted} />
								<Tag x={centre + gap / 2 + (tick / scaleTop) * half} y={bottom + (grid ? 18 : 26)} text={tick === 0 ? '0' : percent(tick)} anchor={tick === scaleTop ? 'end' : 'middle'} size={grid ? 16 : 18} weight={600} fill={palette.muted} />
							</g>
						))}
						{/* Sexes over each half, the name over the pyramid. */}
						<Tag x={centre - gap / 2 - half / 2} y={grid ? cellTop + 22 : top - 20} text="Erkek" anchor="middle" size={count >= 3 ? 18 : 22} fill={MALE} focused={sexes.erkek.emphasis} />
						<Tag x={centre + gap / 2 + half / 2} y={grid ? cellTop + 22 : top - 20} text="Kadın" anchor="middle" size={count >= 3 ? 18 : 22} fill={FEMALE} focused={sexes.kadin.emphasis} />
						<Tag x={centre} y={cellTop + (grid ? 22 : 26)} text={pyramid.label} anchor="middle" size={grid ? 28 : count >= 3 ? 30 : 34} weight={800} focused={look.focused} />
						{pyramid.note && !grid ? <Tag x={centre} y={58} text={pyramid.note} anchor="middle" size={count >= 3 ? 19 : 22} weight={600} fill={palette.muted} /> : null}
						<rect x={centre - half - gap / 2 - 10} y={grid ? cellTop + 2 : top - 36} width={half * 2 + gap + 20} height={grid ? cellH - 4 : bottom - top + 76} rx={12} fill="none" stroke={outline} strokeWidth={4} />
						{/* Shares of the lit band or sex. */}
						{visual.shares
							? (['cocuk', 'calisma', 'yasli'] as const).map((id) => {
									const state = bands[id];
									if (state.emphasis <= 0) return null;
									const name = BANDS.find((band) => band.id === id)?.name ?? '';
									return <Tag key={id} x={centre} y={bottom + (grid ? 18 : 66)} text={`${name}: ${percent(summary[id])}`} anchor="middle" size={count >= 3 ? 21 : 26} weight={800} focused={state.emphasis} />;
								})
							: null}
						{visual.shares
							? (['erkek', 'kadin'] as const).map((id) => {
									const state = sexes[id];
									if (state.emphasis <= 0) return null;
									return <Tag key={id} x={centre} y={bottom + (grid ? 18 : 66)} text={`${id === 'erkek' ? 'Erkek' : 'Kadın'}: ${percent(summary[id])}`} anchor="middle" size={count >= 3 ? 21 : 26} weight={800} focused={state.emphasis} />;
								})
							: null}
					</g>
				);
			})}
		</World>
	);
};
