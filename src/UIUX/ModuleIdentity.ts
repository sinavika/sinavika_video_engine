/**
 * The one definition of Sınavika's modules: display names, code names in each
 * service, identity colour and the five tab slots. Every UI/UX drawing reads
 * from here; the web and mobile apps keep a copy of the same table
 * (docs/UIUX/Modul-Kimligi.md), so a module looks and is named the same
 * everywhere.
 *
 * Colour rules:
 * - The identity colour is for way-finding: icon tiles, the module's tab bar
 *   pill, its slide, progress, the left edge of plan tasks, soft tints behind
 *   the module's pages. It is never the primary action: actions stay brand
 *   orange.
 * - Tints are the identity colour at fixed opacities (see `moduleTint`), not
 *   new colours: "saydam" layers of the same hue.
 */
import {contrastRatio, mixColors} from '../Themes/ColorPalette';
import type {UIIconName} from './Icons';

export const MODULE_KEYS = ['exam', 'lessons', 'tests', 'studyPlan', 'smartSummary', 'flashcards', 'sinoAi'] as const;
export type ModuleKey = (typeof MODULE_KEYS)[number];

export type Bilingual = {tr: string; en: string};

/** One tab of a module's bar. Slot 3 is always Modüller, slot 5 always Profil. */
export type ModuleTab = {label: Bilingual; icon: UIIconName};

export type ModuleIdentity = {
	key: ModuleKey;
	name: Bilingual;
	/** One line under the name on the hub card. */
	tagline: Bilingual;
	icon: UIIconName;
	/** Identity colour in light and dark theme. */
	color: {light: string; dark: string};
	/** Second stop of the module's gradient (slides, hero cards). */
	gradientTo: string;
	/** Code names: the API folder, route, web feature folder and mobile module. */
	code: {api: string; route: string; web: string; mobile: string; mobilePrefix: string};
	/** Slots 1, 2 and 4 of the tab bar (3 = Modüller, 5 = Profil). Empty for SinoAI, which is full screen. */
	tabs: readonly [ModuleTab, ModuleTab, ModuleTab] | null;
	/** The hub slide: what the module offers today. */
	slide: {label: Bilingual; title: Bilingual; text: Bilingual; action: Bilingual};
};

export const MODULES: Record<ModuleKey, ModuleIdentity> = {
	exam: {
		key: 'exam',
		name: {tr: 'Denemeler', en: 'Practice exams'},
		tagline: {tr: 'Deneme çöz, sonucunu gör', en: 'Take an exam, see your result'},
		icon: 'exam',
		color: {light: '#E8590C', dark: '#FB8A3C'},
		gradientTo: '#F59E0B',
		code: {api: 'Exams · ExamStudents · Scorings · QuestionSolutions · Statistics', route: '/api/StudentExamStudent', web: 'exams · exam-sessions · exam-results · question-solutions · statistics', mobile: 'exam', mobilePrefix: 'Exam'},
		tabs: [
			{label: {tr: 'Denemeler', en: 'Exams'}, icon: 'exam'},
			{label: {tr: 'Denemelerim', en: 'My exams'}, icon: 'list'},
			{label: {tr: 'Sonuçlar', en: 'Results'}, icon: 'chart'},
		],
		slide: {
			label: {tr: 'Deneme', en: 'Practice exam'},
			title: {tr: 'Hedefine bilgiyle yaklaş', en: 'Get closer to your goal'},
			text: {tr: 'TYT Deneme 5 cumartesi 10:00’da. 12.480 kişi katılıyor.', en: 'TYT Exam 5 is on Saturday at 10:00. 12,480 students joining.'},
			action: {tr: 'Denemelere git', en: 'Go to exams'},
		},
	},
	lessons: {
		key: 'lessons',
		name: {tr: 'Dersler', en: 'Lessons'},
		tagline: {tr: 'Mikro ders ve öğrenme rotası', en: 'Micro-lessons and a learning path'},
		icon: 'book',
		color: {light: '#0284C7', dark: '#38BDF8'},
		gradientTo: '#22D3EE',
		code: {api: 'Works (+ Lessons ağacı)', route: '/api/student/works', web: 'works', mobile: 'works', mobilePrefix: 'Work'},
		tabs: [
			{label: {tr: 'Dersler', en: 'Lessons'}, icon: 'book'},
			{label: {tr: 'Konu ağacı', en: 'Topic tree'}, icon: 'tree'},
			{label: {tr: 'Geçmiş', en: 'History'}, icon: 'history'},
		],
		slide: {
			label: {tr: 'Devam et', en: 'Continue'},
			title: {tr: 'Sözcükte Anlam', en: 'Word meaning'},
			text: {tr: 'Türkçe · Ders 4/9 · 11 dakika kaldı', en: 'Turkish · Lesson 4/9 · 11 minutes left'},
			action: {tr: 'Devam et', en: 'Continue'},
		},
	},
	tests: {
		key: 'tests',
		name: {tr: 'Testler', en: 'Quizzes'},
		tagline: {tr: 'Adım adım konu testleri', en: 'Step-by-step topic quizzes'},
		icon: 'quiz',
		color: {light: '#4F46E5', dark: '#818CF8'},
		gradientTo: '#8B5CF6',
		code: {api: 'Quizzes', route: '/api/student/quizzes', web: 'quizzes', mobile: 'quiz', mobilePrefix: 'Quiz'},
		tabs: [
			{label: {tr: 'Testler', en: 'Quizzes'}, icon: 'quiz'},
			{label: {tr: 'Konular', en: 'Topics'}, icon: 'tree'},
			{label: {tr: 'Çözümler', en: 'Solutions'}, icon: 'checkCircle'},
		],
		slide: {
			label: {tr: 'Senin için hazır', en: 'Ready for you'},
			title: {tr: 'Problemler · Orta', en: 'Word problems · Medium'},
			text: {tr: 'Denemede en çok net kaybettiğin konu. 20 soru.', en: 'Where you lost most points. 20 questions.'},
			action: {tr: 'Teste başla', en: 'Start quiz'},
		},
	},
	studyPlan: {
		key: 'studyPlan',
		name: {tr: 'Ders Planı', en: 'Study Plan'},
		tagline: {tr: 'Haftalık programın ve görevlerin', en: 'Your weekly schedule and tasks'},
		icon: 'calendar',
		color: {light: '#0D9488', dark: '#2DD4BF'},
		gradientTo: '#34D399',
		code: {api: 'StudyPlans', route: '/api/student/study-plan', web: 'study-plan', mobile: 'studyPlan', mobilePrefix: 'StudyPlan'},
		tabs: [
			{label: {tr: 'Bugün', en: 'Today'}, icon: 'sun'},
			{label: {tr: 'İlerleme', en: 'Progress'}, icon: 'trend'},
			{label: {tr: 'Program', en: 'Schedule'}, icon: 'calendar'},
		],
		slide: {
			label: {tr: 'Bugünün planı', en: "Today's plan"},
			title: {tr: '3 görev · 45 dakika', en: '3 tasks · 45 minutes'},
			text: {tr: 'İlki: Paragraf, ana fikir. Seri 5 gün.', en: 'First: Reading, main idea. 5-day streak.'},
			action: {tr: 'Plana git', en: 'Open plan'},
		},
	},
	smartSummary: {
		key: 'smartSummary',
		name: {tr: 'Akıllı Özet', en: 'Smart Summary'},
		tagline: {tr: 'Soru görselinden analiz al', en: 'Analyse a question from a photo'},
		icon: 'scan',
		color: {light: '#7C3AED', dark: '#A78BFA'},
		gradientTo: '#C026D3',
		code: {api: 'Lenses', route: '/api/student/lens/sessions', web: 'lens', mobile: 'lens', mobilePrefix: 'Lens'},
		tabs: [
			{label: {tr: 'Akıllı Özet', en: 'Summary'}, icon: 'scan'},
			{label: {tr: 'Soru yükle', en: 'Upload'}, icon: 'camera'},
			{label: {tr: 'Video', en: 'Video'}, icon: 'video'},
		],
		slide: {
			label: {tr: 'Soru analizi', en: 'Question analysis'},
			title: {tr: 'Fotoğrafını çek, çözümünü öğren', en: 'Snap it, learn the solution'},
			text: {tr: 'Adım adım çözüm, kazanım ve hata analizi.', en: 'Step-by-step solution, skill and mistake analysis.'},
			action: {tr: 'Soru yükle', en: 'Upload'},
		},
	},
	flashcards: {
		key: 'flashcards',
		name: {tr: 'Bilgi Kartları', en: 'Flashcards'},
		tagline: {tr: 'Kartlarla öğrenmeye devam et', en: 'Keep learning with cards'},
		icon: 'cards',
		color: {light: '#DB2777', dark: '#F472B6'},
		gradientTo: '#F43F5E',
		code: {api: 'Flashcards', route: '/api/student/flashcard', web: 'flashcard', mobile: 'flashcard', mobilePrefix: 'Flashcard'},
		tabs: [
			{label: {tr: 'Kartlar', en: 'Cards'}, icon: 'cards'},
			{label: {tr: 'Bugün', en: 'Today'}, icon: 'sun'},
			{label: {tr: 'Kaydedilenler', en: 'Saved'}, icon: 'bookmark'},
		],
		slide: {
			label: {tr: 'Bugün tekrar', en: 'Review today'},
			title: {tr: '32 kart seni bekliyor', en: '32 cards are due'},
			text: {tr: 'Unutmak üzere olduğun kartlar. Yaklaşık 8 dakika.', en: 'Cards you are about to forget. About 8 minutes.'},
			action: {tr: 'Tekrara başla', en: 'Start review'},
		},
	},
	sinoAi: {
		key: 'sinoAi',
		name: {tr: 'SinoAI', en: 'SinoAI'},
		tagline: {tr: 'Soru çöz, özet çıkar, çalışma üret', en: 'Solve, summarise, create study work'},
		icon: 'sparkles',
		color: {light: '#475569', dark: '#CBD5E1'},
		gradientTo: '#94A3B8',
		code: {api: 'SinoAI (klasör bugün SinosAI)', route: '/api/student/sino-ai', web: 'sinoai', mobile: 'sinoai', mobilePrefix: 'SinoAi'},
		tabs: null,
		slide: {
			label: {tr: 'SinoAI', en: 'SinoAI'},
			title: {tr: 'Takıldığın yerde seni tanıyan asistan', en: 'An assistant that knows you'},
			text: {tr: 'Hedefini ve son denemeni bilerek anlatır.', en: 'Explains with your goal and last exam in mind.'},
			action: {tr: 'SinoAI’ye sor', en: 'Ask SinoAI'},
		},
	},
};

/** The order modules appear in everywhere: the learning loop (measure, learn, practise, plan, solve, review, ask). */
export const MODULE_ORDER: readonly ModuleKey[] = MODULE_KEYS;

const hexToRgb = (hex: string): [number, number, number] => {
	const value = hex.replace('#', '');
	return [0, 2, 4].map((index) => parseInt(value.slice(index, index + 2), 16)) as [number, number, number];
};

/** A colour at an opacity, as rgba(). */
export const alpha = (hex: string, opacity: number): string => {
	const [r, g, b] = hexToRgb(hex);
	return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * The fixed tint steps of an identity colour. Using only these keeps every
 * module's translucent layers in the same rhythm.
 */
export const TINT = {
	/** Page wash at the top of a module's screens. */
	wash: 0.07,
	/** Soft fill: icon tiles, selected rows, chips. */
	soft: 0.12,
	/** Borders and dividers in the module's colour. */
	line: 0.24,
	/** Inactive progress track, chart areas. */
	track: 0.16,
} as const;

export const moduleTint = (key: ModuleKey, step: keyof typeof TINT, mode: 'light' | 'dark' = 'light'): string => alpha(MODULES[key].color[mode], mode === 'dark' ? TINT[step] * 1.8 : TINT[step]);

export const moduleColor = (key: ModuleKey, mode: 'light' | 'dark' = 'light'): string => MODULES[key].color[mode];

/** Text contrast a module's ink keeps on every tint of its module and on the page (WCAG AA, normal text). */
export const MODULE_INK_CONTRAST = 4.5;
const PAGE: Record<'light' | 'dark', string> = {light: '#F7F7F8', dark: '#0F1115'};

/**
 * The module colour for text and small labels: darkened on light pages,
 * lightened on dark ones, in 5 % steps until it reads at 4.5:1 on the
 * strongest tint (`line`) and on the page. Orange, sky, teal and pink text sat
 * at 3.1–3.8:1 on their own tints (UI/UX review, 25 Oct 2026). Icons, fills
 * and the tab pill keep the identity colour; the apps use the same rule
 * (mobile `resolveModuleInk`).
 */
export const moduleInk = (key: ModuleKey, mode: 'light' | 'dark' = 'light'): string => {
	const base = MODULES[key].color[mode];
	const page = PAGE[mode];
	const lineTint = mixColors(page, base, mode === 'dark' ? TINT.line * 1.8 : TINT.line);
	const toward = mode === 'dark' ? '#FFFFFF' : '#000000';
	for (let step = 0; step <= 20; step++) {
		const ink = mixColors(base, toward, step * 0.05);
		if (contrastRatio(ink, lineTint) >= MODULE_INK_CONTRAST && contrastRatio(ink, page) >= MODULE_INK_CONTRAST) return ink;
	}
	return toward;
};

/**
 * SinoAI has no colour of its own (decided 15 October): it is neutral slate,
 * and its screens are white, like a chat product. `SPARK` is kept as the name
 * of SinoAI's accent surface and is plain ink.
 */
export const SPARK = 'linear-gradient(135deg, #1E293B 0%, #334155 100%)';

export const moduleGradient = (key: ModuleKey, mode: 'light' | 'dark' = 'light'): string => `linear-gradient(135deg, ${MODULES[key].color[mode]} 0%, ${MODULES[key].gradientTo} 100%)`;
