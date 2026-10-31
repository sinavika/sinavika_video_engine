import React from 'react';
import {UIProvider, useColors, useModuleColors, useT} from '../../Context';
import {Icon, type UIIconName} from '../../Icons';
import {AppHeader, Content, ModuleScreen, ModuleSlide, PageTitle, Phone, SectionTitle, Sheet} from '../../Parts/Mobile';
import {Bar, Button, Card, Chip, List, ListRow, Ring, Stack, Text, Tile} from '../../Parts/Shared';

/**
 * Dersler (Works): a topic is taught as micro-lessons, each a short run of
 * steps the student works through. The API's shapes (docs/frontend/
 * student-works-api.md in the API repo): lessons → topics → micro-lessons →
 * steps (Concept, Example, Rule, Visual, Choice, TrueFalse, Order, Question,
 * FillBlank), plus Kaldığın yerden (continue) and Tekrar (review, 1-3-7 days).
 * The look follows the owner's reference (docs/Ders-akisi-referans.html in the
 * delivery folder): a thin step bar, the step in capitals, a bold title, white
 * cards, feedback as a soft box inside the content and one Dersler-blue
 * action. Right is green, wrong red, hints amber.
 * Content is lesson 1 of the TYT Türkçe camp (Curriculum/Jobs/yks-tyt-turkce-kampi).
 */

/* ------------------------------------------------------------------ data */

export type MicroState = 'done' | 'now' | 'next';

/** The 13 micro-lessons of Sözcükte Anlam: title, steps, minutes. */
export const MICRO_LESSONS: [string, number, number][] = [
	['Gerçek anlam', 2, 2],
	['Mecaz anlam', 5, 4],
	['Terim anlam', 2, 2],
	['Temel ve yan anlam', 2, 2],
	['Somut ve soyut anlam', 2, 2],
	['Nitel ve nicel anlam', 2, 2],
	['Genel ve özel anlam', 2, 2],
	['Eş ve yakın anlamlı sözcükler', 2, 3],
	['Karşıt anlamlı sözcükler', 2, 2],
	['Eş sesli sözcükler', 2, 2],
	['Yansıma sözcükler', 1, 2],
	['Sözcüğün bağlamdaki anlamı', 5, 6],
	['Anlam değişmesi', 1, 2],
];

/** Micro-lesson states with the given one (0-based) in progress. */
export const microStates = (now: number): MicroState[] => MICRO_LESSONS.map((_, index) => (index < now ? 'done' : index === now ? 'now' : 'next'));

export const TOPIC = {
	title: 'Sözcükte Anlam',
	hook: 'Sözcüğün anlamını sözlük değil, cümle belirler.',
	video: '21:38',
};

export const CONCEPT = {
	title: 'Mecaz anlam nedir?',
	text: 'Sözcüğün bir **benzetme ya da ilgi** sonucu gerçek anlamından **tamamen uzaklaşarak** kazandığı yeni anlamdır.',
	sentence: ['Bu', 'haber', 'onun', 'cesaretini', 'kırdı.'],
	highlight: 4,
	role: 'mecaz anlam',
	note: 'Ortada kırılan bir nesne yok. Kırmak burada azaltmak, yok etmek anlamında.',
};

export const AGIR_QUESTION = {
	stem: 'Aşağıdaki cümlelerin hangisinde **ağır** sözcüğü mecaz anlamda kullanılmıştır?',
	options: ['Ağır bavulu tek başına merdivenlerden çıkaramadı.', 'Arkadaşının söylediği sözler ona çok ağır geldi.', 'Kamyon, ağır yükü yüzünden yokuşu zor çıktı.', 'Demir, aynı büyüklükteki tahtadan daha ağırdır.', 'Bahçedeki ağır taşı iki kişi kenara çekti.'],
	hint: 'Her seçenekte sor: **ağır** burada tartıyla ölçülebilen bir ağırlık mı?',
};

export const SUMMARY = {
	points: ['**Gerçek anlam:** sözcüğün akla gelen ilk anlamı.', '**Somut** beş duyuyla algılanır; **nitel** nasıl, **nicel** ne kadar olduğunu söyler.', '**Eş sesli** sözcüklerin anlamları arasında bağ yoktur (çay); **çok anlamlıda** vardır (kol).', 'Bağlam sorularında sözcüğün yerine **karşılık koy** ve şıklarda dene.'],
	remember: '**Yan anlamda** temel anlamla bağ korunur (masanın ayağı). **Mecazda** bağ kopar (cesareti kırıldı).',
	warnings: ['"Olgun değil" karşıt anlam değildir; karşıtı "ham"dır.', 'Somut sözcükler de mecaz olabilir: sıcak bir karşılama.'],
	task: ['Bugün okuduğun bir metinde üç mecaz ve bir yan anlamlı sözcük bul.', 'Tutmak, kırmak ya da açmak ile farklı anlamda üç cümle kur.', "Sınavika'da Sözcükte Anlam testinden 20 soru çöz."],
};

/** Lesson mains of the student's exams with their micro-lesson progress (GET lessons). */
export const WORK_LESSONS: [string, string, number, number, number][] = [
	['Türkçe', 'Turkish', 14, 125, 15],
	['Matematik', 'Maths', 6, 164, 23],
	['Tarih', 'History', 0, 120, 22],
	['Coğrafya', 'Geography', 0, 98, 19],
	['Biyoloji', 'Biology', 0, 61, 10],
];

/** Topics of TYT Türkçe (GET lessons/{id}/subs): name, micro-lessons, done, minutes, first-try share. */
export const WORK_TOPICS: [string, number, number, number, number | null][] = [
	['Sözcükte Anlam', 13, 1, 34, 0.75],
	['Söz Yorumu', 7, 0, 21, null],
	['Deyim ve Atasözü', 9, 0, 26, null],
	['Cümlede Anlam', 8, 0, 24, null],
	['Paragrafta Anlatım Teknikleri', 10, 0, 30, null],
	['Paragrafta Yapı', 8, 0, 25, null],
];

/** Due review steps (GET reviews): step kind, micro-lesson, topic, stage. */
export const REVIEWS: [string, string, string, number][] = [
	['TYT tarzı soru', 'Mecaz anlam', 'Sözcükte Anlam', 1],
	['Boşluk doldur', 'Mecaz anlam', 'Sözcükte Anlam', 1],
	['Önce sen tahmin et', 'Terim anlam', 'Sözcükte Anlam', 2],
	['Doğru mu, yanlış mı?', 'Ana düşünce', 'Söz Yorumu', 3],
	['Sırala', 'Sözcüğün bağlamdaki anlamı', 'Sözcükte Anlam', 1],
];

/* ------------------------------------------------------------------ parts */

/** Script text: **bold** is drawn bold (in the given colour, ink by default). */
export const Rich: React.FC<{text: string; color?: string}> = ({text, color}) => (
	<>
		{text.split('**').map((part, index) =>
			index % 2 ? (
				<span key={index} style={{fontWeight: 800, color}}>
					{part}
				</span>
			) : (
				<React.Fragment key={index}>{part}</React.Fragment>
			),
		)}
	</>
);

/** The round ✕ (or ‹) button of the step bar. */
export const RoundButton: React.FC<{icon?: UIIconName; size?: number}> = ({icon = 'x', size = 38}) => {
	const colors = useColors();
	return (
		<div style={{width: size, height: size, borderRadius: size / 2, border: `1px solid ${colors.line}`, background: colors.card, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
			<Icon name={icon} size={size * 0.45} color={colors.ink2} />
		</div>
	);
};

/** The step bar: done steps blue, the current one half blue. */
export const Segments: React.FC<{done: number; count?: number; height?: number; current?: boolean}> = ({done, count = 5, height = 7, current = true}) => {
	const colors = useColors();
	const mod = useModuleColors('lessons');
	return (
		<Stack row gap={5} grow>
			{Array.from({length: count}, (_, index) => (
				<div key={index} style={{flex: 1, height, borderRadius: height, background: index < done ? mod.color : index === done && current ? `linear-gradient(90deg, ${mod.color} 50%, ${colors.line} 50%)` : colors.line}} />
			))}
		</Stack>
	);
};

/** The step kind in capitals: "MECAZ ANLAM · 1 / 5". */
export const Kind: React.FC<{children: string; muted?: boolean; size?: number; align?: 'center'}> = ({children, muted, size = 12.5, align}) => {
	const colors = useColors();
	const mod = useModuleColors('lessons');
	return (
		<Text role="over" size={size} weight={800} color={muted ? colors.muted : mod.ink} align={align}>
			{children}
		</Text>
	);
};

export const Title: React.FC<{children: React.ReactNode; size?: number}> = ({children, size = 24}) => (
	<Text role="title" size={size} style={{lineHeight: `${size * 1.25}px`}}>
		{children}
	</Text>
);

/** A white content card. */
export const PlainCard: React.FC<{children: React.ReactNode; gap?: number; padding?: number; style?: React.CSSProperties}> = ({children, gap = 10, padding = 16, style}) => (
	<Card tone="flat" radius={18} padding={padding} style={{display: 'flex', flexDirection: 'column', gap, ...style}}>
		{children}
	</Card>
);

export type OptionLook = 'idle' | 'ok' | 'no';

/** An answer: letter box and text; right is green, wrong red. */
export const Choice: React.FC<{letter?: string; text: React.ReactNode; look?: OptionLook; size?: number; center?: boolean}> = ({letter, text, look = 'idle', size = 15, center}) => {
	const colors = useColors();
	const tone = {
		idle: {line: colors.line, fill: colors.card, box: colors.line2, boxInk: colors.muted},
		ok: {line: colors.success, fill: colors.successSoft, box: colors.success, boxInk: '#FFFFFF'},
		no: {line: colors.error, fill: colors.errorSoft, box: colors.error, boxInk: '#FFFFFF'},
	}[look];
	return (
		<Stack row gap={12} align="flex-start" justify={center ? 'center' : undefined} style={{padding: '13px 14px', borderRadius: 16, border: `1.5px solid ${tone.line}`, background: tone.fill}}>
			{letter ? (
				<div style={{width: 28, height: 28, borderRadius: 9, background: tone.box, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
					<Text role="headline" size={13.5} weight={800} color={tone.boxInk}>
						{letter}
					</Text>
				</div>
			) : null}
			<Text role="body" size={size} weight={600} color={colors.ink} style={{paddingTop: letter ? 3 : 0}}>
				{text}
			</Text>
		</Stack>
	);
};

export type FeedbackTone = 'ok' | 'no' | 'hint';

/** Feedback inside the content: a soft coloured box with a bold title. */
export const Feedback: React.FC<{tone: FeedbackTone; title: string; children: React.ReactNode; size?: number}> = ({tone, title, children, size = 14.5}) => {
	const colors = useColors();
	const look = {
		ok: {bg: colors.successSoft, ink: colors.successInk},
		no: {bg: colors.errorSoft, ink: colors.errorInk},
		hint: {bg: colors.warningSoft, ink: colors.warningInk},
	}[tone];
	return (
		<div style={{borderRadius: 16, padding: 14, background: look.bg, display: 'flex', flexDirection: 'column', gap: 4}}>
			<Text role="headline" size={size + 0.5} weight={800} color={look.ink}>
				{title}
			</Text>
			<Text role="body" size={size} color={colors.ink}>
				{children}
			</Text>
		</div>
	);
};

/** A sentence as word tiles; the highlighted word is framed in blue. */
export const Words: React.FC<{words: string[]; highlight: number; size?: number}> = ({words, highlight, size = 18}) => {
	const colors = useColors();
	const mod = useModuleColors('lessons');
	return (
		<Stack row wrap gap={8}>
			{words.map((word, index) => (
				<div key={word} style={{padding: `${size * 0.42}px ${size * 0.6}px`, borderRadius: 12, border: `1.5px solid ${index === highlight ? mod.color : colors.line}`, background: index === highlight ? mod.soft : colors.card}}>
					<Text role="headline" size={size} weight={700} color={colors.ink}>
						{word}
					</Text>
				</div>
			))}
		</Stack>
	);
};

export const RolePill: React.FC<{children: string; size?: number}> = ({children, size = 13}) => {
	const mod = useModuleColors('lessons');
	return (
		<div style={{alignSelf: 'flex-start', padding: '3px 12px', borderRadius: 999, background: mod.action}}>
			<Text role="meta" size={size} weight={800} color="#FFFFFF">
				{children}
			</Text>
		</div>
	);
};

export const ListenPill: React.FC<{time?: string}> = ({time = '0:12'}) => {
	const colors = useColors();
	const mod = useModuleColors('lessons');
	return (
		<Stack row gap={8} style={{alignSelf: 'flex-start', padding: '8px 16px', borderRadius: 999, border: `1px solid ${colors.line}`, background: colors.card}}>
			<Icon name="headset" size={16} color={mod.color} />
			<Text role="small" size={14} weight={700} color={colors.ink2}>{`Dinle · ${time}`}</Text>
		</Stack>
	);
};

/** One row of the timeline map: dot, name, steps; the line to the next row is blue once done. */
export const MapRow: React.FC<{index: number; name: string; state: MicroState; meta?: string; last?: boolean; dot?: number; size?: number; height?: number}> = ({index, name, state, meta, last, dot = 32, size = 15, height = 42}) => {
	const colors = useColors();
	const mod = useModuleColors('lessons');
	return (
		<div style={{position: 'relative', display: 'flex', alignItems: 'center', gap: 12, height}}>
			{last ? null : <div style={{position: 'absolute', left: dot / 2 - 1, top: height / 2 + dot / 2 - 2, height: height - dot + 4, width: 2, background: state === 'done' ? mod.color : colors.line}} />}
			<div style={{width: dot, height: dot, borderRadius: dot / 2, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', background: state === 'done' ? mod.color : state === 'now' ? colors.card : colors.line2, border: state === 'now' ? `2px solid ${mod.color}` : undefined, zIndex: 1}}>
				{state === 'done' ? (
					<Icon name="check" size={dot * 0.48} color="#FFFFFF" />
				) : (
					<Text role="meta" size={dot * 0.4} weight={800} color={state === 'now' ? mod.ink : colors.muted}>
						{index}
					</Text>
				)}
			</div>
			<Text role="headline" size={size} weight={700} color={state === 'now' ? mod.ink : colors.ink} style={{flex: 1, minWidth: 0}}>
				{name}
			</Text>
			{meta ? (
				<Text role="meta" size={size - 2} weight={700} color={colors.muted}>
					{meta}
				</Text>
			) : null}
		</div>
	);
};

export const VideoRow: React.FC<{title: string; sub: string; size?: number}> = ({title, sub, size = 15}) => {
	const colors = useColors();
	return (
		<Stack row gap={12} style={{padding: 12, borderRadius: 16, border: `1px solid ${colors.line}`, background: colors.card}}>
			<div style={{width: 76, height: 48, borderRadius: 10, background: colors.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
				<Icon name="play" size={18} color={colors.bg} />
			</div>
			<Stack gap={1} grow>
				<Text role="headline" size={size} weight={800}>
					{title}
				</Text>
				<Text role="small" size={size - 2} color={colors.ink2}>
					{sub}
				</Text>
			</Stack>
		</Stack>
	);
};

export const Hero: React.FC<{size?: number}> = ({size = 21}) => {
	const mod = useModuleColors('lessons');
	return (
		<div style={{borderRadius: 22, padding: 18, background: mod.gradient, display: 'flex', flexDirection: 'column', gap: 6}}>
			<Text role="over" size={12.5} weight={800} color="rgba(255,255,255,0.92)">{`${TOPIC.title} · 13 mikro ders`}</Text>
			<Text role="title" size={size} color="#FFFFFF" style={{lineHeight: `${size * 1.25}px`}}>
				{TOPIC.hook}
			</Text>
			<Text role="small" size={14} weight={600} color="#FFFFFF">
				1 / 13 tamamlandı · sıradaki: Mecaz anlam
			</Text>
		</div>
	);
};

export const ScoreDots: React.FC<{marks: ('ok' | 'no')[]; size?: number}> = ({marks, size = 40}) => {
	const colors = useColors();
	return (
		<Stack row gap={8} justify="center">
			{marks.map((mark, index) => (
				<div key={index} style={{width: size, height: size, borderRadius: size / 2, background: mark === 'ok' ? colors.success : colors.error, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<Icon name={mark === 'ok' ? 'check' : 'x'} size={size * 0.45} color="#FFFFFF" />
				</div>
			))}
		</Stack>
	);
};

/** A topic's place in its lesson: check when done, a blue ring when in progress, its number otherwise. */
export const TopicBadge: React.FC<{index: number; state: MicroState; size?: number}> = ({index, state, size = 34}) => {
	const colors = useColors();
	const mod = useModuleColors('lessons');
	return (
		<div style={{width: size, height: size, borderRadius: size / 2, flexShrink: 0, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', background: state === 'done' ? mod.color : state === 'now' ? colors.card : colors.line2, border: state === 'now' ? `2.5px solid ${mod.color}` : undefined}}>
			{state === 'done' ? (
				<Icon name="check" size={size * 0.48} color="#FFFFFF" />
			) : (
				<Text role="meta" size={13} weight={800} color={state === 'now' ? mod.ink : colors.muted}>
					{index}
				</Text>
			)}
		</div>
	);
};

/** The phone of a micro-lesson: status bar, optional step bar, content and a foot with the actions. */
const Screen: React.FC<{bar?: React.ReactNode; foot?: React.ReactNode; gap?: number; center?: boolean; overlay?: React.ReactNode; children: React.ReactNode}> = ({bar, foot, gap = 14, center, overlay, children}) => (
	<UIProvider module="lessons">
		<Phone overlay={overlay}>
			{bar}
			<div style={{flex: 1, minHeight: 0, overflow: 'hidden', padding: '8px 20px 12px', display: 'flex', flexDirection: 'column', gap, justifyContent: center ? 'center' : undefined}}>{children}</div>
			{foot ? <div style={{padding: '10px 20px 30px', display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0}}>{foot}</div> : null}
		</Phone>
	</UIProvider>
);

const StepBar: React.FC<{done: number; count?: number}> = ({done, count}) => (
	<Stack row gap={14} style={{padding: '6px 18px 10px', flexShrink: 0}}>
		<RoundButton />
		<Segments done={done} count={count} />
	</Stack>
);

const TitleBar: React.FC<{text: string; icon?: UIIconName}> = ({text, icon = 'left'}) => (
	<Stack row gap={12} style={{padding: '6px 18px 10px', flexShrink: 0}}>
		<RoundButton icon={icon} />
		<Text role="headline" size={15} weight={800}>
			{text}
		</Text>
	</Stack>
);

const Main: React.FC<{children: string}> = ({children}) => (
	<Button size="lg" block>
		{children}
	</Button>
);

const Ghost: React.FC<{children: string; icon?: UIIconName}> = ({children, icon}) => (
	<Button tone="ghost" size="lg" block icon={icon}>
		{children}
	</Button>
);

/* ------------------------------------------------------------------ Dersler · ana sayfa */

export const LessonsHomeScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('lessons');
	return (
		<ModuleScreen module="lessons" tab={0}>
			<Content gap={12}>
				<PageTitle module="lessons" title={t('Dersler', 'Lessons')} />
				<ModuleSlide module="lessons" height={158} />
				<Card padding={14}>
					<Stack row gap={12}>
						<Tile module="lessons" icon="refresh" size={40} />
						<Stack grow gap={1}>
							<Text role="headline">{t('Tekrar zamanı', 'Time to review')}</Text>
							<Text role="small">{t('5 adım · yaklaşık 4 dk', '5 steps · about 4 min')}</Text>
						</Stack>
						<Button tone="moduleSoft" module="lessons" size="sm">
							{t('Başla', 'Start')}
						</Button>
					</Stack>
				</Card>
				<SectionTitle title="TYT" sub={t('10 ders · 168 konu', '10 subjects · 168 topics')} />
				<List>
					{WORK_LESSONS.slice(0, 4).map(([tr, en, done, total, topics]) => (
						<ListRow
							key={tr}
							module="lessons"
							icon="book"
							title={t(tr, en)}
							subtitle={t(`${topics} konu · ${done} / ${total} mikro ders`, `${topics} topics · ${done} / ${total} micro-lessons`)}
							trailing={
								<Stack row gap={10}>
									<div style={{width: 56}}>
										<Bar value={Math.max(done / total, 0.02)} color={mod.color} track={mod.track} height={6} />
									</div>
									<Icon name="right" size={18} color={colors.subtle} />
								</Stack>
							}
						/>
					))}
				</List>
			</Content>
		</ModuleScreen>
	);
};

/* ------------------------------------------------------------------ Dersler · konular */

export const LessonsTopicsScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('lessons');
	return (
		<ModuleScreen module="lessons" tab={1} header={<AppHeader left="back" title={t('Türkçe', 'Turkish')} right={<div style={{width: 40}} />} />}>
			<Content gap={12}>
				<Card tone="module" module="lessons" padding={14}>
					<Stack row justify="space-between">
						<Stack gap={2}>
							<Text role="headline">{t('TYT Türkçe · 15 konu', 'TYT Turkish · 15 topics')}</Text>
							<Text role="small">{t('14 / 125 mikro ders · ilk denemede %75', '14 / 125 micro-lessons · 75% first try')}</Text>
						</Stack>
						<Ring value={0.11} size={48} stroke={5} color={mod.color} track={mod.track}>
							<Text role="meta" weight={800}>
								%11
							</Text>
						</Ring>
					</Stack>
				</Card>
				<Card padding={6}>
					{WORK_TOPICS.map(([name, count, done, minutes, firstTry], index) => {
						const state: MicroState = done > 0 ? 'now' : 'next';
						return (
							<Stack key={name} row gap={12} style={{padding: '10px 8px', borderRadius: 14, background: state === 'now' ? mod.wash : undefined, borderTop: index ? `1px solid ${colors.line2}` : undefined}}>
								<TopicBadge index={index + 1} state={state} />
								<Stack grow gap={1}>
									<Text role="headline">{name}</Text>
									<Text role="meta">{state === 'now' ? t(`${done} / ${count} mikro ders · ilk denemede %${Math.round((firstTry ?? 0) * 100)}`, `${done} / ${count} micro-lessons · ${Math.round((firstTry ?? 0) * 100)}% first try`) : t(`${count} mikro ders · ${minutes} dk`, `${count} micro-lessons · ${minutes} min`)}</Text>
								</Stack>
								{state === 'now' ? (
									<Button tone="module" module="lessons" size="sm">
										{t('Devam et', 'Continue')}
									</Button>
								) : (
									<Icon name="right" size={18} color={colors.subtle} />
								)}
							</Stack>
						);
					})}
				</Card>
			</Content>
		</ModuleScreen>
	);
};

/* ------------------------------------------------------------------ Dersler · tekrar */

export const LessonsReviewScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<ModuleScreen module="lessons" tab={2}>
			<Content gap={12}>
				<PageTitle module="lessons" title={t('Tekrar', 'Review')} sub={t('İlk denemede yanlış yaptığın adımlar 1, 3 ve 7 gün sonra yeniden gelir.', 'Steps you missed come back after 1, 3 and 7 days.')} />
				<Card tone="moduleLine" module="lessons" padding={16}>
					<Stack gap={12}>
						<Stack row gap={12}>
							<Tile module="lessons" icon="refresh" size={44} />
							<Stack grow gap={1}>
								<Text role="section">{t('Bugün 5 adım', '5 steps today')}</Text>
								<Text role="small">{t('Yaklaşık 4 dakika · tek denemede', 'About 4 minutes · one try each')}</Text>
							</Stack>
						</Stack>
						<Button block>{t('Tekrara başla', 'Start review')}</Button>
					</Stack>
				</Card>
				<List>
					{REVIEWS.map(([kind, micro, topic, stage]) => (
						<ListRow key={`${kind}${micro}`} title={kind} subtitle={`${micro} · ${topic}`} trailing={<Chip tone="module" module="lessons" size="sm">{t(`${stage}. tekrar`, `Round ${stage}`)}</Chip>} />
					))}
				</List>
				<Stack row gap={8} style={{padding: '0 4px'}}>
					<Icon name="calendar" size={16} color={colors.muted} />
					<Text role="small">{t('Yarın 3 adım daha gelecek.', '3 more steps tomorrow.')}</Text>
				</Stack>
			</Content>
		</ModuleScreen>
	);
};

/* ------------------------------------------------------------------ konu girişi */

export const LessonTopicIntroScreen: React.FC = () => {
	const colors = useColors();
	const states = microStates(1);
	return (
		<Screen bar={<TitleBar text="Türkçe · TYT" />} foot={<Main>Mecaz anlam ile devam et</Main>}>
			<Hero />
			<VideoRow title={`Videoyu izle · ${TOPIC.video}`} sub="Mecaz anlam bölümü 1:38'de" />
			<div>
				{MICRO_LESSONS.slice(0, 8).map(([name, steps], index) => (
					<MapRow key={name} index={index + 1} name={name} state={states[index]} meta={`${steps} adım`} />
				))}
				<Stack row gap={12} style={{height: 40}}>
					<div style={{width: 32, height: 32, borderRadius: 16, background: colors.line2, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<Text role="meta" size={13} weight={800}>
							…
						</Text>
					</div>
					<Text role="headline" size={15} weight={700} color={colors.muted}>
						+5 mikro ders
					</Text>
				</Stack>
			</div>
		</Screen>
	);
};

/* ------------------------------------------------------------------ Concept · tanım */

export const ConceptContent: React.FC<{size?: number}> = ({size = 1}) => {
	const colors = useColors();
	return (
		<>
			<Kind size={12.5 * size}>Mecaz anlam · 1 / 5</Kind>
			<Title size={24 * size}>{CONCEPT.title}</Title>
			<Text role="body" size={16 * size} style={{lineHeight: `${24 * size}px`}}>
				<Rich text={CONCEPT.text} color={colors.ink} />
			</Text>
			<PlainCard gap={12}>
				<Words words={CONCEPT.sentence} highlight={CONCEPT.highlight} size={18 * size} />
				<RolePill size={13 * size}>{CONCEPT.role}</RolePill>
				<Text role="body" size={15 * size} color={colors.ink2}>
					{CONCEPT.note}
				</Text>
			</PlainCard>
			<ListenPill />
		</>
	);
};

export const LessonConceptScreen: React.FC = () => (
	<Screen bar={<StepBar done={0} />} foot={<Main>Devam</Main>}>
		<ConceptContent />
	</Screen>
);

/* ------------------------------------------------------------------ Example · örnek */

export const ExampleContent: React.FC<{size?: number}> = ({size = 1}) => {
	const colors = useColors();
	return (
		<>
			<Kind size={12.5 * size}>Terim anlam · 2 / 2</Kind>
			<Title size={24 * size}>Örnek</Title>
			<PlainCard gap={10}>
				<Text role="title" size={19 * size} style={{lineHeight: `${27 * size}px`}}>
					<Rich text="Dik üçgende **hipotenüs**, dik açının karşısındaki kenardır." />
				</Text>
				<RolePill size={13 * size}>terim anlam</RolePill>
			</PlainCard>
			<Text role="body" size={15.5 * size} color={colors.ink2} style={{lineHeight: `${23 * size}px`}}>
				<Rich text="**Hipotenüs** yalnız matematikte kullanılır ve tek bir anlamı vardır. Bir bilim, sanat ya da meslek alanına özgü anlam **terim anlamdır**." color={colors.ink} />
			</Text>
			<Feedback tone="hint" title="Dikkat" size={14.5 * size}>
				<Rich text={'Terimler günlük dilde mecaz kazanabilir: "Bu işin **matematiği** başka."'} />
			</Feedback>
			<ListenPill time="0:15" />
		</>
	);
};

export const LessonExampleScreen: React.FC = () => (
	<Screen bar={<StepBar done={1} count={2} />} foot={<Main>Devam</Main>}>
		<ExampleContent />
	</Screen>
);

/* ------------------------------------------------------------------ Rule · kural */

export const RULE_ITEMS = [
	'Yazılışı ve okunuşu aynı, anlamı farklı sözcüklerdir: **yüz** (surat) – **yüz** (sayı).',
	'Anlamları arasında **bağ yoktur**; sözlükte ayrı maddelerdir.',
	'Çok anlamlı sözcükte anlamlar arasında **bağ vardır**: kolumuz ve gömleğin **kolu**.',
	'Soruda iki anlamı karşılaştır: bağ varsa çok anlamlı, yoksa eş sesli.',
];

export const RuleContent: React.FC<{size?: number}> = ({size = 1}) => {
	const colors = useColors();
	const mod = useModuleColors('lessons');
	return (
		<>
			<Kind size={12.5 * size}>Eş sesli sözcükler · 1 / 2</Kind>
			<Title size={24 * size}>Kural</Title>
			<PlainCard gap={14}>
				{RULE_ITEMS.map((item, index) => (
					<Stack key={item} row gap={12} align="flex-start">
						<div style={{width: 26 * size, height: 26 * size, borderRadius: 13 * size, background: mod.soft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
							<Text role="meta" size={12.5 * size} weight={800} color={mod.ink}>
								{index + 1}
							</Text>
						</div>
						<Text role="body" size={15.5 * size} color={colors.ink2} style={{lineHeight: `${22 * size}px`}}>
							<Rich text={item} color={colors.ink} />
						</Text>
					</Stack>
				))}
			</PlainCard>
			<ListenPill time="0:21" />
		</>
	);
};

export const LessonRuleScreen: React.FC = () => (
	<Screen bar={<StepBar done={0} count={2} />} foot={<Main>Devam</Main>}>
		<RuleContent />
	</Screen>
);

/* ------------------------------------------------------------------ Visual · görsel */

const COMPARISON: [string, string][] = [
	['ayak', 'masanın ayağı'],
	['ağız', 'şişenin ağzı'],
	['göz', 'çekmecenin gözü'],
];

export const VisualContent: React.FC<{size?: number}> = ({size = 1}) => {
	const colors = useColors();
	const mod = useModuleColors('lessons');
	const head = (label: string, sub: string) => (
		<Stack gap={1} style={{padding: '10px 14px', background: mod.soft}}>
			<Text role="headline" size={14.5 * size} weight={800} color={mod.ink}>
				{label}
			</Text>
			<Text role="meta" size={12 * size} color={colors.ink2}>
				{sub}
			</Text>
		</Stack>
	);
	return (
		<>
			<Kind size={12.5 * size}>Temel ve yan anlam · 1 / 2</Kind>
			<Title size={24 * size}>Bağ kopmuyor</Title>
			<Card tone="flat" radius={18} padding={0} style={{overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr'}}>
				{head('Temel anlam', 'ilk akla gelen')}
				<div style={{borderLeft: `1px solid ${colors.line}`}}>{head('Yan anlam', 'temelden türeyen')}</div>
				{COMPARISON.map(([base, side]) => (
					<React.Fragment key={base}>
						<div style={{padding: '12px 14px', borderTop: `1px solid ${colors.line2}`}}>
							<Text role="headline" size={15.5 * size}>
								{base}
							</Text>
						</div>
						<div style={{padding: '12px 14px', borderTop: `1px solid ${colors.line2}`, borderLeft: `1px solid ${colors.line}`}}>
							<Text role="headline" size={15.5 * size}>
								{side}
							</Text>
						</div>
					</React.Fragment>
				))}
			</Card>
			<Text role="body" size={15.5 * size} color={colors.ink2} style={{lineHeight: `${23 * size}px`}}>
				<Rich text="Masanın ayağı da masayı **taşır**, tıpkı bizim ayağımız gibi. Yan anlamda temel anlamla **bağ korunur**; mecazda kopar." color={colors.ink} />
			</Text>
			<ListenPill time="0:18" />
		</>
	);
};

export const LessonVisualScreen: React.FC = () => (
	<Screen bar={<StepBar done={0} count={2} />} foot={<Main>Devam</Main>}>
		<VisualContent />
	</Screen>
);

/* ------------------------------------------------------------------ Choice · önce sen tahmin et */

export const PredictContent: React.FC<{size?: number}> = ({size = 1}) => {
	const colors = useColors();
	const mod = useModuleColors('lessons');
	return (
		<>
			<Kind size={12.5 * size}>Önce sen tahmin et · 2 / 5</Kind>
			<Title size={24 * size}>
				Hangi cümlede <span style={{color: mod.ink}}>soğuk</span> sözcüğü mecaz anlamda?
			</Title>
			<Choice letter="A" text="Soğuk suyla yüzünü yıkadı." size={15 * size} />
			<Choice letter="B" text="Bize soğuk bir bakış attı." look="ok" size={15 * size} />
			<Feedback tone="ok" title="Doğru tahmin" size={14.5 * size}>
				<Rich text={'İkinci cümlede **soğuk** ısı bildirmiyor; "ilgisiz, sevimsiz" anlamında. Bu bir mecazdır.'} />
			</Feedback>
			<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10}}>
				{[
					['Gerçek', '**Soğuk** suyla yüzünü yıkadı.', 'Isı bildirir.'],
					['Mecaz', 'Bize **soğuk** bir bakış attı.', 'İlgisiz, sevimsiz.'],
				].map(([head, sentence, note]) => (
					<PlainCard key={head} gap={5} padding={12} style={{borderRadius: 14}}>
						<Kind muted size={11.5 * size}>
							{head}
						</Kind>
						<Text role="small" size={14 * size} color={colors.ink}>
							<Rich text={sentence} />
						</Text>
						<Text role="small" size={13.5 * size} color={colors.muted}>
							{note}
						</Text>
					</PlainCard>
				))}
			</div>
		</>
	);
};

export const LessonPredictScreen: React.FC = () => (
	<Screen bar={<StepBar done={1} />} foot={<Main>Devam</Main>} gap={12}>
		<PredictContent />
	</Screen>
);

/* ------------------------------------------------------------------ FillBlank · boşluk doldur */

/** A wrong fill closes the step at once (one try): the right word and the reason are shown. */
export const FillContent: React.FC<{size?: number}> = ({size = 1}) => {
	const colors = useColors();
	const mod = useModuleColors('lessons');
	const chips: [string, OptionLook][] = [
		['hafif', 'idle'],
		['ağır', 'ok'],
		['tatlı', 'no'],
	];
	return (
		<>
			<Kind size={12.5 * size}>Boşluk doldur · 3 / 5</Kind>
			<Title size={24 * size}>Cümleyi mecaz anlamla tamamla</Title>
			<PlainCard>
				<Text role="headline" size={18 * size} weight={800} style={{lineHeight: `${32 * size}px`}}>
					Arkadaşının söylediği sözler ona çok{' '}
					<span style={{display: 'inline-block', minWidth: 64, textAlign: 'center', borderBottom: `2.5px solid ${colors.success}`, color: colors.successInk, padding: '0 4px'}}>ağır</span> geldi; o gün kimseyle konuşmadı.
				</Text>
			</PlainCard>
			<Stack row gap={10} wrap>
				{chips.map(([word, state]) => (
					<div key={word} style={{padding: '10px 20px', borderRadius: 999, border: `1.5px solid ${state === 'no' ? colors.error : state === 'ok' ? colors.success : colors.line}`, background: state === 'no' ? colors.errorSoft : state === 'ok' ? colors.successSoft : colors.card}}>
						<Text role="headline" size={16 * size} weight={800} color={state === 'no' ? colors.errorInk : state === 'ok' ? colors.successInk : colors.ink}>
							{word}
						</Text>
					</div>
				))}
			</Stack>
			<Feedback tone="no" title="Doğrusu: ağır" size={14.5 * size}>
				<Rich text={'Sözler tartıyla ölçülmez. **Ağır** burada "kırıcı, üzücü" anlamında; kimseyle konuşmadığına göre sözler onu üzmüş.'} />
			</Feedback>
			<Text role="meta" size={13 * size} color={mod.ink}>
				Bu adım tekrar listene eklendi; yarın yeniden gelecek.
			</Text>
		</>
	);
};

export const LessonFillScreen: React.FC = () => (
	<Screen bar={<StepBar done={2} />} foot={<Main>Devam</Main>}>
		<FillContent />
	</Screen>
);

/* ------------------------------------------------------------------ TrueFalse · doğru mu, yanlış mı? */

export const TrueFalseContent: React.FC<{size?: number}> = ({size = 1}) => (
	<>
		<Kind size={12.5 * size}>Sık yapılan hata · 4 / 5</Kind>
		<Title size={24 * size}>Bu ifade doğru mu?</Title>
		<PlainCard>
			<Text role="title" size={19 * size} style={{lineHeight: `${26 * size}px`}}>
				"Somut bir sözcük her zaman gerçek anlamlıdır."
			</Text>
		</PlainCard>
		<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10}}>
			<Choice text="Doğru" center size={15 * size} />
			<Choice text="Yanlış" look="ok" center size={15 * size} />
		</div>
		<Feedback tone="ok" title="Doğru, bu ifade yanlış" size={14.5 * size}>
			<Rich text="Somut sözcükler de mecaz anlam kazanabilir: **sıcak** bir karşılama, **tatlı** bir söz. Karşılamanın sıcaklığı termometreyle ölçülmez." />
		</Feedback>
	</>
);

export const LessonTrueFalseScreen: React.FC = () => (
	<Screen bar={<StepBar done={3} />} foot={<Main>Devam</Main>}>
		<TrueFalseContent />
	</Screen>
);

/* ------------------------------------------------------------------ Order · sırala */

export const OrderContent: React.FC<{size?: number}> = ({size = 1}) => {
	const colors = useColors();
	const mod = useModuleColors('lessons');
	const steps: [string, string, number?][] = [
		['Şıklarda dene', 'aynı karşılık oturuyor mu'],
		['Sözcüğü cümlede bul', 'çevresini oku', 1],
		['Tek uyanı seç', 'çeldiriciye dikkat'],
		['Yerine bir karşılık koy', '"kiralamak" gibi', 2],
	];
	return (
		<>
			<Kind size={12.5 * size}>Sözcüğün bağlamdaki anlamı · 2 / 5</Kind>
			<Title size={24 * size}>Bağlam sorusunu çözerken hangi sırayla ilerlersin?</Title>
			<Text role="body" size={15 * size} color={colors.ink2}>
				Adımlara sırayla dokun; yanlış dokunursan geri al.
			</Text>
			<Stack gap={8}>
				{steps.map(([label, detail, order]) => (
					<Stack key={label} row gap={12} style={{padding: '12px 14px', borderRadius: 14, border: `1.5px solid ${order ? mod.line : colors.line}`, background: colors.card}}>
						<div style={{width: 30, height: 30, borderRadius: 15, boxSizing: 'border-box', border: order ? undefined : `1.5px dashed ${colors.subtle}`, background: order ? mod.action : undefined, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
							{order ? (
								<Text role="meta" size={13} weight={800} color="#FFFFFF">
									{order}
								</Text>
							) : null}
						</div>
						<Stack gap={1}>
							<Text role="headline" size={15 * size} weight={700}>
								{label}
							</Text>
							<Text role="small" size={13 * size} color={colors.muted}>
								{detail}
							</Text>
						</Stack>
					</Stack>
				))}
			</Stack>
		</>
	);
};

export const LessonOrderScreen: React.FC = () => (
	<Screen bar={<StepBar done={1} />} foot={<Ghost icon="refresh">Baştan diz</Ghost>}>
		<OrderContent />
	</Screen>
);

/* ------------------------------------------------------------------ Question · TYT tarzı soru */

/** After a wrong answer the next solution step opens; the student picks again (steps + 1 tries). */
export const QuestionContent: React.FC<{size?: number; grid?: boolean}> = ({size = 1, grid}) => {
	const colors = useColors();
	return (
		<>
			<Kind size={12.5 * size}>TYT tarzı · 5 / 5</Kind>
			<Text role="headline" size={16 * size} weight={700} color={colors.ink} style={{lineHeight: `${22 * size}px`}}>
				<Rich text={AGIR_QUESTION.stem} />
			</Text>
			<div style={{display: 'grid', gridTemplateColumns: grid ? '1fr 1fr' : '1fr', gap: 8}}>
				{AGIR_QUESTION.options.map((option, index) => (
					<Choice key={option} letter={'ABCDE'[index]} text={option} look={index === 2 ? 'no' : 'idle'} size={14 * size} />
				))}
			</div>
			<Feedback tone="hint" title="Çözüm adımı 1 / 3" size={14.5 * size}>
				<Rich text={AGIR_QUESTION.hint} />
			</Feedback>
			<Text role="meta" size={13 * size} color={colors.ink2}>
				Başka bir şık seç · 3 deneme hakkın kaldı
			</Text>
		</>
	);
};

export const LessonQuestionScreen: React.FC = () => (
	<Screen bar={<StepBar done={4} />} foot={<Ghost icon="sparkles">SinoAI’ye sor</Ghost>} gap={10}>
		<QuestionContent />
	</Screen>
);

/* ------------------------------------------------------------------ Question with a figure */

/** ABC with m(B) = 70° and m(C) = 60°: corners computed so the drawn angles match the numbers. */
export const TriangleFigure: React.FC<{width?: number}> = ({width = 280}) => {
	const colors = useColors();
	const mod = useModuleColors('lessons');
	const label = {fontFamily: 'inherit', fontSize: 15, fontWeight: 800, fill: colors.ink};
	const angle = {fontFamily: 'inherit', fontSize: 14, fontWeight: 700, fill: mod.ink};
	return (
		<svg width={width} height={(width * 246) / 280} viewBox="0 0 280 246" style={{display: 'block', alignSelf: 'center'}}>
			<polygon points="117,14 40,224 240,224" fill={mod.wash} stroke={colors.ink} strokeWidth={2.2} strokeLinejoin="round" />
			<text x={111} y={10} style={label}>
				A
			</text>
			<text x={22} y={238} style={label}>
				B
			</text>
			<text x={246} y={238} style={label}>
				C
			</text>
			<text x={104} y={58} style={angle}>
				50°
			</text>
			<text x={58} y={214} style={angle}>
				70°
			</text>
			<text x={208} y={214} style={angle}>
				x
			</text>
		</svg>
	);
};

export const LessonFigureQuestionScreen: React.FC = () => {
	const colors = useColors();
	return (
		<Screen bar={<StepBar done={2} count={4} />} gap={10}>
			<Kind>Açılar ve üçgenler · 3 / 4</Kind>
			<Text role="headline" size={16} weight={700} color={colors.ink} style={{lineHeight: '22px'}}>
				<Rich text="Şekildeki ABC üçgeninde verilenlere göre **x** kaç derecedir?" />
			</Text>
			<PlainCard padding={12}>
				<TriangleFigure width={250} />
			</PlainCard>
			<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8}}>
				{['40', '50', '60', '70', '80'].map((option, index) => (
					<Choice key={option} letter={'ABCDE'[index]} text={`${option}°`} size={15} />
				))}
			</div>
		</Screen>
	);
};

/* ------------------------------------------------------------------ mikro ders bitti */

export const MicroDoneContent: React.FC<{size?: number}> = ({size = 1}) => {
	const colors = useColors();
	const mod = useModuleColors('lessons');
	return (
		<>
			<Kind align="center" size={12.5 * size}>
				Mecaz anlam tamamlandı
			</Kind>
			<Text role="num" size={50 * size} align="center">
				3 / 4
			</Text>
			<ScoreDots marks={['ok', 'ok', 'ok', 'no']} size={40 * size} />
			<Text role="body" size={14.5 * size} align="center" color={colors.ink2}>
				tahmin · boşluk · doğru mu ilk denemede doğru
			</Text>
			<PlainCard gap={6}>
				<Kind muted size={12 * size}>
					Aklında kalsın
				</Kind>
				<Text role="body" size={15 * size} weight={600} color={colors.ink}>
					<Rich text={SUMMARY.remember} />
				</Text>
			</PlainCard>
			<Stack row gap={12} style={{padding: 12, borderRadius: 16, background: mod.soft}}>
				<Icon name="refresh" size={20 * size} color={mod.ink} />
				<Stack gap={1} grow>
					<Text role="headline" size={14.5 * size} weight={800} color={mod.ink}>
						1 adım tekrar listende
					</Text>
					<Text role="small" size={13 * size} color={colors.ink2}>
						"Ağır" sorusunu yarın yeniden soracağız.
					</Text>
				</Stack>
			</Stack>
			<PlainCard gap={0} padding={12} style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
				<div style={{width: 32, height: 32, borderRadius: 16, boxSizing: 'border-box', border: `2px solid ${mod.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<Text role="meta" size={13} weight={800} color={mod.ink}>
						3
					</Text>
				</div>
				<Stack gap={0} grow>
					<Text role="headline" size={15 * size} weight={800}>
						Sıradaki: Terim anlam
					</Text>
					<Text role="small" size={13 * size} color={colors.muted}>
						2 adım · 2 dk
					</Text>
				</Stack>
			</PlainCard>
		</>
	);
};

export const LessonMicroDoneScreen: React.FC = () => (
	<Screen
		foot={
			<>
				<Main>Terim anlama geç</Main>
				<Ghost>Konu haritasına dön</Ghost>
			</>
		}
		gap={12}
		center
	>
		<MicroDoneContent />
	</Screen>
);

/* ------------------------------------------------------------------ konu sonu */

export const TopicDoneContent: React.FC<{size?: number}> = ({size = 1}) => {
	const colors = useColors();
	return (
		<>
			<Title size={24 * size}>Toparlayalım</Title>
			<PlainCard gap={7} padding={14}>
				{SUMMARY.points.map((point) => (
					<Text key={point} role="small" size={13.5 * size} color={colors.ink}>
						<Rich text={point} />
					</Text>
				))}
			</PlainCard>
			<Feedback tone="hint" title="Dikkat" size={13.5 * size}>
				{SUMMARY.warnings.map((warning) => (
					<div key={warning}>{warning}</div>
				))}
			</Feedback>
			<PlainCard gap={6} padding={14}>
				<Kind size={12 * size}>Kamp görevi</Kind>
				{SUMMARY.task.map((item, index) => (
					<Text key={item} role="small" size={13.5 * size} color={colors.ink}>{`${index + 1}. ${item}`}</Text>
				))}
			</PlainCard>
		</>
	);
};

export const LessonTopicDoneScreen: React.FC = () => (
	<Screen
		bar={<TitleBar text={`${TOPIC.title} · 13 / 13`} icon="x" />}
		foot={
			<Button module="tests" size="lg" block icon="quiz">
				Kolay seviye testi · 20 soru · ~25 dk
			</Button>
		}
		gap={12}
	>
		<TopicDoneContent />
	</Screen>
);

/* ------------------------------------------------------------------ günlük konu hakkı */

/** POST start answered 403 PAYWALL: no subscription, or today's topic is used up. Payment is a brand surface, so its button is brand orange. */
export const LessonQuotaScreen: React.FC = () => {
	const colors = useColors();
	return (
		<Screen
			bar={<TitleBar text="Türkçe · TYT" />}
			overlay={
				<UIProvider module={undefined}>
					<Sheet height={372}>
						<Tile icon="lock" size={52} color={colors.ink2} />
						<Text role="title" size={22}>
							Bugünkü konu hakkın doldu
						</Text>
						<Text role="body">Bugün Sözcükte Anlam'ı çalıştın. Yarın yeni bir konuya başlayabilirsin; aboneliğinle her gün istediğin kadar konu çalışırsın.</Text>
						<div style={{flex: 1}} />
						<Button size="lg" block>
							Paketleri gör
						</Button>
						<Button tone="ghost" size="lg" block>
							Yarın devam ederim
						</Button>
					</Sheet>
				</UIProvider>
			}
		>
			<Hero />
			<VideoRow title={`Videoyu izle · ${TOPIC.video}`} sub="Mecaz anlam bölümü 1:38'de" />
		</Screen>
	);
};
