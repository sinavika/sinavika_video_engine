import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {useModuleColors, useT} from '../../UIUX/Context';
import {findScreen, type UIScreen} from '../../UIUX/Registry';
import {ExamResults} from '../../UIUX/Screens/Mobile/Exam';
import {TestsHomeScreen} from '../../UIUX/Screens/Mobile/Learn';

/**
 * "Önce" drawings for the "Dediniz, yaptık" series (Sosyal Medya, 20 Nov 2026; docs/Social/Sinavika-Tr-Icerik-Yaklasimi.md
 * "Ana seri"). A reel shows what the app did before a fix and what it does now. The old screens are gone from the UI/UX
 * set (one first version, no vN folders), so the "before" is drawn here, in the engine only: the same UI/UX screen
 * component with the old behaviour as its data (the bar the app did not count left out, a title cut after two lines).
 * They are never exported to Sinavika-UIUX3 and never shown as the app of today; each pairs with the real drawing that
 * shows the fix. Ids start with `once-` and live beside the set's ids (StoryDevice reads both).
 */

const PULSE_SECONDS = 0.9;
/** Where m-deneme-sonuclar's fifth bar stands, in screen points (measured on the drawing). */
const BEFORE_SLOT = {left: 297, top: 300, width: 54, height: 116};

/** The empty slot where the app did not count an exam solved elsewhere: a dashed outline that blinks. */
const MissingSlot: React.FC<{left: number; top: number; width: number; height: number}> = ({left, top, width, height}) => {
	const mod = useModuleColors('exam');
	const seconds = useCurrentFrame() / useVideoConfig().fps;
	const on = 0.35 + 0.65 * (0.5 + 0.5 * Math.cos((2 * Math.PI * seconds) / PULSE_SECONDS));
	return <div style={{position: 'absolute', left, top, width, height, boxSizing: 'border-box', borderRadius: '14px 14px 6px 6px', border: `2.5px dashed ${mod.color}`, opacity: on}} />;
};

/**
 * m-deneme-sonuclar before "Deneme ekle" (D1): only Sınavika exams on the chart, no "Deneme ekle" row. The fifth slot,
 * where the hatched bar of an exam solved elsewhere stands today, is empty and blinks; the note says "Son 4 deneme".
 */
const ExamResultsBefore: React.FC = () => {
	const t = useT();
	return (
		<div style={{position: 'relative', width: '100%', height: '100%'}}>
			<ExamResults
				withAdd={false}
				sub={t('Son 4 deneme', 'Last 4')}
				bars={[
					[t('28 Eyl', '28 Sep'), 64],
					[t('5 Eki', '5 Oct'), 72],
					[t('12 Eki', '12 Oct'), 78.5],
					[t('19 Eki', '19 Oct'), 84.25],
					[' ', null],
				]}
			/>
			<MissingSlot {...BEFORE_SLOT} />
		</div>
	);
};

/** The long topic the Testler slide shows in the title pair: the app cut it after two lines before 2.12.1. */
const LONG_TITLE = {tr: 'Paragrafta anlam, ana düşünce ve yardımcı düşünce · Orta', en: 'Meaning, main idea and supporting details in a paragraph · Medium'};

/** m-test-vitrin with a long topic, cut with "…" after two lines (before 2.12.1, F1 / F5). */
const TestsHomeBefore: React.FC = () => {
	const t = useT();
	return <TestsHomeScreen slide={{title: t(LONG_TITLE.tr, LONG_TITLE.en), clamp: 2}} />;
};

/** The same slide today: the long topic in full (the drawing's part, its data only longer). */
const TestsHomeAfter: React.FC = () => {
	const t = useT();
	return <TestsHomeScreen slide={{title: t(LONG_TITLE.tr, LONG_TITLE.en)}} />;
};

const story = (id: string, title: string, after: string, Component: React.FC, module: UIScreen['module']): UIScreen => ({
	id,
	platform: 'mobile',
	group: 'Hikâye · önce / sonra',
	title,
	module,
	route: `story · ${after}`,
	note: `Yalnız motorda; ${after} ile önce / sonra.`,
	Component,
});

/**
 * The story-only drawings: `once-…` is the app before a fix; `sonra-…` is today's drawing with the same longer data
 * where the set's own sample would not show the difference.
 */
export const STORY_SCREENS: readonly UIScreen[] = [
	story('once-deneme-sonuclar', 'Sonuçlar · Deneme ekle öncesi', 'm-deneme-sonuclar', ExamResultsBefore, 'exam'),
	story('once-test-vitrin', 'Testler · kesik slayt başlığı', 'sonra-test-vitrin', TestsHomeBefore, 'tests'),
	story('sonra-test-vitrin', 'Testler · slayt başlığı tam', 'once-test-vitrin', TestsHomeAfter, 'tests'),
];

/** A drawing by id: the story-only ones first, then the UI/UX set. */
export const storyScreen = (id: string): UIScreen => STORY_SCREENS.find((entry) => entry.id === id) ?? findScreen(id);
