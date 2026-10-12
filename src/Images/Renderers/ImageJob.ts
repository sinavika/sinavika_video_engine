import {z} from 'zod';
import {VideoJobValidationError} from '../../Renderers/VideoJob';
import {plainText} from '../../Schemas/RichText';
import {ColorPaletteSchema} from '../../Themes/ColorPalette';
import {PALETTES, PALETTE_NAMES, type PaletteName} from '../../Themes/Palettes';
import {imageCompositionId, type AnyImageTemplateDefinition} from '../ImageTemplateDefinition';
import {IMAGE_CATEGORIES, findImageTemplate, imageVariantsOf} from '../ImageTemplateRegistry';
import {createImagePropsSchema, type ImageProps} from '../Schemas/ImageProps';
import {IMAGE_FORMATS, ImageSizeSchema, resolveImageSize, type ImageFormat} from '../Schemas/ImageSizes';

/**
 * An image job is the image side's whole public input, the counterpart of a
 * video job: which design, how it should look, and the content. Plain JSON,
 * so it can be written by hand, produced by an LLM or sent by the backend.
 */
export const ImageJobSchema = z.object({
	category: z.string().min(1),
	/** A design of the category. Defaults to the category's first design. */
	variant: z.string().min(1).optional(),
	/** A named size (Square, Portrait, Story, Landscape) or `{width, height}`. Defaults to the design's own. */
	size: ImageSizeSchema.optional(),
	/** Defaults to the design's own theme. */
	theme: z.string().min(1).optional(),
	/** A registered palette name or an inline palette; replaces the theme's colours. */
	palette: z.union([z.enum(PALETTE_NAMES), ColorPaletteSchema]).optional(),
	format: z.enum(IMAGE_FORMATS).default('png'),
	/** JPEG quality, 1-100. */
	quality: z.number().int().min(1).max(100).optional(),
	/** Names the output file. Defaults to a name derived from the content. */
	name: plainText(80).optional(),
	/** Validated against the chosen design's content schema. */
	content: z.unknown(),
});

export type ImageJob = z.input<typeof ImageJobSchema>;

export type ResolvedImageJob = {
	template: AnyImageTemplateDefinition;
	compositionId: string;
	width: number;
	height: number;
	format: ImageFormat;
	quality?: number;
	paletteName: PaletteName | 'custom' | null;
	/** Number of images this job produces: more than one for carousels. */
	pageCount: number;
	/** Text the output file is named after. */
	outputName: string;
	inputProps: ImageProps<unknown>;
};

const describeIssues = (error: z.ZodError): string[] =>
	error.issues.map((issue) => {
		const path = issue.path.map(String).join('.');
		return path ? `${path}: ${issue.message}` : issue.message;
	});

/** Validates an image job completely before anything is rendered. */
export const resolveImageJob = (raw: unknown): ResolvedImageJob => {
	const envelope = ImageJobSchema.safeParse(raw);
	if (!envelope.success) throw new VideoJobValidationError(describeIssues(envelope.error));
	const job = envelope.data;

	const template = findImageTemplate(job.category, job.variant);
	if (!template) {
		const known = imageVariantsOf(job.category).map((entry) => entry.variant);
		throw new VideoJobValidationError([
			known.length > 0
				? `variant: unknown variant "${job.variant}" for ${job.category}. Available: ${known.join(', ')}`
				: `category: unknown image category "${job.category}". Available: ${IMAGE_CATEGORIES.join(', ')}`,
		]);
	}

	const size = resolveImageSize(job.size ?? template.defaultSize);
	const props = createImagePropsSchema(template.contentSchema).safeParse({
		theme: job.theme ?? template.defaultTheme,
		palette: typeof job.palette === 'string' ? PALETTES[job.palette] : job.palette,
		size,
		content: job.content,
	});
	if (!props.success) throw new VideoJobValidationError(describeIssues(props.error));
	const inputProps = props.data as ImageProps<unknown>;

	return {
		template,
		compositionId: imageCompositionId(template.category, template.variant),
		width: size.width,
		height: size.height,
		format: job.format,
		quality: job.quality,
		paletteName: typeof job.palette === 'string' ? job.palette : job.palette ? 'custom' : null,
		pageCount: template.pageCount?.(inputProps.content) ?? 1,
		outputName: job.name ?? template.outputName(inputProps.content),
		inputProps,
	};
};
