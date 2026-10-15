import {BRAND_THEME_TYPOGRAPHY} from '../Configurations/BrandTypography';
import type {Theme} from './Theme';

export const ExamFocus: Theme = {
	name: 'Sınav Odaklı Sade',
	description: 'Beyaz zemin, keskin köşeler, tek vurgu rengi. Dikkat dağıtmayan anlatım.',
	colors: {
		background: '#FFFFFF',
		text: '#0F172A',
		textMuted: '#55607A',
		canvasAccent: '#D9451F',
		surface: '#F3F5F8',
		surfaceAlt: '#E7EBF1',
		onSurface: '#0F172A',
		onSurfaceMuted: '#55607A',
		border: '#CBD3DF',
		primary: '#0F172A',
		onPrimary: '#FFFFFF',
		primaryText: '#B93815',
		accent: '#D9451F',
		onAccent: '#FFFFFF',
		success: '#0E7C4A',
		danger: '#C81E1E',
		warning: '#B45309',
		onStatus: '#FFFFFF',
		highlight: '#FF9F7A',
		categorical: [
			{fill: '#0F172A', on: '#FFFFFF'},
			{fill: '#D9451F', on: '#FFFFFF'},
			{fill: '#334155', on: '#FFFFFF'},
			{fill: '#0E7C4A', on: '#FFFFFF'},
			{fill: '#1D4ED8', on: '#FFFFFF'},
		],
	},
	typography: BRAND_THEME_TYPOGRAPHY,
	shape: {radius: {sm: 4, md: 6, lg: 8}, borderWidth: 2, elevation: 'none'},
	background: {kind: 'solid'},
	motion: {speed: 1.2, enter: {preset: 'fade'}},
};
