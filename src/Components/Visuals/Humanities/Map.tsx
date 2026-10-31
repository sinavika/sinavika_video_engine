import {geoBounds, geoGraticule, geoMercator, geoNaturalEarth1, geoPath, type GeoPermissibleObjects} from 'd3-geo';
import type {Feature, FeatureCollection, Geometry} from 'geojson';
import React, {useEffect, useMemo, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {feature} from 'topojson-client';
import type {GeometryCollection, Topology} from 'topojson-specification';
import {GEO_FILES, GEO_LAYERS, geoCredit, type GeoLayer, MAP_COLORS} from '../../../Configurations/GeoData';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {useReveal, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import {type CourseVisual} from '../VisualSchema';
import {MAP_LINES} from './HumanitiesSchema';
import {Part} from '../VisualTimeline';

type MapSpec = Extract<CourseVisual, {kind: 'map'}>;

type Features = Feature<Geometry, {name?: string}>[];

const topologyFeatures = (topology: Topology, object?: string): Features => {
	const key = object ?? Object.keys(topology.objects)[0];
	const collection = feature(topology, topology.objects[key] as GeometryCollection) as unknown as FeatureCollection<Geometry, {name?: string}>;
	return collection.features;
};

const nameOf = (item: Features[number]): string => item.properties?.name ?? '';

type LayerSource = {src: string; object?: string};

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
	const files = useGeoFiles([baseSource.src, ...overlaySources.map((source) => source.src)]);
	const reveal = useReveal(delaySeconds, 0.6);
	const marks = useReveal(delaySeconds + 0.6, 0.6);
	const lines = useReveal(delaySeconds + 0.4, 1.2);
	const routeProgress = useReveal(delaySeconds + 1, 1.4);

	const drawing = useMemo(() => {
		if (!files) return null;
		const base = featuresOf(files, baseSource);
		const named = (names: readonly string[]) => base.filter((item) => names.includes(nameOf(item)));
		// The world is framed on what the map is about; Turkey's own maps show all of it unless told otherwise.
		const frameOn = named(visual.focus.length > 0 ? visual.focus : visual.base === 'countries' ? visual.highlights.map((item) => item.name) : []);
		// Markers and routes are always inside the frame, so a place the lesson names is never cut off.
		const pins = [...visual.markers.map((marker) => marker.at), ...visual.routes.flatMap((route) => route.points)];
		// A country's extreme parallels and meridians stay in view: their crossings join the frame, on any map.
		const crossings = visual.parallels.flatMap((latitude) => visual.meridians.map((longitude) => [longitude, latitude] as [number, number]));
		// Parallels the lesson asks for are always in view: an Equator or a tropic cut off the map teaches nothing.
		const latitudes = visual.lines.flatMap((name) => MAP_LINE_GEOMETRY[name].flatMap((line) => (line.latitude === undefined ? [] : [line.latitude])));
		const {projection, west, span} = framedProjection(frameOn.length > 0 ? frameOn : base, [...(frameOn.length > 0 || base.length === 0 ? pins : []), ...crossings], latitudes, [[u(30), u(30)], [width - u(30), height - u(30)]]);
		const overlays = visual.overlays.map((overlay, index) => {
			const all = featuresOf(files, overlaySources[index]);
			return {...overlay, draw: GEO_LAYERS[overlay.layer].draw, features: overlay.names.length > 0 ? all.filter((item) => overlay.names.includes(nameOf(item))) : all};
		});
		return {projection, west, span, path: geoPath(projection), base, overlays, highlighted: new Set(visual.highlights.map((item) => item.name))};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [files, visual, width, height, u]);

	if (!drawing) return <svg width={width} height={height} />;
	const {projection, west, span, path, base, overlays, highlighted} = drawing;
	const point = (at: readonly [number, number]) => projection([at[0], at[1]]) ?? [0, 0];
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
	// The shades' legend sits in the lower left corner; labels keep clear of it.
	const legendRow = u(40);
	const legendWidth = visual.shades.length > 0 ? u(64) + Math.max(...visual.shades.map((shade) => shade.label.length)) * u(13) : 0;
	const legendTop = height - u(20) - visual.shades.length * legendRow - u(16);
	if (visual.shades.length > 0) placed.push({left: u(16), right: u(16) + legendWidth, top: legendTop, bottom: height - u(16)});
	const shadeAlpha = (index: number) => (visual.shades.length === 1 ? 1 : 1 - (0.72 * index) / (visual.shades.length - 1));
	// Kinds get colours of their own (lesson, brand, then a blue, a purple and a sand); ordered classes get tones of the lesson colour.
	const CONTRAST = [palette.lesson, palette.brand, '#2F6A9F', '#8E44AD', '#C9A227'];
	const shadeFill = (index: number) => (visual.shadeStyle === 'contrast' ? withAlphaHex(CONTRAST[index % CONTRAST.length], 0.85) : withAlphaHex(palette.lesson, shadeAlpha(index)));
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
		const [cx, cy] = path.centroid(area);
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
	const overlayLabels: {key: string; x: number; y: number; text: string}[] = [];
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
			return [...largest.entries()].map(([name, {item, size}]) => ({key: `${overlay.layer}-${name}`, name, item, size}));
		})
		.sort((a, b) => b.size - a.size);
	for (const candidate of candidates) {
		const [cx, cy] = path.centroid(candidate.item);
		if (!Number.isFinite(cx)) continue;
		const box = labelBox(cx, cy, candidate.name, u(1), true);
		if (placed.some((other) => overlaps(box, other))) continue;
		placed.push(box);
		overlayLabels.push({key: candidate.key, x: cx, y: cy, text: candidate.name});
	}

	return (
		<svg width={width} height={height} style={{overflow: 'hidden', fontFamily: palette.fontBody, borderRadius: u(24)}}>
			<rect width={width} height={height} fill={MAP_COLORS.waterFill} />
			<g opacity={reveal}>
				{base.map((item, index) => (
					<path key={index} d={path(item) ?? ''} fill={MAP_COLORS.land} stroke={palette.border} strokeWidth={u(1.5)} />
				))}
				{/* Shaded classes, darkest first; a beat points at a class by its label. */}
				{visual.shades.map((shade, index) => (
					<Part key={`s${index}`} id={shade.label}>
						{(look) => (
							<g opacity={look.opacity}>
								{base
									.filter((item) => shade.names.includes(nameOf(item)))
									.map((item, areaIndex) => (
										<path key={areaIndex} d={path(item) ?? ''} fill={shadeFill(index)} stroke={look.scale > 1 ? palette.ink : palette.border} strokeWidth={u(1.5) * (look.scale > 1 ? 2 : 1)} />
									))}
							</g>
						)}
					</Part>
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
					{overlay.features.map((item, index) =>
						overlay.draw === 'lines' ? (
							<path key={index} d={path(item) ?? ''} fill="none" stroke={MAP_COLORS.water} strokeWidth={u(4)} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - lines} />
						) : overlay.draw === 'water' ? (
							<path key={index} d={path(item) ?? ''} fill={MAP_COLORS.water} stroke="none" />
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
			{visual.routes.map((route, index) => {
				const d = route.points.map((at, step) => `${step === 0 ? 'M' : 'L'}${point(at).join(' ')}`).join(' ');
				// The arrowhead points along the last stretch and comes in once the line has reached it.
				const [ex, ey] = point(route.points[route.points.length - 1]);
				const [px, py] = point(route.points[route.points.length - 2]);
				const angle = (Math.atan2(ey - py, ex - px) * 180) / Math.PI;
				return (
					<Part key={`r${index}`} id={route.label ?? `r${index + 1}`}>
						{(look) => {
							// The line's length follows its appearance only: when another part takes the focus the route fades
							// but stays whole (29 Oct 2026: Fırat and Dicle lost their mouths once the beat moved on to Suriye and Irak).
							const drawn = routeProgress * Math.min(1, look.appear * 1.5);
							return (
								<g opacity={look.opacity}>
									<path d={d} fill="none" stroke={palette.brand} strokeWidth={u(7) * look.scale} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - drawn} />
									{route.arrow && drawn > 0.97 ? <path d={`M0 0 L${-u(30)} ${-u(15)} L${-u(30)} ${u(15)} Z`} transform={`translate(${ex} ${ey}) rotate(${angle}) scale(${look.scale})`} fill={palette.brand} stroke={palette.surface} strokeWidth={u(2)} /> : null}
								</g>
							);
						}}
					</Part>
				);
			})}
			<g opacity={marks}>
				{overlayLabels.map((label) => (
					<MapLabel key={label.key} x={label.x} y={label.y} text={label.text} small />
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
			{credits.length > 0 ? (
				<text x={width - u(16)} y={height - u(14)} textAnchor="end" fill={palette.muted} fontSize={u(18)}>
					{credits.join(' · ')}
				</text>
			) : null}
		</svg>
	);
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
	const pinFeatures = pins.map((at) => ({type: 'Feature', properties: {}, geometry: {type: 'Point', coordinates: [at[0], at[1]]}}));
	const [[west, south], [east, north]] = geoBounds({type: 'FeatureCollection', features: [...features, ...pinFeatures]} as unknown as GeoPermissibleObjects);
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
const degreeLabel = (value: number, positive: string, negative: string) => {
	const whole = Math.abs(value);
	const degrees = Math.floor(whole + 1e-9);
	const minutes = Math.round((whole - degrees) * 60);
	const text = minutes > 0 ? `${degrees}°${String(minutes).padStart(2, '0')}'` : `${degrees}°`;
	return value === 0 ? text : `${text} ${value > 0 ? positive : negative}`;
};

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
