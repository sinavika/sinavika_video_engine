import React from 'react';
import {Animated, Stagger} from '../../../../Components/Animations/Animated';
import {Icon} from '../../../../Components/Illustrations/Icon';
import {Card} from '../../../../Components/Layouts/Card';
import {FitBox} from '../../../../Components/Layouts/FitBox';
import {SafeArea} from '../../../../Components/Layouts/SafeArea';
import {useVideoLayout} from '../../../../Components/Layouts/VideoLayout';
import {RichText} from '../../../../Components/Typography/RichText';
import {Text} from '../../../../Components/Typography/Text';
import type {Cues} from '../../../../Courses/LessonCue';
import type {LessonScript} from '../../../../Courses/LessonScript';
import {SPACING} from '../../../../Themes/DesignTokens';
import {withAlpha} from '../../../../Themes/Theme';
import {useTheme} from '../../../../Themes/ThemeContext';
import {BRAND_TYPOGRAPHY} from '../../../../Configurations/BrandTypography';
import {StudioHeading, useStudio} from './LessonChrome';

/** When the summary's points and warnings arrive (as each is said) and their bold words are marked. */
type SummaryCues = {points: number[]; warnings: number[]; pointMarks: Cues[]; warningMarks: Cues[]};

/**
 * The summary in the studio layout (camp lessons since 31 Oct 2026): "Özet" in the top row, the points numbered in two
 * columns, the warnings in one band under them. The classic list left the right half empty under two warnings.
 */
const StudioSummary: React.FC<{points: readonly string[]; warnings: readonly string[]; cues: SummaryCues}> = ({points, warnings, cues}) => {
	const {colors, typography} = useTheme();
	const {u} = useVideoLayout();
	const tone = colors.lesson ?? {fill: colors.accent, on: colors.onAccent};
	return (
		<SafeArea gap={SPACING.lg}>
			<StudioHeading title="Özet" />
			<FitBox align="start" fill maxScale={1.1} style={{flex: 1}}>
				<div style={{display: 'flex', flexDirection: 'column', gap: u(SPACING.lg)}}>
					<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: u(SPACING.md)}}>
						{points.map((point, index) => (
							<Animated key={index} animation={{preset: 'slide', direction: 'up', distance: 40}} delaySeconds={cues.points[index]}>
								<Card padding={SPACING.lg} elevated={false} style={{height: '100%', boxSizing: 'border-box'}}>
									<div style={{display: 'flex', gap: u(18), alignItems: 'flex-start'}}>
										<div style={{width: u(48), height: u(48), flexShrink: 0, borderRadius: '50%', backgroundColor: tone.fill, color: tone.on, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(26)}}>{index + 1}</div>
										<RichText text={point} size={36} markCues={cues.pointMarks[index]} />
									</div>
								</Card>
							</Animated>
						))}
					</div>
					{warnings.length > 0 ? (
						<div style={{display: 'flex', flexWrap: 'wrap', gap: u(SPACING.md)}}>
							{warnings.map((warning, index) => (
								<Animated key={index} delaySeconds={cues.warnings[index]} style={{flex: '1 1 40%'}}>
									<div style={{display: 'flex', gap: u(18), alignItems: 'flex-start', padding: u(SPACING.lg), borderRadius: u(24), backgroundColor: withAlpha(colors.warning, 0.14)}}>
										<Icon name="alert" size={40} color={colors.warning} />
										<RichText text={warning} size={34} markCues={cues.warningMarks[index]} />
									</div>
								</Animated>
							))}
						</div>
					) : null}
				</div>
			</FitBox>
		</SafeArea>
	);
};

export const LessonSummaryScene: React.FC<{script: LessonScript; cues?: SummaryCues}> = ({script, cues}) => {
	const {colors} = useTheme();
	const {u, isLandscape} = useVideoLayout();
	const studio = useStudio();
	const {points, warnings} = script.lesson.summary;
	const slide = {preset: 'slide', direction: 'left', distance: 60} as const;
	if (studio && cues) return <StudioSummary points={points} warnings={warnings} cues={cues} />;
	if (cues) {
		return (
			<SafeArea chrome gap={SPACING.lg}>
				<Animated>
					<Text variant="headline" size={84}>
						Özet
					</Text>
				</Animated>
				<FitBox align="start">
					<div style={{display: 'flex', flexDirection: isLandscape ? 'row' : 'column', gap: u(SPACING.xl)}}>
						<div style={{flex: 1.4, display: 'flex', flexDirection: 'column', gap: u(SPACING.md)}}>
							{points.map((point, index) => (
								<Animated key={index} animation={slide} delaySeconds={cues.points[index]}>
									<Card padding={SPACING.lg} elevated={false}>
										<div style={{display: 'flex', gap: u(18), alignItems: 'flex-start'}}>
											<Animated animation={{preset: 'scale', easing: 'overshoot'}} delaySeconds={cues.points[index] + 0.15}>
												<Icon name="check" size={40} color={colors.lesson?.fill ?? colors.accent} />
											</Animated>
											<RichText text={point} size={36} markCues={cues.pointMarks[index]} />
										</div>
									</Card>
								</Animated>
							))}
						</div>
						{warnings.length > 0 ? (
							<div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: u(SPACING.md)}}>
								{warnings.map((warning, index) => (
									<Animated key={index} delaySeconds={cues.warnings[index]}>
										<div style={{display: 'flex', gap: u(18), alignItems: 'flex-start', padding: u(SPACING.lg), borderRadius: u(24), backgroundColor: withAlpha(colors.warning, 0.14)}}>
											<Icon name="alert" size={40} color={colors.warning} />
											<RichText text={warning} size={34} markCues={cues.warningMarks[index]} />
										</div>
									</Animated>
								))}
							</div>
						) : null}
					</div>
				</FitBox>
			</SafeArea>
		);
	}
	return (
		<SafeArea chrome gap={SPACING.lg}>
			<Animated>
				<Text variant="headline" size={84}>
					Özet
				</Text>
			</Animated>
			{/* A long summary is scaled down to fit instead of running under the chapter bar. */}
			<FitBox align="start">
			<div style={{display: 'flex', flexDirection: isLandscape ? 'row' : 'column', gap: u(SPACING.xl)}}>
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
			</FitBox>
		</SafeArea>
	);
};
