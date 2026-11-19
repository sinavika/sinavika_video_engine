import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, it, vi} from 'vitest';
import {flashOpacity, punchScale, shakeOffset, whipPan} from '../../../src/Components/Story/StoryCamera';
import {landing, netChartLayout, StickyNote} from '../../../src/Components/Story/StoryCard';
import {cursorAt, StoryCursor} from '../../../src/Components/Story/StoryCursor';
import {buzzAt, deviceFor, flipAt, morphAt, riseAt, sequenceDevice, slidesAt, StoryDevice, tapAt} from '../../../src/Components/Story/StoryDevice';
import {HOME_APPS, homeLayout, StoryPhone, thumbAt} from '../../../src/Components/Story/StoryPhone';
import {DEFAULT_STORY_LOOK, lookIssues, lookNameOf, repeatedLooks, STORY_COLORS, STORY_LOOKS, StoryLookFieldSchema, StoryLookProvider, storyTone, type StoryLookName} from '../../../src/Components/Story/StoryLook';
import {StoryGround} from '../../../src/Components/Story/StoryMaterial';
import {blendPoses, blinkAt, poseAt, StoryStudent, STUDENT_POSES} from '../../../src/Components/Story/StoryStudent';
import {StoryWrist} from '../../../src/Components/Story/StoryWrist';
import {SOUND_EFFECTS} from '../../../src/Configurations/SoundEffects';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {subBeats} from '../../../src/Components/Story/StoryTiming';
import {KeyPhrase, keyOf} from '../../../src/Components/Story/StoryType';
import {SINAVIKA_TR_TEMPO} from '../../../src/Configurations/SocialTempo';
import type {VoiceClip} from '../../../src/Scenes/Voiceover';
import {UI_SCREENS} from '../../../src/UIUX/Registry';
import {screenSize} from '../../../src/UIUX/UIUXProps';

// The device drawings are rendered outside a composition: a still frame at 0.
vi.mock('remotion', async (original) => ({...(await original<typeof import('remotion')>()), Img: () => null, Audio: () => null, Sequence: ({children}: {children?: React.ReactNode}) => children, useCurrentFrame: () => 0, useVideoConfig: () => ({fps: 30, width: 1080, height: 1920, durationInFrames: 90, id: 'test', defaultProps: {}, props: {}, defaultCodec: null})}));

const clip = (words: [string, number][], durationSeconds: number): VoiceClip => ({src: 'Voiceovers/x.wav', startSeconds: 0, durationSeconds, playbackRate: 1, words: words.map(([text, startSeconds]) => ({text, startSeconds}))});

describe('story timing: a line cut into sub-beats on the voice', () => {
	it('breaks at a pause once a beat is long enough, and never lets a beat run past the limit', () => {
		const line = clip(
			[
				['Günde', 0],
				['8', 0.3],
				['saat', 0.5],
				['çalışıyorsun,', 0.8],
				['ama', 1.15],
				['netlerin', 1.5],
				['yerinde', 2.0],
				['sayıyor.', 2.35],
			],
			3.0,
		);
		const beats = subBeats(line, '', 1.2);
		expect(beats.map((beat) => beat.text)).toEqual(['Günde 8 saat çalışıyorsun,', 'ama netlerin yerinde', 'sayıyor.']);
		// Each beat starts a moment before its first word is heard.
		expect(beats[1].at).toBeCloseTo(0.3 + 1.15 - 0.08);
		for (let index = 1; index < beats.length; index++) expect(beats[index].at - beats[index - 1].at).toBeLessThanOrEqual(1.2 + 1e-9);
	});

	it('spreads the words over an estimate before the audio exists, and is empty when nothing is known', () => {
		expect(subBeats(undefined, 'bir iki üç dört beş altı', 1, 3).length).toBeGreaterThan(1);
		expect(subBeats(undefined, 'bir iki üç', 1)).toEqual([]);
	});
});

describe('story camera', () => {
	it('punches and flashes with the owner-approved cut (SINAVIKA_TR_TEMPO.cut)', () => {
		const cut = SINAVIKA_TR_TEMPO.cut;
		expect(punchScale(2, 2)).toBeCloseTo(cut.punchFrom);
		expect(punchScale(2 + cut.punchSeconds, 2)).toBeCloseTo(1 + cut.creepPerSecond * cut.punchSeconds);
		expect(punchScale(1, 2)).toBe(1);
		expect(flashOpacity(3, 3)).toBeCloseTo(cut.flash);
		expect(flashOpacity(3 + cut.flashSeconds, 3)).toBeCloseTo(0);
	});

	it('shakes and whips for a moment only, the same way on every render', () => {
		expect(Object.values(shakeOffset(1, 2)).every((value) => value === 0)).toBe(true);
		expect(shakeOffset(2.1, 2)).toEqual(shakeOffset(2.1, 2));
		expect(Math.abs(shakeOffset(2.05, 2).x)).toBeGreaterThan(0);
		expect(Object.values(shakeOffset(2.5, 2)).every((value) => value === 0)).toBe(true);
		expect(whipPan(1, 1, 'out').x).toBeCloseTo(0);
		expect(Math.abs(whipPan(1.22, 1, 'out').x)).toBeGreaterThan(1);
		expect(whipPan(1.22, 1, 'in')).toEqual({x: 0, blur: 0});
	});
});

describe('story cards', () => {
	it('land a little big and tilted, then flat, and are hidden before their moment', () => {
		expect(landing(0.9, 1).opacity).toBe(0);
		expect(landing(1.5, 1, 2)).toEqual({opacity: 1, transform: 'scale(1) rotate(2deg)'});
		expect(STORY_COLORS.redPen).toMatch(/^#/);
	});
});

describe('the drawn student', () => {
	it('blends from one pose into the next in a third of a second', () => {
		const keys = [
			{at: 0, pose: 'slumped' as const},
			{at: 2, pose: 'surprised' as const},
		];
		expect(poseAt(keys, 1)).toEqual(STUDENT_POSES.slumped);
		expect(poseAt(keys, 3)).toEqual(blendPoses(STUDENT_POSES.slumped, STUDENT_POSES.surprised, 1));
		const middle = poseAt(keys, 2.175);
		expect(middle.eyes).toBeGreaterThan(STUDENT_POSES.slumped.eyes);
		expect(middle.eyes).toBeLessThan(STUDENT_POSES.surprised.eyes);
	});

	it('every pose is complete and the student blinks now and then', () => {
		const names = Object.keys(STUDENT_POSES.upright).sort();
		Object.values(STUDENT_POSES).forEach((pose) => expect(Object.keys(pose).sort()).toEqual(names));
		const shut = Array.from({length: 300}, (_, frame) => blinkAt(frame / 30)).filter((value) => value > 0.5).length;
		expect(shut).toBeGreaterThan(0);
		expect(shut).toBeLessThan(20);
	});
});

describe('story devices: the real UI/UX screens, tablet and watch included (15 Nov 2026)', () => {
	const tablet = UI_SCREENS.filter((screen) => screen.platform === 'tablet');
	const watch = UI_SCREENS.filter((screen) => screen.platform === 'watch');

	it('puts every tablet and watch drawing on its own device at its own size', () => {
		expect(tablet.length).toBeGreaterThan(0);
		expect(watch.length).toBeGreaterThan(0);
		tablet.forEach((screen) => expect(deviceFor(screen)).toEqual({kind: 'tablet', screen: screenSize('tablet', undefined, screen.portrait)}));
		watch.forEach((screen) => expect(deviceFor(screen).kind).toBe(screen.round ? 'wearWatch' : 'appleWatch'));
		expect(deviceFor({platform: 'watch', round: true}).screen).toEqual({width: 227, height: 227});
		expect(deviceFor({platform: 'mobile'}).kind).toBe('phone');
		expect(() => deviceFor({platform: 'share'})).toThrow();
	});

	it('draws every tablet and watch drawing on its device without error', () => {
		for (const screen of [...tablet, ...watch]) {
			const markup = renderToStaticMarkup(React.createElement(StoryDevice, {id: screen.id, width: 400}));
			expect(markup.length, screen.id).toBeGreaterThan(500);
		}
	});
});

describe('one device, several screens (Telefonunu bırakma!, 15 Nov 2026)', () => {
	const screens = [
		{id: 'm-plan-bugun', at: 0},
		{id: 'm-ozet-sonuc', at: 2},
		{id: 'm-plan-ilerleme', at: 4},
	];

	it('shows one screen at rest and two while the next slides in from the right', () => {
		expect(slidesAt(screens, 1)).toEqual([{index: 0, x: 0}]);
		const sliding = slidesAt(screens, 2.1);
		expect(sliding.map((slide) => slide.index)).toEqual([0, 1]);
		expect(sliding[1].x).toBeGreaterThan(0);
		expect(sliding[0].x).toBeLessThan(0);
		expect(slidesAt(screens, 3)).toEqual([{index: 1, x: 0}]);
		expect(slidesAt(screens, 9)).toEqual([{index: 2, x: 0}]);
	});

	it('keeps a sequence on one device: a watch page never slides into a phone', () => {
		expect(sequenceDevice(screens).kind).toBe('phone');
		expect(sequenceDevice([{id: 'k-apple-bugun', at: 0}, {id: 'k-apple-plan', at: 1}]).kind).toBe('appleWatch');
		expect(() => sequenceDevice([{id: 'm-plan-bugun', at: 0}, {id: 'k-apple-plan', at: 1}])).toThrow();
		expect(() => sequenceDevice([])).toThrow();
	});

	it('draws a watch and a tablet stepping through their pages', () => {
		expect(renderToStaticMarkup(React.createElement(StoryDevice, {screens: [{id: 'k-apple-bugun', at: 0}, {id: 'k-apple-plan', at: 1}], width: 260})).length).toBeGreaterThan(500);
		const tablets = UI_SCREENS.filter((screen) => screen.platform === 'tablet' && !screen.portrait).slice(0, 2);
		expect(renderToStaticMarkup(React.createElement(StoryDevice, {screens: tablets.map((screen, index) => ({id: screen.id, at: index})), width: 600})).length).toBeGreaterThan(500);
	});
});

describe('the phone in the hand', () => {
	it('lays the home screen out without overlaps, with only plain apps and Sınavika', () => {
		const places = Object.values(homeLayout());
		for (let a = 0; a < places.length; a++)
			for (let b = a + 1; b < places.length; b++) {
				const apart = Math.abs(places[a].x - places[b].x) >= places[a].size || Math.abs(places[a].y - places[b].y) >= places[a].size;
				expect(apart).toBe(true);
			}
		// No other brand's name on the home screen.
		const labels = Object.values(HOME_APPS).map((app) => app.label.toLocaleLowerCase('tr'));
		['instagram', 'tiktok', 'youtube', 'whatsapp', 'twitter', 'facebook'].forEach((brand) => expect(labels.some((label) => label.includes(brand))).toBe(false));
	});

	it('moves the thumb to the feed, lets it hover and pull back, then taps Sınavika', () => {
		const touches = [
			{at: 1, app: 'akis' as const, kind: 'hover' as const},
			{at: 2.5, app: 'sinavika' as const, kind: 'tap' as const},
		];
		const layout = homeLayout();
		const feed = {x: layout.akis.x + 32, y: layout.akis.y + 32};
		expect(thumbAt(touches, 0.5).shown).toBe(0);
		expect(thumbAt(touches, 1)).toMatchObject({x: feed.x, y: feed.y, press: 0, shown: 1});
		// Still over the feed but pulled back before it moves on.
		expect(thumbAt(touches, 1.9).y).toBeGreaterThan(feed.y + 20);
		const tap = thumbAt(touches, 2.58);
		expect(tap.x).toBeCloseTo(layout.sinavika.x + 32);
		expect(tap.press).toBeGreaterThan(0.5);
		expect(thumbAt(touches, 3).shown).toBe(0);
	});

	it('draws the phone opening Sınavika onto its screens', () => {
		// Before the tap: the home screen with its plain app names.
		const home = renderToStaticMarkup(React.createElement(StoryPhone, {width: 400, touches: [{at: 2, app: 'sinavika', kind: 'tap'}], screens: [{id: 'm-plan-bugun', at: 2}]}));
		expect(home).toContain('Akış');
		// A second after the tap (the frame is 0): the app has grown over the glass and shows its first screen.
		const opened = renderToStaticMarkup(React.createElement(StoryPhone, {width: 400, touches: [{at: -1, app: 'sinavika', kind: 'tap'}], screens: [{id: 'm-plan-bugun', at: -1}]}));
		expect(opened.length).toBeGreaterThan(home.length);
		expect(() => renderToStaticMarkup(React.createElement(StoryPhone, {width: 400, touches: [], screens: [{id: 'k-apple-plan', at: 0}]}))).toThrow();
	});
});

describe('key phrase keywords', () => {
	it('match words whatever their punctuation, and symbols on their own (Sosyal Medya, 15 Nov 2026)', () => {
		expect(keyOf('bırakma!')).toBe(keyOf('Bırakma'));
		expect(keyOf('Yok.')).toBe('yok');
		expect(keyOf('≠')).toBe('≠');
		expect(keyOf('%')).toBe('%');
	});

	it('start a story line where its own lead puts the voice', () => {
		const line = clip([['Bırak', 0], ['telefonu.', 0.4]], 1);
		// The voice starts 0.1 s into the slot; the beat lands a moment (0.08 s) before the first word.
		expect(subBeats(line, '', 1.2, undefined, 0.1)[0].at).toBeCloseTo(0.02);
	});
});

describe('net chart layout', () => {
	it('keeps every value clear of the title and every point above the labels (Sosyal Medya, 16 Nov 2026)', () => {
		const curves = [
			[100, 62, 46, 38, 34],
			[100, 70, 95, 85, 98],
			[52, 54, 51, 53, 52],
			[10, 40, 100, 30, 20],
			[20, 30, 40, 60, 100],
		];
		for (const width of [560, 760, 900]) {
			for (const values of curves) {
				const layout = netChartLayout(values, width);
				layout.valueY.forEach((y, index) => expect(y - layout.valueSize * 0.85, `${values} #${index} at ${width}`).toBeGreaterThanOrEqual(layout.titleBottom + 4));
				layout.points.forEach(([, y]) => expect(y + 11).toBeLessThan(layout.height - 34 - 28));
			}
		}
	});
});

describe('story looks: one per video, every one readable', () => {
	it.each(Object.keys(STORY_LOOKS) as StoryLookName[])('%s keeps its type, cards, chip and logo readable within its palette', (name) => {
		expect(lookIssues(STORY_LOOKS[name])).toEqual([]);
		expect(STORY_LOOKS[name].palette.length).toBeLessThanOrEqual(3);
	});

	it('a job without a look is warm grey, never navy; navy only when named', () => {
		expect(DEFAULT_STORY_LOOK).not.toBe('navy');
		expect(StoryLookFieldSchema.parse(undefined).preset).toBe('warmGrey');
		expect(StoryLookFieldSchema.parse('navy').ground.colors).toEqual(['#0E1A30', '#172A4A']);
	});

	it('a changed look keeps the rest of its preset and is refused when it would not read', () => {
		expect(StoryLookFieldSchema.parse({preset: 'warmGrey', accent: '#B45309', palette: ['#B45309'], cardAccent: '#B45309'}).paper).toBe('#FFFFFF');
		// White type on the light grey ground.
		expect(StoryLookFieldSchema.safeParse({preset: 'warmGrey', ink: '#FFFFFF'}).success).toBe(false);
		// A sticky note in a fourth colour family.
		const issues = lookIssues({...STORY_LOOKS.navy, sticky: '#BBF7D0'});
		expect(issues.some((issue) => issue.includes('yapışkan not'))).toBe(true);
		expect(StoryLookFieldSchema.safeParse({preset: 'navy', palette: ['#0E1A30', '#F97316', '#FDE68A', '#16A34A']}).success).toBe(false);
	});

	it('the tone follows the ground: light for warm grey and paper, dark for ink, navy and bold colour', () => {
		expect([storyTone(STORY_LOOKS.warmGrey), storyTone(STORY_LOOKS.paper)]).toEqual(['light', 'light']);
		expect([storyTone(STORY_LOOKS.ink), storyTone(STORY_LOOKS.navy), storyTone(STORY_LOOKS.boldColour)]).toEqual(['dark', 'dark', 'dark']);
	});

	it('two videos in a row with the same look are reported, by their names', () => {
		const series = [
			{name: '08', look: 'paper' as const},
			{name: '09', look: 'paper' as const},
			{name: '10', look: 'ink' as const},
		];
		expect(repeatedLooks(series)).toEqual([expect.stringContaining('08 ve 09')]);
		expect(lookNameOf({content: {look: {preset: 'boldColour', typeScale: 1.3}}})).toBe('boldColour');
		expect(lookNameOf({content: {}})).toBe(DEFAULT_STORY_LOOK);
	});
});

describe('UI states: the cursor and the spring morph', () => {
	it('the cursor glides to each click, presses on its moment and spreads a ring', () => {
		const clicks = [
			{x: 100, y: 0, at: 1},
			{x: 100, y: 200, at: 2},
		];
		expect(cursorAt(clicks, 0.5)).toMatchObject({x: 0, y: 0, press: 0, ripple: null});
		expect(cursorAt(clicks, 1)).toMatchObject({x: 100, y: 0, ripple: 0});
		expect(cursorAt(clicks, 1.06).press).toBeGreaterThan(0.9);
		expect(cursorAt(clicks, 1.5)).toMatchObject({x: 100, y: 0, press: 0, ripple: null});
		expect(cursorAt(clicks, 2.5)).toMatchObject({x: 100, y: 200});
	});

	it('the morph grows the new screen on a spring over the old one, then leaves it alone', () => {
		const screens = [
			{id: 't-deneme-coz-isaretleme', at: 0},
			{id: 't-plan-bugun', at: 1},
		];
		expect(morphAt(screens, 0.5, 30)).toEqual([{index: 0, scale: 1, opacity: 1}]);
		const mid = morphAt(screens, 1.1, 30);
		expect(mid.map((layer) => layer.index)).toEqual([0, 1]);
		expect(mid[1].scale).toBeGreaterThan(0.92);
		expect(mid[1].scale).toBeLessThan(1.02);
		expect(morphAt(screens, 1.7, 30)).toEqual([{index: 1, scale: 1, opacity: 1}]);
	});

	it('every ready look draws the cards, the type, the device morph and the cursor without error', () => {
		for (const name of Object.keys(STORY_LOOKS) as StoryLookName[]) {
			const html = renderToStaticMarkup(
				React.createElement(
					StoryLookProvider,
					{look: STORY_LOOKS[name]},
					React.createElement(StoryGround),
					React.createElement(KeyPhrase, {text: 'Ne kadar değil, nasıl.', keywords: ['nasıl']}),
					React.createElement(StickyNote, {text: 'Aynı hata'}),
					React.createElement(StoryDevice, {screens: [{id: 't-deneme-coz-isaretleme', at: 0}, {id: 't-plan-bugun', at: 0}], width: 600, transition: 'morph'}),
					React.createElement(StoryCursor, {clicks: [{x: 10, y: 10, at: 0}]}),
				),
			);
			expect(html).toContain(STORY_LOOKS[name].ground.colors[0]);
			expect(html).toContain(STORY_LOOKS[name].sticky);
		}
	});
});

describe('the watch (Sosyal Medya, 19 Nov 2026: the December watch reels)', () => {
	const card = [
		{id: 'k-apple-kart', at: 0},
		{id: 'k-apple-kart-cevap', at: 1, transition: 'flip' as const},
	];

	it('a notification rises from the bottom edge over the old screen, which steps back', () => {
		const screens = [
			{id: 'k-apple-kadran', at: 0},
			{id: 'k-apple-bildirim', at: 1, transition: 'rise' as const},
		];
		expect(riseAt(screens, 0.5)).toEqual([{index: 0, y: 0, scale: 1, opacity: 1}]);
		const mid = riseAt(screens, 1.15);
		expect(mid.map((layer) => layer.index)).toEqual([0, 1]);
		expect(mid[1].y).toBeGreaterThan(0);
		expect(mid[1].y).toBeLessThan(1);
		expect(mid[0].scale).toBeLessThan(1);
		expect(riseAt(screens, 2)).toEqual([{index: 1, y: 0, scale: 1, opacity: 1}]);
	});

	it('a card turns over: the question edge-on, then the answer from the other edge, one face at a time', () => {
		expect(flipAt(card, 0.9)).toEqual([{index: 0, angle: 0}]);
		const first = flipAt(card, 1.1);
		expect(first).toHaveLength(1);
		expect(first[0].index).toBe(0);
		expect(first[0].angle).toBeGreaterThan(0);
		expect(first[0].angle).toBeLessThan(90);
		const second = flipAt(card, 1.4);
		expect(second[0].index).toBe(1);
		expect(second[0].angle).toBeLessThan(0);
		expect(second[0].angle).toBeGreaterThan(-90);
		expect(flipAt(card, 2)).toEqual([{index: 1, angle: 0}]);
	});

	it('a buzz shakes the case and fades, its wave spreads a little longer', () => {
		const buzzes = [{at: 1}];
		expect(buzzAt(buzzes, 0.9)).toEqual({shake: 0, ring: null});
		expect(Math.abs(buzzAt(buzzes, 1.01).shake)).toBeGreaterThan(0.1);
		expect(buzzAt(buzzes, 1.3).ring).toBeCloseTo(0.5);
		expect(buzzAt(buzzes, 1.5)).toMatchObject({shake: 0});
		expect(buzzAt(buzzes, 1.7)).toEqual({shake: 0, ring: null});
	});

	it('the fingertip comes in before its tap, presses on it and lifts away', () => {
		const taps = [{x: 0.75, y: 0.76, at: 2}];
		expect(tapAt(taps, 1.5)).toBeNull();
		expect(tapAt(taps, 1.9)?.near).toBeGreaterThan(0);
		expect(tapAt(taps, 1.9)?.ripple).toBeNull();
		expect(tapAt(taps, 2.06)?.press).toBeGreaterThan(0.9);
		expect(tapAt(taps, 2.06)?.near).toBe(1);
		expect(tapAt(taps, 2.3)?.press).toBe(0);
		expect(tapAt(taps, 2.5)).toBeNull();
	});

	it('the student raises the watch wrist and taps it with the other hand; the glass lights only then', () => {
		for (const name of ['wrist', 'wristTap'] as const) expect(STUDENT_POSES[name].watchLit).toBe(1);
		for (const name of ['slumped', 'upright', 'surprised', 'happy', 'phone'] as const) expect(STUDENT_POSES[name].watchLit).toBe(0);
		expect(STUDENT_POSES.wristTap.rightArm).toEqual(STUDENT_POSES.wrist.rightArm);
		expect(STUDENT_POSES.wristTap.leftArm).not.toEqual(STUDENT_POSES.wrist.leftArm);
		const html = renderToStaticMarkup(React.createElement(StoryStudent, {keys: [{at: 0, pose: 'wristTap'}], watch: 'wear', watchColor: '#C2410C'}));
		expect(html).toContain('#C2410C');
		expect(renderToStaticMarkup(React.createElement(StoryStudent, {keys: [{at: 0, pose: 'wrist'}]}))).not.toContain('#0B0F17');
	});

	it('the wrist close-up draws both watches by one API, and only watches', () => {
		const apple = renderToStaticMarkup(React.createElement(StoryWrist, {screens: [{id: 'k-apple-kadran', at: 0}, {id: 'k-apple-bildirim', at: 0, transition: 'rise'}], width: 300, buzzes: [{at: 0}], taps: [{x: 0.5, y: 0.5, at: 0}]}));
		const wear = renderToStaticMarkup(React.createElement(StoryWrist, {id: 'k-wear-kadran', width: 300}));
		expect(apple).toContain('story-wrist-skin');
		expect(wear).toContain('border-radius:50%');
		expect(() => renderToStaticMarkup(React.createElement(StoryWrist, {id: 'm-plan-bugun', width: 300}))).toThrow();
		expect(() => renderToStaticMarkup(React.createElement(StoryDevice, {id: 'm-plan-bugun', width: 300, buzzes: [{at: 0}]}))).toThrow();
		expect(renderToStaticMarkup(React.createElement(StoryDevice, {screens: card, width: 300, taps: [{x: 0.75, y: 0.76, at: 0}]}))).toContain('rotate(-24deg)');
	});

	it('the haptic buzz is a kept sound effect', () => {
		expect(existsSync(path.join(process.cwd(), 'public', SOUND_EFFECTS.hapticBuzz.file))).toBe(true);
	});
});

