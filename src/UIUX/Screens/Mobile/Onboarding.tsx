import React from 'react';
import {useColors, useT} from '../../Context';
import {Icon, type UIIconName} from '../../Icons';
import {alpha, MODULES, MODULE_ORDER, moduleGradient, type ModuleKey} from '../../ModuleIdentity';
import {BottomBar, Content, Phone} from '../../Parts/Mobile';
import {Button, Card, Chip, Stack, Steps, Text, Tile} from '../../Parts/Shared';
import {UI_RADIUS, UI_SHADOW} from '../../Tokens';

/**
 * Onboarding: 8 steps instead of the app's 11. Exam and session on one page,
 * current and target score on one slider, hours and questions as tempo cards;
 * the plan is shown before the account and the trial, so the student sees
 * value first.
 */
const TOTAL = 8;

const OnbFrame: React.FC<{step: number; over: string; title: string; text: string; cta?: string; disabled?: boolean; extra?: React.ReactNode; children: React.ReactNode}> = ({step, over, title, text, cta, disabled, extra, children}) => {
	const colors = useColors();
	const t = useT();
	return (
		<Phone>
			<Stack row gap={12} style={{padding: '6px 16px 0'}}>
				<div style={{width: 40, height: 40, borderRadius: 20, background: colors.card, border: `1px solid ${colors.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<Icon name="left" size={20} color={colors.ink} />
				</div>
				<Steps count={TOTAL} done={step} />
				<Text role="meta" style={{width: 34, textAlign: 'right'}}>
					{step}/{TOTAL}
				</Text>
			</Stack>
			<Content tabBar={false} gap={14} padding="18px 18px 10px">
				<Stack gap={8}>
					<Chip tone="brand">{over}</Chip>
					<Text role="hero">{title}</Text>
					<Text role="body">{text}</Text>
				</Stack>
				{children}
			</Content>
			<BottomBar>
				{extra}
				<Button size="lg" block tone={disabled ? 'disabled' : 'primary'}>
					{cta ?? t('Devam et', 'Continue')}
				</Button>
			</BottomBar>
		</Phone>
	);
};

const Pick: React.FC<{on?: boolean; icon?: UIIconName; title: string; sub?: string; tag?: string; radio?: boolean; module?: ModuleKey}> = ({on, icon, title, sub, tag, radio, module}) => {
	const colors = useColors();
	return (
		<Stack row gap={12} style={{padding: 14, borderRadius: UI_RADIUS.lg, background: on ? colors.brandWash : colors.card, border: `1.5px solid ${on ? colors.brand : colors.line}`, boxShadow: on ? '0 0 0 4px rgba(234,88,12,0.08)' : undefined}}>
			{icon ? <Tile icon={icon} module={module} size={42} color={on ? colors.brand : colors.ink2} /> : null}
			<Stack grow gap={2}>
				<Stack row gap={8}>
					<Text role="headline">{title}</Text>
					{tag ? (
						<Chip tone="brand" size="sm">
							{tag}
						</Chip>
					) : null}
				</Stack>
				{sub ? <Text role="small">{sub}</Text> : null}
			</Stack>
			<div style={{width: 22, height: 22, borderRadius: radio ? 11 : 7, border: on ? undefined : `2px solid ${colors.line}`, background: on ? colors.brand : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
				{on ? radio ? <div style={{width: 8, height: 8, borderRadius: 4, background: '#FFFFFF'}} /> : <Icon name="check" size={14} color="#FFFFFF" /> : null}
			</div>
		</Stack>
	);
};

export const OnbExamScreen: React.FC = () => {
	const t = useT();
	return (
		<OnbFrame step={1} over={t('Hedef sınav', 'Target exam')} title={t('Hangi sınava hazırlanıyorsun?', 'Which exam are you preparing for?')} text={t('Planını, denemelerini ve içeriklerini buna göre kuracağız.', 'We build your plan, exams and content around it.')}>
			<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10}}>
				<Card tone="card" padding={16} style={{border: '1.5px solid #EA580C', background: 'var(--ui-brandWash)'}}>
					<Stack gap={10}>
						<Tile icon="grad" size={42} color="#EA580C" />
						<Text role="section">YKS</Text>
						<Text role="small">TYT · AYT · YDT</Text>
					</Stack>
				</Card>
				<Card tone="card" padding={16}>
					<Stack gap={10}>
						<Tile icon="briefcase" size={42} />
						<Text role="section">KPSS</Text>
						<Text role="small">{t('Lisans · Ön lisans · Ortaöğretim', 'Degree · Associate · High school')}</Text>
					</Stack>
				</Card>
			</div>
			<Text role="section">{t('Oturumlar ve puan türü', 'Sessions and score type')}</Text>
			<Stack gap={8}>
				<Pick on title="TYT" sub={t('Temel Yeterlilik Testi', 'Basic proficiency')} />
				<Pick on title="AYT · Sayısal" sub={t('Matematik, Fizik, Kimya, Biyoloji', 'Maths, Physics, Chemistry, Biology')} />
				<Pick title="YDT" sub={t('Yabancı Dil Testi', 'Foreign language test')} />
			</Stack>
		</OnbFrame>
	);
};

export const OnbScoreScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<OnbFrame step={2} over={t('Hedef', 'Goal')} title={t('Şu an neredesin, nereye varmak istiyorsun?', 'Where are you now, where do you want to be?')} text={t('Kabaca seçmen yeterli; ilk denemenden sonra biz güncelleriz.', 'A rough guess is fine; we update it after your first exam.')}>
			<Card padding={20}>
				<Stack gap={18}>
					<Stack row justify="space-between">
						<Stack gap={2}>
							<Text role="meta">{t('Şu anki netin', 'Current score')}</Text>
							<Text role="num" size={34}>
								48
							</Text>
						</Stack>
						<Icon name="right" size={22} color={colors.subtle} />
						<Stack gap={2} align="flex-end">
							<Text role="meta">{t('Hedef netin', 'Target score')}</Text>
							<Text role="num" size={34} color={colors.brand}>
								78
							</Text>
						</Stack>
					</Stack>
					<div style={{position: 'relative', height: 30}}>
						<div style={{position: 'absolute', left: 0, right: 0, top: 12, height: 6, borderRadius: 3, background: colors.line2}} />
						<div style={{position: 'absolute', left: '40%', right: '35%', top: 12, height: 6, borderRadius: 3, background: 'linear-gradient(90deg, #FDBA74, #EA580C)'}} />
						{[40, 65].map((left, index) => (
							<div key={left} style={{position: 'absolute', left: `calc(${left}% - 13px)`, top: 2, width: 26, height: 26, borderRadius: 13, background: '#FFFFFF', border: `3px solid ${index ? '#EA580C' : '#FDBA74'}`, boxShadow: UI_SHADOW.card}} />
						))}
					</div>
					<Stack row justify="space-between">
						{['0', '30', '60', '90', '120'].map((value) => (
							<Text key={value} role="meta">
								{value}
							</Text>
						))}
					</Stack>
				</Stack>
			</Card>
			<Card tone="soft" padding={14} style={{background: colors.brandWash}}>
				<Stack row gap={12}>
					<Icon name="trend" size={22} color={colors.brand} />
					<Text role="small" color={colors.ink2}>
						<b style={{color: colors.ink}}>{t('+30 net', '+30 points')}</b> {t('sınava kalan 245 günde gerçekçi bir hedef: haftada ortalama 1 net.', 'is realistic in 245 days: about 1 a week.')}
					</Text>
				</Stack>
			</Card>
		</OnbFrame>
	);
};

export const OnbTempoScreen: React.FC = () => {
	const t = useT();
	return (
		<OnbFrame step={3} over={t('Tempo', 'Pace')} title={t('Günde ne kadar çalışabilirsin?', 'How much can you study a day?')} text={t('Sürdürebileceğin bir tempo seç; istediğin zaman değiştirirsin.', 'Pick a pace you can keep; change it any time.')}>
			<Stack gap={10}>
				<Pick radio icon="sun" title={t('Hafif', 'Light')} sub={t('1 saat · 40 soru · okul ya da işle birlikte', '1 hour · 40 questions · alongside school or work')} />
				<Pick radio on icon="target" title={t('Dengeli', 'Balanced')} tag={t('Önerilen', 'Suggested')} sub={t('3 saat · 100 soru · çoğu öğrenci için', '3 hours · 100 questions · for most students')} />
				<Pick radio icon="zap" title={t('Yoğun', 'Intense')} sub={t('5+ saat · 180 soru · son aylar ve kamp', '5+ hours · 180 questions · final months')} />
			</Stack>
			<Card tone="flat" padding={14}>
				<Stack row justify="space-between">
					<Text role="headline">{t('Hangi günler?', 'Which days?')}</Text>
					<Stack row gap={5}>
						{['P', 'S', 'Ç', 'P', 'C', 'C', 'P'].map((day, index) => (
							<div key={index} style={{width: 30, height: 30, borderRadius: 15, background: index < 6 ? '#EA580C' : 'var(--ui-line2)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
								<Text role="meta" weight={800} color={index < 6 ? '#FFFFFF' : 'var(--ui-muted)'}>
									{day}
								</Text>
							</div>
						))}
					</Stack>
				</Stack>
			</Card>
		</OnbFrame>
	);
};

export const OnbWeakScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const lessons: [string, string, boolean][] = [['Matematik', 'Maths', true], ['Türkçe', 'Turkish', false], ['Geometri', 'Geometry', true], ['Fizik', 'Physics', false], ['Kimya', 'Chemistry', true], ['Biyoloji', 'Biology', false], ['Tarih', 'History', false], ['Coğrafya', 'Geography', false], ['Felsefe', 'Philosophy', false]];
	return (
		<OnbFrame step={4} over={t('Dersler', 'Subjects')} title={t('Hangi derslerde daha çok desteğe ihtiyacın var?', 'Where do you need more support?')} text={t('Planında bu derslere daha çok yer ayırırız. Seçmesen de olur.', 'We give these more room in your plan. Optional.')} cta={t('Planımı hazırla', 'Build my plan')} extra={<Text role="small" align="center"><b style={{color: colors.ink}}>3</b> {t('ders seçildi', 'selected')}</Text>}>
			<Stack row wrap gap={8}>
				{lessons.map(([tr, en, on]) => (
					<Chip key={tr} tone={on ? 'brand' : 'outline'} icon={on ? 'check' : undefined} style={{height: 44, padding: '0 16px', fontSize: 14, border: on ? '1.5px solid #EA580C' : undefined}}>
						{t(tr, en)}
					</Chip>
				))}
			</Stack>
			<Card tone="soft" padding={14}>
				<Stack row gap={10}>
					<Icon name="info" size={18} color={colors.muted} />
					<Text role="small">{t('Emin değil misin? İlk denemenden sonra eksik konularını biz buluruz.', 'Not sure? We find your gaps after your first exam.')}</Text>
				</Stack>
			</Card>
		</OnbFrame>
	);
};

/** The week, coloured by module: the plan as the first value of the app. */
export const WeekPlan: React.FC<{compact?: boolean}> = ({compact}) => {
	const colors = useColors();
	const t = useT();
	const days: [string, string, ModuleKey[]][] = [
		['Pzt', '12', ['lessons', 'tests']],
		['Sal', '13', ['exam']],
		['Çar', '14', ['lessons', 'flashcards']],
		['Per', '15', ['lessons', 'tests', 'flashcards']],
		['Cum', '16', ['lessons', 'tests']],
		['Cmt', '17', ['exam']],
		['Paz', '18', ['studyPlan']],
	];
	return (
		<Card padding={14}>
			<Stack row justify="space-between" style={{marginBottom: 10}}>
				<Text role="section" size={15}>
					{t('Bu hafta', 'This week')}
				</Text>
				<Chip>{t('12–18 Ekim', '12–18 Oct')}</Chip>
			</Stack>
			<Stack row justify="space-between" align="flex-start">
				{days.map(([day, date, items], index) => (
					<Stack key={day} align="center" gap={5} style={{width: 44}}>
						<Text role="meta" color={index === 3 ? colors.brand : colors.muted}>
							{day}
						</Text>
						<div style={{width: 30, height: 30, borderRadius: 15, background: index === 3 ? colors.brand : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							<Text role="headline" size={13} color={index === 3 ? '#FFFFFF' : colors.ink}>
								{date}
							</Text>
						</div>
						{items.slice(0, compact ? 2 : 3).map((key, n) => (
							<div key={n} style={{width: 38, height: 24, borderRadius: 8, background: alpha(MODULES[key].color.light, 0.16), borderLeft: `3px solid ${MODULES[key].color.light}`}} />
						))}
					</Stack>
				))}
			</Stack>
			<Stack row wrap gap={10} style={{marginTop: 12}}>
				{(['lessons', 'tests', 'exam', 'flashcards'] as ModuleKey[]).map((key) => (
					<Stack key={key} row gap={5}>
						<div style={{width: 8, height: 8, borderRadius: 3, background: MODULES[key].color.light}} />
						<Text role="meta">{t(MODULES[key].name)}</Text>
					</Stack>
				))}
			</Stack>
		</Card>
	);
};

export const OnbPlanScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<OnbFrame step={5} over={t('Hazır', 'Ready')} title={t('YKS planın hazır', 'Your YKS plan is ready')} text={t('48 netten 78 nete, günde 3 saatlik dengeli tempoyla.', 'From 48 to 78, at a balanced 3 hours a day.')} cta={t('Planımı kaydet', 'Save my plan')}>
			<WeekPlan />
			<Card tone="moduleLine" module="lessons" padding={14}>
				<Stack row gap={12}>
					<Tile module="lessons" size={42} />
					<Stack grow gap={1}>
						<Text role="over" color={MODULES.lessons.color.light}>
							{t('Bugünkü ilk görevin', 'Your first task today')}
						</Text>
						<Text role="headline">{t('Paragraf · Ana fikir', 'Reading · Main idea')}</Text>
						<Text role="small">{t('Mikro ders · 25 dk', 'Micro-lesson · 25 min')}</Text>
					</Stack>
					<Icon name="right" size={18} color={colors.subtle} />
				</Stack>
			</Card>
		</OnbFrame>
	);
};

/** What SinoAI changes: before and after, as the app's value step. */
export const OnbValueScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<OnbFrame step={6} over={t('Neden Sınavika', 'Why Sınavika')} title={t('Tahmin değil, kendi verinle çalış', 'Study from your data, not guesses')} text={t('Her denemeden sonra planın kendini günceller.', 'Your plan updates itself after every exam.')}>
			<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10}}>
				<Card tone="soft" padding={14}>
					<Stack gap={8}>
						<Text role="over">{t('Önce', 'Before')}</Text>
						{[t('Ne çalışacağını düşünmek', 'Wondering what to study'), t('Rastgele soru çözmek', 'Random questions'), t('Netin neden düştüğünü bilmemek', 'Not knowing why')].map((line) => (
							<Stack key={line} row gap={6} align="flex-start">
								<Icon name="x" size={14} color={colors.error} />
								<Text role="small">{line}</Text>
							</Stack>
						))}
					</Stack>
				</Card>
				<Card padding={14} style={{border: '1.5px solid #EA580C', background: 'var(--ui-brandWash)'}}>
					<Stack gap={8}>
						<Text role="over" color={colors.brand}>
							{t('Sınavika ile', 'With Sınavika')}
						</Text>
						{[t('Her gün tek net adım', 'One clear step a day'), t('Eksiğine göre test', 'Quizzes on your gaps'), t('Konu konu kayıp analizi', 'Loss by topic')].map((line) => (
							<Stack key={line} row gap={6} align="flex-start">
								<Icon name="check" size={14} color={colors.success} />
								<Text role="small" color={colors.ink}>
									{line}
								</Text>
							</Stack>
						))}
					</Stack>
				</Card>
			</div>
			<Text role="section" size={15}>
				{t('Hepsi tek uygulamada', 'All in one app')}
			</Text>
			<Stack row wrap gap={8}>
				{MODULE_ORDER.map((key) => (
					<Stack key={key} row gap={8} style={{padding: '6px 12px 6px 6px', borderRadius: 999, background: alpha(MODULES[key].color.light, 0.09)}}>
						<Tile module={key} size={28} />
						<Text role="headline" size={13.5}>
							{t(MODULES[key].name)}
						</Text>
					</Stack>
				))}
			</Stack>
		</OnbFrame>
	);
};

export const OnbTrialScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const steps: [UIIconName, string, string][] = [
		['gift', t('Bugün', 'Today'), t('Planın, denemeler, SinoAI ve tüm modüller açılır.', 'Your plan, exams, SinoAI and every module unlock.')],
		['bell', t('2. gün', 'Day 2'), t('Deneme sürenin bittiğini hatırlatırız.', 'We remind you the trial is ending.')],
		['card', t('3. gün', 'Day 3'), t('YKS Aylık ₺299 ile devam eder. Öncesinde iptal edersen ücret yok.', 'Continues as YKS Monthly ₺299. Cancel before and pay nothing.')],
	];
	return (
		<OnbFrame step={8} over={t('3 gün ücretsiz', '3 days free')} title={t('Tüm özellikleri 3 gün ücretsiz dene', 'Try everything free for 3 days')} text={t('Bugün ödeme yok. İstediğin an iptal edebilirsin.', 'No payment today. Cancel any time.')} cta={t('3 gün ücretsiz başla', 'Start 3 free days')} extra={<Text role="small" align="center" weight={700} color={colors.ink}>{t('Paketleri karşılaştır', 'Compare plans')}</Text>}>
			<Card padding={6}>
				{steps.map(([icon, title, text], index) => (
					<Stack key={title} row gap={12} align="flex-start" style={{padding: '12px 10px', borderTop: index ? `1px solid ${colors.line2}` : undefined}}>
						<Tile icon={icon} size={36} color={index ? colors.ink2 : colors.brand} />
						<Stack gap={1} grow>
							<Text role="headline">{title}</Text>
							<Text role="small">{text}</Text>
						</Stack>
					</Stack>
				))}
			</Card>
			<Stack row justify="space-between" style={{padding: '14px 16px', borderRadius: UI_RADIUS.lg, border: '1.5px solid #EA580C', background: colors.card}}>
				<Stack gap={1}>
					<Text role="headline">{t('YKS Aylık Paket', 'YKS Monthly')}</Text>
					<Text role="small">{t('3 gün ücretsiz, sonra aylık', '3 days free, then monthly')}</Text>
				</Stack>
				<Text role="section">₺299/ay</Text>
			</Stack>
		</OnbFrame>
	);
};

/** Account step: hands over to sign up with the plan already made. */
export const OnbAccountScreen: React.FC = () => {
	const t = useT();
	return (
		<OnbFrame step={7} over={t('Hesap', 'Account')} title={t('Planını kaydedelim', 'Let’s save your plan')} text={t('Hesabınla planın, netlerin ve ilerlemen web ve mobilde senkron kalır.', 'Your plan, scores and progress stay in sync on web and mobile.')} cta={t('E-posta ile devam et', 'Continue with e-mail')} extra={<><Button tone="dark" size="lg" block icon="apple">{t('Apple ile devam et', 'Continue with Apple')}</Button><Button tone="ghost" size="lg" block icon="google">{t('Google ile devam et', 'Continue with Google')}</Button></>}>
			<div style={{position: 'relative', height: 260, borderRadius: 26, background: moduleGradient('studyPlan'), overflow: 'hidden', padding: 18, boxSizing: 'border-box'}}>
				<Text role="over" color="rgba(255,255,255,0.85)">
					{t('Kaydedilecek', 'Will be saved')}
				</Text>
				<Stack gap={8} style={{marginTop: 12}}>
					{[t('Haftalık plan · 21 saat', 'Weekly plan · 21 hours'), t('Hedef · 48 → 78 net', 'Goal · 48 → 78'), t('Zorlandığın dersler · 3', 'Weak subjects · 3')].map((line) => (
						<Stack key={line} row gap={10} style={{padding: '10px 12px', borderRadius: 14, background: 'rgba(255,255,255,0.18)'}}>
							<Icon name="check" size={16} color="#FFFFFF" />
							<Text role="headline" color="#FFFFFF">
								{line}
							</Text>
						</Stack>
					))}
				</Stack>
			</div>
		</OnbFrame>
	);
};

/** Notification permission, asked at the moment it helps (reminder for the first exam), with our own pre-prompt. */
export const OnbNotificationsScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<Phone bg={`linear-gradient(180deg, ${alpha('#EA580C', 0.1)} 0%, ${colors.bg} 50%)`}>
			<Content tabBar={false} gap={16} style={{alignItems: 'center', textAlign: 'center', paddingTop: 60}}>
				<div style={{width: 96, height: 96, borderRadius: 32, background: colors.card, boxShadow: UI_SHADOW.float, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<Icon name="bell" size={44} color={colors.brand} />
				</div>
				<Text role="hero" align="center">
					{t('Planını unutturmayalım', 'We will keep you on track')}
				</Text>
				<Text role="body" align="center">
					{t('Günün planını sabah, deneme sonucunu açıklanınca haber veririz. Gece 23:00–07:00 sessiz.', 'Your plan in the morning, exam results when ready. Quiet 23:00–07:00.')}
				</Text>
				<Card padding={12} style={{width: '100%', textAlign: 'left'}}>
					<Stack gap={8}>
						{([['studyPlan', 'Bugünün planı hazır', 'Today’s plan is ready', '08:00'], ['exam', 'Sonucun hazır: TYT Deneme 4', 'Your result: TYT Exam 4', '12:24']] as [ModuleKey, string, string, string][]).map(([key, tr, en, time]) => (
							<Stack key={tr} row gap={10}>
								<Tile module={key} size={32} />
								<Text role="headline" size={13.5} style={{flex: 1}}>
									{t(tr, en)}
								</Text>
								<Text role="meta">{time}</Text>
							</Stack>
						))}
					</Stack>
				</Card>
			</Content>
			<BottomBar>
				<Button size="lg" block>
					{t('Bildirimleri aç', 'Turn on notifications')}
				</Button>
				<Button tone="ghost" size="lg" block>
					{t('Şimdi değil', 'Not now')}
				</Button>
			</BottomBar>
		</Phone>
	);
};
