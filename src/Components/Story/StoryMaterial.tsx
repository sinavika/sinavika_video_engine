import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {STORY_COLORS, storyTone, useStoryLook, type StoryTone} from './StoryLook';

/**
 * The material of the story reels' cards: paper with grain, a soft shadow and a curled corner; marks made by hand in
 * red pen, green pen and highlighter. One material for every card; its paper and the ground it lies on come from the
 * reel's look (StoryLook), so a card's shadow suits a light or a dark ground (sinavika.tr, 15 Nov 2026: "kartlar daha
 * iyi olabilir").
 */

const SHADOW: Record<StoryTone, string> = {
	light: '0 2px 4px rgba(15, 23, 42, 0.10), 0 18px 40px -16px rgba(15, 23, 42, 0.35)',
	dark: '0 2px 6px rgba(0, 0, 0, 0.35), 0 26px 50px -18px rgba(0, 0, 0, 0.7)',
};

/** Paper grain: fixed noise as an SVG data URI, so every frame and every render shows the same fibres. */
const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.3  0 0 0 0 0.2  0 0 0 0.09 0"/></filter><rect width="240" height="240" filter="url(#g)"/></svg>')}")`;

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/**
 * A sheet of paper: grain, a soft shadow for the ground it lies on, and optionally ruled lines with a red margin (a
 * notebook page) and a curled lower right corner. `rotate` tilts it as a sheet dropped on a desk.
 */
export const Paper: React.FC<{width: number; height?: number; tone?: StoryTone; ruled?: boolean; curl?: boolean; rotate?: number; color?: string; padding?: number; style?: React.CSSProperties; children?: React.ReactNode}> = ({width, height, tone: given, ruled = false, curl = true, rotate = 0, color: givenColor, padding = 44, style, children}) => {
	const look = useStoryLook();
	const tone = given ?? storyTone(look);
	const color = givenColor ?? look.paper;
	return (
	<div
		style={{
			position: 'relative',
			width,
			height,
			padding,
			boxSizing: 'border-box',
			borderRadius: 10,
			background: ruled
				? `${GRAIN}, linear-gradient(90deg, transparent 72px, ${STORY_COLORS.paperMargin} 72px, ${STORY_COLORS.paperMargin} 75px, transparent 75px), repeating-linear-gradient(180deg, transparent 0 55px, ${STORY_COLORS.paperLine} 55px 57px), ${color}`
				: `${GRAIN}, ${color}`,
			boxShadow: SHADOW[tone],
			transform: rotate ? `rotate(${rotate}deg)` : undefined,
			color: STORY_COLORS.ink,
			...style,
		}}
	>
		{children}
		{curl ? (
			<div
				style={{
					position: 'absolute',
					right: 0,
					bottom: 0,
					width: 70,
					height: 70,
					background: `linear-gradient(315deg, rgba(0,0,0,0) 50%, #E7E1D2 50%, #FFFFFF 78%)`,
					borderTopLeftRadius: 18,
					boxShadow: '-6px -6px 12px -8px rgba(15, 23, 42, 0.25)',
				}}
			/>
		) : null}
	</div>
	);
};

/**
 * The reel's ground from its look: one colour or a gradient, the paper grain when the look asks for it, and the lamp
 * glow breathing in the lower right. Every scene and the closing card stand on it; `plain` leaves the lamp out.
 */
export const StoryGround: React.FC<{plain?: boolean; children?: React.ReactNode}> = ({plain = false, children}) => {
	const {ground} = useStoryLook();
	const seconds = useCurrentFrame() / useVideoConfig().fps;
	const [top, bottom = top] = ground.colors;
	const breathe = 0.85 + 0.15 * Math.sin(seconds * 2);
	const glow = ground.light && !plain ? `${ground.light}${Math.round(0.22 * breathe * 255).toString(16).padStart(2, '0')}` : null;
	return (
		<AbsoluteFill style={{background: `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)`}}>
			{ground.texture === 'paper' ? <AbsoluteFill style={{backgroundImage: GRAIN}} /> : null}
			{glow ? <AbsoluteFill style={{background: `radial-gradient(circle at 78% 62%, ${glow} 0%, ${ground.light}00 46%)`}} /> : null}
			{children}
		</AbsoluteFill>
	);
};

type HandMarkKind = 'cross' | 'check' | 'circle' | 'underline' | 'arrow';

/** Hand-drawn strokes in a 100 × 100 box, a little uneven as a pen makes them. */
const MARK_PATHS: Record<HandMarkKind, string[]> = {
	cross: ['M14 18 C 34 38, 62 64, 86 84', 'M84 16 C 62 36, 38 62, 16 86'],
	check: ['M12 54 C 22 62, 32 72, 40 82 C 54 58, 70 34, 90 14'],
	circle: ['M50 8 C 80 6, 96 28, 94 52 C 92 78, 70 94, 46 92 C 20 90, 4 70, 8 44 C 11 22, 30 9, 58 10'],
	underline: ['M4 60 C 30 54, 62 66, 96 56'],
	arrow: ['M8 70 C 30 66, 56 54, 86 30', 'M64 26 L 88 28 L 82 52'],
};

/**
 * A mark made by hand: a red cross over a wrong answer, a green tick, a circle round the word that matters, a
 * stroke under it, an arrow. It draws itself from `at` over `seconds`, stroke by stroke, as a pen moves.
 */
export const HandMark: React.FC<{kind: HandMarkKind; at?: number; seconds?: number; width: number; height?: number; color?: string; strokeWidth?: number; style?: React.CSSProperties}> = ({kind, at = 0, seconds: drawSeconds = 0.35, width, height = width, color = STORY_COLORS.redPen, strokeWidth = 9, style}) => {
	const seconds = useCurrentFrame() / useVideoConfig().fps;
	const paths = MARK_PATHS[kind];
	return (
		<svg width={width} height={height} viewBox="0 0 100 100" preserveAspectRatio="none" style={{overflow: 'visible', ...style}}>
			{paths.map((d, index) => {
				const start = at + (index * drawSeconds) / paths.length;
				const drawn = interpolate(seconds, [start, start + drawSeconds / paths.length], [0, 1], CLAMP);
				return <path key={index} d={d} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - drawn} opacity={drawn > 0 ? 0.92 : 0} />;
			})}
		</svg>
	);
};

/** A highlighter stroke behind its children, swept left to right from `at`. */
export const Highlight: React.FC<{at?: number; seconds?: number; color?: string; children: React.ReactNode}> = ({at = 0, seconds: sweep = 0.3, color = STORY_COLORS.highlighter, children}) => {
	const seconds = useCurrentFrame() / useVideoConfig().fps;
	const swept = interpolate(seconds, [at, at + sweep], [0, 1], CLAMP);
	return (
		<span style={{position: 'relative', display: 'inline-block'}}>
			<span style={{position: 'absolute', left: '-3%', top: '18%', height: '72%', width: `${106 * swept}%`, background: color, opacity: 0.7, borderRadius: 6, transform: 'skewX(-8deg) rotate(-1deg)'}} />
			<span style={{position: 'relative'}}>{children}</span>
		</span>
	);
};
