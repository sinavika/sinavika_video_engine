import React from 'react';
import {interpolateColors} from 'remotion';
import type {VisualNode} from '../../Schemas/Visual';
import {SPACING} from '../../Themes/DesignTokens';
import {InkProvider, useTheme} from '../../Themes/ThemeContext';
import {useVideoLayout} from '../Layouts/VideoLayout';
import {RichText} from '../Typography/RichText';
import {Text} from '../Typography/Text';
import {UNFOCUSED_FADE} from '../Visuals/VisualTimeline';

type DiagramNodeProps = {
	node: VisualNode;
	index: number;
	/** 0 to 1: how strongly this node is highlighted. */
	focus?: number;
	/** 0 to 1: how strongly some node in the diagram is highlighted; the rest step back. */
	diagramFocus?: number;
	style?: React.CSSProperties;
	/**
	 * `start` lines the number, title and text up from the top, so the boxes of a row read across alike; a lone box
	 * centres them. `row` puts the number beside a left-aligned title and text: a step of a column (a vertical flow)
	 * then takes one line of height instead of three, so the column keeps a readable size in a short box.
	 */
	align?: 'center' | 'start' | 'row';
	/** Title size in design units (30); a crowded row passes less so a long word fits (FlowDiagram). */
	labelSize?: number;
};

/** A numbered box shared by the flow and cycle diagrams. */
export const DiagramNode: React.FC<DiagramNodeProps> = ({node, index, focus = 0, diagramFocus = 0, style, align = 'center', labelSize = 30}) => {
	const {colors, shape, typography} = useTheme();
	const {u} = useVideoLayout();
	// In a lesson's video the diagram speaks in the lesson's colour; elsewhere in the brand's (docs/CourseColors.md).
	const strong = colors.lesson ?? {fill: colors.primary, on: colors.onPrimary};
	const chip = colors.lesson ?? colors.categorical[index % colors.categorical.length];
	const lit = focus > 0.5;
	const ink = lit ? strong.on : colors.onSurface;
	const row = align === 'row';
	const textAlign = row ? 'left' : 'center';

	return (
		<div
			style={{
				boxSizing: 'border-box',
				display: 'flex',
				flexDirection: row ? 'row' : 'column',
				alignItems: 'center',
				justifyContent: align === 'start' || row ? 'flex-start' : 'center',
				gap: u(row ? SPACING.sm : SPACING.xs),
				padding: u(SPACING.md),
				borderRadius: u(shape.radius.md),
				border: `${u(Math.max(2, shape.borderWidth))}px solid ${colors.border}`,
				backgroundColor: interpolateColors(focus, [0, 1], [colors.surface, strong.fill]),
				opacity: 1 - UNFOCUSED_FADE * diagramFocus * (1 - focus),
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
					backgroundColor: lit ? strong.on : chip.fill,
					color: lit ? strong.fill : chip.on,
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
				{/* As wide as the box's content, so a word longer than the box shows as overflow and FitBox shrinks the diagram
				    (sized to its text, "cehennem" ran into the box's padding unseen, AYT Din 1). */}
				<div style={{display: 'flex', flexDirection: 'column', alignItems: row ? 'flex-start' : 'center', gap: u(SPACING.xs), minWidth: 0, alignSelf: row ? undefined : 'stretch'}}>
					<RichText text={node.label} size={labelSize} weight={typography.strongWeight} align={textAlign} />
					{node.detail ? (
						<Text size={Math.min(24, labelSize * 0.8)} align={textAlign} style={{opacity: 0.9}}>
							{node.detail}
						</Text>
					) : null}
				</div>
			</InkProvider>
		</div>
	);
};
