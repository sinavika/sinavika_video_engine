import {z} from 'zod';

/**
 * Pictures the education videos may show (historical photographs and
 * paintings, maps, specimens), each with where it came from and under which
 * licence. The files live in public/Media; this list is
 * public/Media/Credits.json. A picture card (visual kind `picture`) can only
 * point into public/Media, and `npm run curriculum -- check` refuses a
 * script whose pictures are not listed here.
 *
 * Only licences that allow use in a published video are accepted: public
 * domain, CC0, CC BY and CC BY-SA. The credit line is shown on the card.
 */
export const MEDIA_DIRECTORY = 'Media';
export const MEDIA_CREDITS_FILE = 'Credits.json';

export const MEDIA_LICENSES = ['PD', 'CC0', 'CC BY', 'CC BY-SA'] as const;

export const MediaEntrySchema = z.object({
	/** Path inside public/, e.g. "Media/History/Ataturk_1923.jpg". */
	file: z.string().regex(/^Media\/[\w./-]+$/),
	title: z.string().min(1).max(200),
	author: z.string().min(1).max(200),
	/** The page the file was taken from (Wikimedia Commons, Pexels, Unsplash, a museum). */
	source: z.url(),
	license: z.enum(MEDIA_LICENSES),
	/** For CC licences: the version, e.g. "4.0". */
	licenseVersion: z.string().max(10).optional(),
	licenseUrl: z.url().optional(),
	/** The line shown under the picture. */
	credit: z.string().min(1).max(120),
	accessed: z.iso.date(),
});

export type MediaEntry = z.infer<typeof MediaEntrySchema>;

export const MediaCreditsSchema = z.object({entries: z.array(MediaEntrySchema)});

/** The credit line a licence requires: author, licence and source site. */
export const creditLine = (entry: Pick<MediaEntry, 'author' | 'license' | 'licenseVersion'>, site: string): string =>
	entry.license === 'PD' || entry.license === 'CC0' ? `${entry.author} · Kamu malı · ${site}` : `${entry.author} · ${entry.license}${entry.licenseVersion ? ` ${entry.licenseVersion}` : ''} · ${site}`;
