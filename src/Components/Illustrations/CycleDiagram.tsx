import React from 'react';
import type {VisualNode} from '../../Schemas/Visual';
import {useInk} from '../../Themes/ThemeContext';
import {Animated} from '../Animations/Animated';
import {DrawPath} from '../Animations/DrawPath';
import {useVideoLayout} from '../Layouts/VideoLayout';
import {Text} from '../Typography/Text';
import {DiagramNode} from './DiagramNode';

type CycleDiagramProps = {
	nodes: VisualNode[];
	center?: string;
	/** Edge length of the square the diagram is drawn in, in actual pixels. */
	size: number;
	/**
	 * The box the diagram may use. When it is wider than tall, the nodes sit on an ellipse that uses the width, so the
	 * top and bottom nodes keep room for two or three lines of detail instead of running out of the square.
	 */
	width?: number;
	height?: number;
	focusLevels?: number[];
	delaySeconds?: number;
};

const NODE_INTERVAL_SECONDS = 0.4;
const START_ANGLE = -Math.PI / 2;

/** Zero-size box that centres its child on a point, without using a transform. */
const ANCHOR: React.CSSProperties = {
	position: 'absolute',
	width: 0,
	height: 0,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
};

const pointOn = (cx: number, cy: number, rx: number, ry: number, angle: number): [number, number] => [cx + rx * Math.cos(angle), cy + ry * Math.sin(angle)];

/**
 * A node's drawn height, estimated from its text: DiagramNode's padding, number chip, a 30-unit label and a 24-unit
 * detail, wrapped at about 0.55 em per letter. Arcs use it to stop at the box's edge instead of a fixed angle.
 */
const nodeHalfHeight = (node: VisualNode, nodeWidth: number, u: (value: number) => number) => {
	const inner = Math.max(1, nodeWidth - u(32));
	const lines = (text: string, size: number) => Math.max(1, Math.ceil((text.replace(/\*\*/g, '').length * u(size) * 0.55) / inner));
	const detail = node.detail ? lines(node.detail, 24) * u(24) * 1.25 + u(8) : 0;
	return (u(32) + u(44) + u(8) + lines(node.label, 30) * u(30) * 1.2 + detail) / 2;
};

type Arrow = {d: string; x: number; y: number; angle: number};

/**
 * Five or six nodes in a wide box: a loop of two rows instead of an ellipse, the first half left to right along the
 * top, the rest right to left along the bottom, joined by straight arrows and a curve down the right side and up the
 * left. On an ellipse in a short box the side nodes of a five- or six-step cycle sat on top of each other.
 */
const loopLayout = (count: number, boxWidth: number, boxHeight: number, nodeWidth: number, maxHalf: number, gap: number) => {
	const top = Math.ceil(count / 2);
	const rowGap = Math.max(maxHalf + gap * 2, Math.min(boxHeight * 0.27, boxHeight / 2 - maxHalf - gap / 2));
	// The side curves bulge out by about 0.4 of the rows' distance (a cubic's reach): the end nodes stand that far in.
	const curve = rowGap * 2 * 0.42 + gap;
	const span = Math.max(nodeWidth, boxWidth - nodeWidth - 2 * (gap + curve));
	const left = (boxWidth - span) / 2;
	const xs = (k: number, inset: boolean) => Array.from({length: k}, (_, i) => (top === 1 ? boxWidth / 2 : left + ((i + (inset ? 0.5 : 0)) * span) / (top - 1)));
	const yTop = boxHeight / 2 - rowGap;
	const yBottom = boxHeight / 2 + rowGap;
	const topXs = xs(top, false);
	const bottomXs = xs(count - top, count - top < top).reverse();
	return {points: [...topXs.map((x) => [x, yTop] as [number, number]), ...bottomXs.map((x) => [x, yBottom] as [number, number])], top};
};

/** Nodes on a circle (or, five or more in a wide box, a two-row loop), joined clockwise by arrows. For processes that repeat. */
export const CycleDiagram: React.FC<CycleDiagramProps> = ({nodes, center, size, width = size, height = size, focusLevels = [], delaySeconds = 0}) => {
	const ink = useInk();
	const {u} = useVideoLayout();
	const boxWidth = Math.max(size, width);
	const boxHeight = Math.max(size, Math.min(height, width));
	const cx = boxWidth / 2;
	const cy = boxHeight / 2;
	// A circle in a square; in a wide box an ellipse, wider than tall, with wider nodes (fewer lines), so the top and
	// bottom nodes keep inside the box.
	const wide = boxWidth > boxHeight * 1.15;
	const loop = wide && nodes.length >= 5;
	// Four or fewer nodes in a wide box leave room for wider boxes, so labels and details wrap less.
	const nodeWidth = loop ? Math.min(boxWidth * 0.24, size * 0.46) : wide ? Math.min(boxWidth * (nodes.length <= 4 ? 0.24 : 0.2), size * 0.46) : size * (nodes.length > 4 ? 0.27 : 0.31);
	const rx = wide ? Math.min(boxWidth / 2 - nodeWidth * 0.6, boxHeight * 0.95) : size * 0.36;
	const ry = wide ? boxHeight * 0.28 : size * 0.36;
	const radius = Math.min(rx, ry);
	const step = (2 * Math.PI) / nodes.length;
	const margin = size * 0.02;
	const head = size * 0.018;
	const halves = nodes.map((node) => nodeHalfHeight(node, nodeWidth, u));
	const looped = loop ? loopLayout(nodes.length, boxWidth, boxHeight, nodeWidth, Math.max(...halves), margin * 2) : undefined;
	const at = (index: number): [number, number] => (looped ? looped.points[index] : pointOn(cx, cy, rx, ry, START_ANGLE + index * step));
	// Arcs start and stop just outside the boxes they connect: walk along the ellipse from a node's centre until the
	// point leaves its (estimated) box, so every arrow touches both nodes whatever their size and the box's shape.
	const leave = (index: number, direction: 1 | -1) => {
		const angle = START_ANGLE + index * step;
		const [nx, ny] = pointOn(cx, cy, rx, ry, angle);
		const halfWidth = nodeWidth / 2 + margin;
		const halfHeight = halves[index] + margin;
		for (let delta = 0.01; delta < step * 0.45; delta += 0.005) {
			const [x, y] = pointOn(cx, cy, rx, ry, angle + direction * delta);
			if (Math.abs(x - nx) > halfWidth || Math.abs(y - ny) > halfHeight) return angle + direction * delta;
		}
		return angle + direction * step * 0.45;
	};
	const arrow = (index: number): Arrow => {
		const next = (index + 1) % nodes.length;
		if (looped) {
			const [x1, y1] = at(index);
			const [x2, y2] = at(next);
			const edge = nodeWidth / 2 + margin;
			if (y1 === y2) {
				// Along a row: right on the top row, left on the bottom one.
				const sign = x2 > x1 ? 1 : -1;
				return {d: `M${(x1 + sign * edge).toFixed(2)} ${y1.toFixed(2)}L${(x2 - sign * edge).toFixed(2)} ${y2.toFixed(2)}`, x: x2 - sign * edge, y: y2, angle: sign > 0 ? 0 : 180};
			}
			// Down the right side or up the left: a curve out of one row's end node into the other row's end node.
			const side = y2 > y1 ? 1 : -1;
			const sx = x1 + side * edge;
			const ex = x2 + side * edge;
			const bulge = Math.abs(y2 - y1) * 0.55;
			const outer = side > 0 ? Math.max(sx, ex) + bulge : Math.min(sx, ex) - bulge;
			return {d: `M${sx.toFixed(2)} ${y1.toFixed(2)}C${outer.toFixed(2)} ${y1.toFixed(2)} ${outer.toFixed(2)} ${y2.toFixed(2)} ${ex.toFixed(2)} ${y2.toFixed(2)}`, x: ex, y: y2, angle: side > 0 ? 180 : 0};
		}
		const from = leave(index, 1);
		const to = leave(next, -1) + (index + 1 === nodes.length ? 2 * Math.PI : 0);
		const [x1, y1] = pointOn(cx, cy, rx, ry, from);
		const [x2, y2] = pointOn(cx, cy, rx, ry, to);
		// The arrowhead follows the ellipse's direction at its end.
		const tangent = (Math.atan2(ry * Math.cos(to), -rx * Math.sin(to)) * 180) / Math.PI;
		return {d: `M${x1.toFixed(2)} ${y1.toFixed(2)} A${rx} ${ry} 0 ${to - from > Math.PI ? 1 : 0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`, x: x2, y: y2, angle: tangent};
	};
	const diagramFocus = Math.max(0, ...focusLevels);

	return (
		<div style={{position: 'relative', width: boxWidth, height: boxHeight, margin: '0 auto', flexShrink: 0}}>
			<svg width={boxWidth} height={boxHeight} viewBox={`0 0 ${boxWidth} ${boxHeight}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
				{nodes.map((_, index) => {
					const {d, x, y, angle} = arrow(index);
					const drawAt = delaySeconds + (index + 0.5) * NODE_INTERVAL_SECONDS;
					return (
						<g key={index} stroke={ink.muted} strokeWidth={size * 0.006} fill="none">
							<DrawPath d={d} delaySeconds={drawAt} durationSeconds={0.4} />
							<DrawPath d={`M${-head * 1.2} ${-head}L0 0L${-head * 1.2} ${head}`} transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${angle.toFixed(2)})`} delaySeconds={drawAt + 0.35} durationSeconds={0.15} />
						</g>
					);
				})}
			</svg>
			{center ? (
				<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<Animated animation="fade" delaySeconds={delaySeconds} style={{maxWidth: looped ? boxWidth * 0.5 : wide ? rx * 0.9 : radius * 1.1}}>
						<Text variant="subtitle" tone="emphasis" align="center" size={36}>
							{center}
						</Text>
					</Animated>
				</div>
			) : null}
			{nodes.map((node, index) => {
				const [x, y] = at(index);
				return (
					<div key={index} style={{...ANCHOR, left: x, top: y}}>
						<Animated animation={{preset: 'scale', easing: 'overshoot'}} delaySeconds={delaySeconds + index * NODE_INTERVAL_SECONDS} style={{width: nodeWidth, flexShrink: 0}}>
							<DiagramNode node={node} index={index} focus={focusLevels[index] ?? 0} diagramFocus={diagramFocus} />
						</Animated>
					</div>
				);
			})}
		</div>
	);
};
