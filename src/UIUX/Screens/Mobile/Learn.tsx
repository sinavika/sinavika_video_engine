import React from 'react';
import {useColors, useModuleColors, useT} from '../../Context';
import {Icon} from '../../Icons';
import {MODULES} from '../../ModuleIdentity';
import {AppHeader, BottomBar, Content, FocusHeader, ModuleScreen, ModuleSlide, PageTitle, Phone, SectionTitle} from '../../Parts/Mobile';
import {Bar, Button, Card, Chip, Dots, Levels, List, ListRow, OptionRow, Ring, Segmented, Stack, Text, Tile} from '../../Parts/Shared';

/** Dersler (Works) and Testler (Quizzes). */

const LESSON_RINGS: [string, string, number, string][] = [
	['Türkçe', 'Turkish', 0.62, '16 / 25'],
	['Matematik', 'Maths', 0.38, '10 / 25'],
	['Geometri', 'Geometry', 0.2, '5 / 25'],
	['Fizik', 'Physics', 0.24, '6 / 25'],
];

export const LessonsHomeScreen: React.FC = () => {
	const t = useT();
	const mod = useModuleColors('lessons');
	return (
		<ModuleScreen module="lessons" tab={0}>
			<Content>
				<PageTitle module="lessons" title={t('Dersler', 'Lessons')} />
				<Stack gap={10}>
					<ModuleSlide module="lessons" height={176} />
					<Dots count={2} active={0} colors={[mod.color, mod.color]} />
				</Stack>
				<SectionTitle title={t('Derslerin', 'Your subjects')} sub={t('TYT · 9 ders', 'TYT · 9 subjects')} action={t('Tümü', 'All')} />
				<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10}}>
					{LESSON_RINGS.map(([tr, en, value, done]) => (
						<Card key={tr} padding={12}>
							<Stack row gap={10}>
								<Ring value={value} size={44} stroke={5} color={mod.color} track={mod.track}>
									<Text role="meta" size={10.5} weight={800}>
										%{Math.round(value * 100)}
									</Text>
								</Ring>
								<Stack gap={1}>
									<Text role="headline" size={14}>
										{t(tr, en)}
									</Text>
									<Text role="meta">
										{done} {t('konu', 'topics')}
									</Text>
								</Stack>
							</Stack>
						</Card>
					))}
				</div>
				<Card tone="module" module="lessons" padding={14}>
					<Stack row gap={12}>
						<Tile module="lessons" icon="trend" size={40} />
						<Stack grow gap={1}>
							<Text role="headline">{t('Öğrenme rotası', 'Learning path')}</Text>
							<Text role="small">{t('30 günlük program · 12. gün', '30-day programme · day 12')}</Text>
						</Stack>
						<Icon name="right" size={18} color={mod.color} />
					</Stack>
				</Card>
			</Content>
		</ModuleScreen>
	);
};

export const LessonsTreeScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('lessons');
	const topics: [string, string, 'done' | 'now' | 'weak' | 'next', string, string][] = [
		['Temel kavramlar', 'Basics', 'done', 'Tamamlandı', 'Done'],
		['Sayı basamakları', 'Digits', 'done', 'Tamamlandı', 'Done'],
		['Bölünebilme', 'Divisibility', 'done', 'Tamamlandı', 'Done'],
		['Rasyonel sayılar', 'Rationals', 'now', 'Devam ediyor · %40', 'In progress · 40%'],
		['Problemler', 'Problems', 'weak', 'Son denemede −3,25 net', '−3.25 in last exam'],
		['Oran ve orantı', 'Ratio', 'next', '4 mikro ders · 20 soru', '4 lessons · 20 questions'],
		['Fonksiyonlar', 'Functions', 'next', '5 mikro ders · 25 soru', '5 lessons · 25 questions'],
	];
	return (
		<ModuleScreen module="lessons" tab={1} header={<AppHeader left="back" title={t('Konu ağacı · Matematik', 'Topic tree · Maths')} right={<div style={{width: 40}} />} />}>
			<Content gap={12}>
				<Segmented items={[t('Tümü', 'All'), t('Eksiklerim · 6', 'Gaps · 6'), t('Biten', 'Done')]} module="lessons" />
				<Card padding={8}>
					{topics.map(([tr, en, state, subTr, subEn], index) => (
						<Stack key={tr} row gap={12} style={{position: 'relative', padding: '9px 8px', borderRadius: 14, background: state === 'now' ? mod.wash : undefined}}>
							{index < topics.length - 1 ? <div style={{position: 'absolute', left: 25, top: 44, bottom: -10, width: 2, background: state === 'done' ? mod.color : colors.line}} /> : null}
							<div style={{position: 'relative', width: 34, height: 34, borderRadius: 17, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: state === 'done' ? mod.color : state === 'weak' ? colors.errorSoft : state === 'now' ? colors.card : colors.line2, border: state === 'now' ? `3px solid ${mod.color}` : undefined, boxSizing: 'border-box'}}>
								{state === 'done' ? <Icon name="check" size={16} color="#FFFFFF" /> : state === 'weak' ? <Icon name="alert" size={16} color={colors.error} /> : state === 'now' ? <Icon name="play" size={14} color={mod.color} /> : <Text role="meta" weight={800}>{index + 1}</Text>}
							</div>
							<Stack grow gap={1}>
								<Text role="headline" color={state === 'next' ? colors.muted : colors.ink}>
									{t(tr, en)}
								</Text>
								<Text role="meta" color={state === 'weak' ? colors.error : colors.muted}>
									{t(subTr, subEn)}
								</Text>
							</Stack>
							{state === 'now' ? <Button tone="module" module="lessons" size="sm">{t('Devam', 'Resume')}</Button> : state === 'weak' ? <Chip tone="error" size="sm">{t('Öncelikli', 'Priority')}</Chip> : null}
						</Stack>
					))}
				</Card>
			</Content>
		</ModuleScreen>
	);
};

export const LessonFlowScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('lessons');
	return (
		<ModuleScreen module="lessons" noTabBar header={<FocusHeader title={t('Ana fikir bulma', 'Finding the main idea')} sub={t('Paragraf · Ders 4/9', 'Reading · Lesson 4/9')} steps={[2, 5]} />}>
			<Content tabBar={false} gap={14}>
				<div style={{position: 'relative', height: 230, borderRadius: 24, background: 'linear-gradient(160deg, #0B1220, #10243A)', overflow: 'hidden', padding: 16, boxSizing: 'border-box'}}>
					<Card padding={14} style={{position: 'relative'}}>
						<Text role="over" color={mod.color}>
							{t('Ana fikir', 'Main idea')}
						</Text>
						<Text role="headline" style={{marginTop: 6}}>
							{t('Yazarın okura asıl vermek istediği mesajdır. Genellikle ilk ya da son cümlededir.', 'The core message the writer wants to give. Usually the first or last sentence.')}
						</Text>
						<Stack row gap={6} style={{marginTop: 10}}>
							<Chip size="sm">{t('Giriş', 'Intro')}</Chip>
							<Icon name="right" size={12} color={colors.subtle} />
							<Chip size="sm">{t('Gelişme', 'Body')}</Chip>
							<Icon name="right" size={12} color={colors.subtle} />
							<Chip size="sm" tone="module" module="lessons">
								{t('Sonuç', 'End')}
							</Chip>
						</Stack>
					</Card>
					<Stack row gap={10} style={{position: 'absolute', left: 16, right: 16, bottom: 14}}>
						<Icon name="pause" size={18} color="#FFFFFF" />
						<Bar value={0.44} color="#38BDF8" track="rgba(255,255,255,0.2)" height={4} />
						<Text role="meta" color="#CBD5E1">
							2:48 / 6:10
						</Text>
					</Stack>
				</div>
				<SectionTitle title={t('Bu derste', 'In this lesson')} />
				<Stack gap={4}>
					{[
						[t('Ana fikir nedir?', 'What is a main idea?'), '1:20', 'done'],
						[t('Ana fikir nerede saklanır?', 'Where does it hide?'), '1:45', 'done'],
						[t('Çeldirici şıkları ele', 'Eliminate distractors'), '1:30', 'now'],
						[t('3 örnek soru', '3 practice questions'), '1:35', 'next'],
					].map(([title, time, state], index) => (
						<Stack key={title} row gap={12} style={{padding: '10px 12px', borderRadius: 14, background: state === 'now' ? mod.soft : undefined}}>
							<div style={{width: 26, height: 26, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', background: state === 'done' ? mod.color : state === 'now' ? colors.card : colors.line2, border: state === 'now' ? `2px solid ${mod.color}` : undefined, boxSizing: 'border-box'}}>
								{state === 'done' ? <Icon name="check" size={13} color="#FFFFFF" /> : <Text role="meta" weight={800} color={state === 'now' ? mod.color : colors.muted}>{index + 1}</Text>}
							</div>
							<Text role="headline" style={{flex: 1}}>
								{title}
							</Text>
							<Text role="meta">{time}</Text>
						</Stack>
					))}
				</Stack>
			</Content>
			<BottomBar border>
				<Stack row gap={10}>
					<Button tone="dark" icon="sparkles">
						{t('Sor', 'Ask')}
					</Button>
					<Button size="lg" iconRight="right" style={{flex: 1}}>
						{t('Sonraki bölüm', 'Next part')}
					</Button>
				</Stack>
			</BottomBar>
		</ModuleScreen>
	);
};

export const LessonDoneScreen: React.FC = () => {
	const t = useT();
	const mod = useModuleColors('lessons');
	return (
		<Phone bg={`linear-gradient(180deg, ${mod.soft} 0%, var(--ui-bg) 52%)`}>
			<Content tabBar={false} gap={16} style={{alignItems: 'center', textAlign: 'center', paddingTop: 50}}>
				<div style={{position: 'relative', width: 150, height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<div style={{position: 'absolute', inset: 0, borderRadius: 75, background: mod.soft}} />
					<div style={{width: 96, height: 96, borderRadius: 30, background: mod.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 18px 30px -12px rgba(2,132,199,0.6)'}}>
						<Icon name="award" size={48} color="#FFFFFF" />
					</div>
				</div>
				<Text role="hero" align="center">
					{t('Ders tamamlandı', 'Lesson complete')}
				</Text>
				<Text role="body" align="center">
					{t('Ana fikir bulma artık senin. Pekiştirmek için 10 soruluk bir test hazırladık.', 'Main idea mastered. We prepared a 10-question quiz to lock it in.')}
				</Text>
				<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, width: '100%'}}>
					{[['6 dk', t('süre', 'time')], ['3/3', t('örnek', 'examples')], ['+1', t('gün serisi', 'streak')]].map(([value, label]) => (
						<Card key={label} padding={12} style={{textAlign: 'center'}}>
							<Text role="section" align="center">
								{value}
							</Text>
							<Text role="meta" align="center">
								{label}
							</Text>
						</Card>
					))}
				</div>
				<Card tone="moduleLine" module="tests" padding={14} style={{width: '100%', textAlign: 'left'}}>
					<Stack row gap={12}>
						<Tile module="tests" size={40} />
						<Stack grow gap={1}>
							<Text role="headline">{t('Paragraf · Ana fikir testi', 'Reading · Main idea quiz')}</Text>
							<Text role="small">{t('10 soru · ~12 dk', '10 questions · ~12 min')}</Text>
						</Stack>
					</Stack>
				</Card>
			</Content>
			<BottomBar>
				<Button size="lg" block>
					{t('Testi çöz', 'Take the quiz')}
				</Button>
				<Button tone="ghost" size="lg" block>
					{t('Sonra, planıma dön', 'Later, back to my plan')}
				</Button>
			</BottomBar>
		</Phone>
	);
};

export const LessonsPathScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('lessons');
	return (
		<ModuleScreen module="lessons" tab={0} header={<AppHeader left="back" title={t('Öğrenme rotası', 'Learning path')} right={<div style={{width: 40}} />} />}>
			<Content gap={12}>
				<Card tone="module" module="lessons" padding={16}>
					<Stack row gap={14}>
						<Ring value={0.4} size={70} stroke={8} color={mod.color} track={mod.track}>
							<Text role="headline">12/30</Text>
						</Ring>
						<Stack gap={3} grow>
							<Text role="section">{t('30 günlük TYT kampı', '30-day TYT camp')}</Text>
							<Text role="small">{t('Her gün 45 dakika: mikro ders, test ve tekrar.', '45 minutes a day: lesson, quiz and review.')}</Text>
						</Stack>
					</Stack>
				</Card>
				<SectionTitle title={t('Bu hafta', 'This week')} />
				<Stack gap={8}>
					{[
						[12, t('Paragraf · Ana fikir', 'Reading · Main idea'), 'done'],
						[13, t('Rasyonel sayılar', 'Rationals'), 'now'],
						[14, t('Problemler · Yüzde', 'Problems · Percent'), 'next'],
						[15, t('Hücre zarı', 'Cell membrane'), 'next'],
						[16, t('Haftalık tekrar', 'Weekly review'), 'next'],
					].map(([day, title, state]) => (
						<Card key={day as number} padding={12} tone={state === 'now' ? 'moduleLine' : 'card'} module="lessons">
							<Stack row gap={12}>
								<Stack align="center" justify="center" style={{width: 42, height: 42, borderRadius: 13, background: state === 'done' ? mod.color : mod.soft}}>
									<Text role="meta" weight={800} color={state === 'done' ? '#FFFFFF' : mod.color}>
										{t('Gün', 'Day')}
									</Text>
									<Text role="headline" size={14} color={state === 'done' ? '#FFFFFF' : mod.color}>
										{day}
									</Text>
								</Stack>
								<Text role="headline" style={{flex: 1}}>
									{title}
								</Text>
								{state === 'done' ? <Icon name="checkCircle" size={22} color={colors.success} /> : state === 'now' ? <Button tone="module" module="lessons" size="sm">{t('Başla', 'Start')}</Button> : <Icon name="lock" size={18} color={colors.subtle} />}
							</Stack>
						</Card>
					))}
				</Stack>
			</Content>
		</ModuleScreen>
	);
};

export const LessonsHistoryScreen: React.FC = () => {
	const t = useT();
	return (
		<ModuleScreen module="lessons" tab={2}>
			<Content>
				<PageTitle module="lessons" title={t('Geçmiş', 'History')} sub={t('Bu hafta 3 sa 40 dk ders çalıştın', '3 h 40 min this week')} />
				<Text role="over">{t('Bugün', 'Today')}</Text>
				<List>
					<ListRow module="lessons" icon="checkCircle" title={t('Paragraf · Ana fikir', 'Reading · Main idea')} subtitle={t('Tamamlandı · 25 dk', 'Completed · 25 min')} />
					<ListRow module="lessons" icon="playCircle" title={t('Rasyonel sayılar', 'Rationals')} subtitle={t('Ders 2/5 · %40', 'Lesson 2/5 · 40%')} />
				</List>
				<Text role="over">{t('Bu hafta', 'This week')}</Text>
				<List>
					<ListRow module="lessons" icon="checkCircle" title={t('Sözcükte anlam', 'Word meaning')} subtitle={t('Pazartesi · 30 dk', 'Monday · 30 min')} />
					<ListRow module="lessons" icon="checkCircle" title={t('Hücre yapısı', 'Cell structure')} subtitle={t('Pazar · 20 dk', 'Sunday · 20 min')} />
					<ListRow module="lessons" icon="checkCircle" title={t('Sayı basamakları', 'Digits')} subtitle={t('Cumartesi · 35 dk', 'Saturday · 35 min')} />
				</List>
			</Content>
		</ModuleScreen>
	);
};

/* ------------------------------------------------------------------ Testler */

/** Lesson mains (Türkçe, Matematik…) with their quiz progress: the first level of every content module. */
export const LESSON_MAINS: [string, string, number, number][] = [
	['Türkçe', 'Turkish', 12, 30],
	['Matematik', 'Maths', 9, 35],
	['Geometri', 'Geometry', 3, 20],
	['Fizik', 'Physics', 5, 18],
	['Kimya', 'Chemistry', 4, 16],
	['Biyoloji', 'Biology', 2, 14],
];

export const TestsHomeScreen: React.FC = () => {
	const t = useT();
	const mod = useModuleColors('tests');
	return (
		<ModuleScreen module="tests" tab={0}>
			<Content>
				<PageTitle module="tests" title={t('Testler', 'Quizzes')} />
				<ModuleSlide module="tests" height={170} />
				<SectionTitle title={t('Dersler', 'Subjects')} sub={t('TYT · önce dersi seç', 'TYT · pick a subject first')} />
				<List>
					{LESSON_MAINS.map(([tr, en, done, total]) => (
						<ListRow key={tr} module="tests" icon="book" title={t(tr, en)} subtitle={`${done} / ${total} ${t('test', 'quizzes')}`} trailing={<Stack row gap={10}><div style={{width: 70}}><Bar value={done / total} color={mod.color} track={mod.track} height={6} /></div><Icon name="right" size={18} color="#94A3B8" /></Stack>} />
					))}
				</List>
			</Content>
		</ModuleScreen>
	);
};

export const TestsTopicsScreen: React.FC = () => {
	const t = useT();
	const mod = useModuleColors('tests');
	return (
		<ModuleScreen module="tests" tab={1} header={<AppHeader left="back" title={t('Matematik', 'Maths')} right={<div style={{width: 40}} />} />}>
			<Content gap={12}>
				<Card padding={14} tone="module" module="tests">
					<Stack row justify="space-between">
						<Stack gap={2}>
							<Text role="headline">{t('Matematik · konular', 'Maths · topics')}</Text>
							<Text role="small">{t('25 konu · 9 tamamlandı', '25 topics · 9 complete')}</Text>
						</Stack>
						<Ring value={0.36} size={48} stroke={5} color={mod.color} track={mod.track}>
							<Text role="meta" weight={800}>%36</Text>
						</Ring>
					</Stack>
				</Card>
				<List>
					{[
						['Temel kavramlar', 'Basics', 5],
						['Sayı basamakları', 'Digits', 4],
						['Rasyonel sayılar', 'Rationals', 2],
						['Problemler', 'Problems', 1],
						['Oran ve orantı', 'Ratio', 0],
						['Fonksiyonlar', 'Functions', 0],
					].map(([tr, en, done]) => (
						<ListRow key={tr as string} title={t(tr as string, en as string)} subtitle={`${done}/5 ${t('seviye', 'levels')}`} trailing={<Levels done={done as number} color={mod.color} />} />
					))}
				</List>
			</Content>
		</ModuleScreen>
	);
};

export const TestOverviewScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('tests');
	return (
		<ModuleScreen module="tests" noTabBar header={<AppHeader left="back" title={t('Problemler', 'Problems')} right={<div style={{width: 40}} />} />}>
			<Content tabBar={false}>
				<div style={{borderRadius: 24, background: mod.gradient, padding: 18, color: '#FFFFFF'}}>
					<Text role="over" color="rgba(255,255,255,0.85)">
						{t('Matematik · TYT', 'Maths · TYT')}
					</Text>
					<Text role="hero" color="#FFFFFF" style={{marginTop: 4}}>
						{t('Problemler', 'Word problems')}
					</Text>
					<Text role="small" color="rgba(255,255,255,0.9)">
						{t('Son denemede bu konuda 3,25 net kaybettin.', 'You lost 3.25 points here in the last exam.')}
					</Text>
				</div>
				<SectionTitle title={t('Seviyeler', 'Levels')} />
				<Stack gap={8}>
					{[
						[1, t('Temel', 'Basic'), '%90', 'done'],
						[2, t('Orta', 'Medium'), t('Sıradaki', 'Next'), 'now'],
						[3, t('Zor', 'Hard'), '', 'lock'],
						[4, t('Sınav düzeyi', 'Exam level'), '', 'lock'],
						[5, t('Ustalık', 'Mastery'), '', 'lock'],
					].map(([level, name, meta, state]) => (
						<Card key={level as number} padding={12} tone={state === 'now' ? 'moduleLine' : 'card'} module="tests">
							<Stack row gap={12}>
								<Stack align="center" justify="center" style={{width: 40, height: 40, borderRadius: 12, background: state === 'done' ? mod.color : mod.soft}}>
									<Text role="headline" color={state === 'done' ? '#FFFFFF' : mod.color}>
										{level}
									</Text>
								</Stack>
								<Stack grow gap={1}>
									<Text role="headline">{name}</Text>
									<Text role="small">{t('10 soru · ~12 dk', '10 questions · ~12 min')}</Text>
								</Stack>
								{state === 'done' ? <Chip tone="success" size="sm">{meta}</Chip> : state === 'now' ? <Chip tone="module" module="tests" size="sm">{meta}</Chip> : <Icon name="lock" size={18} color={colors.subtle} />}
							</Stack>
						</Card>
					))}
				</Stack>
			</Content>
			<BottomBar>
				<Button size="lg" block icon="play">
					{t('Seviye 2’yi başlat', 'Start level 2')}
				</Button>
			</BottomBar>
		</ModuleScreen>
	);
};

export const TestSolveScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('tests');
	return (
		<ModuleScreen module="tests" noTabBar header={<FocusHeader title={t('Soru 4 / 10', 'Question 4 / 10')} sub={t('Problemler · Seviye 2', 'Problems · Level 2')} right={<Chip tone="success">{t('3 doğru', '3 right')}</Chip>} />}>
			<Stack row gap={4} style={{padding: '0 16px'}}>
				{[1, 1, 1, 2, 0, 0, 0, 0, 0, 0].map((state, index) => (
					<div key={index} style={{flex: 1, height: 6, borderRadius: 3, background: state === 1 ? colors.success : state === 2 ? mod.color : colors.line2}} />
				))}
			</Stack>
			<Content tabBar={false} gap={12} padding="16px 18px 10px">
				<Text role="body" size={17} weight={600} color={colors.ink} style={{lineHeight: '26px'}}>
					{t('Bir mal %20 indirimle 240 TL’ye satılıyor. İndirimsiz fiyatı kaç TL’dir?', 'An item costs 240 after a 20% discount. What was the full price?')}
				</Text>
				<OptionRow letter="A" text="260" />
				<OptionRow letter="B" text="288" />
				<OptionRow letter="C" text="300" state="correct" />
				<OptionRow letter="D" text="320" />
			</Content>
			<div style={{background: colors.successSoft, borderTop: '2px solid #A7F3D0', padding: '16px 18px 34px', display: 'flex', flexDirection: 'column', gap: 12}}>
				<Stack row gap={10}>
					<div style={{width: 34, height: 34, borderRadius: 17, background: colors.success, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<Icon name="check" size={18} color="#FFFFFF" />
					</div>
					<Stack gap={2} grow>
						<Text role="headline" color="#065F46">
							{t('Doğru! Seriyi sürdürdün.', 'Correct! Streak kept.')}
						</Text>
						<Text role="small" color="#047857">
							{t('Fiyatın %80’i 240 → tamamı 240 ÷ 0,8 = 300.', '80% is 240 → full price 240 ÷ 0.8 = 300.')}
						</Text>
					</Stack>
				</Stack>
				<Button size="lg" block style={{background: colors.success, boxShadow: 'none'}}>
					{t('Devam', 'Continue')}
				</Button>
			</div>
		</ModuleScreen>
	);
};

export const TestDoneScreen: React.FC = () => {
	const t = useT();
	const mod = useModuleColors('tests');
	return (
		<ModuleScreen module="tests" noTabBar header={<AppHeader left="close" title={t('Test bitti', 'Quiz done')} right={<div style={{width: 40}} />} />}>
			<Content tabBar={false} gap={14} style={{alignItems: 'center', textAlign: 'center'}}>
				<Ring value={0.8} size={160} stroke={12} color={mod.color} track={mod.track}>
					<Stack align="center">
						<Text role="num" size={40}>
							8/10
						</Text>
						<Text role="meta">{t('doğru', 'correct')}</Text>
					</Stack>
				</Ring>
				<Text role="hero" align="center">
					{t('Seviye 2 tamam', 'Level 2 complete')}
				</Text>
				<Text role="body" align="center">
					{t('Problemlerde ilerledin. Seviye 3 açıldı.', 'You moved up in Problems. Level 3 is unlocked.')}
				</Text>
				<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, width: '100%'}}>
					{[['11 dk', t('süre', 'time')], ['2', t('yanlış', 'wrong')], ['+1', t('seviye', 'level')]].map(([value, label]) => (
						<Card key={label} padding={12}>
							<Text role="section" align="center">
								{value}
							</Text>
							<Text role="meta" align="center">
								{label}
							</Text>
						</Card>
					))}
				</div>
			</Content>
			<BottomBar>
				<Button size="lg" block>
					{t('Seviye 3’e geç', 'Go to level 3')}
				</Button>
				<Button tone="moduleSoft" module="tests" size="lg" block>
					{t('Yanlışlarımı incele', 'Review my mistakes')}
				</Button>
			</BottomBar>
		</ModuleScreen>
	);
};

export const TestsSolutionsScreen: React.FC = () => {
	const t = useT();
	return (
		<ModuleScreen module="tests" tab={2}>
			<Content>
				<PageTitle module="tests" title={t('Çözümler', 'Solutions')} sub={t('Çözdüğün testlerin cevapları', 'Answers to quizzes you took')} />
				<Segmented items={[t('Tümü', 'All'), t('Yanlışlar · 9', 'Wrong · 9'), t('İşaretli', 'Flagged')]} module="tests" />
				<List>
					{[
						['Problemler · Seviye 2', 'Problems · L2', '8/10', 'Bugün', 'Today'],
						['Paragraf · Seviye 3', 'Reading · L3', '9/10', 'Dün', 'Yesterday'],
						['Rasyonel sayılar · Seviye 2', 'Rationals · L2', '6/10', 'Pazartesi', 'Monday'],
						['Kuvvet ve hareket · Seviye 1', 'Force · L1', '7/10', 'Pazar', 'Sunday'],
					].map(([tr, en, score, dayTr, dayEn]) => (
						<ListRow key={tr} module="tests" icon="checkCircle" title={t(tr, en)} subtitle={t(dayTr, dayEn)} trailing={<Text role="headline">{score}</Text>} />
					))}
				</List>
				<Card tone="module" module="tests" padding={14}>
					<Stack row gap={10}>
						<Icon name="sparkles" size={18} color={MODULES.tests.color.light} />
						<Text role="small">{t('Yanlışlarından 10 soruluk bir tekrar testi hazır.', 'A 10-question review quiz from your mistakes is ready.')}</Text>
					</Stack>
				</Card>
			</Content>
		</ModuleScreen>
	);
};
