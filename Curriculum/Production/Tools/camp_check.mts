/**
 * Checks camp scripts written by camp_script_batch.py before they replace a script in Curriculum/Scripts: the schema,
 * the review rules (reviewScript), still screens, opening variety against the rest of the camp, and the narrated length
 * of the YouTube lesson. Writes <folder>/sorunlar.json ({TOPIC: [issues]}) for the fix round (not for Curriculum folders).
 *
 *   npx tsx Curriculum/Production/Tools/camp_check.mts Outputs/Camps/Scripts/<etiket>
 */
import {existsSync, readdirSync, readFileSync, writeFileSync} from 'node:fs';
import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import {LessonScriptSchema, ignoredFields, reviewScript, stillScreenSuggestions, type LessonScript} from '../../../src/Courses/LessonScript';
import {CURRICULUM_DIRECTORY, entryRef, taughtRefs} from '../../../src/Courses/Curriculum';
import {readChecklist} from '../../../src/Courses/CurriculumImport';
import {openingVarietyIssues} from '../../../src/Courses/OpeningVariety';
import {durationWarnings, resolveVideoJob, withEstimatedNarration} from '../../../src/Renderers/VideoJob';

const ROOT = process.cwd();
const folder = process.argv[2];
if (!folder) throw new Error('Kullanım: camp_check.mts <klasör>');
const CURRICULUM = path.join(ROOT, CURRICULUM_DIRECTORY);

const camp: {file: string; script: LessonScript}[] = [];
const scriptsRoot = path.join(CURRICULUM, 'Scripts');
for (const file of (await readdir(scriptsRoot, {recursive: true})).filter((name) => name.endsWith('.json'))) {
	const parsed = LessonScriptSchema.safeParse(JSON.parse(await readFile(path.join(scriptsRoot, file), 'utf8')));
	if (parsed.success) camp.push({file: [CURRICULUM_DIRECTORY, 'Scripts', ...file.split(path.sep)].join('/'), script: parsed.data});
}
const checklist = await readChecklist(CURRICULUM);
const problems: Record<string, string[]> = existsSync(path.join(folder, 'sorunlar.json')) ? JSON.parse(readFileSync(path.join(folder, 'sorunlar.json'), 'utf8')) : {};

for (const name of readdirSync(folder).filter((file) => /^[A-Z0-9_]+\.json$/.test(file))) {
	const topic = name.replace(/\.json$/, '');
	const file = path.join(folder, name);
	const raw: unknown = JSON.parse(readFileSync(file, 'utf8'));
	const parsed = LessonScriptSchema.safeParse(raw);
	const issues: string[] = [];
	if (!parsed.success) {
		parsed.error.issues.forEach((issue) => issues.push(`şema: ${issue.path.join('.')}: ${issue.message}`));
		console.log(`${topic}: GEÇERSİZ (${issues.length})`);
		issues.slice(0, 40).forEach((issue) => console.log(`  ! ${issue}`));
		problems[topic] = issues;
		continue;
	}
	const script = parsed.data;
	const own = [CURRICULUM_DIRECTORY, 'Scripts', script.topic.category, script.topic.lesson, `${topic}.json`].join('/');
	const entry = checklist.entries.find((item) => item.id === script.topic.id);
	const elsewhere = new Set(camp.filter(({file: other, script: s}) => other !== own && s.topic.lesson === script.topic.lesson).flatMap(({script: s}) => taughtRefs(s.topic.category, s.topic.lesson, s.lesson.sections)));
	const review = reviewScript(script, entry?.subtopics.map((subtopic) => subtopic.code).filter((code) => !elsewhere.has(entryRef(entry, code))) ?? []);
	issues.push(...review.issues, ...ignoredFields(raw, script).map((field) => `${field}: şemada olmayan alan`));
	if (script.camp && script.lesson.opening) {
		const others = camp.filter(({file: other, script: s}) => other !== own && s.camp?.id === script.camp!.id && s.lesson.opening);
		issues.push(...openingVarietyIssues(script.lesson.opening, others.map(({script: s}) => ({name: s.title, opening: s.lesson.opening!}))));
	}
	const still = stillScreenSuggestions(script);
	const suggestions = review.suggestions;
	// The output path only has to pass the job envelope (the folder rule moves with the central layout); nothing renders.
	const jobOf = (output: string) => withEstimatedNarration(resolveVideoJob({template: 'CampLesson', format: 'Horizontal', theme: 'SinavikaLight', voiceover: true, name: topic, output, content: raw}));
	let job: ReturnType<typeof jobOf>;
	try {
		job = jobOf('Outputs/Videos/Kontrol/kontrol.mp4');
	} catch {
		job = jobOf('Outputs/Camps/Kontrol/kontrol.mp4');
	}
	const seconds = job.durationInFrames / job.fps;
	const warnings = durationWarnings(job);
	const cards = script.lesson.sections.flatMap((section) => section.cards);
	const count = (kind: string) => cards.filter((card) => card.kind === kind).length;
	console.log(`${topic}: ${issues.length} sorun · ${suggestions.length} öneri (${still.length} duran ekran) · ~${(seconds / 60).toFixed(1)} dk · ${script.lesson.sections.length} bölüm · ` +
		`kavram ${count('concept')} · örnek ${count('example')} · hata ${count('mistake')} · soru ${count('question')} · görsel ${count('visual')} · tahmin ${count('predict')} · sıra sende ${count('practice')}`);
	issues.forEach((issue) => console.log(`  ! ${issue}`));
	suggestions.forEach((suggestion) => console.log(`  ? ${suggestion}`));
	warnings.forEach((warning) => console.log(`  ~ ${warning}`));
	problems[topic] = [...issues, ...suggestions.map((s) => `öneri: ${s}`), ...warnings.map((w) => `süre: ${w}`)];
}
// sorunlar.json feeds the fix round of an Outputs batch; it never goes into the live script folders.
if (!path.resolve(folder).startsWith(CURRICULUM)) writeFileSync(path.join(folder, 'sorunlar.json'), JSON.stringify(problems, null, 1) + '\n', 'utf8');
