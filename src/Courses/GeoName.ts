import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {GEO_FILES, GEO_LAYERS} from '../Configurations/GeoData';

/**
 * The names of a map layer's areas or lines, read from public/Geo (Node only: checks and figure rendering, never a
 * composition). Undefined when the layer or its data file is not there. Every file is read once.
 */
const cache = new Map<string, readonly string[] | undefined>();
const PUBLIC = path.resolve(import.meta.dirname, '..', '..', 'public');

export const geoLayerNames = (layer: string): readonly string[] | undefined => {
	if (cache.has(layer)) return cache.get(layer);
	const spec = (GEO_LAYERS as Record<string, {file: keyof typeof GEO_FILES; object: string}>)[layer];
	const file = spec ? path.join(PUBLIC, GEO_FILES[spec.file].src) : '';
	const names = spec && existsSync(file)
		? (JSON.parse(readFileSync(file, 'utf8')).objects[spec.object]?.geometries ?? []).map((item: {properties?: {name?: string}}) => item.properties?.name ?? '').filter(Boolean)
		: undefined;
	cache.set(layer, names);
	return names;
};
