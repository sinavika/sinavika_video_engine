import React from 'react';
import {useColors, useModuleColors, useT} from '../../Context';
import {Icon, type UIIconName} from '../../Icons';
import {MODULES, type ModuleKey} from '../../ModuleIdentity';
import {Button, Chip, Field, OptionRow, Segmented, Stack, Text, Tile} from '../../Parts/Shared';
import {ActionCard, EntryRow, FilterChips, HEATMAP_SAMPLE, KpiCard, NetBars, PlanTaskCard, StateBlock, StudyBars, StudyDonut, StudyHeatmap, TodayCard, WeekStrip, type HubState} from '../../Parts/Study';
import {Grid, ModuleHead, Panel, useInTablet, WCard} from '../../Parts/Web';
import {UI_SHADOW} from '../../Tokens';
import {EmbedStep} from '../Mobile/Lessons';
import {LessonFormulaScreen, LessonGroupScreen, LessonMatchScreen, LessonSectionScreen} from '../Mobile/LessonSteps';
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

const WebHomeBody: React.FC<{state?: HubState}> = ({state = 'plan'}) => {
	const t = useT();
	const colors = useColors();
	const tablet = useInTablet();
	return (
		<>
			<Stack row justify="space-between" align="flex-end">
				<Stack gap={4}>
					<Text role="small" size={14}>
						{t('Perşembe, 15 Ekim', 'Thursday, 15 October')}
					</Text>
					<Text role="title" size={30}>
						{t('Günaydın Ayşe', 'Good morning, Ayşe')}
					</Text>
					<Stack row gap={6}>
						<Icon name="target" size={15} color={colors.ink2} />
						<Text role="small" color={colors.ink2}>
							{t('Hedef', 'Goal')} <b style={{color: colors.ink}}>{t('TYT · 227 gün kaldı', 'TYT · 227 days left')}</b>
						</Text>
					</Stack>
				</Stack>
				<Chip tone="warning" icon="flame">
					{state === 'done' ? t('6 gün seri', '6-day streak') : t('5 gün seri', '5-day streak')}
				</Chip>
			</Stack>
			<Grid columns="1.3fr 1fr">
				<TodayCard state={state} />
				<WCard>
					<Stack gap={14}>
						<WeekStrip done={state === 'noPlan' ? [] : state === 'done' ? [0, 1, 2, 3] : [0, 1, 2]} share={state === 'done' ? 1 : state === 'noPlan' ? 0 : 0.4} />
						<Stack row gap={10}>
							<KpiCard compact icon="clock" label={t('Bu hafta', 'This week')} value={state === 'noPlan' ? '—' : t('4 sa 10 dk', '4 h 10 m')} delta={state === 'noPlan' ? undefined : '%22'} />
							<KpiCard compact icon="target" label={t('Doğru oranı', 'Accuracy')} value={state === 'noPlan' ? '—' : '%62'} delta={state === 'noPlan' ? undefined : '%6'} />
						</Stack>
					</Stack>
				</WCard>
			</Grid>
			<Grid columns="1fr 1fr 1.1fr">
				{state === 'noPlan' ? (
					<ActionCard module="lessons" over={t('İlk adımın', 'First step')} title={t('Gerçek anlam', 'Literal meaning')} line={t('TYT Türkçe · ilk mikro ders', 'TYT Turkish · first micro-lesson')} action={t('Başla', 'Start')} icon="book" meter={{progress: 0, label: t('6 adım · 4 dk', '6 steps · 4 min')}} />
				) : (
					<ActionCard module="lessons" over={t('Kaldığın yerden', 'Continue')} title={t('Mecaz anlam', 'Figurative meaning')} line={t('Sözcükte Anlam · 4 dk kaldı', 'Word meaning · 4 min left')} action={state === 'expired' ? t('Paketleri gör', 'See plans') : t('Devam et', 'Continue')} icon="book" meter={state === 'expired' ? {locked: t('Abone olunca açılır', 'Opens with a plan')} : {progress: 0.4, label: t('2 / 5 adım', '2 / 5 steps')}} />
				)}
				<ActionCard module="exam" over={t('Sıradaki deneme', 'Next exam')} title={t('TYT Deneme 5', 'TYT Exam 5')} line={t('Cumartesi 10:00 · 12.480 kişi', 'Saturday 10:00 · 12,480 joined')} action={t('Hatırlat', 'Remind me')} icon="exam" meter={{countdown: [['2', t('gün', 'days')], ['4', t('saat', 'hours')], ['15', t('dk', 'min')]]}} />
				<ReviewCard />
			</Grid>
			<Grid columns="1.3fr 1fr">
				<WCard title={t('Bu hafta', 'This week')} action={t('İstatistiklerim', 'My statistics')}>
					<StudyBars
						height={tablet ? 56 : 110}
						active={3}
						tooltip={state === 'noPlan' ? undefined : {title: t('Perşembe', 'Thursday'), rows: [[t('Planlanan', 'Planned'), t('90 dk', '90 min')], [t('Çalışılan', 'Studied'), t('45 dk', '45 min')]]}}
						bars={DAYS(t).map((label, day) => ({label, parts: (state === 'noPlan' ? [['lessons', 0]] : [['lessons', [30, 20, 40, 25, 0, 0, 0][day]], ['tests', [10, 25, 0, 20, 0, 0, 0][day]], ['exam', [0, 0, 55, 0, 0, 0, 0][day]], ['flashcards', [5, 10, 0, 0, 0, 0, 0][day]]]) as [ModuleKey, number][]}))}
					/>
				</WCard>
				<WCard title={t('Modüller', 'Modules')} action={t('Tümü', 'All')}>
					<Grid columns="1fr 1fr 1fr" gap={10}>
						{(['exam', 'lessons', 'tests', 'studyPlan', 'smartSummary', 'flashcards'] as ModuleKey[]).map((key) => (
							<Stack key={key} row gap={10} style={{padding: '9px 10px', borderRadius: 14, border: `1px solid ${colors.line}`}}>
								<Tile module={key} size={32} />
								<Text role="headline" size={13.5}>
									{t(MODULES[key].name)}
								</Text>
							</Stack>
						))}
					</Grid>
				</WCard>
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
	return (
		<Panel
			active="home"
			overlay={
				<div style={{position: 'absolute', inset: 0, zIndex: 30}}>
					<div style={{position: 'absolute', left: 282, top: 196, width: 640, height: 300, borderRadius: 28, boxShadow: '0 0 0 4px rgba(255,255,255,0.95), 0 0 0 3000px rgba(11,28,48,0.6)'}} />
					<div style={{position: 'absolute', left: 300, top: 520, width: 440, borderRadius: 22, background: colors.card, padding: 20}}>
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

export const WebPlanTodayScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('studyPlan');
	return (
		<Panel active="studyPlan">
			<ModuleHead
				module="studyPlan"
				tabs={PLAN_TABS(t)}
				title={t('Bugün · Perşembe 15 Ekim', 'Today · Thursday 15 Oct')}
				sub={t('5 görev · 90 dk hedef · seri 5 gün', '5 tasks · 90 min goal · 5-day streak')}
				actions={
					<Stack row gap={10}>
						<div style={{width: 230}}>
							<Segmented items={[t('Gün', 'Day'), t('Hafta', 'Week'), t('Ay', 'Month')]} module="studyPlan" />
						</div>
						<Button tone="module" module="studyPlan" icon="plus">
							{t('Görev ekle', 'Add task')}
						</Button>
					</Stack>
				}
			/>
			<FilterChips items={[t('Tümü · 5', 'All · 5'), t('Dersler', 'Lessons'), t('Testler', 'Quizzes'), t('Denemeler', 'Exams'), t('Tekrar', 'Review'), t('Kendi görevlerim', 'My tasks')]} />
			<Grid columns="1.7fr 1fr">
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
							<PlanTaskCard module="lessons" source={t('TYT Türkçe · Dersler', 'TYT Turkish · Lessons')} title={t('Sözcükte Anlam', 'Word meaning')} amount={t('3 mikro ders · 8 dk', '3 micro-lessons · 8 min')} done />
							<PlanTaskCard module="tests" source={t('TYT Matematik · denemende net kaybettin', 'TYT Maths · cost you nets')} title={t('Problemler · Orta', 'Problems · Medium')} amount={t('20 soru · 25 dk', '20 q · 25 min')} now />
							<PlanTaskCard module="flashcards" source={t('TYT Kimya · Bilgi Kartları', 'TYT Chemistry · Flashcards')} title={t('Mol kavramı', 'The mole')} amount={t('20 kart · 10 dk', '20 cards · 10 min')} />
							<PlanTaskCard module="exam" source={t('Sınavika · Türkiye geneli', 'Sınavika · nationwide')} title={t('TYT Deneme 5', 'TYT Exam 5')} amount="10:00 – 12:45" badge={t('Canlı deneme', 'Live exam')} />
							<PlanTaskCard module="own" source={t('Kendi görevin', 'Your own task')} title={t('Paragraf kitabı · 2 test', 'Reading book · 2 tests')} amount="18:00 – 18:40" />
						</Grid>
					</Stack>
				</WCard>
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
		</Panel>
	);
};

/* ------------------------------------------------------------------ Denemeler · Sonuçlar */

export const WebResultsScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<Panel active="exam">
			<ModuleHead module="exam" tab={2} title={t('Sonuçlar', 'Results')} sub={t('Netlerin, sıralaman ve gelişimin', 'Your nets, rank and progress')} />
			<Grid columns="1.6fr 1fr">
				<WCard>
					<Stack gap={14}>
						<Stack row justify="space-between">
							<Stack gap={1}>
								<Text role="headline" size={16}>
									{t('TYT net gelişimim', 'My TYT nets')}
								</Text>
								<Text role="small">{t('Son 5 deneme · çizgili: dışarıda çözdüğün', 'Last 5 · hatched: solved elsewhere')}</Text>
							</Stack>
							<div style={{width: 130}}>
								<Segmented items={['TYT', 'AYT']} module="exam" />
							</div>
						</Stack>
						<NetBars height={200} items={[[t('Deneme 2', 'Exam 2'), 64], [t('Deneme 3', 'Exam 3'), 72], [t('Yayın', 'Pub.'), 69.5, true], [t('Deneme 4', 'Exam 4'), 78.5], [t('Deneme 5', 'Exam 5'), 84.25]]} />
					</Stack>
				</WCard>
				<Stack gap={12}>
					<EntryRow module="exam" strong icon="exam" title={t('Sınavika denemelerim', 'My Sınavika exams')} sub={t('6 deneme · sonuç belgeleri', '6 exams · result documents')} />
					<EntryRow module="exam" icon="chart" title={t('Analizlerim', 'My analyses')} sub={t('Net kaybettiğin konular', 'Topics that cost nets')} />
					<EntryRow module="exam" icon="plus" title={t('Deneme ekle', 'Add an exam')} sub={t('Dışarıda çözdüğün', 'Solved elsewhere')} />
					<Stack row gap={8} style={{padding: '10px 14px', borderRadius: 14, background: colors.successSoft}}>
						<Icon name="trend" size={16} color={colors.successInk} />
						<Text role="small" weight={700} color={colors.successInk}>
							{t('Son 4 denemede +20,25 net', '+20.25 nets over the last 4')}
						</Text>
					</Stack>
				</Stack>
			</Grid>
			<WCard title={t('Son sonuçlar', 'Latest results')}>
				<ResultsTable />
			</WCard>
		</Panel>
	);
};

const ResultsTable: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const rows = [
		[t('TYT Deneme 5', 'TYT Exam 5'), t('19 Ekim', '19 Oct'), '84,25', '6.870', '+5,75'],
		[t('TYT Deneme 4', 'TYT Exam 4'), t('12 Ekim', '12 Oct'), '78,5', '8.214', '+9'],
		[t('Örnek Yayınları TYT 3', 'Sample Publishing TYT 3'), t('2 Kasım', '2 Nov'), '69,5', '—', ''],
	];
	const cell: React.CSSProperties = {padding: '10px 8px', borderBottom: `1px solid ${colors.line2}`};
	return (
		<table style={{width: '100%', borderCollapse: 'collapse', fontFamily: 'inherit'}}>
			<thead>
				<tr>
					{[t('Deneme', 'Exam'), t('Tarih', 'Date'), 'Net', t('Sıralama', 'Rank'), t('Değişim', 'Change'), ''].map((head) => (
						<th key={head} style={{...cell, textAlign: 'left', fontSize: 13, color: colors.muted, fontWeight: 700, background: colors.line2}}>
							{head}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{rows.map(([name, date, net, rank, delta]) => (
					<tr key={name}>
						<td style={{...cell, fontSize: 15, fontWeight: 700, color: colors.ink}}>{name}</td>
						<td style={{...cell, fontSize: 14, color: colors.ink2}}>{date}</td>
						<td style={{...cell, fontSize: 15, fontWeight: 800, color: colors.ink}}>{net}</td>
						<td style={{...cell, fontSize: 14, color: colors.ink2}}>{rank}</td>
						<td style={{...cell, fontSize: 14, fontWeight: 700, color: colors.successInk}}>{delta ? `↗ ${delta}` : ''}</td>
						<td style={{...cell, textAlign: 'right'}}>
							<Button tone="moduleSoft" module="exam" size="sm">
								{t('Analiz', 'Analysis')}
							</Button>
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
			<ModuleHead module="exam" tab={2} title={t('Sonuçlar', 'Results')} sub={t('Netlerin, sıralaman ve gelişimin', 'Your nets, rank and progress')} />
			<Grid columns="1.6fr 1fr">
				<StateBlock module="exam" icon="chart" title={t('İlk denemenden sonra burada', 'Here after your first exam')} text={t('Netin, sıralaman ve net kaybettiğin konular her denemeden sonra burada birikir.', 'Your nets, rank and the topics that cost you collect here.')} action={t('Sıradaki denemeye bak', 'See the next exam')} second={t('Dışarıda çözdüğün bir denemeyi ekle', 'Add an exam you solved elsewhere')} />
				<Stack gap={12}>
					<EntryRow module="exam" strong icon="exam" title={t('TYT Deneme 5', 'TYT Exam 5')} sub={t('Cumartesi 10:00 · 12.480 kişi', 'Saturday 10:00 · 12,480 joined')} />
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
		{label: t('1. hf', 'W1'), parts: [['lessons', 80], ['tests', 60], ['exam', 40], ['flashcards', 20]] as [ModuleKey, number][]},
		{label: t('2. hf', 'W2'), parts: [['lessons', 110], ['tests', 70], ['exam', 0], ['flashcards', 30]] as [ModuleKey, number][]},
		{label: t('3. hf', 'W3'), parts: [['lessons', 90], ['tests', 85], ['exam', 165], ['flashcards', 25]] as [ModuleKey, number][]},
		{label: t('4. hf', 'W4'), parts: [['lessons', 130], ['tests', 70], ['exam', 0], ['flashcards', 50]] as [ModuleKey, number][]},
		{label: t('Bu hf', 'Now'), parts: [['lessons', 110], ['tests', 85], ['exam', 55], ['flashcards', 0]] as [ModuleKey, number][]},
	];
	return (
		<Panel active="stats">
			<Stack row justify="space-between" align="flex-end">
				<Stack gap={2}>
					<Text role="title" size={28}>
						{t('İstatistiklerim', 'My statistics')}
					</Text>
					<Text role="small">{t('Çalışma süren, doğru oranın, netlerin ve en verimli saatlerin tek yerde.', 'Your time, accuracy, nets and best hours in one place.')}</Text>
				</Stack>
				<Stack row gap={10}>
					<div style={{width: 300}}>
						<Segmented items={[t('Bu hafta', 'This week'), t('Son 30 gün', '30 days'), t('Tümü', 'All')]} active={1} />
					</div>
					<Button tone="ghost" icon="file">
						{t('PDF olarak al', 'Download PDF')}
					</Button>
				</Stack>
			</Stack>
			<Stack row gap={14}>
				<KpiCard icon="clock" label={t('Çalışma süresi', 'Study time')} value={t('19 sa 40 dk', '19 h 40 m')} delta="%22" period={t('geçen 30 güne göre', 'vs previous 30 days')} />
				<KpiCard icon="quiz" label={t('Çözülen soru', 'Questions')} value="742" delta="%31" period={t('geçen 30 güne göre', 'vs previous 30 days')} />
				<KpiCard icon="target" label={t('Doğru oranı', 'Accuracy')} value="%62" delta="%6" period={t('geçen 30 güne göre', 'vs previous 30 days')} />
				<KpiCard icon="trend" label={t('TYT net', 'TYT net')} value="84,25" delta="5,75" period={t('son denemeye göre', 'vs last exam')} />
			</Stack>
			<Grid columns="1.35fr 1fr">
				<WCard title={t('Haftalık çalışma', 'Weekly study')} action={t('modüllere göre', 'by module')}>
					<StudyBars height={tablet ? 96 : 150} bars={weeks} active={2} tooltip={{title: t('3. hafta', 'Week 3'), rows: [[t('Planlanan', 'Planned'), t('6 sa', '6 h')], [t('Çalışılan', 'Studied'), t('6 sa 5 dk', '6 h 5 m')], [t('Deneme', 'Exam'), t('2 sa 45 dk', '2 h 45 m')]]}} />
				</WCard>
				<WCard title={t('Nerede çalıştın?', 'Where did you study?')}>
					<StudyDonut size={tablet ? 110 : 140} center={t('19 sa', '19 h')} sub={t('toplam', 'total')} parts={[['lessons', 520], ['tests', 370], ['exam', 260], ['flashcards', 125]]} />
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
		[t('Türkçe', 'Turkish'), '214', 0.75, t('6 sa 10 dk', '6 h 10 m'), '+%8', false],
		[t('Matematik', 'Maths'), '296', 0.58, t('7 sa 5 dk', '7 h 5 m'), '+%11', false],
		[t('Fizik', 'Physics'), '118', 0.4, t('3 sa', '3 h'), '−%3', true],
		[t('Kimya', 'Chemistry'), '114', 0.52, t('2 sa 20 dk', '2 h 20 m'), '+%4', false],
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
									%{Math.round(share * 100)}
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
		<div style={{position: 'absolute', inset: 0, background: 'rgba(11, 28, 48, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 40}}>
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
			<ModuleHead module="exam" tab={1} title={t('TYT Temel Matematik Denemesi · Kasım 2026', 'TYT Basic Maths · November 2026')} sub={t('Tamamlandı · 3 Kasım · 52 dk', 'Done · 3 Nov · 52 min')} actions={<Chip tone="success" icon="check">{t('Tamamlandı', 'Done')}</Chip>} />
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
							['lessons', 'book', t('Üslü sayılar', 'Exponents'), t('3 soru · 2 yanlış', '3 q · 2 wrong'), t('Mikro ders', 'Micro-lesson')],
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
					<Text role="headline">{t('Toplam net: 68,5', 'Total net: 68.5')}</Text>
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
	<StudyPlayer done={2} step="adım 3 / 6" nav={<><Back /><Main>Kontrol et</Main></>}>
		<EmbedStep>
			<LessonGroupScreen />
		</EmbedStep>
	</StudyPlayer>
);

export const WebLessonMatchScreen: React.FC = () => (
	<StudyPlayer done={3} step="adım 4 / 6" nav={<><Back /><Main>Kontrol et</Main></>}>
		<EmbedStep>
			<LessonMatchScreen />
		</EmbedStep>
	</StudyPlayer>
);

export const WebLessonFormulaScreen: React.FC = () => (
	<StudyPlayer done={1} step="adım 2 / 5" nav={<><Back /><Main>Devam</Main></>}>
		<EmbedStep>
			<LessonFormulaScreen />
		</EmbedStep>
	</StudyPlayer>
);

export const WebLessonSectionScreen: React.FC = () => (
	<StudyPlayer done={0} current={false} step="bölüm 2 / 4" nav={<><Back>Önceki bölüm</Back><Main>Başla</Main></>}>
		<EmbedStep>
			<LessonSectionScreen />
		</EmbedStep>
	</StudyPlayer>
);

/* ------------------------------------------------------------------ Testler · yanlışlarım */

export const WebTestWrongReviewScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('tests');
	return (
		<Panel active="tests">
			<ModuleHead module="tests" tab={2} title={t('Yanlışlarım · Temel Kavramlar', 'My mistakes · Basics')} sub={t('Kolay · 5 / 20 doğru · ilk yanlıştan açıldı', 'Easy · 5 / 20 · opened at the first mistake')} />
			<Grid columns="300px 1fr">
				<WCard>
					<Stack gap={10}>
						<Segmented items={[t('Yanlış · 15', 'Wrong · 15'), t('Boş · 0', 'Blank'), t('Tümü', 'All')]} module="tests" />
						<div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8}}>
							{Array.from({length: 20}, (_, index) => {
								const wrong = ![0, 1, 4, 9, 15].includes(index);
								const on = index === 2;
								return (
									<div key={index} style={{height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: on ? mod.action : wrong ? colors.errorSoft : colors.successSoft, border: `1.5px solid ${on ? mod.action : wrong ? colors.error : colors.success}`}}>
										<Text role="meta" weight={800} color={on ? '#FFFFFF' : wrong ? colors.errorInk : colors.successInk}>
											{index + 1}
										</Text>
									</div>
								);
							})}
						</div>
					</Stack>
				</WCard>
				<WCard>
					<Stack gap={12}>
						<Text role="meta">{t('Soru 3 / 20 · 1. yanlış', 'Question 3 / 20 · 1st mistake')}</Text>
						<Text role="body" size={18} weight={600} color={colors.ink}>
							{t('Aşağıdakilerden hangisi tam sayıdır ama doğal sayı değildir?', 'Which is an integer but not a natural number?')}
						</Text>
						<Grid columns="1fr 1fr" gap={10}>
							<OptionRow letter="A" text="−4" state="correct" />
							<OptionRow letter="B" text="0" />
							<OptionRow letter="C" text="3/2" state="wrong" />
							<OptionRow letter="D" text="7" />
						</Grid>
						<Text role="body">{t('Doğal sayılar 0 ve pozitif tam sayılardır. −4 tam sayıdır ama negatif olduğu için doğal değildir.', 'Natural numbers are 0 and the positive integers.')}</Text>
						<Stack row gap={10}>
							<Button tone="moduleSoft" module="lessons" icon="book">
								{t('Konuyu çalış', 'Study the topic')}
							</Button>
							<div style={{flex: 1}} />
							<Button tone="module" module="tests" iconRight="right">
								{t('Sonraki yanlış', 'Next mistake')}
							</Button>
						</Stack>
					</Stack>
				</WCard>
			</Grid>
		</Panel>
	);
};
