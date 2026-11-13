import React from 'react';
import {useColors, useT} from '../../Context';
import {Icon} from '../../Icons';
import {MODULES, type ModuleKey} from '../../ModuleIdentity';
import {AppHeader, Content, Phone, SectionTitle, TourOverlay} from '../../Parts/Mobile';
import {Button, Chip, Stack, Text, Tile} from '../../Parts/Shared';
import {ActionCard, TodayCard, WeekStrip, type HubState} from '../../Parts/Study';

/**
 * Modüller, the app's home (revised 5 Nov 2026 after the live review and the
 * owner's reference app): it answers "what do I do today" first, then lists
 * the modules. Top to bottom: greeting with goal and streak, the week strip,
 * today's plan with the next task and one button, two action cards (continue
 * the lesson, the next exam), the modules as a compact grid, review and
 * support. Data: GET engagement/today (study summary, streak, tasks),
 * GET study-plan calendar (week strip), GET works continue, GET exams upcoming.
 */

/** The status line under each module tile: what waits in the module today. */
const STATUS: Record<ModuleKey, [string, string]> = {
	exam: ['Cumartesi canlı', 'Live on Saturday'],
	lessons: ['1 konu sürüyor', '1 topic in progress'],
	tests: ['1 test hazır', '1 quiz ready'],
	studyPlan: ['Bugün 2 / 5', 'Today 2 / 5'],
	smartSummary: ['Bu ay 7 / 30', '7 / 30 this month'],
	flashcards: ['32 kart bugün', '32 due today'],
	sinoAi: ['Sor', 'Ask'],
};



/** A module in the compact grid: tile, name, today's status. */
const ModuleTile: React.FC<{module: ModuleKey; status: string}> = ({module, status}) => {
	const colors = useColors();
	const t = useT();
	return (
		<Stack align="center" gap={6} style={{padding: '12px 6px 10px', borderRadius: 20, background: colors.card, border: `1px solid ${colors.line}`}}>
			<Tile module={module} size={44} />
			<Text role="headline" size={13.5} align="center" style={{lineHeight: '17px'}}>
				{t(MODULES[module].name)}
			</Text>
			<Text role="meta" size={12} align="center">
				{status}
			</Text>
		</Stack>
	);
};





const HubBody: React.FC<{scrolled?: boolean; state?: HubState}> = ({scrolled, state = 'plan'}) => {
	const t = useT();
	const colors = useColors();
	const grid: ModuleKey[] = ['exam', 'lessons', 'tests', 'studyPlan', 'smartSummary', 'flashcards'];
	return (
		<>
			<AppHeader />
			<Content tabBar={false} gap={14}>
				<Stack gap={16} style={{transform: scrolled ? 'translateY(-456px)' : undefined}}>
					<Stack row justify="space-between" align="flex-end">
						<Stack gap={4}>
							<Text role="title" size={23}>
								{t('Günaydın Ayşe', 'Good morning, Ayşe')}
							</Text>
							<Stack row gap={6}>
								<Icon name="target" size={15} color={colors.ink2} />
								<Text role="small" color={colors.ink2}>
									{t('Hedef', 'Goal')} <b style={{color: colors.ink}}>{t('TYT · 245 gün kaldı', 'TYT · 245 days left')}</b>
								</Text>
							</Stack>
						</Stack>
						<Chip tone="warning" icon="flame">
							{t('5 gün', '5 days')}
						</Chip>
					</Stack>
					<WeekStrip done={state === 'noPlan' ? [] : state === 'done' ? [0, 1, 2, 3] : [0, 1, 2]} share={state === 'done' ? 1 : state === 'noPlan' ? 0 : 0.4} />
					<TodayCard state={state} />
					<Stack row gap={10} align="stretch">
						{state === 'noPlan' ? (
							<ActionCard module="lessons" over={t('İlk adımın', 'First step')} title={t('Gerçek anlam', 'Literal meaning')} line={t('TYT Türkçe · ilk mikro ders', 'TYT Turkish · first micro-lesson')} action={t('Başla', 'Start')} icon="book" meter={{progress: 0, label: t('6 adım · 4 dk', '6 steps · 4 min')}} />
						) : (
							<ActionCard module="lessons" over={t('Kaldığın yerden', 'Continue')} title={t('Mecaz anlam', 'Figurative meaning')} line={t('Sözcükte Anlam · 4 dk kaldı', 'Word meaning · 4 min left')} action={state === 'expired' ? t('Paketleri gör', 'See plans') : t('Devam et', 'Continue')} icon="book" meter={state === 'expired' ? {locked: t('Abone olunca açılır', 'Opens with a plan')} : {progress: 0.4, label: t('2 / 5 adım', '2 / 5 steps')}} />
						)}
						<ActionCard module="exam" over={t('Sıradaki deneme', 'Next exam')} title={t('TYT Deneme 5', 'TYT Exam 5')} line={t('Cumartesi 10:00 · 12.480 kişi', 'Saturday 10:00 · 12,480 joined')} action={t('Hatırlat', 'Remind me')} icon="exam" meter={{countdown: [['2', t('gün', 'days')], ['4', t('saat', 'hours')], ['15', t('dk', 'min')]]}} />
					</Stack>
					<SectionTitle title={t('Modüller', 'Modules')} />
					<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10}}>
						{grid.map((key) => (
							<ModuleTile key={key} module={key} status={t(STATUS[key][0], STATUS[key][1])} />
						))}
					</div>
					<Stack row gap={12} style={{padding: 14, borderRadius: 22, background: colors.card, border: `1px solid ${colors.line}`}}>
						<Tile module="sinoAi" size={44} />
						<Stack grow gap={2}>
							<Text role="headline">SinoAI</Text>
							<Text role="small">{t('Takıldığın yerde hedefini bilerek anlatır', 'Explains with your goal in mind')}</Text>
						</Stack>
						<Icon name="right" size={20} color={colors.subtle} />
					</Stack>
					<Stack gap={10} style={{padding: 16, borderRadius: 22, background: colors.card, border: `1px solid ${colors.line}`}}>
						<Stack row justify="space-between">
							<Text role="headline">{t('Bugün tekrar', 'Review today')}</Text>
							<Text role="meta">{t('yaklaşık 12 dk', 'about 12 min')}</Text>
						</Stack>
						<Stack row gap={10}>
							<Tile module="lessons" icon="refresh" size={36} />
							<Stack grow gap={1}>
								<Text role="headline" size={14.5}>
									{t('5 adım', '5 steps')}
								</Text>
								<Text role="small">{t('Dersler · ilk denemede yanlış', 'Lessons · missed first time')}</Text>
							</Stack>
							<Button tone="moduleSoft" module="lessons" size="sm">
								{t('Başla', 'Start')}
							</Button>
						</Stack>
						<Stack row gap={10}>
							<Tile module="flashcards" size={36} />
							<Stack grow gap={1}>
								<Text role="headline" size={14.5}>
									{t('32 kart', '32 cards')}
								</Text>
								<Text role="small">{t('Bilgi Kartları · unutmak üzere', 'Flashcards · about to slip')}</Text>
							</Stack>
							<Button tone="moduleSoft" module="flashcards" size="sm">
								{t('Başla', 'Start')}
							</Button>
						</Stack>
					</Stack>
					<Stack row gap={12} style={{padding: 14, borderRadius: 20, background: colors.card, border: `1px solid ${colors.line}`}}>
						<div style={{width: 40, height: 40, borderRadius: 13, background: colors.line2, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							<Icon name="headset" size={20} color={colors.ink2} />
						</div>
						<Stack grow gap={2}>
							<Text role="headline">{t('Destek', 'Support')}</Text>
							<Text role="small">{t('Soruların ve taleplerin için yardım merkezi', 'Help centre for your questions')}</Text>
						</Stack>
						<Icon name="right" size={20} color={colors.subtle} />
					</Stack>
				</Stack>
			</Content>
		</>
	);
};

export const HubScreen: React.FC = () => (
	<Phone>
		<HubBody />
	</Phone>
);

/** New student without a plan: the plan card asks for one minute; the first micro-lesson needs no plan. */
export const HubNoPlanScreen: React.FC = () => (
	<Phone>
		<HubBody state="noPlan" />
	</Phone>
);

export const HubDayDoneScreen: React.FC = () => (
	<Phone>
		<HubBody state="done" />
	</Phone>
);

export const HubExpiredScreen: React.FC = () => (
	<Phone>
		<HubBody state="expired" />
	</Phone>
);

export const HubScrolledScreen: React.FC = () => (
	<Phone>
		<HubBody scrolled />
	</Phone>
);

/**
 * First-use tip on Modüller: one tip, the first time the hub opens, framing
 * today's plan. Other features explain themselves where they are first met.
 */
export const HubTipScreen: React.FC = () => {
	const t = useT();
	return (
		<Phone overlay={<TourOverlay hole={{x: 12, y: 268, w: 366, h: 196, r: 28}} title={t('Her gün buradan başla', 'Start here every day')} text={t('Planındaki sıradaki görev burada; tek dokunuşla açılır. Plan yoksa Ders Planı birkaç soruyla hazırlar.', 'The next task of your plan is here, one tap away. No plan yet? Ders Planı builds one with a few questions.')} />}>
			<HubBody />
		</Phone>
	);
};

export {SectionTitle};
