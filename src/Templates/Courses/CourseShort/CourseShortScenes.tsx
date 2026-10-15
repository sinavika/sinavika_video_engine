import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Animated} from '../../../Components/Animations/Animated';
import {SafeArea} from '../../../Components/Layouts/SafeArea';
import {useVideoLayout} from '../../../Components/Layouts/VideoLayout';
import {Badge} from '../../../Components/Typography/Badge';
import {RichText} from '../../../Components/Typography/RichText';
import {Text} from '../../../Components/Typography/Text';
import {CourseVisual} from '../../../Components/Visuals/CourseVisual';
import {useSceneSeconds} from '../../../Components/Visuals/VisualFrame';
import type {CourseVisual as CourseVisualSpec} from '../../../Components/Visuals/VisualSchemas';
import {COURSE_DESIGN} from '../../../Courses/CourseDesign';
import type {LessonScript} from '../../../Courses/LessonScript';
import {CHROME_HEIGHT, SPACING} from '../../../Themes/DesignTokens';
import {withAlpha, type CategoricalColor} from '../../../Themes/Theme';
import {InkProvider, useTheme} from '../../../Themes/ThemeContext';
import {BRAND_TYPOGRAPHY} from '../../../Configurations/BrandTypography';

const OPTION_LETTERS = 'ABCDE';

/**
 * A figure card of the short, in the look of the Reels cards
 * (QuickRevision): a full-bleed colour, the card's title, and the figure on
 * a light panel so its own colours read.
 */
export const VisualCardScene: React.FC<{title: string; visual: CourseVisualSpec; index: number; total: number}> = ({title, visual, index, total}) => {
	const {colors, typography, shape} = useTheme();
	const {u, contentWidth, contentHeight} = useVideoLayout();
	const tone: CategoricalColor = colors.categorical[index % colors.categorical.length];
	const panel = {width: contentWidth - u(SPACING.lg * 2), height: contentHeight * 0.52};
	return (
		<AbsoluteFill style={{backgroundColor: tone.fill, color: tone.on}}>
			<div style={{position: 'absolute', right: u(-20), bottom: u(40), fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(620), lineHeight: 0.8, opacity: 0.1}}>
				{String(index + 1).padStart(2, '0')}
			</div>
			<InkProvider ink={{text: tone.on, muted: withAlpha(tone.on, 0.78), emphasis: tone.on}}>
				<SafeArea chrome gap={SPACING.lg}>
					<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: u(SPACING.md)}}>
						<Badge tone={{fill: tone.on, on: tone.fill}} icon="lightbulb" size={30}>
							Şekil
						</Badge>
						<Text variant="label" size={30}>
							{index + 1} / {total}
						</Text>
					</div>
					<Animated animation={{preset: 'slide', direction: 'right', distance: 90}} delaySeconds={0.1}>
						<Text variant="display" size={88}>
							{title}
						</Text>
					</Animated>
					<Animated animation={{preset: 'scale', easing: 'overshoot'}} delaySeconds={0.3}>
						<div style={{padding: u(SPACING.lg), borderRadius: u(shape.radius.lg), backgroundColor: colors.background, color: colors.text}}>
							<InkProvider ink={{text: colors.text, muted: colors.textMuted, emphasis: colors.primaryText}}>
								<div style={{width: panel.width, height: panel.height, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
									<CourseVisual visual={visual} width={panel.width} height={panel.height} delaySeconds={0.6} />
								</div>
							</InkProvider>
						</div>
					</Animated>
				</SafeArea>
			</InkProvider>
		</AbsoluteFill>
	);
};

type ShortQuestion = NonNullable<LessonScript['short']['question']>;

/** One question to try: the options come up, then a note that the solution is in the full lesson. The answer is not given away. */
export const ShortQuestionScene: React.FC<{question: ShortQuestion}> = ({question}) => {
	const {colors, typography} = useTheme();
	const {u} = useVideoLayout();
	const seconds = useSceneSeconds();
	const lesson = colors.lesson ?? {fill: colors.accent, on: colors.onAccent};
	return (
		<SafeArea chrome gap={SPACING.lg} style={{justifyContent: 'center'}}>
			<Animated>
				<Badge lesson icon="question" size={32}>
					Sen dene
				</Badge>
			</Animated>
			<Animated delaySeconds={0.2}>
				<RichText text={question.stem} variant="headline" size={74} />
			</Animated>
			<div style={{display: 'flex', flexDirection: 'column', gap: u(SPACING.md), marginTop: u(SPACING.sm)}}>
				{question.options.map((option, index) => (
					<Animated key={index} animation={{preset: 'slide', direction: 'left', distance: 60}} delaySeconds={0.5 + index * 0.25}>
						<div style={{display: 'flex', alignItems: 'center', gap: u(22), padding: `${u(20)}px ${u(26)}px`, borderRadius: u(24), backgroundColor: colors.surface, border: `${u(3)}px solid ${colors.border}`}}>
							<div style={{width: u(64), height: u(64), borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: lesson.fill, color: lesson.on, fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(34)}}>{OPTION_LETTERS[index]}</div>
							<RichText text={option} size={46} />
						</div>
					</Animated>
				))}
			</div>
			{seconds > 1.5 ? (
				<Animated delaySeconds={1.5} animation={{preset: 'scale', easing: 'overshoot'}} style={{alignSelf: 'flex-start'}}>
					<div style={{alignSelf: 'flex-start', padding: `${u(14)}px ${u(28)}px`, borderRadius: u(999), backgroundColor: colors.text, color: colors.background, fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(36)}}>
						Çözümü YouTube'daki konu anlatımında
					</div>
				</Animated>
			) : null}
		</SafeArea>
	);
};

/** Height the chrome bar takes, for layouts that size themselves. */
export const SHORT_CHROME = CHROME_HEIGHT;
export const SHORT_TYPE = COURSE_DESIGN.type;
