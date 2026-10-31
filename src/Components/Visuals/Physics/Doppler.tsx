import React, {useId} from 'react';
import {useReveal, useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {Part, useBeatStartFor} from '../VisualTimeline';
import {arrowHead} from './ArrowHead';

type Doppler = Extract<CourseVisual, {kind: 'doppler'}>;

/** The stage (CourseVisual keeps this ratio). */
export const DOPPLER_STAGE = {width: 1600, height: 900};

/**
 * The wavelength a still listener meets ahead of and behind a source moving at `speed` (a share of the wave speed),
 * as a share of the wavelength from a still source: λ(1 − s) ahead, λ(1 + s) behind. The frequency heard is the
 * wave speed over it, so it is higher ahead and lower behind.
 */
export const dopplerWavelengths = (speed: number) => ({ahead: 1 - speed, behind: 1 + speed});

/**
 * A source moving right at `speed` (share of the wave speed) sends out a wavefront each period; every front is a
 * circle about the place it left from, so the fronts crowd together ahead (short λ, high f) and spread out behind
 * (long λ, low f). Drawn in the source's frame: the source stays in the middle and the old fronts drift back.
 * Beats point at `source`, `fronts`, `ahead`, `behind` and `run`.
 */
export const DopplerVisual: React.FC<VisualBoxProps & {visual: Doppler}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const clip = `doppler-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
	const k = Math.min(width / DOPPLER_STAGE.width, height / DOPPLER_STAGE.height);
	const ox = (width - DOPPLER_STAGE.width * k) / 2;
	const oy = (height - DOPPLER_STAGE.height * k) / 2;
	const appear = useReveal(delaySeconds, 0.5);
	const runStart = useBeatStartFor('run', 'show') ?? delaySeconds + 1;
	const fontSize = Math.max(56, 24 / k);
	const label = (x: number, y: number, text: string, anchor: 'start' | 'middle' | 'end' = 'middle', size = fontSize * 0.8) => (
		<text x={x} y={y} fill={palette.ink} fontSize={size} fontWeight={800} textAnchor={anchor} stroke={palette.surface} strokeWidth={8} paintOrder="stroke">
			{text}
		</text>
	);
	// One front every 0.7 s at 150 px/s: a still source's wavelength is 105 px.
	const period = 0.7;
	const waveSpeed = 150;
	const [sx, sy] = [DOPPLER_STAGE.width / 2 + 60, 470];
	// Before `run` the picture is the settled one (as if it had been running for a long time).
	const now = 40 + (visual.motion ? Math.max(0, seconds - runStart) : 0);
	const fronts = Array.from({length: 16}, (_, index) => {
		const emitted = (Math.floor(now / period) - index) * period;
		const age = now - emitted;
		return {cx: sx - visual.speed * waveSpeed * age, r: waveSpeed * age};
	}).filter((front) => front.r > 1);
	// The two λ brackets sit on the axis a few fronts out, clear of the source: λ(1 − s) ahead and λ(1 + s) behind.
	const lengths = dopplerWavelengths(visual.speed);
	const lambda = waveSpeed * period;
	const ahead = fronts.length > 4 ? [fronts[3].cx + fronts[3].r, fronts[3].cx + fronts[3].r + lambda * lengths.ahead] : [sx, sx];
	const behind = fronts.length > 4 ? [fronts[2].cx - fronts[2].r - lambda * lengths.behind, fronts[2].cx - fronts[2].r] : [sx, sx];
	const bracket = (from: number, to: number, y: number, text: string) => (
		<g>
			<line x1={from} y1={y} x2={to} y2={y} stroke={palette.ink} strokeWidth={5} />
			<line x1={from} y1={y - 16} x2={from} y2={y + 16} stroke={palette.ink} strokeWidth={5} />
			<line x1={to} y1={y - 16} x2={to} y2={y + 16} stroke={palette.ink} strokeWidth={5} />
			{label((from + to) / 2, y - 36, text, 'middle', fontSize * 0.75)}
		</g>
	);

	return (
		<svg width={width} height={height} style={{overflow: 'visible', fontFamily: palette.fontDisplay}}>
			<defs>
				<clipPath id={clip}>
					<rect x={0} y={130} width={DOPPLER_STAGE.width} height={DOPPLER_STAGE.height - 130} rx={24} />
				</clipPath>
			</defs>
			<g transform={`translate(${ox} ${oy}) scale(${k})`} opacity={appear}>
				<rect x={0} y={130} width={DOPPLER_STAGE.width} height={DOPPLER_STAGE.height - 130} rx={24} fill={palette.fill} />
				<g clipPath={`url(#${clip})`}>
					<Part id="fronts">
						{(look) => (
							<g opacity={look.opacity}>
								{fronts.map((front, index) => (
									<circle key={index} cx={front.cx} cy={sy} r={front.r} fill="none" stroke={palette.lesson} strokeWidth={4} opacity={Math.max(0.25, 1 - index * 0.05)} />
								))}
							</g>
						)}
					</Part>
				</g>
				<Part id="source">
					{(look) => (
						<g opacity={look.opacity}>
							<circle cx={sx} cy={sy} r={30 * look.scale} fill={palette.brand} stroke={palette.ink} strokeWidth={5} />
							{visual.speed > 0 ? (
								<g>
									<line x1={sx} y1={sy + 90} x2={sx + 130} y2={sy + 90} stroke={palette.ink} strokeWidth={9} strokeLinecap="round" />
									<path d={arrowHead(sx + 150, sy + 90, 0, 30)} fill={palette.ink} />
									{label(sx + 75, sy + 160, 'v kaynak')}
								</g>
							) : null}
						</g>
					)}
				</Part>
				<Part id="ahead">
					{(look) => (
						<g opacity={look.opacity}>
							{visual.speed > 0 ? bracket(ahead[0], ahead[1], sy, 'λ kısa') : null}
							{label(DOPPLER_STAGE.width - 40, 90, visual.speed > 0 ? 'Önde: f büyük' : 'Her yönde aynı f', 'end')}
						</g>
					)}
				</Part>
				<Part id="behind">
					{(look) => (
						<g opacity={look.opacity}>
							{visual.speed > 0 ? bracket(behind[0], behind[1], sy, 'λ uzun') : null}
							{visual.speed > 0 ? label(40, 90, 'Arkada: f küçük', 'start') : null}
						</g>
					)}
				</Part>
			</g>
		</svg>
	);
};
