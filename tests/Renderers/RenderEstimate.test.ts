import {mkdtempSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {forecastRender, formatDuration, progressBar, readRenderStatuses, readRenderTimes, RenderClock, saveRenderTiming, statusLine, writeRenderStatus, type RenderTiming} from '../../src/Renderers/RenderEstimate';

const fourK = {template: 'CampLesson', width: 3840, height: 2160};
const timing = (frames: number, rendering: number, extra: Partial<RenderTiming> = {}): RenderTiming => ({
	at: '2026-11-10T10:00:00Z',
	name: 'ders',
	...fourK,
	frames,
	stages: {bundling: 20, rendering, encoding: 10, finishing: 60},
	totalSeconds: rendering + 90,
	...extra,
});

describe('render forecast', () => {
	it('starts from the first measurement: a 31-minute 4K lesson in about an hour and a half', () => {
		const forecast = forecastRender([], {...fourK, frames: 56490});
		expect(forecast.basis).toBe('ilk ölçüme göre');
		expect(forecast.totalSeconds).toBeGreaterThan(5200);
		expect(forecast.totalSeconds).toBeLessThan(5500);
		// A 1080p video has a quarter of the pixels: much faster.
		expect(forecastRender([], {...fourK, width: 1920, height: 1080, frames: 56490}).totalSeconds).toBeLessThan(forecast.totalSeconds / 3);
	});

	it('learns the pace from saved renders of the same size and template', () => {
		const history = [timing(10000, 990), timing(20000, 1990), timing(30000, 2990), timing(10000, 9990, {template: 'CampShort'}), timing(10000, 90, {width: 1080, height: 1920})];
		const forecast = forecastRender(history, {...fourK, frames: 40000});
		expect(forecast.basis).toBe("son 3 render'a göre");
		// (990 + 10) / 10000 = 0.1 s a frame to draw; the sound's finishing 60 s over 20,000 frames (the median) a frame;
		// bundling 20 s.
		expect(forecast.secondsPerFrame).toBeCloseTo(0.1, 3);
		expect(forecast.finishSecondsPerFrame).toBeCloseTo(0.003, 4);
		expect(forecast.totalSeconds).toBeCloseTo(20 + 0.103 * 40000, 0);
		// A short preview pays only the bundling and its own frames.
		expect(forecastRender(history, {...fourK, frames: 121}).totalSeconds).toBeLessThan(35);
	});
});

describe('render clock', () => {
	it('moves from the forecast pace to the measured one as frames are drawn', () => {
		let now = 0;
		const clock = new RenderClock(forecastRender([timing(10000, 990)], {...fourK, frames: 10000}), () => now);
		clock.update({stage: 'bundling', progress: 0.5});
		now = 30_000;
		clock.update({stage: 'rendering', progress: 0, renderedFrames: 1, totalFrames: 10000});
		// The render is twice as slow as the forecast: 0.2 s a frame.
		now = 30_000 + 2000 * 200;
		const status = clock.update({stage: 'rendering', progress: 0.2, renderedFrames: 2001, totalFrames: 10000});
		expect(status.fraction).toBeCloseTo(0.194, 2);
		// 7999 frames left at the measured 0.2 s, plus the finishing: about 1650 s, not the forecast's 850.
		expect(status.remainingSeconds).toBeGreaterThan(1550);
		expect(status.remainingSeconds).toBeLessThan(1700);
		expect(Date.parse(status.finishAt ?? '')).toBe(now + Math.round((status.remainingSeconds ?? 0) * 1000));
		now += 60_000;
		clock.update({stage: 'finishing', progress: 0, totalFrames: 10000});
		const stages = clock.stageSeconds();
		expect(Object.keys(stages)).toEqual(['bundling', 'rendering', 'finishing']);
		expect(stages.bundling).toBe(30);
	});

	it('writes one line a person can read', () => {
		const line = statusLine({stage: 'rendering', fraction: 0.42, renderedFrames: 23700, totalFrames: 56490, elapsedSeconds: 2220, remainingSeconds: 3060, finishAt: '2026-11-10T12:40:00Z'});
		expect(line).toContain('[kareler]');
		expect(line).toContain('%42');
		expect(line).toContain('23.700/56.490 kare');
		expect(line).toContain('geçen 37 dk');
		expect(line).toContain('kalan ~51 dk');
		expect(line).toMatch(/bitiş ~\d\d:\d\d/);
	});

	it('formats durations and bars', () => {
		expect(formatDuration(35)).toBe('35 sn');
		expect(formatDuration(250)).toBe('4 dk 10 sn');
		expect(formatDuration(5273)).toBe('1 sa 27 dk');
		expect(progressBar(0.5, 10)).toBe('█████░░░░░');
		expect(progressBar(2, 4)).toBe('████');
	});
});

describe('saved timings and status files', () => {
	it('keeps every finished render and the latest status of each', () => {
		const directory = mkdtempSync(path.join(os.tmpdir(), 'sinavika-render-estimate-'));
		const file = path.join(directory, 'RenderTimes.jsonl');
		saveRenderTiming(timing(100, 10), file);
		saveRenderTiming(timing(200, 20), file);
		expect(readRenderTimes(file).map((saved) => saved.frames)).toEqual([100, 200]);
		const status = {stage: 'rendering' as const, fraction: 0.5, elapsedSeconds: 10, name: 'TYT Matematik / 02', pid: 1, state: 'running' as const, startedAt: 'a', updatedAt: 'b'};
		writeRenderStatus(status, directory);
		writeRenderStatus({...status, fraction: 0.6}, directory);
		expect(readRenderStatuses(directory).map((saved) => saved.fraction)).toEqual([0.6]);
	});
});
