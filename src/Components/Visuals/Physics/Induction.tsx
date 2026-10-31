import React from 'react';
import {useReveal, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useStageClock} from '../VisualTimeline';
import {arrowHead} from './ArrowHead';

type Induction = Extract<CourseVisual, {kind: 'induction'}>;

/** The stage (CourseVisual keeps this ratio). */
export const INDUCTION_STAGE = {width: 1600, height: 900};

/** The three moments of the experiment, in order; beats move through them with `stage` 0, 1, 2. */
const INDUCTION_STAGES = ['Yaklaşıyor', 'Duruyor', 'Uzaklaşıyor'] as const;

/**
 * The induced current in the ring as the magnet comes in from the left, stops and goes back: which way it runs on
 * the ring's near side (+1 up, −1 down, 0 none). By Lenz's law the ring opposes the change: an approaching N pole
 * makes its near face an N pole too (the current runs up on the near side), a receding one the other way; an S pole
 * reverses everything; no motion, no current.
 */
export const inducedCurrent = (pole: 'N' | 'S', stage: 0 | 1 | 2) => (stage === 1 ? 0 : (stage === 0 ? 1 : -1) * (pole === 'N' ? 1 : -1));

/**
 * A bar magnet moves towards a metal ring, stops, then moves away. A galvanometer on the ring swings one way while
 * the magnet comes, rests at zero while it stands still and swings the other way while it leaves; arrows on the ring
 * show the induced current, and the ring's face takes the pole that opposes the change (Lenz's law). Beats move the
 * stages with `stage` 0, 1, 2 and point at `magnet`, `ring` and `meter`.
 */
export const InductionVisual: React.FC<VisualBoxProps & {visual: Induction}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {stage, progress} = useStageClock(INDUCTION_STAGES.length, {delaySeconds, secondsPerStage: 3.4});
	const k = Math.min(width / INDUCTION_STAGE.width, height / INDUCTION_STAGE.height);
	const ox = (width - INDUCTION_STAGE.width * k) / 2;
	const oy = (height - INDUCTION_STAGE.height * k) / 2;
	const appear = useReveal(delaySeconds, 0.5);
	const fontSize = 52;
	const current = inducedCurrent(visual.pole, Math.min(2, stage) as 0 | 1 | 2);
	// The magnet's place: in from the far left, still, back out.
	// The magnet's left end stays on the stage at its farthest.
	const farX = 420;
	const nearX = 780;
	const ease = (value: number) => value * value * (3 - 2 * value);
	const magnetX = stage === 0 ? farX + (nearX - farX) * ease(progress) : stage === 1 ? nearX : nearX - (nearX - farX) * ease(progress);
	const ringX = 1000;
	const axisY = 470;
	const facing = visual.pole;
	const away = facing === 'N' ? 'S' : 'N';
	const magnetWidth = 340;
	const needle = (current * Math.PI) / 5;
	// The ring's near face takes the pole that opposes the change: the same pole repels the coming magnet, the other
	// pole holds back the leaving one.
	const facePole = stage === 0 ? facing : stage === 2 ? away : null;

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
				{/* Stage chips. */}
				{INDUCTION_STAGES.map((name, index) => (
					<g key={name}>
						<rect x={200 + index * 420} y={30} width={380} height={64} rx={32} fill={index === stage ? palette.lesson : palette.fill} />
						<text x={200 + index * 420 + 190} y={74} fill={index === stage ? palette.surface : palette.ink} fontSize={fontSize * 0.7} fontWeight={800} textAnchor="middle">
							{`${index + 1}. ${name}`}
						</text>
					</g>
				))}
				<Part id="magnet">
					{(look) => (
						<g opacity={look.opacity}>
							<rect x={magnetX - magnetWidth} y={axisY - 60} width={magnetWidth / 2} height={120} fill={away === 'N' ? palette.brand : palette.lessonDeep} stroke={palette.ink} strokeWidth={5} />
							<rect x={magnetX - magnetWidth / 2} y={axisY - 60} width={magnetWidth / 2} height={120} fill={facing === 'N' ? palette.brand : palette.lessonDeep} stroke={palette.ink} strokeWidth={5} />
							<text x={magnetX - magnetWidth * 0.75} y={axisY + fontSize * 0.36} fill={palette.surface} fontSize={fontSize} fontWeight={800} textAnchor="middle">
								{away}
							</text>
							<text x={magnetX - magnetWidth * 0.25} y={axisY + fontSize * 0.36} fill={palette.surface} fontSize={fontSize} fontWeight={800} textAnchor="middle">
								{facing}
							</text>
							{stage !== 1 ? (
								<g>
									<line x1={magnetX - magnetWidth / 2} y1={axisY - 110} x2={magnetX - magnetWidth / 2 + (stage === 0 ? 150 : -150)} y2={axisY - 110} stroke={palette.ink} strokeWidth={10} strokeLinecap="round" />
									<path d={arrowHead(magnetX - magnetWidth / 2 + (stage === 0 ? 170 : -170), axisY - 110, stage === 0 ? 0 : Math.PI, 30)} fill={palette.ink} />
								</g>
							) : null}
						</g>
					)}
				</Part>
				<Part id="ring">
					{(look) => (
						<g opacity={look.opacity}>
							{/* The far half dashed, the near half solid. */}
							<path d={`M${ringX} ${axisY - 220} A 70 220 0 0 0 ${ringX} ${axisY + 220}`} fill="none" stroke={palette.axis} strokeWidth={10} strokeDasharray="14 12" />
							<path d={`M${ringX} ${axisY - 220} A 70 220 0 0 1 ${ringX} ${axisY + 220}`} fill="none" stroke={palette.ink} strokeWidth={14 * look.scale} />
							{current !== 0 ? (
								<g>
									{[-90, 0, 90].map((offset) => {
										const y = axisY + offset;
										const x = ringX + 70 * Math.sqrt(1 - (offset / 220) ** 2);
										return <path key={offset} d={arrowHead(x, y + (current > 0 ? -24 : 24), current > 0 ? -Math.PI / 2 : Math.PI / 2, 34)} fill={palette.brand} />;
									})}
									<text x={ringX + 110} y={axisY + 10} fill={palette.ink} fontSize={fontSize * 0.8} fontWeight={800}>
										i
									</text>
								</g>
							) : null}
							{facePole ? (
								<text x={ringX - 120} y={axisY - 250} fill={palette.ink} fontSize={fontSize * 0.75} fontWeight={800} textAnchor="middle">
									{`yüz: ${facePole}`}
								</text>
							) : null}
						</g>
					)}
				</Part>
				<Part id="meter">
					{(look) => (
						<g opacity={look.opacity}>
							{/* The galvanometer, wired to the ring. */}
							<line x1={ringX + 40} y1={axisY + 210} x2={ringX + 330} y2={axisY + 210} stroke={palette.ink} strokeWidth={5} />
							<line x1={ringX + 330} y1={axisY + 210} x2={ringX + 330} y2={axisY + 100} stroke={palette.ink} strokeWidth={5} />
							<circle cx={ringX + 330} cy={axisY - 10} r={110} fill={palette.surface} stroke={palette.ink} strokeWidth={6} />
							<path d={`M${ringX + 330 - 80} ${axisY + 10} A 85 85 0 0 1 ${ringX + 330 + 80} ${axisY + 10}`} fill="none" stroke={palette.axis} strokeWidth={4} />
							<line x1={ringX + 330} y1={axisY + 40} x2={ringX + 330 + Math.sin(needle) * 100} y2={axisY + 40 - Math.cos(needle) * 100} stroke={palette.brand} strokeWidth={8} strokeLinecap="round" />
							<circle cx={ringX + 330} cy={axisY + 40} r={10} fill={palette.ink} />
							<text x={ringX + 330} y={axisY + 90} fill={palette.ink} fontSize={fontSize * 0.7} fontWeight={800} textAnchor="middle">
								G
							</text>
						</g>
					)}
				</Part>
				<text x={INDUCTION_STAGE.width / 2} y={850} fill={palette.ink} fontSize={fontSize * 0.8} fontWeight={800} textAnchor="middle">
					{stage === 0 ? 'Akı artıyor: akım artışa karşı koyar' : stage === 1 ? 'Akı değişmiyor: akım yok' : 'Akı azalıyor: akım ters yönde'}
				</text>
			</g>
		</svg>
	);
};
