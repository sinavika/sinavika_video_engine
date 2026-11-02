import {describe, expect, it} from 'vitest';
import {fontSourceUrl, withRetries} from '../../src/Themes/FontRetry';

describe('font retry', () => {
	it('reads the file of an @font-face source', () => {
		expect(fontSourceUrl('url("./files/manrope-latin-wght-normal.woff2") format("woff2-variations")')).toBe('./files/manrope-latin-wght-normal.woff2');
		expect(fontSourceUrl("url('a865edea076e0166.woff2') format('woff2')")).toBe('a865edea076e0166.woff2');
		expect(fontSourceUrl('url(fonts/KaTeX_Main-Regular.woff2) format("woff2"), url(fonts/KaTeX_Main-Regular.woff) format("woff")')).toBe('fonts/KaTeX_Main-Regular.woff2');
		expect(fontSourceUrl('local("Manrope")')).toBeUndefined();
	});

	it('tries again after a reset connection, waiting longer each time', async () => {
		const waits: number[] = [];
		let calls = 0;
		const result = await withRetries(
			async () => {
				calls++;
				if (calls < 3) throw new Error('net::ERR_CONNECTION_RESET');
				return 'font';
			},
			4,
			400,
			async (ms) => {
				waits.push(ms);
			},
		);
		expect(result).toBe('font');
		expect(calls).toBe(3);
		expect(waits).toEqual([400, 800]);
	});

	it('gives up after the last try with the last error', async () => {
		let calls = 0;
		await expect(
			withRetries(
				async () => {
					calls++;
					throw new Error(`failure ${calls}`);
				},
				3,
				10,
				async () => {},
			),
		).rejects.toThrow('failure 3');
		expect(calls).toBe(3);
	});
});
