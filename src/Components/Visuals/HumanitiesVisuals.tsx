import {geoMercator, geoPath, type GeoPermissibleObjects} from 'd3-geo';
import type {Feature, FeatureCollection, Geometry} from 'geojson';
import React, {useEffect, useMemo, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {feature} from 'topojson-client';
import type {GeometryCollection, Topology} from 'topojson-specification';
import world110 from 'world-atlas/countries-110m.json';
import world50 from 'world-atlas/countries-50m.json';
import {useVideoLayout} from '../Layouts/VideoLayout';
import {useReveal, useVisualPalette, type VisualBoxProps} from './VisualFrame';
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
				<TimelineEvent key={`${event.year}-${index}`} x={xOf(event.year)} lineY={lineY} above={index % 2 === 0} year={yearText(event.year, visual.era)} label={event.label} detail={event.detail} delaySeconds={delaySeconds + 0.5 + index * 0.4} width={Math.min(u(320), (width - pad * 2) / Math.max(1, events.length - 1) + u(140))} />
			))}
		</svg>
	);
};

const TimelineEvent: React.FC<{x: number; lineY: number; above: boolean; year: string; label: string; detail?: string; delaySeconds: number; width: number}> = ({x, lineY, above, year, label, detail, delaySeconds, width}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const show = useReveal(delaySeconds, 0.45, 'overshoot');
	const stem = u(70);
	const boxY = above ? lineY - stem - u(150) : lineY + stem;
	return (
		<g opacity={Math.min(1, show)}>
			<line x1={x} x2={x} y1={lineY} y2={above ? lineY - stem : lineY + stem} stroke={palette.lesson} strokeWidth={u(4)} />
			<circle cx={x} cy={lineY} r={u(16) * show} fill={palette.lesson} stroke={palette.surface} strokeWidth={u(5)} />
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

type Features = Feature<Geometry, {name?: string; NAME?: string; name_tr?: string}>[];

const topologyFeatures = (topology: Topology, object?: string): Features => {
	const key = object ?? Object.keys(topology.objects)[0];
	const collection = feature(topology, topology.objects[key] as GeometryCollection) as unknown as FeatureCollection<Geometry, {name?: string}>;
	return collection.features;
};

const WORLD = {
	'110m': () => topologyFeatures(world110 as unknown as Topology, 'countries'),
	'50m': () => topologyFeatures(world50 as unknown as Topology, 'countries'),
};

const nameOf = (item: Features[number]): string => item.properties?.name_tr ?? item.properties?.name ?? item.properties?.NAME ?? '';

/** Loads the map's areas: the bundled world, or a GeoJSON / TopoJSON file from public/, waiting for it before the frame is captured. */
const useMapFeatures = (source: MapSpec['source']): Features | null => {
	const [loaded, setLoaded] = useState<Features | null>(() => (source.kind === 'world' ? WORLD[source.detail]() : null));
	const [handle] = useState(() => (source.kind === 'file' ? delayRender(`Loading map ${source.src}`) : null));
	useEffect(() => {
		if (source.kind !== 'file' || handle === null) return;
		fetch(staticFile(source.src))
			.then((response) => response.json())
			.then((data: Topology | FeatureCollection) => {
				setLoaded(data.type === 'Topology' ? topologyFeatures(data, source.object) : ((data as FeatureCollection<Geometry, {name?: string}>).features as Features));
				continueRender(handle);
			})
			.catch(() => continueRender(handle));
	}, [source, handle]);
	return loaded;
};

/**
 * A map drawn with d3-geo: areas, the highlighted ones in the lesson colour
 * with their labels, markers and routes (a campaign, a migration, a river).
 * The view is framed on `focus`, else on the highlights, else on everything.
 */
export const MapVisual: React.FC<VisualBoxProps & {visual: MapSpec}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const features = useMapFeatures(visual.source);
	const base = useReveal(delaySeconds, 0.6);
	const marks = useReveal(delaySeconds + 0.6, 0.6);
	const routeProgress = useReveal(delaySeconds + 1, 1.4);

	const drawing = useMemo(() => {
		if (!features) return null;
		const wanted = (names: readonly string[]) => features.filter((item) => names.includes(nameOf(item)));
		const frameOn = wanted(visual.focus.length > 0 ? visual.focus : visual.highlights.map((item) => item.name));
		const framed: GeoPermissibleObjects = {type: 'FeatureCollection', features: frameOn.length > 0 ? frameOn : features} as FeatureCollection;
		const projection = geoMercator().fitExtent([[u(30), u(30)], [width - u(30), height - u(30)]], framed);
		return {projection, path: geoPath(projection), highlighted: new Set(visual.highlights.map((item) => item.name))};
	}, [features, visual.focus, visual.highlights, width, height, u]);

	if (!features || !drawing) return <svg width={width} height={height} />;
	const {projection, path, highlighted} = drawing;
	const point = (at: [number, number]) => projection(at) ?? [0, 0];

	return (
		<svg width={width} height={height} style={{overflow: 'hidden', fontFamily: palette.fontBody, borderRadius: u(24)}}>
			<rect width={width} height={height} fill={palette.fill} opacity={0.5} />
			<g opacity={base}>
				{features.map((item, index) => (
					<path key={index} d={path(item) ?? ''} fill={highlighted.has(nameOf(item)) ? palette.lesson : palette.surface} stroke={palette.border} strokeWidth={u(1.5)} />
				))}
			</g>
			{visual.routes.map((route, index) => {
				const d = route.points.map((at, step) => `${step === 0 ? 'M' : 'L'}${point(at).join(' ')}`).join(' ');
				return <path key={`r${index}`} d={d} fill="none" stroke={palette.brand} strokeWidth={u(7)} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - routeProgress} />;
			})}
			<g opacity={marks}>
				{visual.highlights.map((item) => {
					const area = features.find((entry) => nameOf(entry) === item.name);
					if (!area || !item.label) return null;
					const [cx, cy] = path.centroid(area);
					return <MapLabel key={item.name} x={cx} y={cy} text={item.label} />;
				})}
				{visual.markers.map((marker, index) => {
					const [mx, my] = point(marker.at);
					return (
						<g key={`m${index}`}>
							<circle cx={mx} cy={my} r={u(12)} fill={palette.brand} stroke={palette.surface} strokeWidth={u(4)} />
							<MapLabel x={mx} y={my - u(36)} text={marker.label} />
						</g>
					);
				})}
			</g>
		</svg>
	);
};

const MapLabel: React.FC<{x: number; y: number; text: string}> = ({x, y, text}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
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
