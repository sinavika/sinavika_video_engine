import React from 'react';

/**
 * A genotype or gamete in SVG text, superscripts raised (X^R → Xᴿ): `x`, `y` place it, the rest are text attributes.
 * Plain text without ^ is written as it is, so a number or name can go through it too.
 */
export const GenotypeText: React.FC<{text: string; x: number; y: number; size: number} & Omit<React.SVGProps<SVGTextElement>, 'x' | 'y'>> = ({text, x, y, size, ...rest}) => {
	const parts = text.split(/(\^[A-Za-z0-9])/).filter(Boolean);
	let raised = false;
	return (
		<text x={x} y={y} fontSize={size} {...rest}>
			{parts.map((part, index) => {
				const sup = part.startsWith('^');
				const dy = sup && !raised ? -size * 0.38 : !sup && raised ? size * 0.38 : 0;
				raised = sup;
				return (
					<tspan key={index} dy={dy || undefined} fontSize={sup ? size * 0.64 : undefined}>
						{sup ? part.slice(1) : part}
					</tspan>
				);
			})}
		</text>
	);
};
