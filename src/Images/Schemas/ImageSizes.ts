import {z} from 'zod';

/** Named output sizes for images, in pixels. A job may also give its own width and height. */
export const IMAGE_SIZES = {
	Square: {width: 1080, height: 1080, usage: 'Instagram / LinkedIn gönderisi'},
	Portrait: {width: 1080, height: 1350, usage: 'Instagram 4:5 gönderi, kaydırmalı seri'},
	Story: {width: 1080, height: 1920, usage: 'Hikâye, Reels kapağı'},
	Landscape: {width: 1920, height: 1080, usage: 'YouTube kapağı, web bannerı'},
} as const;

export type ImageSizeName = keyof typeof IMAGE_SIZES;
export const IMAGE_SIZE_NAMES = Object.keys(IMAGE_SIZES) as [ImageSizeName, ...ImageSizeName[]];

export const IMAGE_FORMATS = ['png', 'jpeg', 'webp'] as const;
export type ImageFormat = (typeof IMAGE_FORMATS)[number];

export const ImageDimensionsSchema = z.object({
	width: z.number().int().min(320).max(4096),
	height: z.number().int().min(320).max(4096),
});

export type ImageDimensions = z.infer<typeof ImageDimensionsSchema>;

/** A size name or explicit dimensions. */
export const ImageSizeSchema = z.union([z.enum(IMAGE_SIZE_NAMES), ImageDimensionsSchema]);

export const resolveImageSize = (size: z.infer<typeof ImageSizeSchema>): ImageDimensions =>
	typeof size === 'string' ? {width: IMAGE_SIZES[size].width, height: IMAGE_SIZES[size].height} : size;
