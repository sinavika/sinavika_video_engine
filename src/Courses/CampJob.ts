import {z} from 'zod';
import {plainText} from '../Schemas/RichText';
import type {Camp} from './Camp';
import type {LessonScript} from './LessonScript';

/**
 * A camp lesson's render jobs and its YouTube note, made from the script
 * (`npm run curriculum -- jobs make <spec.json>`):
 *
 *   Curriculum/Jobs/<camp id>/<NN>-<slug>-youtube.json   CampLesson, horizontal
 *   Curriculum/Jobs/<camp id>/<NN>-<slug>-reels.json     CampShort, vertical
 *   Curriculum/Jobs/<camp id>/<NN>-<slug>-youtube.md     titles, description, tags
 *
 * The jobs name their script (`script`, read by Renderers/VideoJobFile)
 * instead of carrying a copy, so they never need refreshing after a script
 * edit. The spec carries only what the script does not: the file names and
 * the YouTube texts. The note is the owner's to edit once written.
 */
export const CampJobSpecSchema = z.object({
	/** The lesson's number in its camp; must match the script's `camp.number`. */
	number: z.number().int().min(1).max(99),
	/** File name part: "sinir-sistemi". */
	slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
	/** The topic code of the script. */
	code: z.string().regex(/^[A-Z][A-Z0-9_]*$/),
	/** The script's category, needed when two exams share the code (TYT and AYT both have MAT_BOLME). */
	category: z.string().min(1).optional(),
	/** Output file name part: "Sinir_Sistemi". */
	stem: z.string().regex(/^[A-Za-z0-9_]+$/),
	/** A shorter title for the job name when the lesson title is long (the name is at most 80 characters). */
	nameTitle: plainText(40).optional(),
	titleA: plainText(100),
	titleB: plainText(100),
	titleC: plainText(100),
	intro: z.string().trim().min(1).max(1000),
	bullets: z.array(plainText(120)).min(1).max(12),
	hashtags: z.string().trim().min(1).max(300),
	tags: z.string().trim().min(1).max(500),
	schedule: z.string().trim().min(1).max(120),
});
type CampJobSpec = z.infer<typeof CampJobSpecSchema>;

/** Where a lesson's finished videos are filed under Outputs/Videos (owner, 26 Oct 2026), by lesson code. */
const OUTPUT_FOLDERS: Record<string, string> = {
	TRK: 'Turkce',
	TDE: 'Edebiyat',
	MAT: 'Matematik',
	GEO: 'Geometri',
	TAR: 'Tarih',
	COG: 'Cografya',
	FEL: 'Felsefe',
	PSI: 'Psikoloji',
	SOS: 'Sosyoloji',
	MAN: 'Mantik',
	DIN: 'Din',
	FIZ: 'Fizik',
	KIM: 'Kimya',
	BIO: 'Biyoloji',
	VAT: 'Vatandaslik',
};

/** Each exam's episode 0, which every lesson's description links to; an exam without one gets a placeholder. */
const EXAM_INTRO_LINKS: Record<string, string> = {YKS: 'https://youtu.be/-YSeFFxDOhM'};

const STORE_LINES = [
	"📲 Kampın testleri ve Ders Planı Sınavika'da:",
	'App Store: https://apps.apple.com/tr/app/id6762061768?l=tr',
	'Google Play: https://play.google.com/store/apps/details?id=com.sinavika.mobile',
	'Web: https://sinavika.com',
];

/** "YKS_TYT" → ["YKS", "TYT"]; "KPSS" → ["KPSS"]. */
const examPath = (category: string): string[] => category.split('_').filter(Boolean);

/** Math in the description as plain text: \frac{a}{b} → a/b, \sqrt{x} → √x, x^2 → x². */
const latexPlain = (tex: string): string => {
	let text = tex;
	for (let pass = 0; pass < 4; pass++) {
		text = text.replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, '$1/$2').replace(/\\sqrt\{([^{}]*)\}/g, '√$1');
	}
	for (const [from, to] of [['^2', '²'], ['^3', '³'], ['\\pi', 'π'], ['\\cdot', '·'], ['\\div', '÷']] as const) text = text.replaceAll(from, to);
	return text.replace(/[{}\\]/g, '');
};

/** A rich text line as the description shows it: no bold marks, math as plain text. */
const plainLine = (text: string): string => text.replaceAll('**', '').replace(/\$([^$]+)\$/g, (_, tex: string) => latexPlain(tex));

type CampJobFile = {name: string; text: string};

/**
 * The three files of one camp lesson. `scriptFile` is the script's path from
 * the project root, as the jobs name it.
 */
export const campJobFiles = (spec: CampJobSpec, script: LessonScript, scriptFile: string, camp: Camp): CampJobFile[] => {
	const episode = script.camp;
	if (!episode) throw new Error(`${scriptFile}: the script has no camp field.`);
	if (episode.id !== camp.id) throw new Error(`${scriptFile}: the script is in camp ${episode.id}, not ${camp.id}.`);
	if (episode.number !== spec.number) throw new Error(`${scriptFile}: the script is lesson ${episode.number} of its camp, the spec says ${spec.number}.`);
	const nn = String(spec.number).padStart(2, '0');
	const base = `${nn}-${spec.slug}`;
	const job = (template: string, format: string, label: string) => ({
		template,
		format,
		theme: 'SinavikaLight',
		name: `${episode.name} ${nn} ${spec.nameTitle ?? script.title} ${label}`,
		voiceover: true,
		script: scriptFile,
	});
	const json = (value: unknown) => `${JSON.stringify(value, null, '\t')}\n`;

	const exams = examPath(camp.category);
	const exam = exams.at(-1)!;
	const lessonFolder = OUTPUT_FOLDERS[script.topic.lesson.replace(/\d+$/, '')] ?? script.topic.lesson;
	const videoFolder = `Outputs/Videos/${exams.join('/')}/${lessonFolder}/${nn}_${spec.stem}`;
	const questions = script.lesson.sections.reduce((sum, section) => sum + section.cards.filter((card) => card.kind === 'question').length, 0);
	const chapters = ['Giriş', ...script.lesson.sections.map((section) => section.title), 'Özet', 'Kamp görevi'];
	const intro = EXAM_INTRO_LINKS[exams[0]] ?? '(yayın linki)';
	const note = [
		`# YouTube metni: ${episode.name} · Ders ${spec.number} · ${script.title}`,
		'',
		`Video: henüz render edilmedi (sahibin komutuyla). Render sonrası yeri: \`${videoFolder}/${spec.stem}_YouTube.mp4\` (4K) · Kapak: \`${spec.stem}_YouTube_Kapak.jpg\` (kamp kapağı).`,
		'',
		'## Başlık (A/B testi, yalnız başlık; kapak serinin kapağı olarak sabit)',
		'',
		`- A: ${spec.titleA}`,
		`- B: ${spec.titleB}`,
		`- C: ${spec.titleC}`,
		'',
		'## Açıklama',
		'',
		spec.intro,
		'',
		'Bu derste:',
		...spec.bullets.map((bullet) => `✅ ${bullet}`),
		`✅ ${questions} ${exam} tarzı soru, adım adım çözümle`,
		'',
		'🎯 Kamp görevi:',
		...episode.task.items.map((item, index) => `${index + 1}. ${plainLine(item).replace('Uygulamada', "Sınavika'da")}`),
		'',
		...(episode.previous ? [`⏮️ Önceki ders, ${episode.previous}: (yayın linki)`] : []),
		episode.next ? `⏭️ Sıradaki ders: ${episode.next}. Kanala abone ol, hiçbir dersi kaçırma! 🔔` : '🏁 Kampın son dersi. Kanala abone ol, sıradaki kampları kaçırma! 🔔',
		`🗺️ Kampı baştan izle, Bölüm 0: ${intro}`,
		'',
		...STORE_LINES,
		'',
		'Bölümler:',
		`(render sonrası \`${spec.stem}_YouTube.chapters.txt\` buraya yapıştırılır; bölüm başlıkları: ${chapters.join(', ')})`,
		'',
		spec.hashtags,
		'',
		'## Etiketler',
		'',
		spec.tags,
		'',
		'## Oynatma listeleri',
		'',
		`${episode.name.replace(/ kampı$/, ' Kampı')} | Sınavika · ${exams[0]} Kampı | Sınavika`,
		'',
		'## Ayarlar',
		'',
		`Kategori Eğitim · dil Türkçe · çocuklara özel değil · ücretli tanıtım yok · yapay zekâ beyanı önceki derslerle aynı · yayın saati sahibin kararı (öneri: ${spec.schedule}).`,
		'',
	];
	return [
		{name: `${base}-youtube.json`, text: json(job('CampLesson', 'Horizontal', 'YouTube'))},
		{name: `${base}-reels.json`, text: json(job('CampShort', 'Vertical', 'Reels'))},
		{name: `${base}-youtube.md`, text: note.join('\n')},
	];
};

/** A camp lesson's job file: "07-mayoz-ve-eseyli-ureme-youtube.json" → lesson 7. Episode 0 (CampIntro) is not one. */
export const campJobNumber = (file: string): number | undefined => {
	const match = /^(\d\d)-[a-z0-9-]+-(youtube|reels)\.json$/.exec(file);
	return match && match[1] !== '00' ? Number(match[1]) : undefined;
};
