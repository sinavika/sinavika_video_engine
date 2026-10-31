import React from 'react';
import {clamp01} from '../../../Animations/Motion';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useBeatStartFor} from '../VisualTimeline';

type Feedback = Extract<CourseVisual, {kind: 'feedback'}>;

/** The stage (CourseVisual keeps this ratio). */
export const FEEDBACK_STAGE = {width: 1600, height: 820};

/** The normal level (set point) on the 0–1 scale of the level graph. */
const SET_POINT = 0.6;

/**
 * The end hormone's level (0–1) `seconds` after the run starts. Negative feedback: it climbs from low, overshoots the
 * set point once, and settles there as the feedback holds the glands back. Positive feedback: it grows ever faster
 * until the event that ends it (birth, ovulation), shown as a cap.
 */
export const hormoneLevel = (mode: 'negative' | 'positive', seconds: number, period: number): number => {
	if (mode === 'positive') return Math.min(0.95, 0.1 * Math.exp(seconds / (period / 2.5)));
	const omega = (2 * Math.PI) / period;
	return SET_POINT - 0.5 * Math.exp(-seconds / (period / 2.5)) * Math.cos(omega * seconds);
};

/** How strongly the feedback arrow acts (0–1) at a level: negative feedback bites above the set point, positive grows with the level. */
export const feedbackStrength = (mode: 'negative' | 'positive', level: number): number =>
	mode === 'positive' ? clamp01(level / SET_POINT) : clamp01((level - (SET_POINT - 0.05)) / 0.15);

/**
 * Hormonal feedback. A chain of glands (`nodes`, left to right) passes hormones down its arrows (`hormones`, one per
 * arrow, drawn as particles whose flow follows the feedback); the last hormone's level in the blood fills a gauge and
 * draws its curve against the normal level. In `negative` mode a rising level lights the dashed arrow back to the
 * glands in `back` (−) and the flow slows, so the level overshoots once and settles; in `positive` mode the arrow (+)
 * speeds the flow and the level runs away. Parts: n1…, h1… (an arrow and its hormone), feedback, level, run.
 */
export const FeedbackVisual: React.FC<VisualBoxProps & {visual: Feedback}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const k = Math.min(width / FEEDBACK_STAGE.width, height / FEEDBACK_STAGE.height);
	const ox = (width - FEEDBACK_STAGE.width * k) / 2;
	const oy = (height - FEEDBACK_STAGE.height * k) / 2;
	const appear = useReveal(delaySeconds, 0.5);
	const runStart = useBeatStartFor('run', 'show') ?? delaySeconds + 0.8;
	const time = visual.motion ? Math.max(0, seconds - runStart) : visual.period * 2.5;
	const fontSize = Math.max(60, 28 / k);
	const text = (x: number, y: number, value: string, size = fontSize * 0.8, anchor: 'start' | 'middle' | 'end' = 'middle', weight = 800) => (
		<text x={x} y={y} fill={palette.ink} fontSize={size} fontWeight={weight} textAnchor={anchor} dominantBaseline="central" stroke={palette.surface} strokeWidth={8} paintOrder="stroke">
			{value}
		</text>
	);
	const count = visual.nodes.length;
	const boxWidth = count === 4 ? 290 : 330;
	const gap = (1500 - 100 - count * boxWidth) / Math.max(1, count - 1);
	const boxX = (index: number) => 100 + index * (boxWidth + gap);
	const [boxTop, boxHeight] = [130, 130];
	const level = hormoneLevel(visual.mode, time, visual.period);
	const strength = time > 0 ? feedbackStrength(visual.mode, level) : 0;
	const rate = visual.mode === 'positive' ? 0.3 + 0.7 * strength : 1 - 0.85 * strength;
	const graph = {left: 200, right: 1240, top: 480, bottom: 770};
	const span = visual.period * 2.5;
	const gx = (at: number) => graph.left + ((graph.right - graph.left) * at) / span;
	const gy = (value: number) => graph.bottom - (graph.bottom - graph.top) * value;
	const drawn = Math.min(time, span);
	const curve = Array.from({length: 121}, (_, index) => (drawn * index) / 120)
		.map((at) => `${gx(at)},${gy(hormoneLevel(visual.mode, at, visual.period))}`)
		.join(' ');
	// The particles' travelled distance integrates the rate roughly: they move at the current rate, which changes slowly.
	const travel = time * 0.45;
	const loopY = boxTop + boxHeight + 90;
	const last = boxX(count - 1) + boxWidth / 2;

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
				{visual.nodes.map((node, index) => (
					<Part key={index} id={`n${index + 1}`}>
						{(look) => (
							<g opacity={look.opacity}>
								<rect x={boxX(index)} y={boxTop} width={boxWidth} height={boxHeight} rx={28} fill={palette.fill} stroke={look.scale > 1.25 ? palette.lesson : palette.ink} strokeWidth={look.scale > 1.25 ? 8 : 5} />
								{text(boxX(index) + boxWidth / 2, boxTop + boxHeight / 2, node.label, fontSize * 0.75)}
							</g>
						)}
					</Part>
				))}
				{visual.hormones.map((hormone, index) => {
					const [x1, x2] = [boxX(index) + boxWidth + 12, boxX(index + 1) - 12];
					const y = boxTop + boxHeight / 2;
					return (
						<Part key={index} id={`h${index + 1}`}>
							{(look) => (
								<g opacity={look.opacity}>
									<line x1={x1} y1={y} x2={x2 - 24} y2={y} stroke={palette.ink} strokeWidth={6} />
									<path d={`M ${x2 - 30} ${y - 18} L ${x2} ${y} L ${x2 - 30} ${y + 18} Z`} fill={palette.ink} />
									{text((x1 + x2) / 2, boxTop - 40, hormone, fontSize * 0.7)}
									{visual.motion && time > 0
										? [0, 1, 2].map((particle) => {
												const along = (travel + particle / 3) % 1;
												return <circle key={particle} cx={x1 + (x2 - 30 - x1) * along} cy={y - 26} r={11} fill={palette.lesson} opacity={rate} />;
											})
										: null}
								</g>
							)}
						</Part>
					);
				})}
				<Part id="feedback">
					{(look) => (
						<g opacity={look.opacity}>
							{visual.back.map((target) => {
								const x = boxX(target) + boxWidth / 2;
								const path = `M ${last} ${boxTop + boxHeight} L ${last} ${loopY} L ${x} ${loopY} L ${x} ${boxTop + boxHeight + 30}`;
								return (
									<g key={target}>
										<path d={path} fill="none" stroke={palette.axis} strokeWidth={5} strokeDasharray="14 10" />
										<path d={path} fill="none" stroke={palette.brand} strokeWidth={9} strokeDasharray="14 10" opacity={strength} />
										<path d={`M ${x - 16} ${boxTop + boxHeight + 34} L ${x} ${boxTop + boxHeight + 6} L ${x + 16} ${boxTop + boxHeight + 34} Z`} fill={strength > 0.3 ? palette.brand : palette.axis} />
									</g>
								);
							})}
							<circle cx={(last + boxX(Math.min(...visual.back)) + boxWidth / 2) / 2} cy={loopY} r={34} fill={palette.surface} stroke={strength > 0.3 ? palette.brand : palette.axis} strokeWidth={5} />
							{text((last + boxX(Math.min(...visual.back)) + boxWidth / 2) / 2, loopY, visual.mode === 'positive' ? '+' : '−', fontSize, 'middle', 900)}
						</g>
					)}
				</Part>
				<Part id="level">
					{(look) => (
						<g opacity={look.opacity}>
							<line x1={graph.left} y1={graph.bottom} x2={graph.right} y2={graph.bottom} stroke={palette.ink} strokeWidth={4} />
							<line x1={graph.left} y1={graph.bottom} x2={graph.left} y2={graph.top - 10} stroke={palette.ink} strokeWidth={4} />
							{text(graph.left - 20, graph.top + 10, visual.levelLabel, fontSize * 0.65, 'start', 700)}
							{visual.mode === 'negative' ? (
								<>
									<line x1={graph.left} y1={gy(SET_POINT)} x2={graph.right} y2={gy(SET_POINT)} stroke={palette.axis} strokeWidth={4} strokeDasharray="12 10" />
									{text(graph.right, gy(SET_POINT) - 30, visual.setLabel, fontSize * 0.6, 'end', 700)}
								</>
							) : null}
							<polyline points={curve} fill="none" stroke={palette.lesson} strokeWidth={8} strokeLinejoin="round" strokeLinecap="round" />
							<rect x={1360} y={graph.top} width={70} height={graph.bottom - graph.top} rx={14} fill={palette.surface} stroke={palette.ink} strokeWidth={4} />
							<rect x={1366} y={gy(level)} width={58} height={graph.bottom - gy(level) - 6} rx={10} fill={palette.lesson} />
							{visual.mode === 'negative' ? <line x1={1350} y1={gy(SET_POINT)} x2={1440} y2={gy(SET_POINT)} stroke={palette.ink} strokeWidth={4} strokeDasharray="10 8" /> : null}
						</g>
					)}
				</Part>
			</g>
		</svg>
	);
};
