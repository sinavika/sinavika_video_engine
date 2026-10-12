/**
 * Voice-over defaults. The voice is a brand decision, so it lives next to the
 * other brand-wide settings rather than in individual jobs.
 */
export const VOICEOVER_PROVIDERS = ['edge', 'azure'] as const;
export type VoiceoverProvider = (typeof VOICEOVER_PROVIDERS)[number];

export const VOICEOVER_DEFAULTS = {
	provider: 'edge' as VoiceoverProvider,
	/** Turkish female neural voice. The male counterpart is tr-TR-AhmetNeural. */
	voice: 'tr-TR-EmelNeural',
	language: 'tr-TR',
	/** Slightly brisk and a touch higher than neutral: energetic without sounding rushed. */
	rate: '+6%',
	pitch: '+2%',
} as const;

/** Generated audio is cached here, inside `public/`, keyed by a hash of text and voice. */
export const VOICEOVER_DIRECTORY = 'Voiceovers';
