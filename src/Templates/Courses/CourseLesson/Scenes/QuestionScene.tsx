import React from 'react';
import {easeFrom} from '../../../../Animations/Motion';
import {Animated} from '../../../../Components/Animations/Animated';
import {FitBox} from '../../../../Components/Layouts/FitBox';
import {SafeArea} from '../../../../Components/Layouts/SafeArea';
import {useVideoLayout} from '../../../../Components/Layouts/VideoLayout';
import {Countdown} from '../../../../Components/Overlays/Countdown';
import {Badge} from '../../../../Components/Typography/Badge';
import {MathExpression} from '../../../../Components/Typography/MathExpression';
import {RichInline, RichText} from '../../../../Components/Typography/RichText';
import {Text} from '../../../../Components/Typography/Text';
import {CourseVisual, worldRatio} from '../../../../Components/Visuals/CourseVisual';
import {strikeStyle, useSceneSeconds} from '../../../../Components/Visuals/VisualFrame';
import {BRAND_TYPOGRAPHY} from '../../../../Configurations/BrandTypography';
import {passageLineBreaks, passageSentences, type ReadingCues, type StepCues} from '../../../../Courses/LessonCue';
import {OPTION_LETTERS, type Question} from '../../../../Courses/LessonScript';
import {CHROME_HEIGHT, SPACING} from '../../../../Themes/DesignTokens';
import {withAlpha} from '../../../../Themes/Theme';
import {useInk, useTheme} from '../../../../Themes/ThemeContext';
import {StudioHeading, TYPE, useStudio} from './LessonChrome';

const PART_AT_START = /^\(\s*(I{1,3}|IV|V)\s*\)\s*/;

const ROMAN_NUMBER: Record<string, number> = {I: 1, II: 2, III: 3, IV: 4, V: 5};

/** A numbered part's mark, "(III)", set as a small badge; filled while a step points at its sentence. */
const PartBadge: React.FC<{numeral: string; lit: number}> = ({numeral, lit}) => {
	const {colors, typography} = useTheme();
	const {u} = useVideoLayout();
	const lesson = colors.lesson?.fill ?? colors.accent;
	return (
		<span style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: u(44), height: u(38), padding: `0 ${u(8)}px`, marginRight: u(10), borderRadius: u(19), verticalAlign: 'middle', position: 'relative', top: -u(2), backgroundColor: lit > 0.5 ? lesson : withAlpha(lesson, 0.14), color: lit > 0.5 ? (colors.lesson?.on ?? colors.onAccent) : lesson, fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(22), lineHeight: 1, transform: `scale(${1 + 0.15 * lit})`}}>
			{numeral}
		</span>
	);
};

/**
 * The paragraph of a question, sentence by sentence. While it is read the
 * sentence being said is lit and in full ink; a step can point at a sentence
 * ("(III) konunun başka bir yönüne geçiyor"), which then stays lit, and at
 * words, which get a marker stroke as they are named.
 */
const Passage: React.FC<{context: string; reading?: ReadingCues; lit: StepCues['sentences']; marks: StepCues['marks']}> = ({context, reading, lit, marks}) => {
	const {colors} = useTheme();
	const ink = useInk();
	const {u} = useVideoLayout();
	const seconds = useSceneSeconds();
	const lesson = colors.lesson?.fill ?? colors.accent;
	const sentences = passageSentences(context);
	const breaks = passageLineBreaks(context, sentences);
	return (
		<Text size={34} tone="muted">
			{sentences.map((sentence, index) => {
				const part = PART_AT_START.exec(sentence);
				const body = part ? sentence.slice(part[0].length) : sentence;
				const number = part ? ROMAN_NUMBER[part[1]] : index + 1;
				const cue = reading?.sentences[index];
				const read = reading && cue !== undefined ? Math.min(easeFrom(seconds, cue, 0.3), 1 - easeFrom(seconds, (reading.sentences[index + 1] ?? reading.stem ?? reading.end) - 0.1, 0.3)) : 0;
				const litAt = lit.find((entry) => entry.sentence === number)?.at;
				const pointed = litAt === undefined ? 0 : easeFrom(seconds, litAt, 0.4);
				return (
					<React.Fragment key={index}>
						<span style={{color: Math.max(read, pointed) > 0.5 ? ink.text : undefined, backgroundColor: withAlpha(lesson, 0.1 * read + 0.16 * pointed), borderRadius: u(8), boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone'}}>
							{part ? <PartBadge numeral={part[1]} lit={pointed} /> : null}
							<RichInline text={body} marks={marks} />
						</span>
						{index < sentences.length - 1 ? breaks[index] ? <br /> : ' ' : null}
					</React.Fragment>
				);
			})}
		</Text>
	);
};

/**
 * A worked question. The stem and options come first; each solution step
 * appears when its narration starts (`stepStarts`, seconds into the scene),
 * and the correct option lights up with the last step.
 */
/**
 * The steps under a question's figure: all laid out from the start (each fades in as it is said), fitted to the room
 * the figure leaves, with the thinking countdown over them while it runs.
 */
const FigureSolution: React.FC<{question: Question; stepStarts: number[]; answerAt: number; think?: {at: number; seconds: number}}> = ({question, stepStarts, answerAt, think}) => {
	const {colors, typography} = useTheme();
	const {u} = useVideoLayout();
	const seconds = useSceneSeconds();
	const lesson = colors.lesson?.fill ?? colors.accent;
	const thinking = think !== undefined && seconds >= think.at && seconds < think.at + think.seconds;
	return (
		<div style={{flex: 1, minHeight: 0, position: 'relative', display: 'flex', flexDirection: 'column'}}>
			<FitBox align="start" minScale={0.4}>
				<div style={{display: 'flex', flexDirection: 'column', gap: u(SPACING.md)}}>
					{question.steps.map((step, index) => (
						<Animated key={index} animation={{preset: 'slide', direction: 'left', distance: 40}} delaySeconds={stepStarts[index] ?? 0}>
							<div style={{display: 'flex', gap: u(16), alignItems: 'flex-start'}}>
								<div style={{width: u(44), height: u(44), borderRadius: '50%', backgroundColor: lesson, color: colors.lesson?.on ?? colors.onAccent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(24)}}>
									{index + 1}
								</div>
								<div style={{display: 'flex', flexDirection: 'column', gap: u(8), minWidth: 0}}>
									<RichText text={step.text} size={32} />
									{step.latex ? (
										<Text size={40}>
											<MathExpression latex={step.latex} display style={{margin: 0}} />
										</Text>
									) : null}
								</div>
							</div>
						</Animated>
					))}
					<Animated animation={{preset: 'scale', easing: 'overshoot'}} delaySeconds={answerAt}>
						<div style={{alignSelf: 'flex-start', display: 'inline-block', padding: `${u(12)}px ${u(24)}px`, borderRadius: u(999), backgroundColor: lesson, color: colors.lesson?.on ?? colors.onAccent, fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(34)}}>
							Cevap: {OPTION_LETTERS[question.answer]}
						</div>
					</Animated>
				</div>
			</FitBox>
			{thinking && think ? (
				<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<Countdown left={think.at + think.seconds - seconds} total={think.seconds} />
				</div>
			) : null}
		</div>
	);
};

/** A worked question: read, a counted pause to think (`think`, seconds into the scene), then the solution step by step. */
export const QuestionScene: React.FC<{question: Question; stepStarts: number[]; think?: {at: number; seconds: number}; section: string; number: string; reading?: ReadingCues; stepCues?: StepCues[]}> = ({question, stepStarts, think, section, number, reading, stepCues = []}) => {
	const {colors, typography} = useTheme();
	const {u, isLandscape, contentWidth, contentHeight} = useVideoLayout();
	const seconds = useSceneSeconds();
	const answerAt = (stepStarts.at(-1) ?? 0) + 0.6;
	// The question's figure sits at the top of the solution panel: as wide as the panel, at most 45% of its height.
	const figure = question.figure;
	const panelWidth = isLandscape ? ((contentWidth - u(SPACING.xl)) * 0.95) / 1.95 - u(SPACING.lg) * 2 - u(6) : contentWidth - u(SPACING.lg) * 2 - u(6);
	// A tall geometry figure (a pole, a mirror image below a line) gets a 20% taller box; in the usual 5:3 box it
	// was drawn small in the middle of empty width.
	const tall = figure?.kind === 'geometry' && (figure.view[2] - figure.view[0]) / (figure.view[3] - figure.view[1]) < 1.2;
	const figureRoom = Math.min(panelWidth * (tall ? 0.8 : 0.6), (contentHeight - u(CHROME_HEIGHT) - u(120)) * (isLandscape ? 0.48 : 0.3) * (tall ? 1.2 : 1));
	// A figure wider than 5:3 (a stanza of eleven-syllable lines, a food chain) takes the panel's whole width and only
	// the height it needs; in the 5:3 box a quatrain was drawn at two thirds of the panel with empty bands around it.
	const aspect = figure ? worldRatio(figure) : undefined;
	const wide = aspect !== undefined && aspect > 1 / 0.6;
	const figureWidth = wide ? panelWidth : Math.min(panelWidth, figureRoom / 0.6);
	const figureHeight = wide ? Math.min(figureRoom, panelWidth / aspect) : figureRoom;
	const revealed = seconds >= answerAt;
	const lesson = colors.lesson?.fill ?? colors.accent;
	// A long passage (ÖSYM paragraph questions) gets more of the width, so its type does not shrink while the
	// solution panel, which only holds a few short steps, stands half empty. Questions with a figure keep the split.
	const questionLength = (question.context?.length ?? 0) + question.stem.length + question.options.join('').length;
	const panelFlex = isLandscape && !figure && questionLength > 480 ? 0.72 : 0.95;
	const visible = question.steps.filter((_, index) => seconds >= stepStarts[index]);
	const marks = stepCues.flatMap((cue) => cue.marks);
	const lit = stepCues.flatMap((cue) => cue.sentences);
	const struck = (option: number) => stepCues.flatMap((cue) => cue.eliminate).find((entry) => entry.option === option)?.at;
	// While the question is read, the part being read is lit: a sentence of the passage, then each option.
	const readingLevel = (cue: number | undefined, next: number | undefined) => (reading && cue !== undefined ? Math.min(easeFrom(seconds, cue, 0.25), 1 - easeFrom(seconds, (next ?? reading.end) - 0.1, 0.25)) : 0);
	// Studio layout (camp lessons since 31 Oct 2026): a question without a figure is read and thought over alone, in the middle
	// and (when short) a little larger; with the first step it moves to its side and the solution comes in beside
	// it. The classic card showed an empty solution panel all that time. A figure is needed while reading, so a
	// question with one keeps the classic split.
	const studio = useStudio();
	const staged = studio && !figure;
	const solving = staged ? easeFrom(seconds, (stepStarts[0] ?? 0) - 0.35, 0.7) : 1;
	const grow = staged && !question.context && questionLength < 220 ? 1.12 : 1;
	const columnWidth = (contentWidth - u(SPACING.xl)) / (1 + panelFlex);
	const centred = (contentWidth - columnWidth * grow) / 2;
	const thinkingNow = think !== undefined && seconds >= think.at && seconds < think.at + think.seconds;

	return (
		<SafeArea chrome={!studio} gap={SPACING.lg}>
			{studio ? (
				<StudioHeading badge={question.style ?? 'Soru'} title={`Soru ${number}`} />
			) : (
				<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0}}>
					<Badge lesson size={TYPE.label}>
						{question.style ?? 'Soru'}
					</Badge>
					<Text variant="label" tone="muted" size={TYPE.label}>
						{section} · {number}
					</Text>
				</div>
			)}
			<div style={{flex: 1, minHeight: 0, position: 'relative', display: 'flex', flexDirection: isLandscape ? 'row' : 'column', gap: u(SPACING.xl)}}>
				{/* Studio: the countdown stands in the room right of the centred question, not inside the coming panel. */}
				{staged && think && thinkingNow ? (
					<div style={{position: 'absolute', top: 0, bottom: 0, right: 0, width: centred, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<Countdown left={think.at + think.seconds - seconds} total={think.seconds} />
					</div>
				) : null}
				<FitBox fill style={{flex: 1, ...(staged ? {transform: `translateX(${(1 - solving) * centred}px) scale(${1 + (grow - 1) * (1 - solving)})`, transformOrigin: 'left center'} : {})}}>
					<div style={{display: 'flex', flexDirection: 'column', gap: u(SPACING.md)}}>
						{question.context ? <Passage context={question.context} reading={reading} lit={lit} marks={marks} /> : null}
						<RichText text={question.stem} size={40} weight={typography.strongWeight} marks={marks} />
						<div style={{display: 'flex', flexDirection: 'column', gap: u(12), marginTop: u(8)}}>
							{question.options.map((option, index) => {
								const correct = revealed && index === question.answer;
								const read = readingLevel(reading?.options[index], reading?.options[index + 1]);
								// A step that rules an option out strikes it through; with the answer, the rest step back.
								const struckAt = struck(index);
								const out = struckAt === undefined ? 0 : easeFrom(seconds, struckAt, 0.45);
								const settled = index !== question.answer ? easeFrom(seconds, answerAt, 0.5) : 0;
								return (
									<div key={index} style={{display: 'flex', alignItems: 'center', gap: u(18), padding: `${u(12)}px ${u(18)}px`, borderRadius: u(18), border: `${u(3)}px solid ${correct || read > 0.5 ? lesson : colors.border}`, backgroundColor: correct ? withAlpha(lesson, 0.12) : read > 0 ? withAlpha(lesson, 0.06 * read) : colors.surface, opacity: 1 - 0.5 * Math.max(out, settled)}}>
										<div style={{width: u(52), height: u(52), borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: correct ? lesson : colors.surfaceAlt, color: correct ? (colors.lesson?.on ?? colors.onAccent) : colors.onSurface, fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(28)}}>
											{OPTION_LETTERS[index]}
										</div>
										<Text size={34}>
											<span style={strikeStyle(out, withAlpha(colors.danger, 0.75), u(4))}>
												<RichInline text={option} />
											</span>
										</Text>
									</div>
								);
							})}
						</div>
					</div>
				</FitBox>
				<div style={{flex: isLandscape ? panelFlex : undefined, display: 'flex', flexDirection: 'column', gap: u(SPACING.md), padding: u(SPACING.lg), borderRadius: u(28), backgroundColor: withAlpha(lesson, 0.06 * solving), border: staged ? 'none' : `${u(3)}px dashed ${withAlpha(lesson, 0.4)}`, transform: staged ? `translateX(${(1 - solving) * u(160)}px)` : undefined}}>
					<Text variant="label" tone="emphasis" size={TYPE.label} style={{opacity: solving}}>
						Çözüm
					</Text>
					{figure ? (
						<div style={{width: figureWidth, height: figureHeight, alignSelf: 'center', flexShrink: 0}}>
							<CourseVisual visual={figure} width={figureWidth} height={figureHeight} delaySeconds={0.4} />
						</div>
					) : null}
					{figure ? <FigureSolution question={question} stepStarts={stepStarts} answerAt={answerAt} think={think} /> : null}
					{!figure && !staged && think && thinkingNow ? (
						<div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							<Countdown left={think.at + think.seconds - seconds} total={think.seconds} />
						</div>
					) : null}
					{(figure ? [] : visible).map((step, index) => (
						<Animated key={index} animation={{preset: 'slide', direction: 'left', distance: 40}} delaySeconds={stepStarts[index]}>
							<div style={{display: 'flex', gap: u(16), alignItems: 'flex-start'}}>
								<div style={{width: u(44), height: u(44), borderRadius: '50%', backgroundColor: lesson, color: colors.lesson?.on ?? colors.onAccent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(24)}}>
									{index + 1}
								</div>
								<div style={{display: 'flex', flexDirection: 'column', gap: u(8), minWidth: 0}}>
									<RichText text={step.text} size={34} />
									{step.latex ? (
										<Text size={44}>
											<MathExpression latex={step.latex} display style={{margin: 0}} />
										</Text>
									) : null}
								</div>
							</div>
						</Animated>
					))}
					{revealed && !figure ? (
						<Animated animation={{preset: 'scale', easing: 'overshoot'}} delaySeconds={answerAt}>
							<div style={{alignSelf: 'flex-start', padding: `${u(12)}px ${u(24)}px`, borderRadius: u(999), backgroundColor: lesson, color: colors.lesson?.on ?? colors.onAccent, fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(34)}}>
								Cevap: {OPTION_LETTERS[question.answer]}
							</div>
						</Animated>
					) : null}
				</div>
			</div>
		</SafeArea>
	);
};
