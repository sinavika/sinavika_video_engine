import {geoArea, geoBounds, geoCentroid, geoDistance, geoGraticule, geoMercator, geoNaturalEarth1, geoPath, type GeoPermissibleObjects} from 'd3-geo';
import type {Feature, FeatureCollection, Geometry} from 'geojson';
import React, {useEffect, useId, useMemo, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {feature} from 'topojson-client';
import type {GeometryCollection, Topology} from 'topojson-specification';
import {GEO_FILES, GEO_LAYERS, geoCredit, type GeoLayer, MAP_COLORS as LIGHT_MAP_COLORS, MAP_COLORS_DARK} from '../../../Configurations/GeoData';
import {relativeLuminance} from '../../../Themes/ColorPalette';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {useFigureFont, useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import {type CourseVisual} from '../VisualSchema';
import {degreeLabel, MAP_LINES, SHADE_COLORS} from './HumanitiesSchema';
import {easeFrom} from '../../../Animations/Motion';
import {Part, useBeatStartFor} from '../VisualTimeline';

/** A river or lake a beat points at: deeper blue, so it stays water and still stands out. */
const WATER_FOCUS = '#1F5F99';

/** The room a lake keeps free of names: its box on the map, padded. */
export const lakeBox = ([[x0, y0], [x1, y1]]: readonly [readonly [number, number], readonly [number, number]], pad: number): Box => ({left: x0 - pad, right: x1 + pad, top: y0 - pad, bottom: y1 + pad});

/** The ring round a lake a beat points at: around its box, never smaller than `least`, so a small lake can be found. */
export const lakeRing = ([x0, y0]: readonly [number, number], [x1, y1]: readonly [number, number], least: number) => ({
	cx: (x0 + x1) / 2,
	cy: (y0 + y1) / 2,
	r: Math.max(least, Math.hypot(x1 - x0, y1 - y0) / 2 + least / 2),
});

type MapSpec = Extract<CourseVisual, {kind: 'map'}>;

type Screen = readonly [number, number];

/**
 * A route as drawn: a smooth curve through its points instead of straight stretches with corners, as a migration or a
 * campaign is drawn in an atlas. The curve is a centripetal Catmull-Rom spline (`steps` samples per stretch): with
 * points close together (İstanbul and İznik on the First Crusade) the plain spline overshot into loops over the Black
 * Sea (KPSS Tarih 3); the centripetal one stays near the points. The ends are mirrored so the curve starts and stops
 * on the first and last points.
 */
export const routeCurve = (points: readonly Screen[], steps = 12): [number, number][] => {
	if (points.length < 3) return points.map(([x, y]) => [x, y]);
	const mirror = (a: Screen, b: Screen): Screen => [2 * a[0] - b[0], 2 * a[1] - b[1]];
	const all = [mirror(points[0], points[1]), ...points, mirror(points[points.length - 1], points[points.length - 2])];
	const knot = (a: Screen, b: Screen) => Math.max(1e-6, Math.sqrt(Math.hypot(b[0] - a[0], b[1] - a[1])));
	const mix = (a: Screen, b: Screen, ta: number, tb: number, t: number): Screen => [((tb - t) * a[0] + (t - ta) * b[0]) / (tb - ta), ((tb - t) * a[1] + (t - ta) * b[1]) / (tb - ta)];
	const curve: [number, number][] = [];
	for (let index = 1; index + 2 < all.length; index++) {
		const [p0, p1, p2, p3] = [all[index - 1], all[index], all[index + 1], all[index + 2]];
		const t0 = 0;
		const t1 = t0 + knot(p0, p1);
		const t2 = t1 + knot(p1, p2);
		const t3 = t2 + knot(p2, p3);
		for (let step = 0; step < steps; step++) {
			const t = t1 + ((t2 - t1) * step) / steps;
			const [a1, a2, a3] = [mix(p0, p1, t0, t1, t), mix(p1, p2, t1, t2, t), mix(p2, p3, t2, t3, t)];
			const [b1, b2] = [mix(a1, a2, t0, t2, t), mix(a2, a3, t1, t3, t)];
			const [x, y] = mix(b1, b2, t1, t2, t);
			curve.push([x, y]);
		}
	}
	const [lx, ly] = points[points.length - 1];
	curve.push([lx, ly]);
	return curve;
};

/**
 * The peaks of a mountain chain drawn along its curve: one every `spacing` pixels, each with a share of the way along
 * (for rising in turn), a size that varies a little from peak to peak and a small sideways step, both fixed by the
 * peak's place so every frame draws the same chain.
 */
export const ridgePeaks = (curve: readonly Screen[], spacing: number): {x: number; y: number; share: number; size: number}[] => {
	const length = curve.slice(1).reduce((sum, [x, y], index) => sum + Math.hypot(x - curve[index][0], y - curve[index][1]), 0);
	const count = Math.max(2, Math.round(length / spacing) + 1);
	return Array.from({length: count}, (_, index) => {
		const share = index / (count - 1);
		const [x, y] = pointAlong(curve, share);
		const wobble = Math.sin(index * 2.3 + 0.7);
		return {x, y: y + wobble * spacing * 0.18, share, size: 0.85 + 0.3 * ((Math.sin(index * 5.1) + 1) / 2)};
	});
};

/** Mountain peaks: a brown shaded face, a lighter sunlit face and a snow cap, the same in every theme (relief is relief). */
const RIDGE_COLOURS = {shade: '#8C6A45', light: '#B89468', snow: '#F4F1EA'} as const;

/** The point a share (0–1) of the way along a polyline, by length. */
export const pointAlong = (line: readonly Screen[], share: number): [number, number] => {
	const lengths = line.slice(1).map(([x, y], index) => Math.hypot(x - line[index][0], y - line[index][1]));
	const total = lengths.reduce((sum, length) => sum + length, 0);
	let left = Math.max(0, Math.min(1, share)) * total;
	for (let index = 0; index < lengths.length; index++) {
		if (left <= lengths[index] || index === lengths.length - 1) {
			const k = lengths[index] ? Math.min(1, left / lengths[index]) : 0;
			return [line[index][0] + (line[index + 1][0] - line[index][0]) * k, line[index][1] + (line[index + 1][1] - line[index][1]) * k];
		}
		left -= lengths[index];
	}
	return [line[0][0], line[0][1]];
};

/**
 * A country as a map frames it: its largest piece of land and the pieces near it (Corsica stays with France), without
 * the far-off ones. Framed on France, Hungary and Italy for Attila's campaigns, the map showed half the world: French
 * Guiana and Réunion pulled the frame across the Atlantic (KPSS Tarih 1, 1 Nov 2026).
 */
export const mainlandOf = <T extends Feature<Geometry, {name?: string}>>(item: T): T => {
	if (item.geometry?.type !== 'MultiPolygon') return item;
	const parts = item.geometry.coordinates.map((coordinates) => ({type: 'Polygon', coordinates}) as GeoJSON.Polygon);
	const largest = parts.reduce((best, part) => (geoArea(part) > geoArea(best) ? part : best));
	const centre = geoCentroid(largest);
	// Within about 20° of the largest piece: islands off the coast stay, overseas territories go.
	const near = parts.filter((part) => geoDistance(geoCentroid(part), centre) < 0.35);
	return {...item, geometry: {type: 'MultiPolygon', coordinates: near.map((part) => part.coordinates)}};
};

/** The middle of a polygon by area (its centroid), where a territory's name goes; the corners' average if it has no area. */
export const polygonCentroid = (points: readonly Screen[]): [number, number] => {
	let [area, cx, cy] = [0, 0, 0];
	points.forEach(([x0, y0], index) => {
		const [x1, y1] = points[(index + 1) % points.length];
		const cross = x0 * y1 - x1 * y0;
		area += cross;
		cx += (x0 + x1) * cross;
		cy += (y0 + y1) * cross;
	});
	if (Math.abs(area) < 1e-9) return [points.reduce((sum, [x]) => sum + x, 0) / points.length, points.reduce((sum, [, y]) => sum + y, 0) / points.length];
	return [cx / (3 * area), cy / (3 * area)];
};

/** Whether a point lies inside rings (even-odd rule: a hole inside a ring is outside). */
const insideRings = ([x, y]: Screen, rings: readonly (readonly Screen[])[]): boolean => {
	let inside = false;
	for (const ring of rings) {
		for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
			const [xi, yi] = ring[i];
			const [xj, yj] = ring[j];
			if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
		}
	}
	return inside;
};

/** How far a point is from the nearest edge of the rings. */
const distanceToRings = ([x, y]: Screen, rings: readonly (readonly Screen[])[]): number => {
	let best = Infinity;
	for (const ring of rings) {
		for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
			const [ax, ay] = ring[j];
			const [bx, by] = ring[i];
			const dx = bx - ax;
			const dy = by - ay;
			const t = dx === 0 && dy === 0 ? 0 : Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
			best = Math.min(best, Math.hypot(x - (ax + t * dx), y - (ay + t * dy)));
		}
	}
	return best;
};

/**
 * Where an area's name goes: the point inside it farthest from its edges, a little favouring its middle. The middle
 * by area can lie outside the area: the Marmara region wraps round its sea, and its name was written on the water
 * (KPSS Coğrafya 22, 2 Nov 2026). Rings are in screen units; `within` keeps the point on the map.
 */
export const insideLabelSpot = (rings: readonly (readonly Screen[])[], within?: {left: number; top: number; right: number; bottom: number}): Screen | undefined => {
	const all = rings.flat();
	if (all.length < 3) return undefined;
	const left = Math.max(within?.left ?? -Infinity, Math.min(...all.map(([x]) => x)));
	const right = Math.min(within?.right ?? Infinity, Math.max(...all.map(([x]) => x)));
	const top = Math.max(within?.top ?? -Infinity, Math.min(...all.map(([, y]) => y)));
	const bottom = Math.min(within?.bottom ?? Infinity, Math.max(...all.map(([, y]) => y)));
	if (!(right > left && bottom > top)) return undefined;
	const centre = polygonCentroid(rings.reduce((largest, ring) => (ring.length > largest.length ? ring : largest), rings[0]));
	const reach = Math.hypot(right - left, bottom - top);
	const steps = 28;
	let best: {at: Screen; score: number} | undefined;
	for (let i = 0; i <= steps; i++) {
		for (let j = 0; j <= steps; j++) {
			const at: Screen = [left + ((right - left) * i) / steps, top + ((bottom - top) * j) / steps];
			if (!insideRings(at, rings)) continue;
			// Room to the edges first; among roomy points, the one nearer the middle.
			const score = distanceToRings(at, rings) - (0.08 * Math.hypot(at[0] - centre[0], at[1] - centre[1]) * Math.min(1, reach / 400));
			if (!best || score > best.score) best = {at, score};
		}
	}
	return best?.at;
};

/** How far a territory has to spread from its starting point to cover all of it: the distance to its farthest corner. */
export const spreadRadius = ([fx, fy]: Screen, points: readonly Screen[]): number => Math.max(...points.map(([x, y]) => Math.hypot(x - fx, y - fy)));

/** Seconds a territory takes to spread over its land, and between two territories when no beat shows them. */
const TERRITORY_SPREAD = 1.6;
const TERRITORY_GAP = 0.9;

/**
 * A state's land spreading out from its capital: the polygon is revealed by a circle growing from `centre` until it
 * covers the farthest corner; the name comes once most of it is there. Pointed at by a beat, its border thickens.
 */
const Territory: React.FC<{name: string; d: string; centre: Screen; radius: number; label: Screen; colour: string; start: number}> = ({name, d, centre, radius, label, colour, start}) => {
	const {u} = useVideoLayout();
	const seconds = useSceneSeconds();
	const clip = `territory-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
	const shown = useBeatStartFor(name, 'show');
	const spread = easeFrom(seconds, shown ?? start, TERRITORY_SPREAD);
	if (spread <= 0) return null;
	return (
		<Part id={name}>
			{(look) => (
				<g opacity={look.opacity}>
					<defs>
						<clipPath id={clip}>
							<circle cx={centre[0]} cy={centre[1]} r={radius * spread * 1.02} />
						</clipPath>
					</defs>
					<path d={d} clipPath={`url(#${clip})`} fill={withAlphaHex(colour, 0.42)} stroke={colour} strokeWidth={u(4) * (look.scale > 1 ? 1.8 : 1)} strokeLinejoin="round" strokeDasharray={`${u(14)} ${u(8)}`} />
					{/* The capital it spread from pulses once as the land comes in. */}
					<circle cx={centre[0]} cy={centre[1]} r={u(10) + u(26) * (1 - spread)} fill="none" stroke={colour} strokeWidth={u(3)} opacity={1 - spread} />
					<g opacity={Math.max(0, Math.min(1, (spread - 0.6) / 0.3))}>
						<MapLabel x={label[0]} y={label[1]} text={name} tone="ink" />
					</g>
				</g>
			)}
		</Part>
	);
};

/** Seconds a shaded class takes to spread over its areas once a beat shows it. */
const SHADE_SPREAD = 1.4;

/**
 * How far into its spread an area of a shaded class is (0–1): the area at the class's start comes in first, the farthest
 * last, each over the last third of the spread (Danişmendliler from Sivas out to Tokat, Amasya, Kayseri, Malatya).
 */
export const shadeAreaReveal = (spread: number, distance: number, farthest: number): number => {
	const share = farthest > 0 ? distance / farthest : 0;
	return Math.max(0, Math.min(1, (spread - share * 0.65) / 0.35));
};

/**
 * One shaded class (a beylik's provinces, a crop's regions). Shown by a beat, it spreads from its first area outwards,
 * area by area, instead of appearing at once (owner 1 Nov 2026: lively history and geography maps); without a beat
 * it is there with the map. A beat that points at it outlines it in ink.
 */
const ShadeClass: React.FC<{label: string; fill: string; areas: {d: string; at: Screen}[]}> = ({label, fill, areas}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const seconds = useSceneSeconds();
	const shown = useBeatStartFor(label, 'show');
	const spread = shown === undefined ? 1 : easeFrom(seconds, shown, SHADE_SPREAD);
	const origin = areas[0]?.at ?? ([0, 0] as Screen);
	const reach = (at: Screen) => (Number.isFinite(at[0]) ? Math.hypot(at[0] - origin[0], at[1] - origin[1]) : 0);
	const farthest = Math.max(0, ...areas.map((area) => reach(area.at)));
	return (
		<Part id={label}>
			{(look) => (
				<g opacity={look.opacity}>
					{areas.map((area, index) => (
						<path key={index} d={area.d} fill={fill} opacity={shadeAreaReveal(spread, reach(area.at), farthest)} stroke={look.scale > 1 ? palette.ink : palette.border} strokeWidth={u(1.5) * (look.scale > 1 ? 2 : 1)} />
					))}
				</g>
			)}
		</Part>
	);
};

/** A small sail ship, `size` long, centred on its waterline, facing right unless `left`. */
const Ship: React.FC<{x: number; y: number; size: number; left: boolean; hull: string; sail: string; opacity: number}> = ({x, y, size, left, hull, sail, opacity}) => (
	<g transform={`translate(${x} ${y}) scale(${left ? -1 : 1} 1)`} opacity={opacity}>
		<path d={`M${-size / 2} ${-size * 0.08} H${size / 2} L${size * 0.34} ${size * 0.2} H${-size * 0.38} Z`} fill={hull} />
		<path d={`M${-size * 0.04} ${-size * 0.12} V${-size * 0.72} L${size * 0.32} ${-size * 0.16} Z`} fill={sail} stroke={hull} strokeWidth={size * 0.06} strokeLinejoin="round" />
		<path d={`M${-size * 0.1} ${-size * 0.14} V${-size * 0.6} L${-size * 0.36} ${-size * 0.16} Z`} fill={sail} stroke={hull} strokeWidth={size * 0.06} strokeLinejoin="round" />
	</g>
);

/** One dromedary, `size` long, feet at (0, 0), facing right: a filled silhouette with a high hump, a long neck and four legs. */
const CamelShape: React.FC<{size: number; body: string; outline: string}> = ({size: s, body, outline}) => (
	<g>
		{[-0.32, -0.21, 0.17, 0.27].map((leg) => (
			<path key={leg} d={`M${s * leg} ${-s * 0.36} L${s * (leg + 0.01)} 0`} stroke={body} strokeWidth={s * 0.055} strokeLinecap="round" />
		))}
		<path
			d={`M${-s * 0.44} ${-s * 0.4} C${-s * 0.4} ${-s * 0.62} ${-s * 0.24} ${-s * 0.86} ${-s * 0.08} ${-s * 0.7} C${s * 0.02} ${-s * 0.6} ${s * 0.12} ${-s * 0.5} ${s * 0.22} ${-s * 0.52} L${s * 0.36} ${-s * 0.8} Q${s * 0.44} ${-s * 0.88} ${s * 0.52} ${-s * 0.8} L${s * 0.52} ${-s * 0.72} L${s * 0.42} ${-s * 0.7} L${s * 0.3} ${-s * 0.4} Q${s * 0.2} ${-s * 0.3} 0 ${-s * 0.32} L${-s * 0.36} ${-s * 0.32} Q${-s * 0.46} ${-s * 0.32} ${-s * 0.44} ${-s * 0.4} Z`}
			fill={body}
			stroke={outline}
			strokeWidth={s * 0.04}
			strokeLinejoin="round"
		/>
	</g>
);

/**
 * A caravan of two camels, the leader at (x, y) and one behind it, `size` long each, facing right unless `left`
 * (the Silk Road, the Spice Road). Filled in the route's colour, so it reads on a pale map.
 */
const Camel: React.FC<{x: number; y: number; size: number; left: boolean; body: string; outline: string; opacity: number}> = ({x, y, size, left, body, outline, opacity}) => (
	<g transform={`translate(${x} ${y}) scale(${left ? -1 : 1} 1)`} opacity={opacity}>
		<g transform={`translate(${-size * 0.95} 0) scale(0.86)`}>
			<CamelShape size={size} body={body} outline={outline} />
		</g>
		<CamelShape size={size} body={body} outline={outline} />
	</g>
);

/** A lorry, `size` long, standing on its wheels at (x, y), facing right unless `left` (trade by road). */
const Truck: React.FC<{x: number; y: number; size: number; left: boolean; body: string; outline: string; opacity: number}> = ({x, y, size, left, body, outline, opacity}) => {
	const s = size;
	return (
		<g transform={`translate(${x} ${y}) scale(${left ? -1 : 1} 1)`} opacity={opacity}>
			<rect x={-s * 0.5} y={-s * 0.5} width={s * 0.68} height={s * 0.38} rx={s * 0.03} fill={body} stroke={outline} strokeWidth={s * 0.05} />
			<path d={`M${s * 0.2} ${-s * 0.12} V${-s * 0.4} H${s * 0.38} L${s * 0.5} ${-s * 0.26} V${-s * 0.12} Z`} fill={outline} />
			{[-0.34, 0.02, 0.36].map((wheel) => (
				<circle key={wheel} cx={s * wheel} cy={-s * 0.08} r={s * 0.08} fill={outline} />
			))}
		</g>
	);
};

/** A train of a locomotive and one wagon, `size` long, on its rails at (x, y), facing right unless `left` (trade by rail). */
const Train: React.FC<{x: number; y: number; size: number; left: boolean; body: string; outline: string; opacity: number}> = ({x, y, size, left, body, outline, opacity}) => {
	const s = size;
	return (
		<g transform={`translate(${x} ${y}) scale(${left ? -1 : 1} 1)`} opacity={opacity}>
			<rect x={-s * 0.5} y={-s * 0.4} width={s * 0.44} height={s * 0.3} rx={s * 0.04} fill={body} stroke={outline} strokeWidth={s * 0.05} />
			<path d={`M${-s * 0.02} ${-s * 0.1} V${-s * 0.4} H${s * 0.32} Q${s * 0.5} ${-s * 0.4} ${s * 0.5} ${-s * 0.2} V${-s * 0.1} Z`} fill={outline} />
			{[-0.4, -0.16, 0.1, 0.36].map((wheel) => (
				<circle key={wheel} cx={s * wheel} cy={-s * 0.06} r={s * 0.06} fill={outline} />
			))}
		</g>
	);
};

/**
 * The third to fifth colours of contrasting land classes, after the lesson's and the brand's. Never a water blue: it was
 * '#2F6A9F' until 2 Nov 2026, and a third class of provinces looked like lakes.
 */
export const SHADE_CONTRAST = ['#8B5A3C', '#8E44AD', '#C9A227'] as const;

/** How many travellers move along an arrowed route once it is drawn, and how long one takes from end to end. */
const TRAVELLERS_PER_ROUTE = 3;
const ROUTE_CROSSING_SECONDS = 3.2;

type Features = Feature<Geometry, {name?: string}>[];

const topologyFeatures = (topology: Topology, object?: string): Features => {
	const key = object ?? Object.keys(topology.objects)[0];
	const collection = feature(topology, topology.objects[key] as GeometryCollection) as unknown as FeatureCollection<Geometry, {name?: string}>;
	return collection.features;
};

const nameOf = (item: Features[number]): string => item.properties?.name ?? '';

type LayerSource = {src: string; object?: string};

/**
 * Turkey's own layers draw only Turkey. Around it the map draws the world's countries in a muted land colour: left
 * empty, Greece and Bulgaria took the sea's colour and Thrace looked like an island (KPSS Coğrafya 19, the straits).
 */
const TURKEY_ONLY_LAYERS: readonly string[] = ['country', 'regions', 'provinceRegions', 'provinces', 'districts'];

/** Whether a map of this base draws the neighbouring countries under it. */
export const drawsNeighbours = (base: MapSpec['base']): boolean => typeof base === 'string' && TURKEY_ONLY_LAYERS.includes(base);

/** Where a layer's data is. */
const sourceOf = (layer: GeoLayer | LayerSource): LayerSource =>
	typeof layer === 'string' ? {src: GEO_FILES[GEO_LAYERS[layer].file].src, object: GEO_LAYERS[layer].object} : layer;

/** Loads the map's data files, waiting for them before the frame is captured. Each file is fetched once. */
const useGeoFiles = (sources: readonly string[]): Map<string, Topology | FeatureCollection> | null => {
	const key = [...new Set(sources)].sort().join('|');
	const [loaded, setLoaded] = useState<Map<string, Topology | FeatureCollection> | null>(null);
	const [handle] = useState(() => delayRender(`Loading map data ${key}`));
	useEffect(() => {
		const files = key.split('|');
		Promise.all(files.map((src) => fetch(staticFile(src)).then((response) => response.json() as Promise<Topology | FeatureCollection>)))
			.then((data) => {
				setLoaded(new Map(files.map((src, index) => [src, data[index]])));
				continueRender(handle);
			})
			.catch(() => continueRender(handle));
	}, [key, handle]);
	return loaded;
};

const featuresOf = (files: Map<string, Topology | FeatureCollection>, source: LayerSource): Features => {
	const data = files.get(source.src);
	if (!data) return [];
	return data.type === 'Topology' ? topologyFeatures(data, source.object) : ((data as FeatureCollection<Geometry, {name?: string}>).features as Features);
};

/**
 * A map drawn with d3-geo: the base areas, the highlighted ones in the
 * lesson colour with their labels, rivers, lakes and borders on top, then
 * markers and routes (a campaign, a migration). The view is framed on
 * `focus`; without it, a world map on its highlights and any other map on
 * all of its base. Data that asks
 * for a credit gets it in the corner.
 */
export const MapVisual: React.FC<VisualBoxProps & {visual: MapSpec}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const baseSource = sourceOf(visual.base);
	const overlaySources = visual.overlays.map((overlay) => sourceOf(overlay.layer));
	const neighbourSource = drawsNeighbours(visual.base) ? sourceOf('countries') : null;
	const files = useGeoFiles([baseSource.src, ...overlaySources.map((source) => source.src), ...(neighbourSource ? [neighbourSource.src] : [])]);
	const reveal = useReveal(delaySeconds, 0.6);
	const marks = useReveal(delaySeconds + 0.6, 0.6);
	const lines = useReveal(delaySeconds + 0.4, 1.2);
	const routeProgress = useReveal(delaySeconds + 1, 1.4);
	const seconds = useSceneSeconds();
	// A dark figure (the app's dark theme) gets a dark land and sea.
	const MAP_COLORS = relativeLuminance(palette.surface) < 0.2 ? MAP_COLORS_DARK : LIGHT_MAP_COLORS;
	// The credit line's size: an app still raises it to its smallest text.
	const creditSize = useFigureFont()(u(18));

	const drawing = useMemo(() => {
		if (!files) return null;
		const base = featuresOf(files, baseSource);
		const named = (names: readonly string[]) => base.filter((item) => names.includes(nameOf(item)));
		// The world is framed on what the map is about; Turkey's own maps show all of it unless told otherwise.
		const frameOn = named(visual.focus.length > 0 ? visual.focus : visual.base === 'countries' ? visual.highlights.map((item) => item.name) : []).map(mainlandOf);
		// Markers and routes are always inside the frame, so a place the lesson names is never cut off.
		const pins = [...visual.markers.map((marker) => marker.at), ...visual.routes.flatMap((route) => route.points), ...visual.territories.flatMap((territory) => territory.points), ...visual.ridges.flatMap((ridge) => ridge.points)];
		// A country's extreme parallels and meridians stay in view: their crossings join the frame, on any map.
		const crossings = visual.parallels.flatMap((latitude) => visual.meridians.map((longitude) => [longitude, latitude] as [number, number]));
		// Parallels the lesson asks for are always in view: an Equator or a tropic cut off the map teaches nothing.
		const latitudes = visual.lines.flatMap((name) => MAP_LINE_GEOMETRY[name].flatMap((line) => (line.latitude === undefined ? [] : [line.latitude])));
		const {projection, west, span} = framedProjection(frameOn.length > 0 ? frameOn : base, [...(frameOn.length > 0 || base.length === 0 ? pins : []), ...crossings], latitudes, [[u(30), u(30)], [width - u(30), height - u(30)]]);
		const overlays = visual.overlays.map((overlay, index) => {
			const all = featuresOf(files, overlaySources[index]);
			return {...overlay, draw: GEO_LAYERS[overlay.layer].draw, features: overlay.names.length > 0 ? all.filter((item) => overlay.names.includes(nameOf(item))) : all};
		});
		const neighbours = neighbourSource ? featuresOf(files, neighbourSource).filter((item) => nameOf(item) !== 'Türkiye') : [];
		return {projection, west, span, path: geoPath(projection), base, neighbours, overlays, highlighted: new Set(visual.highlights.map((item) => item.name))};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [files, visual, width, height, u]);

	if (!drawing) return <svg width={width} height={height} />;
	const {projection, west, span, path, base, neighbours, overlays, highlighted} = drawing;
	const point = (at: readonly [number, number]) => projection([at[0], at[1]]) ?? [0, 0];
	/** An area's rings on the screen, for placing its name inside it. */
	const ringsOf = (item: Features[number]): Screen[][] => {
		const geometry = item.geometry;
		const polygons = geometry?.type === 'Polygon' ? [geometry.coordinates] : geometry?.type === 'MultiPolygon' ? geometry.coordinates : [];
		return polygons.flatMap((polygon) => polygon.map((ring) => ring.map((at) => (projection([at[0], at[1]]) ?? [0, 0]) as unknown as Screen)));
	};
	/**
	 * Where an area's name goes: inside the area, never on the water it wraps round, and far enough from the map's
	 * edges for the whole name to show (Karadeniz map, KPSS Coğrafya 22: "Doğu Anadolu Bölgesi" ran off the frame).
	 * Undefined when no such place is left on the map.
	 */
	const nameSpot = (item: Features[number], text: string): [number, number] | undefined => {
		const box = labelBox(0, 0, text, u(1), true);
		const halfWidth = (box.right - box.left) / 2 + u(10);
		const halfHeight = (box.bottom - box.top) / 2 + u(10);
		const inside = insideLabelSpot(ringsOf(item), {left: halfWidth, top: halfHeight, right: width - halfWidth, bottom: height - halfHeight});
		return inside ? [inside[0], inside[1]] : undefined;
	};
	const credits = [...new Set([baseSource, ...overlaySources].map((source) => geoCredit(source.src, source.object)).filter(Boolean))];

	// Labels never pile up: each takes the first free spot around its anchor (see placeLabel). Markers' dots are
	// reserved first, then highlight names, marker names, reference lines and last the names of rivers and lakes,
	// which are simply left out when there is no room.
	const frame = {width, height, margin: u(8)};
	const placed: Box[] = visual.markers.map((marker) => {
		const [mx, my] = point(marker.at);
		return {left: mx - u(16), right: mx + u(16), top: my - u(16), bottom: my + u(16)};
	});
	// Routes are reserved too, so no name hides a route's line or the arrowhead that shows where it went.
	placed.push(...routeObstacles(visual.routes, point, u(1)));
	// Mountain chains too: their peaks are not covered by a name.
	placed.push(...routeObstacles(visual.ridges.map((ridge) => ({points: ridge.points, arrow: false})), point, u(1)));
	// Lakes too: a name on a lake hides the very water the narration points at (Salda under "Salda Gölü", KPSS Coğrafya 7).
	placed.push(...overlays.filter((overlay) => overlay.draw === 'water').flatMap((overlay) => overlay.features.map((item) => lakeBox(path.bounds(item), u(4)))));
	// The shades' legend sits in the lower left corner; labels keep clear of it.
	const legendRow = u(40);
	const legendWidth = visual.shades.length > 0 ? u(64) + Math.max(...visual.shades.map((shade) => shade.label.length)) * u(13) : 0;
	const legendTop = height - u(20) - visual.shades.length * legendRow - u(16);
	if (visual.shades.length > 0) placed.push({left: u(16), right: u(16) + legendWidth, top: legendTop, bottom: height - u(16)});
	// The credit line in the lower right corner too: "Bor · Bigadiç" sat on it once a still raised it (2 Nov 2026).
	const creditText = [...credits, ...(visual.territories.length ? ['Sınırlar yaklaşıktır'] : []), ...(visual.ridges.length ? ['Dağ sıraları yaklaşıktır'] : [])].join(' · ');
	if (creditText) placed.push({left: width - u(16) - creditText.length * creditSize * 0.55, right: width - u(16), top: height - u(14) - creditSize, bottom: height});
	const shadeAlpha = (index: number) => (visual.shades.length === 1 ? 1 : 1 - (0.72 * index) / (visual.shades.length - 1));
	// Kinds get colours of their own (lesson, brand, then a brown, a purple and a sand); ordered classes get tones of the lesson colour.
	const CONTRAST = [palette.lesson, palette.brand, ...SHADE_CONTRAST];
	const shadeFill = (index: number) => {
		const own = visual.shades[index]?.color;
		if (own) return withAlphaHex(SHADE_COLORS[own], 0.85);
		return visual.shadeStyle === 'contrast' ? withAlphaHex(CONTRAST[index % CONTRAST.length], 0.85) : withAlphaHex(palette.lesson, shadeAlpha(index));
	};
	// Reference lines are labelled first, at the west end of the frame (a parallel) or near its top (a meridian).
	const referenceLines = [...visual.lines.flatMap((name) => MAP_LINE_GEOMETRY[name].map((line) => ({name, ...line}))), ...customLines(visual.parallels, visual.meridians)];
	const lineLabels = referenceLines.flatMap((line) => {
		if (!line.label) return [];
		const size = labelBox(0, 0, line.label, u(1), true);
		const half = (size.right - size.left) / 2;
		// A line the lesson chose by degree is always named: it tries spots along itself (a parallel from the
		// west, a meridian from the foot up) and keeps the one that covers least.
		if (line.chosen) {
			const along = [0.06, 0.5, 0.94, 0.28, 0.72].map((share) =>
				line.latitude !== undefined ? point([west + span * share, line.latitude]) : [point([line.longitude ?? 0, 0])[0], height * (1 - share)],
			);
			const spots = along
				.filter(([lx, ly]) => ly > 0 && ly < height && lx > 0 && lx < width)
				.map(([lx, ly]) => placeLabel(lx + (line.latitude !== undefined ? 0 : half + u(10)), ly, line.label ?? '', true, placed, frame, u(1), [[0, 0], [0, -u(30)], [0, u(30)]]));
			if (spots.length === 0) return [];
			const spot = spots.find((candidate) => candidate.overlap === 0) ?? spots.reduce((best, candidate) => (candidate.overlap < best.overlap ? candidate : best));
			placed.push(spot.box);
			return [{key: `${line.name}-${line.label}`, id: line.name, ...spot, text: line.label}];
		}
		// A meridian is labelled beside itself in the southern ocean, clear of the parallels' labels.
		const [lx, ly] = line.latitude !== undefined ? point([west + Math.min(8, span * 0.03), line.latitude]) : point([line.longitude ?? 0, -40]);
		if (!(ly > 0 && ly < height && lx > -width && lx < width * 2)) return [];
		const anchorX = lx + half + u(10);
		const anchorY = ly;
		const spot = placeLabel(anchorX, anchorY, line.label, true, placed, frame, u(1), [[0, 0], [0, -u(30)], [0, u(30)], [half * 1.2, 0]]);
		if (spot.overlap > 0) return [];
		placed.push(spot.box);
		return [{key: `${line.name}-${line.label}`, id: line.name, ...spot, text: line.label}];
	});
	const markerNames = new Set(visual.markers.map((marker) => marker.label));
	const highlightLabels = visual.highlights.flatMap((item) => {
		const area = base.find((entry) => nameOf(entry) === item.name);
		// A marker with the same name already carries it.
		if (!area || !item.label || markerNames.has(item.label)) return [];
		const [cx, cy] = nameSpot(area, item.label) ?? path.centroid(area);
		if (!Number.isFinite(cx)) return [];
		const spot = placeLabel(cx, cy, item.label, false, placed, frame, u(1), [[0, 0], [0, -u(46)], [0, u(46)]]);
		placed.push(spot.box);
		return [{key: item.name, ...spot, text: item.label}];
	});
	const markerLabels = visual.markers.map((marker) => {
		const [mx, my] = point(marker.at);
		const spot = placeLabel(mx, my, marker.label, false, placed, frame, u(1), aroundPoint(marker.label, u(1)));
		placed.push(spot.box);
		return spot;
	});
	// A territory's name goes near its middle, in a free place: on "Karahanlı" sat the marker for Talas (KPSS Tarih 2).
	const territoryLabels = visual.territories.map((territory) => {
		const [cx, cy] = polygonCentroid(territory.points.map((at) => point(at) as unknown as Screen));
		const spot = placeLabel(cx, cy, territory.name, false, placed, frame, u(1), [[0, 0], [0, -u(52)], [0, u(52)], [u(90), 0], [-u(90), 0], [u(70), -u(52)], [-u(70), u(52)], [0, -u(104)], [0, u(104)]]);
		placed.push(spot.box);
		return [spot.x, spot.y] as Screen;
	});
	// A chain's name goes beside its middle, off the peaks.
	const ridgeLabels = visual.ridges.map((ridge, index) => {
		const curve = routeCurve(ridge.points.map((at) => point(at) as unknown as Screen));
		const [mx, my] = pointAlong(curve, 0.5);
		const spot = placeLabel(mx, my, ridge.name, true, placed, frame, u(1), aroundPoint(ridge.name, u(1)));
		placed.push(spot.box);
		return {key: `ridge${index}`, id: ridge.name, ...spot, text: ridge.name};
	});
	// A named route carries its name beside its middle stretch.
	const routeLabels = visual.routes.flatMap((route, index) => {
		if (!route.label) return [];
		const middle = route.points[Math.floor((route.points.length - 1) / 2)];
		const next = route.points[Math.floor((route.points.length - 1) / 2) + 1] ?? middle;
		const [ax, ay] = point(middle);
		const [bx, by] = point(next);
		const spot = placeLabel((ax + bx) / 2, (ay + by) / 2, route.label, true, placed, frame, u(1), aroundPoint(route.label, u(1)));
		placed.push(spot.box);
		return [{key: `route${index}`, id: route.label, ...spot, text: route.label}];
	});
	const overlayLabels: {key: string; id: string; x: number; y: number; text: string}[] = [];
	const candidates = overlays
		.filter((overlay) => overlay.labels)
		.flatMap((overlay) => {
			const largest = new Map<string, {item: Features[number]; size: number}>();
			for (const item of overlay.features) {
				// Pieces whose middle is off the map cannot carry the label.
				const [mx, my] = path.centroid(item);
				if (!(mx >= 0 && mx <= width && my >= 0 && my <= height)) continue;
				const size = overlay.draw === 'lines' ? path.measure(item) * 40 : path.area(item);
				const best = largest.get(nameOf(item));
				if (!best || size > best.size) largest.set(nameOf(item), {item, size});
			}
			return [...largest.entries()].map(([name, {item, size}]) => ({key: `${overlay.layer}-${name}`, name, item, size, water: overlay.draw === 'water', lines: overlay.draw === 'lines'}));
		})
		.sort((a, b) => b.size - a.size);
	for (const candidate of candidates) {
		// An area's name goes inside it; a river's on its middle, a lake's beside it.
		const spotAt = candidate.water || candidate.lines ? path.centroid(candidate.item) : nameSpot(candidate.item, candidate.name);
		if (!spotAt) continue;
		const [cx, cy] = spotAt;
		if (!Number.isFinite(cx)) continue;
		// A river's name sits on its middle; a lake's goes beside it, like a marker's, and is left out when nothing is free.
		if (candidate.water) {
			const spot = placeLabel(cx, cy, candidate.name, true, placed, frame, u(1), aroundPoint(candidate.name, u(0.8)));
			if (spot.overlap > 0) continue;
			placed.push(spot.box);
			overlayLabels.push({key: candidate.key, id: candidate.name, x: spot.x, y: spot.y, text: candidate.name});
			continue;
		}
		const box = labelBox(cx, cy, candidate.name, u(1), true);
		if (placed.some((other) => overlaps(box, other))) continue;
		placed.push(box);
		overlayLabels.push({key: candidate.key, id: candidate.name, x: cx, y: cy, text: candidate.name});
	}

	return (
		<svg width={width} height={height} style={{overflow: 'hidden', fontFamily: palette.fontBody, borderRadius: u(24)}}>
			<rect width={width} height={height} fill={MAP_COLORS.waterFill} />
			<g opacity={reveal}>
				{neighbours.map((item, index) => (
					<path key={`n${index}`} d={path(item) ?? ''} fill={MAP_COLORS.neighbour} stroke={palette.border} strokeWidth={u(1)} />
				))}
				{base.map((item, index) => (
					<path key={index} d={path(item) ?? ''} fill={MAP_COLORS.land} stroke={palette.border} strokeWidth={u(1.5)} />
				))}
				{/* Shaded classes, darkest first; a beat points at a class by its label. */}
				{visual.shades.map((shade, index) => (
					<ShadeClass
						key={`s${index}`}
						label={shade.label}
						fill={shadeFill(index)}
						// The class spreads from the first area it names (its centre: a beylik from its seat), in the order the names are given.
						areas={shade.names.flatMap((name) => base.filter((item) => nameOf(item) === name).map((item) => ({d: path(item) ?? '', at: path.centroid(item) as unknown as Screen})))}
					/>
				))}
				{/* Highlighted areas in the lesson colour; with beats they come in and are pointed at by name. */}
				{base
					.filter((item) => highlighted.has(nameOf(item)))
					.map((item, index) => (
						<Part key={`h${index}`} id={nameOf(item)}>
							{(look) => <path d={path(item) ?? ''} fill={palette.lesson} stroke={look.scale > 1 ? palette.ink : palette.border} strokeWidth={u(1.5) * (look.scale > 1 ? 2.5 : 1)} opacity={look.opacity} />}
						</Part>
					))}
			</g>
			{overlays.map((overlay, layerIndex) => (
				<g key={`o${layerIndex}`} opacity={overlay.draw === 'lines' ? 1 : reveal}>
					{/* Named rivers and lakes are parts: a beat points at one by its name, and it deepens and thickens. */}
					{overlay.features.map((item, index) =>
						overlay.draw === 'lines' ? (
							<Part key={index} id={nameOf(item)}>
								{(look) => <path d={path(item) ?? ''} fill="none" stroke={look.scale > 1 ? WATER_FOCUS : MAP_COLORS.water} strokeWidth={u(4) * (look.scale > 1 ? 2.2 : 1)} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - lines} opacity={look.opacity} />}
							</Part>
						) : overlay.draw === 'water' ? (
							<Part key={index} id={nameOf(item)}>
								{(look) => {
									// A lake is a few pixels on a country map: a ring round it shows where the narration points.
									const [[x0, y0], [x1, y1]] = path.bounds(item);
									const ring = lakeRing([x0, y0], [x1, y1], u(16));
									return (
										<>
											<path d={path(item) ?? ''} fill={look.scale > 1 ? WATER_FOCUS : MAP_COLORS.water} stroke={look.scale > 1 ? palette.lesson : 'none'} strokeWidth={u(3)} opacity={look.opacity} />
											{look.scale > 1 && Number.isFinite(ring.r) ? <circle cx={ring.cx} cy={ring.cy} r={ring.r} fill="none" stroke={palette.lesson} strokeWidth={u(4)} /> : null}
										</>
									);
								}}
							</Part>
						) : (
							<path key={index} d={path(item) ?? ''} fill="none" stroke={palette.ink} strokeWidth={u(3)} strokeLinejoin="round" />
						),
					)}
				</g>
			))}
			{/* Parallels and meridians draw across the map like a pen line; each can be pointed at by its name. */}
			{referenceLines.map((line, index) => (
				<Part key={`l${index}`} id={line.name}>
					{(look) => (
						<path
							d={path(line.geometry) ?? ''}
							fill="none"
							stroke={line.major ? palette.lesson : withAlphaHex(palette.ink, 0.28)}
							strokeWidth={(line.major ? u(4) : u(1.5)) * (look.scale > 1 ? 1.6 : 1)}
							strokeDasharray={line.dashed ? `${u(14)} ${u(10)}` : undefined}
							opacity={look.opacity * lines}
						/>
					)}
				</Part>
			))}
			{visual.territories.map((territory, index) => {
				const corners = territory.points.map((at) => point(at) as unknown as Screen);
				const centre = territory.from ? (point(territory.from) as unknown as Screen) : polygonCentroid(corners);
				const d = corners.map(([x, y], step) => `${step === 0 ? 'M' : 'L'}${x} ${y}`).join(' ') + ' Z';
				return <Territory key={`t${index}`} name={territory.name} d={d} centre={centre} radius={spreadRadius(centre, corners)} label={territoryLabels[index]} colour={CONTRAST[index % CONTRAST.length]} start={delaySeconds + 0.8 + index * TERRITORY_GAP} />;
			})}
			{visual.ridges.map((ridge, index) => {
				// Peaks big enough to read as mountains on a whole-country map (at 20 units they looked like a dotted line).
				const peaks = ridgePeaks(routeCurve(ridge.points.map((at) => point(at) as unknown as Screen)), u(30));
				return (
					<Part key={`m${index}`} id={ridge.name}>
						{(look) => {
							// The peaks rise one after another along the chain as it comes in.
							const rise = (share: number) => Math.max(0, Math.min(1, (routeProgress * Math.min(1, look.appear * 1.5) * 1.3 - share * 0.3) / 0.7));
							return (
								<g opacity={look.opacity}>
									{peaks.map((peak, step) => {
										const height = u(34) * peak.size * rise(peak.share) * look.scale;
										const half = u(19) * peak.size * look.scale;
										if (height <= 0.5) return null;
										return (
											<g key={step}>
												<path d={`M${peak.x - half} ${peak.y} L${peak.x} ${peak.y - height} L${peak.x + half} ${peak.y} Z`} fill={RIDGE_COLOURS.shade} stroke={palette.surface} strokeWidth={u(1.5)} strokeLinejoin="round" />
												<path d={`M${peak.x} ${peak.y - height} L${peak.x + half} ${peak.y} L${peak.x + half * 0.2} ${peak.y} Z`} fill={RIDGE_COLOURS.light} />
												<path d={`M${peak.x - half * 0.32} ${peak.y - height * 0.68} L${peak.x} ${peak.y - height} L${peak.x + half * 0.32} ${peak.y - height * 0.68} Z`} fill={RIDGE_COLOURS.snow} />
											</g>
										);
									})}
								</g>
							);
						}}
					</Part>
				);
			})}
			{visual.routes.map((route, index) => {
				const curve = routeCurve(route.points.map((at) => point(at) as unknown as Screen));
				const d = curve.map(([x, y], step) => `${step === 0 ? 'M' : 'L'}${x} ${y}`).join(' ');
				// The arrowhead points along the curve's last stretch and comes in once the line has reached it.
				const [ex, ey] = curve[curve.length - 1];
				const [px, py] = curve[curve.length - 2];
				const angle = (Math.atan2(ey - py, ex - px) * 180) / Math.PI;
				return (
					<Part key={`r${index}`} id={route.label ?? `r${index + 1}`}>
						{(look) => {
							// The line's length follows its appearance only: when another part takes the focus the route fades
							// but stays whole (29 Oct 2026: Fırat and Dicle lost their mouths once the beat moved on to Suriye and Irak).
							const drawn = routeProgress * Math.min(1, look.appear * 1.5);
							// Once an arrowed route is drawn, travellers keep moving along it in its direction: the migration or the
							// campaign goes on while it is talked about (owner 1 Nov 2026: history and geography want lively animation).
							const travel = route.arrow ? Math.max(0, Math.min(1, (drawn - 0.97) / 0.03)) : 0;
							const lap = (seconds / ROUTE_CROSSING_SECONDS) % 1;
							return (
								<g opacity={look.opacity}>
									<path d={d} fill="none" stroke={palette.brand} strokeWidth={u(7) * look.scale} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - drawn} />
									{travel > 0
										? Array.from({length: TRAVELLERS_PER_ROUTE}, (_, traveller) => {
												const share = (lap + traveller / TRAVELLERS_PER_ROUTE) % 1;
												const [tx, ty] = pointAlong(curve, share * 0.94);
												// Each traveller fades in at the start and out before the arrowhead.
												const fade = Math.min(1, share / 0.12, (0.94 - share * 0.94) / 0.1);
												// A ship, camel, lorry or train faces the way it goes and stays upright: it turns left or right, never over.
												const [ax] = pointAlong(curve, Math.min(0.999, share * 0.94 + 0.01));
												const left = ax < tx;
												const opacity = travel * Math.max(0, fade);
												if (route.traveller === 'ship') return <Ship key={traveller} x={tx} y={ty} size={u(34) * look.scale} left={left} hull={palette.brand} sail={palette.surface} opacity={opacity} />;
												if (route.traveller === 'caravan') return <Camel key={traveller} x={tx} y={ty} size={u(34) * look.scale} left={left} body={palette.brand} outline={palette.surface} opacity={opacity} />;
												if (route.traveller === 'truck') return <Truck key={traveller} x={tx} y={ty} size={u(36) * look.scale} left={left} body={palette.surface} outline={palette.brand} opacity={opacity} />;
												if (route.traveller === 'train') return <Train key={traveller} x={tx} y={ty} size={u(40) * look.scale} left={left} body={palette.surface} outline={palette.brand} opacity={opacity} />;
											return <circle key={traveller} cx={tx} cy={ty} r={u(8) * look.scale} fill={palette.surface} stroke={palette.brand} strokeWidth={u(4)} opacity={travel * Math.max(0, fade)} />;
											})
										: null}
									{route.arrow && drawn > 0.97 ? <path d={`M0 0 L${-u(30)} ${-u(15)} L${-u(30)} ${u(15)} Z`} transform={`translate(${ex} ${ey}) rotate(${angle}) scale(${look.scale})`} fill={palette.brand} stroke={palette.surface} strokeWidth={u(2)} /> : null}
								</g>
							);
						}}
					</Part>
				);
			})}
			<g opacity={marks}>
				{/* A river's or lake's name dims and lights with it. */}
				{overlayLabels.map((label) => (
					<Part key={label.key} id={label.id}>
						{(look) => (
							<g opacity={look.opacity}>
								<MapLabel x={label.x} y={label.y} text={label.text} small tone={look.scale > 1 ? 'lesson' : 'ink'} />
							</g>
						)}
					</Part>
				))}
				{ridgeLabels.map((label) => (
					<Part key={label.key} id={label.id}>
						{(look) => (
							<g opacity={look.opacity * routeProgress}>
								<MapLabel x={label.x} y={label.y} text={label.text} small />
							</g>
						)}
					</Part>
				))}
				{routeLabels.map((label) => (
					<Part key={label.key} id={label.id}>
						{(look) => (
							<g opacity={look.opacity * routeProgress}>
								<MapLabel x={label.x} y={label.y} text={label.text} small tone="brand" />
							</g>
						)}
					</Part>
				))}
				{lineLabels.map((label) => (
					<Part key={label.key} id={label.id}>
						{(look) => (
							<g opacity={look.opacity}>
								<MapLabel x={label.x} y={label.y} text={label.text} small tone="lesson" />
							</g>
						)}
					</Part>
				))}
				{highlightLabels.map((label) => (
					<MapLabel key={label.key} x={label.x} y={label.y} text={label.text} />
				))}
				{visual.markers.map((marker, index) => {
					const [mx, my] = point(marker.at);
					const label = markerLabels[index];
					return (
						<Part key={`m${index}`} id={marker.label}>
							{(look) => (
								<g opacity={look.opacity}>
									{/* A thin leader when the label had to move away from its dot. */}
									{Math.hypot(label.x - mx, label.y - my) > u(60) ? <line x1={mx} y1={my} x2={label.x} y2={label.y} stroke={palette.ink} strokeWidth={u(2.5)} opacity={0.6} /> : null}
									<circle cx={mx} cy={my} r={u(12) * look.scale} fill={palette.brand} stroke={palette.surface} strokeWidth={u(4)} />
									<MapLabel x={label.x} y={label.y} text={marker.label} />
								</g>
							)}
						</Part>
					);
				})}
			</g>
			{visual.shades.length > 0 ? (
				<g opacity={marks}>
					<rect x={u(16)} y={legendTop} width={legendWidth} height={height - u(16) - legendTop} rx={u(14)} fill={palette.surface} opacity={0.92} />
					{visual.shades.map((shade, index) => (
						<Part key={`legend${index}`} id={shade.label}>
							{(look) => (
								<g opacity={Math.max(0.35, look.opacity)}>
									<rect x={u(30)} y={legendTop + u(14) + index * legendRow} width={u(26)} height={u(26)} rx={u(5)} fill={shadeFill(index)} stroke={palette.border} strokeWidth={u(1.5)} />
									<text x={u(66)} y={legendTop + u(14) + index * legendRow + u(20)} fill={palette.ink} fontSize={u(23)} fontWeight={look.scale > 1 ? 800 : 600}>
										{shade.label}
									</text>
								</g>
							)}
						</Part>
					))}
				</g>
			) : null}
			{creditText ? (
				<text x={width - u(16)} y={height - u(14)} textAnchor="end" fill={palette.muted} fontSize={creditSize}>
					{creditText}
				</text>
			) : null}
		</svg>
	);
};

/**
 * A pin's room in the frame, as a share of the frame's span: a route's end or a marker that sits right on the
 * edge reads as cut off (Don-Volga canal at the top of the Indian Ocean map, 1 Nov 2026).
 */
const PIN_MARGIN = 0.06;

/** Each pin with points around it at the margin, so the frame keeps that much room past it on every side. */
export const pinMargin = (pins: readonly (readonly [number, number])[], span: number): (readonly [number, number])[] => {
	const pad = Math.max(0.3, span * PIN_MARGIN);
	return pins.flatMap(([lon, lat]) => [[lon, lat], [lon - pad, lat], [lon + pad, lat], [lon, Math.max(-89, lat - pad)], [lon, Math.min(89, lat + pad)]] as const);
};

/** Mercator distorts the poles without bound; frames stay between these latitudes. */
const FRAME_SOUTH = -58;

const FRAME_NORTH = 76;

/**
 * A Mercator projection framed on `features` (and `pins`, [lon, lat] points). The box is taken on the globe, so
 * an area that crosses the 180° meridian (Russia's Chukotka, Fiji) frames as one piece instead of the whole
 * world, and the projection is turned to the box's middle longitude.
 */
const framedProjection = (features: Features, pins: readonly (readonly [number, number])[], latitudes: readonly number[], extent: [[number, number], [number, number]]) => {
	const boundsOf = (points: readonly (readonly [number, number])[]) =>
		geoBounds({type: 'FeatureCollection', features: [...features, ...points.map((at) => ({type: 'Feature', properties: {}, geometry: {type: 'Point', coordinates: [at[0], at[1]]}}))]} as unknown as GeoPermissibleObjects);
	const [[firstWest, firstSouth], [firstEast, firstNorth]] = boundsOf(pins);
	const firstSpan = Math.max(firstEast >= firstWest ? firstEast - firstWest : firstEast + 360 - firstWest, firstNorth - firstSouth);
	const [[west, south], [east, north]] = boundsOf(pinMargin(pins, firstSpan));
	// Parallels are drawn to place things on the globe, so a map that asks for them shows the whole world,
	// centred on the prime meridian as in school atlases.
	const world = latitudes.length > 0;
	const span = world ? 360 : east >= west ? east - west : east + 360 - west;
	const middle = world ? 0 : west + span / 2;
	// Reference parallels widen the frame a little past themselves, up to the polar circles.
	const top = Math.min(78, Math.max(Math.min(FRAME_NORTH, north), ...latitudes.map((latitude) => latitude + 4)));
	const bottom = Math.max(-72, Math.min(Math.max(FRAME_SOUTH, south), ...latitudes.map((latitude) => latitude - 4)));
	// The box's outline as points along its edges.
	const steps = 12;
	const outline: [number, number][] = [];
	for (let index = 0; index <= steps; index++) {
		const lon = middle - span / 2 + (span * index) / steps;
		outline.push([lon, top], [lon, bottom]);
	}
	// A frame wider than a hemisphere is the world: Natural Earth keeps it wide and its parallels straight, where
	// Mercator would leave the box half empty and swell the poles.
	const projection = (span > 150 ? geoNaturalEarth1() : geoMercator()).rotate([-middle, 0]).fitExtent(extent, {type: 'MultiPoint', coordinates: outline} as GeoPermissibleObjects);
	return {projection, west: middle - span / 2, span};
};

type Box = {left: number; right: number; top: number; bottom: number};

const overlaps = (a: Box, b: Box) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

const overlapArea = (a: Box, b: Box) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));

/**
 * The room routes take on the map: small boxes every few pixels along each line, and a larger one round the
 * arrowhead, so labels sit beside a route rather than on it.
 */
export const routeObstacles = (routes: readonly {points: readonly (readonly [number, number])[]; arrow?: boolean}[], point: (at: readonly [number, number]) => readonly [number, number] | number[], unit: number): Box[] =>
	routes.flatMap((route) => {
		const screen = route.points.map((at) => point(at));
		const step = 24 * unit;
		const line = 6 * unit;
		const boxes: Box[] = [];
		screen.slice(1).forEach(([bx, by], index) => {
			const [ax, ay] = screen[index];
			const count = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / step));
			for (let k = 0; k <= count; k++) {
				const x = ax + ((bx - ax) * k) / count;
				const y = ay + ((by - ay) * k) / count;
				boxes.push({left: x - line, right: x + line, top: y - line, bottom: y + line});
			}
		});
		if (route.arrow !== false && screen.length > 1) {
			const [ex, ey] = screen[screen.length - 1];
			const head = 24 * unit;
			boxes.push({left: ex - head, right: ex + head, top: ey - head, bottom: ey + head});
		}
		return boxes;
	});

/** Where a marker's label may go, in order: above the dot, below, right, left, then the four corners. */
const aroundPoint = (text: string, unit: number): [number, number][] => {
	const half = (labelBox(0, 0, text, unit, false).right - labelBox(0, 0, text, unit, false).left) / 2;
	const side = half + 26 * unit;
	return [[0, -40 * unit], [0, 44 * unit], [side, 0], [-side, 0], [side, -40 * unit], [-side, -40 * unit], [side, 44 * unit], [-side, 44 * unit], [0, -92 * unit], [0, 96 * unit]];
};

/**
 * The first spot around (x, y) where the label covers nothing already placed and stays inside the map; when
 * every spot is taken, the one that covers least. `overlap` tells how much it still covers.
 */
const placeLabel = (x: number, y: number, text: string, small: boolean, placed: readonly Box[], frame: {width: number; height: number; margin: number}, unit: number, offsets: readonly [number, number][]) => {
	let best: {x: number; y: number; box: Box; overlap: number} | null = null;
	for (const [dx, dy] of offsets) {
		let box = labelBox(x + dx, y + dy, text, unit, small);
		// Nudged back inside the map rather than cut off at its edge.
		const shiftX = Math.max(0, frame.margin - box.left) - Math.max(0, box.right - (frame.width - frame.margin));
		const shiftY = Math.max(0, frame.margin - box.top) - Math.max(0, box.bottom - (frame.height - frame.margin));
		box = {left: box.left + shiftX, right: box.right + shiftX, top: box.top + shiftY, bottom: box.bottom + shiftY};
		const overlap = placed.reduce((total, other) => total + overlapArea(box, other), 0);
		const spot = {x: x + dx + shiftX, y: y + dy + shiftY, box, overlap};
		if (overlap === 0) return spot;
		if (!best || overlap < best.overlap) best = spot;
	}
	return best!;
};

/**
 * How wide a map label's pill is, in units at full size: its text measured letter by letter for Manrope bold at
 * 26 (capitals and digits wider, spaces and narrow letters thinner), plus padding.
 */
export const mapLabelWidth = (text: string) => {
	let em = 0;
	for (const letter of text) em += /[\sıiIl.,:;'’!|]/.test(letter) ? 0.3 : /[A-ZÇĞİÖŞÜ0-9MWmw]/.test(letter) ? 0.7 : 0.57;
	return em * 26 + 36;
};

/** The box a label takes, as MapLabel draws it. */
const labelBox = (x: number, y: number, text: string, unit: number, small: boolean): Box => {
	const scale = unit * (small ? 0.8 : 1);
	const width = mapLabelWidth(text) * scale;
	return {left: x - width / 2, right: x + width / 2, top: y - 24 * scale, bottom: y + 20 * scale};
};

/** A colour with an alpha, from a hex colour of the palette. */
const withAlphaHex = (hex: string, alpha: number) => (hex.startsWith('#') && hex.length === 7 ? `${hex}${Math.round(alpha * 255).toString(16).padStart(2, '0')}` : hex);

/** A map name on a pill: `ink` for places, `lesson` for reference lines, `brand` for routes (the colour of their line, so a route's name never melts into a highlighted area). */
const MapLabel: React.FC<{x: number; y: number; text: string; small?: boolean; tone?: 'ink' | 'lesson' | 'brand'}> = ({x, y, text, small = false, tone = 'ink'}) => {
	const palette = useVisualPalette();
	const {u: unit} = useVideoLayout();
	const u = (value: number) => unit(value) * (small ? 0.8 : 1);
	const width = u(mapLabelWidth(text));
	return (
		<g>
			<rect x={x - width / 2} y={y - u(24)} width={width} height={u(44)} rx={u(12)} fill={tone === 'lesson' ? palette.lesson : tone === 'brand' ? palette.brand : palette.ink} opacity={0.92} />
			<text x={x} y={y + u(8)} fill={tone === 'lesson' ? palette.onLesson : tone === 'brand' ? '#FFFFFF' : palette.surface} fontSize={u(26)} fontWeight={700} textAnchor="middle">
				{text}
			</text>
		</g>
	);
};

/** The lines a map draws for `lines`, in geographic coordinates, with their labels as taught in Turkish schools. */
type MapLine = {geometry: GeoPermissibleObjects; label?: string; latitude?: number; longitude?: number; major: boolean; dashed: boolean; chosen?: boolean};

const parallel = (latitude: number, label: string, dashed: boolean): MapLine => ({
	geometry: {type: 'LineString', coordinates: Array.from({length: 73}, (_, index) => [-180 + index * 5, latitude])} as GeoPermissibleObjects,
	label,
	latitude,
	major: true,
	dashed,
});

/** "36° K", "26° D", "0°": a parallel or meridian named as Turkish atlases write it. */
/** The parallels and meridians a lesson asks for by degree; their part name is their label. */
const customLines = (parallels: readonly number[], meridians: readonly number[]): (MapLine & {name: string})[] => [
	...parallels.map((latitude) => {
		const label = degreeLabel(latitude, 'K', 'G');
		return {name: label, ...parallel(latitude, label, true), chosen: true};
	}),
	...meridians.map((longitude) => {
		const label = degreeLabel(longitude, 'D', 'B');
		return {name: label, geometry: {type: 'LineString', coordinates: Array.from({length: 35}, (_, index) => [longitude, -85 + index * 5])} as GeoPermissibleObjects, label, longitude, major: true, dashed: true, chosen: true};
	}),
];

const MAP_LINE_GEOMETRY: Record<(typeof MAP_LINES)[number], MapLine[]> = {
	equator: [parallel(0, 'Ekvator 0°', false)],
	tropics: [parallel(23.45, "Yengeç Dönencesi 23°27' K", true), parallel(-23.45, "Oğlak Dönencesi 23°27' G", true)],
	polarCircles: [parallel(66.55, "Kuzey Kutup Dairesi 66°33' K", true), parallel(-66.55, "Güney Kutup Dairesi 66°33' G", true)],
	primeMeridian: [{geometry: {type: 'LineString', coordinates: Array.from({length: 37}, (_, index) => [0, -90 + index * 5])} as GeoPermissibleObjects, label: 'Başlangıç Meridyeni 0°', longitude: 0, major: true, dashed: false}],
	graticule: [{geometry: geoGraticule().step([15, 15])() as GeoPermissibleObjects, major: false, dashed: false}],
};
