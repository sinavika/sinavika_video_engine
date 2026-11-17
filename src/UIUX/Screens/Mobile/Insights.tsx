import React from 'react';
import {useColors, useModuleColors, useT} from '../../Context';
import {Icon} from '../../Icons';
import {MODULES, type ModuleKey} from '../../ModuleIdentity';
import {AppHeader, BottomBar, Content, FocusHeader, ModuleScreen, Phone, SectionTitle} from '../../Parts/Mobile';
import {Bar, Button, Card, Chip, FlagButton, OptionRow, Segmented, Sparkline, Stack, Text, Tile} from '../../Parts/Shared';
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
					<KpiCard compact icon="clock" label={t('Çalışma', 'Study')} value={t('4 sa', '4 h')} delta={t('%22', '22%')} />
					<KpiCard compact icon="quiz" label={t('Soru', 'Questions')} value="176" delta={t('%31', '31%')} />
					<KpiCard compact icon="target" label={t('Doğru', 'Accuracy')} value={t('%62', '62%')} delta={t('%6', '6%')} />
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
						<StudyBars
							height={120}
							active={3}
							tooltip={{
								title: t('Perşembe', 'Thursday'),
								rows: [
									[t('Planlanan', 'Planned'), t('90 dk', '90 min')],
									[t('Çalışılan', 'Studied'), t('50 dk', '50 min')],
								],
							}}
							bars={[0, 1, 2, 3, 4, 5, 6].map((day) => ({
								label: ['P', 'S', 'Ç', 'P', 'C', 'C', 'P'][day],
								parts: DAY_MODULES.map(
									(key, part) =>
										[
											key,
											[
												[30, 10, 0, 5],
												[20, 25, 0, 10],
												[40, 0, 55, 0],
												[25, 20, 0, 5],
												[0, 0, 0, 0],
												[0, 0, 0, 0],
												[0, 0, 0, 0],
											][day][part],
										] as [ModuleKey, number],
								),
							}))}
						/>
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

/**
 * The first week: instead of zeros, three first steps; numbers appear as soon
 * as there is data. Buttons are in the target module's soft tone, never brand
 * orange. The exam step follows the month's next exam (open: Başla, upcoming:
 * Hatırlat). Lesson and quiz lines stay general until the suggestion endpoints
 * are connected (owner, 17 Nov 2026).
 */
export const StatisticsFirstWeekScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const Step: React.FC<{module: ModuleKey; title: string; sub: string; done?: boolean; action: string}> = ({module, title, sub, done, action}) => (
		<Stack data-ui={done ? 'disabled' : undefined} row gap={12} style={{padding: 14, borderRadius: 20, background: colors.card, border: `1px solid ${colors.line}`, opacity: done ? 0.65 : 1}}>
			<Tile module={module} size={42} />
			<Stack grow gap={1}>
				<Text role="headline" style={{textDecoration: done ? 'line-through' : undefined}}>
					{title}
				</Text>
				<Text role="small">{sub}</Text>
			</Stack>
			{done ? (
				<Icon name="checkCircle" size={22} color={colors.successInk} />
			) : (
				<Button tone="moduleSoft" module={module} size="sm">
					{action}
				</Button>
			)}
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
				<Step module="lessons" title={t('İlk konuna başla', 'Start your first topic')} sub={t('Dersler · kısa adımlarla başla', 'Lessons · start in short steps')} done action={t('Başla', 'Start')} />
				<Step module="tests" title={t('Bir test çöz', 'Solve a quiz')} sub={t('Testler · Kolay seviyeden başla', 'Quizzes · start at Easy')} action={t('Başla', 'Start')} />
				<Step module="exam" title={t('İlk denemene katıl', 'Join your first exam')} sub={t('TYT Deneme 5 · Cumartesi 10:00', 'TYT Exam 5 · Saturday 10:00')} action={t('Hatırlat', 'Remind')} />
			</Content>
		</Phone>
	);
};

/**
 * Yanlışlarım after a quiz (owner, 17 Nov 2026). It opens on the first wrong
 * answer; with no wrong answer on the first blank; with neither on question 1
 * under "Tümü". A filter with nothing in it is faint and not tappable. The
 * number row shows only the questions of the chosen filter (green right, red
 * wrong, grey blank, filled = open). On the last question of the filter the
 * main button reads "Bitti" and goes back to Çözümler.
 */
type ReviewSpot = 'first' | 'last' | 'allRight';

/** Questions 1–20 of the sample quiz: r right, w wrong (15 wrong, no blank). */
export const REVIEW_RESULTS: ('r' | 'w' | 'b')[] = ['r', 'r', 'w', 'w', 'r', 'w', 'w', 'w', 'w', 'r', 'w', 'w', 'w', 'w', 'w', 'r', 'w', 'w', 'w', 'w'];

export const NumberCell: React.FC<{number: number; result: 'r' | 'w' | 'b'; on?: boolean; size?: number}> = ({number, result, on, size = 34}) => {
	const colors = useColors();
	const mod = useModuleColors('tests');
	const look = on ? {fill: mod.action, line: mod.action, ink: '#FFFFFF'} : result === 'w' ? {fill: colors.errorSoft, line: colors.error, ink: colors.errorInk} : result === 'r' ? {fill: colors.successSoft, line: colors.success, ink: colors.successInk} : {fill: colors.card, line: colors.line, ink: colors.ink2};
	return (
		<div style={{width: size, height: size, borderRadius: 10, background: look.fill, border: `1.5px solid ${look.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
			<Text role="meta" weight={800} color={look.ink}>
				{number}
			</Text>
		</div>
	);
};

const WrongReview: React.FC<{spot: ReviewSpot}> = ({spot}) => {
	const t = useT();
	const colors = useColors();
	const lessons = useModuleColors('lessons');
	const allRight = spot === 'allRight';
	const wrongs = REVIEW_RESULTS.map((result, index) => [index + 1, result] as const).filter(([, result]) => result === 'w');
	// The row holds 8 cells; the rest are counted. Last: the end of the filter shows, the counter goes first.
	const cells = allRight ? Array.from({length: 8}, (_, index) => [index + 1, 'r'] as const) : spot === 'last' ? wrongs.slice(-7) : wrongs.slice(0, 8);
	const open = allRight ? 1 : spot === 'last' ? 20 : 3;
	const rest = allRight ? 12 : spot === 'last' ? wrongs.length - 7 : wrongs.length - 8;
	const question =
		spot === 'last'
			? {
					meta: t('Soru 20 / 20 · 15. yanlış', 'Question 20 / 20 · 15th mistake'),
					text: t('Aşağıdakilerden hangisi asal sayıdır?', 'Which of these is a prime number?'),
					options: [
						['A', '21', 'idle'],
						['B', '27', 'idle'],
						['C', '29', 'correct'],
						['D', '33', 'wrong'],
					] as const,
					why: t('Neden 29?', 'Why 29?'),
					body: t('29 yalnız 1’e ve kendisine bölünür. 21 = 3 · 7, 27 = 3 · 9, 33 = 3 · 11.', '29 divides only by 1 and itself. 21, 27 and 33 all divide by 3.'),
					share: t('Öğrencilerin %64’ü bildi', '64% got it right'),
				}
			: allRight
				? {
						meta: t('Soru 1 / 20 · doğru', 'Question 1 / 20 · right'),
						text: t('Aşağıdakilerden hangisi bir doğal sayıdır?', 'Which of these is a natural number?'),
						options: [
							['A', '−2', 'idle'],
							['B', '0', 'correct'],
							['C', '1/2', 'idle'],
							['D', '−1', 'idle'],
						] as const,
						why: t('Neden 0?', 'Why 0?'),
						body: t('Doğal sayılar 0’dan başlar: 0, 1, 2, … Negatif ve kesirli sayılar doğal değildir.', 'Natural numbers start at 0: 0, 1, 2, …'),
						share: t('Öğrencilerin %81’i bildi', '81% got it right'),
					}
				: {
						meta: t('Soru 3 / 20 · 1. yanlış', 'Question 3 / 20 · 1st mistake'),
						text: t('Aşağıdakilerden hangisi tam sayıdır ama doğal sayı değildir?', 'Which is an integer but not a natural number?'),
						options: [
							['A', '−4', 'correct'],
							['B', '0', 'idle'],
							['C', '3/2', 'wrong'],
							['D', '7', 'idle'],
						] as const,
						why: t('Neden −4?', 'Why −4?'),
						body: t('Doğal sayılar 0 ve pozitif tam sayılardır. 3/2 tam sayı değildir; −4 tam sayıdır ama negatif olduğu için doğal değildir.', 'Natural numbers are 0 and the positive integers.'),
						share: t('Öğrencilerin %50’si bildi', '50% got it right'),
					};
	return (
		<ModuleScreen module="tests" noTabBar header={<FocusHeader left="left" title={t('Yanlışlarım', 'My mistakes')} sub={t('Temel Kavramlar · Kolay', 'Basics · Easy')} />}>
			<Stack gap={10} style={{padding: '0 18px'}}>
				<Segmented items={allRight ? [t('Yanlış · 0', 'Wrong · 0'), t('Boş · 0', 'Blank · 0'), t('Tümü · 20', 'All · 20')] : [t('Yanlış · 15', 'Wrong · 15'), t('Boş · 0', 'Blank · 0'), t('Tümü · 20', 'All · 20')]} active={allRight ? 2 : 0} off={allRight ? [0, 1] : [1]} module="tests" />
				<Stack row gap={6}>
					{spot === 'last' ? <Text role="meta">+{rest}</Text> : null}
					{cells.map(([number, result]) => (
						<NumberCell key={number} number={number} result={result} on={number === open} />
					))}
					{spot === 'last' ? null : <Text role="meta">+{rest}</Text>}
				</Stack>
			</Stack>
			<Content tabBar={false} gap={10} padding="12px 18px 10px">
				<Stack row justify="space-between">
					<Text role="meta">{question.meta}</Text>
					<FlagButton on={spot === 'first'} />
				</Stack>
				<Text role="body" size={17} weight={600} color={colors.ink} style={{lineHeight: '26px'}}>
					{question.text}
				</Text>
				{question.options.map(([letter, text, state]) => (
					<OptionRow key={letter} letter={letter} text={text} state={state} />
				))}
				<Card padding={14}>
					<Stack gap={6}>
						<Text role="headline">{question.why}</Text>
						<Text role="small" color={colors.ink2}>
							{question.body}
						</Text>
						<Text role="meta">{question.share}</Text>
					</Stack>
				</Card>
				<Stack row gap={8}>
					<Button tone="ghost" size="sm" icon="upload" style={{flex: 1}}>
						{t('Bu soruyu paylaş', 'Share this question')}
					</Button>
					<Button tone="ghost" size="sm" icon="sparkles" style={{flex: 1}}>
						{t('SinoAI’ye sor', 'Ask SinoAI')}
					</Button>
				</Stack>
			</Content>
			<BottomBar>
				<Stack row gap={10}>
					<Button tone="moduleSoft" module="lessons" icon="book" style={{flex: 1, color: lessons.ink}}>
						{t('Konuyu çalış', 'Study the topic')}
					</Button>
					{spot === 'last' ? (
						<Button tone="module" module="tests" icon="check" style={{flex: 1}}>
							{t('Bitti', 'Done')}
						</Button>
					) : (
						<Button tone="module" module="tests" iconRight="right" style={{flex: 1}}>
							{allRight ? t('Sonraki soru', 'Next question') : t('Sonraki yanlış', 'Next mistake')}
						</Button>
					)}
				</Stack>
			</BottomBar>
		</ModuleScreen>
	);
};

export const TestWrongReviewScreen: React.FC = () => <WrongReview spot="first" />;

/** The last wrong answer of the filter: "Bitti" goes back to Çözümler. */
export const TestWrongReviewLastScreen: React.FC = () => <WrongReview spot="last" />;

/** No wrong and no blank answer: the review opens on question 1 under "Tümü"; the empty filters are faint. */
export const TestWrongReviewAllRightScreen: React.FC = () => <WrongReview spot="allRight" />;
