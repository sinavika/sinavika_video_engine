import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useBeatStartFor} from '../VisualTimeline';
import {arrowHead} from './ArrowHead';

type Kepler = Extract<CourseVisual, {kind: 'kepler'}>;

/** The stage (CourseVisual keeps this ratio). */
export const KEPLER_STAGE = {width: 1300, height: 960};

/**
 * Where a planet is at a share of its period (0 at the closest point), on an ellipse of semi-major axis 1 and
 * eccentricity e with the Sun at the focus (0, 0): Kepler's equation M = E − e sin E solved by Newton's method, then
 * x = cos E − e, y = √(1 − e²) sin E. Equal shares of time sweep equal areas.
 */
export const orbitPosition = (eccentricity: number, share: number): [number, number] => {
	const mean = 2 * Math.PI * share;
	let anomaly = mean;
	for (let step = 0; step < 30; step++) anomaly -= (anomaly - eccentricity * Math.sin(anomaly) - mean) / (1 - eccentricity * Math.cos(anomaly));
	return [Math.cos(anomaly) - eccentricity, Math.sqrt(1 - eccentricity * eccentricity) * Math.sin(anomaly)];
};

/** The area swept from the Sun between two shares of the period, as a polygon of the path (in orbit units). */
export const sweptArea = (eccentricity: number, from: number, to: number, steps = 200) => {
	let area = 0;
	for (let index = 0; index < steps; index++) {
		const [x0, y0] = orbitPosition(eccentricity, from + ((to - from) * index) / steps);
		const [x1, y1] = orbitPosition(eccentricity, from + ((to - from) * (index + 1)) / steps);
		area += (x0 * y1 - x1 * y0) / 2;
	}
	return Math.abs(area);
};

/**
 * A planet on an ellipse round the Sun at one focus, moving as Kepler's laws say: fast near the Sun, slow far away.
 * Two sectors swept in the same time, one near the closest point and one near the farthest, fill in: short and wide
 * against long and narrow, equal in area. The velocity arrow grows near the Sun. Beats point at `planet`, `sectors`
 * and `run`.
 */
export const KeplerVisual: React.FC<VisualBoxProps & {visual: Kepler}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const k = Math.min(width / KEPLER_STAGE.width, height / KEPLER_STAGE.height);
	const ox = (width - KEPLER_STAGE.width * k) / 2;
	const oy = (height - KEPLER_STAGE.height * k) / 2;
	const appear = useReveal(delaySeconds, 0.5);
	const runStart = useBeatStartFor('run', 'show') ?? delaySeconds + 1;
	const share = visual.motion ? (Math.max(0, seconds - runStart) / visual.period) % 1 : 0.6;
	const sectorsAt = useBeatStartFor('sectors', 'show');
	const sectorsIn = sectorsAt === undefined ? easeFrom(seconds, delaySeconds + 0.8, 0.6) : easeFrom(seconds, sectorsAt, 0.6);
	const e = visual.eccentricity;
	// True proportions: the ellipse (semi-axes 1 and √(1 − e²)) fits a box 1160 wide and 720 tall above the caption.
	const minor = Math.sqrt(1 - e * e);
	const scale = Math.min(580, 360 / minor);
	// The Sun sits at the focus, orbit point (0, 0); the ellipse's centre is at x = −e, so the Sun is drawn e to the
	// right of the stage's middle and the ellipse comes out centred.
	const sun: [number, number] = [KEPLER_STAGE.width / 2 + e * scale, 420];
	const at = ([x, y]: [number, number]): [number, number] => [sun[0] + x * scale, sun[1] - y * scale];
	const ellipse = Array.from({length: 121}, (_, index) => at(orbitPosition(e, index / 120)).join(',')).join(' ');
	const sector = (from: number, to: number) => {
		const points = Array.from({length: 41}, (_, index) => at(orbitPosition(e, from + ((to - from) * index) / 40)).join(','));
		return `${sun.join(',')} ${points.join(' ')}`;
	};
	const span = visual.sector;
	const near = sector(-span / 2, span / 2);
	const far = sector(0.5 - span / 2, 0.5 + span / 2);
	// Each sector's "t" sits inside it, two thirds of the way out from the Sun.
	const inside = (share: number): [number, number] => {
		const [x, y] = at(orbitPosition(e, share));
		return [sun[0] + (x - sun[0]) * 0.62, sun[1] + (y - sun[1]) * 0.62];
	};
	const [px, py] = at(orbitPosition(e, share));
	const [nx, ny] = at(orbitPosition(e, share + 0.002));
	const angle = Math.atan2(ny - py, nx - px);
	const speed = Math.hypot(nx - px, ny - py);
	const [fx, fy] = at(orbitPosition(e, 0.002));
	const [cx0, cy0] = at(orbitPosition(e, 0));
	const fastest = Math.hypot(fx - cx0, fy - cy0);
	const arrow = 60 + 150 * (speed / fastest);
	const fontSize = 56;

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
				<polyline points={ellipse} fill="none" stroke={palette.axis} strokeWidth={5} strokeDasharray="12 10" />
				<Part id="sectors">
					{(look) => (
						<g opacity={sectorsIn * look.opacity}>
							<polygon points={near} fill={palette.lesson} fillOpacity={0.35} stroke={palette.lesson} strokeWidth={4} />
							<polygon points={far} fill={palette.brand} fillOpacity={0.3} stroke={palette.brand} strokeWidth={4} />
							{[inside(0), inside(0.5)].map(([tx, ty], index) => (
								<text key={index} x={tx} y={ty + fontSize * 0.35} fill={palette.ink} fontSize={fontSize} fontWeight={800} textAnchor="middle" stroke={palette.surface} strokeWidth={8} paintOrder="stroke">
									t
								</text>
							))}
							<text x={KEPLER_STAGE.width / 2} y={930} fill={palette.ink} fontSize={fontSize} fontWeight={800} textAnchor="middle">
								Eşit sürelerde eşit alanlar
							</text>
						</g>
					)}
				</Part>
				<circle cx={sun[0]} cy={sun[1]} r={48} fill={palette.brand} stroke={palette.ink} strokeWidth={5} />
				<text x={sun[0]} y={sun[1] + 100} fill={palette.ink} fontSize={fontSize * 0.8} fontWeight={800} textAnchor="middle" stroke={palette.surface} strokeWidth={8} paintOrder="stroke">
					Güneş
				</text>
				<Part id="planet">
					{(look) => (
						<g opacity={look.opacity}>
							<line x1={px} y1={py} x2={px + Math.cos(angle) * (arrow - 18)} y2={py + Math.sin(angle) * (arrow - 18)} stroke={palette.ink} strokeWidth={9} strokeLinecap="round" />
							<path d={arrowHead(px + Math.cos(angle) * arrow, py + Math.sin(angle) * arrow, angle, 30)} fill={palette.ink} />
							<circle cx={px} cy={py} r={26 * look.scale} fill={palette.lesson} stroke={palette.ink} strokeWidth={5} />
						</g>
					)}
				</Part>
			</g>
		</svg>
	);
};
