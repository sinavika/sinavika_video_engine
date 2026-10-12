/**
 * Single source of truth for resolution, aspect ratio, FPS and safe areas.
 * Every size in the design system is expressed for a 1080px short edge and
 * scaled by `VideoLayout.unit`, so layouts stay identical at any resolution.
 */
export const REFERENCE_SHORT_EDGE = 1080;
export const DEFAULT_FPS = 30;
export const SUPPORTED_FPS = [24, 25, 30, 50, 60] as const;

export type Orientation = 'portrait' | 'landscape' | 'square';

export type EdgeInsets = {top: number; right: number; bottom: number; left: number};

export type VideoFormat = {
	label: string;
	aspectRatio: string;
	width: number;
	height: number;
	orientation: Orientation;
	/** Area kept free of content, in reference pixels. Accounts for platform UI on vertical video. */
	safeArea: EdgeInsets;
	usage: string;
};

export const VIDEO_FORMATS = {
	Vertical: {
		label: 'Dikey 9:16',
		aspectRatio: '9:16',
		width: 1080,
		height: 1920,
		orientation: 'portrait',
		safeArea: {top: 140, right: 64, bottom: 250, left: 64},
		usage: 'Reels, Shorts, TikTok',
	},
	Horizontal: {
		label: 'Yatay 16:9',
		aspectRatio: '16:9',
		width: 1920,
		height: 1080,
		orientation: 'landscape',
		safeArea: {top: 64, right: 96, bottom: 64, left: 96},
		usage: 'YouTube, ders anlatımı',
	},
	Square: {
		label: 'Kare 1:1',
		aspectRatio: '1:1',
		width: 1080,
		height: 1080,
		orientation: 'square',
		safeArea: {top: 60, right: 64, bottom: 60, left: 64},
		usage: 'Sosyal medya gönderileri',
	},
} as const satisfies Record<string, VideoFormat>;

export type VideoFormatId = keyof typeof VIDEO_FORMATS;
export const VIDEO_FORMAT_IDS = Object.keys(VIDEO_FORMATS) as [VideoFormatId, ...VideoFormatId[]];

/** Output short edge in pixels. Applied as a render-time scale, so layout never changes. */
export const RENDER_QUALITIES = {
	'720p': 720,
	'1080p': 1080,
	'1440p': 1440,
	'2160p': 2160,
} as const;

export type RenderQuality = keyof typeof RENDER_QUALITIES;
export const RENDER_QUALITY_IDS = Object.keys(RENDER_QUALITIES) as [RenderQuality, ...RenderQuality[]];

export const qualityScale = (quality: RenderQuality): number =>
	RENDER_QUALITIES[quality] / REFERENCE_SHORT_EDGE;

export type VideoLayout = {
	width: number;
	height: number;
	orientation: Orientation;
	/** Multiplier that converts reference pixels to actual pixels. */
	unit: number;
	/** Safe area in actual pixels. */
	safeArea: EdgeInsets;
	contentWidth: number;
	contentHeight: number;
};

const orientationOf = (width: number, height: number): Orientation => {
	const ratio = width / height;
	if (ratio > 1.1) return 'landscape';
	if (ratio < 0.9) return 'portrait';
	return 'square';
};

const SAFE_AREA_BY_ORIENTATION: Record<Orientation, EdgeInsets> = {
	portrait: VIDEO_FORMATS.Vertical.safeArea,
	landscape: VIDEO_FORMATS.Horizontal.safeArea,
	square: VIDEO_FORMATS.Square.safeArea,
};

export const resolveVideoLayout = (width: number, height: number): VideoLayout => {
	const orientation = orientationOf(width, height);
	const unit = Math.min(width, height) / REFERENCE_SHORT_EDGE;
	const reference = SAFE_AREA_BY_ORIENTATION[orientation];
	const safeArea = {
		top: reference.top * unit,
		right: reference.right * unit,
		bottom: reference.bottom * unit,
		left: reference.left * unit,
	};
	return {
		width,
		height,
		orientation,
		unit,
		safeArea,
		contentWidth: width - safeArea.left - safeArea.right,
		contentHeight: height - safeArea.top - safeArea.bottom,
	};
};
