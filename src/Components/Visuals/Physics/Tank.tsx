import React from 'react';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {useReveal, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part} from '../VisualTimeline';

type Tank = Extract<CourseVisual, {kind: 'tank'}>;

const LIQUID_COLOURS = {water: '#5AA9E6', oil: '#E8B04A', mercury: '#9AA5B1'} as const;

/** The half width of a vessel at height share y (0 bottom, 1 top), as a share of its slot: straight, wider or narrower at the top. */
export const vesselHalfWidth = (shape: 'straight' | 'flared' | 'tapered', y: number): number => {
	const bottom = shape === 'flared' ? 0.18 : shape === 'tapered' ? 0.38 : 0.28;
	const top = shape === 'flared' ? 0.4 : shape === 'tapered' ? 0.14 : 0.28;
	return bottom + (top - bottom) * y;
};

/**
 * Liquid pressure: vessels of different shapes side by side, filled to the same level (so the pressure at the
 * bottom is the same whatever the shape), optionally joined at the bottom, with liquid layers and marked points
 * at given depths. The liquid rises into place; the points come after it.
 */
export const TankVisual: React.FC<VisualBoxProps & {visual: Tank}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const fill = useReveal(delaySeconds + 0.3, 1.4);
	const marks = useReveal(delaySeconds + 1.6, 0.5);
	const fontSize = u(32);
	const slot = width / visual.vessels.length;
	const top = height * 0.12;
	const bottom = height * (visual.connected ? 0.8 : 0.9);
	const yAt = (share: number) => bottom - (bottom - top) * share;
	// Layers from the bottom: an unset height fills up to the level.
	let floor = 0;
	const layers = visual.layers.map((layer) => {
		const from = floor;
		const to = Math.min(visual.level, layer.height !== undefined ? from + layer.height : visual.level);
		floor = to;
		return {...layer, from, to};
	});
	const pipe = visual.connected ? {top: bottom, bottom: bottom + height * 0.07} : undefined;
	const wall = u(6);
	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontBody}}>
			{pipe ? (
				<g>
					<rect x={slot * 0.5} y={pipe.top} width={slot * (visual.vessels.length - 1)} height={(pipe.bottom - pipe.top) * fill} fill={LIQUID_COLOURS[layers[0].liquid]} />
					<path d={`M${slot * 0.5} ${pipe.bottom} L${slot * (visual.vessels.length - 0.5)} ${pipe.bottom}`} stroke={palette.ink} strokeWidth={wall} />
				</g>
			) : null}
			{visual.vessels.map((vessel, index) => {
				const centre = slot * (index + 0.5);
				const half = (share: number) => vesselHalfWidth(vessel.shape, share) * slot;
				const outline = `M${centre - half(1)} ${top} L${centre - half(0)} ${bottom} L${centre + half(0)} ${bottom} L${centre + half(1)} ${top}`;
				return (
					<Part key={index} id={`k${index + 1}`}>
						{(look) => (
							<g opacity={look.opacity}>
								{layers.map((layer, layerIndex) => {
									const from = layer.from * fill;
									const to = layer.to * fill;
									if (to <= from) return null;
									return <path key={layerIndex} d={`M${centre - half(from)} ${yAt(from)} L${centre - half(to)} ${yAt(to)} L${centre + half(to)} ${yAt(to)} L${centre + half(from)} ${yAt(from)} Z`} fill={LIQUID_COLOURS[layer.liquid]} opacity={0.9} />;
								})}
								<path d={outline} fill="none" stroke={palette.ink} strokeWidth={wall * look.scale} strokeLinejoin="round" strokeLinecap="round" />
								{vessel.label ? (
									<text x={centre} y={top - u(18)} textAnchor="middle" fill={palette.ink} fontSize={fontSize} fontWeight={800}>
										{vessel.label}
									</text>
								) : null}
							</g>
						)}
					</Part>
				);
			})}
			{/*
			 * Bodies over the vessels, so pointing at one never dims it with its vessel; the part under the surface
			 * takes a light tint of the liquid, so how deep it sits reads at a glance.
			 */}
			{visual.bodies.map((body, bodyIndex) => {
				const vesselIndex = Math.min(body.vessel, visual.vessels.length - 1);
				const here = visual.bodies.filter((other) => Math.min(other.vessel, visual.vessels.length - 1) === vesselIndex);
				const order = here.indexOf(body);
				const side = slot * 0.15 * body.size;
				const x = slot * (vesselIndex + 0.5) + (order - (here.length - 1) / 2) * slot * 0.2 - side / 2;
				const surfaceY = yAt(visual.level);
				const topY = body.submerged < 1 ? surfaceY - (1 - body.submerged) * side : body.at === 'bottom' ? bottom - wall / 2 - side : (surfaceY + bottom) / 2 - side / 2;
				const underFrom = Math.max(topY, surfaceY);
				return (
					<Part key={`b${bodyIndex}`} id={`b${bodyIndex + 1}`}>
						{(look) => (
							<g opacity={marks * look.opacity}>
								<rect x={x} y={topY} width={side} height={side} rx={u(6)} fill="#C98B4E" stroke={palette.ink} strokeWidth={u(4) * look.scale} />
								{underFrom < topY + side ? <rect x={x} y={underFrom} width={side} height={topY + side - underFrom} rx={u(4)} fill={LIQUID_COLOURS[layers[layers.length - 1].liquid]} opacity={0.35} /> : null}
								<text x={x + side / 2} y={topY + side / 2 + fontSize * 0.35} textAnchor="middle" fill="#FFFFFF" fontSize={fontSize * 0.9} fontWeight={800} stroke={palette.ink} strokeWidth={u(4)} paintOrder="stroke">
									{body.label}
								</text>
							</g>
						)}
					</Part>
				);
			})}
			{/* Layer names at the right edge of the last vessel. */}
			{layers.map((layer, index) =>
				layer.label ? (
					<text key={index} x={slot * (visual.vessels.length - 0.5) + vesselHalfWidth(visual.vessels[visual.vessels.length - 1].shape, (layer.from + layer.to) / 2) * slot + u(18)} y={yAt((layer.from + layer.to) / 2) + fontSize * 0.35} fill={palette.muted} fontSize={fontSize * 0.85} fontWeight={700} opacity={marks}>
						{layer.label}
					</text>
				) : null,
			)}
			{visual.points.map((point, index) => {
				const centre = slot * (Math.min(point.vessel, visual.vessels.length - 1) + 0.5);
				const y = yAt(visual.level - point.depth * visual.level);
				return (
					<Part key={`p${index}`} id={`p${index + 1}`}>
						{(look) => (
							<g opacity={marks * look.opacity}>
								<circle cx={centre} cy={y} r={u(11) * look.scale} fill={palette.brand} stroke={palette.surface} strokeWidth={u(4)} />
								<text x={centre + u(20)} y={y + fontSize * 0.35} fill={palette.ink} fontSize={fontSize} fontWeight={800} stroke={palette.surface} strokeWidth={u(6)} paintOrder="stroke">
									{point.label}
								</text>
							</g>
						)}
					</Part>
				);
			})}
			{/* The common surface level, dashed across all vessels. */}
			<line x1={slot * 0.08} x2={width - slot * 0.08} y1={yAt(visual.level)} y2={yAt(visual.level)} stroke={palette.muted} strokeWidth={u(2)} strokeDasharray={`${u(10)} ${u(8)}`} opacity={marks} />
		</svg>
	);
};
