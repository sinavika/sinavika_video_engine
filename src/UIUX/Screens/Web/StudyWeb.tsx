import React from 'react';
import {useColors, useModuleColors, useT, useUI} from '../../Context';
import {Icon, type UIIconName} from '../../Icons';
import {MODULES, type ModuleKey} from '../../ModuleIdentity';
import {Button, Chip, Field, FlagButton, OptionRow, Pct, Segmented, Stack, Text, Tile} from '../../Parts/Shared';
import {ActionCard, EntryRow, FilterChips, HEATMAP_SAMPLE, KpiCard, NetBars, PlanTaskCard, resultBars, StateBlock, StudyBars, StudyDonut, StudyHeatmap, TodayCard, WeekStrip, type HubState} from '../../Parts/Study';
import {Grid, ModuleHead, Panel, useInTablet, WCard} from '../../Parts/Web';
import {UI_SHADOW} from '../../Tokens';
import {NumberCell, REVIEW_RESULTS} from '../Mobile/Insights';
import {EmbedStep, TOPIC} from '../Mobile/Lessons';
import {LessonFormulaScreen, LessonGroupScreen, LessonMatchScreen} from '../Mobile/LessonSteps';
import {WebExamSolveScreen} from './ExamWeb';
import {Back, Main, StudyPlayer} from './LessonsWeb';

/**
 * Web panel in step with the app (8 Nov 2026): the same "Bugün" home with
 * its four states, the plan day with source-and-amount task cards, results
 * as net bars with Deneme ekle, the statistics dashboard (owner's analytics
 * reference: KPI cards with change, stacked study bars with a tooltip, a
 * donut, the best-hours heatmap), the exam submit and finished states, the
 * new lesson step types and the empty states. Every block comes from
 * Parts/Study, the same parts mobile and tablet draw.
 */

const DAYS = (t: (tr: string, en: string) => string) => [t('Pzt', 'Mon'), t('Sal', 'Tue'), t('Çar', 'Wed'), t('Per', 'Thu'), t('Cum', 'Fri'), t('Cmt', 'Sat'), t('Paz', 'Sun')];
const HOURS = ['06', '09', '12', '15', '18', '20', '22', '24'];

/* ------------------------------------------------------------------ Ana sayfa */

const ReviewCard: React.FC = () => {
	const t = useT();
	return (
		<WCard title={t('Bugün tekrar', 'Review today')} action={t('yaklaşık 12 dk', 'about 12 min')}>
			<Stack gap={12}>
				{[
					['lessons', 'refresh', t('5 adım', '5 steps'), t('Dersler · ilk denemede yanlış', 'Lessons · missed first time')],
					['flashcards', undefined, t('32 kart', '32 cards'), t('Bilgi Kartları · unutmak üzere', 'Flashcards · about to slip')],
				].map(([module, icon, title, sub]) => (
					<Stack key={title} row gap={12}>
						<Tile module={module as ModuleKey} icon={icon as UIIconName | undefined} size={40} />
						<Stack grow gap={1}>
							<Text role="headline">{title}</Text>
							<Text role="small">{sub}</Text>
						</Stack>
						<Button tone="moduleSoft" module={module as ModuleKey} size="sm">
							{t('Başla', 'Start')}
						</Button>
					</Stack>
				))}
			</Stack>
		</WCard>
	);
};

/** A one-line link card on the tablet home (SinoAI, Destek): lead, name, arrow. */
const LinkCard: React.FC<{lead: React.ReactNode; title: string}> = ({lead, title}) => {
	const colors = useColors();
	return (
		<Stack row gap={12} style={{padding: '9px 12px', borderRadius: 20, background: colors.card, border: `1px solid ${colors.line}`, boxShadow: UI_SHADOW.card}}>
			{lead}
			<Stack grow>
				<Text role="headline">{title}</Text>
			</Stack>
			<Icon name="right" size={18} color={colors.subtle} />
		</Stack>
	);
};

/** The six modules on the home page, compact so the card keeps the page's right column. */
const ModulesCard: React.FC<{action?: string}> = ({action}) => {
	const t = useT();
	const colors = useColors();
	return (
		<WCard title={t('Modüller', 'Modules')} action={action} padding={16}>
			<Grid columns="repeat(3, minmax(0, 1fr))" gap={6}>
				{(['studyPlan', 'lessons', 'tests', 'exam', 'flashcards', 'smartSummary'] as ModuleKey[]).map((key) => (
					<Stack key={key} row gap={6} style={{padding: '6px 7px', borderRadius: 14, border: `1px solid ${colors.line}`, minWidth: 0}}>
						<Tile module={key} size={24} />
						<Text role="headline" size={13} style={{whiteSpace: 'nowrap'}}>
							{t(MODULES[key].name)}
						</Text>
					</Stack>
				))}
			</Grid>
		</WCard>
	);
};

/** Every home row follows these two columns (owner, 17 Nov 2026); minmax keeps a wide card from pushing its column. */
const HOME_COLUMNS = 'minmax(0, 1.3fr) minmax(0, 1fr)';

const WebHomeBody: React.FC<{state?: HubState}> = ({state = 'plan'}) => {
	const t = useT();
	const colors = useColors();
	const tablet = useInTablet();
	return (
		<>
			{/* Owner, 17–18 Nov 2026: no date above the greeting; the goal and the streak sit on the greeting's line, opposite it (web adds Paylaş). No goal line under the greeting. */}
			{tablet ? (
				<Stack row justify="space-between" align="center">
					<Text role="title" size={30}>
						{t('Günaydın Ayşe', 'Good morning, Emma')}
					</Text>
					<Stack row gap={12}>
						<Stack row gap={6}>
							<Icon name="target" size={15} color={colors.ink2} />
							<Text role="small" color={colors.ink2} style={{whiteSpace: 'nowrap'}}>
								{t('Hedef', 'Goal')} <b style={{color: colors.ink}}>{t('YKS · 214 gün kaldı', 'SAT · 214 days left')}</b>
							</Text>
						</Stack>
						<Chip tone="warning" icon="flame">
							{state === 'done' ? t('6 gün seri', '6-day streak') : t('5 gün seri', '5-day streak')}
						</Chip>
					</Stack>
				</Stack>
			) : (
				<Stack row justify="space-between" align="center">
					<Text role="title" size={30}>
						{t('Günaydın Ayşe', 'Good morning, Emma')}
					</Text>
					<Stack row gap={12}>
						<Stack row gap={6}>
							<Icon name="target" size={15} color={colors.ink2} />
							<Text role="small" color={colors.ink2} style={{whiteSpace: 'nowrap'}}>
								{t('Hedef', 'Goal')} <b style={{color: colors.ink}}>{t('YKS · 214 gün kaldı', 'SAT · 214 days left')}</b>
							</Text>
						</Stack>
						<Chip tone="warning" icon="flame">
							{state === 'done' ? t('6 gün seri', '6-day streak') : t('5 gün seri', '5-day streak')}
						</Chip>
						<Button tone="soft" size="sm" icon="upload">
							{t('Paylaş', 'Share')}
						</Button>
					</Stack>
				</Stack>
			)}
			<Grid columns={HOME_COLUMNS}>
				<TodayCard state={state} wide />
				<WCard>
					<Stack gap={14}>
						<WeekStrip done={state === 'noPlan' ? [] : state === 'done' ? [0, 1, 2, 3] : [0, 1, 2]} share={state === 'done' ? 1 : state === 'noPlan' ? 0 : 0.4} />
						<Stack row gap={10}>
							<KpiCard compact icon="clock" label={t('Bu hafta', 'This week')} value={state === 'noPlan' ? '—' : t('4 sa 10 dk', '4 h 10 m')} delta={state === 'noPlan' ? undefined : t('%22', '22%')} />
							<KpiCard compact icon="target" label={t('Doğru oranı', 'Accuracy')} value={state === 'noPlan' ? '—' : t('%62', '62%')} delta={state === 'noPlan' ? undefined : t('%6', '6%')} />
						</Stack>
					</Stack>
				</WCard>
			</Grid>
			{/* Every row follows the same two columns (1.3 / 1): the two action cards share the plan card's column, review takes the calendar card's. Cards on a row are one height. */}
			<Grid columns={HOME_COLUMNS}>
				<Grid columns="1fr 1fr">
					{state === 'noPlan' ? <ActionCard module="lessons" over={t('İlk adımın', 'First step')} title={t('Sözcükte Anlam', 'Word meaning')} line={t('TYT Türkçe · ilk konun', 'TYT Turkish · your first topic')} action={t('Başla', 'Start')} icon="book" meter={{progress: 0, label: t('30 adım · 33 dk', '30 steps · 33 min')}} /> : <ActionCard module="lessons" over={t('Kaldığın yerden', 'Continue')} title={t('Sözcükte Anlam', 'Word meaning')} line={t('Türkçe · 29 dk kaldı', 'Reading & Writing · 29 min left')} action={state === 'expired' ? t('Paketleri gör', 'See plans') : t('Devam et', 'Continue')} icon="book" meter={state === 'expired' ? {locked: t('Abone olunca açılır', 'Opens with a plan')} : {progress: 0.13, label: t('Adım 4 / 30', 'Step 4 / 30')}} />}
					<ActionCard
						module="exam"
						over={t('Sıradaki deneme', 'Next exam')}
						title={t('TYT Deneme 5', 'SAT Practice Test 5')}
						line={t('Cumartesi 10:00 · 12.480 kişi', 'Saturday 10:00 · 12,480 people')}
						action={t('Hatırlat', 'Remind me')}
						icon="exam"
						meter={{
							countdown: [
								['2', t('gün', 'days')],
								['4', t('saat', 'hours')],
								['15', t('dk', 'min')],
							],
						}}
					/>
				</Grid>
				<ReviewCard />
			</Grid>
			<Grid columns={HOME_COLUMNS}>
				<WCard title={t('Bu hafta', 'This week')} action={t('İstatistiklerim', 'My statistics')}>
					<StudyBars
						height={tablet ? 56 : 110}
						active={3}
						tooltip={
							state === 'noPlan'
								? undefined
								: {
										title: t('Perşembe', 'Thursday'),
										rows: [
											[t('Planlanan', 'Planned'), t('90 dk', '90 min')],
											[t('Çalışılan', 'Studied'), t('45 dk', '45 min')],
										],
									}
						}
						bars={DAYS(t).map((label, day) => ({
							label,
							parts: (state === 'noPlan'
								? [['lessons', 0]]
								: [
										['lessons', [30, 20, 40, 25, 0, 0, 0][day]],
										['tests', [10, 25, 0, 20, 0, 0, 0][day]],
										['exam', [0, 0, 55, 0, 0, 0, 0][day]],
										['flashcards', [5, 10, 0, 0, 0, 0, 0][day]],
									]) as [ModuleKey, number][],
						}))}
					/>
				</WCard>
				{tablet ? (
					/* Tablet has no side menu: no "Tümü" (all six modules are on the card), and SinoAI and Destek sit side by side under it (owner, 17 Nov 2026). */
					<Stack gap={10}>
						<ModulesCard />
						{/* The page scrolls: on the plan-less home this row sits below the fold. */}
						<div data-ui="scroll">
							<Grid columns="1fr 1fr" gap={10}>
								<LinkCard lead={<Tile module="sinoAi" size={30} />} title="SinoAI" />
								<LinkCard
									lead={
										<div style={{width: 30, height: 30, borderRadius: 10, background: colors.line2, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
											<Icon name="headset" size={16} color={colors.ink2} />
										</div>
									}
									title={t('Destek', 'Support')}
								/>
							</Grid>
						</div>
					</Stack>
				) : (
					<ModulesCard action={t('Tümü', 'All')} />
				)}
			</Grid>
		</>
	);
};

export const WebHomeScreen: React.FC = () => (
	<Panel active="home">
		<WebHomeBody />
	</Panel>
);
export const WebHomeNoPlanScreen: React.FC = () => (
	<Panel active="home">
		<WebHomeBody state="noPlan" />
	</Panel>
);
export const WebHomeDoneScreen: React.FC = () => (
	<Panel active="home">
		<WebHomeBody state="done" />
	</Panel>
);
export const WebHomeExpiredScreen: React.FC = () => (
	<Panel active="home">
		<WebHomeBody state="expired" />
	</Panel>
);

/** First visit: one tip on today's plan, as on the phone. */
export const WebTourScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	// Inside a device frame (tablet, iPhone Duo) the page has no menu: the plan card sits at the page's top left.
	const embedded = useInTablet();
	const hole = embedded ? {left: 18, top: 62, width: 432, height: 262} : {left: 282, top: 196, width: 640, height: 300};
	return (
		<Panel
			active="home"
			overlay={
				<div data-ui="scrim" style={{position: 'absolute', inset: 0, zIndex: 30}}>
					<div style={{position: 'absolute', ...hole, borderRadius: 28, boxShadow: '0 0 0 4px rgba(255,255,255,0.95), 0 0 0 3000px rgba(11,28,48,0.6)'}} />
					<div style={{position: 'absolute', left: hole.left + 18, top: hole.top + hole.height + 24, width: 440, borderRadius: 22, background: colors.card, padding: 20}}>
						<div style={{position: 'absolute', left: 60, top: -8, width: 16, height: 16, background: colors.card, transform: 'rotate(45deg)'}} />
						<Text role="over" color={colors.brandDeep}>
							{t('İpucu', 'Tip')}
						</Text>
						<Text role="section" style={{marginTop: 6}}>
							{t('Her gün buradan başla', 'Start here every day')}
						</Text>
						<Text role="body" style={{marginTop: 4}}>
							{t('Planındaki sıradaki görev burada; tek tıkla açılır. Modüller solda, hep aynı yerde.', 'Your next task is here, one click away. Modules stay on the left.')}
						</Text>
						<Stack row justify="flex-end" style={{marginTop: 14}}>
							<Button size="sm">{t('Anladım', 'Got it')}</Button>
						</Stack>
					</div>
				</div>
			}
		>
			<WebHomeBody />
		</Panel>
	);
};

/* ------------------------------------------------------------------ Ders Planı · Bugün */

const PLAN_TABS = (t: (tr: string, en: string) => string) => [t('Bugün', 'Today'), t('Program', 'Schedule'), t('Öneriler', 'Suggestions'), t('İstatistik', 'Statistics'), t('İlerleme', 'Progress'), t('Ayarlar', 'Settings')];

/**
 * Web Ders Planı · Bugün (owner, 17 Nov 2026). A task card's body opens its
 * content, the circle marks it done, "Diğer işlemler" (…) opens Odak
 * sayacıyla başla, Yarına taşı, Saati değiştir, Bugünden kaldır. No plan: a
 * centred box (Planımı hazırla · 1 dk, Kendi planımı kuracağım) and a sample
 * day on the right. Yesterday's tasks: the box above the left card.
 */
type WebPlanState = 'plan' | 'menu' | 'none' | 'missed';

const WebPlanToday: React.FC<{state?: WebPlanState}> = ({state = 'plan'}) => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('studyPlan');
	const none = state === 'none';
	const menu = (
		<div style={{position: 'absolute', right: 8, top: 44, zIndex: 5, width: 250, padding: 6, borderRadius: 16, background: colors.card, border: `1px solid ${colors.line}`, boxShadow: UI_SHADOW.float}}>
			{(
				[
					['clock', t('Odak sayacıyla başla', 'Start with the focus timer')],
					['calendar', t('Yarına taşı', 'Move to tomorrow')],
					['history', t('Saati değiştir', 'Change the time')],
					['trash', t('Bugünden kaldır', 'Remove from today')],
				] as [UIIconName, string][]
			).map(([icon, label], index) => (
				<Stack key={label} row gap={10} style={{padding: '10px 12px', borderRadius: 10}}>
					<Icon name={icon} size={18} color={index === 3 ? colors.errorInk : colors.ink2} />
					<Text role="small" weight={600} color={index === 3 ? colors.errorInk : colors.ink}>
						{label}
					</Text>
				</Stack>
			))}
		</div>
	);
	return (
		<Panel active="studyPlan">
			<ModuleHead
				module="studyPlan"
				tabs={PLAN_TABS(t)}
				title={t('Bugün · Perşembe 15 Ekim', 'Today · Thursday 15 Oct')}
				sub={none ? t('Henüz planın yok', 'No plan yet') : t('5 görev · 90 dk hedef · seri 5 gün', '5 tasks · 90 min goal · 5-day streak')}
				actions={
					none ? undefined : (
						<Stack row gap={10}>
							<div style={{width: 230}}>
								<Segmented items={[t('Gün', 'Day'), t('Hafta', 'Week'), t('Ay', 'Month')]} module="studyPlan" />
							</div>
							<Button tone="module" module="studyPlan" icon="plus">
								{t('Görev ekle', 'Add task')}
							</Button>
						</Stack>
					)
				}
			/>
			{none ? (
				<Grid columns="minmax(0, 1.3fr) minmax(0, 1fr)">
					<WCard>
						<StateBlock module="studyPlan" icon="calendar" title={t('Henüz planın yok', 'No plan yet')} text={t('Sınav tarihine, boş günlerine ve zorlandığın derslere göre her güne görev koyarız; denemeden sonra kendini günceller.', 'We put tasks on each day from your exam date, free days and weak subjects; it updates after every exam.')} action={t('Planımı hazırla · 1 dk', 'Build my plan · 1 min')} second={t('Kendi planımı kuracağım', 'I’ll make my own')} />
					</WCard>
					<WCard title={t('Örnek bir gün', 'A sample day')}>
						<Stack gap={10} style={{opacity: 0.85}}>
							<PlanTaskCard module="lessons" source={t('TYT Matematik · Dersler', 'TYT Maths · Lessons')} title={t('Temel Kavramlar', 'Basic concepts')} amount={t('İlk konu · 12 dk', 'First topic · 12 min')} />
							<PlanTaskCard module="tests" source={t('TYT Fizik · Testler', 'TYT Physics · Quizzes')} title={t('Fizik Bilimine Giriş · Kolay', 'Intro to physics · Easy')} amount={t('20 soru · 25 dk', '20 q · 25 min')} />
							<Text role="meta">{t('Kayıttaki cevaplarına göre; plan hazırlanınca takvimine yerleşir.', 'From your sign-up answers; goes into your calendar once the plan is ready.')}</Text>
						</Stack>
					</WCard>
				</Grid>
			) : (
				<>
					<FilterChips items={[t('Tümü · 5', 'All · 5'), t('Dersler', 'Lessons'), t('Testler', 'Quizzes'), t('Denemeler', 'Exams'), t('Tekrar', 'Review'), t('Kendi görevlerim', 'My tasks')]} />
					<Grid columns="1.7fr 1fr">
						<Stack gap={14}>
							{state === 'missed' ? (
								<Stack row gap={14} style={{padding: '14px 16px', borderRadius: 20, background: colors.warningSoft, border: `1px solid ${colors.warning}`}}>
									<Icon name="history" size={20} color={colors.warningInk} />
									<Stack grow gap={2}>
										<Text role="headline" color={colors.warningInk}>
											{t('Dünden 2 görev kaldı', '2 tasks left from yesterday')}
										</Text>
										<Text role="small" color={colors.ink2}>
											{t('Bugüne eklersek günün 40 dk uzar. Haftaya yayarsak her güne biraz düşer.', 'Adding to today makes it 40 min longer; spreading adds a little to each day.')}
										</Text>
									</Stack>
									<Button tone="ghost" size="sm">
										{t('Haftaya yay', 'Spread over the week')}
									</Button>
									<Button tone="module" module="studyPlan" size="sm">
										{t('Bugüne ekle', 'Add to today')}
									</Button>
								</Stack>
							) : null}
							<WCard>
								<Stack gap={14}>
									<Stack row justify="space-between">
										<Text role="headline" size={16}>
											{t('Günün ilerlemesi', 'Today’s progress')}
										</Text>
										<Text role="small" weight={700} color={mod.ink}>
											{t('45 / 90 dk · %45', '45 / 90 min · 45%')}
										</Text>
									</Stack>
									<div style={{height: 10, borderRadius: 5, background: mod.track}}>
										<div style={{width: '45%', height: '100%', borderRadius: 5, background: mod.color}} />
									</div>
									<Grid columns="1fr 1fr" gap={12}>
										<PlanTaskCard module="lessons" source={t('TYT Türkçe · Dersler', 'TYT Turkish · Lessons')} title={t('Sözcükte Anlam', 'Word meaning')} amount={t('Kaldığın yerden · 8 dk', 'From where you left off · 8 min')} done more />
										<div style={{position: 'relative'}}>
											<PlanTaskCard module="tests" source={t('TYT Matematik · denemende net kaybettin', 'TYT Maths · cost you nets')} title={t('Problemler · Orta', 'Problems · Medium')} amount={t('20 soru · 25 dk', '20 q · 25 min')} now more />
											{state === 'menu' ? menu : null}
										</div>
										<PlanTaskCard module="flashcards" source={t('TYT Kimya · Bilgi Kartları', 'TYT Chemistry · Flashcards')} title={t('Mol kavramı', 'The mole')} amount={t('20 kart · 10 dk', '20 cards · 10 min')} more />
										<PlanTaskCard module="exam" source={t('Sınavika · Türkiye geneli', 'Sınavika · nationwide')} title={t('TYT Deneme 5', 'SAT Practice Test 5')} amount="10:00 – 12:45" badge={t('Canlı deneme', 'Live exam')} more />
										<PlanTaskCard module="own" source={t('Kendi görevin', 'Your own task')} title={t('Paragraf kitabı · 2 test', 'Reading book · 2 tests')} amount="18:00 – 18:40" more />
									</Grid>
								</Stack>
							</WCard>
						</Stack>
						<Stack gap={18}>
							<WCard>
								<WeekStrip module="studyPlan" />
							</WCard>
							<WCard title={t('Odak sayacı', 'Focus timer')}>
								<Stack gap={10}>
									<Text role="small">{t('Sıradaki görevi 25 dk odak ve 5 dk molayla çalış.', 'Work the next task in 25-minute rounds.')}</Text>
									<Button tone="module" module="studyPlan" icon="clock">
										{t('Problemler · Orta ile başla', 'Start with Problems')}
									</Button>
								</Stack>
							</WCard>
							<Stack row gap={10} style={{padding: '12px 14px', borderRadius: 16, background: mod.wash, border: `1px solid ${mod.line}`}}>
								<Icon name="sparkles" size={18} color={mod.ink} />
								<Text role="small" color={colors.ink2} style={{flex: 1}}>
									{t('Denemeden sonra plan güncellendi: Matematik’e 2 görev eklendi.', 'Updated after your exam: 2 maths tasks added.')}
								</Text>
							</Stack>
						</Stack>
					</Grid>
				</>
			)}
		</Panel>
	);
};

export const WebPlanTodayScreen: React.FC = () => <WebPlanToday />;

/** "Diğer işlemler" open on a task card. */
export const WebPlanTaskMenuScreen: React.FC = () => <WebPlanToday state="menu" />;

/** No plan yet on the web (from m-plan-yok). */
export const WebPlanNoneScreen: React.FC = () => <WebPlanToday state="none" />;

/** Yesterday's tasks on the web (from m-plan-dunden): the box above the left card. */
export const WebPlanMissedScreen: React.FC = () => <WebPlanToday state="missed" />;

/* ------------------------------------------------------------------ Denemeler · Sonuçlar */

export const WebResultsScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<Panel active="exam">
			<ModuleHead module="exam" tab={2} title={t('Sonuçlar', 'Results')} sub={t('Netlerin, sıralaman ve gelişimin', 'Your scores, rank and progress')} />
			<Grid columns="1.6fr 1fr">
				<WCard>
					<Stack gap={14}>
						<Stack row justify="space-between">
							<Stack gap={1}>
								<Text role="headline" size={16}>
									{t('TYT net gelişimim', 'My SAT Math scores')}
								</Text>
								<Text role="small">{t('Son 5 deneme · çizgili: dışarıda çözdüğün', 'Last 5 · hatched: solved elsewhere')}</Text>
							</Stack>
							<div style={{width: 130}}>
								<Segmented items={[t('TYT', 'SAT'), t('AYT', 'ACT')]} module="exam" />
							</div>
						</Stack>
						<NetBars
							height={200}
							items={resultBars(t)}
							max={useUI().lang === 'en' ? 800 : 120}
						/>
					</Stack>
				</WCard>
				<Stack gap={12}>
					<EntryRow module="exam" strong icon="exam" title={t('Sınavika denemelerim', 'My Sınavika exams')} sub={t('6 deneme · sonuç belgeleri', '6 exams · result documents')} />
					<EntryRow module="exam" icon="chart" title={t('Analizlerim', 'My analyses')} sub={t('Net kaybettiğin konular', 'Topics that cost points')} />
					<EntryRow module="exam" icon="plus" title={t('Deneme ekle', 'Add an exam')} sub={t('Dışarıda çözdüğün', 'Solved elsewhere')} />
					<Stack row gap={8} style={{padding: '10px 14px', borderRadius: 14, background: colors.successSoft}}>
						<Icon name="trend" size={16} color={colors.successInk} />
						<Text role="small" weight={700} color={colors.successInk}>
							{t('Son 4 denemede +20,25 net', '+110 points over the last 4')}
						</Text>
					</Stack>
				</Stack>
			</Grid>
			<WCard title={t('Deneme sonuçların', 'Your exam results')}>
				<ResultsTable />
			</WCard>
		</Panel>
	);
};

/**
 * Web Sonuçlar table in the ÖSYM layout (owner, 17 Nov 2026): test by test
 * nets, total net and score, "Analiz" at the end of the row; a row solved
 * elsewhere has "Sil" (asks once more) and no rank or score.
 */
const ResultsTable: React.FC = () => {
	const t = useT();
	const colors = useColors();
	// The tablet page is shorter (834 pt): two rows end above the home indicator, a third was cut.
	const tablet = useInTablet();
	// English drawings show a SAT student (store set): Reading & Writing, Math and the 400–1600 total; no TYT columns, no rank score.
	const en = useUI().lang === 'en';
	const all: {name: string; date: string; parts: string[]; total: string; score?: string; external: boolean}[] = en
		? [
				{name: 'SAT Practice Test 5', date: '19 Oct', parts: ['640', '720'], total: '1,360', external: false},
				{name: 'SAT Practice Test 4', date: '12 Oct', parts: ['610', '680'], total: '1,290', external: false},
				{name: 'Outside practice test 3', date: '2 Nov', parts: ['600', '640'], total: '1,240', external: true},
			]
		: [
				{name: 'TYT Deneme 5', date: '19 Eki', parts: ['32,5', '14,25', '27,5', '10'], total: '84,25', score: '338,61', external: false},
				{name: 'TYT Deneme 4', date: '12 Eki', parts: ['30', '13,5', '25', '10'], total: '78,5', score: '325,04', external: false},
				{name: 'Örnek Yayınları TYT 3', date: '2 Kas', parts: ['29', '12,5', '20', '8'], total: '69,5', score: '—', external: true},
			];
	const rows = tablet ? all.slice(0, 2) : all;
	const cell: React.CSSProperties = {padding: '10px 8px', borderBottom: `1px solid ${colors.line2}`, textAlign: 'right'};
	const heads = en ? ['Test', 'Date', 'Reading & Writing', 'Math', 'Total', ''] : ['Deneme', 'Tarih', 'Türkçe', 'Sosyal', 'Matematik', 'Fen', 'Toplam net', 'Puan', ''];
	return (
		<table style={{width: '100%', borderCollapse: 'collapse', fontFamily: 'inherit'}}>
			<thead>
				<tr>
					{heads.map((head, index) => (
						<th key={head || index} style={{...cell, textAlign: index < 2 ? 'left' : 'right', fontSize: 13, color: colors.muted, fontWeight: 700, background: colors.line2}}>
							{head}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{rows.map(({name, date, parts, total, score, external}) => (
					<tr key={name}>
						<td style={{...cell, textAlign: 'left', fontSize: 15, fontWeight: 700, color: colors.ink}}>{name}</td>
						<td style={{...cell, textAlign: 'left', fontSize: 14, color: colors.ink2}}>{external ? t('Dışarıda · 2 Kas', 'Elsewhere · 2 Nov') : date}</td>
						{parts.map((value, index) => (
							<td key={index} style={{...cell, fontSize: 14, color: colors.ink2}}>
								{value}
							</td>
						))}
						<td style={{...cell, fontSize: 15, fontWeight: 800, color: colors.ink}}>{total}</td>
						{score === undefined ? null : <td style={{...cell, fontSize: 14, fontWeight: 700, color: colors.ink}}>{score}</td>}
						<td style={{...cell}}>
							<Stack row gap={6} justify="flex-end">
								{external ? (
									<Button tone="ghost" size="sm" icon="trash" style={{color: colors.errorInk}}>
										{t('Sil', 'Delete')}
									</Button>
								) : null}
								<Button tone="moduleSoft" module="exam" size="sm">
									{t('Analiz', 'Analysis')}
								</Button>
							</Stack>
						</td>
					</tr>
				))}
			</tbody>
		</table>
	);
};

export const WebResultsEmptyScreen: React.FC = () => {
	const t = useT();
	return (
		<Panel active="exam">
			<ModuleHead module="exam" tab={2} title={t('Sonuçlar', 'Results')} sub={t('Netlerin, sıralaman ve gelişimin', 'Your scores, rank and progress')} />
			<Grid columns="1.6fr 1fr">
				<StateBlock module="exam" icon="chart" title={t('İlk denemenden sonra burada', 'Here after your first exam')} text={t('Netin, sıralaman ve net kaybettiğin konular her denemeden sonra burada birikir.', 'Your nets, rank and the topics that cost you collect here.')} action={t('Sıradaki denemeye bak', 'See the next exam')} second={t('Dışarıda çözdüğün bir denemeyi ekle', 'Add an exam you solved elsewhere')} />
				<Stack gap={12}>
					<EntryRow module="exam" strong icon="exam" title={t('TYT Deneme 5', 'SAT Practice Test 5')} sub={t('Cumartesi 10:00 · 12.480 kişi', 'Saturday 10:00 · 12,480 joined')} />
					<EntryRow module="exam" icon="plus" title={t('Deneme ekle', 'Add an exam')} sub={t('Dışarıda çözdüğün', 'Solved elsewhere')} />
				</Stack>
			</Grid>
		</Panel>
	);
};

/* ------------------------------------------------------------------ İstatistiklerim (dashboard) */

export const WebStatsScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const tablet = useInTablet();
	const weeks = [
		{
			label: t('1. hf', 'W1'),
			parts: [
				['lessons', 80],
				['tests', 60],
				['exam', 40],
				['flashcards', 20],
			] as [ModuleKey, number][],
		},
		{
			label: t('2. hf', 'W2'),
			parts: [
				['lessons', 110],
				['tests', 70],
				['exam', 0],
				['flashcards', 30],
			] as [ModuleKey, number][],
		},
		{
			label: t('3. hf', 'W3'),
			parts: [
				['lessons', 90],
				['tests', 85],
				['exam', 165],
				['flashcards', 25],
			] as [ModuleKey, number][],
		},
		{
			label: t('4. hf', 'W4'),
			parts: [
				['lessons', 130],
				['tests', 70],
				['exam', 0],
				['flashcards', 50],
			] as [ModuleKey, number][],
		},
		{
			label: t('Bu hf', 'Now'),
			parts: [
				['lessons', 110],
				['tests', 85],
				['exam', 55],
				['flashcards', 0],
			] as [ModuleKey, number][],
		},
	];
	return (
		<Panel active="stats">
			<Stack row justify="space-between" align="flex-end">
				<Stack gap={2}>
					<Text role="title" size={28}>
						{t('İstatistiklerim', 'My statistics')}
					</Text>
					<Text role="small">{t('Çalışma süren, doğru oranın, netlerin ve en verimli saatlerin tek yerde.', 'Your time, accuracy, scores and best hours in one place.')}</Text>
				</Stack>
				<Stack row gap={10}>
					<div style={{width: 300}}>
						<Segmented items={[t('Bu hafta', 'This week'), t('Son 30 gün', '30 days'), t('Tümü', 'All')]} active={1} />
					</div>
					{/* Downloads the API's A4 report (r-istatistik-*, docs/UIUX/Kodlama/13-Istatistik-Raporu-PDF.md); the print dialog is gone (owner, 19 Nov 2026). */}
					<Button tone="ghost" icon="file">
						{t('PDF olarak al', 'Download PDF')}
					</Button>
				</Stack>
			</Stack>
			<Stack row gap={14}>
				<KpiCard icon="clock" label={t('Çalışma süresi', 'Study time')} value={t('19 sa 40 dk', '19 h 40 m')} delta={t('%22', '22%')} period={t('geçen 30 güne göre', 'vs previous 30 days')} />
				<KpiCard icon="quiz" label={t('Çözülen soru', 'Questions')} value="742" delta={t('%31', '31%')} period={t('geçen 30 güne göre', 'vs previous 30 days')} />
				<KpiCard icon="target" label={t('Doğru oranı', 'Accuracy')} value={t('%62', '62%')} delta={t('%6', '6%')} period={t('geçen 30 güne göre', 'vs previous 30 days')} />
				<KpiCard icon="trend" label={t('TYT net', 'SAT score')} value={t('84,25', '1,360')} delta={t('5,75', '70')} period={t('son denemeye göre', 'vs last exam')} />
			</Stack>
			<Grid columns="1.35fr 1fr">
				<WCard title={t('Haftalık çalışma', 'Weekly study')} action={t('modüllere göre', 'by module')}>
					<StudyBars
						height={tablet ? 96 : 150}
						bars={weeks}
						active={2}
						tooltip={{
							title: t('3. hafta', 'Week 3'),
							rows: [
								[t('Planlanan', 'Planned'), t('6 sa', '6 h')],
								[t('Çalışılan', 'Studied'), t('6 sa 5 dk', '6 h 5 m')],
								[t('Deneme', 'Exam'), t('2 sa 45 dk', '2 h 45 m')],
							],
						}}
					/>
				</WCard>
				<WCard title={t('Nerede çalıştın?', 'Where did you study?')}>
					<StudyDonut
						size={tablet ? 110 : 140}
						center={t('19 sa', '19 h')}
						sub={t('toplam', 'total')}
						parts={[
							['lessons', 520],
							['tests', 370],
							['exam', 260],
							['flashcards', 125],
						]}
					/>
				</WCard>
			</Grid>
			<Grid columns="1.35fr 1fr">
				<WCard title={t('Derslere göre', 'By subject')} action={t('Tümü', 'All')}>
					<SubjectTable />
				</WCard>
				<WCard title={t('En verimli saatlerin', 'Your best hours')} action={t('doğru oranına göre', 'by accuracy')}>
					<Stack gap={10}>
						<StudyHeatmap cells={HEATMAP_SAMPLE} days={DAYS(t)} hours={HOURS} cell={tablet ? 19 : 24} />
						<Text role="small" color={colors.ink2}>
							{t('Hafta içi 18:00–20:00 arası en çok doğru yapıyorsun; plan zor dersleri bu saate koyar.', 'You are most accurate 18:00–20:00 on weekdays; the plan puts hard subjects there.')}
						</Text>
					</Stack>
				</WCard>
			</Grid>
		</Panel>
	);
};

const SubjectTable: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const rows: [string, string, number, string, string, boolean][] = [
		[t('Türkçe', 'Reading & Writing'), '214', 0.75, t('6 sa 10 dk', '6 h 10 m'), t('+%8', '+8%'), false],
		[t('Matematik', 'Maths'), '296', 0.58, t('7 sa 5 dk', '7 h 5 m'), t('+%11', '+11%'), false],
		[t('Fizik', 'Physics'), '118', 0.4, t('3 sa', '3 h'), t('−%3', '−3%'), true],
		[t('Kimya', 'Chemistry'), '114', 0.52, t('2 sa 20 dk', '2 h 20 m'), t('+%4', '+4%'), false],
	];
	const cell: React.CSSProperties = {padding: '9px 8px', borderBottom: `1px solid ${colors.line2}`, fontSize: 14};
	return (
		<table style={{width: '100%', borderCollapse: 'collapse', fontFamily: 'inherit'}}>
			<thead>
				<tr>
					{[t('Ders', 'Subject'), t('Soru', 'Questions'), t('Doğru', 'Accuracy'), t('Süre', 'Time'), t('Değişim', 'Change')].map((head) => (
						<th key={head} style={{...cell, textAlign: 'left', fontSize: 13, color: colors.muted, fontWeight: 700, background: colors.line2}}>
							{head}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{rows.map(([name, count, share, time, delta, down]) => (
					<tr key={name}>
						<td style={{...cell, fontWeight: 800, color: colors.ink}}>{name}</td>
						<td style={{...cell, color: colors.ink2}}>{count}</td>
						<td style={{...cell}}>
							<Stack row gap={8}>
								<div style={{width: 90, height: 6, borderRadius: 3, background: colors.line2}}>
									<div style={{width: `${share * 100}%`, height: '100%', borderRadius: 3, background: share < 0.5 ? colors.warning : colors.success}} />
								</div>
								<Text role="small" weight={700} color={colors.ink}>
									<Pct value={Math.round(share * 100)} />
								</Text>
							</Stack>
						</td>
						<td style={{...cell, color: colors.ink2}}>{time}</td>
						<td style={{...cell, fontWeight: 800, color: down ? colors.errorInk : colors.successInk}}>
							{down ? '↘' : '↗'} {delta}
						</td>
					</tr>
				))}
			</tbody>
		</table>
	);
};

/* ------------------------------------------------------------------ Denemeler · teslim, biten, ekle */

/** A modal over a web page, the panel dimmed behind it. */
const Modal: React.FC<{width?: number; children: React.ReactNode}> = ({width = 520, children}) => {
	const colors = useColors();
	return (
		<div data-ui="scrim" style={{position: 'absolute', inset: 0, background: 'rgba(11, 28, 48, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 40}}>
			<div style={{width, boxSizing: 'border-box', borderRadius: 26, background: colors.card, boxShadow: UI_SHADOW.float, padding: 26, display: 'flex', flexDirection: 'column', gap: 16}}>{children}</div>
		</div>
	);
};

/** The hand-in dialog: the same on web and tablet. */
export const SubmitDialog: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('exam');
	return (
		<Modal>
			<Stack align="center" gap={8}>
				<Tile module="exam" icon="checkCircle" size={56} solid />
				<Text role="section" size={21} align="center">
					{t('Denemeyi teslim et?', 'Hand in the exam?')}
				</Text>
				<Text role="small" align="center">
					{t('Teslim edince cevaplar değişmez; sonuç ve çözümler hemen açılır.', 'Answers lock; results open at once.')}
				</Text>
			</Stack>
			<Stack row gap={10}>
				{[
					['116', t('cevaplı', 'answered'), colors.ink],
					['4', t('boş', 'blank'), colors.warningInk],
					['2', t('işaretli', 'flagged'), mod.ink],
				].map(([value, label, color]) => (
					<Stack key={label} align="center" gap={1} style={{flex: 1, padding: '10px 0', borderRadius: 16, background: colors.line2}}>
						<Text role="num" size={24} color={color}>
							{value}
						</Text>
						<Text role="meta">{label}</Text>
					</Stack>
				))}
			</Stack>
			<Stack row gap={8} wrap>
				<Text role="meta">{t('Boş:', 'Blank:')}</Text>
				{['12', '27', '83', '98'].map((number) => (
					<div key={number} style={{padding: '4px 12px', borderRadius: 10, border: `1.5px solid ${colors.warning}`, background: colors.warningSoft}}>
						<Text role="headline" size={14} color={colors.warningInk}>
							{number}
						</Text>
					</div>
				))}
			</Stack>
			<Stack row gap={10}>
				<Button tone="ghost" size="lg" style={{flex: 1}}>
					{t('Boşlara dön', 'Back to blanks')}
				</Button>
				<Button tone="module" module="exam" size="lg" style={{flex: 1}}>
					{t('Teslim et', 'Hand in')}
				</Button>
			</Stack>
			<Text role="meta" align="center">
				{t('Klavye: Enter teslim eder, Esc kapatır', 'Keyboard: Enter hands in, Esc closes')}
			</Text>
		</Modal>
	);
};

export const WebExamSubmitScreen: React.FC = () => (
	<div style={{position: 'relative'}}>
		<WebExamSolveScreen />
		<SubmitDialog />
	</div>
);

export const WebExamDoneDetailScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('exam');
	return (
		<Panel active="exam">
			<ModuleHead
				module="exam"
				tab={1}
				title={t('TYT Temel Matematik Denemesi · Kasım 2026', 'TYT Basic Maths · November 2026')}
				sub={t('Tamamlandı · 3 Kasım · 52 dk', 'Done · 3 Nov · 52 min')}
				actions={
					<Chip tone="success" icon="check">
						{t('Tamamlandı', 'Done')}
					</Chip>
				}
			/>
			<Grid columns="1fr 1.2fr">
				<WCard>
					<Stack gap={14}>
						<Stack row gap={18}>
							<Stack align="center" justify="center" style={{width: 110, height: 110, borderRadius: 55, border: `10px solid ${mod.color}`, boxSizing: 'border-box'}}>
								<Text role="title" size={24}>
									10,75
								</Text>
								<Text role="meta">net</Text>
							</Stack>
							<Stack gap={8} grow>
								<Stack row justify="space-between">
									{[
										['14', t('doğru', 'right'), colors.successInk],
										['13', t('yanlış', 'wrong'), colors.errorInk],
										['13', t('boş', 'blank'), colors.ink2],
									].map(([value, label, color]) => (
										<Stack key={label} align="center" gap={0}>
											<Text role="title" size={22} color={color}>
												{value}
											</Text>
											<Text role="meta">{label}</Text>
										</Stack>
									))}
								</Stack>
								<Text role="small">{t('Katılanların %41’inden iyi', 'Better than 41% of participants')}</Text>
							</Stack>
						</Stack>
						<Button tone="module" module="exam" size="lg" block icon="file">
							{t('Sonuç belgesi', 'Result document')}
						</Button>
						<Stack row gap={10}>
							<Button tone="moduleSoft" module="exam" style={{flex: 1}} icon="checkCircle">
								{t('Çözümler', 'Solutions')}
							</Button>
							<Button tone="moduleSoft" module="exam" style={{flex: 1}} icon="chart">
								{t('Analiz', 'Analysis')}
							</Button>
						</Stack>
					</Stack>
				</WCard>
				<WCard title={t('Net kaybettiğin konular', 'Topics that cost you')}>
					<Stack gap={12}>
						{[
							['tests', 'quiz', t('Problemler', 'Word problems'), t('6 soru · 4 yanlış', '6 q · 4 wrong'), t('Test çöz', 'Solve a quiz')],
							['lessons', 'book', t('Üslü sayılar', 'Exponents'), t('3 soru · 2 yanlış', '3 q · 2 wrong'), t('Konu anlatımı', 'Topic lesson')],
							['studyPlan', 'calendar', t('Plana ekle', 'Add to plan'), t('İkisini bu haftaya koy', 'Put both into this week'), t('Ekle', 'Add')],
						].map(([module, icon, title, sub, action]) => (
							<Stack key={title} row gap={12}>
								<Tile module={module as ModuleKey} icon={icon as UIIconName} size={40} />
								<Stack grow gap={1}>
									<Text role="headline">{title}</Text>
									<Text role="small">{sub}</Text>
								</Stack>
								<Button tone="moduleSoft" module={module as ModuleKey} size="sm">
									{action}
								</Button>
							</Stack>
						))}
					</Stack>
				</WCard>
			</Grid>
		</Panel>
	);
};

export const WebExamAddScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('exam');
	const rows: [string, number, number, string][] = [
		[t('Türkçe · 40', 'Turkish · 40'), 32, 5, '30,75'],
		[t('Sosyal · 20', 'Social · 20'), 14, 3, '13,25'],
		[t('Matematik · 40', 'Maths · 40'), 18, 6, '16,5'],
		[t('Fen · 20', 'Science · 20'), 9, 4, '8'],
	];
	return (
		<div style={{position: 'relative', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column'}}>
			<WebResultsScreen />
			<Modal width={600}>
				<Stack row justify="space-between">
					<Text role="section" size={21}>
						{t('Deneme ekle', 'Add an exam')}
					</Text>
					<Icon name="x" size={22} color={colors.ink2} />
				</Stack>
				<Text role="small">{t('Dışarıda çözdüğün denemenin sonucunu gir; net gelişimine ve Ders Planı’na eklenir.', 'Enter a result from another exam; it joins your trend and plan.')}</Text>
				<Grid columns="1.4fr 1fr 1fr" gap={10}>
					<Field label={t('Yayın', 'Publisher')} value={t('Örnek Yayınları', 'Sample Publishing')} />
					<Field label={t('Deneme', 'Exam')} value="TYT 3" />
					<Field label={t('Tarih', 'Date')} value={t('2 Kasım', '2 Nov')} icon="calendar" />
				</Grid>
				<Stack gap={8}>
					{rows.map(([name, right, wrong, net]) => (
						<Stack key={name} row gap={12}>
							<Text role="headline" size={14.5} style={{flex: 1}}>
								{name}
							</Text>
							{[right, wrong].map((value, index) => (
								<div key={index} style={{width: 64, height: 40, borderRadius: 12, border: `1.5px solid ${colors.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
									<Text role="headline" color={index ? colors.errorInk : colors.successInk}>
										{value}
									</Text>
								</div>
							))}
							<Text role="headline" style={{width: 54}} align="right" color={mod.ink}>
								{net}
							</Text>
						</Stack>
					))}
				</Stack>
				<Stack row justify="space-between" style={{paddingTop: 10, borderTop: `1px solid ${colors.line2}`}}>
					<Text role="headline">{t('Toplam net: 68,5', 'Total score: 68.5')}</Text>
					<Button tone="module" module="exam">
						{t('Kaydet', 'Save')}
					</Button>
				</Stack>
			</Modal>
		</div>
	);
};

/* ------------------------------------------------------------------ Dersler · new step types in the web player */

export const WebLessonGroupScreen: React.FC = () => (
	<StudyPlayer
		step={TOPIC.before + 3}
		nav={
			<>
				<Back />
				<Main>Kontrol et</Main>
			</>
		}
	>
		<EmbedStep>
			<LessonGroupScreen />
		</EmbedStep>
	</StudyPlayer>
);

export const WebLessonMatchScreen: React.FC = () => (
	<StudyPlayer
		step={TOPIC.before + 4}
		nav={
			<>
				<Back />
				<Main>Kontrol et</Main>
			</>
		}
	>
		<EmbedStep>
			<LessonMatchScreen />
		</EmbedStep>
	</StudyPlayer>
);

export const WebLessonFormulaScreen: React.FC = () => (
	<StudyPlayer
		step={TOPIC.before + 2}
		nav={
			<>
				<Back />
				<Main>Devam</Main>
			</>
		}
	>
		<EmbedStep>
			<LessonFormulaScreen />
		</EmbedStep>
	</StudyPlayer>
);

/* ------------------------------------------------------------------ Testler · yanlışlarım */

/**
 * Web Yanlışlarım (tablet draws the same page). The grid always shows every
 * question (green right, red wrong, grey blank, filled = open); the filter
 * chooses which ones "Sonraki" walks through. On the last one of the filter
 * the main button reads "Bitti" and goes back to Çözümler.
 */
const WebWrongReview: React.FC<{last?: boolean}> = ({last}) => {
	const t = useT();
	const colors = useColors();
	const open = last ? 20 : 3;
	// In a tablet-sized page (iPhone Duo inner display) the left card is narrower:
	// it still holds the filter and five columns (5 × 36 + 4 × 6 = 204 pt in 270 − 2 × 20).
	const narrow = useInTablet();
	return (
		<Panel active="tests">
			<ModuleHead module="tests" tab={2} title={t('Yanlışlarım · Temel Kavramlar', 'My mistakes · Basics')} sub={last ? t('Kolay · 5 / 20 doğru · son yanlış', 'Easy · 5 / 20 · last mistake') : t('Kolay · 5 / 20 doğru · ilk yanlıştan açıldı', 'Easy · 5 / 20 · opened at the first mistake')} />
			<Grid columns={narrow ? '270px minmax(0, 1fr)' : '300px minmax(0, 1fr)'}>
				<WCard>
					<Stack gap={10}>
						<Segmented items={[t('Yanlış · 15', 'Wrong · 15'), t('Boş · 0', 'Blank · 0'), t('Tümü · 20', 'All · 20')]} off={[1]} module="tests" />
						<div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: narrow ? 6 : 8}}>
							{REVIEW_RESULTS.map((result, index) => (
								<div key={index} style={{display: 'flex', justifyContent: 'center'}}>
									<NumberCell number={index + 1} result={result} on={index + 1 === open} size={narrow ? 36 : 40} />
								</div>
							))}
						</div>
					</Stack>
				</WCard>
				<WCard>
					<Stack gap={12}>
						<Stack row justify="space-between">
							<Text role="meta">{last ? t('Soru 20 / 20 · 15. yanlış', 'Question 20 / 20 · 15th mistake') : t('Soru 3 / 20 · 1. yanlış', 'Question 3 / 20 · 1st mistake')}</Text>
							<FlagButton on={!last} />
						</Stack>
						<Text role="body" size={18} weight={600} color={colors.ink}>
							{last ? t('Aşağıdakilerden hangisi asal sayıdır?', 'Which of these is a prime number?') : t('Aşağıdakilerden hangisi tam sayıdır ama doğal sayı değildir?', 'Which is an integer but not a natural number?')}
						</Text>
						{last ? (
							<Grid columns="1fr 1fr" gap={10}>
								<OptionRow letter="A" text="21" />
								<OptionRow letter="B" text="27" />
								<OptionRow letter="C" text="29" state="correct" />
								<OptionRow letter="D" text="33" state="wrong" />
							</Grid>
						) : (
							<Grid columns="1fr 1fr" gap={10}>
								<OptionRow letter="A" text="−4" state="correct" />
								<OptionRow letter="B" text="0" />
								<OptionRow letter="C" text="3/2" state="wrong" />
								<OptionRow letter="D" text="7" />
							</Grid>
						)}
						<Text role="body">{last ? t('29 yalnız 1’e ve kendisine bölünür. 21 = 3 · 7, 27 = 3 · 9, 33 = 3 · 11.', '29 divides only by 1 and itself. 21, 27 and 33 all divide by 3.') : t('Doğal sayılar 0 ve pozitif tam sayılardır. −4 tam sayıdır ama negatif olduğu için doğal değildir.', 'Natural numbers are 0 and the positive integers.')}</Text>
						<Stack row gap={10} wrap>
							<Button tone="moduleSoft" module="lessons" icon="book">
								{t('Konuyu çalış', 'Study the topic')}
							</Button>
							<Button tone="ghost" icon="upload">
								{t('Bu soruyu paylaş', 'Share this question')}
							</Button>
							<Button tone="ghost" icon="sparkles">
								{t('SinoAI’ye sor', 'Ask SinoAI')}
							</Button>
							<div style={{flex: 1}} />
							{last ? (
								<Button tone="module" module="tests" icon="check">
									{t('Bitti', 'Done')}
								</Button>
							) : (
								<Button tone="module" module="tests" iconRight="right">
									{t('Sonraki yanlış', 'Next mistake')}
								</Button>
							)}
						</Stack>
					</Stack>
				</WCard>
			</Grid>
		</Panel>
	);
};

export const WebTestWrongReviewScreen: React.FC = () => <WebWrongReview />;

/** The last wrong answer: "Bitti" goes back to Çözümler. */
export const WebTestWrongReviewLastScreen: React.FC = () => <WebWrongReview last />;
