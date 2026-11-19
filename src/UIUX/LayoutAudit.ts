/**
 * Layout audit of a UI/UX drawing, run in the browser on the rendered DOM
 * (owner, 16 Nov 2026: "başka tasarımsal hatalar kalmasın, detaylı testler
 * ile analiz et"). `npm run uiux-audit` renders every screen with
 * `audit: true` and collects what this finds (scripts/AuditUIUX.ts).
 *
 * Parts mark themselves with `data-ui`:
 * - `statusbar`, `tabbar`, `bottombar`: system and app bars; text of the page must not run under them;
 * - `scrim`: a dimmed layer under a sheet or tip, covering the page on purpose;
 * - `scroll-x`, `scroll`: a row or page shown scrolled, cut by the edge on purpose;
 * - `scroll-y`: a page that scrolls down (iPhone Duo's short inner display): cut at the bottom on purpose, never at the sides;
 * - `decor`: decoration (watermarks), not read as text;
 * - `screen`: a phone or tablet canvas; bars and scrims count only inside their own screen, and a screen
 *   drawn smaller inside a page (a preview on the site) may be cropped on purpose;
 * - `disabled`, `placeholder`: dimmed on purpose; their contrast is a warning, not an error;
 * - `heading`: a section title; in a fitted area (`data-fit-area`, see Fit.ts) it must have something under it.
 *
 * Errors are faults to fix; warnings are read by eye (some overlaps are meant).
 */

export type AuditFinding = {level: 'hata' | 'uyarı'; kind: string; text: string; detail: string};

type Rect = {left: number; top: number; right: number; bottom: number};

const intersect = (a: Rect, b: Rect): Rect => ({left: Math.max(a.left, b.left), top: Math.max(a.top, b.top), right: Math.min(a.right, b.right), bottom: Math.min(a.bottom, b.bottom)});
const area = (r: Rect) => Math.max(0, r.right - r.left) * Math.max(0, r.bottom - r.top);
const toRect = (r: DOMRect): Rect => ({left: r.left, top: r.top, right: r.right, bottom: r.bottom});

const parseColor = (value: string): [number, number, number, number] | null => {
	const m = /rgba?\(([^)]+)\)/.exec(value);
	if (!m) return null;
	const parts = m[1]
		.split(/[\s,/]+/)
		.filter(Boolean)
		.map(Number);
	return [parts[0], parts[1], parts[2], parts[3] ?? 1];
};

const luminance = ([r, g, b]: number[]) => {
	const c = [r, g, b].map((v) => {
		const s = v / 255;
		return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};

const contrast = (a: number[], b: number[]) => {
	const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (l1 + 0.05) / (l2 + 0.05);
};

const blend = (top: number[], alpha: number, bottom: number[]) => [0, 1, 2].map((i) => top[i] * alpha + bottom[i] * (1 - alpha));

/** Runs every check on the drawing under `root`. */
export const auditScreen = (root: HTMLElement, lang: 'tr' | 'en' = 'tr'): AuditFinding[] => {
	const findings: AuditFinding[] = [];
	const screen = toRect(root.getBoundingClientRect());
	const marked = (el: Element | null, name: string) => Boolean(el?.closest(`[data-ui~="${name}"]`));
	const allBars = [...root.querySelectorAll<HTMLElement>('[data-ui~="statusbar"], [data-ui~="tabbar"], [data-ui~="bottombar"]')];
	const screenOf = (el: Element) => el.closest('[data-ui~="screen"]');
	/** A screen drawn smaller than the picture: a preview inside a page. */
	const isPreview = (el: Element) => {
		const own = screenOf(el);
		if (!own || !root.contains(own)) return false;
		const r = own.getBoundingClientRect();
		return r.width < screen.right - screen.left - 2 || r.height < screen.bottom - screen.top - 2;
	};
	const scrimIn = (el: Element) => [...root.querySelectorAll('[data-ui~="scrim"]')].some((scrim) => screenOf(scrim) === screenOf(el));
	const hex = (c: number[]) => `#${c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;

	const clipOf = (el: Element): Rect => {
		let clip = screen;
		for (let node: Element | null = el.parentElement; node && node !== root.parentElement; node = node.parentElement) {
			const style = getComputedStyle(node);
			if (style.overflowX !== 'visible' || style.overflowY !== 'visible' || style.clipPath !== 'none') {
				const r = node.getBoundingClientRect();
				clip = intersect(clip, {
					left: style.overflowX === 'visible' ? -1e6 : r.left,
					right: style.overflowX === 'visible' ? 1e6 : r.right,
					top: style.overflowY === 'visible' ? -1e6 : r.top,
					bottom: style.overflowY === 'visible' ? 1e6 : r.bottom,
				});
			}
		}
		return clip;
	};

	const opacityOf = (el: Element) => {
		let value = 1;
		for (let node: Element | null = el; node && node !== root.parentElement; node = node.parentElement) {
			const style = getComputedStyle(node);
			if (style.visibility === 'hidden' || style.display === 'none') return 0;
			value *= Number(style.opacity);
		}
		return value;
	};

	const backgroundOf = (el: Element): number[] | null => {
		const layers: [number[], number][] = [];
		for (let node: Element | null = el; node; node = node.parentElement) {
			const style = getComputedStyle(node);
			if (style.backgroundImage !== 'none') return null;
			const color = parseColor(style.backgroundColor);
			if (color && color[3] > 0) {
				layers.push([color.slice(0, 3), color[3] * Number(style.opacity)]);
				if (color[3] >= 0.99 && Number(style.opacity) >= 0.99) break;
			}
		}
		let result = [255, 255, 255];
		for (const [color, alpha] of layers.reverse()) result = blend(color, alpha, result);
		return result;
	};

	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
	const seen = new Set<Element>();
	for (let node = walker.nextNode(); node; node = walker.nextNode()) {
		const text = (node.textContent ?? '').trim();
		const el = node.parentElement;
		if (!text || !el || seen.has(el) || marked(el, 'decor')) continue;
		seen.add(el);
		const opacity = opacityOf(el);
		if (opacity < 0.05) continue;
		const range = document.createRange();
		range.selectNodeContents(el);
		const rects = [...range.getClientRects()].filter((r) => r.width > 0.5 && r.height > 0.5);
		if (rects.length === 0) continue;
		const box = rects.map(toRect).reduce((a, b) => ({left: Math.min(a.left, b.left), top: Math.min(a.top, b.top), right: Math.max(a.right, b.right), bottom: Math.max(a.bottom, b.bottom)}));
		const clip = clipOf(el);
		const visible = intersect(box, clip);
		const label = text.slice(0, 48);
		const bars = allBars.filter((bar) => screenOf(bar) === screenOf(el));
		const hasScrim = scrimIn(el);
		const inBar = bars.some((bar) => bar.contains(el));
		if (area(visible) < 1) continue;
		const style = getComputedStyle(el);

		// 1. Text cut by a box or by the screen edge.
		if (!marked(el, 'scroll-x') && !marked(el, 'scroll')) {
			// The line box is taller than the letters: allow its leading (a quarter of the size) above and below.
			const lead = Math.max(2, parseFloat(getComputedStyle(el).fontSize) * 0.25);
			const cutX = box.left < clip.left - 2 || box.right > clip.right + 2;
			const cutY = !marked(el, 'scroll-y') && (box.top < clip.top - lead || box.bottom > clip.bottom + lead);
			if (cutX || cutY) findings.push({level: isPreview(el) ? 'uyarı' : 'hata', kind: isPreview(el) ? 'önizlemede kesik' : 'kesik metin', text: label, detail: `${cutY ? 'dikey' : 'yatay'}: metin ${Math.round(box.left)},${Math.round(box.top)}–${Math.round(box.right)},${Math.round(box.bottom)}, görünen alan ${Math.round(clip.left)},${Math.round(clip.top)}–${Math.round(clip.right)},${Math.round(clip.bottom)}`});
		}
		// 1b. Percent as the language writes it: "%45" in Turkish, "45%" in English.
		const whole = (el.textContent ?? '').trim();
		if (lang === 'en' ? /%\d/.test(whole) : /\d%(?![\w’'])/.test(whole)) findings.push({level: 'hata', kind: 'yüzde biçimi', text: whole.slice(0, 48), detail: lang === 'en' ? 'İngilizcede sayı önce gelir: 45%' : 'Türkçede yüzde işareti önce gelir: %45'});
		if (style.textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth + 1) findings.push({level: 'uyarı', kind: 'üç noktayla kısalmış', text: label, detail: `${el.scrollWidth} > ${el.clientWidth}`});

		// 2. Page text under a bar (status bar, tab bar, bottom bar).
		if (!inBar) {
			for (const bar of bars) {
				const overlap = intersect(visible, toRect(bar.getBoundingClientRect()));
				if (area(overlap) > 2 && !(hasScrim && !bar.contains(el))) findings.push({level: isPreview(el) ? 'uyarı' : 'hata', kind: 'çubuğun altında', text: label, detail: `${bar.dataset.ui} ile ${Math.round(overlap.bottom - overlap.top)} px çakışıyor`});
			}
			const tabbar = bars.find((bar) => bar.dataset.ui?.includes('tabbar'));
			if (tabbar && !hasScrim && visible.top >= tabbar.getBoundingClientRect().top - 1) findings.push({level: 'hata', kind: 'çubuğun altında', text: label, detail: 'metin sekme çubuğunun hizasında ya da altında görünüyor'});
		}

		// 3. Text covered by something drawn over it.
		const points = [
			[(visible.left + visible.right) / 2, (visible.top + visible.bottom) / 2],
			[visible.left + 2, (visible.top + visible.bottom) / 2],
			[visible.right - 2, (visible.top + visible.bottom) / 2],
		];
		let covered: Element | null = null;
		for (const [x, y] of points) {
			const top = document.elementFromPoint(x, y);
			if (!top || top === el || el.contains(top) || top.contains(el)) continue;
			if (marked(top, 'scrim') || marked(top, 'decor')) continue;
			// Line drawings (rings, icons) and unpainted layout boxes do not hide text.
			if (top instanceof SVGElement) continue;
			const topStyle = getComputedStyle(top);
			const painted = (parseColor(topStyle.backgroundColor)?.[3] ?? 0) > 0.05 || topStyle.backgroundImage !== 'none';
			if (!painted && !(top.textContent ?? '').trim()) continue;
			covered = top;
			break;
		}
		if (covered && !inBar) {
			const by = covered.closest('[data-ui]') as HTMLElement | null;
			const isBar = by && /statusbar|tabbar|bottombar/.test(by.dataset.ui ?? '');
			if (!isBar) findings.push({level: 'uyarı', kind: 'üst üste', text: label, detail: `üstünde: ${(covered.textContent ?? '').trim().slice(0, 30) || covered.tagName.toLowerCase()}`});
		}

		// 4. Contrast against a solid background (WCAG: 4.5, large text 3).
		// SVG text is painted with `fill`, not `color`.
		const color = parseColor(el instanceof SVGElement ? style.fill : style.color);
		const bg = backgroundOf(el);
		if (color && bg) {
			const fg = blend(color.slice(0, 3), color[3] * opacity, bg);
			const ratio = contrast(fg, bg);
			const size = parseFloat(style.fontSize);
			const large = size >= 24 || (size >= 18.66 && Number(style.fontWeight) >= 700);
			const need = large ? 3 : 4.5;
			const dimmed = marked(el, 'disabled') || marked(el, 'placeholder');
			if (ratio < need) findings.push({level: !dimmed && ratio < (large ? 2.2 : 3) ? 'hata' : 'uyarı', kind: dimmed ? 'soluk (bilinçli)' : 'düşük kontrast', text: label, detail: `${ratio.toFixed(2)} : 1 (en az ${need}), yazı ${hex(fg)} zemin ${hex(bg)}`});
		}
	}

	// 6. Fitted areas: a section title left with nothing under it, or a list cut so early that a large empty space stays.
	for (const fitArea of root.querySelectorAll<HTMLElement>('[data-fit-area]')) {
		const blocks = [...fitArea.children].filter((el) => el.getClientRects().length > 0);
		const last = blocks.at(-1);
		const level = isPreview(fitArea) ? 'uyarı' : 'hata';
		if (last && last.children.length === 1 && last.querySelector(':scope > [data-ui~="heading"]')) findings.push({level, kind: 'boş başlık', text: (last.textContent ?? '').trim().slice(0, 48), detail: 'bölüm başlığının altında öğe yok'});
		const hidden = [...fitArea.querySelectorAll<HTMLElement>('[data-fit]')].filter((el) => el.style.display === 'none').length;
		const rect = fitArea.getBoundingClientRect();
		const scale = fitArea.offsetHeight ? rect.height / fitArea.offsetHeight : 1;
		const limit = rect.bottom - parseFloat(getComputedStyle(fitArea).paddingBottom) * scale;
		const top = rect.top + parseFloat(getComputedStyle(fitArea).paddingTop) * scale;
		const end = last ? last.getBoundingClientRect().bottom : top;
		const empty = (limit - end) / Math.max(1, limit - top);
		if (hidden > 0 && empty > 0.25) findings.push({level: 'uyarı', kind: 'boş alan', text: (last?.textContent ?? '').trim().slice(0, 48), detail: `${hidden} öğe sığmadığı için gizli, alanın %${Math.round(empty * 100)} kadarı boş`});
	}

	// 5. Boxes of the page showing below the floating tab bar (in the gap above the home indicator).
	const tabbar = allBars.find((bar) => bar.dataset.ui?.includes('tabbar') && !isPreview(bar));
	if (tabbar && !scrimIn(tabbar)) {
		const bar = toRect(tabbar.getBoundingClientRect());
		for (const x of [bar.left + 30, (bar.left + bar.right) / 2, bar.right - 30]) {
			for (const y of [bar.bottom + 4, Math.min(screen.bottom - 2, bar.bottom + 14)]) {
				const top = document.elementFromPoint(x, y);
				if (top && !tabbar.contains(top) && !top.contains(tabbar) && root.contains(top)) {
					const style = getComputedStyle(top);
					const painted = (parseColor(style.backgroundColor)?.[3] ?? 0) > 0 || style.borderTopWidth !== '0px' || style.boxShadow !== 'none';
					if (painted && !marked(top, 'decor')) {
						findings.push({level: 'hata', kind: 'çubuğun altında', text: (top.textContent ?? '').trim().slice(0, 48) || 'kutu', detail: `sekme çubuğunun altında sayfa içeriği görünüyor (${Math.round(x)}, ${Math.round(y)})`});
						return dedupe(findings);
					}
				}
			}
		}
	}
	return dedupe(findings);
};

const dedupe = (findings: AuditFinding[]) => {
	const keys = new Set<string>();
	return findings.filter((f) => {
		const key = `${f.kind}|${f.text}`;
		if (keys.has(key)) return false;
		keys.add(key);
		return true;
	});
};
