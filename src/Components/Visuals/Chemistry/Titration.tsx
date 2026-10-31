import React from 'react';
import {clamp01} from '../../../Animations/Motion';
import {mixColors} from '../../../Themes/ColorPalette';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useBeatStartFor} from '../VisualTimeline';

type Titration = Extract<CourseVisual, {kind: 'titration'}>;
type Setup = Pick<Titration, 'flask' | 'burette'>;

/** The stage (CourseVisual keeps this ratio). */
export const TITRATION_STAGE = {width: 1600, height: 760};

const BURETTE = {x: 200, top: 60, bottom: 420, width: 44};
const TIP = 500;
const FLASK = {x: 200, neckTop: 520, neckBottom: 570, bottom: 720, neck: 26, half: 150};
const PLOT = {left: 760, right: 1540, top: 80, bottom: 640};

/** The burette volume (mL) that neutralises the flask: equal moles of H⁺ and OH⁻. */
export const equivalenceVolume = ({flask, burette}: Setup): number => (flask.molarity * flask.volume * flask.valence) / (burette.molarity * burette.valence);

/**
 * The pH after `added` mL from the burette, for a strong acid and a strong base at 25 °C: the excess H⁺ or OH⁻ over the
 * whole volume, 7 at the equivalence point.
 */
export const titrationPH = ({flask, burette}: Setup, added: number): number => {
	const flaskMoles = flask.molarity * flask.volume * flask.valence;
	const buretteMoles = burette.molarity * added * burette.valence;
	const acidMoles = flask.kind === 'acid' ? flaskMoles : buretteMoles;
	const baseMoles = flask.kind === 'acid' ? buretteMoles : flaskMoles;
	const volume = flask.volume + added;
	const excess = (acidMoles - baseMoles) / volume;
	if (Math.abs(excess) < 1e-12) return 7;
	const pH = excess > 0 ? -Math.log10(excess) : 14 + Math.log10(-excess);
	return Math.min(14, Math.max(0, pH));
};

const decimal = (value: number, digits = 1) => value.toFixed(digits).replace('.', ',');
const amount = (value: number) =>
	Number.isInteger(value)
		? String(value)
		: decimal(value, value < 1 ? 2 : 1)
				.replace(/0+$/, '')
				.replace(/,$/, '');

/** The indicator's colour at a pH (real colours: phenolphthalein pink from 8.2 to 10, bromothymol blue yellow-green-blue). */
const indicatorColour = (indicator: Titration['indicator'], pH: number, plain: string): string => {
	if (indicator === 'phenolphthalein') return mixColors('#E0479E', plain, 1 - clamp01((pH - 8.2) / 1.8));
	if (indicator === 'bromothymol') return pH < 7 ? mixColors('#4FA35A', '#E2B93B', clamp01((7 - pH) / 1)) : mixColors('#3C7DD9', '#4FA35A', 1 - clamp01((pH - 7) / 0.6));
	return plain;
};

/**
 * Chemistry: an acid-base titration. The burette (`burette`: label, molarity, valence) drips into the flask (`flask`:
 * acid or base, label, molarity, volume in mL, valence) on the beat that shows `run`; the burette level falls, the
 * solution takes the indicator's colour at its pH, the pH is read out and the pH curve is drawn as the volume grows,
 * computed for a strong acid and a strong base. `equivalence` marks the equivalence point. Parts: burette, flask, curve,
 * run, equivalence.
 */
export const TitrationVisual: React.FC<VisualBoxProps & {visual: Titration}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const k = Math.min(width / TITRATION_STAGE.width, height / TITRATION_STAGE.height);
	const ox = (width - TITRATION_STAGE.width * k) / 2;
	const oy = (height - TITRATION_STAGE.height * k) / 2;
	const appear = useReveal(delaySeconds, 0.5);
	const runAt = useBeatStartFor('run', 'show') ?? delaySeconds + 1;
	const equivalence = equivalenceVolume(visual);
	const maxVolume = visual.maxVolume ?? Math.max(10, Math.ceil((equivalence * 2) / 5) * 5);
	const progress = visual.motion ? clamp01((seconds - runAt) / visual.duration) : 1;
	const added = maxVolume * progress;
	const pH = titrationPH(visual, added);
	const labelSize = Math.max(34, 22 / k);
	const plain = mixColors(palette.lesson, palette.surface, 0.85);
	const liquid = indicatorColour(visual.indicator, pH, plain);
	const capacity = Math.max(50, maxVolume);

	const xOf = (volume: number) => PLOT.left + (volume / maxVolume) * (PLOT.right - PLOT.left);
	const yOf = (value: number) => PLOT.bottom - (value / 14) * (PLOT.bottom - PLOT.top);
	// The curve up to the volume added so far; the equivalence volume is always a sample, so the jump passes through 7.
	const samples = Array.from({length: 161}, (_, index) => (index / 160) * added);
	if (equivalence < added) samples.push(equivalence);
	samples.sort((a, b) => a - b);
	const curve = samples.map((volume, index) => `${index ? 'L' : 'M'} ${xOf(volume).toFixed(1)} ${yOf(titrationPH(visual, volume)).toFixed(1)}`).join(' ');
	const text = (x: number, y: number, value: string, anchor: 'start' | 'middle' | 'end' = 'start', size = labelSize, weight = 800) => (
		<text x={x} y={y} fill={palette.ink} fontSize={size} fontWeight={weight} textAnchor={anchor} dominantBaseline="central">
			{value}
		</text>
	);

	const level = BURETTE.top + 20 + ((BURETTE.bottom - BURETTE.top - 20) * added) / capacity;
	const dripping = visual.motion && progress > 0 && progress < 1;
	const fill = 0.35 + 0.25 * (added / Math.max(maxVolume, 1));
	const surfaceY = FLASK.bottom - (FLASK.bottom - FLASK.neckBottom) * fill;
	const flaskHalfAt = (y: number) => FLASK.neck + ((FLASK.half - FLASK.neck) * (y - FLASK.neckBottom)) / (FLASK.bottom - FLASK.neckBottom);
	const flaskLabel = `${amount(visual.flask.volume)} mL ${amount(visual.flask.molarity)} M ${visual.flask.label}`;
	const buretteLabel = `${amount(visual.burette.molarity)} M ${visual.burette.label}`;

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
				<Part id="burette">
					{(look) => (
						<g opacity={look.opacity}>
							<rect x={BURETTE.x - BURETTE.width / 2} y={level} width={BURETTE.width} height={BURETTE.bottom - level} fill={mixColors(palette.lesson, palette.surface, 0.55)} />
							<rect x={BURETTE.x - BURETTE.width / 2} y={BURETTE.top} width={BURETTE.width} height={BURETTE.bottom - BURETTE.top} fill="none" stroke={palette.ink} strokeWidth={4} rx={6} />
							{Array.from({length: 11}, (_, index) => {
								const y = BURETTE.top + 20 + ((BURETTE.bottom - BURETTE.top - 20) * index) / 10;
								return <line key={index} x1={BURETTE.x - BURETTE.width / 2} y1={y} x2={BURETTE.x - BURETTE.width / 2 + (index % 5 === 0 ? 20 : 11)} y2={y} stroke={palette.ink} strokeWidth={2.5} />;
							})}
							<path
								d={`M ${BURETTE.x - 10} ${BURETTE.bottom} L ${BURETTE.x - 10} ${BURETTE.bottom + 30} L ${BURETTE.x - 4} ${TIP} L ${BURETTE.x + 4} ${TIP} L ${BURETTE.x + 10} ${BURETTE.bottom + 30} L ${BURETTE.x + 10} ${BURETTE.bottom} Z`}
								fill={palette.surface}
								stroke={palette.ink}
								strokeWidth={3}
							/>
							<rect x={BURETTE.x - 30} y={BURETTE.bottom + 34} width={60} height={14} rx={7} fill={palette.lessonDeep} transform={`rotate(${dripping ? 0 : 90} ${BURETTE.x} ${BURETTE.bottom + 41})`} />
							{dripping
								? [0, 0.5].map((phase) => {
										const fall = (seconds * 2.2 + phase) % 1;
										return <ellipse key={phase} cx={BURETTE.x} cy={TIP + 8 + (surfaceY - TIP - 8) * fall * fall} rx={6} ry={9} fill={mixColors(palette.lesson, palette.surface, 0.35)} />;
									})
								: null}
							{text(BURETTE.x + 50, BURETTE.top + 40, buretteLabel)}
							{text(BURETTE.x + 50, BURETTE.top + 90, `${decimal(added)} mL`, 'start', labelSize * 0.85, 700)}
						</g>
					)}
				</Part>
				<Part id="flask">
					{(look) => (
						<g opacity={look.opacity}>
							<path
								d={`M ${FLASK.x - flaskHalfAt(surfaceY)} ${surfaceY} L ${FLASK.x + flaskHalfAt(surfaceY)} ${surfaceY} L ${FLASK.x + FLASK.half} ${FLASK.bottom} L ${FLASK.x - FLASK.half} ${FLASK.bottom} Z`}
								fill={liquid}
							/>
							<path
								d={`M ${FLASK.x - FLASK.neck} ${FLASK.neckTop} L ${FLASK.x - FLASK.neck} ${FLASK.neckBottom} L ${FLASK.x - FLASK.half} ${FLASK.bottom} L ${FLASK.x + FLASK.half} ${FLASK.bottom} L ${FLASK.x + FLASK.neck} ${FLASK.neckBottom} L ${FLASK.x + FLASK.neck} ${FLASK.neckTop}`}
								fill="none"
								stroke={palette.ink}
								strokeWidth={5}
								strokeLinejoin="round"
							/>
							{text(FLASK.x + FLASK.half + 30, FLASK.bottom - 90, flaskLabel)}
							{text(FLASK.x + FLASK.half + 30, FLASK.bottom - 30, `pH = ${decimal(pH)}`, 'start', labelSize, 800)}
						</g>
					)}
				</Part>
				<Part id="curve">
					{(look) => (
						<g opacity={look.opacity}>
							{[0, 7, 14].map((value) => (
								<g key={value}>
									<line
										x1={PLOT.left}
										y1={yOf(value)}
										x2={PLOT.right}
										y2={yOf(value)}
										stroke={value === 7 ? palette.axis : palette.grid}
										strokeWidth={value === 7 ? 3 : 2}
										strokeDasharray={value === 7 ? '10 8' : undefined}
									/>
									{text(PLOT.left - 16, yOf(value), String(value), 'end', labelSize * 0.8, 700)}
								</g>
							))}
							<line x1={PLOT.left} y1={PLOT.top} x2={PLOT.left} y2={PLOT.bottom} stroke={palette.ink} strokeWidth={4} />
							<line x1={PLOT.left} y1={PLOT.bottom} x2={PLOT.right} y2={PLOT.bottom} stroke={palette.ink} strokeWidth={4} />
							{Array.from({length: Math.floor(maxVolume / (maxVolume > 60 ? 20 : 10)) + 1}, (_, index) => index * (maxVolume > 60 ? 20 : 10)).map((volume) => (
								<g key={volume}>
									<line x1={xOf(volume)} y1={PLOT.bottom} x2={xOf(volume)} y2={PLOT.bottom + 12} stroke={palette.ink} strokeWidth={3} />
									{text(xOf(volume), PLOT.bottom + 36, String(volume), 'middle', labelSize * 0.8, 700)}
								</g>
							))}
							{text((PLOT.left + PLOT.right) / 2, PLOT.bottom + 86, visual.volumeLabel, 'middle', labelSize * 0.85, 700)}
							{text(PLOT.left, PLOT.top - 40, 'pH', 'middle', labelSize * 0.9)}
							{added > 0 ? <path d={curve} fill="none" stroke={palette.lesson} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" /> : null}
							<circle cx={xOf(added)} cy={yOf(pH)} r={11} fill={palette.brand} stroke={palette.surface} strokeWidth={3} />
						</g>
					)}
				</Part>
				<Part id="equivalence">
					{(look) => (
						<g opacity={look.opacity}>
							<line x1={xOf(equivalence)} y1={PLOT.bottom} x2={xOf(equivalence)} y2={PLOT.top - 10} stroke={palette.brand} strokeWidth={4} strokeDasharray="10 8" />
							<circle cx={xOf(equivalence)} cy={yOf(7)} r={12} fill={palette.surface} stroke={palette.brand} strokeWidth={5} />
							{text(xOf(equivalence), PLOT.top - 40, `${visual.equivalenceLabel}: ${amount(Math.round(equivalence * 10) / 10)} mL`, 'middle', labelSize * 0.85)}
						</g>
					)}
				</Part>
			</g>
		</svg>
	);
};
