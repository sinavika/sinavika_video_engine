/**
 * Checks camp scripts written by camp_script_batch.py before they replace a script in Curriculum/Scripts: the schema,
 * the review rules (reviewScript), still screens, opening variety against the rest of the camp, and the narrated length
 * of the YouTube lesson (src/Courses/CampScriptCheck, the same check `npm run camp` sends with a version). Writes
 * <folder>/sorunlar.json ({TOPIC: [issues]}) for the fix round (not for Curriculum folders).
 *
 *   npx tsx Curriculum/Production/Tools/camp_check.mts Outputs/Camps/Scripts/<etiket>
 */
import {existsSync, readdirSync, readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {CURRICULUM_DIRECTORY} from '../../../src/Courses/Curriculum';
import {checkCampScript, loadCampCheckContext} from '../../../src/Courses/CampScriptCheck';

const ROOT = process.cwd();
const folder = process.argv[2];
if (!folder) throw new Error('Kullanım: camp_check.mts <klasör>');
const CURRICULUM = path.join(ROOT, CURRICULUM_DIRECTORY);

const context = await loadCampCheckContext(ROOT);
const problems: Record<string, string[]> = existsSync(path.join(folder, 'sorunlar.json')) ? JSON.parse(readFileSync(path.join(folder, 'sorunlar.json'), 'utf8')) : {};

for (const name of readdirSync(folder).filter((file) => /^[A-Z0-9_]+\.json$/.test(file))) {
	const topic = name.replace(/\.json$/, '');
	const check = checkCampScript(JSON.parse(readFileSync(path.join(folder, name), 'utf8')), topic, context);
	if (check.seconds === undefined) {
		console.log(`${topic}: GEÇERSİZ (${check.issues.length})`);
		check.issues.slice(0, 40).forEach((issue) => console.log(`  ! ${issue}`));
		problems[topic] = check.issues;
		continue;
	}
	const {issues, suggestions, warnings, stats} = check;
	console.log(`${topic}: ${issues.length} sorun · ${suggestions.length} öneri (${check.stillScreens.length} duran ekran) · ~${(check.seconds / 60).toFixed(1)} dk · ${stats.sections} bölüm · ` +
		`kavram ${stats.concept} · örnek ${stats.example} · hata ${stats.mistake} · soru ${stats.question} · görsel ${stats.visual} · tahmin ${stats.predict} · sıra sende ${stats.practice}`);
	issues.forEach((issue) => console.log(`  ! ${issue}`));
	suggestions.forEach((suggestion) => console.log(`  ? ${suggestion}`));
	warnings.forEach((warning) => console.log(`  ~ ${warning}`));
	problems[topic] = [...issues, ...suggestions.map((s) => `öneri: ${s}`), ...warnings.map((w) => `süre: ${w}`)];
}
// sorunlar.json feeds the fix round of an Outputs batch; it never goes into the live script folders.
if (!path.resolve(folder).startsWith(CURRICULUM)) writeFileSync(path.join(folder, 'sorunlar.json'), JSON.stringify(problems, null, 1) + '\n', 'utf8');
