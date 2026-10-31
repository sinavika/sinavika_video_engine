import React, {useId} from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {NATURE_COLORS as C} from '../../../Configurations/NatureColors';
import {withAlpha} from '../../../Themes/Theme';
import {useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import {type CourseVisual} from '../VisualSchema';
import {deg, rad, Tag, usePartLook, World} from '../VisualWorld';

// ---------------------------------------------------------------- the Earth's interior

type Interior = Extract<CourseVisual, {kind: 'interior'}>;

const LAYER_COLORS = {crust: '#8D6E63', mantle: '#E67E22', mantleDeep: '#C0392B', outer: '#F4D03F', inner: '#FDFEFE'};

/**
 * The Earth cut open: the crust (drawn thicker than it is, so it shows), the mantle with its convection currents
 * turning in the asthenosphere, the liquid outer core and the solid inner core, each named with its depth on the
 * right; an inset shows the crust thick under continents (sial over sima) and thin under oceans (sima).
 * Parts: kabuk, manto, astenosfer, discekirdek, iccekirdek, sialsima.
 */
export const InteriorVisual: React.FC<VisualBoxProps & {visual: Interior}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const t = Math.max(0, seconds - delaySeconds);
	const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
	const enter = (index: number) => easeFrom(seconds, delaySeconds + index * 0.4, 0.7);
	const inner = usePartLook('iccekirdek', enter(0));
	const outer = usePartLook('discekirdek', enter(0.5));
	const mantle = usePartLook('manto', enter(1));
	const flow = usePartLook('astenosfer', enter(1.5));
	const crust = usePartLook('kabuk', enter(2));
	const inset = usePartLook('sialsima', visual.crustInset ? enter(2.5) : 0);
	const cx = 300;
	const cy = 300;
	const R = 270;
	const radius = {inner: R * 0.19, outer: R * 0.545, asthenosphere: R * 0.93, crust: R};
	const ring = (r: number) => `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0`;
	// Convection cells in the upper mantle: arrows turning round the ring, hot rising, cool sinking.
	const cells = Array.from({length: 6}, (_, index) => index * 60 + (t * 6) % 60);
	const labels = [
		{look: crust, id: 'kabuk', r: R - 6, angle: -62, title: 'Yer kabuğu', detail: 'Ortalama 30–35 km; katı'},
		{look: flow, id: 'astenosfer', r: R * 0.9, angle: -38, title: 'Astenosfer', detail: 'Mantonun üstü; konveksiyon akımları'},
		{look: mantle, id: 'manto', r: R * 0.75, angle: -12, title: 'Manto', detail: "2.900 km'ye kadar; hacmin %84'ü"},
		{look: outer, id: 'discekirdek', r: R * 0.38, angle: 12, title: 'Dış çekirdek', detail: 'Sıvı; nikel ve demir (nife)'},
		{look: inner, id: 'iccekirdek', r: R * 0.1, angle: 36, title: 'İç çekirdek', detail: "Katı; en sıcak ve yoğun · 6.370 km"},
	];
	return (
		<World width={width} height={height}>
			<defs>
				<radialGradient id={`mantle${id}`} cx="0.5" cy="0.5" r="0.5">
					<stop offset="0.55" stopColor={LAYER_COLORS.mantleDeep} />
					<stop offset="1" stopColor={LAYER_COLORS.mantle} />
				</radialGradient>
			</defs>
			{/* Layers from the outside in. */}
			<g opacity={crust.opacity}>
				<circle cx={cx} cy={cy} r={radius.crust} fill={LAYER_COLORS.crust} stroke={crust.focused > 0.5 ? palette.lesson : 'none'} strokeWidth={6} />
			</g>
			<g opacity={mantle.opacity}>
				<circle cx={cx} cy={cy} r={radius.crust - 12} fill={`url(#mantle${id})`} stroke={mantle.focused > 0.5 ? palette.lesson : 'none'} strokeWidth={6} />
			</g>
			<g opacity={flow.opacity}>
				<path d={ring(radius.asthenosphere)} fill="none" stroke={withAlpha('#FFFFFF', 0.35)} strokeWidth={22} />
				{cells.map((angle, index) => {
					const a = rad(angle);
					const r = radius.asthenosphere;
					const x = cx + r * Math.cos(a);
					const y = cy + r * Math.sin(a);
					const direction = deg(a) + (index % 2 === 0 ? 90 : -90);
					return <path key={index} d="M10 0 L-8 -8 L-8 8 Z" fill={flow.focused > 0.5 ? palette.lesson : '#FFFFFF'} transform={`translate(${x} ${y}) rotate(${direction})`} />;
				})}
			</g>
			<g opacity={outer.opacity}>
				<circle cx={cx} cy={cy} r={radius.outer} fill={LAYER_COLORS.outer} stroke={outer.focused > 0.5 ? palette.lesson : withAlpha('#7D6608', 0.4)} strokeWidth={outer.focused > 0.5 ? 6 : 2} />
			</g>
			<g opacity={inner.opacity}>
				<circle cx={cx} cy={cy} r={radius.inner} fill={LAYER_COLORS.inner} stroke={inner.focused > 0.5 ? palette.lesson : '#B7950B'} strokeWidth={inner.focused > 0.5 ? 6 : 3} />
			</g>
			{/* Names with leaders, on the right. */}
			{labels.map((label, index) => {
				const a = rad(label.angle);
				const x = cx + label.r * Math.cos(a);
				const y = cy + label.r * Math.sin(a);
				const ty = 60 + index * 92;
				return (
					<g key={label.id} opacity={label.look.opacity}>
						<circle cx={x} cy={y} r={6} fill={palette.ink} />
						<path d={`M${x} ${y} L${cx + R + 30} ${ty} L${cx + R + 50} ${ty}`} fill="none" stroke={palette.ink} strokeWidth={2} />
						<Tag x={cx + R + 58} y={ty - 12} text={label.title} size={24} weight={800} focused={label.look.focused} />
						<Tag x={cx + R + 58} y={ty + 16} text={label.detail} size={18} weight={600} fill={palette.muted} />
					</g>
				);
			})}
			{/* The crust close up: thick under continents, thin under oceans. */}
			{visual.crustInset ? (
				<g opacity={inset.opacity} transform="translate(600 468)">
					<rect x={0} y={0} width={392} height={118} rx={14} fill={palette.surface} stroke={inset.focused > 0.5 ? palette.lesson : palette.border} strokeWidth={inset.focused > 0.5 ? 4 : 2} />
					<rect x={16} y={34} width={210} height={30} fill="#D7CCC8" />
					<rect x={16} y={64} width={210} height={30} fill="#6D4C41" />
					<rect x={226} y={34} width={150} height={36} fill={withAlpha(C.water, 0.7)} />
					<rect x={226} y={70} width={150} height={24} fill="#6D4C41" />
					<Tag x={20} y={18} text="Kara: sial + sima (kalın)" size={16} />
					<Tag x={232} y={18} text="Okyanus: sima (ince)" size={16} />
					<text x={120} y={54} textAnchor="middle" fontSize={15} fontWeight={700} fill={palette.ink} fontFamily={palette.fontBody}>
						Sial
					</text>
					<text x={120} y={84} textAnchor="middle" fontSize={15} fontWeight={700} fill="#FFFFFF" fontFamily={palette.fontBody}>
						Sima
					</text>
				</g>
			) : null}
		</World>
	);
};
