/**
 * Prints a template's content schema as JSON Schema, e.g. to hand to an LLM
 * as the structured-output format for that template.
 *
 *   npm run schema                      (lists templates)
 *   npm run schema -- QuestionSolution  (prints its JSON Schema)
 *
 * Cross-field rules (such as "correctOptionIndex must exist") cannot be
 * expressed in JSON Schema; `npm run validate` still enforces them.
 */
import {z} from 'zod';
import {TEMPLATES, findTemplate} from '../src/Templates/TemplateRegistry';

const [templateId] = process.argv.slice(2);
const template = templateId ? findTemplate(templateId) : undefined;

if (!template) {
	if (templateId) console.error(`Bilinmeyen template: ${templateId}\n`);
	TEMPLATES.forEach(({id, title, description}) => console.log(`${id.padEnd(20)} ${title}: ${description}`));
	process.exit(templateId ? 2 : 0);
}

console.log(JSON.stringify(z.toJSONSchema(template.contentSchema, {io: 'input'}), null, 2));
