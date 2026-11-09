/** A small seeded random generator (mulberry32), so a board is shuffled the same way in every frame and render. */
const seeded = (seed: number) => () => {
	seed = (seed + 0x6d2b79f5) | 0;
	let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
	value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
	return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
};

/**
 * Where each item of a board stands before it is answered: a shuffle seeded by the items' text, so the same board
 * always looks the same. No item stands in its own place, and from four items on the order is not a plain rotation
 * either (every item one place lower, 29 Oct 2026: a student read the pattern instead of the content). Two or three
 * items can only rotate. Used by the matching board (partners) and the ordering board (steps).
 */
export const shuffledSlots = (keys: readonly string[]): number[] => {
	const count = keys.length;
	const text = keys.join('#');
	let hash = 2166136261;
	for (let index = 0; index < text.length; index++) hash = Math.imul(hash ^ text.charCodeAt(index), 16777619);
	const random = seeded(hash);
	const isRotation = (slots: number[]) => slots.every((slot, item) => slot === (item + slots[0]) % count);
	for (let attempt = 0; attempt < 200; attempt++) {
		const slots = Array.from({length: count}, (_, index) => index);
		for (let index = count - 1; index > 0; index--) {
			const other = Math.floor(random() * (index + 1));
			[slots[index], slots[other]] = [slots[other], slots[index]];
		}
		const deranged = slots.every((slot, item) => slot !== item);
		if (deranged && (count < 4 || !isRotation(slots))) return slots;
	}
	return Array.from({length: count}, (_, item) => (item + 1) % count);
};
