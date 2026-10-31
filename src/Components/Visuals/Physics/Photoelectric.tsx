import React from 'react';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useBeatStartFor} from '../VisualTimeline';
import {arrowHead} from './ArrowHead';

type Photoelectric = Extract<CourseVisual, {kind: 'photoelectric'}>;

/** The stage (CourseVisual keeps this ratio). */
export const PHOTOELECTRIC_STAGE = {width: 1600, height: 900};

/**
 * Einstein's photoelectric equation in units of h·f₀ (f₀ the first metal's threshold): the most kinetic energy an
 * electron leaves with is hf − W, and no electron leaves below the threshold however bright the light is.
 */
export const maxKinetic = (frequency: number, threshold: number) => Math.max(0, frequency - threshold);

/**
 * The photoelectric effect. Photons (wavy packets, red below the threshold, violet above) fall on a metal plate; above
 * the threshold each knocks out one electron that flies to the collector, faster the higher the frequency; below it
 * nothing leaves. `intensity` sets how many photons, so how many electrons, never how fast. With `graph` the
 * Ek–f lines of the `metals` (one slope h, each starting at its threshold f₀) and the light's frequency marked;
 * `intercept` extends them to −W on the Ek axis. Beats point at `plate`, `light`, `electrons`, `graph`, `slope`
 * and `run`.
 */
export const PhotoelectricVisual: React.FC<VisualBoxProps & {visual: Photoelectric}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const k = Math.min(width / PHOTOELECTRIC_STAGE.width, height / PHOTOELECTRIC_STAGE.height);
	const ox = (width - PHOTOELECTRIC_STAGE.width * k) / 2;
	const oy = (height - PHOTOELECTRIC_STAGE.height * k) / 2;
	const appear = useReveal(delaySeconds, 0.5);
	const runStart = useBeatStartFor('run', 'show') ?? delaySeconds + 1;
	const fontSize = Math.max(64, 28 / k);
	const label = (x: number, y: number, text: string, anchor: 'start' | 'middle' | 'end' = 'middle', size = fontSize * 0.75) => (
		<text x={x} y={y} fill={palette.ink} fontSize={size} fontWeight={800} textAnchor={anchor} stroke={palette.surface} strokeWidth={8} paintOrder="stroke">
			{text}
		</text>
	);
	const threshold = visual.metals[0].threshold;
	const above = visual.frequency > threshold;
	const lightColour = above ? '#7C4DCC' : '#D64545';
	const elapsed = visual.motion ? Math.max(0, seconds - runStart) : 0;
	// The tube: lamp top left, plate (cathode) on the left, collector on the right.
	const shift = visual.graph ? 0 : 340;
	const plate = {x: 290 + shift, top: 230, bottom: 770};
	const collector = 860 + shift;
	const lamp: [number, number] = [100 + shift, 110];
	// Photons leave the lamp at `intensity` × 2 per second and take 0.9 s to reach the plate.
	const rate = visual.intensity * 2;
	const flight = 0.9;
	const kinetic = maxKinetic(visual.frequency, threshold);
	// Electron speed ∝ √Ek (px per second), slow but visible for a small Ek.
	const electronSpeed = 260 + 420 * Math.sqrt(kinetic / 2);
	const count = Math.floor(elapsed * rate) + 1;
	const photons = Array.from({length: Math.min(count, 40)}, (_, back) => {
		const index = count - 1 - back;
		const born = index / rate;
		const age = elapsed - born;
		// Each photon lands at its own height on the plate.
		const hitY = plate.top + 40 + (((index * 7919) % 97) / 97) * (plate.bottom - plate.top - 80);
		return {index, age, hitY};
	}).filter((photon) => photon.age >= 0);

	// Graph: Ek (units of h f₀) against f (units of f₀).
	const [gLeft, gRight, gTop, gBottom] = [1040, 1540, 120, 800];
	const fMax = 3.2;
	const eMin = visual.intercept ? -Math.max(...visual.metals.map((metal) => metal.threshold)) - 0.2 : -0.3;
	const eMax = 2.4;
	const gx = (f: number) => gLeft + ((gRight - gLeft) * f) / fMax;
	const gy = (e: number) => gBottom - ((gBottom - gTop) * (e - eMin)) / (eMax - eMin);

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
				<Part id="plate">
					{(look) => (
						<g opacity={look.opacity}>
							<rect x={plate.x - 30} y={plate.top} width={30} height={plate.bottom - plate.top} fill={palette.axis} stroke={palette.ink} strokeWidth={4} />
							{label(plate.x - 15, plate.bottom + 70, 'metal', 'middle', fontSize * 0.7)}
							<rect x={collector} y={plate.top + 40} width={22} height={plate.bottom - plate.top - 80} fill={palette.grid} stroke={palette.ink} strokeWidth={4} />
						</g>
					)}
				</Part>
				<Part id="light">
					{(look) => (
						<g opacity={look.opacity}>
							<circle cx={lamp[0]} cy={lamp[1]} r={56} fill={lightColour} stroke={palette.ink} strokeWidth={5} />
							{label(lamp[0] + 70, lamp[1] - 40, above ? 'f > f₀' : 'f < f₀', 'start', fontSize * 0.75)}
							{visual.motion
								? photons
										.filter((photon) => photon.age < flight)
										.map((photon) => {
											const share = photon.age / flight;
											const [x0, y0] = lamp;
											const [x1, y1] = [plate.x, photon.hitY];
											const angle = Math.atan2(y1 - y0, x1 - x0);
											const [hx, hy] = [x0 + (x1 - x0) * share, y0 + (y1 - y0) * share];
											const wave = Array.from({length: 13}, (_, step) => {
												const back = 96 - (96 * step) / 12;
												const wiggle = Math.sin(step * 1.6) * 14;
												return `${hx - Math.cos(angle) * back - Math.sin(angle) * wiggle},${hy - Math.sin(angle) * back + Math.cos(angle) * wiggle}`;
											}).join(' ');
											return <polyline key={photon.index} points={wave} fill="none" stroke={lightColour} strokeWidth={7} strokeLinecap="round" />;
										})
								: null}
						</g>
					)}
				</Part>
				<Part id="electrons">
					{(look) => (
						<g opacity={look.opacity}>
							{above && visual.motion
								? photons
										.filter((photon) => photon.age >= flight)
										.map((photon) => {
											const x = plate.x + 18 + (photon.age - flight) * electronSpeed;
											if (x > collector - 14) return null;
											return <circle key={photon.index} cx={x} cy={photon.hitY} r={18} fill={palette.lesson} stroke={palette.ink} strokeWidth={4} />;
										})
								: null}
							{label((plate.x + collector) / 2 + 40, plate.top - 40, above ? 'elektron sökülür' : 'elektron sökülmez', 'middle', fontSize * 0.8)}
						</g>
					)}
				</Part>
				{visual.graph ? (
					<Part id="graph">
						{(look) => (
							<g opacity={look.opacity}>
								<line x1={gLeft} y1={gy(0)} x2={gRight + 20} y2={gy(0)} stroke={palette.ink} strokeWidth={5} />
								<path d={arrowHead(gRight + 40, gy(0), 0, 24)} fill={palette.ink} />
								<line x1={gLeft} y1={gBottom} x2={gLeft} y2={gTop - 20} stroke={palette.ink} strokeWidth={5} />
								<path d={arrowHead(gLeft, gTop - 40, -Math.PI / 2, 24)} fill={palette.ink} />
								{label(gLeft + 20, gTop - 40, 'Ek', 'start')}
								{label(gRight + 40, gy(0) + 60, 'f', 'end')}
								{visual.metals.map((metal, index) => (
									<g key={index}>
										<line x1={gx(metal.threshold)} y1={gy(0)} x2={gx(fMax)} y2={gy(fMax - metal.threshold)} stroke={index === 0 ? palette.lesson : palette.ink} strokeWidth={7} />
										{label(gx(metal.threshold), gy(0) + 60 + index * 52, visual.metals.length > 1 ? `f₀${index + 1}` : 'f₀', 'middle', fontSize * 0.65)}
										{metal.label ? label(gx(fMax) + 12, gy(fMax - metal.threshold) + fontSize * 0.25, metal.label, 'start', fontSize * 0.7) : null}
									</g>
								))}
								<line x1={gx(visual.frequency)} y1={gTop} x2={gx(visual.frequency)} y2={gBottom} stroke={lightColour} strokeWidth={4} strokeDasharray="12 10" />
								{above ? <circle cx={gx(visual.frequency)} cy={gy(kinetic)} r={14} fill={lightColour} stroke={palette.ink} strokeWidth={3} /> : null}
							</g>
						)}
					</Part>
				) : null}
				{visual.graph ? (
					<Part id="slope">
						{(look) => (
							<g opacity={look.opacity}>
								{label(gLeft + 90, gTop + 20, 'eğim = h', 'start', fontSize * 0.7)}
								{visual.intercept
									? visual.metals.map((metal, index) => (
											<g key={index}>
												<line x1={gLeft} y1={gy(-metal.threshold)} x2={gx(metal.threshold)} y2={gy(0)} stroke={index === 0 ? palette.lesson : palette.ink} strokeWidth={4} strokeDasharray="12 10" />
												{index === 0 ? label(gLeft - 14, gy(-metal.threshold) + fontSize * 0.25, '−W', 'end', fontSize * 0.7) : null}
											</g>
										))
									: null}
							</g>
						)}
					</Part>
				) : null}
			</g>
		</svg>
	);
};
