import type {z} from 'zod';
import type {ConceptExplanationSchema} from './ConceptExplanationSchema';

export const CONCEPT_EXPLANATION_SAMPLE: z.input<typeof ConceptExplanationSchema> = {
	concept: 'Su Döngüsü',
	subject: 'Fen Bilimleri',
	definition: 'Suyun yeryüzü ile atmosfer arasında **hâl değiştirerek** sürekli dolaşmasıdır.',
	visual: {
		kind: 'cycle',
		center: 'Su',
		nodes: [
			{label: 'Buharlaşma', detail: 'sıvı → gaz'},
			{label: 'Yoğuşma', detail: 'gaz → sıvı'},
			{label: 'Yağış', detail: 'yağmur, kar, dolu'},
			{label: 'Toplanma', detail: 'deniz, göl, yer altı'},
		],
	},
	steps: [
		{
			title: 'Buharlaşma',
			caption: 'Güneş, deniz ve göllerdeki suyu ısıtır; su **buhar** olup yükselir.',
			focus: [0],
		},
		{
			title: 'Yoğuşma',
			caption: 'Yükselen buhar soğur ve küçük damlacıklara dönüşerek **bulutları** oluşturur.',
			focus: [1],
		},
		{
			title: 'Yağış',
			caption: 'Damlacıklar ağırlaşınca yağmur, kar ya da dolu olarak yeryüzüne düşer.',
			focus: [2],
		},
		{
			title: 'Toplanma',
			caption: 'Su, akarsularla denizlere ulaşır ya da toprağa sızar. Döngü **yeniden** başlar.',
			focus: [3, 0],
		},
	],
	relatedConcepts: [
		{name: 'Hâl Değişimi', relation: 'ısı alışverişi'},
		{name: 'İklim', relation: 'yağış rejimi'},
		{name: 'Yer Altı Suları', relation: 'sızma'},
		{name: 'Enerji', relation: 'kaynağı Güneş'},
	],
	example: {
		title: 'Günlük hayattan',
		text: 'Soğuk bir bardağın dış yüzeyinde su damlaları oluşur. Havadaki su buharı soğuk yüzeye değince **yoğuşur**.',
		result: 'Bulutların oluşumu da aynı olayın büyük ölçekli hâlidir.',
	},
	keyTakeaway: 'Su döngüsünde su **yok olmaz**; yalnızca hâl ve yer değiştirir.',
};
