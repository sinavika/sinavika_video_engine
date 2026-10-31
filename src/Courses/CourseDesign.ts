import type {VideoFormatId} from '../Configurations/VideoFormats';
import type {SceneTransition} from '../Scenes/SceneTransition';
import type {ThemeId} from '../Themes/ThemeRegistry';
import type {CourseVisualKind} from '../Components/Visuals/VisualSchema';

/**
 * The design of the education videos, in one place: the counterpart of
 * BrandColors / BrandTypography for courses. Templates under
 * Templates/Courses read everything they lay out from here; nothing in them
 * names a size, a duration or a transition of its own.
 *
 * Colours are not here: the theme gives the brand colours and
 * COURSE_LESSON_COLORS (Configurations/LessonColors) the lesson's own.
 */
export const COURSE_DESIGN = {
	theme: 'SinavikaLight' satisfies ThemeId,
	fps: 30,
	formats: {
		/** The full lesson on YouTube. */
		lesson: 'Horizontal' satisfies VideoFormatId,
		/** The summary for Reels, TikTok and Shorts. */
		short: 'Vertical' satisfies VideoFormatId,
	},
	/**
	 * Target length in seconds. A lesson is at least ten minutes (owner's
	 * rule, 25 Oct 2026; also past YouTube's 8-minute mid-roll line) and runs
	 * longer when the topic needs it; it is never padded.
	 */
	length: {
		lesson: {min: 10 * 60, target: 12 * 60},
		/** A summary reel (CourseShort cards). */
		short: {min: 60, max: 120},
		/**
		 * A challenge reel (CampShort rounds). The 71–106 s camp reels of 26 Oct were
		 * judged to lose viewers in the first seconds and before the last question
		 * (outside review, 27 Oct 2026): at most three questions, under 30 s.
		 */
		challenge: {min: 18, max: 30},
	},
	/** The camp layer (Templates/Camps) on top of the lesson and the short. */
	camp: {
		/** The camp card at the start, under SinoAI's welcome: camp name, lesson number, the camp's progress. Its shortest time without voice. */
		cardSeconds: 6,
		/**
		 * Silent seconds to answer a round of a challenge reel, with a countdown. The choices are already on screen
		 * while the sentence and question are read (4–5 s), so this is extra time, not the only time: 3 s of silence
		 * per round was 16 % of a 75 s reel and the slowest moment of each round (owner, 26 Oct 2026). Quiz-reel guides
		 * give 3–5 s of total guessing time; ours stays above that counting the reading.
		 */
		roundThinkSeconds: 2,
		/**
		 * The shortest a round's answer stays after the voice. The answer and its
		 * one-line why are said in about 2 s; the old 3 s floor and longer whys left
		 * the card standing still for 6–8 s, the reels' deadest moment (27 Oct 2026).
		 */
		roundRevealSeconds: 1.6,
		/**
		 * Speaking rate of the course voice in a challenge reel, words per second
		 * with its pauses, measured on the 26 Oct Deyim ve Atasözü reel (1.86).
		 * Turkish words are long; 2.3 (the lesson estimate) promised 25 % too little.
		 */
		challengeWordsPerSecond: 1.9,
		/** A section title spoken on its own ("İkinci bölüm: Mecaz anlam.") holds at least this long, so it lands as a heading. */
		sectionTitleSeconds: 2.4,
		/** The camp task at the end is held at least this long so its items can be read. */
		taskSeconds: 8,
		/** Height of the chapter bar along the bottom of the lesson, in reference pixels. */
		chapterBarHeight: 10,
	},
	/**
	 * Between slides. A lesson is watched for ten minutes or more, so cuts are
	 * calm: cards cross-fade over 0.7 s (a 0.35 s push felt abrupt: owner,
	 * 25 Oct 2026), a new section slides up, and both ease in and out. Inside
	 * a slide things still move at their own pace. Both last as long, because
	 * scenes overlap by one transition length.
	 */
	transition: {
		/** Between cards inside a section. */
		card: {preset: 'fade', durationSeconds: 0.7} satisfies SceneTransition,
		/** Into a new section (and into the camp's own scenes). */
		section: {preset: 'slide', direction: 'from-bottom', durationSeconds: 0.7} satisfies SceneTransition,
	},
	/** Type sizes in reference pixels (1080 px short edge). */
	type: {
		cardTitle: 64,
		cardBody: 44,
		cardBodyShort: 50,
		sectionTitle: 112,
		label: 28,
		/** The sentence or expression a card is about. */
		example: 54,
	},
	/** How long a card stays without narration, in seconds: a fallback for previews only. */
	pacing: {
		cardSeconds: 6,
		minCardSeconds: 3,
		sectionSeconds: 3,
		/** Silent time to think after a question is read, with a countdown on screen (it used to be a floor that the voice always exceeded, so there was no pause). */
		questionThinkSeconds: 5,
		/**
		 * Shortest time of a beat's sentence. Short: a beat's line that stopped
		 * for 2.5 s before the next one was heard as the voice breaking off
		 * (owner, 25 Oct 2026). Long enough for the part to come in.
		 */
		beatSeconds: 1.2,
		/** Shortest time of a solution step. */
		stepSeconds: 2.5,
	},
	/** A card's text and its visual share the card; the visual gets this part of the width on horizontal video. */
	visualShare: 0.56,
	/**
	 * A figure whose shape is fixed (geometry, equal-scale plot) and narrower than this (width over height)
	 * stands beside the title and caption of a visual card on horizontal video instead of under them: under
	 * them it shrank into a band about 400 px high (29 Oct 2026).
	 */
	besideAspect: 1.7,
	/**
	 * The promotion at the end: shown, never spoken. Long videos close with
	 * the app; shorts point to the full lesson and the app.
	 */
	promotion: {lessonSeconds: 5, shortSeconds: 4},
} as const;

/**
 * Which visuals suit each lesson, best first. A script may use any visual
 * on any card; these lists are what script writing starts from, so each
 * lesson is taught in its own way instead of with the same text cards.
 */
export const LESSON_VISUAL_KITS: Record<string, readonly CourseVisualKind[]> = {
	TRK: ['sentence', 'paragraph', 'comparison', 'table', 'flow', 'conceptMap'],
	TDE: ['poem', 'sentence', 'verses', 'timeline', 'comparison', 'table', 'conceptMap', 'picture'],
	MAT: ['formula', 'plot', 'equation', 'geometry', 'solid', 'table', 'venn', 'flow'],
	GEO: ['geometry', 'solid', 'formula', 'plot', 'table'],
	FIZ: ['dynamics', 'forces', 'vectors', 'lever', 'centreOfMass', 'pulley', 'gears', 'kinematics', 'energyTrack', 'projectile', 'collision', 'electricField', 'parallelPlates', 'magneticField', 'induction', 'circular', 'kepler', 'retrograde', 'oscillator', 'interference', 'doppler', 'bohr', 'rutherford', 'halfLife', 'nuclear', 'photoelectric', 'motion', 'plot', 'capillary', 'tank', 'charges', 'circuit', 'wave', 'optics', 'formula', 'table', 'conceptMap', 'tree', 'flow'],
	KIM: ['micelle', 'greenhouse', 'tyndall', 'phaseDiagram', 'titration', 'stoichiometry', 'intermolecular', 'rutherford', 'orbitals', 'gas', 'solution', 'energyProfile', 'equilibrium', 'electrochemicalCell', 'distillation', 'nuclear', 'atom', 'periodic', 'lewis', 'molecule', 'molecule3d', 'reaction', 'plot', 'table', 'flow', 'cycle', 'stack', 'comparison', 'tree'],
	BIO: ['neuron', 'intermolecular', 'feedback', 'eye', 'sarcomere', 'digestion', 'circulation', 'nephron', 'geneExpression', 'cell', 'membrane', 'tonicity', 'taxonomy', 'division', 'punnett', 'pedigree', 'foodweb', 'trophic', 'cycle', 'flow', 'plot', 'table', 'tree', 'comparison', 'conceptMap', 'stack', 'picture'],
	TAR: ['timeline', 'map', 'battle', 'picture', 'flow', 'comparison', 'conceptMap'],
	TAR1: ['timeline', 'map', 'battle', 'picture', 'flow', 'comparison', 'conceptMap'],
	TAR2: ['timeline', 'map', 'battle', 'picture', 'flow', 'comparison', 'conceptMap'],
	COG: ['greenhouse', 'map', 'earth', 'contour', 'climate', 'interior', 'plates', 'geotime', 'landform', 'pyramid', 'stack', 'tree', 'quadrant', 'spheres', 'river', 'earthquake', 'cycle', 'flow', 'plot', 'table', 'comparison', 'conceptMap', 'picture'],
	COG1: ['map', 'river', 'earthquake', 'cycle', 'flow', 'plot', 'table', 'picture'],
	COG2: ['map', 'flow', 'table', 'plot', 'picture'],
	FEL: ['cave', 'emanation', 'theseus', 'trolley', 'retrograde', 'hierarchy', 'matching', 'flipcards', 'conceptMap', 'comparison', 'tree', 'table', 'paragraph', 'quadrant', 'flow', 'cycle', 'timeline', 'verses', 'picture'],
	PSI: ['conceptMap', 'flow', 'cycle', 'tree', 'comparison', 'hierarchy', 'matching', 'flipcards'],
	SOS: ['conceptMap', 'comparison', 'tree', 'stack', 'flow', 'table', 'hierarchy', 'matching', 'flipcards'],
	MAN: ['truthTable', 'table', 'opposition', 'euler', 'venn', 'flow', 'formula', 'tree', 'comparison', 'matching', 'flipcards'],
	DIN: ['verses', 'conceptMap', 'comparison', 'tree', 'table', 'paragraph', 'timeline', 'flow', 'map'],
	VAT: ['flow', 'conceptMap', 'timeline', 'table', 'comparison'],
	ING: ['sentence', 'comparison', 'table'],
	ALM: ['sentence', 'comparison', 'table'],
	ARA: ['sentence', 'comparison', 'table'],
	FRA: ['sentence', 'comparison', 'table'],
	RUS: ['sentence', 'comparison', 'table'],
};

/** For lessons without a kit: the general-purpose visuals. */
const DEFAULT_VISUAL_KIT: readonly CourseVisualKind[] = ['flow', 'comparison', 'table', 'conceptMap', 'formula'];

export const visualKitOf = (lessonCode: string): readonly CourseVisualKind[] => LESSON_VISUAL_KITS[lessonCode] ?? DEFAULT_VISUAL_KIT;
