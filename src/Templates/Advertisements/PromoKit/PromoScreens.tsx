import React from 'react';
import {AdMobileScreen} from '../../../Ads/Google/AdScreens';
import {findConcept} from '../../../Ads/Google/GoogleAdsPlan';
import {CardSessionScreen, CardsTodayScreen, SummaryResultScreen} from '../../../UIUX/Screens/Mobile/Assist';
import {ExamAnalysisScreen, ExamResultScreen} from '../../../UIUX/Screens/Mobile/Exam';
import {HubScreen} from '../../../UIUX/Screens/Mobile/Hub';
import {LessonFlowScreen, LessonsHomeScreen, TestSolveScreen, TestsHomeScreen} from '../../../UIUX/Screens/Mobile/Learn';
import {PlanTodayScreen} from '../../../UIUX/Screens/Mobile/Plan';
import {SinoChatScreen, SinoHomeScreen, SinoLibraryScreen, SinoStudyScreen} from '../../../UIUX/Screens/Mobile/SinoAI';
import {SiteSinoGuestScreen} from '../../../UIUX/Screens/Site/Site';
import {WebExamSolveScreen, WebResultScreen} from '../../../UIUX/Screens/Web/ExamWeb';
import {WebHomeScreen} from '../../../UIUX/Screens/Web/Panel';
import {WebPlanTodayScreen} from '../../../UIUX/Screens/Web/PlanWeb';
import {WebSinoChatScreen, WebSinoLibraryScreen, WebSinoStudyScreen} from '../../../UIUX/Screens/Web/SinoWeb';

/** Ad screens with campaign data (no predictions or promises on screen). */
const YksLossScreen: React.FC = () => <AdMobileScreen concept={findConcept('yks', 'net-kaybi')} />;
const KpssLossScreen: React.FC = () => <AdMobileScreen concept={findConcept('kpss', 'puan-kaybi')} />;
const YksPlanScreen: React.FC = () => <AdMobileScreen concept={findConcept('yks', 'bugun-ne-calisayim')} />;
const KpssPlanScreen: React.FC = () => <AdMobileScreen concept={findConcept('kpss', 'isten-sonra-plan')} />;
const SolveScreen: React.FC = () => <AdMobileScreen concept={findConcept('yks', 'fotograf-cek-coz')} />;
const KpssCardScreen: React.FC = () => <AdMobileScreen concept={findConcept('kpss', 'genel-kultur-kartlar')} />;

/**
 * The real product screens (UI/UX v3) the promotion reels may show, by name.
 * Phone screens are 390 × 844, web screens 1440 × 900.
 */
export const PROMO_PHONE_SCREENS = {
	yksLoss: YksLossScreen,
	kpssLoss: KpssLossScreen,
	yksPlan: YksPlanScreen,
	kpssPlan: KpssPlanScreen,
	solve: SolveScreen,
	kpssCard: KpssCardScreen,
	hub: HubScreen,
	lessonsHome: LessonsHomeScreen,
	lessonFlow: LessonFlowScreen,
	testsHome: TestsHomeScreen,
	testSolve: TestSolveScreen,
	examResult: ExamResultScreen,
	examAnalysis: ExamAnalysisScreen,
	planToday: PlanTodayScreen,
	summaryResult: SummaryResultScreen,
	cardsToday: CardsTodayScreen,
	cardSession: CardSessionScreen,
	sinoHome: SinoHomeScreen,
	sinoChat: SinoChatScreen,
	sinoStudy: SinoStudyScreen,
	sinoLibrary: SinoLibraryScreen,
} as const satisfies Record<string, React.FC>;

export const PROMO_WEB_SCREENS = {
	webHome: WebHomeScreen,
	webResult: WebResultScreen,
	webExamSolve: WebExamSolveScreen,
	webPlanToday: WebPlanTodayScreen,
	webSinoChat: WebSinoChatScreen,
	webSinoStudy: WebSinoStudyScreen,
	webSinoLibrary: WebSinoLibraryScreen,
	siteSinoGuest: SiteSinoGuestScreen,
} as const satisfies Record<string, React.FC>;

type PromoPhoneScreen = keyof typeof PROMO_PHONE_SCREENS;
type PromoWebScreen = keyof typeof PROMO_WEB_SCREENS;
export const PROMO_PHONE_SCREEN_NAMES = Object.keys(PROMO_PHONE_SCREENS) as [PromoPhoneScreen, ...PromoPhoneScreen[]];
export const PROMO_WEB_SCREEN_NAMES = Object.keys(PROMO_WEB_SCREENS) as [PromoWebScreen, ...PromoWebScreen[]];
