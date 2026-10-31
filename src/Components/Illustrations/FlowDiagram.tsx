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
	/** Width of the whole row in actual pixels; side by side, titles shrink so their longest word fits its box. */
	width?: number;
};

const LABEL_SIZE = 30;
const MIN_LABEL_SIZE = 22;
/** Manrope 800 needs about 0.7 em a letter, with room for the focused step's 5% growth; a Turkish title is often one long word ("Sınırlayıcıyla", KIM 7). */
const LETTER_EM = 0.7;

/**
 * Title size of side-by-side steps: 30, or less when the longest word of any title would run past its box's
 * padding; never below 22. In design units, as `u` takes them.
 */
const flowLabelSize = (labels: readonly string[], rowWidth: number, unit: number, paddingDesign: number, arrowDesign: number) => {
	const count = labels.length;
	const nodeWidth = (rowWidth - (count - 1) * arrowDesign * unit) / count;
	const inner = nodeWidth - 2 * paddingDesign * unit;
	const longest = Math.max(1, ...labels.flatMap((label) => label.replace(/[*_$]/g, '').split(/\s+/)).map((word) => word.length));
	return Math.max(MIN_LABEL_SIZE, Math.min(LABEL_SIZE, inner / (longest * LETTER_EM * unit)));
};

const NODE_INTERVAL_SECONDS = 0.35;

/** Steps in order, joined by arrows that are drawn as each step appears. */
export const FlowDiagram: React.FC<FlowDiagramProps> = ({nodes, focusLevels = [], vertical = false, delaySeconds = 0, width}) => {
	const ink = useInk();
	const {u} = useVideoLayout();
	const diagramFocus = Math.max(0, ...focusLevels);
	// An arrow takes 52 and the gaps on its sides; a node pads its text by SPACING.md.
	const labelSize = !vertical && width ? flowLabelSize(nodes.map((node) => node.label), width, u(1), SPACING.md, 52 + 2 * SPACING.xs) : LABEL_SIZE;

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
								// In a column the arrows run under the step numbers, like a numbered list.
								style={vertical ? {alignSelf: 'flex-start', marginLeft: u(SPACING.md + 8), flexShrink: 0} : {alignSelf: 'center', flexShrink: 0}}
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
								// Side by side, the steps start at the same height: numbers and titles form one line. In a column each
								// step is one row (number beside its text), so a short box does not shrink the text (30 Oct 2026).
								align={vertical ? 'row' : 'start'}
								labelSize={labelSize}
								style={{flex: 1, minWidth: 0}}
							/>
						</Animated>
					</React.Fragment>
				);
			})}
		</div>
	);
};
