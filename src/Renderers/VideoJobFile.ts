import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {VideoJobValidationError} from './VideoJob';

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/**
 * Reads a video job file for the renderer, `validate` and the other commands.
 *
 * A camp lesson's job names its script instead of carrying a copy of it:
 * `"script": "Curriculum/Scripts/YKS_TYT/TRK/SOZCUKTE_ANLAM.json"`, a path from
 * the project root. The script file stays the only copy, so a job can never
 * render an older version of its lesson (31 Oct 2026; the copies needed a sync
 * after every script edit and once took the wrong exam's script). Here the
 * script is read into `content`, so the job resolves like any other.
 */
/**
 * A job's content may point at a script anywhere inside it with `{"$script": "Curriculum/Scripts/…json"}` (a camp's
 * episode 0 shows moments of its own lessons): the reference is replaced by the script file, so the moment always
 * shows the lesson as it is now.
 */
export const withScripts = (value: unknown): unknown => {
	if (Array.isArray(value)) return value.map(withScripts);
	if (!value || typeof value !== 'object') return value;
	const entries = Object.entries(value as Record<string, unknown>);
	if (entries.length === 1 && entries[0][0] === '$script') {
		const script = entries[0][1];
		if (typeof script !== 'string' || !script.endsWith('.json')) throw new VideoJobValidationError(['$script: the path of a script file from the project root.']);
		const scriptFile = path.join(PROJECT_ROOT, script);
		if (!existsSync(scriptFile)) throw new VideoJobValidationError([`$script: ${script} does not exist.`]);
		return JSON.parse(readFileSync(scriptFile, 'utf8'));
	}
	return Object.fromEntries(entries.map(([key, entry]) => [key, withScripts(entry)]));
};

export const readVideoJob = (file: string): unknown => {
	const raw: unknown = withScripts(JSON.parse(readFileSync(file, 'utf8')));
	if (!raw || typeof raw !== 'object' || !('script' in raw)) return raw;
	const {script, ...job} = raw as Record<string, unknown>;
	if (typeof script !== 'string' || !script.endsWith('.json')) throw new VideoJobValidationError(['script: the path of a script file from the project root.']);
	if ('content' in job) throw new VideoJobValidationError(['script: a job names its script or carries its content, not both.']);
	const scriptFile = path.join(PROJECT_ROOT, script);
	if (!existsSync(scriptFile)) throw new VideoJobValidationError([`script: ${script} does not exist.`]);
	return {...job, content: JSON.parse(readFileSync(scriptFile, 'utf8'))};
};
