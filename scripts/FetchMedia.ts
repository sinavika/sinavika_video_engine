/**
 * Adds a picture from Wikimedia Commons to the media library, with its
 * author and licence, so it can be shown on a picture card.
 *
 *   npm run media -- --commons "File:Mustafa Kemal Atatürk 1923.jpg" --to History/Ataturk_1923.jpg
 *
 * The file is saved to public/Media/<to> (scaled to at most 1920 px wide)
 * and recorded in public/Media/Credits.json. Files whose licence does not
 * allow use in a published video (anything but public domain, CC0, CC BY,
 * CC BY-SA) are refused.
 */
import {existsSync} from 'node:fs';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {parseArgs} from 'node:util';
import {MEDIA_CREDITS_FILE, MEDIA_DIRECTORY, MediaCreditsSchema, creditLine, type MediaEntry} from '../src/Courses/MediaLibrary';

const ROOT = path.resolve(import.meta.dirname, '..');
const LIBRARY = path.join(ROOT, 'public', MEDIA_DIRECTORY);
const MAX_WIDTH = 1920;

const {values} = parseArgs({options: {commons: {type: 'string'}, to: {type: 'string'}}});
if (!values.commons || !values.to) {
	console.error('Kullanım: npm run media -- --commons "File:Ad.jpg" --to Klasör/Ad.jpg');
	process.exit(2);
}

/**
 * Commons answers "too many requests" (HTTP 429, or a plain-text page) after about ten files in a row (31 Oct 2026):
 * wait as long as it asks, three times at most, and never save an answer that is not what was asked for.
 */
const fetchCommons = async (url: URL | string, expected: RegExp): Promise<Response> => {
	for (let attempt = 1; ; attempt++) {
		const response = await fetch(url, {headers: {'User-Agent': 'SinavikaVideoEngine/1.0 (media credits)'}});
		const type = response.headers.get('content-type') ?? '';
		if (response.ok && expected.test(type)) return response;
		if (attempt >= 3 || response.status === 404) {
			console.error(`Commons beklenen yanıtı vermedi (${response.status}, ${type || 'türsüz'}): ${String(url).slice(0, 120)}`);
			process.exit(1);
		}
		const wait = Number(response.headers.get('retry-after')) || 20 * attempt;
		console.error(`Commons istek sınırı: ${wait} sn bekleniyor…`);
		await new Promise((resolve) => setTimeout(resolve, wait * 1000));
	}
};

const title = values.commons.startsWith('File:') ? values.commons : `File:${values.commons}`;
const api = new URL('https://commons.wikimedia.org/w/api.php');
api.search = new URLSearchParams({action: 'query', titles: title, prop: 'imageinfo', iiprop: 'url|extmetadata', iiurlwidth: String(MAX_WIDTH), format: 'json', origin: '*'}).toString();
const response = await fetchCommons(api, /json/);
const data = (await response.json()) as {query?: {pages?: Record<string, {imageinfo?: {thumburl?: string; url: string; descriptionurl: string; extmetadata?: Record<string, {value?: string}>}[]}>}};
const info = Object.values(data.query?.pages ?? {})[0]?.imageinfo?.[0];
if (!info) {
	console.error(`Commons'ta bulunamadı: ${title}`);
	process.exit(1);
}

const meta = (key: string) => (info.extmetadata?.[key]?.value ?? '').replace(/<[^>]+>/g, '').trim();
const shortName = meta('LicenseShortName');
const license: MediaEntry['license'] | null = /public domain|pd/i.test(shortName) ? 'PD' : /^cc0/i.test(shortName) ? 'CC0' : /^cc by-sa/i.test(shortName) ? 'CC BY-SA' : /^cc by/i.test(shortName) ? 'CC BY' : null;
if (!license) {
	console.error(`Lisans uygun değil: "${shortName}". Yalnız kamu malı, CC0, CC BY ve CC BY-SA kabul edilir.`);
	process.exit(1);
}

const file = path.join(LIBRARY, values.to);
await mkdir(path.dirname(file), {recursive: true});
await writeFile(file, Buffer.from(await (await fetchCommons(info.thumburl ?? info.url, /^(image|video|audio)\//)).arrayBuffer()));

const entry: MediaEntry = {
	file: `${MEDIA_DIRECTORY}/${values.to.split(path.sep).join('/')}`,
	title: meta('ObjectName') || title.replace(/^File:/, ''),
	author: meta('Artist') || 'Bilinmiyor',
	source: info.descriptionurl,
	license,
	licenseVersion: shortName.match(/\d\.\d/)?.[0],
	licenseUrl: meta('LicenseUrl') || undefined,
	credit: '',
	accessed: new Date().toISOString().slice(0, 10),
};
entry.credit = creditLine(entry, 'Wikimedia Commons').slice(0, 120);

const creditsFile = path.join(LIBRARY, MEDIA_CREDITS_FILE);
const credits = existsSync(creditsFile) ? MediaCreditsSchema.parse(JSON.parse(await readFile(creditsFile, 'utf8'))) : {entries: []};
credits.entries = [...credits.entries.filter((item) => item.file !== entry.file), entry];
await writeFile(creditsFile, `${JSON.stringify(credits, null, 2)}\n`);
console.log(`${entry.file}\n  ${entry.credit}\n  ${entry.source}`);
