/**
 * Blocks tied in a row by ropes on a horizontal surface, one end pulled by F (the `connectedBlocks` visual). The whole
 * row moves as one body: a = (F − μ·g·M) / M with M the total mass. A rope pulls the blocks behind it, so its tension
 * is what those blocks need: T = (mass behind) · (a + μ·g), which is F · (mass behind) / M on any surface.
 * Blocks are numbered from the left; rope i joins block i and block i + 1.
 */
type BlockChainInput = {
	masses: readonly number[];
	force: number;
	/** The side F pulls towards: `right` pulls the last block, `left` the first. */
	pull: 'right' | 'left';
	friction: number;
	g: number;
};

export const blockChain = ({masses, force, pull, friction, g}: BlockChainInput) => {
	const total = masses.reduce((sum, mass) => sum + mass, 0);
	const kineticFriction = friction * g * total;
	const moves = force > kineticFriction;
	const acceleration = moves ? (force - kineticFriction) / total : 0;
	const tensions = masses.slice(0, -1).map((_, rope) => {
		const behind = pull === 'right' ? masses.slice(0, rope + 1) : masses.slice(rope + 1);
		return (force * behind.reduce((sum, mass) => sum + mass, 0)) / total;
	});
	return {total, moves, acceleration, tensions};
};
