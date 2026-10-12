import React from 'react';
import type {VisualNode} from '../../Schemas/Visual';
import {useInk} from '../../Themes/ThemeContext';
import {Animated} from '../Animations/Animated';
import {DrawPath} from '../Animations/DrawPath';
import {Text} from '../Typography/Text';
import {DiagramNode} from './DiagramNode';

type CycleDiagramProps = {
	nodes: VisualNode[];
	center?: string;
	/** Edge length of the square the diagram is drawn in, in actual pixels. */
	size: number;
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

const pointOn = (center: number, radius: number, angle: number): [number, number] => [
	center + radius * Math.cos(angle),
	center + radius * Math.sin(angle),
];

/** Nodes on a circle, joined clockwise by arrows. For processes that repeat. */
export const CycleDiagram: React.FC<CycleDiagramProps> = ({nodes, center, size, focusLevels = [], delaySeconds = 0}) => {
	const ink = useInk();
	const middle = size / 2;
	const radius = size * 0.36;
	const step = (2 * Math.PI) / nodes.length;
	// Arcs stop short of the nodes they connect.
	const gap = Math.min(step * 0.34, 0.5);
	const nodeWidth = size * (nodes.length > 4 ? 0.27 : 0.31);
	const diagramFocus = Math.max(0, ...focusLevels);
	const head = size * 0.018;

	return (
		<div style={{position: 'relative', width: size, height: size, margin: '0 auto', flexShrink: 0}}>
			<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{position: 'absolute', inset: 0}}>
				{nodes.map((_, index) => {
					const from = START_ANGLE + index * step + gap;
					const to = START_ANGLE + (index + 1) * step - gap;
					const [x1, y1] = pointOn(middle, radius, from);
					const [x2, y2] = pointOn(middle, radius, to);
					const drawAt = delaySeconds + (index + 0.5) * NODE_INTERVAL_SECONDS;
					const tangent = (to * 180) / Math.PI + 90;
					return (
						<g key={index} stroke={ink.muted} strokeWidth={size * 0.006}>
							<DrawPath
								d={`M${x1.toFixed(2)} ${y1.toFixed(2)} A${radius} ${radius} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`}
								delaySeconds={drawAt}
								durationSeconds={0.4}
							/>
							<DrawPath
								d={`M${-head * 1.2} ${-head}L0 0L${-head * 1.2} ${head}`}
								transform={`translate(${x2.toFixed(2)} ${y2.toFixed(2)}) rotate(${tangent.toFixed(2)})`}
								delaySeconds={drawAt + 0.35}
								durationSeconds={0.15}
							/>
						</g>
					);
				})}
			</svg>
			{center ? (
				<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<Animated animation="fade" delaySeconds={delaySeconds} style={{maxWidth: radius * 1.1}}>
						<Text variant="subtitle" tone="emphasis" align="center" size={36}>
							{center}
						</Text>
					</Animated>
				</div>
			) : null}
			{nodes.map((node, index) => {
				const [x, y] = pointOn(middle, radius, START_ANGLE + index * step);
				return (
					<div key={index} style={{...ANCHOR, left: x, top: y}}>
						<Animated
							animation={{preset: 'scale', easing: 'overshoot'}}
							delaySeconds={delaySeconds + index * NODE_INTERVAL_SECONDS}
							style={{width: nodeWidth, flexShrink: 0}}
						>
							<DiagramNode node={node} index={index} focus={focusLevels[index] ?? 0} diagramFocus={diagramFocus} />
						</Animated>
					</div>
				);
			})}
		</div>
	);
};
