import React from 'react';
import type {VisualNode} from '../../Schemas/Visual';
import {SPACING} from '../../Themes/DesignTokens';
import {useInk} from '../../Themes/ThemeContext';
import {Animated} from '../Animations/Animated';
import {DrawPath} from '../Animations/DrawPath';
import {useVideoLayout} from '../Layouts/VideoLayout';
import {DiagramNode} from './DiagramNode';

type FlowDiagramProps = {
	nodes: VisualNode[];
	/** Highlight level per node, 0 to 1. */
	focusLevels?: number[];
	vertical?: boolean;
	delaySeconds?: number;
};

const NODE_INTERVAL_SECONDS = 0.35;

/** Steps in order, joined by arrows that are drawn as each step appears. */
export const FlowDiagram: React.FC<FlowDiagramProps> = ({nodes, focusLevels = [], vertical = false, delaySeconds = 0}) => {
	const ink = useInk();
	const {u} = useVideoLayout();
	const diagramFocus = Math.max(0, ...focusLevels);

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: vertical ? 'column' : 'row',
				alignItems: 'stretch',
				gap: u(SPACING.xs),
			}}
		>
			{nodes.map((node, index) => {
				const enterAt = delaySeconds + index * NODE_INTERVAL_SECONDS;
				return (
					<React.Fragment key={index}>
						{index > 0 ? (
							<svg
								width={u(vertical ? 28 : 52)}
								height={u(vertical ? 44 : 28)}
								viewBox={vertical ? '0 0 28 44' : '0 0 52 28'}
								style={{alignSelf: 'center', flexShrink: 0}}
							>
								<DrawPath
									d={vertical ? 'M14 3V39M5 30l9 10 9-10' : 'M3 14H47M38 5l10 9-10 9'}
									stroke={ink.muted}
									strokeWidth={3.5}
									delaySeconds={enterAt - 0.15}
									durationSeconds={0.35}
								/>
							</svg>
						) : null}
						<Animated
							animation={{preset: 'scale', easing: 'overshoot'}}
							delaySeconds={enterAt}
							style={{flex: 1, minWidth: 0, display: 'flex'}}
						>
							<DiagramNode
								node={node}
								index={index}
								focus={focusLevels[index] ?? 0}
								diagramFocus={diagramFocus}
								style={{flex: 1, minWidth: 0}}
							/>
						</Animated>
					</React.Fragment>
				);
			})}
		</div>
	);
};
