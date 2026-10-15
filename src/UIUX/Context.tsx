import React, {createContext, useContext} from 'react';
import {MODULES, moduleColor, moduleGradient, moduleTint, type Bilingual, type ModuleKey} from './ModuleIdentity';
import {UI_COLORS, type UIColors, type UILang, type UIMode} from './Tokens';

/** The theme as CSS variables (--ui-bg, --ui-card…), for the few places that set colours in strings. */
export const themeVars = (mode: UIMode): React.CSSProperties => Object.fromEntries(Object.entries(UI_COLORS[mode]).map(([name, value]) => [`--ui-${name}`, value])) as React.CSSProperties;

/** Theme, language and the module a drawing belongs to: everything a part needs to draw itself. */
type UIState = {
	mode: UIMode;
	lang: UILang;
	module?: ModuleKey;
	/** Calm surfaces (the public site): module colours fall back to greys; real app mock-ups switch it off again. */
	calm?: boolean;
};

const UIContext = createContext<UIState>({mode: 'light', lang: 'tr'});

export const UIProvider: React.FC<Partial<UIState> & {children: React.ReactNode}> = ({children, ...value}) => {
	const parent = useContext(UIContext);
	return <UIContext.Provider value={{...parent, ...value}}>{children}</UIContext.Provider>;
};

export const useUI = (): UIState => useContext(UIContext);

export const useColors = (): UIColors => UI_COLORS[useUI().mode];

/** Picks the text of the drawing's language: `t('Denemeler', 'Practice exams')` or `t({tr, en})`. */
export const useT = (): ((tr: string | Bilingual, en?: string) => string) => {
	const {lang} = useUI();
	return (tr, en) => (typeof tr === 'string' ? (lang === 'en' ? (en ?? tr) : tr) : tr[lang]);
};

/** The current module's identity colours in the current theme. */
export const useModuleColors = (key?: ModuleKey) => {
	const {mode, module, calm} = useUI();
	const active = key ?? module ?? 'exam';
	if (calm) {
		const colors = UI_COLORS[mode];
		return {key: active, identity: MODULES[active], color: colors.ink2, gradient: colors.ink, wash: 'transparent', soft: colors.line2, line: colors.line, track: colors.line2};
	}
	return {
		key: active,
		identity: MODULES[active],
		color: moduleColor(active, mode),
		gradient: moduleGradient(active, mode),
		wash: moduleTint(active, 'wash', mode),
		soft: moduleTint(active, 'soft', mode),
		line: moduleTint(active, 'line', mode),
		track: moduleTint(active, 'track', mode),
	};
};
