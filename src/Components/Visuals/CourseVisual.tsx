import React from 'react';
import {SPACING} from '../../Themes/DesignTokens';
import {ConceptMap} from '../Illustrations/ConceptMap';
import {CycleDiagram} from '../Illustrations/CycleDiagram';
import {FlowDiagram} from '../Illustrations/FlowDiagram';
import {Card} from '../Layouts/Card';
import {FitBox} from '../Layouts/FitBox';
import {useVideoLayout} from '../Layouts/VideoLayout';
import {MathExpression} from '../Typography/MathExpression';
import {Text} from '../Typography/Text';
import {CellVisual} from './Biology/Cell';
import {DivisionVisual, divisionFrame} from './Biology/Division';
import {FoodWebVisual, foodWebLayout} from './Biology/FoodWeb';
import {MembraneVisual, MEMBRANE_STAGE} from './Biology/Membrane';
import {PedigreeVisual, pedigreeLayout} from './Biology/Pedigree';
import {PunnettVisual, punnettLayout} from './Biology/Punnett';
import {TaxonomyVisual, TAXONOMY_STAGE} from './Biology/Taxonomy';
import {TonicityVisual, tonicityStage} from './Biology/Tonicity';
import {TROPHIC_STAGE, TrophicVisual} from './Biology/Trophic';
import {HIERARCHY_STAGE, HierarchyVisual} from './Structure/Hierarchy';
import {EULER_STAGE, EulerVisual} from './Logic/Euler';
import {TRUTH_TABLE_STAGE, TruthTableVisual} from './Logic/TruthTable';
import {OPPOSITION_STAGE, OppositionVisual} from './Logic/Opposition';
import {AtomVisual} from './Chemistry/Atom';
import {LewisVisual} from './Chemistry/Lewis';
import {MoleculeVisual} from './Chemistry/Molecule';
import {PeriodicVisual} from './Chemistry/Periodic';
import {ReactionVisual} from './Chemistry/Reaction';
import {ClimateVisual} from './Geography/Climate';
import {ContourVisual} from './Geography/Contour';
import {EarthVisual} from './Geography/Earth';
import {EarthquakeVisual} from './Geography/Earthquake';
import {GeoTimeVisual} from './Geography/GeoTime';
import {InteriorVisual} from './Geography/Interior';
import {LandformVisual} from './Geography/Landform';
import {ProcessVisual} from './Processes/ProcessVisual';
import {PlatesVisual} from './Geography/Plates';
import {PyramidVisual} from './Geography/Pyramid';
import {RiverVisual} from './Geography/River';
import {SpheresVisual} from './Geography/Spheres';
import {BattleVisual} from './Humanities/Battle';
import {PictureVisual} from './Humanities/Picture';
import {MapVisual} from './Humanities/Map';
import {TimelineVisual} from './Humanities/Timeline';
import {VersesVisual} from './Humanities/Verses';
import {ParagraphVisual} from './Language/Paragraph';
import {SentenceVisual} from './Language/Sentence';
import {PoemVisual, poemLayout} from './Literature/Poem';
import {EquationVisual} from './Mathematics/Equation';
import {NumberLineVisual} from './Mathematics/NumberLine';
import {TransformVisual} from './Mathematics/Transform';
import {UnitCircleVisual} from './Mathematics/UnitCircle';
import {GeometryVisual} from './Mathematics/Geometry';
import {PlotVisual} from './Mathematics/Plot';
import {CapillaryVisual} from './Physics/Capillary';
import {ChargesVisual} from './Physics/Charges';
import {CircuitVisual} from './Physics/Circuit';
import {DynamicsVisual} from './Physics/Dynamics';
import {ForcesVisual} from './Physics/Forces';
import {MotionVisual} from './Physics/Motion';
import {OpticsVisual} from './Physics/Optics';
import {TankVisual} from './Physics/Tank';
import {LEVER_STAGE, LeverVisual} from './Physics/Lever';
import {CentreOfMassVisual} from './Physics/CentreOfMass';
import {PulleyVisual, pulleyStage} from './Physics/Pulley';
import {GearVisual} from './Physics/Gear';
import {MotionGraphVisual, motionGraphRatio} from './Physics/MotionGraph';
import {ENERGY_TRACK_STAGE, EnergyTrackVisual} from './Physics/EnergyTrack';
import {PROJECTILE_STAGE, ProjectileVisual} from './Physics/Projectile';
import {COLLISION_STAGE, CollisionVisual} from './Physics/Collision';
import {ElectricFieldVisual} from './Physics/ElectricField';
import {PARALLEL_PLATE_STAGE, ParallelPlateVisual} from './Physics/ParallelPlate';
import {MAGNETIC_STAGE, MagneticFieldVisual} from './Physics/MagneticField';
import {INDUCTION_STAGE, InductionVisual} from './Physics/Induction';
import {CIRCULAR_STAGE, CircularVisual} from './Physics/Circular';
import {KEPLER_STAGE, KeplerVisual} from './Physics/Kepler';
import {OscillatorVisual, oscillatorStage} from './Physics/Oscillator';
import {INTERFERENCE_STAGE, InterferenceVisual} from './Physics/Interference';
import {DOPPLER_STAGE, DopplerVisual} from './Physics/Doppler';
import {BOHR_STAGE, BohrVisual} from './Physics/Bohr';
import {HALF_LIFE_STAGE, HalfLifeVisual} from './Physics/HalfLife';
import {PHOTOELECTRIC_STAGE, PhotoelectricVisual} from './Physics/Photoelectric';
import {ORBITAL_STAGE, OrbitalVisual} from './Chemistry/Orbital';
import {GAS_STAGE, GasVisual} from './Chemistry/GasLaw';
import {SOLUTION_STAGE, SolutionVisual} from './Chemistry/Solution';
import {ENERGY_PROFILE_STAGE, EnergyProfileVisual} from './Chemistry/EnergyProfile';
import {EQUILIBRIUM_STAGE, EquilibriumVisual} from './Chemistry/Equilibrium';
import {ELECTRO_CELL_STAGE, ElectroCellVisual} from './Chemistry/ElectroCell';
import {CIRCULATION_STAGE, CirculationVisual} from './Biology/Circulation';
import {DIGESTION_STAGE, DigestionVisual} from './Biology/Digestion';
import {EYE_STAGE, EyeVisual} from './Biology/Eye';
import {CAVE_STAGE, CaveVisual} from './Philosophy/Cave';
import {EMANATION_STAGE, EmanationVisual} from './Philosophy/Emanation';
import {THESEUS_STAGE, TheseusVisual} from './Philosophy/Theseus';
import {TROLLEY_STAGE, TrolleyVisual} from './Philosophy/Trolley';
import {RETROGRADE_STAGE, RetrogradeVisual} from './Physics/Retrograde';
import {INTERMOLECULAR_STAGE, IntermolecularVisual} from './Chemistry/Intermolecular';
import {STOICHIOMETRY_STAGE, StoichiometryVisual} from './Chemistry/Stoichiometry';
import {TITRATION_STAGE, TitrationVisual} from './Chemistry/Titration';
import {PHASE_STAGE, PhaseDiagramVisual} from './Chemistry/PhaseDiagram';
import {TYNDALL_STAGE, TyndallVisual} from './Chemistry/Tyndall';
import {GREENHOUSE_STAGE, GreenhouseVisual} from './Chemistry/Greenhouse';
import {MICELLE_STAGE, MicelleVisual} from './Chemistry/Micelle';
import {RUTHERFORD_STAGE, RutherfordVisual} from './Chemistry/Rutherford';
import {GENE_STAGE, GeneExpressionVisual} from './Biology/GeneExpression';
import {FEEDBACK_STAGE, FeedbackVisual} from './Biology/Feedback';
import {NEPHRON_STAGE, NephronVisual} from './Biology/Nephron';
import {NEURON_STAGE, NeuronVisual} from './Biology/Neuron';
import {SARCOMERE_STAGE, SarcomereVisual} from './Biology/Sarcomere';
import {DISTILLATION_STAGE, DistillationVisual} from './Chemistry/Distillation';
import {NUCLEAR_STAGE, NuclearVisual} from './Physics/Nuclear';
import {VectorsVisual} from './Physics/Vectors';
import {WaveVisual} from './Physics/Wave';
import {ComparisonVisual} from './Structure/Comparison';
import {QuadrantVisual} from './Structure/Quadrant';
import {StackVisual, stackFrame} from './Structure/Stack';
import {FlipCardVisual} from './Structure/FlipCard';
import {MatchingVisual} from './Structure/Matching';
import {PieVisual} from './Structure/Pie';
import {TableVisual} from './Structure/Table';
import {TreeVisual, treeRatio} from './Structure/Tree';
import {VennVisual} from './Structure/Venn';
import {FaultBlock3DVisual} from './Three/FaultBlock3D';
import {Molecule3DVisual} from './Three/Molecule3D';
import {SolidVisual} from './Three/Solid';
import {useVisualPalette, type VisualBoxProps} from './VisualFrame';
import {CELL_STAGE} from './Biology/BiologySchema';
import type {CourseVisual as CourseVisualSpec} from './VisualSchema';
import {BeatCamera, BeatNote, useElementState, useNoteSpace} from './VisualTimeline';

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

/** The states of parts n1 … n6 from the beats: when each appears, stands out or dims (concept maps take them). */
const useStepStates = () => {
	const states: {appear: number; emphasis: number; dim: number}[] = [];
	// Always six hook calls, so the hook order never changes.
	for (let index = 0; index < 6; index++) states.push(useElementState(`n${index + 1}`));
	return states;
};

/**
 * Draws any course visual inside a box of `width` x `height` actual pixels,
 * with the camera of the card's beats (zoom, notes) around it.
 */
export const CourseVisual: React.FC<VisualBoxProps & {visual: CourseVisualSpec}> = ({visual, width, height, delaySeconds}) => {
	const noteSpace = useNoteSpace();
	const available = height - noteSpace;
	// Drawings made in a fixed world (processes, simulations) get a box of their own proportions, so the camera's
	// fractions are fractions of the drawing and not of empty margins. A stack and a tree follow their box.
	const boxAspect = width / Math.max(1, available);
	const ratio = visual.kind === 'stack' ? stackRatio(visual, boxAspect) : visual.kind === 'tree' ? treeRatio(visual, boxAspect) : worldRatio(visual);
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

/**
 * Sentences, paragraphs, comparisons and tables are drawn at reading size and then grow
 * to fill their box, up to this much (text reflows; nothing is cut). Without
 * it a short table sat small at the top of a large empty box.
 */
const LANGUAGE_VISUAL_GROWTH = 1.5;
/**
 * Tables grow further: a short table of names (six thinkers, six problems) has short cells, and at 1.5 it still sat
 * in the middle third of the card with small type. Wide tables stop at the box's width long before this.
 */
const TABLE_GROWTH = 1.9;

/**
 * Width / height of a visual drawn in a world of its own proportions, or undefined for one that fills any box. A few
 * set their own shape: a contour map without its profile is a wide strip, a wide tree a wide box, a poem as wide as its
 * longest line. A question's figure box uses it too, so a wide figure gets the panel's whole width.
 */
export const worldRatio = (visual: CourseVisualSpec): number | undefined => {
	switch (visual.kind) {
		case 'contour':
			return visual.profile ? WORLD_RATIO.contour : 1000 / 360;
		case 'tree':
			return treeRatio(visual);
		case 'tonicity':
			return tonicityStage(visual.media.length).width / tonicityStage(visual.media.length).height;
		case 'division':
			return divisionFrame(visual).width / divisionFrame(visual).height;
		case 'punnett':
			return punnettLayout(visual).width / punnettLayout(visual).height;
		case 'pedigree':
			return pedigreeLayout(visual).width / pedigreeLayout(visual).height;
		case 'foodweb':
			return foodWebLayout(visual).width / foodWebLayout(visual).height;
		case 'poem':
			return poemLayout(visual).width / poemLayout(visual).height;
		case 'pulley':
			return pulleyStage(visual.ropes).width / pulleyStage(visual.ropes).height;
		case 'kinematics':
			return motionGraphRatio(visual);
		case 'oscillator':
			return oscillatorStage(visual).width / oscillatorStage(visual).height;
		case 'electricField':
			return (visual.view[2] - visual.view[0]) / (visual.view[3] - visual.view[1]);
		default:
			return WORLD_RATIO[visual.kind];
	}
};

/** Width / height of the visuals drawn in a fixed 1000 x 600 world. */
/** A stack's box follows its rows and legend, widening with a wide card (StackVisual's frame). */
const stackRatio = (visual: Extract<CourseVisualSpec, {kind: 'stack'}>, boxAspect: number) => {
	const frame = stackFrame(visual.series, visual.rows.length, boxAspect);
	return frame.viewWidth / frame.viewHeight;
};

const WORLD_RATIO: Partial<Record<CourseVisualSpec['kind'], number>> = {river: 5 / 3, earthquake: 5 / 3, dynamics: 5 / 3, equation: 5 / 3, spheres: 5 / 3, earth: 5 / 3, contour: 5 / 3, climate: 5 / 3, interior: 5 / 3, plates: 5 / 3, geotime: 5 / 3, landform: 5 / 3, pyramid: 5 / 3, tree: 5 / 3, cell: CELL_STAGE.width / CELL_STAGE.height, membrane: MEMBRANE_STAGE.width / MEMBRANE_STAGE.height, taxonomy: TAXONOMY_STAGE.width / TAXONOMY_STAGE.height, trophic: TROPHIC_STAGE.width / TROPHIC_STAGE.height, hierarchy: HIERARCHY_STAGE.width / HIERARCHY_STAGE.height, opposition: OPPOSITION_STAGE.width / OPPOSITION_STAGE.height, euler: EULER_STAGE.width / EULER_STAGE.height, truthTable: TRUTH_TABLE_STAGE.width / TRUTH_TABLE_STAGE.height, quadrant: 5 / 3, battle: 1600 / 700, process: 1600 / 700, lever: LEVER_STAGE.width / LEVER_STAGE.height, energyTrack: ENERGY_TRACK_STAGE.width / ENERGY_TRACK_STAGE.height, projectile: PROJECTILE_STAGE.width / PROJECTILE_STAGE.height, collision: COLLISION_STAGE.width / COLLISION_STAGE.height, parallelPlates: PARALLEL_PLATE_STAGE.width / PARALLEL_PLATE_STAGE.height, magneticField: MAGNETIC_STAGE.width / MAGNETIC_STAGE.height, induction: INDUCTION_STAGE.width / INDUCTION_STAGE.height, circular: CIRCULAR_STAGE.width / CIRCULAR_STAGE.height, kepler: KEPLER_STAGE.width / KEPLER_STAGE.height, interference: INTERFERENCE_STAGE.width / INTERFERENCE_STAGE.height, doppler: DOPPLER_STAGE.width / DOPPLER_STAGE.height, bohr: BOHR_STAGE.width / BOHR_STAGE.height, halfLife: HALF_LIFE_STAGE.width / HALF_LIFE_STAGE.height, photoelectric: PHOTOELECTRIC_STAGE.width / PHOTOELECTRIC_STAGE.height, orbitals: ORBITAL_STAGE.width / ORBITAL_STAGE.height, gas: GAS_STAGE.width / GAS_STAGE.height, solution: SOLUTION_STAGE.width / SOLUTION_STAGE.height, energyProfile: ENERGY_PROFILE_STAGE.width / ENERGY_PROFILE_STAGE.height, equilibrium: EQUILIBRIUM_STAGE.width / EQUILIBRIUM_STAGE.height, electrochemicalCell: ELECTRO_CELL_STAGE.width / ELECTRO_CELL_STAGE.height, neuron: NEURON_STAGE.width / NEURON_STAGE.height, feedback: FEEDBACK_STAGE.width / FEEDBACK_STAGE.height, eye: EYE_STAGE.width / EYE_STAGE.height, sarcomere: SARCOMERE_STAGE.width / SARCOMERE_STAGE.height, digestion: DIGESTION_STAGE.width / DIGESTION_STAGE.height, circulation: CIRCULATION_STAGE.width / CIRCULATION_STAGE.height, nephron: NEPHRON_STAGE.width / NEPHRON_STAGE.height, geneExpression: GENE_STAGE.width / GENE_STAGE.height, distillation: DISTILLATION_STAGE.width / DISTILLATION_STAGE.height, nuclear: NUCLEAR_STAGE.width / NUCLEAR_STAGE.height, cave: CAVE_STAGE.width / CAVE_STAGE.height, emanation: EMANATION_STAGE.width / EMANATION_STAGE.height, theseus: THESEUS_STAGE.width / THESEUS_STAGE.height, trolley: TROLLEY_STAGE.width / TROLLEY_STAGE.height, retrograde: RETROGRADE_STAGE.width / RETROGRADE_STAGE.height, rutherford: RUTHERFORD_STAGE.width / RUTHERFORD_STAGE.height, intermolecular: INTERMOLECULAR_STAGE.width / INTERMOLECULAR_STAGE.height, stoichiometry: STOICHIOMETRY_STAGE.width / STOICHIOMETRY_STAGE.height, titration: TITRATION_STAGE.width / TITRATION_STAGE.height, phaseDiagram: PHASE_STAGE.width / PHASE_STAGE.height, tyndall: TYNDALL_STAGE.width / TYNDALL_STAGE.height, greenhouse: GREENHOUSE_STAGE.width / GREENHOUSE_STAGE.height, micelle: MICELLE_STAGE.width / MICELLE_STAGE.height};

/**
 * The single switch over visual kinds: a new kind is a schema in
 * its subject folder's <Field>Schema.ts, a component in the same folder, and a case here.
 */
const VisualOfKind: React.FC<VisualBoxProps & {visual: CourseVisualSpec}> = ({visual, width, height, delaySeconds = 0}) => {
	const {u} = useVideoLayout();
	const stepFocus = useStepFocus('nodes' in visual ? visual.nodes.length : 0);
	const stepStates = useStepStates();
	const palette = useVisualPalette();
	const box = {width, height, delaySeconds};
	switch (visual.kind) {
		case 'formula':
			// The box's width bounds the fit: without it the fit box grew to the formula's own width, so a long formula
			// (beside a rule's text, in a predict card) never shrank and ran out of its box. The card keeps the
			// formula's own width (a flex item does not shrink below it), so a short formula still sits in a small card.
			return (
				<FitBox style={{width, maxHeight: height}}>
					<div style={{display: 'flex', justifyContent: 'center'}}>
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
					</div>
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
		case 'vectors':
			return <VectorsVisual visual={visual} {...box} />;
		case 'lever':
			return <LeverVisual visual={visual} {...box} />;
		case 'centreOfMass':
			return <CentreOfMassVisual visual={visual} {...box} />;
		case 'pulley':
			return <PulleyVisual visual={visual} {...box} />;
		case 'gears':
			return <GearVisual visual={visual} {...box} />;
		case 'kinematics':
			return <MotionGraphVisual visual={visual} {...box} />;
		case 'energyTrack':
			return <EnergyTrackVisual visual={visual} {...box} />;
		case 'projectile':
			return <ProjectileVisual visual={visual} {...box} />;
		case 'collision':
			return <CollisionVisual visual={visual} {...box} />;
		case 'electricField':
			return <ElectricFieldVisual visual={visual} {...box} />;
		case 'parallelPlates':
			return <ParallelPlateVisual visual={visual} {...box} />;
		case 'magneticField':
			return <MagneticFieldVisual visual={visual} {...box} />;
		case 'induction':
			return <InductionVisual visual={visual} {...box} />;
		case 'circular':
			return <CircularVisual visual={visual} {...box} />;
		case 'kepler':
			return <KeplerVisual visual={visual} {...box} />;
		case 'oscillator':
			return <OscillatorVisual visual={visual} {...box} />;
		case 'interference':
			return <InterferenceVisual visual={visual} {...box} />;
		case 'doppler':
			return <DopplerVisual visual={visual} {...box} />;
		case 'bohr':
			return <BohrVisual visual={visual} {...box} />;
		case 'halfLife':
			return <HalfLifeVisual visual={visual} {...box} />;
		case 'photoelectric':
			return <PhotoelectricVisual visual={visual} {...box} />;
		case 'orbitals':
			return <OrbitalVisual visual={visual} {...box} />;
		case 'gas':
			return <GasVisual visual={visual} {...box} />;
		case 'solution':
			return <SolutionVisual visual={visual} {...box} />;
		case 'energyProfile':
			return <EnergyProfileVisual visual={visual} {...box} />;
		case 'equilibrium':
			return <EquilibriumVisual visual={visual} {...box} />;
		case 'electrochemicalCell':
			return <ElectroCellVisual visual={visual} {...box} />;
		case 'neuron':
			return <NeuronVisual visual={visual} {...box} />;
		case 'feedback':
			return <FeedbackVisual visual={visual} {...box} />;
		case 'eye':
			return <EyeVisual visual={visual} {...box} />;
		case 'cave':
			return <CaveVisual visual={visual} {...box} />;
		case 'emanation':
			return <EmanationVisual visual={visual} {...box} />;
		case 'theseus':
			return <TheseusVisual visual={visual} {...box} />;
		case 'trolley':
			return <TrolleyVisual visual={visual} {...box} />;
		case 'retrograde':
			return <RetrogradeVisual visual={visual} {...box} />;
		case 'micelle':
			return <MicelleVisual visual={visual} {...box} />;
		case 'greenhouse':
			return <GreenhouseVisual visual={visual} {...box} />;
		case 'tyndall':
			return <TyndallVisual visual={visual} {...box} />;
		case 'phaseDiagram':
			return <PhaseDiagramVisual visual={visual} {...box} />;
		case 'titration':
			return <TitrationVisual visual={visual} {...box} />;
		case 'stoichiometry':
			return <StoichiometryVisual visual={visual} {...box} />;
		case 'intermolecular':
			return <IntermolecularVisual visual={visual} {...box} />;
		case 'rutherford':
			return <RutherfordVisual visual={visual} {...box} />;
		case 'sarcomere':
			return <SarcomereVisual visual={visual} {...box} />;
		case 'digestion':
			return <DigestionVisual visual={visual} {...box} />;
		case 'circulation':
			return <CirculationVisual visual={visual} {...box} />;
		case 'nephron':
			return <NephronVisual visual={visual} {...box} />;
		case 'geneExpression':
			return <GeneExpressionVisual visual={visual} {...box} />;
		case 'distillation':
			return <DistillationVisual visual={visual} {...box} />;
		case 'nuclear':
			return <NuclearVisual visual={visual} {...box} />;
		case 'capillary':
			return <CapillaryVisual visual={visual} {...box} />;
		case 'tank':
			return <TankVisual visual={visual} {...box} />;
		case 'charges':
			return <ChargesVisual visual={visual} {...box} />;
		case 'circuit':
			return <CircuitVisual visual={visual} {...box} />;
		case 'wave':
			return <WaveVisual visual={visual} {...box} />;
		case 'optics':
			return <OpticsVisual visual={visual} {...box} />;
		case 'periodic':
			return <PeriodicVisual visual={visual} {...box} />;
		case 'lewis':
			return <LewisVisual visual={visual} {...box} />;
		case 'molecule':
			return <MoleculeVisual visual={visual} {...box} />;
		case 'atom':
			return <AtomVisual visual={visual} {...box} />;
		case 'flow':
			return (
				// Side room for the focused step, which grows a little and would otherwise be cut at the box's edge.
				<FitBox fill maxScale={LANGUAGE_VISUAL_GROWTH} style={{width, maxHeight: height, boxSizing: 'border-box', padding: `0 ${u(18)}px`}}>
					<FlowDiagram nodes={visual.nodes} focusLevels={stepFocus} vertical={width / visual.nodes.length < u(250)} delaySeconds={delaySeconds} width={width - 2 * u(18)} />
				</FitBox>
			);
		case 'cycle':
			return <CycleDiagram nodes={visual.nodes} center={visual.center} focusLevels={stepFocus} size={Math.min(width, height)} width={width} height={height} delaySeconds={delaySeconds} />;
		case 'timeline':
			return <TimelineVisual visual={visual} {...box} />;
		case 'battle':
			return <BattleVisual visual={visual} {...box} />;
		case 'process':
			return <ProcessVisual visual={visual} {...box} />;
		case 'map':
			return <MapVisual visual={visual} {...box} />;
		case 'sentence':
			return (
				<FitBox fill maxScale={LANGUAGE_VISUAL_GROWTH} style={{width, maxHeight: height}}>
					<SentenceVisual visual={visual} {...box} />
				</FitBox>
			);
		case 'paragraph':
			return (
				<FitBox fill maxScale={LANGUAGE_VISUAL_GROWTH} style={{width, maxHeight: height}}>
					<ParagraphVisual visual={visual} {...box} />
				</FitBox>
			);
		case 'comparison':
			return (
				<FitBox fill maxScale={LANGUAGE_VISUAL_GROWTH} style={{width, maxHeight: height}}>
					<ComparisonVisual visual={visual} {...box} />
				</FitBox>
			);
		case 'verses':
			return (
				<FitBox fill maxScale={LANGUAGE_VISUAL_GROWTH} style={{width, maxHeight: height}}>
					<VersesVisual visual={visual} {...box} />
				</FitBox>
			);
		case 'table':
			return (
				<FitBox fill maxScale={TABLE_GROWTH} style={{width, maxHeight: height}}>
					<TableVisual visual={visual} {...box} />
				</FitBox>
			);
		case 'venn':
			return <VennVisual visual={visual} {...box} />;
		case 'conceptMap':
			return (
				<ConceptMap
					center={visual.center}
					related={visual.related}
					width={width}
					height={height}
					delaySeconds={delaySeconds}
					accent={{fill: palette.lesson, on: palette.onLesson}}
					states={stepStates.slice(0, visual.related.length)}
				/>
			);
		case 'picture':
			return <PictureVisual visual={visual} {...box} />;
		case 'matching':
			return <MatchingVisual visual={visual} {...box} />;
		case 'flipcards':
			return <FlipCardVisual visual={visual} {...box} />;
		case 'dynamics':
			return <DynamicsVisual visual={visual} {...box} />;
		case 'equation':
			return <EquationVisual visual={visual} {...box} />;
		case 'numberLine':
			return <NumberLineVisual visual={visual} {...box} />;
		case 'pie':
			return <PieVisual visual={visual} {...box} />;
		case 'unitCircle':
			return <UnitCircleVisual visual={visual} {...box} />;
		case 'transform':
			return <TransformVisual visual={visual} {...box} />;
		case 'river':
			return <RiverVisual visual={visual} {...box} />;
		case 'spheres':
			return <SpheresVisual visual={visual} {...box} />;
		case 'earth':
			return <EarthVisual visual={visual} {...box} />;
		case 'contour':
			return <ContourVisual visual={visual} {...box} />;
		case 'climate':
			return <ClimateVisual visual={visual} {...box} />;
		case 'interior':
			return <InteriorVisual visual={visual} {...box} />;
		case 'cell':
			return <CellVisual visual={visual} {...box} />;
		case 'membrane':
			return <MembraneVisual visual={visual} {...box} />;
		case 'tonicity':
			return <TonicityVisual visual={visual} {...box} />;
		case 'taxonomy':
			return <TaxonomyVisual visual={visual} {...box} />;
		case 'division':
			return <DivisionVisual visual={visual} {...box} />;
		case 'punnett':
			return <PunnettVisual visual={visual} {...box} />;
		case 'pedigree':
			return <PedigreeVisual visual={visual} {...box} />;
		case 'foodweb':
			return <FoodWebVisual visual={visual} {...box} />;
		case 'poem':
			return <PoemVisual visual={visual} {...box} />;
		case 'trophic':
			return <TrophicVisual visual={visual} {...box} />;
		case 'hierarchy':
			return <HierarchyVisual visual={visual} {...box} />;
		case 'opposition':
			return <OppositionVisual visual={visual} {...box} />;
		case 'euler':
			return <EulerVisual visual={visual} {...box} />;
		case 'truthTable':
			return <TruthTableVisual visual={visual} {...box} />;
		case 'plates':
			return <PlatesVisual visual={visual} {...box} />;
		case 'geotime':
			return <GeoTimeVisual visual={visual} {...box} />;
		case 'landform':
			return <LandformVisual visual={visual} {...box} />;
		case 'pyramid':
			return <PyramidVisual visual={visual} {...box} />;
		case 'stack':
			return <StackVisual visual={visual} {...box} />;
		case 'tree':
			return <TreeVisual visual={visual} {...box} />;
		case 'quadrant':
			return <QuadrantVisual visual={visual} {...box} />;
		case 'earthquake':
			return visual.view === 'block3d' ? <FaultBlock3DVisual visual={visual} {...box} /> : <EarthquakeVisual visual={visual} {...box} />;
		case 'solid':
			return <SolidVisual visual={visual} {...box} />;
		case 'molecule3d':
			return <Molecule3DVisual visual={visual} {...box} />;
	}
};
