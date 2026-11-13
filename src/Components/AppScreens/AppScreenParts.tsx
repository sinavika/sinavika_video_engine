import React, {createContext, useContext} from 'react';
import {APP_SCREEN, type AppMode} from './AppScreenTokens';

/**
 * Context of the app screens drawn in videos and pictures: the theme,
 * language and canvas of the phone around them. The screens themselves are
 * the UI/UX drawings (src/UIUX); the hand-drawn parts that used to live here
 * were removed on 14 Nov 2026.
 */
const AppModeContext = createContext<AppMode>('light');

/** Draws the screens inside it in the app's light or dark theme. */
export const AppModeProvider: React.FC<{mode: AppMode; children: React.ReactNode}> = ({mode, children}) => <AppModeContext.Provider value={mode}>{children}</AppModeContext.Provider>;

/** The theme the screens are drawn in (light or dark). */
export const useAppMode = (): AppMode => useContext(AppModeContext);

/** The app's languages (its tr-TR and en-US catalogues). */
const APP_LANGUAGES = ['tr', 'en'] as const;
export type AppLanguage = (typeof APP_LANGUAGES)[number];
const AppLanguageContext = createContext<AppLanguage>('tr');

/** Draws the screens inside it in the app's Turkish or English catalogue. */
export const AppLanguageProvider: React.FC<{lang: AppLanguage; children: React.ReactNode}> = ({lang, children}) => <AppLanguageContext.Provider value={lang}>{children}</AppLanguageContext.Provider>;

export const useAppLanguage = (): AppLanguage => useContext(AppLanguageContext);

/**
 * The canvas a screen is laid out on, in app points. Phones use the app's
 * design size; a tablet passes its own, and the same screens spread to it.
 */
const AppCanvasContext = createContext<{width: number; height: number}>(APP_SCREEN);

export const AppCanvasProvider: React.FC<{width: number; height: number; children: React.ReactNode}> = ({width, height, children}) => (
	<AppCanvasContext.Provider value={{width, height}}>{children}</AppCanvasContext.Provider>
);

export const useAppCanvas = (): {width: number; height: number} => useContext(AppCanvasContext);
