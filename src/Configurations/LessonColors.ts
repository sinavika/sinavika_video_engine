/**
 * Lesson colours: a small, controlled colour difference between subjects.
 *
 * Orange stays the brand colour of every design. A lesson only changes the
 * accent (subject badge, highlighter, numbers), so a feed of mixed subjects
 * still reads as one brand while each subject is recognisable at a glance.
 *
 * Lessons are grouped into five families instead of getting a colour each:
 * a few stable hues are learned quickly, a dozen are not. The hues are deep
 * "ink" tones that sit next to the brand's charcoal and orange, and none of
 * them is a status colour (green/amber/red/blue of the app) or the purple
 * reserved for solution review. Anything not listed keeps the brand orange.
 *
 * First value on light themes, second on dark.
 */
export const LESSON_GROUPS = {
	Numeric: {label: 'Sayısal', light: '#1E40AF', dark: '#93B4FF', lessons: ['Matematik', 'Temel Matematik', 'Geometri', 'Sayısal Yetenek']},
	Science: {label: 'Fen', light: '#0F766E', dark: '#5EEAD4', lessons: ['Fen Bilimleri', 'Fizik', 'Kimya', 'Biyoloji']},
	Verbal: {label: 'Türkçe', light: '#BE185D', dark: '#F9A8D4', lessons: ['Türkçe', 'Edebiyat', 'Türk Dili ve Edebiyatı', 'Paragraf', 'Dil Bilgisi', 'Sözel Yetenek']},
	Social: {label: 'Sosyal', light: '#4D7C0F', dark: '#BEF264', lessons: ['Sosyal Bilimler', 'Tarih', 'Coğrafya', 'Felsefe', 'Din Kültürü', 'Vatandaşlık', 'İnkılap Tarihi']},
	ForeignLanguage: {label: 'Yabancı dil', light: '#0E7490', dark: '#67E8F9', lessons: ['Yabancı Dil', 'İngilizce', 'Almanca', 'Fransızca']},
} as const satisfies Record<string, {label: string; light: string; dark: string; lessons: readonly string[]}>;

type LessonGroup = keyof typeof LESSON_GROUPS;

const normalise = (text: string): string => text.trim().toLocaleLowerCase('tr-TR');

/** The colour family of a lesson name, or null when it has none and keeps the brand accent. */
export const lessonGroupOf = (lesson: string | undefined): LessonGroup | null => {
	if (!lesson) return null;
	const wanted = normalise(lesson);
	const groups = Object.keys(LESSON_GROUPS) as LessonGroup[];
	return groups.find((group) => LESSON_GROUPS[group].lessons.some((name) => normalise(name) === wanted)) ?? null;
};

/**
 * Lesson colours of the education videos (Courses): one colour per lesson,
 * keyed by the lesson code of the curriculum (TRK, MAT, TAR1...).
 *
 * Long videos stay on one lesson for many minutes, so here every lesson gets
 * its own colour instead of a family's. Related lessons share a hue and
 * differ in depth (Matematik and Geometri are both blue), so the families
 * above still read through. The same limits hold: deep "ink" tones that
 * carry white text, no status colour and no purple. The colour on dark
 * themes is derived from this one (see courseLessonColor).
 */
export const COURSE_LESSON_COLORS = {
	// Verbal
	TRK: '#BE185D',
	TDE: '#9D174D',
	// Numeric
	MAT: '#1E40AF',
	GEO: '#0369A1',
	// Science
	FIZ: '#0F766E',
	KIM: '#155E75',
	BIO: '#4D7C0F',
	// History
	TAR: '#8A4B16',
	TAR1: '#8A4B16',
	TAR2: '#6B3A12',
	// Geography
	COG: '#4D6B1A',
	COG1: '#4D6B1A',
	COG2: '#3F5714',
	// Philosophy, psychology, sociology, logic, religion
	FEL: '#475569',
	PSI: '#4B5A82',
	SOS: '#52606D',
	MAN: '#334155',
	DIN: '#5E5A3A',
	// Civics
	VAT: '#7A2E2E',
	// Foreign languages
	ING: '#0E7490',
	ALM: '#155E75',
	ARA: '#0F5F5A',
	FRA: '#1D5E8A',
	RUS: '#2B5A7A',
} as const satisfies Record<string, string>;

type CourseLessonCode = keyof typeof COURSE_LESSON_COLORS;

/** The colour of a lesson in the education videos, or undefined when the lesson has none and keeps the brand accent. */
export const courseLessonColor = (code: string | undefined): string | undefined =>
	code && code in COURSE_LESSON_COLORS ? COURSE_LESSON_COLORS[code as CourseLessonCode] : undefined;
