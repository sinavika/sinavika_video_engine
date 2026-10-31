import React from 'react';
import {clamp01, lerp} from '../../../Animations/Motion';
import {withAlpha} from '../../../Themes/Theme';
import {useVisualPalette} from '../VisualFrame';
import {W} from '../VisualWorld';

/**
 * Natural processes shown as they happen, stage by stage. Each visual draws
 * in a 1000 x 600 world fitted into its box; the stage strip at the top names
 * the stages and marks the one being told. Stages follow the card's beats or,
 * without beats, play one after another.
 */

export const TOP = 70;

 // the stage strip

/** A colour between two hex colours. */
export const mixColor = (from: string, to: string, t: number) => {
	const channels = (hex: string) => [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16));
	const [a, b] = [channels(from), channels(to)];
	return `rgb(${a.map((value, index) => Math.round(lerp(value, b[index], clamp01(t)))).join(',')})`;
};

/** The stages as chips, the current one in the lesson colour, with a bar for how far it has gone. */
export const StageStrip: React.FC<{names: readonly string[]; stage: number; progress: number; width?: number}> = ({names, stage, progress, width = W}) => {
	const palette = useVisualPalette();
	const gap = 12;
	const chip = (width - gap * (names.length - 1)) / names.length;
	return (
		<g fontFamily={palette.fontDisplay}>
			{names.map((name, index) => {
				const x = index * (chip + gap);
				const active = index === stage;
				const done = index < stage;
				return (
					<g key={name}>
						<rect x={x} y={8} width={chip} height={44} rx={22} fill={active ? palette.lesson : done ? withAlpha(palette.lesson, 0.22) : withAlpha(palette.ink, 0.07)} />
						{active ? <rect x={x} y={46} width={chip * progress} height={6} rx={3} fill={withAlpha(palette.onLesson, 0.7)} /> : null}
						<text x={x + chip / 2} y={37} textAnchor="middle" fontSize={names.length > 4 ? 20 : 22} fontWeight={800} fill={active ? palette.onLesson : palette.ink}>
							{`${index + 1}. ${name}`}
						</text>
					</g>
				);
			})}
		</g>
	);
};

export const Label: React.FC<{x: number; y: number; children: React.ReactNode; anchor?: 'start' | 'middle' | 'end'; show?: number; size?: number; color?: string}> = ({x, y, children, anchor = 'middle', show = 1, size = 24, color}) => {
	const palette = useVisualPalette();
	if (show <= 0) return null;
	return (
		<text x={x} y={y} textAnchor={anchor} fontSize={size} fontWeight={800} fill={color ?? palette.ink} opacity={show} fontFamily={palette.fontBody} paintOrder="stroke" stroke={palette.surface} strokeWidth={size * 0.28} strokeLinejoin="round">
			{children}
		</text>
	);
};
