import React from 'react';
import type {Visual} from '../../Schemas/Visual';
import {SPACING} from '../../Themes/DesignTokens';
import {Card} from '../Layouts/Card';
import {FitBox} from '../Layouts/FitBox';
import {useVideoLayout} from '../Layouts/VideoLayout';
import {MathExpression} from '../Typography/MathExpression';
import {Text} from '../Typography/Text';
import {CycleDiagram} from './CycleDiagram';
import {FlowDiagram} from './FlowDiagram';
import {Picture} from './Picture';

type IllustrationProps = {
	visual: Visual;
	/** Box the illustration must fit in, in actual pixels. */
	width: number;
	height: number;
	focusLevels?: number[];
	delaySeconds?: number;
};

/** A flow reads left to right when there is room, top to bottom when the box is narrow. */
const isVerticalFlow = (nodeCount: number, width: number, unit: number): boolean => width / nodeCount < 250 * unit;

/** Height, in reference pixels, an illustration needs when its container has no fixed height. */
export const naturalIllustrationHeight = (visual: Visual, width: number, unit: number): number => {
	switch (visual.kind) {
		case 'flow':
			return isVerticalFlow(visual.nodes.length, width, unit) ? visual.nodes.length * 170 : 250;
		case 'cycle':
			return Math.min(620, width / unit);
		case 'formula':
			return visual.caption ? 290 : 220;
		case 'image':
			return 440;
	}
};

/** Draws any `Visual` inside a fixed box. The single switch over visual kinds. */
export const Illustration: React.FC<IllustrationProps> = ({visual, width, height, focusLevels, delaySeconds}) => {
	const {u, unit} = useVideoLayout();

	const body = () => {
		switch (visual.kind) {
			case 'flow':
				return (
					<FitBox>
						<FlowDiagram
							nodes={visual.nodes}
							vertical={isVerticalFlow(visual.nodes.length, width, unit)}
							focusLevels={focusLevels}
							delaySeconds={delaySeconds}
						/>
					</FitBox>
				);
			case 'cycle':
				return (
					<CycleDiagram
						nodes={visual.nodes}
						center={visual.center}
						size={Math.min(width, height)}
						focusLevels={focusLevels}
						delaySeconds={delaySeconds}
					/>
				);
			case 'formula':
				return (
					<FitBox>
						<Card padding={SPACING.lg} elevated={false}>
							<Text size={66} align="center">
								<MathExpression latex={visual.latex} display style={{margin: 0}} />
							</Text>
							{visual.caption ? (
								<Text tone="muted" align="center" size={30} style={{marginTop: u(SPACING.sm)}}>
									{visual.caption}
								</Text>
							) : null}
						</Card>
					</FitBox>
				);
			case 'image':
				return <Picture image={visual.image} height={height / unit} />;
		}
	};

	return (
		<div
			style={{
				width: '100%',
				maxWidth: width,
				height,
				alignSelf: 'center',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				flexShrink: 0,
			}}
		>
			{body()}
		</div>
	);
};
