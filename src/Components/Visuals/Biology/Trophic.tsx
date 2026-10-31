import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {withAlpha} from '../../../Themes/Theme';
import {useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import type {CourseVisual} from '../VisualSchema';
import {usePartLook, World} from '../VisualWorld';

// ---------------------------------------------------------------- the ecological pyramid

type Trophic = Extract<CourseVisual, {kind: 'trophic'}>;

/** The figure's stage: values on the left, the pyramid, what changes on the way up on the right. */
export const TROPHIC_STAGE = {width: 1240, height: 600} as const;

const TRENDS: [string, boolean][] = [
	['aktarılan enerji', false],
	['toplam biyokütle', false],
	['birey sayısı', false],
	['enerji kaybı', true],
	['biyolojik birikim', true],
	['vücut büyüklüğü', true],
];

/**
 * A food (energy) pyramid as steps narrowing upward: producers at the bottom, each level with its name, an example
 * under it and its value on the left (100 000 J, 10 000 J…), and beside it what changes on the way up: the energy
 * passed on, the biomass and the number of individuals fall; the energy lost, biological magnification and body
 * size rise. Levels come in from the bottom. Parts: l1… (levels, bottom first) and egilim (the list).
 */
export const TrophicVisual: React.FC<VisualBoxProps & {visual: Trophic}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const n = visual.levels.length;
	const step = Math.min(116, 520 / n);
	const base = (TROPHIC_STAGE.height + n * step) / 2;
	const cx = visual.trends ? 560 : TROPHIC_STAGE.width / 2;
	const widthAt = (i: number) => 700 - (i * 340) / Math.max(1, n - 1);
	const trends = usePartLook('egilim', visual.trends ? easeFrom(seconds, delaySeconds + 0.4 + n * 0.4, 0.6) : 0);
	return (
		<World width={width} height={height} viewWidth={TROPHIC_STAGE.width} viewHeight={TROPHIC_STAGE.height}>
			<defs>
				<marker id="trophicArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto">
					<path d="M0 0 L10 5 L0 10 Z" fill={palette.ink} />
				</marker>
			</defs>
			{visual.levels.map((level, i) => (
				<Level key={i} index={i} count={n} label={level.label} example={level.example} value={level.value} cx={cx} y={base - (i + 1) * step} w={widthAt(i)} h={step - 10} entrance={easeFrom(seconds, delaySeconds + 0.2 + i * 0.4, 0.5)} />
			))}
			{visual.trends ? (
				<g opacity={trends.opacity}>
					<line x1={952} x2={952} y1={base - 10} y2={base - n * step + 8} stroke={palette.ink} strokeWidth={4} markerEnd="url(#trophicArrow)" />
					<text x={972} y={TROPHIC_STAGE.height / 2 - 206} fontSize={28} fontWeight={800} fill={trends.focused > 0.5 ? palette.lesson : palette.ink} fontFamily={palette.fontBody}>
						Yukarı çıktıkça
					</text>
					{TRENDS.map(([text, up], k) => (
						<g key={text} transform={`translate(972 ${TROPHIC_STAGE.height / 2 - 140 + k * 66})`}>
							<text x={0} y={4} fontSize={36} fontWeight={800} fill={up ? palette.lesson : palette.brand} fontFamily={palette.fontBody}>
								{up ? '↑' : '↓'}
							</text>
							<text x={32} y={-4} fontSize={25} fontWeight={700} fill={palette.ink} fontFamily={palette.fontBody}>
								{text}
							</text>
							<text x={32} y={22} fontSize={21} fontWeight={600} fill={palette.muted} fontFamily={palette.fontBody}>
								{up ? 'artar' : 'azalır'}
							</text>
						</g>
					))}
				</g>
			) : null}
		</World>
	);
};

const Level: React.FC<{index: number; count: number; label: string; example?: string; value?: string; cx: number; y: number; w: number; h: number; entrance: number}> = ({index, count, label, example, value, cx, y, w, h, entrance}) => {
	const palette = useVisualPalette();
	const look = usePartLook(`l${index + 1}`, entrance);
	const lit = look.focused;
	const strength = 0.2 + (index / Math.max(1, count - 1)) * 0.55;
	const dark = strength > 0.6;
	const ink = lit > 0.5 || dark ? palette.onLesson : palette.ink;
	const middle = y + h / 2;
	return (
		<g opacity={look.opacity} transform={`translate(${cx} ${middle}) scale(${(0.9 + 0.1 * entrance) * (1 + 0.04 * lit)}) translate(${-cx} ${-middle})`}>
			<rect x={cx - w / 2} y={y} width={w} height={h} rx={14} fill={lit > 0.5 ? palette.lesson : withAlpha(palette.lesson, strength)} stroke={palette.lesson} strokeWidth={2} />
			<text x={cx} y={example ? middle - 4 : middle + 10} textAnchor="middle" fontSize={30} fontWeight={800} fill={ink} fontFamily={palette.fontBody}>
				{label}
			</text>
			{example ? (
				<text x={cx} y={middle + 28} textAnchor="middle" fontSize={23} fontWeight={600} fill={ink} fontFamily={palette.fontBody}>
					{example}
				</text>
			) : null}
			{value ? (
				<text x={cx - w / 2 - 18} y={middle + 11} textAnchor="end" fontSize={32} fontWeight={800} fill={lit > 0.5 ? palette.lesson : palette.ink} fontFamily={palette.fontBody}>
					{value}
				</text>
			) : null}
		</g>
	);
};
