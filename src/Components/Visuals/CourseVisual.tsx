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
import {EarthquakeVisual, RiverVisual} from './ProcessVisuals';
import {AtomVisual, ForcesVisual, MoleculeVisual, MotionVisual, ReactionVisual} from './ScienceVisuals';
import {DynamicsVisual, EquationVisual} from './SimulationVisuals';
import {ComparisonVisual, SentenceVisual, TableVisual, VennVisual} from './StructureVisuals';
import {FaultBlock3DVisual, Molecule3DVisual, SolidVisual} from './ThreeVisuals';
import {useReveal, useVisualPalette, type VisualBoxProps} from './VisualFrame';
import {BeatCamera, BeatNote, useElementState, useNoteSpace} from './VisualTimeline';
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

/** Highlight levels of steps n1, n2, … from the beats (flow and cycle diagrams take them as focusLevels). */
const useStepFocus = (count: number): number[] => {
	const levels: number[] = [];
	for (let index = 0; index < 6; index++) {
		// Always six hook calls, whatever the count, so the hook order never changes.
		const state = useElementState(`n${index + 1}`);
		if (index < count) levels.push(state.emphasis);
	}
	return levels;
};

/**
 * Draws any course visual inside a box of `width` x `height` actual pixels,
 * with the camera of the card's beats (zoom, notes) around it.
 */
export const CourseVisual: React.FC<VisualBoxProps & {visual: CourseVisualSpec}> = ({visual, width, height, delaySeconds}) => {
	const noteSpace = useNoteSpace();
	const available = height - noteSpace;
	// Drawings made in a fixed world (processes, simulations) get a box of their own proportions, so the camera's
	// fractions are fractions of the drawing and not of empty margins.
	const ratio = WORLD_RATIO[visual.kind];
	const box = ratio ? (width / available > ratio ? {width: available * ratio, height: available} : {width, height: width / ratio}) : {width, height: available};
	return (
		<div style={{width, height, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
			<BeatCamera width={box.width} height={box.height}>
				<VisualOfKind visual={visual} width={box.width} height={box.height} delaySeconds={delaySeconds} />
			</BeatCamera>
			<BeatNote />
		</div>
	);
};

/** Width / height of the visuals drawn in a fixed 1000 x 600 world. */
const WORLD_RATIO: Partial<Record<CourseVisualSpec['kind'], number>> = {river: 5 / 3, earthquake: 5 / 3, dynamics: 5 / 3, equation: 5 / 3};

/**
 * The single switch over visual kinds: a new kind is a schema in
 * VisualSchemas, a component, and a case here.
 */
const VisualOfKind: React.FC<VisualBoxProps & {visual: CourseVisualSpec}> = ({visual, width, height, delaySeconds = 0}) => {
	const {u} = useVideoLayout();
	const stepFocus = useStepFocus('nodes' in visual ? visual.nodes.length : 0);
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
					<FlowDiagram nodes={visual.nodes} focusLevels={stepFocus} vertical={width / visual.nodes.length < u(250)} delaySeconds={delaySeconds} />
				</FitBox>
			);
		case 'cycle':
			return <CycleDiagram nodes={visual.nodes} center={visual.center} focusLevels={stepFocus} size={Math.min(width, height)} delaySeconds={delaySeconds} />;
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
		case 'dynamics':
			return <DynamicsVisual visual={visual} {...box} />;
		case 'equation':
			return <EquationVisual visual={visual} {...box} />;
		case 'river':
			return <RiverVisual visual={visual} {...box} />;
		case 'earthquake':
			return visual.view === 'block3d' ? <FaultBlock3DVisual visual={visual} {...box} /> : <EarthquakeVisual visual={visual} {...box} />;
		case 'solid':
			return <SolidVisual visual={visual} {...box} />;
		case 'molecule3d':
			return <Molecule3DVisual visual={visual} {...box} />;
	}
};
