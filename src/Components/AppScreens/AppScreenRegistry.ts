import type React from 'react';
import type {AppModuleName} from './AppModules';
import {SinoAiScreen, SmartSummaryHomeScreen, SmartSummaryScreen} from './Screens/AssistantScreens';
import {ExamHomeScreen, ExamSolveScreen, ExamStatsScreen} from './Screens/ExamScreens';
import {ModuleHubScreen} from './Screens/HubScreens';
import {FlashcardScreen, LessonsScreen, StudyPlanScreen, TestsScreen} from './Screens/StudyScreens';

/**
 * Every app screen this project can show, by name. Videos, images and the
 * screen export all pick screens from here, so a screen is drawn once and
 * looks the same wherever it appears.
 *
 * Adding a screen: draw it in Screens/ from the parts in AppScreenParts and
 * add one line here. Names are stable: content files refer to them.
 */
export type AppScreenEntry = {
	Component: React.FC;
	module: AppModuleName;
	/** What the screen is, for catalogues and file names. */
	title: string;
	/** What it shows, in the app's own words where the app has them. */
	description: string;
};

export const APP_SCREENS = {
	Home: {Component: ModuleHubScreen, module: 'Hub', title: 'Modüller', description: 'Uygulamanın ana ekranı: tüm modüller tek yerde.'},
	ExamHome: {Component: ExamHomeScreen, module: 'Exam', title: 'Denemeler ana sayfa', description: 'Deneme listesi, ders ve konu gelişimi.'},
	Exam: {Component: ExamSolveScreen, module: 'Exam', title: 'Deneme çözümü', description: 'Süreli bir denemede soru çözme.'},
	Analysis: {Component: ExamStatsScreen, module: 'Exam', title: 'İstatistikler', description: 'Net trendi, genel gelişim ve başarı oranı.'},
	SmartSummaryHome: {Component: SmartSummaryHomeScreen, module: 'SmartSummary', title: 'Akıllı Özet ana sayfa', description: 'Soru analizi, video analizi ve geçmiş analizler.'},
	SmartSummary: {Component: SmartSummaryScreen, module: 'SmartSummary', title: 'Soru analizi', description: 'Soru görselinden çözüm, kazanım ve hata analizi.'},
	SinoAi: {Component: SinoAiScreen, module: 'SinoAi', title: 'SinoAI', description: 'Sınav koçuyla sohbet.'},
	Flashcards: {Component: FlashcardScreen, module: 'Flashcards', title: 'Kart oturumu', description: 'Bilgi kartını çevir, bilme düzeyini işaretle.'},
	Lessons: {Component: LessonsScreen, module: 'Lessons', title: 'Dersler', description: 'Mikro dersler, konu ağacı ve öğrenme rotası.'},
	Tests: {Component: TestsScreen, module: 'Tests', title: 'Testler', description: 'Adım adım konu testleri ve ilerleme.'},
	StudyPlan: {Component: StudyPlanScreen, module: 'StudyPlan', title: 'Ders Planı', description: 'Günün görevleri ve çalışma serisi.'},
} as const satisfies Record<string, AppScreenEntry>;

export type AppScreenName = keyof typeof APP_SCREENS;
export const APP_SCREEN_NAMES = Object.keys(APP_SCREENS) as [AppScreenName, ...AppScreenName[]];
