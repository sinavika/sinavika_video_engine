import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import {Animated, Stagger} from '../../../Components/Animations/Animated';
import {Icon} from '../../../Components/Illustrations/Icon';
import {Card} from '../../../Components/Layouts/Card';
import {FitBox} from '../../../Components/Layouts/FitBox';
import {ChromeBar, SafeArea} from '../../../Components/Layouts/SafeArea';
import {useVideoLayout} from '../../../Components/Layouts/VideoLayout';
import {BrandMark} from '../../../Components/Overlays/BrandMark';
import {Badge} from '../../../Components/Typography/Badge';
import {MathExpression} from '../../../Components/Typography/MathExpression';
import {RichText} from '../../../Components/Typography/RichText';
import {Text} from '../../../Components/Typography/Text';
import {CourseVisual} from '../../../Components/Visuals/CourseVisual';
import {useSceneSeconds} from '../../../Components/Visuals/VisualFrame';
import {VisualTimelineProvider} from '../../../Components/Visuals/VisualTimeline';
import type {CourseVisual as CourseVisualSpec} from '../../../Components/Visuals/VisualSchemas';
import {COURSE_DESIGN} from '../../../Courses/CourseDesign';
import type {LessonCard, LessonScript, Question} from '../../../Courses/LessonScript';
import {CHROME_HEIGHT, SPACING} from '../../../Themes/DesignTokens';
import {withAlpha} from '../../../Themes/Theme';
import {InkProvider, useTheme} from '../../../Themes/ThemeContext';
import {BRAND_TYPOGRAPHY} from '../../../Configurations/BrandTypography';

const TYPE = COURSE_DESIGN.type;
const OPTION_LETTERS = 'ABCDE';

const CARD_KINDS: Record<Exclude<LessonCard['kind'], 'question' | 'predict'>, string> = {
	concept: 'Kavram',
	rule: 'Kural',
	example: 'Örnek',
	mistake: 'Sık yapılan hata',
	visual: 'Şekil',
};

/** Small lesson pill: the lesson's colour and name, as on the Reels covers. */
const LessonPill: React.FC<{name: string}> = ({name}) => {
	const {colors, typography} = useTheme();
	const {u} = useVideoLayout();
	const tone = colors.lesson ?? {fill: colors.accent, on: colors.onAccent};
	return <div style={{padding: `${u(10)}px ${u(22)}px`, borderRadius: u(12), backgroundColor: tone.fill, color: tone.on, fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(TYPE.label + 4), lineHeight: 1}}>{name}</div>;
};

/** The bar at the top of every scene of the lesson: lesson, topic, and the logo. */
export const LessonChrome: React.FC<{script: LessonScript}> = ({script}) => {
	const {u} = useVideoLayout();
	return (
		<ChromeBar style={{justifyContent: 'space-between'}}>
			<div style={{display: 'flex', alignItems: 'center', gap: u(16), minWidth: 0}}>
				<LessonPill name={script.lessonName} />
				<Text variant="label" tone="muted" size={TYPE.label} style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
					{script.title}
				</Text>
			</div>
			<BrandMark />
		</ChromeBar>
	);
};

export const LessonIntroScene: React.FC<{script: LessonScript}> = ({script}) => {
	const {colors, typography} = useTheme();
	const {u, isLandscape} = useVideoLayout();
	return (
		<SafeArea chrome gap={SPACING.xl} style={{flexDirection: isLandscape ? 'row' : 'column', alignItems: isLandscape ? 'center' : 'stretch', justifyContent: 'center'}}>
			<div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: u(SPACING.md)}}>
				<Animated animation="fade">
					<div style={{display: 'flex', gap: u(12), flexWrap: 'wrap'}}>
						{script.exams.map((exam) => (
							<div key={exam} style={{padding: `${u(8)}px ${u(20)}px`, borderRadius: u(999), border: `${u(4)}px solid ${colors.text}`, fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(30), color: colors.text, lineHeight: 1}}>
								{exam}
							</div>
						))}
					</div>
				</Animated>
				<Animated animation={{preset: 'slide', direction: 'up', distance: 60}} delaySeconds={0.15}>
					<Text variant="display" size={isLandscape ? 128 : 112} style={{lineHeight: 1}}>
						{script.title}
					</Text>
				</Animated>
				<Animated delaySeconds={0.45}>
					<Text variant="subtitle" tone="muted" size={44}>
						{script.lesson.hook.headline}
					</Text>
				</Animated>
			</div>
			<Animated animation={{preset: 'slide', direction: 'left', distance: 80}} delaySeconds={0.7} style={{flex: isLandscape ? 0.9 : undefined}}>
				<Card padding={SPACING.xl}>
					<Text variant="label" tone="emphasis" size={TYPE.label}>
						Bu videoda
					</Text>
					<div style={{display: 'flex', flexDirection: 'column', gap: u(SPACING.md), marginTop: u(SPACING.md)}}>
						{script.lesson.objectives.map((objective) => (
							<div key={objective} style={{display: 'flex', gap: u(16), alignItems: 'flex-start'}}>
								<Icon name="check" size={40} color={colors.lesson?.fill ?? colors.accent} />
								<Text size={38} weight={typography.strongWeight}>
									{objective}
								</Text>
							</div>
						))}
					</div>
				</Card>
			</Animated>
		</SafeArea>
	);
};

/** The start of a section: the lesson colour, the section number set huge, and its title. */
export const SectionScene: React.FC<{index: number; title: string; total: number}> = ({index, title, total}) => {
	const {colors, typography} = useTheme();
	const {u, isLandscape} = useVideoLayout();
	const tone = colors.lesson ?? {fill: colors.accent, on: colors.onAccent};
	return (
		<AbsoluteFill style={{backgroundColor: tone.fill, color: tone.on}}>
			<div style={{position: 'absolute', right: u(-30), bottom: u(isLandscape ? -170 : 60), fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(isLandscape ? 760 : 620), lineHeight: 0.8, opacity: 0.12}}>
				{String(index + 1).padStart(2, '0')}
			</div>
			<InkProvider ink={{text: tone.on, muted: withAlpha(tone.on, 0.8), emphasis: tone.on}}>
				<SafeArea gap={SPACING.lg} style={{justifyContent: 'center', paddingRight: isLandscape ? '24%' : undefined}}>
					<Animated animation={{preset: 'slide', direction: 'down', distance: 30}}>
						<Text variant="label" size={TYPE.label + 6}>
							Bölüm {index + 1} / {total}
						</Text>
					</Animated>
					<Animated animation={{preset: 'slide', direction: 'right', distance: 90}} delaySeconds={0.15}>
						<Text variant="display" size={TYPE.sectionTitle} style={{lineHeight: 1.02}}>
							{title}
						</Text>
					</Animated>
				</SafeArea>
			</InkProvider>
		</AbsoluteFill>
	);
};

/** Box a card's visual is drawn in, in actual pixels: beside the text on horizontal video, under it on vertical. */
const useVisualBox = (fullWidth: boolean) => {
	const {u, isLandscape, contentWidth, contentHeight} = useVideoLayout();
	const height = contentHeight - u(CHROME_HEIGHT) - u(150);
	if (fullWidth) return {width: contentWidth, height: height * (isLandscape ? 0.86 : 0.62)};
	return isLandscape ? {width: contentWidth * COURSE_DESIGN.visualShare, height} : {width: contentWidth, height: height * 0.5};
};

type TextCard = Exclude<LessonCard, {kind: 'question' | 'visual' | 'predict'}>;
type FigureCard = Exclude<LessonCard, {kind: 'question' | 'predict'}>;

const CardText: React.FC<{card: TextCard}> = ({card}) => {
	const {colors, typography} = useTheme();
	const {u} = useVideoLayout();
	switch (card.kind) {
		case 'concept':
			return <RichText text={card.text} size={TYPE.cardBody} />;
		case 'rule':
			return (
				<Stagger delaySeconds={0.4} stepSeconds={0.5} animation={{preset: 'slide', direction: 'left', distance: 40}}>
					{card.items.map((item, index) => (
						<div key={index} style={{display: 'flex', gap: u(18), alignItems: 'baseline', marginBottom: u(SPACING.sm)}}>
							<div style={{fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(TYPE.cardBody), color: colors.lesson?.fill ?? colors.accent}}>{index + 1}</div>
							<RichText text={item} size={TYPE.cardBody} />
						</div>
					))}
				</Stagger>
			);
		case 'example':
			return (
				<>
					<div style={{padding: `${u(24)}px ${u(30)}px`, borderLeft: `${u(10)}px solid ${colors.lesson?.fill ?? colors.accent}`, backgroundColor: withAlpha(colors.lesson?.fill ?? colors.accent, 0.08), borderRadius: u(16)}}>
						<RichText text={card.example} size={TYPE.example} weight={typography.strongWeight} />
					</div>
					{card.explanation ? (
						<Animated delaySeconds={0.8}>
							<RichText text={card.explanation} size={TYPE.cardBody - 4} tone="muted" />
						</Animated>
					) : null}
				</>
			);
		case 'mistake':
			return (
				<>
					<div style={{display: 'flex', gap: u(18), alignItems: 'flex-start', padding: u(24), borderRadius: u(20), backgroundColor: withAlpha(colors.danger, 0.1)}}>
						<Icon name="cross" size={48} color={colors.danger} />
						<RichText text={card.wrong} size={TYPE.cardBody} />
					</div>
					<Animated delaySeconds={0.9}>
						<div style={{display: 'flex', gap: u(18), alignItems: 'flex-start', padding: u(24), borderRadius: u(20), backgroundColor: withAlpha(colors.success, 0.12)}}>
							<Icon name="check" size={48} color={colors.success} />
							<RichText text={card.right} size={TYPE.cardBody} />
						</div>
					</Animated>
					{card.why ? (
						<Animated delaySeconds={1.6}>
							<RichText text={card.why} size={TYPE.cardBody - 6} tone="muted" />
						</Animated>
					) : null}
				</>
			);
	}
};

/**
 * One card of a section: its kind, its title, the text, and its visual beside
 * or under it. With beats, the visual follows them: `beatStarts` are the
 * seconds into the scene at which each beat's sentence starts.
 */
export const LessonCardScene: React.FC<{card: FigureCard; section: string; number: string; beatStarts?: number[]; beatEnds?: number[]; sceneSeconds?: number}> = ({card, section, number, beatStarts, beatEnds, sceneSeconds}) => {
	const {u, isLandscape} = useVideoLayout();
	const visual: CourseVisualSpec | undefined = 'visual' in card ? card.visual : undefined;
	const onlyVisual = card.kind === 'visual';
	const box = useVisualBox(onlyVisual);

	return (
		<SafeArea chrome gap={SPACING.lg}>
			<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0}}>
				<Animated animation={{preset: 'slide', direction: 'down', distance: 24}}>
					<Badge lesson size={TYPE.label}>
						{CARD_KINDS[card.kind]}
					</Badge>
				</Animated>
				<Text variant="label" tone="muted" size={TYPE.label}>
					{section} · {number}
				</Text>
			</div>
			<div style={{flex: 1, minHeight: 0, display: 'flex', flexDirection: onlyVisual || !isLandscape ? 'column' : 'row', gap: u(SPACING.xl), alignItems: onlyVisual ? 'center' : 'stretch'}}>
				<div style={{flex: onlyVisual ? undefined : 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: u(SPACING.lg), justifyContent: 'center', alignSelf: onlyVisual ? 'stretch' : undefined}}>
					<Animated animation={{preset: 'slide', direction: 'right', distance: 60}} delaySeconds={0.1}>
						<Text variant="title" size={TYPE.cardTitle}>
							{card.title}
						</Text>
					</Animated>
					{card.kind === 'visual' ? (
						card.caption ? (
							<Animated delaySeconds={0.3}>
								<RichText text={card.caption} size={TYPE.cardBody - 6} tone="muted" />
							</Animated>
						) : null
					) : (
						<Animated delaySeconds={0.3}>
							<div style={{display: 'flex', flexDirection: 'column', gap: u(SPACING.md)}}>
								<CardText card={card} />
							</div>
						</Animated>
					)}
				</div>
				{visual ? (
					<div style={{width: box.width, height: box.height, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<VisualTimelineProvider beats={'beats' in card ? card.beats : undefined} starts={beatStarts} ends={beatEnds} sceneSeconds={sceneSeconds}>
							<CourseVisual visual={visual} width={box.width} height={box.height} delaySeconds={0.5} />
						</VisualTimelineProvider>
					</div>
				) : null}
			</div>
		</SafeArea>
	);
};

type PredictCard = Extract<LessonCard, {kind: 'predict'}>;

/** When the parts of a predict card happen, in seconds into its scene. */
export type PredictTiming = {thinkAt: number; thinkSeconds: number; beatStarts: number[]; beatEnds: number[]; explainAt: number};

/** A ring that empties over the thinking time, with the seconds left in it. */
const Countdown: React.FC<{left: number; total: number}> = ({left, total}) => {
	const {colors, typography} = useTheme();
	const {u} = useVideoLayout();
	const size = u(200);
	const radius = size / 2 - u(14);
	const share = Math.max(0, left / total);
	const lesson = colors.lesson?.fill ?? colors.accent;
	return (
		<div style={{position: 'relative', width: size, height: size}}>
			<svg width={size} height={size} style={{position: 'absolute', inset: 0, transform: 'rotate(-90deg)'}}>
				<circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={withAlpha(lesson, 0.15)} strokeWidth={u(18)} />
				<circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={lesson} strokeWidth={u(18)} strokeLinecap="round" strokeDasharray={2 * Math.PI * radius} strokeDashoffset={2 * Math.PI * radius * (1 - share)} />
			</svg>
			<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(84), color: lesson}}>{Math.ceil(left)}</div>
		</div>
	);
};

/**
 * Predict, then see. The question fills the card while it is read; a
 * countdown gives time to think; then the question steps aside, the figure
 * plays its beats, and the explanation comes with the right choice lit.
 */
export const PredictScene: React.FC<{card: PredictCard; timing: PredictTiming; section: string; number: string}> = ({card, timing, section, number}) => {
	const {colors, typography} = useTheme();
	const {u, isLandscape} = useVideoLayout();
	const seconds = useSceneSeconds();
	const box = useVisualBox(false);
	const lesson = colors.lesson?.fill ?? colors.accent;
	const showAt = timing.thinkAt + timing.thinkSeconds;
	const aside = interpolate(seconds, [showAt, showAt + 0.8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.33, 0, 0.2, 1)});
	const explained = seconds >= timing.explainAt;
	const thinking = seconds >= timing.thinkAt && seconds < showAt;
	return (
		<SafeArea chrome gap={SPACING.lg}>
			<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0}}>
				<Badge lesson icon="question" size={TYPE.label}>
					Önce tahmin et
				</Badge>
				<Text variant="label" tone="muted" size={TYPE.label}>
					{section} · {number}
				</Text>
			</div>
			<div style={{flex: 1, minHeight: 0, display: 'flex', flexDirection: isLandscape ? 'row' : 'column', gap: u(SPACING.xl), alignItems: 'stretch'}}>
				<div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: u(SPACING.md)}}>
					<Text variant="title" size={TYPE.cardTitle * (1 - 0.25 * aside)}>
						{card.title}
					</Text>
					<RichText text={card.prompt} size={(TYPE.example + 6) * (1 - 0.3 * aside)} weight={typography.strongWeight} />
					{card.choices.length ? (
						<div style={{display: 'flex', flexDirection: 'column', gap: u(10)}}>
							{card.choices.map((choice, index) => {
								const right = explained && index === card.answer;
								return (
									<div key={index} style={{display: 'flex', alignItems: 'center', gap: u(14), padding: `${u(10)}px ${u(16)}px`, borderRadius: u(16), border: `${u(3)}px solid ${right ? lesson : colors.border}`, backgroundColor: right ? withAlpha(lesson, 0.14) : colors.surface}}>
										<div style={{width: u(44), height: u(44), borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: right ? lesson : colors.surfaceAlt, color: right ? (colors.lesson?.on ?? colors.onAccent) : colors.onSurface, fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(24)}}>
											{OPTION_LETTERS[index]}
										</div>
										<RichText text={choice} size={32} />
									</div>
								);
							})}
						</div>
					) : null}
					{explained ? (
						<Animated animation={{preset: 'slide', direction: 'up', distance: 30}} delaySeconds={timing.explainAt}>
							<div style={{padding: `${u(18)}px ${u(24)}px`, borderLeft: `${u(10)}px solid ${lesson}`, backgroundColor: withAlpha(lesson, 0.08), borderRadius: u(16)}}>
								<RichText text={card.explanation} size={TYPE.cardBody - 6} />
							</div>
						</Animated>
					) : null}
				</div>
				<div style={{width: box.width, height: box.height, flexShrink: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					{thinking ? (
						<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u(SPACING.md)}}>
							<Countdown left={showAt - seconds} total={timing.thinkSeconds} />
							<Text variant="subtitle" tone="muted" size={40}>
								Düşün…
							</Text>
						</div>
					) : null}
					{seconds >= showAt ? (
						<div style={{opacity: aside}}>
							<VisualTimelineProvider beats={card.beats} starts={timing.beatStarts} ends={timing.beatEnds}>
								<CourseVisual visual={card.visual} width={box.width} height={box.height} delaySeconds={showAt} />
							</VisualTimelineProvider>
						</div>
					) : null}
				</div>
			</div>
		</SafeArea>
	);
};

/**
 * A worked question. The stem and options come first; each solution step
 * appears when its narration starts (`stepStarts`, seconds into the scene),
 * and the correct option lights up with the last step.
 */
export const QuestionScene: React.FC<{question: Question; stepStarts: number[]; section: string; number: string}> = ({question, stepStarts, section, number}) => {
	const {colors, typography} = useTheme();
	const {u, isLandscape} = useVideoLayout();
	const seconds = useSceneSeconds();
	const answerAt = (stepStarts.at(-1) ?? 0) + 0.6;
	const revealed = seconds >= answerAt;
	const lesson = colors.lesson?.fill ?? colors.accent;
	const visible = question.steps.filter((_, index) => seconds >= stepStarts[index]);

	return (
		<SafeArea chrome gap={SPACING.lg}>
			<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0}}>
				<Badge lesson icon="question" size={TYPE.label}>
					{question.style ?? 'Soru'}
				</Badge>
				<Text variant="label" tone="muted" size={TYPE.label}>
					{section} · {number}
				</Text>
			</div>
			<div style={{flex: 1, minHeight: 0, display: 'flex', flexDirection: isLandscape ? 'row' : 'column', gap: u(SPACING.xl)}}>
				<FitBox fill style={{flex: 1}}>
					<div style={{display: 'flex', flexDirection: 'column', gap: u(SPACING.md)}}>
						{question.context ? <RichText text={question.context} size={34} tone="muted" /> : null}
						<RichText text={question.stem} size={40} weight={typography.strongWeight} />
						<div style={{display: 'flex', flexDirection: 'column', gap: u(12), marginTop: u(8)}}>
							{question.options.map((option, index) => {
								const correct = revealed && index === question.answer;
								return (
									<div key={index} style={{display: 'flex', alignItems: 'center', gap: u(18), padding: `${u(12)}px ${u(18)}px`, borderRadius: u(18), border: `${u(3)}px solid ${correct ? lesson : colors.border}`, backgroundColor: correct ? withAlpha(lesson, 0.12) : colors.surface}}>
										<div style={{width: u(52), height: u(52), borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: correct ? lesson : colors.surfaceAlt, color: correct ? (colors.lesson?.on ?? colors.onAccent) : colors.onSurface, fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(28)}}>
											{OPTION_LETTERS[index]}
										</div>
										<RichText text={option} size={34} />
									</div>
								);
							})}
						</div>
					</div>
				</FitBox>
				<div style={{flex: isLandscape ? 0.95 : undefined, display: 'flex', flexDirection: 'column', gap: u(SPACING.md), padding: u(SPACING.lg), borderRadius: u(28), backgroundColor: withAlpha(lesson, 0.06), border: `${u(3)}px dashed ${withAlpha(lesson, 0.4)}`}}>
					<Text variant="label" tone="emphasis" size={TYPE.label}>
						Çözüm
					</Text>
					{visible.map((step, index) => (
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
					{revealed ? (
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

export const LessonSummaryScene: React.FC<{script: LessonScript}> = ({script}) => {
	const {colors} = useTheme();
	const {u, isLandscape} = useVideoLayout();
	const {points, warnings} = script.lesson.summary;
	return (
		<SafeArea chrome gap={SPACING.lg}>
			<Animated>
				<Text variant="headline" size={84}>
					Özet
				</Text>
			</Animated>
			<div style={{flex: 1, minHeight: 0, display: 'flex', flexDirection: isLandscape ? 'row' : 'column', gap: u(SPACING.xl)}}>
				<div style={{flex: 1.4, display: 'flex', flexDirection: 'column', gap: u(SPACING.md)}}>
				<Stagger delaySeconds={0.4} stepSeconds={0.6} animation={{preset: 'slide', direction: 'left', distance: 60}}>
					{points.map((point, index) => (
						<Card key={index} padding={SPACING.lg} elevated={false}>
							<div style={{display: 'flex', gap: u(18), alignItems: 'flex-start'}}>
								<Icon name="check" size={40} color={colors.lesson?.fill ?? colors.accent} />
								<RichText text={point} size={36} />
							</div>
						</Card>
					))}
				</Stagger>
				</div>
				{warnings.length > 0 ? (
					<div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: u(SPACING.md)}}>
					<Stagger delaySeconds={0.6 + points.length * 0.6} stepSeconds={0.6}>
						{warnings.map((warning, index) => (
							<div key={index} style={{display: 'flex', gap: u(18), alignItems: 'flex-start', padding: u(SPACING.lg), borderRadius: u(24), backgroundColor: withAlpha(colors.warning, 0.14)}}>
								<Icon name="alert" size={40} color={colors.warning} />
								<RichText text={warning} size={34} />
							</div>
						))}
					</Stagger>
					</div>
				) : null}
			</div>
		</SafeArea>
	);
};
