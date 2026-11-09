/**
 * The engine's contract for a camp script, as one text the writing model reads (camp_script_batch.py): the script
 * schema and its review rules (LessonScript.ts), the JSON Schemas of the visuals a math lesson uses, the authoring
 * rules of the camp guide and narration guide, and one finished script as a model of the format.
 *
 * Deterministic on purpose: the same files give the same bytes, so the prompt cache holds across requests.
 *
 *   npx tsx Curriculum/Production/Tools/camp_contract.mts <out.md> [example-script.json]
 */
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import path from 'node:path';
import {z} from 'zod';
import {CourseVisualSchema, VisualBeatSchema} from '../../../src/Components/Visuals/VisualSchema';
import {PROCESS_CATALOG} from '../../../src/Components/Visuals/Processes/ProcessCatalog';

const ROOT = process.cwd();
const [out, example = 'Curriculum/Scripts/YKS_TYT/MAT/MAT_MUTLAK.json'] = process.argv.slice(2);
if (!out) throw new Error('Kullanım: camp_contract.mts <out.md> [örnek.json]');

/** The visual kinds a mathematics lesson draws (plus the practice boards). */
const MATH_KINDS = ['formula', 'equation', 'numberLine', 'plot', 'table', 'pie', 'venn', 'tree', 'flow', 'cycle', 'comparison', 'stack', 'quadrant', 'geometry', 'cubes', 'transform', 'truthTable', 'process', 'matching', 'flipcards', 'ordering',
	'signTable', 'longDivision', 'primeLadder', 'barModel', 'slots', 'areaModel', 'sampleSpace', 'mapping'];
const MATH_PROCESSES = ['numberline', 'areamodel'];

const read = (file: string) => readFileSync(path.join(ROOT, file), 'utf8').replace(/\r\n/g, '\n');
const lines = (file: string, from: number, to: number) => read(file).split('\n').slice(from - 1, to).join('\n');
/** A markdown section: from its heading to the next heading of the same or a higher level. */
const section = (file: string, heading: string) => {
	const all = read(file).split('\n');
	const start = all.findIndex((line) => line.trim() === heading);
	if (start < 0) throw new Error(`${file}: "${heading}" yok`);
	const level = heading.match(/^#+/)![0].length;
	const end = all.findIndex((line, index) => index > start && /^#+ /.test(line) && line.match(/^#+/)![0].length <= level);
	return all.slice(start, end < 0 ? undefined : end).join('\n');
};

const visuals = CourseVisualSchema.options
	.filter((option) => MATH_KINDS.includes((option.shape as {kind: z.ZodLiteral<string>}).kind.value))
	.map((option) => {
		const kind = (option.shape as {kind: z.ZodLiteral<string>}).kind.value;
		return `### ${kind}\n${JSON.stringify(z.toJSONSchema(option as z.ZodType, {unrepresentable: 'any', io: 'input'}))}`;
	});
const processes = MATH_PROCESSES.map((name) => `### process: ${name}\n${JSON.stringify(PROCESS_CATALOG[name as keyof typeof PROCESS_CATALOG])}`);

const visualTable = read('docs/Courses/Courses.md')
	.split('\n')
	.filter((line) => MATH_KINDS.some((kind) => line.startsWith(`| \`${kind}\``) || line.includes(`\`${kind}\`,`)))
	.join('\n');

const parts = [
	'# Motorun sözleşmesi',
	'Senaryo bu şemaya uyar. Aşağıdaki TypeScript (zod) kodu şemanın ve otomatik denetimin (reviewScript) kendisidir; sınırlar, zorunlu alanlar ve uyarılar buradan gelir.',
	'## Senaryo şeması ve denetim (src/Courses/LessonScript.ts)',
	'```ts\n' + read('src/Courses/LessonScript.ts') + '\n```',
	'## Görsel vuruşu (beat)',
	JSON.stringify(z.toJSONSchema(VisualBeatSchema as z.ZodType, {unrepresentable: 'any', io: 'input'})),
	'## Matematik dersinin görselleri (JSON Schema; yalnız bunlar kullanılır)',
	...visuals,
	...processes,
	'## Görsellerin anlamı (kamp kılavuzu, tablo satırları)',
	visualTable,
	'## Senaryo kuralları (docs/Courses/Courses.md §4)',
	section('docs/Courses/Courses.md', '## 4. Senaryo'),
	'## Vuruşlar, süreç, tahmin, sıra sende (docs/Courses/Courses.md §6)',
	section('docs/Courses/Courses.md', '### Anlatımla eşzamanlı görseller (beat)'),
	section('docs/Courses/Courses.md', '### Süreç görseli (`process`)'),
	section('docs/Courses/Courses.md', '### Önce tahmin, sonra gösterim (`predict` kartı)'),
	section('docs/Courses/Courses.md', '### Sıra sende (`practice` kartı)'),
	'## Anlatım kuralları (docs/Courses/CourseNarration.md)',
	section('docs/Courses/CourseNarration.md', '## 4. Anlatım dili: öğrenciyle konuş, metin okuma'),
	section('docs/Courses/CourseNarration.md', '## 12. Tempo: hiçbir ekran durmaz (9 Kasım 2026)'),
	'## Biçim örneği (bitmiş bir senaryo; içeriği değil biçimi örnek al)',
	'```json\n' + JSON.stringify(JSON.parse(read(example))) + '\n```',
];
mkdirSync(path.dirname(path.resolve(out)), {recursive: true});
writeFileSync(out, parts.join('\n\n') + '\n', 'utf8');
console.log(`${out}: ${parts.join('\n\n').length} karakter`);
