import type {z} from 'zod';
import type {QuickRevisionSchema} from './QuickRevisionSchema';

export const QUICK_REVISION_SAMPLE: z.input<typeof QuickRevisionSchema> = {
	title: "Newton'ın Hareket Yasaları",
	subject: 'Fizik',
	exams: ['YKS'],
	cards: [
		{
			kind: 'term',
			term: 'Eylemsizlik',
			definition: 'Net kuvvet sıfırsa cisim durumunu korur: ya durur ya da **sabit hızla** gider.',
		},
		{
			kind: 'formula',
			title: 'Temel Yasa',
			latex: '\\vec{F}_{net} = m \\cdot \\vec{a}',
			note: 'Kuvvet newton, kütle kilogram, ivme $m/s^2$',
			narration: 'Temel yasa: net kuvvet eşittir kütle çarpı ivme.',
		},
		{kind: 'fact', text: 'İvme her zaman net kuvvetle **aynı yöndedir**.'},
		{
			kind: 'term',
			term: 'Etki – Tepki',
			definition: 'Kuvvetler çift hâlinde doğar: **eşit büyüklükte** ve zıt yönde.',
		},
		{kind: 'warning', text: 'Etki ve tepki **farklı cisimlere** uygulanır; birbirini götürmez!'},
		{
			kind: 'formula',
			title: 'Ağırlık',
			latex: 'G = m \\cdot g',
			note: '$g \\approx 10 \\; m/s^2$ alınır',
			narration: 'Ağırlık: kütle çarpı yer çekimi ivmesi. Yer çekimi ivmesini yaklaşık on alıyoruz.',
		},
	],
	summary: ['1. yasa: Eylemsizlik', '2. yasa: $F = m \\cdot a$', '3. yasa: Etki = Tepki'],
	script: {
		recap: 'Üç yasa, üç cümle: Eylemsizlik. Kuvvet eşittir kütle çarpı ivme. Ve her etkiye eşit bir tepki!',
	},
};
