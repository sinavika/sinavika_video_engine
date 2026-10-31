import React from 'react';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {useReveal, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {elementLook, Part, useElementState} from '../VisualTimeline';
import {arrowHead} from './ArrowHead';

type Optics = Extract<CourseVisual, {kind: 'optics'}>;

/**
 * A ray diagram on equal axes: mirrors (a short hatch marks the back), lenses as the textbook arrow symbol
 * (outward heads converge, inward diverge), a boundary between two shaded media, object and image arrows, and
 * rays drawn segment by segment, each segment with its arrowhead at the middle.
 */
export const OpticsVisual: React.FC<VisualBoxProps & {visual: Optics}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const [minX, minY, maxX, maxY] = visual.view;
	const margin = u(30);
	const unit = Math.min((width - 2 * margin) / (maxX - minX), (height - 2 * margin) / (maxY - minY));
	const left = (width - unit * (maxX - minX)) / 2;
	const top = (height - unit * (maxY - minY)) / 2;
	const at = (x: number, y: number): [number, number] => [left + (x - minX) * unit, top + (maxY - y) * unit];
	const appear = useReveal(delaySeconds, 0.5);
	const fontSize = u(32);
	const stroke = Math.max(u(4), unit * 0.05);
	const colours = {brand: palette.brand, lesson: palette.lesson, ink: palette.ink};
	const [axisLeft, axisY] = at(minX, 0);
	const [axisRight] = at(maxX, 0);
	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontBody}}>
			{visual.elements.map((element, index) =>
				element.kind === 'boundary' ? (
					<g key={`media${index}`} opacity={appear}>
						<rect x={at(minX, element.at)[0]} y={at(minX, element.at)[1]} width={(maxX - minX) * unit} height={(element.at - minY) * unit} fill="#5AA9E6" opacity={0.22} />
						{element.media ? (
							<g fill={palette.muted} fontSize={fontSize * 0.85} fontWeight={800}>
								<text x={at(minX, element.at)[0] + u(14)} y={at(minX, element.at)[1] - u(14)}>
									{element.media[0]}
								</text>
								<text x={at(minX, element.at)[0] + u(14)} y={at(minX, element.at)[1] + fontSize}>
									{element.media[1]}
								</text>
							</g>
						) : null}
					</g>
				) : null,
			)}
			{visual.axis ? <line x1={axisLeft} x2={axisRight} y1={axisY} y2={axisY} stroke={palette.muted} strokeWidth={u(2)} strokeDasharray={`${u(12)} ${u(8)}`} opacity={appear} /> : null}
			{visual.elements.map((element, index) => (
				<Part key={`m${index}`} id={`m${index + 1}`}>
					{(look) => {
						const colour = look.scale > 1 ? palette.brand : palette.ink;
						if (element.kind === 'boundary') {
							const [x1, y] = at(minX, element.at);
							const [x2] = at(maxX, element.at);
							return <line x1={x1} x2={x2} y1={y} y2={y} stroke={colour} strokeWidth={stroke * look.scale} opacity={appear * look.opacity} />;
						}
						const [x, yTop] = at(element.at, element.size / 2);
						const [, yBottom] = at(element.at, -element.size / 2);
						const half = (yBottom - yTop) / 2;
						const middle = yTop + half;
						let shape: React.ReactNode;
						if (element.kind === 'convergingLens' || element.kind === 'divergingLens') {
							const outward = element.kind === 'convergingLens';
							shape = (
								<g>
									<line x1={x} x2={x} y1={yTop} y2={yBottom} stroke={colour} strokeWidth={stroke * look.scale} />
									<path d={arrowHead(x, outward ? yTop : yTop + u(22), outward ? -Math.PI / 2 : Math.PI / 2, u(22))} fill={colour} />
									<path d={arrowHead(x, outward ? yBottom : yBottom - u(22), outward ? Math.PI / 2 : -Math.PI / 2, u(22))} fill={colour} />
								</g>
							);
						} else {
							// Mirrors face the light coming from the left; the back is hatched.
							const bulge = element.kind === 'concaveMirror' ? half * 0.28 : element.kind === 'convexMirror' ? -half * 0.28 : 0;
							const path = `M${x} ${yTop} Q${x + bulge * 2} ${middle} ${x} ${yBottom}`;
							const hatches = Array.from({length: 9}, (_, hatch) => {
								const y = yTop + ((yBottom - yTop) * (hatch + 0.5)) / 9;
								const share = (y - middle) / half;
								const xOnCurve = x + bulge * (1 - share * share);
								return <line key={hatch} x1={xOnCurve} y1={y} x2={xOnCurve + u(16)} y2={y - u(12)} stroke={colour} strokeWidth={u(3)} />;
							});
							shape = (
								<g>
									<path d={path} fill="none" stroke={colour} strokeWidth={stroke * 1.2 * look.scale} />
									{hatches}
								</g>
							);
						}
						return (
							<g opacity={appear * look.opacity}>
								{shape}
								{element.label ? (
									<text x={x} y={yTop - u(16)} textAnchor="middle" fill={palette.ink} fontSize={fontSize * 0.85} fontWeight={800}>
										{element.label}
									</text>
								) : null}
							</g>
						);
					}}
				</Part>
			))}
			{visual.points.map((point, index) => {
				const [x, y] = at(point.x, point.y);
				return (
					<g key={`pt${index}`} opacity={appear}>
						<circle cx={x} cy={y} r={u(8)} fill={palette.ink} />
						<text x={x} y={y + fontSize * 1.15} textAnchor="middle" fill={palette.ink} fontSize={fontSize * 0.9} fontWeight={800}>
							{point.label}
						</text>
					</g>
				);
			})}
			{visual.objects.map((object, index) => {
				const [x, base] = at(object.x, 0);
				const [, tip] = at(object.x, object.height);
				const direction = object.height >= 0 ? -1 : 1;
				return (
					<Part key={`o${index}`} id={`o${index + 1}`}>
						{(look) => (
							<g opacity={appear * look.opacity}>
								<line x1={x} x2={x} y1={base} y2={tip - direction * u(20)} stroke={palette.lesson} strokeWidth={stroke * 1.3 * look.scale} strokeDasharray={object.virtual ? `${u(12)} ${u(8)}` : undefined} />
								<path d={arrowHead(x, tip, direction < 0 ? -Math.PI / 2 : Math.PI / 2, u(24))} fill={palette.lesson} opacity={object.virtual ? 0.7 : 1} />
								{object.label ? (
									<text x={x + u(14)} y={tip + (direction < 0 ? -u(10) : fontSize)} fill={palette.lesson} fontSize={fontSize * 0.85} fontWeight={800}>
										{object.label}
									</text>
								) : null}
							</g>
						)}
					</Part>
				);
			})}
			{visual.rays.map((ray, index) => (
				<OpticsRay key={`r${index}`} id={`r${index + 1}`} points={ray.points.map(([x, y]) => at(x, y))} dashed={ray.dashed} arrows={ray.arrows} colour={colours[ray.colour]} stroke={stroke} delaySeconds={delaySeconds + 0.6 + index * 0.7} />
			))}
		</svg>
	);
};

const OpticsRay: React.FC<{id: string; points: [number, number][]; dashed: boolean; arrows: boolean; colour: string; stroke: number; delaySeconds: number}> = ({id, points, dashed, arrows, colour, stroke, delaySeconds}) => {
	const {u} = useVideoLayout();
	const look = elementLook(useElementState(id));
	const progress = useReveal(delaySeconds, 0.9);
	const lengths = points.slice(1).map((point, index) => Math.hypot(point[0] - points[index][0], point[1] - points[index][1]));
	const total = lengths.reduce((sum, length) => sum + length, 0) || 1;
	let drawn = progress * total;
	const segments = points.slice(1).map((point, index) => {
		const from = points[index];
		const share = Math.max(0, Math.min(1, drawn / (lengths[index] || 1)));
		drawn -= lengths[index];
		return {from, to: [from[0] + (point[0] - from[0]) * share, from[1] + (point[1] - from[1]) * share] as [number, number], full: point, share};
	});
	return (
		<g opacity={look.opacity}>
			{segments.map((segment, index) =>
				segment.share > 0 ? (
					<g key={index}>
						<line x1={segment.from[0]} y1={segment.from[1]} x2={segment.to[0]} y2={segment.to[1]} stroke={colour} strokeWidth={(dashed ? stroke * 0.7 : stroke) * look.scale} strokeDasharray={dashed ? `${u(12)} ${u(9)}` : undefined} strokeLinecap="round" />
						{arrows && !dashed && segment.share >= 0.55 ? (
							<path d={arrowHead((segment.from[0] + segment.full[0]) / 2 + (segment.full[0] - segment.from[0]) * 0.04, (segment.from[1] + segment.full[1]) / 2 + (segment.full[1] - segment.from[1]) * 0.04, Math.atan2(segment.full[1] - segment.from[1], segment.full[0] - segment.from[0]), u(20) * look.scale)} fill={colour} />
						) : null}
					</g>
				) : null,
			)}
		</g>
	);
};
