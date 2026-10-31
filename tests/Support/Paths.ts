import path from 'node:path';

/** The project root and the shared fixtures, for tests at any depth under tests/ (they mirror src/). */
export const ROOT = path.resolve(__dirname, '..', '..');
export const FIXTURES = path.resolve(__dirname, '..', 'Fixtures');
