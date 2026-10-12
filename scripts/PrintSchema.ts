/**
 * Prints a template's content schema as JSON Schema, e.g. to hand to an LLM
 * as the structured-output format for that template.
 *
 *   npm run schema                                   (lists video templates and image designs)
 *   npm run schema -- QuestionSolution               (a video template)
 *   npm run schema -- Image:HookContent              (an image category's default design)
 *   npm run schema -- Image:HookContent:MythFact     (a specific image design)
 *
 * Cross-field rules (such as "correctOptionIndex must exist") cannot be
 * expressed in JSON Schema; `npm run validate` still enforces them.
 */
import {z} from 'zod';
import {IMAGE_TEMPLATES, findImageTemplate} from '../src/Images/ImageTemplateRegistry';
import {TEMPLATES, findTemplate} from '../src/Templates/TemplateRegistry';

const [target] = process.argv.slice(2);
const [kind, category, variant] = (target ?? '').split(':');
const schema = kind === 'Image' ? findImageTemplate(category ?? '', variant)?.contentSchema : findTemplate(kind)?.contentSchema;

if (!schema) {
	if (target) console.error(`Bilinmeyen şablon: ${target}\n`);
	console.log('Video şablonları:');
	TEMPLATES.forEach(({id, title, description}) => console.log(`  ${id.padEnd(34)} ${title}: ${description}`));
	console.log('\nGörsel tasarımları:');
	IMAGE_TEMPLATES.forEach(({category: name, variant: design, title, description}) =>
		console.log(`  ${`Image:${name}:${design}`.padEnd(34)} ${title}: ${description}`),
	);
	process.exit(target ? 2 : 0);
}

console.log(JSON.stringify(z.toJSONSchema(schema, {io: 'input'}), null, 2));
