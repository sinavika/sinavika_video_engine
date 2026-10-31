import React from 'react';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useBeatStartFor} from '../VisualTimeline';
import {arrowHead} from '../Physics/ArrowHead';

type Orbitals = Extract<CourseVisual, {kind: 'orbitals'}>;

/** The stage (CourseVisual keeps this ratio). */
export const ORBITAL_STAGE = {width: 1600, height: 900};

/** Subshells in Aufbau order up to 4p (Z ≤ 36): n, l. */
const ORDER: [number, number][] = [
	[1, 0],
	[2, 0],
	[2, 1],
	[3, 0],
	[3, 1],
	[4, 0],
	[3, 2],
	[4, 1],
];
const LETTERS = ['s', 'p', 'd', 'f'];

/** One electron in a box: its four quantum numbers and the place it was put in the filling order. */
type Electron = {n: number; l: number; ml: number; spin: 1 | -1; order: number};

/**
 * The ground-state electrons of an atom or ion with atomic number z (1–36) and the given charge: Aufbau order, each
 * subshell filled one up-spin per orbital first (Hund) and then paired (Pauli); Cr and Cu take one 4s electron into
 * 3d (4s¹3d⁵, 4s¹3d¹⁰). A positive ion loses its electrons from the highest n first (4s before 3d), a negative one
 * gains them in Aufbau order.
 */
export const electronConfiguration = (z: number, charge = 0): Electron[] => {
	const fill = (count: number) => {
		const shells = ORDER.map(([n, l]) => ({n, l, count: 0}));
		let left = count;
		for (const shell of shells) {
			const room = 2 * (2 * shell.l + 1);
			shell.count = Math.min(room, left);
			left -= shell.count;
		}
		return shells;
	};
	const shells = fill(charge < 0 ? z - charge : z);
	const find = (n: number, l: number) => shells.find((shell) => shell.n === n && shell.l === l)!;
	if (charge >= 0 && (z === 24 || z === 29)) {
		find(4, 0).count -= 1;
		find(3, 2).count += 1;
	}
	// A positive ion: take electrons from the outermost shell (highest n, then highest l).
	for (let lost = 0; lost < Math.max(0, charge); lost++) {
		const outer = shells.filter((shell) => shell.count > 0).sort((a, b) => b.n - a.n || b.l - a.l)[0];
		if (outer) outer.count -= 1;
	}
	const electrons: Electron[] = [];
	let order = 0;
	for (const shell of shells) {
		const boxes = 2 * shell.l + 1;
		for (let index = 0; index < shell.count; index++) {
			const box = index % boxes;
			electrons.push({n: shell.n, l: shell.l, ml: box - shell.l, spin: index < boxes ? 1 : -1, order: order++});
		}
	}
	return electrons;
};

const SUPERSCRIPT = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const superscript = (value: number) => String(value).split('').map((digit) => SUPERSCRIPT[Number(digit)]).join('');

/**
 * Orbital boxes on an energy staircase (1s at the bottom left, 4p at the top right) filling with spin arrows one
 * electron at a time: Aufbau order, Hund (one up arrow in each box before pairing), Pauli (two opposite spins in a box).
 * The configuration is written above. `highlight` colours the electrons whose n, l and/or mℓ match and counts them,
 * the way ÖSYM asks "how many electrons have mℓ = 0". Beats point at `boxes`, `electrons`, `config`, `count`, `run`.
 */
export const OrbitalVisual: React.FC<VisualBoxProps & {visual: Orbitals}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const k = Math.min(width / ORBITAL_STAGE.width, height / ORBITAL_STAGE.height);
	const ox = (width - ORBITAL_STAGE.width * k) / 2;
	const oy = (height - ORBITAL_STAGE.height * k) / 2;
	const appear = useReveal(delaySeconds, 0.5);
	const runStart = useBeatStartFor('run', 'show') ?? delaySeconds + 1;
	const fontSize = Math.max(62, 26 / k);
	const electrons = electronConfiguration(visual.atomicNumber, visual.charge);
	// Electrons go in one every 0.3 s once `run` starts; without motion they are all there.
	const shown = !visual.motion ? electrons.length : seconds < runStart ? 0 : Math.floor((seconds - runStart) / 0.3) + 1;
	// Subshells drawn: up to the highest one holding an electron (an emptied 4s of a transition-metal ion stays as
	// empty boxes).
	const used = ORDER.filter((_, index) => index <= Math.max(...electrons.map((electron) => ORDER.findIndex(([n, l]) => n === electron.n && l === electron.l)), 0));
	// Layout: groups left to right, each one step higher; boxes as large as the stage allows (at most 100).
	const gap = 30;
	const boxCount = used.reduce((sum, [, l]) => sum + 2 * l + 1, 0);
	const box = Math.min(100, (1460 - gap * (used.length - 1)) / boxCount);
	const widths = used.map(([, l]) => (2 * l + 1) * box);
	const total = widths.reduce((sum, value) => sum + value, 0) + gap * (used.length - 1);
	const left0 = (ORBITAL_STAGE.width - total) / 2;
	const step = Math.min(110, 560 / Math.max(1, used.length - 1));
	const groups = used.map(([n, l], index) => ({n, l, x: left0 + widths.slice(0, index).reduce((sum, value) => sum + value, 0) + gap * index, y: 800 - index * step}));
	const match = (electron: Electron) =>
		visual.highlight !== undefined &&
		(visual.highlight.n === undefined || visual.highlight.n === electron.n) &&
		(visual.highlight.l === undefined || visual.highlight.l === electron.l) &&
		(visual.highlight.ml === undefined || visual.highlight.ml === electron.ml);
	const matching = electrons.filter(match).length;
	const config = used
		.map(([n, l]) => {
			const count = electrons.filter((electron) => electron.n === n && electron.l === l).length;
			return count > 0 ? `${n}${LETTERS[l]}${superscript(count)}` : null;
		})
		.filter((part) => part !== null)
		.join(' ');
	const symbol = visual.symbol ? `${visual.symbol}${visual.charge === 0 ? '' : `${Math.abs(visual.charge) > 1 ? superscript(Math.abs(visual.charge)) : ''}${visual.charge > 0 ? '⁺' : '⁻'}`}` : '';
	const highlightText = visual.highlight
		? [visual.highlight.n !== undefined ? `n = ${visual.highlight.n}` : null, visual.highlight.l !== undefined ? `ℓ = ${visual.highlight.l}` : null, visual.highlight.ml !== undefined ? `mℓ = ${visual.highlight.ml < 0 ? `−${-visual.highlight.ml}` : visual.highlight.ml}` : null].filter(Boolean).join(', ')
		: '';

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
				<line x1={Math.max(40, left0 - 50)} y1={860} x2={Math.max(40, left0 - 50)} y2={260} stroke={palette.axis} strokeWidth={4} />
				<path d={arrowHead(Math.max(40, left0 - 50), 240, -Math.PI / 2, 24)} fill={palette.axis} />
				<text x={Math.max(40, left0 - 50) + 34} y={300} fill={palette.muted} fontSize={fontSize * 0.6} fontWeight={800} textAnchor="start">
					enerji
				</text>
				<Part id="boxes">
					{(look) => (
						<g opacity={look.opacity}>
							{groups.map((group) => (
								<g key={`${group.n}${group.l}`}>
									{Array.from({length: 2 * group.l + 1}, (_, index) => (
										<rect key={index} x={group.x + index * box} y={group.y - box} width={box} height={box} fill={palette.surface} stroke={palette.ink} strokeWidth={5} />
									))}
									<text x={group.x + ((2 * group.l + 1) * box) / 2} y={group.y + fontSize * 0.85} fill={palette.ink} fontSize={fontSize * 0.8} fontWeight={800} textAnchor="middle">
										{`${group.n}${LETTERS[group.l]}`}
									</text>
								</g>
							))}
						</g>
					)}
				</Part>
				<Part id="electrons">
					{(look) => (
						<g opacity={look.opacity}>
							{electrons.slice(0, shown).map((electron) => {
								const group = groups.find((item) => item.n === electron.n && item.l === electron.l)!;
								const x = group.x + (electron.ml + electron.l) * box + box / 2 + (electron.spin === 1 ? -box * 0.18 : box * 0.18);
								const [top, bottom] = [group.y - box + box * 0.14, group.y - box * 0.14];
								// With a highlight the counted electrons are in the lesson colour and the rest fade back.
								const colour = match(electron) ? palette.lesson : visual.highlight ? palette.axis : palette.ink;
								const [from, to] = electron.spin === 1 ? [bottom, top] : [top, bottom];
								return (
									<g key={electron.order}>
										<line x1={x} y1={from} x2={x} y2={to + (electron.spin === 1 ? box * 0.2 : -box * 0.2)} stroke={colour} strokeWidth={match(electron) ? 9 : 6} />
										<path d={arrowHead(x, to, electron.spin === 1 ? -Math.PI / 2 : Math.PI / 2, box * 0.26)} fill={colour} />
									</g>
								);
							})}
						</g>
					)}
				</Part>
				<Part id="config">
					{(look) => (
						<g opacity={look.opacity}>
							<text x={60} y={90} fill={palette.ink} fontSize={fontSize * 0.95} fontWeight={800}>
								{`${symbol ? `${symbol}: ` : ''}${config}`}
							</text>
						</g>
					)}
				</Part>
				{visual.highlight ? (
					<Part id="count">
						{(look) => (
							<g opacity={look.opacity}>
								<rect x={60} y={140} width={560} height={fontSize * 1.5} rx={16} fill={palette.fill} />
								<text x={84} y={140 + fontSize * 1.02} fill={palette.ink} fontSize={fontSize * 0.85} fontWeight={800}>
									{`${highlightText}: ${shown >= electrons.length ? matching : '…'} elektron`}
								</text>
							</g>
						)}
					</Part>
				) : null}
			</g>
		</svg>
	);
};
