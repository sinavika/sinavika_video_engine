import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {withAlpha} from '../../../Themes/Theme';
import {textWidth} from '../FigureLabel';
import {useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import {visualStages, type CourseVisual} from '../VisualSchema';
import {useStageClock} from '../VisualTimeline';
import {usePartLook, World} from '../VisualWorld';
import {longDivisionRounds} from './MathWork';

type LongDivision = Extract<CourseVisual, {kind: 'longDivision'}>;

const FONT = 58;
const DIGIT = 44;
const LINE = 74;
const PAD = 40;

/** The check line under a division: bölünen = bölen · bölüm + kalan. */
export const divisionCheck = (visual: LongDivision): string => {
	const {quotient, remainder} = longDivisionRounds(visual.dividend, visual.divisor);
	return `${visual.dividend} = ${visual.divisor} · ${quotient}${remainder ? ` + ${remainder}` : ''}`;
};

/** The stages of a long division: one per round, then the check. */
const longDivisionStages = (visual: LongDivision): string[] => [...(visualStages(visual) ?? [])];

/** The board's size in its own units: the dividend's digits, the divisor's side, and two lines per round. */
export const longDivisionFrame = (visual: LongDivision) => {
	const digits = String(visual.dividend).length;
	const {rounds} = longDivisionRounds(visual.dividend, visual.divisor);
	const left = PAD + DIGIT * 1.2;
	const bar = left + digits * DIGIT + 26;
	const side = Math.max(textWidth(String(visual.divisor), FONT, 800), rounds.length * DIGIT) + 60;
	const lines = 1 + rounds.length * 2;
	const check = visual.check ? textWidth(divisionCheck(visual), FONT * 0.8, 800) + 2 * PAD : 0;
	return {left, bar, side, lines, width: Math.max(bar + side + PAD, check), height: lines * LINE + (visual.check ? LINE * 1.3 : 0) + PAD};
};

/**
 * Long division written as taught in Turkish classrooms: bölünen | bölen, the quotient under the divisor, and each
 * round's product subtracted under the part it is taken from, the next digit brought down. One stage per round (the
 * quotient digit comes with it), then the check bölünen = bölen · bölüm + kalan. The engine works every number out.
 */
export const LongDivisionVisual: React.FC<VisualBoxProps & {visual: LongDivision}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const frame = longDivisionFrame(visual);
	const {rounds, remainder} = longDivisionRounds(visual.dividend, visual.divisor);
	const stages = longDivisionStages(visual);
	const clock = useStageClock(stages.length, {delaySeconds: delaySeconds + 0.6, secondsPerStage: 2.6});
	const quotientLook = usePartLook('quotient', 1);
	const remainderLook = usePartLook('remainder', 1);
	const checkLook = usePartLook('check', 1);
	const digits = String(visual.dividend).split('');
	const columnX = (column: number) => frame.left + column * DIGIT + DIGIT / 2;
	const lineY = (line: number) => PAD / 2 + line * LINE + LINE * 0.72;
	/** A number written so its last digit stands in `column`. */
	const numberAt = (value: number, column: number, line: number, colour: string, opacity: number, key: string) =>
		String(value)
			.split('')
			.map((digit, index, all) => (
				<text key={`${key}-${index}`} x={columnX(column - (all.length - 1 - index))} y={lineY(line)} textAnchor="middle" fill={colour} fontSize={FONT} fontWeight={800} opacity={opacity}>
					{digit}
				</text>
			));
	const roundShown = (index: number) => (index < clock.stage ? 1 : index === clock.stage ? easeFrom(clock.seconds, 0, 0.5) : 0);
	const restShown = (index: number) => (index < clock.stage ? 1 : index === clock.stage ? easeFrom(clock.seconds, Math.min(1.2, clock.duration * 0.45), 0.5) : 0);
	const quotientDigits = rounds.map((round) => String(round.digit));

	return (
		<World width={width} height={height} viewWidth={frame.width} viewHeight={frame.height}>
			<g style={{fontFamily: palette.fontDisplay}}>
				{/* bölünen | bölen, the line under the divisor, the quotient below it. */}
				{digits.map((digit, index) => (
					<text key={`d${index}`} x={columnX(index)} y={lineY(0)} textAnchor="middle" fill={palette.ink} fontSize={FONT} fontWeight={800}>
						{digit}
					</text>
				))}
				<line x1={frame.bar} x2={frame.bar} y1={PAD / 2 + 6} y2={PAD / 2 + LINE * 2.2} stroke={palette.ink} strokeWidth={5} strokeLinecap="round" />
				<text x={frame.bar + 24} y={lineY(0)} fill={palette.ink} fontSize={FONT} fontWeight={800}>
					{visual.divisor}
				</text>
				<line x1={frame.bar} x2={frame.bar + frame.side - 10} y1={PAD / 2 + LINE + 4} y2={PAD / 2 + LINE + 4} stroke={palette.ink} strokeWidth={5} strokeLinecap="round" />
				<g opacity={quotientLook.opacity}>
					{quotientDigits.map((digit, index) => (
						<text key={`q${index}`} x={frame.bar + 24 + DIGIT / 2 + index * DIGIT} y={lineY(1)} textAnchor="middle" fill={quotientLook.focused > 0.5 ? palette.brand : palette.lesson} fontSize={FONT} fontWeight={800} opacity={roundShown(index)}>
							{digit}
						</text>
					))}
				</g>
				{rounds.map((round, index) => {
					const productLine = 1 + index * 2;
					const shown = roundShown(index);
					const rest = restShown(index);
					const last = index === rounds.length - 1;
					const nextPart = last ? remainder : rounds[index + 1].part;
					const restColumn = last ? round.column : rounds[index + 1].column;
					const width = String(round.part).length * DIGIT;
					return (
						<g key={`r${index}`}>
							{/* The part being divided is lit while its round is on. */}
							{index === clock.stage && shown > 0 ? <rect x={columnX(round.column) + DIGIT / 2 - width - 4} y={lineY(productLine - 1) - FONT * 0.82} width={width + 8} height={FONT * 1.05} rx={12} fill={withAlpha(palette.lesson, 0.16 * shown)} /> : null}
							<text x={columnX(round.column - String(round.product).length + 1) - DIGIT * 0.75} y={lineY(productLine)} textAnchor="middle" fill={palette.muted} fontSize={FONT * 0.8} fontWeight={800} opacity={shown}>
								−
							</text>
							{numberAt(round.product, round.column, productLine, palette.ink, shown, `p${index}`)}
							<line x1={columnX(round.column) + DIGIT / 2 - width} x2={columnX(round.column) + DIGIT / 2} y1={lineY(productLine) + 16} y2={lineY(productLine) + 16} stroke={palette.ink} strokeWidth={4} opacity={shown} />
							{numberAt(nextPart, restColumn, productLine + 1, last ? (remainderLook.focused > 0.5 ? palette.brand : palette.lesson) : palette.ink, rest * (last ? remainderLook.opacity : 1), `n${index}`)}
							{last ? <rect x={columnX(restColumn) + DIGIT / 2 - String(nextPart).length * DIGIT - 8} y={lineY(productLine + 1) - FONT * 0.85} width={String(nextPart).length * DIGIT + 16} height={FONT * 1.1} rx={14} fill="none" stroke={palette.lesson} strokeWidth={4} opacity={rest * remainderLook.opacity} /> : null}
						</g>
					);
				})}
				{visual.check ? (
					<text x={frame.width / 2} y={frame.height - PAD / 2 - LINE * 0.2} textAnchor="middle" fill={palette.lesson} fontSize={FONT * 0.8} fontWeight={800} opacity={(clock.stage >= stages.length - 1 ? easeFrom(clock.seconds, 0.2, 0.5) : 0) * checkLook.opacity}>
						{divisionCheck(visual)}
					</text>
				) : null}
			</g>
		</World>
	);
};
