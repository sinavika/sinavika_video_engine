import React from 'react';
import {Img, staticFile} from 'remotion';
import {SPACING} from '../../Themes/DesignTokens';
import {ConceptMap} from '../Illustrations/ConceptMap';
import {CycleDiagram} from '../Illustrations/CycleDiagram';
import {FlowDiagram} from '../Illustrations/FlowDiagram';
import {Card} from '../Layouts/Card';
import {FitBox} from '../Layouts/FitBox';
import {useVideoLayout} from '../Layouts/VideoLayout';
import {MathExpression} from '../Typography/MathExpression';
import {Text} from '../Typography/Text';
import {MapVisual, TimelineVisual} from './HumanitiesVisuals';
import {GeometryVisual, PlotVisual} from './MathVisuals';
import {AtomVisual, ForcesVisual, MoleculeVisual, MotionVisual, ReactionVisual} from './ScienceVisuals';
import {ComparisonVisual, SentenceVisual, TableVisual, VennVisual} from './StructureVisuals';
import {useReveal, useVisualPalette, type VisualBoxProps} from './VisualFrame';
import type {CourseVisual as CourseVisualSpec} from './VisualSchemas';

const Picture: React.FC<VisualBoxProps & {visual: Extract<CourseVisualSpec, {kind: 'picture'}>}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const show = useReveal(delaySeconds, 0.5);
	const textHeight = u(visual.caption ? 96 : 52);
	return (
		<div style={{width, height, display: 'flex', flexDirection: 'column', gap: u(10), opacity: show}}>
			<Img src={staticFile(visual.src)} style={{width: '100%', height: height - textHeight, objectFit: 'contain', borderRadius: u(20)}} />
			{visual.caption ? <div style={{fontFamily: palette.fontBody, fontWeight: 600, fontSize: u(30), color: palette.ink, textAlign: 'center'}}>{visual.caption}</div> : null}
			<div style={{fontFamily: palette.fontBody, fontSize: u(20), color: palette.muted, textAlign: 'center'}}>{visual.credit}</div>
		</div>
	);
};

/**
 * Draws any course visual inside a box of `width` x `height` actual pixels.
 * The single switch over visual kinds: a new kind is a schema in
 * VisualSchemas, a component, and a case here.
 */
export const CourseVisual: React.FC<VisualBoxProps & {visual: CourseVisualSpec}> = ({visual, width, height, delaySeconds = 0}) => {
	const {u} = useVideoLayout();
	const box = {width, height, delaySeconds};
	switch (visual.kind) {
		case 'formula':
			return (
				<FitBox>
					<Card padding={SPACING.lg} elevated={false}>
						<Text size={72} align="center">
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
		case 'reaction':
			return <ReactionVisual visual={visual} {...box} />;
		case 'plot':
			return <PlotVisual visual={visual} {...box} />;
		case 'geometry':
			return <GeometryVisual visual={visual} {...box} />;
		case 'forces':
			return <ForcesVisual visual={visual} {...box} />;
		case 'motion':
			return <MotionVisual visual={visual} {...box} />;
		case 'molecule':
			return <MoleculeVisual visual={visual} {...box} />;
		case 'atom':
			return <AtomVisual visual={visual} {...box} />;
		case 'flow':
			return (
				<FitBox>
					<FlowDiagram nodes={visual.nodes} vertical={width / visual.nodes.length < u(250)} delaySeconds={delaySeconds} />
				</FitBox>
			);
		case 'cycle':
			return <CycleDiagram nodes={visual.nodes} center={visual.center} size={Math.min(width, height)} delaySeconds={delaySeconds} />;
		case 'timeline':
			return <TimelineVisual visual={visual} {...box} />;
		case 'map':
			return <MapVisual visual={visual} {...box} />;
		case 'sentence':
			return <SentenceVisual visual={visual} {...box} />;
		case 'comparison':
			return <ComparisonVisual visual={visual} {...box} />;
		case 'table':
			return <TableVisual visual={visual} {...box} />;
		case 'venn':
			return <VennVisual visual={visual} {...box} />;
		case 'conceptMap':
			return <ConceptMap center={visual.center} related={visual.related} width={width} height={height} delaySeconds={delaySeconds} />;
		case 'picture':
			return <Picture visual={visual} {...box} />;
	}
};
