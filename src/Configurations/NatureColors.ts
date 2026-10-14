/**
 * Colours of the natural-process visuals (rivers, earthquakes, landforms):
 * fixed, because water is blue and rock is brown in every lesson and theme.
 * The lesson colour is still used for what the narration points at.
 */
export const NATURE_COLORS = {
	water: '#4F8FC9',
	waterLight: '#A9CBE8',
	waterDeep: '#2F6A9F',
	land: '#9CC57A',
	landDark: '#6F9E52',
	soil: '#C9A97A',
	rock: ['#B88E5E', '#A27747', '#8C6239', '#76522F'] as const,
	sand: '#E2C98F',
	gravel: '#8F8578',
	silt: '#B8A27E',
	stress: '#E4572E',
	wavePrimary: '#E4572E',
	waveSecondary: '#7A4FD6',
	waveSurface: '#2F6A9F',
	house: '#F4EDE1',
	roof: '#B5523B',
} as const;
