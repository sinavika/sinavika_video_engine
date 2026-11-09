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
const OTHER_AREAS = ['src/UIUX/', 'src/Templates/Advertisements/', 'src/Templates/Education/', 'src/Images/', 'src/Ads/', 'src/Store/', 'src/Components/AppScreens/', 'src/Social/'];
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
	'src/Compositions/WorkFigureProps.ts': 'the props type of the WorkFigure composition',
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

	it('measures text by its letters, never by counting them (FigureLabel.textWidth and fitSize, Typography/TextMeasure)', () => {
		// A letter count times a share of the size gave an "i" the room of an "m"; it was written in 36 places, as a
		// share (0.52–0.62), as units a letter (u(13), 9.6) or as a size over a count, before one measure replaced them
		// all (2 Nov 2026). Each pattern caught some of them.
		const guess = [
			/\.length \* (\([^()]*\)|[\w.]+(\([^()]*\))?) \* 0\.[4-6]\d*|\.length \* 0\.[4-6]\d* \* /,
			/\b(label|text|name|title|caption|detail)(\([^()]*\))?( \?\? '[^']*'\))?\.length\)*\s*\*\s*(u\(|[a-z]*([Ss]ize|[Ff]ont|letter)\b|0\.[2-7])/,
			/\/ \(?Math\.max\(1, (label|text|name)\.length\)/,
		];
		const guesses = sourceFiles
			.filter((file) => !inOtherArea(file))
			.flatMap((file) => readFileSync(path.join(ROOT, file), 'utf-8').split('\n').flatMap((line, index) => (guess.some((pattern) => pattern.test(line)) ? [`${file}:${index + 1}`] : [])));
		expect(guesses).toEqual([]);
	});

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
	}, 60_000); // reads every source file; slow while a render runs on the same machine

	it('centres nothing in a course visual with translate(-50%): FitBox measures with transforms off and sees it stick out', () => {
		// A sentence's arrow label centred that way was measured half its width to the right and the two-word
		// "kapının kolu" was reported as overflowing even at half size (TYT Türkçe 7 render, 1 Nov 2026).
		const offenders = sourceFiles
			.filter((file) => file.startsWith('src/Components/Visuals/') || file.startsWith('src/Components/Illustrations/'))
			.filter((file) => readFileSync(path.join(ROOT, file), 'utf-8').split('\n').some((line) => line.includes('translate(-50%') && !line.trim().startsWith('//')));
		expect(offenders).toEqual([]);
	});

	it('mirrors src in tests: each test sits in the folder of the src module it tests (docs/Development.md)', () => {
		const misplaced = filesUnder('tests')
			.filter((file) => /\.(test|render)\.ts$/.test(file) && file !== 'tests/Architecture.test.ts')
			.filter((file) => !existsSync(path.join(ROOT, 'src', path.dirname(file).slice('tests'.length))) || path.dirname(file) === 'tests');
		expect(misplaced).toEqual([]);
	});

	it('keeps Node built-ins out of everything the video bundle loads (src/index.ts and what it imports)', () => {
		// The Works figure linker read files with node:fs from a module the WorkFigure composition imported; every render
		// then failed while bundling (1 Nov 2026). Node-only code belongs in Renderers, Services or scripts.
		const resolve = (from: string, specifier: string): string | undefined => {
			const base = path.join(path.dirname(path.join(ROOT, from)), specifier);
			const found = [`${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts'), path.join(base, 'index.tsx'), base].find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
			return found ? path.relative(ROOT, found).replaceAll('\\', '/') : undefined;
		};
		const seen = new Set<string>();
		const offenders: string[] = [];
		const visit = (file: string) => {
			if (seen.has(file)) return;
			seen.add(file);
			const text = readFileSync(path.join(ROOT, file), 'utf-8');
			for (const match of text.matchAll(/(?:^|\n)\s*(?:import|export)\s+(?!type\b)[^'"]*?from\s+'([^']+)'/g)) {
				const specifier = match[1];
				if (/^(node:|fs$|path$|os$|child_process$|crypto$)/.test(specifier)) offenders.push(`${file} → ${specifier}`);
				else if (specifier.startsWith('.')) {
					const next = resolve(file, specifier);
					if (next) visit(next);
				}
			}
		};
		visit('src/index.ts');
		expect(seen.size).toBeGreaterThan(100);
		expect(offenders).toEqual([]);
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

/**
 * The engine is filed by the modules the API and the apps use (owner, 9 Nov 2026): Quizzes, Exams, Works, camps,
 * social posts. Each module keeps its work under Curriculum (in git) or Posts, and its output under Outputs (outside
 * git); the shared Python and every path live in Curriculum/Tools (engine_paths.py). docs/Development.md has the map.
 */
const CURRICULUM_FOLDERS = ['Camps', 'Catalog', 'Exams', 'Jobs', 'Production', 'Quizzes', 'README.md', 'Scripts', 'Sources', 'Tools', 'Works', 'WorksWritten'];
const OUTPUT_FOLDERS = ['Brand', 'Camps', 'Checks', 'Covers', 'Exams', 'Images', 'Quizzes', 'Videos', 'Works'];
/** Folder and file names a module was known by before 9 Nov 2026; nothing may point at them any more. */
const RETIRED_PATHS = ['QuestionRevision', 'Outputs/WorkFigures', 'Outputs/WorksWritten', 'src/Campaigns', 'Courses/WorkFigure', 'Courses/WorksView', 'Courses/WorksWritten', 'Services/SocialHubClient', 'Services/SocialPlanner', 'Outputs/Stills', 'Outputs/Sweeps', 'Outputs/Yatirim', 'Outputs/Videos/YKS', 'Outputs/Videos/KPSS'];
const pythonTools = filesUnder('Curriculum').filter((file) => file.endsWith('.py'));
const moduleTools = pythonTools.filter((file) => /^Curriculum\/(Quizzes|Exams)\/Tools\/[^/]+\.py$/.test(file) && !file.endsWith('/paths.py'));
const SHARED_PYTHON = filesUnder('Curriculum/Tools').filter((file) => file.endsWith('.py')).map((file) => path.basename(file, '.py'));

describe('module layout', () => {
	it('files Curriculum by module, as the API and the apps do', () => {
		expect(readdirSync(path.join(ROOT, 'Curriculum')).filter((name) => !CURRICULUM_FOLDERS.includes(name))).toEqual([]);
	});

	it.runIf(existsSync(path.join(ROOT, 'Outputs')))('files Outputs by module: camps, quizzes, exams, Works, checks', () => {
		expect(readdirSync(path.join(ROOT, 'Outputs')).filter((name) => !OUTPUT_FOLDERS.includes(name))).toEqual([]);
	});

	it('keeps every path of the Python tools in Curriculum/Tools/engine_paths.py', () => {
		const own = pythonTools
			.filter((file) => !file.endsWith('/engine_paths.py'))
			.filter((file) => /os\.path\.join\([^)]*["'](Outputs|Desktop)["']/.test(readFileSync(path.join(ROOT, file), 'utf-8')));
		expect(own).toEqual([]);
	});

	it('lets a quiz or exam tool reach the shared tools: it imports its paths.py before them', () => {
		const late = moduleTools.filter((file) => {
			const imports = [...readFileSync(path.join(ROOT, file), 'utf-8').matchAll(/^(?:from|import) ([a-z_]+)/gm)].map((match) => match[1]);
			const shared = imports.findIndex((name) => SHARED_PYTHON.includes(name));
			return shared >= 0 && !imports.slice(0, shared).includes('paths');
		});
		expect(late).toEqual([]);
	});

	it('never imports one module’s tools from another: what quizzes and exams share lives in Curriculum/Tools', () => {
		const quiz = filesUnder('Curriculum/Quizzes/Tools').map((file) => path.basename(file, '.py'));
		const exam = filesUnder('Curriculum/Exams/Tools').map((file) => path.basename(file, '.py'));
		const crossing = moduleTools.filter((file) => {
			const other = file.includes('/Quizzes/') ? exam : quiz;
			return [...readFileSync(path.join(ROOT, file), 'utf-8').matchAll(/^(?:from|import) ([a-z_]+)/gm)].some((match) => match[1] !== 'paths' && other.includes(match[1]));
		});
		expect(crossing).toEqual([]);
	});

	it('caches a batch prompt for an hour through anthropic_api.cached_system, never with the 5-minute default', () => {
		// 2–5 Nov 2026: a 5-minute cache died inside every Works batch (11–24 % cache reads on 715 requests).
		const shortCache = pythonTools.filter((file) => /['"]cache_control['"]\s*:\s*\{\s*['"]type['"]\s*:\s*['"]ephemeral['"]\s*\}/.test(readFileSync(path.join(ROOT, file), 'utf-8')));
		expect(shortCache).toEqual([]);
	});

	it('points nowhere a module used to live (retired 9 Nov 2026)', () => {
		const texts = [...filesUnder('src'), ...filesUnder('scripts'), ...filesUnder('tests').filter((file) => !file.endsWith('Architecture.test.ts')), ...filesUnder('docs'), ...pythonTools, ...filesUnder('Curriculum').filter((file) => /\.(md|ts)$/.test(file) && !file.startsWith('Curriculum/Production/') && !file.startsWith('Curriculum/Sources/'))]
			.filter((file) => /\.(ts|tsx|md|py)$/.test(file) && !file.startsWith('docs/Analiz/'));
		const stale = texts.flatMap((file) => {
			const text = readFileSync(path.join(ROOT, file), 'utf-8');
			return RETIRED_PATHS.filter((retired) => text.includes(retired)).map((retired) => `${file}: ${retired}`);
		});
		expect(stale).toEqual([]);
	});
});
