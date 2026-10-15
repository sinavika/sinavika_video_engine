import type {z} from 'zod';
import {moduleCopy} from '../../../Configurations/ProductMessaging';
import type {AppPromotionSchema} from './AppPromotionSchema';

/** Every claim here is taken from the app itself or from sinavika.com. */
export const APP_PROMOTION_SAMPLE: z.input<typeof AppPromotionSchema> = {
	hook: {
		lines: ['Sınava hazırlık', 'tek uygulamada.'],
		emphasis: 'tek uygulamada.',
		narration: 'Deneme bir yerde, konu anlatımı başka yerde. Sınava böyle mi hazırlanıyorsun?',
	},
	features: [
		{screen: 'Home', headline: 'Hepsi tek yerde', narration: 'Sınavika’da hepsi tek uygulamada.'},
		{screen: 'Exam', headline: 'Deneme çöz', narration: 'Denemeni çöz.'},
		{screen: 'Analysis', headline: 'Analizini gör', narration: 'Güçlü ve eksik alanlarını hemen gör.'},
		{screen: 'SmartSummary', headline: 'Fotoğrafını çek', narration: `Takıldığın sorunun fotoğrafını çek. ${moduleCopy('smartSummary').tool}`},
		{screen: 'SinoAi', headline: 'SinoAI’ye sor', narration: `${moduleCopy('sinoAi').invite} ${moduleCopy('sinoAi').tool}`},
	],
	closing: {
		title: 'Ölç, öğren, geliş.',
		narration: 'Ölç, öğren, geliş. Sınavika’yı hemen indir.',
	},
};
