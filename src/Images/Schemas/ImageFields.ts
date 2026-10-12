import {z} from 'zod';
import {ICON_PATHS, type IconName} from '../../Components/Illustrations/Icon';
import {plainText} from '../../Schemas/RichText';
import {ImageSchema} from '../../Schemas/Visual';

/** Content fields that many image templates share. Each template picks the ones it needs. */

/** A real screenshot or reference picture: a path inside `public/` or a URL. Shown as is, never altered. */
export const ScreenshotSchema = ImageSchema;

export const CallToActionSchema = z.object({
	label: plainText(36),
	/** Small line next to the button, e.g. "Ücretsiz dene". */
	note: plainText(50).optional(),
});

export type CallToActionContent = z.infer<typeof CallToActionSchema>;

/** Logo and signature line at the bottom of an image. */
export const BrandingSchema = z
	.object({
		logo: z.boolean().default(true),
		/** Short text beside the logo: a handle, a web address, a campaign tag. */
		handle: plainText(40).optional(),
	})
	.default({logo: true});

export type Branding = z.infer<typeof BrandingSchema>;

export const IconNameSchema = z.enum(Object.keys(ICON_PATHS) as [IconName, ...IconName[]]);
