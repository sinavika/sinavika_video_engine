import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {withAlpha} from '../../../Themes/Theme';
import {textWidth} from '../FigureLabel';
import {useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import {visualStages, type CourseVisual} from '../VisualSchema';
import {useStageClock} from '../VisualTimeline';
import {usePartLook, World} from '../VisualWorld';

type Slots = Extract<CourseVisual, {kind: 'slots'}>;

const BOX = 150;
const GAP = 70;
const FONT = 46;
const PAD = 36;

/** The product of the boxes and, when order does not matter, the product over `divideBy`. */
export const slotsResult = (visual: Slots): {product: number; result: number; line: string} => {
	const product = visual.slots.reduce((total, slot) => total * slot.count, 1);
	const result = visual.divideBy ? product / visual.divideBy.value : product;
	return {product, result, line: visual.divideBy ? `= ${product} ÷ ${visual.divideBy.label} = ${result}` : `= ${product}`};
};

/** The order the boxes are filled in: `order`, or left to right. */
const slotsOrder = (visual: Slots): number[] => visual.order ?? visual.slots.map((_, index) => index);

/** One stage per box (in filling order), then the result. */
export const slotsStages = (visual: Slots): string[] => [...(visualStages(visual) ?? [])];

export const slotsFrame = (visual: Slots) => {
	const boxes = visual.slots.length * BOX + (visual.slots.length - 1) * GAP;
	const result = textWidth(slotsResult(visual).line, FONT * 1.15, 800);
	const notes = visual.slots.some((slot) => slot.note) ? FONT * 1.6 : 0;
	const labels = visual.slots.some((slot) => slot.label) ? FONT * 1.6 : 0;
	const sameRow = boxes + GAP / 2 + result + 2 * PAD <= 1500;
	return {notes, labels, sameRow, boxes, width: sameRow ? boxes + GAP / 2 + result + 2 * PAD : Math.max(boxes, result) + 2 * PAD, height: PAD * 2 + notes + BOX + labels + (sameRow ? 0 : FONT * 1.8)};
};

/**
 * The counting slots (kutu yöntemi): a box for each place, filled in the order the reasoning goes (the restricted
 * place first, "birler basamağı çift olmalı"), each with the number of choices left for it; the boxes multiply and the
 * engine writes the product (over `divideBy` when order does not matter). A box not yet filled is drawn dashed.
 */
export const CountingBoardVisual: React.FC<VisualBoxProps & {visual: Slots}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const frame = slotsFrame(visual);
	const order = slotsOrder(visual);
	const stages = slotsStages(visual);
	const clock = useStageClock(stages.length, {delaySeconds: delaySeconds + 0.5, secondsPerStage: 1.8});
	const boxLooks = Array.from({length: 7}, (_, index) => usePartLook(`k${index + 1}`, 1));
	const resultLook = usePartLook('result', 1);
	const filledAt = (index: number) => order.indexOf(index);
	const shown = (stage: number) => (stage < clock.stage ? 1 : stage === clock.stage ? easeFrom(clock.seconds, 0, 0.45) : 0);
	const top = PAD + frame.notes;
	const boxX = (index: number) => PAD + index * (BOX + GAP);
	const {line} = slotsResult(visual);

	return (
		<World width={width} height={height} viewWidth={frame.width} viewHeight={frame.height}>
			<g style={{fontFamily: palette.fontDisplay}}>
				{visual.slots.map((slot, index) => {
					const filled = shown(filledAt(index));
					const look = boxLooks[index];
					const current = clock.stage === filledAt(index);
					return (
						<g key={index} opacity={look.opacity}>
							{slot.note ? (
								<text x={boxX(index) + BOX / 2} y={top - FONT * 0.55} textAnchor="middle" fill={palette.brand} fontSize={FONT * 0.62} fontWeight={800} opacity={0.35 + 0.65 * filled} style={{fontFamily: palette.fontBody}}>
									{slot.note}
								</text>
							) : null}
							<rect x={boxX(index)} y={top} width={BOX} height={BOX} rx={22} fill={withAlpha(palette.lesson, (current ? 0.24 : 0.12) * filled + 0.03)} stroke={filled > 0.5 || look.focused > 0.5 ? palette.lesson : palette.axis} strokeWidth={filled > 0.5 ? 6 : 4} strokeDasharray={filled > 0.5 ? undefined : '14 12'} />
							<text x={boxX(index) + BOX / 2} y={top + BOX / 2} textAnchor="middle" dominantBaseline="central" fill={palette.ink} fontSize={FONT * 1.6} fontWeight={800} opacity={filled} transform={`translate(0 ${(1 - filled) * -24})`}>
								{slot.count}
							</text>
							{slot.label ? (
								<text x={boxX(index) + BOX / 2} y={top + BOX + FONT * 1.05} textAnchor="middle" fill={palette.muted} fontSize={FONT * 0.7} fontWeight={700} style={{fontFamily: palette.fontBody}}>
									{slot.label}
								</text>
							) : null}
							{index < visual.slots.length - 1 ? (
								<text x={boxX(index) + BOX + GAP / 2} y={top + BOX / 2} textAnchor="middle" dominantBaseline="central" fill={palette.ink} fontSize={FONT * 1.3} fontWeight={800}>
									·
								</text>
							) : null}
						</g>
					);
				})}
				<text
					x={frame.sameRow ? PAD + frame.boxes + GAP / 2 : frame.width / 2}
					y={frame.sameRow ? top + BOX / 2 : top + BOX + frame.labels + FONT * 1.2}
					textAnchor={frame.sameRow ? 'start' : 'middle'}
					dominantBaseline="central"
					fill={resultLook.focused > 0.5 ? palette.brand : palette.lesson}
					fontSize={FONT * 1.15}
					fontWeight={800}
					opacity={shown(stages.length - 1) * resultLook.opacity}
				>
					{line}
				</text>
			</g>
		</World>
	);
};
