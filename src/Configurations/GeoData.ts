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
		objects: ['provinces', 'regions', 'provinceRegions', 'country'],
		credit: null,
	},
	turkeyWater: {
		src: 'Geo/TurkeyWater.json',
		objects: ['rivers', 'lakes'],
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

/** The credit a map must show for what it draws from a file: the layer's own, or the file's, or null. */
export const geoCredit = (src: string, object?: string): string | null => {
	const layer = Object.values(GEO_LAYERS).find((entry) => GEO_FILES[entry.file].src === src && entry.object === object) as {credit?: string} | undefined;
	return layer?.credit ?? Object.values(GEO_FILES).find((file) => file.src === src)?.credit ?? null;
};

/** Colours of map features that are not the lesson's: water and land. Muted, so a highlighted area stands out. */
export const MAP_COLORS = {
	water: '#7FA7C6',
	waterFill: '#DCE8F1',
	land: '#FFFFFF',
} as const;

/**
 * What a map can draw, by name. Areas are filled (land, provinces), lines
 * are stroked (rivers), water is filled with the water colour (lakes).
 *
 *   regions          the seven geographical regions with their natural borders, which cross provinces
 *                    (from a drawn map, georeferenced: about ±5 km; see docs/Courses.md)
 *   provinceRegions  the same regions as whole provinces, as the textbooks list "which province is in which region"
 */
export const GEO_LAYERS = {
	countries: {file: 'world', object: 'countries', draw: 'areas'},
	country: {file: 'turkey', object: 'country', draw: 'areas'},
	regions: {file: 'turkey', object: 'regions', draw: 'areas', credit: 'Bölge sınırları: The Emirr / Wikimedia Commons, CC BY 3.0'},
	provinceRegions: {file: 'turkey', object: 'provinceRegions', draw: 'areas'},
	provinces: {file: 'turkey', object: 'provinces', draw: 'areas'},
	districts: {file: 'turkeyDistricts', object: 'districts', draw: 'areas'},
	rivers: {file: 'turkeyWater', object: 'rivers', draw: 'lines', credit: 'Akarsular: HydroRIVERS (Lehner & Grill 2013, hydrosheds.org)'},
	lakes: {file: 'turkeyWater', object: 'lakes', draw: 'water'},
} as const satisfies Record<string, {file: keyof typeof GEO_FILES; object: string; draw: 'areas' | 'lines' | 'water'; credit?: string}>;

export type GeoLayer = keyof typeof GEO_LAYERS;
export const GEO_LAYER_NAMES = Object.keys(GEO_LAYERS) as [GeoLayer, ...GeoLayer[]];
export const GEO_AREA_LAYERS = ['countries', 'country', 'regions', 'provinceRegions', 'provinces', 'districts'] as const satisfies readonly GeoLayer[];
