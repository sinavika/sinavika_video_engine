import {conceptsFor, type AdConcept} from './GoogleAdsPlan';

/**
 * The ground of every Google Ads picture, banner, HTML5 banner and video:
 * the brand palette only (owner, 30 Oct 2026: "yeşil renk ne alaka… renk
 * paletimize uygun yapıda kur"). Before, each concept stood on its module's
 * colour (teal Ders Planı, purple Akıllı Özet, pink Bilgi Kartları), which
 * read as another brand. Module colours stay where they belong, inside the
 * app screens.
 *
 * Two grounds, brand orange and brand navy, alternate with the concept's place
 * in its exam (1st and 3rd orange, 2nd and 4th navy), so a rotation still
 * changes from ad to ad and a video's two concepts change ground.
 */
const AD_GROUNDS = {
	orange: ['#F26B1D', '#C2410C'],
	navy: ['#1B2B44', '#0B1C30'],
} as const;

export const adGroundOf = (concept: AdConcept): readonly [string, string] => (conceptsFor(concept.exam).findIndex((entry) => entry.id === concept.id) % 2 === 0 ? AD_GROUNDS.orange : AD_GROUNDS.navy);

