import React from 'react';
import {useColors, useModuleColors, useT} from '../../Context';
import {Icon} from '../../Icons';
import {MODULES, type ModuleKey} from '../../ModuleIdentity';
import {Bar, Bars, Button, Card, Chip, List, ListRow, Ring, Sparkline, Stack, Text, Tile, Toggle} from '../../Parts/Shared';
import {Grid, Immersive, ModuleHead, Panel, WCard} from '../../Parts/Web';
import {PlanTask} from '../Mobile/Plan';

/** Web Ders Planı: today, schedule, suggestions, statistics, progress, settings and the focus session. */

const PLAN_TABS = (t: (tr: string, en: string) => string) => [t('Bugün', 'Today'), t('Program', 'Schedule'), t('Öneriler', 'Suggestions'), t('İstatistik', 'Statistics'), t('İlerleme', 'Progress'), t('Ayarlar', 'Settings')];

export const WebPlanTodayScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('studyPlan');
	return (
		<Panel active="studyPlan">
			<ModuleHead module="studyPlan" tab={0} tabs={PLAN_TABS(t)} title={t('Bugün · Perşembe 15 Ekim', 'Today · Thursday 15 Oct')} sub={t('3 görev · 90 dakika hedef · seri 5 gün', '3 tasks · 90-minute goal · 5-day streak')} actions={<Button tone="module" module="studyPlan" icon="clock">{t('Odak sayacı', 'Focus timer')}</Button>} />
			<Grid columns="1.5fr 1fr">
				<WCard title={t('Görevler', 'Tasks')} action={t('+ Görev ekle', '+ Add task')}>
					<Stack gap={10}>
						<PlanTask module="lessons" title={t('Sözcükte Anlam', 'Word meaning')} meta={t('Dersler · 3 mikro ders · 8 dk · tamamlandı 09:40', 'Lessons · 3 micro-lessons · 8 min · done 09:40')} done />
						<PlanTask module="tests" title={t('Problemler · Orta', 'Problems · Medium')} meta={t('20 soru · 25 dk · denemeden önerildi', '20 questions · 25 min · from your exam')} now />
						<PlanTask module="flashcards" title={t('Kimya kartları', 'Chemistry cards')} meta={t('20 kart · 10 dk', '20 cards · 10 min')} />
						<PlanTask module="lessons" title={t('Bugün tekrar · 5 adım', 'Review today · 5 steps')} meta={t('Dersler · yanlış yaptığın adımlar · 4 dk', 'Lessons · steps you missed · 4 min')} />
					</Stack>
				</WCard>
				<Stack gap={18}>
					<Card padding={20}>
						<Stack row gap={18}>
							<Ring value={0.33} size={100} stroke={10} color={mod.color} track={mod.track}>
								<Text role="section">1/3</Text>
							</Ring>
							<Stack gap={4}>
								<Text role="section">{t('45 dk kaldı', '45 min left')}</Text>
								<Text role="small">{t('Bugünkü hedef 90 dk', 'Goal today 90 min')}</Text>
								<Chip tone="module" module="studyPlan" icon="flame">
									{t('Seri 5 gün', '5-day streak')}
								</Chip>
							</Stack>
						</Stack>
					</Card>
					<Card tone="module" module="studyPlan" padding={18}>
						<Stack row gap={10} align="flex-start">
							<Icon name="sparkles" size={18} color={mod.color} />
							<Text role="small" color={colors.ink2}>
								<b style={{color: colors.ink}}>{t('Plan önerisi:', 'Plan tip:')}</b> {t('Dün planın %80’ini yaptın. Cuma yükünü biraz azalttık, Pazar tekrar gününü koruduk.', 'You did 80% yesterday. We eased Friday and kept Sunday for review.')}
							</Text>
						</Stack>
					</Card>
				</Stack>
			</Grid>
		</Panel>
	);
};

export const WebPlanScheduleScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const days: [string, number, [ModuleKey, string, boolean][]][] = [
		[t('Pzt', 'Mon'), 12, [['lessons', t('Paragraf', 'Reading'), true], ['tests', t('Rasyonel', 'Rationals'), true]]],
		[t('Sal', 'Tue'), 13, [['exam', t('AYT Deneme 3', 'AYT Exam 3'), true]]],
		[t('Çar', 'Wed'), 14, [['lessons', t('Problemler', 'Problems'), true], ['flashcards', t('Kimya kartları', 'Chemistry cards'), true]]],
		[t('Per', 'Thu'), 15, [['lessons', t('Ana fikir', 'Main idea'), true], ['tests', t('Problemler S2', 'Problems L2'), false], ['flashcards', t('Kimya kartları', 'Chemistry cards'), false]]],
		[t('Cum', 'Fri'), 16, [['lessons', t('Kuvvet', 'Force'), false], ['tests', t('Paragraf S4', 'Reading L4'), false]]],
		[t('Cmt', 'Sat'), 17, [['exam', t('TYT Deneme 5', 'TYT Exam 5'), false]]],
		[t('Paz', 'Sun'), 18, [['studyPlan', t('Haftalık tekrar', 'Weekly review'), false]]],
	];
	return (
		<Panel active="studyPlan">
			<ModuleHead module="studyPlan" tab={1} tabs={PLAN_TABS(t)} title={t('Bu hafta', 'This week')} sub={t('12–18 Ekim · hedef 21 saat · 11 sa 20 dk tamam', '12–18 Oct · goal 21 h · 11 h 20 min done')} actions={<><Button tone="ghost" size="sm" icon="left" /><Button tone="ghost" size="sm" icon="right" /><Button tone="ghost" icon="edit">{t('Düzenle', 'Edit')}</Button></>} />
			<Grid columns="repeat(7, 1fr)" gap={10}>
				{days.map(([day, date, items]) => (
					<Card key={day} padding={12} style={{minHeight: 300, border: date === 15 ? `2px solid ${MODULES.studyPlan.color.light}` : undefined}}>
						<Stack row justify="space-between" style={{marginBottom: 10}}>
							<Text role="meta" color={date === 15 ? MODULES.studyPlan.color.light : colors.muted}>
								{day}
							</Text>
							<Text role="section">{date}</Text>
						</Stack>
						<Stack gap={8}>
							{items.map(([key, title, done]) => (
								<div key={title} style={{padding: '9px 10px', borderRadius: 12, background: `${MODULES[key].color.light}1F`, borderLeft: `3px solid ${MODULES[key].color.light}`, opacity: done ? 0.55 : 1}}>
									<Text role="headline" size={12.5} style={{textDecoration: done ? 'line-through' : undefined}}>
										{title}
									</Text>
									<Text role="meta" size={10.5}>
										{t(MODULES[key].name)}
									</Text>
								</div>
							))}
						</Stack>
					</Card>
				))}
			</Grid>
			<Stack row gap={14}>
				{(['lessons', 'tests', 'exam', 'flashcards', 'studyPlan'] as ModuleKey[]).map((key) => (
					<Stack key={key} row gap={6}>
						<div style={{width: 10, height: 10, borderRadius: 3, background: MODULES[key].color.light}} />
						<Text role="small">{t(MODULES[key].name)}</Text>
					</Stack>
				))}
			</Stack>
		</Panel>
	);
};

export const WebPlanSuggestionsScreen: React.FC = () => {
	const t = useT();
	return (
		<Panel active="studyPlan">
			<ModuleHead module="studyPlan" tab={2} tabs={PLAN_TABS(t)} title={t('Öneriler', 'Suggestions')} sub={t('Denemelerine ve tekrar zamanına göre', 'Based on your exams and review timing')} />
			<Grid columns="1fr 1fr 1fr">
				{([
					['exam', t('Denemeden', 'From your exam'), t('Problemler', 'Problems'), t('Son denemede −3,25 net. 2 mikro ders + 1 test.', '−3.25 last exam. 2 lessons + 1 quiz.')],
					['studyPlan', t('Tekrar zamanı', 'Due for review'), t('Türev · Zincir kuralı', 'Chain rule'), t('3 gün önce %45 başarı. 15 dk tekrar.', '45% three days ago. 15-minute review.')],
					['flashcards', t('Unutma eğrisi', 'Forgetting curve'), t('Osmanlı kartları', 'Ottoman cards'), t('10 kart unutulmak üzere.', '10 cards about to slip.')],
					['lessons', t('Dersler’den', 'From Lessons'), t('Sözcükte Anlam · Terim anlam', 'Word meaning · Terms'), t('Sıradaki mikro ders, 2 dakika.', 'Your next micro-lesson, 2 minutes.')],
					['tests', t('Seviye atla', 'Level up'), t('Paragraf · Zor', 'Reading · Hard'), t('Orta seviyeyi %90 ile geçtin.', 'You passed Medium with 90%.')],
					['sinoAi', 'SinoAI', t('Kişisel deneme', 'Personal exam'), t('Eksiklerinden 30 soruluk deneme.', 'A 30-question exam on your gaps.')],
				] as [ModuleKey, string, string, string][]).map(([key, over, title, text]) => (
					<Card key={title} padding={18} tone="moduleLine" module={key}>
						<Stack gap={10}>
							<Stack row gap={10}>
								<Tile module={key} size={40} />
								<Chip tone="module" module={key} size="sm">
									{over}
								</Chip>
							</Stack>
							<Text role="section">{title}</Text>
							<Text role="small">{text}</Text>
							<Stack row gap={8}>
								<Button tone="moduleSoft" module={key} size="sm" icon="plus">
									{t('Plana ekle', 'Add to plan')}
								</Button>
								<Button tone="ghost" size="sm">
									{t('Sonra', 'Later')}
								</Button>
							</Stack>
						</Stack>
					</Card>
				))}
			</Grid>
		</Panel>
	);
};

export const WebPlanStatsScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('studyPlan');
	return (
		<Panel active="studyPlan">
			<ModuleHead module="studyPlan" tab={3} tabs={PLAN_TABS(t)} title={t('İstatistik', 'Statistics')} sub={t('Süre, uyum ve modül dağılımı', 'Time, adherence and module mix')} />
			<Grid columns="repeat(4, 1fr)" gap={14}>
				{[[t('Bu hafta', 'This week'), t('11 sa 20 dk', '11 h 20 m')], [t('Plana uyum', 'On plan'), '%86'], [t('En uzun seri', 'Longest streak'), t('12 gün', '12 days')], [t('Odak turu', 'Focus rounds'), '38']].map(([label, value]) => (
					<Card key={label} padding={18}>
						<Text role="meta">{label}</Text>
						<Text role="num" size={28}>
							{value}
						</Text>
					</Card>
				))}
			</Grid>
			<Grid columns="1.4fr 1fr">
				<WCard title={t('Günlere göre süre', 'Time by day')}>
					<Bars values={[0.6, 0.85, 0.4, 0.95, 0.7, 0.3, 0.05]} labels={[t('Pzt', 'Mon'), t('Sal', 'Tue'), t('Çar', 'Wed'), t('Per', 'Thu'), t('Cum', 'Fri'), t('Cmt', 'Sat'), t('Paz', 'Sun')]} highlight={3} color={mod.color} height={170} barWidth={46} />
				</WCard>
				<WCard title={t('Modüllere göre', 'By module')}>
					<Stack gap={12}>
						{(['lessons', 'tests', 'exam', 'flashcards', 'smartSummary'] as ModuleKey[]).map((key, index) => (
							<Stack key={key} row gap={12}>
								<Tile module={key} size={30} />
								<Text role="small" weight={700} color={colors.ink} style={{width: 110}}>
									{t(MODULES[key].name)}
								</Text>
								<Bar value={[0.42, 0.24, 0.18, 0.1, 0.06][index]} color={MODULES[key].color.light} />
								<Text role="meta" style={{width: 34, textAlign: 'right'}}>
									%{[42, 24, 18, 10, 6][index]}
								</Text>
							</Stack>
						))}
					</Stack>
				</WCard>
			</Grid>
		</Panel>
	);
};

export const WebPlanProgressScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('studyPlan');
	return (
		<Panel active="studyPlan">
			<ModuleHead module="studyPlan" tab={4} tabs={PLAN_TABS(t)} title={t('İlerleme', 'Progress')} sub={t('Hedefe giden yol ve konu ilerlemesi', 'Road to your goal and topic progress')} />
			<Grid columns="1.3fr 1fr">
				<WCard title={t('Hedefe giden yol', 'Road to your goal')}>
					<Stack row justify="space-between">
						<Text role="num" size={32}>
							48 → <span>78</span>
						</Text>
						<Chip tone="success" icon="trend">
							{t('3 hafta erken', '3 weeks early')}
						</Chip>
					</Stack>
					<div style={{marginTop: 12}}>
						<Sparkline points={[0.1, 0.18, 0.24, 0.38, 0.46, 0.55]} width={560} height={150} />
					</div>
					<Text role="small">{t('Bu hızla hedefine sınavdan 3 hafta önce ulaşıyorsun.', 'At this pace you reach it 3 weeks before the exam.')}</Text>
				</WCard>
				<Stack gap={18}>
					<Grid columns="1fr 1fr" gap={12}>
						{[['38', t('Tamamlandı', 'Done'), colors.success], ['12', t('Devam', 'Active'), mod.color], ['6', t('Tekrar', 'Review'), colors.warning], ['55', t('Başlanmadı', 'Not started'), colors.muted]].map(([value, label, color]) => (
							<Card key={label} padding={16}>
								<Text role="num" size={26} color={color}>
									{value}
								</Text>
								<Text role="meta">{label}</Text>
							</Card>
						))}
					</Grid>
					<WCard title={t('Tekrar gerekenler', 'Due for review')}>
						<List>
							<ListRow module="studyPlan" icon="refresh" title={t('Türev · Zincir kuralı', 'Chain rule')} subtitle={t('3 gün önce · %45', '3 days ago · 45%')} />
							<ListRow module="studyPlan" icon="refresh" title={t('Mol kavramı', 'The mole')} subtitle={t('1 hafta önce · %58', '1 week ago · 58%')} />
						</List>
					</WCard>
				</Stack>
			</Grid>
		</Panel>
	);
};

export const WebPlanSettingsScreen: React.FC = () => {
	const t = useT();
	return (
		<Panel active="studyPlan">
			<ModuleHead module="studyPlan" tab={5} tabs={PLAN_TABS(t)} title={t('Plan ayarları', 'Plan settings')} sub={t('Hedef, tempo ve günler', 'Goal, pace and days')} actions={<Button tone="module" module="studyPlan" icon="refresh">{t('Planı yeniden oluştur', 'Rebuild plan')}</Button>} />
			<Grid columns="1fr 1fr">
				<WCard title={t('Hedef ve tempo', 'Goal and pace')}>
					<List>
						<ListRow icon="target" plainIcon title={t('Hedef', 'Goal')} subtitle={t('YKS · 48 → 78 net', 'YKS · 48 → 78')} />
						<ListRow icon="clock" plainIcon title={t('Tempo', 'Pace')} subtitle={t('Dengeli · günde 3 saat', 'Balanced · 3 h a day')} />
						<ListRow icon="calendar" plainIcon title={t('Çalışma günleri', 'Study days')} subtitle={t('Pazartesi–Cumartesi · 18:00', 'Mon–Sat · 18:00')} />
						<ListRow icon="alert" plainIcon title={t('Zorlandığın dersler', 'Weak subjects')} subtitle={t('Matematik, Geometri, Kimya', 'Maths, Geometry, Chemistry')} />
					</List>
				</WCard>
				<WCard title={t('Otomatik güncelleme', 'Automatic updates')}>
					<List>
						<ListRow title={t('Denemeden sonra planı güncelle', 'Update after exams')} subtitle={t('Eksik konular eklenir', 'Gaps are added')} trailing={<Toggle on module="studyPlan" />} chevron={false} />
						<ListRow title={t('Tekrar zamanı gelenleri ekle', 'Add reviews when due')} subtitle={t('Unutma eğrisine göre', 'By the forgetting curve')} trailing={<Toggle on module="studyPlan" />} chevron={false} />
						<ListRow title={t('Pazar tekrar günü', 'Sunday review day')} trailing={<Toggle on module="studyPlan" />} chevron={false} />
						<ListRow title={t('Günlük hatırlatma', 'Daily reminder')} subtitle="08:00" trailing={<Toggle on module="studyPlan" />} chevron={false} />
					</List>
				</WCard>
			</Grid>
		</Panel>
	);
};

export const WebPlanFocusScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('studyPlan');
	return (
		<Immersive module="studyPlan" title={t('Odak · Problemler · Orta', 'Focus · Problems · Medium')} sub={t('Görev 2/3', 'Task 2/3')} right={<Button tone="ghost" icon="check">{t('Görevi bitir', 'Finish task')}</Button>}>
			<Stack align="center" justify="center" gap={22} style={{flex: 1, background: `radial-gradient(60% 60% at 50% 40%, ${mod.wash} 0%, ${colors.card} 70%)`}}>
				<Ring value={0.62} size={340} stroke={20} color={mod.color} track={mod.track}>
					<Stack align="center" gap={6}>
						<Text role="num" size={72}>
							09:24
						</Text>
						<Text role="small" size={15}>
							{t('25 dakikalık odak · 2/4 tur', '25-minute focus · round 2/4')}
						</Text>
					</Stack>
				</Ring>
				<Stack row gap={12}>
					<Button tone="ghost" size="lg" icon="x">
						{t('Bitir', 'End')}
					</Button>
					<Button tone="module" module="studyPlan" size="lg" icon="pause">
						{t('Duraklat', 'Pause')}
					</Button>
				</Stack>
				<Text role="small">{t('Mola sırasında bir sonraki görev hazırlanır: Kimya kartları.', 'During the break your next task gets ready: Chemistry cards.')}</Text>
			</Stack>
		</Immersive>
	);
};
