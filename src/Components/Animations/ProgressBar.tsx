import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {MOTION_DURATIONS, animationProgress, clamp01} from '../../Animations/Motion';
import {withAlpha} from '../../Themes/Theme';
import {useInk, useTheme} from '../../Themes/ThemeContext';
import {useVideoLayout} from '../Layouts/VideoLayout';

type ProgressBarProps = {
	/** Target fill between 0 and 1. */
	value: number;
	/** Animate from empty to `value`. Omit `durationSeconds` to show `value` as is. */
	delaySeconds?: number;
	durationSeconds?: number;
	/** Height in reference pixels. */
	height?: number;
	color?: string;
	trackColor?: string;
	style?: React.CSSProperties;
};

/** A horizontal bar that fills to `value`, either animated or driven directly by the caller. */
export const ProgressBar: React.FC<ProgressBarProps> = ({
	value,
	delaySeconds = 0,
	durationSeconds,
	height = 12,
	color,
	trackColor,
	style,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const theme = useTheme();
	const ink = useInk();
	const {u} = useVideoLayout();
	const eased =
		durationSeconds === undefined
			? 1
			: animationProgress({
					frame,
					fps,
					delaySeconds,
					durationSeconds: durationSeconds || MOTION_DURATIONS.base,
					easing: 'standard',
				});
	const fill = clamp01(value) * eased;

	return (
		<div
			style={{
				height: u(height),
				borderRadius: u(height),
				backgroundColor: trackColor ?? withAlpha(theme.colors.border, 0.9),
				overflow: 'hidden',
				...style,
			}}
		>
			<div
				style={{
					width: `${(fill * 100).toFixed(3)}%`,
					height: '100%',
					borderRadius: u(height),
					backgroundColor: color ?? ink.emphasis,
				}}
			/>
		</div>
	);
};
