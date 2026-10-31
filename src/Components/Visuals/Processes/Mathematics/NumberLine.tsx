import React from 'react';
import {clamp01, lerp, smooth} from '../../../../Animations/Motion';
import {withAlpha} from '../../../../Themes/Theme';
import {useVisualPalette, type VisualBoxProps} from '../../VisualFrame';
import type {CourseVisual} from '../../VisualSchema';
import {ProcessFrame, ProcessLabel, processCamera, useProcessClock} from '../ProcessScene';

type ProcessSpec = Extract<CourseVisual, {kind: 'process'}>;

/**
 * Absolute value as a distance on the number line: |3| and |−3| are both three steps from zero; |x − 2| = 3 asks for
 * the numbers three steps from 2, and two walkers find 5 and −1; |x − 2| < 3 shades everything closer than three
 * steps, the open interval from −1 to 5.
 */

const FROM = -6;
const TO = 8;
const LINE = {x0: 140, x1: 1460, y: 420};
const at = (value: number) => lerp(LINE.x0, LINE.x1, (value - FROM) / (TO - FROM));

export const NumberLineProcess: React.FC<VisualBoxProps & {visual: ProcessSpec}> = ({width, height, delaySeconds = 0, visual}) => {
	const palette = useVisualPalette();
	const clock = useProcessClock('numberline', visual.stages, delaySeconds);
	const camera = processCamera(clock, () => undefined);
	const {amount} = clock;

	const centre = clock.current === 'uzaklik' ? 0 : 2;
	const walk = smooth(clamp01((clock.current === 'esitsizlik' ? 1 : amount(clock.current)) * 1.6));
	const shade = clock.current === 'esitsizlik' ? smooth(clamp01(amount('esitsizlik') * 2)) : 0;
	const left = centre - 3 * walk;
	const right = centre + 3 * walk;
	const arc = (from: number, to: number, lift: number) => `M${at(from)} ${LINE.y} Q${(at(from) + at(to)) / 2} ${LINE.y - lift} ${at(to)} ${LINE.y}`;

	return (
		<ProcessFrame process="numberline" clock={clock} camera={camera} width={width} height={height} backdrop="#F6F8FA">
			{/* The interval for the inequality. */}
			<rect x={at(-1)} y={LINE.y - 16} width={(at(5) - at(-1)) * shade} height={32} rx={10} fill={withAlpha(palette.lesson, 0.25)} />
			<line x1={LINE.x0 - 30} y1={LINE.y} x2={LINE.x1 + 30} y2={LINE.y} stroke={palette.ink} strokeWidth={4} />
			<path d={`M${LINE.x1 + 30} ${LINE.y} l-16 -10 l0 20 z`} fill={palette.ink} />
			{Array.from({length: TO - FROM + 1}, (_, index) => {
				const value = FROM + index;
				return (
					<g key={value}>
						<line x1={at(value)} y1={LINE.y - 12} x2={at(value)} y2={LINE.y + 12} stroke={palette.ink} strokeWidth={3} />
						<text x={at(value)} y={LINE.y + 50} textAnchor="middle" fontFamily={palette.fontBody} fontWeight={value === centre ? 800 : 600} fontSize={30} fill={value === centre ? palette.lesson : palette.ink}>
							{value < 0 ? `−${-value}` : value}
						</text>
					</g>
				);
			})}
			{/* The centre the distance is measured from. */}
			<circle cx={at(centre)} cy={LINE.y} r={12} fill={palette.ink} />
			{/* Two walkers, three steps each way; the arcs they trace; the numbers they reach. */}
			<path d={arc(centre, left, 120 * walk)} fill="none" stroke={palette.lesson} strokeWidth={5} strokeDasharray="12 8" />
			<path d={arc(centre, right, 120 * walk)} fill="none" stroke={palette.lesson} strokeWidth={5} strokeDasharray="12 8" />
			<text x={(at(centre) + at(left)) / 2} y={LINE.y - 80 * walk - 20} textAnchor="middle" fontFamily={palette.fontDisplay} fontWeight={800} fontSize={34} fill={palette.lesson} opacity={walk}>
				3
			</text>
			<text x={(at(centre) + at(right)) / 2} y={LINE.y - 80 * walk - 20} textAnchor="middle" fontFamily={palette.fontDisplay} fontWeight={800} fontSize={34} fill={palette.lesson} opacity={walk}>
				3
			</text>
			{[left, right].map((value, index) => (
				<circle key={index} cx={at(value)} cy={LINE.y} r={14} fill={clock.current === 'esitsizlik' ? '#FFFFFF' : palette.lesson} stroke={palette.lesson} strokeWidth={5} opacity={walk} />
			))}
			<text x={800} y={200} textAnchor="middle" fontFamily={palette.fontDisplay} fontWeight={800} fontSize={44} fill={palette.ink}>
				{clock.current === 'uzaklik' ? '|3| = |−3| = 3' : clock.current === 'denklem' ? '|x − 2| = 3  →  x = 5 ya da x = −1' : '|x − 2| < 3  →  −1 < x < 5'}
			</text>
			<ProcessLabel id="merkez" at={[at(centre), LINE.y - 12]} to={[at(centre), LINE.y + 120]} text={centre === 0 ? 'Sıfırdan uzaklık' : '2’den uzaklık'} show={clock.now(clock.current)} />
		</ProcessFrame>
	);
};
