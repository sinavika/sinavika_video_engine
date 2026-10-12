import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {withAlpha} from '../../Themes/Theme';
import {useTheme} from '../../Themes/ThemeContext';
import {useVideoLayout} from './VideoLayout';

/** Paints the canvas described by `theme.background`. Motion is a pure function of the frame. */
export const ThemeBackground: React.FC = () => {
	const theme = useTheme();
	const {u} = useVideoLayout();
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {background, colors} = theme;
	const seconds = frame / fps;

	switch (background.kind) {
		case 'solid':
			return <AbsoluteFill style={{backgroundColor: colors.background}} />;
		case 'gradient':
			return (
				<AbsoluteFill
					style={{
						backgroundImage: `linear-gradient(${background.angle}deg, ${background.stops.join(', ')})`,
					}}
				/>
			);
		case 'glow': {
			const drift = Math.sin(seconds * 0.35) * 6;
			const blobs = background.colors.map((color, index) => {
				const x = index % 2 === 0 ? 12 + drift : 88 - drift;
				const y = index % 2 === 0 ? 8 : 92;
				return `radial-gradient(circle at ${x.toFixed(2)}% ${y}%, ${withAlpha(color, 0.75)} 0%, ${withAlpha(color, 0)} 46%)`;
			});
			return (
				<AbsoluteFill
					style={{backgroundColor: colors.background, backgroundImage: blobs.join(', ')}}
				/>
			);
		}
		case 'grid': {
			const size = u(background.size);
			const line = `${Math.max(1, u(1.5))}px`;
			return (
				<AbsoluteFill style={{backgroundColor: colors.background}}>
					<AbsoluteFill
						style={{
							backgroundImage: `linear-gradient(${background.lineColor} ${line}, transparent ${line}), linear-gradient(90deg, ${background.lineColor} ${line}, transparent ${line})`,
							backgroundSize: `${size}px ${size}px`,
						}}
					/>
					<AbsoluteFill
						style={{
							backgroundImage: `radial-gradient(circle at 50% 0%, ${withAlpha(colors.primary, 0.16)} 0%, transparent 55%), radial-gradient(circle at 100% 100%, ${withAlpha(colors.accent, 0.14)} 0%, transparent 50%)`,
						}}
					/>
				</AbsoluteFill>
			);
		}
		case 'dots': {
			const size = u(background.size);
			const dot = u(3);
			return (
				<AbsoluteFill
					style={{
						backgroundColor: colors.background,
						backgroundImage: `radial-gradient(${background.dotColor} ${dot}px, transparent ${dot + 0.5}px)`,
						backgroundSize: `${size}px ${size}px`,
					}}
				/>
			);
		}
	}
};
