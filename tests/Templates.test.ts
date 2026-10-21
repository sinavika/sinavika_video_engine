import {describe, expect, it} from 'vitest';
import {DEFAULT_FPS, SUPPORTED_FPS, VIDEO_FORMAT_IDS} from '../src/Configurations/VideoFormats';
import {planScenes} from '../src/Scenes/ScenePlan';
import {createVideoPropsSchema} from '../src/Schemas/VideoProps';
import {THEME_IDS} from '../src/Themes/ThemeRegistry';
import {focusLevelsAt} from '../src/Templates/Education/ConceptExplanation/ConceptExplanationScenes';
import {ConceptExplanationSchema} from '../src/Templates/Education/ConceptExplanation/ConceptExplanationSchema';
import {CONCEPT_EXPLANATION_SAMPLE} from '../src/Templates/Education/ConceptExplanation/ConceptExplanationSample';
import {ExamPreparationSchema} from '../src/Templates/Education/ExamPreparation/ExamPreparationSchema';
import {EXAM_PREPARATION_SAMPLE} from '../src/Templates/Education/ExamPreparation/ExamPreparationSample';
import {QUESTION_SOLUTION_SAMPLE} from '../src/Templates/Education/QuestionSolution/QuestionSolutionSample';
import {QuestionSolutionSchema} from '../src/Templates/Education/QuestionSolution/QuestionSolutionSchema';
import {QUICK_REVISION_SAMPLE} from '../src/Templates/Education/QuickRevision/QuickRevisionSample';
import {
	QUICK_REVISION_MAX_SECONDS,
	QUICK_REVISION_MIN_SECONDS,
	QuickRevisionSchema,
	quickRevisionTimings,
} from '../src/Templates/Education/QuickRevision/QuickRevisionSchema';
import {compositionId, templateDurationInFrames} from '../src/Templates/TemplateDefinition';
import {TEMPLATES, findTemplate} from '../src/Templates/TemplateRegistry';

describe('template registry', () => {
	it('contains the education and advertisement templates with unique ids', () => {
		const ids = TEMPLATES.map((template) => template.id);
		expect(ids).toEqual(['QuestionSolution', 'TopicExplanation', 'QuickRevision', 'ConceptExplanation', 'ExamPreparation', 'AppPromotion', 'ExamJourney', 'SinoAIFilm', 'ProfilePicker', 'OrbReveal', 'Keynote', 'KineticType', 'NightDesk', 'FlatMorph', 'CountdownChat', 'BeforeAfter', 'GoogleVideoAd', 'AppShowcase', 'CourseLesson', 'CourseShort']);
		expect(new Set(ids).size).toBe(ids.length);
		expect(findTemplate('Nope')).toBeUndefined();
	});

	it('produces composition ids Remotion accepts', () => {
		for (const template of TEMPLATES) {
			for (const format of VIDEO_FORMAT_IDS) {
				expect(compositionId(template.id, format)).toMatch(/^[a-zA-Z0-9-]+$/);
			}
		}
	});
});

describe.each(TEMPLATES.map((template) => [template.id, template] as const))('%s', (_id, template) => {
	const content = template.contentSchema.parse(template.sampleContent);

	it('ships sample content that passes its own schema', () => {
		expect(template.contentSchema.safeParse(template.sampleContent).success).toBe(true);
	});

	it('accepts every theme it claims to support', () => {
		const schema = createVideoPropsSchema(template.contentSchema, template.supportedThemes);
		for (const theme of template.supportedThemes) {
			expect(schema.safeParse({theme, content: template.sampleContent}).success).toBe(true);
		}
		expect(template.supportedThemes).toEqual(THEME_IDS);
		expect(schema.safeParse({theme: 'NoSuchTheme', content: template.sampleContent}).success).toBe(false);
	});

	it('builds scenes with unique ids and positive durations, ending with the outro', () => {
		const scenes = template.buildScenes(content);
		expect(scenes.length).toBeGreaterThanOrEqual(3);
		expect(new Set(scenes.map((scene) => scene.id)).size).toBe(scenes.length);
		scenes.forEach((scene) => expect(scene.seconds).toBeGreaterThan(0));
		expect(scenes.at(-1)?.id).toBe('outro');
	});

	it('is deterministic: the same content gives the same timing', () => {
		const timing = () => template.buildScenes(content).map((scene) => [scene.id, scene.seconds]);
		expect(timing()).toEqual(timing());
	});

	it('keeps the same length in seconds at every supported fps', () => {
		const seconds = SUPPORTED_FPS.map((fps) => templateDurationInFrames(template, content, fps) / fps);
		seconds.forEach((value) => expect(Math.abs(value - seconds[0])).toBeLessThan(0.5));
		expect(templateDurationInFrames(template, content, DEFAULT_FPS)).toBeGreaterThan(DEFAULT_FPS * 10);
	});

	it('drops the outro when the content disables it', () => {
		const withoutOutro = template.contentSchema.parse({...template.sampleContent, outro: {enabled: false}});
		expect(template.buildScenes(withoutOutro).some((scene) => scene.id === 'outro')).toBe(false);
	});

	it('rejects content with a required field missing', () => {
		const [firstKey] = Object.keys(template.sampleContent);
		const broken = {...template.sampleContent, [firstKey]: undefined};
		expect(template.contentSchema.safeParse(broken).success).toBe(false);
	});
});

describe('QuestionSolution rules', () => {
	const sample = QUESTION_SOLUTION_SAMPLE;

	it('requires the correct option to exist', () => {
		const outOfRange = {...sample, answer: {...sample.answer, correctOptionIndex: 9}};
		const missing = {...sample, answer: {text: sample.answer.text}};
		expect(QuestionSolutionSchema.safeParse(outOfRange).success).toBe(false);
		expect(QuestionSolutionSchema.safeParse(missing).success).toBe(false);
	});

	it('supports open-ended questions without an answer scene', () => {
		const openEnded = QuestionSolutionSchema.parse({
			...sample,
			question: {text: sample.question.text},
			answer: {text: sample.answer.text},
		});
		const template = findTemplate('QuestionSolution')!;
		expect(template.buildScenes(openEnded).map((scene) => scene.id)).toEqual(['intro', 'question', 'solution', 'result', 'outro']);
	});

	it('rejects a step with a broken formula', () => {
		const broken = {...sample, steps: [{...sample.steps[0], formula: '\\frac{1}{'}]};
		expect(QuestionSolutionSchema.safeParse(broken).success).toBe(false);
	});

	it('lets a voice-over length drive a step duration', () => {
		const template = findTemplate('QuestionSolution')!;
		const solutionSeconds = (steps: typeof sample.steps) =>
			template.buildScenes(QuestionSolutionSchema.parse({...sample, steps})).find((scene) => scene.id === 'solution')!.seconds;
		const automatic = solutionSeconds(sample.steps);
		const pinned = solutionSeconds(sample.steps.map((step) => ({...step, durationSeconds: 3})));
		expect(pinned).toBe(3 * sample.steps.length);
		expect(pinned).not.toBe(automatic);
	});
});

describe('QuickRevision rules', () => {
	it('keeps the sample inside the 15-60 second window', () => {
		const {total} = quickRevisionTimings(QuickRevisionSchema.parse(QUICK_REVISION_SAMPLE));
		expect(total).toBeGreaterThanOrEqual(QUICK_REVISION_MIN_SECONDS);
		expect(total).toBeLessThanOrEqual(QUICK_REVISION_MAX_SECONDS);
	});

	it('rejects revisions that run too long or too short', () => {
		const slowCards = QUICK_REVISION_SAMPLE.cards.map((card) => ({...card, durationSeconds: 20}));
		const fastCards = QUICK_REVISION_SAMPLE.cards.slice(0, 3).map((card) => ({...card, durationSeconds: 1}));
		const tooLong = QuickRevisionSchema.safeParse({...QUICK_REVISION_SAMPLE, cards: slowCards});
		expect(tooLong.success).toBe(false);
		expect(tooLong.error?.issues[0].message).toMatch(/must be 15-60s/);
		expect(QuickRevisionSchema.safeParse({...QUICK_REVISION_SAMPLE, cards: fastCards}).success).toBe(false);
	});
});

describe('ConceptExplanation rules', () => {
	it('rejects a focus index that points outside the visual', () => {
		const broken = {...CONCEPT_EXPLANATION_SAMPLE, steps: [{caption: 'Metin', focus: [7]}]};
		expect(ConceptExplanationSchema.safeParse(broken).success).toBe(false);
	});

	it('highlights exactly the focused nodes, ramping in and out', () => {
		const fps = 30;
		const plan = planScenes([{id: 's0', seconds: 2}, {id: 's1', seconds: 2}, {id: 's2', seconds: 2}], fps);
		const steps = [[0], [1], [1, 2]];
		const at = (frame: number) => focusLevelsAt(3, steps, plan, frame, fps);
		expect(at(0)).toEqual([0, 0, 0]);
		expect(at(30)).toEqual([1, 0, 0]);
		expect(at(59)[0]).toBeLessThan(0.2);
		expect(at(90)).toEqual([0, 1, 0]);
		// Node 1 is focused by two consecutive steps, so it must not flicker at the boundary.
		expect(at(119)[1]).toBe(1);
		expect(at(120)[1]).toBe(1);
		expect(at(170)).toEqual([0, 1, 1]);
		// The last step stays lit until the scene ends.
		expect(at(400)).toEqual([0, 1, 1]);
	});
});

describe('ExamPreparation rules', () => {
	it('requires the time plan to add up to the exam length', () => {
		const sample = EXAM_PREPARATION_SAMPLE;
		const broken = {...sample, timePlan: {...sample.timePlan!, totalMinutes: 180}};
		const result = ExamPreparationSchema.safeParse(broken);
		expect(result.success).toBe(false);
		expect(result.error?.issues[0].message).toMatch(/add up to 165 minutes/);
	});

	it('only shows the sections that were provided', () => {
		const template = findTemplate('ExamPreparation')!;
		const minimal = ExamPreparationSchema.parse({
			title: EXAM_PREPARATION_SAMPLE.title,
			exam: EXAM_PREPARATION_SAMPLE.exam,
			strategies: EXAM_PREPARATION_SAMPLE.strategies,
		});
		expect(template.buildScenes(minimal).map((scene) => scene.id)).toEqual(['exam', 'strategies', 'outro']);
	});
});
