import React, {createContext, useContext, useMemo} from 'react';
import {SinavikaBrand} from './SinavikaBrand';
import type {Theme} from './Theme';

const ThemeContext = createContext<Theme>(SinavikaBrand);

export const ThemeProvider: React.FC<{theme: Theme; children: React.ReactNode}> = ({
	theme,
	children,
}) => <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;

export const useTheme = (): Theme => useContext(ThemeContext);

/**
 * Ink is the set of text colours that are readable on the current backdrop.
 * Cards and coloured panels provide their own ink, so text placed inside them
 * picks the right colour without knowing where it sits.
 */
export type Ink = {text: string; muted: string; emphasis: string};

const InkContext = createContext<Ink | null>(null);

export const InkProvider: React.FC<{ink: Ink; children: React.ReactNode}> = ({ink, children}) => (
	<InkContext.Provider value={ink}>{children}</InkContext.Provider>
);

export const useInk = (): Ink => {
	const theme = useTheme();
	const ink = useContext(InkContext);
	return useMemo(
		() =>
			ink ?? {
				text: theme.colors.text,
				muted: theme.colors.textMuted,
				emphasis: theme.colors.canvasAccent,
			},
		[ink, theme],
	);
};
