/**
 * Font family names as registered by the @fontsource-variable packages.
 * All of them ship the latin-ext subset, which covers Turkish (ç ğ ı İ ö ş ü).
 * The font files themselves are loaded in FontFaces.ts.
 */
export const FONT_FAMILIES = {
	inter: 'Inter Variable',
	plusJakartaSans: 'Plus Jakarta Sans Variable',
	sourceSerif: 'Source Serif 4 Variable',
	spaceGrotesk: 'Space Grotesk Variable',
	jetBrainsMono: 'JetBrains Mono Variable',
	nunito: 'Nunito Variable',
	caveat: 'Caveat Variable',
} as const;

type GenericFamily = 'sans-serif' | 'serif' | 'monospace' | 'cursive';

export const fontStack = (family: string, fallback: GenericFamily = 'sans-serif'): string =>
	`'${family}', ${fallback}`;
