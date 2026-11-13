import React from 'react';
import {type ModuleKey} from '../../ModuleIdentity';
import {AppHeader} from '../../Parts/Mobile';
import {PanelInTablet} from '../../Parts/Web';
import {Tablet} from '../../Parts/Tablet';
import {EmbedStep} from '../Mobile/Lessons';
import {LessonFormulaScreen, LessonGroupScreen, LessonMatchScreen, LessonSectionScreen} from '../Mobile/LessonSteps';
import {WebExamDetailScreen} from '../Web/ExamWeb';
import {SubmitDialog, WebExamAddScreen, WebExamDoneDetailScreen, WebHomeDoneScreen, WebHomeExpiredScreen, WebHomeNoPlanScreen, WebHomeScreen, WebPlanTodayScreen, WebResultsEmptyScreen, WebResultsScreen, WebStatsScreen, WebTestWrongReviewScreen} from '../Web/StudyWeb';
import {LessonStep, Main} from './Learn';
import {ExamKeyboardScreen} from './Wide';

/**
 * Tablet in full step with the web (owner, 12 Nov 2026: "tablet, web ve
 * mobil yüzde yüz uyumlu"). A full-screen tablet shows the web page itself:
 * the page is drawn inside the tablet frame without the web's menu and top
 * bar (PanelInTablet), under the app header. A fix on the web page is a fix
 * on the tablet. Below 600 pt (Split View) the tablet uses the phone layout.
 */

const TabletPage: React.FC<{module?: ModuleKey; children: React.ReactNode}> = ({module, children}) => (
	<Tablet module={module} wash={Boolean(module)}>
		<div style={{padding: '0 18px'}}>
			<AppHeader />
		</div>
		<PanelInTablet>{children}</PanelInTablet>
	</Tablet>
);

/* ------------------------------------------------------------------ Ana ekran */

export const HubTabletScreen: React.FC = () => (
	<TabletPage>
		<WebHomeScreen />
	</TabletPage>
);
export const HubTabletNoPlanScreen: React.FC = () => (
	<TabletPage>
		<WebHomeNoPlanScreen />
	</TabletPage>
);
export const HubTabletDoneScreen: React.FC = () => (
	<TabletPage>
		<WebHomeDoneScreen />
	</TabletPage>
);
export const HubTabletExpiredScreen: React.FC = () => (
	<TabletPage>
		<WebHomeExpiredScreen />
	</TabletPage>
);

/* ------------------------------------------------------------------ Ders Planı, istatistik */

export const PlanDayTabletScreen: React.FC = () => (
	<TabletPage module="studyPlan">
		<WebPlanTodayScreen />
	</TabletPage>
);

export const StatsTabletScreen: React.FC = () => (
	<TabletPage>
		<WebStatsScreen />
	</TabletPage>
);

/* ------------------------------------------------------------------ Denemeler */

export const ResultsTabletScreen: React.FC = () => (
	<TabletPage module="exam">
		<WebResultsScreen />
	</TabletPage>
);
export const ResultsEmptyTabletScreen: React.FC = () => (
	<TabletPage module="exam">
		<WebResultsEmptyScreen />
	</TabletPage>
);
export const ExamDetailTabletScreen: React.FC = () => (
	<TabletPage module="exam">
		<WebExamDetailScreen />
	</TabletPage>
);
export const ExamDoneTabletScreen: React.FC = () => (
	<TabletPage module="exam">
		<WebExamDoneDetailScreen />
	</TabletPage>
);
export const ExamAddTabletScreen: React.FC = () => (
	<TabletPage module="exam">
		<WebExamAddScreen />
	</TabletPage>
);

/** Hand-in on the tablet: the keyboard exam screen with the same dialog as the web. */
export const ExamSubmitTabletScreen: React.FC = () => (
	<div style={{position: 'relative', width: 1194, height: 834}}>
		<ExamKeyboardScreen />
		<SubmitDialog />
	</div>
);

/* ------------------------------------------------------------------ Testler */

export const WrongReviewTabletScreen: React.FC = () => (
	<TabletPage module="tests">
		<WebTestWrongReviewScreen />
	</TabletPage>
);

/* ------------------------------------------------------------------ Dersler · the new step types in the tablet player */

export const LessonGroupTabletScreen: React.FC = () => (
	<LessonStep done={2} count={6} title="Grupla" foot={<Main>Kontrol et</Main>}>
		<EmbedStep>
			<LessonGroupScreen />
		</EmbedStep>
	</LessonStep>
);
export const LessonMatchTabletScreen: React.FC = () => (
	<LessonStep done={3} count={6} title="Eşleştir" foot={<Main>Kontrol et</Main>}>
		<EmbedStep>
			<LessonMatchScreen />
		</EmbedStep>
	</LessonStep>
);
export const LessonFormulaTabletScreen: React.FC = () => (
	<LessonStep done={1} count={5} title="Sayı kümeleri" topic="Temel Kavramlar" foot={<Main>Devam</Main>}>
		<EmbedStep>
			<LessonFormulaScreen />
		</EmbedStep>
	</LessonStep>
);
export const LessonSectionTabletScreen: React.FC = () => (
	<LessonStep done={0} count={8} title="Bölüm başı" overlay={false} foot={<Main>Başla</Main>}>
		<EmbedStep>
			<LessonSectionScreen />
		</EmbedStep>
	</LessonStep>
);
