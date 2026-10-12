/**
 * Every short video gets a cover image, produced with the video and saved
 * next to it under the same number.
 *
 * The platforms reached through Buffer do not accept a separately uploaded
 * cover image; what they accept is "use this frame of the video as the
 * cover" (Instagram Reels and TikTok). So the cover is also held on screen
 * for the first moment of the video, and that frame is the one named as the
 * cover. YouTube Shorts offers no cover choice through the API at all; there
 * the cover image is for setting by hand in the YouTube app.
 */
export const VIDEO_COVER = {
	/** How long the cover stays on screen at the very start of the video. */
	holdSeconds: 0.2,
	/** The moment of the video sent to the platforms as its cover frame, inside the hold. */
	frameOffsetMilliseconds: 100,
	/** `03_Name.mp4` gets `03_Name_Kapak.png`. */
	fileSuffix: 'Kapak',
	/** Folder inside the bundle's `public/` the cover is served from while rendering. */
	publicDirectory: 'Covers',
} as const;
