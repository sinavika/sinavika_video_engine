import {describe, expect, it} from 'vitest';
import {axisLines} from '../../../../src/Components/Visuals/Structure/Quadrant';

describe('quadrant visual', () => {
	it('breaks a long y-axis end label at the space nearest its middle', () => {
		expect(axisLines('Yavaş')).toEqual(['Yavaş']);
		expect(axisLines('Tartışmaya açık')).toEqual(['Tartışmaya', 'açık']);
		expect(axisLines('Çok uzun bir etiket')).toEqual(['Çok uzun', 'bir etiket']);
		expect(axisLines('Kesinlikarayan')).toEqual(['Kesinlikarayan']);
	});
});
