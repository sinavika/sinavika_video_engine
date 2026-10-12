import {z} from 'zod';
import {VoiceScriptSchema} from '../../../Scenes/Voiceover';
import {SceneTimingSchema, estimateReadingSeconds, resolveSceneSeconds} from '../../../Scenes/SceneDuration';
import {latex, plainText, richText} from '../../../Schemas/RichText';
import {OutroSchema} from '../../../Schemas/VideoProps';

export const QUICK_REVISION_MIN_SECONDS = 15;
export const QUICK_REVISION_MAX_SECONDS = 60;
const INTRO_SECONDS = 1.8;

export const RevisionCardSchema = z.discriminatedUnion('kind', [
	SceneTimingSchema.extend({kind: z.literal('fact'), text: richText(160)}),
	SceneTimingSchema.extend({
		kind: z.literal('formula'),
		title: plainText(50),
		latex: latex(160),
		note: richText(110).optional(),
	}),
	SceneTimingSchema.extend({kind: z.literal('term'), term: plainText(40), definition: richText(170)}),
	SceneTimingSchema.extend({kind: z.literal('warning'), text: richText(160)}),
]);

export type RevisionCard = z.infer<typeof RevisionCardSchema>;

const QuickRevisionShape = z.object({
	title: plainText(60),
	subject: plainText(40).optional(),
	cards: z.array(RevisionCardSchema).min(3).max(12),
	summary: z.array(richText(90)).min(1).max(4),
	/** Voice-over text per line id, replacing the automatic line. */
	script: VoiceScriptSchema,
	outro: OutroSchema,
});

type QuickRevisionShapeContent = z.infer<typeof QuickRevisionShape>;

const cardTexts = (card: RevisionCard): (string | undefined)[] => {
	switch (card.kind) {
		case 'fact':
		case 'warning':
			return [card.text];
		case 'formula':
			return [card.title, card.latex, card.note];
		case 'term':
			return [card.term, card.definition];
	}
};

/** Scene durations in seconds. Shared by the schema's length check and by the template. */
export const quickRevisionTimings = (content: QuickRevisionShapeContent) => {
	const cards = content.cards.map((card) =>
		resolveSceneSeconds(card, cardTexts(card), {baseSeconds: 1.3, minSeconds: 2.6, maxSeconds: 5}),
	);
	const recap = estimateReadingSeconds(content.summary, {baseSeconds: 2, minSeconds: 3, maxSeconds: 6});
	return {
		intro: INTRO_SECONDS,
		cards,
		recap,
		/** Length of the revision itself, without the brand outro. */
		total: INTRO_SECONDS + cards.reduce((sum, seconds) => sum + seconds, 0) + recap,
	};
};

/** A quick revision is a short-form video by definition, so its length is part of the contract. */
export const QuickRevisionSchema = QuickRevisionShape.superRefine((content, context) => {
	const {total} = quickRevisionTimings(content);
	if (total < QUICK_REVISION_MIN_SECONDS || total > QUICK_REVISION_MAX_SECONDS) {
		context.addIssue({
			code: 'custom',
			path: ['cards'],
			message: `Quick revision runs ${total.toFixed(1)}s but must be ${QUICK_REVISION_MIN_SECONDS}-${QUICK_REVISION_MAX_SECONDS}s. Add or remove cards, or set durationSeconds on them.`,
		});
	}
});

export type QuickRevisionContent = z.infer<typeof QuickRevisionSchema>;
