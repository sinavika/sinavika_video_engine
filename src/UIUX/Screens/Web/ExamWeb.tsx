import React from 'react';
import {useColors, useModuleColors, useT} from '../../Context';
import {Icon} from '../../Icons';
import {MODULES} from '../../ModuleIdentity';
import {Bar, Bars, Button, Card, Chip, List, ListRow, OptionRow, Ring, Segmented, Sparkline, Stack, Text, Tile} from '../../Parts/Shared';
import {Grid, Immersive, ModuleBanner, ModuleHead, Panel, WCard} from '../../Parts/Web';

/** Web Denemeler: exams, my exams with calendar, details, solving, results, analysis, solutions and statistics. */

const LESSONS: [string, string, number, number, string][] = [
	['Türkçe', 'Turkish', 32.5, 40, '#0284C7'],
	['Sosyal Bilimler', 'Social sciences', 14.25, 20, '#0D9488'],
	['Temel Matematik', 'Basic Maths', 21.75, 40, '#4F46E5'],
	['Fen Bilimleri', 'Science', 10, 20, '#DB2777'],
];

const ExamCard: React.FC<{title: string; sub: string; meta: string; tag?: string}> = ({title, sub, meta, tag}) => (
	<Card padding={16}>
		<Stack row gap={12} align="flex-start">
			<Tile module="exam" size={42} />
			<Stack grow gap={2}>
				<Stack row gap={8}>
					<Text role="headline">{title}</Text>
					{tag ? <Chip tone="module" module="exam" size="sm">{tag}</Chip> : null}
				</Stack>
				<Text role="small">{sub}</Text>
				<Text role="meta">{meta}</Text>
			</Stack>
			<Icon name="right" size={18} color="#94A3B8" />
		</Stack>
	</Card>
);

export const WebExamHomeScreen: React.FC = () => {
	const t = useT();
	return (
		<Panel active="exam">
			<ModuleHead module="exam" tab={0} title={t('Denemeler', 'Practice exams')} sub={t('Türkiye geneli ve konu denemeleri', 'Nationwide and topic exams')} actions={<Button tone="ghost" icon="filter">{t('Filtrele', 'Filter')}</Button>} />
			<Grid columns="2fr 1fr">
				<ModuleBanner module="exam" over={t('Canlı · Türkiye geneli · Cumartesi 10:00', 'Live · nationwide · Saturday 10:00')} title={t('TYT Deneme 5', 'TYT Exam 5')} text={t('120 soru · 165 dk · 12.480 kişi katılıyor · sonuç 2 saat sonra', '120 questions · 165 min · 12,480 students · results in 2 hours')} action={t('Hatırlat', 'Remind me')} />
				<Card padding={20} tone="moduleLine" module="exam">
					<Stack gap={10}>
						<Text role="over" color={MODULES.exam.color.light}>
							{t('Devam eden', 'In progress')}
						</Text>
						<Text role="section">{t('AYT Sayısal Deneme 3', 'AYT Science Exam 3')}</Text>
						<Text role="small">{t('Fen Bilimleri · 48 / 80 soru · 74 dk kaldı', 'Science · 48 / 80 · 74 min left')}</Text>
						<Bar value={0.6} color={MODULES.exam.color.light} />
						<Button block>{t('Kaldığın yerden devam et', 'Resume')}</Button>
					</Stack>
				</Card>
			</Grid>
			<Stack row gap={8}>
				{[t('Tümü', 'All'), 'TYT', 'AYT', t('Branş', 'Subject'), t('Ücretsiz', 'Free')].map((label, index) => (
					<Chip key={label} tone={index ? 'outline' : 'moduleSolid'} module="exam" style={{height: 34, fontSize: 13}}>
						{label}
					</Chip>
				))}
			</Stack>
			<Grid columns="repeat(3, 1fr)" gap={14}>
				<ExamCard title={t('TYT Deneme 4 · Tekrar', 'TYT Exam 4 · Retake')} sub={t('Eksiklerin üzerinden', 'Built on your gaps')} meta="120 · 165 dk" tag={t('Önerilen', 'Suggested')} />
				<ExamCard title={t('AYT Sayısal Deneme 3', 'AYT Science Exam 3')} sub={t('Matematik, Fen', 'Maths, Science')} meta="80 · 180 dk" />
				<ExamCard title={t('Paragraf Branş', 'Reading Subject')} sub={t('Türkçe', 'Turkish')} meta="40 · 50 dk" tag={t('Yeni', 'New')} />
				<ExamCard title={t('Problemler Branş', 'Problems Subject')} sub={t('Matematik', 'Maths')} meta="30 · 45 dk" tag={t('Ücretsiz', 'Free')} />
				<ExamCard title={t('TYT Deneme 3', 'TYT Exam 3')} sub={t('Arşiv · sıralama açık', 'Archive')} meta="120 · 165 dk" />
				<ExamCard title={t('Fen Branş', 'Science Subject')} sub={t('Fizik, Kimya, Biyoloji', 'Physics, Chemistry, Biology')} meta="20 · 30 dk" />
			</Grid>
		</Panel>
	);
};

export const WebMyExamsScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('exam');
	const days = Array.from({length: 35}, (_, index) => index - 2);
	return (
		<Panel active="exam">
			<ModuleHead module="exam" tab={1} title={t('Denemelerim', 'My exams')} sub={t('Yaklaşan, devam eden ve biten denemelerin; takvim burada', 'Upcoming, active and finished; the calendar lives here')} />
			<Grid columns="1fr 1.1fr">
				<Stack gap={14}>
					<Segmented items={[t('Yaklaşan · 2', 'Upcoming · 2'), t('Devam eden · 1', 'Active · 1'), t('Biten · 6', 'Done · 6')]} module="exam" />
					<List>
						{[
							['17', t('TYT Deneme 5', 'TYT Exam 5'), t('Cumartesi 10:00 · Türkiye geneli', 'Sat 10:00 · nationwide'), t('Hatırlatma açık', 'Reminder on'), 'success'],
							['26', t('KPSS GY-GK Deneme 2', 'KPSS Exam 2'), t('Pazartesi 14:00', 'Mon 14:00'), t('Hatırlat', 'Remind me'), 'outline'],
						].map(([day, title, sub, state, tone]) => (
							<Stack key={title} row gap={14} style={{padding: '14px 16px'}}>
								<Stack align="center" justify="center" style={{width: 52, height: 56, borderRadius: 16, background: mod.soft}}>
									<Text role="section" color={mod.color}>
										{day}
									</Text>
									<Text role="meta" size={10.5} weight={800} color={mod.color}>
										{t('EKİ', 'OCT')}
									</Text>
								</Stack>
								<Stack grow gap={2}>
									<Text role="headline">{title}</Text>
									<Text role="small">{sub}</Text>
								</Stack>
								<Chip tone={tone as 'success'} size="sm" icon={tone === 'success' ? 'check' : 'bell'}>
									{state}
								</Chip>
							</Stack>
						))}
					</List>
				</Stack>
				<WCard title={t('Ekim 2026', 'October 2026')}>
					<Grid columns="repeat(7, 1fr)" gap={6}>
						{['P', 'S', 'Ç', 'P', 'C', 'C', 'P'].map((day, index) => (
							<Text key={index} role="meta" align="center">
								{day}
							</Text>
						))}
						{days.map((day) => {
							const exam = day === 17 || day === 26 || day === 12;
							const today = day === 15;
							return (
								<Stack key={day} align="center" justify="center" gap={3} style={{height: 46, borderRadius: 12, background: today ? colors.ink : exam ? mod.soft : 'transparent'}}>
									<Text role="headline" size={13.5} color={today ? '#FFFFFF' : day < 1 ? colors.subtle : colors.ink}>
										{day < 1 ? 29 + day : day > 31 ? day - 31 : day}
									</Text>
									{exam ? <div style={{width: 6, height: 6, borderRadius: 3, background: mod.color}} /> : null}
								</Stack>
							);
						})}
					</Grid>
				</WCard>
			</Grid>
		</Panel>
	);
};

export const WebExamDetailScreen: React.FC = () => {
	const t = useT();
	return (
		<Panel active="exam" crumb={t('Denemeler ›', 'Exams ›')}>
			<ModuleBanner module="exam" over={t('TYT · Türkiye geneli', 'TYT · Nationwide')} title={t('TYT Deneme 5', 'TYT Exam 5')} text={t('Cumartesi 17 Ekim, 10:00. Sonuçlar 2 saat sonra; sıralaman 12.480 kişi içinde.', 'Saturday 17 Oct, 10:00. Results in 2 hours; ranked among 12,480.')} action={t('Hatırlat', 'Remind me')} />
			<Grid columns="1.3fr 1fr">
				<WCard title={t('Bölümler', 'Sections')}>
					<List>
						{LESSONS.map(([tr, en, , total, color]) => (
							<Stack key={tr} row gap={12} style={{padding: '13px 16px'}}>
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
				</WCard>
				<WCard title={t('Kurallar', 'Rules')}>
					<Stack gap={12}>
						{[['clock', t('165 dakika; ara verilebilir, süre işler', '165 min; pausing keeps time running')], ['x', t('4 yanlış 1 doğruyu götürür', '4 wrong cancel 1 right')], ['bookmark', t('Emin olmadığın soruyu işaretle', 'Flag questions you are unsure of')], ['wifi', t('Bağlantı koparsa cevapların saklanır', 'Answers are kept offline')]].map(([icon, text]) => (
							<Stack key={text} row gap={12}>
								<Tile module="exam" icon={icon as 'clock'} size={34} />
								<Text role="small" color="var(--ui-ink2)">
									{text}
								</Text>
							</Stack>
						))}
						<Button size="lg" block icon="play" style={{marginTop: 8}}>
							{t('Denemeye başla', 'Start exam')}
						</Button>
					</Stack>
				</WCard>
			</Grid>
		</Panel>
	);
};

export const WebExamSolveScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('exam');
	return (
		<Immersive
			module="exam"
			title={t('TYT Deneme 5', 'TYT Exam 5')}
			sub={t('Temel Matematik · 2. oturum', 'Basic Maths · section 2')}
			progress={0.38}
			right={
				<Stack row gap={18}>
					<Stack row gap={8}>
						<Icon name="clock" size={20} color={mod.color} />
						<Text role="num" size={24}>
							1:42:18
						</Text>
					</Stack>
					<Text role="small">{t('46 / 120 yanıtlandı', '46 / 120 answered')}</Text>
					<Button tone="dark">{t('Denemeyi bitir', 'Finish exam')}</Button>
				</Stack>
			}
		>
			<Stack gap={20} style={{flex: 1, padding: '40px 120px'}}>
				<Stack row justify="space-between">
					<Chip style={{height: 32, fontSize: 13}}>{t('Soru 46', 'Question 46')}</Chip>
					<Chip tone="outline" icon="bookmark" style={{height: 32, fontSize: 13}}>
						{t('İşaretle', 'Flag')}
					</Chip>
				</Stack>
				<Text role="body" size={20} weight={600} color={colors.ink} style={{lineHeight: '32px', maxWidth: 760}}>
					{t('Bir sınıftaki öğrencilerin %40’ı kızdır. Sınıfa 6 kız öğrenci katıldığında kızların oranı %50 oluyor. Buna göre sınıfta başlangıçta kaç öğrenci vardır?', '40% of a class are girls. When 6 girls join, girls are 50%. How many students were there at first?')}
				</Text>
				<Stack gap={10} style={{maxWidth: 560}}>
					<OptionRow letter="A" text="24" />
					<OptionRow letter="B" text="30" state="selected" module="exam" />
					<OptionRow letter="C" text="36" />
					<OptionRow letter="D" text="40" />
					<OptionRow letter="E" text="48" />
				</Stack>
				<div style={{flex: 1}} />
				<Stack row gap={10}>
					<Button tone="ghost" size="lg" icon="left">
						{t('Önceki', 'Previous')}
					</Button>
					<Button tone="soft" size="lg">
						{t('Boş bırak', 'Skip')}
					</Button>
					<Button size="lg" iconRight="right">
						{t('Sonraki', 'Next')}
					</Button>
					<Text role="meta" style={{marginLeft: 12}}>
						{t('Klavye: A–E seç · → sonraki · B işaretle', 'Keys: A–E choose · → next · B flag')}
					</Text>
				</Stack>
			</Stack>
			<div style={{width: 300, borderLeft: `1px solid ${colors.line}`, padding: 24, background: colors.bg, boxSizing: 'border-box'}}>
				<Text role="over">{t('Temel Matematik · 40 soru', 'Basic Maths · 40 questions')}</Text>
				<Grid columns="repeat(5, 1fr)" gap={6} style={{marginTop: 12}}>
					{Array.from({length: 40}, (_, index) => {
						const number = index + 41;
						const done = number < 46;
						const now = number === 46;
						return (
							<Stack key={number} align="center" justify="center" style={{height: 36, borderRadius: 10, background: now ? mod.color : done ? colors.card : 'transparent', border: now ? undefined : done ? `1px solid ${colors.line}` : `1px dashed ${colors.line}`, position: 'relative'}}>
								<Text role="meta" weight={800} color={now ? '#FFFFFF' : done ? colors.ink : colors.subtle}>
									{number}
								</Text>
								{number === 43 ? <div style={{position: 'absolute', top: 4, right: 4, width: 6, height: 6, borderRadius: 3, background: colors.warning}} /> : null}
							</Stack>
						);
					})}
				</Grid>
				<Text role="meta" style={{marginTop: 14}}>
					{t('1 işaretli soru', '1 flagged question')}
				</Text>
			</div>
		</Immersive>
	);
};

export const WebResultsScreen: React.FC = () => {
	const t = useT();
	return (
		<Panel active="exam">
			<ModuleHead module="exam" tab={2} title={t('Sonuçlar', 'Results')} sub={t('Netlerin, sıralaman ve gelişimin', 'Your scores, rank and progress')} />
			<Grid columns="1fr 1.4fr">
				<WCard title={t('Net eğrin', 'Score trend')}>
					<Text role="num" size={34}>
						78,5
					</Text>
					<Chip tone="success" icon="trend">
						{t('+14,5 net · 6 deneme', '+14.5 · 6 exams')}
					</Chip>
					<div style={{marginTop: 16}}>
						<Sparkline points={[0.2, 0.32, 0.28, 0.5, 0.62, 0.8]} width={360} height={140} color={MODULES.exam.color.light} />
					</div>
				</WCard>
				<List>
					{[
						[t('TYT Deneme 4', 'TYT Exam 4'), t('12 Ekim · sıralama 8.214', '12 Oct · rank 8,214'), '78,5', '+6,5'],
						[t('AYT Sayısal Deneme 2', 'AYT Science Exam 2'), t('5 Ekim · sıralama 11.902', '5 Oct · rank 11,902'), '41,25', '+3'],
						[t('TYT Deneme 3', 'TYT Exam 3'), t('28 Eylül · sıralama 9.877', '28 Sep · rank 9,877'), '72', '+4,75'],
						[t('Paragraf Branş', 'Reading Subject'), t('21 Eylül', '21 Sep'), '31', '—'],
						[t('TYT Deneme 2', 'TYT Exam 2'), t('14 Eylül · sıralama 12.004', '14 Sep · rank 12,004'), '67,25', '+3,25'],
					].map(([title, sub, score, delta]) => (
						<ListRow key={title} module="exam" title={title} subtitle={sub} trailing={<Stack row gap={18}><Stack align="flex-end" gap={1}><Text role="section">{score}</Text><Text role="meta" color="#059669">{delta}</Text></Stack><Button tone="moduleSoft" module="exam" size="sm">{t('Analiz', 'Analysis')}</Button></Stack>} />
					))}
				</List>
			</Grid>
		</Panel>
	);
};

export const WebResultScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<Panel active="exam" crumb={t('Sonuçlar ›', 'Results ›')}>
			<ModuleHead module="exam" tab={2} title={t('TYT Deneme 4', 'TYT Exam 4')} sub={t('12 Ekim · Türkiye geneli · 12.480 katılımcı', '12 Oct · nationwide · 12,480 students')} actions={<><Button tone="ghost" icon="chart">{t('Karşılaştır', 'Compare')}</Button><Button tone="moduleSoft" module="exam" icon="checkCircle">{t('Çözümler', 'Solutions')}</Button></>} />
			<Grid columns="1fr 1.4fr">
				<Stack gap={18}>
					<Card padding={20}>
						<Stack row gap={20}>
							<Ring value={0.65} size={120} stroke={11} color={MODULES.exam.color.light}>
								<Text role="num" size={30}>
									78,5
								</Text>
							</Ring>
							<Stack gap={8}>
								<Chip tone="success" icon="trend">
									+6,5 net
								</Chip>
								<Text role="small" size={14}>
									{t('TYT puanın', 'TYT score')} <b style={{color: colors.ink}}>362,4</b>
								</Text>
								<Text role="small" size={14}>
									{t('Türkiye sıralaman', 'National rank')} <b style={{color: colors.ink}}>8.214</b>
								</Text>
							</Stack>
						</Stack>
					</Card>
					<WCard title={t('Derslere göre', 'By subject')}>
						<Stack gap={12}>
							{LESSONS.map(([tr, en, score, total, color]) => (
								<Stack key={tr} gap={5}>
									<Stack row justify="space-between">
										<Text role="small" weight={700} color={colors.ink}>
											{t(tr, en)}
										</Text>
										<Text role="small">
											{String(score).replace('.', ',')} / {total}
										</Text>
									</Stack>
									<Bar value={score / total} color={color} />
								</Stack>
							))}
						</Stack>
					</WCard>
				</Stack>
				<WCard title={t('Net kaybettiğin konular', 'Where you lost points')} action={t('+ Bu hafta planıma ekle', '+ Add to this week')}>
					<Card tone="module" module="exam" padding={12} style={{marginBottom: 12}}>
						<Stack row gap={10}>
							<Icon name="sparkles" size={18} color={MODULES.exam.color.light} />
							<Text role="small" color={colors.ink2}>
								{t('Bu 3 konuyu bu hafta çalışırsan yaklaşık 5 net kazanabilirsin.', 'Study these 3 this week to gain about 5 points.')}
							</Text>
						</Stack>
					</Card>
					<List>
						{[
							['Problemler', 'Problems', 'Matematik', 'Maths', '3,25', '4 / 9 / 2'],
							['Paragraf', 'Reading', 'Türkçe', 'Turkish', '2,5', '18 / 6 / 2'],
							['Kuvvet ve hareket', 'Force and motion', 'Fizik', 'Physics', '1,75', '1 / 5 / 1'],
							['Osmanlı kültür ve medeniyeti', 'Ottoman culture', 'Tarih', 'History', '1,25', '2 / 3 / 1'],
							['Hücre', 'The cell', 'Biyoloji', 'Biology', '1', '1 / 3 / 0'],
						].map(([tr, en, lessonTr, lessonEn, loss, dyb]) => (
							<Stack key={tr} row gap={12} style={{padding: '12px 14px'}}>
								<Stack grow gap={1}>
									<Text role="headline">{t(tr, en)}</Text>
									<Text role="small">
										{t(lessonTr, lessonEn)} · D/Y/B {dyb}
									</Text>
								</Stack>
								<Text role="headline" color={colors.error} style={{width: 90}}>
									−{loss} net
								</Text>
								<Chip tone="module" module="lessons" icon="book" size="sm">
									{t('Ders', 'Lesson')}
								</Chip>
								<Chip tone="module" module="tests" icon="quiz" size="sm">
									{t('Test', 'Quiz')}
								</Chip>
							</Stack>
						))}
					</List>
				</WCard>
			</Grid>
		</Panel>
	);
};

export const WebSolutionsScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<Panel active="exam" crumb={t('Sonuçlar ›', 'Results ›')}>
			<ModuleHead module="exam" tab={2} title={t('Çözümler · TYT Deneme 4', 'Solutions · TYT Exam 4')} sub={t('Temel Matematik', 'Basic Maths')} actions={<div style={{width: 320}}><Segmented items={[t('Tümü', 'All'), t('Yanlışlar · 12', 'Wrong · 12'), t('Boşlar', 'Blank')]} active={1} module="exam" /></div>} />
			<Grid columns="240px 1fr" style={{flex: 1}}>
				<Card padding={16}>
					<Text role="over">{t('Soru haritası', 'Question map')}</Text>
					<Grid columns="repeat(5, 1fr)" gap={6} style={{marginTop: 12}}>
						{Array.from({length: 40}, (_, index) => {
							const wrong = [2, 5, 9, 13, 14, 20, 25, 27, 31, 33, 36, 38].includes(index);
							const empty = [7, 18, 29].includes(index);
							return (
								<Stack key={index} align="center" justify="center" style={{height: 34, borderRadius: 9, background: wrong ? colors.errorSoft : empty ? colors.line2 : colors.successSoft, outline: index === 5 ? `2.5px solid ${colors.ink}` : undefined}}>
									<Text role="meta" weight={800} color={wrong ? colors.error : empty ? colors.muted : colors.success}>
										{index + 41}
									</Text>
								</Stack>
							);
						})}
					</Grid>
				</Card>
				<Card padding={0} style={{display: 'flex', overflow: 'hidden'}}>
					<Stack gap={14} style={{flex: 1, padding: 24, borderRight: `1px solid ${colors.line2}`}}>
						<Stack row gap={8}>
							<Chip>{t('Soru 46', 'Question 46')}</Chip>
							<Chip tone="error" icon="x">
								{t('Senin cevabın: A', 'Yours: A')}
							</Chip>
							<Chip tone="success" icon="check">
								{t('Doğru: B', 'Correct: B')}
							</Chip>
						</Stack>
						<Text role="body" size={17} weight={600} color={colors.ink} style={{lineHeight: '27px'}}>
							{t('Bir sınıftaki öğrencilerin %40’ı kızdır. 6 kız katıldığında oran %50 oluyor. Başlangıçta kaç öğrenci vardır?', '40% are girls; after 6 girls join, 50%. How many at first?')}
						</Text>
						<OptionRow letter="A" text="24" state="wrong" />
						<OptionRow letter="B" text="30" state="correct" />
						<OptionRow letter="C" text="36" />
						<OptionRow letter="D" text="40" />
					</Stack>
					<Stack gap={14} style={{width: 380, padding: 24}}>
						<Text role="section">{t('Çözüm', 'Solution')}</Text>
						<Text role="body">{t('6 kız katılınca hem kızlar hem toplam 6 artar: (0,4x + 6) / (x + 6) = 0,5 → x = 30.', 'Both grow by 6: (0.4x + 6) / (x + 6) = 0.5 → x = 30.')}</Text>
						<Card padding={12} style={{background: colors.warningSoft, border: 0}}>
							<Text role="small" color="#92400E">
								{t('Sık hata: paydayı (toplamı) artırmayı unutmak.', 'Common mistake: forgetting the total grows too.')}
							</Text>
						</Card>
						<div style={{height: 150, borderRadius: 16, background: '#0B1220', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							<Icon name="playCircle" size={46} color="#FFFFFF" />
						</div>
						<Button tone="dark" icon="sparkles" block>
							{t('SinoAI’ye bu soruyu sor', 'Ask SinoAI about this')}
						</Button>
					</Stack>
				</Card>
			</Grid>
		</Panel>
	);
};

export const WebStatsScreen: React.FC = () => {
	const t = useT();
	const mod = useModuleColors('exam');
	return (
		<Panel active="exam">
			<ModuleHead module="exam" tab={2} tabs={[t('Denemeler', 'Exams'), t('Denemelerim', 'My exams'), t('İstatistik', 'Statistics')]} title={t('İstatistik', 'Statistics')} sub={t('Netlerin, sürelerin ve gelişimin', 'Your scores, timing and progress')} />
			<Grid columns="repeat(4, 1fr)" gap={14}>
				{[[t('Çözülen deneme', 'Exams taken'), '6'], [t('Ortalama net', 'Average score'), '71,4'], [t('En iyi sıralama', 'Best rank'), '8.214'], [t('Çalışma süresi', 'Study time'), t('42 sa', '42 h')]].map(([label, value]) => (
					<Card key={label} padding={18}>
						<Text role="meta">{label}</Text>
						<Text role="num" size={28}>
							{value}
						</Text>
					</Card>
				))}
			</Grid>
			<Grid columns="1.2fr 1fr">
				<WCard title={t('Derslere göre net gelişimi', 'Score by subject')}>
					<Stack gap={14}>
						{LESSONS.map(([tr, en, score, total, color]) => (
							<Stack key={tr} row gap={14}>
								<Text role="headline" style={{width: 150}}>
									{t(tr, en)}
								</Text>
								<Sparkline points={[0.3, 0.38, 0.35, 0.5, score / total]} width={220} height={40} color={color} fill={false} />
								<Text role="headline" style={{width: 70, textAlign: 'right'}}>
									{String(score).replace('.', ',')}
								</Text>
								<Chip tone="success" size="sm">
									+{(score / 10).toFixed(1).replace('.', ',')}
								</Chip>
							</Stack>
						))}
					</Stack>
				</WCard>
				<WCard title={t('Soru başına süre', 'Time per question')}>
					<Bars values={[0.5, 0.7, 0.9, 0.6]} labels={[t('Türkçe', 'Tur.'), t('Sosyal', 'Soc.'), t('Mat', 'Maths'), t('Fen', 'Sci.')]} highlight={2} color={mod.color} height={140} barWidth={48} />
					<Text role="small" style={{marginTop: 12}}>
						{t('Matematikte soru başına 1 dk 48 sn harcıyorsun; hedef 1 dk 20 sn.', 'Maths takes 1:48 per question; target 1:20.')}
					</Text>
				</WCard>
			</Grid>
		</Panel>
	);
};
