import React from 'react';
import {useFigureFont} from '../VisualFrame';

/**
 * A genotype or gamete in SVG text, superscripts raised (X^R → Xᴿ): `x`, `y` place it, the rest are text attributes.
 * Plain text without ^ is written as it is, so a number or name can go through it too. In an app still the letters and
 * the superscripts are each kept over the still's smallest text (the R of Xᴿ came out at 18 pixels, 2 Nov 2026).
 */
export const GenotypeText: React.FC<{text: string; x: number; y: number; size: number} & Omit<React.SVGProps<SVGTextElement>, 'x' | 'y'>> = ({text, x, y, size, ...rest}) => {
	const font = useFigureFont();
	const [shown, supSize] = [font(size), font(size * 0.64)];
	const parts = text.split(/(\^[A-Za-z0-9])/).filter(Boolean);
	let raised = false;
	return (
		<text x={x} y={y} fontSize={shown} {...rest}>
			{parts.map((part, index) => {
				const sup = part.startsWith('^');
				const dy = sup && !raised ? -shown * 0.38 : !sup && raised ? shown * 0.38 : 0;
				raised = sup;
				return (
					<tspan key={index} dy={dy || undefined} fontSize={sup ? supSize : undefined}>
						{sup ? part.slice(1) : part}
					</tspan>
				);
			})}
		</text>
	);
};
