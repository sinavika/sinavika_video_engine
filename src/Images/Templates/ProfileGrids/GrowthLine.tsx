import {moduleName} from '../../../Configurations/ProductMessaging';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {z} from 'zod';
import {BrandMark} from '../../../Components/Overlays/BrandMark';
import {Text} from '../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../Configurations/BrandTypography';
import {plainText} from '../../../Schemas/RichText';
import {withAlpha} from '../../../Themes/Theme';
import {useTheme} from '../../../Themes/ThemeContext';
import {POST_TYPE} from '../../../Configurations/SocialIdentity';
import {imageFrameOf, useImageLayout} from '../../Components/ImageFrame';
import {lineCount, overflowNote, seriesSize} from '../../Components/TextMeasure';
import {defineImageTemplate} from '../../ImageTemplateDefinition';
import {PROFILE_GRID, rowPosition, tileWindow} from './ProfileGridLayout';

const PanelSchema = z.object({
	/** One word, set as large as the tile allows. */
	word: plainText(10),
	text: plainText(64),
	/** The modules behind the word, as the app names them. */
	modules: z.array(plainText(18)).max(4).default([]),
});

const GrowthLineSchema = z.object({
	label: plainText(24).default('Sınavika'),
	panels: z.tuple([PanelSchema, PanelSchema, PanelSchema]),
	/** Shown on the last tile. */
	website: plainText(30).default('sinavika.com'),
});

type Content = z.infer<typeof GrowthLineSchema>;

const G = POST_TYPE.growthLine;
const WORD_SET = {weight: G.wordWeight, letterSpacingEm: G.wordLetterSpacingEm};
/** A tile's text column, in reference pixels: the tile the grid shows, less its margin on both sides. */
const columnOf = (width: number, height: number) => {
	const {unit} = imageFrameOf(width, height);
	return (width - 2 * (tileWindow(width, height).left + 56 * unit)) / unit;
};
/** One word size for the three tiles: tiles side by side never differ (equal series type). */
const wordSizeOf = (content: Content, width: number, height: number) => seriesSize(content.panels.map((panel) => panel.word), G.wordSteps, columnOf(width, height), () => 1, WORD_SET).size;

const growthIssues = (content: Content, frame: {width: number; height: number}): string[] => {
	const box = columnOf(frame.width, frame.height);
	const size = wordSizeOf(content, frame.width, frame.height);
	return content.panels.flatMap((panel, index) => {
		const word = lineCount(panel.word, box, {...WORD_SET, size});
		const text = lineCount(panel.text, box, {size: G.text, weight: G.textWeight});
		return [
			...(word > 1 ? [`${index + 1}. karo: "${panel.word}" ${size} puntoda tek satıra sığmıyor. Kısa bir kelime seç.`] : []),
			...(text > G.textLines ? [`${index + 1}. karo: "${panel.text}" ${G.text} puntoda ${overflowNote(text, G.textLines)}. Kısalt.`] : []),
		];
	});
};

/** Height of the line above the bottom of the image, as a share of the image height, along the row of tiles. */
const lineHeight = (position: number): number => {
	const t = Math.min(1, Math.max(0, position / PROFILE_GRID.tiles));
	const rise = t * t * (3 - 2 * t);
	return 0.14 + 0.3 * rise + 0.018 * Math.sin(position * 4.4);
};

const GrowthLineImage: React.FC<{content: Content; page: number}> = ({content, page}) => {
	const {colors, typography} = useTheme();
	const {u, width, height} = useImageLayout();
	const index = Math.min(page, PROFILE_GRID.tiles - 1);
	const panel = content.panels[index];
	const tile = tileWindow(width, height);
	const ink = colors.onPrimary;
	const last = index === PROFILE_GRID.tiles - 1;

	const yAt = (x: number) => height * (1 - lineHeight(rowPosition(index, x, width, height)));
	const endX = width;
	const steps = 80;
	const points = Array.from({length: steps + 1}, (_, step) => (step / steps) * endX);
	const path = points.map((x, step) => `${step === 0 ? 'M' : 'L'}${x.toFixed(1)} ${yAt(x).toFixed(1)}`).join(' ');
	const marker = tile.left + tile.width * (last ? 0.62 : 0.5);
	const inset = tile.left + u(56);

	return (
		<AbsoluteFill style={{backgroundColor: colors.primary, overflow: 'hidden'}}>
			<svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
				<path d={`${path} L${endX} ${height} L0 ${height} Z`} fill={withAlpha(ink, 0.1)} />
				<path d={path} fill="none" stroke={ink} strokeWidth={u(14)} strokeLinecap="round" strokeLinejoin="round" />
				<circle cx={marker} cy={yAt(marker)} r={u(last ? 34 : 22)} fill={last ? colors.text : colors.primary} stroke={ink} strokeWidth={u(12)} />
			</svg>

			<div style={{position: 'absolute', left: inset, right: inset, top: u(PROFILE_GRID.corner.height * 0.62), display: 'flex', flexDirection: 'column', gap: u(22)}}>
				<div style={{display: 'flex', alignItems: 'center', gap: u(18), marginRight: u(PROFILE_GRID.corner.width - 120)}}>
					<Text variant="label" size={30} weight={TYPE.weights.display} color={colors.text}>
						{String(index + 1).padStart(2, '0')}
					</Text>
					<div style={{width: u(54), height: u(5), borderRadius: u(3), backgroundColor: colors.text}} />
					<Text variant="label" size={30} weight={TYPE.weights.display} color={colors.text}>
						{content.label}
					</Text>
				</div>
				<Text variant="display" size={wordSizeOf(content, width, height)} weight={G.wordWeight} color={ink} style={{lineHeight: 1.3, letterSpacing: `${G.wordLetterSpacingEm}em`, marginTop: u(-10), marginBottom: u(-6), whiteSpace: 'nowrap'}}>
					{panel.word}
				</Text>
				<Text variant="display" size={G.text} weight={G.textWeight} color={colors.text} style={{lineHeight: 1.12}}>
					{panel.text}
				</Text>
				<div style={{display: 'flex', flexWrap: 'wrap', gap: u(14), marginTop: u(12)}}>
					{panel.modules.map((module) => (
						<div key={module} style={{padding: `${u(12)}px ${u(26)}px`, borderRadius: u(999), border: `${u(4)}px solid ${ink}`, color: ink, fontFamily: typography.display, fontWeight: TYPE.weights.display, fontSize: u(34), lineHeight: 1}}>
							{module}
						</div>
					))}
				</div>
			</div>

			<div style={{position: 'absolute', right: inset, bottom: u(64), display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: u(10)}}>
				<BrandMark color={ink} />
				{last ? (
					<Text size={30} weight={TYPE.weights.strong} color={ink}>
						{content.website}
					</Text>
				) : null}
			</div>
		</AbsoluteFill>
	);
};

/** Three pinned posts on the brand colour: one huge word each, joined by a line that climbs from the first tile to the last. */
export const GrowthLine = defineImageTemplate({
	category: 'ProfileGrid',
	variant: 'GrowthLine',
	title: 'Profil üçlüsü: yükselen çizgi',
	description: 'Profilin üstüne sabitlenen üç gönderi: her karede dev bir kelime, üç kareyi birleştiren yükselen çizgi.',
	contentSchema: GrowthLineSchema,
	sampleContent: {
		panels: [
			{word: 'Ölç.', text: 'Denemeni çöz, analizini gör.', modules: [moduleName('exam')]},
			{word: 'Öğren.', text: 'Eksiğini ders, test ve kartlarla kapat.', modules: [moduleName('lessons'), moduleName('tests'), moduleName('flashcards'), moduleName('smartSummary')]},
			{word: 'Geliş.', text: 'Planını takip et, SinoAI’ye sor.', modules: [moduleName('studyPlan'), moduleName('sinoAi')]},
		],
	},
	defaultTheme: 'SinavikaLight',
	defaultSize: 'Portrait',
	pageCount: () => PROFILE_GRID.tiles,
	outputName: (content) => `Profil Uclusu ${content.panels.map((panel) => panel.word).join(' ')}`,
	checkLayout: growthIssues,
	Component: GrowthLineImage,
});
