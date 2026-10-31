import React from 'react';
import {clamp01, lerp, noise, smooth} from '../../../../Animations/Motion';
import {withAlpha} from '../../../../Themes/Theme';
import {useVisualPalette, type VisualBoxProps} from '../../VisualFrame';
import type {CourseVisual} from '../../VisualSchema';
import {pathOf} from '../../VisualWorld';
import {ProcessFrame, ProcessLabel, SCENE, SceneTag, processCamera, smoothPath, useProcessClock, type CameraBox, type Point} from '../ProcessScene';

type ProcessSpec = Extract<CourseVisual, {kind: 'process'}>;

/**
 * A tropical cyclone seen from above, in the northern hemisphere: over sea water warmer than 26 °C, moist air
 * rises and a low forms; the Coriolis effect turns it anticlockwise and an eye opens in the middle (none forms near
 * the Equator, where the effect is too weak); it reaches the coast with storm winds, rain and a storm surge; over
 * land it loses its moisture and weakens.
 */

/** Latitude (° N) to height in the scene. */
export const latitudeY = (latitude: number) => 610 - latitude * 12;
/** The coast: land to the left of this line. */
const COAST: Point[] = [
	[520, SCENE.top - 20],
	[470, 200],
	[430, 280],
	[400, 330],
	[360, 420],
	[300, 520],
	[260, SCENE.bottom + 20],
];
/** Where the storm is at the end of each stage: born over the warm sea, grown on its way, at the coast, inland. */
export const TRACK: Point[] = [
	[1250, latitudeY(15)],
	[860, latitudeY(19)],
	[420, latitudeY(25)],
	[200, latitudeY(30)],
];

const FRAMING: Record<string, CameraBox> = {
	olusum: [880, 240, 1560, 640],
	buyume: [560, 150, 1500, 640],
	kiyi: [140, 72, 900, 560],
	zayiflama: [40, 72, 760, 480],
};

/** The storm's strength 0–1 through the stages. */
export const stormStrength = (stage: string, progress: number): number => {
	const p = smooth(progress);
	if (stage === 'olusum') return lerp(0.15, 0.45, p);
	if (stage === 'buyume') return lerp(0.45, 1, p);
	if (stage === 'kiyi') return 1;
	return lerp(1, 0.2, p);
};

/** A spiral cloud band: inwards it turns anticlockwise (seen from above, north up), as northern storms do. */
const band = (radius: number, start: number): string => {
	const points: Point[] = [];
	for (let step = 0; step <= 40; step++) {
		const theta = (step / 40) * 2.6 * Math.PI;
		const r = radius * Math.exp(-0.32 * theta);
		// Maths orientation (anticlockwise = growing angle) drawn with y down.
		points.push([r * Math.cos(theta + start), -r * Math.sin(theta + start)]);
	}
	return smoothPath(points);
};

export const CycloneProcess: React.FC<VisualBoxProps & {visual: ProcessSpec}> = ({width, height, delaySeconds = 0, visual}) => {
	const palette = useVisualPalette();
	const clock = useProcessClock('cyclone', visual.stages, delaySeconds);
	const camera = processCamera(clock, (stage) => FRAMING[stage]);
	const {time, amount} = clock;

	const strength = stormStrength(clock.current, clock.progress);
	const stages = ['olusum', 'buyume', 'kiyi', 'zayiflama'];
	const at = Math.max(0, stages.indexOf(clock.current));
	const from = at === 0 ? TRACK[0] : TRACK[at - 1];
	const to = at === 0 ? TRACK[0] : TRACK[at];
	const [x, y] = [lerp(from[0], to[0], smooth(clock.progress)), lerp(from[1], to[1], smooth(clock.progress))];
	const radius = 50 + 130 * strength;
	// Anticlockwise: a negative SVG rotation.
	const spin = (-time * (0.5 + 1.4 * strength) * 180) / Math.PI;
	const eye = smooth(clamp01((strength - 0.55) / 0.3));
	const surge = clock.current === 'kiyi' ? smooth(clock.progress) : amount('kiyi') >= 1 ? 1 - 0.6 * amount('zayiflama') : 0;
	const warm = clock.current === 'olusum' ? 1 : 0.4;

	return (
		<ProcessFrame process="cyclone" clock={clock} camera={camera} width={width} height={height} backdrop="#2F6FA8">
			{/* The sea, warmer to the south, and the land. */}
			<rect x={SCENE.left - 100} y={SCENE.top - 100} width={1800} height={900} fill="#2F6FA8" />
			<rect x={SCENE.left - 100} y={latitudeY(26)} width={1800} height={SCENE.bottom + 100 - latitudeY(26)} fill="#3B86C4" opacity={0.6 + 0.4 * warm} />
			<path d={pathOf([...COAST, [SCENE.left - 100, SCENE.bottom + 20], [SCENE.left - 100, SCENE.top - 20]], true)} fill="#8DAA6B" />
			{/* The storm surge: the sea pushed over the coast where the storm strikes. */}
			<path
				d={pathOf(
					[
						[470, 200],
						[430, 280],
						[400, 330],
						[380, 375],
						[380 - 80 * surge, 360],
						[400 - 90 * surge, 300],
						[440 - 80 * surge, 220],
					],
					true,
				)}
				fill={withAlpha('#3B86C4', 0.85)}
				opacity={surge}
			/>
			{/* Latitudes: the Equator, 5° N (inside it no cyclone forms), 10°, 20°, 30° N. */}
			{[0, 5, 10, 20, 30].map((latitude) => (
				<g key={latitude}>
					<line
						x1={SCENE.left - 100}
						y1={latitudeY(latitude)}
						x2={SCENE.right + 100}
						y2={latitudeY(latitude)}
						stroke="#FFFFFF"
						strokeOpacity={latitude === 0 ? 0.8 : 0.35}
						strokeWidth={latitude === 0 ? 3 : 2}
						strokeDasharray={latitude === 0 ? undefined : '8 10'}
					/>
					<SceneTag x={SCENE.right - 12} y={latitudeY(latitude) - 14} text={latitude === 0 ? 'Ekvator' : `${latitude}° K`} anchor="end" size={18} fill="#FFFFFF" halo="#0B2545" />
				</g>
			))}
			<rect x={SCENE.left - 100} y={latitudeY(5)} width={1800} height={latitudeY(0) - latitudeY(5)} fill="#FFFFFF" opacity={0.08} />
			{/* Moist air rising from the warm sea while the storm is born. */}
			<g opacity={clock.now('olusum')}>
				{Array.from({length: 26}, (_, index) => {
					const phase = (time * 0.5 + noise(index * 3.3)) % 1;
					const angle = noise(index * 7.1) * 2 * Math.PI;
					const r = (1 - phase) * 230;
					return <circle key={index} cx={TRACK[0][0] + r * Math.cos(angle)} cy={TRACK[0][1] + r * Math.sin(angle)} r={4} fill="#E6F2FB" opacity={Math.sin(Math.PI * phase)} />;
				})}
			</g>
			{/* The storm: spiral bands turning anticlockwise round the eye. */}
			<g transform={`translate(${x} ${y})`} opacity={0.5 + 0.5 * Math.min(1, strength * 1.6)}>
				<circle r={radius * 0.95} fill="#FFFFFF" opacity={0.18 + 0.2 * strength} />
				<g transform={`rotate(${spin})`}>
					{[0, 1, 2, 3].map((arm) => (
						<path key={arm} d={band(radius, (arm * Math.PI) / 2)} fill="none" stroke="#FFFFFF" strokeWidth={10 + 22 * strength} strokeLinecap="round" opacity={0.75} />
					))}
				</g>
				<circle r={radius * 0.28} fill="#FFFFFF" opacity={0.9} />
				<circle r={radius * 0.1 * eye} fill="#2F6FA8" />
				{/* The turning, drawn as an arrow round the storm while it grows. */}
				<g opacity={clock.now('buyume')}>
					<path d={`M${radius + 24} 0 A${radius + 24} ${radius + 24} 0 0 0 0 ${-(radius + 24)}`} fill="none" stroke="#FFD25A" strokeWidth={6} strokeLinecap="round" />
					<path d={`M0 ${-(radius + 24)} l16 -10 m-16 10 l16 10`} fill="none" stroke="#FFD25A" strokeWidth={6} strokeLinecap="round" />
				</g>
			</g>
			{/* The track so far. */}
			<path d={pathOf([TRACK[0], ...TRACK.slice(1, at), [x, y]])} fill="none" stroke="#FFD25A" strokeWidth={3} strokeDasharray="10 8" opacity={0.7} />
			<ProcessLabel id="olusum" at={[TRACK[0][0], TRACK[0][1] + 40]} to={[1250, 590]} text="Deniz suyu 26 °C'nin üstünde" show={clock.now('olusum')} />
			<ProcessLabel id="ekvator" at={[1100, latitudeY(2.5)]} to={[980, 520]} text="Ekvator çevresinde oluşmaz" show={clock.now('olusum') * clamp01(clock.progress * 2 - 0.4)} size={23} />
			<ProcessLabel id="goz" at={[x, y]} to={[x + 40, y + radius + 70]} text="Göz: sakin merkez" show={clock.now('buyume') * eye} size={23} />
			<ProcessLabel
				id="buyume"
				at={[x + radius * 0.7, y - radius * 0.7]}
				to={[x + radius + 60, y - radius - 20]}
				text="Saat yönünün tersine döner"
				show={clock.now('buyume')}
				anchor="start"
				size={23}
			/>
			<ProcessLabel id="kabarma" at={[400, 300]} to={[640, 520]} text="Deniz kabarır, kıyıyı su basar" show={clock.now('kiyi') * surge} size={23} />
			<ProcessLabel id="zayiflama" at={[x, y]} to={[x + 120, y + 190]} text="Karada nem yok: zayıflar" show={clock.now('zayiflama')} size={23} />
			<SceneTag x={SCENE.left + 20} y={SCENE.top + 30} text="Kara" size={22} fill={palette.ink} />
			<SceneTag x={SCENE.right - 20} y={SCENE.top + 30} text="Okyanus" size={22} fill="#FFFFFF" halo="#0B2545" anchor="end" />
		</ProcessFrame>
	);
};
