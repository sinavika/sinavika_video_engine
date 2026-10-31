import React from 'react';
import {clamp01, lerp, smooth} from '../../../Animations/Motion';
import {mixColors} from '../../../Themes/ColorPalette';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useBeatStartFor} from '../VisualTimeline';

type Stoichiometry = Extract<CourseVisual, {kind: 'stoichiometry'}>;
type Species = {atoms: string[]; coefficient: number};

/** The stage (CourseVisual keeps this ratio). */
export const STOICHIOMETRY_STAGE = {width: 1600, height: 720};

const LEFT = {x: 40, label: 70, area: [170, 690] as const};
const RIGHT = {x: 900, label: 930, area: [1030, 1550] as const};
const AREA_WIDTH = 520;
const TOP = 120;
const BOTTOM = 630;
const ARROW = {from: 735, to: 865, y: 375};
const ATOM_R = 17;
const ATOM_GAP = 24;
const BOND = 27;
const GROUP_GAP = 30;

/**
 * Where the atoms of one molecule sit around its centre: two atoms side by side; three or more around a central atom
 * (the one element that occurs once and is not H): bent for O and S with two partners (water), else spread evenly.
 */
export const atomOffsets = (atoms: string[]): {x: number; y: number}[] => {
	if (atoms.length <= 2) return atoms.map((_, index) => ({x: (index - (atoms.length - 1) / 2) * ATOM_GAP, y: 0}));
	const unique = atoms.findIndex((atom) => atom !== 'H' && atoms.indexOf(atom) === atoms.lastIndexOf(atom));
	const firstHeavy = Math.max(
		0,
		atoms.findIndex((atom) => atom !== 'H'),
	);
	const centre = unique >= 0 ? unique : firstHeavy;
	const partners = atoms.map((_, index) => index).filter((index) => index !== centre);
	const bent = partners.length === 2 && (atoms[centre] === 'O' || atoms[centre] === 'S');
	const angles = bent ? [90 + 52.25, 90 - 52.25] : partners.length === 2 ? [180, 0] : partners.map((_, index) => -90 + (360 / partners.length) * index);
	const raw = atoms.map((_, index) => {
		const at = partners.indexOf(index);
		return at < 0 ? {x: 0, y: 0} : {x: BOND * Math.cos((angles[at] * Math.PI) / 180), y: BOND * Math.sin((angles[at] * Math.PI) / 180)};
	});
	// Centre the drawing on its box, so a bent molecule sits in the middle of its slot.
	const xs = raw.map((point) => point.x);
	const ys = raw.map((point) => point.y);
	const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
	const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
	return raw.map((point) => ({x: point.x - cx, y: point.y - cy}));
};

/** Half the size of a molecule's drawing (its widest reach from the centre, atom included). */
const moleculeHalf = (atoms: string[]): number => Math.max(...atomOffsets(atoms).map((point) => Math.max(Math.abs(point.x), Math.abs(point.y)))) + ATOM_R;

const atomRadius = (symbol: string) => (symbol === 'H' ? ATOM_R * 0.8 : ATOM_R);

/** How many times the equation can run with the particles given (the limiting reactant decides). */
export const reactionTurns = (reactants: {coefficient: number; count: number}[]): number => Math.min(...reactants.map((reactant) => Math.floor(reactant.count / reactant.coefficient)));

/** Atoms on one side of the equation, by element. */
export const atomTally = (species: Species[]): Record<string, number> => {
	const tally: Record<string, number> = {};
	for (const item of species) for (const atom of item.atoms) tally[atom] = (tally[atom] ?? 0) + item.coefficient;
	return tally;
};

/** Whether the equation is balanced: the same atoms, as many of each, on both sides. */
export const isBalanced = (reactants: Species[], products: Species[]): boolean => {
	const left = atomTally(reactants);
	const right = atomTally(products);
	const elements = new Set([...Object.keys(left), ...Object.keys(right)]);
	return [...elements].every((element) => left[element] === right[element]);
};

const rowsOf = (counts: number[], perRow: number) => counts.reduce((sum, count) => sum + Math.ceil(count / perRow), 0);

type Arrangement = {perRow: number; slot: number; row: number; size: number};

/**
 * How the molecules are laid out: two to four in a row, whichever lets them be drawn largest (at most 1.8 times) while
 * both boxes still fit; few molecules are drawn big, a crowded reaction small.
 */
export const arrangement = (species: {atoms: string[]}[], leftCounts: number[], rightCounts: number[]): Arrangement => {
	const half = Math.max(...species.map((item) => moleculeHalf(item.atoms)));
	let best: Arrangement = {perRow: 4, slot: AREA_WIDTH / 4, row: 0, size: 0};
	for (const perRow of [4, 3, 2]) {
		const slot = AREA_WIDTH / perRow;
		const fit = (counts: number[]) => ((BOTTOM - TOP - (counts.length - 1) * GROUP_GAP) / Math.max(1, rowsOf(counts, perRow)) - 16) / (2 * half);
		const size = Math.min(1.8, (slot - 14) / (2 * half), fit(leftCounts), fit(rightCounts));
		if (size > best.size + 1e-9) best = {perRow, slot, row: 2 * half * size + 16, size};
	}
	return best;
};

/** Where the n-th molecule of a group sits: groups stack in rows, centred in the box's height. */
const layout = (counts: number[], area: readonly [number, number], {perRow, slot, row}: Arrangement) => {
	const height = rowsOf(counts, perRow) * row + (counts.length - 1) * GROUP_GAP;
	let y = (TOP + BOTTOM) / 2 - height / 2 + row / 2;
	return counts.map((count) => {
		const top = y;
		y += Math.ceil(count / perRow) * row + GROUP_GAP;
		return {labelY: top, slots: Array.from({length: count}, (_, index) => ({x: area[0] + slot / 2 + (index % perRow) * slot, y: top + Math.floor(index / perRow) * row}))};
	});
};

/**
 * Chemistry: a reaction at the particle level. The reactant molecules (`count` of each) sit on the left; on the beat
 * that shows `react` the equation runs turn by turn: `coefficient` molecules of each reactant move into the arrow and
 * the products appear on the right, until the limiting reactant runs out. The leftover is ringed and the result line
 * names the limiting reactant and what is left. Parts: reactants, react, products, result.
 */
export const StoichiometryVisual: React.FC<VisualBoxProps & {visual: Stoichiometry}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const k = Math.min(width / STOICHIOMETRY_STAGE.width, height / STOICHIOMETRY_STAGE.height);
	const ox = (width - STOICHIOMETRY_STAGE.width * k) / 2;
	const oy = (height - STOICHIOMETRY_STAGE.height * k) / 2;
	const appear = useReveal(delaySeconds, 0.5);
	const reactAt = useBeatStartFor('react', 'show') ?? delaySeconds + 1;
	const elapsed = visual.motion ? seconds - reactAt : 1e6;
	const turns = reactionTurns(visual.reactants);
	const labelSize = Math.max(40, 24 / k);
	const centre = {x: (ARROW.from + ARROW.to) / 2, y: ARROW.y};
	const turnProgress = (turn: number) => clamp01((elapsed - turn * visual.step) / (visual.step * 0.9));
	const done = elapsed >= turns * visual.step;

	const atomFill = (symbol: string) =>
		symbol === 'H' ? palette.surface : symbol === 'O' ? palette.lesson : symbol === 'C' ? palette.ink : symbol === 'N' ? palette.lessonDeep : mixColors(palette.lessonDeep, palette.surface, 0.45);
	const molecule = (atoms: string[], x: number, y: number, opacity: number, scale: number, key: string | number) => {
		const offsets = atomOffsets(atoms);
		// The central atom first, its partners over it (they read as bonded to it).
		const order = atoms.map((_, index) => index).sort((a, b) => Math.hypot(offsets[a].x, offsets[a].y) - Math.hypot(offsets[b].x, offsets[b].y));
		return (
			<g key={key} transform={`translate(${x} ${y}) scale(${scale * size})`} opacity={opacity}>
				{order.map((index) => (
					<circle key={index} cx={offsets[index].x} cy={offsets[index].y} r={atomRadius(atoms[index])} fill={atomFill(atoms[index])} stroke={palette.ink} strokeWidth={2.5} />
				))}
			</g>
		);
	};
	const text = (x: number, y: number, value: string, anchor: 'start' | 'middle' | 'end' = 'middle', size = labelSize, key?: string | number) => (
		<text key={key} x={x} y={y} fill={palette.ink} fontSize={size} fontWeight={800} textAnchor={anchor} dominantBaseline="central">
			{value}
		</text>
	);

	const reactantCounts = visual.reactants.map((reactant) => reactant.count);
	const productCounts = visual.products.map((product) => product.coefficient * turns);
	const arranged = arrangement([...visual.reactants, ...visual.products], reactantCounts, productCounts);
	const {size, slot, row} = arranged;
	const left = layout(reactantCounts, LEFT.area, arranged);
	const right = layout(productCounts, RIGHT.area, arranged);
	const leftovers = visual.reactants.map((reactant) => reactant.count - reactant.coefficient * turns);
	const limiting = visual.reactants.filter((_, index) => leftovers[index] === 0).map((reactant) => reactant.formula);
	const excess = visual.reactants.map((reactant, index) => ({formula: reactant.formula, left: leftovers[index]})).filter((item) => item.left > 0);
	const resultLine = excess.length
		? `${visual.limitingLabel}: ${limiting.join(', ')} · ${visual.excessLabel}: ${excess.map((item) => `${item.left} ${item.formula}`).join(', ')}`
		: visual.completeLabel;

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
				<Part id="reactants">
					{(look) => (
						<g opacity={look.opacity}>
							<rect x={LEFT.x} y={TOP - 30} width={ARROW.from - LEFT.x - 25} height={BOTTOM - TOP + 60} rx={24} fill="none" stroke={palette.grid} strokeWidth={4} />
							{text((LEFT.x + ARROW.from - 25) / 2, 50, visual.beforeLabel)}
							{visual.reactants.map((reactant, group) => (
								<g key={group}>
									{text(LEFT.label, left[group].labelY, reactant.formula, 'start', labelSize * 0.95)}
									{left[group].slots.map((place, index) => {
										const turn = Math.floor(index / reactant.coefficient);
										// Molecules used in a turn slide into the arrow and fade; the leftover stays.
										if (turn < turns) {
											const p = turnProgress(turn);
											const move = smooth(p / 0.6);
											return molecule(reactant.atoms, lerp(place.x, centre.x, move), lerp(place.y, centre.y, move), 1 - clamp01((p - 0.4) / 0.2), 1, index);
										}
										return molecule(reactant.atoms, place.x, place.y, 1, 1, index);
									})}
								</g>
							))}
						</g>
					)}
				</Part>
				<Part id="react">
					{(look) => (
						<g opacity={look.opacity}>
							<line x1={ARROW.from} y1={ARROW.y} x2={ARROW.to - 18} y2={ARROW.y} stroke={palette.ink} strokeWidth={8} strokeLinecap="round" />
							<path d={`M ${ARROW.to} ${ARROW.y} L ${ARROW.to - 30} ${ARROW.y - 20} L ${ARROW.to - 30} ${ARROW.y + 20} Z`} fill={palette.ink} />
						</g>
					)}
				</Part>
				<Part id="products">
					{(look) => (
						<g opacity={look.opacity}>
							<rect x={RIGHT.x} y={TOP - 30} width={STOICHIOMETRY_STAGE.width - RIGHT.x - 40} height={BOTTOM - TOP + 60} rx={24} fill="none" stroke={palette.grid} strokeWidth={4} />
							{text((RIGHT.x + STOICHIOMETRY_STAGE.width - 40) / 2, 50, visual.afterLabel)}
							{visual.products.map((product, group) => (
								<g key={group}>
									{productCounts[group] > 0 ? text(RIGHT.label, right[group].labelY, product.formula, 'start', labelSize * 0.95) : null}
									{right[group].slots.map((place, index) => {
										// A product comes out of the arrow in the second half of its turn.
										const p = clamp01((turnProgress(Math.floor(index / product.coefficient)) - 0.5) / 0.5);
										if (p <= 0) return null;
										const move = smooth(p);
										return molecule(product.atoms, lerp(centre.x, place.x, move), lerp(centre.y, place.y, move), clamp01(p * 2), 0.6 + 0.4 * move, index);
									})}
								</g>
							))}
						</g>
					)}
				</Part>
				<Part id="result">
					{(look) => (
						<g opacity={look.opacity * (done ? 1 : 0)}>
							{visual.reactants.map((reactant, group) =>
								left[group].slots
									.slice(reactant.coefficient * turns)
									.map((place, index) => (
										<rect
											key={`${group}-${index}`}
											x={place.x - slot / 2 + 4}
											y={place.y - row / 2 + 4}
											width={slot - 8}
											height={row - 8}
											rx={18}
											fill="none"
											stroke={palette.brand}
											strokeWidth={5}
											strokeDasharray="12 8"
										/>
									)),
							)}
							{text(STOICHIOMETRY_STAGE.width / 2, 690, resultLine)}
						</g>
					)}
				</Part>
			</g>
		</svg>
	);
};
