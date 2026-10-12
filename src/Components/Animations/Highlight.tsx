import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {MOTION_DURATIONS, animationProgress} from '../../Animations/Motion';
import {withAlpha} from '../../Themes/Theme';
import {useTheme} from '../../Themes/ThemeContext';

type HighlightProps = {
	delaySeconds?: number;
	durationSeconds?: number;
	/** CSS colour of the marker. Defaults to the theme's highlight colour. */
	color?: string;
	children: React.ReactNode;
};

/** Sweeps a marker stroke behind inline text, line by line. */
export const Highlight: React.FC<HighlightProps> = ({
	delaySeconds = 0,
	durationSeconds = MOTION_DURATIONS.slow,
	color,
	children,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const theme = useTheme();
	const progress = animationProgress({frame, fps, delaySeconds, durationSeconds, easing: 'standard'});
	const marker = color ?? withAlpha(theme.colors.highlight, 0.6);

	return (
		<span
			style={{
				backgroundImage: `linear-gradient(${marker}, ${marker})`,
				backgroundRepeat: 'no-repeat',
				backgroundSize: `${(progress * 100).toFixed(3)}% 82%`,
				backgroundPosition: '0 62%',
				padding: '0 0.14em',
				margin: '0 -0.14em',
				borderRadius: '0.14em',
			}}
		>
			{children}
		</span>
	);
};
