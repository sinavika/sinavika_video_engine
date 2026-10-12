import type {z} from 'zod';
import type {QuestionSolutionSchema} from './QuestionSolutionSchema';

export const QUESTION_SOLUTION_SAMPLE: z.input<typeof QuestionSolutionSchema> = {
	title: 'Birinci Dereceden Denklem',
	subject: 'Matematik',
	source: 'TYT Temel Matematik',
	question: {
		text: '$3(x - 2) + 4 = 2x + 7$ denklemini sağlayan $x$ değeri kaçtır?',
		options: ['$7$', '$8$', '$9$', '$10$', '$11$'],
		narration: 'Üç çarpı parantez içinde x eksi iki, artı dört; eşittir iki x artı yedi. Bu denklemde x kaçtır?',
	},
	steps: [
		{
			title: 'Parantezi açalım',
			content: 'Dağılma özelliğiyle $3$ sayısını parantezin içindeki her terimle çarpıyoruz.',
			formula: '3x - 6 + 4 = 2x + 7',
			narration:
				'İlk işimiz parantezi açmak. Üçü, içerideki her terimle çarpıyoruz: üç x eksi altı. Denklem şimdi çok daha sade!',
		},
		{
			title: 'Sabit terimleri birleştirelim',
			content: 'Sol taraftaki $-6$ ve $+4$ sayılarını topluyoruz.',
			formula: '3x - 2 = 2x + 7',
			narration: 'Şimdi sabit terimleri birleştirelim. Eksi altı ile artı dört, eksi iki eder.',
		},
		{
			title: 'Bilinmeyenleri bir tarafa toplayalım',
			content:
				'$2x$ terimini sola, $-2$ sayısını sağa geçiriyoruz. **Taraf değiştiren terimin işareti değişir.**',
			formula: '3x - 2x = 7 + 2',
			hint: 'İşaret hatası bu soru tipinde en sık yapılan hatadır.',
			narration:
				'Sıra bilinmeyenleri bir tarafa toplamakta. İki x sola, eksi iki sağa geçiyor. Burası kritik: taraf değiştiren terimin işareti değişir!',
		},
		{
			title: 'Sonucu bulalım',
			content: 'Benzer terimleri sadeleştirince bilinmeyeni yalnız bırakmış oluyoruz.',
			formula: 'x = 9',
			narration: 'Ve son adım! Üç x eksi iki x, x eder. Yedi artı iki de dokuz. Yani x eşittir dokuz!',
		},
	],
	answer: {
		text: '$x = 9$',
		correctOptionIndex: 2,
		explanation: 'Sağlama: $3(9 - 2) + 4 = 25$ ve $2 \\cdot 9 + 7 = 25$. İki taraf eşit.',
	},
	tip: 'Bulduğun değeri denklemde yerine koyarak sonucu **mutlaka** doğrula.',
	script: {
		answer: 'Doğru cevap C şıkkı: dokuz. Sağlamasını yapalım: iki taraf da yirmi beş ediyor. Tam isabet!',
	},
};
