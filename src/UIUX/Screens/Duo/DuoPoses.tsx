import React from 'react';
import {UIProvider} from '../../Context';
import type {UIScreen} from '../../Registry';
import {UI_CANVAS} from '../../Tokens';
import * as TSolve from '../Tablet/Solve';
import * as TWide from '../Tablet/Wide';

/**
 * iPhone Duo poses beyond "closed" and "open wide" (Apple, 9 Sep 2026):
 * partly open like a book (the folding region splits the inner display, panes
 * keep clear of its centre) and the inner display held tall (669 × 951, the
 * one pose that keeps horizontal bars). The tablet screens draw themselves at
 * these sizes; no separate layout.
 */

const InnerWide: React.FC<{fold?: boolean; children: React.ReactNode}> = ({fold, children}) => (
	<UIProvider canvas={{width: UI_CANVAS.duoInner.width, height: UI_CANVAS.duoInner.height}} duo="inner" noPencil fold={fold}>
		{children}
	</UIProvider>
);

const InnerTall: React.FC<{children: React.ReactNode}> = ({children}) => (
	<UIProvider canvas={{width: UI_CANVAS.duoInnerTall.width, height: UI_CANVAS.duoInnerTall.height}} noPencil>
		{children}
	</UIProvider>
);

const ExamOpen: React.FC = () => (
	<InnerWide>
		<TSolve.ExamScratchScreen />
	</InnerWide>
);
const ExamHalfOpen: React.FC = () => (
	<InnerWide fold>
		<TSolve.ExamScratchScreen />
	</InnerWide>
);
const TestOpen: React.FC = () => (
	<InnerWide>
		<TSolve.TestScratchScreen />
	</InnerWide>
);
const LessonSinoOpen: React.FC = () => (
	<InnerWide fold>
		<TWide.LessonSinoPanelScreen />
	</InnerWide>
);
const ExamTall: React.FC = () => (
	<InnerTall>
		<TSolve.ExamPortraitScreen />
	</InnerTall>
);

const GROUP = 'Duo iç · Pozlar ve taslak kâğıdı';

export const DUO_EXTRA: UIScreen[] = [
	{id: 'f-ic-deneme-taslak', platform: 'fold', group: GROUP, title: 'Deneme çözme · taslak kâğıdı (açık)', route: 'ExamStudentSolve', Component: ExamOpen, module: 'exam', pose: 'inner', note: 'İç ekran tam açık: soru solda, taslak kâğıdı sağda. Kalem yok: taslak parmakla çizilir, araç çubuğunda Kaydır / Çiz. Katlayınca aynı soru, süre ve taslak dış ekranda devam eder.'},
	{id: 'f-ic-deneme-yari-acik', platform: 'fold', group: GROUP, title: 'Deneme çözme · yarı açık (kitap)', route: 'ExamStudentSolve', Component: ExamHalfOpen, module: 'exam', pose: 'inner', note: 'Yarı açık: katlanma bölgesi ekranın ortasında (40 pt). Soru katın solunda, taslak kâğıdı sağında; hiçbir düğme katın üstüne gelmez (Apple: ReservedRegion, split arrangement).'},
	{id: 'f-ic-test-taslak', platform: 'fold', group: GROUP, title: 'Test çözme · taslak kâğıdı', route: 'QuizSolve', Component: TestOpen, module: 'tests', pose: 'inner', note: 'Testte de taslak yanda; geri bildirim soru sütununda.'},
	{id: 'f-ic-ders-sinoai-yari-acik', platform: 'fold', group: GROUP, title: 'Ders adımı · SinoAI yanda (yarı açık)', route: 'WorkMikro', Component: LessonSinoOpen, module: 'lessons', pose: 'inner', note: 'Adım katın solunda, SinoAI sağında. Katlayınca SinoAI dış ekranda alt sayfa olur.'},
	{id: 'f-ic-dikey-deneme', platform: 'fold', group: 'Duo iç · Dik tutuş', title: 'Deneme çözme · iç ekran dik', route: 'ExamStudentSolve', Component: ExamTall, module: 'exam', pose: 'innerTall', note: 'İç ekran dik (669 × 951): Apple’ın tek istisnası, çubuklar yatay (üstte durum ve başlık). Şıklar üç sütun, taslak alt yarıda.'},
];
