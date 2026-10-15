import {BRAND_THEME_TYPOGRAPHY} from '../Configurations/BrandTypography';
import type {Theme} from './Theme';

export const WhiteboardMinimal: Theme = {
	name: 'Minimal Beyaz Tahta',
	description: 'Beyaz tahta hissi: el yazısı başlıklar, mürekkep çizgiler, kalem renkleri.',
	colors: {
		background: '#FCFCFA',
		text: '#1F2933',
		textMuted: '#5B6672',
		canvasAccent: '#1D4ED8',
		surface: '#FFFFFF',
		surfaceAlt: '#F1F5F9',
		onSurface: '#1F2933',
		onSurfaceMuted: '#5B6672',
		border: '#1F2933',
		primary: '#1D4ED8',
		onPrimary: '#FFFFFF',
		primaryText: '#1D4ED8',
		accent: '#E11D48',
		onAccent: '#FFFFFF',
		success: '#15803D',
		danger: '#DC2626',
		warning: '#D97706',
		onStatus: '#FFFFFF',
		highlight: '#FACC15',
		categorical: [
			{fill: '#1D4ED8', on: '#FFFFFF'},
			{fill: '#E11D48', on: '#FFFFFF'},
			{fill: '#15803D', on: '#FFFFFF'},
			{fill: '#7C3AED', on: '#FFFFFF'},
			{fill: '#0F766E', on: '#FFFFFF'},
		],
	},
	// Labels without capitals; faces and weights are the brand's.
	typography: {...BRAND_THEME_TYPOGRAPHY, labelTransform: 'none'},
	shape: {radius: {sm: 8, md: 12, lg: 16}, borderWidth: 3, elevation: 'none'},
	background: {kind: 'dots', dotColor: '#D3D9E0', size: 44},
	motion: {speed: 0.9, enter: {preset: 'reveal', direction: 'right'}},
};
