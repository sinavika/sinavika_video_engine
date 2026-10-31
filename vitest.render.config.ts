import {defineConfig} from 'vitest/config';

/** Real renders through headless Chrome. Slow; run with `npm run test:render`. */
export default defineConfig({
	test: {
		include: ['tests/**/*.render.ts'],
		environment: 'node',
		testTimeout: 15 * 60 * 1000,
		hookTimeout: 15 * 60 * 1000,
		fileParallelism: false,
	},
});
