import React from 'react';
import {Animated} from '../../../../Components/Animations/Animated';
import {YouTubeMark} from '../../../../Components/Illustrations/YouTubeMark';
import {SafeArea} from '../../../../Components/Layouts/SafeArea';
import {useVideoLayout} from '../../../../Components/Layouts/VideoLayout';
import {SoundEffect} from '../../../../Components/Sounds/SoundEffect';
import {Text} from '../../../../Components/Typography/Text';
import type {CampEpisode} from '../../../../Courses/Camp';
import {SPACING} from '../../../../Themes/DesignTokens';
import {withAlpha} from '../../../../Themes/Theme';
import {LessonColourPage} from '../../CampShort/Scenes/ChallengeKit';

/**
 * The flash reel's last two seconds, silent: where the rest of the lesson is, free. The YouTube mark, "Konunun
 * tamamı ücretsiz" and the camp lesson, in big type, inside the reel's safe area. It ends the reel as soon as it is
 * read: a long outro with nothing new is where viewers leave (8 Nov 2026).
 */
export const FlashEndScene: React.FC<{camp: CampEpisode}> = ({camp}) => {
	const {u} = useVideoLayout();
	return (
		<LessonColourPage>
			<SoundEffect id="transitionWhoosh" atSeconds={0} />
			<SafeArea reel gap={SPACING.lg} style={{justifyContent: 'center'}}>
				<Animated animation={{preset: 'scale', easing: 'overshoot', durationSeconds: 0.3}}>
					<div style={{display: 'inline-flex', padding: `${u(22)}px ${u(30)}px`, borderRadius: u(28), backgroundColor: '#0F0F12'}}>
						<YouTubeMark size={64} />
					</div>
				</Animated>
				<Animated animation={{preset: 'slide', direction: 'up', distance: 40, durationSeconds: 0.3}} delaySeconds={0.1}>
					<Text variant="display" size={110} style={{lineHeight: 1}}>
						Konunun tamamı ücretsiz
					</Text>
				</Animated>
				<Animated delaySeconds={0.25}>
					<Text size={46} color={withAlpha('#FFFFFF', 0.85)}>
						{camp.name} · Ders {camp.number}
					</Text>
				</Animated>
			</SafeArea>
		</LessonColourPage>
	);
};
