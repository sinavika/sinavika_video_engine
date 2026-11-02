import {describe, expect, it} from 'vitest';
import {COMPACT_HEIGHT, frame3DBands} from '../../../../src/Components/Visuals/Three/Frame3D';

describe('3D frame', () => {
	it('drops the stage strip and caption in a small box, such as a question figure', () => {
		const u = (value: number) => value * 2;
		expect(frame3DBands(u, u(COMPACT_HEIGHT) - 1)).toEqual({strip: 0, captionHeight: 0});
		const full = frame3DBands(u, u(700));
		expect(full.strip).toBeGreaterThan(0);
		expect(full.captionHeight).toBeGreaterThan(0);
	});
});
