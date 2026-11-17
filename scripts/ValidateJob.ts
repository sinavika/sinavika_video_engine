/**
 * Validates video and image jobs without rendering them. A job with a
 * `category` is an image job; one with a `template` is a video job.
 *
 *   npm run validate -- samples/QuestionSolution.json [more.json ...]
 *   npm run validate -- samples/QuestionSolution.json --narration   (also prints the voice-over script and, for a template that
 *       promises a tempo, checks it on the cached recording; without a cached recording, on the estimate)
 *   npm run validate -- samples/Images/HookContent-BoldQuestion.json
 *
 * Exit codes: 0 all valid, 2 at least one invalid.
 */
import {resolveImageJob} from '../src/Images/Renderers/ImageJob';
import {readdirSync} from 'node:fs';
import path from 'node:path';
import {lookNameOf, repeatedLooks} from '../src/Components/Story/StoryLook';
import {VideoJobValidationError, resolveVideoJob, tempoWarningsOf, voiceLines, withEstimatedNarration, withVoiceClips, type ResolvedVideoJob} from '../src/Renderers/VideoJob';
import {attachBeats} from '../src/Renderers/VideoRenderer';
import {generateVoiceover} from '../src/Services/VoiceoverGenerator';
import {readVideoJob} from '../src/Renderers/VideoJobFile';

const showNarration = process.argv.includes('--narration');
const files = process.argv.slice(2).filter((argument) => !argument.startsWith('--'));
if (files.length === 0) {
	console.error('Kullanım: npm run validate -- <job.json> [job.json ...]');
	process.exit(2);
}

/** The job timed to its cached narration when every line is cached (nothing is generated), else to the estimate. */
const cachedNarration = async (raw: unknown, job: ResolvedVideoJob): Promise<{timed: ResolvedVideoJob; real: boolean}> => {
	const resolved = resolveVideoJob(raw);
	if (!resolved.voiceover) return {timed: job, real: false};
	try {
		const {clips, cast} = await generateVoiceover(voiceLines(resolved), resolved.voiceover, {publicDirectory: path.resolve('public'), cachedOnly: true});
		return {timed: withVoiceClips(resolved, clips, cast), real: true};
	} catch {
		return {timed: job, real: false};
	}
};

/**
 * A story reel's look against the jobs beside it in its series folder (files in name order): two in a row with the
 * same look are reported (owner, 17 Nov 2026).
 */
const seriesLookWarnings = (file: string, templateId: string): string[] => {
	const folder = path.dirname(path.resolve(file));
	const series = readdirSync(folder)
		.filter((name) => name.endsWith('.json'))
		.sort()
		.flatMap((name) => {
			try {
				const raw = readVideoJob(path.join(folder, name)) as {template?: string};
				return raw?.template === templateId ? [{name, look: lookNameOf(raw)}] : [];
			} catch {
				return [];
			}
		});
	const own = path.basename(file);
	return repeatedLooks(series).filter((warning) => warning.includes(own));
};

let invalid = 0;
for (const file of files) {
	try {
		const raw = readVideoJob(file);
		if (raw && typeof raw === 'object' && 'category' in raw) {
			const image = resolveImageJob(raw);
			const pages = image.pageCount > 1 ? `, ${image.pageCount} görsel` : '';
			console.log(`GEÇERLİ  ${file}: ${image.compositionId}, ${image.inputProps.theme}${image.paletteName ? ` + ${image.paletteName}` : ''}, ${image.width}x${image.height} ${image.format}${pages}`);
			continue;
		}
		// A voiced job is timed at the voice's measured pace (withEstimatedNarration): before 1 Nov 2026 the reading-time
		// estimate printed here was about two thirds of the rendered length.
		const job = withEstimatedNarration(resolveVideoJob(raw));
		const seconds = (job.durationInFrames / job.fps).toFixed(1);
		console.log(`GEÇERLİ  ${file}: ${job.compositionId}, ${job.inputProps.theme}, ${job.width}x${job.height}, ${job.fps} fps, ${seconds} sn${job.voiceover ? ' (seslendirme tahmini)' : ''}`);
		if (job.template.id === 'StudyDeskStory') seriesLookWarnings(file, job.template.id).forEach((warning) => console.log(`  Görünüm: ${warning}`));
		if (showNarration) voiceLines(job).forEach((line) => console.log(`  [${line.id}] ${line.text}`));
		if (showNarration && job.template.tempo) {
			const {timed, real} = await cachedNarration(raw, job);
			// Measured as the render measures it: with the music's beats when the piece is cached (cuts wait for the beat).
			let measured = timed;
			let beats = timed.soundtrackMusic && timed.soundtrack && timed.template.cutsOnBeat !== false ? 'ölçülmedi (müzik önbellekte yok)' : 'yok (müzik tarifi yok)';
			if (timed.soundtrackMusic && timed.soundtrack && timed.template.cutsOnBeat !== false) {
				try {
					measured = await attachBeats(timed, {cachedOnly: true});
					beats = 'önbellekteki müzikten';
				} catch {
					measured = timed;
				}
			}
			tempoWarningsOf(measured).forEach((warning) => console.log(`  ${warning}`));
			console.log(`  Tempo ${real ? 'önbellekteki gerçek kayıtla' : 'tahmini sürelerle (kayıt önbellekte yok)'} ölçüldü; vuruş hizalaması ${beats}.`);
		}
	} catch (error) {
		invalid++;
		console.error(`GEÇERSİZ ${file}`);
		const issues = error instanceof VideoJobValidationError ? error.issues : [String(error)];
		issues.forEach((issue) => console.error(`  - ${issue}`));
	}
}

process.exit(invalid === 0 ? 0 : 2);
