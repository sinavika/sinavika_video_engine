import React, {useId} from 'react';
import {interpolate} from 'remotion';
import {lerp, smooth} from '../../../Animations/Motion';
import {NATURE_COLORS as C} from '../../../Configurations/NatureColors';
import {withAlpha} from '../../../Themes/Theme';
import {useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {useStageClock} from '../VisualTimeline';
import {H, pathOf, W, World} from '../VisualWorld';
import {Label, StageStrip, TOP} from './ProcessStage';

type Earthquake = Extract<CourseVisual, {kind: 'earthquake'}>;

// ---------------------------------------------------------------- earthquakes

const QUAKE_STAGES = ['Fay', 'Gerilme birikir', 'Kırılma', 'Dalgalar'] as const;

const SURFACE = TOP + 90;

/**
 * An earthquake in cross-section (plan view for a strike-slip fault). Rock on
 * both sides of a fault is held by friction while the plates keep pushing
 * (or pulling): it bends and stores energy. When the stress beats the
 * friction the fault slips at once at the focus, the bent rock snaps back
 * offset (elastic rebound), and the energy leaves as waves: P waves first,
 * then the slower S waves, and surface waves from the epicentre.
 */
export const EarthquakeVisual: React.FC<VisualBoxProps & {visual: Earthquake}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const {stage, progress, seconds} = useStageClock(QUAKE_STAGES.length, {delaySeconds});
	const drawn = stage > 0 ? 1 : smooth(progress * 1.5);
	const stress = stage === 1 ? smooth(progress) : stage === 0 ? 0 : 1;
	// The slip happens in a fraction of a second, early in the rupture stage.
	const slip = stage >= 2 ? (stage === 2 ? smooth((seconds - 0.4) / 0.35) : 1) : 0;
	const bend = stress * (1 - slip);
	const waveTime = stage === 3 ? seconds : 0;
	const strikeSlip = visual.fault === 'strikeSlip';
	const sense = visual.fault === 'reverse' ? -1 : 1; // hanging wall: up (reverse) or down (normal)
	const offset = 46 * slip;

	// Fault plane: from the surface at x=480 down to the right (dip ~ 60°).
	const faultTop = [480, SURFACE] as const;
	const faultBottom = [480 + (H - SURFACE) / Math.tan((60 * Math.PI) / 180), H] as const;
	const focus = [lerp(faultTop[0], faultBottom[0], 0.55), lerp(faultTop[1], faultBottom[1], 0.55)] as const;
	const epicentre = [focus[0], SURFACE] as const;
	const xOnFault = (y: number) => faultTop[0] + ((y - faultTop[1]) / (faultBottom[1] - faultTop[1])) * (faultBottom[0] - faultTop[0]);

	if (strikeSlip) return <StrikeSlip width={width} height={height} stage={stage} progress={progress} bend={bend} slip={slip} waveTime={waveTime} labels={visual.labels} drawn={drawn} />;

	// Layers: horizontal bands; near the fault they drag (bend) before the slip and are offset after it.
	const layers = [0, 1, 2, 3].map((index) => SURFACE + 60 + index * 85);
	const layerLine = (baseY: number, side: 'foot' | 'hanging') => {
		const points: [number, number][] = [];
		const from = side === 'foot' ? 0 : xOnFault(baseY);
		const to = side === 'foot' ? xOnFault(baseY) : W;
		for (let x = from; x <= to; x += 10) {
			const distance = Math.abs(x - xOnFault(baseY));
			const drag = Math.exp(-distance / 140) * 30 * bend;
			const dy = side === 'hanging' ? sense * (offset - drag) : sense * drag;
			points.push([x, baseY + dy]);
		}
		return points;
	};
	const hangingShift = sense * offset;
	// The hanging wall slips along the fault plane: with the vertical move comes a sideways one (up-dip is to the left).
	const hangingSlide = (sense * offset) / Math.tan((60 * Math.PI) / 180);
	const hangingPolygon = [[faultTop[0], SURFACE + hangingShift], [W, SURFACE + hangingShift], [W, H], [faultBottom[0], H]] as const;
	const footPolygon = [[0, SURFACE], [faultTop[0], SURFACE], [faultBottom[0], H], [0, H]] as const;
	const shake = (x: number) => (waveTime > 0 ? Math.sin(waveTime * 30 + x) * Math.max(0, 6 - Math.abs(x - epicentre[0]) / 60) * Math.max(0, 1 - Math.abs(waveTime * 260 - Math.abs(x - epicentre[0])) / 220) : 0);

	return (
		<World width={width} height={height}>
			<StageStrip names={QUAKE_STAGES} stage={stage} progress={progress} />
			<g opacity={drawn}>
				<path d={pathOf(footPolygon, true)} fill={C.rock[0]} />
				{layers.map((y, index) => (
					<path key={index} d={pathOf(layerLine(y, 'foot'))} fill="none" stroke={C.rock[3]} strokeWidth={7} opacity={0.75} />
				))}
				<g transform={`translate(${hangingSlide} 0)`}>
					<path d={pathOf(hangingPolygon, true)} fill={C.rock[1]} />
					{layers.map((y, index) => (
						<path key={index} d={pathOf(layerLine(y, 'hanging'))} fill="none" stroke={C.rock[3]} strokeWidth={7} opacity={0.75} />
					))}
				</g>
				<line x1={faultTop[0]} y1={faultTop[1] - 6} x2={faultBottom[0]} y2={faultBottom[1]} stroke={palette.ink} strokeWidth={6} strokeDasharray="18 10" />
				{[180, 330, 760, 900].map((x) => (
					<House key={x} x={x + shake(x) + (x > faultTop[0] ? hangingSlide : 0)} y={(x > faultTop[0] ? SURFACE + hangingShift : SURFACE) + Math.abs(shake(x)) * 0.3} />
				))}
			</g>
			{/* plates pushing (reverse) or pulling (normal) */}
			{[0, 1].map((side) => {
				const y = SURFACE + 200;
				const inward = visual.fault === 'reverse';
				const x0 = side === 0 ? 40 : W - 40;
				const direction = (side === 0 ? 1 : -1) * (inward ? 1 : -1);
				const length = 110 * stress;
				return stress > 0 ? <Arrow key={side} x={inward ? x0 : x0 - direction * length} y={y} dx={direction * length} color={C.stress} /> : null;
			})}
			<StressMeter level={stress * (1 - slip)} />
			{slip > 0 && slip < 1 ? <circle cx={focus[0]} cy={focus[1]} r={30 + 80 * slip} fill={withAlpha(C.stress, 0.5 * (1 - slip))} /> : null}
			{stage >= 2 ? (
				<g>
					<circle cx={focus[0]} cy={focus[1]} r={13} fill={C.stress} stroke="#FFFFFF" strokeWidth={4} />
					<line x1={focus[0]} y1={focus[1]} x2={epicentre[0]} y2={epicentre[1] + hangingShift} stroke={palette.ink} strokeWidth={3} strokeDasharray="8 8" />
					<path d={`M${epicentre[0] - 14} ${epicentre[1] + hangingShift - 22} L${epicentre[0] + 14} ${epicentre[1] + hangingShift - 22} L${epicentre[0]} ${epicentre[1] + hangingShift - 2} Z`} fill={C.stress} />
				</g>
			) : null}
			{waveTime > 0 ? <Waves origin={focus} time={waveTime} top={SURFACE} /> : null}
			{visual.labels ? (
				<>
					<Label x={faultBottom[0] - 10} y={H - 20} anchor="end" show={drawn}>Fay düzlemi</Label>
					<Label x={W / 2} y={SURFACE + 240} show={stage === 1 ? stress : 0} color={C.stress} size={26}>Kayaçlar bükülür, enerji birikir</Label>
					<Label x={focus[0] + 26} y={focus[1] + 8} anchor="start" show={stage >= 2 ? 1 : 0} color={C.stress}>Odak (hiposantr)</Label>
					<Label x={epicentre[0]} y={SURFACE - 78} show={stage >= 2 ? 1 : 0}>Merkez üssü (episantr)</Label>
					<Label x={W / 2} y={SURFACE + 250} show={stage === 2 ? slip : 0} color={palette.lesson} size={26}>{visual.fault === 'reverse' ? 'Ters fay: üst blok yukarı kayar' : 'Normal fay: üst blok aşağı kayar'}</Label>
				</>
			) : null}
			{waveTime > 0 && visual.labels ? <WaveLegend /> : null}
		</World>
	);
};

const House: React.FC<{x: number; y: number}> = ({x, y}) => (
	<g>
		<rect x={x - 18} y={y - 30} width={36} height={30} fill={C.house} stroke="#5B4A3A" strokeWidth={3} />
		<path d={`M${x - 24} ${y - 28} L${x} ${y - 50} L${x + 24} ${y - 28} Z`} fill={C.roof} />
	</g>
);

const Arrow: React.FC<{x: number; y: number; dx: number; color: string}> = ({x, y, dx, color}) => {
	const head = Math.sign(dx) * 22;
	return (
		<g>
			<line x1={x} y1={y} x2={x + dx - head * 0.6} y2={y} stroke={color} strokeWidth={12} strokeLinecap="round" />
			<path d={`M${x + dx} ${y} L${x + dx - head} ${y - 18} L${x + dx - head} ${y + 18} Z`} fill={color} />
		</g>
	);
};

/** How much stress the rock holds: fills while it builds, empties at the rupture. */
const StressMeter: React.FC<{level: number}> = ({level}) => {
	const palette = useVisualPalette();
	const [x, y, w, h] = [24, TOP + 14, 230, 26];
	return (
		<g>
			<rect x={x} y={y} width={w} height={h} rx={13} fill={withAlpha(palette.ink, 0.08)} />
			<rect x={x} y={y} width={w * level} height={h} rx={13} fill={C.stress} />
			<Label x={x + w + 12} y={y + 21} anchor="start" size={20}>Gerilme</Label>
		</g>
	);
};

/** Wavefronts from the focus: P (fast, solid) ahead of S (slower, dashed); clipped to the ground. */
const Waves: React.FC<{origin: readonly [number, number]; time: number; top: number}> = ({origin, time, top}) => {
	const clipId = `ground${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
	const rings = [0, 0.6, 1.2];
	return (
		<g>
			<clipPath id={clipId}>
				<rect x={0} y={top} width={W} height={H - top} />
			</clipPath>
			<g clipPath={`url(#${clipId})`}>
				{rings.map((delay) => {
					const pRadius = Math.max(0, (time - delay) * 260);
					const sRadius = Math.max(0, (time - delay) * 150);
					return (
						<g key={delay}>
							{pRadius > 0 ? <circle cx={origin[0]} cy={origin[1]} r={pRadius} fill="none" stroke={C.wavePrimary} strokeWidth={5} opacity={Math.max(0, 1 - pRadius / 900)} /> : null}
							{sRadius > 0 ? <circle cx={origin[0]} cy={origin[1]} r={sRadius} fill="none" stroke={C.waveSecondary} strokeWidth={6} strokeDasharray="16 10" opacity={Math.max(0, 1 - sRadius / 700)} /> : null}
						</g>
					);
				})}
			</g>
			{/* surface waves run along the ground from the epicentre */}
			{time > 0.8 ? <path d={pathOf(Array.from({length: 101}, (_, index) => {
				const x = (index / 100) * W;
				const d = Math.abs(x - origin[0]);
				const front = (time - 0.8) * 120;
				const amp = d < front ? 8 * Math.max(0, 1 - d / 700) : 0;
				return [x, top - 4 + Math.sin(d / 22 - time * 8) * amp] as const;
			}))} fill="none" stroke={C.waveSurface} strokeWidth={5} /> : null}
		</g>
	);
};

const WaveLegend: React.FC = () => (
	<g>
		<line x1={W - 250} x2={W - 200} y1={H - 70} y2={H - 70} stroke={C.wavePrimary} strokeWidth={5} />
		<Label x={W - 190} y={H - 62} anchor="start" size={20}>P dalgası (hızlı)</Label>
		<line x1={W - 250} x2={W - 200} y1={H - 40} y2={H - 40} stroke={C.waveSecondary} strokeWidth={6} strokeDasharray="12 8" />
		<Label x={W - 190} y={H - 32} anchor="start" size={20}>S dalgası (yavaş)</Label>
		<line x1={W - 250} x2={W - 200} y1={H - 12} y2={H - 12} stroke={C.waveSurface} strokeWidth={5} />
		<Label x={W - 190} y={H - 4} anchor="start" size={20}>Yüzey dalgası</Label>
	</g>
);

/** A strike-slip fault from above: a road and a fence across it bend, then break and shift sideways. */
const StrikeSlip: React.FC<{width: number; height: number; stage: number; progress: number; bend: number; slip: number; waveTime: number; labels: boolean; drawn: number}> = ({width, height, stage, progress, bend, slip, waveTime, labels, drawn}) => {
	const palette = useVisualPalette();
	const faultY = TOP + 270;
	const offset = 70 * slip;
	const crossing = (baseX: number) => {
		const points: [number, number][] = [];
		for (let y = TOP + 30; y <= H - 20; y += 8) {
			const side = y < faultY ? -1 : 1;
			const drag = Math.exp(-Math.abs(y - faultY) / 90) * 40 * bend * -side;
			points.push([baseX + side * offset * 0.5 + drag * 0.5, y]);
		}
		return points;
	};
	return (
		<World width={width} height={height}>
			<StageStrip names={QUAKE_STAGES} stage={stage} progress={progress} />
			<g opacity={drawn}>
				<rect x={0} y={TOP + 20} width={W} height={faultY - TOP - 20} fill={C.land} />
				<rect x={0} y={faultY} width={W} height={H - faultY} fill={C.landDark} />
				<path d={pathOf(crossing(360))} fill="none" stroke="#555555" strokeWidth={26} />
				<path d={pathOf(crossing(360))} fill="none" stroke="#FFFFFF" strokeWidth={3} strokeDasharray="16 14" />
				<path d={pathOf(crossing(680))} fill="none" stroke={C.roof} strokeWidth={6} strokeDasharray="4 10" />
				<line x1={0} x2={W} y1={faultY} y2={faultY} stroke={palette.ink} strokeWidth={6} strokeDasharray="18 10" />
			</g>
			{bend > 0 || slip > 0 ? (
				<>
					<Arrow x={120} y={faultY - 70} dx={-90 * Math.max(bend, slip)} color={C.stress} />
					<Arrow x={W - 120} y={faultY + 70} dx={90 * Math.max(bend, slip)} color={C.stress} />
				</>
			) : null}
			<StressMeter level={bend} />
			{waveTime > 0 ? <circle cx={520} cy={faultY} r={waveTime * 200} fill="none" stroke={C.wavePrimary} strokeWidth={5} opacity={Math.max(0, 1 - waveTime / 4)} /> : null}
			{labels ? (
				<>
					<Label x={W - 30} y={faultY - 14} anchor="end" show={drawn}>Doğrultu atımlı fay</Label>
					<Label x={W / 2} y={TOP + 70} show={stage === 1 ? interpolate(progress, [0, 0.3], [0, 1], {extrapolateRight: 'clamp'}) : 0} color={C.stress}>Yol ve çit bükülür: enerji birikir</Label>
					<Label x={W / 2} y={TOP + 70} show={stage >= 2 ? slip : 0} color={palette.lesson}>Kırılma: bloklar yana kayar</Label>
				</>
			) : null}
		</World>
	);
};
