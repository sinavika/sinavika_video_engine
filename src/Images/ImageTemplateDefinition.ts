import type React from 'react';
import type {z} from 'zod';
import type {ThemeId} from '../Themes/ThemeRegistry';
import type {ImageSizeName} from './Schemas/ImageSizes';

/**
 * The image side's own template model, independent of video templates.
 *
 * A category (MobilePromotion, HookContent...) groups design variants; each
 * variant is one template with its own content schema and layout. Adding a
 * design means adding a variant file and one line in ImageTemplateRegistry.
 */
export type ImageTemplateDefinition<Schema extends z.ZodType> = {
	/** Letters and digits only; together with `variant` it forms the composition id. */
	category: string;
	variant: string;
	title: string;
	description: string;
	contentSchema: Schema;
	/** Valid example content. Shown in Remotion Studio and exercised by the tests. */
	sampleContent: z.input<Schema>;
	defaultTheme: ThemeId;
	defaultSize: ImageSizeName;
	/** For multi-image designs (carousels): how many images the content produces. */
	pageCount?: (content: z.output<Schema>) => number;
	/** Text the output file is named after. */
	outputName: (content: z.output<Schema>) => string;
	Component: React.FC<{content: z.output<Schema>; page: number}>;
};

export const defineImageTemplate = <Schema extends z.ZodType>(
	template: ImageTemplateDefinition<Schema>,
): ImageTemplateDefinition<Schema> => template;

// The registry holds templates with different schemas; their content types are erased there.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyImageTemplateDefinition = ImageTemplateDefinition<any>;

export const imageCompositionId = (category: string, variant: string): string => `Image-${category}-${variant}`;
