import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {MOTION_DURATIONS, animationProgress, type EasingName} from '../../Animations/Motion';

type DrawPathProps = Omit<React.SVGProps<SVGPathElement>, 'pathLength' | 'strokeDasharray' | 'strokeDashoffset'> & {
	delaySeconds?: number;
	durationSeconds?: number;
	easing?: EasingName;
};

/**
 * Draws an SVG path from start to end. Uses a normalised path length, so no
 * DOM measurement is needed and any path works.
 */
export const DrawPath: React.FC<DrawPathProps> = ({
	delaySeconds = 0,
	durationSeconds = MOTION_DURATIONS.slow,
	easing = 'standard',
	style,
	...pathProps
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const progress = animationProgress({frame, fps, delaySeconds, durationSeconds, easing});

	return (
		<path
			fill="none"
			strokeLinecap="round"
			strokeLinejoin="round"
			{...pathProps}
			pathLength={1}
			strokeDasharray={1}
			strokeDashoffset={1 - progress}
			style={{...style, opacity: progress <= 0 ? 0 : (style?.opacity ?? 1)}}
		/>
	);
};
