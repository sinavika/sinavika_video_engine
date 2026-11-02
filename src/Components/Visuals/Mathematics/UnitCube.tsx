import React from 'react';
import {mixColors} from '../../../Themes/ColorPalette';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {solidColours} from '../Three/Solid';
import {useReveal, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {elementLook, useElementState} from '../VisualTimeline';

type Cubes = Extract<CourseVisual, {kind: 'cubes'}>;
type Point3 = readonly [number, number, number];

/**
 * Unit cubes in an isometric view from the front right and above: x runs to the lower right, y to the lower left, z
 * up. The plane shows a point as (screen x, screen y) with y growing downwards, before scaling.
 */
export const isoPoint = ([x, y, z]: Point3): [number, number] => [(x - y) * Math.cos(Math.PI / 6), (x + y) * 0.5 - z];

/** The three faces seen from the front right and above: the top (+z), the right (+x) and the left (+y), as corners. */
export const cubeFaces = ([x, y, z]: Point3): {top: Point3[]; right: Point3[]; left: Point3[]} => ({
	top: [[x, y, z + 1], [x + 1, y, z + 1], [x + 1, y + 1, z + 1], [x, y + 1, z + 1]],
	right: [[x + 1, y, z], [x + 1, y + 1, z], [x + 1, y + 1, z + 1], [x + 1, y, z + 1]],
	left: [[x, y + 1, z], [x + 1, y + 1, z], [x + 1, y + 1, z + 1], [x, y + 1, z + 1]],
});

/** Back to front: a cube nearer the viewer (larger x + y + z) is drawn later and covers the ones behind it. */
export const drawOrder = (cubes: readonly {at: Point3}[]): number[] =>
	cubes.map((_, index) => index).sort((a, b) => {
		const [p, q] = [cubes[a].at, cubes[b].at];
		return p[0] + p[1] + p[2] - (q[0] + q[1] + q[2]) || p[2] - q[2] || a - b;
	});

/**
 * Volume by counting: unit cubes laid out in layers, the way a prism's volume is taught (a base layer of a × b cubes,
 * c layers high). Each cube belongs to an optional `group`; a beat that shows the group drops its cubes into place, so a
 * block is built layer by layer. `dimensions` name the block's edges along x, y and z.
 */
export const UnitCubeVisual: React.FC<VisualBoxProps & {visual: Cubes}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const corners = visual.cubes.flatMap(({at: [x, y, z]}) => [isoPoint([x, y, z]), isoPoint([x + 1, y + 1, z]), isoPoint([x + 1, y, z + 1]), isoPoint([x, y + 1, z + 1]), isoPoint([x + 1, y + 1, z + 1]), isoPoint([x, y, z + 1])]);
	const xs = corners.map(([px]) => px);
	const ys = corners.map(([, py]) => py);
	const fontSize = u(34);
	const margin = fontSize * 2.4;
	const span = [Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys) + 1.5];
	const scale = Math.min((width - 2 * margin) / span[0], (height - 2 * margin) / span[1]);
	const offset = [(width - span[0] * scale) / 2 - Math.min(...xs) * scale, (height - (Math.max(...ys) - Math.min(...ys)) * scale) / 2 - Math.min(...ys) * scale];
	const toScreen = (point: Point3): [number, number] => {
		const [px, py] = isoPoint(point);
		return [offset[0] + px * scale, offset[1] + py * scale];
	};
	const drawn = useReveal(delaySeconds, 0.5);
	const colours = solidColours(palette.lesson);
	const sides = {top: colours.face, right: colours.alt, left: mixColors(colours.face, colours.alt, 0.55)};
	const most = (axis: 0 | 1 | 2) => Math.max(...visual.cubes.map((cube) => cube.at[axis])) + 1;
	const [mx, my, mz] = [most(0), most(1), most(2)];
	const labels: {text: string; at: [number, number]}[] = [];
	const [lx, ly, lz] = visual.dimensions;
	const gap = fontSize * 1.1;
	if (lx) {
		const [ax, ay] = toScreen([mx / 2, my, 0]);
		labels.push({text: lx, at: [ax - gap * 0.6, ay + gap * 0.9]});
	}
	if (ly) {
		const [ax, ay] = toScreen([mx, my / 2, 0]);
		labels.push({text: ly, at: [ax + gap * 0.6, ay + gap * 0.9]});
	}
	if (lz) {
		const [ax, ay] = toScreen([mx, 0, mz / 2]);
		labels.push({text: lz, at: [ax + gap, ay]});
	}
	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			{drawOrder(visual.cubes).map((index) => (
				<UnitCube key={index} cube={visual.cubes[index]} toScreen={toScreen} sides={sides} edge={colours.edge} strong={palette.lesson} drawn={drawn} strokeWidth={u(3)} />
			))}
			{labels.map((label) => (
				<text key={label.text} x={label.at[0]} y={label.at[1] + fontSize * 0.35} fill={palette.ink} fontSize={fontSize} fontWeight={800} textAnchor="middle" opacity={drawn}>
					{label.text}
				</text>
			))}
		</svg>
	);
};

/**
 * One cube. Its group (or, without one, the cube itself) comes in when a beat shows it: the cube drops from above
 * into its place; a beat that points at the group colours it in the lesson colour.
 */
const UnitCube: React.FC<{
	cube: Cubes['cubes'][number];
	toScreen: (point: Point3) => [number, number];
	sides: {top: string; right: string; left: string};
	edge: string;
	strong: string;
	drawn: number;
	strokeWidth: number;
}> = ({cube, toScreen, sides, edge, strong, drawn, strokeWidth}) => {
	const look = elementLook(useElementState(cube.group));
	const drop = (1 - look.appear) * 1.6;
	const [x, y, z] = cube.at;
	const faces = cubeFaces([x, y, z + drop]);
	const focus = look.scale > 1;
	const fill = (side: 'top' | 'right' | 'left') => (focus ? mixColors(sides[side], strong, 0.45) : cube.shade === 1 ? sides[side] : mixColors(sides[side], strong, cube.shade === 2 ? 0.2 : 0.4));
	const path = (corners: Point3[]) => corners.map((corner, index) => `${index === 0 ? 'M' : 'L'}${toScreen(corner).join(' ')}`).join(' ') + ' Z';
	return (
		<g opacity={drawn * look.opacity}>
			{(['left', 'right', 'top'] as const).map((side) => (
				<path key={side} d={path(faces[side])} fill={fill(side)} stroke={edge} strokeWidth={strokeWidth} strokeLinejoin="round" />
			))}
		</g>
	);
};
