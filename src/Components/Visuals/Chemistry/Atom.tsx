import React from 'react';
import {BRAND_TYPOGRAPHY} from '../../../Configurations/BrandTypography';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';

type Atom = Extract<CourseVisual, {kind: 'atom'}>;

/**
 * An atom in the Bohr model: the nucleus with its proton and neutron count,
 * and the electrons on their shells, appearing shell by shell and slowly
 * turning.
 */
export const AtomVisual: React.FC<VisualBoxProps & {visual: Atom}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const seconds = useSceneSeconds();
	const size = Math.min(width, height);
	const centre = [width / 2, height / 2];
	const nucleus = size * 0.11;
	const gap = (size / 2 - nucleus - u(30)) / visual.shells.length;
	const core = useReveal(delaySeconds, 0.5, 'overshoot');

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			{visual.shells.map((count, shell) => (
				<AtomShell key={shell} centre={centre as [number, number]} radius={nucleus + gap * (shell + 1)} count={count} turn={seconds * (0.25 / (shell + 1))} delaySeconds={delaySeconds + 0.4 + shell * 0.35} electron={u(13)} stroke={u(3)} />
			))}
			<circle cx={centre[0]} cy={centre[1]} r={nucleus * core} fill={palette.lesson} />
			<text x={centre[0]} y={centre[1] - nucleus * 0.12} fill={palette.onLesson} fontSize={nucleus * 0.62} fontWeight={BRAND_TYPOGRAPHY.weights.kinetic} textAnchor="middle" opacity={core}>
				{visual.symbol}
			</text>
			<text x={centre[0]} y={centre[1] + nucleus * 0.5} fill={palette.onLesson} fontSize={nucleus * 0.26} fontWeight={700} textAnchor="middle" opacity={core}>
				{`${visual.protons}p${visual.neutrons !== undefined ? ` ${visual.neutrons}n` : ''}`}
			</text>
		</svg>
	);
};

const AtomShell: React.FC<{centre: [number, number]; radius: number; count: number; turn: number; delaySeconds: number; electron: number; stroke: number}> = ({centre, radius, count, turn, delaySeconds, electron, stroke}) => {
	const palette = useVisualPalette();
	const show = useReveal(delaySeconds, 0.4);
	return (
		<g opacity={show}>
			<circle cx={centre[0]} cy={centre[1]} r={radius} fill="none" stroke={palette.axis} strokeWidth={stroke} />
			{Array.from({length: count}, (_, index) => {
				const angle = (index / count) * Math.PI * 2 + turn;
				return <circle key={index} cx={centre[0] + Math.cos(angle) * radius} cy={centre[1] + Math.sin(angle) * radius} r={electron} fill={palette.brand} />;
			})}
		</g>
	);
};
