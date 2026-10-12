import {outroScenes} from '../../../Scenes/BrandOutroScene';
import type {TemplateScene} from '../../../Scenes/ScenePlan';
import {createNarrator, totalSeconds, type VoiceClips} from '../../../Scenes/Voiceover';
import {sentences, toSpokenText} from '../../../Schemas/SpokenText';
import {defineTemplate} from '../../TemplateDefinition';
import {QUICK_REVISION_SAMPLE} from './QuickRevisionSample';
import {CardScene, IntroScene, RecapScene, RevisionChrome} from './QuickRevisionScenes';
import {
	QUICK_REVISION_MAX_SECONDS,
	QUICK_REVISION_MIN_SECONDS,
	QuickRevisionSchema,
	quickRevisionTimings,
	type QuickRevisionContent,
	type RevisionCard,
} from './QuickRevisionSchema';

/** Cards are read short and punchy; a warning announces itself. */
const cardLine = (card: RevisionCard): string => {
	switch (card.kind) {
		case 'fact':
			return toSpokenText(card.text);
		case 'warning':
			return sentences('Dikkat!', toSpokenText(card.text));
		case 'term':
			return sentences(`${card.term}`, toSpokenText(card.definition));
		case 'formula':
			return sentences(card.title, toSpokenText(`$${card.latex}$`), toSpokenText(card.note));
	}
};

const buildScenes = (content: QuickRevisionContent, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const timings = quickRevisionTimings(content);
	const say = createNarrator(voiceClips, content.script);

	const intro = say(
		'intro',
		`Hızlı tekrar: ${content.title}! Hazır mısın?`,
		timings.intro,
		timings.intro,
	);
	const cards = content.cards.map((card, index) =>
		say(`card-${index + 1}`, card.narration ?? cardLine(card), timings.cards[index], 2.6),
	);
	const recap = say('recap', sentences('Kısaca', ...content.summary.map(toSpokenText)), timings.recap, 3);

	return [
		{
			id: 'intro',
			seconds: intro.seconds,
			label: 'Giriş',
			voice: [intro],
			element: <IntroScene content={content} totalSeconds={totalSeconds([intro, ...cards, recap])} />,
		},
		...content.cards.map((card, index) => ({
			id: cards[index].id,
			seconds: cards[index].seconds,
			label: `Kart ${index + 1}`,
			voice: [cards[index]],
			element: <CardScene card={card} index={index} total={content.cards.length} />,
		})),
		{
			id: 'recap',
			seconds: recap.seconds,
			label: 'Özet',
			voice: [recap],
			element: <RecapScene content={content} seconds={recap.seconds} />,
		},
		...outroScenes(content.outro, say),
	];
};

/**
 * 15-60 second revision. Full-bleed flash cards, one idea each, cut quickly
 * with alternating push transitions under a story-style progress bar.
 */
export const QuickRevision = defineTemplate({
	id: 'QuickRevision',
	category: 'Education',
	title: 'Hızlı Tekrar',
	description: '15-60 saniyelik bilgi kartları: bilgi, formül, kavram ve dikkat kartları, kısa özet.',
	contentSchema: QuickRevisionSchema,
	sampleContent: QUICK_REVISION_SAMPLE,
	defaultTheme: 'VibrantDynamic',
	transition: [
		{preset: 'slide', direction: 'from-right', durationSeconds: 0.3},
		{preset: 'slide', direction: 'from-bottom', durationSeconds: 0.3},
	],
	// Short-form pace: the narrator speaks faster here than in the other templates.
	voiceover: {rate: '+16%'},
	targetSeconds: {min: QUICK_REVISION_MIN_SECONDS, max: QUICK_REVISION_MAX_SECONDS},
	buildScenes,
	renderOverlay: (_content, plan) => <RevisionChrome plan={plan} />,
});
