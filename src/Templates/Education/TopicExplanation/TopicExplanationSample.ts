import type {z} from 'zod';
import type {TopicExplanationSchema} from './TopicExplanationSchema';

export const TOPIC_EXPLANATION_SAMPLE: z.input<typeof TopicExplanationSchema> = {
	title: 'Üslü Sayılar',
	subject: 'Matematik',
	subtitle: 'Tanım, temel kurallar ve negatif üs',
	sections: [
		{
			heading: 'Üslü sayı nedir?',
			narration:
				'Üslü sayı nedir? Bir sayıyı kendisiyle tekrar tekrar çarpmanın kısa yoludur. A üssü n yazdığımızda a tabandır, n ise üs. Yani a sayısını n kez çarpıyoruz.',
			blocks: [
				{
					kind: 'definition',
					term: 'Üslü sayı',
					text: 'Bir sayının kendisiyle tekrarlı çarpımının kısa gösterimidir. $a^n$ ifadesinde $a$ **taban**, $n$ **üs** olarak adlandırılır.',
				},
				{
					kind: 'formula',
					latex: 'a^n = \\underbrace{a \\cdot a \\cdot \\ldots \\cdot a}_{n \\text{ tane}}',
					caption: 'n bir pozitif tam sayıdır',
				},
			],
		},
		{
			heading: 'Temel kurallar',
			narration:
				'Şimdi dört altın kural! Çarpmada üsler toplanır. Bölmede üsler çıkarılır. Üssün üssü alınırken üsler çarpılır. Ve sıfırdan farklı her sayının sıfırıncı kuvveti bire eşittir.',
			blocks: [
				{
					kind: 'bullets',
					items: [
						'Çarpma: $a^m \\cdot a^n = a^{m+n}$',
						'Bölme: $\\dfrac{a^m}{a^n} = a^{m-n}$',
						'Üssün üssü: $(a^m)^n = a^{m \\cdot n}$',
						'Sıfırıncı kuvvet: $a^0 = 1$, $a \\neq 0$',
					],
				},
			],
		},
		{
			heading: 'Örnek üzerinde görelim',
			narration:
				'Bir örnekle görelim. İki üssü beş çarpı iki üssü üç, bölü iki üssü altı kaçtır? Tabanlar aynı; üsleri topla, çıkar: beş artı üç eksi altı, iki eder. İki üssü iki de dört! Gördün mü, sadece üslerle işlem yaptık.',
			blocks: [
				{
					kind: 'example',
					title: 'Sadeleştirme',
					text: '$\\dfrac{2^5 \\cdot 2^3}{2^6}$ ifadesinin değeri kaçtır?',
					solution: '$2^{5+3-6} = 2^2 = 4$',
				},
				{
					kind: 'paragraph',
					text: 'Tabanlar aynı olduğunda üsler üzerinde **toplama ve çıkarma** yapmak yeterlidir.',
				},
			],
		},
		{
			heading: 'Negatif üs',
			narration:
				'Peki üs negatifse? Hiç korkma: negatif üs, sayıyı paydaya taşır. İki üssü eksi üç, bir bölü iki üssü üç demektir. O da bir bölü sekiz eder.',
			blocks: [
				{kind: 'formula', latex: 'a^{-n} = \\dfrac{1}{a^n}', caption: 'Negatif üs, sayıyı paydaya taşır'},
				{
					kind: 'visual',
					visual: {
						kind: 'flow',
						nodes: [
							{label: '$2^{-3}$', detail: 'negatif üs'},
							{label: '$\\dfrac{1}{2^3}$', detail: 'paydaya geç'},
							{label: '$\\dfrac{1}{8}$', detail: 'sonuç'},
						],
					},
				},
			],
		},
	],
	summary: {
		points: [
			'$a^n$, tabanın $n$ kez çarpımıdır',
			'Çarpmada üsler **toplanır**, bölmede **çıkarılır**',
			'$a^0 = 1$ ve $a^{-n} = \\dfrac{1}{a^n}$',
			'Kurallar yalnızca **tabanlar aynıyken** uygulanır',
		],
	},
	script: {
		summary:
			'Hadi, özetleyelim. Üslü sayı, tabanın tekrarlı çarpımıdır. Çarpmada üsler toplanır, bölmede çıkarılır. Sıfırıncı kuvvet bire eşittir, negatif üs ise sayıyı paydaya taşır. Ve en önemlisi: bu kurallar yalnızca tabanlar aynıyken geçerli!',
	},
};
