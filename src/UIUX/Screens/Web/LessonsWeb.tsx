import React from 'react';
import {UIProvider, useColors, useModuleColors, useT} from '../../Context';
import {Icon, type UIIconName} from '../../Icons';
import {Bar, Button, Card, Chip, Ring, Stack, Text, Tile} from '../../Parts/Shared';
import {Grid, ModuleBanner, ModuleHead, Panel, WCard} from '../../Parts/Web';
import {UI_CANVAS, UI_SHADOW} from '../../Tokens';
import {
	ConceptContent,
	Feedback,
	FillContent,
	Hero,
	Kind,
	MapRow,
	MICRO_LESSONS,
	MicroDoneContent,
	microStates,
	OrderContent,
	PlainCard,
	PredictContent,
	QuestionContent,
	REVIEWS,
	Rich,
	RoundButton,
	Segments,
	SUMMARY,
	TOPIC,
	TopicBadge,
	TrueFalseContent,
	VideoRow,
	WORK_LESSONS,
	WORK_TOPICS,
} from '../Mobile/Lessons';

/**
 * Dersler on the web panel. The browsing pages (lessons, topics, review, the
 * topic intro) sit in the panel frame; a micro-lesson opens the player: the
 * micro-lessons as a timeline on the left, the step in the middle in the
 * mobile step's look (~700 px), "Bu mikro derste" and SinoAI on the right.
 */

const COLUMN = 700;

/* ------------------------------------------------------------------ Dersler · ana sayfa */

export const WebLessonsHomeScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('lessons');
	return (
		<Panel active="lessons">
			<ModuleHead module="lessons" tab={0} title={t('Dersler', 'Lessons')} sub={t('Konuları mikro derslerle, adım adım öğren', 'Learn each topic in micro-lessons, step by step')} actions={<Button tone="ghost" icon="search">{t('Konu ara', 'Find topic')}</Button>} />
			<Grid columns="1.5fr 1fr">
				<ModuleBanner module="lessons" over={t('Kaldığın yerden', 'Pick up where you left off')} title={t('Mecaz anlam', 'Figurative meaning')} text={t('Türkçe · Sözcükte Anlam · 2 / 5 adım · 3 dakika kaldı', 'Turkish · Word meaning · step 2 / 5 · 3 minutes left')} action={t('Devam et', 'Continue')} />
				<WCard title={t('Tekrar zamanı', 'Time to review')}>
					<Stack gap={14}>
						<Stack row gap={14}>
							<Tile module="lessons" icon="refresh" size={48} />
							<Stack gap={2} grow>
								<Text role="section">{t('Bugün 5 adım', '5 steps today')}</Text>
								<Text role="small">{t('İlk denemede yanlış yaptığın adımlar, yaklaşık 4 dakika.', 'Steps you missed, about 4 minutes.')}</Text>
							</Stack>
						</Stack>
						<Button block>{t('Tekrara başla', 'Start review')}</Button>
					</Stack>
				</WCard>
			</Grid>
			<Stack row justify="space-between" align="flex-end">
				<Text role="section">TYT</Text>
				<Text role="small">{t('10 ders · 168 konu', '10 subjects · 168 topics')}</Text>
			</Stack>
			<Grid columns="repeat(4, 1fr)" gap={14}>
				{[...WORK_LESSONS, ['Fizik', 'Physics', 0, 64, 11] as [string, string, number, number, number], ['Kimya', 'Chemistry', 0, 58, 10] as [string, string, number, number, number], ['Geometri', 'Geometry', 0, 151, 23] as [string, string, number, number, number]].map(([tr, en, done, total, topics]) => (
					<Card key={tr} padding={16}>
						<Stack row gap={12}>
							<Tile module="lessons" icon="book" size={40} />
							<Stack grow gap={6}>
								<Stack row justify="space-between">
									<Text role="headline">{t(tr, en)}</Text>
									<Text role="meta">{t(`${topics} konu`, `${topics} topics`)}</Text>
								</Stack>
								<Bar value={Math.max(done / total, 0.02)} color={mod.color} track={mod.track} height={6} />
								<Text role="meta">{t(`${done} / ${total} mikro ders`, `${done} / ${total} micro-lessons`)}</Text>
							</Stack>
						</Stack>
					</Card>
				))}
			</Grid>
			<Stack row gap={14}>
				<Text role="section">AYT</Text>
				<Card padding={14} style={{flex: 1}}>
					<Stack row gap={12}>
						<Tile module="lessons" icon="book" size={36} />
						<Text role="headline" style={{flex: 1}}>
							{t('Türk Dili ve Edebiyatı · 16 konu', 'Turkish Literature · 16 topics')}
						</Text>
						<Icon name="right" size={18} color={colors.subtle} />
					</Stack>
				</Card>
				<Card tone="flat" padding={14} style={{flex: 1, background: colors.line2}}>
					<Stack row gap={12}>
						<Tile icon="book" size={36} color={colors.muted} />
						<Text role="headline" color={colors.muted} style={{flex: 1}}>
							{t('Matematik', 'Maths')}
						</Text>
						<Chip size="sm">{t('Yakında', 'Soon')}</Chip>
					</Stack>
				</Card>
			</Stack>
		</Panel>
	);
};

/* ------------------------------------------------------------------ Dersler · konular */

export const WebLessonsTopicsScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('lessons');
	return (
		<Panel active="lessons" crumb={t('Dersler ›', 'Lessons ›')}>
			<ModuleHead module="lessons" tab={1} title={t('Türkçe', 'Turkish')} sub={t('TYT · 15 konu · 14 / 125 mikro ders', 'TYT · 15 topics · 14 / 125 micro-lessons')} />
			<Grid columns="2fr 1fr">
				<Card padding={8}>
					{WORK_TOPICS.map(([name, count, done, minutes, firstTry], index) => {
						const now = done > 0;
						return (
							<Stack key={name} row gap={14} style={{padding: '14px 14px', borderRadius: 14, background: now ? mod.wash : undefined, borderTop: index ? `1px solid ${colors.line2}` : undefined}}>
								<TopicBadge index={index + 1} state={now ? 'now' : 'next'} size={36} />
								<Stack grow gap={2}>
									<Text role="headline">{name}</Text>
									<Text role="small">{now ? t(`${done} / ${count} mikro ders · ilk denemede %${Math.round((firstTry ?? 0) * 100)}`, `${done} / ${count} micro-lessons · ${Math.round((firstTry ?? 0) * 100)}% first try`) : t(`${count} mikro ders · ${minutes} dk`, `${count} micro-lessons · ${minutes} min`)}</Text>
								</Stack>
								<div style={{width: 120}}>
									<Bar value={Math.max(done / count, 0.02)} color={mod.color} track={mod.track} height={6} />
								</div>
								{now ? (
									<Button tone="module" module="lessons" size="sm">
										{t('Devam et', 'Continue')}
									</Button>
								) : (
									<Button tone="ghost" size="sm">
										{t('Başla', 'Start')}
									</Button>
								)}
							</Stack>
						);
					})}
				</Card>
				<Stack gap={18}>
					<WCard title={t('Türkçe ilerlemen', 'Your Turkish progress')}>
						<Stack row gap={18}>
							<Ring value={0.11} size={92} stroke={9} color={mod.color} track={mod.track}>
								<Text role="section">%11</Text>
							</Ring>
							<Stack gap={8}>
								<Text role="small">{t('1 konu başladı · 14 mikro ders bitti', '1 topic started · 14 micro-lessons done')}</Text>
								<Text role="small">{t('İlk denemede doğru: %75', 'Right first time: 75%')}</Text>
								<Text role="small">{t('Bu hafta 1 sa 20 dk', '1 h 20 min this week')}</Text>
							</Stack>
						</Stack>
					</WCard>
					<WCard title={t('Tekrar', 'Review')}>
						<Text role="small">{t('Türkçe’den 4 adım bugün tekrar zamanında.', '4 Turkish steps are due today.')}</Text>
					</WCard>
				</Stack>
			</Grid>
		</Panel>
	);
};

/* ------------------------------------------------------------------ Dersler · tekrar */

export const WebLessonsReviewScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<Panel active="lessons">
			<ModuleHead module="lessons" tab={2} title={t('Tekrar', 'Review')} sub={t('İlk denemede yanlış yaptığın adımlar 1, 3 ve 7 gün sonra yeniden gelir', 'Steps you missed come back after 1, 3 and 7 days')} />
			<Grid columns="1fr 2fr">
				<Card tone="moduleLine" module="lessons" padding={22}>
					<Stack gap={14}>
						<Tile module="lessons" icon="refresh" size={52} />
						<Text role="title" size={24}>
							{t('Bugün 5 adım', '5 steps today')}
						</Text>
						<Text role="small">{t('Yaklaşık 4 dakika. Her adımı bir kez cevaplarsın; doğruysa bir sonraki tekrar daha geç gelir.', 'About 4 minutes. One try per step; a right answer pushes the next review further out.')}</Text>
						<Button size="lg" block>
							{t('Tekrara başla', 'Start review')}
						</Button>
						<Stack row gap={8}>
							<Icon name="calendar" size={16} color={colors.muted} />
							<Text role="small">{t('Yarın 3 adım daha gelecek.', '3 more steps tomorrow.')}</Text>
						</Stack>
					</Stack>
				</Card>
				<Card padding={8}>
					{REVIEWS.map(([kind, micro, topic, stage], index) => (
						<Stack key={`${kind}${micro}`} row gap={14} style={{padding: '14px 14px', borderTop: index ? `1px solid ${colors.line2}` : undefined}}>
							<Tile module="lessons" icon={(['quiz', 'edit', 'bulb', 'checkCircle', 'list'] as UIIconName[])[index]} size={40} />
							<Stack grow gap={2}>
								<Text role="headline">{kind}</Text>
								<Text role="small">{`${micro} · ${topic}`}</Text>
							</Stack>
							<Chip tone="module" module="lessons" size="sm">
								{t(`${stage}. tekrar`, `Round ${stage}`)}
							</Chip>
						</Stack>
					))}
				</Card>
			</Grid>
		</Panel>
	);
};

/* ------------------------------------------------------------------ konu girişi */

export const WebLessonTopicIntroScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('lessons');
	const states = microStates(1);
	return (
		<Panel active="lessons" crumb={t('Dersler › Türkçe ›', 'Lessons › Turkish ›')}>
			<Grid columns="1fr 1.05fr" gap={22} style={{alignItems: 'start'}}>
				<Stack gap={16}>
					<Hero size={28} />
					<PlainCard gap={10} padding={20}>
						<Kind muted>Bu konuda</Kind>
						{['Gerçek, yan, mecaz ve terim anlamı ayırmak', 'Bağlamdaki anlam sorularını adım adım çözmek'].map((goal) => (
							<Stack key={goal} row gap={10}>
								<Icon name="checkCircle" size={18} color={mod.color} />
								<Text role="body" color={colors.ink}>
									{goal}
								</Text>
							</Stack>
						))}
					</PlainCard>
					<VideoRow title={`Videoyu izle · ${TOPIC.video}`} sub="Mecaz anlam bölümü 1:38'de" size={16} />
					<Button size="lg" block>
						Mecaz anlam ile devam et
					</Button>
				</Stack>
				<PlainCard gap={8} padding={22}>
					<Kind muted size={12.5}>
						Yol haritası · 13 mikro ders · 34 dk
					</Kind>
					<div>
						{MICRO_LESSONS.map(([name, steps], index) => (
							<MapRow key={name} index={index + 1} name={name} state={states[index]} meta={`${steps} adım`} dot={30} size={15} height={42} last={index === MICRO_LESSONS.length - 1} />
						))}
					</div>
				</PlainCard>
			</Grid>
		</Panel>
	);
};

/* ------------------------------------------------------------------ oynatıcı */

const MicroTimeline: React.FC<{now: number}> = ({now}) => {
	const colors = useColors();
	const states = microStates(now);
	return (
		<div style={{width: 290, flexShrink: 0, background: colors.card, borderRight: `1px solid ${colors.line}`, padding: '22px 22px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 10}}>
			<Kind size={12.5}>{TOPIC.title}</Kind>
			<div>
				{MICRO_LESSONS.map(([name, steps], index) => (
					<MapRow key={name} index={index + 1} name={name} state={states[index]} meta={states[index] === 'now' ? `${steps} adım` : undefined} dot={28} size={14} height={44} last={index === MICRO_LESSONS.length - 1} />
				))}
			</div>
		</div>
	);
};

const LessonSide: React.FC = () => {
	const colors = useColors();
	return (
		<div style={{width: 310, flexShrink: 0, background: colors.card, borderLeft: `1px solid ${colors.line}`, padding: 22, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 12}}>
			<Kind muted size={12.5}>
				Bu mikro derste
			</Kind>
			<PlainCard gap={5} padding={14} style={{borderRadius: 14}}>
				<Kind muted size={11.5}>
					Tanım
				</Kind>
				<Text role="small" size={14} color={colors.ink}>
					Benzetme ya da ilgiyle gerçek anlamdan <b>tamamen uzaklaşma</b>.
				</Text>
			</PlainCard>
			<PlainCard gap={5} padding={14} style={{borderRadius: 14}}>
				<Kind muted size={11.5}>
					Sık hata
				</Kind>
				<Text role="small" size={14} color={colors.ink}>
					Somut sözcükler de mecaz olabilir: <b>sıcak</b> bir karşılama.
				</Text>
			</PlainCard>
			<VideoRow title="Videoda izle" sub="1:38 – 4:18" size={14.5} />
			<div style={{flex: 1}} />
			<Button tone="ghost" icon="sparkles" block>
				SinoAI’ye sor
			</Button>
		</div>
	);
};

/** The player page: timeline, the step column with its bar and the actions, and "Bu mikro derste". */
const StudyPlayer: React.FC<{now?: number; done: number; current?: boolean; step: string; nav: React.ReactNode; center?: boolean; children: React.ReactNode}> = ({now = 1, done, current = true, step, nav, center, children}) => {
	const colors = useColors();
	return (
		<UIProvider module="lessons" web>
			<div style={{width: UI_CANVAS.web.width, height: UI_CANVAS.web.height, display: 'flex', background: colors.bg, overflow: 'hidden'}}>
				<MicroTimeline now={now} />
				<div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column'}}>
					<Stack row gap={16} style={{height: 76, padding: '0 28px', borderBottom: `1px solid ${colors.line}`, background: colors.card, flexShrink: 0}}>
						<RoundButton />
						<Stack gap={0} grow>
							<Text role="headline" size={16} weight={800}>
								Mecaz anlam
							</Text>
							<Text role="small" size={13.5} color={colors.ink2}>{`${TOPIC.title} · ${step}`}</Text>
						</Stack>
						<div style={{width: 300}}>
							<Segments done={done} current={current} height={8} />
						</div>
					</Stack>
					<div style={{flex: 1, minHeight: 0, display: 'flex', justifyContent: 'center', overflow: 'hidden'}}>
						<div style={{width: COLUMN, padding: '28px 0 12px', display: 'flex', flexDirection: 'column', gap: 14, justifyContent: center ? 'center' : undefined}}>{children}</div>
					</div>
					<div style={{display: 'flex', justifyContent: 'center', padding: '12px 0 24px', flexShrink: 0}}>
						<Stack row justify="space-between" gap={12} style={{width: COLUMN}}>
							{nav}
						</Stack>
					</div>
				</div>
				<LessonSide />
			</div>
		</UIProvider>
	);
};

const Back: React.FC<{children?: string; icon?: UIIconName}> = ({children = 'Önceki adım', icon = 'left'}) => (
	<Button tone="ghost" size="lg" icon={icon}>
		{children}
	</Button>
);

const Main: React.FC<{children: string}> = ({children}) => <Button size="lg">{children}</Button>;

export const WebLessonConceptScreen: React.FC = () => (
	<StudyPlayer done={0} step="adım 1 / 5" nav={<><Back /><Main>Devam</Main></>}>
		<ConceptContent size={1.15} />
	</StudyPlayer>
);

export const WebLessonPredictScreen: React.FC = () => (
	<StudyPlayer done={1} step="adım 2 / 5" nav={<><Back /><Main>Devam</Main></>}>
		<PredictContent size={1.1} />
	</StudyPlayer>
);

export const WebLessonFillScreen: React.FC = () => (
	<StudyPlayer done={2} step="adım 3 / 5" nav={<><Back /><Main>Devam</Main></>}>
		<FillContent size={1.1} />
	</StudyPlayer>
);

export const WebLessonTrueFalseScreen: React.FC = () => (
	<StudyPlayer done={3} step="adım 4 / 5" nav={<><Back /><Main>Devam</Main></>}>
		<TrueFalseContent size={1.1} />
	</StudyPlayer>
);

export const WebLessonQuestionScreen: React.FC = () => {
	const colors = useColors();
	return (
		<StudyPlayer
			done={4}
			step="adım 5 / 5"
			nav={
				<>
					<Back />
					<Text role="small" color={colors.ink2} style={{alignSelf: 'center'}}>
						Başka bir şık seç ya da 1–5 tuşlarını kullan
					</Text>
				</>
			}
		>
			<QuestionContent size={1.05} grid />
		</StudyPlayer>
	);
};

export const WebLessonOrderScreen: React.FC = () => (
	<StudyPlayer now={11} done={1} step="adım 2 / 5" nav={<><Back icon="refresh">Baştan diz</Back><Main>Kontrol et</Main></>}>
		<OrderContent size={1.1} />
	</StudyPlayer>
);

export const WebLessonMicroDoneScreen: React.FC = () => (
	<StudyPlayer now={2} done={5} current={false} step="tamamlandı" center nav={<><Back icon="tree">Konu haritası</Back><Main>Terim anlama geç</Main></>}>
		<MicroDoneContent size={1.05} />
	</StudyPlayer>
);

/* ------------------------------------------------------------------ konu sonu */

export const WebLessonTopicDoneScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<Panel active="lessons" crumb={t('Dersler › Türkçe › Sözcükte Anlam ›', 'Lessons › Turkish › Word meaning ›')}>
			<Stack row justify="space-between" align="flex-end">
				<Stack gap={4}>
					<Kind>{`${TOPIC.title} · 13 / 13 mikro ders`}</Kind>
					<Text role="display" size={32}>
						Toparlayalım
					</Text>
				</Stack>
				<Chip tone="success" icon="checkCircle">
					İlk denemede %75 doğru
				</Chip>
			</Stack>
			<Grid columns="1.4fr 1fr" gap={22} style={{alignItems: 'start'}}>
				<PlainCard gap={12} padding={24}>
					{SUMMARY.points.map((point) => (
						<Stack key={point} row gap={12} align="flex-start">
							<Icon name="check" size={18} color={colors.success} />
							<Text role="body" size={16} color={colors.ink}>
								<Rich text={point} />
							</Text>
						</Stack>
					))}
				</PlainCard>
				<Stack gap={16}>
					<Feedback tone="hint" title="Dikkat">
						{SUMMARY.warnings.map((warning) => (
							<div key={warning}>{warning}</div>
						))}
					</Feedback>
					<PlainCard gap={8} padding={18}>
						<Kind>Kamp görevi</Kind>
						{SUMMARY.task.map((item, index) => (
							<Text key={item} role="body" color={colors.ink}>{`${index + 1}. ${item}`}</Text>
						))}
					</PlainCard>
					<Button module="tests" size="lg" block icon="quiz">
						Kolay seviye testi · 20 soru · ~25 dk
					</Button>
				</Stack>
			</Grid>
		</Panel>
	);
};

/* ------------------------------------------------------------------ akış panosu */

const {width: W, height: H} = UI_CANVAS.web;

const FlowBox: React.FC<{title: string; text: string; icon: UIIconName; tone?: 'module' | 'soft' | 'tests' | 'cards' | 'review'; width?: number}> = ({title, text, icon, tone = 'soft', width = 210}) => {
	const colors = useColors();
	const mod = useModuleColors('lessons');
	const tests = useModuleColors('tests');
	const cards = useModuleColors('flashcards');
	const look = {
		module: {bg: mod.gradient, ink: '#FFFFFF', sub: '#FFFFFF', tile: 'rgba(255,255,255,0.2)', icon: '#FFFFFF', line: 'transparent'},
		soft: {bg: colors.card, ink: colors.ink, sub: colors.muted, tile: mod.soft, icon: mod.color, line: mod.line},
		tests: {bg: colors.card, ink: colors.ink, sub: colors.muted, tile: tests.soft, icon: tests.color, line: tests.line},
		cards: {bg: colors.card, ink: colors.ink, sub: colors.muted, tile: cards.soft, icon: cards.color, line: cards.line},
		review: {bg: colors.warningSoft, ink: colors.warningInk, sub: colors.ink2, tile: colors.card, icon: colors.warning, line: 'transparent'},
	}[tone];
	return (
		<div style={{width, boxSizing: 'border-box', padding: 14, borderRadius: 18, background: look.bg, border: `1.5px solid ${look.line}`, boxShadow: UI_SHADOW.card, display: 'flex', flexDirection: 'column', gap: 8}}>
			<Stack row gap={10}>
				<div style={{width: 34, height: 34, borderRadius: 11, background: look.tile, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
					<Icon name={icon} size={18} color={look.icon} />
				</div>
				<Text role="headline" size={14.5} color={look.ink}>
					{title}
				</Text>
			</Stack>
			<Text role="small" size={12.5} color={look.sub} style={{lineHeight: '17px'}}>
				{text}
			</Text>
		</div>
	);
};

const Arrow: React.FC<{label?: string; vertical?: boolean; color?: string}> = ({label, vertical, color}) => {
	const colors = useColors();
	const ink = color ?? colors.muted;
	return (
		<Stack align="center" justify="center" gap={2} style={{width: vertical ? undefined : 56, flexShrink: 0}}>
			<Icon name={vertical ? 'down' : 'right'} size={22} color={ink} stroke={2.6} />
			{label ? (
				<Text role="meta" size={12} color={ink} align="center">
					{label}
				</Text>
			) : null}
		</Stack>
	);
};

const STEP_KINDS: [string, string, UIIconName][] = [
	['Concept', 'Tanım', 'book'],
	['Example', 'Örnek', 'file'],
	['Rule', 'Kural', 'list'],
	['Visual', 'Görsel', 'layers'],
	['Choice', 'Önce sen tahmin et', 'bulb'],
	['TrueFalse', 'Doğru mu, yanlış mı?', 'checkCircle'],
	['Order', 'Sırala', 'refresh'],
	['FillBlank', 'Boşluk doldur', 'edit'],
	['Question', 'TYT tarzı soru', 'quiz'],
];

export const WebLessonFlowBoardScreen: React.FC = () => {
	const colors = useColors();
	const mod = useModuleColors('lessons');
	return (
		<UIProvider module="lessons" web>
			<div style={{width: W, height: H, background: colors.bg, padding: '34px 44px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 22}}>
				<Stack row justify="space-between" align="flex-end">
					<Stack gap={4}>
						<Chip tone="module" module="lessons" icon="book" size="sm">
							Dersler
						</Chip>
						<Text role="display" size={30}>
							Bir konunun akışı
						</Text>
						<Text role="body">Konu mikro derslere bölünür; her mikro ders öğrenciyle konuşan adımlarla ilerler.</Text>
					</Stack>
					<Text role="meta">Örnek: TYT Türkçe · Sözcükte Anlam · 13 mikro ders</Text>
				</Stack>

				<Stack row align="stretch" gap={0}>
					<FlowBox title="Konu girişi" text="Kanca cümlesi, hedefler, video ve mikro derslerin yol haritası." icon="target" tone="module" />
					<Arrow label="Devam et" />
					<div style={{flex: 1, borderRadius: 22, border: `2px dashed ${mod.line}`, background: mod.wash, padding: 14, display: 'flex', flexDirection: 'column', gap: 10}}>
						<Stack row justify="space-between">
							<Text role="headline" color={mod.ink}>
								Mikro ders · 2–6 dk
							</Text>
							<Chip tone="module" module="lessons" size="sm" icon="refresh">
								13 kez, sırayla
							</Chip>
						</Stack>
						<Stack row gap={6} wrap>
							{STEP_KINDS.map(([code, label, icon]) => (
								<Stack key={code} row gap={7} style={{padding: '7px 10px', borderRadius: 12, background: colors.card, border: `1px solid ${colors.line}`}}>
									<Icon name={icon} size={15} color={mod.color} />
									<Stack gap={0}>
										<Text role="small" size={12.5} weight={700} color={colors.ink}>
											{label}
										</Text>
										<Text role="meta" size={12} color={colors.muted}>
											{code}
										</Text>
									</Stack>
								</Stack>
							))}
						</Stack>
						<Text role="meta" color={colors.ink2}>
							Her adım senaryodaki bir kart. Etkileşimli adımın cevabını sunucu denetler; anlatım adımları dinlenebilir.
						</Text>
					</div>
					<Arrow label="adımlar bitti" />
					<FlowBox title="Mikro ders bitti" text="İlk denemede kaç doğru, akılda kalacak tek cümle, sıradaki mikro ders." icon="award" tone="soft" width={200} />
				</Stack>

				<Stack row align="flex-start" gap={0}>
					<div style={{width: 266}} />
					<Stack row gap={0} align="flex-start" style={{flex: 1}}>
						<Stack gap={8} align="center" style={{width: 250}}>
							<Arrow vertical label="ilk denemede yanlış" />
							<FlowBox title="Tekrar" text="Adım tekrar listesine girer: 1, 3 ve 7 gün sonra yeniden sorulur; Dersler'in Tekrar sekmesinde." icon="refresh" tone="review" width={250} />
						</Stack>
						<div style={{width: 24}} />
						<Stack gap={8} align="center" style={{width: 250}}>
							<Arrow vertical label="TYT sorusunda yanlış" />
							<FlowBox title="Çözüm adımları" text="Her yanlışta bir çözüm adımı açılır; öğrenci yeniden seçer. Adımlar bitince doğru şık gösterilir." icon="bulb" tone="soft" width={250} />
						</Stack>
						<div style={{flex: 1}} />
					</Stack>
					<Stack gap={8} align="center" style={{width: 200}}>
						<Arrow vertical label="son mikro dersten sonra" />
						<FlowBox title="Konu sonu" text="Özet, dikkat notları ve kamp görevi; teste geçiş." icon="checkCircle" tone="module" width={200} />
					</Stack>
				</Stack>

				<Stack row gap={14} align="center" style={{marginTop: -8}}>
					<Stack row gap={8} style={{padding: '8px 14px', borderRadius: 14, background: colors.card, border: `1px solid ${colors.line}`, marginLeft: 430}}>
						<Icon name="refresh" size={16} color={mod.color} />
						<Text role="small" weight={700} color={colors.ink2}>
							Mikro ders bitti → sonraki mikro ders
						</Text>
					</Stack>
					<div style={{flex: 1}} />
					<Stack align="center" style={{width: 200}}>
						<Arrow vertical label="testlere ve kartlara" />
					</Stack>
				</Stack>
				<Stack row justify="flex-end" gap={14} align="flex-start" style={{marginTop: -10}}>
					<FlowBox title="Testler" text="Kolay, Orta, Zor · 20'şer soru. Konu sonundan doğrudan Kolay'a." icon="quiz" tone="tests" width={250} />
					<FlowBox title="Bilgi Kartları" text="Konunun kartları Bilgi Kartları'nda; tekrar orada da sürer." icon="cards" tone="cards" width={250} />
					<FlowBox title="Video" text={`Aynı ders ${TOPIC.video}; mikro dersten ilgili bölüme atlanır.`} icon="video" tone="soft" width={250} />
				</Stack>
			</div>
		</UIProvider>
	);
};
