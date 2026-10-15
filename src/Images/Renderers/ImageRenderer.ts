import {mkdir} from 'node:fs/promises';
import path from 'node:path';
import {renderStill, selectComposition} from '@remotion/renderer';
import {VideoRenderError, bundleProject} from '../../Renderers/VideoRenderer';
import {saveNumberedOutput} from '../../Services/OutputFiles';
import {resolveImageJob, type ResolvedImageJob} from './ImageJob';

export type ImageRenderResult = {
	/** One file per image: several for a carousel. */
	files: string[];
	category: string;
	variant: string;
	theme: string;
	palette: string | null;
	width: number;
	height: number;
	format: string;
	elapsedMilliseconds: number;
	/** Problems the page reported while rendering, e.g. text that could not be fitted. */
	warnings: string[];
};

export type NumberedImageResult = ImageRenderResult & {
	/** The production's number in Outputs/Images. */
	number: number;
	createdAt: string;
};

const EXTENSIONS = {png: 'png', jpeg: 'jpg', webp: 'webp'} as const;

/** `Post.png` stays as is for one image; a carousel becomes `Post_1.png`, `Post_2.png`... */
const pagePaths = (outputPath: string, pageCount: number): string[] => {
	if (pageCount === 1) return [outputPath];
	const {dir, name, ext} = path.parse(outputPath);
	return Array.from({length: pageCount}, (_, page) => path.join(dir, `${name}_${page + 1}${ext}`));
};

const renderPages = async (job: ResolvedImageJob, outputPaths: string[]): Promise<ImageRenderResult> => {
	const startedAt = Date.now();
	const serveUrl = await bundleProject();
	const warnings: string[] = [];
	const onBrowserLog = (log: {type: string; text: string}) => {
		if (log.type === 'warning' || log.type === 'error') warnings.push(log.text);
	};

	try {
		for (const [page, output] of outputPaths.entries()) {
			const inputProps = {...job.inputProps, page};
			await mkdir(path.dirname(output), {recursive: true});
			const composition = await selectComposition({serveUrl, id: job.compositionId, inputProps, onBrowserLog});
			await renderStill({
				composition,
				serveUrl,
				output,
				inputProps,
				imageFormat: job.format,
				// Highest quality unless the job asks otherwise (PNG, the default, is lossless).
				jpegQuality: job.format === 'jpeg' ? (job.quality ?? 100) : undefined,
				onBrowserLog,
			});
		}
	} catch (error) {
		throw new VideoRenderError('rendering', error);
	}

	return {
		files: outputPaths.map((file) => path.resolve(file)),
		category: job.template.category,
		variant: job.template.variant,
		theme: job.inputProps.theme,
		palette: job.paletteName,
		width: job.width,
		height: job.height,
		format: job.format,
		elapsedMilliseconds: Date.now() - startedAt,
		warnings: [...new Set(warnings)],
	};
};

/**
 * Renders an image job to the given path (PNG, JPEG or WebP, as the job
 * says). A carousel writes one numbered file per slide next to that path.
 */
export const renderImage = async (rawJob: unknown, options: {outputPath: string}): Promise<ImageRenderResult> => {
	// Throws VideoJobValidationError before any expensive work begins.
	const job = resolveImageJob(rawJob);
	return renderPages(job, pagePaths(options.outputPath, job.pageCount));
};

/**
 * Renders an image job into Outputs/Images under the next free number, e.g.
 * `04_Gunluk_Soru_Hook.png`. Nothing is saved if rendering fails.
 */
export const renderImageToOutputs = async (
	rawJob: unknown,
	options: {rootDirectory?: string} = {},
): Promise<NumberedImageResult> => {
	const job = resolveImageJob(rawJob);
	const saved = await saveNumberedOutput({
		kind: 'Images',
		title: job.outputName,
		extension: EXTENSIONS[job.format],
		parts: job.pageCount > 1 ? Array.from({length: job.pageCount}, (_, page) => String(page + 1)) : undefined,
		rootDirectory: options.rootDirectory,
		metadata: {
			category: job.template.category,
			variant: job.template.variant,
			theme: job.inputProps.theme,
			palette: job.paletteName,
			width: job.width,
			height: job.height,
			format: job.format,
		},
		produce: (temporaryPaths) => renderPages(job, temporaryPaths),
	});
	return {...saved.result, files: saved.files, number: saved.number, createdAt: saved.createdAt};
};
