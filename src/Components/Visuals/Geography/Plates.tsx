import React, {useId} from 'react';
import {easeFrom, smoothStep} from '../../../Animations/Motion';
import {NATURE_COLORS as C} from '../../../Configurations/NatureColors';
import {withAlpha} from '../../../Themes/Theme';
import {useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import {type CourseVisual} from '../VisualSchema';
import {H, pathOf, Tag, usePartLook, W, World} from '../VisualWorld';

// ---------------------------------------------------------------- plate boundaries

type Plates = Extract<CourseVisual, {kind: 'plates'}>;

const PLATE_NAMES: Record<Plates['boundary'], {title: string; result: string; example: string}> = {
	divergent: {title: 'İki okyanusal levha uzaklaşıyor', result: 'Okyanus ortası sırt', example: 'Atlas Okyanusu ortası, İzlanda'},
	rift: {title: 'İki kıtasal levha uzaklaşıyor', result: 'Yarık (rift) vadisi', example: 'Doğu Afrika'},
	subduction: {title: 'Okyanusal levha kıtanın altına dalıyor', result: 'Hendek, volkan, kıvrım dağı', example: 'And Dağları, Japonya'},
	collision: {title: 'İki kıtasal levha çarpışıyor', result: 'Kıvrım dağları', example: 'Himalayalar, Alpler'},
};

/**
 * A plate boundary in cross-section, moving: the plates ride on the mantle's convection currents, and the landform of
 * that boundary grows as they go. `divergent` two oceanic plates part and magma builds a mid-ocean ridge; `rift` a
 * continent splits into a rift valley; `subduction` an oceanic plate dives under a continent, opening a trench and
 * feeding volcanoes; `collision` two continents meet and fold into mountains. Parts: levhalar, manto, magma, sekil
 * (the landform and its name), oklar (the plates' motion).
 */
export const PlatesVisual: React.FC<VisualBoxProps & {visual: Plates}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const t = Math.max(0, seconds - delaySeconds);
	const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
	const enter = (index: number) => easeFrom(seconds, delaySeconds + index * 0.4, 0.7);
	const mantle = usePartLook('manto', enter(0));
	const plates = usePartLook('levhalar', enter(0.5));
	const arrows = usePartLook('oklar', enter(1));
	const magma = usePartLook('magma', enter(1.5));
	const shape = usePartLook('sekil', enter(2));
	// How far the boundary has gone: grows over the first eight seconds, then holds.
	const grow = smoothStep(Math.min(1, t / 8));
	const SEA = 230;
	const MANTLE_TOP = 380;
	const names = PLATE_NAMES[visual.boundary];
	const oceanic = '#5D4037';
	const continental = '#BCAAA4';
	const continentalDark = '#8D6E63';
	const water = withAlpha(C.water, 0.75);
	const sky = '#EAF4FB';
	const flowDash = -t * 30;

	const drawing = (() => {
		switch (visual.boundary) {
			case 'divergent': {
				const gap = 10 + 40 * grow;
				const ridge = 60 * grow;
				return (
					<>
						<rect x={0} y={SEA} width={W} height={MANTLE_TOP - SEA} fill={water} />
						<g opacity={plates.opacity}>
							<path d={pathOf([[0, 320], [W / 2 - gap, 320 - ridge * 0.6], [W / 2 - gap, 360], [0, 360]], true)} fill={oceanic} />
							<path d={pathOf([[W, 320], [W / 2 + gap, 320 - ridge * 0.6], [W / 2 + gap, 360], [W, 360]], true)} fill={oceanic} />
						</g>
						<g opacity={magma.opacity}>
							<path d={pathOf([[W / 2 - gap, 360], [W / 2 - gap, 320 - ridge * 0.6], [W / 2, 300 - ridge], [W / 2 + gap, 320 - ridge * 0.6], [W / 2 + gap, 360], [W / 2 + 40, MANTLE_TOP + 40], [W / 2 - 40, MANTLE_TOP + 40]], true)} fill="#E74C3C" />
						</g>
					</>
				);
			}
			case 'rift': {
				const sink = 70 * grow;
				const gap = 30 + 30 * grow;
				return (
					<>
						<g opacity={plates.opacity}>
							<path d={pathOf([[0, 250], [W / 2 - gap - 40, 250], [W / 2 - gap, 250 + sink * 0.2], [W / 2 - gap, 370], [0, 370]], true)} fill={continental} />
							<path d={pathOf([[W, 250], [W / 2 + gap + 40, 250], [W / 2 + gap, 250 + sink * 0.2], [W / 2 + gap, 370], [W, 370]], true)} fill={continental} />
							<path d={pathOf([[W / 2 - gap, 250 + sink], [W / 2 + gap, 250 + sink], [W / 2 + gap, 370], [W / 2 - gap, 370]], true)} fill={continentalDark} />
							<path d={pathOf([[W / 2 - gap, 250 + sink], [W / 2 + gap, 250 + sink]])} fill="none" stroke={water} strokeWidth={10} opacity={grow} />
						</g>
						<g opacity={magma.opacity}>
							<path d={pathOf([[W / 2 - 30, 372], [W / 2 + 30, 372], [W / 2 + 50, MANTLE_TOP + 40], [W / 2 - 50, MANTLE_TOP + 40]], true)} fill="#E74C3C" />
						</g>
					</>
				);
			}
			case 'subduction': {
				const dive = 40 + 100 * grow;
				const coast = 560;
				return (
					<>
						<rect x={0} y={SEA} width={coast} height={60} fill={water} />
						<g opacity={plates.opacity}>
							{/* The oceanic plate bends down under the continent. */}
							<path d={`M0 300 L${coast - 60} 300 Q${coast} 305 ${coast + 60} ${300 + dive * 0.6} L${coast + 160} ${300 + dive} L${coast + 140} ${340 + dive} Q${coast} 345 ${coast - 60} 340 L0 340 Z`} fill={oceanic} />
							<path d={`M${coast - 30} ${SEA} L${coast + 20} ${SEA - 20 - 40 * grow} L${coast + 120} ${SEA - 50 - 60 * grow} L${coast + 220} ${SEA - 20 - 40 * grow} L${W} ${SEA - 10} L${W} 370 L${coast + 80} 370 Q${coast} 330 ${coast - 30} 300 Z`} fill={continental} />
						</g>
						{/* The trench where the plate goes down. */}
						<g opacity={shape.opacity}>
							<path d={`M${coast - 70} 300 Q${coast - 30} ${300 + 30 * grow} ${coast - 10} 300`} fill="none" stroke={palette.ink} strokeWidth={3} strokeDasharray="6 5" />
						</g>
						<g opacity={magma.opacity}>
							<path d={`M${coast + 150} ${300 + dive} C${coast + 160} 300 ${coast + 140} 260 ${coast + 140} ${SEA - 70 - 60 * grow}`} fill="none" stroke="#E74C3C" strokeWidth={10} strokeLinecap="round" strokeDasharray="16 10" strokeDashoffset={-t * 40} />
							<path d={`M${coast + 110} ${SEA - 50 - 60 * grow} L${coast + 140} ${SEA - 90 - 60 * grow} L${coast + 170} ${SEA - 50 - 60 * grow} Z`} fill="#6E2C00" />
							<circle cx={coast + 140} cy={SEA - 105 - 60 * grow - ((t * 20) % 30)} r={10} fill={withAlpha('#7F8C8D', 0.6)} />
						</g>
					</>
				);
			}
			case 'collision': {
				const squeeze = 60 * grow;
				const peak = 150 * grow;
				const left = W / 2 - squeeze;
				const right = W / 2 + squeeze;
				return (
					<>
						<g opacity={plates.opacity}>
							<path d={pathOf([[0, 250], [left - 120, 250], [left - 40, 250 - peak * 0.5], [W / 2, 250 - peak], [right + 40, 250 - peak * 0.5], [right + 120, 250], [W, 250], [W, 370], [W / 2, 370 + peak * 0.4], [0, 370]], true)} fill={continental} />
							{/* Folded layers in the squeezed middle. */}
							{[0, 1, 2].map((layer) => (
								<path key={layer} d={`M${left - 110} ${270 + layer * 30} Q${W / 2} ${270 + layer * 30 - peak * (1 - layer * 0.2)} ${right + 110} ${270 + layer * 30}`} fill="none" stroke={continentalDark} strokeWidth={6} />
							))}
						</g>
						<g opacity={shape.opacity}>
							<path d={pathOf([[W / 2 - 40, 250 - peak + 12], [W / 2, 250 - peak], [W / 2 + 40, 250 - peak + 12]])} fill="none" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" />
						</g>
					</>
				);
			}
		}
	})();
	// Which way the plates move: apart for divergent boundaries, together otherwise.
	const apart = visual.boundary === 'divergent' || visual.boundary === 'rift';
	const arrowY = visual.boundary === 'divergent' ? 280 : 200;

	return (
		<World width={width} height={height}>
			<defs>
				<linearGradient id={`plate-mantle${id}`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#E67E22" />
					<stop offset="1" stopColor="#A93226" />
				</linearGradient>
			</defs>
			<rect x={0} y={0} width={W} height={MANTLE_TOP} fill={sky} />
			{/* The mantle and its convection currents. */}
			<g opacity={mantle.opacity}>
				<rect x={0} y={MANTLE_TOP} width={W} height={H - MANTLE_TOP} fill={`url(#plate-mantle${id})`} />
				{[W * 0.25, W * 0.75].map((x, index) => (
					<ellipse key={index} cx={x} cy={MANTLE_TOP + 110} rx={180} ry={70} fill="none" stroke={withAlpha('#FFFFFF', 0.7)} strokeWidth={4} strokeDasharray="18 14" strokeDashoffset={(index === 0 ? 1 : -1) * flowDash * (apart ? 1 : -1)} />
				))}
				<Tag x={20} y={H - 24} text="Manto: konveksiyon akımları" size={19} focused={mantle.focused} />
			</g>
			{drawing}
			{/* Plate motion. */}
			<g opacity={arrows.opacity}>
				{[-1, 1].map((side) => {
					const x = W / 2 + side * 300;
					const pointing = apart ? side : -side;
					return <path key={side} d={`M${x - 50 * pointing} ${arrowY} L${x + 40 * pointing} ${arrowY} M${x + 40 * pointing} ${arrowY} l${-18 * pointing} -12 M${x + 40 * pointing} ${arrowY} l${-18 * pointing} 12`} fill="none" stroke={arrows.focused > 0.5 ? palette.lesson : palette.ink} strokeWidth={6} strokeLinecap="round" />;
				})}
			</g>
			{/* What forms here. */}
			<g opacity={shape.opacity}>
				<Tag x={W / 2} y={40} text={names.title} anchor="middle" size={24} weight={800} />
				<Tag x={W / 2} y={78} text={`${names.result} · ${names.example}`} anchor="middle" size={21} focused={shape.focused} />
			</g>
		</World>
	);
};
