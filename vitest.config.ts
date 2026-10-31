import {defineConfig} from 'vitest/config';

/** Fast unit tests: schemas, timing, animation math, registry. No browser. */
export default defineConfig({
	test: {
		include: ['tests/**/*.test.ts'],
		environment: 'node',
	},
});
