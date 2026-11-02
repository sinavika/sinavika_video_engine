import {describe, expect, it} from 'vitest';
import {isFrameWarning} from '../../src/Renderers/VideoRenderer';

describe('render warnings', () => {
	it('keeps warnings about the frame and drops a library talking about itself', () => {
		expect(isFrameWarning({type: 'warning', text: '[LayoutGuard] kare 12: "b" kareden taşıyor'})).toBe(true);
		expect(isFrameWarning({type: 'error', text: 'Cannot read properties of undefined'})).toBe(true);
		// three.js flags the clock @react-three/fiber builds, on every 3D scene: not a fault of the video.
		expect(isFrameWarning({type: 'warning', text: 'THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.'})).toBe(false);
		expect(isFrameWarning({type: 'log', text: 'drawn'})).toBe(false);
	});
});
