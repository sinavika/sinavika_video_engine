/**
 * Prints the JSON Schema of the chosen engine visual kinds (CourseVisualSchema), for prompts that ask a model to write
 * a figure as engine data. Usage: npx tsx Curriculum/Tools/VisualSchemas.ts table map plot …
 */
import {z} from 'zod';
import {CourseVisualSchema} from '../../src/Components/Visuals/VisualSchema';

const wanted = new Set(process.argv.slice(2));
const out: Record<string, unknown> = {};
for (const option of CourseVisualSchema.options) {
	const kind = option.shape.kind.value as string;
	if (!wanted.has(kind)) continue;
	const schema = z.toJSONSchema(option, {io: 'input', unrepresentable: 'any'}) as Record<string, unknown>;
	delete schema.$schema;
	out[kind] = schema;
}
const missing = [...wanted].filter((kind) => !(kind in out));
if (missing.length) {
	console.error(`Unknown visual kinds: ${missing.join(', ')}`);
	process.exit(1);
}
console.log(JSON.stringify(out));
