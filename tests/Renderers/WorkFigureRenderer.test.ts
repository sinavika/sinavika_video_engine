import {describe, expect, it} from 'vitest';
import {checkSvg, compactPathData, compactSvg, frameSvg, layoutFinding, raisedCount, simplifyPolylines, smallTextSize, spoilsStill, stillCrop, stillSize, stillTextSizes} from '../../src/Renderers/WorkFigureRenderer';

const PAGE = {width: 1920, height: 1080};

describe('Works figure stills', () => {
	it('keeps the figure box across and what is drawn up and down, with room, and never flatter than 1:8', () => {
		const crop = stillCrop([[100, 200, 900, 500], [60, 180, 400, 260]], PAGE, 1000);
		expect(crop).toEqual({x: 20, y: 160, width: 1040, height: 360});
		// A single formula line: the still grows to an eighth of its width.
		const thin = stillCrop([[300, 500, 700, 530]], PAGE, 1000);
		expect(thin.height).toBeCloseTo(1040 / 8, 6);
		expect(thin.y + thin.height / 2).toBeCloseTo(515, 6);
		expect(stillSize(crop)).toEqual({width: 1280, height: 443});
	});

	it('keeps a label that runs past the box whole, but never leaves the page', () => {
		// A timeline's first label starts left of the box ("Devlet resmen kuruldu" lost its D).
		const crop = stillCrop([[10, 200, 900, 500]], PAGE, 860);
		expect(crop.x).toBe(0);
		expect(crop.x + crop.width).toBe(920);
		expect(stillCrop([[300, 200, 1950, 500]], PAGE, 860).width).toBe(1920 - 20);
	});

	it('frames an SVG on its crop: viewBox in its own units, width and height in pixels', () => {
		const svg = '<svg width="1440pt" height="810pt" viewBox="0 0 1440 810" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H10V10Z"/></svg>';
		const framed = frameSvg(svg, {x: 20, y: 160, width: 1040, height: 360}, 0.75);
		expect(framed.startsWith('<svg width="1280" height="443" viewBox="15 120 780 270"')).toBe(true);
		expect(framed.match(/viewBox=/g)).toHaveLength(1);
		expect(framed).toContain('<path d="M0 0H10V10Z"/>');
	});

	it('writes path numbers only as exactly as a tenth of a pixel needs, by how far their transforms stretch them', () => {
		const svg = [
			'<svg viewBox="0 0 780 400"><defs><g id="font_1_5"><path d="M.51234 .70011L.123456-.0049Z"/></g></defs>',
			'<path transform="matrix(.24,0,0,.24,0,0)" d="M125.000001 2003.12345C124.99999 195.07543 125.480358 190.19815 126.441089 185.36821"/>',
			'<use data-text="a" xlink:href="#font_1_5" transform="matrix(19.5,0,0,-19.5,81.914063,929.25)"/>',
			'<path transform="matrix(.0005,0,0,-.0005,10,10)" d="M123456.789 98765.4321"/>',
			'</svg>',
		].join('');
		const pixelsPerUnit = 1280 / 780;
		const compact = compactSvg(svg, pixelsPerUnit);
		// Page paths in quarter points keep one decimal; glyph shapes in em units, scaled 19.5 up, keep three.
		expect(compact).toContain('d="M125 2003.1C125 195.1 125.5 190.2 126.4 185.4"');
		expect(compact).toContain('d="M.512 .7 .123-.005Z"');
		// Translations keep two decimals at the root; a path scaled far down keeps whole numbers.
		expect(compact).toContain('transform="matrix(19.5,0,0,-19.5,81.91,929.25)"');
		expect(compact).toContain('d="M123457 98765"');
		expect(compact.length).toBeLessThan(svg.length);
	});

	it('keeps every rounded number apart, also where only a minus sign or a second point parted them', () => {
		// A bold D's inner outline: "-.3333" rounds to 0 and its minus no longer separates it ("6290").
		expect(compactPathData('M629.1667-.3333 604.3333 0', 0)).toBe('M629 0 604 0');
		expect(compactPathData('M.7.3L1-.6', 0)).toBe('M1 0L1-1');
		expect(compactPathData('M 10.25 , 20.75 Z', 1)).toBe('M10.3 20.8Z');
	});

	it('leaves out the points of a border that change nothing at a quarter pixel, and keeps curves as they are', () => {
		expect(simplifyPolylines('M0 0L5 .1 10 0V10H0Z', 0.5)).toBe('M0 0 10 0 10 10 0 10Z');
		// Every bend larger than the tolerance stays.
		expect(simplifyPolylines('M0 0L5 2 10 0', 0.5)).toBe('M0 0 5 2 10 0');
		expect(simplifyPolylines('M0 0C1 1 2 2 3 3', 0.5)).toBe('M0 0C1 1 2 2 3 3');
		// A tiny island stays a ring.
		expect(simplifyPolylines('M0 0L.1 0 .1 .1 0 .1Z', 5).match(/ /g)?.length).toBeGreaterThanOrEqual(5);
	});

	it('measures the text of a still by the em of its glyphs, spaces left out', () => {
		const svg = '<svg><use data-text="a" xlink:href="#font_1_5" transform="matrix(19.5,0,0,-19.5,0,0)"/><use data-text=" " xlink:href="#font_1_3" transform="matrix(2,0,0,-2,0,0)"/><use data-text="b" xlink:href="#font_1_6" transform="matrix(0,-12,12,0,0,0)"/><use xlink:href="#clip_1"/></svg>';
		const sizes = stillTextSizes(svg, 2);
		// A turned label (an axis title) counts by its size, not by its direction.
		expect(sizes).toEqual([24, 39]);
		expect(smallTextSize(sizes)).toBe(24);
		expect(smallTextSize([])).toBeUndefined();
	});

	it('refuses scripts, foreignObject, event handlers, media, animation, DTDs and anything fetched from elsewhere', () => {
		expect(checkSvg('<svg><defs><clipPath id="a"/></defs><use xlink:href="#a"/><image href="data:image/png;base64,AAA"/></svg>')).toEqual([]);
		expect(checkSvg('<svg><script>alert(1)</script></svg>')).toContain('script');
		expect(checkSvg('<svg><foreignObject><div/></foreignObject></svg>')).toContain('foreignObject');
		expect(checkSvg('<svg><rect onload="x()"/></svg>')).toContain('event handler');
		expect(checkSvg('<svg><image href="https://example.com/a.png"/></svg>').join()).toContain('external link');
		expect(checkSvg('<svg><style>@import url(https://x.test/a.css);</style></svg>')).toContain('external style');
		expect(checkSvg('<svg><rect><animate attributeName="x"/></rect></svg>')).toContain('animate');
		expect(checkSvg('<!DOCTYPE svg [<!ENTITY a "b">]><svg/>')).toContain('DTD');
	});

	it('fails a figure whose font or picture did not load, not one with a library notice', () => {
		expect(spoilsStill('Failed to load resource: net::ERR_CONNECTION_RESET')).toBe(true);
		expect(spoilsStill('THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.')).toBe(false);
	});
});

describe('what a still reports about its text', () => {
	it('reads the layout guard’s findings and how much text the last guard raised', () => {
		expect(layoutFinding('[LayoutGuard] kare 1199: "Sobieski" ile "Yeniçeri" üst üste')).toBe('"Sobieski" ile "Yeniçeri" üst üste');
		expect(layoutFinding('Failed to load resource')).toBeUndefined();
		expect(raisedCount('[TextFloor] 3: Magma 14→20 | Tortul 14→20 | Başkalaşım 14→20')).toBe(3);
		expect(raisedCount('[LayoutGuard] kare 1: x')).toBeUndefined();
	});
});
