import {z} from 'zod';
import {ColorPaletteSchema, type ColorPalette} from '../../Themes/ColorPalette';
import {THEME_IDS, type ThemeId} from '../../Themes/ThemeRegistry';
import {ImageDimensionsSchema, type ImageDimensions} from './ImageSizes';

/**
 * Props of every image composition: presentation settings next to the
 * content, never mixed into it. `content` is the design's own schema.
 */
export const createImagePropsSchema = <Content extends z.ZodType>(contentSchema: Content) =>
	z.object({
		/** Supplies typography and shape, and colours too unless a palette is given. */
		theme: z.enum(THEME_IDS),
		/** Replaces the theme's colours. */
		palette: ColorPaletteSchema.optional(),
		size: ImageDimensionsSchema,
		/** Which image of a multi-image design (carousel) to draw; 0 otherwise. */
		page: z.number().int().min(0).default(0),
		content: contentSchema,
	});

export type ImageProps<Content> = {
	theme: ThemeId;
	palette?: ColorPalette;
	size: ImageDimensions;
	page: number;
	content: Content;
};
