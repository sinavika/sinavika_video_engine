import {existsSync, readdirSync, readFileSync, statSync} from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {findDeadExports} from '../scripts/DeadCode';

const ROOT = path.resolve(__dirname, '..');

const filesUnder = (directory: string): string[] =>
	readdirSync(path.join(ROOT, directory)).flatMap((name) => {
		const relative = `${directory}/${name}`;
		return statSync(path.join(ROOT, relative)).isDirectory() ? filesUnder(relative) : [relative];
	});

const sourceFiles = filesUnder('src').filter((file) => /\.tsx?$/.test(file));

/**
 * Areas other work owns, or the owner asked to keep as they are: the UI/UX drawings follow the apps' own names,
 * the promotion and education templates are an archive (25 Oct 2026: "kalsın ama dokunma"), and the ads, store,
 * app-screen, image and campaign code belong to the advertising and social work.
 */
const OTHER_AREAS = ['src/UIUX/', 'src/Templates/Advertisements/', 'src/Templates/Education/', 'src/Images/', 'src/Ads/', 'src/Store/', 'src/Components/AppScreens/', 'src/Campaigns/'];
const inOtherArea = (file: string) => OTHER_AREAS.some((area) => file.startsWith(area));

/** Files whose plural name is right, each with its reason. */
const PLURAL_NAMES: Record<string, string> = {
	'src/Configurations/BrandColors.ts': 'a set of constants',
	'src/Configurations/LessonColors.ts': 'a set of constants',
	'src/Configurations/NatureColors.ts': 'a set of constants',
	'src/Configurations/SoundEffects.ts': 'a set of constants',
	'src/Configurations/TurkeyRegions.ts': 'a set of constants',
	'src/Configurations/VideoFormats.ts': 'a set of constants',
	'src/Configurations/Voices.ts': 'a set of constants',
	'src/Themes/DesignTokens.ts': 'a set of constants',
	'src/Themes/FontFaces.ts': 'a set of constants',
	'src/Themes/FontFamilies.ts': 'a set of constants',
	'src/Themes/Palettes.ts': 'a set of constants',
	'src/Schemas/VideoProps.ts': 'the props types of the video compositions',
	'src/Compositions/AppScreenProps.ts': 'the props types of the app-screen compositions',
	'src/Compositions/ImageCompositions.tsx': 'the registry of image compositions',
	'src/Compositions/TemplateCompositions.tsx': 'the registry of template compositions',
	'src/Scenes/SceneSeries.tsx': '"series" is the same in the singular',
	'src/Components/Visuals/Physics/Dynamics.tsx': 'a field of physics',
	'src/Components/Visuals/Physics/Optics.tsx': 'a field of physics',
	'src/Components/Visuals/Physics/Charges.tsx': "named after its visual kind, 'charges'",
	'src/Components/Visuals/Physics/Forces.tsx': "named after its visual kind, 'forces'",
	'src/Components/Visuals/Physics/Vectors.tsx': "named after its visual kind, 'vectors'",
	'src/Components/Visuals/Geography/Plates.tsx': "named after its visual kind, 'plates'",
	'src/Components/Visuals/Geography/Spheres.tsx': "named after its visual kind, 'spheres'",
	'src/Components/Visuals/Humanities/Verses.tsx': "named after its visual kind, 'verses'",
	'src/Services/PlatformCopies.ts': 'social work in progress',
};

/** What the project root holds (31 Oct 2026: a stray brief output and an empty work folder had been left there). */
const ROOT_ENTRIES = [
	'.claude', '.env', '.env.example', '.git', '.gitignore', 'Curriculum', 'Outputs', 'Posts', 'README.md', 'docs', 'node_modules',
	'package-lock.json', 'package.json', 'public', 'remotion.config.ts', 'samples', 'scripts', 'src', 'tests', 'tsconfig.json',
	'vitest.config.ts', 'vitest.render.config.ts',
];

const looksPlural = (file: string) => {
	const name = path.basename(file).replace(/\..*$/, '');
	return /s$/.test(name) && !/(ss|us|is)$/.test(name);
};

describe('engine layout', () => {
	it('keeps tests out of src', () => {
		expect(filesUnder('src').filter((file) => /\.(test|render)\.tsx?$/.test(file))).toEqual([]);
	});

	it('names files in the singular: only folders are plural (docs/Development.md)', () => {
		const plural = sourceFiles.filter((file) => !inOtherArea(file) && looksPlural(file) && !(file in PLURAL_NAMES));
		expect(plural).toEqual([]);
		// The list stays true: every exception still exists.
		expect(Object.keys(PLURAL_NAMES).filter((file) => !sourceFiles.includes(file))).toEqual([]);
	});

	it('exports only what another module imports (npm run dead-code)', () => {
		const dead = findDeadExports(ROOT);
		expect(dead.map((entry) => `${entry.file}: ${entry.name}${entry.usedInOwnFile ? ' (export not needed)' : ' (unused)'}`)).toEqual([]);
	}, 60_000);

	it('defines the shared motion and drawing helpers once', () => {
		const homes: Record<string, string> = {
			easeFrom: 'src/Animations/Motion.ts',
			smooth: 'src/Animations/Motion.ts',
			smoothStep: 'src/Animations/Motion.ts',
			lerp: 'src/Animations/Motion.ts',
			clamp01: 'src/Animations/Motion.ts',
			pathOf: 'src/Components/Visuals/VisualWorld.tsx',
			World: 'src/Components/Visuals/VisualWorld.tsx',
			OPTION_LETTERS: 'src/Courses/LessonScript.ts',
		};
		const elsewhere = Object.entries(homes).flatMap(([name, home]) =>
			sourceFiles
				.filter((file) => file !== home && !inOtherArea(file) && new RegExp(`^(export )?const ${name}\\b`, 'm').test(readFileSync(path.join(ROOT, file), 'utf8')))
				.map((file) => `${name} in ${file}`),
		);
		expect(elsewhere).toEqual([]);
	});

	it('mirrors src in tests: each test sits in the folder of the src module it tests (docs/Development.md)', () => {
		const misplaced = filesUnder('tests')
			.filter((file) => /\.(test|render)\.ts$/.test(file) && file !== 'tests/Architecture.test.ts')
			.filter((file) => !existsSync(path.join(ROOT, 'src', path.dirname(file).slice('tests'.length))) || path.dirname(file) === 'tests');
		expect(misplaced).toEqual([]);
	});

	it('keeps the project root and scripts/ free of stray files', () => {
		expect(readdirSync(ROOT).filter((name) => !ROOT_ENTRIES.includes(name))).toEqual([]);
		// One command per file, named in PascalCase; scratch files belong outside the project.
		expect(readdirSync(path.join(ROOT, 'scripts')).filter((name) => !/^[A-Z][A-Za-z]+\.ts$/.test(name))).toEqual([]);
	});

	it('links only to files that exist in the markdown documents', () => {
		const documents = ['README.md', ...['docs', 'Curriculum', 'Posts', 'samples'].flatMap((directory) => filesUnder(directory))].filter((file) => file.endsWith('.md'));
		const broken = documents.flatMap((file) =>
			[...readFileSync(path.join(ROOT, file), 'utf8').matchAll(/\]\(([^)\s]+)\)/g)]
				.map((match) => decodeURIComponent(match[1].split('#')[0]))
				.filter((link) => link && !/^(https?:|mailto:)/.test(link) && !existsSync(path.resolve(ROOT, path.dirname(file), link)))
				.map((link) => `${file} → ${link}`),
		);
		expect(broken).toEqual([]);
	});

	it('has every camp job name its script instead of carrying a copy (npm run curriculum -- jobs check)', () => {
		const jobs = filesUnder('Curriculum/Jobs').filter((file) => /\/(?!00-)\d\d-[a-z0-9-]+-(youtube|reels)\.json$/.test(file));
		const wrong = jobs.filter((file) => {
			const job = JSON.parse(readFileSync(path.join(ROOT, file), 'utf8')) as {script?: string; content?: unknown};
			return 'content' in job || !job.script || !existsSync(path.join(ROOT, job.script));
		});
		expect(jobs.length).toBeGreaterThan(0);
		expect(wrong).toEqual([]);
	});
});
