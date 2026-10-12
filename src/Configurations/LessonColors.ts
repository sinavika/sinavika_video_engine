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

export type LessonGroup = keyof typeof LESSON_GROUPS;

const normalise = (text: string): string => text.trim().toLocaleLowerCase('tr-TR');

/** The colour family of a lesson name, or null when it has none and keeps the brand accent. */
export const lessonGroupOf = (lesson: string | undefined): LessonGroup | null => {
	if (!lesson) return null;
	const wanted = normalise(lesson);
	const groups = Object.keys(LESSON_GROUPS) as LessonGroup[];
	return groups.find((group) => LESSON_GROUPS[group].lessons.some((name) => normalise(name) === wanted)) ?? null;
};
