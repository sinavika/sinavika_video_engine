import React from 'react';
import {UIProvider, useColors, useModuleColors, useT} from '../../Context';
import {Icon, type UIIconName} from '../../Icons';
import {Bar, Button, Card, Chip, Pct, Ring, Segmented, Stack, Text, Tile} from '../../Parts/Shared';
import {Grid, ModuleBanner, ModuleHead, Panel, useInTablet, WCard} from '../../Parts/Web';
import {UI_CANVAS, UI_SHADOW} from '../../Tokens';
import {ConceptContent, Feedback, FillContent, Kind, OrderContent, PlainCard, PredictContent, QuestionContent, REVIEWS, Rich, RoundButton, SUMMARY, TOPIC, TopicBadge, TopicProgress, TopicSurvey, TrueFalseContent, VideoRow, WORK_LESSONS, WORK_TOPICS} from '../Mobile/Lessons';
import {FilterChips, ModuleWeekCard} from '../../Parts/Study';

/**
 * Dersler on the web panel. The browsing pages (lessons, topics, review) sit
 * in the panel frame; a topic opens the player where the student left off:
 * the step in the middle in the mobile step's look (~700 px), progress over
 * the whole topic on top ("Adım x / y"), "Bu konuda" and SinoAI on the right.
 * A topic is one lesson (owner, 1 and 17 Nov 2026): no topic intro, no
 * section start, no part-done page, no part timeline; "mikro ders" is never
 * written.
 */

const COLUMN = 700;

/* ------------------------------------------------------------------ Dersler · ana sayfa */

export const WebLessonsHomeScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('lessons');
	return (
		<Panel active="lessons">
			<ModuleHead
				module="lessons"
				tab={0}
				title={t('Dersler', 'Lessons')}
				sub={t('Her konuyu adım adım, etkileşimli öğren', 'Learn each topic step by step')}
				actions={
					<Button tone="ghost" icon="search">
						{t('Konu ara', 'Find topic')}
					</Button>
				}
			/>
			<Grid columns="1.5fr 1fr">
				{/* The banner is the first of the swiped slides (Kaldığın yerden, Tekrar, Ders çalış), as on the phone. */}
				<ModuleBanner module="lessons" over={t('Kaldığın yerden', 'Pick up where you left off')} title={TOPIC.title} text={t(`Türkçe · Adım 4 / ${TOPIC.steps} · ${TOPIC.minutes - 4} dakika kaldı`, `Turkish · Step 4 / ${TOPIC.steps} · ${TOPIC.minutes - 4} minutes left`)} action={t('Devam et', 'Continue')} />
				<ModuleWeekCard
					module="lessons"
					time={t('2 sa 15 dk', '2 h 15 m')}
					change={18}
					bars={[20, 35, 0, 25, 40, 15, 0]}
					stats={[
						[t('Biten konu', 'Topics done'), '3'],
						[t('Biten adım', 'Steps done'), '42'],
						[t('Seri', 'Streak'), t('5 gün', '5 days')],
					]}
				/>
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
								<Text role="meta">{done ? t(`%${Math.round((done / total) * 100)} tamamlandı`, `${Math.round((done / total) * 100)}% done`) : t('Başlamadın', 'Not started')}</Text>
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
			<ModuleHead module="lessons" tab={1} title={t('Türkçe', 'Reading & Writing')} sub={t('TYT · 15 konu · %11 tamamlandı', 'TYT · 15 topics · 11% done')} />
			{/* Lesson pills switch the lesson; the filter narrows the list. */}
			<Stack row justify="space-between" gap={18}>
				<FilterChips module="lessons" items={WORK_LESSONS.map(([tr, en]) => t(tr, en))} />
				<div style={{width: 380, flexShrink: 0}}>
					<Segmented items={[t('Tümü', 'All'), t('Süren (1)', 'In progress (1)'), t('Biten (0)', 'Done (0)')]} active={0} module="lessons" />
				</div>
			</Stack>
			<Grid columns="2fr 1fr">
				<Card padding={8}>
					{WORK_TOPICS.map(([name, count, done, minutes, firstTry], index) => {
						const now = done > 0;
						return (
							<Stack key={name} row gap={14} style={{padding: '14px 14px', borderRadius: 14, background: now ? mod.wash : undefined, borderTop: index ? `1px solid ${colors.line2}` : undefined}}>
								<TopicBadge index={index + 1} state={now ? 'now' : 'next'} size={36} />
								<Stack grow gap={2}>
									<Text role="headline">{name}</Text>
									<Text role="small">{now ? t(`%${Math.round((done / count) * 100)} tamamlandı · ilk denemede %${Math.round((firstTry ?? 0) * 100)}`, `${Math.round((done / count) * 100)}% done · ${Math.round((firstTry ?? 0) * 100)}% first try`) : t(`${count} adım · ${minutes} dk`, `${count} steps · ${minutes} min`)}</Text>
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
								<Text role="section">
									<Pct value={11} />
								</Text>
							</Ring>
							<Stack gap={8}>
								<Text role="small">{t('1 konu sürüyor · 0 konu bitti', '1 topic in progress · 0 done')}</Text>
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
					{REVIEWS.map(([kind, section, topic, stage], index) => (
						<Stack key={`${kind}${section}`} row gap={14} style={{padding: '14px 14px', borderTop: index ? `1px solid ${colors.line2}` : undefined}}>
							<Tile module="lessons" icon={(['quiz', 'edit', 'bulb', 'checkCircle', 'list'] as UIIconName[])[index]} size={40} />
							<Stack grow gap={2}>
								<Text role="headline">{kind}</Text>
								<Text role="small">{`${section} · ${topic}`}</Text>
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

/* ------------------------------------------------------------------ oynatıcı */

const LessonSide: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<div style={{width: 310, flexShrink: 0, background: colors.card, borderLeft: `1px solid ${colors.line}`, padding: 22, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 12}}>
			<Kind muted size={12.5}>
				{t('Bu konuda', 'In this topic')}
			</Kind>
			<PlainCard gap={5} padding={14} style={{borderRadius: 14}}>
				<Kind muted size={11.5}>
					{t('Tanım', 'Definition')}
				</Kind>
				<Text role="small" size={14} color={colors.ink}>
					{t('Benzetme ya da ilgiyle gerçek anlamdan ', 'A meaning that leaves the literal one ')}
					<b>{t('tamamen uzaklaşma', 'completely behind')}</b>
					{t('.', ', through likeness or link.')}
				</Text>
			</PlainCard>
			<PlainCard gap={5} padding={14} style={{borderRadius: 14}}>
				<Kind muted size={11.5}>
					{t('Sık hata', 'Common mistake')}
				</Kind>
				<Text role="small" size={14} color={colors.ink}>
					{t('Somut sözcükler de mecaz olabilir: ', 'Concrete words can be figurative too: a ')}
					<b>{t('sıcak', 'warm')}</b>
					{t(' bir karşılama.', ' welcome.')}
				</Text>
			</PlainCard>
			<VideoRow title={t('Videoda izle', 'Watch the video')} sub="1:38 – 4:18" size={14.5} />
			<div style={{flex: 1}} />
			<Button tone="ghost" icon="sparkles" block>
				{t('SinoAI’ye sor', 'Ask SinoAI')}
			</Button>
		</div>
	);
};

/**
 * The player page: the step column with the topic's progress on top and the
 * actions below, "Bu konuda" on the right. `step` is the step's place in the
 * whole topic; the section name is the second line (a section boundary is
 * crossed here, without a page of its own).
 */
export const StudyPlayer: React.FC<{step: number; review?: number; section?: string; nav: React.ReactNode; center?: boolean; children: React.ReactNode}> = ({step, review, section = 'Mecaz anlam', nav, center, children}) => {
	const colors = useColors();
	const t = useT();
	// iPhone Duo inner display: the player fills the frame, the column takes the width, the side outline stays out (the step bar's progress tells the place).
	const embedded = useInTablet();
	const column = embedded ? '100%' : COLUMN;
	return (
		<UIProvider module="lessons" web>
			<div style={{width: embedded ? '100%' : UI_CANVAS.web.width, height: embedded ? undefined : UI_CANVAS.web.height, flex: embedded ? 1 : undefined, minHeight: 0, display: 'flex', background: colors.bg, overflow: 'hidden'}}>
				<div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column'}}>
					<Stack row gap={16} style={{height: 76, padding: '0 28px', borderBottom: `1px solid ${colors.line}`, background: colors.card, flexShrink: 0}}>
						<RoundButton />
						<Stack gap={0} grow>
							<Text role="headline" size={16} weight={800}>
								{t(TOPIC.title, 'Words in Context')}
							</Text>
							<Text role="small" size={13.5} color={colors.ink2}>
								{t(`Türkçe · ${section}`, `Reading & Writing · ${section === 'Mecaz anlam' ? 'Figurative meaning' : section}`)}
							</Text>
						</Stack>
						<div style={{width: embedded ? 220 : 380}}>{review ? <TopicProgress step={step} total={review} label={['Tekrar', 'Review']} height={8} size={13.5} /> : <TopicProgress step={step} height={8} size={13.5} />}</div>
					</Stack>
					<div style={{flex: 1, minHeight: 0, display: 'flex', justifyContent: 'center', overflow: 'hidden'}}>
						<div style={{width: column, maxWidth: COLUMN, padding: embedded ? '20px 28px 12px' : '28px 0 12px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 14, justifyContent: center ? 'center' : undefined}}>{children}</div>
					</div>
					<div style={{display: 'flex', justifyContent: 'center', padding: '12px 0 24px', flexShrink: 0}}>
						<Stack row justify="space-between" gap={12} style={{width: column, maxWidth: COLUMN, padding: embedded ? '0 28px' : undefined, boxSizing: 'border-box'}}>
							{nav}
						</Stack>
					</div>
				</div>
				{embedded ? null : <LessonSide />}
			</div>
		</UIProvider>
	);
};

/** English labels of the player's buttons (the English drawings never show Turkish). */
const PLAYER_EN: Record<string, string> = {'Önceki adım': 'Previous step', Devam: 'Continue', 'Kontrol et': 'Check', Cevapla: 'Answer', Sonraki: 'Next', Bitir: 'Finish', 'Konuyu bitir': 'Finish topic', Tekrarla: 'Review', Gönder: 'Submit'};

export const Back: React.FC<{children?: string; icon?: UIIconName}> = ({children = 'Önceki adım', icon = 'left'}) => {
	const t = useT();
	return (
		<Button tone="ghost" size="lg" icon={icon}>
			{t(children, PLAYER_EN[children] ?? children)}
		</Button>
	);
};

export const Main: React.FC<{children: string}> = ({children}) => {
	const t = useT();
	return <Button size="lg">{t(children, PLAYER_EN[children] ?? children)}</Button>;
};

export const WebLessonConceptScreen: React.FC = () => (
	<StudyPlayer
		step={TOPIC.before + 1}
		nav={
			<>
				<Back />
				<Main>Devam</Main>
			</>
		}
	>
		<ConceptContent size={1.15} />
	</StudyPlayer>
);

export const WebLessonPredictScreen: React.FC = () => (
	<StudyPlayer
		step={TOPIC.before + 2}
		nav={
			<>
				<Back />
				<Main>Devam</Main>
			</>
		}
	>
		<PredictContent size={1.1} />
	</StudyPlayer>
);

export const WebLessonFillScreen: React.FC = () => (
	<StudyPlayer
		step={TOPIC.before + 3}
		nav={
			<>
				<Back />
				<Main>Devam</Main>
			</>
		}
	>
		<FillContent size={1.1} />
	</StudyPlayer>
);

export const WebLessonTrueFalseScreen: React.FC = () => (
	<StudyPlayer
		step={TOPIC.before + 4}
		nav={
			<>
				<Back />
				<Main>Devam</Main>
			</>
		}
	>
		<TrueFalseContent size={1.1} />
	</StudyPlayer>
);

export const WebLessonQuestionScreen: React.FC = () => {
	const colors = useColors();
	return (
		<StudyPlayer
			step={TOPIC.before + 5}
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
	<StudyPlayer
		step={24}
		section="Sözcüğün bağlamdaki anlamı"
		nav={
			<>
				<Back icon="refresh">Baştan diz</Back>
				<Main>Kontrol et</Main>
			</>
		}
	>
		<OrderContent size={1.1} />
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
					<Kind>{`${TOPIC.title} · ${TOPIC.steps} / ${TOPIC.steps} adım`}</Kind>
					<Text role="display" size={32}>
						Toparlayalım
					</Text>
				</Stack>
				<Stack row gap={10}>
					<Chip tone="success" icon="checkCircle">
						{t('30 adımın 26’sı ilk denemede doğru', '26 of 30 steps right first time')}
					</Chip>
					<Button tone="moduleSoft" module="lessons" size="sm" icon="upload">
						{t('Paylaş', 'Share')}
					</Button>
				</Stack>
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
					<Stack row gap={10}>
						<Button tone="ghost" icon="refresh" style={{flex: 1}}>
							{t('Konuyu baştan oku', 'Read the topic again')}
						</Button>
						<Button tone="ghost" style={{flex: 1}}>
							{t('Konulara dön', 'Back to topics')}
						</Button>
					</Stack>
					<TopicSurvey />
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
	['Question', 'Sınav tarzı soru', 'quiz'],
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
						<Text role="body">Konu tek derstir: öğrenciyle konuşan adımlarla baştan sona ilerler; kalınan yerden açılır.</Text>
					</Stack>
					<Text role="meta">{`Örnek: TYT Türkçe · ${TOPIC.title} · ${TOPIC.steps} adım`}</Text>
				</Stack>

				<Stack row align="stretch" gap={0}>
					<FlowBox title="Konuya dokun" text="Oynatıcı kaldığın adımdan açılır; giriş ekranı yok." icon="target" tone="module" />
					<Arrow label="açılır" />
					<div style={{flex: 1, borderRadius: 22, border: `2px dashed ${mod.line}`, background: mod.wash, padding: 14, display: 'flex', flexDirection: 'column', gap: 10}}>
						<Stack row justify="space-between">
							<Text role="headline" color={mod.ink}>
								{`Oynatıcı · Adım 1 → ${TOPIC.steps}`}
							</Text>
							<Chip tone="module" module="lessons" size="sm" icon="refresh">
								bölüm geçişi aynı ekranda
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
					<Arrow label="son adım" />
					<FlowBox title="Konu sonu" text="Özet, dikkat notları, kamp görevi, paylaş, anket; teste geçiş." icon="checkCircle" tone="module" width={200} />
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
							<Arrow vertical label="Sınav tarzı soruda yanlış" />
							<FlowBox title="Çözüm adımları" text="Her yanlışta bir çözüm adımı açılır; öğrenci yeniden seçer. Adımlar bitince doğru şık gösterilir." icon="bulb" tone="soft" width={250} />
						</Stack>
						<div style={{flex: 1}} />
					</Stack>
					<Stack gap={8} align="center" style={{width: 200}}>
						<Arrow vertical label="testlere ve kartlara" />
					</Stack>
				</Stack>

				<Stack row justify="flex-end" gap={14} align="flex-start" style={{marginTop: -10}}>
					<FlowBox title="Testler" text="Kolay, Orta, Zor · 20'şer soru. Konu sonundan doğrudan Kolay'a." icon="quiz" tone="tests" width={250} />
					<FlowBox title="Bilgi Kartları" text="Konunun kartları Bilgi Kartları'nda; tekrar orada da sürer." icon="cards" tone="cards" width={250} />
					<FlowBox title="Video" text={`Aynı ders ${TOPIC.video}; adımdan ilgili yere atlanır.`} icon="video" tone="soft" width={250} />
				</Stack>
			</div>
		</UIProvider>
	);
};
