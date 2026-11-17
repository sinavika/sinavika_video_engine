/**
 * The pace of sinavika.tr's problem reels (docs/Social/Sinavika-Tr-Icerik-Yaklasimi.md).
 *
 * The first cut (Launch voice at natural pace, fades, 84 BPM lo-fi) was judged
 * "Dokuru videolarındaki heyecan yok, akış çok yavaş"; this setting was
 * approved by the owner on 15 Nov 2026 ("Bu tempo iyi"). The StudyDeskStory
 * template draws its cuts from it and tests/Configurations/SocialTempo.test.ts
 * holds every sinavika.tr job to it.
 */
export const SINAVIKA_TR_TEMPO = {
	approved: '2026-11-15',
	/** Doğa, in the livelier Herald delivery, 12 % faster than her natural pace. */
	voiceover: {profile: 'Herald', voice: 'Doga', model: 'v4', pace: 1.12},
	/** Every scene cuts in hard: no fade, a punch-in from 112 % with a short white flash, then a slow creep closer. */
	cut: {scenePreset: 'none', punchFrom: 1.12, punchSeconds: 0.28, flash: 0.35, flashSeconds: 0.1, creepPerSecond: 0.012},
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
