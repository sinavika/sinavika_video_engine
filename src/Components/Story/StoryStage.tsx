import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';

/** The stage every story kit piece is drawn on, in pixels: a 1080 × 1920 story. */
export const STORY_STAGE = {width: 1080, height: 1920} as const;

/**
 * Scales the 1080 × 1920 story stage to the video's own size, so a reel rendered at 1440p or 2160p draws the same
 * picture, sharper. Every scene of a story reel goes inside it (Sosyal Medya, 15 Nov 2026: one wrapper in the kit, not
 * one per template).
 */
export const StoryStage: React.FC<{children: React.ReactNode}> = ({children}) => {
	const {width} = useVideoConfig();
	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
			<div style={{position: 'absolute', left: 0, top: 0, width: STORY_STAGE.width, height: STORY_STAGE.height, transform: `scale(${width / STORY_STAGE.width})`, transformOrigin: '0 0'}}>{children}</div>
		</AbsoluteFill>
	);
};
