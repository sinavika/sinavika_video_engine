import React from 'react';
import {Sequence, interpolateColors, useCurrentFrame, useVideoConfig} from 'remotion';
import {animationProgress} from '../../../Animations/Motion';
import {Animated, Stagger} from '../../../Components/Animations/Animated';
import {DrawPath} from '../../../Components/Animations/DrawPath';
import {Icon} from '../../../Components/Illustrations/Icon';
import {Picture} from '../../../Components/Illustrations/Picture';
import {Callout} from '../../../Components/Layouts/Callout';
import {Card} from '../../../Components/Layouts/Card';
import {FitBox} from '../../../Components/Layouts/FitBox';
import {SafeArea} from '../../../Components/Layouts/SafeArea';
import {useVideoLayout} from '../../../Components/Layouts/VideoLayout';
import {SegmentedProgress} from '../../../Components/Overlays/SegmentedProgress';
import {Badge} from '../../../Components/Typography/Badge';
import {MathExpression} from '../../../Components/Typography/MathExpression';
import {RichText} from '../../../Components/Typography/RichText';
import {Text} from '../../../Components/Typography/Text';
import {activeSceneIndex, planScenes} from '../../../Scenes/ScenePlan';
import {CHROME_HEIGHT, SPACING} from '../../../Themes/DesignTokens';
import {InkProvider, useTheme} from '../../../Themes/ThemeContext';
import type {QuestionSolutionContent} from './QuestionSolutionSchema';

type Content = QuestionSolutionContent;

export const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E'];
const SHORT_OPTION_LENGTH = 16;

/** Longer questions get smaller type before FitBox has to step in. */
const questionTextSize = (text: string): number => (text.length <= 140 ? 44 : text.length <= 340 ? 37 : 32);

type OptionListProps = {
	options: string[];
	correctIndex?: number;
	/** When set, the correct option lights up at this time and the others dim. */
	revealAtSeconds?: number;
	/** When set, options enter one after another starting at this time. */
	enterAtSeconds?: number;
	dense?: boolean;
};

const OptionList: React.FC<OptionListProps> = ({options, correctIndex, revealAtSeconds, enterAtSeconds, dense = false}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {colors, shape, typography} = useTheme();
	const {u} = useVideoLayout();
	const isShort = Math.max(...options.map((option) => option.length)) <= SHORT_OPTION_LENGTH;
	const columns = isShort ? (dense ? options.length : 2) : 1;
	const reveal =
		revealAtSeconds === undefined
			? 0
			: animationProgress({frame, fps, delaySeconds: revealAtSeconds, durationSeconds: 0.5, easing: 'standard'});
	const letterSize = dense ? 44 : 58;

	return (
		<div
			style={{
				display: 'grid',
				gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
				gap: u(dense ? SPACING.sm : SPACING.md),
			}}
		>
			<Stagger
				animation={enterAtSeconds === undefined ? 'none' : {preset: 'slide', direction: 'up', distance: 30}}
				delaySeconds={enterAtSeconds ?? 0}
				stepSeconds={0.1}
			>
				{options.map((option, index) => {
					const isCorrect = index === correctIndex;
					const level = isCorrect ? reveal : 0;
					const lit = level > 0.5;
					const ink = lit ? colors.onStatus : colors.onSurface;
					return (
						<div
							key={index}
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: u(dense ? SPACING.sm : SPACING.md),
								padding: u(dense ? SPACING.sm : SPACING.md),
								borderRadius: u(shape.radius.sm),
								backgroundColor: interpolateColors(level, [0, 1], [colors.surfaceAlt, colors.success]),
								opacity: isCorrect ? 1 : 1 - 0.55 * reveal,
								transform: `scale(${(1 + 0.03 * level).toFixed(4)})`,
								color: ink,
							}}
						>
							<div
								style={{
									width: u(letterSize),
									height: u(letterSize),
									borderRadius: '50%',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									flexShrink: 0,
									backgroundColor: lit ? colors.onStatus : colors.primary,
									color: lit ? colors.success : colors.onPrimary,
									fontFamily: typography.display,
									fontWeight: typography.displayWeight,
									fontSize: u(letterSize * 0.5),
									lineHeight: 1,
								}}
							>
								{lit ? <Icon name="check" size={letterSize * 0.6} strokeWidth={3} /> : OPTION_LETTERS[index]}
							</div>
							<InkProvider ink={{text: ink, muted: ink, emphasis: ink}}>
								<RichText text={option} size={dense ? 32 : 38} weight={typography.strongWeight} style={{minWidth: 0}} />
							</InkProvider>
						</div>
					);
				})}
			</Stagger>
		</div>
	);
};

type QuestionCardProps = {
	content: Content;
	/** Tallest the card body may get, in actual pixels. Longer questions shrink to fit. */
	maxHeight: number;
	dense?: boolean;
	animate?: boolean;
	style?: React.CSSProperties;
};

const QuestionCard: React.FC<QuestionCardProps> = ({content, maxHeight, dense = false, animate = false, style}) => {
	const {u} = useVideoLayout();
	const {question} = content;
	const padding = dense ? SPACING.lg : SPACING.xl;
	const textSize = questionTextSize(question.text) * (dense ? 0.86 : 1);

	return (
		<Card padding={padding} style={{flexShrink: 0, ...style}}>
			<FitBox align="start" style={{flex: 'none', maxHeight: maxHeight - 2 * u(padding)}}>
				<div style={{display: 'flex', flexDirection: 'column', gap: u(dense ? SPACING.md : SPACING.lg)}}>
					<Text variant="label" tone="emphasis">
						Soru
					</Text>
					<RichText text={question.text} size={textSize} />
					{question.image ? <Picture image={question.image} height={dense ? 190 : 320} /> : null}
					{question.options ? (
						<OptionList options={question.options} dense={dense} enterAtSeconds={animate ? 0.9 : undefined} />
					) : null}
				</div>
			</FitBox>
		</Card>
	);
};

export const IntroScene: React.FC<{content: Content}> = ({content}) => {
	const {colors} = useTheme();
	const {u} = useVideoLayout();
	return (
		<SafeArea chrome gap={SPACING.xl} style={{alignItems: 'center', justifyContent: 'center'}}>
			<Animated animation={{preset: 'scale', easing: 'overshoot'}}>
				<div
					style={{
						width: u(168),
						height: u(168),
						borderRadius: '50%',
						backgroundColor: colors.primary,
						color: colors.onPrimary,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<Icon name="question" size={104} strokeWidth={2.4} />
				</div>
			</Animated>
			<Animated delaySeconds={0.2}>
				<Text variant="label" tone="emphasis" align="center" size={30}>
					Soru Çözümü
				</Text>
			</Animated>
			<Animated delaySeconds={0.35}>
				<Text variant="headline" align="center">
					{content.title}
				</Text>
			</Animated>
			{content.source ? (
				<Animated animation="fade" delaySeconds={0.7}>
					<Text variant="subtitle" tone="muted" align="center" size={36}>
						{content.source}
					</Text>
				</Animated>
			) : null}
		</SafeArea>
	);
};

export const QuestionScene: React.FC<{content: Content}> = ({content}) => {
	const {contentHeight, u} = useVideoLayout();
	return (
		<SafeArea chrome style={{justifyContent: 'center'}}>
			<Animated>
				<QuestionCard content={content} maxHeight={contentHeight - u(CHROME_HEIGHT)} animate />
			</Animated>
		</SafeArea>
	);
};

type Step = Content['steps'][number];

const StepView: React.FC<{step: Step; index: number; exitAtSeconds?: number}> = ({step, index, exitAtSeconds}) => {
	const {u, isPortrait} = useVideoLayout();
	const {colors} = useTheme();
	// Vertical video has the most room below the question, so the working is set larger there.
	const scale = isPortrait ? 1.14 : 1;
	return (
		<Animated
			animation="none"
			exitAtSeconds={exitAtSeconds}
			style={{flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column'}}
		>
			<FitBox align={isPortrait ? 'center' : 'start'}>
				<div style={{display: 'flex', flexDirection: 'column', gap: u(SPACING.lg * scale)}}>
					<Animated>
						<Text variant="title" size={60 * scale}>
							<span style={{color: colors.canvasAccent}}>{index + 1}. </span>
							{step.title}
						</Text>
					</Animated>
					<Animated delaySeconds={0.3}>
						<RichText text={step.content} variant="bodyLarge" size={40 * scale} />
					</Animated>
					{step.formula ? (
						<Animated animation={{preset: 'scale', easing: 'overshoot'}} delaySeconds={0.75}>
							<Card padding={SPACING.lg}>
								<Text size={58 * scale} align="center">
									<MathExpression latex={step.formula} display style={{margin: 0}} />
								</Text>
							</Card>
						</Animated>
					) : null}
					{step.hint ? (
						<Animated delaySeconds={1.3}>
							<Callout icon="lightbulb" label="İpucu" tone="accent">
								<RichText text={step.hint} size={33} />
							</Callout>
						</Animated>
					) : null}
				</div>
			</FitBox>
		</Animated>
	);
};

const StepStage: React.FC<{steps: Step[]; stepSeconds: number[]}> = ({steps, stepSeconds}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {u} = useVideoLayout();
	const plan = planScenes(
		steps.map((_, index) => ({id: `step-${index}`, seconds: stepSeconds[index]})),
		fps,
	);
	const active = activeSceneIndex(plan, frame);

	return (
		<div style={{flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', gap: u(SPACING.lg)}}>
			<div style={{display: 'flex', alignItems: 'center', gap: u(SPACING.md)}}>
				<Badge tone="primary" icon="pencil">
					Adım {active + 1} / {steps.length}
				</Badge>
				<SegmentedProgress plan={plan} />
			</div>
			{steps.map((step, index) => {
				const isLast = index === steps.length - 1;
				return (
					<Sequence
						key={index}
						layout="none"
						from={plan.scenes[index].from}
						// The last step stays until the scene ends, absorbing any rounding of the step durations.
						durationInFrames={isLast ? undefined : plan.scenes[index].durationInFrames}
					>
						<StepView step={step} index={index} exitAtSeconds={isLast ? undefined : stepSeconds[index] - 0.3} />
					</Sequence>
				);
			})}
		</div>
	);
};

/** The question stays in view while the steps play out next to (or below) it. */
export const SolutionScene: React.FC<{content: Content; stepSeconds: number[]}> = ({content, stepSeconds}) => {
	const {contentHeight, isLandscape, isSquare, u} = useVideoLayout();
	const available = contentHeight - u(CHROME_HEIGHT);
	const questionShare = isSquare ? 0.42 : 0.34;

	return (
		<SafeArea chrome gap={isLandscape ? SPACING.xxl : SPACING.lg} style={{flexDirection: isLandscape ? 'row' : 'column'}}>
			<QuestionCard
				content={content}
				dense
				maxHeight={isLandscape ? available : available * questionShare}
				style={isLandscape ? {width: '40%', alignSelf: 'flex-start'} : undefined}
			/>
			<StepStage steps={content.steps} stepSeconds={stepSeconds} />
		</SafeArea>
	);
};

export const AnswerScene: React.FC<{content: Content}> = ({content}) => {
	const {u, isLandscape} = useVideoLayout();
	const {question, answer} = content;
	return (
		<SafeArea chrome style={isLandscape ? {paddingLeft: '18%', paddingRight: '18%'} : undefined}>
			<FitBox fill>
				<div style={{display: 'flex', flexDirection: 'column', gap: u(SPACING.lg)}}>
					<Animated>
						<Text variant="label" tone="emphasis" size={30}>
							Doğru Cevap
						</Text>
					</Animated>
					<Animated animation="fade" delaySeconds={0.15}>
						<RichText text={question.text} tone="muted" size={34} />
					</Animated>
					{question.options ? (
						<Card padding={SPACING.lg}>
							<OptionList
								options={question.options}
								correctIndex={answer.correctOptionIndex}
								enterAtSeconds={0.3}
								revealAtSeconds={1.2}
							/>
						</Card>
					) : null}
					{answer.explanation ? (
						<Animated delaySeconds={1.9}>
							<Callout icon="check" label="Neden?" tone="success">
								<RichText text={answer.explanation} size={33} />
							</Callout>
						</Animated>
					) : null}
				</div>
			</FitBox>
		</SafeArea>
	);
};

export const ResultScene: React.FC<{content: Content}> = ({content}) => {
	const {colors} = useTheme();
	const {u, isLandscape} = useVideoLayout();
	const {answer, tip, question} = content;
	const ring = u(190);

	return (
		<SafeArea chrome style={isLandscape ? {paddingLeft: '20%', paddingRight: '20%'} : undefined}>
			<FitBox fill>
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u(SPACING.lg)}}>
					<svg width={ring} height={ring} viewBox="0 0 120 120">
						<DrawPath
							d="M60 10a50 50 0 1 1 0 100a50 50 0 1 1 0-100"
							stroke={colors.success}
							strokeWidth={8}
							durationSeconds={0.7}
						/>
						<DrawPath d="M38 62l15 15 30-34" stroke={colors.success} strokeWidth={9} delaySeconds={0.5} durationSeconds={0.4} />
					</svg>
					<Animated delaySeconds={0.4}>
						<Text variant="label" tone="muted" align="center" size={30}>
							Sonuç
						</Text>
					</Animated>
					<Animated animation={{preset: 'scale', easing: 'overshoot'}} delaySeconds={0.6}>
						<RichText text={answer.text} variant="headline" align="center" />
					</Animated>
					{!question.options && answer.explanation ? (
						<Animated delaySeconds={1.1}>
							<RichText text={answer.explanation} size={36} tone="muted" align="center" />
						</Animated>
					) : null}
					{tip ? (
						<Animated delaySeconds={1.5} style={{alignSelf: 'stretch'}}>
							<Callout icon="star" label="Unutma" tone="accent">
								<RichText text={tip} size={34} />
							</Callout>
						</Animated>
					) : null}
				</div>
			</FitBox>
		</SafeArea>
	);
};
