import type {z} from 'zod';
import type {ExamPreparationSchema} from './ExamPreparationSchema';

export const EXAM_PREPARATION_SAMPLE: z.input<typeof ExamPreparationSchema> = {
	title: "TYT'de Süreyi Doğru Kullan",
	exam: {
		name: 'TYT',
		description: 'Temel Yeterlilik Testi: tek oturum, dört test',
		stats: [
			{value: '120', label: 'soru'},
			{value: '165 dk', label: 'toplam süre'},
			{value: '4', label: 'test'},
			{value: '82 sn', label: 'soru başına'},
		],
	},
	strategies: [
		{
			title: 'Turlama tekniği',
			detail: 'İlk turda **emin olduğun** soruları çöz; takıldıklarını işaretleyip geç.',
		},
		{
			title: 'Güçlü dersinle başla',
			detail: 'İlk dakikalarda kazanılan netler hem özgüveni hem tempoyu artırır.',
		},
		{
			title: 'Şıkları ele',
			detail: 'Yanlış olduğundan emin olduğun seçenekleri çizerek olasılığı daralt.',
		},
	],
	timePlan: {
		totalMinutes: 165,
		segments: [
			{label: 'Türkçe', minutes: 45},
			{label: 'Sosyal Bilimler', minutes: 20},
			{label: 'Temel Matematik', minutes: 60},
			{label: 'Fen Bilimleri', minutes: 25},
			{label: 'Kontrol ve kodlama', minutes: 15},
		],
		note: 'Bu dağılım bir **öneridir**; deneme sınavlarında kendi temponu ölç.',
	},
	mistakes: [
		{wrong: 'Tek bir soruda 5 dakika harcamak', right: '2 dakikayı geçen soruyu işaretleyip geçmek'},
		{wrong: 'Kodlamayı son dakikaya bırakmak', right: 'Her testin sonunda optik forma işlemek'},
		{wrong: 'Emin olmadan rastgele işaretlemek', right: '4 yanlışın 1 doğruyu götürdüğünü unutmamak'},
	],
	tips: [
		'Sınavdan önceki gece **en az 7 saat** uyu',
		'Soru kökündeki **olumsuz ifadelerin** altını çiz',
		'Her 20 soruda bir saatini kontrol et',
		'Boş bıraktığın sorularda optik formu kaydırma',
	],
	motivation: {quote: 'Bugün çözdüğün her soru, sınav günü kazandığın bir dakikadır.'},
};
