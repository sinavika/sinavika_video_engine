import {geoMercator, geoPath, type GeoPermissibleObjects} from 'd3-geo';
import type {Feature, FeatureCollection, Geometry} from 'geojson';
import React, {useEffect, useMemo, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {feature} from 'topojson-client';
import type {GeometryCollection, Topology} from 'topojson-specification';
import {GEO_FILES, GEO_LAYERS, MAP_COLORS, geoCredit, type GeoLayer} from '../../Configurations/GeoData';
import {useVideoLayout} from '../Layouts/VideoLayout';
import {useReveal, useVisualPalette, type VisualBoxProps} from './VisualFrame';
import {Part, elementLook, useElementState} from './VisualTimeline';
import type {CourseVisual} from './VisualSchemas';

type Timeline = Extract<CourseVisual, {kind: 'timeline'}>;
type MapSpec = Extract<CourseVisual, {kind: 'map'}>;

const yearText = (year: number, era: Timeline['era']): string => {
	if (era === 'hijri') return `${year} H.`;
	return year < 0 ? `MÖ ${-year}` : String(year);
};

/**
 * Dated events on one line, spaced by time (not evenly), so gaps between
 * events can be seen. Labels alternate above and below the line, and each
 * event appears in turn.
 */
export const TimelineVisual: React.FC<VisualBoxProps & {visual: Timeline}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const events = [...visual.events].sort((a, b) => a.year - b.year);
	const [first, last] = [events[0].year, events[events.length - 1].year];
	const pad = u(90);
	const xOf = (year: number) => pad + ((year - first) / Math.max(1, last - first)) * (width - pad * 2);
	const lineY = height / 2;
	const axis = useReveal(delaySeconds, 0.7);

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontBody}}>
			<line x1={pad - u(40)} x2={pad - u(40) + (width - pad * 2 + u(80)) * axis} y1={lineY} y2={lineY} stroke={palette.ink} strokeWidth={u(6)} strokeLinecap="round" />
			{events.map((event, index) => (
				<TimelineEvent key={`${event.year}-${index}`} id={`e${index + 1}`} x={xOf(event.year)} lineY={lineY} above={index % 2 === 0} year={yearText(event.year, visual.era)} label={event.label} detail={event.detail} delaySeconds={delaySeconds + 0.5 + index * 0.4} width={Math.min(u(320), (width - pad * 2) / Math.max(1, events.length - 1) + u(140))} />
			))}
		</svg>
	);
};

const TimelineEvent: React.FC<{id: string; x: number; lineY: number; above: boolean; year: string; label: string; detail?: string; delaySeconds: number; width: number}> = ({id, x, lineY, above, year, label, detail, delaySeconds, width}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const look = elementLook(useElementState(id));
	const show = useReveal(delaySeconds, 0.45, 'overshoot') * look.opacity;
	const stem = u(70);
	const boxY = above ? lineY - stem - u(150) : lineY + stem;
	return (
		<g opacity={Math.min(1, show)}>
			<line x1={x} x2={x} y1={lineY} y2={above ? lineY - stem : lineY + stem} stroke={palette.lesson} strokeWidth={u(4)} />
			<circle cx={x} cy={lineY} r={u(16) * show * look.scale} fill={palette.lesson} stroke={palette.surface} strokeWidth={u(5)} />
			<foreignObject x={x - width / 2} y={boxY} width={width} height={u(150)}>
				<div style={{height: '100%', display: 'flex', flexDirection: 'column', justifyContent: above ? 'flex-end' : 'flex-start', alignItems: 'center', textAlign: 'center', gap: u(4), fontFamily: palette.fontBody}}>
					<div style={{fontFamily: palette.fontDisplay, fontWeight: 900, fontSize: u(38), color: palette.lesson, lineHeight: 1}}>{year}</div>
					<div style={{fontWeight: 700, fontSize: u(28), color: palette.ink, lineHeight: 1.15}}>{label}</div>
					{detail ? <div style={{fontSize: u(22), color: palette.muted, lineHeight: 1.2}}>{detail}</div> : null}
				</div>
			</foreignObject>
		</g>
	);
};

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
		const framed = {type: 'FeatureCollection', features: frameOn.length > 0 ? frameOn : base} as FeatureCollection as GeoPermissibleObjects;
		const projection = geoMercator().fitExtent([[u(30), u(30)], [width - u(30), height - u(30)]], framed);
		const overlays = visual.overlays.map((overlay, index) => {
			const all = featuresOf(files, overlaySources[index]);
			return {...overlay, draw: GEO_LAYERS[overlay.layer].draw, features: overlay.names.length > 0 ? all.filter((item) => overlay.names.includes(nameOf(item))) : all};
		});
		return {projection, path: geoPath(projection), base, overlays, highlighted: new Set(visual.highlights.map((item) => item.name))};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [files, visual, width, height, u]);

	if (!drawing) return <svg width={width} height={height} />;
	const {projection, path, base, overlays, highlighted} = drawing;
	const point = (at: [number, number]) => projection(at) ?? [0, 0];
	const credits = [...new Set([baseSource, ...overlaySources].map((source) => geoCredit(source.src, source.object)).filter(Boolean))];

	// Names of rivers and lakes: each once, on its largest piece, largest features first; a name that would cover
	// one already placed (or a highlight's or marker's label) is left out rather than piled on top.
	const placed = [
		...visual.highlights.flatMap((item) => {
			const area = base.find((entry) => nameOf(entry) === item.name);
			if (!area || !item.label) return [];
			const [cx, cy] = path.centroid(area);
			return [labelBox(cx, cy, item.label, u(1), false)];
		}),
		...visual.markers.map((marker) => {
			const [mx, my] = point(marker.at);
			return labelBox(mx, my - u(36), marker.label, u(1), false);
		}),
	];
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
		if (placed.some((other) => box.left < other.right && box.right > other.left && box.top < other.bottom && box.bottom > other.top)) continue;
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
			{visual.routes.map((route, index) => {
				const d = route.points.map((at, step) => `${step === 0 ? 'M' : 'L'}${point(at).join(' ')}`).join(' ');
				return (
					<Part key={`r${index}`} id={route.label ?? `r${index + 1}`}>
						{(look) => <path d={d} fill="none" stroke={palette.brand} strokeWidth={u(7) * look.scale} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - routeProgress * Math.min(1, look.opacity * 1.5)} opacity={look.opacity} />}
					</Part>
				);
			})}
			<g opacity={marks}>
				{overlayLabels.map((label) => (
					<MapLabel key={label.key} x={label.x} y={label.y} text={label.text} small />
				))}
				{visual.highlights.map((item) => {
					const area = base.find((entry) => nameOf(entry) === item.name);
					if (!area || !item.label) return null;
					const [cx, cy] = path.centroid(area);
					return <MapLabel key={item.name} x={cx} y={cy} text={item.label} />;
				})}
				{visual.markers.map((marker, index) => {
					const [mx, my] = point(marker.at);
					return (
						<Part key={`m${index}`} id={marker.label}>
							{(look) => (
								<g opacity={look.opacity}>
									<circle cx={mx} cy={my} r={u(12) * look.scale} fill={palette.brand} stroke={palette.surface} strokeWidth={u(4)} />
									<MapLabel x={mx} y={my - u(36)} text={marker.label} />
								</g>
							)}
						</Part>
					);
				})}
			</g>
			{credits.length > 0 ? (
				<text x={width - u(16)} y={height - u(14)} textAnchor="end" fill={palette.muted} fontSize={u(18)}>
					{credits.join(' · ')}
				</text>
			) : null}
		</svg>
	);
};

/** The box a label takes, as MapLabel draws it. */
const labelBox = (x: number, y: number, text: string, unit: number, small: boolean) => {
	const scale = unit * (small ? 0.8 : 1);
	const width = 18 * scale * text.length + 28 * scale;
	return {left: x - width / 2, right: x + width / 2, top: y - 24 * scale, bottom: y + 20 * scale};
};

const MapLabel: React.FC<{x: number; y: number; text: string; small?: boolean}> = ({x, y, text, small = false}) => {
	const palette = useVisualPalette();
	const {u: unit} = useVideoLayout();
	const u = (value: number) => unit(value) * (small ? 0.8 : 1);
	const width = u(18) * text.length + u(28);
	return (
		<g>
			<rect x={x - width / 2} y={y - u(24)} width={width} height={u(44)} rx={u(12)} fill={palette.ink} opacity={0.88} />
			<text x={x} y={y + u(8)} fill={palette.surface} fontSize={u(26)} fontWeight={700} textAnchor="middle">
				{text}
			</text>
		</g>
	);
};
