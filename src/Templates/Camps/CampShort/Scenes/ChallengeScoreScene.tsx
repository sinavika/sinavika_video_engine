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
import {LessonColourPage, useTone} from './ChallengeKit';

/**
 * The close, one spoken ask: the score in the comments. Below it, silent, a
 * card for where the series lives: the free camp lesson on YouTube, with the
 * YouTube mark (the camp accounts promote the YouTube camp, never the app:
 * owner, 5 Nov 2026). Not a second spoken ask: a YouTube ask and an app card
 * one after the other drew neither (27 Oct 2026).
 */
export const ChallengeScoreScene: React.FC<{camp: CampEpisode}> = ({camp}) => {
	const tone = useTone();
	const {u} = useVideoLayout();
	return (
		<LessonColourPage>
			<SoundEffect id="transitionWhoosh" atSeconds={0} />
			<SafeArea chrome reel gap={SPACING.lg} style={{justifyContent: 'center'}}>
				<Animated animation={{preset: 'scale', easing: 'overshoot', durationSeconds: 0.35}}>
					<Text variant="display" size={170} style={{lineHeight: 0.95}}>
						Kaçta kaç?
					</Text>
				</Animated>
				<Animated animation={{preset: 'slide', direction: 'up', distance: 40, durationSeconds: 0.3}} delaySeconds={0.2}>
					<div style={{display: 'inline-flex', padding: `${u(20)}px ${u(38)}px`, borderRadius: u(999), backgroundColor: tone.on}}>
						<Text variant="headline" size={68} color={tone.fill}>
							Yoruma yaz.
						</Text>
					</div>
				</Animated>
				<Animated animation={{preset: 'slide', direction: 'up', distance: 40, durationSeconds: 0.35}} delaySeconds={0.5}>
					<div style={{display: 'flex', flexDirection: 'column', gap: u(14), marginTop: u(SPACING.xl), padding: `${u(30)}px ${u(34)}px`, borderRadius: u(32), backgroundColor: '#0F0F12'}}>
						<YouTubeMark size={44} />
						<Text variant="headline" size={50} color="#FFFFFF">
							Konunun tamamı ücretsiz
						</Text>
						<Text size={38} color={withAlpha('#FFFFFF', 0.75)}>
							{camp.name} · Ders {camp.number}
						</Text>
					</div>
				</Animated>
			</SafeArea>
		</LessonColourPage>
	);
};
