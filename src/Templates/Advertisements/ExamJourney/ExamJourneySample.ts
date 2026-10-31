import type {z} from 'zod';
import type {ExamJourneySchema} from './ExamJourneySchema';

/**
 * Everything shown is something the app does: solving a mock exam and seeing
 * the results. The numbers are example data, the same as on the app screens.
 */
export const EXAM_JOURNEY_SAMPLE: z.input<typeof ExamJourneySchema> = {
	start: {exam: 'TYT Denemesi', minutes: 120, headline: 'Süre başladı.', narration: 'Süre başladı.'},
	solve: {
		context: 'Temel Matematik · Soru 12',
		question: '3(x − 2) + 4 = 2x + 7 denklemini sağlayan x değeri kaçtır?',
		options: ['7', '8', '9', '10', '11'],
		pick: 2,
		headline: 'Denemeni çöz.',
		narration: 'Sınavika’da denemeni çöz.',
	},
	result: {caption: 'Net trendi', trend: [52, 58, 55, 66, 71, 70, 78.5], headline: 'Sonucunu gör.', narration: 'Bitince sonucunu gör.'},
	gaps: {
		lessons: [
			{name: 'Türkçe', level: 0.82},
			{name: 'Matematik', level: 0.64},
			{name: 'Fen', level: 0.55},
			{name: 'Sosyal', level: 0.74},
		],
		tag: 'Buraya odaklan',
		headline: 'Eksiğini fark et.',
		narration: 'Hangi derste eksiğin var, hemen fark et.',
	},
	product: {screen: 'ExamHome', headline: 'Hepsi tek uygulamada.', narration: 'Hepsi tek uygulamada.'},
};
