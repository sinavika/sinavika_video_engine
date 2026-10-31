import React, {createContext, useContext} from 'react';
import {useTheme} from '../../Themes/ThemeContext';
import {APP_MODULES, type AppModuleName} from './AppModules';
import {APP_LAYOUT, APP_PALETTES, APP_SCREEN, APP_TYPE, type AppColors, type AppMode} from './AppScreenTokens';

/**
 * Building blocks of the app screens: the app's own cards, chips, buttons,
 * icons and its screen frame with the module tab bar. Screens are composed
 * from these only, so every screen shares one look and a change in the app
 * is made in one place.
 */
const AppModeContext = createContext<AppMode>('light');

/** Draws the screens inside it in the app's light or dark theme. */
export const AppModeProvider: React.FC<{mode: AppMode; children: React.ReactNode}> = ({mode, children}) => <AppModeContext.Provider value={mode}>{children}</AppModeContext.Provider>;

export const useAppColors = (): AppColors => APP_PALETTES[useContext(AppModeContext)];

/** The app's languages (its tr-TR and en-US catalogues). */
const APP_LANGUAGES = ['tr', 'en'] as const;
export type AppLanguage = (typeof APP_LANGUAGES)[number];
const AppLanguageContext = createContext<AppLanguage>('tr');

/** Draws the screens inside it in the app's Turkish or English catalogue. */
export const AppLanguageProvider: React.FC<{lang: AppLanguage; children: React.ReactNode}> = ({lang, children}) => <AppLanguageContext.Provider value={lang}>{children}</AppLanguageContext.Provider>;

export const useAppLanguage = (): AppLanguage => useContext(AppLanguageContext);

/** Picks the text of the screen's language: `t('Denemeler', 'Practice exams')`. */
export const useAppText = (): ((tr: string, en: string) => string) => {
	const lang = useAppLanguage();
	return (tr, en) => (lang === 'en' ? en : tr);
};

/**
 * The canvas a screen is laid out on, in app points. Phones use the app's
 * design size; a tablet passes its own, and the same screens spread to it.
 */
const AppCanvasContext = createContext<{width: number; height: number}>(APP_SCREEN);

export const AppCanvasProvider: React.FC<{width: number; height: number; children: React.ReactNode}> = ({width, height, children}) => (
	<AppCanvasContext.Provider value={{width, height}}>{children}</AppCanvasContext.Provider>
);

export const useAppCanvas = (): {width: number; height: number} => useContext(AppCanvasContext);

const STROKE = {fill: 'none', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round'} as const;
const CIRCLE = 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18z';

/** The app's icons (Ionicons outlines in the app), as 24x24 stroke paths. */
const APP_ICON_PATHS = {
	home: ['M4 11l8-7 8 7', 'M6 10v10h12V10'],
	apps: ['M5 5h5v5H5V5z', 'M14 5h5v5h-5V5z', 'M5 14h5v5H5v-5z', 'M14 14h5v5h-5v-5z'],
	document: ['M7 3h7l4 4v14H7V3z', 'M14 3v4h4', 'M10 12h5', 'M10 16h5'],
	more: ['M6 12h.01', 'M12 12h.01', 'M18 12h.01'],
	person: ['M12 12a4 4 0 1 0 0-8a4 4 0 0 0 0 8z', 'M4 21a8 8 0 0 1 16 0'],
	scan: ['M4 8V5h3', 'M17 5h3v3', 'M20 16v3h-3', 'M7 19H4v-3', 'M8 12h8'],
	camera: ['M4 8h3l2-3h6l2 3h3v11H4V8z', 'M12 16.5a3.2 3.2 0 1 0 0-6.4a3.2 3.2 0 0 0 0 6.4z'],
	play: [CIRCLE, 'M10 8.5l5.5 3.5-5.5 3.5v-7z'],
	albums: ['M5 9h14v11H5V9z', 'M7 6h10', 'M9 3h6'],
	sun: ['M12 8a4 4 0 1 0 0 8a4 4 0 0 0 0-8z', 'M12 2v2', 'M12 20v2', 'M2 12h2', 'M20 12h2', 'M5 5l1.4 1.4', 'M17.6 17.6L19 19', 'M19 5l-1.4 1.4', 'M6.4 17.6L5 19'],
	bookmark: ['M7 4h10v17l-5-4-5 4V4z'],
	search: ['M11 4a7 7 0 1 0 0 14a7 7 0 0 0 0-14z', 'M16 16l4.5 4.5'],
	clock: [CIRCLE, 'M12 7v5l3.5 2'],
	help: [CIRCLE, 'M9.5 9.5a2.5 2.5 0 1 1 3.8 2.1c-.8.5-1.3 1-1.3 2', 'M12 17v.1'],
	book: ['M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4z', 'M5 17a3 3 0 0 1 3-3h11'],
	compass: [CIRCLE, 'M15.5 8.5l-2 5-5 2 2-5 5-2z'],
	calendar: ['M4 6h16v14H4V6z', 'M4 10h16', 'M8 3v4', 'M16 3v4'],
	checklist: ['M4 6l2 2 3-3', 'M4 13l2 2 3-3', 'M13 7h7', 'M13 14h7', 'M4 20h16'],
	sparkles: ['M11 4l1.8 4.7L17.5 10.5l-4.7 1.8L11 17l-1.8-4.7L4.5 10.5l4.7-1.8L11 4z', 'M18.5 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2z'],
	chart: ['M4 20h16', 'M7 20v-6', 'M12 20V8', 'M17 20v-9'],
	chevron: ['M9 6l6 6-6 6'],
	send: ['M4 12l16-8-6 16-3-7-7-1z'],
	check: ['M5 12.5l4.5 4.5L19 7.5'],
	plus: ['M12 5v14', 'M5 12h14'],
	flame: ['M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z'],
	headset: ['M5 13v-1a7 7 0 0 1 14 0v1', 'M5 13h3v6H5v-6z', 'M16 13h3v6h-3v-6z'],
} as const;
export type AppIconName = keyof typeof APP_ICON_PATHS;

export const AppIcon: React.FC<{name: AppIconName; size?: number; color?: string}> = ({name, size = 22, color}) => {
	const colors = useAppColors();
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" stroke={color ?? colors.text} {...STROKE} style={{flexShrink: 0}}>
			{APP_ICON_PATHS[name].map((path) => (
				<path key={path} d={path} />
			))}
		</svg>
	);
};

type AppTextProps = {
	/** A size from the app's type scale, or a number of canvas pixels. */
	size?: keyof typeof APP_TYPE | number;
	weight?: number;
	color?: string;
	style?: React.CSSProperties;
	children: React.ReactNode;
};

/** Text inside an app screen, in the body typeface of the surrounding theme. */
export const AppText: React.FC<AppTextProps> = ({size = 'body', weight = 500, color, style, children}) => {
	const {typography} = useTheme();
	const colors = useAppColors();
	return (
		<div style={{fontFamily: typography.body, fontSize: typeof size === 'number' ? size : APP_TYPE[size], fontWeight: weight, color: color ?? colors.text, lineHeight: 1.3, letterSpacing: '-0.01em', ...style}}>
			{children}
		</div>
	);
};

/** The small capital label above a card's title ("DENEMELERİM", "ANA AKSİYON"). */
export const AppOverline: React.FC<{color?: string; children: React.ReactNode}> = ({color, children}) => {
	const colors = useAppColors();
	return (
		<AppText size="overline" weight={700} color={color ?? colors.muted} style={{letterSpacing: '0.06em', textTransform: 'uppercase'}}>
			{children}
		</AppText>
	);
};

export const AppCard: React.FC<{padding?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({padding = APP_LAYOUT.cardPadding, style, children}) => {
	const colors = useAppColors();
	return <div style={{boxSizing: 'border-box', padding, borderRadius: APP_LAYOUT.cardRadius, backgroundColor: colors.card, border: `1px solid ${colors.outline}`, ...style}}>{children}</div>;
};

type ChipTone = 'primary' | 'soft' | 'neutral' | 'success';

export const AppChip: React.FC<{tone?: ChipTone; children: React.ReactNode}> = ({tone = 'soft', children}) => {
	const colors = useAppColors();
	const tones: Record<ChipTone, {fill: string; ink: string}> = {
		primary: {fill: colors.primary, ink: colors.onPrimary},
		soft: {fill: colors.primarySoft, ink: colors.onPrimarySoft},
		neutral: {fill: colors.surface, ink: colors.text},
		success: {fill: colors.successSoft, ink: colors.success},
	};
	return (
		<div style={{display: 'inline-flex', alignItems: 'center', padding: '6px 12px', borderRadius: 999, backgroundColor: tones[tone].fill, flexShrink: 0}}>
			<AppText size={12} weight={700} color={tones[tone].ink}>
				{children}
			</AppText>
		</div>
	);
};

export const AppButton: React.FC<{tone?: 'primary' | 'neutral'; grow?: boolean; children: React.ReactNode}> = ({tone = 'primary', grow = false, children}) => {
	const colors = useAppColors();
	const primary = tone === 'primary';
	return (
		<div style={{flex: grow ? 1 : undefined, alignSelf: grow ? undefined : 'flex-start', padding: grow ? '13px 0' : '9px 16px', borderRadius: grow ? 14 : 999, backgroundColor: primary ? colors.primary : colors.surface, textAlign: 'center'}}>
			<AppText size="label" weight={700} color={primary ? colors.onPrimary : colors.text}>
				{children}
			</AppText>
		</div>
	);
};

/** A module icon on its soft orange disc, as on the hub tiles. */
export const AppIconDisc: React.FC<{icon: AppIconName; size?: number}> = ({icon, size = 40}) => {
	const colors = useAppColors();
	return (
		<div style={{width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
			<AppIcon name={icon} size={size * 0.52} color={colors.onPrimarySoft} />
		</div>
	);
};

export const AppProgressBar: React.FC<{share: number; height?: number}> = ({share, height = 6}) => {
	const colors = useAppColors();
	return (
		<div style={{height, borderRadius: height / 2, backgroundColor: colors.surface, overflow: 'hidden', flex: 1}}>
			<div style={{width: `${Math.round(share * 100)}%`, height: '100%', borderRadius: height / 2, backgroundColor: colors.primary}} />
		</div>
	);
};

/** The orange call-to-action card at the top of a module's home. */
export const AppPromoCard: React.FC<{label: string; title: string; description: string; action: string}> = ({label, title, description, action}) => {
	const colors = useAppColors();
	return (
		<div style={{boxSizing: 'border-box', padding: 18, borderRadius: 22, background: `linear-gradient(135deg, #EA580C, ${colors.primaryContainer})`, display: 'flex', flexDirection: 'column', gap: 8}}>
			<AppOverline color="rgba(255, 255, 255, 0.85)">{label}</AppOverline>
			<AppText size="title" weight={800} color="#FFFFFF">
				{title}
			</AppText>
			<AppText size="label" color="rgba(255, 255, 255, 0.92)">
				{description}
			</AppText>
			<div style={{alignSelf: 'flex-start', marginTop: 6, padding: '8px 14px', borderRadius: 999, backgroundColor: '#FFFFFF'}}>
				<AppText size={12.5} weight={700} color="#EA580C">
					{action}
				</AppText>
			</div>
		</div>
	);
};

/** A card with an icon, a title and a line of text, optionally leading somewhere. */
export const AppListRow: React.FC<{icon: AppIconName; title: string; subtitle?: string; trailing?: React.ReactNode}> = ({icon, title, subtitle, trailing}) => {
	const colors = useAppColors();
	return (
		<AppCard padding={13} style={{display: 'flex', alignItems: 'center', gap: 12}}>
			<AppIconDisc icon={icon} />
			<div style={{flex: 1, minWidth: 0}}>
				<AppText size={15} weight={700}>
					{title}
				</AppText>
				{subtitle ? (
					<AppText size="caption" color={colors.muted}>
						{subtitle}
					</AppText>
				) : null}
			</div>
			{trailing ?? <AppIcon name="chevron" size={18} color={colors.muted} />}
		</AppCard>
	);
};

type AppScreenFrameProps = {
	/** Which module the screen belongs to; decides the tab bar. */
	module: AppModuleName;
	title: string;
	/** Index of the highlighted tab. */
	activeTab?: number;
	/** Shown at the right of the title: a timer, a chip. */
	trailing?: React.ReactNode;
	children: React.ReactNode;
};

/** Status bar, title, content and the module's tab bar: the frame every app screen shares. */
export const AppScreenFrame: React.FC<AppScreenFrameProps> = ({module, title, activeTab = 0, trailing, children}) => {
	const colors = useAppColors();
	const lang = useAppLanguage();
	const canvas = useAppCanvas();
	const {tabs} = APP_MODULES[module];
	return (
		<div style={{width: canvas.width, height: canvas.height, display: 'flex', flexDirection: 'column', backgroundColor: colors.background}}>
			<div style={{height: APP_LAYOUT.statusBarHeight, flexShrink: 0}} />
			<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `6px ${APP_LAYOUT.screenPadding}px 14px`, flexShrink: 0}}>
				<AppText size="pageTitle" weight={800}>
					{title}
				</AppText>
				{trailing}
			</div>
			<div style={{flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: APP_LAYOUT.stackGap, padding: `0 ${APP_LAYOUT.screenPadding}px ${tabs ? 0 : 30}px`, overflow: 'hidden'}}>{children}</div>
			{tabs ? (
				<div style={{display: 'flex', justifyContent: 'space-around', padding: `10px 6px ${APP_LAYOUT.tabBarBottomInset}px`, backgroundColor: colors.card, borderTop: `1px solid ${colors.outline}`, flexShrink: 0}}>
					{tabs.map((tab, index) => {
						const active = index === activeTab;
						return (
							<div key={tab.label} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, width: 72}}>
								<AppIcon name={tab.icon} size={22} color={active ? colors.primary : colors.muted} />
								<AppText size={10} weight={active ? 700 : 500} color={active ? colors.primary : colors.muted} style={{whiteSpace: 'nowrap'}}>
									{lang === 'en' ? tab.en : tab.label}
								</AppText>
							</div>
						);
					})}
				</div>
			) : null}
		</div>
	);
};
