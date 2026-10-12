import {ChromeBar} from '../../../Components/Layouts/SafeArea';
import {BrandMark} from '../../../Components/Overlays/BrandMark';
import {Badge} from '../../../Components/Typography/Badge';
import {outroScenes} from '../../../Scenes/BrandOutroScene';
import {estimateReadingSeconds, resolveSceneSeconds} from '../../../Scenes/SceneDuration';
import type {TemplateScene} from '../../../Scenes/ScenePlan';
import {createNarrator, totalSeconds, type VoiceClips} from '../../../Scenes/Voiceover';
import {lowerFirst, sentences, toSpokenText} from '../../../Schemas/SpokenText';
import {defineTemplate} from '../../TemplateDefinition';
import {QUESTION_SOLUTION_SAMPLE} from './QuestionSolutionSample';
import {
	AnswerScene,
	IntroScene,
	OPTION_LETTERS,
	QuestionScene,
	ResultScene,
	SolutionScene,
} from './QuestionSolutionScenes';
import {QuestionSolutionSchema, type QuestionSolutionContent} from './QuestionSolutionSchema';

const MIDDLE_STEP_LEADS = ['Şimdi', 'Ardından', 'Devam edelim'];

/** "İlk olarak, parantezi açalım. ..." - the spoken version of a solution step. */
const stepLine = (step: QuestionSolutionContent['steps'][number], index: number, total: number): string => {
	const lead =
		index === 0 ? 'İlk olarak' : index === total - 1 ? 'Son olarak' : MIDDLE_STEP_LEADS[(index - 1) % MIDDLE_STEP_LEADS.length];
	return sentences(
		`${lead}, ${lowerFirst(step.title)}`,
		toSpokenText(step.content),
		step.formula && toSpokenText(`$${step.formula}$`),
		step.hint && `İpucu: ${toSpokenText(step.hint)}`,
	);
};

const buildScenes = (content: QuestionSolutionContent, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const {question, steps, answer, tip} = content;
	const say = createNarrator(voiceClips, content.script);

	const intro = say(
		'intro',
		sentences('Dikkat! Bu soru tipi sınavda karşına çıkabilir', `Konumuz: ${content.title}`, 'Hadi, birlikte adım adım çözelim!'),
		2.6,
		2.6,
	);
	const asked = say(
		'question',
		question.narration ?? `Sorumuz şöyle: ${toSpokenText(question.text)}`,
		resolveSceneSeconds(question, [question.text, ...(question.options ?? [])], {
			baseSeconds: 2.6,
			minSeconds: 4,
			maxSeconds: 20,
		}),
		4,
	);
	const stepVoices = steps.map((step, index) =>
		say(
			`step-${index + 1}`,
			step.narration ?? stepLine(step, index, steps.length),
			resolveSceneSeconds(step, [step.title, step.content, step.formula, step.hint], {
				baseSeconds: 2.2,
				minSeconds: 4,
				maxSeconds: 14,
			}),
			3.6,
		),
	);
	const correct = answer.correctOptionIndex;
	const revealed = say(
		'answer',
		sentences(
			correct === undefined
				? `Cevap: ${toSpokenText(answer.text)}`
				: `Doğru cevap ${OPTION_LETTERS[correct]} şıkkı: ${toSpokenText(question.options?.[correct])}`,
			toSpokenText(answer.explanation),
		),
		estimateReadingSeconds([answer.explanation], {baseSeconds: 3.4, minSeconds: 3.6, maxSeconds: 10}),
		3.6,
	);
	const result = say(
		'result',
		sentences(
			`Sonuç: ${toSpokenText(answer.text)}`,
			!question.options && toSpokenText(answer.explanation),
			tip ? `Unutma: ${lowerFirst(toSpokenText(tip))}` : 'Bir soruyu daha hallettin, tebrikler!',
		),
		estimateReadingSeconds([tip, question.options ? undefined : answer.explanation], {
			baseSeconds: 2.8,
			minSeconds: 3.2,
			maxSeconds: 10,
		}),
		3.2,
	);

	return [
		{id: 'intro', seconds: intro.seconds, label: 'Giriş', voice: [intro], element: <IntroScene content={content} />},
		{id: 'question', seconds: asked.seconds, label: 'Soru', voice: [asked], element: <QuestionScene content={content} />},
		{
			id: 'solution',
			seconds: totalSeconds(stepVoices),
			label: 'Çözüm',
			voice: stepVoices,
			element: <SolutionScene content={content} stepSeconds={stepVoices.map((voice) => voice.seconds)} />,
		},
		...(question.options
			? [
					{
						id: 'answer',
						seconds: revealed.seconds,
						label: 'Doğru cevap',
						voice: [revealed],
						element: <AnswerScene content={content} />,
					},
				]
			: []),
		{id: 'result', seconds: result.seconds, label: 'Sonuç', voice: [result], element: <ResultScene content={content} />},
		...outroScenes(content.outro, say),
	];
};

/**
 * Question solving. The question stays pinned while the solution is worked
 * through one step at a time, then the correct option is revealed.
 */
export const QuestionSolution = defineTemplate({
	id: 'QuestionSolution',
	category: 'Education',
	title: 'Soru Çözümü',
	description: 'Soru, adım adım çözüm, doğru seçeneğin vurgulanması ve sonuç ekranı.',
	contentSchema: QuestionSolutionSchema,
	sampleContent: QUESTION_SOLUTION_SAMPLE,
	defaultTheme: 'SinavikaBrand',
	transition: {preset: 'fade', durationSeconds: 0.4},
	buildScenes,
	renderOverlay: (content) => (
		<ChromeBar style={{justifyContent: 'space-between'}}>
			<BrandMark />
			{content.subject ? (
				<Badge tone="surface" icon="book">
					{content.subject}
				</Badge>
			) : null}
		</ChromeBar>
	),
});
