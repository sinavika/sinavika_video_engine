import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Animated} from '../../Components/Animations/Animated';
import {APP_SCREENS} from '../../Components/AppScreens/AppScreenRegistry';
import {StoreBadges} from '../../Components/Brand/StoreBadge';
import {PhoneFrame} from '../../Components/AppScreens/PhoneFrame';
import {SafeArea} from '../../Components/Layouts/SafeArea';
import {useVideoLayout} from '../../Components/Layouts/VideoLayout';
import {BrandMark} from '../../Components/Overlays/BrandMark';
import {Text} from '../../Components/Typography/Text';
import {COURSE_DESIGN} from '../../Courses/CourseDesign';
import {OUTRO_SCENE_ID} from '../../Scenes/AppEndScene';
import type {TemplateScene} from '../../Scenes/ScenePlan';
import {SPACING} from '../../Themes/DesignTokens';
import {InkProvider, useTheme} from '../../Themes/ThemeContext';

/**
 * The end of a course video: shown, never spoken. A long lesson ends on the
 * app; a short first points to the full lesson on YouTube, then to the app.
 */
const PromotionScene: React.FC<{lessonTitle?: string}> = ({lessonTitle}) => {
	const {colors} = useTheme();
	const {u, isLandscape} = useVideoLayout();
	const Screen = APP_SCREENS.ExamHome.Component;
	const ink = colors.onPrimary;
	return (
		<AbsoluteFill style={{backgroundColor: colors.primary}}>
			<InkProvider ink={{text: ink, muted: ink, emphasis: ink}}>
				<SafeArea gap={SPACING.xl} style={{flexDirection: isLandscape ? 'row' : 'column', alignItems: 'center', justifyContent: 'center'}}>
					<div style={{display: 'flex', flexDirection: 'column', gap: u(SPACING.lg), maxWidth: isLandscape ? '52%' : '100%', alignItems: isLandscape ? 'flex-start' : 'center'}}>
						{lessonTitle ? (
							<Animated animation={{preset: 'slide', direction: 'up', distance: 40}}>
								<div style={{display: 'flex', flexDirection: 'column', gap: u(10), padding: `${u(20)}px ${u(28)}px`, borderRadius: u(24), backgroundColor: colors.text}}>
									<Text variant="label" size={28} color={colors.primary}>
										Konunun tamamı YouTube'da
									</Text>
									<Text variant="title" size={52} color={colors.background}>
										{lessonTitle}
									</Text>
								</div>
							</Animated>
						) : null}
						<Animated delaySeconds={lessonTitle ? 0.6 : 0}>
							<BrandMark size="hero" color={ink} />
						</Animated>
						<Animated delaySeconds={lessonTitle ? 0.9 : 0.3}>
							<Text variant="headline" size={isLandscape ? 70 : 64} align={isLandscape ? 'left' : 'center'}>
								Çalışmaya uygulamada devam et.
							</Text>
						</Animated>
						<Animated delaySeconds={lessonTitle ? 1.2 : 0.6}>
							<StoreBadges height={88} align={isLandscape ? 'flex-start' : 'center'} />
						</Animated>
					</div>
					<Animated animation={{preset: 'slide', direction: 'up', distance: 160}} delaySeconds={0.4}>
						<PhoneFrame width={u(isLandscape ? 380 : 420)} style={{transform: 'rotate(4deg)'}}>
							<Screen />
						</PhoneFrame>
					</Animated>
				</SafeArea>
			</InkProvider>
		</AbsoluteFill>
	);
};

/** The promotion as the video's last scene. It takes the outro's place, so `outro.enabled: false` drops it like any outro. */
export const promotionScene = (enabled: boolean, lessonTitle?: string): TemplateScene[] =>
	enabled
		? [
				{
					id: OUTRO_SCENE_ID,
					seconds: lessonTitle ? COURSE_DESIGN.promotion.shortSeconds + 1.5 : COURSE_DESIGN.promotion.lessonSeconds,
					label: 'Tanıtım',
					silent: true,
					element: <PromotionScene lessonTitle={lessonTitle} />,
				},
			]
		: [];
