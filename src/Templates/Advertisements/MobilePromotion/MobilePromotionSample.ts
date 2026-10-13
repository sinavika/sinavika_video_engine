import type {z} from 'zod';
import type {MobilePromotionSchema} from './MobilePromotionSchema';

/** Every claim here is taken from the app itself or from sinavika.com: solving mock exams and seeing the results. */
export const MOBILE_PROMOTION_SAMPLE: z.input<typeof MobilePromotionSchema> = {
	question: {
		text: 'Sınava nasıl hazırlanıyorsun?',
		emphasis: 'nasıl',
		narration: 'Sınava nasıl hazırlanıyorsun?',
	},
	steps: [
		{screen: 'Exam', headline: 'Denemeni çöz.', narration: 'Sınavika ile denemeni çöz.', focus: {top: 0.17, height: 0.13}},
		{screen: 'Analysis', headline: 'Sonucunu gör.', narration: 'Sonuçlarını gör, eksiklerini fark et.', focus: {top: 0.125, height: 0.3}},
	],
	together: {headline: 'Hazırlığın tek uygulamada.', narration: 'Hazırlığını tek uygulamada sürdür.'},
	action: {screen: 'ExamHome', headline: 'Hedefine yaklaş.', button: 'Sınavika’yı keşfet', narration: 'Sınavika ile hedefine yaklaş.'},
	closing: {narration: 'Sınavika’yı keşfet.'},
};
