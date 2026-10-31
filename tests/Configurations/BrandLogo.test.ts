import {readFileSync} from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {brandLogoColor} from '../../src/Components/Overlays/BrandMark';
import {BRAND} from '../../src/Configurations/Brand';
import {BRAND_COLORS} from '../../src/Configurations/BrandColors';
import {ROOT} from '../Support/Paths';

describe('brand logo', () => {
	it('is orange on light backdrops and white on dark or orange ones', () => {
		// The ink is the text colour readable on the backdrop: dark ink means a light backdrop.
		expect(brandLogoColor('#0F172A')).toBe(BRAND_COLORS.brand.primary);
		expect(brandLogoColor('#17123B')).toBe(BRAND_COLORS.brand.primary);
		expect(brandLogoColor('#FFFFFF')).toBe('#FFFFFF');
		expect(brandLogoColor('#F4F4F5')).toBe('#FFFFFF');
	});

	it('keeps the aspect ratio of the logo file', () => {
		const png = readFileSync(path.resolve(ROOT, 'public', BRAND.logo.src));
		const [width, height] = [png.readUInt32BE(16), png.readUInt32BE(20)];
		expect(width / height).toBeCloseTo(BRAND.logo.aspectRatio, 3);
	});
});
