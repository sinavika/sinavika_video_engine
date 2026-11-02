/**
 * The plain parts of loading fonts again after a network failure (Themes/FontFaces), kept apart from the browser-only
 * module so they can be tested.
 */

/** The first `url(...)` of an @font-face `src` value: `url("./x.woff2") format("woff2")` → `./x.woff2`. */
export const fontSourceUrl = (src: string): string | undefined => /url\(\s*(["']?)([^"')]+)\1\s*\)/.exec(src)?.[2];

/** Runs `task` until it succeeds, at most `attempts` times, waiting `waitMs`, then twice as long, between tries. */
export const withRetries = async <T>(task: () => Promise<T>, attempts: number, waitMs: number, sleep: (ms: number) => Promise<void> = (ms) => new Promise((resolve) => setTimeout(resolve, ms))): Promise<T> => {
	let lastError: unknown;
	for (let attempt = 0; attempt < attempts; attempt++) {
		try {
			return await task();
		} catch (error) {
			lastError = error;
			if (attempt < attempts - 1) await sleep(waitMs * 2 ** attempt);
		}
	}
	throw lastError;
};
