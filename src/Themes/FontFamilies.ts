/**
 * Font family names as registered by the @fontsource-variable packages.
 * Which family plays which role is decided in Configurations/BrandTypography.ts;
 * the files are loaded in FontFaces.ts.
 */
export const FONT_FAMILIES = {
	/** The brand face, as in the web and mobile apps. */
	manrope: 'Manrope Variable',
	/** Technical identifiers and code only. */
	jetBrainsMono: 'JetBrains Mono Variable',
} as const;
