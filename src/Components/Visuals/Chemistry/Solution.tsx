import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useBeatStartFor} from '../VisualTimeline';

type Solution = Extract<CourseVisual, {kind: 'solution'}>;

/** The stage (CourseVisual keeps this ratio). */
export const SOLUTION_STAGE = {width: 1600, height: 900};

/** Particles per formula unit (van 't Hoff i, full dissociation) and the colligative effect's size i·m. */
export const particleFactor = (ions: {count: number}[]) => ions.reduce((sum, ion) => sum + ion.count, 0);
export const colligative = (molality: number, ions: {count: number}[]) => molality * particleFactor(ions);

const EFFECT_NAMES = {freezing: 'Donma noktası alçalması', boiling: 'Kaynama noktası yükselmesi', osmotic: 'Osmotik basınç', vapour: 'Buhar basıncı düşmesi'} as const;

/**
 * Solutions side by side: each beaker shows its solute broken into the particles it gives in water (ions for a salt,
 * whole molecules for sugar), as many as molality × particles per unit, appearing as the crystal dissolves. Beneath,
 * bars compare the colligative effect i·m (freezing point lowering, boiling point rise, osmotic pressure), the same
 * scale for every beaker. Beats point at b1…, `particles`, `bars` and `run`.
 */
export const SolutionVisual: React.FC<VisualBoxProps & {visual: Solution}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const k = Math.min(width / SOLUTION_STAGE.width, height / SOLUTION_STAGE.height);
	const ox = (width - SOLUTION_STAGE.width * k) / 2;
	const oy = (height - SOLUTION_STAGE.height * k) / 2;
	const appear = useReveal(delaySeconds, 0.5);
	const runStart = useBeatStartFor('run', 'show') ?? delaySeconds + 1;
	const fontSize = Math.max(70, 30 / k);
	const label = (x: number, y: number, text: string, anchor: 'start' | 'middle' | 'end' = 'middle', size = fontSize * 0.8) => (
		<text x={x} y={y} fill={palette.ink} fontSize={size} fontWeight={800} textAnchor={anchor} stroke={palette.surface} strokeWidth={8} paintOrder="stroke">
			{text}
		</text>
	);
	const dissolved = visual.motion ? easeFrom(seconds, runStart, 2.5) : 1;
	const count = visual.beakers.length;
	const beakerWidth = Math.min(460, (1540 - (count - 1) * 50) / count);
	const left0 = (SOLUTION_STAGE.width - (count * beakerWidth + (count - 1) * 50)) / 2;
	const [top, bottom] = [80, 500];
	const largest = Math.max(...visual.beakers.map((beaker) => colligative(beaker.molality, beaker.ions)));
	const fmt = (value: number) => String(Math.round(value * 100) / 100).replace('.', ',');

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
				{visual.beakers.map((beaker, index) => {
					const x = left0 + index * (beakerWidth + 50);
					// Six drawn particles per mole of each ion in a kilogram of water.
					const particles = beaker.ions.flatMap((ion, kind) => Array.from({length: Math.min(30, Math.round(ion.count * beaker.molality * 6))}, (_, n) => ({kind, label: ion.label, n})));
					const value = colligative(beaker.molality, beaker.ions);
					return (
						<Part key={index} id={`b${index + 1}`}>
							{(look) => (
								<g opacity={look.opacity}>
									<path d={`M ${x} ${top} L ${x} ${bottom} L ${x + beakerWidth} ${bottom} L ${x + beakerWidth} ${top}`} fill="none" stroke={palette.ink} strokeWidth={7} />
									<rect x={x + 5} y={top + 60} width={beakerWidth - 10} height={bottom - top - 64} fill={palette.lesson} opacity={0.08} />
									{label(x + beakerWidth / 2, bottom + fontSize * 1.0, beaker.label, 'middle', fontSize * 0.9)}
									{label(x + beakerWidth / 2, bottom + fontSize * 1.9, `${fmt(beaker.molality)} m · i = ${particleFactor(beaker.ions)}`, 'middle', fontSize * 0.7)}
									<Part id="particles">
										{(inner) => (
											<g opacity={inner.opacity}>
												{/* What is left of the crystal at the bottom. */}
												<rect x={x + beakerWidth / 2 - 50} y={bottom - 34 - 30 * (1 - dissolved)} width={100} height={30 * (1 - dissolved) + 30} rx={6} fill={palette.axis} opacity={1 - dissolved} />
												{particles.map((particle, order) => {
													const seed = order * 7919 + index * 104729;
													const tx = x + 30 + ((seed % 997) / 997) * (beakerWidth - 60);
													const ty = top + 90 + (((seed * 31) % 991) / 991) * (bottom - top - 140);
													const sx = x + beakerWidth / 2;
													const sy = bottom - 50;
													const share = Math.min(1, Math.max(0, dissolved * 1.4 - (order % 10) * 0.04));
													const cx = sx + (tx - sx) * share;
													const cy = sy + (ty - sy) * share;
													const ion = beaker.ions.length > 1;
													const fill = !ion ? palette.grid : particle.kind === 0 ? palette.lesson : palette.ink;
													return (
														<g key={order} opacity={share}>
															<circle cx={cx} cy={cy} r={28} fill={fill} stroke={palette.ink} strokeWidth={3} />
															{ion ? (
																<text x={cx} y={cy + 12} fill={palette.surface} fontSize={36} fontWeight={800} textAnchor="middle">
																	{particle.kind === 0 ? '+' : '−'}
																</text>
															) : null}
														</g>
													);
												})}
											</g>
										)}
									</Part>
									{visual.effect !== 'none' ? (
										<Part id="bars">
											{(inner) => (
												<g opacity={inner.opacity * dissolved}>
													<rect x={x} y={bottom + fontSize * 2.25} width={(beakerWidth * value) / largest} height={50} rx={12} fill={palette.lesson} />
													{label(x, bottom + fontSize * 2.25 + 50 + fontSize * 0.8, `i·m = ${fmt(value)}`, 'start', fontSize * 0.7)}
												</g>
											)}
										</Part>
									) : null}
								</g>
							)}
						</Part>
					);
				})}
				{visual.effect !== 'none' ? label(SOLUTION_STAGE.width / 2, 50, `${EFFECT_NAMES[visual.effect]} ∝ i·m`, 'middle', fontSize * 0.75) : null}
			</g>
		</svg>
	);
};
