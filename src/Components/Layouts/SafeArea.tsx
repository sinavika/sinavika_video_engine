import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CHROME_HEIGHT, SPACING} from '../../Themes/DesignTokens';
import {useVideoLayout} from './VideoLayout';

type SafeAreaProps = {
	/** Leave room at the top for the template's chrome bar. */
	chrome?: boolean;
	/** Gap between children, in reference pixels. */
	gap?: number;
	style?: React.CSSProperties;
	children: React.ReactNode;
};

/** Full-frame column that keeps its children inside the format's safe area. */
export const SafeArea: React.FC<SafeAreaProps> = ({chrome = false, gap = SPACING.lg, style, children}) => {
	const {safeArea, u} = useVideoLayout();
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
export const ChromeBar: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({
	children,
	style,
}) => {
	const {safeArea, u} = useVideoLayout();
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
