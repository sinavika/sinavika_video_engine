import React from 'react';
import {interpolateColors} from 'remotion';
import type {VisualNode} from '../../Schemas/Visual';
import {SPACING} from '../../Themes/DesignTokens';
import {InkProvider, useTheme} from '../../Themes/ThemeContext';
import {useVideoLayout} from '../Layouts/VideoLayout';
import {RichText} from '../Typography/RichText';
import {Text} from '../Typography/Text';

type DiagramNodeProps = {
	node: VisualNode;
	index: number;
	/** 0 to 1: how strongly this node is highlighted. */
	focus?: number;
	/** 0 to 1: how strongly some node in the diagram is highlighted; the rest step back. */
	diagramFocus?: number;
	style?: React.CSSProperties;
};

/** A numbered box shared by the flow and cycle diagrams. */
export const DiagramNode: React.FC<DiagramNodeProps> = ({node, index, focus = 0, diagramFocus = 0, style}) => {
	const {colors, shape, typography} = useTheme();
	const {u} = useVideoLayout();
	const chip = colors.categorical[index % colors.categorical.length];
	const lit = focus > 0.5;
	const ink = lit ? colors.onPrimary : colors.onSurface;

	return (
		<div
			style={{
				boxSizing: 'border-box',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				gap: u(SPACING.xs),
				padding: u(SPACING.md),
				borderRadius: u(shape.radius.md),
				border: `${u(Math.max(2, shape.borderWidth))}px solid ${colors.border}`,
				backgroundColor: interpolateColors(focus, [0, 1], [colors.surface, colors.primary]),
				opacity: 1 - 0.55 * diagramFocus * (1 - focus),
				transform: `scale(${(1 + 0.05 * focus).toFixed(4)})`,
				...style,
			}}
		>
			<div
				style={{
					width: u(44),
					height: u(44),
					borderRadius: '50%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					backgroundColor: lit ? colors.onPrimary : chip.fill,
					color: lit ? colors.primary : chip.on,
					fontFamily: typography.display,
					fontWeight: typography.displayWeight,
					fontSize: u(24),
					lineHeight: 1,
					flexShrink: 0,
				}}
			>
				{index + 1}
			</div>
			<InkProvider ink={{text: ink, muted: ink, emphasis: ink}}>
				<RichText text={node.label} size={30} weight={typography.strongWeight} align="center" />
				{node.detail ? (
					<Text size={24} align="center" style={{opacity: 0.78}}>
						{node.detail}
					</Text>
				) : null}
			</InkProvider>
		</div>
	);
};
