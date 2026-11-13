import React from 'react';
import {findScreen} from '../../UIUX/Registry';
import {UIProvider} from '../../UIUX/Context';
import {useAppCanvas, useAppLanguage, useAppMode} from './AppScreenParts';
import {APP_SCREEN} from './AppScreenTokens';

/**
 * Every app screen videos and pictures can show, by name. Each one is the
 * current UI/UX drawing of that screen (src/UIUX, the same drawings exported
 * to Desktop\Sinavika-UIUX3), so a redesign there reaches the camp videos,
 * ads, store pictures and posts at their next render without touching them.
 * Until 10 Nov 2026 these were separate hand-drawn copies that fell behind
 * the design.
 *
 * The screen follows the theme and language of the phone around it
 * (PhoneFrame's mode and lang). Names are stable: content files refer to
 * them. Adding a screen: one line here with the drawing's UI/UX id.
 */
type AppScreenEntry = {
	Component: React.FC;
	/** The UI/UX drawing shown (docs/UIUX/Ekran-Envanteri.md). */
	uiux: string;
	/** What the screen is, for catalogues and file names. */
	title: string;
	/** What it shows, in the app's own words where the app has them. */
	description: string;
};

/** The UI/UX drawing `id`, drawn in the theme, language and module colours of the phone it sits in. */
const drawing = (id: string): React.FC => {
	const screen = findScreen(id);
	const Drawing: React.FC = () => {
		const mode = useAppMode();
		const lang = useAppLanguage();
		const canvas = useAppCanvas();
		const Screen = screen.Component;
		// The drawings are phone screens (390 x 844). A wider canvas (a tablet in the store pictures) gets the phone
		// layout grown to its width, as the app itself stretches on a tablet; the frame crops what falls below.
		const scale = canvas.width / APP_SCREEN.width;
		return (
			<UIProvider mode={mode} lang={lang} module={screen.module} calm={false} web={false}>
				<div style={{width: APP_SCREEN.width, height: Math.max(APP_SCREEN.height, canvas.height / scale), transform: scale === 1 ? undefined : `scale(${scale})`, transformOrigin: 'top left'}}>
					<Screen />
				</div>
			</UIProvider>
		);
	};
	Drawing.displayName = `UIUX(${id})`;
	return Drawing;
};

const entry = (uiux: string, title: string, description: string): AppScreenEntry => ({Component: drawing(uiux), uiux, title, description});

export const APP_SCREENS = {
	Home: entry('m-hub-moduller', 'Modüller', 'Ana ekran: günün planı, sıradaki görev ve bütün modüller.'),
	ExamHome: entry('m-deneme-vitrin', 'Denemeler ana sayfa', 'Canlı deneme, devam eden deneme ve öneriler.'),
	Exam: entry('m-deneme-coz', 'Deneme çözümü', 'Süreli bir denemede soru çözme.'),
	Analysis: entry('m-deneme-gelisim', 'Ders gelişimi', 'Net trendi ve derslere göre gelişim.'),
	SmartSummaryHome: entry('m-ozet-vitrin', 'Akıllı Özet ana sayfa', 'Soru analizi, video analizi ve geçmiş analizler.'),
	SmartSummary: entry('m-ozet-sonuc', 'Soru analizi', 'Soru görselinden çözüm, kazanım ve hata analizi.'),
	SinoAi: entry('m-sino-sohbet', 'SinoAI', 'SinoAI ile sohbet.'),
	Flashcards: entry('m-kart-on', 'Kart oturumu', 'Bilgi kartını çevir, bilme düzeyini işaretle.'),
	Lessons: entry('m-ders-vitrin', 'Dersler', 'Mikro dersler, konular ve tekrar.'),
	Tests: entry('m-test-vitrin', 'Testler', 'Konu testleri: Kolay, Orta, Zor.'),
	StudyPlan: entry('m-plan-bugun', 'Ders Planı', 'Günün görevleri ve çalışma serisi.'),
	StudyProgress: entry('m-plan-ilerleme', 'İlerleme', 'Haftalık çalışma süresi ve konu ilerlemesi.'),
} as const satisfies Record<string, AppScreenEntry>;

export type AppScreenName = keyof typeof APP_SCREENS;
export const APP_SCREEN_NAMES = Object.keys(APP_SCREENS) as [AppScreenName, ...AppScreenName[]];
