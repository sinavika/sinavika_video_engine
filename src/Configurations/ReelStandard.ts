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
 * docs/SocialCreativePlaybook.md §11.
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
	/** No narration subtitles (owner, 30 Oct 2026: they crowd the frame); the hook and the screen's own words carry it with the sound off. */
	subtitles: false,
	/**
	 * The motion language since 30 Oct 2026 (docs/Reels-Kurgu-Fikirleri.md,
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
