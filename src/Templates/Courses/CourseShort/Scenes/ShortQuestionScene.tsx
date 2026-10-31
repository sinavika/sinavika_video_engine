import React from 'react';
import {Animated} from '../../../../Components/Animations/Animated';
import {SafeArea} from '../../../../Components/Layouts/SafeArea';
import {useVideoLayout} from '../../../../Components/Layouts/VideoLayout';
import {Badge} from '../../../../Components/Typography/Badge';
import {RichText} from '../../../../Components/Typography/RichText';
import {useSceneSeconds} from '../../../../Components/Visuals/VisualFrame';
import {BRAND_TYPOGRAPHY} from '../../../../Configurations/BrandTypography';
import {type LessonScript, OPTION_LETTERS} from '../../../../Courses/LessonScript';
import {SPACING} from '../../../../Themes/DesignTokens';
import {useTheme} from '../../../../Themes/ThemeContext';

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
