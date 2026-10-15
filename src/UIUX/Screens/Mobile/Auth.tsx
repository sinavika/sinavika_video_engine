import React from 'react';
import {useColors, useT} from '../../Context';
import {Icon} from '../../Icons';
import {MODULES, MODULE_ORDER, type ModuleKey} from '../../ModuleIdentity';
import {AppHeader, BottomBar, Content, HubCard, ModuleSlide, Phone, Sheet} from '../../Parts/Mobile';
import {Button, Card, Chip, Field, Logo, Stack, Text, Tile} from '../../Parts/Shared';

/**
 * Welcome, sign in, sign up and password screens. The flow is the app's:
 * e-mail first, then a 6-digit code (sign in) or a password (sign up);
 * Apple and Google on every entry screen.
 */

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
			<Button tone="dark" size="lg" block icon="apple">
				{t('Apple ile devam et', 'Continue with Apple')}
			</Button>
			<Button tone="ghost" size="lg" block icon="google">
				{t('Google ile devam et', 'Continue with Google')}
			</Button>
		</Stack>
	);
};

const Footer: React.FC<{muted: string; strong: string}> = ({muted, strong}) => {
	const colors = useColors();
	return (
		<Stack row justify="center" gap={6}>
			<Text role="small">{muted}</Text>
			<Text role="small" weight={800} color={colors.brand}>
				{strong}
			</Text>
		</Stack>
	);
};

const AuthTitle: React.FC<{over?: string; title: string; text: string}> = ({over, title, text}) => (
	<Stack gap={8} style={{paddingTop: 8}}>
		{over ? <Chip tone="brand">{over}</Chip> : null}
		<Text role="hero">{title}</Text>
		<Text role="body">{text}</Text>
	</Stack>
);

/** The code boxes: six digits, the next one focused. */
export const CodeBoxes: React.FC<{digits: string}> = ({digits}) => {
	const colors = useColors();
	return (
		<Stack row justify="space-between">
			{Array.from({length: 6}, (_, index) => {
				const focus = index === digits.length;
				return (
					<div key={index} style={{width: 48, height: 58, borderRadius: 16, background: colors.card, border: `1.5px solid ${focus ? colors.brand : colors.line}`, boxShadow: focus ? '0 0 0 4px rgba(234,88,12,0.1)' : undefined, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<Text role="title" size={24}>
							{digits[index] ?? ''}
						</Text>
					</div>
				);
			})}
		</Stack>
	);
};

export const WelcomeScreen: React.FC = () => {
	const t = useT();
	const fan: ModuleKey[] = ['lessons', 'exam', 'smartSummary'];
	return (
		<Phone bg="radial-gradient(90% 55% at 50% 30%, var(--ui-brandSoft) 0%, var(--ui-bg) 70%)">
			<Stack align="center" style={{paddingTop: 12}}>
				<Logo height={30} />
			</Stack>
			<div style={{position: 'relative', height: 360, marginTop: 18}}>
				{fan.map((key, index) => (
					<div key={key} style={{position: 'absolute', left: 30 + index * 34, top: 12 + index * 76, width: 270, transform: `rotate(${[-7, 3, -2][index]}deg)`}}>
						<ModuleSlide module={key} height={150} />
					</div>
				))}
			</div>
			<Stack gap={10} align="center" style={{padding: '8px 28px 0', textAlign: 'center'}}>
				<Text role="display" align="center">
					{t('Ne çalışacağını bil,', 'Know what to study,')}
					<br />
					<span style={{color: '#EA580C'}}>{t('her gün ilerle.', 'move forward daily.')}</span>
				</Text>
				<Text role="body" align="center">
					{t('Deneme, ders, test, plan ve SinoAI tek uygulamada. Planın 2 dakikada hazır.', 'Exams, lessons, quizzes, a plan and SinoAI in one app. Your plan in 2 minutes.')}
				</Text>
			</Stack>
			<div style={{flex: 1}} />
			<BottomBar>
				<Button size="lg" block iconRight="right">
					{t('Başlayalım', 'Let’s start')}
				</Button>
				<Button tone="ghost" size="lg" block>
					{t('Zaten hesabım var', 'I already have an account')}
				</Button>
			</BottomBar>
		</Phone>
	);
};

export const SignInScreen: React.FC = () => {
	const t = useT();
	return (
		<Phone>
			<AppHeader left="back" right={<div style={{width: 40}} />} />
			<Content tabBar={false} gap={18}>
				<AuthTitle title={t('Oturum aç veya kaydol', 'Sign in or sign up')} text={t('Devam etmek için e-posta adresini gir. Hesabın varsa kod göndeririz, yoksa birlikte oluştururuz.', 'Enter your e-mail. If you have an account we send a code; if not, we create one together.')} />
				<Social />
				<Divider label={t('ya da e-posta ile', 'or with e-mail')} />
				<Field label={t('E-posta', 'E-mail')} value="ayse@ornek.com" icon="mail" focus />
			</Content>
			<BottomBar>
				<Button size="lg" block>
					{t('Kod gönder', 'Send code')}
				</Button>
				<Footer muted={t('Hesabın yok mu?', 'No account?')} strong={t('Hesap oluştur', 'Create one')} />
			</BottomBar>
		</Phone>
	);
};

export const SignInCodeScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<Phone>
			<AppHeader left="back" right={<div style={{width: 40}} />} />
			<Content tabBar={false} gap={18}>
				<AuthTitle title={t('Doğrulama kodu', 'Verification code')} text={t('ayse@ornek.com adresine gelen 6 haneli kodu gir.', 'Enter the 6-digit code sent to ayse@ornek.com.')} />
				<CodeBoxes digits="4829" />
				<Stack row justify="space-between">
					<Text role="small">{t('Kod gelmedi mi?', 'No code?')}</Text>
					<Text role="small" weight={700} color={colors.brand}>
						{t('Tekrar gönder · 0:42', 'Resend · 0:42')}
					</Text>
				</Stack>
				<Card tone="soft" padding={14}>
					<Stack row gap={10}>
						<Icon name="info" size={18} color={colors.muted} />
						<Text role="small">{t('Kod 10 dakika geçerli. Spam klasörüne de bak.', 'The code is valid for 10 minutes. Check spam too.')}</Text>
					</Stack>
				</Card>
				<Text role="small" weight={700} color={colors.ink2}>
					{t('Parolanla giriş yap', 'Sign in with your password')}
				</Text>
			</Content>
			<BottomBar>
				<Button tone="disabled" size="lg" block>
					{t('Doğrula', 'Verify')}
				</Button>
				<Footer muted={t('Farklı bir e-posta mı?', 'Different e-mail?')} strong={t('Değiştir', 'Change')} />
			</BottomBar>
		</Phone>
	);
};

export const SignUpScreen: React.FC = () => {
	const t = useT();
	return (
		<Phone>
			<AppHeader left="back" right={<div style={{width: 40}} />} />
			<Content tabBar={false} gap={18}>
				<AuthTitle over={t('Planını kaydet', 'Save your plan')} title={t('Hesap oluştur', 'Create account')} text={t('Planın, netlerin ve ilerlemen web ve mobilde aynı hesapta kalır.', 'Your plan, scores and progress stay in one account on web and mobile.')} />
				<Social />
				<Divider label={t('ya da e-posta ile', 'or with e-mail')} />
				<Field label={t('E-posta', 'E-mail')} value="ayse@ornek.com" icon="mail" focus />
			</Content>
			<BottomBar>
				<Button size="lg" block>
					{t('Devam et', 'Continue')}
				</Button>
				<Footer muted={t('Zaten hesabın var mı?', 'Have an account?')} strong={t('Oturum aç', 'Sign in')} />
			</BottomBar>
		</Phone>
	);
};

export const SignUpDetailsScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<Phone>
			<AppHeader left="back" right={<div style={{width: 40}} />} />
			<Content tabBar={false} gap={14}>
				<AuthTitle title={t('Seni tanıyalım', 'Tell us about you')} text={t('Adın, SinoAI ve e-postalarda sana hitap etmemiz için.', 'Your name is how SinoAI and our e-mails address you.')} />
				<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10}}>
					<Field label={t('Ad', 'First name')} value="Ayşe" />
					<Field label={t('Soyad', 'Last name')} value="Yılmaz" />
				</div>
				<Field label={t('Parola', 'Password')} value="••••••••••" icon="lock" focus trailing={<Icon name="eye" size={18} color={colors.muted} />} />
				<Stack row gap={6}>
					{[1, 1, 1, 0].map((on, index) => (
						<div key={index} style={{flex: 1, height: 5, borderRadius: 3, background: on ? colors.success : colors.line}} />
					))}
				</Stack>
				<Text role="meta" color={colors.success}>
					{t('Güçlü parola · en az 8 karakter, bir rakam', 'Strong · 8+ characters with a number')}
				</Text>
				<Stack row gap={10} align="flex-start">
					<div style={{width: 22, height: 22, borderRadius: 7, background: colors.brand, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
						<Icon name="check" size={14} color="#FFFFFF" />
					</div>
					<Text role="small">{t('Kullanım Koşulları’nı ve KVKK aydınlatma metnini okudum.', 'I have read the Terms and the Privacy Notice.')}</Text>
				</Stack>
			</Content>
			<BottomBar>
				<Button size="lg" block>
					{t('Hesabımı oluştur', 'Create my account')}
				</Button>
			</BottomBar>
		</Phone>
	);
};

export const ForgotPasswordScreen: React.FC = () => {
	const t = useT();
	return (
		<Phone>
			<AppHeader left="back" right={<div style={{width: 40}} />} />
			<Content tabBar={false} gap={18}>
				<AuthTitle title={t('Şifremi unuttum', 'Forgot password')} text={t('E-posta adresine 6 haneli bir kod göndereceğiz.', 'We will send a 6-digit code to your e-mail.')} />
				<Field label={t('E-posta', 'E-mail')} value="ayse@ornek.com" icon="mail" focus />
			</Content>
			<BottomBar>
				<Button size="lg" block>
					{t('Kod gönder', 'Send code')}
				</Button>
				<Footer muted={t('Şifreni hatırladın mı?', 'Remembered it?')} strong={t('Oturum aç', 'Sign in')} />
			</BottomBar>
		</Phone>
	);
};

export const NewPasswordScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<Phone>
			<AppHeader left="back" right={<div style={{width: 40}} />} />
			<Content tabBar={false} gap={14}>
				<AuthTitle title={t('Gelen kutunu kontrol et', 'Check your inbox')} text={t('a•••@ornek.com adresine gelen kodu gir, ardından yeni parolanı belirle.', 'Enter the code sent to a•••@ornek.com, then set a new password.')} />
				<CodeBoxes digits="482913" />
				<Text role="meta" color={colors.muted}>
					{t('Kodun süresi: 8:12', 'Code expires in 8:12')}
				</Text>
				<Field label={t('Yeni parola', 'New password')} value="••••••••••" icon="lock" focus />
				<Field label={t('Yeni parola (tekrar)', 'Repeat password')} placeholder={t('Parolanı tekrar yaz', 'Type it again')} icon="lock" />
			</Content>
			<BottomBar>
				<Button size="lg" block>
					{t('Parolamı güncelle', 'Update password')}
				</Button>
			</BottomBar>
		</Phone>
	);
};

/** A guest taps something that needs an account: a sheet, not a full redirect. */
export const AuthSheetScreen: React.FC = () => {
	const t = useT();
	return (
		<Phone
			overlay={
				<Sheet height={430}>
					<Stack row gap={12}>
						<Tile module="smartSummary" size={46} solid />
						<Stack grow gap={2}>
							<Text role="section">{t('Analizini kaydedelim', 'Let’s save your analysis')}</Text>
							<Text role="small">{t('Akıllı Özet için hesap gerekir. 30 saniye sürer.', 'Smart Summary needs an account. Takes 30 seconds.')}</Text>
						</Stack>
					</Stack>
					<Social />
					<Button tone="soft" size="lg" block icon="mail">
						{t('E-posta ile devam et', 'Continue with e-mail')}
					</Button>
					<Footer muted={t('Zaten hesabın var mı?', 'Have an account?')} strong={t('Oturum aç', 'Sign in')} />
				</Sheet>
			}
		>
			<AppHeader />
			<Content tabBar={false}>
				<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10}}>
					{MODULE_ORDER.slice(0, 6).map((key) => (
						<HubCard key={key} module={key} />
					))}
				</div>
			</Content>
		</Phone>
	);
};

export const AccountReadyScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<Phone bg="linear-gradient(180deg, var(--ui-successSoft) 0%, var(--ui-bg) 45%)">
			<Content tabBar={false} gap={18} style={{alignItems: 'center', textAlign: 'center', paddingTop: 70}}>
				<Stack align="center" gap={14}>
					<div style={{width: 96, height: 96, borderRadius: 32, background: colors.success, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 18px 30px -14px rgba(5,150,105,0.6)'}}>
						<Icon name="check" size={48} color="#FFFFFF" stroke={2.6} />
					</div>
					<Text role="hero" align="center">
						{t('Hoş geldin Ayşe', 'Welcome, Ayşe')}
					</Text>
					<Text role="body" align="center">
						{t('Hesabın hazır. Planın kaydedildi; web’de de aynı hesapla devam edebilirsin.', 'Your account is ready and your plan is saved. Continue on the web with the same account.')}
					</Text>
				</Stack>
				<Card tone="card" padding={14} style={{width: '100%', textAlign: 'left'}}>
					<Stack gap={10}>
						{(['studyPlan', 'exam', 'sinoAi'] as ModuleKey[]).map((key) => (
							<Stack key={key} row gap={12}>
								<Tile module={key} size={34} />
								<Text role="headline">{t(MODULES[key].slide.title)}</Text>
							</Stack>
						))}
					</Stack>
				</Card>
			</Content>
			<BottomBar>
				<Button size="lg" block>
					{t('Planıma git', 'Go to my plan')}
				</Button>
			</BottomBar>
		</Phone>
	);
};
