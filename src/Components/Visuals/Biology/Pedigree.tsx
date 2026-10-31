import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {withAlpha} from '../../../Themes/Theme';
import {useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {usePartLook, World} from '../VisualWorld';
import {GenotypeText} from './GenotypeText';

// ---------------------------------------------------------------- the pedigree chart

type Pedigree = Extract<CourseVisual, {kind: 'pedigree'}>;
type Person = Pedigree['people'][number];
type Sex = Person['sex'];
type State = Person['state'];

const UX = 150;
const S = 76;
const MARGIN = 80;
const TOP = 64;
const ITEM = 70;
const MARK = 46;
const LEGEND_TEXT = 30;

type LegendItem = {state: State; sexes: Sex[]; label: string};

/**
 * The legend: one row per state the chart uses, each with the male and female symbols side by side (sağlıklı,
 * hasta; taşıyıcı with the sexes that carry). Shapes already tell the sexes apart, so the words need not.
 */
const pedigreeLegend = (visual: Pedigree): LegendItem[] => {
	const carriers = (['f', 'm'] as const).filter((sex) => visual.people.some((person) => person.sex === sex && person.state === 'carrier'));
	return [
		{state: 'normal' as State, sexes: ['m', 'f'] as Sex[], label: visual.normalLabel},
		{state: 'affected' as State, sexes: ['m', 'f'] as Sex[], label: visual.affectedLabel},
		...(carriers.length ? [{state: 'carrier' as State, sexes: [...carriers] as Sex[], label: 'Taşıyıcı'}] : []),
	];
};
/** A legend item's width: its symbols, a gap, then the label at about 0.56 em a letter. */
const itemWidth = (item: LegendItem) => item.sexes.length * MARK + (item.sexes.length - 1) * 10 + 16 + item.label.length * 0.56 * LEGEND_TEXT;

/**
 * Where each person sits (x in columns, one row per generation), where each legend item sits, and the figure's whole
 * stage. The legend stands beside the chart (`side`) or in one row under it (`below`, with generations closer and
 * labels larger): a question's figure, in the narrow solution panel, keeps its people large that way.
 */
export const pedigreeLayout = (visual: Pedigree) => {
	const below = visual.legend === 'below';
	const uy = below ? 170 : 190;
	const labelSize = below ? 40 : 34;
	const xs = visual.people.map((person) => person.x);
	const minX = Math.min(...xs);
	const generations = Math.max(...visual.people.map((person) => person.generation));
	const chartWidth = 2 * MARGIN + (Math.max(...xs) - minX) * UX;
	const chartHeight = TOP + (generations - 1) * uy + S / 2 + (visual.people.some((person) => person.label) ? labelSize + 36 : 30);
	const legend = visual.legend === 'none' ? [] : pedigreeLegend(visual);
	const widths = legend.map(itemWidth);
	const row = widths.reduce((sum, w) => sum + w, 0) + 50 * Math.max(0, legend.length - 1);
	const width = below ? Math.max(chartWidth, row + 40) : chartWidth + (legend.length ? Math.max(...widths) + 50 : 0);
	const shift = below ? (width - chartWidth) / 2 : 0;
	const at = (person: Person) => ({x: shift + MARGIN + (person.x - minX) * UX, y: TOP + (person.generation - 1) * uy});
	const legendAt = (index: number) =>
		below ? {x: (width - row) / 2 + widths.slice(0, index).reduce((sum, w) => sum + w + 50, 0), y: chartHeight + 34} : {x: chartWidth + 20, y: 50 + index * ITEM};
	const height = below ? chartHeight + 74 : Math.max(chartHeight, 30 + legend.length * ITEM);
	return {at, uy, labelSize, legend, legendAt, width, height};
};

/**
 * A pedigree as ÖSYM draws it: squares for males, circles for females, filled when the trait shows, half filled for
 * a carrier, "?" for the one asked about; a line between partners (double for a marriage between relatives), the
 * children hanging from a sibship line in birth order. Each person may carry a label under the symbol: the number
 * the question uses or a genotype (X^RX^r). The legend beside it names the symbols. Generations come in one by one.
 * Parts: p<id> (the people).
 */
export const PedigreeVisual: React.FC<VisualBoxProps & {visual: Pedigree}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const layout = pedigreeLayout(visual);
	const byId = new Map(visual.people.map((person) => [person.id, person]));
	const arrival = (generation: number) => easeFrom(seconds, delaySeconds + 0.2 + (generation - 1) * 0.7, 0.6);
	const line = withAlpha(palette.ink, 0.75);
	return (
		<World width={width} height={height} viewWidth={layout.width} viewHeight={layout.height}>
			{visual.couples.map((couple, index) => {
				const [a, b] = couple.partners.map((id) => byId.get(id)!).sort((p, q) => p.x - q.x);
				const pa = layout.at(a);
				const pb = layout.at(b);
				const generation = a.generation;
				const mid = (pa.x + pb.x) / 2;
				const kids = couple.children.map((id) => byId.get(id)!).map((child) => layout.at(child).x);
				const sibY = pa.y + layout.uy / 2 + 6;
				const marry = arrival(generation);
				const descend = arrival(generation + 1);
				return (
					<g key={index} stroke={line} strokeWidth={3.5} fill="none">
						{couple.related ? (
							<g opacity={marry}>
								<line x1={pa.x + S / 2} x2={pb.x - S / 2} y1={pa.y - 5} y2={pb.y - 5} />
								<line x1={pa.x + S / 2} x2={pb.x - S / 2} y1={pa.y + 5} y2={pb.y + 5} />
							</g>
						) : (
							<line x1={pa.x + S / 2} x2={pb.x - S / 2} y1={pa.y} y2={pb.y} opacity={marry} />
						)}
						{kids.length > 0 ? (
							<g opacity={descend}>
								<line x1={mid} x2={mid} y1={pa.y} y2={sibY} />
								<line x1={Math.min(mid, ...kids)} x2={Math.max(mid, ...kids)} y1={sibY} y2={sibY} />
								{kids.map((x, k) => (
									<line key={k} x1={x} x2={x} y1={sibY} y2={sibY + layout.uy / 2 - 6 - S / 2} />
								))}
							</g>
						) : null}
					</g>
				);
			})}
			{visual.people.map((person) => (
				<Individual key={person.id} person={person} at={layout.at(person)} labelSize={layout.labelSize} entrance={arrival(person.generation)} />
			))}
			{layout.legend.map((item, index) => {
				const spot = layout.legendAt(index);
				return (
					<g key={item.state} opacity={easeFrom(seconds, delaySeconds + 0.4 + index * 0.15, 0.4)}>
						{item.sexes.map((sex, k) => (
							<Symbol key={sex} sex={sex} state={item.state} x={spot.x + MARK / 2 + k * (MARK + 10)} y={spot.y} size={MARK} />
						))}
						<text x={spot.x + item.sexes.length * (MARK + 10) + 6} y={spot.y + LEGEND_TEXT * 0.36} fontSize={LEGEND_TEXT} fontWeight={700} fill={palette.ink} fontFamily={palette.fontBody}>
							{item.label}
						</text>
					</g>
				);
			})}
		</World>
	);
};

const Individual: React.FC<{person: Person; at: {x: number; y: number}; labelSize: number; entrance: number}> = ({person, at, labelSize, entrance}) => {
	const palette = useVisualPalette();
	const look = usePartLook(`p${person.id}`, entrance);
	const lit = look.focused;
	return (
		<g opacity={look.opacity}>
			{lit > 0.02 ? <circle cx={at.x} cy={at.y} r={S * 0.78} fill={withAlpha(palette.lesson, 0.16 * lit)} stroke={withAlpha(palette.lesson, 0.7 * lit)} strokeWidth={3} /> : null}
			<g transform={`translate(${at.x} ${at.y}) scale(${(0.8 + 0.2 * entrance) * (1 + 0.08 * lit)}) translate(${-at.x} ${-at.y})`}>
				<Symbol sex={person.sex} state={person.state} x={at.x} y={at.y} size={S} />
			</g>
			{person.label ? <GenotypeText text={person.label} x={at.x} y={at.y + S / 2 + labelSize + 8} size={labelSize} textAnchor="middle" fontWeight={800} fill={lit > 0.5 ? palette.lesson : palette.ink} fontFamily={palette.fontBody} /> : null}
		</g>
	);
};

/** One symbol at (x, y): square male, circle female, diamond unknown sex; filled, half filled, or with "?". */
const Symbol: React.FC<{sex: Sex; state: State; x: number; y: number; size: number}> = ({sex, state, x, y, size}) => {
	const palette = useVisualPalette();
	const h = size / 2;
	const id = `pedigree${React.useId().replace(/:/g, '')}`;
	const shape =
		sex === 'm' ? (
			<rect x={x - h} y={y - h} width={size} height={size} rx={4} />
		) : sex === 'f' ? (
			<circle cx={x} cy={y} r={h} />
		) : (
			<polygon points={`${x},${y - h * 1.15} ${x + h * 1.15},${y} ${x},${y + h * 1.15} ${x - h * 1.15},${y}`} />
		);
	const filled = state === 'affected';
	return (
		<g>
			<defs>
				<clipPath id={id}>{shape}</clipPath>
			</defs>
			<g fill={filled ? palette.lesson : palette.surface} stroke={palette.ink} strokeWidth={size > 50 ? 3.5 : 2.5}>
				{shape}
			</g>
			{state === 'carrier' ? <rect x={x - h * 1.2} y={y - h * 1.2} width={h * 1.2} height={size * 1.2} fill={palette.lesson} clipPath={`url(#${id})`} /> : null}
			{state === 'carrier' ? <g fill="none" stroke={palette.ink} strokeWidth={size > 50 ? 3.5 : 2.5}>{shape}</g> : null}
			{state === 'unknown' ? (
				<text x={x} y={y + size * 0.2} textAnchor="middle" fontSize={size * 0.6} fontWeight={800} fill={palette.ink} fontFamily={palette.fontBody}>
					?
				</text>
			) : null}
		</g>
	);
};
