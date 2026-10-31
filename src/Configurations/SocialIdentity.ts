import {BRAND_COLORS} from './BrandColors';

/**
 * Sınavika's fixed face on social media. Inside a video any colour goes; these
 * three never change from post to post, so the brand is recognised at a glance
 * on the profile grid and at the end of every reel (owner, 29 Oct 2026:
 * "videolarda her renk kullan tamam ama kapak stabil olsun… merkezi olsun"):
 *
 * - COVER_STANDARD: the cover, i.e. a reel's first frame and the first image of
 *   a feed post (the tiles of the profile grid).
 * - APP_END_CARD: the app card every reel ends on.
 * - STORE_BADGES: the App Store and Google Play badges, wherever a video or an
 *   image says where to get the app.
 *
 * Every value comes from the brand palette (BrandColors); nothing here is
 * chosen per post. docs/Sosyal-Kimlik-Standardi.md explains the rules.
 */

const {brand, light} = BRAND_COLORS;

export const COVER_STANDARD = {
	/** Brand navy, flat, the same on every cover (an orange light over navy turned brown: no glow). */
	ground: brand.textPrimary,
	title: '#FFFFFF',
	muted: 'rgba(255, 255, 255, 0.74)',
	/** The one marked word or phrase: white on brand orange. */
	mark: brand.primary,
	markText: '#FFFFFF',
	/** The small label above the title (series, feature or lesson). Never the brand name: the logo says that. */
	tagFill: 'rgba(255, 255, 255, 0.12)',
	tagText: '#FFFFFF',
	/** White logo, top left, the same size on every cover (BRAND.logo.sizes.cover). */
	logoColor: '#FFFFFF',
	/**
	 * One title size per cover shape, in reference pixels: every cover of that
	 * shape sets its title the same size, so covers side by side read as one
	 * series (docs/Sosyal-Gorsel-Kurallari.md §2). tall = 9:16 reel, portrait =
	 * 4:5 or square post, wide = 16:9 YouTube.
	 */
	titleSizes: {tall: 124, portrait: 96, wide: 136},
	/**
	 * Room for the title, in lines × size (reference pixels): what is left on
	 * the shape after the logo, the label and what sits under the title (the
	 * camp's lesson number on a reel). Big type gets fewer lines, smaller type
	 * more, never more than maxTitleLines. Planned titles stay within (tests);
	 * an unplanned one that does not fit steps down a size instead of spilling.
	 */
	titleBlock: {tall: 576, portrait: 400, wide: 600},
	maxTitleLines: 4,
	/** The sizes a series (a camp) may take, largest first: the largest that fits every title of the series, chosen once for the series. */
	seriesTitleSteps: [150, 136, 124, 112, 104, 96, 88],
	titleWeight: 800,
	titleLineHeight: 1.12,
	titleLetterSpacingEm: -0.035,
} as const;

type CoverShape = keyof typeof COVER_STANDARD.titleSizes;

/** How many lines a title of `size` may take on a shape. */
export const titleLinesAllowed = (shape: CoverShape, size: number): number => Math.max(1, Math.min(COVER_STANDARD.maxTitleLines, Math.floor(COVER_STANDARD.titleBlock[shape] / size)));

/** The cover shape of an image size. */
export const coverShape = (width: number, height: number): CoverShape => (width / height > 1.25 ? 'wide' : width / height < 0.65 ? 'tall' : 'portrait');

/**
 * Type inside a post, after its cover (owner, 30 Oct 2026: punto sabitliği
 * "sosyal medya için hazırlanan içerikler ve kapaklar için de geçerli… merkezi
 * olarak kur, koru"). Every role has one size, in reference pixels. A
 * carousel's pages share one title size, chosen once from all its page titles
 * (the largest step they all fit), so swiping never changes the type; before,
 * a page with a longer title dropped from 72 to 60.
 *
 * Lines are measured, not guessed (Images/Components/TextMeasure), so pictures
 * are placed under the deepest text of the post, the same place on every page.
 * Text that does not fit at these sizes is refused before rendering (each
 * template's checkLayout, enforced by resolveImageJob): never shrunk, cut or
 * run into a picture.
 */
export const POST_TYPE = {
	/** Carousel pages after the cover (PromoDeck). */
	page: {
		titleSteps: [72, 64, 56],
		titleLines: 3,
		titleWeight: 800,
		titleLineHeight: 1.04,
		titleLetterSpacingEm: -0.03,
		kicker: 28,
		kickerWeight: 700,
		text: 38,
		textLines: 3,
		textWeight: 700,
		textLineHeight: 1.3,
		/** The last page (logo, one line, one sentence). */
		closingTitle: 74,
		closingTitleLines: 3,
		closingText: 38,
		closingTextLines: 2,
		/** A student type's name on the persona cover's tiles. */
		personaName: 44,
		personaNameLines: 2,
	},
	/** The daily story (PromoStory). */
	story: {
		label: 32,
		labelWeight: 700,
		hook: 92,
		hookLines: 4,
		hookWeight: 800,
		hookLineHeight: 1.04,
		hookLetterSpacingEm: -0.03,
		sub: 40,
		subLines: 2,
		subWeight: 700,
		subLineHeight: 1.3,
		/** Drawn choice boxes: one size beside a picture, one without. */
		option: 40,
		optionAlone: 46,
		optionLines: 2,
		optionWeight: 800,
		optionLineHeight: 1.15,
		/** The flash card picture: its front and its small line. */
		cardFront: 64,
		cardFrontLines: 3,
		cardMeta: 30,
	},
	/** The one-line hook post (BoldQuestion): one hook size per shape, so hook posts side by side match. */
	hookPost: {hook: 122, hookWide: 112, hookLines: 4, hookWeight: 800, hookLetterSpacingEm: -0.02, teaser: 40, teaserLines: 3, teaserWeight: 500},
	/** The daily question card (QuestionCard): one question size whatever its length. */
	questionCard: {question: 40},
	/** The three-tile profile grid (GrowthLine): the three words share one size, the largest step all fit on one line. */
	growthLine: {wordSteps: [270, 215, 170], wordWeight: 800, wordLetterSpacingEm: -0.02, text: 62, textLines: 3, textWeight: 800},
} as const;

export const APP_END_CARD = {
	/** The button. One call, the same in every reel. */
	cta: 'Ücretsiz indir',
	/** What the voice says over the card in a narrated reel (a silent video shows the card without it). */
	narration: 'Sınavika’yı ücretsiz indir.',
	/** The narration's line id, so its clip is the same in every reel. */
	voiceId: 'app-end-card',
	site: 'sinavika.com',
	/** How long the card stays: the same in every reel, longer only if the voice needs it. */
	seconds: 3,
	/** Light ground in the brand's neutrals. */
	ground: `linear-gradient(180deg, #FFFFFF 0%, ${light.background} 55%, ${light.surfaceContainer} 100%)`,
	ink: brand.textPrimary,
	button: brand.primary,
	buttonText: '#FFFFFF',
	muted: light.textSecondary,
} as const;

export const STORE_BADGES = {
	/** Brand charcoal with white type: reads on light and dark grounds alike. */
	fill: brand.charcoal,
	text: '#FFFFFF',
	/** A thin line around the badge on a dark ground, where charcoal alone would sink. */
	borderOnDark: 'rgba(255, 255, 255, 0.38)',
	/** The small line above the store's name: the platform in Turkish, the stores' own words in English. */
	stores: [
		{id: 'appStore', name: 'App Store', small: {tr: 'iPhone için', en: 'Download on the'}},
		{id: 'googlePlay', name: 'Google Play', small: {tr: 'Android için', en: 'Get it on'}},
	],
} as const;
