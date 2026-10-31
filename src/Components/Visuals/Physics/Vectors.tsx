import React from 'react';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {type LabelBox, placeLabel, segmentSpots} from '../Mathematics/FigureLabel';
import {useReveal, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {elementLook, useElementState} from '../VisualTimeline';
import {arrowHead} from './ArrowHead';

type Vectors = Extract<CourseVisual, {kind: 'vectors'}>;

/**
 * Vectors as arrows on a square grid, one square a unit, so equal vectors look equal and a doubled one twice as
 * long. The arrows grow from their tails one after another; each label stands beside its arrow where it covers
 * no other arrow.
 */
export const VectorsVisual: React.FC<VisualBoxProps & {visual: Vectors}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const [minX, minY, maxX, maxY] = visual.view;
	const margin = u(36);
	const unit = Math.min((width - 2 * margin) / (maxX - minX), (height - 2 * margin) / (maxY - minY));
	const left = (width - unit * (maxX - minX)) / 2;
	const top = (height - unit * (maxY - minY)) / 2;
	const at = ([x, y]: [number, number]): [number, number] => [left + (x - minX) * unit, top + (maxY - y) * unit];
	const grid = useReveal(delaySeconds, 0.5);
	const colours = {lesson: palette.lesson, brand: palette.brand, ink: palette.ink};
	const order: (keyof typeof colours)[] = ['lesson', 'brand', 'ink'];
	const fontSize = u(34);
	const stroke = Math.max(u(7), Math.min(u(11), unit * 0.1));
	const head = Math.max(u(24), Math.min(u(36), unit * 0.34));
	const ends = visual.vectors.map((vector) => [at(vector.from), at(vector.to)] as const);
	const lines = ends.flatMap(([from, to]) => {
		const count = Math.max(2, Math.ceil(Math.hypot(to[0] - from[0], to[1] - from[1]) / u(10)));
		return Array.from({length: count + 1}, (_, index) => [from[0] + ((to[0] - from[0]) * index) / count, from[1] + ((to[1] - from[1]) * index) / count] as [number, number]);
	});
	const taken: LabelBox[] = [];
	const labels = visual.vectors.map((vector, index) => {
		const [from, to] = ends[index];
		const place = placeLabel(segmentSpots(from, to, vector.label.length * fontSize * 0.62, fontSize, u(12)), lines, taken, [0, 0, width, height]);
		taken.push(place);
		return place;
	});
	const xs = Array.from({length: Math.floor(maxX) - Math.ceil(minX) + 1}, (_, index) => Math.ceil(minX) + index);
	const ys = Array.from({length: Math.floor(maxY) - Math.ceil(minY) + 1}, (_, index) => Math.ceil(minY) + index);
	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontBody}}>
			{visual.grid ? (
				<g opacity={grid} stroke={palette.grid} strokeWidth={u(2)}>
					{xs.map((x) => (
						<line key={`x${x}`} x1={at([x, minY])[0]} x2={at([x, maxY])[0]} y1={at([x, minY])[1]} y2={at([x, maxY])[1]} />
					))}
					{ys.map((y) => (
						<line key={`y${y}`} x1={at([minX, y])[0]} x2={at([maxX, y])[0]} y1={at([minX, y])[1]} y2={at([maxX, y])[1]} />
					))}
				</g>
			) : null}
			{visual.vectors.map((vector, index) => (
				<VectorArrow
					key={index}
					id={`v${index + 1}`}
					from={ends[index][0]}
					to={ends[index][1]}
					label={vector.label}
					labelAt={labels[index]}
					colour={colours[vector.colour ?? order[index % order.length]]}
					dashed={vector.dashed}
					delaySeconds={delaySeconds + 0.4 + index * 0.5}
					stroke={stroke}
					head={head}
					fontSize={fontSize}
				/>
			))}
		</svg>
	);
};

const VectorArrow: React.FC<{id: string; from: readonly [number, number]; to: readonly [number, number]; label: string; labelAt: LabelBox; colour: string; dashed: boolean; delaySeconds: number; stroke: number; head: number; fontSize: number}> = ({id, from, to, label, labelAt, colour, dashed, delaySeconds, stroke, head, fontSize}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const look = elementLook(useElementState(id));
	const grow = useReveal(delaySeconds, 0.5);
	const angle = Math.atan2(to[1] - from[1], to[0] - from[0]);
	const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
	// The shaft stops at the head's base so a thick line does not poke through the point.
	const shaft = Math.max(0, length * grow - head * 0.8);
	const tip = [from[0] + Math.cos(angle) * length * grow, from[1] + Math.sin(angle) * length * grow];
	return (
		<g opacity={grow <= 0 ? 0 : look.opacity}>
			<line x1={from[0]} y1={from[1]} x2={from[0] + Math.cos(angle) * shaft} y2={from[1] + Math.sin(angle) * shaft} stroke={colour} strokeWidth={stroke * look.scale} strokeLinecap="round" strokeDasharray={dashed ? `${u(16)} ${u(12)}` : undefined} />
			<path d={arrowHead(tip[0], tip[1], angle, head * look.scale)} fill={colour} />
			<circle cx={from[0]} cy={from[1]} r={stroke * 0.9} fill={colour} />
			<text x={(labelAt[0] + labelAt[2]) / 2} y={labelAt[3] - fontSize * 0.2} textAnchor="middle" fill={palette.ink} fontSize={fontSize} fontWeight={800} stroke={palette.surface} strokeWidth={u(6)} paintOrder="stroke" opacity={Math.min(1, grow * 1.5)}>
				{label}
			</text>
		</g>
	);
};
