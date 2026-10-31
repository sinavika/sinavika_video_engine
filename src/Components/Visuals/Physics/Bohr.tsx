import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useBeatStartFor} from '../VisualTimeline';
import {arrowHead} from './ArrowHead';

type Bohr = Extract<CourseVisual, {kind: 'bohr'}>;

/** The stage (CourseVisual keeps this ratio). */
export const BOHR_STAGE = {width: 1600, height: 900};

/** Hydrogen's energy levels in eV (E = −13.6 / n²) and the photon energy of a jump between two of them. */
export const hydrogenLevel = (n: number) => -13.6 / (n * n);
export const photonEnergy = (from: number, to: number) => Math.abs(hydrogenLevel(from) - hydrogenLevel(to));

/** Visible Balmer lines (jumps down to n = 2) get their colours; the others are drawn in ink (ultraviolet, infrared). */
const BALMER: Record<number, string> = {3: '#D64545', 4: '#2FA7C8', 5: '#3E63DD', 6: '#7C4DCC'};

/** Seconds each jump takes in the animation: the electron goes round, jumps, and the photon flies. */
const STEP = 3;

/**
 * Bohr's hydrogen atom: the nucleus, orbits n = 1… with radii growing as n², and an electron going round. Each of
 * `transitions` moves it from one orbit to another: down, a photon leaves with hf = ΔE (a wavy arrow); up, a photon
 * comes in first and is absorbed. Beside it the energy-level diagram to scale (E = −13.6/n² eV) draws the same jump
 * as an arrow with its energy. Beats point at `nucleus`, `orbits`, `levels`, `jump`, `photon` and `run`.
 */
export const BohrVisual: React.FC<VisualBoxProps & {visual: Bohr}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const k = Math.min(width / BOHR_STAGE.width, height / BOHR_STAGE.height);
	const ox = (width - BOHR_STAGE.width * k) / 2;
	const oy = (height - BOHR_STAGE.height * k) / 2;
	const appear = useReveal(delaySeconds, 0.5);
	const runStart = useBeatStartFor('run', 'show') ?? delaySeconds + 1;
	const fontSize = Math.max(60, 26 / k);
	const label = (x: number, y: number, text: string, anchor: 'start' | 'middle' | 'end' = 'middle', size = fontSize * 0.8, fill = palette.ink) => (
		<text x={x} y={y} fill={fill} fontSize={size} fontWeight={800} textAnchor={anchor} stroke={palette.surface} strokeWidth={8} paintOrder="stroke">
			{text}
		</text>
	);
	const levels = Array.from({length: visual.levels}, (_, index) => index + 1);
	// Atom on the left: radius ∝ n², the outermost orbit 400 units.
	const [ax, ay] = [visual.diagram ? 450 : 800, 450];
	const radius = (n: number) => 34 + (366 * (n * n - 1)) / (visual.levels * visual.levels - 1);
	// Diagram on the right: energy 0 at the top, −13.6 eV at the bottom.
	const [dLeft, dRight, dTop, dBottom] = [1040, 1340, 70, 850];
	const levelY = (n: number) => dTop + ((dBottom - dTop) * -hydrogenLevel(n)) / 13.6;
	// Level labels only where they have room: the upper levels crowd together near 0 eV.
	const labelled = levels.filter((n) => n === 1 || levelY(n - 1) - levelY(n) > fontSize * 0.75);

	// Where the animation is: which jump, and how far into it.
	const elapsed = visual.motion ? Math.max(0, seconds - runStart) : 0;
	const steps = visual.transitions.length;
	const index = Math.min(steps - 1, Math.floor(elapsed / STEP));
	const local = visual.motion ? Math.min(STEP, elapsed - index * STEP) : 0;
	const jump = visual.transitions[index];
	const down = jump.to < jump.from;
	// Down: go round 0.9 s, jump 0.9-1.5 s, photon flies out after. Up: photon flies in 0-0.9 s, jump 0.9-1.5 s.
	const jumped = easeFrom(local, 0.9, 0.6);
	const orbit = radius(jump.from) + (radius(jump.to) - radius(jump.from)) * jumped;
	const angle = -Math.PI / 4 + elapsed * 1.6;
	const [ex, ey] = [ax + Math.cos(angle) * orbit, ay + Math.sin(angle) * orbit];
	const photonShare = down ? easeFrom(local, 1.5, 1.3) : easeFrom(local, 0, 0.9);
	const colour = down && jump.to === 2 && BALMER[jump.from] ? BALMER[jump.from] : palette.ink;
	// The photon flies to the right at the height of the jump: out of the atom towards the diagram's arrow (down), or
	// in from the left edge to the electron (up), so the photon and its ΔE arrow read as one thing.
	const jumpAngle = -Math.PI / 4 + (index * STEP + 0.9) * 1.6;
	const jumpX = ax + Math.cos(jumpAngle) * radius(jump.from);
	const py = ay + Math.sin(jumpAngle) * radius(jump.from);
	const [fromX, toX] = down ? [jumpX + 30, visual.diagram ? dLeft - 130 : ax + 700] : [30, jumpX - 30];
	const headX = fromX + (toX - fromX) * photonShare;
	const tailX = Math.max(fromX, headX - 200);
	const wave = Array.from({length: 41}, (_, step) => `${tailX + ((headX - 26 - tailX) * step) / 40},${py + Math.sin(step * 0.95) * 16}`).join(' ');
	const photonVisible = visual.motion && photonShare > 0 && photonShare < 1;
	const energy = photonEnergy(jump.from, jump.to).toFixed(2).replace('.', ',');

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
				<Part id="orbits">
					{(look) => (
						<g opacity={look.opacity}>
							{levels.map((n) => (
								<g key={n}>
									<circle cx={ax} cy={ay} r={radius(n)} fill="none" stroke={palette.axis} strokeWidth={3} strokeDasharray="10 10" />
									{n > 1 ? label(ax + radius(n) * 0.71 + 12, ay - radius(n) * 0.71 - 6, `n=${n}`, 'start', fontSize * 0.7) : null}
								</g>
							))}
						</g>
					)}
				</Part>
				<Part id="nucleus">{(look) => <circle cx={ax} cy={ay} r={16 * look.scale} fill={palette.brand} stroke={palette.ink} strokeWidth={4} opacity={look.opacity} />}</Part>
				<circle cx={ex} cy={ey} r={14} fill={palette.lesson} stroke={palette.ink} strokeWidth={4} />
				<Part id="photon">
					{(look) => (
						<g opacity={look.opacity * (photonVisible ? 1 : 0)}>
							<polyline points={wave} fill="none" stroke={colour} strokeWidth={6} strokeLinecap="round" />
							<path d={arrowHead(headX, py, 0, 26)} fill={colour} />
							{label(Math.max(170, headX - 100), py - 40, `hf = ${energy} eV`, 'middle', fontSize * 0.75)}
						</g>
					)}
				</Part>
				{visual.diagram ? (
					<Part id="levels">
						{(look) => (
							<g opacity={look.opacity}>
								<line x1={dLeft} y1={dTop} x2={dRight} y2={dTop} stroke={palette.axis} strokeWidth={3} strokeDasharray="10 8" />
								{label(dRight + 20, dTop + fontSize * 0.2, '0 eV', 'start', fontSize * 0.65)}
								{levels.map((n) => (
									<g key={n}>
										<line x1={dLeft} y1={levelY(n)} x2={dRight} y2={levelY(n)} stroke={palette.ink} strokeWidth={5} />
										{labelled.includes(n) ? label(dLeft - 20, levelY(n) + fontSize * 0.22, `n=${n}`, 'end', fontSize * 0.7) : null}
										{labelled.includes(n) ? label(dRight + 20, levelY(n) + fontSize * 0.22, `${hydrogenLevel(n).toFixed(2).replace('.', ',')} eV`, 'start', fontSize * 0.65) : null}
									</g>
								))}
							</g>
						)}
					</Part>
				) : null}
				{visual.diagram ? (
					<Part id="jump">
						{(look) => (
							<g opacity={look.opacity}>
								{visual.transitions.slice(0, index + 1).map((step, order) => {
									const x = dLeft + 70 + order * 110;
									const share = order < index || !visual.motion ? 1 : jumped;
									const [y0, y1] = [levelY(step.from), levelY(step.to)];
									const yEnd = y0 + (y1 - y0) * share;
									const upwards = y1 < y0;
									const stroke = step.to < step.from && step.to === 2 && BALMER[step.from] ? BALMER[step.from] : palette.lesson;
									return (
										<g key={order}>
											<line x1={x} y1={y0} x2={x} y2={yEnd + (upwards ? 22 : -22)} stroke={stroke} strokeWidth={8} />
											{share > 0.2 ? <path d={arrowHead(x, yEnd, upwards ? -Math.PI / 2 : Math.PI / 2, 26)} fill={stroke} /> : null}
										</g>
									);
								})}
							</g>
						)}
					</Part>
				) : null}
			</g>
		</svg>
	);
};
