import {mkdir} from 'node:fs/promises';
import path from 'node:path';
import {renderStill, selectComposition} from '@remotion/renderer';
import {APP_SCREEN_COMPOSITION_ID, AppScreenPropsSchema, appScreenSize, type AppScreenProps} from '../Compositions/AppScreenProps';
import {VideoJobValidationError} from './VideoJob';
import {VideoRenderError, bundleProject} from './VideoRenderer';

export type AppScreenRenderResult = {outputPath: string; screen: string; mode: string; device: boolean; width: number; height: number};

/**
 * Renders one app screen to a PNG: the bare screen at phone screenshot
 * resolution, or inside the phone on the brand background.
 */
export const renderAppScreen = async (request: unknown, options: {outputPath: string}): Promise<AppScreenRenderResult> => {
	const parsed = AppScreenPropsSchema.safeParse(request);
	if (!parsed.success) throw new VideoJobValidationError(parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`));
	const inputProps: AppScreenProps = parsed.data;
	const outputPath = path.resolve(options.outputPath);

	const serveUrl = await bundleProject();
	try {
		await mkdir(path.dirname(outputPath), {recursive: true});
		const composition = await selectComposition({serveUrl, id: APP_SCREEN_COMPOSITION_ID, inputProps});
		await renderStill({composition, serveUrl, output: outputPath, inputProps, imageFormat: 'png'});
	} catch (error) {
		throw new VideoRenderError('rendering', error);
	}
	return {outputPath, ...inputProps, ...appScreenSize(inputProps)};
};
