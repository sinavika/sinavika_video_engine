/**
 * Map data for geography and history lessons, beyond the world map that
 * ships with the engine (world-atlas: Natural Earth countries).
 *
 *   npm run geo -- turkey
 *       Turkey's 81 provinces from Natural Earth (admin 1, 1:10m, public
 *       domain), saved as public/Geo/TurkeyProvinces.json with Turkish names
 *       (`name`). A map visual uses it as
 *       {"kind": "file", "src": "Geo/TurkeyProvinces.json"}.
 *
 * Natural Earth is public domain, so no credit is required; it is recorded
 * in public/Geo/Sources.json anyway. The download is about 40 MB once; only
 * Turkey's provinces are kept.
 */
import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const GEO = path.join(ROOT, 'public', 'Geo');
const NATURAL_EARTH_ADMIN1 = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_admin_1_states_provinces.geojson';

type Province = {type: 'Feature'; properties: Record<string, unknown>; geometry: unknown};

const [command] = process.argv.slice(2);
if (command !== 'turkey') {
	console.error('Kullanım: npm run geo -- turkey');
	process.exit(2);
}

console.log('Natural Earth il sınırları indiriliyor...');
const all = (await (await fetch(NATURAL_EARTH_ADMIN1)).json()) as {features: Province[]};
const provinces = all.features
	.filter((item) => item.properties.adm0_a3 === 'TUR')
	.map((item) => ({
		type: 'Feature',
		properties: {name: String(item.properties.name_tr ?? item.properties.name), code: item.properties.iso_3166_2, latin: item.properties.name},
		geometry: item.geometry,
	}));
await mkdir(GEO, {recursive: true});
await writeFile(path.join(GEO, 'TurkeyProvinces.json'), JSON.stringify({type: 'FeatureCollection', features: provinces}));
await writeFile(
	path.join(GEO, 'Sources.json'),
	`${JSON.stringify({TurkeyProvinces: {source: 'Natural Earth, Admin 1 – States, Provinces, 1:10m, v5.1.2', url: 'https://www.naturalearthdata.com/', license: 'Public domain', accessed: new Date().toISOString().slice(0, 10)}}, null, 2)}\n`,
);
console.log(`${provinces.length} il → public/Geo/TurkeyProvinces.json`);
