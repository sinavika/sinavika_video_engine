import React from 'react';
import {useColors, useT} from '../../Context';
import {Icon, type UIIconName} from '../../Icons';
import {MODULES, MODULE_ORDER, type ModuleKey} from '../../ModuleIdentity';
import {Button, Card, Chip, Field, Stack, Text, Tile} from '../../Parts/Shared';
import {AuthLayout, DevicePhone, Grid, WebOnboarding, type AuthPromo} from '../../Parts/Web';
import {UI_RADIUS} from '../../Tokens';
import {CodeBoxes} from '../Mobile/Auth';
import {HubScreen} from '../Mobile/Hub';
import {WeekPlan} from '../Mobile/Onboarding';
import {PlanTodayScreen} from '../Mobile/Plan';

/** Web sign in, sign up, password pages and the web onboarding (which did not exist before). */

const Divider: React.FC<{label: string}> = ({label}) => {
	const colors = useColors();
	return (
		<Stack row gap={10}>
			<div style={{flex: 1, height: 1, background: colors.line}} />
			<Text role="meta">{label}</Text>
			<div style={{flex: 1, height: 1, background: colors.line}} />
		</Stack>
	);
};

const Social: React.FC = () => {
	const t = useT();
	return (
		<Stack gap={10}>
			<Button tone="ghost" block icon="google">
				{t('Google ile devam et', 'Continue with Google')}
			</Button>
			<Button tone="ghost" block icon="apple">
				{t('Apple ile devam et', 'Continue with Apple')}
			</Button>
		</Stack>
	);
};

const Title: React.FC<{title: string; muted: string; link: string}> = ({title, muted, link}) => {
	const colors = useColors();
	return (
		<Stack align="center" gap={6} style={{marginBottom: 18}}>
			<Text role="title" size={28} align="center">
				{title}
			</Text>
			<Stack row gap={5}>
				<Text role="small">{muted}</Text>
				<Text role="small" weight={800} color={colors.brandDeep}>
					{link}
				</Text>
			</Stack>
		</Stack>
	);
};

/** The right half of sign-in and sign-up: the same three points, a pitch per page, the app home on a phone. */
const useAuthPromo = (page: 'signIn' | 'signUp'): AuthPromo => {
	const t = useT();
	const points = [
		t('Gerçek sınav gibi denemeler, net ve konu analizi', 'Real exam-style practice tests with score and topic analysis'),
		t('Eksik konularına göre günlük Ders Planı', 'A daily study plan built around your weak topics'),
		t('Takıldığın soruda SinoAI ile adım adım çözüm', 'Stuck on a question? SinoAI solves it step by step'),
	];
	const preview = (
		<DevicePhone width={280} rotate={-4}>
			<HubScreen />
		</DevicePhone>
	);
	return page === 'signIn'
		? {over: t('Tekrar hoş geldin', 'Welcome back'), title: t('Kaldığın yerden devam et', 'Pick up where you left off'), text: t('Planın, denemelerin ve SinoAI geçmişin seni bekliyor. Telefonda da aynı hesap.', 'Your plan, practice tests and SinoAI history are waiting. Same account on your phone.'), points, preview}
		: {over: t('Sınavika’ya katıl', 'Join Sınavika'), title: t('Ne çalışacağını bil, her gün ilerle', 'Know what to study, move forward every day'), text: t('Sınavını ve hedefini seç; ilk günün planı iki dakikada hazırlansın.', 'Choose your exam and goal; your first day’s plan is ready in two minutes.'), points, preview};
};

export const WebSignInScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<AuthLayout promo={useAuthPromo('signIn')}>
			<Title title={t('Giriş yap', 'Sign in')} muted={t('Hesabın yok mu?', 'No account?')} link={t('Kayıt ol', 'Sign up')} />
			<Stack gap={14}>
				<Social />
				<Divider label={t('veya', 'or')} />
				<Field label={t('E-posta', 'E-mail')} value="ayse@ornek.com" icon="mail" focus />
				<Field label={t('Şifre', 'Password')} value="••••••••" icon="lock" trailing={<Icon name="eye" size={17} color={colors.muted} />} />
				<Stack row justify="space-between">
					<Text role="small" weight={700} color={colors.ink2}>
						{t('E-postama kod gönder', 'E-mail me a code')}
					</Text>
					<Text role="small" weight={700} color={colors.brandDeep}>
						{t('Şifremi unuttum', 'Forgot password')}
					</Text>
				</Stack>
				<Button size="lg" block>
					{t('Giriş yap', 'Sign in')}
				</Button>
			</Stack>
		</AuthLayout>
	);
};

export const WebSignInCodeScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<AuthLayout>
			<Title title={t('Kodu gir', 'Enter the code')} muted={t('ayse@ornek.com', 'ayse@ornek.com')} link={t('Değiştir', 'Change')} />
			<Stack gap={16}>
				<Text role="small" align="center">
					{t('E-postana gelen 6 haneli kodu gir. Kod 10 dakika geçerli.', 'Enter the 6-digit code from your e-mail. Valid for 10 minutes.')}
				</Text>
				<CodeBoxes digits="4829" />
				<Stack row justify="center" gap={6}>
					<Text role="small">{t('Kod gelmedi mi?', 'No code?')}</Text>
					<Text role="small" weight={700} color={colors.brandDeep}>
						{t('Tekrar gönder · 0:42', 'Resend · 0:42')}
					</Text>
				</Stack>
				<Button tone="disabled" size="lg" block>
					{t('Doğrula ve giriş yap', 'Verify and sign in')}
				</Button>
			</Stack>
		</AuthLayout>
	);
};

export const WebSignUpScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<AuthLayout promo={useAuthPromo('signUp')}>
			<Title title={t('Kayıt ol', 'Sign up')} muted={t('Zaten hesabın var mı?', 'Have an account?')} link={t('Giriş yap', 'Sign in')} />
			<Stack gap={12}>
				<Social />
				<Divider label={t('veya', 'or')} />
				<Grid columns="1fr 1fr" gap={10}>
					<Field label={t('Ad', 'First name')} value="Ayşe" height={46} />
					<Field label={t('Soyad', 'Last name')} value="Yılmaz" height={46} />
				</Grid>
				<Field label={t('E-posta', 'E-mail')} value="ayse@ornek.com" icon="mail" height={46} />
				<Field label={t('Şifre', 'Password')} value="••••••••••" icon="lock" focus height={46} hint={t('En az 8 karakter ve bir rakam', 'At least 8 characters and a number')} />
				<Stack row gap={10} align="flex-start">
					<div style={{width: 20, height: 20, borderRadius: 6, background: colors.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
						<Icon name="check" size={13} color={colors.bg} />
					</div>
					<Text role="meta">{t('Kullanım Koşulları’nı ve KVKK aydınlatma metnini okudum.', 'I have read the Terms and Privacy Notice.')}</Text>
				</Stack>
				<Button size="lg" block>
					{t('Hesabımı oluştur', 'Create my account')}
				</Button>
				<Text role="meta" align="center">
					{t('Kayıttan sonra 2 dakikada planını hazırlıyoruz.', 'After sign-up we build your plan in 2 minutes.')}
				</Text>
			</Stack>
		</AuthLayout>
	);
};

export const WebForgotScreen: React.FC = () => {
	const t = useT();
	return (
		<AuthLayout>
			<Title title={t('Şifremi unuttum', 'Forgot password')} muted={t('Hatırladın mı?', 'Remembered?')} link={t('Giriş yap', 'Sign in')} />
			<Stack gap={14}>
				<Text role="small" align="center">
					{t('E-posta adresine 6 haneli bir kod göndereceğiz.', 'We will send a 6-digit code to your e-mail.')}
				</Text>
				<Field label={t('E-posta', 'E-mail')} value="ayse@ornek.com" icon="mail" focus />
				<Button size="lg" block>
					{t('Kod gönder', 'Send code')}
				</Button>
			</Stack>
		</AuthLayout>
	);
};

export const WebResetScreen: React.FC = () => {
	const t = useT();
	return (
		<AuthLayout>
			<Title title={t('Yeni şifre', 'New password')} muted="a•••@ornek.com" link={t('Kodu tekrar gönder', 'Resend code')} />
			<Stack gap={12}>
				<CodeBoxes digits="482913" />
				<Field label={t('Yeni şifre', 'New password')} value="••••••••••" icon="lock" focus height={46} />
				<Field label={t('Yeni şifre (tekrar)', 'Repeat')} placeholder={t('Tekrar yaz', 'Type again')} icon="lock" height={46} />
				<Button size="lg" block>
					{t('Şifremi güncelle', 'Update password')}
				</Button>
			</Stack>
		</AuthLayout>
	);
};

/* ------------------------------------------------------------------ onboarding */

const Pick: React.FC<{on?: boolean; icon?: UIIconName; title: string; sub?: string; tag?: string}> = ({on, icon, title, sub, tag}) => {
	const colors = useColors();
	return (
		<Stack row gap={14} style={{padding: 16, borderRadius: UI_RADIUS.lg, background: colors.card, border: `${on ? 2 : 1.5}px solid ${on ? colors.ink : colors.line}`}}>
			{icon ? <Tile icon={icon} size={44} color={on ? colors.ink : colors.ink2} /> : null}
			<Stack grow gap={2}>
				<Stack row gap={8}>
					<Text role="section" size={16}>
						{title}
					</Text>
					{tag ? <Chip tone="brand" size="sm">{tag}</Chip> : null}
				</Stack>
				{sub ? <Text role="small">{sub}</Text> : null}
			</Stack>
			<div style={{width: 22, height: 22, borderRadius: 11, border: on ? `7px solid ${colors.ink}` : `2px solid ${colors.line}`, boxSizing: 'border-box'}} />
		</Stack>
	);
};

const PhonePreview: React.FC<{children: React.ReactNode; label: string}> = ({children, label}) => (
	<Stack align="center" gap={16}>
		<DevicePhone width={300} rotate={-3}>
			{children}
		</DevicePhone>
		<Chip tone="outline">{label}</Chip>
	</Stack>
);

const GoalCard: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<Card padding={24} style={{width: 420}}>
			<Text role="over">{t('Hedefin', 'Your goal')}</Text>
			<Stack row justify="space-between" align="flex-end" style={{marginTop: 10}}>
				<Text role="num" size={48}>
					48
				</Text>
				<Icon name="right" size={26} color={colors.subtle} />
				<Text role="num" size={48}>
					78
				</Text>
			</Stack>
			<Text role="small" style={{marginTop: 10}}>
				{t('YKS · Sayısal · 245 gün', 'YKS · Science · 245 days')}
			</Text>
		</Card>
	);
};

export const WebOnbExamScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<WebOnboarding step={1} over={t('Hedef sınav', 'Target exam')} title={t('Hangi sınava hazırlanıyorsun?', 'Which exam are you preparing for?')} text={t('Planını, denemelerini ve içeriklerini buna göre kuracağız.', 'We build your plan, exams and content around it.')} preview={<GoalCard />}>
			<Grid columns="1fr 1fr" gap={12}>
				<Pick on icon="grad" title="YKS" sub="TYT · AYT · YDT" />
				<Pick icon="briefcase" title="KPSS" sub={t('Lisans · Ön lisans · Ortaöğretim', 'Degree · Associate · High school')} />
			</Grid>
			<Text role="section" size={16}>
				{t('Oturum ve puan türü', 'Session and score type')}
			</Text>
			<Stack row wrap gap={8}>
				{[['TYT', true], ['AYT · Sayısal', true], ['AYT · Eşit ağırlık', false], ['AYT · Sözel', false], ['YDT', false]].map(([label, on]) => (
					<Chip key={label as string} tone="outline" icon={on ? 'check' : undefined} style={{height: 40, padding: '0 16px', fontSize: 14, color: on ? colors.ink : colors.ink2, border: `${on ? 2 : 1.5}px solid ${on ? colors.ink : colors.line}`}}>
						{label as string}
					</Chip>
				))}
			</Stack>
		</WebOnboarding>
	);
};

export const WebOnbGoalScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<WebOnboarding step={2} over={t('Hedef', 'Goal')} title={t('Şu an neredesin, nereye varmak istiyorsun?', 'Where are you, where do you want to be?')} text={t('Kabaca seçmen yeterli; ilk denemenden sonra biz güncelleriz.', 'A rough guess is fine; we update it after your first exam.')} preview={<GoalCard />}>
			<Card padding={22}>
				<Stack gap={18}>
					<Stack row justify="space-between">
						<Stack gap={2}>
							<Text role="meta">{t('Şu anki netin', 'Current')}</Text>
							<Text role="num" size={36}>
								48
							</Text>
						</Stack>
						<Stack gap={2} align="flex-end">
							<Text role="meta">{t('Hedef netin', 'Target')}</Text>
							<Text role="num" size={36}>
								78
							</Text>
						</Stack>
					</Stack>
					<div style={{position: 'relative', height: 30}}>
						<div style={{position: 'absolute', left: 0, right: 0, top: 12, height: 6, borderRadius: 3, background: colors.line2}} />
						<div style={{position: 'absolute', left: '40%', right: '35%', top: 12, height: 6, borderRadius: 3, background: colors.ink}} />
						{[40, 65].map((left) => (
							<div key={left} style={{position: 'absolute', left: `calc(${left}% - 13px)`, top: 2, width: 26, height: 26, borderRadius: 13, background: '#FFFFFF', border: `3px solid ${colors.ink}`}} />
						))}
					</div>
				</Stack>
			</Card>
			<Field label={t('Hedef bölüm (isteğe bağlı)', 'Target programme (optional)')} value={t('Bilgisayar Mühendisliği · İstanbul', 'Computer Engineering · Istanbul')} icon="pin" />
			<Card tone="soft" padding={14}>
				<Stack row gap={10}>
					<Icon name="trend" size={20} color={colors.successInk} />
					<Text role="small" color={colors.ink2}>
						{t('+30 net, 245 günde gerçekçi: haftada ortalama 1 net.', '+30 in 245 days is realistic: about 1 a week.')}
					</Text>
				</Stack>
			</Card>
		</WebOnboarding>
	);
};

export const WebOnbTempoScreen: React.FC = () => {
	const t = useT();
	return (
		<WebOnboarding step={3} over={t('Tempo', 'Pace')} title={t('Günde ne kadar çalışabilirsin?', 'How much can you study a day?')} text={t('Sürdürebileceğin bir tempo seç; istediğin zaman değiştirirsin.', 'Pick a pace you can keep; change it any time.')} preview={<WeekPlanPreview />}>
			<Stack gap={10}>
				<Pick icon="sun" title={t('Hafif', 'Light')} sub={t('1 saat · 40 soru · okul ya da işle birlikte', '1 hour · 40 questions')} />
				<Pick on icon="target" title={t('Dengeli', 'Balanced')} tag={t('Önerilen', 'Suggested')} sub={t('3 saat · 100 soru · çoğu öğrenci için', '3 hours · 100 questions')} />
				<Pick icon="zap" title={t('Yoğun', 'Intense')} sub={t('5+ saat · 180 soru · son aylar ve kamp', '5+ hours · 180 questions')} />
			</Stack>
		</WebOnboarding>
	);
};

const WeekPlanPreview: React.FC = () => (
	<div style={{width: 470}}>
		<WeekPlan />
	</div>
);

export const WebOnbWeakScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const lessons: [string, string, boolean][] = [['Matematik', 'Maths', true], ['Türkçe', 'Turkish', false], ['Geometri', 'Geometry', true], ['Fizik', 'Physics', false], ['Kimya', 'Chemistry', true], ['Biyoloji', 'Biology', false], ['Tarih', 'History', false], ['Coğrafya', 'Geography', false], ['Felsefe', 'Philosophy', false], ['Din Kültürü', 'Religion', false]];
	return (
		<WebOnboarding step={4} over={t('Dersler', 'Subjects')} title={t('Hangi derslerde daha çok desteğe ihtiyacın var?', 'Where do you need more support?')} text={t('Planında bu derslere daha çok yer ayırırız. Seçmesen de olur.', 'We give these more room. Optional.')} cta={t('Planımı hazırla', 'Build my plan')} preview={<WeekPlanPreview />}>
			<Stack row wrap gap={8}>
				{lessons.map(([tr, en, on]) => (
					<Chip key={tr} tone="outline" icon={on ? 'check' : undefined} style={{height: 44, padding: '0 18px', fontSize: 14, color: on ? colors.ink : colors.ink2, border: `${on ? 2 : 1.5}px solid ${on ? colors.ink : colors.line}`}}>
						{t(tr, en)}
					</Chip>
				))}
			</Stack>
		</WebOnboarding>
	);
};

export const WebOnbPlanScreen: React.FC = () => {
	const t = useT();
	return (
		<WebOnboarding step={5} over={t('Hazır', 'Ready')} title={t('YKS planın hazır', 'Your YKS plan is ready')} text={t('48 netten 78 nete, günde 3 saatlik dengeli tempoyla. Telefonda da aynı plan.', 'From 48 to 78 at a balanced 3 hours a day. Same plan on your phone.')} cta={t('Planımı kaydet', 'Save my plan')} preview={<PhonePreview label={t('Mobilde aynı plan', 'Same plan on mobile')}><PlanTodayScreen /></PhonePreview>}>
			<WeekPlan />
			<Card tone="moduleLine" module="lessons" padding={16}>
				<Stack row gap={12}>
					<Tile module="lessons" size={44} />
					<Stack grow gap={1}>
						<Text role="over" color={MODULES.lessons.color.light}>
							{t('Bugünkü ilk görevin', 'Your first task today')}
						</Text>
						<Text role="headline">{t('Paragraf · Ana fikir · 25 dk', 'Reading · Main idea · 25 min')}</Text>
					</Stack>
				</Stack>
			</Card>
		</WebOnboarding>
	);
};

export const WebOnbPlanChoiceScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<WebOnboarding step={6} over={t('Paket', 'Plan')} title={t('Paketini seç', 'Pick your plan')} text={t('Ödemeden sonra bütün modüller açılır. İstediğin an iptal edebilirsin; iptal, dönemin sonunda geçerli olur.', 'Every module opens after payment. Cancel any time; it takes effect at the end of the period.')} cta={t('Ödemeye geç', 'Go to payment')} preview={<PhonePreview label={t('Tüm modüller açık', 'Every module open')}><HubScreen /></PhonePreview>}>
			<Stack gap={10}>
				{[[t('YKS Yıllık', 'YKS Yearly'), t('₺249/ay · yıllık ₺2.990 · 2 ay hediye', '₺249/mo · ₺2,990 a year'), true], [t('YKS Aylık', 'YKS Monthly'), '₺299/ay', false]].map(([title, sub, on]) => (
					<Stack key={title as string} row gap={14} style={{padding: 16, borderRadius: 18, border: `${on ? 2 : 1.5}px solid ${on ? colors.ink : colors.line}`, background: colors.card}}>
						<div style={{width: 22, height: 22, borderRadius: 11, border: on ? `7px solid ${colors.ink}` : `2px solid ${colors.line}`, boxSizing: 'border-box'}} />
						<Stack grow gap={1}>
							<Text role="section" size={16}>
								{title as string}
							</Text>
							<Text role="small">{sub as string}</Text>
						</Stack>
						{on ? <Chip tone="brand">{t('En çok seçilen', 'Most popular')}</Chip> : null}
					</Stack>
				))}
			</Stack>
			<Text role="small" weight={700} color={colors.ink2}>
				{t('Şimdilik paket seçme', 'Not now')}
			</Text>
			<Stack row gap={8}>
				{MODULE_ORDER.map((key: ModuleKey) => (
					<Tile key={key} module={key} size={34} />
				))}
			</Stack>
		</WebOnboarding>
	);
};
