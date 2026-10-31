import React from 'react';
import {clamp01} from '../../../Animations/Motion';
import {mixColors} from '../../../Themes/ColorPalette';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part} from '../VisualTimeline';

type Intermolecular = Extract<CourseVisual, {kind: 'intermolecular'}>;
type Panel = Intermolecular['panels'][number];
type Point = {x: number; y: number};

/** The stage (CourseVisual keeps this ratio). */
export const INTERMOLECULAR_STAGE = {width: 1600, height: 720};

const LABEL_Y = 50;
const PANEL_CENTRE_Y = 405;
const HALF_ANGLE = ((104.5 / 2) * Math.PI) / 180;
const OH = 54;
const O_R = 34;
const H_R = 20;
const ION_R = 60;
const SHELL_R = 185;

/** A water molecule: O at (x, y) and its two H 104.5° apart around the bisector `angle` (radians, y down). */
export const waterAtoms = (x: number, y: number, angle: number): {o: Point; h: [Point, Point]} => ({
	o: {x, y},
	h: [
		{x: x + OH * Math.cos(angle - HALF_ANGLE), y: y + OH * Math.sin(angle - HALF_ANGLE)},
		{x: x + OH * Math.cos(angle + HALF_ANGLE), y: y + OH * Math.sin(angle + HALF_ANGLE)},
	],
});

// The water network: each molecule points its first H at a neighbour's O (no pair donates to each other).
const NETWORK: Point[] = [
	{x: -190, y: -170},
	{x: 0, y: -170},
	{x: 190, y: -170},
	{x: -285, y: 0},
	{x: -95, y: 0},
	{x: 95, y: 0},
	{x: 285, y: 0},
	{x: -190, y: 170},
	{x: 0, y: 170},
	{x: 190, y: 170},
];
const TARGETS = [4, 5, 6, 0, 8, 2, 9, 3, 5, 8];
const FEATURED = 4;

const angleBetween = (a: number, b: number) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));

const networkAt = (t: number) =>
	NETWORK.map((point, index) => {
		const target = NETWORK[TARGETS[index]];
		const direction = Math.atan2(target.y - point.y, target.x - point.x);
		return waterAtoms(point.x + 6 * Math.sin(1.3 * t + index), point.y + 6 * Math.cos(1.1 * t + 2 * index), direction + HALF_ANGLE + 0.07 * Math.sin(0.9 * t + index));
	});

/** The hydrogen bonds of the network at rest: donor molecule, which of its H, acceptor molecule. */
export const HYDROGEN_BONDS: {donor: number; h: 0 | 1; acceptor: number}[] = (() => {
	const rest = networkAt(0);
	const bonds: {donor: number; h: 0 | 1; acceptor: number}[] = TARGETS.map((acceptor, donor) => ({donor, h: 0, acceptor}));
	rest.forEach((molecule, donor) => {
		// The second H bonds too when another O lies almost straight along it.
		const second = molecule.h[1];
		const along = Math.atan2(second.y - molecule.o.y, second.x - molecule.o.x);
		const acceptor = rest.findIndex(
			(other, index) =>
				index !== donor &&
				index !== TARGETS[donor] &&
				angleBetween(Math.atan2(other.o.y - molecule.o.y, other.o.x - molecule.o.x), along) < 0.42 &&
				Math.hypot(other.o.x - molecule.o.x, other.o.y - molecule.o.y) < 240,
		);
		if (acceptor >= 0 && !bonds.some((bond) => bond.donor === acceptor && bond.acceptor === donor)) bonds.push({donor, h: 1, acceptor});
	});
	return bonds;
})();

/** The dashed link from an H (or an O) to the particle it is attracted to, leaving a gap at both ends. */
export const linkBetween = (from: Point, fromR: number, to: Point, toR: number): {from: Point; to: Point} => {
	const length = Math.hypot(to.x - from.x, to.y - from.y);
	const ux = (to.x - from.x) / length;
	const uy = (to.y - from.y) / length;
	return {from: {x: from.x + ux * (fromR + 5), y: from.y + uy * (fromR + 5)}, to: {x: to.x - ux * (toR + 6), y: to.y - uy * (toR + 6)}};
};

/** The water molecules around an ion: O towards a cation, one H towards an anion. */
export const hydrationShell = (t: number, anion: boolean) =>
	Array.from({length: 6}, (_, index) => {
		const angle = (index * Math.PI) / 3 + Math.PI / 6 + 0.05 * Math.sin(0.8 * t + index);
		const distance = (anion ? SHELL_R + 30 : SHELL_R) + 5 * Math.sin(1.2 * t + index);
		const centre = {x: distance * Math.cos(angle), y: distance * Math.sin(angle)};
		return {angle, water: waterAtoms(centre.x, centre.y, anion ? angle + Math.PI + HALF_ANGLE : angle)};
	});

const SUPERSCRIPT: Record<string, string> = {'⁺': '+', '⁻': '−', '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4'};

/** Draws charges like the ⁺ of "Na⁺" as a raised, readable superscript (the font's ⁺ glyph is tiny); the text after it comes back to the line (0.6 × 0.62 em). */
const withCharges = (value: string): React.ReactNode[] =>
	value
		.split(/([⁺⁻⁰¹²³⁴]+)/)
		.filter(Boolean)
		.map((piece, index) =>
			/^[⁺⁻⁰¹²³⁴]+$/.test(piece) ? (
				<tspan key={index} dy="-0.6em" fontSize="0.62em">
					{[...piece].map((character) => SUPERSCRIPT[character]).join('')}
				</tspan>
			) : (
				<tspan key={index} dy={index > 0 ? '0.37em' : undefined}>
					{piece}
				</tspan>
			),
		);

const GRID_X = [-250, 0, 250];
const GRID_Y = [-170, 0, 170];

/** London: how far each molecule's electron cloud has shifted (−1…1); neighbours in a row follow with a small lag. */
export const cloudShift = (t: number, row: number, column: number, motion: boolean) => (motion ? Math.sin(2.2 * t - 0.6 * column + 1.1 * row) : 0.8);

/**
 * Chemistry, biology: attractions between particles, in one or two panels. Hydrogen bonds in water (dashed H···O
 * links that keep breaking and re-forming), London forces (electron clouds that shift and induce dipoles in their
 * neighbours), dipole-dipole attraction (HCl lined up δ+ to δ−) and ion-dipole attraction (water around an ion: O
 * towards a cation, H towards an anion). Parts: p1, p2 (the particles), links (the attractions and δ signs).
 */
export const IntermolecularVisual: React.FC<VisualBoxProps & {visual: Intermolecular}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const k = Math.min(width / INTERMOLECULAR_STAGE.width, height / INTERMOLECULAR_STAGE.height);
	const ox = (width - INTERMOLECULAR_STAGE.width * k) / 2;
	const oy = (height - INTERMOLECULAR_STAGE.height * k) / 2;
	const appear = useReveal(delaySeconds, 0.5);
	const t = visual.motion ? Math.max(0, seconds - delaySeconds) : 0;
	const count = visual.panels.length;
	const panelWidth = INTERMOLECULAR_STAGE.width / count;
	const scale = count === 1 ? 1.25 : 1;
	const labelSize = Math.max(42, 26 / k);
	// δ signs stay readable when the visual is small (a predict card).
	const signSize = Math.max(34, 26 / k / scale);
	const cloud = mixColors(palette.lesson, palette.surface, 0.72);
	const sign = (x: number, y: number, value: string, opacity = 1, key?: string | number) => (
		<text
			key={key}
			x={x}
			y={y}
			fill={palette.ink}
			fontSize={signSize}
			fontWeight={800}
			textAnchor="middle"
			dominantBaseline="central"
			opacity={opacity}
			stroke={palette.surface}
			strokeWidth={6}
			paintOrder="stroke"
		>
			{value}
		</text>
	);
	const dashed = (link: {from: Point; to: Point}, opacity: number, key: string | number) => (
		<line key={key} x1={link.from.x} y1={link.from.y} x2={link.to.x} y2={link.to.y} stroke={palette.brand} strokeWidth={6} strokeDasharray="10 9" strokeLinecap="round" opacity={opacity} />
	);
	const water = (molecule: {o: Point; h: [Point, Point]}, key: string | number) => (
		<g key={key}>
			{molecule.h.map((h, index) => (
				<line key={index} x1={molecule.o.x} y1={molecule.o.y} x2={h.x} y2={h.y} stroke={palette.ink} strokeWidth={6} />
			))}
			<circle cx={molecule.o.x} cy={molecule.o.y} r={O_R} fill={palette.lesson} stroke={palette.ink} strokeWidth={3} />
			{molecule.h.map((h, index) => (
				<circle key={index} cx={h.x} cy={h.y} r={H_R} fill={palette.surface} stroke={palette.ink} strokeWidth={3} />
			))}
		</g>
	);

	// Each panel: its particles (part p1/p2) and its attractions (part links), drawn in panel space.
	const drawPanel = (panel: Panel): {particles: React.ReactNode; links: React.ReactNode} => {
		if (panel.mode === 'hydrogen') {
			const molecules = networkAt(t);
			const featured = molecules[FEATURED];
			const bisector = Math.atan2((featured.h[0].y + featured.h[1].y) / 2 - featured.o.y, (featured.h[0].x + featured.h[1].x) / 2 - featured.o.x);
			return {
				particles: molecules.map((molecule, index) => water(molecule, index)),
				links: (
					<>
						{HYDROGEN_BONDS.map((bond, index) => {
							// In the liquid the bonds keep breaking and re-forming.
							const opacity = visual.motion ? clamp01(0.55 + 0.9 * Math.sin(0.8 * t + 2.1 * index)) : 1;
							return dashed(linkBetween(molecules[bond.donor].h[bond.h], H_R, molecules[bond.acceptor].o, O_R), opacity, index);
						})}
						{sign(featured.o.x - 66 * Math.cos(bisector), featured.o.y - 66 * Math.sin(bisector), 'δ−')}
						{sign(featured.h[1].x + 46 * Math.cos(bisector + HALF_ANGLE + Math.PI / 2), featured.h[1].y + 46 * Math.sin(bisector + HALF_ANGLE + Math.PI / 2), 'δ+')}
					</>
				),
			};
		}
		if (panel.mode === 'london') {
			const cells = GRID_Y.flatMap((y, row) => GRID_X.map((x, column) => ({x, y, row, column, shift: cloudShift(t, row, column, visual.motion)})));
			return {
				particles: cells.map((cell, index) => (
					<g key={index}>
						<ellipse cx={cell.x + 16 * cell.shift} cy={cell.y} rx={95} ry={50} fill={cloud} opacity={0.9} />
						<line x1={cell.x - 30} y1={cell.y} x2={cell.x + 30} y2={cell.y} stroke={palette.ink} strokeWidth={6} />
						<circle cx={cell.x - 30} cy={cell.y} r={30} fill={palette.lesson} stroke={palette.ink} strokeWidth={3} />
						<circle cx={cell.x + 30} cy={cell.y} r={30} fill={palette.lesson} stroke={palette.ink} strokeWidth={3} />
					</g>
				)),
				links: (
					<>
						{cells.map((cell, index) => {
							const strength = clamp01((Math.abs(cell.shift) - 0.3) / 0.4);
							const side = Math.sign(cell.shift) || 1;
							return (
								<g key={index}>
									{sign(cell.x + side * 72, cell.y - 74, 'δ−', strength)}
									{sign(cell.x - side * 72, cell.y - 74, 'δ+', strength)}
								</g>
							);
						})}
						{cells
							.filter((cell) => cell.column < GRID_X.length - 1)
							.map((cell, index) => {
								const next = cells.find((other) => other.row === cell.row && other.column === cell.column + 1)!;
								// Two neighbours attract when their clouds lean the same way (δ− end next to δ+ end).
								const opacity = cell.shift * next.shift > 0 ? Math.min(Math.abs(cell.shift), Math.abs(next.shift)) : 0;
								return dashed({from: {x: cell.x + 98, y: cell.y}, to: {x: next.x - 98, y: next.y}}, opacity, `l${index}`);
							})}
					</>
				),
			};
		}
		if (panel.mode === 'dipole') {
			const cells = GRID_Y.flatMap((y, row) => GRID_X.map((x, column) => ({x: x + 5 * Math.sin(1.3 * t + row + column), y: y + 5 * Math.cos(1.1 * t + 2 * row + column), row, column})));
			return {
				particles: cells.map((cell, index) => (
					<g key={index}>
						<circle cx={cell.x + 14} cy={cell.y} r={38} fill={palette.lesson} stroke={palette.ink} strokeWidth={3} />
						<circle cx={cell.x - 44} cy={cell.y} r={H_R} fill={palette.surface} stroke={palette.ink} strokeWidth={3} />
					</g>
				)),
				links: (
					<>
						{cells.map((cell, index) => (
							<g key={index}>
								{sign(cell.x - 44, cell.y + 50, 'δ+')}
								{sign(cell.x + 14, cell.y - 68, 'δ−')}
							</g>
						))}
						{cells
							.filter((cell) => cell.column < GRID_X.length - 1)
							.map((cell, index) => {
								const next = cells.find((other) => other.row === cell.row && other.column === cell.column + 1)!;
								const opacity = visual.motion ? 0.65 + 0.35 * Math.sin(1.5 * t + index) : 1;
								return dashed(linkBetween({x: cell.x + 14, y: cell.y}, 38, {x: next.x - 44, y: next.y}, H_R), opacity, `l${index}`);
							})}
					</>
				),
			};
		}
		// Ion-dipole: water around one ion.
		const shell = hydrationShell(t, panel.anion);
		const ionCentre = {x: 0, y: 0};
		return {
			particles: (
				<>
					<circle cx={0} cy={0} r={ION_R} fill={palette.lessonDeep} stroke={palette.ink} strokeWidth={3} />
					<text x={0} y={0} fill={palette.onLesson} fontSize={46} fontWeight={800} textAnchor="middle" dominantBaseline="central">
						{withCharges(panel.ion ?? '')}
					</text>
					{shell.map((item, index) => water(item.water, index))}
				</>
			),
			links: (
				<>
					{shell.map((item, index) =>
						dashed(
							panel.anion ? linkBetween(item.water.h[0], H_R, ionCentre, ION_R) : linkBetween(item.water.o, O_R, ionCentre, ION_R),
							visual.motion ? 0.7 + 0.3 * Math.sin(1.4 * t + index) : 1,
							index,
						),
					)}
					{(() => {
						const first = shell[0];
						const atom = panel.anion ? first.water.h[0] : first.water.o;
						const across = first.angle + Math.PI / 2;
						return sign(atom.x + 60 * Math.cos(across), atom.y + 60 * Math.sin(across), panel.anion ? 'δ+' : 'δ−');
					})()}
				</>
			),
		};
	};

	const drawn = visual.panels.map((panel) => drawPanel(panel));
	const place = (index: number) => `translate(${panelWidth * (index + 0.5)} ${PANEL_CENTRE_Y}) scale(${scale})`;

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
				{visual.panels.map((panel, index) => (
					<Part key={index} id={`p${index + 1}`}>
						{(look) => (
							<g opacity={look.opacity}>
								<text x={panelWidth * (index + 0.5)} y={LABEL_Y} fill={palette.ink} fontSize={labelSize} fontWeight={800} textAnchor="middle" dominantBaseline="central">
									{withCharges(panel.label)}
								</text>
								<g transform={place(index)}>{drawn[index].particles}</g>
							</g>
						)}
					</Part>
				))}
				{count === 2 ? <line x1={panelWidth} y1={20} x2={panelWidth} y2={INTERMOLECULAR_STAGE.height - 20} stroke={palette.grid} strokeWidth={3} /> : null}
				<Part id="links">
					{(look) => (
						<g opacity={look.opacity}>
							{visual.panels.map((_, index) => (
								<g key={index} transform={place(index)}>
									{drawn[index].links}
								</g>
							))}
						</g>
					)}
				</Part>
			</g>
		</svg>
	);
};
