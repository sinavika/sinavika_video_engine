import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import {stillScreenGate} from '../Renderers/StillScreenGate';
import {VideoJobValidationError, durationWarnings, resolveVideoJob, withEstimatedNarration, type ResolvedVideoJob} from '../Renderers/VideoJob';
import {withScripts} from '../Renderers/VideoJobFile';
import {CURRICULUM_DIRECTORY, entryRef, taughtRefs, type Checklist} from './Curriculum';
import {readChecklist} from './CurriculumImport';
import {LessonScriptSchema, ignoredFields, reviewScript, stillScreenSuggestions, type LessonScript} from './LessonScript';
import {openingVarietyIssues} from './OpeningVariety';

/**
 * The engine's check of one camp script: the schema, the review rules (reviewScript), still screens, opening variety
 * against the rest of the camp and the narrated length of the YouTube lesson. camp_check.mts prints it for a batch;
 * `npm run camp` sends it with every version as the script's check report, so the admin panel shows what the engine
 * found.
 */

/** Every script in Curriculum/Scripts (for opening variety and subtopics taught elsewhere) and the production checklist. */
export type CampCheckContext = {scripts: {file: string; script: LessonScript}[]; checklist: Checklist};

export type CampScriptCheck = {
	issues: string[];
	suggestions: string[];
	stillScreens: string[];
	warnings: string[];
	/** The narrated length of the YouTube lesson; missing when the script does not parse. */
	seconds?: number;
	/** Card counts and the like, shown in the panel. */
	stats: Record<string, number>;
};

export const loadCampCheckContext = async (root: string): Promise<CampCheckContext> => {
	const curriculum = path.join(root, CURRICULUM_DIRECTORY);
	const scriptsRoot = path.join(curriculum, 'Scripts');
	const scripts: CampCheckContext['scripts'] = [];
	for (const file of (await readdir(scriptsRoot, {recursive: true})).filter((name) => name.endsWith('.json'))) {
		const parsed = LessonScriptSchema.safeParse(JSON.parse(await readFile(path.join(scriptsRoot, file), 'utf8')));
		if (parsed.success) scripts.push({file: [CURRICULUM_DIRECTORY, 'Scripts', ...file.split(path.sep)].join('/'), script: parsed.data});
	}
	return {scripts, checklist: await readChecklist(curriculum)};
};

const CARD_KINDS = ['concept', 'example', 'mistake', 'question', 'visual', 'predict', 'practice'] as const;

/** Checks the parsed JSON of a lesson script; `topic` names it in the duration check (the file name without .json). */
export const checkCampScript = (raw: unknown, topic: string, context: CampCheckContext): CampScriptCheck => {
	const parsed = LessonScriptSchema.safeParse(raw);
	if (!parsed.success) return {issues: parsed.error.issues.map((issue) => `şema: ${issue.path.join('.')}: ${issue.message}`), suggestions: [], stillScreens: [], warnings: [], stats: {}};
	const script = parsed.data;
	// The other scripts, told apart by topic id: a path built from the category missed KPSS scripts (folder KPSS,
	// category KPSS_LISANS), so each was compared with itself (found 10 Nov 2026).
	const others = context.scripts.filter(({script: other}) => other.topic.id !== script.topic.id);
	const entry = context.checklist.entries.find((item) => item.id === script.topic.id);
	const elsewhere = new Set(
		others
			.filter(({script: other}) => other.topic.lesson === script.topic.lesson)
			.flatMap(({script: other}) => taughtRefs(other.topic.category, other.topic.lesson, other.lesson.sections)),
	);
	const review = reviewScript(script, entry?.subtopics.map((subtopic) => subtopic.code).filter((code) => !elsewhere.has(entryRef(entry, code))) ?? []);
	const issues = [...review.issues, ...ignoredFields(raw, script).map((field) => `${field}: şemada olmayan alan`)];
	if (script.camp && script.lesson.opening) {
		const campmates = others.filter(({script: other}) => other.camp?.id === script.camp!.id && other.lesson.opening);
		issues.push(...openingVarietyIssues(script.lesson.opening, campmates.map(({script: other}) => ({name: other.title, opening: other.lesson.opening!}))));
	}
	// The output path only has to pass the job envelope; nothing renders.
	const jobOf = (output: string) => withEstimatedNarration(resolveVideoJob({template: 'CampLesson', format: 'Horizontal', theme: 'SinavikaLight', voiceover: true, name: topic, output, content: raw}));
	let job: ResolvedVideoJob;
	try {
		job = jobOf('Outputs/Videos/Kontrol/kontrol.mp4');
	} catch {
		job = jobOf('Outputs/Camps/Kontrol/kontrol.mp4');
	}
	const cards = script.lesson.sections.flatMap((section) => section.cards);
	const stats: Record<string, number> = {sections: script.lesson.sections.length};
	for (const kind of CARD_KINDS) stats[kind] = cards.filter((card) => card.kind === kind).length;
	return {issues, suggestions: review.suggestions, stillScreens: stillScreenSuggestions(script), warnings: durationWarnings(job), seconds: Math.round(job.durationInFrames / job.fps), stats};
};

/** Checks a camp's episode 0, whose words live in its job file (template CampLessonIntro). */
export const checkCampIntroJob = (raw: unknown): CampScriptCheck => {
	try {
		// Episode 0 shows its lessons through {"$script": …} references; read them in as the renderer does.
		const job = withScripts(raw);
		const resolved = withEstimatedNarration(resolveVideoJob(job));
		return {issues: [], suggestions: [], stillScreens: stillScreenGate(job as {template?: unknown; content?: unknown}), warnings: durationWarnings(resolved), seconds: Math.round(resolved.durationInFrames / resolved.fps), stats: {}};
	} catch (error) {
		return {issues: error instanceof VideoJobValidationError ? error.issues : [error instanceof Error ? error.message : String(error)], suggestions: [], stillScreens: [], warnings: [], stats: {}};
	}
};
