/**
 * How Sınavika's product and its modules are named and described in
 * advertising: store pictures, promo videos, social posts and captions.
 *
 * Names, colours and icons come from the one module table
 * (src/UIUX/ModuleIdentity.ts); this file adds the advertising copy around
 * them and the copy check every outgoing text passes (docs/ProductMessaging.md).
 *
 * The pattern for a feature line (from the store review):
 * - `tool`: the module itself is the subject, saying what it does
 *   ("SinoAI hedefini ve eksiklerini bilerek yanıtlar."). Shown on its own,
 *   on a soft background, so the tool and the reader never share a sentence.
 * - `invite`: speaks to the student, short, ends with punctuation
 *   ("Takıldığın konuyu sor!").
 */
import {MODULES, type Bilingual, type ModuleKey} from '../UIUX/ModuleIdentity';

type ProductLang = 'tr' | 'en';

type ModuleMessaging = {
	/** The module's display name (from the module table). */
	name: Bilingual;
	/** Three to five words for a headline or a video caption. */
	claim: Bilingual;
	/** One sentence with the module as its subject. */
	tool: Bilingual;
	/** One sentence to the student, with closing punctuation. */
	invite: Bilingual;
};

export const MODULE_MESSAGING: Record<ModuleKey, ModuleMessaging> = {
	exam: {
		name: MODULES.exam.name,
		claim: {tr: 'Denemeni çöz, gelişimini gör.', en: 'Take mock exams, see your progress.'},
		tool: {tr: 'Denemeler doğru, yanlış ve boşlarını konu konu gösterir; netinin değişimini takip eder.', en: 'Practice exams break down your answers by topic and track your score over time.'},
		invite: {tr: 'Süreli denemelerle kendini sına.', en: 'Test yourself under exam conditions.'},
	},
	lessons: {
		name: MODULES.lessons.name,
		claim: {tr: 'Konuyu öğren, sorularla pekiştir.', en: 'Learn it, then lock it in.'},
		tool: {tr: 'Dersler konuyu kısa mikro derslerle anlatır; Testler seviye seviye sınar.', en: 'Lessons teach in short micro-lessons; Quizzes test you level by level.'},
		invite: {tr: 'Adım adım öğren, kaldığın yerden devam et.', en: 'Learn step by step and pick up where you left off.'},
	},
	tests: {
		name: MODULES.tests.name,
		claim: {tr: 'Adım adım konu testleri.', en: 'Step-by-step topic quizzes.'},
		tool: {tr: 'Testler her soruda anında açıklama verir ve seni bir sonraki seviyeye taşır.', en: 'Quizzes explain every answer instantly and move you up a level.'},
		invite: {tr: 'Eksik konunu 10 soruda kapat.', en: 'Close a gap in 10 questions.'},
	},
	studyPlan: {
		name: MODULES.studyPlan.name,
		claim: {tr: 'Eksiğini gör, çalışmanı planla.', en: 'See your gaps, plan your study.'},
		tool: {tr: 'Ders Planı tekrar etmen gereken konuları ve bugünün görevlerini gösterir.', en: 'Study Plan shows what to review and what to do today.'},
		invite: {tr: 'Günlük planını kur, kaç saat çalıştığını takip et.', en: 'Set your daily plan and track your hours.'},
	},
	smartSummary: {
		name: MODULES.smartSummary.name,
		claim: {tr: 'Fotoğrafını çek, çözümünü öğren.', en: 'Snap a question, learn the solution.'},
		tool: {tr: 'Akıllı Özet çözümü adım adım gösterir; kazanımı ve hatanı söyler.', en: 'Smart Summary solves it step by step and shows where you went wrong.'},
		invite: {tr: 'Çözemediğin soruyu videolu anlatımla izle.', en: 'Stuck? Watch it explained in a video.'},
	},
	flashcards: {
		name: MODULES.flashcards.name,
		claim: {tr: 'Öğren, tekrar et, aklında tut.', en: 'Learn, review, remember.'},
		tool: {tr: 'Bilgi Kartları unutmak üzere olduğun kartları tam zamanında önüne getirir.', en: 'Flashcards bring back each card just before you would forget it.'},
		invite: {tr: 'Kısa molalarını değerlendir, tekrar bakmak istediklerini kaydet.', en: 'Use short breaks and save the cards you want to see again.'},
	},
	sinoAi: {
		name: MODULES.sinoAi.name,
		claim: {tr: 'Seni tanıyan yapay zekâ: SinoAI', en: 'SinoAI, the AI that knows you'},
		tool: {tr: 'SinoAI hedefini, eksiklerini ve geçmiş çalışmalarını bilerek yanıtlar.', en: 'SinoAI answers with your goal, your gaps and your past work in mind.'},
		invite: {tr: 'Takıldığın konuyu sor!', en: 'Ask about anything you’re stuck on!'},
	},
};

export const moduleName = (key: ModuleKey, lang: ProductLang = 'tr'): string => MODULE_MESSAGING[key].name[lang];
export const moduleCopy = (key: ModuleKey, lang: ProductLang = 'tr') => {
	const copy = MODULE_MESSAGING[key];
	return {name: copy.name[lang], claim: copy.claim[lang], tool: copy.tool[lang], invite: copy.invite[lang]};
};

type CopyIssue = {severity: 'error' | 'warning'; term: string; message: string};

const TEST_NOT_QUIZ = 'Türkçede "quiz" denmez, "test" denir (modül adı Testler): "10 soruluk test", "test ve kart üretir".';

/** `turkish`: the rule only applies to Turkish text (English says "quiz" correctly). */
type Rule = {pattern: RegExp; severity: CopyIssue['severity']; message: string; turkish?: boolean};

/** Whether a text is Turkish: Turkish letters, or common Turkish words where a short line has none ("Notunu at. Quiz olsun."). */
const looksTurkish = (text: string): boolean =>
	/[çğıöşüÇĞİÖŞÜ]/.test(text) || /(?<!\p{L})(ve|bir|için|olsun|hazır|soruluk|oluştur|çöz|ile|gibi|notunu|senin|sana)(?!\p{L})/iu.test(text);

/**
 * Words advertising copy must not use. Errors stop a social post from being
 * sent; warnings are printed (they can be fine in lesson content, e.g. "lens"
 * in optics or "pusula" in geography).
 */
const RULES: Rule[] = [
	{pattern: /(?<!\p{L})(sınav\s+)?koç(?:u|un|una|unu|unla|unuz|unuzla|lar|luk|lu[ğk])?(?!\p{L})(?!\s+Üniversitesi)/giu, severity: 'error', message: 'İnsan koç hizmeti yok; SinoAI ya da "yapay zekâ çalışma asistanın" denir.'},
	{pattern: /\b(exam\s+)?coach(es)?\b/gi, severity: 'error', message: 'No human coach; say SinoAI or "your AI study assistant".'},
	{pattern: /Sınavika AI|Sinavika AI/g, severity: 'error', message: 'Yapay zekâ asistanının adı SinoAI.'},
	{pattern: /\bSino AI\b|\bSinoAi\b|\bSinoai\b/g, severity: 'error', message: 'Yazım: SinoAI (bitişik, AI büyük).'},
	{pattern: /Kelime Kartları|Knowledge cards/gi, severity: 'error', message: 'Modül adı Bilgi Kartları (EN Flashcards).'},
	{pattern: /Ders Çalış(?!\p{L})/gu, severity: 'error', message: 'Modül adı Dersler. Fiil olarak küçük harfle "ders çalış" kullanılabilir.'},
	{pattern: /Lens AI/g, severity: 'error', message: 'Modül adı Akıllı Özet.'},
	{pattern: /\bSinavika\b(?!\.com)/g, severity: 'error', message: 'Marka adı ı ile yazılır: Sınavika (alan adı ve #sinavika hariç).'},
	{pattern: /\bLens\b/g, severity: 'warning', message: 'Ürün adıysa Akıllı Özet denir; Lens yalnız kod adıdır.'},
	{pattern: /\bCompass\b|\bPusula\b/g, severity: 'warning', message: 'Ürün adıysa Ders Planı › İlerleme denir.'},
	{pattern: /Analiz modülü/gi, severity: 'warning', message: 'Analiz ayrı modül değil; Denemeler › Sonuçlar.'},
	// SinoAI's library is "Kütüphane" in the app (web and design); a post said "Kitaplığında" while the phone showed "Kütüphanen" (Tuğçe, 26 Oct 2026).
	{pattern: /(?<!\p{L})kitaplı[kğ]\p{L}*/giu, severity: 'error', message: 'SinoAI’nin üretimleri uygulamada "Kütüphane"de durur; cümle içinde küçük harf: "kütüphanende".'},
	// Owner, 25 Oct 2026: in Turkish a quiz is always a "test" (the module is Testler), in ads and everywhere else.
	// A Turkish suffix ("quiz'i", "quizler", "quizini") only occurs in Turkish, so it is an error in any text;
	// a bare "quiz" only in Turkish text, since English says "quiz" correctly.
	{pattern: /(?<!\p{L})quiz'?(?:ler|lerin|leri|lerini|lere|lerde|lerden|i|ini|in|ine|inde|e|de|den|le|iniz|imiz)(?!\p{L})/giu, severity: 'error', message: TEST_NOT_QUIZ},
	{pattern: /(?<!\p{L})quiz(?!\p{L}|')/giu, severity: 'error', message: TEST_NOT_QUIZ, turkish: true},
];

/** Checks one text against the advertising copy rules. */
export const checkProductCopy = (text: string): CopyIssue[] => {
	const turkish = looksTurkish(text);
	return RULES.filter((rule) => !rule.turkish || turkish).flatMap((rule) => [...text.matchAll(rule.pattern)].map((match) => ({severity: rule.severity, term: match[0], message: rule.message})));
};

export class ProductCopyError extends Error {
	constructor(readonly issues: CopyIssue[]) {
		super(`Ürün anlatımı kurallarına uymayan metin: ${issues.map((issue) => `"${issue.term}" (${issue.message})`).join('; ')}`);
	}
}

/** Throws when any text has an error; returns the warnings. */
export const assertProductCopy = (texts: readonly (string | undefined)[]): CopyIssue[] => {
	const issues = texts.flatMap((text) => (text ? checkProductCopy(text) : []));
	const errors = issues.filter((issue) => issue.severity === 'error');
	if (errors.length) throw new ProductCopyError(errors);
	return issues;
};
