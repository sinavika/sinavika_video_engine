import React from 'react';
import {useColors, useModuleColors, useT} from '../../Context';
import {Icon, type UIIconName} from '../../Icons';
import {MODULES, type ModuleKey} from '../../ModuleIdentity';
import {AppHeader, BottomBar, Content, FocusHeader, ModuleScreen, PageTitle, SectionTitle, Sheet} from '../../Parts/Mobile';
import {Bar, Bars, Button, Card, Chip, Field, List, ListRow, Ring, Segmented, Sparkline, Stack, Text, Tile, Toggle} from '../../Parts/Shared';
import {FilterChips, PlanTaskCard} from '../../Parts/Study';
import {UI_SHADOW} from '../../Tokens';

/** Ders Planı: today, focus timer, progress, schedule and plan settings. Tabs: Bugün · İlerleme · Modüller · Program · Profil. */

/** A plan task: the module's colour on its left edge, a tick when done. */
export const PlanTask: React.FC<{module: ModuleKey; title: string; meta: string; done?: boolean; now?: boolean}> = ({module, title, meta, done, now}) => {
	const colors = useColors();
	const color = MODULES[module].color.light;
	return (
		<Stack row gap={12} style={{padding: '12px 14px', borderRadius: 18, background: colors.card, border: `1.5px solid ${now ? color : colors.line}`, borderLeft: `5px solid ${color}`, opacity: done ? 0.7 : 1}}>
			<div style={{width: 24, height: 24, borderRadius: 8, background: done ? color : 'transparent', border: done ? undefined : `2px solid ${now ? color : colors.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
				{done ? <Icon name="check" size={14} color="#FFFFFF" /> : null}
			</div>
			<Stack grow gap={1}>
				<Text role="headline" style={{textDecoration: done ? 'line-through' : undefined}} color={done ? colors.muted : colors.ink}>
					{title}
				</Text>
				<Text role="small">{meta}</Text>
			</Stack>
			<Tile module={module} size={32} />
		</Stack>
	);
};



const DayRings: React.FC = () => {
	const colors = useColors();
	const mod = useModuleColors('studyPlan');
	const t = useT();
	const days = [t('Pzt', 'Mon'), t('Sal', 'Tue'), t('Çar', 'Wed'), t('Per', 'Thu'), t('Cum', 'Fri'), t('Cmt', 'Sat'), t('Paz', 'Sun')];
	const shares = [1, 1, 0.6, 0.4, 0, 0, 0];
	return (
		<Stack row justify="space-between">
			{days.map((day, index) => {
				const on = index === 3;
				return (
					<Stack key={day} align="center" gap={5} style={{width: 46, padding: '8px 0', borderRadius: 22, background: on ? colors.card : 'transparent', boxShadow: on ? UI_SHADOW.card : undefined}}>
						<Text role="meta" weight={on ? 800 : 600} color={on ? mod.ink : colors.muted}>
							{day}
						</Text>
						<div style={{position: 'relative', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							<svg width={36} height={36} style={{position: 'absolute', inset: 0, transform: 'rotate(-90deg)'}}>
								<circle cx={18} cy={18} r={16} fill={colors.card} stroke={colors.line} strokeWidth={1.5} strokeDasharray={index > 3 ? undefined : undefined} />
								{shares[index] > 0 ? <circle cx={18} cy={18} r={16} fill="none" stroke={shares[index] === 1 ? colors.success : mod.color} strokeWidth={2.6} strokeDasharray={`${shares[index] * 100.5} 100.5`} strokeLinecap="round" /> : null}
							</svg>
							<Text role="headline" size={14} tnum color={on ? mod.ink : colors.ink} style={{position: 'relative'}}>
								{12 + index}
							</Text>
						</div>
					</Stack>
				);
			})}
		</Stack>
	);
};

/**
 * Ders Planı · Bugün (revised 5 Nov 2026 after the owner's reference app):
 * day / week / month, filters by module, the week as progress rings, today's
 * share with the focus timer, and every task as a card that says where it
 * comes from and how much it is. "+" adds the student's own task
 * (POST study-plan tasks). Data: GET study-plan calendar, engagement/today.
 */
export const PlanTodayScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('studyPlan');
	return (
		<ModuleScreen
			module="studyPlan"
			tab={0}
			overlay={
				<div style={{position: 'absolute', right: 20, bottom: 110, width: 56, height: 56, borderRadius: 28, background: mod.action, boxShadow: UI_SHADOW.float, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 6}}>
					<Icon name="plus" size={26} color="#FFFFFF" />
				</div>
			}
		>
			<Content gap={12}>
				<Stack row justify="space-between">
					<Text role="title" size={26}>
						{t('Bugün', 'Today')}
					</Text>
					<div style={{width: 196}}>
						<Segmented items={[t('Gün', 'Day'), t('Hafta', 'Week'), t('Ay', 'Month')]} module="studyPlan" />
					</div>
				</Stack>
				<FilterChips items={[t('Tümü · 5', 'All · 5'), t('Dersler', 'Lessons'), t('Testler', 'Quizzes'), t('Denemeler', 'Exams'), t('Tekrar', 'Review'), t('Kendi görevlerim', 'My tasks')]} />
				<DayRings />
				<Stack gap={8}>
					<Stack row justify="space-between">
						<Text role="headline">{t('15 Ekim Perşembe', 'Thursday 15 October')}</Text>
						<Stack row gap={6}>
							<Icon name="clock" size={15} color={mod.ink} />
							<Text role="small" weight={700} color={mod.ink} tnum>
								{t('45 / 90 dk', '45 / 90 min')}
							</Text>
						</Stack>
					</Stack>
					<div style={{position: 'relative', height: 10, borderRadius: 5, background: mod.track}}>
						<div style={{width: '45%', height: '100%', borderRadius: 5, background: mod.color}} />
						<div style={{position: 'absolute', left: 'calc(45% - 22px)', top: -8, padding: '2px 8px', borderRadius: 10, background: mod.action}}>
							<Text role="meta" size={12} weight={800} color="#FFFFFF">
								%45
							</Text>
						</div>
					</div>
				</Stack>
				<Stack gap={9}>
					<PlanTaskCard module="lessons" source={t('TYT Türkçe · Dersler', 'TYT Turkish · Lessons')} title={t('Sözcükte Anlam', 'Word meaning')} amount={t('3 mikro ders · 8 dk', '3 micro-lessons · 8 min')} done />
					<PlanTaskCard module="tests" source={t('TYT Matematik · denemende net kaybettin', 'TYT Maths · you lost nets here')} title={t('Problemler · Orta', 'Problems · Medium')} amount={t('20 soru · 25 dk', '20 questions · 25 min')} now />
					<PlanTaskCard module="flashcards" source={t('TYT Kimya · Bilgi Kartları', 'TYT Chemistry · Flashcards')} title={t('Mol kavramı', 'The mole')} amount={t('20 kart · 10 dk', '20 cards · 10 min')} />
					<PlanTaskCard module="exam" source={t('Sınavika · Türkiye geneli', 'Sınavika · nationwide')} title={t('TYT Deneme 5', 'TYT Exam 5')} amount="10:00 – 12:45" badge={t('Canlı deneme', 'Live exam')} />
					<PlanTaskCard module="own" source={t('Kendi görevin', 'Your own task')} title={t('Paragraf kitabı · 2 test', 'Reading book · 2 tests')} amount="18:00 – 18:40" />
				</Stack>
				<div style={{height: 4, background: colors.bg}} />
			</Content>
		</ModuleScreen>
	);
};

/** Adding the student's own task (POST study-plan tasks: type, lesson, topic, day, time, minutes). */
export const PlanAddTaskScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('studyPlan');
	const Pill: React.FC<{label: string; on?: boolean}> = ({label, on}) => (
		<div style={{padding: '9px 14px', borderRadius: 14, background: on ? mod.soft : colors.card, border: `1.5px solid ${on ? mod.color : colors.line}`}}>
			<Text role="small" weight={700} color={on ? mod.ink : colors.ink2}>
				{label}
			</Text>
		</div>
	);
	return (
		<ModuleScreen
			module="studyPlan"
			tab={0}
			overlay={
				<Sheet height={640}>
					<Stack row justify="space-between">
						<Text role="section" size={19}>
							{t('Görev ekle', 'Add a task')}
						</Text>
						<Icon name="x" size={22} color={colors.ink2} />
					</Stack>
					<Stack gap={8}>
						<Text role="meta">{t('Ne yapacaksın?', 'What will you do?')}</Text>
						<Stack row gap={8} wrap>
							<Pill label={t('Konu çalış', 'Study a topic')} />
							<Pill label={t('Soru çöz', 'Solve questions')} on />
							<Pill label={t('Deneme', 'Exam')} />
							<Pill label={t('Tekrar', 'Review')} />
							<Pill label={t('Diğer', 'Other')} />
						</Stack>
					</Stack>
					<Field label={t('Ders ve konu', 'Subject and topic')} value={t('TYT Türkçe · Paragraf', 'TYT Turkish · Reading')} icon="book" trailing={<Icon name="down" size={18} color={colors.muted} />} />
					<Field label={t('Not (isteğe bağlı)', 'Note (optional)')} value={t('Paragraf kitabı · 2 test', 'Reading book · 2 tests')} icon="edit" />
					<Stack gap={8}>
						<Text role="meta">{t('Ne zaman?', 'When?')}</Text>
						<Stack row gap={8}>
							<Pill label={t('Bugün', 'Today')} on />
							<Pill label={t('Yarın', 'Tomorrow')} />
							<Pill label={t('Tarih seç', 'Pick a date')} />
							<Pill label="18:00" />
						</Stack>
					</Stack>
					<Stack gap={8}>
						<Text role="meta">{t('Süre', 'Duration')}</Text>
						<Stack row gap={8}>
							<Pill label={t('15 dk', '15 min')} />
							<Pill label={t('25 dk', '25 min')} />
							<Pill label={t('40 dk', '40 min')} on />
							<Pill label={t('60 dk', '60 min')} />
						</Stack>
					</Stack>
					<div style={{flex: 1}} />
					<Button tone="module" module="studyPlan" size="lg" block icon="plus">
						{t('Plana ekle', 'Add to plan')}
					</Button>
				</Sheet>
			}
		>
			<Content gap={12}>
				<PageTitle module="studyPlan" title={t('Bugün', 'Today')} />
				<DayRings />
			</Content>
		</ModuleScreen>
	);
};

/** Long-press or tap on a task: start, start with focus, move to tomorrow, mark done (PATCH status / schedule). */
export const PlanTaskActionScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const Row: React.FC<{icon: UIIconName; label: string; sub?: string; tone?: string}> = ({icon, label, sub, tone}) => (
		<Stack row gap={14} style={{padding: '12px 4px'}}>
			<div style={{width: 40, height: 40, borderRadius: 13, background: colors.line2, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<Icon name={icon} size={20} color={tone ?? colors.ink2} />
			</div>
			<Stack grow gap={1}>
				<Text role="headline" color={tone}>
					{label}
				</Text>
				{sub ? <Text role="small">{sub}</Text> : null}
			</Stack>
		</Stack>
	);
	return (
		<ModuleScreen
			module="studyPlan"
			tab={0}
			overlay={
				<Sheet height={560}>
					<PlanTaskCard module="tests" source={t('TYT Matematik · denemende net kaybettin', 'TYT Maths · you lost nets here')} title={t('Problemler · Orta', 'Problems · Medium')} amount={t('20 soru · 25 dk', '20 questions · 25 min')} />
					<Button tone="module" module="tests" size="lg" block icon="play">
						{t('Testi başlat', 'Start the quiz')}
					</Button>
					<Stack gap={0}>
						<Row icon="clock" label={t('Odak sayacıyla başla', 'Start with the focus timer')} sub={t('25 dk odak, sonra 5 dk mola', '25 min focus, then a 5 min break')} />
						<Row icon="calendar" label={t('Yarına taşı', 'Move to tomorrow')} sub={t('Planın kalan günlere göre yeniden dağılır', 'The rest of your plan adjusts')} />
						<Row icon="check" label={t('Yaptım olarak işaretle', 'Mark as done')} sub={t('Uygulama dışında çözdüysen', 'If you did it outside the app')} />
						<Row icon="trash" label={t('Bugünden kaldır', 'Remove from today')} tone={colors.errorInk} />
					</Stack>
				</Sheet>
			}
		>
			<Content gap={12}>
				<PageTitle module="studyPlan" title={t('Bugün', 'Today')} />
				<DayRings />
			</Content>
		</ModuleScreen>
	);
};

export const PlanFocusScreen: React.FC = () => {
	const t = useT();
	const mod = useModuleColors('studyPlan');
	return (
		<ModuleScreen module="studyPlan" noTabBar header={<FocusHeader title={t('Odak', 'Focus')} sub={t('Problemler · Orta', 'Problems · Medium')} />}>
			<Content tabBar={false} gap={18} style={{alignItems: 'center', textAlign: 'center', paddingTop: 30}}>
				<Ring value={0.62} size={250} stroke={16} color={mod.color} track={mod.track}>
					<Stack align="center" gap={4}>
						<Text role="num" size={56}>
							09:24
						</Text>
						<Text role="small">{t('25 dakikalık odak', '25-minute focus')}</Text>
					</Stack>
				</Ring>
				<Stack row gap={8}>
					{[1, 1, 0, 0].map((done, index) => (
						<div key={index} style={{width: 26, height: 8, borderRadius: 4, background: done ? mod.color : mod.track}} />
					))}
				</Stack>
				<Text role="small">{t('2 / 4 tur · sonra 5 dk mola', 'Round 2 / 4 · then a 5 min break')}</Text>
				<Card padding={14} style={{width: '100%', textAlign: 'left'}}>
					<Stack row gap={12}>
						<Tile module="tests" size={40} />
						<Stack grow gap={1}>
							<Text role="headline">{t('Problemler · Orta', 'Problems · Medium')}</Text>
							<Text role="small">{t('Odak bitince teste geçersin', 'Quiz opens when focus ends')}</Text>
						</Stack>
					</Stack>
				</Card>
			</Content>
			<BottomBar>
				<Stack row gap={10}>
					<Button tone="ghost" size="lg" icon="x" style={{flex: 1}}>
						{t('Bitir', 'End')}
					</Button>
					<Button tone="module" module="studyPlan" size="lg" icon="pause" style={{flex: 1}}>
						{t('Duraklat', 'Pause')}
					</Button>
				</Stack>
			</BottomBar>
		</ModuleScreen>
	);
};

export const PlanProgressScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('studyPlan');
	return (
		<ModuleScreen module="studyPlan" tab={1}>
			<Content gap={12}>
				<PageTitle module="studyPlan" title={t('İlerleme', 'Progress')} />
				<Segmented items={[t('Bu hafta', 'This week'), t('Bu ay', 'This month'), t('Tümü', 'All')]} module="studyPlan" />
				<Card padding={16}>
					<Stack row justify="space-between" align="flex-start">
						<Stack gap={2}>
							<Text role="meta">{t('Çalışma süresi', 'Study time')}</Text>
							<Text role="num">{t('11 sa 20 dk', '11 h 20 min')}</Text>
						</Stack>
						<Chip tone="success" icon="trend">
							%18
						</Chip>
					</Stack>
					<div style={{marginTop: 14}}>
						<Bars values={[0.6, 0.85, 0.4, 0.95, 0.7, 0.3, 0.05]} labels={['P', 'S', 'Ç', 'P', 'C', 'C', 'P']} highlight={3} color={mod.color} height={90} barWidth={26} />
					</div>
				</Card>
				<Card padding={16}>
					<Stack row justify="space-between">
						<Text role="headline">{t('Hedefe giden yol', 'Road to your goal')}</Text>
						<Text role="small">
							48 → <b>78</b>
						</Text>
					</Stack>
					<div style={{marginTop: 8}}>
						<Sparkline points={[0.1, 0.18, 0.24, 0.38, 0.46]} width={318} height={80} />
					</div>
					<Text role="small">
						{t('Bu hızla hedefine', 'At this pace you reach it')} <b style={{color: colors.ink}}>{t('sınavdan 3 hafta önce', '3 weeks before the exam')}</b> {t('ulaşıyorsun.', '.')}
					</Text>
				</Card>
				<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10}}>
					{[['flame', t('5 gün', '5 days'), t('Seri', 'Streak')], ['checkCircle', '%86', t('Plana uyum', 'On plan')]].map(([icon, value, label]) => (
						<Card key={label} padding={14}>
							<Stack row gap={10}>
								<Tile icon={icon as 'flame'} module="studyPlan" size={36} />
								<Stack gap={0}>
									<Text role="section">{value}</Text>
									<Text role="meta">{label}</Text>
								</Stack>
							</Stack>
						</Card>
					))}
				</div>
			</Content>
		</ModuleScreen>
	);
};

export const PlanLessonProgressScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('studyPlan');
	return (
		<ModuleScreen module="studyPlan" tab={1} header={<AppHeader left="back" title={t('Konu ilerlemesi', 'Topic progress')} right={<div style={{width: 40}} />} />}>
			<Content gap={12}>
				<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10}}>
					{[['38', t('Tamamlandı', 'Done'), colors.success], ['12', t('Devam', 'Active'), mod.color], ['6', t('Tekrar', 'Review'), colors.warning], ['55', t('Başlanmadı', 'Not started'), colors.muted]].map(([value, label, color]) => (
						<Card key={label} padding={14}>
							<Text role="num" size={26} color={color}>
								{value}
							</Text>
							<Text role="meta">{label}</Text>
						</Card>
					))}
				</div>
				<SectionTitle title={t('Tekrar gerekenler', 'Due for review')} sub={t('Unutma eğrisine göre', 'Based on the forgetting curve')} />
				<List>
					{[
						['Türev · Zincir kuralı', 'Derivatives · Chain rule', '3 gün önce · %45', '3 days ago · 45%'],
						['Paragrafta ana fikir', 'Main idea', '5 gün önce · %62', '5 days ago · 62%'],
						['Mol kavramı', 'The mole', '1 hafta önce · %58', '1 week ago · 58%'],
					].map(([tr, en, subTr, subEn]) => (
						<ListRow key={tr} module="studyPlan" icon="refresh" title={t(tr, en)} subtitle={t(subTr, subEn)} trailing={<Chip tone="module" module="studyPlan" size="sm">{t('Ekle', 'Add')}</Chip>} />
					))}
				</List>
				<SectionTitle title={t('Derslere göre', 'By subject')} />
				<Card padding={14}>
					<Stack gap={10}>
						{[['Türkçe', 'Turkish', 0.64], ['Matematik', 'Maths', 0.38], ['Fen', 'Science', 0.3]].map(([tr, en, value]) => (
							<Stack key={tr as string} row gap={10}>
								<Text role="small" weight={700} color={colors.ink} style={{width: 80}}>
									{t(tr as string, en as string)}
								</Text>
								<Bar value={value as number} color={mod.color} track={mod.track} />
								<Text role="meta" style={{width: 34, textAlign: 'right'}}>
									%{Math.round((value as number) * 100)}
								</Text>
							</Stack>
						))}
					</Stack>
				</Card>
			</Content>
		</ModuleScreen>
	);
};

export const PlanScheduleScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const hours = ['18:00', '19:00', '20:00', '21:00'];
	const grid: (ModuleKey | null)[][] = [
		['lessons', 'lessons', 'exam', 'lessons', 'tests', 'exam', null],
		['tests', null, 'exam', 'tests', 'lessons', 'exam', 'studyPlan'],
		['flashcards', 'flashcards', 'exam', 'flashcards', null, 'exam', null],
		[null, 'tests', null, null, 'flashcards', null, null],
	];
	return (
		<ModuleScreen module="studyPlan" tab={2}>
			<Content gap={12}>
				<PageTitle module="studyPlan" title={t('Program', 'Schedule')} sub={t('12–18 Ekim · 21 saat', '12–18 Oct · 21 hours')} right={<Stack row gap={6}><Button tone="ghost" size="sm" icon="left" /><Button tone="ghost" size="sm" icon="right" /></Stack>} />
				<Card padding={10}>
					<Stack row gap={4} style={{paddingLeft: 40}}>
						{['P', 'S', 'Ç', 'P', 'C', 'C', 'P'].map((day, index) => (
							<Text key={index} role="meta" align="center" style={{flex: 1}} color={index === 3 ? MODULES.studyPlan.color.light : colors.muted}>
								{day}
							</Text>
						))}
					</Stack>
					{hours.map((hour, row) => (
						<Stack key={hour} row gap={4} style={{marginTop: 6}}>
							<Text role="meta" style={{width: 36}}>
								{hour}
							</Text>
							{grid[row].map((key, column) => (
								<div key={column} style={{flex: 1, height: 52, borderRadius: 10, background: key ? `${MODULES[key].color.light}22` : colors.line2, borderLeft: key ? `3px solid ${MODULES[key].color.light}` : undefined}} />
							))}
						</Stack>
					))}
				</Card>
				<Stack row wrap gap={10}>
					{(['lessons', 'tests', 'exam', 'flashcards', 'studyPlan'] as ModuleKey[]).map((key) => (
						<Stack key={key} row gap={5}>
							<div style={{width: 9, height: 9, borderRadius: 3, background: MODULES[key].color.light}} />
							<Text role="meta">{t(MODULES[key].name)}</Text>
						</Stack>
					))}
				</Stack>
				<List>
					<ListRow module="exam" title={t('TYT Deneme 5', 'TYT Exam 5')} subtitle={t('Cumartesi 17 Ekim · 10:00', 'Sat 17 Oct · 10:00')} />
					<ListRow module="studyPlan" icon="refresh" title={t('Haftalık tekrar', 'Weekly review')} subtitle={t('Pazar · 60 dk', 'Sunday · 60 min')} />
				</List>
			</Content>
		</ModuleScreen>
	);
};

export const PlanSettingsScreen: React.FC = () => {
	const t = useT();
	return (
		<ModuleScreen module="studyPlan" noTabBar header={<AppHeader left="back" title={t('Plan ayarları', 'Plan settings')} right={<div style={{width: 40}} />} />}>
			<Content tabBar={false} gap={12}>
				<Card tone="module" module="studyPlan" padding={14}>
					<Stack row gap={12}>
						<Tile module="studyPlan" icon="target" size={42} />
						<Stack grow gap={1}>
							<Text role="headline">{t('YKS · 48 → 78 net', 'YKS · 48 → 78')}</Text>
							<Text role="small">{t('Dengeli · günde 3 saat · 6 gün', 'Balanced · 3 h a day · 6 days')}</Text>
						</Stack>
						<Chip tone="outline">{t('Değiştir', 'Change')}</Chip>
					</Stack>
				</Card>
				<List>
					<ListRow title={t('Çalışma günleri', 'Study days')} subtitle={t('Pazartesi–Cumartesi', 'Monday–Saturday')} />
					<ListRow title={t('Başlangıç saati', 'Start time')} subtitle="18:00" />
					<ListRow title={t('Zorlandığın dersler', 'Weak subjects')} subtitle={t('Matematik, Geometri, Kimya', 'Maths, Geometry, Chemistry')} />
					<ListRow title={t('Haftalık tekrar günü', 'Weekly review day')} subtitle={t('Pazar', 'Sunday')} />
				</List>
				<List>
					<ListRow title={t('Denemeden sonra planı güncelle', 'Update plan after exams')} subtitle={t('Eksik konular otomatik eklenir', 'Gaps are added automatically')} trailing={<Toggle on module="studyPlan" />} chevron={false} />
					<ListRow title={t('Günlük hatırlatma', 'Daily reminder')} subtitle="08:00" trailing={<Toggle on module="studyPlan" />} chevron={false} />
				</List>
			</Content>
			<BottomBar>
				<Button tone="module" module="studyPlan" size="lg" block icon="refresh">
					{t('Planı yeniden oluştur', 'Rebuild plan')}
				</Button>
			</BottomBar>
		</ModuleScreen>
	);
};
