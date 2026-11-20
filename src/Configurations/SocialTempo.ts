/**
 * The pace of sinavika.tr's problem reels (docs/Social/Sinavika-Tr-Icerik-Yaklasimi.md).
 *
 * The first cut (Launch voice at natural pace, fades, 84 BPM lo-fi) was judged
 * "Dokuru videolarındaki heyecan yok, akış çok yavaş"; this setting was
 * approved by the owner on 15 Nov 2026 ("Bu tempo iyi"). The StudyDeskStory
 * template draws its cuts from it and tests/Configurations/SocialTempo.test.ts
 * holds every sinavika.tr job to it.
 *
 * Calmed on 20 Nov 2026, after the owner watched the "Dediniz, yaptık" D1 pilot:
 * "zıplama biraz fazla göz yordu". The picture still changes at least every
 * 1.5 s and every scene still cuts hard; only the bounce went down: the scene's
 * punch from 112 % to 105 % and slower, the sub-beat push from 105 % to a slow
 * 101.5 %, cards and devices landing from 106 % instead of 118 % and less tilted,
 * the key phrase's words dropping in with less swell.
 */
export const SINAVIKA_TR_TEMPO = {
	approved: '2026-11-15',
	/** The owner's "zıplama biraz fazla göz yordu" (20 Nov 2026): the bounce below was lowered on this day. */
	calmed: '2026-11-20',
	/** Doğa, in the livelier Herald delivery, 12 % faster than her natural pace. */
	voiceover: {profile: 'Herald', voice: 'Doga', model: 'v4', pace: 1.12},
	/** Every scene cuts in hard: no fade, a soft punch-in from 105 % with a short white flash, then a slow creep closer. */
	cut: {scenePreset: 'none', punchFrom: 1.05, punchSeconds: 0.4, flash: 0.35, flashSeconds: 0.1, creepPerSecond: 0.008},
	/** Inside a scene, each ≤1.2 s sub-beat of the line pushes the frame in a little and slowly (a picture change, not a jolt). */
	subBeat: {from: 1.015, seconds: 0.6},
	/** How a card, a device or a bubble lands: from a little too big and tilted to flat, without a bounce. */
	land: {from: 1.06, tilt: 2, seconds: 0.3},
	/** The key phrase's words: how far each drops and how much it swells as it lands. */
	word: {drop: 0.25, swell: 0.12},
	/** Short, punchy lines ("Plan? Yok. O gün ne gelirse!"): no narrated line longer than this. */
	lineMaxWords: 10,
	/** A scene's narration is cut short enough that the picture changes at least this often. */
	maxSceneSeconds: 4.5,
	/**
	 * The silence around each line (Scenes/Voiceover LineGap): lines nearly touch, as Dokuru's do. With the lesson
	 * defaults (0.3 s before, 0.15 s after, the recording's own tail kept) 0.6–0.95 s of silence followed every line,
	 * about a fifth of a reel (15 Nov 2026).
	 */
	lineGap: {lead: 0.1, tail: 0.05, trimTail: true},
	/** Checked on the real recording at render (TemplateDefinition.tempo): silence between lines, and time without a picture change. */
	maxLineGapSeconds: 0.35,
	maxPictureGapSeconds: 1.5,
	/** Music tempo asked of ElevenLabs Music, read from the prompt's "N BPM". */
	musicBpm: {min: 110, max: 130},
	/** The reel's own part, before the 2 s plain card. */
	contentSeconds: {min: 15, max: 30},
} as const;
