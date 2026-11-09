import React from 'react';
import {useColors, useModuleColors, useT} from '../../Context';
import {Icon, type UIIconName} from '../../Icons';
import {MODULES, type ModuleKey} from '../../ModuleIdentity';
import {AppHeader} from '../../Parts/Mobile';
import {ActionCard, KpiCard, TodayCard, WeekStrip, type HubState} from '../../Parts/Study';
import {HandText, Highlight, InkCheck, InkLayer, InkLine, InkLoop, InkUnderline, PEN, usePen, type PenColor} from '../../Parts/Ink';
import {Bar, Button, Card, Chip, Segmented, Stack, Steps, Text, Tile, Toggle} from '../../Parts/Shared';
import {InkNote, PenToolbar, RoundButton, Scratchpad, SideRail, SolveBar, Tablet} from '../../Parts/Tablet';
import {UI_RADIUS, UI_SHADOW} from '../../Tokens';
import {AGIR_QUESTION, CONCEPT, Kind, ListenPill, microStates, MICRO_LESSONS, Rich, RolePill, TOPIC, WORK_LESSONS, Words} from '../Mobile/Lessons';
import {InkOption} from './Solve';

/**
 * Dersler (Works), Bilgi Kartları, Modüller and the pen settings on a
 * tablet. In a micro-lesson the pen works on every step: highlight the
 * definition, write in the margin, cross options out, answer a blank in
 * handwriting. Notes stay with the step and come back in Notlarım.
 */

/* ------------------------------------------------------------------ lesson frame */

/** A micro-lesson step on a tablet: step bar on top, the step in a reading column, a margin for ink on the right. */
const LessonStep: React.FC<{done: number; count?: number; title: string; children: React.ReactNode; margin?: React.ReactNode; foot?: React.ReactNode; overlay?: boolean; toolbar?: React.ReactNode}> = ({done, count = 5, title, children, margin, foot, overlay = true, toolbar}) => {
	const colors = useColors();
	const mod = useModuleColors('lessons');
	return (
		<Tablet module="lessons" wash>
			<SolveBar title={title} sub={`${TOPIC.title} · ${done + 1} / ${count}`} center={<div style={{width: 300}}><Steps count={count} done={done + 1} color={mod.color} /></div>} overlay={overlay} />
			<Stack row gap={18} align="stretch" style={{flex: 1, minHeight: 0, padding: '4px 22px 26px'}}>
				{toolbar}
				<div style={{position: 'relative', flex: 1, display: 'flex', borderRadius: UI_RADIUS.xl, background: colors.card, border: `1px solid ${colors.line}`, boxShadow: UI_SHADOW.card, overflow: 'hidden'}}>
					<Stack gap={14} style={{flex: 1, padding: '24px 28px', boxSizing: 'border-box'}}>
						{children}
						<div style={{flex: 1}} />
						{foot}
					</Stack>
					{margin ? <div style={{position: 'relative', width: 290, flexShrink: 0, borderLeft: `1px dashed ${colors.line}`, background: colors.card}}>{margin}</div> : null}
				</div>
			</Stack>
		</Tablet>
	);
};

const Main: React.FC<{children: string; icon?: UIIconName}> = ({children, icon}) => (
	<Stack row justify="space-between">
		<Button tone="ghost" icon="sparkles" module="sinoAi">
			SinoAI’ye sor
		</Button>
		<Button module="lessons" size="lg" iconRight={icon ?? 'right'} style={{minWidth: 220}}>
			{children}
		</Button>
	</Stack>
);

/* ------------------------------------------------------------------ Dersler */

/** Dersler in landscape: the module's tabs as a side rail; continue, review and lessons side by side. */
export const LessonsHomeTabletScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('lessons');
	return (
		<Tablet module="lessons" wash>
			<Stack row align="stretch" style={{flex: 1, minHeight: 0}}>
				<SideRail module="lessons" active={0} />
				<Stack gap={18} style={{flex: 1, padding: '18px 32px 26px', maxWidth: 1080, boxSizing: 'border-box'}}>
					<Stack row justify="space-between" align="flex-end">
						<Stack gap={6}>
							<Chip tone="module" module="lessons" icon={MODULES.lessons.icon} size="sm">
								{t(MODULES.lessons.name)}
							</Chip>
							<Text role="title" size={28}>
								{t('Dersler', 'Lessons')}
							</Text>
						</Stack>
						<Stack row gap={10}>
							<RoundButton icon="notebook" label={t('Notlarım', 'My notes')} />
							<RoundButton icon="search" />
						</Stack>
					</Stack>
					<Stack row gap={18} align="stretch">
						<div style={{flex: 1.3, borderRadius: 24, padding: 22, background: mod.gradient, display: 'flex', flexDirection: 'column', gap: 8}}>
							<Text role="over" color="rgba(255,255,255,0.92)">
								{t('Kaldığın yerden', 'Continue')} · {TOPIC.title}
							</Text>
							<Text role="title" size={24} color="#FFFFFF">
								{TOPIC.hook}
							</Text>
							<Text role="small" weight={600} color="#FFFFFF">
								1 / 13 · {t('sıradaki: Mecaz anlam', 'next: Figurative meaning')}
							</Text>
							<div style={{flex: 1}} />
							<Stack row gap={10}>
								<Button tone="white" icon="play" style={{color: mod.ink}}>
									{t('Devam et', 'Continue')}
								</Button>
								<Chip tone="glass" icon="pen">
									{t('3 notun var', '3 notes')}
								</Chip>
							</Stack>
						</div>
						<Card padding={20} style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 10}}>
							<Stack row justify="space-between">
								<Text role="section">{t('Bugünkü tekrar', 'Today’s review')}</Text>
								<Chip tone="module" module="lessons" size="sm">
									5
								</Chip>
							</Stack>
							<Text role="small">{t('İlk denemede yanlış yaptığın adımlar. Her biri tek denemede.', 'Steps you missed on the first try. One try each.')}</Text>
							<Stack row gap={8} wrap>
								{['TYT tarzı soru', 'Boşluk doldur', 'Önce sen tahmin et'].map((kind) => (
									<Chip key={kind} size="sm" tone="outline">
										{kind}
									</Chip>
								))}
							</Stack>
							<div style={{flex: 1}} />
							<Button tone="moduleSoft" module="lessons" block>
								{t('Tekrara başla', 'Start review')}
							</Button>
						</Card>
					</Stack>
					<Text role="section">{t('Sınavının dersleri', 'Your exam’s lessons')}</Text>
					<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14}}>
						{WORK_LESSONS.map(([tr, en, done, total, topics]) => (
							<Card key={tr} padding={16}>
								<Stack gap={10}>
									<Stack row justify="space-between">
										<Text role="headline" size={16}>
											{t(tr, en)}
										</Text>
										<Text role="meta">
											{topics} {t('konu', 'topics')}
										</Text>
									</Stack>
									<Bar value={done / total} color={mod.color} track={mod.track} />
									<Text role="small">
										{done} / {total} {t('mikro ders', 'micro-lessons')}
									</Text>
								</Stack>
							</Card>
						))}
						<Card padding={16} tone="soft">
							<Stack gap={6}>
								<Icon name="pen" size={20} color={colors.ink2} />
								<Text role="headline">{t('Kalem hazır', 'Pen ready')}</Text>
								<Text role="small">{t('Her adımda altını çizebilir, kenara yazabilirsin.', 'Underline and write in the margin on every step.')}</Text>
							</Stack>
						</Card>
					</div>
				</Stack>
			</Stack>
		</Tablet>
	);
};

/** Concept step: the definition highlighted, the word underlined, a handwritten note in the margin. */
export const LessonConceptTabletScreen: React.FC = () => {
	const colors = useColors();
	return (
		<LessonStep
			done={0}
			title="Mecaz anlam"
			toolbar={<PenToolbar vertical tool="highlighter" color="yellow" width="thick" clear={false} style={{alignSelf: 'center'}} />}
			foot={<Main>Devam</Main>}
			margin={
				<>
					<InkLayer width={290} height={560}>
						<HandText text="kırmak =" x={26} y={150} size={22} color="blue" seed={3} />
						<HandText text="azaltmak" x={26} y={190} size={22} color="blue" seed={5} />
						<HandText text="gerçek:" x={26} y={330} size={20} color="green" seed={7} />
						<HandText text="cam kırıldı" x={26} y={364} size={20} color="green" seed={9} />
						<HandText text="mecaz:" x={26} y={420} size={20} color="red" seed={11} />
						<HandText text="kalp kırıldı" x={26} y={454} size={20} color="red" seed={13} />
					</InkLayer>
					<div style={{position: 'absolute', left: 18, top: 22}}>
						<Text role="over">Kenar notu</Text>
					</div>
				</>
			}
		>
			<Kind>Mecaz anlam · 1 / 5</Kind>
			<Text role="title" size={30} style={{lineHeight: '38px'}}>
				{CONCEPT.title}
			</Text>
			<Text role="body" size={20} color={colors.ink2} style={{lineHeight: '33px', maxWidth: 640}}>
				Sözcüğün bir <Highlight>benzetme ya da ilgi</Highlight> sonucu gerçek anlamından <Highlight color="mint">tamamen uzaklaşarak</Highlight> kazandığı yeni anlamdır.
			</Text>
			<Card tone="flat" radius={20} padding={20} style={{display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 640}}>
				<Words words={CONCEPT.sentence} highlight={CONCEPT.highlight} size={22} />
				<RolePill size={14}>{CONCEPT.role}</RolePill>
				<Text role="body" size={18} color={colors.ink2} style={{lineHeight: '29px'}}>
					{CONCEPT.note}
				</Text>
			</Card>
			<Stack row gap={12}>
				<ListenPill />
				<InkNote>Notların bu adıma kayıtlı</InkNote>
			</Stack>
		</LessonStep>
	);
};

/** TYT tarzı soru: options eliminated with the pen before choosing; the step's hint after a wrong try. */
export const LessonQuestionTabletScreen: React.FC = () => {
	const colors = useColors();
	return (
		<LessonStep done={4} title="TYT tarzı soru" toolbar={<PenToolbar vertical tool="pen" color="red" width="medium" clear={false} style={{alignSelf: 'center'}} />} foot={<Main icon="check">Cevapla</Main>}>
			<Kind>TYT tarzı · 5 / 5</Kind>
			<Text role="headline" size={21} weight={700} color={colors.ink} style={{lineHeight: '31px'}}>
				Aşağıdaki cümlelerin hangisinde <Highlight>ağır</Highlight> sözcüğü mecaz anlamda kullanılmıştır?
			</Text>
			<Stack gap={9}>
				{AGIR_QUESTION.options.map((option, index) => (
					<InkOption key={option} letter={'ABCDE'[index]} text={option} mark={index === 1 ? 'loop' : 'strike'} state={index === 1 ? 'selected' : 'idle'} />
				))}
			</Stack>
			<div style={{borderRadius: 16, padding: 14, background: colors.warningSoft, display: 'flex', flexDirection: 'column', gap: 4}}>
				<Text role="headline" size={15} weight={800} color={colors.warningInk}>
					Eleme ipucu
				</Text>
				<Text role="body" color={colors.ink}>
					<Rich text={AGIR_QUESTION.hint} /> Tartılabiliyorsa üstünü çiz.
				</Text>
			</div>
		</LessonStep>
	);
};

/** Boşluk doldur in handwriting: the pencil writes into the blank, the app reads it and asks before checking. */
export const LessonFillTabletScreen: React.FC = () => {
	const colors = useColors();
	const mod = useModuleColors('lessons');
	return (
		<LessonStep done={3} title="Boşluk doldur" overlay={false} foot={<Main icon="check">Kontrol et</Main>}>
			<Kind>Boşluk doldur · 4 / 5</Kind>
			<Text role="title" size={26} style={{lineHeight: '36px', maxWidth: 760}}>
				Sözcüğün bir benzetme sonucu gerçek anlamından tamamen uzaklaşarak kazandığı anlama ______ anlam denir.
			</Text>
			<Text role="small">Kalemle kutuya yaz. Tek deneme; yanlışsa doğrusu ve nedeni gösterilir.</Text>
			<div style={{position: 'relative', height: 180, maxWidth: 760, borderRadius: 22, border: `2px dashed ${mod.line}`, background: mod.wash, boxSizing: 'border-box'}}>
				<div style={{position: 'absolute', left: 24, right: 24, bottom: 46, height: 2, background: mod.line}} />
				<InkLayer width={760} height={180}>
					<HandText text="mecaz" x={250} y={34} size={70} seed={4} width={4.2} />
				</InkLayer>
				<Stack row gap={6} style={{position: 'absolute', right: 14, top: 12}}>
					<RoundButton icon="undo" size={36} />
					<RoundButton icon="eraser" size={36} />
				</Stack>
			</div>
			<Stack row gap={12} style={{maxWidth: 760}}>
				<Stack row gap={10} style={{flex: 1, padding: '12px 16px', borderRadius: 16, background: colors.card, border: `1.5px solid ${mod.color}`}}>
					<Icon name="edit" size={18} color={mod.ink} />
					<Text role="body" color={colors.ink2}>
						Okunan:
					</Text>
					<Text role="headline" size={18}>
						mecaz
					</Text>
					<div style={{flex: 1}} />
					<Text role="small" weight={700} color={mod.ink}>
						Doğru okundu
					</Text>
				</Stack>
				<Button tone="ghost" icon="language">
					Klavyeyle yaz
				</Button>
			</Stack>
		</LessonStep>
	);
};

/** Notlarım: every note and scratchpad of a topic, by micro-lesson; open one to go back to its step. */
export const LessonNotesTabletScreen: React.FC = () => {
	const colors = useColors();
	const mod = useModuleColors('lessons');
	const states = microStates(1);
	const notes: [string, string, string, (ink: string) => React.ReactNode][] = [
		['Mecaz anlam', 'Tanım · kenar notu', 'Bugün', () => (
			<>
				<HandText text="kırmak =" x={18} y={22} size={18} color="blue" seed={3} />
				<HandText text="azaltmak" x={18} y={52} size={18} color="blue" seed={5} />
				<HandText text="kalp kırıldı" x={18} y={92} size={16} color="red" seed={13} />
			</>
		)],
		['Mecaz anlam', 'TYT tarzı soru · eleme', 'Bugün', () => (
			<>
				<InkLine points={[[16, 30], [120, 26], [220, 22]]} color="red" />
				<InkLine points={[[16, 62], [120, 58], [220, 55]]} color="red" />
				<InkLoop cx={34} cy={96} rx={18} ry={15} color="blue" />
				<HandText text="B" x={28} y={86} size={18} seed={2} />
			</>
		)],
		['Gerçek anlam', 'Taslak', 'Dün', () => (
			<>
				<HandText text="ilk anlam" x={18} y={22} size={18} seed={7} />
				<HandText text="= sözlükte 1." x={18} y={56} size={18} seed={9} />
				<InkUnderline x1={18} x2={150} y={84} color="green" />
			</>
		)],
		['Terim anlam', 'Örnek · vurgu', 'Dün', () => (
			<>
				<rect x={16} y={24} width={160} height={18} rx={4} fill={PEN.yellow.light} />
				<HandText text="hipotenüs" x={18} y={56} size={18} color="blue" seed={4} />
				<InkCheck x={150} y={60} size={20} />
			</>
		)],
	];
	return (
		<Tablet module="lessons" wash>
			<Stack row align="stretch" style={{flex: 1, minHeight: 0}}>
				<SideRail module="lessons" active={1} />
				<Stack gap={16} style={{flex: 1, padding: '18px 32px 26px', boxSizing: 'border-box'}}>
					<Stack row justify="space-between" align="flex-end">
						<Stack gap={4}>
							<Text role="meta">TYT Türkçe · {TOPIC.title}</Text>
							<Text role="title" size={28}>
								Notlarım
							</Text>
						</Stack>
						<Stack row gap={10}>
							<Segmented items={['Tümü · 4', 'Kenar notları', 'Taslaklar']} active={0} module="lessons" />
							<Button tone="ghost" icon="file">
								PDF olarak al
							</Button>
						</Stack>
					</Stack>
					<Stack row gap={18} align="stretch" style={{flex: 1, minHeight: 0}}>
						<Card padding={14} style={{width: 280, flexShrink: 0}}>
							<Text role="over" style={{padding: '4px 6px 10px'}}>
								Mikro dersler
							</Text>
							<Stack gap={2}>
								{MICRO_LESSONS.slice(0, 8).map(([name], index) => (
									<Stack key={name} row gap={10} style={{padding: '9px 8px', borderRadius: 12, background: index === 1 ? mod.soft : 'transparent'}}>
										<div style={{width: 10, height: 10, borderRadius: 5, background: states[index] === 'done' ? mod.color : states[index] === 'now' ? mod.color : colors.line}} />
										<Text role="small" weight={index === 1 ? 800 : 600} color={index === 1 ? mod.ink : colors.ink2} style={{flex: 1}}>
											{name}
										</Text>
										{index < 4 ? <Icon name="pen" size={14} color={index === 1 ? mod.ink : colors.muted} /> : null}
									</Stack>
								))}
							</Stack>
						</Card>
						<div style={{flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gridAutoRows: 'min-content', gap: 16}}>
							{notes.map(([lesson, step, day, draw], index) => (
								<Card key={step} padding={0} style={{overflow: 'hidden'}}>
									<div style={{position: 'relative', height: 140, borderBottom: `1px solid ${colors.line2}`, backgroundImage: `radial-gradient(${colors.line} 1.2px, transparent 1.3px)`, backgroundSize: '20px 20px'}}>
										<InkLayer width={320} height={140}>{draw(colors.ink)}</InkLayer>
									</div>
									<Stack row gap={10} style={{padding: '12px 16px'}}>
										<Stack gap={1} grow>
											<Text role="headline">{lesson}</Text>
											<Text role="small">{step}</Text>
										</Stack>
										<Text role="meta">{day}</Text>
										<Icon name="right" size={16} color={colors.muted} />
									</Stack>
									{index === 0 ? <div style={{height: 0}} /> : null}
								</Card>
							))}
						</div>
					</Stack>
				</Stack>
			</Stack>
		</Tablet>
	);
};

/* ------------------------------------------------------------------ Bilgi Kartları */

/** A card session: the student writes the answer first, then flips. Writing is optional, never checked. */
export const CardWriteTabletScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('flashcards');
	return (
		<Tablet module="flashcards" wash>
			<SolveBar pen={false} title={t('Kart oturumu', 'Card session')} sub={t('Kimya · Mol', 'Chemistry · Mole')} center={<div style={{width: 300, height: 5, borderRadius: 3, background: colors.line2}}><div style={{width: '37%', height: '100%', borderRadius: 3, background: mod.color}} /></div>} right={<Text role="meta">7 / 19</Text>} />
			<Stack row gap={24} align="stretch" style={{flex: 1, minHeight: 0, padding: '10px 40px 34px'}}>
				<div style={{position: 'relative', flex: 1}}>
					<div style={{position: 'absolute', inset: '22px 16px -12px', borderRadius: 30, background: colors.card, opacity: 0.55}} />
					<div style={{position: 'absolute', inset: 0, borderRadius: 30, background: colors.card, boxShadow: UI_SHADOW.float, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16}}>
						<div>
							<Chip tone="module" module="flashcards">
								{t('Tanım', 'Definition')}
							</Chip>
						</div>
						<Text role="meta">{t('Kimya · Mol', 'Chemistry · Mole')}</Text>
						<Text role="hero" size={38} align="center">
							{t('1 mol nedir?', 'What is 1 mole?')}
						</Text>
					</div>
				</div>
				<Stack gap={14} style={{width: 470, flexShrink: 0}}>
					<Scratchpad width="100%" height={430} title={t('Önce kendin yaz', 'Write it first')} page={t('isteğe bağlı', 'optional')}>
						<InkLayer width={470} height={370}>
							<HandText text="6,02 × 10" x={30} y={60} size={40} seed={3} width={3} />
							<HandText text="23" x={262} y={40} size={22} seed={5} />
							<HandText text={t('tanecik', 'particles')} x={30} y={140} size={34} seed={7} width={2.8} />
							<HandText text={t('(atom, molekül...)', '(atoms, molecules...)')} x={30} y={214} size={22} color="blue" seed={9} />
						</InkLayer>
						<PenToolbar compact tool="pen" color="ink" style={{position: 'absolute', left: '50%', bottom: 12, transform: 'translateX(-50%)', boxShadow: 'none'}} />
					</Scratchpad>
					<Text role="small" align="center">
						{t('Yazdığın kontrol edilmez; cevabı görünce kendin karşılaştırırsın.', 'What you write is not checked; compare it with the answer yourself.')}
					</Text>
					<Button size="lg" block module="flashcards">
						{t('Cevabı gör', 'Show answer')}
					</Button>
				</Stack>
			</Stack>
		</Tablet>
	);
};

/* ------------------------------------------------------------------ Modüller */

/** A module in the tablet hub grid: tile, name, today's status (same as the phone's grid). */
const HubTile: React.FC<{module: ModuleKey; status: string}> = ({module, status}) => {
	const colors = useColors();
	const t = useT();
	return (
		<Stack row gap={10} style={{padding: '10px 12px', borderRadius: 18, background: colors.card, border: `1px solid ${colors.line}`}}>
			<Tile module={module} size={38} />
			<Stack grow gap={0}>
				<Text role="headline" size={14}>
					{t(MODULES[module].name)}
				</Text>
				<Text role="meta">{status}</Text>
			</Stack>
		</Stack>
	);
};

/**
 * Modüller in landscape (8 Nov 2026): the phone's "Bugün" home in two
 * columns. Left: greeting, today's plan (or its state), the two action
 * cards. Right: the week with two KPIs, review, the modules.
 */
const HubTabletBody: React.FC<{state?: HubState}> = ({state = 'plan'}) => {
	const t = useT();
	const colors = useColors();
	const statuses: [ModuleKey, string][] = [
		['exam', t('Cumartesi canlı', 'Live Saturday')],
		['lessons', t('1 konu sürüyor', '1 topic going')],
		['tests', t('1 test hazır', '1 quiz ready')],
		['studyPlan', state === 'noPlan' ? t('Plan yok', 'No plan') : t('Bugün 2 / 5', 'Today 2 / 5')],
		['smartSummary', t('Bu ay 7 / 30', '7 / 30 this month')],
		['flashcards', t('32 kart bugün', '32 due today')],
	];
	return (
		<Tablet>
			<div style={{padding: '0 18px'}}>
				<AppHeader />
			</div>
			<Stack row gap={22} align="stretch" style={{flex: 1, minHeight: 0, padding: '6px 32px 28px'}}>
				<Stack gap={16} style={{flex: 1.25, minWidth: 0}}>
					<Stack row justify="space-between" align="flex-end">
						<Stack gap={4}>
							<Text role="title" size={28}>
								{t('Günaydın Ayşe', 'Good morning, Ayşe')}
							</Text>
							<Stack row gap={6}>
								<Icon name="target" size={15} color={colors.ink2} />
								<Text role="small" color={colors.ink2}>
									{t('Hedef', 'Goal')} <b style={{color: colors.ink}}>{t('TYT · 227 gün kaldı', 'TYT · 227 days left')}</b>
								</Text>
							</Stack>
						</Stack>
						<Chip tone="warning" icon="flame">
							{t('5 gün', '5 days')}
						</Chip>
					</Stack>
					<TodayCard state={state} />
					<Stack row gap={14} align="stretch">
						{state === 'noPlan' ? (
							<ActionCard module="lessons" over={t('İlk adımın', 'First step')} title={t('Gerçek anlam', 'Literal meaning')} line={t('TYT Türkçe · 4 dk', 'TYT Turkish · 4 min')} action={t('Başla', 'Start')} icon="book" />
						) : (
							<ActionCard module="lessons" over={t('Kaldığın yerden', 'Continue')} title={t('Mecaz anlam', 'Figurative meaning')} line={t('Sözcükte Anlam · 2/5 adım', 'Word meaning · 2/5 steps')} action={state === 'expired' ? t('Kilitli', 'Locked') : t('Devam et', 'Continue')} icon={state === 'expired' ? 'lock' : 'book'} />
						)}
						<ActionCard module="exam" over={t('Sıradaki deneme', 'Next exam')} title={t('TYT Deneme 5', 'TYT Exam 5')} line={t('Cumartesi 10:00 · 12.480 kişi', 'Saturday 10:00 · 12,480 joined')} action={t('Hatırlat', 'Remind me')} icon="exam" />
					</Stack>
				</Stack>
				<Stack gap={14} style={{width: 420, flexShrink: 0}}>
					<div style={{borderRadius: 24, background: colors.card, border: `1px solid ${colors.line}`, padding: 14, display: 'flex', flexDirection: 'column', gap: 12}}>
						<WeekStrip done={state === 'noPlan' ? [] : state === 'done' ? [0, 1, 2, 3] : [0, 1, 2]} share={state === 'done' ? 1 : state === 'noPlan' ? 0 : 0.4} />
						<Stack row gap={10}>
							<KpiCard compact icon="clock" label={t('Bu hafta', 'This week')} value={state === 'noPlan' ? '—' : t('4 sa 10 dk', '4 h 10 m')} delta={state === 'noPlan' ? undefined : '%22'} />
							<KpiCard compact icon="target" label={t('Doğru oranı', 'Accuracy')} value={state === 'noPlan' ? '—' : '%62'} delta={state === 'noPlan' ? undefined : '%6'} />
						</Stack>
					</div>
					<Stack row gap={10} style={{padding: '12px 14px', borderRadius: 20, background: colors.card, border: `1px solid ${colors.line}`}}>
						<Tile module="lessons" icon="refresh" size={38} />
						<Stack grow gap={0}>
							<Text role="headline">{t('Bugün tekrar · 5 adım, 32 kart', 'Review · 5 steps, 32 cards')}</Text>
							<Text role="meta">{t('yaklaşık 12 dk', 'about 12 min')}</Text>
						</Stack>
						<Button tone="moduleSoft" module="lessons" size="sm">
							{t('Başla', 'Start')}
						</Button>
					</Stack>
					<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10}}>
						{statuses.map(([key, status]) => (
							<HubTile key={key} module={key} status={status} />
						))}
					</div>
				</Stack>
			</Stack>
		</Tablet>
	);
};

export const HubTabletScreen: React.FC = () => <HubTabletBody />;
export const HubTabletNoPlanScreen: React.FC = () => <HubTabletBody state="noPlan" />;
export const HubTabletDoneScreen: React.FC = () => <HubTabletBody state="done" />;
export const HubTabletExpiredScreen: React.FC = () => <HubTabletBody state="expired" />;

/* ------------------------------------------------------------------ Kalem ayarları */

const SettingRow: React.FC<{icon: UIIconName; title: string; sub?: string; right: React.ReactNode}> = ({icon, title, sub, right}) => {
	const colors = useColors();
	return (
		<Stack row gap={14} style={{padding: '16px 20px'}}>
			<div style={{width: 38, height: 38, borderRadius: 12, background: colors.line2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
				<Icon name={icon} size={19} color={colors.ink2} />
			</div>
			<Stack gap={2} grow>
				<Text role="headline">{title}</Text>
				{sub ? <Text role="small">{sub}</Text> : null}
			</Stack>
			{right}
		</Stack>
	);
};

const SwatchRow: React.FC<{active: PenColor}> = ({active}) => {
	const colors = useColors();
	const swatches: PenColor[] = ['ink', 'blue', 'red', 'green'];
	return (
		<Stack row gap={10}>
			{swatches.map((swatch) => (
				<SwatchDot key={swatch} color={swatch} on={swatch === active} ring={colors.ink} card={colors.card} />
			))}
		</Stack>
	);
};

const SwatchDot: React.FC<{color: PenColor; on: boolean; ring: string; card: string}> = ({color, on, ring, card}) => (
	<div style={{width: 28, height: 28, borderRadius: 14, background: usePen(color), boxShadow: on ? `0 0 0 2px ${card}, 0 0 0 4px ${ring}` : undefined}} />
);

/** Profil → Kalem ve çizim: how the pen behaves everywhere in the app. A brand surface (profile), so no module colour. */
export const PenSettingsScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const sections: [UIIconName, string, boolean][] = [
		['user', t('Hesap', 'Account'), false],
		['bell', t('Bildirimler', 'Notifications'), false],
		['pen', t('Kalem ve çizim', 'Pen and drawing'), true],
		['moon', t('Görünüm', 'Appearance'), false],
		['shield', t('Gizlilik', 'Privacy'), false],
	];
	const Group: React.FC<{title: string; children: React.ReactNode}> = ({title, children}) => (
		<Stack gap={8}>
			<Text role="over" style={{paddingLeft: 6}}>
				{title}
			</Text>
			<Card padding={0}>
				{React.Children.toArray(children).map((child, index) => (
					<div key={index} style={{borderTop: index ? `1px solid ${colors.line2}` : undefined}}>
						{child}
					</div>
				))}
			</Card>
		</Stack>
	);
	return (
		<Tablet>
			<Stack row align="stretch" style={{flex: 1, minHeight: 0}}>
				<Stack gap={4} style={{width: 330, flexShrink: 0, padding: '18px 18px', borderRight: `1px solid ${colors.line}`, background: colors.card, boxSizing: 'border-box'}}>
					<Stack row gap={10} style={{padding: '0 6px 14px'}}>
						<RoundButton icon="left" />
						<Text role="title">{t('Profil', 'Profile')}</Text>
					</Stack>
					{sections.map(([icon, label, on]) => (
						<Stack key={label} row gap={12} style={{padding: '12px 14px', borderRadius: 14, background: on ? colors.brandWash : 'transparent'}}>
							<Icon name={icon} size={20} color={on ? colors.brandDeep : colors.ink2} />
							<Text role="headline" color={on ? colors.brandDeep : colors.ink}>
								{label}
							</Text>
						</Stack>
					))}
				</Stack>
				<Stack gap={18} style={{flex: 1, padding: '22px 40px 30px', boxSizing: 'border-box', maxWidth: 820}}>
					<Stack gap={4}>
						<Text role="title" size={26}>
							{t('Kalem ve çizim', 'Pen and drawing')}
						</Text>
						<Text role="small">{t('Denemeler, Testler ve Dersler’de geçerli. Apple Pencil, S Pen ve diğer tablet kalemleri.', 'Applies to exams, tests and lessons. Apple Pencil, S Pen and other styluses.')}</Text>
					</Stack>
					<Group title={t('Kalem', 'Pen')}>
						<SettingRow icon="hand" title={t('Parmakla çizim', 'Draw with finger')} sub={t('Kapalıyken parmak kaydırır, yalnız kalem çizer.', 'Off: a finger scrolls, only the pen draws.')} right={<Toggle />} />
						<SettingRow icon="pen" title={t('Kalemde çift dokunuş', 'Pen double-tap')} sub={t('Apple Pencil 2 ve Pro; S Pen düğmesi', 'Apple Pencil 2 and Pro; S Pen button')} right={<Segmented items={[t('Silgi', 'Eraser'), t('Son araç', 'Last tool'), t('Kapalı', 'Off')]} active={0} />} />
						<SettingRow icon="edit" title={t('Varsayılan renk', 'Default colour')} right={<SwatchRow active="ink" />} />
						<SettingRow icon="layers" title={t('Varsayılan kalınlık', 'Default width')} right={<Segmented items={[t('İnce', 'Thin'), t('Orta', 'Medium'), t('Kalın', 'Thick')]} active={1} />} />
					</Group>
					<Group title={t('Ekran', 'Screen')}>
						<SettingRow icon="notebook" title={t('Taslak kâğıdının yeri', 'Scratchpad position')} sub={t('Dikey tutuşta her zaman altta açılır.', 'Always below in portrait.')} right={<Segmented items={[t('Sağda', 'Right'), t('Solda', 'Left')]} active={0} />} />
						<SettingRow icon="eye" title={t('Çözümlerde notlarımı göster', 'Show my notes in solutions')} right={<Toggle on />} />
					</Group>
					<Group title={t('Notlar', 'Notes')}>
						<SettingRow icon="globe" title={t('Notlar hesabına kaydedilir', 'Notes are saved to your account')} sub={t('Her cihazda açılır. Bir soruyu sıfırlayınca o sorunun notları da silinir.', 'They open on every device.')} right={<Text role="small" weight={700} color={colors.brandDeep}>{t('128 not', '128 notes')}</Text>} />
					</Group>
				</Stack>
			</Stack>
		</Tablet>
	);
};
