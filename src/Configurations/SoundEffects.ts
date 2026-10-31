/**
 * The engine's sound effects. Each one was made once with ElevenLabs Sound
 * Effects from the description below (`npm run sound-effects`) and is kept,
 * levelled, in `public/SoundEffects/`; rendering spends nothing. Changing a
 * description does not regenerate a file: delete the file to make it again.
 *
 * Effects are not music: lesson videos and camp reels still have none
 * (docs/CourseNarration.md). The owner asked for these in the challenge
 * reels on 27 Oct 2026, after an outside review found them flat.
 */
export type SoundEffect = {
	/** Under `public/`. */
	file: string;
	/** What ElevenLabs is asked for, in English (it follows English prompts best). */
	description: string;
	/** Length asked for; leading silence is trimmed afterwards. */
	seconds: number;
	/** Loudness of the levelled file's peak, in dBFS. Narration peaks at -4 (AUDIO_LEVELS.narration). */
	peakDb: number;
};

export const SOUND_EFFECTS = {
	/** One tick of the countdown in a challenge reel; it plays on each second of the thinking time. */
	countdownTick: {
		file: 'SoundEffects/camp-reels-countdown-tick.wav',
		description: 'Loud clear wooden clock tick, one single sharp click of a mechanical stopwatch, close microphone, dry.',
		seconds: 0.6,
		peakDb: -10,
	},
	/** The answer lights up: a short, bright confirmation, just before the voice says it. */
	correctAnswer: {
		file: 'SoundEffects/camp-reels-correct-answer.wav',
		description: 'A short bright two-note chime for a correct answer in a quiz app, clean and friendly, soft attack, no music.',
		seconds: 1,
		peakDb: -9,
	},
	/** Into the next question and into the score card, with the slide. */
	transitionWhoosh: {
		file: 'SoundEffects/camp-reels-transition-whoosh.wav',
		description: 'A quick soft airy whoosh for a screen swipe transition in a mobile app, subtle and short, no music.',
		seconds: 0.6,
		peakDb: -14,
	},
	// The promotion reels' sounds (owner, 30 Oct 2026: "efektsel sesleri unutma"). The motion parts play the first
	// four by themselves (PromoMotion: Tap, Morph, CameraZoom; PromoKit: Slam, TypeOn); a template adds the rest.
	/** A fingertip tapping the screen (PromoMotion `Tap`). */
	uiTap: {file: 'SoundEffects/promo-ui-tap.wav', description: 'A single soft click of a finger tapping a smartphone touchscreen button, short, clean, close microphone, no music.', seconds: 0.5, peakDb: -12},
	/** One shape becoming the next (PromoMotion `Morph`). */
	morph: {file: 'SoundEffects/promo-morph.wav', description: 'A short soft airy swoosh that rises and ends in a gentle soft pop, like a user interface element smoothly expanding into a new shape, no music.', seconds: 0.7, peakDb: -16},
	/** Typing into a box (PromoKit `TypeOn`). */
	typing: {file: 'SoundEffects/promo-typing.wav', description: 'Fast light typing on a smartphone keyboard, soft plastic taps, about one and a half seconds, steady, no music.', seconds: 1.6, peakDb: -19},
	/** A hook word landing (PromoKit `Slam`). */
	impact: {file: 'SoundEffects/promo-impact.wav', description: 'A loud punchy bass hit, one short boom for a title landing on screen, dry, no reverb tail, no music.', seconds: 0.6, peakDb: -13},
	/** A card or chip appearing. */
	pop: {file: 'SoundEffects/promo-pop.wav', description: 'A light bubbly pop for a card appearing in a mobile app, short and friendly, no music.', seconds: 0.5, peakDb: -15},
	/** A task ticked off, a choice confirmed. */
	success: {file: 'SoundEffects/promo-success.wav', description: 'A short warm two-note confirmation chime for a completed task in a study app, soft and clean, no music.', seconds: 0.9, peakDb: -13},
	shutter: {file: 'SoundEffects/promo-shutter.wav', description: 'A crisp smartphone camera shutter click, a single shot, close microphone, no music.', seconds: 0.5, peakDb: -12},
	paperTear: {file: 'SoundEffects/promo-paper-tear.wav', description: 'A quick crisp tear of a sheet of paper ripped off a tear-off pad, short, no music.', seconds: 0.7, peakDb: -12},
	printer: {file: 'SoundEffects/promo-printer.wav', description: 'A small thermal receipt printer printing one short line, a quick electronic whirr ending in a click, no music.', seconds: 0.8, peakDb: -14},
	lever: {file: 'SoundEffects/promo-lever.wav', description: 'A heavy metal slot machine lever pulled down, a mechanical clunk and a spring returning, no music.', seconds: 0.8, peakDb: -11},
	reelStop: {file: 'SoundEffects/promo-reel-stop.wav', description: 'A single mechanical clack of a slot machine reel stopping, short and dry, no music.', seconds: 0.5, peakDb: -12},
	notification: {file: 'SoundEffects/promo-notification.wav', description: 'A short bright smartphone notification ding, a single tone, no music.', seconds: 0.6, peakDb: -14},
	bell: {file: 'SoundEffects/promo-bell.wav', description: 'A clear loud ring of a hotel reception desk bell, one ding, close microphone, no music.', seconds: 1.5, peakDb: -13},
	press: {file: 'SoundEffects/promo-press.wav', description: 'A heavy printing press stamping one page, a deep mechanical thunk with a short air hiss, no music.', seconds: 0.8, peakDb: -11},
	flip: {file: 'SoundEffects/promo-flip.wav', description: 'A quick riffle of a few pages of a paper booklet being flipped, light and short, no music.', seconds: 0.7, peakDb: -14},
	thunder: {file: 'SoundEffects/promo-thunder.wav', description: 'A short thunder crack followed by a low rolling rumble, about two seconds, no rain, no music.', seconds: 2, peakDb: -12},
	puzzleSnap: {file: 'SoundEffects/promo-puzzle-snap.wav', description: 'A satisfying plastic puzzle piece snapping into place, a crisp click and lock, short, no music.', seconds: 0.5, peakDb: -12},
	scanSweep: {file: 'SoundEffects/promo-scan-sweep.wav', description: 'A futuristic laser scanner sweep, a soft rising electronic hum passing over a page, about one second, no music.', seconds: 1.2, peakDb: -16},
	cardShuffle: {file: 'SoundEffects/promo-card-shuffle.wav', description: 'A quick riffle shuffle of a deck of playing cards, crisp paper flutter, about one second, no music.', seconds: 1.2, peakDb: -13},
	cardFlip: {file: 'SoundEffects/promo-card-flip.wav', description: 'A single playing card flipped over on a cloth table, a soft quick snap, no music.', seconds: 0.5, peakDb: -13},
	blockDrop: {file: 'SoundEffects/promo-block-drop.wav', description: 'A soft digital thud of a game block landing on a stack, short and punchy, retro but clean, no music.', seconds: 0.5, peakDb: -14},
	lineClear: {file: 'SoundEffects/promo-line-clear.wav', description: 'A bright rising digital sweep and chime as a completed row clears in a puzzle game, short and joyful, no music.', seconds: 1, peakDb: -13},
	warning: {file: 'SoundEffects/promo-warning.wav', description: 'A short double electronic warning beep, soft but urgent, no music.', seconds: 0.8, peakDb: -15},
	unlock: {file: 'SoundEffects/promo-unlock.wav', description: 'A small metal key turning in a lock and the lock clicking open, short, close microphone, no music.', seconds: 0.8, peakDb: -12},
	chalk: {file: 'SoundEffects/promo-chalk.wav', description: 'Chalk writing quickly on a school blackboard, scratchy taps and strokes, about two seconds, no music.', seconds: 2, peakDb: -15},
	star: {file: 'SoundEffects/promo-star.wav', description: 'A tiny sparkling celesta chime for a star being earned in a game, short and bright, no music.', seconds: 0.6, peakDb: -15},
} as const satisfies Record<string, SoundEffect>;

export type SoundEffectId = keyof typeof SOUND_EFFECTS;
