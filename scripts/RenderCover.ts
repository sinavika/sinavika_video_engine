/**
 * Renders only the cover of a video job, without rendering the video: for a
 * cover redesign, or a cover a YouTube upload needs again. The cover is the
 * one the video render makes (camp cover, camp intro cover or video cover).
 *
 *   npm run cover -- --job Curriculum/Jobs/yks-tyt-turkce-kampi/01-sozcukte-anlam-youtube.json --out Outputs/.../Sozcukte_Anlam_YouTube_Kapak.png
 *   npm run cover -- --job a.json --job b.json --out-dir Outputs/Covers
 *
 * A video rendered before a cover change still opens on its old cover frame
 * (the first 0.2 s); only a new render of the video changes that.
 */
import path from 'node:path';
import {parseArgs} from 'node:util';
import {resolveVideoJob, VideoJobValidationError} from '../src/Renderers/VideoJob';
import {readVideoJob} from '../src/Renderers/VideoJobFile';
import {renderVideoCover} from '../src/Services/VideoCoverGenerator';

const {values} = parseArgs({
	options: {
		job: {type: 'string', multiple: true},
		out: {type: 'string'},
		'out-dir': {type: 'string'},
	},
});

const jobs = values.job ?? [];
if (jobs.length === 0 || (values.out && jobs.length > 1)) {
	console.error('Kullanım: npm run cover -- --job <video-işi.json> [--job ...] [--out <dosya.png> | --out-dir <klasör>]');
	process.exit(2);
}

let exitCode = 0;
for (const file of jobs) {
	try {
		const job = resolveVideoJob(readVideoJob(file));
		const outputPath = path.resolve(values.out ?? path.join(values['out-dir'] ?? path.join('Outputs', 'Covers'), `${path.basename(file, '.json')}_Kapak.png`));
		await renderVideoCover(job, outputPath);
		console.log(`${outputPath}\n  ${job.template.id}, ${job.width}x${job.height}`);
	} catch (error) {
		exitCode = 1;
		console.error(`${file}: ${error instanceof VideoJobValidationError ? error.message : String(error)}`);
	}
}
process.exit(exitCode);
