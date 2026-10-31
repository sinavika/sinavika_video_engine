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
export const readVideoJob = (file: string): unknown => {
	const raw: unknown = JSON.parse(readFileSync(file, 'utf8'));
	if (!raw || typeof raw !== 'object' || !('script' in raw)) return raw;
	const {script, ...job} = raw as Record<string, unknown>;
	if (typeof script !== 'string' || !script.endsWith('.json')) throw new VideoJobValidationError(['script: the path of a script file from the project root.']);
	if ('content' in job) throw new VideoJobValidationError(['script: a job names its script or carries its content, not both.']);
	const scriptFile = path.join(PROJECT_ROOT, script);
	if (!existsSync(scriptFile)) throw new VideoJobValidationError([`script: ${script} does not exist.`]);
	return {...job, content: JSON.parse(readFileSync(scriptFile, 'utf8'))};
};
