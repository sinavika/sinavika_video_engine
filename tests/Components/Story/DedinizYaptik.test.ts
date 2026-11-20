import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, it, vi} from 'vitest';
import {STORY_SCREENS, storyScreen} from '../../../src/Components/Story/StoryBefore';
import {StoryBeforeAfter} from '../../../src/Components/Story/StoryBeforeAfter';
import {squeezeAt} from '../../../src/Components/Story/StoryCamera';
import {commentShown, cursorOn, StoryComment} from '../../../src/Components/Story/StoryComment';
import {StoryDevice, topAt, wipeAt} from '../../../src/Components/Story/StoryDevice';
import {ExamBooklet, LibraryDesk, NetSlip, slipFall} from '../../../src/Components/Story/StoryDesk';
import {glassIssues, glassTapAt, partRiseAt, pushAt, swipeAt} from '../../../src/Components/Story/StoryGlass';
import {exponentPlace, matchLayout, matchShift, MathMatch, PowerMishap, rootBar, RootMishap} from '../../../src/Components/Story/StoryMath';
import {UI_SCREENS} from '../../../src/UIUX/Registry';
import {StudyDeskStory} from '../../../src/Templates/Advertisements/StudyDeskStory/StudyDeskStory';

vi.mock('remotion', async (original) => ({...(await original<typeof import('remotion')>()), Img: () => null, Audio: () => null, Sequence: ({children}: {children?: React.ReactNode}) => children, useCurrentFrame: () => 0, useVideoConfig: () => ({fps: 30, width: 1080, height: 1920, durationInFrames: 90, id: 'test', defaultProps: {}, props: {}, defaultCodec: null})}));

/**
 * "Dediniz, yaptık" (Sosyal Medya, 20 Nov 2026): the series' parts in the story kit. docs/Social/Hikaye-Kiti.md
 * "Dediniz, yaptık". Frames are still at 0, so a moment "in the past" is given a negative time.
 */

describe('before drawings (StoryBefore)', () => {
	it('lives beside the UI/UX set, never in it', () => {
		for (const screen of STORY_SCREENS) {
			expect(screen.id).toMatch(/^(once|sonra)-[a-z0-9-]+$/);
			expect(UI_SCREENS.some((entry) => entry.id === screen.id)).toBe(false);
			expect(screen.platform).toBe('mobile');
		}
		expect(storyScreen('m-deneme-sonuclar').id).toBe('m-deneme-sonuclar');
		expect(() => storyScreen('once-yok')).toThrow();
	});

	it('draws the results chart without the hatched bar and without "Deneme ekle"', () => {
		const before = renderToStaticMarkup(React.createElement(StoryDevice, {id: 'once-deneme-sonuclar', width: 400}));
		const after = renderToStaticMarkup(React.createElement(StoryDevice, {id: 'm-deneme-sonuclar', width: 400}));
		expect(before).toContain('Son 4 deneme');
		expect(before).not.toContain('Deneme ekle');
		expect(before).not.toContain('69,5');
		expect(after).toContain('69,5');
	});

	it('cuts the slide title after two lines before, and shows it whole after', () => {
		const before = renderToStaticMarkup(React.createElement(StoryDevice, {id: 'once-test-vitrin', width: 400}));
		const after = renderToStaticMarkup(React.createElement(StoryDevice, {id: 'sonra-test-vitrin', width: 400}));
		expect(before).toMatch(/-webkit-line-clamp:\s*2/);
		expect(after).not.toMatch(/line-clamp/);
		expect(after).toContain('Paragrafta anlam, ana düşünce');
	});
});

describe('before and after on one device', () => {
	it('wipes the new screen in from the left behind a line, and only while it runs', () => {
		const screens = [
			{id: 'once-deneme-sonuclar', at: 0},
			{id: 'm-deneme-sonuclar', at: 1, transition: 'wipe' as const},
		];
		expect(wipeAt(screens, 0.5)).toEqual({layers: [{index: 0, edge: null}], edge: null});
		const half = wipeAt(screens, 1.35);
		expect(half.layers.map((layer) => layer.index)).toEqual([0, 1]);
		expect(half.edge!).toBeGreaterThan(0.4);
		expect(half.edge!).toBeLessThan(0.6);
		expect(wipeAt(screens, 2).edge).toBeNull();
	});

	it('opens the next page at its top: the new screen comes down from above, the old one is pushed down', () => {
		const screens = [
			{id: 'm-test-coz-yanlis', at: 0},
			{id: 'm-test-coz', at: 1, transition: 'top' as const},
		];
		const moving = topAt(screens, 1.1);
		expect(moving.map((layer) => layer.index)).toEqual([0, 1]);
		expect(moving[1].y).toBeLessThan(0);
		expect(moving[0].y).toBeGreaterThan(0);
		expect(topAt(screens, 2)).toEqual([{index: 1, y: 0, blur: 0}]);
	});

	it('draws both sides and the "Önce · Sonra" label', () => {
		const html = renderToStaticMarkup(React.createElement(StoryBeforeAfter, {before: {id: 'once-test-vitrin'}, after: {id: 'sonra-test-vitrin'}, at: 1, width: 420}));
		expect(html).toContain('Önce');
		expect(html).toContain('Sonra');
		expect(renderToStaticMarkup(React.createElement(StoryBeforeAfter, {before: {id: 'once-test-vitrin'}, after: {id: 'sonra-test-vitrin'}, at: 1, width: 420, label: false}))).not.toContain('Önce');
	});
});

describe('moments on the glass (StoryGlass)', () => {
	it('opens a push smoothly to its size and keeps it open', () => {
		const push = {kind: 'push' as const, at: 1, y: 0.815, by: 0.24, seconds: 1};
		expect(pushAt(push, 0.5)).toBe(0);
		expect(pushAt(push, 1.5)).toBeCloseTo(0.12);
		expect(pushAt(push, 5)).toBeCloseTo(0.24);
	});

	it('moves the touch mark from its start to its end and hides it when the finger is away', () => {
		const swipe = {kind: 'swipe' as const, at: 1, from: {x: 0.5, y: 0.7}, to: {x: 0.5, y: 0.4}, seconds: 0.5};
		expect(swipeAt(swipe, 0).shown).toBe(0);
		expect(swipeAt(swipe, 1).y).toBeCloseTo(0.7);
		expect(swipeAt(swipe, 1.5).y).toBeCloseTo(0.4);
		expect(swipeAt(swipe, 2).shown).toBe(0);
	});

	it('raises a hidden part from its own bottom into place, and presses a tap with a spreading ring', () => {
		const rise = {kind: 'rise' as const, at: 1, x: 0.755, y: 0.385, width: 0.15, height: 0.11};
		expect(partRiseAt(rise, 0.5)).toBe(0);
		expect(partRiseAt(rise, 1.4)).toBeGreaterThan(1);
		expect(partRiseAt(rise, 3)).toBe(1);
		const tap = {kind: 'tap' as const, at: 1, x: 0.5, y: 0.927};
		expect(glassTapAt(tap, 0.5)).toMatchObject({shown: 0, ring: null});
		expect(glassTapAt(tap, 1.06).press).toBeGreaterThan(0.9);
		expect(glassTapAt(tap, 1.2).ring).toBeGreaterThan(0);
		expect(glassTapAt(tap, 3).shown).toBe(0);
	});

	it('refuses a push whose fill is not above its split', () => {
		expect(glassIssues([{kind: 'push', at: 0, y: 0.815, by: 0.2, fill: [0.766, 0.813]}])).toEqual([]);
		expect(glassIssues([{kind: 'push', at: 0, y: 0.5, by: 0.2, fill: [0.6, 0.7]}])).toHaveLength(1);
		expect(glassIssues([{kind: 'push', at: 0, y: 1.2, by: 0.2}]).length).toBeGreaterThan(0);
	});

	it('draws the drawing in pieces while a push is open, with the push, the swipe and the ring on the glass', () => {
		const html = renderToStaticMarkup(
			React.createElement(StoryDevice, {
				id: 'm-test-coz-yanlis',
				width: 400,
				glass: [
					{kind: 'push', at: -2, y: 0.815, by: 0.24, fill: [0.766, 0.813], inset: 0.15},
					{kind: 'swipe', at: -0.1, from: {x: 0.5, y: 0.7}, to: {x: 0.5, y: 0.4}},
					{kind: 'highlight', at: -1, x: 0.045, y: 0.895, width: 0.91, height: 0.065},
				],
			}),
		);
		// Above the split, the stretched ground, six repeated slices, below the split: nine copies of the drawing.
		expect(html.split('Doğrusu B: 4 gün').length - 1).toBeGreaterThanOrEqual(8);
		expect(html).toContain('scaleY(');
	});
});

describe('the frame squeezes and opens (F1)', () => {
	it('closes with a lock, stays closed, and a release opens past open before it settles', () => {
		const moves = [{kind: 'squeeze', at: 1}];
		expect(squeezeAt(moves, 0.5)).toBe(0);
		expect(squeezeAt(moves, 1.225)).toBeGreaterThan(1);
		expect(squeezeAt(moves, 3)).toBe(1);
		const opened = [...moves, {kind: 'release', at: 4}];
		expect(squeezeAt(opened, 4)).toBe(1);
		expect(squeezeAt(opened, 4.315)).toBeLessThan(0);
		expect(squeezeAt(opened, 5)).toBe(0);
		// A scene that starts squeezed opens with a release at its start.
		expect(squeezeAt([{kind: 'release', at: 0}], 0)).toBe(1);
	});
});

describe('the anonymous comment', () => {
	it('lands word by word, typed letter by letter, or whole', () => {
		const text = 'Netim kâğıtta kayboluyor.';
		expect(commentShown(text, 'words', 1, 0.5)).toBe(0);
		expect(commentShown(text, 'words', 1, 1.12)).toBe(2);
		expect(commentShown(text, 'words', 1, 9)).toBe(3);
		expect(commentShown(text, 'words', 0, 1, [0.2, 0.9, 1.4])).toBe(2);
		expect(commentShown(text, 'type', 0, 0.1)).toBe(3);
		expect(commentShown(text, 'all', 0, 0)).toBe(Infinity);
		expect(cursorOn(0.2, 0)).toBe(true);
		expect(cursorOn(0.8, 0)).toBe(false);
	});

	it('shows no name, avatar or platform furniture; the empty bubble carries only the cursor', () => {
		const html = renderToStaticMarkup(React.createElement(StoryComment, {text: 'Kendi denememi ekleyebilir miyim?', at: -5, keywords: ['Kendi denememi'], label: 'Bize yazdınız'}));
		expect(html).toContain('ekleyebilir');
		expect(html).not.toMatch(/@|<img|Beğen|Yanıtla|Reply|Like/);
		const empty = renderToStaticMarkup(React.createElement(StoryComment, {at: -5}));
		expect(empty).not.toMatch(/<span style="opacity:1[^"]*">[^<]+<\/span>/);
	});
});

describe('mathematics as objects (F4)', () => {
	it('drops the exponent to the line and lifts it back small and high', () => {
		const steps = [
			{state: 'right' as const, at: 0},
			{state: 'dropped' as const, at: 1},
			{state: 'right' as const, at: 3},
		];
		expect(exponentPlace(steps, 0.5)).toMatchObject({y: -0.62, scale: 0.58});
		const fallen = exponentPlace(steps, 2);
		expect(fallen.y).toBeCloseTo(0.06);
		expect(fallen.scale).toBeCloseTo(0.92);
		expect(exponentPlace(steps, 5).y).toBeCloseTo(-0.62);
	});

	it('floats the root bar off the hook when broken and clicks it back when fixed', () => {
		const steps = [
			{state: 'broken' as const, at: 0},
			{state: 'fixed' as const, at: 2},
		];
		expect(rootBar(steps, 1).loose).toBe(true);
		expect(rootBar(steps, 1).y).toBeLessThan(-0.4);
		const fixed = rootBar(steps, 4);
		expect(fixed.loose).toBe(false);
		for (const value of [fixed.x, fixed.y, fixed.rotate]) expect(Math.abs(value)).toBe(0);
	});

	it('draws with the engine formula drawing (KaTeX) and lays the two screens of a match out side by side', () => {
		const power = renderToStaticMarkup(React.createElement(PowerMishap, {steps: [{state: 'dropped', at: 0}]}));
		const root = renderToStaticMarkup(React.createElement(RootMishap, {terms: [{latex: 'x', at: 0}, {latex: '+1', at: -1}], steps: [{state: 'fixed', at: 0}]}));
		expect(power).toContain('katex');
		expect(root).toContain('katex');
		const layout = matchLayout(1000);
		expect(layout.phoneCentre.x).toBeLessThan(layout.meet.x);
		expect(layout.browserCentre.x).toBeGreaterThan(layout.meet.x);
		expect(layout.phone + layout.gap + layout.browser).toBeCloseTo(1000);
		expect(renderToStaticMarkup(React.createElement(MathMatch, {latex: '5^{\\frac{1}{2}}', meet: -2})).length).toBeGreaterThan(500);
		// After the meeting both glasses' centres lie on one point, inside both frames (Sosyal Medya, 20 Nov 2026).
		const met = matchShift(1000, 0, 5);
		const phone = {x: layout.phoneCentre.x + met.phone.x, y: layout.phoneCentre.y + met.phone.y};
		const browser = {x: layout.browserCentre.x + met.browser.x, y: layout.browserCentre.y + met.browser.y};
		expect(phone.x).toBeCloseTo(browser.x);
		expect(phone.y).toBeCloseTo(browser.y);
		expect(matchShift(1000, 2, 1).eased).toBe(0);
	});
});

describe('the study desk objects (D1)', () => {
	it('lets the slip slide to the edge, then fall out of the picture', () => {
		expect(slipFall(1, 2)).toEqual({x: 0, y: 0, rotate: 0});
		const sliding = slipFall(2.2, 2);
		expect(sliding.y).toBe(0);
		expect(sliding.x).toBeGreaterThan(0);
		const gone = slipFall(4, 2, -1);
		expect(gone.y).toBeGreaterThan(1900 - 1);
		expect(gone.x).toBeLessThan(0);
	});

	it('draws the desk, a booklet in its own colour and the slip with the net', () => {
		expect(renderToStaticMarkup(React.createElement(LibraryDesk, {width: 900})).length).toBeGreaterThan(300);
		const booklet = renderToStaticMarkup(React.createElement(ExamBooklet, {at: -1}));
		expect(booklet).toContain('TYT Deneme 3');
		expect(booklet.toUpperCase()).not.toContain('#EA580C');
		expect(renderToStaticMarkup(React.createElement(NetSlip, {net: '68,5', write: -1}))).toContain('68,5');
	});
});

describe('StudyDeskStory takes the series parts in a job file', () => {
	const job = (items: unknown[], moves: unknown[] = []) => ({
		look: 'paper',
		beats: [
			{id: 'a', narration: 'Bize yazdınız.', items: [{kind: 'comment', text: 'Kendi denememi ekleyebilir miyim?', keywords: ['Kendi denememi'], x: 90, y: 300}]},
			{id: 'b', narration: 'Grafikte yalnız bizimkiler vardı.', moves, items},
			{id: 'c', narration: 'O yüzden Deneme ekle’yi yaptık.', items: [{kind: 'desk', x: 40, y: 1180}, {kind: 'booklet', x: 90, y: 1000}, {kind: 'slip', net: '68,5', write: {at: 0.3}, fall: {on: 'yaptık'}, x: 540, y: 1050}]},
			{id: 'd', narration: 'Yoruma yaz.', items: [{kind: 'comment', x: 110, y: 1200}]},
		],
	});

	it('accepts before/after, glass moments, squeeze, mathematics and the desk objects', () => {
		const items = [
			{kind: 'beforeAfter', before: {id: 'once-deneme-sonuclar'}, after: {id: 'm-deneme-sonuclar', glass: [{kind: 'highlight', x: 0.75, y: 0.38, width: 0.155, height: 0.15, on: 'bizimkiler'}]}, on: 'yalnız', x: 290, y: 200},
			{kind: 'device', id: 'm-test-coz-yanlis', width: 460, glass: [{kind: 'push', y: 0.815, by: 0.24, fill: [0.766, 0.813], inset: 0.15}], x: 300, y: 300},
			{kind: 'power', steps: [{state: 'right'}, {state: 'dropped', on: 'Grafikte'}], x: 300, y: 300},
			{kind: 'root', terms: [{latex: 'x'}, {latex: '+1', at: 1}], steps: [{state: 'broken'}, {state: 'fixed', at: 1}], x: 120, y: 1000},
			{kind: 'match', latex: '\\sqrt{x+1}', at: 1, x: 40, y: 260},
			{kind: 'device', id: 'm-test-coz-yanlis', width: 460, x: 300, y: 300, screens: [{id: 'm-test-coz-yanlis', glass: [{kind: 'tap', x: 0.5, y: 0.927, at: 0.5}]}, {id: 'm-test-coz', transition: 'top', at: 1}]},
			{kind: 'device', id: 'm-deneme-sonuclar', width: 460, x: 300, y: 300, glass: [{kind: 'rise', x: 0.755, y: 0.385, width: 0.15, height: 0.11, on: 'yalnız'}]},
		];
		const parsed = StudyDeskStory.contentSchema.safeParse(job(items, [{kind: 'squeeze', at: 0.5}, {kind: 'release', at: 1.5}]));
		expect(parsed.success, parsed.success ? '' : JSON.stringify(parsed.error.issues)).toBe(true);
	});

	it('refuses an unknown screen and a push that does not fit', () => {
		const unknown = StudyDeskStory.contentSchema.safeParse(job([{kind: 'beforeAfter', before: {id: 'once-yok'}, after: {id: 'm-deneme-sonuclar'}, x: 0, y: 0}]));
		expect(unknown.success).toBe(false);
		const misfit = StudyDeskStory.contentSchema.safeParse(job([{kind: 'device', id: 'm-test-coz-yanlis', width: 460, glass: [{kind: 'push', y: 0.5, by: 0.2, fill: [0.6, 0.7]}], x: 0, y: 0}]));
		expect(misfit.success).toBe(false);
	});
});
