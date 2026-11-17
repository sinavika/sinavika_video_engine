import React from 'react';
import {useColors, useModuleColors, useT} from '../../Context';
import {Icon} from '../../Icons';
import {MODULES} from '../../ModuleIdentity';
import {AppHeader, BottomBar, Content, FocusHeader, ModuleScreen, ModuleSlide, PageTitle, SectionTitle, Sheet} from '../../Parts/Mobile';
import {FilterChips, ModuleWeekCard} from '../../Parts/Study';
import {Bar, Button, Card, Chip, Dots, FlagButton, Levels, List, ListRow, OptionRow, PendingSyncNote, Ring, Segmented, Stack, TEST_LEVELS, Text, Tile} from '../../Parts/Shared';

/**
 * Testler (Quizzes). The promo templates (src/Templates/Advertisements/PromoKit)
 * import the Dersler home and a lesson step from this file by these two
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
	const colors = useColors();
	const mod = useModuleColors('tests');
	return (
		<ModuleScreen module="tests" tab={0}>
			<Content>
				<PageTitle module="tests" title={t('Testler', 'Quizzes')} />
				{/* Swiped slides: Senin için hazır first, then where you left off and the topics; the dots show the page. */}
				<Stack gap={8}>
					<ModuleSlide module="tests" height={170} />
					<Dots count={3} active={0} />
				</Stack>
				<ModuleWeekCard
					module="tests"
					time={t('1 sa 50 dk', '1 h 50 m')}
					change={9}
					bars={[15, 25, 0, 20, 30, 10, 10]}
					stats={[
						[t('Çözülen soru', 'Questions solved'), '140'],
						[t('Başarı', 'Success'), t('%72', '72%')],
						[t('Seri', 'Streak'), t('5 gün', '5 days')],
					]}
				/>
				<SectionTitle title={t('Dersler', 'Subjects')} sub={t('TYT · önce dersi seç', 'TYT · pick a subject first')} />
				<List>
					{LESSON_MAINS.map(([tr, en, done, total]) => (
						<ListRow
							key={tr}
							module="tests"
							icon="book"
							title={t(tr, en)}
							subtitle={`${done} / ${total} ${t('test', 'quizzes')}`}
							trailing={
								<Stack row gap={10}>
									<div style={{width: 70}}>
										<Bar value={done / total} color={mod.color} track={mod.track} height={6} />
									</div>
									<Icon name="right" size={18} color={colors.subtle} />
								</Stack>
							}
						/>
					))}
				</List>
			</Content>
		</ModuleScreen>
	);
};

/**
 * Konular tab: every subject of the exam as an open-and-close tree (as in the
 * app). A closed subject is one row (topics, done count, chevron); the open one
 * lists its topics with their three levels. Tapping a topic opens its levels.
 */
export const TestsTopicsScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('tests');
	const Lesson: React.FC<{name: string; sub: string; open?: boolean}> = ({name, sub, open}) => (
		<Stack row gap={12} style={{padding: '12px 12px'}}>
			<Tile module="tests" icon="book" size={36} />
			<Stack grow gap={1}>
				<Text role="headline">{name}</Text>
				<Text role="meta">{sub}</Text>
			</Stack>
			<Icon name={open ? 'up' : 'down'} size={18} color={open ? mod.ink : colors.subtle} />
		</Stack>
	);
	return (
		<ModuleScreen module="tests" tab={1}>
			<Content gap={10}>
				<PageTitle module="tests" title={t('Konular', 'Topics')} sub={t('TYT · bütün dersler', 'TYT · every subject')} />
				<Card padding={0}>
					<Lesson name={t('Türkçe', 'Turkish')} sub={t('30 konu · 12 tamamlandı', '30 topics · 12 complete')} />
				</Card>
				<Card padding={0} tone="moduleLine" module="tests">
					<Lesson name={t('Matematik', 'Maths')} sub={t('25 konu · 9 tamamlandı', '25 topics · 9 complete')} open />
					<div style={{borderTop: `1px solid ${colors.line2}`}}>
						{[
							['Temel kavramlar', 'Basics', 3],
							['Sayı basamakları', 'Digits', 3],
							['Rasyonel sayılar', 'Rationals', 2],
							['Problemler', 'Problems', 1],
							['Oran ve orantı', 'Ratio', 0],
						].map(([tr, en, done]) => (
							<Stack key={tr as string} row gap={10} style={{padding: '10px 14px 10px 60px'}}>
								<Stack grow gap={0}>
									<Text role="small" weight={700} color={colors.ink}>
										{t(tr as string, en as string)}
									</Text>
									<Text role="meta">{`${done}/${TEST_LEVELS} ${t('seviye', 'levels')}`}</Text>
								</Stack>
								<Levels done={done as number} color={mod.color} />
							</Stack>
						))}
					</div>
				</Card>
				{[
					['Geometri', 'Geometry', '20 konu · 3 tamamlandı', '20 topics · 3 complete'],
					['Fizik', 'Physics', '18 konu · 5 tamamlandı', '18 topics · 5 complete'],
				].map(([tr, en, subTr, subEn]) => (
					<Card key={tr} padding={0}>
						<Lesson name={t(tr, en)} sub={t(subTr, subEn)} />
					</Card>
				))}
			</Content>
		</ModuleScreen>
	);
};

/**
 * A topic's levels (QuizLessonSub): subject chips on top (switch subject), the
 * topic, the module's week card for this subject, and the three levels with
 * their own button: Tekrar (done), Devam et (started), Başla (open), lock
 * (the level before is not done).
 */
export const TestOverviewScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('tests');
	return (
		<ModuleScreen module="tests" noTabBar header={<AppHeader left="back" title={t('Problemler', 'Problems')} right={<div style={{width: 40}} />} />}>
			<Content tabBar={false} gap={12}>
				<FilterChips module="tests" active={1} items={LESSON_MAINS.map(([tr, en]) => t(tr, en))} />
				<div style={{borderRadius: 22, background: mod.gradient, padding: '14px 16px', color: '#FFFFFF'}}>
					<Text role="over" color="rgba(255,255,255,0.85)">
						{t('Matematik · TYT', 'Maths · TYT')}
					</Text>
					<Text role="title" size={22} color="#FFFFFF" style={{marginTop: 2}}>
						{t('Problemler', 'Word problems')}
					</Text>
					<Text role="small" color="rgba(255,255,255,0.9)">
						{t('Son denemede bu konuda 3,25 net kaybettin.', 'You lost 3.25 points here in the last exam.')}
					</Text>
				</div>
				<ModuleWeekCard
					lesson
					module="tests"
					time={t('40 dk', '40 min')}
					change={15}
					bars={[10, 0, 15, 0, 15, 0, 0]}
					stats={[
						[t('Çözülen soru', 'Questions solved'), '48'],
						[t('Başarı', 'Success'), t('%69', '69%')],
						[t('Seri', 'Streak'), t('5 gün', '5 days')],
					]}
				/>
				<SectionTitle title={t('Seviyeler', 'Levels')} />
				<Stack gap={8}>
					{/* The three levels the product really has, named as in the app (Kolay, Orta, Zor); 20 questions each. */}
					{[
						[1, t('Kolay', 'Easy'), t('18 doğru · 2 yanlış', '18 right · 2 wrong'), 'done'],
						[2, t('Orta', 'Medium'), t('8 / 20 soru', '8 / 20 questions'), 'now'],
						[3, t('Zor', 'Hard'), t('20 soru · ~25 dk', '20 questions · ~25 min'), 'lock'],
					].map(([level, name, meta, state]) => (
						<Card key={level as number} padding={12} tone={state === 'now' ? 'moduleLine' : 'card'} module="tests">
							<Stack row gap={12}>
								<Stack align="center" justify="center" style={{width: 40, height: 40, borderRadius: 12, background: state === 'done' ? mod.action : mod.soft}}>
									<Text role="headline" color={state === 'done' ? '#FFFFFF' : mod.color}>
										{level}
									</Text>
								</Stack>
								<Stack grow gap={1}>
									<Text role="headline">{name}</Text>
									<Text role="small">{meta}</Text>
								</Stack>
								{state === 'done' ? (
									<Button tone="ghost" size="sm" icon="refresh">
										{t('Tekrar', 'Retry')}
									</Button>
								) : state === 'now' ? (
									<Button tone="module" module="tests" size="sm">
										{t('Devam et', 'Continue')}
									</Button>
								) : (
									<Stack row gap={6}>
										<Icon name="lock" size={16} color={colors.subtle} />
										<Text role="meta">{t('Kilitli', 'Locked')}</Text>
									</Stack>
								)}
							</Stack>
						</Card>
					))}
				</Stack>
			</Content>
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
				<Stack row justify="space-between">
					<Text role="meta">{t('Problemler · soru 4', 'Problems · question 4')}</Text>
					<FlagButton />
				</Stack>
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

/** A wrong answer: the right option, why, and where to go next (the topic's lesson, SinoAI). */
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
						{t('Konu anlatımı', 'Topic lesson')}
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
					{[
						[t('24 dk', '24 min'), t('süre', 'time')],
						['4', t('yanlış', 'wrong')],
						['+1', t('seviye', 'level')],
					].map(([value, label]) => (
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

/**
 * Çözümler: solved quizzes; filters Tümü · Yanlışlar · N · İşaretli. A solved
 * review quiz is named "Konu · Tekrar". The review-quiz card shows only when
 * one is ready. A row opens Yanlışlarım at the first mistake.
 */
export const SOLVED_QUIZZES: [string, string, string, string, string][] = [
	['Problemler · Tekrar', 'Problems · Review', '8/10', 'Bugün', 'Today'],
	['Problemler · Orta', 'Problems · Medium', '16/20', 'Bugün', 'Today'],
	['Paragraf · Zor', 'Reading · Hard', '18/20', 'Dün', 'Yesterday'],
	['Rasyonel sayılar · Orta', 'Rationals · Medium', '12/20', 'Pazartesi', 'Monday'],
];

/**
 * Flagged questions (Çözümler › İşaretli). A row opens the question in
 * Yanlışlarım under "Tümü"; a question of an unfinished quiz says "Test bitince
 * açılır" and does not open.
 */
export const FLAGGED_QUESTIONS: [string, string, string, string, boolean][] = [
	['Problemler · Orta · soru 7', 'Problems · Medium · question 7', 'Bir havuzu iki musluk birlikte kaç saatte doldurur?', 'Two taps fill a pool together in how many hours?', true],
	['Temel Kavramlar · Kolay · soru 3', 'Basics · Easy · question 3', 'Hangisi tam sayıdır ama doğal sayı değildir?', 'Which is an integer but not a natural number?', true],
	['Bölünebilme · Orta · soru 12', 'Divisibility · Medium · question 12', 'Beş basamaklı 4a73b sayısı 15 ile bölünüyor…', 'The five-digit number 4a73b divides by 15…', false],
];

const Solutions: React.FC<{flagged?: boolean}> = ({flagged}) => {
	const t = useT();
	const colors = useColors();
	return (
		<ModuleScreen module="tests" tab={2}>
			<Content>
				<PageTitle module="tests" title={t('Çözümler', 'Solutions')} sub={t('Çözdüğün testlerin cevapları', 'Answers to quizzes you took')} />
				<Segmented items={[t('Tümü', 'All'), t('Yanlışlar · 9', 'Wrong · 9'), t('İşaretli · 3', 'Flagged · 3')]} active={flagged ? 2 : 0} module="tests" />
				{flagged ? (
					<List>
						{FLAGGED_QUESTIONS.map(([tr, en, qTr, qEn, open]) => (
							<ListRow
								key={tr}
								module="tests"
								icon="bookmark"
								title={t(tr, en)}
								subtitle={t(qTr, qEn)}
								trailing={
									open ? undefined : (
										<Stack row gap={5}>
											<Icon name="lock" size={14} color={colors.subtle} />
											<Text role="meta">{t('Test bitince açılır', 'Opens when the quiz ends')}</Text>
										</Stack>
									)
								}
							/>
						))}
					</List>
				) : (
					<>
						<List>
							{SOLVED_QUIZZES.map(([tr, en, score, dayTr, dayEn]) => (
								<ListRow key={tr} module="tests" icon={tr.endsWith('Tekrar') ? 'refresh' : 'checkCircle'} title={t(tr, en)} subtitle={t(dayTr, dayEn)} trailing={<Text role="headline">{score}</Text>} />
							))}
						</List>
						<Card tone="module" module="tests" padding={14}>
							<Stack row gap={10}>
								<Icon name="sparkles" size={18} color={MODULES.tests.color.light} />
								<Text role="small" style={{flex: 1}}>
									{t('Yanlışlarından 10 soruluk bir tekrar testi hazır.', 'A 10-question review quiz from your mistakes is ready.')}
								</Text>
								<Button tone="module" module="tests" size="sm">
									{t('Başla', 'Start')}
								</Button>
							</Stack>
						</Card>
					</>
				)}
			</Content>
		</ModuleScreen>
	);
};

export const TestsSolutionsScreen: React.FC = () => <Solutions />;

/** Çözümler › İşaretli: flagged questions; one of an unfinished quiz is locked. */
export const TestsSolutionsFlaggedScreen: React.FC = () => <Solutions flagged />;

/**
 * Testler offline (owner, 17 Nov 2026): the answer is saved in the one central
 * queue; right and wrong show only after it is sent. The picked option keeps
 * the "selected" look, the shared note says so, "Devam" stays open.
 */
export const TestOfflineScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('tests');
	return (
		<ModuleScreen module="tests" noTabBar header={<FocusHeader title={t('Soru 6 / 20', 'Question 6 / 20')} sub={t('Problemler · Orta', 'Problems · Medium')} right={<Chip tone="success">{t('4 doğru', '4 right')}</Chip>} />}>
			<Stack row gap={4} style={{padding: '0 16px'}}>
				{[1, 1, 1, 3, 1, 2, 0, 0, 0, 0].map((state, index) => (
					<div key={index} style={{flex: 1, height: 6, borderRadius: 3, background: state === 1 ? colors.success : state === 3 ? colors.error : state === 2 ? mod.color : colors.line2}} />
				))}
			</Stack>
			<Content tabBar={false} gap={12} padding="16px 18px 10px">
				<Stack row justify="space-between">
					<Text role="meta">{t('Problemler · soru 6', 'Problems · question 6')}</Text>
					<FlagButton />
				</Stack>
				<Text role="body" size={17} weight={600} color={colors.ink} style={{lineHeight: '26px'}}>
					{t('Bir sayının 3 katının 5 fazlası 41’dir. Bu sayı kaçtır?', 'Five more than three times a number is 41. What is the number?')}
				</Text>
				<OptionRow letter="A" text="10" />
				<OptionRow letter="B" text="12" state="selected" module="tests" />
				<OptionRow letter="C" text="14" />
				<OptionRow letter="D" text="16" />
				<PendingSyncNote module="tests" reveal />
			</Content>
			<BottomBar>
				<Button tone="module" module="tests" size="lg" block>
					{t('Devam', 'Continue')}
				</Button>
			</BottomBar>
		</ModuleScreen>
	);
};

/**
 * "Testi bitir" with answers still waiting: the quiz does not end; a sheet
 * says why and the answers stay in the queue (owner, 17 Nov 2026).
 */
export const TestFinishPendingScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<ModuleScreen
			module="tests"
			noTabBar
			header={<FocusHeader title={t('Soru 20 / 20', 'Question 20 / 20')} sub={t('Problemler · Orta', 'Problems · Medium')} right={<Chip tone="success">{t('15 doğru', '15 right')}</Chip>} />}
			overlay={
				<Sheet height={230}>
					<Text role="body" weight={600} color={colors.ink}>
						{t('Bekleyen cevapların henüz gönderilmedi. Bağlantı gelince testi bitirebilirsin.', 'Your waiting answers have not been sent yet. You can end the quiz once you are back online.')}
					</Text>
					<div style={{flex: 1}} />
					<Button tone="module" module="tests" size="lg" block>
						{t('Tamam', 'OK')}
					</Button>
				</Sheet>
			}
		>
			<Content tabBar={false} gap={12} padding="16px 18px 10px">
				<Text role="body" size={17} weight={600} color={colors.ink} style={{lineHeight: '26px'}}>
					{t('Bir işçi günde 8 saat çalışarak bir işi 6 günde bitiriyor. Günde 12 saat çalışırsa kaç günde bitirir?', 'Working 8 hours a day a worker ends a job in 6 days. How many days at 12 hours a day?')}
				</Text>
				<OptionRow letter="A" text="3" />
				<OptionRow letter="B" text="4" state="selected" module="tests" />
				<OptionRow letter="C" text="5" />
				<OptionRow letter="D" text="9" />
				<PendingSyncNote module="tests" reveal />
			</Content>
			<BottomBar>
				<Button tone="module" module="tests" size="lg" block>
					{t('Testi bitir', 'End quiz')}
				</Button>
			</BottomBar>
		</ModuleScreen>
	);
};
