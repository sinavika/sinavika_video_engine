/**
 * Single source of truth for resolution, aspect ratio, FPS and safe areas.
 * Every size in the design system is expressed for a 1080px short edge and
 * scaled by `VideoLayout.unit`, so layouts stay identical at any resolution.
 */
const REFERENCE_SHORT_EDGE = 1080;
export const DEFAULT_FPS = 30;
export const SUPPORTED_FPS = [24, 25, 30, 50, 60] as const;

export type Orientation = 'portrait' | 'landscape' | 'square';

type EdgeInsets = {top: number; right: number; bottom: number; left: number};

type VideoFormat = {
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
const RENDER_QUALITIES = {
	'720p': 720,
	'1080p': 1080,
	'1440p': 1440,
	'2160p': 2160,
} as const;

/**
 * Rule: every video is rendered at the highest quality the engine has, 2160p
 * (4K), unless a job asks otherwise. The rendered file is the master: YouTube
 * lessons and shorts are uploaded as they are, in 4K.
 *
 * Instagram's API accepts at most 1920 pixels of width and Buffer converts
 * larger video down to Full HD with its own encoder, which looks worse than
 * ours. So social posts get a copy made here, at the platforms' size, with
 * the same encoding (SOCIAL_DELIVERY, Services/PlatformCopies): the master
 * stays 4K and nobody else's encoder ever scales it.
 */
export const DEFAULT_RENDER_QUALITY: RenderQuality = '2160p';

/**
 * How the final file is encoded. The platforms re-encode whatever they are
 * given, so the file should arrive with more detail than they will keep: a
 * very low CRF and a slow preset.
 */
export const VIDEO_ENCODING = {
	/** x264 constant quality: lower is better; 18 is "visually lossless", 12 leaves ample headroom for the platforms' re-encode. */
	crf: 12,
	x264Preset: 'slow',
	/** Within the 128-192 kbps AAC that Instagram and Buffer ask for. */
	audioBitrate: '192k',
} as const;

/**
 * The largest video the social platforms keep (via Buffer): a 1080 px short
 * edge, under Instagram's 25 Mbps. Larger masters are scaled down here, with
 * Lanczos, at the same CRF but capped below that bitrate.
 */
export const SOCIAL_DELIVERY = {maxShortEdge: 1080, maxBitrate: '24M', bufferSize: '48M'} as const;

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
