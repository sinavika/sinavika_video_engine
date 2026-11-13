import React from 'react';
import {UIProvider, useColors, useModuleColors, useT} from '../../Context';
import {Icon, type UIIconName} from '../../Icons';
import {type ModuleKey} from '../../ModuleIdentity';
import {AppHeader, BottomBar, Content, FocusHeader, ModuleScreen, Phone, SectionTitle} from '../../Parts/Mobile';
import {Bar, Button, Card, Chip, List, Logo, Segmented, Stack, Text, Tile} from '../../Parts/Shared';
import {KpiCard} from '../../Parts/Study';
import {UI_SHADOW} from '../../Tokens';
import {Kind, Screen, StepBar, TrueFalseContent} from './Lessons';

/**
 * Screens the apps have but the design set had not drawn (compatibility
 * report, 13–14 Nov 2026, §F). Copy comes from the apps' own catalogs
 * (tr-TR) so drawing and app say the same thing.
 */

/* ------------------------------------------------------------------ Onboarding · karşılama, bölge */

export const OnbWelcomeScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const Preview: React.FC<{module: ModuleKey; over: string; title: string; line: string}> = ({module, over, title, line}) => {
		const mod = useModuleColors(module);
		return (
			<Stack row gap={12} style={{padding: 14, borderRadius: 20, background: colors.card, border: `1px solid ${colors.line}`, boxShadow: UI_SHADOW.card}}>
				<Tile module={module} size={42} />
				<Stack grow gap={1}>
					<Text role="over" color={mod.ink}>
						{over}
					</Text>
					<Text role="headline">{title}</Text>
					<Text role="small">{line}</Text>
				</Stack>
			</Stack>
		);
	};
	return (
		<Phone>
			<Content tabBar={false} gap={18} padding="24px 22px 20px">
				<Logo height={30} />
				<Text role="display" size={32} style={{lineHeight: '38px'}}>
					{t('Ne çalışacağını bil,', 'Know what to study,')} <span style={{color: colors.brand}}>{t('her gün ilerle.', 'move ahead every day.')}</span>
				</Text>
				<Text role="body">{t('Deneme, ders, test, plan ve SinoAI tek uygulamada. Planın 2 dakikada hazır.', 'Exams, lessons, quizzes, a plan and SinoAI in one app. Your plan is ready in 2 minutes.')}</Text>
				<Stack gap={10}>
					<Preview module="lessons" over={t('Devam et', 'Continue')} title={t('Sözcükte Anlam', 'Word meaning')} line={t('Türkçe · 11 dakika kaldı', 'Turkish · 11 min left')} />
					<Preview module="exam" over={t('Deneme', 'Exam')} title={t('Hedefine bilgiyle yaklaş', 'Get closer to your goal')} line={t('TYT Deneme cumartesi 10:00’da', 'TYT exam on Saturday 10:00')} />
				</Stack>
			</Content>
			<BottomBar>
				<Button size="lg" block>
					{t('Başlayalım', 'Let’s start')}
				</Button>
				<Text role="small" align="center" weight={700} color={colors.brandDeep}>
					{t('Hesabım var', 'I have an account')}
				</Text>
			</BottomBar>
		</Phone>
	);
};

/** Region (only when the device region is unclear): Türkiye or United States; exams and language follow. */
export const OnbRegionScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const Option: React.FC<{flag: string; title: string; sub: string; on?: boolean}> = ({flag, title, sub, on}) => (
		<Stack row gap={14} style={{padding: 16, borderRadius: 20, background: on ? colors.brandWash : colors.card, border: `1.5px solid ${on ? colors.brand : colors.line}`}}>
			<div style={{width: 44, height: 44, borderRadius: 22, background: colors.line2, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<Text role="headline" size={15}>
					{flag}
				</Text>
			</div>
			<Stack grow gap={1}>
				<Text role="headline" size={16}>
					{title}
				</Text>
				<Text role="small">{sub}</Text>
			</Stack>
			<div style={{width: 24, height: 24, borderRadius: 12, border: `2px solid ${on ? colors.brand : colors.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				{on ? <div style={{width: 12, height: 12, borderRadius: 6, background: colors.brand}} /> : null}
			</div>
		</Stack>
	);
	return (
		<Phone>
			<FocusHeader left="left" title="" steps={[1, 6]} />
			<Content tabBar={false} gap={14} padding="10px 22px 20px">
				<Text role="title" size={26}>
					{t('Bölgeni seç', 'Choose your region')}
				</Text>
				<Text role="body">{t('Sınavika’yı bölgene göre kişiselleştiririz.', 'We tailor Sınavika to your region.')}</Text>
				<Option flag="TR" title="Türkiye" sub={t('YKS, KPSS · Türkçe', 'YKS, KPSS · Turkish')} on />
				<Option flag="US" title="United States" sub="SAT, ACT · English" />
			</Content>
			<BottomBar>
				<Button size="lg" block>
					{t('Devam', 'Continue')}
				</Button>
			</BottomBar>
		</Phone>
	);
};

/* ------------------------------------------------------------------ Denemeler · geçmiş ay, deneme neti */

/** A past month: the exams you took with their nets, results and solutions; missed ones say so. */
export const ExamMonthScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('exam');
	const rows: [string, string, string | null, 'done' | 'missed'][] = [
		[t('TYT Genel Deneme', 'TYT General'), t('Genel deneme · 120 soru', 'General · 120 q'), '78,5', 'done'],
		[t('TYT Temel Matematik', 'TYT Basic Maths'), t('Bölüm denemesi · 40 soru', 'Section · 40 q'), '21,75', 'done'],
		[t('TYT Türkçe', 'TYT Turkish'), t('Bölüm denemesi · 40 soru', 'Section · 40 q'), '32,5', 'done'],
		[t('TYT Fen Bilimleri', 'TYT Science'), t('Bölüm denemesi · 20 soru', 'Section · 20 q'), null, 'missed'],
	];
	return (
		<ModuleScreen module="exam" tab={1} header={<AppHeader left="back" title={t('Ekim 2026', 'October 2026')} right={<div style={{width: 40}} />} />}>
			<Content gap={12}>
				<Card padding={14} tone="module" module="exam">
					<Stack gap={6}>
						<Text role="headline">{t('3 / 4 deneme · ortalama 44,25 net', '3 / 4 exams · avg 44.25')}</Text>
						<Text role="small">{t('Ay kapandı; sıralamalar kesinleşti.', 'Month closed; ranks are final.')}</Text>
					</Stack>
				</Card>
				<Stack gap={10}>
					{rows.map(([title, sub, net, state]) => (
						<Card key={title} padding={14}>
							<Stack gap={10}>
								<Stack row gap={12}>
									<Tile module="exam" size={40} />
									<Stack grow gap={1}>
										<Text role="headline">{title}</Text>
										<Text role="small">{sub}</Text>
									</Stack>
									{net ? (
										<Stack align="flex-end" gap={0}>
											<Text role="section" color={mod.ink}>
												{net}
											</Text>
											<Text role="meta">net</Text>
										</Stack>
									) : (
										<Chip tone="outline" size="sm">
											{t('Kaçırıldı', 'Missed')}
										</Chip>
									)}
								</Stack>
								{state === 'done' ? (
									<Stack row gap={8}>
										<Button tone="moduleSoft" module="exam" size="sm" style={{flex: 1}}>
											{t('Sonuç', 'Result')}
										</Button>
										<Button tone="moduleSoft" module="exam" size="sm" style={{flex: 1}}>
											{t('Çözümler', 'Solutions')}
										</Button>
									</Stack>
								) : (
									<Text role="small" color={colors.muted}>
										{t('Çözümleri yine açık: konuları görmek için dokun.', 'Solutions are still open.')}
									</Text>
								)}
							</Stack>
						</Card>
					))}
				</Stack>
			</Content>
		</ModuleScreen>
	);
};

/** One exam's nets: total, subject by subject D/Y/B, and the topics that cost nets with their way back. */
export const ExamNetScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('exam');
	const rows: [string, number, number, number, string][] = [
		[t('Türkçe', 'Turkish'), 34, 4, 2, '33'],
		[t('Sosyal Bilimler', 'Social'), 15, 3, 2, '14,25'],
		[t('Temel Matematik', 'Basic Maths'), 24, 8, 8, '22'],
		[t('Fen Bilimleri', 'Science'), 11, 4, 5, '10'],
	];
	return (
		<ModuleScreen module="exam" tab={2} header={<AppHeader left="back" title={t('Deneme neti', 'Exam net')} right={<div style={{width: 40}} />} />}>
			<Content gap={12}>
				<Card padding={16} tone="module" module="exam">
					<Stack row justify="space-between" align="flex-end">
						<Stack gap={1}>
							<Text role="meta">{t('TYT Deneme 4 · toplam net', 'TYT Exam 4 · total net')}</Text>
							<Text role="num" size={32}>
								79,25
							</Text>
						</Stack>
						<Chip tone="success" icon="trend">
							{t('+6,75 net', '+6.75')}
						</Chip>
					</Stack>
				</Card>
				<Card padding={14}>
					<Stack gap={10}>
						<Stack row>
							<Text role="meta" style={{flex: 1}}>
								{t('Ders', 'Subject')}
							</Text>
							{['D', 'Y', 'B'].map((head) => (
								<Text key={head} role="meta" style={{width: 34}} align="center">
									{head}
								</Text>
							))}
							<Text role="meta" style={{width: 50}} align="right">
								Net
							</Text>
						</Stack>
						{rows.map(([name, right, wrong, blank, net]) => (
							<Stack key={name} row>
								<Text role="headline" size={14.5} style={{flex: 1}}>
									{name}
								</Text>
								<Text role="small" style={{width: 34}} align="center" color={colors.successInk}>
									{right}
								</Text>
								<Text role="small" style={{width: 34}} align="center" color={colors.errorInk}>
									{wrong}
								</Text>
								<Text role="small" style={{width: 34}} align="center">
									{blank}
								</Text>
								<Text role="headline" size={15} style={{width: 50}} align="right" color={mod.ink}>
									{net}
								</Text>
							</Stack>
						))}
					</Stack>
				</Card>
				<SectionTitle title={t('Net kaybettiğin konular', 'Topics that cost you')} />
				<List>
					{[
						[t('Problemler', 'Word problems'), t('D/Y/B 3/3/2 · −3,75 net', '3/3/2 · −3.75')],
						[t('Paragrafta yapı', 'Paragraph structure'), t('D/Y/B 4/2/0 · −2,5 net', '4/2/0 · −2.5')],
					].map(([title, sub]) => (
						<Stack key={title} row gap={10} style={{padding: '12px 14px'}}>
							<Stack grow gap={1}>
								<Text role="headline">{title}</Text>
								<Text role="small">{sub}</Text>
							</Stack>
							<Button tone="moduleSoft" module="lessons" size="sm">
								{t('Konuyu çalış', 'Study')}
							</Button>
							<Button tone="moduleSoft" module="tests" size="sm">
								{t('Test', 'Quiz')}
							</Button>
						</Stack>
					))}
				</List>
			</Content>
		</ModuleScreen>
	);
};

/* ------------------------------------------------------------------ İstatistiklerim · tek ders */

export const StatisticsLessonScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const topics: [string, number, string][] = [
		[t('Temel Kavramlar', 'Basics'), 0.72, t('64 soru · 1 sa 10 dk', '64 q · 1 h 10 m')],
		[t('Problemler', 'Word problems'), 0.41, t('48 soru · 55 dk', '48 q · 55 m')],
		[t('Üslü Sayılar', 'Exponents'), 0.58, t('30 soru · 25 dk', '30 q · 25 m')],
		[t('Rasyonel Sayılar', 'Rationals'), 0.66, t('22 soru · 20 dk', '22 q · 20 m')],
	];
	return (
		<Phone>
			<AppHeader left="back" title={t('Matematik', 'Maths')} right={<div style={{width: 40}} />} />
			<Content tabBar={false} gap={12}>
				<Segmented items={[t('Bu hafta', 'This week'), t('Son 30 gün', 'Last 30 days'), t('Tümü', 'All')]} active={1} />
				<Stack row gap={8}>
					<KpiCard compact icon="clock" label={t('Çalışma', 'Study')} value={t('2 sa 50', '2 h 50')} delta="%14" />
					<KpiCard compact icon="quiz" label={t('Soru', 'Questions')} value="164" />
					<KpiCard compact icon="target" label={t('Başarı', 'Success')} value="%60" delta="%5" />
				</Stack>
				<SectionTitle title={t('Konular', 'Topics')} />
				<Card padding={14}>
					<Stack gap={12}>
						{topics.map(([name, value, sub]) => (
							<Stack key={name} gap={5}>
								<Stack row justify="space-between">
									<Text role="headline">{name}</Text>
									<Text role="small" weight={700}>
										%{Math.round(value * 100)}
									</Text>
								</Stack>
								<Bar value={value} color={value < 0.5 ? colors.warning : colors.success} height={6} />
								<Text role="meta">{sub}</Text>
							</Stack>
						))}
					</Stack>
				</Card>
			</Content>
		</Phone>
	);
};

/* ------------------------------------------------------------------ Akıllı Özet · PDF */

export const SummaryPdfScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('smartSummary');
	return (
		<UIProvider module="smartSummary">
			<Phone>
				<AppHeader left="back" title={t('Analiz PDF', 'Analysis PDF')} right={<div style={{width: 40}} />} />
				<Content tabBar={false} gap={12}>
					<div style={{alignSelf: 'center', width: 300, height: 400, borderRadius: 10, background: '#FFFFFF', boxShadow: UI_SHADOW.float, padding: 18, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 10}}>
						<Stack row justify="space-between">
							<Logo height={16} />
							<Text role="meta" size={12} color="#5F6B7D">
								{t('Akıllı Özet', 'Smart Summary')}
							</Text>
						</Stack>
						<div style={{height: 4, borderRadius: 2, background: mod.color}} />
						<Text role="headline" size={14} color="#0B1C30">
							{t('Türev · zincir kuralı', 'Derivative · chain rule')}
						</Text>
						{[0.95, 0.8, 0.9, 0.6].map((w, i) => (
							<div key={i} style={{width: `${w * 100}%`, height: 7, borderRadius: 4, background: '#E7EAEE'}} />
						))}
						<div style={{height: 80, borderRadius: 8, background: mod.soft}} />
						{[0.9, 0.7, 0.85].map((w, i) => (
							<div key={i} style={{width: `${w * 100}%`, height: 7, borderRadius: 4, background: '#E7EAEE'}} />
						))}
						<div style={{marginTop: 'auto', alignSelf: 'center'}}>
							<Text role="meta" size={12} color="#5F6B7D">
								1 / 3
							</Text>
						</div>
					</div>
					<Stack row gap={8} style={{padding: '10px 14px', borderRadius: 14, background: colors.successSoft}}>
						<Icon name="checkCircle" size={18} color={colors.successInk} />
						<Text role="small" weight={700} color={colors.successInk}>
							{t('PDF hazır · 3 sayfa', 'PDF ready · 3 pages')}
						</Text>
					</Stack>
				</Content>
				<BottomBar>
					<Stack row gap={10}>
						<Button tone="ghost" size="lg" icon="send" style={{flex: 1}}>
							{t('Paylaş', 'Share')}
						</Button>
						<Button tone="module" module="smartSummary" size="lg" icon="file" style={{flex: 1}}>
							{t('PDF aç', 'Open PDF')}
						</Button>
					</Stack>
				</BottomBar>
			</Phone>
		</UIProvider>
	);
};

/* ------------------------------------------------------------------ SinoAI · kaynaklar, çalışma notu */

const SourceRow: React.FC<{icon: UIIconName; title: string; sub: string; state?: string}> = ({icon, title, sub, state}) => {
	const colors = useColors();
	return (
		<Stack row gap={12} style={{padding: '12px 14px'}}>
			<div style={{width: 40, height: 40, borderRadius: 12, background: colors.line2, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<Icon name={icon} size={20} color={colors.ink2} />
			</div>
			<Stack grow gap={1}>
				<Text role="headline">{title}</Text>
				<Text role="small">{sub}</Text>
			</Stack>
			{state ? (
				<Chip size="sm" tone="outline">
					{state}
				</Chip>
			) : (
				<Icon name="more" size={18} color={colors.subtle} />
			)}
		</Stack>
	);
};

export const SinoSourcesScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<UIProvider module="sinoAi">
			<Phone>
				<AppHeader left="back" title={t('Kaynaklarım', 'My sources')} right={<div style={{width: 40}} />} />
				<Content tabBar={false} gap={12}>
					<Button tone="dark" block icon="plus">
						{t('Kaynak ekle', 'Add a source')}
					</Button>
					<Text role="meta">{t('Fotoğraf, galeri ya da PDF · kaynaklar 90 gün sonra silinir', 'Photo, gallery or PDF · kept for 90 days')}</Text>
					<List>
						<SourceRow icon="file" title={t('Fizik defterim.pdf', 'Physics notes.pdf')} sub={t('24 sayfa · okundu', '24 pages · read')} />
						<SourceRow icon="image" title={t('Kimya sorusu', 'Chemistry question')} sub={t('1 fotoğraf · okundu', '1 photo · read')} />
						<SourceRow icon="file" title={t('Tarih özet.pdf', 'History summary.pdf')} sub={t('12 sayfa', '12 pages')} state={t('okunuyor', 'reading')} />
					</List>
					<SectionTitle title={t('Çalışma notları', 'Study notes')} />
					<List>
						<SourceRow icon="note" title={t('Fizik · Kuvvet ve hareket', 'Physics · Force and motion')} sub={t('Fizik defterim.pdf’ten · 3 Kas', 'From Physics notes.pdf · 3 Nov')} />
					</List>
					<Text role="meta" color={colors.muted}>
						{t('@özet ile notunu özetlediğinde burada görünür.', 'Appears here when you summarise with @özet.')}
					</Text>
				</Content>
			</Phone>
		</UIProvider>
	);
};

export const SinoStudyNoteScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<UIProvider module="sinoAi">
			<Phone>
				<AppHeader left="back" title={t('Çalışma notu', 'Study note')} right={<div style={{width: 40}} />} />
				<Content tabBar={false} gap={12}>
					<Stack gap={4}>
						<Text role="meta">{t('Fizik defterim.pdf · 3 Kasım', 'Physics notes.pdf · 3 Nov')}</Text>
						<Text role="title">{t('Kuvvet ve hareket', 'Force and motion')}</Text>
					</Stack>
					<Card padding={14}>
						<Stack gap={8}>
							<Text role="over">{t('Önemli noktalar', 'Key points')}</Text>
							{[t('Net kuvvet sıfırsa hız değişmez.', 'Zero net force keeps velocity.'), t('F = m · a; ivme kuvvetle aynı yöndedir.', 'F = m · a; acceleration follows force.'), t('Sürtünme hareketin tersine etki eder.', 'Friction opposes motion.')].map((line) => (
								<Stack key={line} row gap={8} align="flex-start">
									<Icon name="check" size={16} color={colors.successInk} />
									<Text role="body" size={15} color={colors.ink}>
										{line}
									</Text>
								</Stack>
							))}
						</Stack>
					</Card>
					<Card padding={14}>
						<Stack gap={6}>
							<Text role="over">{t('Terimler', 'Terms')}</Text>
							{[['Eylemsizlik', 'Inertia', t('cismin hâlini koruma eğilimi', 'tendency to keep its state')], ['İvme', 'Acceleration', t('hızın birim zamandaki değişimi', 'change of velocity per time')]].map(([tr, en, def]) => (
								<Text key={tr} role="small" color={colors.ink2}>
									<b style={{color: colors.ink}}>{t(tr, en)}</b> · {def}
								</Text>
							))}
						</Stack>
					</Card>
					<Text role="meta" align="center">
						{t('SinoAI hata yapabilir; önemli bilgileri doğrula.', 'SinoAI can make mistakes; check important facts.')}
					</Text>
				</Content>
				<BottomBar>
					<Stack row gap={10}>
						<Button tone="ghost" icon="cards" style={{flex: 1}}>
							{t('Kart yap', 'Make cards')}
						</Button>
						<Button tone="dark" icon="quiz" style={{flex: 1}}>
							{t('Test üret', 'Make a quiz')}
						</Button>
					</Stack>
				</BottomBar>
			</Phone>
		</UIProvider>
	);
};

/* ------------------------------------------------------------------ Destek · taleplerim */

export const SupportTicketsScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const rows: [string, string, string, 'success' | 'warning' | 'outline'][] = [
		[t('Abonelik yenilenmedi', 'Subscription not renewed'), t('Abonelik ve ödeme · 2 Kas', 'Subscription · 2 Nov'), t('Yanıtlandı', 'Answered'), 'success'],
		[t('Deneme sonucu görünmüyor', 'Exam result missing'), t('Denemeler · 30 Eki', 'Exams · 30 Oct'), t('İnceleniyor', 'In review'), 'warning'],
		[t('Uygulama giriş sorunu', 'Sign-in problem'), t('Hesap ve giriş · 21 Eki', 'Account · 21 Oct'), t('Kapandı', 'Closed'), 'outline'],
	];
	return (
		<Phone>
			<AppHeader left="back" title={t('Taleplerim', 'My requests')} right={<div style={{width: 40}} />} />
			<Content tabBar={false} gap={12}>
				<Text role="small">{t('Açtığın destek taleplerinin durumunu buradan takip et.', 'Track your support requests here.')}</Text>
				<List>
					{rows.map(([title, sub, state, tone]) => (
						<Stack key={title} row gap={12} style={{padding: '12px 14px'}}>
							<Stack grow gap={1}>
								<Text role="headline">{title}</Text>
								<Text role="small">{sub}</Text>
							</Stack>
							<Chip tone={tone} size="sm">
								{state}
							</Chip>
						</Stack>
					))}
				</List>
				<Card tone="soft" padding={14}>
					<Text role="small" color={colors.ink2}>
						{t('Yanıtlar e-postana da gelir.', 'Replies also come to your e-mail.')}
					</Text>
				</Card>
			</Content>
			<BottomBar>
				<Button size="lg" block icon="plus">
					{t('Yeni talep', 'New request')}
				</Button>
			</BottomBar>
		</Phone>
	);
};

/* ------------------------------------------------------------------ Dersler · tekrar oturumu */

/** A review session: one step at a time, its stage and source, one try; right moves it on, wrong starts it again. */
export const LessonReviewSessionScreen: React.FC = () => {
	const colors = useColors();
	const mod = useModuleColors('lessons');
	return (
		<Screen
			bar={<StepBar done={1} count={5} />}
			foot={
				<>
					<Stack row gap={8} style={{padding: '10px 14px', borderRadius: 14, background: colors.successSoft}}>
						<Icon name="checkCircle" size={18} color={colors.successInk} />
						<Text role="small" weight={700} color={colors.successInk}>
							3 gün sonra yeniden sorulacak.
						</Text>
					</Stack>
					<Button size="lg" block>
						Sonraki
					</Button>
				</>
			}
		>
			<Stack row gap={8}>
				<Chip tone="module" module="lessons" size="sm" icon="refresh">
					Tekrar · 2 / 5
				</Chip>
				<Chip size="sm" tone="outline">
					1. tekrar
				</Chip>
			</Stack>
			<Text role="meta" color={mod.ink}>
				Sözcükte Anlam · Mecaz anlam
			</Text>
			<TrueFalseContent />
			<Kind muted>Tek denemede · yaklaşık 45 sn</Kind>
		</Screen>
	);
};
