/**
 * Renders the Google Ads videos (src/Ads/Google/VideoAdPlan.ts, template GoogleVideoAd).
 *
 *   npm run google-ads-video                              (all, to Desktop\Sinavika-GoogleAds)
 *   npm run google-ads-video -- --exam kpss --platform mobile --lang tr --length short --format Horizontal
 *   npm run google-ads-video -- --jobs-only               (writes the job files, renders nothing)
 *
 * <out>/<tr|en>/<yks|kpss>/<mobil-uygulama|web-sitesi>/video/<15sn|6sn-bumper>-<yatay-16x9|kare-1x1|dikey-9x16>.mp4
 * <out>/ortak/video-isleri/<…>.json   (the jobs, to re-render one video with npm run render)
 */
import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {parseArgs} from 'node:util';
import {PLATFORM_FOLDER} from '../src/Ads/Google/GoogleAdsPlan';
import {buildVideoAdJob, FORMAT_FILE, VIDEO_AD_LENGTHS, videoAdSpecs} from '../src/Ads/Google/VideoAdPlan';
import {renderVideo} from '../src/Renderers/VideoRenderer';

const {values} = parseArgs({
	options: {
		out: {type: 'string', default: path.join(process.env.USERPROFILE ?? '', 'Desktop', 'Sinavika-GoogleAds')},
		exam: {type: 'string'},
		platform: {type: 'string'},
		lang: {type: 'string'},
		length: {type: 'string'},
		format: {type: 'string'},
		'jobs-only': {type: 'boolean', default: false},
	},
});

const keep = (value: string | undefined, actual: string) => !value || value.split(',').includes(actual);
const root = path.resolve(values.out);
const specs = videoAdSpecs().filter((spec) => keep(values.exam, spec.exam) && keep(values.platform, spec.platform) && keep(values.lang, spec.lang) && keep(values.length, spec.length) && keep(values.format, spec.format));

let done = 0;
for (const spec of specs) {
	const job = buildVideoAdJob(spec);
	const file = `${VIDEO_AD_LENGTHS[spec.length].label}-${FORMAT_FILE[spec.format]}`;
	const jobPath = path.join(root, 'ortak', 'video-isleri', `${spec.lang}-${spec.exam}-${spec.platform}-${file}.json`);
	await mkdir(path.dirname(jobPath), {recursive: true});
	await writeFile(jobPath, `${JSON.stringify(job, null, 2)}\n`, 'utf8');
	if (values['jobs-only']) continue;
	const outputPath = path.join(root, spec.lang, spec.exam, PLATFORM_FOLDER[spec.platform], 'video', `${file}.mp4`);
	await mkdir(path.dirname(outputPath), {recursive: true});
	const result = await renderVideo(job, {outputPath});
	done += 1;
	console.log(`✓ [${done}/${specs.length}] ${path.relative(root, outputPath)}  ${(result.durationInFrames / result.fps).toFixed(1)} sn`);
}
console.log(values['jobs-only'] ? `${specs.length} iş dosyası yazıldı` : `${done} video → ${root}`);
process.exit(0);
