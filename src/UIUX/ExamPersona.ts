import {useExam, type UIExam} from './Context';

/**
 * Exam-bound sample data of the drawings, one entry per exam persona
 * (yks and kpss in Turkish, sat and act in English). Ads may only show their
 * own exam (Sosyal Medya, 20 Nov 2026): a KPSS screen never says TYT, an ACT
 * screen never says SAT. Layouts stay the same; only these values change.
 *
 * Numbers are sample values that add up: YKS and KPSS nets (4 wrong cancel
 * 1 right), SAT section scores 200–800 (total 400–1600), ACT scores 1–36
 * (composite = mean of English, Math and Reading).
 */

type Lesson = {name: string; score: number; total: number; color: string};
type Topic = {name: string; sub: string; loss: string; quiz: number};

export type ExamPersona = {
	/** Practice exam names (newest first). */
	practice: [string, string];
	/** Results: the chart title, its two tabs, bars, axis maximum and the progress strip. */
	trend: {title: string; tabs: [string, string]; bars: [string, number, boolean?][]; max: number; gain: string};
	/** Latest results: name, date · rank, score, change. */
	latest: [string, string, string, string][];
	/** One result: the ring value, its label, change, score and rank lines, subjects, costliest topics. */
	result: {meta: string; ring: number; value: string; unit: string; gain: string; score: [string, string]; rank: [string, string]; lessons: Lesson[]; costly: string};
	/** Gap analysis: three topics, the loss suffix and the gain line. */
	analysis: {topics: Topic[]; gain: string};
	/** One exam's score by subject: page title, header labels, rows (right, wrong, blank, score), total, costly topics. */
	net: {title: string; heads: [string, string, string, string]; rows: [string, number, number, number, string][]; total: [string, string, string]; costly: [string, string][]};
	/** A past month: rows (name, kind, score or null), summary, the score's unit. */
	month: {rows: [string, string, string | null][]; summary: string; unit: string};
	/** Ders Planı · Bugün: lesson, quiz, cards, exam and own task. */
	plan: {lesson: [string, string, string]; quiz: [string, string, string]; cards: [string, string, string]; exam: [string, string]; own: string};
	/** Sınav takvimi: official dates (name, date, days left) and this month's Sınavika exams. */
	calendar: {rows: [string, string, string][]; month: [[string, string], [string, string]]};
	/** Bilgi Kartları: subject · topic, question, answer, explanation. */
	card: {meta: string; question: string; answer: string; text: string};
	/** Akıllı Özet and SinoAI: one photographed question. */
	/** Dersler: the sample steps (fill the gap, true or false, order, exam-style question). */
	steps: {
		fill: {kind: string; title: string; before: string; word: string; after: string; chips: [string, string, string]; right: string; why: string; review: string};
		trueFalse: {kind: string; title: string; claim: string; yes: string; no: string; verdict: string; why: string};
		order: {kind: string; title: string; hint: string; items: [string, string, number?][]};
		question: {stem: string; options: string[]; hint: string};
		buttons: {next: string; restart: string; ask: string};
	};
	problem: {title: string; chip: string; answer: string; steps: [string, string][]; skill: string; mistake: string; lesson: string; photo: string; options: string; noteLines: [string, string]; noteChoices: [string, string, string]; ask: string; reply: string; formula: string; close: string};
};

const LESSON_COLORS = ['#0284C7', '#0D9488', '#4F46E5', '#DB2777', '#7C3AED'];
const lessons = (rows: [string, number, number][]): Lesson[] => rows.map(([name, score, total], index) => ({name, score, total, color: LESSON_COLORS[index % LESSON_COLORS.length]}));

export const EXAM_PERSONA: Record<UIExam, ExamPersona> = {
	yks: {
		practice: ['TYT Deneme 5', 'TYT Deneme 4'],
		trend: {title: 'TYT net gelişimim', tabs: ['TYT', 'AYT'], bars: [['28 Eyl', 64], ['5 Eki', 72], ['12 Eki', 78.5], ['19 Eki', 84.25], ['Dışarıda', 69.5, true]], max: 120, gain: 'Son 4 denemede +20,25 net'},
		latest: [
			['TYT Deneme 5', '19 Ekim · sıralama 6.870', '84,25', '+5,75'],
			['TYT Deneme 4', '12 Ekim · sıralama 8.214', '78,5', '+9'],
		],
		result: {meta: '12 Ekim · Türkiye geneli · 12.480 katılımcı', ring: 78.5 / 120, value: '78,5', unit: 'net', gain: '+6,5 net', score: ['TYT puanın', '362,4'], rank: ['Sıralaman', '8.214 / 12.480'], lessons: lessons([['Türkçe', 32.5, 40], ['Sosyal', 14.25, 20], ['Matematik', 21.75, 40], ['Fen', 10, 20]]), costly: 'Problemler, Paragraf, Kuvvet ve hareket'},
		analysis: {
			topics: [
				{name: 'Problemler', sub: 'Matematik · yüzde ve oran', loss: '−3,25 net', quiz: 20},
				{name: 'Paragraf', sub: 'Türkçe · ana fikir', loss: '−2,5 net', quiz: 12},
				{name: 'Kuvvet ve hareket', sub: 'Fizik · Newton yasaları', loss: '−1,75 net', quiz: 0},
			],
			gain: 'Bu 3 konuyu bu hafta çalışırsan yaklaşık 5 net kazanabilirsin.',
		},
		net: {
			title: 'Deneme neti',
			heads: ['D', 'Y', 'B', 'Net'],
			rows: [
				['Türkçe', 34, 4, 2, '33'],
				['Sosyal Bilimler', 15, 3, 2, '14,25'],
				['Temel Matematik', 24, 8, 8, '22'],
				['Fen Bilimleri', 11, 4, 5, '10'],
			],
			total: ['TYT Deneme 4 · toplam net', '79,25', '+6,75 net'],
			costly: [
				['Problemler', 'D/Y/B 3/3/2 · −3,75 net'],
				['Paragrafta yapı', 'D/Y/B 4/2/0 · −2,5 net'],
			],
		},
		month: {
			rows: [
				['TYT Genel Deneme', 'Genel deneme · 120 soru', '78,5'],
				['TYT Temel Matematik', 'Bölüm denemesi · 40 soru', '21,75'],
				['TYT Türkçe', 'Bölüm denemesi · 40 soru', '32,5'],
				['TYT Fen Bilimleri', 'Bölüm denemesi · 20 soru', null],
			],
			summary: '3 / 4 deneme · ortalama 44,25 net',
			unit: 'net',
		},
		plan: {lesson: ['TYT Türkçe · Dersler', 'Sözcükte Anlam', 'Kaldığın yerden · 8 dk'], quiz: ['TYT Matematik · denemende net kaybettin', 'Problemler · Orta', '20 soru · 25 dk'], cards: ['TYT Kimya · Bilgi Kartları', 'Mol kavramı', '20 kart · 10 dk'], exam: ['TYT Deneme 5', '10:00 – 12:45'], own: 'Paragraf kitabı · 2 test'},
		calendar: {rows: [['YKS · TYT', 'Haziran 2027 · Cumartesi', '245'], ['YKS · AYT', 'Haziran 2027 · Pazar', '246']], month: [['TYT Deneme 5', 'Cumartesi 10:00 · Türkiye geneli'], ['AYT Sayısal Deneme 3', 'Pazar 10:00 · Türkiye geneli']]},
		card: {meta: 'Kimya · Mol', question: '1 mol nedir?', answer: '6,02 × 10²³ tanecik', text: 'Avogadro sayısı kadar atom, molekül ya da iyon içeren madde miktarı.'},
		steps: {
			fill: {kind: 'Boşluk doldur', title: 'Cümleyi mecaz anlamla tamamla', before: 'Arkadaşının söylediği sözler ona çok ', word: 'ağır', after: ' geldi; o gün kimseyle konuşmadı.', chips: ['hafif', 'ağır', 'tatlı'], right: 'Doğrusu: ağır', why: 'Sözler tartıyla ölçülmez. **Ağır** burada "kırıcı, üzücü" anlamında; kimseyle konuşmadığına göre sözler onu üzmüş.', review: 'Bu adım tekrar listene eklendi; yarın yeniden gelecek.'},
			trueFalse: {kind: 'Sık yapılan hata', title: 'Bu ifade doğru mu?', claim: '"Somut bir sözcük her zaman gerçek anlamlıdır."', yes: 'Doğru', no: 'Yanlış', verdict: 'Doğru, bu ifade yanlış', why: 'Somut sözcükler de mecaz anlam kazanabilir: **sıcak** bir karşılama, **tatlı** bir söz. Karşılamanın sıcaklığı termometreyle ölçülmez.'},
			order: {kind: 'Sözcüğün bağlamdaki anlamı', title: 'Bağlam sorusunu çözerken hangi sırayla ilerlersin?', hint: 'Basılı tutup sürükle ya da adımlara sırayla dokun.', items: [['Şıklarda dene', 'aynı karşılık oturuyor mu'], ['Sözcüğü cümlede bul', 'çevresini oku', 1], ['Tek uyanı seç', 'çeldiriciye dikkat'], ['Yerine bir karşılık koy', '"kiralamak" gibi', 2]]},
			question: {stem: 'Aşağıdaki cümlelerin hangisinde **ağır** sözcüğü mecaz anlamda kullanılmıştır?', options: ['Ağır bavulu tek başına merdivenlerden çıkaramadı.', 'Arkadaşının söylediği sözler ona çok ağır geldi.', 'Kamyon, ağır yükü yüzünden yokuşu zor çıktı.', 'Demir, aynı büyüklükteki tahtadan daha ağırdır.', 'Bahçedeki ağır taşı iki kişi kenara çekti.'], hint: 'Her seçenekte sor: **ağır** burada tartıyla ölçülebilen bir ağırlık mı?'},
			buttons: {next: 'Devam', restart: 'Baştan diz', ask: 'SinoAI’ye sor'},
		},
		problem: {
			title: 'Türev · Zincir kuralı',
			chip: 'AYT Matematik',
			answer: 'Cevap: B',
			steps: [
				['Zincir kuralını uygula', "f'(x) = 4(3x² − 2)³ · 6x"],
				['İçi hesapla (x = 1)', '3 · 1² − 2 = 1'],
				['Yerine koy', "f'(1) = 4 · 1³ · 6 = 24"],
			],
			skill: 'İç içe fonksiyonda türev: dıştakinin türevi × içtekinin türevi. AYT’de her yıl 1–2 soru.',
			mistake: 'İçteki fonksiyonun türevini (6x) çarpmayı unutmak.',
			lesson: 'Dersler · Türev',
			photo: "14. f(x) = (3x² − 2)⁴ için f'(1) kaçtır?",
			options: 'A) 12 · B) 24 · C) 36 · D) 48 · E) 60',
			noteLines: ['f(x) = (3x² − 2)⁴', "ise f'(1) kaçtır?"],
			noteChoices: ['A) 12', 'B) 24', 'C) 48'],
			ask: 'Bu soruda neden 6x ile çarpıyoruz?',
			reply: 'Fonksiyon iç içe: dışta ( )⁴, içte 3x² − 2 var. Zincir kuralında dıştakinin türevini alıp içtekinin türeviyle çarparız.',
			formula: "f'(x) = 4(3x² − 2)³ · 6x",
			close: 'x = 1 için içerisi 1 olur, sonuç 24. Bu konu son denemende 1 net kaybettirdi.',
		},
	},
	kpss: {
		practice: ['KPSS GY-GK Deneme 5', 'KPSS GY-GK Deneme 4'],
		trend: {title: 'KPSS net gelişimim', tabs: ['GY', 'GK'], bars: [['28 Eyl', 68], ['5 Eki', 74], ['12 Eki', 79.5], ['19 Eki', 85.25], ['Dışarıda', 72.5, true]], max: 120, gain: 'Son 4 denemede +17,25 net'},
		latest: [
			['KPSS GY-GK Deneme 5', '19 Ekim · sıralama 4.105', '85,25', '+5,75'],
			['KPSS GY-GK Deneme 4', '12 Ekim · sıralama 5.630', '79,5', '+5,5'],
		],
		result: {meta: '12 Ekim · Türkiye geneli · 9.860 katılımcı', ring: 83 / 120, value: '83', unit: 'net', gain: '+5,5 net', score: ['KPSS P3 puanın', '82,46'], rank: ['Sıralaman', '5.630 / 9.860'], lessons: lessons([['Türkçe', 24.5, 30], ['Matematik', 17.25, 30], ['Tarih', 19, 27], ['Coğrafya', 12.5, 18], ['Vatandaşlık · Güncel', 9.75, 15]]), costly: 'Problemler, Osmanlı kültür ve medeniyeti, Türkiye’nin iklimi'},
		analysis: {
			topics: [
				{name: 'Problemler', sub: 'Matematik · sayı ve kesir', loss: '−3,25 net', quiz: 20},
				{name: 'İslamiyet öncesi Türk tarihi', sub: 'Tarih · devlet yönetimi', loss: '−2,5 net', quiz: 12},
				{name: 'Temel hak ve ödevler', sub: 'Vatandaşlık · Anayasa', loss: '−1,75 net', quiz: 0},
			],
			gain: 'Bu 3 konuyu bu hafta çalışırsan yaklaşık 5 net kazanabilirsin.',
		},
		net: {
			title: 'Deneme neti',
			heads: ['D', 'Y', 'B', 'Net'],
			rows: [
				['Türkçe', 26, 3, 1, '25,25'],
				['Matematik', 19, 7, 4, '17,25'],
				['Tarih', 20, 4, 3, '19'],
				['Coğrafya', 13, 2, 3, '12,5'],
			],
			total: ['KPSS GY-GK Deneme 4 · toplam net', '83', '+5,5 net'],
			costly: [
				['Problemler', 'D/Y/B 3/3/2 · −3,75 net'],
				['Osmanlı kültür ve medeniyeti', 'D/Y/B 4/2/1 · −2,5 net'],
			],
		},
		month: {
			rows: [
				['KPSS GY-GK Genel Deneme', 'Genel deneme · 120 soru', '81,5'],
				['KPSS Genel Yetenek', 'Bölüm denemesi · 60 soru', '41,25'],
				['KPSS Genel Kültür', 'Bölüm denemesi · 60 soru', '38'],
				['KPSS Tarih', 'Branş denemesi · 27 soru', null],
			],
			summary: '3 / 4 deneme · ortalama 53,58 net',
			unit: 'net',
		},
		plan: {lesson: ['KPSS Türkçe · Dersler', 'Sözcükte Anlam', 'Kaldığın yerden · 8 dk'], quiz: ['KPSS Matematik · denemende net kaybettin', 'Problemler · Orta', '20 soru · 25 dk'], cards: ['KPSS Vatandaşlık · Bilgi Kartları', 'Anayasa', '20 kart · 10 dk'], exam: ['KPSS GY-GK Deneme 5', '10:00 – 12:10'], own: 'Tarih kitabı · 2 test'},
		calendar: {rows: [['KPSS Lisans · GY-GK', 'Temmuz 2027 · Pazar', '280']], month: [['KPSS GY-GK Deneme 5', 'Cumartesi 10:00 · Türkiye geneli'], ['KPSS Genel Kültür Deneme 3', 'Pazartesi 14:00']]},
		card: {meta: 'Vatandaşlık · Anayasa', question: 'TBMM kaç milletvekilinden oluşur?', answer: '600 milletvekili', text: '2017 Anayasa değişikliğiyle 550’den 600’e çıkarıldı.'},
		steps: {
			fill: {kind: 'Boşluk doldur', title: 'Cümleyi doğru kavramla tamamla', before: 'Anayasa’ya göre yasama yetkisi Türk Milleti adına ', word: 'TBMM', after: '’nindir; bu yetki devredilemez.', chips: ['Cumhurbaşkanı', 'TBMM', 'Danıştay'], right: 'Doğrusu: TBMM', why: 'Anayasa’nın 7. maddesi: **yasama** yetkisi TBMM’nindir. **Yürütme** Cumhurbaşkanına, **yargı** bağımsız mahkemelere aittir.', review: 'Bu adım tekrar listene eklendi; yarın yeniden gelecek.'},
			trueFalse: {kind: 'Sık yapılan hata', title: 'Bu ifade doğru mu?', claim: '"Kut anlayışına göre hükümdarlık yetkisi halkın seçimiyle verilir."', yes: 'Doğru', no: 'Yanlış', verdict: 'Doğru, bu ifade yanlış', why: 'Kut anlayışında hükümdarlık yetkisi **Tanrı tarafından verilir**. Yetki hanedan içinde geçer; kut kaybedilirse hükümdarlık da sarsılır.'},
			order: {kind: 'İslamiyet öncesi Türk tarihi', title: 'Bu Türk devletlerini kuruluş sırasına diz', hint: 'Basılı tutup sürükle ya da devletlere sırayla dokun.', items: [['Uygur Devleti', 'yerleşik hayata geçti'], ['Asya Hun Devleti', 'Mete Han', 1], ['Karahanlılar', 'ilk Müslüman Türk devletlerinden'], ['I. Göktürk Devleti', 'Bumin Kağan', 2]]},
			question: {stem: 'Anayasa’ya göre **Türkiye Büyük Millet Meclisi** kaç milletvekilinden oluşur?', options: ['450', '500', '550', '600', '650'], hint: '2017 Anayasa değişikliği milletvekili sayısını **değiştirdi**. Seçtiğin sayı değişiklikten önceki mi?'},
			buttons: {next: 'Devam', restart: 'Baştan diz', ask: 'SinoAI’ye sor'},
		},
		problem: {
			title: 'Yüzde problemleri',
			chip: 'KPSS Matematik',
			answer: 'Cevap: C',
			steps: [
				['Zammı uygula', '100 · 1,2 = 120'],
				['İndirimi uygula', '120 · 0,8 = 96'],
				['İlk fiyatla karşılaştır', '96 / 100 = %96'],
			],
			skill: 'Art arda yüzde değişimi: çarpanlar çarpılır (1,2 · 0,8 = 0,96). Yüzde ve oran problemleri KPSS matematiğinin temel konusudur.',
			mistake: '%20 zam ile %20 indirimin birbirini götürdüğünü sanmak.',
			lesson: 'Dersler · Yüzde problemleri',
			photo: '14. Bir ürüne önce %20 zam, sonra %20 indirim yapılıyor. Son fiyat ilk fiyatın yüzde kaçıdır?',
			options: 'A) 90 · B) 94 · C) 96 · D) 100 · E) 104',
			noteLines: ['%20 zam, sonra %20 indirim:', 'son fiyat yüzde kaç?'],
			noteChoices: ['A) 94', 'B) 96', 'C) 100'],
			ask: 'Zam ve indirim aynıysa fiyat neden değişiyor?',
			reply: 'İndirim, zamlı fiyat üzerinden yapılır. 100 lira önce 120 olur; 120’nin %20’si 24 olduğu için indirim zamdan büyüktür.',
			formula: '100 · 1,2 · 0,8 = 96',
			close: 'Son fiyat ilk fiyatın %96’sı. Bu konu son denemende 1 net kaybettirdi.',
		},
	},
	sat: {
		practice: ['SAT Practice Test 5', 'SAT Practice Test 4'],
		trend: {title: 'My SAT scores', tabs: ['Total', 'Math'], bars: [['28 Sep', 1180], ['5 Oct', 1220], ['12 Oct', 1290], ['19 Oct', 1360], ['Elsewhere', 1250, true]], max: 1600, gain: '+180 over the last 4'},
		latest: [
			['SAT Practice Test 5', '19 Oct · 91st percentile', '1,360', '+70'],
			['SAT Practice Test 4', '12 Oct · 86th percentile', '1,290', '+70'],
		],
		result: {meta: '12 Oct · full practice test · 98 questions', ring: 1290 / 1600, value: '1,290', unit: 'total', gain: '+70', score: ['Total score', '1,290 / 1,600'], rank: ['Percentile', '86th'], lessons: lessons([['Reading & Writing', 640, 800], ['Math', 650, 800]]), costly: 'Linear equations, Transitions, Data analysis'},
		analysis: {
			topics: [
				{name: 'Linear equations', sub: 'Math · one variable', loss: '−3 questions', quiz: 20},
				{name: 'Transitions', sub: 'Reading & Writing · logic', loss: '−2 questions', quiz: 12},
				{name: 'Data analysis', sub: 'Math · tables and graphs', loss: '−2 questions', quiz: 0},
			],
			gain: 'Study these 3 this week and win back about 50 points.',
		},
		net: {
			title: 'Practice test score',
			heads: ['C', 'W', 'B', 'Score'],
			rows: [
				['Reading & Writing', 46, 6, 2, '640'],
				['Math', 37, 5, 2, '650'],
			],
			total: ['SAT Practice Test 4 · total score', '1,290', '+70'],
			costly: [
				['Linear equations', 'Math · 3 wrong · 1 blank'],
				['Transitions', 'Reading & Writing · 3 wrong'],
			],
		},
		month: {
			rows: [
				['SAT Practice Test 4', 'Full test · 98 questions', '1,290'],
				['SAT Math', 'Section · 44 questions', '650'],
				['SAT Reading & Writing', 'Section · 54 questions', '640'],
				['SAT Practice Test 5', 'Full test · 98 questions', null],
			],
			summary: '3 / 4 tests · best total 1,290',
			unit: 'score',
		},
		plan: {lesson: ['SAT Reading & Writing · Lessons', 'Words in context', 'From where you left off · 8 min'], quiz: ['SAT Math · you lost points here', 'Linear equations · Medium', '20 questions · 25 min'], cards: ['SAT Vocabulary · Flashcards', 'Academic words', '20 cards · 10 min'], exam: ['SAT Practice Test 5', '09:00 – 11:14'], own: 'Prep book · 2 sections'},
		calendar: {rows: [['SAT · March', 'March 13, 2027 · Saturday', '112'], ['SAT · May', 'May 1, 2027 · Saturday', '161']], month: [['SAT Practice Test 5', 'Saturday 10:00 · full test'], ['SAT Math Section 3', 'Monday 18:00']]},
		card: {meta: 'Reading & Writing · Vocabulary', question: 'What does “ubiquitous” mean?', answer: 'Found everywhere', text: 'Smartphones have become ubiquitous in daily life.'},
		steps: {
			fill: {kind: 'Fill the gap', title: 'Complete the sentence with the right transition', before: 'The first trial showed no effect; ', word: 'however', after: ', the second trial, with a larger sample, did.', chips: ['therefore', 'however', 'similarly'], right: 'Correct answer: however', why: 'The two trials **contrast**: no effect, then an effect. **However** signals that contrast; similarly would mean they agree.', review: 'This step is in your review list; it comes back tomorrow.'},
			trueFalse: {kind: 'Common mistake', title: 'Is this statement true?', claim: '"A semicolon can join a complete sentence and a fragment."', yes: 'True', no: 'False', verdict: 'Right, the statement is false', why: 'A semicolon joins **two complete sentences**. Before a fragment, use a **comma** or a **colon** instead.'},
			order: {kind: 'Linear equations', title: 'In what order do you solve 3(x − 2) = 2x + 5?', hint: 'Press and drag, or tap the steps in order.', items: [['Solve for x', 'x = 11'], ['Distribute', '3x − 6 = 2x + 5', 1], ['Check in the original', '3(11 − 2) = 27 = 2(11) + 5'], ['Collect the x terms', '3x − 2x = 5 + 6', 2]]},
			question: {stem: 'In which sentence is the word **heavy** used figuratively?', options: ['She could not carry the heavy suitcase up the stairs alone.', 'His friend’s words felt very heavy to him.', 'The truck climbed the hill slowly because of its heavy load.', 'Iron is heavier than a piece of wood the same size.', 'Two people moved the heavy stone to the side of the garden.'], hint: 'Ask of each option: is **heavy** a weight you could put on a scale?'},
			buttons: {next: 'Continue', restart: 'Start over', ask: 'Ask SinoAI'},
		},
		problem: {
			title: 'Linear expressions',
			chip: 'SAT Math',
			answer: 'Answer: C',
			steps: [
				['Spot the pattern', '4x + 6 = 2(2x + 3)'],
				['Use the given value', '2x + 3 = 11'],
				['Multiply', '2 · 11 = 22'],
			],
			skill: 'Rewrite the expression in terms of the one you know instead of solving for x first.',
			mistake: 'Solving for x and slipping on the arithmetic; 4x + 6 is just twice 2x + 3.',
			lesson: 'Lessons · Linear equations',
			photo: '14. If 2x + 3 = 11, what is the value of 4x + 6?',
			options: 'A) 16 · B) 19 · C) 22 · D) 28',
			noteLines: ['If 2x + 3 = 11,', 'find 4x + 6.'],
			noteChoices: ['A) 16', 'B) 19', 'C) 22'],
			ask: 'Why don’t we solve for x first?',
			reply: 'You can, but there is a shortcut: 4x + 6 is exactly twice 2x + 3. So you double the value you already know.',
			formula: '4x + 6 = 2(2x + 3) = 2 · 11 = 22',
			close: 'The answer is 22. This topic cost you 2 questions on your last practice test.',
		},
	},
	act: {
		practice: ['ACT Practice Test 5', 'ACT Practice Test 4'],
		trend: {title: 'My ACT composite', tabs: ['Total', 'Math'], bars: [['28 Sep', 24], ['5 Oct', 25], ['12 Oct', 27], ['19 Oct', 28], ['Elsewhere', 26, true]], max: 36, gain: '+4 over the last 4'},
		latest: [
			['ACT Practice Test 5', '19 Oct · 91st percentile', '28', '+1'],
			['ACT Practice Test 4', '12 Oct · 86th percentile', '27', '+2'],
		],
		result: {meta: '12 Oct · full practice test · 4 sections', ring: 27 / 36, value: '27', unit: 'composite', gain: '+2', score: ['Composite', '27 / 36'], rank: ['Percentile', '86th'], lessons: lessons([['English', 28, 36], ['Math', 26, 36], ['Reading', 27, 36], ['Science', 25, 36]]), costly: 'Linear functions, Data interpretation, Punctuation'},
		analysis: {
			topics: [
				{name: 'Linear functions', sub: 'Math · slope and intercept', loss: '−3 questions', quiz: 20},
				{name: 'Data interpretation', sub: 'Science · tables and graphs', loss: '−3 questions', quiz: 12},
				{name: 'Punctuation', sub: 'English · commas and semicolons', loss: '−2 questions', quiz: 0},
			],
			gain: 'Study these 3 this week and gain about 2 composite points.',
		},
		net: {
			title: 'Practice test score',
			heads: ['C', 'W', 'B', 'Score'],
			rows: [
				['English', 44, 5, 1, '28'],
				['Math', 36, 8, 1, '26'],
				['Reading', 30, 5, 1, '27'],
				['Science', 31, 8, 1, '25'],
			],
			total: ['ACT Practice Test 4 · composite', '27', '+2'],
			costly: [
				['Linear functions', 'Math · 3 wrong · 1 blank'],
				['Data interpretation', 'Science · 3 wrong'],
			],
		},
		month: {
			rows: [
				['ACT Practice Test 4', 'Full test · 4 sections', '27'],
				['ACT Math', 'Section · 45 questions', '26'],
				['ACT English', 'Section · 50 questions', '28'],
				['ACT Science', 'Section · 40 questions', null],
			],
			summary: '3 / 4 tests · best composite 27',
			unit: 'score',
		},
		plan: {lesson: ['ACT English · Lessons', 'Punctuation', 'From where you left off · 8 min'], quiz: ['ACT Math · you lost points here', 'Linear functions · Medium', '20 questions · 25 min'], cards: ['ACT Science · Flashcards', 'Variables and controls', '20 cards · 10 min'], exam: ['ACT Practice Test 5', '09:00 – 11:40'], own: 'Prep book · 2 sections'},
		calendar: {rows: [['ACT · February', 'February 13, 2027 · Saturday', '84'], ['ACT · April', 'April 10, 2027 · Saturday', '140']], month: [['ACT Practice Test 5', 'Saturday 09:00 · full test'], ['ACT Science Section 2', 'Monday 18:00']]},
		card: {meta: 'Science · Experiments', question: 'What is a dependent variable?', answer: 'What you measure', text: 'It changes because of the independent variable, the one the scientist sets.'},
		steps: {
			fill: {kind: 'Fill the gap', title: 'Complete the sentence', before: 'The slope of the line y = 4x − 3 is ', word: '4', after: '.', chips: ['−3', '4', '3/4'], right: 'Correct answer: 4', why: 'In **y = mx + b**, m is the slope and b the y-intercept. Here **m = 4**; −3 is where the line crosses the y-axis.', review: 'This step is in your review list; it comes back tomorrow.'},
			trueFalse: {kind: 'Common mistake', title: 'Is this statement true?', claim: '"The dependent variable is the one the scientist changes on purpose."', yes: 'True', no: 'False', verdict: 'Right, the statement is false', why: 'The scientist changes the **independent** variable. The **dependent** variable is what is measured as a result.'},
			order: {kind: 'Data representation', title: 'In what order do you read a science graph?', hint: 'Press and drag, or tap the steps in order.', items: [['Find the trend', 'what changes with what'], ['Read the title', 'what was measured', 1], ['Answer from the graph', 'not from memory'], ['Check the axes and units', '°C, seconds, mL', 2]]},
			question: {stem: 'A line passes through **(1, 2)** and **(3, 8)**. What is its slope?', options: ['2', '3', '4', '6', '10'], hint: 'Slope is the **change in y over the change in x**: (8 − 2) / (3 − 1).'},
			buttons: {next: 'Continue', restart: 'Start over', ask: 'Ask SinoAI'},
		},
		problem: {
			title: 'Perimeter and area',
			chip: 'ACT Math',
			answer: 'Answer: C',
			steps: [
				['Write the perimeter', '2(w + w + 3) = 26'],
				['Solve for the sides', 'w = 5, length = 8'],
				['Find the area', '5 · 8 = 40'],
			],
			skill: 'Turn the words into one equation, solve it, then answer what is asked: the area, not the width.',
			mistake: 'Stopping at w = 5 and answering with the width.',
			lesson: 'Lessons · Area and perimeter',
			photo: '14. A rectangle’s length is 3 more than its width and its perimeter is 26. What is its area?',
			options: 'A) 30 · B) 36 · C) 40 · D) 48 · E) 52',
			noteLines: ['Length = width + 3,', 'perimeter 26. Area?'],
			noteChoices: ['A) 36', 'B) 40', 'C) 48'],
			ask: 'Why isn’t the answer 5?',
			reply: 'Five is the width. The question asks for the area, so you still need the length (5 + 3 = 8) and then length × width.',
			formula: '2(2w + 3) = 26 → w = 5, area = 5 · 8 = 40',
			close: 'The area is 40. Reading the question twice would have saved this one on your last practice test.',
		},
	},
};

/** The drawn student's exam data (see `useExam`). */
export const usePersona = (): ExamPersona => EXAM_PERSONA[useExam()];
