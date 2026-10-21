/**
 * Writes one version of a promotion reel per promo voice, so the owner can
 * hear them side by side in the admin panel and approve one.
 *
 *   npm run promo-variants -- --dir Posts/2026-10-18_SinoaiLansmanFilmi
 *
 * From the folder's Job.json and Post.json it writes Job_<Voice>.json and
 * Post_<Voice>.json for every voice of PROMO_VOICES (Configurations/Voices),
 * narrated with PROMO_VOICE_MODEL. Each post names its voice in `lesson`,
 * which the admin panel shows next to the category, and points at
 * Media/<Video>_<Voice>.mp4. A `replacesPostId` stays on the first voice only:
 * one rejected post is replaced by one new post, the others are extra choices.
 *
 * Render each job with `npm run render -- --job <Job_X.json> --out <media>`
 * and submit with `npm run social -- submit --post <Post_X.json>`.
 */
import {readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {parseArgs} from 'node:util';
import {PROMO_VOICES, PROMO_VOICE_MODEL, VOICES} from '../src/Configurations/Voices';

const {values} = parseArgs({options: {dir: {type: 'string'}}});
if (!values.dir) {
	console.error('Kullanım: npm run promo-variants -- --dir Posts/<klasör>');
	process.exit(2);
}

const directory = values.dir;
const job = JSON.parse(await readFile(path.join(directory, 'Job.json'), 'utf8')) as {voiceover?: Record<string, unknown>};
const post = JSON.parse(await readFile(path.join(directory, 'Post.json'), 'utf8')) as {media: string[]; lesson?: string; replacesPostId?: string};
if (post.media.length !== 1 || path.extname(post.media[0]).toLowerCase() !== '.mp4') {
	console.error(`${directory}/Post.json tek bir video göstermiyor; ses sürümleri yalnız reels içindir.`);
	process.exit(2);
}
const video = path.parse(post.media[0]);

for (const [index, voice] of PROMO_VOICES.entries()) {
	const media = path.posix.join(video.dir, `${video.name}_${voice}${video.ext}`);
	const variantJob = {...job, voiceover: {...job.voiceover, profile: job.voiceover?.profile ?? 'Launch', voice, model: PROMO_VOICE_MODEL}};
	const variantPost: Record<string, unknown> = {...post, media: [media], lesson: `Ses: ${VOICES[voice].name} (${PROMO_VOICE_MODEL})`};
	if (index > 0) delete variantPost.replacesPostId;
	await writeFile(path.join(directory, `Job_${voice}.json`), `${JSON.stringify(variantJob, null, 2)}\n`);
	await writeFile(path.join(directory, `Post_${voice}.json`), `${JSON.stringify(variantPost, null, 2)}\n`);
	console.log(`${directory}: ${voice} → ${media}`);
}
