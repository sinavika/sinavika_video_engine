import React from 'react';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {useReveal, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {elementLook, useElementState} from '../VisualTimeline';
import {arrowHead} from './ArrowHead';

type Forces = Extract<CourseVisual, {kind: 'forces'}>;

/** A force's direction in degrees (0 right, 90 up), relative to the surface where the direction names one. */
export const forceAngle = (force: Forces['forces'][number], surfaceDegrees: number): number => {
	switch (force.direction) {
		case 'weight':
		case 'down':
			return -90;
		case 'up':
			return 90;
		case 'right':
			return 0;
		case 'left':
			return 180;
		case 'normal':
			return 90 + surfaceDegrees;
		case 'upSlope':
			return surfaceDegrees;
		case 'downSlope':
			return 180 + surfaceDegrees;
		default:
			return force.angle ?? 0;
	}
};

/**
 * A free-body diagram: the body on its surface (flat or inclined) and the
 * forces on it as arrows from its centre, each growing out in turn with its
 * label at the tip. Directions given relative to the surface stay right when
 * the incline changes (the normal force perpendicular, friction along it);
 * arrow lengths are in proportion to the magnitudes.
 */
export const ForcesVisual: React.FC<VisualBoxProps & {visual: Forces}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const surfaceDegrees = visual.surface ?? 0;
	const tilt = (surfaceDegrees * Math.PI) / 180;
	const bodySize = Math.min(width, height) * 0.2;
	const maxArrow = Math.min(width, height) * 0.36;
	const scene = useReveal(delaySeconds, 0.5);
	const colours = [palette.lesson, palette.brand, palette.ink, palette.lesson, palette.brand, palette.ink];
	const pivot: [number, number] = [width / 2, height * 0.56 + bodySize / 2];
	const surfaceY = pivot[1];
	// The body sits on the incline: its centre is half its height away from the surface, perpendicular to it.
	const centre: [number, number] = [pivot[0] - (bodySize / 2) * Math.sin(tilt), pivot[1] - (bodySize / 2) * Math.cos(tilt)];
	const largest = Math.max(0, ...visual.forces.map((force) => force.magnitude ?? 0));
	const lengthOf = (force: Forces['forces'][number]) => maxArrow * (largest > 0 && force.magnitude ? Math.max(0.12, force.magnitude / largest) : (force.size ?? 0.6));

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<g opacity={scene} transform={`rotate(${-surfaceDegrees} ${pivot[0]} ${surfaceY})`}>
				{visual.surface !== null ? (
					<>
						<line x1={pivot[0] - width * 0.45} x2={pivot[0] + width * 0.45} y1={surfaceY} y2={surfaceY} stroke={palette.axis} strokeWidth={u(6)} />
						{Array.from({length: 14}, (_, index) => {
							const hx = pivot[0] - width * 0.45 + index * ((width * 0.9) / 13);
							return <line key={index} x1={hx} y1={surfaceY} x2={hx - u(18)} y2={surfaceY + u(22)} stroke={palette.grid} strokeWidth={u(4)} />;
						})}
					</>
				) : null}
				{visual.body === 'box' ? (
					<rect x={pivot[0] - bodySize / 2} y={surfaceY - bodySize} width={bodySize} height={bodySize} rx={u(10)} fill={palette.fill} stroke={palette.ink} strokeWidth={u(5)} />
				) : (
					<circle cx={pivot[0]} cy={surfaceY - bodySize / 2} r={bodySize / 2} fill={palette.fill} stroke={palette.ink} strokeWidth={u(5)} />
				)}
			</g>
			{visual.forces.map((force, index) => (
				<ForceArrow key={index} id={force.label} centre={centre} angle={(-forceAngle(force, surfaceDegrees) * Math.PI) / 180} length={lengthOf(force)} label={force.label} colour={colours[index]} delaySeconds={delaySeconds + 0.5 + index * 0.45} headSize={u(30)} stroke={u(9)} fontSize={u(40)} />
			))}
		</svg>
	);
};

const ForceArrow: React.FC<{id?: string; centre: [number, number]; angle: number; length: number; label: string; colour: string; delaySeconds: number; headSize: number; stroke: number; fontSize: number}> = ({id, centre, angle, length, label, colour, delaySeconds, headSize, stroke, fontSize}) => {
	// Dimming changes how strongly an arrow is drawn, never its length: the length is the force.
	const palette = useVisualPalette();
	const look = elementLook(useElementState(id));
	const grow = useReveal(delaySeconds, 0.5, 'overshoot');
	stroke *= look.scale;
	const tip = [centre[0] + Math.cos(angle) * length * grow, centre[1] + Math.sin(angle) * length * grow];
	const labelAt = [centre[0] + Math.cos(angle) * (length + fontSize * 1.1), centre[1] + Math.sin(angle) * (length + fontSize * 1.1)];
	return (
		<g opacity={grow <= 0 ? 0 : look.opacity}>
			<line x1={centre[0]} y1={centre[1]} x2={tip[0]} y2={tip[1]} stroke={colour} strokeWidth={stroke} strokeLinecap="round" />
			<path d={arrowHead(tip[0], tip[1], angle, headSize)} fill={colour} />
			<text x={labelAt[0]} y={labelAt[1] + fontSize * 0.35} fill={palette.ink} fontSize={fontSize} fontWeight={800} textAnchor="middle" opacity={Math.min(1, grow)}>
				{label}
			</text>
		</g>
	);
};
