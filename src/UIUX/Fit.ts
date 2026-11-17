import {useLayoutEffect, type RefObject} from 'react';
import {continueRender, delayRender} from 'remotion';

/**
 * Fitting a screen's content above its bars, as an app shows a list scrolled
 * to the top: what does not fit whole is not drawn (owner, 16 Nov 2026: a
 * half card used to show under the tab bar). The area hides from the end,
 * one piece at a time, until the rest fits:
 *
 * - `data-fit="item"`: a row of a list (List, FitList); rows go one by one, so a
 *   long list keeps the rows that fit instead of disappearing as a block;
 * - `data-fit="block"`: a whole block of the area (a card, a title);
 * - `data-fit-group`: a list; once it has no row left it goes too;
 * - a section title (`data-ui~="heading"`) left last, with nothing under it,
 *   goes too: a title over an empty space reads as a broken screen.
 */
const fitArea = (box: HTMLElement) => {
	const shown = (el: Element) => el.getClientRects().length > 0;
	const hide = (el: Element | null) => {
		if (el instanceof HTMLElement) el.style.display = 'none';
	};
	const rect = box.getBoundingClientRect();
	const scale = box.offsetHeight ? rect.height / box.offsetHeight : 1;
	const limit = rect.bottom - parseFloat(getComputedStyle(box).paddingBottom) * scale + 0.5 * scale;
	const blocks = () => [...box.children].filter(shown);
	const bottom = () => Math.max(-Infinity, ...blocks().map((el) => el.getBoundingClientRect().bottom));
	for (const el of [...box.querySelectorAll('[data-fit]')].reverse()) {
		if (bottom() <= limit) break;
		if (shown(el)) hide(el);
	}
	for (const group of box.querySelectorAll('[data-fit-group]')) {
		if (shown(group) && ![...group.querySelectorAll('[data-fit="item"]')].some(shown)) hide(group.closest('[data-fit="block"]'));
	}
	const last = blocks().at(-1);
	if (last && last.querySelector(':scope > [data-ui~="heading"]') && last.children.length === 1) hide(last);
};

/** Runs `fitArea` on the area once the fonts are in, so text is measured as it is drawn. */
export const useFit = (ref: RefObject<HTMLElement | null>, enabled: boolean) => {
	useLayoutEffect(() => {
		if (!enabled) return;
		const handle = delayRender('uiux-fit');
		let open = true;
		const done = () => {
			if (!open) return;
			open = false;
			continueRender(handle);
		};
		document.fonts.ready.then(() => {
			if (open && ref.current) fitArea(ref.current);
			done();
		});
		return done;
	}, [enabled, ref]);
};
