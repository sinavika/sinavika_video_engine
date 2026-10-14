import type {VideoFormatId} from '../Configurations/VideoFormats';
import type {SceneTransition} from '../Scenes/SceneTransition';
import type {ThemeId} from '../Themes/ThemeRegistry';
import type {CourseVisualKind} from '../Components/Visuals/VisualSchemas';

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
	/** Target length in seconds. Long videos may run over when the topic needs it; they are never padded. */
	length: {lesson: {min: 8 * 60, target: 10 * 60}, short: {min: 60, max: 120}},
	transition: {
		/** Between cards inside a section: the next card pushes in, as in the Reels. */
		card: {preset: 'slide', direction: 'from-right', durationSeconds: 0.35} satisfies SceneTransition,
		/** Into a new section. */
		section: {preset: 'slide', direction: 'from-bottom', durationSeconds: 0.45} satisfies SceneTransition,
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
	pacing: {cardSeconds: 6, minCardSeconds: 3, sectionSeconds: 3, questionThinkSeconds: 3},
	/** A card's text and its visual share the card; the visual gets this part of the width on horizontal video. */
	visualShare: 0.56,
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
	TRK: ['sentence', 'comparison', 'table', 'flow', 'conceptMap'],
	TDE: ['sentence', 'timeline', 'comparison', 'table', 'conceptMap', 'picture'],
	MAT: ['formula', 'plot', 'equation', 'geometry', 'solid', 'table', 'venn', 'flow'],
	GEO: ['geometry', 'solid', 'formula', 'plot', 'table'],
	FIZ: ['dynamics', 'forces', 'motion', 'plot', 'formula', 'flow'],
	KIM: ['atom', 'molecule', 'molecule3d', 'reaction', 'table', 'flow', 'cycle'],
	BIO: ['cycle', 'flow', 'picture', 'conceptMap', 'table', 'comparison'],
	TAR: ['timeline', 'map', 'picture', 'flow', 'comparison', 'conceptMap'],
	TAR1: ['timeline', 'map', 'picture', 'flow', 'comparison', 'conceptMap'],
	TAR2: ['timeline', 'map', 'picture', 'flow', 'comparison', 'conceptMap'],
	COG: ['map', 'river', 'earthquake', 'cycle', 'flow', 'plot', 'table', 'picture'],
	COG1: ['map', 'river', 'earthquake', 'cycle', 'flow', 'plot', 'table', 'picture'],
	COG2: ['map', 'flow', 'table', 'plot', 'picture'],
	FEL: ['conceptMap', 'comparison', 'flow', 'timeline'],
	PSI: ['conceptMap', 'flow', 'cycle', 'comparison'],
	SOS: ['conceptMap', 'comparison', 'flow', 'table'],
	MAN: ['table', 'venn', 'flow', 'formula'],
	DIN: ['conceptMap', 'comparison', 'timeline', 'flow'],
	VAT: ['flow', 'conceptMap', 'timeline', 'table', 'comparison'],
	ING: ['sentence', 'comparison', 'table'],
	ALM: ['sentence', 'comparison', 'table'],
	ARA: ['sentence', 'comparison', 'table'],
	FRA: ['sentence', 'comparison', 'table'],
	RUS: ['sentence', 'comparison', 'table'],
};

/** For lessons without a kit: the general-purpose visuals. */
export const DEFAULT_VISUAL_KIT: readonly CourseVisualKind[] = ['flow', 'comparison', 'table', 'conceptMap', 'formula'];

export const visualKitOf = (lessonCode: string): readonly CourseVisualKind[] => LESSON_VISUAL_KITS[lessonCode] ?? DEFAULT_VISUAL_KIT;
