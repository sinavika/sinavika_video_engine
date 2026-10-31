import {randomUUID} from 'node:crypto';
import {existsSync} from 'node:fs';
import {appendFile, link, mkdir, open, readdir, rm, stat, unlink} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

/**
 * Numbered, human-readable output files:
 *
 *   Outputs/Videos/01_Matematik_Denklem_Cozumu.mp4
 *   Outputs/Images/01_Sinavika_Mobil_Tanitim.png
 *
 * Videos and images are numbered independently. A number is claimed
 * atomically before rendering starts, the render goes to a temporary file,
 * and only a finished file is moved to its final name. So concurrent
 * productions never share a number, existing outputs are never overwritten,
 * and a failed render leaves nothing behind.
 */
type OutputKind = 'Videos' | 'Images';

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const WORK_DIRECTORY = '.work';

const MANIFEST_FILE = 'Manifest.jsonl';

const STALE_CLAIM_MILLISECONDS = 24 * 60 * 60 * 1000;

const MAX_NAME_WORDS = 7;

const MAX_NAME_LENGTH = 60;

/** `Outputs/` in the project, unless SINAVIKA_OUTPUT_DIRECTORY points elsewhere. */
export const outputRoot = (): string => process.env.SINAVIKA_OUTPUT_DIRECTORY ?? path.join(PROJECT_ROOT, 'Outputs');

const TURKISH_LETTERS: Record<string, string> = {
	ç: 'c', Ç: 'C', ğ: 'g', Ğ: 'G', ı: 'i', İ: 'I', ö: 'o', Ö: 'O', ş: 's', Ş: 'S', ü: 'u', Ü: 'U', â: 'a', Â: 'A', î: 'i', Î: 'I', û: 'u', Û: 'U',
};

/**
 * "TYT'de Süreyi Doğru Kullan" becomes "TYTde_Sureyi_Dogru_Kullan": ASCII
 * letters and digits only, words joined by underscores, formulas and markup
 * dropped, kept short.
 */
export const toFileName = (title: string, fallback = 'Icerik'): string => {
	const words = title
		.replace(/\$[^$]*\$/g, ' ')
		.replace(/[çÇğĞıİöÖşŞüÜâÂîÎûÛ]/g, (letter) => TURKISH_LETTERS[letter])
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/['’`]/g, '')
		.replace(/[^A-Za-z0-9]+/g, ' ')
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, MAX_NAME_WORDS)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1));
	let name = '';
	for (const word of words) {
		if (name && name.length + word.length + 1 > MAX_NAME_LENGTH) break;
		name = name ? `${name}_${word}` : word;
	}
	return name.slice(0, MAX_NAME_LENGTH) || fallback;
};

const numberOf = (fileName: string): number => {
	const match = /^(\d+)(?:_|$)/.exec(fileName);
	return match ? Number(match[1]) : 0;
};

const pad = (number: number): string => String(number).padStart(2, '0');

/** Highest number in use: finished outputs plus numbers other productions are working on right now. */
const highestNumber = async (directory: string, claims: string): Promise<number> => {
	const finished = (await readdir(directory)).map(numberOf);
	const claimed: number[] = [];
	for (const claim of await readdir(claims)) {
		const file = path.join(claims, claim);
		const modified = (await stat(file).catch(() => null))?.mtimeMs ?? Date.now();
		// A claim this old belongs to a production that crashed; its number is given up.
		if (Date.now() - modified > STALE_CLAIM_MILLISECONDS) await rm(file, {force: true});
		else claimed.push(numberOf(claim));
	}
	return Math.max(0, ...finished, ...claimed);
};

/**
 * Takes the next free number. Creating the claim file fails if it already
 * exists, which is what makes two simultaneous productions end up with
 * different numbers instead of both reading "last is 04" and both taking 05.
 */
const claimNumber = async (directory: string, claims: string): Promise<{number: number; release: () => Promise<void>}> => {
	for (let number = (await highestNumber(directory, claims)) + 1; ; number++) {
		const claim = path.join(claims, String(number));
		try {
			await (await open(claim, 'wx')).close();
			return {number, release: () => rm(claim, {force: true})};
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
		}
	}
};

type OutputPart = string | {suffix: string; extension: string};

type OutputRequest<Result> = {
	kind: OutputKind;
	/** Free text the file name is derived from, e.g. the content's title. */
	title: string;
	/** Without the dot: "mp4", "png". */
	extension: string;
	/**
	 * For productions made of several files: one entry per file. A string is a
	 * suffix (a carousel's "1", "2", "3"); an object can also name its own
	 * extension, e.g. a video with its cover: ["", {suffix: "Kapak", extension: "png"}].
	 */
	parts?: OutputPart[];
	/** Renders to the given temporary paths, one per part. Whatever it returns is passed through. */
	produce: (temporaryPaths: string[]) => Promise<Result>;
	/** Extra facts stored with the output: template, theme, size... */
	metadata?: Record<string, unknown>;
	/** Overrides the output root. Used by tests. */
	rootDirectory?: string;
};

type SavedOutput<Result> = {
	kind: OutputKind;
	number: number;
	/** File name without number, extension or part suffix. */
	name: string;
	/** Absolute paths of the saved files, in part order. */
	files: string[];
	createdAt: string;
	metadata: Record<string, unknown>;
	result: Result;
};

/**
 * Runs a production and saves its result under the next number. If `produce`
 * throws, or leaves a part missing or empty, nothing is saved and the error
 * is passed on.
 */
export const saveNumberedOutput = async <Result>({
	kind,
	title,
	extension,
	parts,
	produce,
	metadata = {},
	rootDirectory = outputRoot(),
}: OutputRequest<Result>): Promise<SavedOutput<Result>> => {
	const directory = path.join(rootDirectory, kind);
	const work = path.join(directory, WORK_DIRECTORY);
	const claims = path.join(work, 'Claims');
	await mkdir(claims, {recursive: true});

	const {number, release} = await claimNumber(directory, claims);
	const name = toFileName(title);
	const files = (parts ?? ['']).map((part) => (typeof part === 'string' ? {suffix: part, extension} : part));
	const temporaryPaths = files.map((file) => path.join(work, `${randomUUID()}.${file.extension}`));
	const finalPaths = files.map((file) =>
		path.join(directory, `${pad(number)}_${name}${file.suffix ? `_${file.suffix}` : ''}.${file.extension}`),
	);

	try {
		const result = await produce(temporaryPaths);
		for (const temporary of temporaryPaths) {
			if (!existsSync(temporary) || (await stat(temporary)).size === 0) {
				throw new Error(`The production did not write ${path.basename(temporary)}; nothing was saved.`);
			}
		}
		// `link` refuses to replace an existing file, so even a name clash cannot overwrite an output.
		const placed: string[] = [];
		try {
			for (const [index, temporary] of temporaryPaths.entries()) {
				await link(temporary, finalPaths[index]);
				placed.push(finalPaths[index]);
			}
		} catch (error) {
			// All parts or none: a carousel missing a slide is not a finished output.
			await Promise.all(placed.map((file) => unlink(file).catch(() => undefined)));
			throw error;
		}

		const saved: SavedOutput<Result> = {
			kind,
			number,
			name,
			files: finalPaths,
			createdAt: new Date().toISOString(),
			metadata,
			result,
		};
		const {result: _result, ...entry} = saved;
		await appendFile(path.join(directory, MANIFEST_FILE), `${JSON.stringify(entry)}\n`);
		return saved;
	} finally {
		await Promise.all(temporaryPaths.map((temporary) => unlink(temporary).catch(() => undefined)));
		await release();
	}
};
