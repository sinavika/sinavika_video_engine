import React from 'react';
import {Img, staticFile} from 'remotion';
import {clamp01, easeFrom, lerp} from '../../../Animations/Motion';
import {useVideoLayout} from '../../Layouts/VideoLayout';
import {withAlpha} from '../../../Themes/Theme';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {useElementState, useTimeline} from '../VisualTimeline';

type Picture = Extract<CourseVisual, {kind: 'picture'}>;
type Region = Picture['regions'][number];

/** How close the camera comes to a region: it fills about this share of the frame, never past this zoom. */
const REGION_FILL = 0.86;
const MAX_ZOOM = 2.6;
/** The slow push-in of a documentary over a still picture, over this many seconds. */
const DRIFT = {zoom: 0.06, seconds: 18};
const MOVE_SECONDS = 1.4;
const REGION_SLOTS = 6;

/**
 * A painting or photograph from the media library, shown as a documentary shows one: the camera pushes in slowly,
 * and when a beat points at one of its regions (`regions`, as shares of the picture) it moves there, frames it and
 * names it under the picture. The credit line stays under it all the time.
 */
export const PictureVisual: React.FC<VisualBoxProps & {visual: Picture}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {u} = useVideoLayout();
	const show = useReveal(delaySeconds, 0.5);
	const timeline = useTimeline();
	const seconds = useSceneSeconds();
	const regions = visual.regions;
	// One hook call per slot, whatever the number of regions, so the hook order never changes.
	const looks = Array.from({length: REGION_SLOTS}, (_, index) => useElementState(regions[index]?.name));

	const captionLines = visual.caption || regions.length > 0 ? 1 : 0;
	const textHeight = u(52 + 46 * captionLines);
	const area = {width, height: height - textHeight};
	const aspect = visual.aspect ?? area.width / area.height;
	const fit = {width: Math.min(area.width, area.height * aspect), height: Math.min(area.width, area.height * aspect) / aspect};

	// The region the current beat points at, and the one before it: the camera moves from one to the other.
	let current = -1;
	timeline?.starts.forEach((start, index) => {
		if (seconds >= start) current = index;
	});
	const pointed = (index: number): Region | undefined => (timeline && index >= 0 ? regions.find((region) => (timeline.beats[index].focus ?? []).some((name) => name.toLocaleLowerCase('tr') === region.name.toLocaleLowerCase('tr'))) : undefined);
	const now = pointed(current);
	const before = pointed(current - 1);
	const view = (region: Region | undefined) => {
		if (!region) return {zoom: 1, x: 0.5, y: 0.5};
		const [left, top, right, bottom] = region.box;
		const zoom = Math.max(1, Math.min(MAX_ZOOM, REGION_FILL * Math.min(area.width / ((right - left) * fit.width), area.height / ((bottom - top) * fit.height))));
		return {zoom, x: (left + right) / 2, y: (top + bottom) / 2};
	};
	const move = timeline && current >= 0 ? easeFrom(seconds, timeline.starts[current], MOVE_SECONDS) : 1;
	const from = view(before);
	const to = view(now);
	const drift = 1 + DRIFT.zoom * clamp01((seconds - delaySeconds) / DRIFT.seconds);
	const zoom = lerp(from.zoom, to.zoom, move) * drift;
	const centre = {x: lerp(from.x, to.x, move), y: lerp(from.y, to.y, move)};
	const shown = {width: fit.width * zoom, height: fit.height * zoom};
	// Keep the picture covering the frame where it is larger than it; centre it where it is smaller.
	const place = (size: number, room: number, at: number) => (size <= room ? (room - size) / 2 : Math.min(0, Math.max(room - size, room / 2 - at * size)));
	const left = place(shown.width, area.width, centre.x);
	const top = place(shown.height, area.height, centre.y);

	const named = regions.find((_, index) => looks[index].emphasis > 0.5);
	const caption = named?.label ?? visual.caption;
	return (
		<div style={{width, height, display: 'flex', flexDirection: 'column', gap: u(10), opacity: show}}>
			<div style={{position: 'relative', width: area.width, height: area.height, overflow: 'hidden', borderRadius: u(20)}}>
				{/* Where the picture does not fill the frame (a portrait photograph), a blurred, darkened copy of it does. */}
				{shown.width < area.width - 2 || shown.height < area.height - 2 ? (
					<Img src={staticFile(visual.src)} style={{position: 'absolute', left: 0, top: 0, width: area.width, height: area.height, objectFit: 'cover', filter: 'blur(28px) brightness(0.55) saturate(0.85)', transform: 'scale(1.15)'}} />
				) : null}
				<Img src={staticFile(visual.src)} style={{position: 'absolute', left, top, width: shown.width, height: shown.height}} />
				<svg width={area.width} height={area.height} style={{position: 'absolute', left: 0, top: 0}}>
					{regions.map((region, index) => {
						const look = looks[index];
						if (look.emphasis <= 0.01) return null;
						const [x0, y0, x1, y1] = region.box;
						return (
							<rect
								key={region.name}
								x={left + x0 * shown.width}
								y={top + y0 * shown.height}
								width={(x1 - x0) * shown.width}
								height={(y1 - y0) * shown.height}
								rx={u(14)}
								fill="none"
								stroke={palette.lesson}
								strokeWidth={u(6)}
								opacity={look.emphasis}
								style={{filter: `drop-shadow(0 0 ${u(6)}px ${withAlpha('#000000', 0.45)})`}}
							/>
						);
					})}
				</svg>
			</div>
			{captionLines ? (
				<div style={{fontFamily: palette.fontBody, fontWeight: 700, fontSize: u(34), color: named ? palette.lesson : palette.ink, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{caption ?? ''}</div>
			) : null}
			<div style={{fontFamily: palette.fontBody, fontSize: u(22), color: palette.muted, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{visual.credit}</div>
		</div>
	);
};
