import React from 'react';
import {useColors, useModuleColors, useT} from '../../Context';
import {Icon} from '../../Icons';
import {MODULES} from '../../ModuleIdentity';
import {AppHeader, BottomBar, Content, FocusHeader, ModuleScreen, ModuleSlide, PageTitle, SectionTitle} from '../../Parts/Mobile';
import {Bar, Button, Card, Chip, List, ListRow, OptionRow, Ring, Segmented, Sparkline, Stack, Text, Tile} from '../../Parts/Shared';

/** Denemeler: practice exams, results, analysis and solutions. Tabs: Denemeler · Denemelerim · Modüller · Sonuçlar · Profil. */

const LESSONS: [string, string, number, number, string][] = [
	['Türkçe', 'Turkish', 32.5, 40, '#0284C7'],
	['Sosyal', 'Social', 14.25, 20, '#0D9488'],
	['Matematik', 'Maths', 21.75, 40, '#4F46E5'],
	['Fen', 'Science', 10, 20, '#DB2777'],
];

const num = (value: number, lang: string) => (lang === 'en' ? String(value) : String(value).replace('.', ','));

const ExamRow: React.FC<{title: string; sub: string; meta: string; tag?: string}> = ({title, sub, meta, tag}) => (
	<ListRow module="exam" title={title} subtitle={sub} meta={meta} trailing={tag ? <Chip tone="module" module="exam" size="sm">{tag}</Chip> : undefined} />
);

export const ExamHomeScreen: React.FC = () => {
	const t = useT();
	return (
		<ModuleScreen module="exam" tab={0}>
			<Content>
				<PageTitle module="exam" title={t('Denemeler', 'Practice exams')} />
				<ModuleSlide module="exam" height={186} label={t('Canlı · Türkiye geneli', 'Live · nationwide')} title={t('TYT Deneme 5', 'TYT Exam 5')} text={t('Cumartesi 10:00 · 120 soru · 165 dk · 12.480 kişi', 'Saturday 10:00 · 120 questions · 165 min · 12,480 students')} action={t('Hatırlat', 'Remind me')} />
				<Card tone="moduleLine" module="exam" padding={14}>
					<Stack row gap={12}>
						<Ring value={0.6} size={48} stroke={5} color={MODULES.exam.color.light}>
							<Text role="meta" weight={800}>%60</Text>
						</Ring>
						<Stack grow gap={1}>
							<Text role="over" color={MODULES.exam.color.light}>
								{t('Devam eden', 'In progress')}
							</Text>
							<Text role="headline">{t('AYT Sayısal Deneme 3', 'AYT Science Exam 3')}</Text>
							<Text role="small">{t('48 / 80 soru · 74 dk kaldı', '48 / 80 · 74 min left')}</Text>
						</Stack>
						<Button tone="module" size="sm">
							{t('Devam', 'Resume')}
						</Button>
					</Stack>
				</Card>
				<SectionTitle title={t('Senin için', 'For you')} action={t('Tümü', 'All')} />
				<List>
					<ExamRow title={t('TYT Deneme 4 · Tekrar', 'TYT Exam 4 · Retake')} sub={t('Eksiklerinin üzerinden yeniden', 'Built on your gaps')} meta={t('120 soru · 165 dk', '120 questions · 165 min')} tag={t('Önerilen', 'Suggested')} />
					<ExamRow title={t('Paragraf Branş Denemesi', 'Reading Subject Exam')} sub={t('Türkçe · 40 soru', 'Turkish · 40 questions')} meta={t('50 dk', '50 min')} tag={t('Yeni', 'New')} />
				</List>
			</Content>
		</ModuleScreen>
	);
};

export const ExamCatalogScreen: React.FC = () => {
	const t = useT();
	return (
		<ModuleScreen module="exam" tab={0} header={<AppHeader left="back" title={t('Tüm denemeler', 'All exams')} right={<div style={{width: 40}} />} />}>
			<Content>
				<Stack row gap={8}>
					{[t('Tümü', 'All'), 'TYT', 'AYT', t('Branş', 'Subject'), t('Ücretsiz', 'Free')].map((label, index) => (
						<Chip key={label} tone={index ? 'outline' : 'moduleSolid'} module="exam">
							{label}
						</Chip>
					))}
				</Stack>
				<List>
					<ExamRow title={t('TYT Deneme 5', 'TYT Exam 5')} sub={t('Türkiye geneli · Cumartesi 10:00', 'Nationwide · Sat 10:00')} meta="120 · 165 dk" tag={t('Canlı', 'Live')} />
					<ExamRow title={t('AYT Sayısal Deneme 3', 'AYT Science Exam 3')} sub={t('Matematik, Fen', 'Maths, Science')} meta="80 · 180 dk" />
					<ExamRow title={t('TYT Deneme 4', 'TYT Exam 4')} sub={t('Arşiv · sıralama açık', 'Archive · ranking open')} meta="120 · 165 dk" />
					<ExamRow title={t('Problemler Branş', 'Problems Subject')} sub={t('Matematik', 'Maths')} meta="30 · 45 dk" tag={t('Ücretsiz', 'Free')} />
					<ExamRow title={t('Fen Branş Denemesi', 'Science Subject Exam')} sub={t('Fizik, Kimya, Biyoloji', 'Physics, Chemistry, Biology')} meta="20 · 30 dk" />
					<ExamRow title={t('Tarih Branş Denemesi', 'History Subject Exam')} sub={t('Sosyal Bilimler', 'Social sciences')} meta="20 · 25 dk" />
				</List>
			</Content>
		</ModuleScreen>
	);
};

export const ExamDetailScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<ModuleScreen module="exam" noTabBar header={<AppHeader left="back" title={t('Deneme detayı', 'Exam details')} right={<div style={{width: 40}} />} />}>
			<Content tabBar={false}>
				<Stack gap={8}>
					<Chip tone="module" module="exam">{t('TYT · Türkiye geneli', 'TYT · Nationwide')}</Chip>
					<Text role="hero">{t('TYT Deneme 5', 'TYT Exam 5')}</Text>
					<Text role="body">{t('Sonuçlar sınavdan 2 saat sonra açıklanır. Sıralaman 12.480 kişi içinde hesaplanır.', 'Results in 2 hours. Ranked among 12,480 students.')}</Text>
				</Stack>
				<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10}}>
					{[['120', t('soru', 'questions')], ['165', t('dakika', 'minutes')], ['4', t('oturum', 'sections')]].map(([value, label]) => (
						<Card key={label} tone="flat" padding={12} style={{textAlign: 'center'}}>
							<Text role="num" size={24} align="center">
								{value}
							</Text>
							<Text role="meta" align="center">
								{label}
							</Text>
						</Card>
					))}
				</div>
				<SectionTitle title={t('Bölümler', 'Sections')} />
				<List>
					{LESSONS.map(([tr, en, , total, color]) => (
						<Stack key={tr} row gap={10} style={{padding: '12px 14px'}}>
							<div style={{width: 10, height: 10, borderRadius: 4, background: color}} />
							<Text role="headline" style={{flex: 1}}>
								{t(tr, en)}
							</Text>
							<Text role="small">
								{total} {t('soru', 'questions')}
							</Text>
						</Stack>
					))}
				</List>
				<Card tone="soft" padding={14}>
					<Stack row gap={10}>
						<Icon name="info" size={18} color={colors.muted} />
						<Text role="small">{t('Çıkarsan kaldığın yerden devam edersin; süre arka planda işler.', 'Leave and resume later; the timer keeps running.')}</Text>
					</Stack>
				</Card>
			</Content>
			<BottomBar>
				<Button size="lg" block icon="play">
					{t('Denemeye başla', 'Start exam')}
				</Button>
			</BottomBar>
		</ModuleScreen>
	);
};

export const ExamStartingScreen: React.FC = () => {
	const t = useT();
	const mod = useModuleColors('exam');
	return (
		<ModuleScreen module="exam" noTabBar header={<FocusHeader title={t('Başlamadan önce', 'Before you start')} sub={t('TYT Deneme 5', 'TYT Exam 5')} />}>
			<Content tabBar={false} gap={16} style={{alignItems: 'center', textAlign: 'center', paddingTop: 30}}>
				<Ring value={1} size={170} stroke={12} color={mod.color} track={mod.track}>
					<Stack align="center">
						<Text role="num" size={48}>
							3
						</Text>
						<Text role="meta">{t('saniye', 'seconds')}</Text>
					</Stack>
				</Ring>
				<Text role="hero" align="center">
					{t('Hazırsan başlıyoruz', 'Starting when you are ready')}
				</Text>
				<Card padding={6} style={{width: '100%', textAlign: 'left'}}>
					{[
						['clock', t('165 dakika, ara verilebilir', '165 minutes, pausing allowed')],
						['bookmark', t('Emin olmadığın soruyu işaretle', 'Flag questions you are unsure of')],
						['x', t('4 yanlış 1 doğruyu götürür', '4 wrong cancel 1 right')],
						['wifi', t('Bağlantı koparsa cevapların saklanır', 'Answers are kept offline')],
					].map(([icon, text], index) => (
						<Stack key={text} row gap={12} style={{padding: '11px 10px', borderTop: index ? '1px solid var(--ui-line2)' : undefined}}>
							<Tile module="exam" icon={icon as 'clock'} size={32} />
							<Text role="small" color="var(--ui-ink2)">
								{text}
							</Text>
						</Stack>
					))}
				</Card>
			</Content>
			<BottomBar>
				<Button size="lg" block>
					{t('Şimdi başla', 'Start now')}
				</Button>
			</BottomBar>
		</ModuleScreen>
	);
};

export const ExamSolveScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<ModuleScreen
			module="exam"
			noTabBar
			header={<FocusHeader title="1:42:18" sub={t('Temel Matematik', 'Basic Maths')} progress={0.38} right={<div style={{width: 40, height: 40, borderRadius: 20, background: colors.card, border: `1px solid ${colors.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name="grid" size={20} color={colors.ink} stroke={3} /></div>} />}
		>
			<Content tabBar={false} gap={14}>
				<Stack row justify="space-between">
					<Chip>{t('Soru 46 / 120', 'Question 46 / 120')}</Chip>
					<Chip tone="outline" icon="bookmark">
						{t('İşaretle', 'Flag')}
					</Chip>
				</Stack>
				<Text role="body" size={17} weight={600} color={colors.ink} style={{lineHeight: '27px'}}>
					{t('Bir sınıftaki öğrencilerin %40’ı kızdır. Sınıfa 6 kız öğrenci katıldığında kızların oranı %50 oluyor. Buna göre sınıfta başlangıçta kaç öğrenci vardır?', '40% of a class are girls. When 6 girls join, girls make up 50%. How many students were there at first?')}
				</Text>
				<Stack gap={8}>
					<OptionRow letter="A" text="24" />
					<OptionRow letter="B" text="30" state="selected" module="exam" />
					<OptionRow letter="C" text="36" />
					<OptionRow letter="D" text="40" />
					<OptionRow letter="E" text="48" />
				</Stack>
			</Content>
			<BottomBar border>
				<Stack row gap={10}>
					<Button tone="ghost" size="lg" icon="left" />
					<Button tone="soft" size="lg" style={{flex: 1}}>
						{t('Boş bırak', 'Skip')}
					</Button>
					<Button size="lg" iconRight="right" style={{flex: 1}}>
						{t('Sonraki', 'Next')}
					</Button>
				</Stack>
			</BottomBar>
		</ModuleScreen>
	);
};

export const MyExamsScreen: React.FC = () => {
	const t = useT();
	return (
		<ModuleScreen module="exam" tab={1}>
			<Content>
				<PageTitle module="exam" title={t('Denemelerim', 'My exams')} />
				<Segmented items={[t('Yaklaşan · 2', 'Upcoming · 2'), t('Devam eden · 1', 'Active · 1'), t('Biten · 6', 'Done · 6')]} active={0} module="exam" />
				<List>
					{[
						['17', t('TYT Deneme 5', 'TYT Exam 5'), t('Cumartesi · 10:00', 'Saturday · 10:00'), t('Hatırlatma açık', 'Reminder on')],
						['26', t('KPSS GY-GK Deneme 2', 'KPSS GA-GC Exam 2'), t('Pazartesi · 14:00', 'Monday · 14:00'), t('Hatırlat', 'Remind me')],
					].map(([day, title, sub, state], index) => (
						<Stack key={title} row gap={12} style={{padding: '12px 14px'}}>
							<Stack align="center" justify="center" style={{width: 44, height: 50, borderRadius: 14, background: 'rgba(232,89,12,0.12)'}}>
								<Text role="headline" size={17} color={MODULES.exam.color.light}>
									{day}
								</Text>
								<Text role="meta" size={10} weight={800} color={MODULES.exam.color.light}>
									{t('EKİ', 'OCT')}
								</Text>
							</Stack>
							<Stack grow gap={2}>
								<Text role="headline">{title}</Text>
								<Text role="small">{sub}</Text>
							</Stack>
							<Chip tone={index ? 'outline' : 'success'} icon={index ? 'bell' : 'check'} size="sm">
								{state}
							</Chip>
						</Stack>
					))}
				</List>
				<SectionTitle title={t('Takvim', 'Calendar')} sub={t('Ekim 2026', 'October 2026')} />
				<Card padding={14}>
					<Stack row justify="space-between">
						{[12, 13, 14, 15, 16, 17, 18].map((day) => (
							<Stack key={day} align="center" gap={4} style={{width: 40, padding: '6px 0', borderRadius: 12, background: day === 17 ? MODULES.exam.color.light : 'transparent'}}>
								<Text role="meta" color={day === 17 ? '#FFFFFF' : undefined}>
									{['P', 'S', 'Ç', 'P', 'C', 'C', 'P'][day - 12]}
								</Text>
								<Text role="headline" color={day === 17 ? '#FFFFFF' : undefined}>
									{day}
								</Text>
							</Stack>
						))}
					</Stack>
				</Card>
			</Content>
		</ModuleScreen>
	);
};

export const ExamResultsScreen: React.FC = () => {
	const t = useT();
	const lang = useT()('tr', 'en');
	return (
		<ModuleScreen module="exam" tab={2}>
			<Content>
				<PageTitle module="exam" title={t('Sonuçlar', 'Results')} />
				<Card padding={16}>
					<Stack row justify="space-between" align="flex-end">
						<Stack gap={2}>
							<Text role="meta">{t('Net eğrin · son 6 deneme', 'Score trend · last 6')}</Text>
							<Text role="num">{num(78.5, lang)}</Text>
							<Chip tone="success" icon="trend">
								{t('+14,5 net', '+14.5')}
							</Chip>
						</Stack>
						<Sparkline points={[0.2, 0.32, 0.28, 0.5, 0.62, 0.8]} width={170} height={78} color={MODULES.exam.color.light} />
					</Stack>
				</Card>
				<List>
					{[
						[t('TYT Deneme 4', 'TYT Exam 4'), t('12 Ekim · sıralama 8.214', '12 Oct · rank 8,214'), '78,5', '+6,5'],
						[t('AYT Sayısal Deneme 2', 'AYT Science Exam 2'), t('5 Ekim · sıralama 11.902', '5 Oct · rank 11,902'), '41,25', '+3'],
						[t('TYT Deneme 3', 'TYT Exam 3'), t('28 Eylül · sıralama 9.877', '28 Sep · rank 9,877'), '72', '+4,75'],
						[t('Paragraf Branş', 'Reading Subject'), t('21 Eylül', '21 Sep'), '31', '—'],
					].map(([title, sub, score, delta]) => (
						<ListRow key={title} module="exam" title={title} subtitle={sub} trailing={<Stack align="flex-end" gap={2}><Text role="headline" size={16}>{score}</Text><Text role="meta" color="#059669">{delta}</Text></Stack>} />
					))}
				</List>
			</Content>
		</ModuleScreen>
	);
};

export const ExamResultScreen: React.FC = () => {
	const t = useT();
	const lang = t('tr', 'en');
	const colors = useColors();
	return (
		<ModuleScreen module="exam" tab={2} header={<AppHeader left="back" title={t('TYT Deneme 4', 'TYT Exam 4')} right={<div style={{width: 40}} />} />}>
			<Content gap={12}>
				<Card padding={18}>
					<Stack row gap={16}>
						<Ring value={0.65} size={104} stroke={10} color={MODULES.exam.color.light}>
							<Stack align="center">
								<Text role="num" size={28}>
									{num(78.5, lang)}
								</Text>
								<Text role="meta">net</Text>
							</Stack>
						</Ring>
						<Stack gap={6} grow>
							<Chip tone="success" icon="trend">
								{t('+6,5 net', '+6.5')}
							</Chip>
							<Text role="small">
								{t('TYT puanın', 'TYT score')} <b style={{color: colors.ink}}>362,4</b>
							</Text>
							<Text role="small">
								{t('Sıralaman', 'Rank')} <b style={{color: colors.ink}}>8.214</b> / 12.480
							</Text>
						</Stack>
					</Stack>
					<Stack gap={10} style={{marginTop: 16}}>
						{LESSONS.map(([tr, en, score, total, color]) => (
							<Stack key={tr} gap={4}>
								<Stack row justify="space-between">
									<Text role="small" weight={700} color={colors.ink}>
										{t(tr, en)}
									</Text>
									<Text role="small">
										{num(score, lang)} / {total}
									</Text>
								</Stack>
								<Bar value={score / total} color={color} />
							</Stack>
						))}
					</Stack>
				</Card>
				<Card tone="moduleLine" module="exam" padding={14}>
					<Stack row gap={12}>
						<Tile module="exam" icon="target" size={40} />
						<Stack grow gap={1}>
							<Text role="headline">{t('En çok net kaybettiğin 3 konu', 'Your 3 costliest topics')}</Text>
							<Text role="small">{t('Problemler, Paragraf, Kuvvet ve hareket', 'Problems, Reading, Force and motion')}</Text>
						</Stack>
						<Icon name="right" size={18} color={colors.subtle} />
					</Stack>
				</Card>
				<Stack row gap={10}>
					<Button tone="moduleSoft" module="exam" icon="checkCircle" style={{flex: 1}}>
						{t('Çözümler', 'Solutions')}
					</Button>
					<Button tone="moduleSoft" module="exam" icon="file" style={{flex: 1}}>
						{t('Sonuç belgesi', 'Report')}
					</Button>
				</Stack>
			</Content>
		</ModuleScreen>
	);
};

export const ExamAnalysisScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<ModuleScreen module="exam" tab={2} header={<AppHeader left="back" title={t('Eksik konu analizi', 'Gap analysis')} right={<div style={{width: 40}} />} />}>
			<Content gap={12}>
				<Card tone="module" module="exam" padding={14}>
					<Stack row gap={10}>
						<Icon name="sparkles" size={20} color={MODULES.exam.color.light} />
						<Text role="small" color={colors.ink2}>
							{t('Bu 3 konuyu bu hafta çalışırsan yaklaşık 5 net kazanabilirsin.', 'Study these 3 this week and gain about 5 points.')}
						</Text>
					</Stack>
				</Card>
				<List>
					{[
						['Problemler', 'Problems', 'Matematik · yüzde ve oran', 'Maths · ratios', '3,25'],
						['Paragraf', 'Reading', 'Türkçe · ana fikir', 'Turkish · main idea', '2,5'],
						['Kuvvet ve hareket', 'Force and motion', 'Fizik · Newton yasaları', 'Physics · Newton', '1,75'],
					].map(([tr, en, subTr, subEn, loss], index) => (
						<Stack key={tr} row gap={12} align="flex-start" style={{padding: 14}}>
							<div style={{width: 28, height: 28, borderRadius: 9, background: colors.errorSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
								<Text role="headline" size={13} color={colors.error}>
									{index + 1}
								</Text>
							</div>
							<Stack grow gap={6}>
								<Stack row justify="space-between">
									<Text role="headline">{t(tr, en)}</Text>
									<Text role="headline" color={colors.error}>
										−{loss} net
									</Text>
								</Stack>
								<Text role="small">{t(subTr, subEn)}</Text>
								<Stack row gap={6}>
									<Chip tone="module" module="lessons" icon="book" size="sm">
										{t('Mikro ders', 'Micro-lesson')}
									</Chip>
									<Chip tone="module" module="tests" icon="quiz" size="sm">
										{t('20 soru', '20 questions')}
									</Chip>
								</Stack>
							</Stack>
						</Stack>
					))}
				</List>
				<Button size="lg" block icon="plus">
					{t('Bu hafta planıma ekle', 'Add to this week’s plan')}
				</Button>
			</Content>
		</ModuleScreen>
	);
};

export const ExamTrendScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<ModuleScreen module="exam" tab={2} header={<AppHeader left="back" title={t('Ders gelişimi', 'Subject progress')} right={<div style={{width: 40}} />} />}>
			<Content gap={12}>
				<Segmented items={[t('Türkçe', 'Turkish'), t('Matematik', 'Maths'), t('Fen', 'Science'), t('Sosyal', 'Social')]} active={1} module="exam" />
				<Card padding={16}>
					<Stack row justify="space-between" align="flex-end">
						<Stack gap={2}>
							<Text role="meta">{t('Son net', 'Latest')}</Text>
							<Text role="num">21,75</Text>
						</Stack>
						<Chip tone="success" icon="trend">
							{t('+5,5 · 4 denemede', '+5.5 · 4 exams')}
						</Chip>
					</Stack>
					<div style={{marginTop: 12}}>
						<Sparkline points={[0.3, 0.42, 0.38, 0.55, 0.6, 0.72]} width={318} height={120} color={MODULES.tests.color.light} />
					</div>
				</Card>
				<SectionTitle title={t('Konulara göre', 'By topic')} />
				<List>
					{[
						['Problemler', 'Problems', 0.36],
						['Rasyonel sayılar', 'Rationals', 0.62],
						['Fonksiyonlar', 'Functions', 0.48],
						['Sayı basamakları', 'Digits', 0.88],
					].map(([tr, en, value]) => (
						<Stack key={tr as string} row gap={12} style={{padding: '12px 14px'}}>
							<Text role="headline" style={{width: 130}}>
								{t(tr as string, en as string)}
							</Text>
							<Bar value={value as number} color={(value as number) < 0.5 ? colors.error : MODULES.tests.color.light} />
							<Text role="small" weight={700} style={{width: 36, textAlign: 'right'}}>
								%{Math.round((value as number) * 100)}
							</Text>
						</Stack>
					))}
				</List>
			</Content>
		</ModuleScreen>
	);
};

export const ExamSolutionsScreen: React.FC = () => {
	const t = useT();
	return (
		<ModuleScreen module="exam" tab={2} header={<AppHeader left="back" title={t('Çözümler', 'Solutions')} right={<div style={{width: 40}} />} />}>
			<Content gap={12}>
				<Segmented items={[t('Tümü', 'All'), t('Yanlışlar · 12', 'Wrong · 12'), t('Boşlar · 3', 'Blank · 3')]} active={1} module="exam" />
				<Card padding={14}>
					<Text role="over" style={{marginBottom: 10}}>
						{t('Temel Matematik · soru haritası', 'Basic Maths · question map')}
					</Text>
					<div style={{display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6}}>
						{Array.from({length: 40}, (_, index) => {
							const wrong = [2, 5, 9, 13, 14, 20, 25, 27, 31, 33, 36, 38].includes(index);
							const empty = [7, 18, 29].includes(index);
							return (
								<div key={index} style={{height: 32, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: wrong ? 'var(--ui-errorSoft)' : empty ? 'var(--ui-line2)' : 'var(--ui-successSoft)', outline: index === 5 ? '2px solid var(--ui-ink)' : undefined}}>
									<Text role="meta" weight={800} color={wrong ? 'var(--ui-error)' : empty ? 'var(--ui-muted)' : 'var(--ui-success)'}>
										{index + 41}
									</Text>
								</div>
							);
						})}
					</div>
				</Card>
				<List>
					<ListRow module="exam" icon="playCircle" title={t('Soru 46 · Problemler', 'Q46 · Problems')} subtitle={t('Senin cevabın A · doğru B', 'You: A · correct: B')} />
					<ListRow module="exam" icon="playCircle" title={t('Soru 49 · Rasyonel sayılar', 'Q49 · Rationals')} subtitle={t('Senin cevabın D · doğru C', 'You: D · correct: C')} />
				</List>
			</Content>
		</ModuleScreen>
	);
};

export const ExamBookletScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<ModuleScreen module="exam" noTabBar header={<FocusHeader left="left" title={t('Soru 46', 'Question 46')} sub={t('Çözümler · Matematik', 'Solutions · Maths')} right={<div style={{width: 40, height: 40, borderRadius: 20, background: colors.card, border: `1px solid ${colors.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name="bookmark" size={20} color={colors.ink} /></div>} />}>
			<Content tabBar={false} gap={12}>
				<Stack row gap={8}>
					<Chip tone="error" icon="x">
						{t('Senin cevabın: A', 'Yours: A')}
					</Chip>
					<Chip tone="success" icon="check">
						{t('Doğru: B', 'Correct: B')}
					</Chip>
				</Stack>
				<Text role="body" weight={600} color={colors.ink}>
					{t('Sınıfa 6 kız öğrenci katıldığında oran %50 oluyor. Başlangıçta kaç öğrenci vardır?', 'When 6 girls join, girls are 50%. How many students at first?')}
				</Text>
				<OptionRow letter="A" text="24" state="wrong" />
				<OptionRow letter="B" text="30" state="correct" />
				<Card padding={16}>
					<Text role="section" size={15}>
						{t('Çözüm', 'Solution')}
					</Text>
					<Text role="body" style={{marginTop: 6}}>
						{t('6 kız katılınca hem kızlar hem toplam 6 artar: (0,4x + 6) / (x + 6) = 0,5 → x = 30.', 'Both girls and total grow by 6: (0.4x + 6) / (x + 6) = 0.5 → x = 30.')}
					</Text>
				</Card>
				<Stack row gap={10}>
					<Button tone="moduleSoft" module="exam" icon="playCircle" style={{flex: 1}}>
						{t('Video çözüm', 'Video')}
					</Button>
					<Button tone="dark" icon="sparkles" style={{flex: 1}}>
						{t('SinoAI’ye sor', 'Ask SinoAI')}
					</Button>
				</Stack>
			</Content>
			<BottomBar border>
				<Stack row justify="space-between">
					<Button tone="ghost" icon="left">
						45
					</Button>
					<Text role="small">{t('Yalnız yanlışlar · 12', 'Wrong only · 12')}</Text>
					<Button tone="ghost" iconRight="right">
						47
					</Button>
				</Stack>
			</BottomBar>
		</ModuleScreen>
	);
};
