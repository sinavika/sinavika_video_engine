import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {withAlpha} from '../../../Themes/Theme';
import {textWidth} from '../FigureLabel';
import {useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import {visualStages, type CourseVisual} from '../VisualSchema';
import {useStageClock} from '../VisualTimeline';
import {usePartLook, World} from '../VisualWorld';
import {primeLadder, primePowers} from './MathWork';

type PrimeLadder = Extract<CourseVisual, {kind: 'primeLadder'}>;

const FONT = 50;
const ROW = 78;
const COLUMN = 150;
const PRIME = 120;
const PAD = 36;

/** The result lines under the ladder: EBOB and EKOK as products of the ladder's primes, or a number's prime powers. */
export const ladderResults = (visual: PrimeLadder): {id: string; text: string}[] => {
	const {rows, ebob, ekok} = primeLadder(visual.numbers);
	const product = (primes: number[]) => (primes.length ? `${primes.join(' · ')} = ` : '');
	const results: {id: string; text: string}[] = [];
	if (visual.show === 'powers') return [{id: 'powers', text: `${visual.numbers.join(', ')} → ${visual.numbers.map((value) => `${value} = ${primePowers(value)}`).join(';  ')}`}];
	if (visual.show === 'ebob' || visual.show === 'both') results.push({id: 'ebob', text: `EBOB = ${product(rows.filter((row) => row.all).map((row) => row.prime))}${ebob}`});
	if (visual.show === 'ekok' || visual.show === 'both') results.push({id: 'ekok', text: `EKOK = ${product(rows.map((row) => row.prime))}${ekok}`});
	return results;
};

/** The stages of a ladder: one per row (÷ 2, ÷ 3 …), then the result. */
const primeLadderStages = (visual: PrimeLadder): string[] => [...(visualStages(visual) ?? [])];

export const primeLadderFrame = (visual: PrimeLadder) => {
	const {rows} = primeLadder(visual.numbers);
	const columns = visual.numbers.length;
	const bar = PAD + columns * COLUMN;
	const results = ladderResults(visual);
	const resultWidth = Math.max(0, ...results.map((result) => textWidth(result.text, FONT * 0.82, 800))) + 2 * PAD;
	return {rows: rows.length + 1, bar, width: Math.max(bar + PRIME + PAD, resultWidth), height: (rows.length + 1) * ROW + results.length * ROW * 0.95 + PAD * 1.5};
};

/**
 * The prime ladder (bölen merdiveni): the numbers on top, divided row by row by the smallest prime that divides one
 * of them; a number the prime does not divide goes down as it is. A prime that divides every number of its row is
 * circled: those make the EBOB, all of them the EKOK. One stage per row, then the result lines.
 */
export const PrimeLadderVisual: React.FC<VisualBoxProps & {visual: PrimeLadder}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const frame = primeLadderFrame(visual);
	const ladder = primeLadder(visual.numbers);
	const stages = primeLadderStages(visual);
	const clock = useStageClock(stages.length, {delaySeconds: delaySeconds + 0.6, secondsPerStage: 2.2});
	const rowLooks = Array.from({length: 10}, (_, index) => usePartLook(`r${index + 1}`, 1));
	const resultLooks = {ebob: usePartLook('ebob', 1), ekok: usePartLook('ekok', 1), powers: usePartLook('powers', 1)};
	const results = ladderResults(visual);
	const rowY = (row: number) => PAD + row * ROW + ROW * 0.68;
	const columnX = (column: number) => PAD + column * COLUMN + COLUMN / 2;
	// Row r of numbers is the top row (r = 0) or what row r − 1 left; it comes in with the stage that divides into it.
	const shown = (stage: number) => (stage < clock.stage ? 1 : stage === clock.stage ? easeFrom(clock.seconds, 0, 0.5) : 0);
	const values = [...ladder.rows.map((row) => row.values), visual.numbers.map(() => 1)];
	const resultsShown = shown(stages.length - 1);

	return (
		<World width={width} height={height} viewWidth={frame.width} viewHeight={frame.height}>
			<g style={{fontFamily: palette.fontDisplay}}>
				{/* The ladder's rail grows with the rows written so far. */}
				<line x1={frame.bar} x2={frame.bar} y1={PAD} y2={PAD + (1 + Math.min(ladder.rows.length, clock.stage + shown(clock.stage))) * ROW - ROW * 0.15} stroke={palette.ink} strokeWidth={5} strokeLinecap="round" />
				{values.map((row, index) => {
					// The top row is there from the start; each later row comes with the division above it.
					const opacity = index === 0 ? 1 : shown(index - 1);
					const look = index < ladder.rows.length ? rowLooks[index] : {opacity: 1, focused: 0};
					const prime = ladder.rows[index];
					return (
						<g key={index} opacity={opacity * (index < ladder.rows.length ? look.opacity : 1)}>
							{look.focused > 0.05 ? <rect x={PAD / 2} y={rowY(index) - FONT * 0.9} width={frame.bar + PRIME - PAD / 2} height={FONT * 1.25} rx={16} fill={withAlpha(palette.lesson, 0.16 * look.focused)} /> : null}
							{row.map((value, column) => {
								const divided = prime ? value % prime.prime === 0 : false;
								return (
									<text key={column} x={columnX(column)} y={rowY(index)} textAnchor="middle" fill={index === values.length - 1 ? palette.muted : palette.ink} fontSize={FONT} fontWeight={800} opacity={prime && !divided ? 0.5 : 1}>
										{value}
									</text>
								);
							})}
							{prime ? (
								<g opacity={shown(index)}>
									{prime.all ? <circle cx={frame.bar + PRIME / 2} cy={rowY(index) - FONT * 0.33} r={FONT * 0.72} fill={withAlpha(palette.lesson, 0.16)} stroke={palette.lesson} strokeWidth={5} /> : null}
									<text x={frame.bar + PRIME / 2} y={rowY(index)} textAnchor="middle" fill={prime.all ? palette.lesson : palette.ink} fontSize={FONT} fontWeight={800}>
										{prime.prime}
									</text>
								</g>
							) : null}
						</g>
					);
				})}
				{results.map((result, index) => {
					const look = resultLooks[result.id as keyof typeof resultLooks];
					return (
						<text key={result.id} x={PAD} y={PAD + frame.rows * ROW + ROW * 0.55 + index * ROW * 0.95} fill={result.id === 'ekok' ? palette.brand : palette.lesson} fontSize={FONT * 0.82} fontWeight={800} opacity={resultsShown * look.opacity}>
							{result.text}
						</text>
					);
				})}
			</g>
		</World>
	);
};
