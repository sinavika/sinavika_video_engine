import {outroScenes} from '../../../Scenes/BrandOutroScene';
import {estimateReadingSeconds} from '../../../Scenes/SceneDuration';
import type {TemplateScene} from '../../../Scenes/ScenePlan';
import {createNarrator, type VoiceClips} from '../../../Scenes/Voiceover';
import {lowerFirst, sentences, toSpokenText} from '../../../Schemas/SpokenText';
import {defineTemplate} from '../../TemplateDefinition';
import {EXAM_PREPARATION_SAMPLE} from './ExamPreparationSample';
import {
	ExamChrome,
	ExamInfoScene,
	MistakesScene,
	MotivationScene,
	StrategiesScene,
	TimePlanScene,
	TipsScene,
} from './ExamPreparationScenes';
import {ExamPreparationSchema, type ExamPreparationContent} from './ExamPreparationSchema';

const buildScenes = (content: ExamPreparationContent, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const {exam, strategies, timePlan, mistakes, tips, motivation} = content;
	const say = createNarrator(voiceClips, content.script);

	const info = say(
		'exam',
		sentences(
			`${exam.name} için hazır mısın?`,
			content.title,
			`Önce rakamlar: ${toSpokenText(exam.stats.map((stat) => `${stat.value} ${stat.label}`).join(', '))}`,
		),
		estimateReadingSeconds(
			[content.title, exam.description, ...exam.stats.flatMap((stat) => [stat.value, stat.label])],
			{baseSeconds: 3, minSeconds: 4, maxSeconds: 9},
		),
		4,
	);
	const plan = say(
		'strategies',
		sentences(
			`İşte net artıran ${strategies.length} strateji`,
			...strategies.map((strategy) => sentences(strategy.title, toSpokenText(strategy.detail))),
		),
		estimateReadingSeconds(
			strategies.flatMap((strategy) => [strategy.title, strategy.detail]),
			{baseSeconds: 3, minSeconds: 5, maxSeconds: 18},
		),
		5,
	);
	const scenes: TemplateScene[] = [
		{id: 'exam', seconds: info.seconds, label: 'Sınav', voice: [info], element: <ExamInfoScene content={content} />},
		{
			id: 'strategies',
			seconds: plan.seconds,
			label: 'Strateji',
			voice: [plan],
			element: <StrategiesScene content={content} seconds={plan.seconds} />,
		},
	];

	if (timePlan) {
		const time = say(
			'time',
			sentences(
				`${timePlan.totalMinutes} dakikayı şöyle paylaştır: ${timePlan.segments.map((segment) => `${segment.label} için ${segment.minutes} dakika`).join(', ')}`,
				toSpokenText(timePlan.note),
			),
			estimateReadingSeconds([...timePlan.segments.map((segment) => segment.label), timePlan.note], {
				baseSeconds: 3 + timePlan.segments.length * 0.6,
				minSeconds: 5,
				maxSeconds: 16,
			}),
			5,
		);
		scenes.push({
			id: 'time',
			seconds: time.seconds,
			label: 'Süre',
			voice: [time],
			element: <TimePlanScene content={content} seconds={time.seconds} />,
		});
	}
	if (mistakes) {
		const warned = say(
			'mistakes',
			sentences('Bu hatalara düşme!', ...mistakes.map((mistake) => `${mistake.wrong} yerine, ${lowerFirst(mistake.right)}`)),
			estimateReadingSeconds(
				mistakes.flatMap((mistake) => [mistake.wrong, mistake.right]),
				{baseSeconds: 2.5 + mistakes.length * 0.9, minSeconds: 5, maxSeconds: 18},
			),
			5,
		);
		scenes.push({
			id: 'mistakes',
			seconds: warned.seconds,
			label: 'Hatalar',
			voice: [warned],
			element: <MistakesScene content={content} seconds={warned.seconds} />,
		});
	}
	if (tips) {
		const advised = say(
			'tips',
			sentences('Sınav günü için son ipuçları', ...tips.map(toSpokenText)),
			estimateReadingSeconds(tips, {baseSeconds: 3, minSeconds: 4.5, maxSeconds: 14}),
			4.5,
		);
		scenes.push({
			id: 'tips',
			seconds: advised.seconds,
			label: 'İpuçları',
			voice: [advised],
			element: <TipsScene content={content} seconds={advised.seconds} />,
		});
	}
	if (motivation) {
		const cheered = say(
			'motivation',
			sentences('Ve unutma:', motivation.quote),
			estimateReadingSeconds([motivation.quote], {baseSeconds: 2.8, minSeconds: 3.6, maxSeconds: 8}),
			3.6,
		);
		scenes.push({
			id: 'motivation',
			seconds: cheered.seconds,
			label: 'Motivasyon',
			voice: [cheered],
			element: <MotivationScene content={content} />,
		});
	}
	return [...scenes, ...outroScenes(content.outro, say)];
};

/**
 * Exam briefing in the voice of a coach: the exam in numbers, solving
 * strategies, a time budget drawn as a stacked bar, common mistakes with
 * their fixes, a checklist of tips and a closing motivation card.
 */
export const ExamPreparation = defineTemplate({
	id: 'ExamPreparation',
	category: 'Education',
	title: 'Sınav Hazırlığı',
	description: 'Sınav bilgileri, stratejiler, süre yönetimi, sık yapılan hatalar, ipuçları ve motivasyon.',
	contentSchema: ExamPreparationSchema,
	sampleContent: EXAM_PREPARATION_SAMPLE,
	defaultTheme: 'ExamFocus',
	transition: {preset: 'slide', direction: 'from-bottom', durationSeconds: 0.45},
	buildScenes,
	renderOverlay: (content, plan) => {
		const labels = Object.fromEntries(buildScenes(content).map((scene) => [scene.id, scene.label ?? scene.id]));
		return <ExamChrome content={content} plan={plan} labels={labels} />;
	},
});
