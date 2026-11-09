import React from 'react';
import {AbsoluteFill} from 'remotion';
import {REEL_SAFE_AREA} from '../../Configurations/VideoFormats';
import {CHROME_HEIGHT, SPACING} from '../../Themes/DesignTokens';
import {useVideoLayout} from './VideoLayout';

type SafeAreaProps = {
	/** Leave room at the top for the template's chrome bar. */
	chrome?: boolean;
	/** Keep clear of Instagram/TikTok/Shorts controls (REEL_SAFE_AREA) instead of the format's safe area. */
	reel?: boolean;
	/** Gap between children, in reference pixels. */
	gap?: number;
	style?: React.CSSProperties;
	children: React.ReactNode;
};

/** The safe area in actual pixels: the format's, or with `reel` the one clear of the platforms' controls. */
const useSafeInsets = (reel = false) => {
	const {safeArea, u} = useVideoLayout();
	return reel ? {top: u(REEL_SAFE_AREA.top), right: u(REEL_SAFE_AREA.right), bottom: u(REEL_SAFE_AREA.bottom), left: u(REEL_SAFE_AREA.left)} : safeArea;
};

/** Full-frame column that keeps its children inside the format's safe area. */
export const SafeArea: React.FC<SafeAreaProps> = ({chrome = false, reel = false, gap = SPACING.lg, style, children}) => {
	const {u} = useVideoLayout();
	const safeArea = useSafeInsets(reel);
	return (
		<AbsoluteFill
			style={{
				boxSizing: 'border-box',
				paddingTop: safeArea.top + (chrome ? u(CHROME_HEIGHT) : 0),
				paddingRight: safeArea.right,
				paddingBottom: safeArea.bottom,
				paddingLeft: safeArea.left,
				gap: u(gap),
				...style,
			}}
		>
			{children}
		</AbsoluteFill>
	);
};

/** Row pinned to the top of the safe area for persistent chrome (brand, progress). */
export const ChromeBar: React.FC<{children: React.ReactNode; reel?: boolean; style?: React.CSSProperties}> = ({
	children,
	reel = false,
	style,
}) => {
	const {u} = useVideoLayout();
	const safeArea = useSafeInsets(reel);
	return (
		<div
			style={{
				position: 'absolute',
				top: safeArea.top,
				left: safeArea.left,
				right: safeArea.right,
				height: u(CHROME_HEIGHT - SPACING.md),
				display: 'flex',
				alignItems: 'center',
				gap: u(SPACING.md),
				...style,
			}}
		>
			{children}
		</div>
	);
};
