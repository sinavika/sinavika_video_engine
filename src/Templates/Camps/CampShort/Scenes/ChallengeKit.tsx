import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Animated, type AnimatedProps} from '../../../../Components/Animations/Animated';
import {SoundEffect} from '../../../../Components/Sounds/SoundEffect';
import {withAlpha} from '../../../../Themes/Theme';
import {InkProvider, useTheme} from '../../../../Themes/ThemeContext';

/**
 * The scenes of a challenge reel: rounds that ask, count down and answer,
 * the first one on screen from the first frame with the dare over it, and a
 * closing that asks for the score. A tick counts the seconds, a chime lands
 * with the answer and a whoosh goes with each slide in (27 Oct 2026). In the lesson's colour, like the camp
 * lesson on YouTube (docs/CourseColors.md).
 */

export const useTone = () => {
	const {colors} = useTheme();
	return colors.lesson ?? {fill: colors.primary, on: colors.onPrimary};
};

/** A full-bleed page in the lesson colour, as the section openings of the lesson. */
export const LessonColourPage: React.FC<{children: React.ReactNode}> = ({children}) => {
	const tone = useTone();
	return (
		<AbsoluteFill style={{backgroundColor: tone.fill, backgroundImage: `radial-gradient(circle at 80% 15%, ${withAlpha('#FFFFFF', 0.16)} 0%, transparent 45%)`}}>
			<InkProvider ink={{text: tone.on, muted: withAlpha(tone.on, 0.8), emphasis: tone.on}}>{children}</InkProvider>
		</AbsoluteFill>
	);
};

/** The sounds of a round: a whoosh in with the slide (not on the first round, which is there from the first frame), a tick on each second of the countdown, a chime as the answer lights. */
export const RoundSounds: React.FC<{index: number; timing: RoundTiming}> = ({index, timing}) => (
	<>
		{index > 0 ? <SoundEffect id="transitionWhoosh" atSeconds={0} /> : null}
		{Array.from({length: Math.ceil(timing.thinkSeconds)}, (_, second) => (
			<SoundEffect key={second} id="countdownTick" atSeconds={timing.thinkAt + second} />
		))}
		<SoundEffect id="correctAnswer" atSeconds={timing.revealAt} />
	</>
);

/** Enters like `Animated`, or is simply there: the first round shows its question on the very first frame (the reel's thumbnail and first second). */
export const Enter: React.FC<AnimatedProps & {instant: boolean}> = ({instant, children, ...props}) => (instant ? <>{children}</> : <Animated {...props}>{children}</Animated>);

export type RoundTiming = {thinkAt: number; thinkSeconds: number; revealAt: number};
