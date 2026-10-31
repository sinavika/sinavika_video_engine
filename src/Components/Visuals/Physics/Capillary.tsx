import React from 'react';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {useReveal, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part} from '../VisualTimeline';

type Capillary = Extract<CourseVisual, {kind: 'capillary'}>;

/** How high (water) or how deep (mercury) the liquid stands in each tube, as a share of the largest change: inversely as the diameter. */
export const capillaryShares = (diameters: number[]): number[] => {
	const narrowest = Math.min(...diameters);
	return diameters.map((diameter) => narrowest / diameter);
};

/**
 * Capillarity: glass tubes of different inner diameters in a basin. Water climbs each tube with a concave
 * surface, mercury sinks with a convex one, inversely as the diameter; the levels move into place once the tubes
 * are in, so the difference is seen happening.
 */
export const CapillaryVisual: React.FC<VisualBoxProps & {visual: Capillary}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const water = visual.liquid === 'water';
	const liquid = water ? '#5AA9E6' : '#9AA5B1';
	const glass = palette.ink;
	const appear = useReveal(delaySeconds, 0.5);
	const settle = useReveal(delaySeconds + 0.8, 2.2);
	const fontSize = u(32);
	// The basin fills the lower part of the box; the tubes stand in it and reach high above it.
	const basin = {left: width * 0.1, right: width * 0.9, top: height * 0.62, bottom: height * 0.92};
	const surface = basin.top + (basin.bottom - basin.top) * 0.25;
	const largest = water ? surface - height * 0.12 - fontSize * 1.6 : (basin.bottom - surface) * 0.55;
	const shares = capillaryShares(visual.tubes.map((tube) => tube.diameter));
	const widest = Math.max(...visual.tubes.map((tube) => tube.diameter));
	const slot = (basin.right - basin.left) / visual.tubes.length;
	const tubeTop = height * 0.1;
	const wall = u(6);
	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontBody}}>
			<g opacity={appear}>
				<rect x={basin.left} y={surface} width={basin.right - basin.left} height={basin.bottom - surface} fill={liquid} opacity={0.85} />
				<path d={`M${basin.left} ${basin.top} L${basin.left} ${basin.bottom} L${basin.right} ${basin.bottom} L${basin.right} ${basin.top}`} fill="none" stroke={glass} strokeWidth={u(6)} strokeLinejoin="round" />
			</g>
			{visual.tubes.map((tube, index) => {
				const centre = basin.left + slot * (index + 0.5);
				const inner = Math.max(u(14), (slot * 0.42 * tube.diameter) / widest);
				const left = centre - inner / 2;
				const right = centre + inner / 2;
				const change = largest * shares[index] * settle;
				const level = water ? surface - change : surface + change;
				// Water's surface in the tube curves down in the middle (concave), mercury's bulges up (convex).
				// The curve never reaches past the outside level: in a wide tube the level barely moves and so does the curve.
				const bow = Math.min(inner * 0.35, u(22), Math.max(u(3), change * 0.8)) * (water ? 1 : -1);
				const meniscus = `M${left} ${level - bow * 0.5} Q${centre} ${level + bow} ${right} ${level - bow * 0.5}`;
				return (
					<Part key={index} id={`t${index + 1}`}>
						{(look) => (
							<g opacity={appear * look.opacity}>
								{/* In mercury the tube shows the basin's level above the sunk column as empty glass. */}
								{!water ? <rect x={left} y={surface - u(2)} width={inner} height={Math.max(0, level - bow * 0.5 - surface + u(2))} fill={palette.surface} /> : null}
								{/* The liquid in the tube, from its curved surface down into the basin. */}
								<path d={`${meniscus} L${right} ${basin.bottom - u(8)} L${left} ${basin.bottom - u(8)} Z`} fill={liquid} />
								<path d={meniscus} fill="none" stroke={water ? '#2B7BB9' : '#5F6B76'} strokeWidth={u(3)} />
								<line x1={left - wall / 2} y1={tubeTop} x2={left - wall / 2} y2={basin.bottom - u(18)} stroke={glass} strokeWidth={wall * look.scale} strokeLinecap="round" />
								<line x1={right + wall / 2} y1={tubeTop} x2={right + wall / 2} y2={basin.bottom - u(18)} stroke={glass} strokeWidth={wall * look.scale} strokeLinecap="round" />
								{tube.label ? (
									<text x={centre} y={tubeTop - u(16)} textAnchor="middle" fill={palette.ink} fontSize={fontSize} fontWeight={800}>
										{tube.label}
									</text>
								) : null}
							</g>
						)}
					</Part>
				);
			})}
			<g opacity={appear}>
				<line x1={basin.left - u(30)} x2={basin.right + u(30)} y1={surface} y2={surface} stroke={palette.muted} strokeWidth={u(2)} strokeDasharray={`${u(10)} ${u(8)}`} />
				<text x={basin.right + u(36)} y={surface + fontSize * 0.35} fill={palette.muted} fontSize={fontSize * 0.8} fontWeight={700}>
					{water ? 'su' : 'cıva'}
				</text>
			</g>
		</svg>
	);
};
