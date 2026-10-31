import React from 'react';
import {BRAND_TYPOGRAPHY} from '../../../Configurations/BrandTypography';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {useReveal, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {COMPARISON_ACCENTS} from './StructureLook';

type Venn = Extract<CourseVisual, {kind: 'venn'}>;

/**
 * The size of the items: it grows with the circles (a large two-set diagram of prime factors had small digits in
 * big empty circles) and shrinks when a region holds many lines, so the column stays inside its lens.
 */
const itemSize = (radius: number, lines: number, longest: number, u: (value: number) => number) =>
	Math.max(u(26), Math.min(u(56), radius * 0.2, (radius * 1.05) / (Math.max(1, lines) * 1.3), (radius * 0.85) / (Math.max(1, longest) * 0.56)));

/** Two or three overlapping sets with their own items and the shared ones in the middle. */
export const VennVisual: React.FC<VisualBoxProps & {visual: Venn}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const three = visual.sets.length === 3;
	const radius = Math.min(width, height) * (three ? 0.28 : 0.32);
	const cx = width / 2;
	const cy = height / 2 + (three ? radius * 0.18 : 0);
	const centres: [number, number][] = three
		? [[cx - radius * 0.6, cy - radius * 0.35], [cx + radius * 0.6, cy - radius * 0.35], [cx, cy + radius * 0.65]]
		: [[cx - radius * 0.62, cy], [cx + radius * 0.62, cy]];
	const colours = COMPARISON_ACCENTS(palette);
	const shared = useReveal(delaySeconds + visual.sets.length * 0.4 + 0.2, 0.4);
	// One size for every region, so a shared "2" and an own "2" read as the same kind of thing.
	const lines = Math.max(visual.shared.length, ...visual.sets.map((set) => set.items.length));
	const longest = Math.max(...visual.shared.map((item) => item.length), ...visual.sets.flatMap((set) => set.items.map((item) => item.length)));
	const size = itemSize(three ? radius * 0.8 : radius, lines, longest, u);

	return (
		<svg width={width} height={height} style={{overflow: 'visible'}}>
			{visual.sets.map((set, index) => (
				<VennSet key={index} centre={centres[index]} radius={radius} colour={colours[index]} label={set.label} items={set.items} size={size} away={[centres[index][0] - cx, centres[index][1] - cy]} labelAbove={!three} delaySeconds={delaySeconds + index * 0.4} />
			))}
			<g opacity={shared}>
				{visual.shared.map((item, index) => (
					<text key={index} x={cx} y={(three ? cy - radius * 0.05 : cy) + (index - (visual.shared.length - 1) / 2) * size * 1.3} dominantBaseline="middle" textAnchor="middle" fill={palette.ink} style={{fontFamily: palette.fontBody, fontWeight: 700, fontSize: size}}>
						{item}
					</text>
				))}
			</g>
		</svg>
	);
};

/**
 * One set of a Venn diagram. Two sets name themselves above their circles: beside them (where a third set's
 * names go) a label such as "A: 8 eleman" ran past the box's sides.
 */
const VennSet: React.FC<{centre: [number, number]; radius: number; colour: string; label: string; items: string[]; size: number; away: [number, number]; labelAbove: boolean; delaySeconds: number}> = ({centre, radius, colour, label, items, size, away, labelAbove, delaySeconds}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const show = useReveal(delaySeconds, 0.45, 'overshoot');
	const length = Math.hypot(away[0], away[1]) || 1;
	const itemsAt = [centre[0] + (away[0] / length) * radius * 0.45, centre[1] + (away[1] / length) * radius * 0.45];
	const labelAt = labelAbove
		? [centre[0] + (away[0] / length) * radius * 0.35, centre[1] - radius - u(18)]
		: [centre[0] + (away[0] / length) * radius * 1.12, centre[1] + (away[1] / length) * radius * 1.12 + (away[1] > 0 ? u(36) : -u(6))];
	return (
		<g opacity={Math.min(1, show)}>
			<circle cx={centre[0]} cy={centre[1]} r={radius * show} fill={colour} fillOpacity={0.16} stroke={colour} strokeWidth={u(5)} />
			<text x={labelAt[0]} y={labelAt[1]} textAnchor="middle" fill={colour} style={{fontFamily: palette.fontDisplay, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(40)}}>
				{label}
			</text>
			{items.map((item, index) => (
				<text key={index} x={itemsAt[0]} y={itemsAt[1] + (index - (items.length - 1) / 2) * size * 1.3} dominantBaseline="middle" textAnchor="middle" fill={palette.ink} style={{fontFamily: palette.fontBody, fontWeight: 600, fontSize: size}}>
					{item}
				</text>
			))}
		</g>
	);
};
