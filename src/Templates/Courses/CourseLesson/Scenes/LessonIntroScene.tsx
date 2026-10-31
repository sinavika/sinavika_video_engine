import React from 'react';
import {Animated} from '../../../../Components/Animations/Animated';
import {Icon} from '../../../../Components/Illustrations/Icon';
import {Card} from '../../../../Components/Layouts/Card';
import {SafeArea} from '../../../../Components/Layouts/SafeArea';
import {useVideoLayout} from '../../../../Components/Layouts/VideoLayout';
import {RichText} from '../../../../Components/Typography/RichText';
import {Text} from '../../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY} from '../../../../Configurations/BrandTypography';
import type {LessonScript} from '../../../../Courses/LessonScript';
import {SPACING} from '../../../../Themes/DesignTokens';
import {useTheme} from '../../../../Themes/ThemeContext';
import {TYPE} from './LessonChrome';

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
								{/* An objective may hold a formula ("$v = \lambda f$ kullanmak"): drawn as math, not as typed. */}
								<RichText text={objective} size={38} weight={typography.strongWeight} />
							</div>
						))}
					</div>
				</Card>
			</Animated>
		</SafeArea>
	);
};
