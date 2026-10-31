import {z} from 'zod';
import {isExpression} from './Mathematics/PlotExpression';

/**
 * Schema parts more than one field's visuals use. A part only one field uses
 * stays in that field's schema file (<Field>/<Field>Schema.ts); the beats and
 * the union are in VisualSchema.ts.
 */

/** A point of a figure's world: [x, y]. */
export const Point2 = z.tuple([z.number(), z.number()]);

/** A plot expression in the given variables, checked by the plot's own parser. */
export const expression = (variables: readonly string[]) =>
	z
		.string()
		.trim()
		.min(1)
		.max(120)
		.refine((text) => isExpression(text, variables), {message: `Not an expression of ${variables.join(', ')}.`});
