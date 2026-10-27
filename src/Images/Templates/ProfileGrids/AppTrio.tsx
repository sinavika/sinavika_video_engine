import {moduleName} from '../../../Configurations/ProductMessaging';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {z} from 'zod';
import {APP_SCREENS, APP_SCREEN_NAMES} from '../../../Components/AppScreens/AppScreenRegistry';
import {PhoneFrame, phoneHeight} from '../../../Components/AppScreens/PhoneFrame';
import {APP_MODES} from '../../../Components/AppScreens/AppScreenTokens';
import {BrandMark} from '../../../Components/Overlays/BrandMark';
import {Text} from '../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../Configurations/BrandTypography';
import {plainText} from '../../../Schemas/RichText';
import {useTheme} from '../../../Themes/ThemeContext';
import {useImageLayout} from '../../Components/ImageFrame';
import {defineImageTemplate} from '../../ImageTemplateDefinition';
import {GRID_MARGIN, PROFILE_GRID, tileWindow} from './ProfileGridLayout';

const PanelSchema = z.object({
	/** The module shown, as the app names it. */
	kicker: plainText(22),
	headline: plainText(26),
	screen: z.enum(APP_SCREEN_NAMES),
});

const AppTrioSchema = z.object({
	panels: z.tuple([PanelSchema, PanelSchema, PanelSchema]),
	/** The app theme shown on the phones. */
	appMode: z.enum(APP_MODES).default('light'),
});

type Content = z.infer<typeof AppTrioSchema>;

/** The band of brand colour behind the phones, as shares of the image height. It is the same on every tile, so it reads as one band across the row. */
const BAND = {top: 0.47, bottom: 0.83};
const PHONE_WIDTH = 410;

/**
 * One headline size for all three tiles, set by the longest headline: the
 * row reads as one line of type only if the words share size and baseline
 * (Tuğçe's review, 26 Oct 2026: "Deneme çöz. / Eksiğini gör." looked uneven).
 */
const headlineSize = (content: Content): number => {
	const longest = Math.max(...content.panels.map((panel) => panel.headline.length));
	return longest <= 12 ? 124 : longest <= 18 ? 104 : 86;
};

const AppTrioImage: React.FC<{content: Content; page: number}> = ({content, page}) => {
	const {colors} = useTheme();
	const {u, width, height} = useImageLayout();
	const index = Math.min(page, PROFILE_GRID.tiles - 1);
	const panel = content.panels[index];
	const tile = tileWindow(width, height);
	const inset = tile.left + u(GRID_MARGIN);
	const Screen = APP_SCREENS[panel.screen].Component;
	const phoneWidth = u(PHONE_WIDTH);
	// Every phone leans the same way: a repeated shape reads as one row, and the lean keeps the logo's corner free.
	const lean = 4;

	return (
		<AbsoluteFill style={{backgroundColor: colors.background, overflow: 'hidden'}}>
			<div style={{position: 'absolute', left: 0, right: 0, top: height * BAND.top, height: height * (BAND.bottom - BAND.top), backgroundColor: colors.primary}} />

			<div style={{position: 'absolute', left: inset, right: inset, top: u(PROFILE_GRID.corner.height * 0.62), display: 'flex', flexDirection: 'column', gap: u(18)}}>
				<div style={{display: 'flex', alignItems: 'center', gap: u(18), marginRight: u(PROFILE_GRID.corner.width - 120)}}>
					<Text variant="label" size={30} weight={TYPE.weights.display} color={colors.primaryText}>
						{String(index + 1).padStart(2, '0')}
					</Text>
					<div style={{width: u(54), height: u(5), borderRadius: u(3), backgroundColor: colors.primary}} />
					<Text variant="label" size={30} weight={TYPE.weights.display} color={colors.text} style={{textTransform: 'none'}}>
						{panel.kicker}
					</Text>
				</div>
				<Text variant="display" size={headlineSize(content)} weight={TYPE.weights.kinetic} color={colors.text} style={{lineHeight: 1.02, whiteSpace: 'nowrap'}}>
					{panel.headline}
				</Text>
			</div>

			<div style={{position: 'absolute', left: (width - phoneWidth) / 2, top: height * 0.335, height: phoneHeight(phoneWidth), transform: `rotate(${lean}deg)`, transformOrigin: 'center top'}}>
				<PhoneFrame width={phoneWidth} mode={content.appMode} style={{boxShadow: `0 ${u(30)}px ${u(80)}px rgba(0, 0, 0, 0.28)`}}>
					<Screen />
				</PhoneFrame>
			</div>

			{/* The logo sits inside the tile with the same margin as the text, not pressed into the corner. */}
			<div style={{position: 'absolute', right: inset, bottom: u(GRID_MARGIN + 16)}}>
				<BrandMark color={colors.text} />
			</div>
		</AbsoluteFill>
	);
};

/** Three pinned posts on a light ground: one app screen each, standing on a band of the brand colour that runs through all three. */
export const AppTrio = defineImageTemplate({
	category: 'ProfileGrid',
	variant: 'AppTrio',
	title: 'Profil üçlüsü: üç ekran',
	description: 'Profilin üstüne sabitlenen üç gönderi: her karede bir uygulama ekranı, üç kareden geçen turuncu bant.',
	contentSchema: AppTrioSchema,
	sampleContent: {
		panels: [
			{kicker: moduleName('exam'), headline: 'Deneme çöz.', screen: 'Exam'},
			{kicker: moduleName('studyPlan'), headline: 'Eksiğini gör.', screen: 'Analysis'},
			{kicker: moduleName('sinoAi'), headline: 'SinoAI’ye sor.', screen: 'SinoAi'},
		],
	},
	defaultTheme: 'SinavikaLight',
	defaultSize: 'Portrait',
	pageCount: () => PROFILE_GRID.tiles,
	outputName: (content) => `Profil Uclusu ${content.panels.map((panel) => panel.kicker).join(' ')}`,
	Component: AppTrioImage,
});
