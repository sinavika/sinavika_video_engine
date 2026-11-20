import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {useTheme} from '../../Themes/ThemeContext';
import type {GlassEffect} from './StoryGlass';
import {StoryDevice, type ScreenTransition} from './StoryDevice';
import {useStoryLook} from './StoryLook';

/**
 * Before and after of one screen ("Dediniz, yaptık", Sosyal Medya, 20 Nov 2026): the app as it was (an `once-…`
 * drawing, StoryBefore, or a real drawing with the engine's moments on it, StoryGlass) and the real UI/UX drawing of
 * today, on the same device. At `at` the new screen is wiped in from the left behind a line in the look's accent
 * (`wipe`) or slides in (`slide`). Under the device a two-word label, "Önce · Sonra", lights the side on the glass.
 */

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

type BeforeAfterSide = {id: string; glass?: readonly GlassEffect[]};

export const StoryBeforeAfter: React.FC<{
	before: BeforeAfterSide;
	after: BeforeAfterSide;
	/** When the after comes in, seconds of the scene. */
	at: number;
	width: number;
	transition?: Extract<ScreenTransition, 'wipe' | 'slide'>;
	/** The label under the device; false leaves it out. */
	label?: boolean;
	words?: {before: string; after: string};
	rotate?: number;
}> = ({before, after, at, width, transition = 'wipe', label = true, words = {before: 'Önce', after: 'Sonra'}, rotate = 0}) => {
	const seconds = useCurrentFrame() / useVideoConfig().fps;
	const look = useStoryLook();
	const {typography} = useTheme();
	// The label follows the line: it turns to "Sonra" when the wipe is half across.
	const turned = interpolate(seconds, [at + 0.25, at + 0.45], [0, 1], CLAMP);
	const size = Math.round(width * 0.11);
	const word = (text: string, on: number) => (
		<div style={{padding: `${size * 0.22}px ${size * 0.7}px`, borderRadius: 999, background: on > 0.5 ? look.chip.background : 'transparent', color: on > 0.5 ? look.chip.ink : look.ink, opacity: 0.45 + 0.55 * on, fontFamily: typography.display, fontWeight: 800, fontSize: size, transform: `scale(${0.92 + 0.08 * on})`}}>{text}</div>
	);
	return (
		<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: size * 0.8}}>
			<StoryDevice
				width={width}
				rotate={rotate}
				transition={transition}
				screens={[
					{id: before.id, at: 0, glass: before.glass},
					{id: after.id, at, glass: after.glass},
				]}
			/>
			{label ? (
				<div style={{display: 'flex', gap: size * 0.3, alignItems: 'center'}}>
					{word(words.before, 1 - turned)}
					{word(words.after, turned)}
				</div>
			) : null}
		</div>
	);
};
