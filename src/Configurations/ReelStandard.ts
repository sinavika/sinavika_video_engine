import {APP_END_CARD} from './SocialIdentity';

/**
 * The pace every promotion reel keeps (special days keep their own rhythm).
 *
 * Measured on 29 Oct 2026 (Buffer Insights, 30 Sep – 29 Oct): viewers left
 * after 2.65 s on Instagram and 1.47 s on TikTok on average. The reel that
 * held best (6.8 s, "Netin sana yalan söylüyor") opened on a four-word claim
 * against what the student believes; feature reels ("Soru? Fotoğrafını çek.",
 * "Süre başladı") lost viewers in the first second. An outside review of the
 * same reels (Gemini, same day) gave the limits below. Rules and data:
 * docs/Social/SocialCreativePlaybook.md §11.
 */
export const REEL_STANDARD = {
	/** The words on screen at the first frame, which are also the first words said. */
	hookMaxWords: 5,
	/** The hook is read and said within this time. */
	hookMaxSeconds: 1.8,
	/** Something moves on screen before this moment: no still poster at the start. */
	firstMotionSeconds: 0.5,
	/** No shot or screen stands still longer than this. */
	maxStillSeconds: 2,
	/** The reel's own part, before the app card. */
	contentMaxSeconds: 15,
	/** The whole reel with the app card. */
	maxSeconds: 15 + APP_END_CARD.seconds,
	/** About 13 s of Doğa's voice; the card's line is not part of it (the card says it). */
	voiceoverMaxCharacters: 190,
	/**
	 * Rules from the review of the November reels (Gemini, 9 Nov 2026). They
	 * hold for every reel from then on, whenever it is made, and are checked on
	 * the plan by `checkReelPlan` (src/Social/ReelPlanCheck.ts); only the
	 * reels produced before are listed out. Rules and reasons:
	 * docs/Social/SocialCreativePlaybook.md §11, data in
	 * docs/Analiz/2026-11-09-Kasim-Reels-Gemini.md.
	 */
	plan: {
		/** The cover frame stays only this long; then a moving event starts (no navy text screen as the first second). */
		coverHoldMaxSeconds: 0.2,
		/** Every beat of the reel's own part brings something new within this time: motion alone is not new information. */
		newInfoMaxSeconds: 2,
		/** A looping prop (wheel, counter, printer) is on screen alone at most this long. */
		loopingPropMaxSeconds: 1.2,
		/** The app's one concrete result is on screen by this moment. */
		appResultBySeconds: 10,
		/** Worn formats that scored lowest (35–40): never the reel's picture. */
		wornFormats: ['kronometre', 'pomodoro', 'bildirim yağmuru', 'bildirim baloncuk', 'çark', 'makara', 'slot'],
	},
	/** No narration subtitles (owner, 30 Oct 2026: they crowd the frame); the hook and the screen's own words carry it with the sound off. */
	subtitles: false,
	/**
	 * The motion language since 30 Oct 2026 (docs/Social/SocialCreativePlaybook.md §3,
	 * from the best prompts on prompt-motion.com): cuts land on the music's
	 * beat (Scenes/Rhythm); each shot is made out of the previous one where it
	 * can be (PromoMotion `Morph`); a fingertip causes each change on a screen
	 * (`Tap`); the camera moves in on what is being said (`CameraZoom`); fast
	 * moves blur along their speed. Every move is heard (owner, 30 Oct 2026):
	 * those parts and `Slam`/`TypeOn` play their own sound effect, a template
	 * adds its own (src/Configurations/SoundEffects.ts).
	 */
	motion: {
		/** A hold longer than this reads as a stopped video. */
		maxHoldSeconds: 0.5,
		/** Never used: they read as a template or as cheap. */
		banned: ['parçacık patlaması', 'parıltı ve lens parlaması', 'kamera sarsıntısı', 'RGB kayması', 'çapraz geçiş', 'zıplayan yumuşatma'],
	},
} as const;
