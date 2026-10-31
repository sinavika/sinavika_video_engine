import {z} from 'zod';
import {plainText} from '../../Schemas/RichText';
import {BIOLOGY_VISUALS, CELL_TYPE_PARTS, DIVISION_DEFAULT_STAGES, MEMBRANE_PARTS, TAXONOMY_LEVELS} from './Biology/BiologySchema';
import {CHEMISTRY_VISUALS} from './Chemistry/ChemistrySchema';
import {CLIMATE_PARTS, CONTOUR_PARTS, EARTH_PARTS, GEOGRAPHY_VISUALS, GEOTIME_PARTS, INTERIOR_PARTS, LANDFORM_PARTS, PLATE_PARTS, PYRAMID_PARTS, SPHERE_PARTS} from './Geography/GeographySchema';
import {HUMANITIES_VISUALS} from './Humanities/HumanitiesSchema';
import {LANGUAGE_VISUALS} from './Language/LanguageSchema';
import {LITERATURE_VISUALS} from './Literature/LiteratureSchema';
import {LOGIC_VISUALS} from './Logic/LogicSchema';
import {MATHEMATICS_VISUALS, ParameterName} from './Mathematics/MathematicsSchema';
import {PHILOSOPHY_VISUALS} from './Philosophy/PhilosophySchema';
import {PHYSICS_VISUALS} from './Physics/PhysicsSchema';
import {processParts} from './Processes/ProcessCatalog';
import {PROCESS_VISUALS} from './Processes/ProcessSchema';
import {STRUCTURE_VISUALS} from './Structure/StructureSchema';
import {THREE_VISUALS} from './Three/ThreeSchema';

/**
 * The visuals of the education videos: what a card can show next to its
 * text. Each kind is one schema in its field's folder (Physics/PhysicsSchema.ts,
 * Biology/BiologySchema.ts …; shared parts in VisualSchemaPart.ts), joined here
 * into one union, and one component in CourseVisual.tsx; which lesson uses
 * which kinds is in Courses/CourseDesign (LESSON_VISUAL_KITS).
 *
 * Everything is data, drawn by the engine: formulas with KaTeX, plots and
 * maps with d3, molecules with SmilesDrawer. Nothing is a screenshot, so a
 * number in a solution and the number in its figure can never disagree.
 */

const Fraction = z.number().min(0).max(1);

/**
 * One beat of a card's visual: a sentence of the narration and what the figure
 * does while it is said (see VisualTimeline). Parts are named per visual:
 * plot curves c1, c2, c3, points p1…, segments s1…, `tangent`, `area`; vectors v1…; capillary tubes t1…; tank vessels k1…, points p1… and bodies b1…; charges objects o1… and forces f1…; circuit elements e1…; wave rows w1… and points p1…; optics rays r1…, objects o1…, elements m1…; lewis tokens t1…; geometry point ids,
 * sides by their ends ("AB"), polygons by their points ("ABC"), angles
 * "angle-A"; forces by label; flow and cycle steps n1…; timeline events e1…;
 * map highlights and markers by name; sentence word tiles w1… and links l1…;
 * paragraph sentences s1… and `topic`; concept map branches n1…; comparison columns c1… and their
 * items c1-1…; table rows r1… and columns col1….
 */
export const VisualBeatSchema = z.object({
	narration: z.string().trim().min(1).max(700),
	/** Parts that appear with this beat (and not before). */
	show: z.array(z.string().min(1).max(40)).max(10).default([]),
	/** Parts pointed at during this beat; everything else dims. Empty: nothing is singled out. */
	focus: z.array(z.string().min(1).max(40)).max(10).default([]),
	/** The camera: a part of the box as fractions [left, top, right, bottom]; null goes back to the whole figure. */
	zoom: z.tuple([Fraction, Fraction, Fraction, Fraction]).nullable().optional(),
	/** New values of the visual's coefficients, eased in while this beat is said. */
	params: z.partialRecord(ParameterName, z.number()).optional(),
	/** The stage of a process visual (river, earthquake, dynamics, equation, solid) this beat shows. */
	stage: z.number().int().min(0).max(12).optional(),
	/** A short line shown under the figure during the beat. */
	note: plainText(80).optional(),
	/** Sentence word tiles (w1…) that turn into their `swap` word while this beat is said. */
	swap: z.array(z.string().min(1).max(40)).max(6).default([]),
});

export type VisualBeat = z.infer<typeof VisualBeatSchema>;

export const CourseVisualSchema = z.discriminatedUnion('kind', [
	...MATHEMATICS_VISUALS,
	...CHEMISTRY_VISUALS,
	...PHYSICS_VISUALS,
	...BIOLOGY_VISUALS,
	...GEOGRAPHY_VISUALS,
	...THREE_VISUALS,
	...LITERATURE_VISUALS,
	...LOGIC_VISUALS,
	...PHILOSOPHY_VISUALS,
	...STRUCTURE_VISUALS,
	...HUMANITIES_VISUALS,
	...PROCESS_VISUALS,
	...LANGUAGE_VISUALS,
]);

export type CourseVisual = z.infer<typeof CourseVisualSchema>;

export type CourseVisualKind = CourseVisual['kind'];

export const COURSE_VISUAL_KINDS = CourseVisualSchema.options.map((option) => option.shape.kind.value) as CourseVisualKind[];

/**
 * Lays a circuit out in cell units: the chain runs along the top wire from left to right; a parallel group takes
 * as many cells as its longest branch plus room for its rails, its first branch on the top wire and the others
 * below it; the battery sits in the middle of the bottom wire.
 */
export const circuitLayout = (items: Extract<CourseVisual, {kind: 'circuit'}>['items']) => {
	const gap = 0.35;
	const widths = items.map((item) => ('parallel' in item ? Math.max(...item.parallel.map((branch) => branch.length)) + 0.7 : 1));
	const rows = Math.max(1, ...items.map((item) => ('parallel' in item ? item.parallel.length : 1)));
	const span = 0.6 + widths.reduce((total, width) => total + width, 0) + gap * (items.length - 1) + 0.6;
	// Height in cells: label room above, the rows of the tallest group, the bottom wire with the battery and its name.
	const tall = 0.55 + (rows - 1) * 0.9 + 1.25 + 0.65;
	return {widths, rows, span, gap, tall};
};

/**
 * Width over height of a visual whose shape is fixed by its coordinates (a geometry figure, an equal-scale
 * plot), or undefined for one that fills any box. A layout uses it to give a tall figure a tall box instead
 * of a wide band it would shrink into.
 */
export const naturalAspect = (visual: CourseVisual): number | undefined => {
	if (visual.kind === 'geometry') {
		const [minX, minY, maxX, maxY] = visual.view;
		return (maxX - minX) / (maxY - minY);
	}
	if (visual.kind === 'plot' && visual.equalScale) return (visual.x[1] - visual.x[0]) / (visual.y[1] - visual.y[0]);
	// A number line is a wide strip; each floating row of a system adds height (Mathematics/NumberLine).
	if (visual.kind === 'numberLine') return 1600 / (380 + 170 * Math.max(0, ...visual.intervals.map((interval) => interval.row)));
	// The unit circle is about square; with its graph beside it, a wide strip (Mathematics/UnitCircle).
	if (visual.kind === 'unitCircle') return visual.wave ? 2.4 : 1.15;
	if (visual.kind === 'transform') {
		const [minX, minY, maxX, maxY] = visual.view;
		return (maxX - minX) / (maxY - minY);
	}
	if (visual.kind === 'vectors') {
		const [minX, minY, maxX, maxY] = visual.view;
		return (maxX - minX) / (maxY - minY);
	}
	// The first twenty elements: 8 groups by 4 periods, with room for the group names and the trend arrows.
	if (visual.kind === 'periodic') return 1.6;
	if (visual.kind === 'optics') {
		const [minX, minY, maxX, maxY] = visual.view;
		return (maxX - minX) / (maxY - minY);
	}
	// Waves on a square grid: each row is about two amplitudes and a margin tall, plus room for its name.
	if (visual.kind === 'wave') {
		const largest = Math.max(...visual.rows.map((row) => row.amplitude));
		return visual.length / (visual.rows.length * (2 * largest + 2.5));
	}
	// The dynamics simulation is drawn on a 1000 × 600 stage (Physics/Dynamics); under a title it shrank to a strip.
	if (visual.kind === 'dynamics') return 1000 / 600;
	if (visual.kind === 'circuit') {
		const {span, tall} = circuitLayout(visual.items);
		return span / tall;
	}
	// A solid turns in a square-ish space of its own; under a title it shrank into a short band.
	if (visual.kind === 'solid') return 1.2;
	// A battle is a wide scene (Humanities/Battle: 1600 × 700) that takes the whole width under its title.
	if (visual.kind === 'battle' || visual.kind === 'process') return 1600 / 700;
	return undefined;
};

/**
 * The part names a beat may use on a visual whose parts are numbered (see
 * VisualBeatSchema) or have fixed names (spheres, earth), or null for visuals
 * whose parts are named by their content (plots, geometry, forces, maps). Used to reject a beat that points
 * at a part the visual does not have.
 */
export const numberedPartNames = (visual: CourseVisual): string[] | null => {
	const count = (prefix: string, length: number) => Array.from({length}, (_, index) => `${prefix}${index + 1}`);
	switch (visual.kind) {
		case 'sentence':
			return [...count('w', visual.parts.length), ...count('l', visual.links.length)];
		case 'paragraph':
			return ['topic', ...count('s', visual.sentences.length)];
		case 'comparison':
			return visual.columns.flatMap((column, index) => [`c${index + 1}`, ...count(`c${index + 1}-`, column.items.length)]);
		case 'table':
			return [...count('r', visual.rows.length), ...count('col', Math.max(visual.header.length, ...visual.rows.map((row) => row.length)))];
		case 'flow':
		case 'cycle':
			return count('n', visual.nodes.length);
		case 'conceptMap':
			return count('n', visual.related.length);
		case 'verses':
			return count('q', visual.items.length);
		case 'timeline':
			return count('e', visual.events.length);
		case 'battle':
			return [...count('u', visual.units.length), ...count('s', visual.stages.length)];
		case 'process':
			return processParts(visual.process);
		case 'picture':
			return visual.regions.map((region) => region.name);
		case 'matching':
			return count('p', visual.pairs.length);
		case 'lever':
			return [...count('f', visual.forces.length), ...count('a', visual.forces.length), 'pivot', 'weight', 'sum'];
		case 'centreOfMass':
			return [...count('b', visual.bodies.length), 'centre', 'coordinates'];
		case 'pulley':
			return ['ropes', 'load', 'f', 'pull', 'h'];
		case 'gears':
			return [...count('w', visual.wheels.length), 'turn', 'counts'];
		case 'kinematics':
			return [...count('b', visual.bodies.length), 'run', 'area'];
		case 'energyTrack':
			return ['body', 'bars', 'run'];
		case 'projectile':
			return ['body', 'path', 'components', 'strobe', 'apex', 'range', 'run'];
		case 'collision':
			return ['b1', 'b2', 'before', 'after', 'energy', 'run'];
		case 'electricField':
			return [...count('c', visual.charges.length), 'lines', 'equipotentials', ...count('p', visual.points.length)];
		case 'parallelPlates':
			return ['plates', 'field', 'particle', 'forces', 'run'];
		case 'magneticField':
			return ['field', 'body', 'force', 'run'];
		case 'induction':
			return ['magnet', 'ring', 'meter'];
		case 'circular':
			return [...count('b', visual.bodies.length), 'velocity', 'acceleration', 'run'];
		case 'kepler':
			return ['planet', 'sectors', 'run'];
		case 'oscillator':
			return ['body', 'velocity', 'acceleration', 'energy', 'reference', 'trace', 'marks', 'run'];
		case 'interference':
			return visual.mode === 'ripple' ? ['sources', 'crests', 'antinodes', 'nodes', ...count('p', visual.points.length), 'run'] : ['slits', 'screen', 'graph', 'width'];
		case 'doppler':
			return ['source', 'fronts', 'ahead', 'behind', 'run'];
		case 'bohr':
			return ['nucleus', 'orbits', 'levels', 'jump', 'photon', 'run'];
		case 'halfLife':
			return ['nuclei', 'count', 'graph', 'run'];
		case 'geneExpression':
			return visual.mode === 'transcription' ? ['dna', 'template', 'mrna', 'polymerase', 'run'] : ['mrna', 'ribosome', 'trna', 'peptide', 'run'];
		case 'nephron':
			return ['capsule', 'glomerulus', 'proximal', 'loop', 'distal', 'collecting', 'filtration', 'reabsorption', 'secretion', 'adh'];
		case 'circulation':
			return ['heart', 'lungs', 'body', 'small', 'big', 'cell', 'run'];
		case 'digestion':
			return [...count('s', visual.stations.length), ...count('r', visual.rows.length), 'run'];
		case 'sarcomere':
			return ['z', 'actin', 'myosin', 'a', 'i', 'h', 'relax', 'run'];
		case 'micelle':
			return ['fabric', 'oil', 'soap', 'wrap', 'lift'];
		case 'greenhouse':
			return ['sun', 'light', 'ground', 'infrared', 'gases', 'trapped', 'thermometer'];
		case 'tyndall':
			return ['laser', ...count('b', visual.beakers.length), 'beam', 'settle'];
		case 'phaseDiagram':
			return ['axes', 'regions', 'curves', 'triple', 'critical', 'path'];
		case 'titration':
			return ['burette', 'flask', 'curve', 'run', 'equivalence'];
		case 'stoichiometry':
			return ['reactants', 'react', 'products', 'result'];
		case 'intermolecular':
			return [...count('p', visual.panels.length), 'links'];
		case 'rutherford':
			return ['source', 'foil', 'screen', 'beam', 'atom'];
		case 'retrograde':
			return ['sun', 'earth', 'mars', 'sightline', 'sky', 'retro'];
		case 'trolley':
			return ['trolley', 'five', 'one', 'lever', 'switch', 'stay'];
		case 'theseus':
			return ['ship', 'replace', 'pile', 'second'];
		case 'emanation':
			return ['source', ...count('l', visual.levels.length)];
		case 'cave':
			return ['wall', 'prisoners', 'objects', 'fire', 'exit', 'outside', 'sun', 'freed'];
		case 'eye':
			return visual.mode === 'normal' ? ['eye', 'lens', 'retina', 'rays', 'focus', 'near', 'run'] : ['eye', 'lens', 'retina', 'rays', 'focus', 'glasses', 'run'];
		case 'feedback':
			return [...count('n', visual.nodes.length), ...count('h', visual.hormones.length), 'feedback', 'level', 'run'];
		case 'neuron':
			if (visual.mode === 'myelin') return ['plain', 'myelinated', 'run'];
			return visual.mode === 'synapse' ? ['terminal', 'vesicles', 'transmitters', 'receptors', 'post', 'enzyme', 'run'] : ['axon', 'charges', 'ions', 'probe', 'graph', 'threshold', 'run'];
		case 'distillation':
			return ['column', 'feed', 'gradient', ...count('f', visual.fractions.length)];
		case 'nuclear':
			if (visual.mode === 'chain') return ['g1', 'g2', 'g3', 'rods', 'count', 'run'];
			return visual.mode === 'fusion' ? ['reactants', 'product', 'neutron', 'energy', 'run'] : ['neutron', 'nucleus', 'fragments', 'neutrons', 'energy', 'run'];
		case 'photoelectric':
			return ['plate', 'light', 'electrons', 'graph', 'slope', 'run'];
		case 'orbitals':
			return ['boxes', 'electrons', 'config', 'count', 'run'];
		case 'solution':
			return [...count('b', visual.beakers.length), 'particles', 'bars', 'run'];
		case 'energyProfile':
			return ['curve', 'ea', 'dh', 'reverse', 'catalyst', 'ball', 'run'];
		case 'equilibrium':
			return ['axes', ...count('s', visual.species.length), 'event', 'rates', 'run'];
		case 'electrochemicalCell':
			return ['anode', 'cathode', 'wire', 'bridge', 'electrons', 'ions', 'meter', 'run'];
		case 'gas':
			return visual.mode === 'diffusion' ? ['tube', 'fronts', 'meet', 'run'] : ['container', 'particles', 'gauges'];
		case 'numberLine':
			return [...count('i', visual.intervals.length), ...count('p', visual.points.length)];
		case 'pie':
			return count('p', visual.slices.length);
		case 'transform':
			return count('s', visual.steps.length);
		case 'unitCircle':
			return [...count('a', visual.angles.length), ...(visual.signs ? ['q1', 'q2', 'q3', 'q4'] : []), ...visual.lines, ...(visual.wave ? ['wave'] : [])];
		case 'flipcards':
			return count('p', visual.cards.length);
		case 'spheres':
			return [...SPHERE_PARTS];
		case 'earth':
			return [...EARTH_PARTS[visual.view]];
		case 'contour':
			return [...CONTOUR_PARTS];
		case 'climate':
			return [...CLIMATE_PARTS];
		case 'interior':
			return [...INTERIOR_PARTS];
		case 'plates':
			return [...PLATE_PARTS];
		case 'geotime':
			return [...GEOTIME_PARTS];
		case 'landform':
			return [...LANDFORM_PARTS[visual.scene]];
		case 'pyramid':
			return [...PYRAMID_PARTS, ...count('p', visual.pyramids.length)];
		case 'cell':
			return [...CELL_TYPE_PARTS[visual.type]];
		case 'membrane':
			return [...MEMBRANE_PARTS, ...count('t', visual.transport.length)];
		case 'tonicity':
			return count('p', visual.media.length);
		case 'taxonomy':
			return [...TAXONOMY_LEVELS, 'egilim'];
		case 'division':
			return count('s', (visual.stages ?? DIVISION_DEFAULT_STAGES[visual.mode]).length);
		case 'punnett':
			return [...count('r', visual.rows.length), ...count('c', visual.columns.length), ...count('p', visual.phenotypes.length)];
		case 'poem':
			return [...count('l', visual.lines.length), 'kafiye', 'redif', 'durak', 'hece', 'sema', 'isaret'];
		case 'foodweb':
			return [...visual.organisms.map((organism) => organism.id), ...count('t', Math.max(...visual.organisms.map((organism) => organism.level)))];
		case 'trophic':
			return [...count('l', visual.levels.length), 'egilim'];
		case 'hierarchy':
			return [...count('l', visual.levels.length), ...count('g', visual.groups.length)];
		case 'opposition':
			return ['a', 'e', 'i', 'o', 'karsitlik', 'altkarsitlik', 'altiklik', 'celisiklik', 'deger'];
		case 'truthTable':
			return ['v', ...count('c', visual.columns.length), ...count('r', 2 ** visual.variables.length), 'isaret', 'sonuc'];
		case 'euler':
			return visual.pairs.length > 0 ? count('p', visual.pairs.length) : [...count('n', visual.nested.length), ...(visual.point ? ['nokta'] : []), ...(visual.conclusion ? ['sonuc'] : [])];
		case 'pedigree':
			return visual.people.map((person) => `p${person.id}`);
		case 'stack':
			return [...count('r', visual.rows.length), ...count('s', visual.series.length)];
		case 'quadrant':
			return [...count('i', visual.items.length), 'q1', 'q2', 'q3', 'q4'];
		case 'vectors':
			return count('v', visual.vectors.length);
		case 'capillary':
			return count('t', visual.tubes.length);
		case 'lewis':
			return count('t', visual.tokens.length);
		case 'optics':
			return [...count('r', visual.rays.length), ...count('o', visual.objects.length), ...count('m', visual.elements.length)];
		case 'wave':
			return [...count('w', visual.rows.length), ...count('p', visual.points.length)];
		case 'circuit':
			return count(
				'e',
				visual.items.reduce((total, item) => total + ('parallel' in item ? item.parallel.flat().length : 1), 0),
			);
		case 'charges':
			return [...count('o', visual.objects.length), ...count('f', visual.forces.length)];
		case 'tank':
			return [...count('k', visual.vessels.length), ...count('p', visual.points.length), ...count('b', visual.bodies.length)];
		case 'tree':
			return ['root', ...visual.branches.flatMap((branch, index) => [`b${index + 1}`, ...count(`b${index + 1}-`, branch.nodes.length)])];
		default:
			return null;
	}
};
