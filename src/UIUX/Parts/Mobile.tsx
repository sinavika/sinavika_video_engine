import React from 'react';
import {useAccent, useColors, useModuleColors, useT, useUI, UIProvider} from '../Context';
import {Icon, type UIIconName} from '../Icons';
import {alpha, MODULES, moduleGradient, moduleInk, type ModuleKey} from '../ModuleIdentity';
import {UI_CANVAS, UI_RADIUS, UI_SHADOW} from '../Tokens';
import {useFit} from '../Fit';
import {DUO_BOTTOM, DUO_OUTER_TOOLBAR_TOP, DUO_RAIL, DuoRail, RailButton, RailGroup} from './Duo';
import {Button, Chip, Glow, Logo, Stack, Steps, Text, Watermark} from './Shared';

/**
 * Mobile parts. The layout follows the app as it is today (the user's own
 * design): centred logo header, the hub's slide carousel with module cards
 * under it, and the floating tab bar with Modüller in the middle.
 */

const {width: W, height: H} = UI_CANVAS.mobile;

const StatusBar: React.FC<{light?: boolean}> = ({light}) => {
	const colors = useColors();
	const ink = light ? '#FFFFFF' : colors.ink;
	return (
		<div data-ui="statusbar" style={{flexShrink: 0}}>
			<Stack row justify="space-between" style={{height: 50, padding: '14px 30px 0 34px', boxSizing: 'border-box'}}>
				<Text role="headline" size={15.5} weight={700} color={ink}>
					9:41
				</Text>
				<Stack row gap={6}>
					<Icon name="signal" size={17} color={ink} stroke={2.4} />
					<Icon name="wifi" size={17} color={ink} />
					<Icon name="battery" size={20} color={ink} />
				</Stack>
			</Stack>
		</div>
	);
};

/** The phone canvas: 390 x 844 points, status bar on top. `wash` tints the top with the module colour. */
export const Phone: React.FC<{children: React.ReactNode; bg?: string; wash?: boolean; lightStatus?: boolean; overlay?: React.ReactNode}> = ({children, bg, wash, lightStatus, overlay}) => {
	const colors = useColors();
	const mod = useModuleColors();
	const {canvas, duo} = useUI();
	const background = bg ?? (wash ? `linear-gradient(180deg, ${mod.wash} 0%, ${colors.bg} 34%)` : colors.bg);
	if (duo === 'outer' || duo === 'sheet') {
		// iPhone Duo: no status bar on top. Outer display: iOS's trailing strip (island, status; our toolbar and tab bar). Bottom bars keep their own home-indicator padding, as on the phone.
		return (
			<div data-ui="screen" style={{position: 'relative', width: canvas?.width ?? W, height: canvas?.height ?? H, overflow: 'hidden', display: 'flex', flexDirection: 'column', background}}>
				<div style={{flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', marginRight: duo === 'outer' ? DUO_RAIL : 0, paddingTop: 10}}>{children}</div>
				{duo === 'outer' ? <DuoRail island /> : null}
				{overlay}
			</div>
		);
	}
	return (
		<div data-ui="screen" style={{position: 'relative', width: canvas?.width ?? W, height: canvas?.height ?? H, overflow: 'hidden', display: 'flex', flexDirection: 'column', background}}>
			<StatusBar light={lightStatus} />
			{children}
			{overlay}
		</div>
	);
};

const RoundIcon: React.FC<{icon: UIIconName; badge?: string; tone?: 'plain' | 'card'}> = ({icon, badge, tone = 'plain'}) => {
	const colors = useColors();
	return (
		<div style={{position: 'relative', width: 40, height: 40, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: tone === 'card' ? colors.card : 'transparent', border: tone === 'card' ? `1px solid ${colors.line}` : undefined}}>
			<Icon name={icon} size={22} color={colors.ink} />
			{badge ? (
				<div style={{position: 'absolute', top: 2, right: 0, minWidth: 18, height: 18, padding: '0 4px', boxSizing: 'border-box', borderRadius: 9, background: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<Text role="meta" size={9.5} weight={800} color="#FFFFFF">
						{badge}
					</Text>
				</div>
			) : null}
		</div>
	);
};

/**
 * The app header: profile on the left, notifications on the right. The logo
 * sits in the middle only on brand screens (Modüller, profile, sign-in); a
 * module page names itself in its page title instead.
 */
export const AppHeader: React.FC<{left?: 'profile' | 'back' | 'close' | 'menu' | 'none'; title?: string; right?: React.ReactNode; logo?: boolean}> = ({left = 'profile', title, right, logo}) => {
	const {module} = useUI();
	const icon: Record<string, UIIconName> = {profile: 'user', back: 'left', close: 'x', menu: 'menu'};
	const showLogo = logo ?? (!title && !module);
	const {duo} = useUI();
	if (duo === 'outer') {
		// Toolbar items with an icon move to the rail (Back or Close first, then the action); a text item stays in the header.
		const custom = right !== undefined;
		// A module page with tabs already shows Profil at the foot of the rail, so the toolbar drops its own profile button.
		const tabbed = left === 'profile' && !!(module && MODULES[module].tabs);
		return (
			<>
				<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, height: 40, padding: '0 18px', flexShrink: 0}}>
					{showLogo ? <Logo height={22} /> : title ? <Text role="section">{title}</Text> : <div />}
					{custom ? right : null}
				</div>
				<RailGroup top={DUO_OUTER_TOOLBAR_TOP} label="duo-toolbar">
					{left === 'none' || tabbed ? null : <RailButton icon={icon[left]} />}
					{custom ? null : <RailButton icon="bell" badge="3" />}
				</RailGroup>
			</>
		);
	}
	return (
		// Three columns so the title stays centred whatever sits on the right (B5): 40 pt round back or close, centred title, right action.
		<div style={{display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', columnGap: 8, height: 52, padding: '0 14px', flexShrink: 0}}>
			<div style={{justifySelf: 'start'}}>{left === 'none' ? <div style={{width: 40}} /> : <RoundIcon icon={icon[left]} tone={left === 'profile' ? 'plain' : 'card'} />}</div>
			{showLogo ? <Logo height={24} /> : title ? <Text role="section">{title}</Text> : <div />}
			<div style={{justifySelf: 'end', display: 'flex', alignItems: 'center'}}>{right ?? <RoundIcon icon="bell" badge="3" />}</div>
		</div>
	);
};

/** The module's tab bar: floating, rounded, the active tab in a soft pill of the module colour, Modüller in the middle. */
export const TabBar: React.FC<{module: ModuleKey; active?: number}> = ({module, active = 0}) => {
	const colors = useColors();
	const t = useT();
	const mod = useModuleColors(module);
	const tabs = MODULES[module].tabs;
	if (!tabs) return null;
	const items: ({label: string; icon: UIIconName} | 'hub')[] = [{label: t(tabs[0].label), icon: tabs[0].icon}, {label: t(tabs[1].label), icon: tabs[1].icon}, 'hub', {label: t(tabs[2].label), icon: tabs[2].icon}, {label: t('Profil', 'Profile'), icon: 'user'}];
	const slot = [0, 1, 3, 4][active] ?? 0;
	if (useUI().duo === 'outer') {
		return (
			<RailGroup bottom={DUO_BOTTOM} label="duo-tabbar">
				{items.map((item, index) => (item === 'hub' ? <RailButton key="hub" icon="grid" /> : <RailButton key={item.label} icon={item.icon} on={index === slot} color={mod.color} soft={mod.soft} />))}
			</RailGroup>
		);
	}
	return (
		<div data-ui="tabbar" style={{position: 'absolute', left: 14, right: 14, bottom: 22, height: 72, borderRadius: 28, background: alpha(colors.card.length === 7 ? colors.card : '#FFFFFF', 0.96), border: `1px solid ${colors.line}`, boxShadow: UI_SHADOW.float, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, padding: '0 6px', zIndex: 5}}>
			{items.map((item, index) => {
				if (item === 'hub') {
					return (
						<Stack key="hub" align="center" gap={3} style={{flex: '1 1 auto', minWidth: 52}}>
							<div style={{width: 42, height: 42, borderRadius: 21, background: colors.line2, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
								<Icon name="grid" size={22} color={colors.ink2} stroke={3} />
							</div>
							<Text role="meta" size={10} color={colors.muted}>
								{t('Modüller', 'Modules')}
							</Text>
						</Stack>
					);
				}
				const on = index === slot;
				return (
					<Stack key={item.label} align="center" justify="center" gap={3} style={{flex: '1 1 auto', minWidth: 52, height: 58, padding: '0 5px', borderRadius: 20, background: on ? mod.soft : 'transparent'}}>
						<Icon name={item.icon} size={22} color={on ? mod.color : colors.muted} stroke={on ? 2.2 : 1.9} />
						<Text role="meta" size={10} weight={on ? 800 : 600} color={on ? mod.ink : colors.muted} style={{whiteSpace: 'nowrap', letterSpacing: '-0.02em'}}>
							{item.label}
						</Text>
					</Stack>
				);
			})}
		</div>
	);
};

/** One slide of the hub carousel: the module's gradient, its offer today and one action. */
export const ModuleSlide: React.FC<{module: ModuleKey; height?: number; title?: string; text?: string; label?: string; action?: string}> = ({module, height = 196, title, text, label, action}) => {
	const t = useT();
	const {mode} = useUI();
	const identity = MODULES[module];
	return (
		<div style={{position: 'relative', overflow: 'hidden', minHeight: height, borderRadius: UI_RADIUS.xl, background: moduleGradient(module, mode), padding: 20, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 6, boxShadow: `0 16px 30px -18px ${alpha(identity.color.light, 0.8)}`}}>
			<Glow />
			<Glow size={140} top={120} right={180} opacity={0.08} />
			<Watermark icon={identity.icon} />
			<Text role="over" color="rgba(255,255,255,0.85)" style={{position: 'relative'}}>
				{label ?? t(identity.slide.label)}
			</Text>
			<Text role="hero" size={24} color="#FFFFFF" style={{position: 'relative', maxWidth: 270}}>
				{title ?? t(identity.slide.title)}
			</Text>
			<Text role="small" color="rgba(255,255,255,0.9)" style={{position: 'relative', maxWidth: 260}}>
				{text ?? t(identity.slide.text)}
			</Text>
			<div style={{flex: 1}} />
			<Button tone="white" size="sm" style={{alignSelf: 'flex-start', position: 'relative', color: moduleInk(module, 'light')}}>
				{action ?? t(identity.slide.action)}
			</Button>
		</div>
	);
};

/** A hub card (the user's design): name and line, a soft panel in the module colour with its icon. */
export const HubCard: React.FC<{module: ModuleKey; wide?: boolean; status?: string}> = ({module, wide, status}) => {
	const colors = useColors();
	const t = useT();
	const mod = useModuleColors(module);
	const identity = MODULES[module];
	return (
		<div style={{boxSizing: 'border-box', borderRadius: UI_RADIUS.lg, background: colors.card, border: `1px solid ${colors.line}`, boxShadow: UI_SHADOW.card, padding: 12, display: 'flex', flexDirection: 'column', gap: 10, gridColumn: wide ? 'span 2' : undefined}}>
			<Stack row align="flex-start" gap={8}>
				<Stack grow gap={2}>
					<Text role="headline" size={14.5}>
						{t(identity.name)}
					</Text>
					<Text role="meta" size={11.5} color={colors.muted}>
						{t(identity.tagline)}
					</Text>
				</Stack>
				<div style={{width: 24, height: 24, borderRadius: 8, background: colors.line2, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<Icon name="right" size={14} color={colors.muted} />
				</div>
			</Stack>
			<div style={{position: 'relative', height: wide ? 70 : 74, borderRadius: 14, background: mod.soft, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 12px', overflow: 'hidden'}}>
				<div style={{position: 'absolute', width: 120, height: 120, borderRadius: 60, right: -40, top: -50, background: alpha(identity.color.light, 0.08)}} />
				<div style={{width: 46, height: 46, borderRadius: 15, background: colors.card, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: UI_SHADOW.card}}>
					<Icon name={identity.icon} size={24} color={mod.color} />
				</div>
				{status ? (
					<div style={{position: 'absolute', left: 8, bottom: 8}}>
						<Chip size="sm" tone="outline" style={{background: colors.card}}>
							{status}
						</Chip>
					</div>
				) : null}
			</div>
		</div>
	);
};

/**
 * Content area of a module screen: padding and gaps, above the tab bar. The
 * area ends above the bar: what does not fit whole is not drawn, a list row by
 * row and other blocks whole (owner, 16 Nov 2026: a half card used to show
 * under the tab bar; see Fit.ts). `fit={false}` for a page drawn scrolled.
 */
export const Content: React.FC<{children: React.ReactNode; gap?: number; tabBar?: boolean; padding?: string; style?: React.CSSProperties; fit?: boolean}> = ({children, gap = 14, tabBar = true, padding, style, fit = true}) => {
	const ref = React.useRef<HTMLDivElement>(null);
	// iPhone Duo outer display (shorter than a phone, 644 pt of content): the page is drawn scrolled to its top instead of leaving blocks out.
	const {duo} = useUI();
	const outer = duo === 'outer';
	useFit(ref, fit && !outer);
	return (
		<div ref={ref} data-fit-area data-ui={outer ? 'scroll-y' : undefined} style={{flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap, padding: padding ?? `4px 18px ${tabBar && !outer ? 108 : outer ? DUO_BOTTOM : 20}px`, boxSizing: 'border-box', ...style}}>
			{React.Children.map(children, (child) =>
				child ? (
					<div data-fit="block" style={{flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: style?.alignItems}}>
						{child}
					</div>
				) : null,
			)}
		</div>
	);
};

/**
 * A list of separate cards (tasks, questions) in `Content`: the cards that do
 * not fit whole are left out one by one, as in a list scrolled to the top.
 */
export const FitList: React.FC<{children: React.ReactNode; gap?: number}> = ({children, gap = 10}) => (
	<div data-fit-group style={{display: 'flex', flexDirection: 'column', gap}}>
		{React.Children.map(children, (child) =>
			child ? (
				<div data-fit="item" style={{display: 'flex', flexDirection: 'column'}}>
					{child}
				</div>
			) : null,
		)}
	</div>
);

/** A module page title: the module chip (way-finding) and the page title. */
export const PageTitle: React.FC<{module?: ModuleKey; title: string; sub?: string; right?: React.ReactNode}> = ({module, title, sub, right}) => {
	const t = useT();
	return (
		<Stack row align="flex-end" justify="space-between" gap={10}>
			<Stack gap={6} grow>
				{module ? (
					<Chip tone="module" module={module} icon={MODULES[module].icon} size="sm">
						{t(MODULES[module].name)}
					</Chip>
				) : null}
				<Text role="title" size={24}>
					{title}
				</Text>
				{sub ? <Text role="small">{sub}</Text> : null}
			</Stack>
			{right}
		</Stack>
	);
};

/** A module screen: header, washed background in the module colour, content and the tab bar. */
export const ModuleScreen: React.FC<{module: ModuleKey; tab?: number; header?: React.ReactNode; children: React.ReactNode; overlay?: React.ReactNode; noTabBar?: boolean}> = ({module, tab = 0, header, children, overlay, noTabBar}) => (
	<UIProvider module={module}>
		<Phone wash overlay={overlay}>
			{header ?? <AppHeader />}
			{children}
			{noTabBar ? null : <TabBar module={module} active={tab} />}
		</Phone>
	</UIProvider>
);

export const SectionTitle: React.FC<{title: string; action?: string; sub?: string}> = ({title, action, sub}) => {
	const accent = useAccent();
	return (
		<Stack data-ui="heading" row justify="space-between" align="flex-end">
			<Stack gap={2}>
				<Text role="section">{title}</Text>
				{sub ? <Text role="small">{sub}</Text> : null}
			</Stack>
			{action ? (
				<Text role="small" weight={700} color={accent.ink}>
					{action}
				</Text>
			) : null}
		</Stack>
	);
};

/** Fixed bottom area with the screen's main action. */
export const BottomBar: React.FC<{children: React.ReactNode; border?: boolean}> = ({children, border}) => {
	const colors = useColors();
	return (
		<div data-ui="bottombar" style={{padding: '12px 18px 34px', display: 'flex', flexDirection: 'column', gap: 10, borderTop: border ? `1px solid ${colors.line2}` : undefined, background: border ? colors.card : undefined, flexShrink: 0}}>
			{children}
		</div>
	);
};

/** Focus header: solving, lessons, sessions. No tab bar; exit, title and progress. */
export const FocusHeader: React.FC<{title: string; sub?: string; left?: UIIconName; right?: React.ReactNode; progress?: number; steps?: [number, number]}> = ({title, sub, left = 'x', right, progress, steps}) => {
	const colors = useColors();
	const mod = useModuleColors();
	return (
		<Stack gap={10} style={{padding: '4px 16px 10px', flexShrink: 0}}>
			<Stack row justify="space-between">
				<RoundIcon icon={left} tone="card" />
				<Stack align="center" gap={1}>
					{sub ? <Text role="meta">{sub}</Text> : null}
					<Text role="headline" size={16}>
						{title}
					</Text>
				</Stack>
				{right ?? <div style={{width: 40}} />}
			</Stack>
			{steps ? <Steps count={steps[1]} done={steps[0]} color={mod.color} /> : null}
			{progress !== undefined ? (
				<div style={{height: 5, borderRadius: 3, background: colors.line2}}>
					<div style={{width: `${progress * 100}%`, height: '100%', borderRadius: 3, background: mod.color}} />
				</div>
			) : null}
		</Stack>
	);
};

/** A bottom sheet over a dimmed screen. */
export const Sheet: React.FC<{children: React.ReactNode; height?: number}> = ({children, height = 420}) => {
	const colors = useColors();
	return (
		<div data-ui="scrim" style={{position: 'absolute', inset: 0, background: 'rgba(11, 28, 48, 0.45)', zIndex: 20}}>
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height, borderRadius: '28px 28px 0 0', background: colors.card, padding: '10px 20px 34px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 14}}>
				<div style={{alignSelf: 'center', width: 40, height: 5, borderRadius: 3, background: colors.line}} />
				{children}
			</div>
		</div>
	);
};

/**
 * A first-use tip with a highlighted hole at the given box (canvas points).
 * One tip at a time, shown when the student first meets the thing; `total`
 * above 1 numbers a short series.
 */
export const TourOverlay: React.FC<{hole: {x: number; y: number; w: number; h: number; r?: number}; step?: number; total?: number; title: string; text: string; below?: boolean; arrow?: number}> = ({hole, step = 1, total = 1, title, text, below = true, arrow = 0.5}) => {
	const colors = useColors();
	const accent = useAccent();
	const t = useT();
	const single = total === 1;
	const canvasHeight = useUI().canvas?.height ?? H;
	const top = below ? hole.y + hole.h + 18 : undefined;
	const bottom = below ? undefined : canvasHeight - hole.y + 18;
	return (
		<div data-ui="scrim" style={{position: 'absolute', inset: 0, zIndex: 30}}>
			<div style={{position: 'absolute', left: hole.x, top: hole.y, width: hole.w, height: hole.h, borderRadius: hole.r ?? 22, boxShadow: `0 0 0 4px rgba(255,255,255,0.95), 0 0 0 2000px rgba(11, 28, 48, 0.62)`}} />
			<div style={{position: 'absolute', left: 16, right: 16, top, bottom, borderRadius: 22, background: colors.card, padding: 18, boxShadow: UI_SHADOW.float}}>
				<div style={{position: 'absolute', left: `calc(${arrow * 100}% - 8px)`, [below ? 'top' : 'bottom']: -7, width: 16, height: 16, background: colors.card, transform: 'rotate(45deg)'}} />
				<Stack row justify="space-between">
					<Text role="over" color={accent.ink}>
						{single ? t('İpucu', 'Tip') : `${t('İpucu', 'Tip')} · ${step}/${total}`}
					</Text>
					{single ? null : <Text role="meta">{t('Geç', 'Skip')}</Text>}
				</Stack>
				<Text role="section" style={{marginTop: 6}}>
					{title}
				</Text>
				<Text role="body" style={{marginTop: 4}}>
					{text}
				</Text>
				<Stack row justify="space-between" style={{marginTop: 14}}>
					<div style={{width: 80}}>{single ? null : <Steps count={total} done={step} />}</div>
					<Button size="sm">{step === total ? t('Anladım', 'Got it') : t('Sonraki', 'Next')}</Button>
				</Stack>
			</div>
		</div>
	);
};
