import React from 'react';
import {UIProvider, useAccent, useColors, useModuleColors, useT} from '../Context';
import {Icon, type UIIconName} from '../Icons';
import {alpha, MODULES, MODULE_ORDER, moduleGradient, moduleInk, type ModuleKey} from '../ModuleIdentity';
import {UI_CANVAS, UI_RADIUS, UI_SHADOW} from '../Tokens';
import {Avatar, Button, Card, Chip, Logo, Stack, Steps, Text, Tile} from './Shared';
import {PHONE_GEOMETRY} from '../../Components/AppScreens/PhoneFrame';

/**
 * Web parts. The panel keeps the student app's own frame (left menu with
 * "MENU" and collapse, top bar with theme, support, notifications and the
 * user), reorganised around the seven modules. The site keeps its own header.
 */

const {width: W, height: H} = UI_CANVAS.web;

type PanelItem = 'home' | 'modules' | ModuleKey | 'notifications' | 'profile' | 'support';

/** A menu row: neutral icon and text; only the active row shows its module colour (a thin bar and the icon), on a light grey pill. */
const NavRow: React.FC<{item: PanelItem; active: boolean; label: string; icon: UIIconName; badge?: string}> = ({item, active, label, icon, badge}) => {
	const colors = useColors();
	const isModule = (MODULE_ORDER as readonly string[]).includes(item);
	const mod = useModuleColors(isModule ? (item as ModuleKey) : 'exam');
	const tint = isModule ? mod.color : colors.ink;
	return (
		<Stack row gap={12} style={{height: 40, padding: '0 12px', borderRadius: 12, background: active ? colors.line2 : 'transparent', position: 'relative'}}>
			{active ? <div style={{position: 'absolute', left: -14, top: 10, bottom: 10, width: 3, borderRadius: 2, background: tint}} /> : null}
			<Icon name={icon} size={19} color={active ? tint : colors.muted} stroke={active ? 2.1 : 1.8} />
			<Text role="headline" size={14} weight={active ? 700 : 500} color={active ? colors.ink : colors.ink2} style={{flex: 1}}>
				{label}
			</Text>
			{badge ? <Text role="meta" weight={700} color={colors.muted}>{badge}</Text> : null}
		</Stack>
	);
};

/** The panel's left menu: Ana sayfa, Modüller, the seven modules, account, then the streak and sign out. */
const Sidebar: React.FC<{active: PanelItem}> = ({active}) => {
	const colors = useColors();
	const t = useT();
	return (
		<div style={{width: 260, flexShrink: 0, height: H, boxSizing: 'border-box', padding: '18px 14px', background: colors.card, borderRight: `1px solid ${colors.line}`, display: 'flex', flexDirection: 'column', gap: 3}}>
			<Stack row justify="space-between" style={{padding: '0 8px 14px'}}>
				<Logo height={26} />
				<Icon name="menu" size={18} color={colors.subtle} />
			</Stack>
			<NavRow item="home" active={active === 'home'} label={t('Ana sayfa', 'Home')} icon="home" />
			<NavRow item="modules" active={active === 'modules'} label={t('Tüm modüller', 'All modules')} icon="apps" />
			<Text role="over" size={10.5} style={{padding: '14px 10px 6px'}}>
				{t('Modüller', 'Modules')}
			</Text>
			{MODULE_ORDER.map((key) => (
				<NavRow key={key} item={key} active={active === key} label={t(MODULES[key].name)} icon={MODULES[key].icon} />
			))}
			<Text role="over" size={10.5} style={{padding: '14px 10px 6px'}}>
				{t('Hesap', 'Account')}
			</Text>
			<NavRow item="notifications" active={active === 'notifications'} label={t('Bildirimler', 'Notifications')} icon="bell" badge="3" />
			<NavRow item="support" active={active === 'support'} label={t('Destek', 'Support')} icon="headset" />
			<div style={{flex: 1}} />
			<div style={{padding: 12, borderRadius: 14, border: `1px solid ${colors.line}`, marginBottom: 8}}>
				<Stack row gap={8}>
					<Icon name="flame" size={18} color={colors.warning} />
					<Text role="headline" size={13.5}>
						{t('5 günlük seri', '5-day streak')}
					</Text>
				</Stack>
				<Text role="meta" style={{marginTop: 4}}>
					{t('Bugün 20 dk çalış, seriyi koru.', 'Study 20 min today to keep it.')}
				</Text>
			</div>
			<Stack row gap={12} style={{height: 40, padding: '0 12px', borderRadius: 12}}>
				<Icon name="logout" size={18} color={colors.muted} />
				<Text role="headline" size={13.5} weight={500} color={colors.ink2}>
					{t('Çıkış yap', 'Sign out')}
				</Text>
			</Stack>
		</div>
	);
};

const TopIcon: React.FC<{icon: UIIconName; dot?: boolean}> = ({icon, dot}) => {
	const colors = useColors();
	return (
		<div style={{position: 'relative', width: 38, height: 38, borderRadius: 19, border: `1px solid ${colors.line}`, background: colors.card, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
			<Icon name={icon} size={18} color={colors.ink2} />
			{dot ? <div style={{position: 'absolute', top: 7, right: 8, width: 8, height: 8, borderRadius: 4, background: colors.error, border: `2px solid ${colors.card}`}} /> : null}
		</div>
	);
};

/** Top bar: search, exam countdown, theme, support, notifications and the user (as the panel has them). */
const Topbar: React.FC<{crumb?: string; countdown?: string}> = ({crumb, countdown}) => {
	const colors = useColors();
	const t = useT();
	return (
		<Stack row gap={12} style={{height: 68, flexShrink: 0, padding: '0 28px', borderBottom: `1px solid ${colors.line}`, background: alpha(colors.card, 0.85)}}>
			{crumb ? (
				<Text role="small" weight={700} color={colors.ink2}>
					{crumb}
				</Text>
			) : null}
			<Stack row gap={10} style={{height: 40, width: 340, padding: '0 14px', borderRadius: 20, background: colors.line2}}>
				<Icon name="search" size={17} color={colors.muted} />
				<Text role="small">{t('Ders, konu, deneme ara', 'Search lessons, topics, exams')}</Text>
				<div style={{flex: 1}} />
				<Chip size="sm" tone="outline">
					Ctrl K
				</Chip>
			</Stack>
			<div style={{flex: 1}} />
			<Chip tone="outline" icon="target">
				{countdown ?? t('YKS’ye 245 gün', '245 days to YKS')}
			</Chip>
			<TopIcon icon="bulb" />
			<TopIcon icon="headset" />
			<TopIcon icon="bell" dot />
			<Stack row gap={10} style={{paddingLeft: 6}}>
				<Stack gap={0} align="flex-end">
					<Text role="headline" size={13.5}>
						{t('Ayşe Yılmaz', 'Emma Carter')}
					</Text>
					<Text role="meta" size={11}>
						{t('ayse@ornek.com', 'emma@example.com')}
					</Text>
				</Stack>
				<Avatar size={36} />
				<Icon name="down" size={16} color={colors.muted} />
			</Stack>
		</Stack>
	);
};

/** The panel frame: menu, top bar and the page. A module page gets the module's wash at the top. */
export const Panel: React.FC<{active: PanelItem; children: React.ReactNode; crumb?: string; overlay?: React.ReactNode; countdown?: string}> = ({active, children, crumb, overlay, countdown}) => {
	const colors = useColors();
	const isModule = (MODULE_ORDER as readonly string[]).includes(active);
	const mod = useModuleColors(isModule ? (active as ModuleKey) : 'exam');
	return (
		<UIProvider module={isModule ? (active as ModuleKey) : undefined} web>
			<div style={{position: 'relative', width: W, height: H, display: 'flex', background: colors.bg, overflow: 'hidden'}}>
				<Sidebar active={active} />
				<div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: isModule ? `linear-gradient(180deg, ${mod.wash} 0%, ${colors.bg} 300px)` : colors.bg}}>
					<Topbar crumb={crumb} countdown={countdown} />
					<div style={{flex: 1, minHeight: 0, overflow: 'hidden', padding: '22px 28px 28px', display: 'flex', flexDirection: 'column', gap: 18}}>{children}</div>
				</div>
				{overlay}
			</div>
		</UIProvider>
	);
};

/** A module page head: the module's tabs as pills, then a card with its tile, name, title and actions. */
export const ModuleHead: React.FC<{module: ModuleKey; tab?: number; tabs?: string[]; title: string; sub?: string; actions?: React.ReactNode}> = ({module, tab = 0, tabs, title, sub, actions}) => {
	const colors = useColors();
	const t = useT();
	const mod = useModuleColors(module);
	const identity = MODULES[module];
	const names = tabs ?? (identity.tabs ? identity.tabs.map((item) => t(item.label)) : []);
	return (
		<Stack gap={14}>
			{names.length ? (
				<Stack row gap={8}>
					{names.map((name, index) => (
						<div key={name} style={{height: 36, padding: '0 16px', borderRadius: 18, display: 'flex', alignItems: 'center', background: index === tab ? mod.action : colors.card, border: index === tab ? undefined : `1px solid ${colors.line}`}}>
							<Text role="headline" size={13.5} color={index === tab ? '#FFFFFF' : colors.ink2}>
								{name}
							</Text>
						</div>
					))}
				</Stack>
			) : null}
			<Stack row gap={16} style={{padding: '18px 20px', borderRadius: UI_RADIUS.xl, background: colors.card, border: `1px solid ${mod.line}`, boxShadow: UI_SHADOW.card, position: 'relative', overflow: 'hidden'}}>
				<div style={{position: 'absolute', right: -60, top: -80, width: 240, height: 240, borderRadius: 120, background: mod.wash}} />
				<Tile module={module} size={52} />
				<Stack grow gap={3} style={{position: 'relative'}}>
					<Chip tone="module" module={module} size="sm">
						{t(identity.name)}
					</Chip>
					<Text role="title" size={26}>
						{title}
					</Text>
					{sub ? <Text role="small" size={13.5}>{sub}</Text> : null}
				</Stack>
				<Stack row gap={10} style={{position: 'relative'}}>
					{actions}
				</Stack>
			</Stack>
		</Stack>
	);
};

/** Immersive pages (solving, sessions, focus): no menu, a slim bar with exit, title, timer and action. */
export const Immersive: React.FC<{module: ModuleKey; title: string; sub?: string; right?: React.ReactNode; progress?: number; children: React.ReactNode}> = ({module, title, sub, right, progress, children}) => {
	const colors = useColors();
	const t = useT();
	const mod = useModuleColors(module);
	return (
		<UIProvider module={module} web>
			<div style={{width: W, height: H, display: 'flex', flexDirection: 'column', background: colors.card}}>
				<Stack row gap={16} style={{height: 70, padding: '0 32px', borderBottom: `1px solid ${colors.line}`, flexShrink: 0}}>
					<Button tone="ghost" size="sm" icon="x">
						{t('Ara ver', 'Pause')}
					</Button>
					<Tile module={module} size={36} />
					<Stack gap={0}>
						<Text role="headline">{title}</Text>
						{sub ? <Text role="meta">{sub}</Text> : null}
					</Stack>
					<div style={{flex: 1}} />
					{right}
				</Stack>
				{progress !== undefined ? (
					<div style={{height: 4, background: colors.line2}}>
						<div style={{width: `${progress * 100}%`, height: '100%', background: mod.color}} />
					</div>
				) : null}
				<div style={{flex: 1, minHeight: 0, display: 'flex'}}>{children}</div>
			</div>
		</UIProvider>
	);
};

/* ------------------------------------------------------------------ site */

/** The site header, as the site has it: logo, Ürünler · Sınavlar · Paketler · Kaynaklar, theme, SinoAI, Giriş, Kayıt Ol. */
export const SiteHeader: React.FC<{active?: string; open?: 'products'}> = ({active, open}) => {
	const colors = useColors();
	const t = useT();
	const links: [string, boolean][] = [[t('Ürünler', 'Products'), true], [t('Sınavlar', 'Exams'), false], [t('Paketler', 'Plans'), false], [t('Kaynaklar', 'Resources'), true]];
	return (
		<div style={{position: 'relative', zIndex: 10}}>
			<Stack row style={{height: 80, padding: '0 112px', background: colors.card, borderBottom: `1px solid ${colors.line}`}}>
				<Logo wordmark height={24} color={colors.ink} />
				<div style={{flex: 1}} />
				<Stack row gap={30}>
					{links.map(([label, menu]) => (
						<Stack key={label} row gap={4}>
							<Text role="headline" size={14.5} weight={active === label ? 800 : 600} color={active === label ? colors.ink : colors.ink2}>
								{label}
							</Text>
							{menu ? <Icon name="down" size={14} color={colors.muted} /> : null}
						</Stack>
					))}
				</Stack>
				<div style={{flex: 1}} />
				<Stack row gap={10}>
					<div style={{width: 40, height: 40, borderRadius: 20, border: `1px solid ${colors.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<Icon name="bulb" size={17} color={colors.ink2} />
					</div>
					<Stack row gap={6} style={{height: 40, padding: '0 16px', borderRadius: 20, border: `1px solid ${colors.line}`}}>
						<Icon name="sparkles" size={16} color={colors.ink2} />
						<Text role="headline" size={14}>
							SinoAI
						</Text>
					</Stack>
					<Stack row style={{height: 40, padding: '0 16px', borderRadius: 20, border: `1px solid ${colors.line}`}}>
						<Text role="headline" size={14}>
							{t('Giriş', 'Sign in')}
						</Text>
					</Stack>
					<Button size="sm" style={{height: 40, padding: '0 18px'}}>
						{t('Kayıt Ol', 'Sign up')}
					</Button>
				</Stack>
			</Stack>
			{open === 'products' ? (
				<div style={{position: 'absolute', left: 300, top: 72, width: 840, padding: 20, borderRadius: 24, background: colors.card, boxShadow: UI_SHADOW.float, border: `1px solid ${colors.line}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8}}>
					{MODULE_ORDER.map((key) => (
						<Stack key={key} row gap={12} style={{padding: 12, borderRadius: 16, background: key === 'exam' ? colors.line2 : 'transparent'}}>
							<Tile module={key} size={42} />
							<Stack gap={1}>
								<Text role="headline">{t(MODULES[key].name)}</Text>
								<Text role="small">{t(MODULES[key].tagline)}</Text>
							</Stack>
						</Stack>
					))}
					<Stack row gap={12} style={{padding: 12, borderRadius: 16, border: `1px solid ${colors.line}`}}>
						<Tile icon="layers" size={42} color={colors.ink2} />
						<Stack gap={1}>
							<Text role="headline">{t('Ürün turu', 'Product tour')}</Text>
							<Text role="small">{t('Yedi modül, tek düzen', 'Seven modules, one layout')}</Text>
						</Stack>
					</Stack>
				</div>
			) : null}
		</div>
	);
};

const SiteFooter: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const columns: [string, string[]][] = [
		[t('Sınavlar', 'Exams'), ['YKS', 'TYT', 'AYT', 'KPSS Lisans', 'KPSS Ön lisans']],
		[t('Ürünler', 'Products'), MODULE_ORDER.map((key) => t(MODULES[key].name))],
		['Sınavika', [t('Hakkımızda', 'About'), t('Yayınevleri', 'Publishers'), 'Blog', t('İletişim', 'Contact')]],
		[t('Yasal', 'Legal'), [t('Kullanım koşulları', 'Terms'), t('Gizlilik', 'Privacy'), 'KVKK', t('Çerezler', 'Cookies')]],
	];
	return (
		<div style={{background: colors.bg, borderTop: `1px solid ${colors.line}`, padding: '56px 112px 36px'}}>
			<Stack row justify="space-between" align="flex-start">
				<Stack gap={14} style={{width: 300}}>
					<Logo wordmark height={22} color={colors.ink} />
					<Text role="small" color={colors.muted}>
						{t('Ne çalışacağını bil, her gün ilerle. YKS ve KPSS için çalışma platformu.', 'Know what to study, move forward daily.')}
					</Text>
					<Stack row gap={8}>
						<Button tone="ghost" size="sm" icon="apple">
							App Store
						</Button>
						<Button tone="ghost" size="sm" icon="googlePlay">
							Google Play
						</Button>
					</Stack>
				</Stack>
				{columns.map(([title, links]) => (
					<Stack key={title} gap={10}>
						<Text role="headline" size={14} color={colors.ink}>
							{title}
						</Text>
						{links.map((link) => (
							<Text key={link} role="small" color={colors.muted}>
								{link}
							</Text>
						))}
					</Stack>
				))}
			</Stack>
			<Stack row justify="space-between" style={{marginTop: 36, paddingTop: 18, borderTop: `1px solid ${colors.line}`}}>
				<Text role="meta" color={colors.subtle}>
					© 2026 Sınavika
				</Text>
				<Text role="meta" color={colors.subtle}>
					Türkçe · English · Deutsch · Nederlands
				</Text>
			</Stack>
		</div>
	);
};

/** A site page: header, sections, footer, on a white canvas of the page's height. */
export const Site: React.FC<{active?: string; open?: 'products'; children: React.ReactNode; footer?: boolean}> = ({active, open, children, footer = true}) => {
	const colors = useColors();
	return (
		<UIProvider calm>
			<div style={{width: W, background: colors.card, display: 'flex', flexDirection: 'column'}}>
				<SiteHeader active={active} open={open} />
				{children}
				{footer ? <SiteFooter /> : null}
			</div>
		</UIProvider>
	);
};

export const Section: React.FC<{children: React.ReactNode; bg?: string; padding?: string; style?: React.CSSProperties}> = ({children, bg, padding = '72px 112px', style}) => <div style={{padding, background: bg, boxSizing: 'border-box', ...style}}>{children}</div>;

export const SiteTitle: React.FC<{over?: string; title: React.ReactNode; lead?: string; center?: boolean; size?: number}> = ({over, title, lead, center, size = 44}) => {
	const colors = useColors();
	return (
		<Stack gap={12} align={center ? 'center' : 'flex-start'} style={{textAlign: center ? 'center' : 'left'}}>
			{over ? (
				<Text role="over" color={colors.muted}>
					{over}
				</Text>
			) : null}
			<Text role="display" size={size} style={{lineHeight: `${size * 1.12}px`, letterSpacing: '-0.03em'}} align={center ? 'center' : 'left'}>
				{title}
			</Text>
			{lead ? (
				<Text role="body" size={18} style={{lineHeight: '28px', maxWidth: 720}} align={center ? 'center' : 'left'}>
					{lead}
				</Text>
			) : null}
		</Stack>
	);
};

/** The exam chips strip under the home hero (as the site has it). */
export const ExamStrip: React.FC = () => {
	const colors = useColors();
	return (
		<Stack row gap={10} style={{padding: '22px 112px', borderTop: `1px solid ${colors.line}`, borderBottom: `1px solid ${colors.line}`, overflow: 'hidden'}}>
			{['YKS', 'TYT', 'AYT', 'YDT', 'KPSS Lisans', 'KPSS Önlisans', 'KPSS Ortaöğretim', 'SAT', 'ACT', 'GRE', 'LSAT', 'MCAT'].map((exam) => (
				<div key={exam} style={{height: 40, padding: '0 18px', borderRadius: 20, border: `1px solid ${colors.line}`, display: 'flex', alignItems: 'center', flexShrink: 0}}>
					<Text role="headline" size={14} color={colors.ink2}>
						{exam}
					</Text>
				</div>
			))}
		</Stack>
	);
};

/** A phone showing a mobile drawing, scaled: real screens inside the site's mock-ups. */
export const DevicePhone: React.FC<{width?: number; rotate?: number; children: React.ReactNode}> = ({width = 220, rotate = 0, children}) => {
	// The same phone as the app-screen PhoneFrame (store pictures): proportional
	// bezel, screen corners concentric with the body, and the camera island.
	const g = PHONE_GEOMETRY;
	const bezel = width * g.bezel;
	const scale = (width - bezel * 2) / 390;
	return (
		<div style={{width, height: 844 * scale + bezel * 2, borderRadius: width * g.outerRadius, background: g.body, padding: bezel, boxSizing: 'border-box', transform: `rotate(${rotate}deg)`, boxShadow: `0 ${width * 0.08}px ${width * 0.2}px -${width * 0.06}px rgba(11,28,48,0.55), inset 0 0 0 ${Math.max(1, width * 0.006)}px rgba(255,255,255,0.2)`}}>
			<div style={{width: width - bezel * 2, height: 844 * scale, borderRadius: width * g.screenRadius, overflow: 'hidden', position: 'relative', background: '#FFFFFF'}}>
				<div style={{width: 390, height: 844, transform: `scale(${scale})`, transformOrigin: 'top left'}}>
					<UIProvider calm={false} web={false}>{children}</UIProvider>
				</div>
				<div style={{position: 'absolute', top: width * g.island.top, left: '50%', width: width * g.island.width, height: width * g.island.height, marginLeft: (-width * g.island.width) / 2, borderRadius: width, background: g.body}} />
			</div>
		</div>
	);
};

/** A browser window showing a web drawing, scaled. */
export const DeviceBrowser: React.FC<{width?: number; title?: string; children: React.ReactNode}> = ({width = 640, title = 'sinavika.com', children}) => {
	const colors = useColors();
	const scale = width / W;
	return (
		<div style={{width, borderRadius: 16, overflow: 'hidden', background: colors.card, border: `1px solid ${colors.line}`, boxShadow: '0 30px 60px -30px rgba(11,28,48,0.45)'}}>
			<Stack row gap={6} style={{height: 30, padding: '0 12px', background: colors.line2, borderBottom: `1px solid ${colors.line}`}}>
				{['#F87171', '#FBBF24', '#34D399'].map((color) => (
					<div key={color} style={{width: 9, height: 9, borderRadius: 5, background: color}} />
				))}
				<Text role="meta" style={{marginLeft: 10}}>
					{title}
				</Text>
			</Stack>
			<div style={{width, height: H * scale, overflow: 'hidden'}}>
				<div style={{width: W, height: H, transform: `scale(${scale})`, transformOrigin: 'top left'}}>
					<UIProvider calm={false} web={false}>{children}</UIProvider>
				</div>
			</div>
		</div>
	);
};

/** Pre-login auth pages (as the site has them): back link, logo, theme; a centred card; "Sınavika'yı keşfet" chips. */
/** The promotion beside the sign-in and sign-up forms. */
export type AuthPromo = {over: string; title: string; text: string; points: string[]; preview: React.ReactNode};

/**
 * Web sign-in, sign-up and password pages. With `promo` the page splits like
 * the web onboarding (owner, 25 Oct 2026: "onboarding'in sağ paneli gibi"):
 * the form on the left half, a soft panel on the right with a short pitch,
 * three points, the app on a phone and the store buttons. Without it (password
 * pages) the card stays centred.
 */
export const AuthLayout: React.FC<{promo?: AuthPromo; children: React.ReactNode}> = ({promo, children}) => {
	const colors = useColors();
	const t = useT();
	const header = (
		<Stack row style={{height: 64, padding: '0 28px'}}>
			<Stack row gap={6} style={{width: 200}}>
				<Icon name="left" size={16} color={colors.ink2} />
				<Text role="small" weight={700} color={colors.ink2}>
					{t('Ana sayfa', 'Home')}
				</Text>
			</Stack>
			<div style={{flex: 1, display: 'flex', justifyContent: 'center'}}>
				<Logo height={30} />
			</div>
			<Stack row justify="flex-end" style={{width: 200}}>
				<div style={{width: 38, height: 38, borderRadius: 19, border: `1px solid ${colors.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.card}}>
					<Icon name="bulb" size={17} color={colors.ink2} />
				</div>
			</Stack>
		</Stack>
	);
	const card = <div style={{width: 440, padding: 30, borderRadius: 26, background: colors.card, border: `1px solid ${colors.line}`, boxShadow: UI_SHADOW.float, boxSizing: 'border-box'}}>{children}</div>;
	if (promo) {
		return (
			<div style={{width: W, height: H, display: 'flex', background: colors.bg}}>
				<div style={{width: W / 2, display: 'flex', flexDirection: 'column'}}>
					{header}
					<Stack align="center" justify="center" style={{flex: 1, paddingBottom: 40}}>
						{card}
					</Stack>
				</div>
				<div style={{flex: 1, margin: 16, borderRadius: 32, background: `radial-gradient(120% 100% at 100% 0%, ${colors.brandSoft} 0%, ${colors.card} 62%)`, border: `1px solid ${colors.line}`, position: 'relative', overflow: 'hidden', padding: '48px 52px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 18}}>
					<Chip tone="brand">{promo.over}</Chip>
					<Text role="display" size={32} style={{lineHeight: '38px', maxWidth: 480}}>
						{promo.title}
					</Text>
					<Text role="body" size={16} style={{maxWidth: 460}}>
						{promo.text}
					</Text>
					<Stack gap={10} style={{marginTop: 4}}>
						{promo.points.map((point) => (
							<Stack key={point} row gap={10}>
								<Icon name="check" size={18} color={colors.brand} />
								<Text role="headline">{point}</Text>
							</Stack>
						))}
					</Stack>
					<Stack row gap={10} style={{marginTop: 6}}>
						<Button tone="dark" icon="apple">
							App Store
						</Button>
						<Button tone="dark" icon="googlePlay">
							Google Play
						</Button>
					</Stack>
					<div style={{position: 'absolute', left: '50%', bottom: -190, transform: 'translateX(-50%)'}}>{promo.preview}</div>
				</div>
			</div>
		);
	}
	return (
		<div style={{width: W, height: H, background: `radial-gradient(60% 50% at 50% 0%, ${colors.brandWash} 0%, ${colors.bg} 70%)`, display: 'flex', flexDirection: 'column'}}>
			{header}
			<Stack align="center" style={{flex: 1, paddingTop: 10}}>
				{card}
			</Stack>
			<Stack align="center" gap={10} style={{paddingBottom: 24}}>
				<Text role="over">{t('Sınavika’yı keşfet', 'Explore Sınavika')}</Text>
				<Stack row gap={8}>
					{['SinoAI', t('Türkiye Geneli Deneme', 'Nationwide exams'), t('Net Hesaplama', 'Score calculator'), t('Paketler', 'Plans'), 'Blog', t('YKS hazırlık', 'YKS prep')].map((chip) => (
						<Chip key={chip} tone="outline">
							{chip}
						</Chip>
					))}
				</Stack>
			</Stack>
		</div>
	);
};

/** Web onboarding (after sign-up): steps on the left, a live preview of the plan on the right. */
export const WebOnboarding: React.FC<{step: number; total?: number; over: string; title: string; text: string; cta?: string; preview: React.ReactNode; children: React.ReactNode}> = ({step, total = 6, over, title, text, cta, preview, children}) => {
	const colors = useColors();
	const t = useT();
	return (
		<div style={{width: W, height: H, display: 'flex', background: colors.card}}>
			<div style={{width: 700, padding: '34px 72px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 22}}>
				<Stack row justify="space-between">
					<Logo height={30} />
					<Text role="small" weight={700}>
						{t('Adım', 'Step')} {step}/{total}
					</Text>
				</Stack>
				<Steps count={total} done={step} />
				<Stack gap={10}>
					<Chip tone="brand">{over}</Chip>
					<Text role="display" size={34} style={{lineHeight: '40px'}}>
						{title}
					</Text>
					<Text role="body" size={16}>
						{text}
					</Text>
				</Stack>
				{children}
				<div style={{flex: 1}} />
				<Stack row justify="space-between">
					<Button tone="ghost" icon="left">
						{t('Geri', 'Back')}
					</Button>
					<Button size="lg" iconRight="right">
						{cta ?? t('Devam et', 'Continue')}
					</Button>
				</Stack>
			</div>
			<div style={{flex: 1, margin: 16, borderRadius: 32, background: `radial-gradient(120% 100% at 100% 0%, #FFEDD5 0%, ${colors.bg} 60%)`, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{preview}</div>
		</div>
	);
};

/** A module-coloured gradient banner for web pages. */
export const ModuleBanner: React.FC<{module: ModuleKey; over: string; title: string; text: string; action?: string; children?: React.ReactNode; height?: number}> = ({module, over, title, text, action, children, height}) => (
	<div style={{position: 'relative', overflow: 'hidden', borderRadius: UI_RADIUS.xl, padding: 26, background: moduleGradient(module), minHeight: height, boxSizing: 'border-box', display: 'flex', gap: 24, alignItems: 'center'}}>
		<div style={{position: 'absolute', right: -60, top: -90, width: 280, height: 280, borderRadius: 140, background: 'rgba(255,255,255,0.12)'}} />
		<Stack gap={8} grow style={{position: 'relative'}}>
			<Text role="over" color="rgba(255,255,255,0.85)">
				{over}
			</Text>
			<Text role="title" size={30} color="#FFFFFF">
				{title}
			</Text>
			<Text role="body" size={15} color="rgba(255,255,255,0.9)" style={{maxWidth: 560}}>
				{text}
			</Text>
			{action ? (
				<Button tone="white" style={{alignSelf: 'flex-start', marginTop: 6, color: moduleInk(module, 'light')}}>
					{action}
				</Button>
			) : null}
		</Stack>
		{children ? <div style={{position: 'relative'}}>{children}</div> : null}
	</div>
);

export const WCard: React.FC<{title?: string; action?: string; children: React.ReactNode; style?: React.CSSProperties; padding?: number}> = ({title, action, children, style, padding = 20}) => {
	const accent = useAccent();
	return (
		<Card padding={padding} style={style}>
			{title ? (
				<Stack row justify="space-between" style={{marginBottom: 14}}>
					<Text role="section">{title}</Text>
					{action ? (
						<Text role="small" weight={700} color={accent.ink}>
							{action}
						</Text>
					) : null}
				</Stack>
			) : null}
			{children}
		</Card>
	);
};

export const Grid: React.FC<{columns: string; gap?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({columns, gap = 18, children, style}) => <div style={{display: 'grid', gridTemplateColumns: columns, gap, ...style}}>{children}</div>;
