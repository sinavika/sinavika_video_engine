import React from 'react';
import {Animated} from '../../../Components/Animations/Animated';
import {Icon} from '../../../Components/Illustrations/Icon';
import {Card} from '../../../Components/Layouts/Card';
import {SafeArea} from '../../../Components/Layouts/SafeArea';
import {useVideoLayout} from '../../../Components/Layouts/VideoLayout';
import {RichText} from '../../../Components/Typography/RichText';
import {Text} from '../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY} from '../../../Configurations/BrandTypography';
import type {CampEpisode} from '../../../Courses/Camp';
import {SPACING} from '../../../Themes/DesignTokens';
import {withAlpha} from '../../../Themes/Theme';
import {useTheme} from '../../../Themes/ThemeContext';
import {StudioHeading, useStudio} from '../../Courses/CourseLesson/Scenes/LessonChrome';

/** The end of a camp lesson: the camp task, and the next lesson (or the end of the camp). */
export const CampTaskScene: React.FC<{camp: CampEpisode; cues?: {items: number[]; next: number}}> = ({camp, cues}) => {
	const {colors} = useTheme();
	const {u, isLandscape} = useVideoLayout();
	const tone = colors.lesson ?? {fill: colors.accent, on: colors.onAccent};
	const last = camp.number === camp.total;
	const studio = useStudio();
	return (
		<SafeArea chrome={!studio} gap={SPACING.lg}>
			{studio ? (
				<StudioHeading title="Kamp görevi" />
			) : (
				<Animated>
					<Text variant="headline" size={84}>
						Kamp görevi
					</Text>
				</Animated>
			)}
			<div style={{flex: 1, minHeight: 0, display: 'flex', flexDirection: isLandscape ? 'row' : 'column', gap: u(SPACING.xl), alignItems: isLandscape ? 'center' : 'stretch'}}>
				<div style={{flex: 1.4, display: 'flex', flexDirection: 'column', gap: u(SPACING.md)}}>
					{/* Each task arrives as it is said (without cues, one after another at the start). */}
					{camp.task.items.map((item, index) => (
						<Animated key={index} animation={{preset: 'slide', direction: 'left', distance: 60}} delaySeconds={cues?.items[index] ?? 0.4 + index * 0.7}>
							<Card padding={SPACING.lg} elevated={false}>
								<div style={{display: 'flex', gap: u(20), alignItems: 'center'}}>
									<div style={{flex: 'none', width: u(64), height: u(64), borderRadius: u(18), backgroundColor: tone.fill, color: tone.on, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
										<Text size={34} weight={BRAND_TYPOGRAPHY.weights.kinetic} color={tone.on}>
											{index + 1}
										</Text>
									</div>
									<RichText text={item} size={38} />
								</div>
							</Card>
						</Animated>
					))}
				</div>
				<Animated animation={{preset: 'slide', direction: 'up', distance: 80}} delaySeconds={cues?.next ?? 0.6 + camp.task.items.length * 0.7} style={{flex: 1}}>
					<div style={{display: 'flex', flexDirection: 'column', gap: u(14), padding: u(SPACING.xl), borderRadius: u(32), backgroundColor: tone.fill}}>
						<div style={{display: 'flex', alignItems: 'center', gap: u(14)}}>
							<Icon name={last ? 'star' : 'arrowRight'} size={40} color={tone.on} />
							<Text variant="label" size={30} color={withAlpha(tone.on, 0.8)}>
								{last ? 'Kamp tamamlandı' : `Sıradaki ders · ${camp.number + 1} / ${camp.total}`}
							</Text>
						</div>
						<Text variant="title" size={58} color={tone.on}>
							{last ? `${camp.name} bitti. Tebrikler!` : camp.next ?? ''}
						</Text>
					</div>
				</Animated>
			</div>
		</SafeArea>
	);
};
