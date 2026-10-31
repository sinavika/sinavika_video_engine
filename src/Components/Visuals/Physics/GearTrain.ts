/** The gap between two wheels joined by a belt, in units. */
const BELT_GAP = 1.6;

/**
 * Where each wheel sits and how far it turns while the first one (the driver) turns once: meshing gears turn the
 * other way at r₁/r₂ the speed, an open belt the same way, a crossed belt the other way, and wheels riveted on one
 * axle turn together. Turns are signed: positive is clockwise on screen. Each wheel is placed from the one before it,
 * at `angle` degrees (0 to the right, 90 down). A wheel riveted on an axle sits one layer in front: a gear meshing
 * with it may cross the wheel behind, as in a compound train, so only wheels of one layer must not overlap.
 */
export const gearTrain = (wheels: readonly {radius: number; link?: 'mesh' | 'belt' | 'crossed' | 'axle'; angle?: number}[]) => {
	const placed: {x: number; y: number; turns: number; layer: number}[] = [];
	wheels.forEach((wheel, index) => {
		if (index === 0) {
			placed.push({x: 0, y: 0, turns: 1, layer: 0});
			return;
		}
		const previous = placed[index - 1];
		const before = wheels[index - 1];
		const angle = ((wheel.angle ?? 0) * Math.PI) / 180;
		const distance = wheel.link === 'axle' ? 0 : wheel.link === 'mesh' ? before.radius + wheel.radius : before.radius + wheel.radius + BELT_GAP;
		const ratio = before.radius / wheel.radius;
		const turns = wheel.link === 'axle' ? previous.turns : wheel.link === 'belt' ? previous.turns * ratio : -previous.turns * ratio;
		placed.push({x: previous.x + Math.cos(angle) * distance, y: previous.y + Math.sin(angle) * distance, turns, layer: previous.layer + (wheel.link === 'axle' ? 1 : 0)});
	});
	return placed;
};
