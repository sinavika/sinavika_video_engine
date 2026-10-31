import React from 'react';
import {useColors, useModuleColors, useT} from '../../Context';
import {Icon} from '../../Icons';
import {MODULES} from '../../ModuleIdentity';
import {AppHeader, BottomBar, Content, FocusHeader, ModuleScreen, ModuleSlide, PageTitle, SectionTitle} from '../../Parts/Mobile';
import {Bar, Button, Card, Chip, Levels, List, ListRow, OptionRow, Ring, Segmented, Stack, TEST_LEVELS, Text} from '../../Parts/Shared';

/**
 * Testler (Quizzes). The promo templates (src/Templates/Advertisements/PromoKit)
 * import the Dersler home and a micro-lesson step from this file by these two
 * names, so they are passed on from Lessons.tsx.
 */
export {LessonsHomeScreen, LessonConceptScreen as LessonFlowScreen} from './Lessons';

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
						['Temel kavramlar', 'Basics', 3],
						['Sayı basamakları', 'Digits', 3],
						['Rasyonel sayılar', 'Rationals', 2],
						['Problemler', 'Problems', 1],
						['Oran ve orantı', 'Ratio', 0],
						['Fonksiyonlar', 'Functions', 0],
					].map(([tr, en, done]) => (
						<ListRow key={tr as string} title={t(tr as string, en as string)} subtitle={`${done}/${TEST_LEVELS} ${t('seviye', 'levels')}`} trailing={<Levels done={done as number} color={mod.color} />} />
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
					{/* The three levels the product really has, named as in the app (Kolay, Orta, Zor); 20 questions each. */}
					{[
						[1, t('Kolay', 'Easy'), '%90', 'done'],
						[2, t('Orta', 'Medium'), t('Sıradaki', 'Next'), 'now'],
						[3, t('Zor', 'Hard'), '', 'lock'],
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
									<Text role="small">{t('20 soru · ~25 dk', '20 questions · ~25 min')}</Text>
								</Stack>
								{state === 'done' ? <Chip tone="success" size="sm">{meta}</Chip> : state === 'now' ? <Chip tone="module" module="tests" size="sm">{meta}</Chip> : <Icon name="lock" size={18} color={colors.subtle} />}
							</Stack>
						</Card>
					))}
				</Stack>
			</Content>
			<BottomBar>
				<Button size="lg" block icon="play">
					{t('Orta seviyeyi başlat', 'Start Medium')}
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
		<ModuleScreen module="tests" noTabBar header={<FocusHeader title={t('Soru 4 / 20', 'Question 4 / 20')} sub={t('Problemler · Orta', 'Problems · Medium')} right={<Chip tone="success">{t('3 doğru', '3 right')}</Chip>} />}>
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
			<div style={{background: colors.successSoft, borderTop: `2px solid ${colors.success}`, padding: '16px 18px 34px', display: 'flex', flexDirection: 'column', gap: 12}}>
				<Stack row gap={10}>
					<div style={{width: 34, height: 34, borderRadius: 17, background: colors.success, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<Icon name="check" size={18} color="#FFFFFF" />
					</div>
					<Stack gap={2} grow>
						<Text role="headline" color={colors.successInk}>
							{t('Doğru! Seriyi sürdürdün.', 'Correct! Streak kept.')}
						</Text>
						<Text role="small" color={colors.ink2}>
							{t('Fiyatın %80’i 240 → tamamı 240 ÷ 0,8 = 300.', '80% is 240 → full price 240 ÷ 0.8 = 300.')}
						</Text>
					</Stack>
				</Stack>
				<Button size="lg" block style={{background: '#047857', boxShadow: 'none'}}>
					{t('Devam', 'Continue')}
				</Button>
			</div>
		</ModuleScreen>
	);
};

/** A wrong answer: the right option, why, and where to go next (the topic's micro-lesson, SinoAI). */
export const TestSolveWrongScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<ModuleScreen module="tests" noTabBar header={<FocusHeader title={t('Soru 5 / 20', 'Question 5 / 20')} sub={t('Problemler · Orta', 'Problems · Medium')} right={<Chip tone="success">{t('3 doğru', '3 right')}</Chip>} />}>
			<Stack row gap={4} style={{padding: '0 16px'}}>
				{[1, 1, 1, 1, 3, 0, 0, 0, 0, 0].map((state, index) => (
					<div key={index} style={{flex: 1, height: 6, borderRadius: 3, background: state === 1 ? colors.success : state === 3 ? colors.error : colors.line2}} />
				))}
			</Stack>
			<Content tabBar={false} gap={12} padding="16px 18px 10px">
				<Text role="body" size={17} weight={600} color={colors.ink} style={{lineHeight: '26px'}}>
					{t('Bir işi Ali 6 günde, Ayşe 12 günde bitiriyor. İkisi birlikte bu işi kaç günde bitirir?', 'Ali finishes a job in 6 days, Ayşe in 12. How many days do they need together?')}
				</Text>
				<OptionRow letter="A" text="3" />
				<OptionRow letter="B" text="4" state="correct" />
				<OptionRow letter="C" text="9" state="wrong" />
				<OptionRow letter="D" text="18" />
			</Content>
			<div style={{background: colors.errorSoft, borderTop: `2px solid ${colors.error}`, padding: '16px 18px 34px', display: 'flex', flexDirection: 'column', gap: 12}}>
				<Stack row gap={10} align="flex-start">
					<div style={{width: 34, height: 34, borderRadius: 17, background: colors.error, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
						<Icon name="x" size={18} color="#FFFFFF" />
					</div>
					<Stack gap={2} grow>
						<Text role="headline" color={colors.errorInk}>
							{t('Doğrusu B: 4 gün', 'The answer is B: 4 days')}
						</Text>
						<Text role="small" color={colors.ink2}>
							{t('Süreler toplanmaz, günlük işler toplanır: 1/6 + 1/12 = 1/4, yani 4 gün.', 'Add the daily shares, not the days: 1/6 + 1/12 = 1/4, so 4 days.')}
						</Text>
					</Stack>
				</Stack>
				<Stack row gap={10}>
					<Button module="lessons" tone="moduleSoft" icon="book" style={{flex: 1}}>
						{t('Mikro ders · 4 dk', 'Micro-lesson · 4 min')}
					</Button>
					<Button tone="ghost" icon="sparkles" style={{flex: 1}}>
						{t('SinoAI’ye sor', 'Ask SinoAI')}
					</Button>
				</Stack>
				<Button size="lg" block>
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
							16/20
						</Text>
						<Text role="meta">{t('doğru', 'correct')}</Text>
					</Stack>
				</Ring>
				<Text role="hero" align="center">
					{t('Orta seviye tamam', 'Medium complete')}
				</Text>
				<Text role="body" align="center">
					{t('Problemlerde ilerledin. Zor seviye açıldı.', 'You moved up in Problems. Hard is unlocked.')}
				</Text>
				<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, width: '100%'}}>
					{[['24 dk', t('süre', 'time')], ['4', t('yanlış', 'wrong')], ['+1', t('seviye', 'level')]].map(([value, label]) => (
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
					{t('Zor seviyeye geç', 'Go to Hard')}
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
						['Problemler · Orta', 'Problems · Medium', '16/20', 'Bugün', 'Today'],
						['Paragraf · Zor', 'Reading · Hard', '18/20', 'Dün', 'Yesterday'],
						['Rasyonel sayılar · Orta', 'Rationals · Medium', '12/20', 'Pazartesi', 'Monday'],
						['Kuvvet ve hareket · Kolay', 'Force · Easy', '14/20', 'Pazar', 'Sunday'],
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
