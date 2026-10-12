import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {normalizeAnimation, type AnimationInput} from '../../Animations/AnimationSpec';
import {animationStyle} from '../../Animations/AnimationStyle';
import {MOTION_DURATIONS, STAGGER_STEPS, animationProgress} from '../../Animations/Motion';
import {useTheme} from '../../Themes/ThemeContext';
import {useVideoLayout} from '../Layouts/VideoLayout';

export type AnimatedProps = {
	/** Entrance. Defaults to the theme's entrance, so the same template moves differently per theme. */
	animation?: AnimationInput;
	/** Seconds after the enclosing scene (or Sequence) starts. */
	delaySeconds?: number;
	/** When set, the element leaves at this time using `exit`. */
	exitAtSeconds?: number;
	exit?: AnimationInput;
	style?: React.CSSProperties;
	children: React.ReactNode;
};

/**
 * Fade, slide, scale, zoom and reveal, in and out. Timing is relative to the
 * enclosing scene, so moving a scene on the timeline never requires touching
 * the animations inside it.
 */
export const Animated: React.FC<AnimatedProps> = ({
	animation,
	delaySeconds = 0,
	exitAtSeconds,
	exit = 'fade',
	style,
	children,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {motion} = useTheme();
	const {unit} = useVideoLayout();

	const enter = normalizeAnimation(animation ?? motion.enter);
	const enterProgress = animationProgress({
		frame,
		fps,
		delaySeconds: delaySeconds + (enter.delaySeconds ?? 0),
		durationSeconds: (enter.durationSeconds ?? MOTION_DURATIONS.base) / motion.speed,
		easing: enter.easing ?? 'enter',
	});
	let animated = animationStyle(enter, enterProgress, unit);

	if (exitAtSeconds !== undefined) {
		const leave = normalizeAnimation(exit);
		const exitProgress = animationProgress({
			frame,
			fps,
			delaySeconds: exitAtSeconds,
			durationSeconds: (leave.durationSeconds ?? MOTION_DURATIONS.fast) / motion.speed,
			easing: leave.easing ?? 'exit',
		});
		if (exitProgress > 0) animated = animationStyle(leave, 1 - exitProgress, unit);
	}

	return <div style={{...style, ...animated}}>{children}</div>;
};

type StaggerProps = Omit<AnimatedProps, 'children' | 'style'> & {
	/** Seconds between consecutive children. */
	stepSeconds?: number;
	itemStyle?: React.CSSProperties;
	children: React.ReactNode;
};

/** Animates each child in turn. Renders the children directly, so it works inside any flex or grid parent. */
export const Stagger: React.FC<StaggerProps> = ({
	delaySeconds = 0,
	stepSeconds = STAGGER_STEPS.base,
	itemStyle,
	children,
	...animatedProps
}) => (
	<>
		{React.Children.toArray(children).map((child, index) => (
			<Animated
				key={index}
				{...animatedProps}
				delaySeconds={delaySeconds + index * stepSeconds}
				style={itemStyle}
			>
				{child}
			</Animated>
		))}
	</>
);
