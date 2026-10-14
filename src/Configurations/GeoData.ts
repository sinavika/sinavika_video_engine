/**
 * The map data of the education videos, in public/Geo, built by `npm run geo`
 * (scripts/FetchGeo.ts) from free sources. Every file is TopoJSON with the
 * Turkish name of each area or line in `name`.
 *
 * A file whose licence asks for a credit has it here; a map that draws it
 * shows the credit in its corner.
 */
export const GEO_FILES = {
	turkey: {
		src: 'Geo/Turkey.json',
		objects: ['provinces', 'regions', 'country', 'rivers', 'lakes'],
		credit: null,
	},
	turkeyDistricts: {
		src: 'Geo/TurkeyDistricts.json',
		objects: ['districts'],
		credit: '© OpenStreetMap katkıda bulunanlar',
	},
	world: {
		src: 'Geo/World.json',
		objects: ['countries'],
		credit: null,
	},
} as const satisfies Record<string, {src: string; objects: readonly string[]; credit: string | null}>;

/** The credit a map must show for a data file, or null. */
export const geoCredit = (src: string): string | null => Object.values(GEO_FILES).find((file) => file.src === src)?.credit ?? null;

/** Colours of map features that are not the lesson's: water and land. Muted, so a highlighted area stands out. */
export const MAP_COLORS = {
	water: '#7FA7C6',
	waterFill: '#DCE8F1',
	land: '#FFFFFF',
} as const;

/**
 * What a map can draw, by name. Areas are filled (land, provinces), lines
 * are stroked (rivers), water is filled with the water colour (lakes).
 */
export const GEO_LAYERS = {
	countries: {file: 'world', object: 'countries', draw: 'areas'},
	country: {file: 'turkey', object: 'country', draw: 'areas'},
	regions: {file: 'turkey', object: 'regions', draw: 'areas'},
	provinces: {file: 'turkey', object: 'provinces', draw: 'areas'},
	districts: {file: 'turkeyDistricts', object: 'districts', draw: 'areas'},
	rivers: {file: 'turkey', object: 'rivers', draw: 'lines'},
	lakes: {file: 'turkey', object: 'lakes', draw: 'water'},
} as const satisfies Record<string, {file: keyof typeof GEO_FILES; object: string; draw: 'areas' | 'lines' | 'water'}>;

export type GeoLayer = keyof typeof GEO_LAYERS;
export const GEO_LAYER_NAMES = Object.keys(GEO_LAYERS) as [GeoLayer, ...GeoLayer[]];
export const GEO_AREA_LAYERS = ['countries', 'country', 'regions', 'provinces', 'districts'] as const satisfies readonly GeoLayer[];
