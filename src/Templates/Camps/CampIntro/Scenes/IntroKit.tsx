import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {useVideoLayout} from '../../../../Components/Layouts/VideoLayout';
import {Text} from '../../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../../Configurations/BrandTypography';
import {courseLessonColor} from '../../../../Configurations/LessonColors';

/**
 * The scenes of a camp's episode 0 (CampIntro): an advertising film, not a
 * lesson. Big type that lands on the beat, data drawn as it is said (the
 * exam's questions as cells, the clock, the camp as coloured tiles), the app
 * on phones and one clear next step. Brand navy, paper and orange; each camp
 * lesson in its own lesson colour (Configurations/LessonColors).
 *
 * Every scene is drawn on the 1920 x 1080 reference canvas (u()). Nothing
 * arrives on a timer: each element gets the second its words are heard (`at`,
 * from phraseCues in the template), so a card never lands while the previous
 * one is still being talked about (owner, 26 Oct 2026).
 */

const INTRO_COLORS = {navy: '#0B1C30', navyDeep: '#06111F', paper: '#F7F4EF', orange: '#EA580C', orangeSoft: '#FFEDD5', white: '#FFFFFF', ink: '#0B1C30', muted: '#5F6B7D', line: '#E5E1DA', right: '#059669', wrong: '#DC2626'} as const;

export const C = INTRO_COLORS;

export const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const useSeconds = (): number => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return frame / fps;
};

/** 0 → 1 between two moments of the scene, eased. */
export const useProgress = (from: number, to: number): number => interpolate(useSeconds(), [from, to], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});

/** A springy 0 → 1 that starts at `delay` seconds. */
export const usePop = (delay: number): number => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return spring({frame: frame - delay * fps, fps, config: {damping: 16, stiffness: 170}});
};

/** Text or a block that rises in at a moment: from below and transparent to in place. */
export const Rise: React.FC<{at: number; distance?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({at, distance = 40, children, style}) => {
	const {u} = useVideoLayout();
	const p = usePop(at);
	return <div style={{opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * u(distance)}px)`, ...style}}>{children}</div>;
};

export const Stage: React.FC<{ground: string; children: React.ReactNode}> = ({ground, children}) => (
	<AbsoluteFill style={{background: ground, overflow: 'hidden'}}>{children}</AbsoluteFill>
);

export const Box: React.FC<{x: number; y: number; w?: number; h?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({x, y, w, h, children, style}) => {
	const {u} = useVideoLayout();
	return <div style={{position: 'absolute', left: u(x), top: u(y), width: w === undefined ? undefined : u(w), height: h === undefined ? undefined : u(h), ...style}}>{children}</div>;
};

/** The small series label every scene carries top left: "YKS KAMPI · TYT · 0". */
export const Kicker: React.FC<{text: string; color: string}> = ({text, color}) => (
	<Box x={120} y={84}>
		<Text variant="label" size={26} weight={TYPE.weights.display} color={color} style={{letterSpacing: '0.12em', textTransform: 'uppercase'}}>
			{text}
		</Text>
	</Box>
);

export const lessonColor = (code: string | undefined, fallback: string = C.orange): string => courseLessonColor(code) ?? fallback;

/** The scene's title, landing first. */
export const Title: React.FC<{text: string; color?: string; size?: number}> = ({text, color = C.ink, size = 92}) => (
	<Box x={120} y={140} w={1680}>
		<Rise at={0.1}>
			<Text variant="display" size={size} weight={TYPE.weights.kinetic} color={color} style={{letterSpacing: '-0.03em'}}>
				{text}
			</Text>
		</Rise>
	</Box>
);
