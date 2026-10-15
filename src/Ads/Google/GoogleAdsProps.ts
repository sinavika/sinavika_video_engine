import {z} from 'zod';
import {AD_FORMATS} from './GoogleAdsPlan';

/** Props of the Google Ads compositions, shared by the compositions and the export script. */
export const GOOGLE_AD_IMAGE_ID = 'GoogleAdImage';
export const GOOGLE_AD_LAYER_ID = 'GoogleAdLayer';
export const GOOGLE_AD_LOGO_ID = 'GoogleAdLogo';

export const GoogleAdImagePropsSchema = z.object({
	lang: z.enum(['tr', 'en']).default('tr'),
	exam: z.enum(['yks', 'kpss']).default('yks'),
	concept: z.string().default('net-kaybi'),
	platform: z.enum(['mobile', 'web']).default('mobile'),
	format: z.enum(['yatay', 'kare', 'dikey']).default('kare'),
	/** Without the ad copy and logo: only the product (Google adds text and logo itself). */
	textless: z.boolean().default(false),
});
export type GoogleAdImageProps = z.infer<typeof GoogleAdImagePropsSchema>;

/** One layer of an HTML5 banner: the device with its screen, or the proof card, on a transparent ground. */
export const GoogleAdLayerPropsSchema = z.object({
	lang: z.enum(['tr', 'en']).default('tr'),
	exam: z.enum(['yks', 'kpss']).default('yks'),
	concept: z.string().default('net-kaybi'),
	platform: z.enum(['mobile', 'web']).default('mobile'),
	layer: z.enum(['device', 'proof']).default('device'),
});
export type GoogleAdLayerProps = z.infer<typeof GoogleAdLayerPropsSchema>;

export const GoogleAdLogoPropsSchema = z.object({kind: z.enum(['kare', 'yatay']).default('kare')});
export type GoogleAdLogoProps = z.infer<typeof GoogleAdLogoPropsSchema>;

/** Layer canvas sizes (1x); the device keeps the phone or browser shape. */
export const LAYER_SIZE = {
	mobileDevice: {width: 300, height: Math.round(((300 - 16) / 390) * 844 + 16)},
	webDevice: {width: 640, height: Math.round(30 + (640 / 1440) * 900) + 2},
	proof: {width: 460, height: 420},
} as const;

export const formatSize = (format: keyof typeof AD_FORMATS) => ({width: AD_FORMATS[format].width, height: AD_FORMATS[format].height});
