/**
 * Builds the map data of the education videos from free sources.
 *
 *   npm run geo
 *
 * Writes TopoJSON files to public/Geo, each with Turkish names in `name`:
 *
 *   Turkey.json           provinces (81, with plate code and region), regions (7, natural borders),
 *                         provinceRegions (7, unions of provinces), country (outline)
 *   TurkeyWater.json      rivers (traced on HydroRIVERS), lakes
 *   TurkeyDistricts.json  districts (973, with their province)
 *   World.json            countries of the world
 *   Sources.json          where each layer comes from and its licence
 *
 * A map visual uses them as {"kind": "file", "src": "Geo/Turkey.json", "object": "provinces"}.
 *
 * Sources: Natural Earth 5.1.2 (public domain) for provinces, countries and
 * lakes; geoBoundaries (OpenStreetMap, ODbL) for districts, which requires
 * the credit "© OpenStreetMap katkıda bulunanlar" on maps that show them;
 * the regional maps of The Emirr on Wikimedia Commons (CC BY 3.0) for the
 * regions' natural borders (scripts/GeoRegions.ts); HydroRIVERS (free, with
 * credit) for rivers (scripts/GeoRivers.ts). Maps show each credit when they
 * draw that layer. Downloads are about 200 MB once; only what is needed is kept.
 */
import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import type {Feature, FeatureCollection, Geometry, MultiPolygon, Position} from 'geojson';
import {merge} from 'topojson-client';
import {topology} from 'topojson-server';
import type {GeometryCollection, Topology} from 'topojson-specification';
import polygonClipping, {type MultiPolygon as ClipMultiPolygon} from 'polygon-clipping';
import {TURKEY_REGIONS, regionOfProvince} from '../src/Configurations/TurkeyRegions';
import {REGION_MAPS, buildRegions} from './GeoRegions';
import {HYDRORIVERS_URL, RIVERS, readReaches, traceRivers} from './GeoRivers';

const ROOT = path.resolve(import.meta.dirname, '..');
const GEO = path.join(ROOT, 'public', 'Geo');
const NATURAL_EARTH = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson';
const DISTRICTS = 'https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/TUR/ADM2/geoBoundaries-TUR-ADM2_simplified.geojson';
/** Provinces from the same source as the districts, used only to tell which province a district is in. */
const DISTRICT_PROVINCES = 'https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/TUR/ADM1/geoBoundaries-TUR-ADM1_simplified.geojson';
/** Turkey and its surroundings, for rivers and lakes: [west, south, east, north]. */
const AROUND_TURKEY = [25.5, 35.8, 44.9, 42.2] as const;
/** Coordinates are rounded to this grid (about 100 m), which is far below what a video can show. */
const QUANTIZATION = 1e5;

/**
 * Turkish names of the lakes Natural Earth has in Turkey (its world set and its European supplement), by
 * Natural Earth's own name; others are left out. Two are named after a mountain beside them in the data and
 * are put right by their position: "Saksak Dagi" is Karakaya Baraj Gölü, "Hazar Dagi" is Hazar Gölü.
 */
const LAKE_NAMES: Record<string, string> = {
	'Ataturk Barajt': 'Atatürk Baraj Gölü',
	'Beyşehir': 'Beyşehir Gölü',
	'Eğirdir': 'Eğirdir Gölü',
	'Keban Baraji': 'Keban Baraj Gölü',
	'Lake Tuz': 'Tuz Gölü',
	'Lake Van': 'Van Gölü',
	'Saksak Dagi': 'Karakaya Baraj Gölü',
	'Akşehir Gölü': 'Akşehir Gölü',
	'Bafa Gölü': 'Bafa Gölü',
	'Burdur Gölü': 'Burdur Gölü',
	'Durusu Golu': 'Terkos (Durusu) Gölü',
	'Erçek': 'Erçek Gölü',
	'Hazar Dagi': 'Hazar Gölü',
	'Kuş Gölü': 'Kuş (Manyas) Gölü',
	'Kyceiz Gölü': 'Köyceğiz Gölü',
	'Marmara Gölü': 'Marmara Gölü',
	'Salda Gölü': 'Salda Gölü',
	'Sapanca Gölü': 'Sapanca Gölü',
	'Seyfe Gölü': 'Seyfe Gölü',
	'Seyhan Baraji': 'Seyhan Baraj Gölü',
	'Ulubat Gölü': 'Uluabat Gölü',
	'Yay Gölü': 'Yay Gölü',
	'Çıldır': 'Çıldır Gölü',
	'İznik Gölü': 'İznik Gölü',
};
/** The regional maps of Wikimedia Commons, by file name. */
const commonsFile = (file: string) => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}`;
/** Wikimedia and HydroSHEDS ask for a user agent that names the tool. */
const HEADERS = {'User-Agent': 'SinavikaVideoEngine/1.0 (npm run geo)'};
/** Official spellings where Natural Earth uses an older one. */
const PROVINCE_SPELLING: Record<string, string> = {'Elâzığ': 'Elazığ', 'Hakkâri': 'Hakkari'};

type Props = Record<string, unknown>;

const download = async (url: string): Promise<FeatureCollection<Geometry, Props>> => {
	console.log(`indiriliyor: ${url}`);
	const response = await fetch(url, {headers: HEADERS});
	if (!response.ok) throw new Error(`${url}: ${response.status}`);
	return (await response.json()) as FeatureCollection<Geometry, Props>;
};
const downloadBytes = async (url: string): Promise<Uint8Array> => {
	console.log(`indiriliyor: ${url}`);
	const response = await fetch(url, {headers: HEADERS});
	if (!response.ok) throw new Error(`${url}: ${response.status}`);
	return new Uint8Array(await response.arrayBuffer());
};
const downloadText = async (url: string): Promise<string> => new TextDecoder().decode(await downloadBytes(url));

const positions = function* (coordinates: unknown): Generator<Position> {
	if (!Array.isArray(coordinates) || coordinates.length === 0) return;
	if (typeof coordinates[0] === 'number') yield coordinates as Position;
	else for (const item of coordinates) yield* positions(item);
};

const nearTurkey = (geometry: Geometry | null): boolean => {
	if (!geometry || !('coordinates' in geometry)) return false;
	const [west, south, east, north] = AROUND_TURKEY;
	for (const [lon, lat] of positions(geometry.coordinates)) if (lon >= west && lon <= east && lat >= south && lat <= north) return true;
	return false;
};

/**
 * d3-geo draws on a sphere and reads a ring's direction as "inside": an
 * outer ring must run clockwise, a hole anticlockwise, or the shape becomes
 * the rest of the world. GeoJSON from other tools often uses the opposite
 * (RFC 7946) order, so every area is rewound to d3's.
 */
const signedArea = (ring: Position[]): number => ring.reduce((sum, [x, y], index) => {
	const [nx, ny] = ring[(index + 1) % ring.length];
	return sum + (x * ny - nx * y);
}, 0);
const rewindPolygon = (rings: Position[][]): Position[][] =>
	rings.map((ring, index) => ((index === 0) === signedArea(ring) > 0 ? [...ring].reverse() : ring));
const rewind = (geometry: Geometry): Geometry =>
	geometry.type === 'Polygon'
		? {...geometry, coordinates: rewindPolygon(geometry.coordinates)}
		: geometry.type === 'MultiPolygon'
			? {...geometry, coordinates: geometry.coordinates.map(rewindPolygon)}
			: geometry;

const feature = (geometry: Geometry, properties: Props): Feature<Geometry, Props> => ({type: 'Feature', properties, geometry: rewind(geometry)});

const write = async (name: string, objects: Record<string, FeatureCollection<Geometry, Props>>) => {
	const topo = topology(objects, QUANTIZATION) as unknown as Topology;
	const file = path.join(GEO, name);
	await writeFile(file, JSON.stringify(topo));
	console.log(`${name}: ${Object.entries(topo.objects).map(([key, value]) => `${key} ${(value as GeometryCollection).geometries.length}`).join(', ')}`);
};

await mkdir(GEO, {recursive: true});
const collection = (features: Feature<Geometry, Props>[]): FeatureCollection<Geometry, Props> => ({type: 'FeatureCollection', features});

// Provinces, with their plate code and region.
const provinces = (await download(`${NATURAL_EARTH}/ne_10m_admin_1_states_provinces.geojson`)).features
	.filter((item) => item.properties.adm0_a3 === 'TUR')
	.map((item) => {
		const raw = String(item.properties.name_tr ?? item.properties.name);
		const code = String(item.properties.iso_3166_2);
		const region = regionOfProvince(code);
		if (!region) throw new Error(`No region for ${raw} (${code}).`);
		return feature(item.geometry, {name: PROVINCE_SPELLING[raw] ?? raw, code, plate: Number(code.slice(3)), region: TURKEY_REGIONS[region].name});
	});
if (provinces.length !== 81) throw new Error(`Expected 81 provinces, got ${provinces.length}.`);

// Lakes in and around Turkey, under their Turkish names.
const lakes = [
	...(await download(`${NATURAL_EARTH}/ne_10m_lakes.geojson`)).features,
	...(await download(`${NATURAL_EARTH}/ne_10m_lakes_europe.geojson`)).features,
]
	.filter((item) => item.geometry && nearTurkey(item.geometry) && LAKE_NAMES[String(item.properties.name)])
	.map((item) => feature(item.geometry, {name: LAKE_NAMES[String(item.properties.name)]}));

// Rivers, traced on HydroRIVERS from the sources and mouths in scripts/GeoRivers.ts; the few it cannot carry come from Natural Earth.
const {traced, problems: riverProblems} = traceRivers(await readReaches(await downloadBytes(HYDRORIVERS_URL)));
riverProblems.forEach((problem) => console.warn(`  akarsu atlandı: ${problem}`));
const europeRivers = (await download(`${NATURAL_EARTH}/ne_10m_rivers_europe.geojson`)).features;
const rivers = [
	...traced.map((river) => feature({type: 'MultiLineString', coordinates: river.lines}, {name: river.name, wikidata: river.wikidata, source: 'HydroRIVERS'})),
	...RIVERS.filter((spec) => spec.naturalEarth).flatMap((spec) =>
		europeRivers.filter((item) => item.properties.name === spec.naturalEarth && item.geometry).map((item) => feature(item.geometry, {name: spec.name, wikidata: spec.wikidata, source: 'Natural Earth'})),
	),
];
await write('TurkeyWater.json', {rivers: collection(rivers), lakes: collection(lakes)});

// The country outline and the textbook regions are unions of provinces (each province in one region).
const provinceTopology = topology({provinces: collection(provinces)}, QUANTIZATION) as unknown as Topology;
const provinceGeometries = (provinceTopology.objects.provinces as GeometryCollection<Props>).geometries;
const provinceRegions = Object.values(TURKEY_REGIONS).map((region) =>
	feature(merge(provinceTopology, provinceGeometries.filter((item) => (item.properties as Props | undefined)?.region === region.name) as never) as MultiPolygon, {name: region.name}),
);
const countryShape = merge(provinceTopology, provinceGeometries as never) as MultiPolygon;
const country = feature(countryShape, {name: 'Türkiye'});

// The regions with their natural borders, from the regional maps (scripts/GeoRegions.ts).
const regionMaps = [];
for (const map of REGION_MAPS) regionMaps.push({name: map.name, svg: await downloadText(commonsFile(map.file))});
const natural = buildRegions(regionMaps, polygonClipping.union(countryShape.coordinates as ClipMultiPolygon));
console.log(`  bölge haritaları oturtuldu (${natural.fit.fit.mercator ? 'Mercator' : 'eş dikdörtgen'}): dış sınır farkı medyan ${natural.fit.medianKm.toFixed(1)} km, %90 ${natural.fit.p90Km.toFixed(1)} km`);
const regions = natural.regions.map((region) => feature({type: 'MultiPolygon', coordinates: region.shape}, {name: region.name}));
await write('Turkey.json', {provinces: collection(provinces), regions: collection(regions), provinceRegions: collection(provinceRegions), country: collection([country])});

/**
 * Point-in-polygon on longitude and latitude (ray casting). At the scale of a
 * province this is exact enough, and unlike spherical tests it does not
 * depend on which way a ring is wound.
 */
const containsPoint = (geometry: Geometry, [x, y]: Position): boolean => {
	const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.type === 'MultiPolygon' ? geometry.coordinates : [];
	return polygons.some((rings) => {
		let inside = false;
		for (const ring of rings) {
			for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
				const [xi, yi] = ring[i];
				const [xj, yj] = ring[j];
				if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
			}
		}
		return inside;
	});
};

/** The area centroid of a shape's largest ring: inside the shape for all but very bent districts. */
const centreOf = (geometry: Geometry): Position => {
	const rings = geometry.type === 'Polygon' ? [geometry.coordinates[0]] : geometry.type === 'MultiPolygon' ? geometry.coordinates.map((polygon) => polygon[0]) : [];
	let best: {area: number; centre: Position} = {area: -1, centre: [0, 0]};
	for (const ring of rings) {
		let [area, cx, cy] = [0, 0, 0];
		for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
			const cross = ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
			area += cross;
			cx += (ring[j][0] + ring[i][0]) * cross;
			cy += (ring[j][1] + ring[i][1]) * cross;
		}
		if (Math.abs(area) > best.area) best = {area: Math.abs(area), centre: [cx / (3 * area), cy / (3 * area)]};
	}
	return best.centre;
};

// Districts, each joined to the province its centre lies in.
// Districts and their provinces come from the same source (OpenStreetMap), so their borders agree;
// a district belongs to the province that contains its centre.
const sameName = (a: string, b: string) => a.toLocaleLowerCase('tr').replace(/â/g, 'a') === b.toLocaleLowerCase('tr').replace(/â/g, 'a');
const provinceShapes = (await download(DISTRICT_PROVINCES)).features.map((item) => {
	const match = provinces.find((province) => sameName(String(province.properties.name), String(item.properties.shapeName)));
	if (!match) throw new Error(`No province for ${String(item.properties.shapeName)}.`);
	return {name: String(match.properties.name), code: String(match.properties.code), shape: item.geometry};
});
const districts = (await download(DISTRICTS)).features.map((item) => {
	const centre = centreOf(item.geometry) as [number, number];
	const inside = provinceShapes.find((province) => containsPoint(province.shape, centre));
	// A bent or coastal district whose centre falls outside every province goes where most of its border points are.
	const byVertices = () => {
		const points = 'coordinates' in item.geometry ? [...positions(item.geometry.coordinates)] : [];
		const score = (province: (typeof provinceShapes)[number]) => points.filter((point, index) => index % 3 === 0 && containsPoint(province.shape, point)).length;
		return provinceShapes.reduce((best, candidate) => (score(candidate) > score(best) ? candidate : best));
	};
	const province = inside ?? byVertices();
	return feature(item.geometry, {name: String(item.properties.shapeName), province: province.name, code: province.code});
});
await write('TurkeyDistricts.json', {districts: collection(districts)});

// The world, with Turkish country names.
const countries = (await download(`${NATURAL_EARTH}/ne_50m_admin_0_countries.geojson`)).features.map((item) =>
	feature(item.geometry, {name: String(item.properties.NAME_TR ?? item.properties.NAME), english: String(item.properties.NAME), iso: String(item.properties.ISO_A3)}),
);
await write('World.json', {countries: collection(countries)});

const accessed = new Date().toISOString().slice(0, 10);
await writeFile(
	path.join(GEO, 'Sources.json'),
	`${JSON.stringify(
		{
			'Turkey.json': {
				source: 'Natural Earth 5.1.2: Admin 1 (1:10m)',
				url: 'https://www.naturalearthdata.com/',
				license: 'Public domain',
				credit: null,
				regions: {
					source: 'Regional location maps by The Emirr, Wikimedia Commons (2010), georeferenced to the Natural Earth outline; coast and borders from Natural Earth',
					files: REGION_MAPS.map((map) => commonsFile(map.file)),
					license: 'CC BY 3.0',
					credit: 'Bölge sınırları: The Emirr / Wikimedia Commons, CC BY 3.0',
					fit: {projection: natural.fit.fit.mercator ? 'Mercator' : 'equirectangular', medianKm: Number(natural.fit.medianKm.toFixed(1)), p90Km: Number(natural.fit.p90Km.toFixed(1))},
				},
				provinceRegions: 'Union of provinces by src/Configurations/TurkeyRegions.ts (textbook assignment of each province to one region)',
				accessed,
			},
			'TurkeyWater.json': {
				rivers: {source: 'HydroRIVERS v1.0 (Lehner & Grill 2013), traced from Wikidata sources and mouths; Çarşamba Çayı from Natural Earth', url: 'https://www.hydrosheds.org/products/hydrorivers', license: 'HydroSHEDS licence (free for commercial and non-commercial use, with credit)', credit: 'Akarsular: HydroRIVERS (Lehner & Grill 2013, hydrosheds.org)', rivers: traced.map((river) => ({name: river.name, wikidata: river.wikidata, km: river.km, method: river.method})), skipped: riverProblems},
				lakes: {source: 'Natural Earth 5.1.2: lakes (1:10m) and the European supplement', license: 'Public domain', credit: null},
				accessed,
			},
			'TurkeyDistricts.json': {source: 'geoBoundaries gbOpen TUR ADM2 (OpenStreetMap, OSM Boundaries), simplified', url: 'https://www.geoboundaries.org/', license: 'ODbL 1.0', credit: '© OpenStreetMap katkıda bulunanlar', accessed},
			'World.json': {source: 'Natural Earth 5.1.2: Admin 0 countries (1:50m), Turkish names (NAME_TR)', url: 'https://www.naturalearthdata.com/', license: 'Public domain', credit: null, accessed},
		},
		null,
		2,
	)}\n`,
);
console.log('public/Geo hazır.');
