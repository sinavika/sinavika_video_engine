

export const arrowHead = (x: number, y: number, angle: number, size: number) => {
	const back = angle + Math.PI;
	const left = [x + size * Math.cos(back - 0.45), y + size * Math.sin(back - 0.45)];
	const right = [x + size * Math.cos(back + 0.45), y + size * Math.sin(back + 0.45)];
	return `M${x} ${y} L${left[0]} ${left[1]} L${right[0]} ${right[1]} Z`;
};
