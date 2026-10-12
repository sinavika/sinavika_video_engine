import React, {useEffect, useState} from 'react';
import {AbsoluteFill, cancelRender, continueRender, delayRender} from 'remotion';
import {loadFontFaces} from '../../Themes/FontFaces';
import type {Theme} from '../../Themes/Theme';
import {ThemeProvider} from '../../Themes/ThemeContext';
import {getTheme, type ThemeId} from '../../Themes/ThemeRegistry';
import {ThemeBackground} from './ThemeBackground';

const useFontFaces = (): boolean => {
	const [ready, setReady] = useState(false);
	const [handle] = useState(() => delayRender('Loading font faces'));

	useEffect(() => {
		loadFontFaces()
			.then(() => setReady(true))
			.catch((error) => cancelRender(error));
	}, []);

	// Release the frame only after the content has been committed with the fonts
	// in place. Releasing it together with `setReady` would let Remotion capture
	// the frame before React has drawn anything.
	useEffect(() => {
		if (ready) continueRender(handle);
	}, [ready, handle]);

	return ready;
};

/**
 * Root of every video: applies the theme, paints the background and holds
 * rendering until fonts are ready so text is measured with its final metrics.
 */
type VideoFrameProps = {
	themeId: ThemeId;
	/** A ready-made theme, e.g. one built from a colour palette. Takes precedence over `themeId`. */
	theme?: Theme;
	children: React.ReactNode;
};

export const VideoFrame: React.FC<VideoFrameProps> = ({themeId, theme: customTheme, children}) => {
	const theme = customTheme ?? getTheme(themeId);
	const fontsReady = useFontFaces();

	return (
		<ThemeProvider theme={theme}>
			<AbsoluteFill
				// Turkish casing rules: uppercase "i" must become "İ", not "I".
				lang="tr"
				style={{
					backgroundColor: theme.colors.background,
					color: theme.colors.text,
					fontFamily: theme.typography.body,
					fontWeight: theme.typography.bodyWeight,
					// Makes Chrome use greyscale instead of subpixel (LCD) text antialiasing,
					// which would bake coloured fringes into the video and differ per OS.
					willChange: 'transform',
				}}
			>
				<ThemeBackground />
				{fontsReady ? children : null}
			</AbsoluteFill>
		</ThemeProvider>
	);
};
