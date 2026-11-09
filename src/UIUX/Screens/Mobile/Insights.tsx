import React from 'react';
import {useColors, useModuleColors, useT} from '../../Context';
import {Icon} from '../../Icons';
import {MODULES, type ModuleKey} from '../../ModuleIdentity';
import {AppHeader, BottomBar, Content, FocusHeader, ModuleScreen, Phone, SectionTitle} from '../../Parts/Mobile';
import {Bar, Button, Card, Chip, OptionRow, Segmented, Sparkline, Stack, Text, Tile} from '../../Parts/Shared';
import {HEATMAP_SAMPLE, KpiCard, StudyBars, StudyHeatmap} from '../../Parts/Study';

/**
 * İstatistiklerim (Profil → İstatistikler; GET student statistics: study time
 * per day and module, solved questions, nets, streak) and the quiz's wrong
 * answer review. Revised 5 Nov 2026: the live screen showed a wall of zeros
 * in the first week; the first-week state now shows what to do instead.
 */

const DAY_MODULES: ModuleKey[] = ['lessons', 'tests', 'exam', 'flashcards'];

export const StatisticsScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<Phone>
			<AppHeader left="back" title={t('İstatistiklerim', 'My statistics')} right={<div style={{width: 40}} />} />
			<Content tabBar={false} gap={12}>
				<Segmented items={[t('Bu hafta', 'This week'), t('Son 30 gün', 'Last 30 days'), t('Tümü', 'All')]} />
				<Stack row gap={8}>
					<KpiCard compact icon="clock" label={t('Çalışma', 'Study')} value={t('4 sa', '4 h')} delta="%22" />
					<KpiCard compact icon="quiz" label={t('Soru', 'Questions')} value="176" delta="%31" />
					<KpiCard compact icon="target" label={t('Doğru', 'Accuracy')} value="%62" delta="%6" />
				</Stack>
				<Card padding={16}>
					<Stack gap={12}>
						<Stack row justify="space-between">
							<Text role="headline" size={16}>
								{t('Günlük çalışma', 'Daily study')}
							</Text>
							<Chip tone="success" icon="trend" size="sm">
								{t('geçen haftadan +%22', '+22% vs last week')}
							</Chip>
						</Stack>
						<StudyBars height={120} active={3} tooltip={{title: t('Perşembe', 'Thursday'), rows: [[t('Planlanan', 'Planned'), t('90 dk', '90 min')], [t('Çalışılan', 'Studied'), t('50 dk', '50 min')]]}} bars={[0, 1, 2, 3, 4, 5, 6].map((day) => ({label: ['P', 'S', 'Ç', 'P', 'C', 'C', 'P'][day], parts: DAY_MODULES.map((key, part) => [key, [[30, 10, 0, 5], [20, 25, 0, 10], [40, 0, 55, 0], [25, 20, 0, 5], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]][day][part]] as [ModuleKey, number])}))} />
						<Stack row gap={12} wrap>
							{DAY_MODULES.map((key) => (
								<Stack key={key} row gap={5}>
									<div style={{width: 9, height: 9, borderRadius: 3, background: MODULES[key].color.light}} />
									<Text role="meta">{t(MODULES[key].name)}</Text>
								</Stack>
							))}
						</Stack>
					</Stack>
				</Card>
				<Card padding={16}>
					<Stack gap={10}>
						<Stack row justify="space-between" align="flex-end">
							<Stack gap={1}>
								<Text role="headline" size={16}>
									{t('TYT net gelişimi', 'TYT net trend')}
								</Text>
								<Text role="small">{t('5 deneme', '5 exams')}</Text>
							</Stack>
							<Text role="section" color={useModuleColors('exam').ink}>
								84,25
							</Text>
						</Stack>
						<Sparkline points={[0.3, 0.42, 0.38, 0.58, 0.72]} width={318} height={70} color={MODULES.exam.color.light} />
					</Stack>
				</Card>
				<Card padding={16}>
					<Stack gap={10}>
						<Stack row justify="space-between">
							<Text role="headline" size={16}>
								{t('En verimli saatlerin', 'Your best hours')}
							</Text>
							<Text role="meta">{t('doğru oranına göre', 'by accuracy')}</Text>
						</Stack>
						<StudyHeatmap cells={HEATMAP_SAMPLE} days={['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day, index) => t(day, ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]))} hours={['06', '09', '12', '15', '18', '20', '22', '24']} cell={26} />
						<Text role="small" color={colors.ink2}>
							{t('Hafta içi 18:00–20:00 en çok doğru yapıyorsun.', 'You are most accurate 18:00–20:00 on weekdays.')}
						</Text>
					</Stack>
				</Card>
				<SectionTitle title={t('Derslere göre', 'By subject')} action={t('Tümü', 'All')} />
				<Card padding={14}>
					<Stack gap={12}>
						{[
							[t('Matematik', 'Maths'), t('82 soru · %58 doğru · 1 sa 30 dk', '82 q · 58% · 1 h 30 m'), 0.58],
							[t('Türkçe', 'Turkish'), t('64 soru · %75 doğru · 1 sa 50 dk', '64 q · 75% · 1 h 50 m'), 0.75],
							[t('Fizik', 'Physics'), t('30 soru · %40 doğru · 50 dk', '30 q · 40% · 50 m'), 0.4],
						].map(([name, sub, value]) => (
							<Stack key={name as string} gap={5}>
								<Stack row justify="space-between">
									<Text role="headline">{name}</Text>
									<Text role="small">{sub}</Text>
								</Stack>
								<Bar value={value as number} color={(value as number) < 0.5 ? colors.warning : colors.success} height={6} />
							</Stack>
						))}
					</Stack>
				</Card>
			</Content>
		</Phone>
	);
};

/** The first week: instead of zeros, three first steps; numbers appear as soon as there is data. */
export const StatisticsFirstWeekScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const Step: React.FC<{module: ModuleKey; title: string; sub: string; done?: boolean; action: string}> = ({module, title, sub, done, action}) => (
		<Stack row gap={12} style={{padding: 14, borderRadius: 20, background: colors.card, border: `1px solid ${colors.line}`, opacity: done ? 0.65 : 1}}>
			<Tile module={module} size={42} />
			<Stack grow gap={1}>
				<Text role="headline" style={{textDecoration: done ? 'line-through' : undefined}}>
					{title}
				</Text>
				<Text role="small">{sub}</Text>
			</Stack>
			{done ? <Icon name="checkCircle" size={22} color={colors.successInk} /> : <Button tone="moduleSoft" module={module} size="sm">{action}</Button>}
		</Stack>
	);
	return (
		<Phone>
			<AppHeader left="back" title={t('İstatistiklerim', 'My statistics')} right={<div style={{width: 40}} />} />
			<Content tabBar={false} gap={12}>
				<Card padding={18} tone="soft">
					<Stack gap={6}>
						<Text role="over">{t('İlk haftan', 'Your first week')}</Text>
						<Text role="title" size={21}>
							{t('Grafiklerin ilk çalışmanla dolmaya başlar', 'Your charts fill in from your first session')}
						</Text>
						<Text role="small">{t('Bu üç adımdan sonra çalışma süren, doğru oranın ve net gelişimin burada.', 'After these three steps your time, accuracy and nets appear here.')}</Text>
						<div style={{marginTop: 6}}>
							<Bar value={0.34} height={8} />
						</div>
						<Text role="meta">{t('1 / 3 tamamlandı', '1 / 3 done')}</Text>
					</Stack>
				</Card>
				<Step module="lessons" title={t('İlk mikro dersini bitir', 'Finish your first micro-lesson')} sub={t('Sözcükte Anlam · 4 dk', 'Word meaning · 4 min')} done action={t('Başla', 'Start')} />
				<Step module="tests" title={t('Bir test çöz', 'Solve a quiz')} sub={t('Temel Kavramlar · Kolay · 20 soru', 'Basics · Easy · 20 q')} action={t('Başla', 'Start')} />
				<Step module="exam" title={t('İlk denemene katıl', 'Join your first exam')} sub={t('TYT Deneme 5 · Cumartesi 10:00', 'TYT Exam 5 · Saturday 10:00')} action={t('Hatırlat', 'Remind')} />
			</Content>
		</Phone>
	);
};

/** After a quiz, "Yanlışlarımı incele" opens on the first wrong answer; filters for wrong, blank, all. */
export const TestWrongReviewScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('tests');
	const lessons = useModuleColors('lessons');
	return (
		<ModuleScreen module="tests" noTabBar header={<FocusHeader left="left" title={t('Yanlışlarım', 'My mistakes')} sub={t('Temel Kavramlar · Kolay', 'Basics · Easy')} />}>
			<Stack gap={10} style={{padding: '0 18px'}}>
				<Segmented items={[t('Yanlış · 15', 'Wrong · 15'), t('Boş · 0', 'Blank · 0'), t('Tümü · 20', 'All · 20')]} module="tests" />
				<Stack row gap={6}>
					{[3, 4, 6, 7, 9, 11, 12, 14].map((number, index) => (
						<div key={number} style={{width: 34, height: 34, borderRadius: 10, background: index === 0 ? mod.action : colors.errorSoft, border: `1.5px solid ${index === 0 ? mod.action : colors.error}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							<Text role="meta" weight={800} color={index === 0 ? '#FFFFFF' : colors.errorInk}>
								{number}
							</Text>
						</div>
					))}
					<Text role="meta">+7</Text>
				</Stack>
			</Stack>
			<Content tabBar={false} gap={10} padding="12px 18px 10px">
				<Text role="meta">{t('Soru 3 / 20 · 1. yanlış', 'Question 3 / 20 · 1st mistake')}</Text>
				<Text role="body" size={17} weight={600} color={colors.ink} style={{lineHeight: '26px'}}>
					{t('Aşağıdakilerden hangisi tam sayıdır ama doğal sayı değildir?', 'Which is an integer but not a natural number?')}
				</Text>
				<OptionRow letter="A" text="−4" state="correct" />
				<OptionRow letter="B" text="0" />
				<OptionRow letter="C" text="3/2" state="wrong" />
				<OptionRow letter="D" text="7" />
				<Card padding={14}>
					<Stack gap={6}>
						<Text role="headline">{t('Neden −4?', 'Why −4?')}</Text>
						<Text role="small" color={colors.ink2}>
							{t('Doğal sayılar 0 ve pozitif tam sayılardır. 3/2 tam sayı değildir; −4 tam sayıdır ama negatif olduğu için doğal değildir.', 'Natural numbers are 0 and the positive integers.')}
						</Text>
						<Text role="meta">{t('Öğrencilerin %50’si bildi', '50% got it right')}</Text>
					</Stack>
				</Card>
			</Content>
			<BottomBar>
				<Stack row gap={10}>
					<Button tone="moduleSoft" module="lessons" icon="book" style={{flex: 1, color: lessons.ink}}>
						{t('Konuyu çalış', 'Study the topic')}
					</Button>
					<Button tone="module" module="tests" iconRight="right" style={{flex: 1}}>
						{t('Sonraki yanlış', 'Next mistake')}
					</Button>
				</Stack>
			</BottomBar>
		</ModuleScreen>
	);
};
