import React from 'react';
import {useColors, useModuleColors, useT} from '../../Context';
import {Icon, type UIIconName} from '../../Icons';
import {type ModuleKey} from '../../ModuleIdentity';
import {Bar, Button, Card, Chip, Segmented, Stack, Text, Tile} from '../../Parts/Shared';
import {EntryRow} from '../../Parts/Study';
import {Grid, Immersive, ModuleHead, Panel, WCard} from '../../Parts/Web';
import {EmbedStep, WORK_TOPICS} from '../Mobile/Lessons';
import {LessonReviewSessionScreen} from '../Mobile/Gaps';
import {FLAGGED_QUESTIONS, SOLVED_QUIZZES} from '../Mobile/Learn';
import {SUMMARY_TABS} from './AssistWeb';
import {Back, Main, StudyPlayer} from './LessonsWeb';

/**
 * Web student pages that had no drawing (compatibility report 13–14 Nov
 * 2026, §F). Same parts and copy as the app; the tablet shows these pages
 * as they are.
 */

const Row: React.FC<{icon?: UIIconName; module?: ModuleKey; title: string; sub: string; right?: React.ReactNode}> = ({icon, module, title, sub, right}) => {
	const colors = useColors();
	return (
		<Stack row gap={14} style={{padding: '12px 4px', borderBottom: `1px solid ${colors.line2}`}}>
			{module ? (
				<Tile module={module} icon={icon} size={40} />
			) : (
				<div style={{width: 40, height: 40, borderRadius: 12, background: colors.line2, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<Icon name={icon ?? 'file'} size={20} color={colors.ink2} />
				</div>
			)}
			<Stack grow gap={1}>
				<Text role="headline">{title}</Text>
				<Text role="small">{sub}</Text>
			</Stack>
			{right}
		</Stack>
	);
};

/* ------------------------------------------------------------------ Sınav takvimi */

export const WebExamCalendarScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('exam');
	const rows: [string, string, string, string][] = [
		['YKS · TYT', t('Haziran 2027 · Cumartesi', 'June 2027 · Saturday'), '245', t('gün', 'days')],
		['YKS · AYT, YDT', t('Haziran 2027 · Pazar', 'June 2027 · Sunday'), '246', t('gün', 'days')],
		['KPSS Lisans', t('Temmuz 2027', 'July 2027'), '280', t('gün', 'days')],
	];
	return (
		<Panel active="exam">
			<ModuleHead module="exam" tab={0} title={t('Sınav takvimi', 'Exam calendar')} sub={t('Hedef sınavın ve öteki resmî sınavlar; tarihler ÖSYM duyurusuyla güncellenir.', 'Your target exam and other official exams.')} />
			<Grid columns="1.4fr 1fr">
				<WCard title={t('Sınavlar', 'Exams')}>
					{rows.map(([name, date, days, unit], index) => (
						<Row
							key={name}
							module="exam"
							icon="calendar"
							title={name}
							sub={date}
							right={
								<Stack align="flex-end" gap={0}>
									<Text role="section" color={index ? colors.ink : mod.ink}>
										{days}
									</Text>
									<Text role="meta">{unit}</Text>
								</Stack>
							}
						/>
					))}
				</WCard>
				<WCard title={t('Bu ay Sınavika denemeleri', 'Sınavika exams this month')}>
					<Stack gap={10}>
						<EntryRow module="exam" strong icon="exam" title={t('TYT Deneme 5', 'TYT Exam 5')} sub={t('Cumartesi 10:00 · Türkiye geneli', 'Saturday 10:00 · nationwide')} />
						<EntryRow module="exam" icon="exam" title={t('KPSS GY-GK Deneme 2', 'KPSS Exam 2')} sub={t('Pazartesi 14:00', 'Monday 14:00')} />
					</Stack>
				</WCard>
			</Grid>
		</Panel>
	);
};

/* ------------------------------------------------------------------ Deneme · başlamadan önce (web) */

export const WebExamStartScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('exam');
	return (
		<Immersive module="exam" title={t('TYT Deneme 5', 'TYT Exam 5')} sub={t('Başlamadan önce', 'Before you start')}>
			<Stack align="center" justify="center" gap={22} style={{flex: 1}}>
				<div style={{width: 150, height: 150, borderRadius: 75, border: `12px solid ${mod.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box'}}>
					<Text role="display" size={56}>
						3
					</Text>
				</div>
				<Text role="title" size={28}>
					{t('Hazırsan başlıyoruz', 'Starting when you are ready')}
				</Text>
				<Stack gap={10} style={{width: 520}}>
					{[
						['clock', t('165 dakika; ara verilebilir, süre işler', '165 min; you can pause, time runs')],
						['x', t('4 yanlış 1 doğruyu götürür', '4 wrong cancel 1 right')],
						['bookmark', t('Emin olmadığın soruyu işaretle', 'Flag what you are unsure of')],
						['wifi', t('Bağlantı koparsa cevapların saklanır', 'Answers are kept offline')],
					].map(([icon, text]) => (
						<Stack key={text} row gap={12} style={{padding: '10px 14px', borderRadius: 14, background: colors.line2}}>
							<Icon name={icon as UIIconName} size={18} color={mod.ink} />
							<Text role="body" size={15}>
								{text}
							</Text>
						</Stack>
					))}
				</Stack>
				<Button tone="module" module="exam" size="lg" icon="play" style={{width: 520}}>
					{t('Şimdi başla', 'Start now')}
				</Button>
			</Stack>
		</Immersive>
	);
};

/* ------------------------------------------------------------------ Dersler · tekrar oturumu */

export const WebLessonReviewSessionScreen: React.FC = () => (
	<StudyPlayer
		step={2}
		review={5}
		section="Tekrar"
		nav={
			<>
				<Back>Tekrarı kapat</Back>
				<Main>Sonraki</Main>
			</>
		}
	>
		<EmbedStep>
			<LessonReviewSessionScreen />
		</EmbedStep>
	</StudyPlayer>
);

/* ------------------------------------------------------------------ Bilgi Kartları · bugün */

export const WebCardsTodayScreen: React.FC = () => {
	const t = useT();
	const mod = useModuleColors('flashcards');
	return (
		<Panel active="flashcards">
			<ModuleHead
				module="flashcards"
				tab={1}
				title={t('Bugün', 'Today')}
				sub={t('32 kart tekrar zamanında · yaklaşık 8 dakika', '32 cards due · about 8 minutes')}
				actions={
					<Button tone="module" module="flashcards" icon="play">
						{t('Tekrara başla', 'Start review')}
					</Button>
				}
			/>
			<Grid columns="1fr 1fr">
				{[
					[t('Kimya · Mol', 'Chemistry · Mole'), 12, 0.4],
					[t('Tarih · Osmanlı', 'History · Ottoman'), 10, 0.6],
					[t('Türkçe · Ses bilgisi', 'Turkish · Phonetics'), 6, 0.2],
					[t('Coğrafya · İklim', 'Geography · Climate'), 4, 0.8],
				].map(([name, count, share]) => (
					<WCard key={name as string}>
						<Stack row gap={12}>
							<Tile module="flashcards" size={42} />
							<Stack grow gap={4}>
								<Text role="headline">{name}</Text>
								<Bar value={share as number} color={mod.color} track={mod.track} height={6} />
							</Stack>
							<Chip tone="module" module="flashcards" size="sm">
								{t(`${count} kart`, `${count} cards`)}
							</Chip>
						</Stack>
					</WCard>
				))}
			</Grid>
		</Panel>
	);
};

/* ------------------------------------------------------------------ Akıllı Özet · geçmiş */

export const WebSummaryHistoryScreen: React.FC = () => {
	const t = useT();
	return (
		<Panel active="smartSummary">
			<ModuleHead module="smartSummary" tab={3} tabs={SUMMARY_TABS(t)} title={t('Geçmiş analizler', 'Past analyses')} sub={t('Kullanım %40', 'Used 40%')} />
			<WCard>
				{[
					[t('Türev · zincir kuralı', 'Derivative · chain rule'), t('Matematik · soru analizi · 3 Kas', 'Maths · question · 3 Nov'), 'image'],
					[t('Mol kavramı', 'The mole'), t('Kimya · soru analizi · 1 Kas', 'Chemistry · question · 1 Nov'), 'image'],
					[t('Kuvvet ve hareket', 'Force and motion'), t('Fizik · video özeti · 29 Eki', 'Physics · video · 29 Oct'), 'video'],
				].map(([title, sub, icon]) => (
					<Row
						key={title}
						module="smartSummary"
						icon={icon as UIIconName}
						title={title}
						sub={sub}
						right={
							<Stack row gap={8}>
								<Button tone="ghost" size="sm" icon="file">
									PDF
								</Button>
								<Button tone="moduleSoft" module="smartSummary" size="sm">
									{t('Aç', 'Open')}
								</Button>
							</Stack>
						}
					/>
				))}
			</WCard>
		</Panel>
	);
};

/* ------------------------------------------------------------------ SinoAI · kaynaklarım, çalışma notu */

export const WebSinoSourcesScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<Panel active="sinoAi">
			<Stack row justify="space-between" align="flex-end">
				<Stack gap={2}>
					<Text role="title" size={28}>
						{t('Kaynaklarım', 'My sources')}
					</Text>
					<Text role="small">{t('Fotoğraf, PDF ya da not; kaynaklar 90 gün sonra silinir.', 'Photo, PDF or note; kept for 90 days.')}</Text>
				</Stack>
				<Button tone="dark" icon="plus">
					{t('Kaynak ekle', 'Add a source')}
				</Button>
			</Stack>
			<Grid columns="1.4fr 1fr">
				<WCard title={t('Kaynaklar', 'Sources')}>
					<Row icon="file" title={t('Fizik defterim.pdf', 'Physics notes.pdf')} sub={t('24 sayfa · okundu', '24 pages · read')} />
					<Row icon="image" title={t('Kimya sorusu', 'Chemistry question')} sub={t('1 fotoğraf · okundu', '1 photo · read')} />
					<Row
						icon="file"
						title={t('Tarih özet.pdf', 'History summary.pdf')}
						sub={t('12 sayfa · okunuyor', '12 pages · reading')}
						right={
							<Chip size="sm" tone="outline">
								{t('okunuyor', 'reading')}
							</Chip>
						}
					/>
				</WCard>
				<WCard title={t('Çalışma notları', 'Study notes')}>
					<Row icon="note" title={t('Fizik · Kuvvet ve hareket', 'Physics · Force and motion')} sub={t('3 Kasım', '3 Nov')} />
					<Text role="meta" color={colors.muted} style={{marginTop: 8}}>
						{t('@özet ile notunu özetlediğinde burada görünür.', 'Appears here when you summarise with @özet.')}
					</Text>
				</WCard>
			</Grid>
		</Panel>
	);
};

export const WebSinoStudyNoteScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<Panel active="sinoAi">
			<Stack row justify="space-between" align="flex-end">
				<Stack gap={2}>
					<Text role="meta">{t('Kütüphane · çalışma notu · Fizik defterim.pdf', 'Library · study note')}</Text>
					<Text role="title" size={28}>
						{t('Kuvvet ve hareket', 'Force and motion')}
					</Text>
				</Stack>
				<Stack row gap={10}>
					<Button tone="ghost" icon="cards">
						{t('Kart yap', 'Make cards')}
					</Button>
					<Button tone="dark" icon="quiz">
						{t('Test üret', 'Make a quiz')}
					</Button>
				</Stack>
			</Stack>
			<Grid columns="1.5fr 1fr">
				<WCard title={t('Önemli noktalar', 'Key points')}>
					<Stack gap={10}>
						{[t('Net kuvvet sıfırsa hız değişmez.', 'Zero net force keeps velocity.'), t('F = m · a; ivme kuvvetle aynı yöndedir.', 'F = m · a.'), t('Sürtünme hareketin tersine etki eder.', 'Friction opposes motion.')].map((line) => (
							<Stack key={line} row gap={10} align="flex-start">
								<Icon name="check" size={17} color={colors.successInk} />
								<Text role="body" color={colors.ink}>
									{line}
								</Text>
							</Stack>
						))}
					</Stack>
				</WCard>
				<WCard title={t('Terimler', 'Terms')}>
					<Stack gap={8}>
						<Text role="small" color={colors.ink2}>
							<b style={{color: colors.ink}}>{t('Eylemsizlik', 'Inertia')}</b> · {t('cismin hâlini koruma eğilimi', 'tendency to keep its state')}
						</Text>
						<Text role="small" color={colors.ink2}>
							<b style={{color: colors.ink}}>{t('İvme', 'Acceleration')}</b> · {t('hızın birim zamandaki değişimi', 'change of velocity per time')}
						</Text>
					</Stack>
				</WCard>
			</Grid>
			<Text role="meta">{t('SinoAI hata yapabilir; önemli bilgileri doğrula.', 'SinoAI can make mistakes; check important facts.')}</Text>
		</Panel>
	);
};

/* ------------------------------------------------------------------ Çözümler listeleri (deneme, test) ve test konuları */

export const WebExamSolutionsListScreen: React.FC = () => {
	const t = useT();
	return (
		<Panel active="exam">
			<ModuleHead module="exam" tab={3} title={t('Soru çözümleri', 'Solutions')} sub={t('Girdiğin denemelerin soruları, cevapların ve çözümleri', 'Questions, your answers and solutions')} />
			<WCard>
				{[
					[t('TYT Deneme 5', 'TYT Exam 5'), t('19 Ekim · 12 yanlış, 6 boş', '19 Oct · 12 wrong, 6 blank')],
					[t('TYT Temel Matematik · Kasım', 'TYT Basic Maths · Nov'), t('3 Kasım · 13 yanlış, 13 boş', '3 Nov · 13 wrong, 13 blank')],
					[t('TYT Deneme 4', 'TYT Exam 4'), t('12 Ekim · 15 yanlış, 4 boş', '12 Oct · 15 wrong, 4 blank')],
				].map(([title, sub]) => (
					<Row
						key={title}
						module="exam"
						icon="checkCircle"
						title={title}
						sub={sub}
						right={
							<Button tone="moduleSoft" module="exam" size="sm">
								{t('Yanlışlarım', 'My mistakes')}
							</Button>
						}
					/>
				))}
			</WCard>
		</Panel>
	);
};

/**
 * Web Çözümler, same as the phone (owner, 17 Nov 2026): filters Tümü ·
 * Yanlışlar · N · İşaretli and the review-quiz card; each row has
 * "Yanlışlarım" on its right. A solved review quiz is "Konu · Tekrar".
 * İşaretli rows open the question in Yanlışlarım under "Tümü"; one of an
 * unfinished quiz is locked: "Test bitince açılır".
 */
const WebSolutions: React.FC<{flagged?: boolean}> = ({flagged}) => {
	const t = useT();
	const colors = useColors();
	return (
		<Panel active="tests">
			<ModuleHead module="tests" tab={2} title={t('Çözümler', 'Solutions')} sub={t('Çözdüğün testler; yanlışlarına tek tıkla dön', 'Your solved quizzes')} />
			<Stack gap={16}>
				<WCard>
					<Stack gap={8}>
						<div style={{maxWidth: 460}}>
							<Segmented items={[t('Tümü', 'All'), t('Yanlışlar · 9', 'Wrong · 9'), t('İşaretli · 3', 'Flagged · 3')]} active={flagged ? 2 : 0} module="tests" />
						</div>
						<div>
							{flagged
								? FLAGGED_QUESTIONS.map(([tr, en, qTr, qEn, open]) => (
										<Row
											key={tr}
											module="tests"
											icon="bookmark"
											title={t(tr, en)}
											sub={t(qTr, qEn)}
											right={
												open ? (
													<Button tone="moduleSoft" module="tests" size="sm">
														{t('Soruyu aç', 'Open question')}
													</Button>
												) : (
													<Stack row gap={5}>
														<Icon name="lock" size={14} color={colors.subtle} />
														<Text role="meta">{t('Test bitince açılır', 'Opens when the quiz ends')}</Text>
													</Stack>
												)
											}
										/>
									))
								: SOLVED_QUIZZES.map(([tr, en, score, dayTr, dayEn]) => (
										<Row
											key={tr}
											module="tests"
											icon={tr.endsWith('Tekrar') ? 'refresh' : 'quiz'}
											title={t(tr, en)}
											sub={`${score} ${t('doğru', 'right')} · ${t(dayTr, dayEn)}`}
											right={
												<Button tone="moduleSoft" module="tests" size="sm">
													{t('Yanlışlarım', 'My mistakes')}
												</Button>
											}
										/>
									))}
						</div>
					</Stack>
				</WCard>
				{flagged ? null : (
					<Card tone="module" module="tests" padding={18}>
						<Stack row gap={14}>
							<Tile module="tests" icon="refresh" size={40} />
							<Stack grow gap={1}>
								<Text role="headline">{t('Yanlışlarından tekrar testi', 'Review quiz from your mistakes')}</Text>
								<Text role="small">{t('Yanlışlarından 10 soruluk bir tekrar testi hazır.', 'A 10-question review quiz from your mistakes is ready.')}</Text>
							</Stack>
							<Button tone="module" module="tests">
								{t('Başla', 'Start')}
							</Button>
						</Stack>
					</Card>
				)}
			</Stack>
		</Panel>
	);
};

export const WebTestSolutionsListScreen: React.FC = () => <WebSolutions />;

/** Çözümler › İşaretli on the web. */
export const WebTestSolutionsFlaggedScreen: React.FC = () => <WebSolutions flagged />;

export const WebTestTopicsAllScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('tests');
	return (
		<Panel active="tests">
			<ModuleHead module="tests" tab={1} title={t('Konular', 'Topics')} sub={t('TYT Türkçe · konu konu Kolay, Orta, Zor', 'TYT Turkish · by topic')} />
			<Grid columns="1fr 1fr">
				{WORK_TOPICS.map(([name], index) => (
					<WCard key={name}>
						<Stack row gap={12}>
							<Tile module="tests" size={40} />
							<Stack grow gap={1}>
								<Text role="headline">{name}</Text>
								<Text role="small">{t('3 seviye · 20’şer soru', '3 levels · 20 questions each')}</Text>
							</Stack>
							<Stack row gap={4}>
								{[0, 1, 2].map((level) => (
									<div key={level} style={{width: 18, height: 18, borderRadius: 6, background: level < (index === 0 ? 2 : index === 1 ? 1 : 0) ? mod.color : colors.line2}} />
								))}
							</Stack>
						</Stack>
					</WCard>
				))}
			</Grid>
		</Panel>
	);
};
