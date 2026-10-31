import React from 'react';
import {Animated} from '../../../../Components/Animations/Animated';
import {SafeArea} from '../../../../Components/Layouts/SafeArea';
import {useVideoLayout} from '../../../../Components/Layouts/VideoLayout';
import {SoundEffect} from '../../../../Components/Sounds/SoundEffect';
import {Text} from '../../../../Components/Typography/Text';
import type {CampEpisode} from '../../../../Courses/Camp';
import {SPACING} from '../../../../Themes/DesignTokens';
import {withAlpha} from '../../../../Themes/Theme';
import {LessonColourPage, useTone} from './ChallengeKit';

/**
 * The close, one ask: the score in the comments. The camp lesson is named
 * small and silent below it, as where the series lives, not a second ask:
 * a YouTube ask and an app card one after the other drew neither (27 Oct 2026).
 */
export const ChallengeScoreScene: React.FC<{camp: CampEpisode}> = ({camp}) => {
	const tone = useTone();
	const {u} = useVideoLayout();
	return (
		<LessonColourPage>
			<SoundEffect id="transitionWhoosh" atSeconds={0} />
			<SafeArea chrome gap={SPACING.lg} style={{justifyContent: 'center'}}>
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
				<Animated delaySeconds={0.5}>
					<Text size={40} color={withAlpha(tone.on, 0.8)} style={{marginTop: u(SPACING.lg)}}>
						Konunun tamamı YouTube'da · {camp.name}, Ders {camp.number}
					</Text>
				</Animated>
			</SafeArea>
		</LessonColourPage>
	);
};
