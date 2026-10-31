import React from 'react';
import {easeFrom} from '../../../Animations/Motion';
import {withAlpha} from '../../../Themes/Theme';
import {useSceneSeconds, useVisualPalette, type VisualBoxProps} from '../VisualFrame';
import {TAXONOMY_LEVELS} from './BiologySchema';
import {type CourseVisual} from '../VisualSchema';
import {usePartLook, World} from '../VisualWorld';

// ---------------------------------------------------------------- the taxonomic ranks as a narrowing funnel

type Taxonomy = Extract<CourseVisual, {kind: 'taxonomy'}>;

/** The figure's stage. */
export const TAXONOMY_STAGE = {width: 1090, height: 560} as const;

const NAMES = ['Âlem', 'Şube', 'Sınıf', 'Takım', 'Aile', 'Cins', 'Tür'];
/** The lion, from kingdom to species, unless the figure names its own example. */
const LION = ['Hayvanlar', 'Kordalılar', 'Memeliler', 'Etçiller', 'Kedigiller', 'Panthera', 'Panthera leo'];
const TRENDS: [string, boolean][] = [
	['ortak özellik', true],
	['akrabalık', true],
	['gen, protein benzerliği', true],
	['homolog organ', true],
	['tür ve birey sayısı', false],
	['çeşitlilik', false],
];

/**
 * The seven ranks from kingdom to species as bars that narrow downward, each with its example (a lion by default:
 * Hayvanlar … Panthera leo, genus and species in italics), and beside them what changes on the way down: shared
 * traits, kinship and gene and protein likeness rise; the number of species and individuals, and diversity, fall.
 * Parts: alem, sube, sinif, takim, aile, cins, tur (the ranks) and egilim (the list).
 */
export const TaxonomyVisual: React.FC<VisualBoxProps & {visual: Taxonomy}> = ({visual, width, height, delaySeconds = 0}) => {
	const palette = useVisualPalette();
	const seconds = useSceneSeconds();
	const examples = visual.examples ?? LION;
	const top = 38;
	const pitch = 70;
	const cx = visual.trends ? 370 : 500;
	const widthAt = (i: number) => 680 - i * 60;
	const trends = usePartLook('egilim', visual.trends ? easeFrom(seconds, delaySeconds + 2.4, 0.6) : 0);
	return (
		<World width={width} height={height} viewWidth={TAXONOMY_STAGE.width} viewHeight={TAXONOMY_STAGE.height}>
			<defs>
				<marker id="taxonomyArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto">
					<path d="M0 0 L10 5 L0 10 Z" fill={palette.ink} />
				</marker>
			</defs>
			{TAXONOMY_LEVELS.map((id, i) => (
				<Level key={id} id={id} index={i} name={NAMES[i]} example={examples[i]} italic={i >= 5} cx={cx} y={top + i * pitch} w={widthAt(i)} h={pitch - 12} entrance={easeFrom(seconds, delaySeconds + 0.2 + i * 0.22, 0.5)} />
			))}
			{visual.trends ? (
				<g opacity={trends.opacity}>
					<line x1={716} x2={716} y1={top + 6} y2={top + 6 * pitch + 40} stroke={palette.ink} strokeWidth={4} markerEnd="url(#taxonomyArrow)" />
					<text x={738} y={top + 20} fontSize={30} fontWeight={800} fill={trends.focused > 0.5 ? palette.lesson : palette.ink} fontFamily={palette.fontBody}>
						Türe indikçe
					</text>
					{TRENDS.map(([text, up], k) => (
						<g key={text} transform={`translate(738 ${top + 78 + k * 74})`}>
							<text x={0} y={4} fontSize={38} fontWeight={800} fill={up ? palette.lesson : palette.brand} fontFamily={palette.fontBody}>
								{up ? '↑' : '↓'}
							</text>
							<text x={34} y={-4} fontSize={25} fontWeight={700} fill={palette.ink} fontFamily={palette.fontBody}>
								{text}
							</text>
							<text x={34} y={24} fontSize={22} fontWeight={600} fill={palette.muted} fontFamily={palette.fontBody}>
								{up ? 'artar' : 'azalır'}
							</text>
						</g>
					))}
				</g>
			) : null}
		</World>
	);
};

const Level: React.FC<{id: string; index: number; name: string; example: string; italic: boolean; cx: number; y: number; w: number; h: number; entrance: number}> = ({id, index, name, example, italic, cx, y, w, h, entrance}) => {
	const palette = useVisualPalette();
	const look = usePartLook(id, entrance);
	const lit = look.focused;
	const strength = 0.18 + index * 0.11;
	const dark = strength > 0.6;
	const fill = lit > 0.5 ? palette.lesson : withAlpha(palette.lesson, strength);
	const ink = lit > 0.5 || dark ? palette.onLesson : palette.ink;
	return (
		<g opacity={look.opacity} transform={`translate(${cx} ${y + h / 2}) scale(${1 + 0.04 * lit}) translate(${-cx} ${-(y + h / 2)})`}>
			<rect x={cx - w / 2} y={y} width={w} height={h} rx={14} fill={fill} stroke={palette.lesson} strokeWidth={2} />
			<text x={cx - w / 2 + 24} y={y + h / 2} dominantBaseline="middle" fontSize={32} fontWeight={800} fill={ink} fontFamily={palette.fontBody}>
				{name}
			</text>
			<text x={cx + w / 2 - 24} y={y + h / 2} dominantBaseline="middle" textAnchor="end" fontSize={28} fontWeight={600} fontStyle={italic ? 'italic' : 'normal'} fill={ink} fontFamily={palette.fontBody}>
				{example}
			</text>
		</g>
	);
};
