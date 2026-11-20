import {readdirSync, readFileSync, statSync} from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';

/**
 * No corner logo in any reel (owner, 20 Nov 2026, after the "Dediniz, yaptık" D1 pilot: "sağ alttaki logo gereksiz
 * kaldıralım onu hiçbir reels de olmasın bundan sonra"). The brand shows on the closing card (logo and store badges)
 * and in the scenes where the logo is the content itself (a reveal, the ring round it). A logo pinned to a corner of
 * the frame, as a watermark over the scenes, is not allowed.
 *
 * Exempt: the special days, whose only brand is their logo-only closing (bayram, 10 Kasım, 24 Kasım: no call, no
 * card; SpecialDays.ts). Their closing logo is the reel's ending, not a watermark.
 */
const ROOT = path.resolve(__dirname, '../../../src/Templates/Advertisements');
const SPECIAL_DAYS = ['AtaturkMemorial', 'Basogretmen'];

const files = (dir: string): string[] => readdirSync(dir).flatMap((name) => {
	const full = path.join(dir, name);
	return statSync(full).isDirectory() ? files(full) : /\.tsx?$/.test(name) ? [full] : [];
});

/**
 * A corner logo is the small mark (chrome size, or no size) pinned to an edge: the few lines before it place it
 * absolutely at an edge, or a `Corner` part holds it. The closing card's large logo (`card`, `hero`) is the ending.
 */
const cornerLogos = (source: string): number[] => {
	const lines = source.split('\n');
	return lines.flatMap((line, index) => {
		if (!/<BrandMark\b/.test(line) || /size="(card|hero|cover)"/.test(line)) return [];
		const before = lines.slice(Math.max(0, index - 4), index).join('\n');
		const pinned = /position:\s*'absolute'[^\n]*\b(right|left|top|bottom)\s*:/.test(before) || /<At x=\{[^}]*\}\s+y=\{[^}]*\}/.test(before) || /const Corner\b/.test(before) || /<Place x=\{CANVAS/.test(before);
		return pinned ? [index + 1] : [];
	});
};

describe('reels carry no corner logo', () => {
	it('finds the pattern it guards against', () => {
		expect(cornerLogos(`<div style={{position: 'absolute', right: u(40), bottom: u(60)}}>\n<BrandMark size="chrome" />`)).toEqual([2]);
		expect(cornerLogos(`<Center>\n<BrandMark size="card" />`)).toEqual([]);
		expect(cornerLogos(`<div style={{position: 'absolute', bottom: u(170)}}>\n<BrandMark size="card" />`)).toEqual([]);
	});

	it('has none in any Advertisements template but the special days\u2019 closing', () => {
		const found = files(ROOT)
			.filter((file) => !SPECIAL_DAYS.some((name) => file.includes(`${path.sep}${name}${path.sep}`)))
			.flatMap((file) => cornerLogos(readFileSync(file, 'utf8')).map((line) => `${path.relative(ROOT, file)}:${line}`));
		expect(found).toEqual([]);
	});
});
