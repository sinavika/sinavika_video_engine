import React from 'react';
import {useColors, useModuleColors, useNarrowWide, useT, useUI} from '../../Context';
import {Icon} from '../../Icons';
import {MODULES, type ModuleKey} from '../../ModuleIdentity';
import {Button, Chip, OptionRow, Segmented, Stack, Text} from '../../Parts/Shared';
import {QuestionStrip, RoundButton, SideRail, SolveBar, Tablet, TimerProgress} from '../../Parts/Tablet';
import {UI_RADIUS, UI_SHADOW} from '../../Tokens';
import {PlanTaskCard} from '../../Parts/Study';
import {PlanTodayScreen} from '../Mobile/Plan';
import {SinoTop} from '../Mobile/SinoAI';
import {Kind, Rich, sectionStates, TOPIC, TOPIC_SECTIONS, TopicProgress, useAgirQuestion, WORK_TOPICS} from '../Mobile/Lessons';
import {DUO_FOLD_PANE, DUO_FOLD_SPACE} from '../../Parts/Duo';

/**
 * Tablet without the pen: what a big screen adds for every student, with or
 * without a stylus. A hardware keyboard (answer with A–E, move with arrows),
 * two panes (list and detail side by side), SinoAI as a side panel next to
 * the step, the week at a glance, a statistics dashboard, and Split View
 * where the app falls back to its phone layout.
 */

const Pane: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => {
	const colors = useColors();
	return <div style={{boxSizing: 'border-box', borderRadius: UI_RADIUS.xl, background: colors.card, border: `1px solid ${colors.line}`, boxShadow: UI_SHADOW.card, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0, ...style}}>{children}</div>;
};

const Key: React.FC<{children: string}> = ({children}) => {
	const colors = useColors();
	return <span style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 24, height: 24, padding: '0 6px', boxSizing: 'border-box', borderRadius: 6, background: colors.card, border: `1px solid ${colors.line}`, borderBottomWidth: 2.5, fontSize: 12, fontWeight: 800, color: colors.ink}}>{children}</span>;
};

const KeyHint: React.FC<{keys: string[]; label: string}> = ({keys, label}) => (
	<Stack row gap={6}>
		{keys.map((key) => (
			<Key key={key}>{key}</Key>
		))}
		<Text role="meta">{label}</Text>
	</Stack>
);

/* ------------------------------------------------------------------ Denemeler · keyboard and map */

/** Landscape exam with a hardware keyboard: the full question map stays open on the right; keys answer and move. */
export const ExamKeyboardScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('exam');
	const states = Array.from({length: 40}, (_, index) => (index < 18 ? 1 : index === 18 ? 2 : index === 7 || index === 12 ? 3 : 0)) as (0 | 1 | 2 | 3)[];
	return (
		<Tablet module="exam">
			<SolveBar
				pen={false}
				title={t('TYT Deneme 5', 'SAT Practice Test 5')}
				sub={t('Temel Matematik', 'Basic Maths')}
				center={<TimerProgress time="1:42:18" value={0.38} label={t('kaldı', 'left')} />}
				right={
					<Stack row gap={10}>
						<Chip tone="outline" icon="language">
							{t('Klavye bağlı', 'Keyboard on')}
						</Chip>
						<Button size="sm">{t('Bitir', 'Finish')}</Button>
					</Stack>
				}
			/>
			<Stack row gap={20} align="stretch" style={{flex: 1, minHeight: 0, padding: '4px 22px 26px'}}>
				<Pane style={{flex: 1}}>
					<Stack row justify="space-between">
						<Chip>{t('Soru 19 / 40', 'Question 19 / 40')}</Chip>
						<Chip tone="outline" icon="bookmark">
							{t('İşaretle', 'Flag')}
						</Chip>
					</Stack>
					<Text role="body" size={19} weight={600} color={colors.ink} style={{lineHeight: '30px'}}>
						{t('Bir sınıftaki öğrencilerin %40’ı kızdır. Sınıfa 6 kız öğrenci katıldığında kızların oranı %50 oluyor. Buna göre sınıfta başlangıçta kaç öğrenci vardır?', '40% of a class are girls. When 6 girls join, girls make up 50%. How many students were there at first?')}
					</Text>
					<Stack gap={9}>
						{['24', '30', '36', '40', '48'].map((option, index) => (
							<OptionRow key={option} letter={'ABCDE'[index]} text={option} state={index === 1 ? 'selected' : 'idle'} module="exam" />
						))}
					</Stack>
					<Stack row gap={18} wrap style={{marginTop: 'auto', padding: '12px 14px', borderRadius: 16, background: colors.line2}}>
						<KeyHint keys={['A', '–', 'E']} label={t('cevapla', 'answer')} />
						<KeyHint keys={['←', '→']} label={t('önceki / sonraki', 'prev / next')} />
						<KeyHint keys={['M']} label={t('işaretle', 'flag')} />
						<KeyHint keys={['⌫']} label={t('cevabı sil', 'clear')} />
						<KeyHint keys={['⌘', '/']} label={t('tüm kısayollar', 'all shortcuts')} />
					</Stack>
				</Pane>
				<Pane style={{width: 330, flexShrink: 0}}>
					<Stack row justify="space-between">
						<Text role="headline" size={16}>
							{t('Soru haritası', 'Question map')}
						</Text>
						<Text role="meta">{t('18 cevaplı · 2 işaretli', '18 answered · 2 flagged')}</Text>
					</Stack>
					<Text role="over" color={mod.ink}>
						{t('Temel Matematik · 1–40', 'Basic Maths · 1–40')}
					</Text>
					<div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8}}>
						{states.map((state, index) => (
							<QuestionStrip key={index} states={[state]} start={index + 1} />
						))}
					</div>
					<Stack row gap={12} wrap style={{marginTop: 'auto'}}>
						{[
							[mod.soft, t('cevaplı', 'answered')],
							[colors.warningSoft, t('işaretli', 'flagged')],
							[colors.card, t('boş', 'blank')],
						].map(([fill, label]) => (
							<Stack key={label} row gap={6}>
								<div style={{width: 12, height: 12, borderRadius: 4, background: fill, border: `1px solid ${colors.line}`}} />
								<Text role="meta">{label}</Text>
							</Stack>
						))}
					</Stack>
				</Pane>
			</Stack>
		</Tablet>
	);
};

/* ------------------------------------------------------------------ Dersler · SinoAI side panel */

export const LessonSinoPanelScreen: React.FC = () => {
	const colors = useColors();
	const t = useT();
	const question = useAgirQuestion();
	const Bubble: React.FC<{me?: boolean; children: React.ReactNode}> = ({me, children}) => (
		<div style={{alignSelf: me ? 'flex-end' : 'flex-start', maxWidth: '88%', padding: '10px 13px', borderRadius: me ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: me ? colors.ink : colors.line2}}>
			<Text role="body" size={14.5} color={me ? colors.bg : colors.ink} style={{lineHeight: '21px'}}>
				{children}
			</Text>
		</div>
	);
	return (
		<Tablet module="lessons" wash>
			<SolveBar
				pen={false}
				title={t('Sınav tarzı soru', 'Exam-style question')}
				sub={t(TOPIC.title, 'Words in context')}
				center={
					<div style={{width: 300, maxWidth: '100%'}}>
						<TopicProgress step={26} />
					</div>
				}
				right={<RoundButton icon="sparkles" on label="SinoAI" />}
			/>
			<Stack row gap={useUI().fold ? 0 : 20} align="stretch" style={{flex: 1, minHeight: 0, padding: '4px 22px 26px'}}>
				<Pane style={{flex: 1}}>
					<Kind>{t('Sınav tarzı', 'Exam style')}</Kind>
					<Text role="headline" size={20} weight={700} color={colors.ink} style={{lineHeight: '30px'}}>
						<Rich text={question.stem} />
					</Text>
					<Stack data-ui="scroll" gap={8} style={{flex: 1, minHeight: 0, overflow: 'hidden'}}>
						{question.options.map((option, index) => (
							<OptionRow key={option} letter={'ABCDE'[index]} text={option} state={index === 2 ? 'wrong' : 'idle'} />
						))}
					</Stack>
					<Stack row justify="flex-end" style={{flexShrink: 0}}>
						<Button tone="module" module="lessons" size="lg" style={{minWidth: 220}}>
							{t('Yeniden seç', 'Choose again')}
						</Button>
					</Stack>
				</Pane>
				<Pane style={{width: useUI().fold ? DUO_FOLD_PANE : 400, flexShrink: 0, padding: 0, gap: 0, marginLeft: useUI().fold ? DUO_FOLD_SPACE : 0}}>
					{/* The chat session's own top bar (SinoAiChatHeader), as in the app's SinoAiSidePanel; the step stays open on the left. The panel closes with the SinoAI button in the step bar. */}
					<div style={{padding: '10px 6px 0', borderBottom: `1px solid ${colors.line2}`}}>
						<SinoTop />
					</div>
					<Stack gap={10} style={{flex: 1, padding: 16}}>
						<Bubble me>{t('Neden C yanlış? Kamyon da zor çıkıyor.', 'Why is C wrong? The truck climbs slowly too.')}</Bubble>
						<Bubble>
							{t('C’de ', 'In C, ')}
							<b>{t('ağır', 'heavy')}</b>
							{t(' yükün tartıyla ölçülen ağırlığını anlatıyor; anlam gerçek. Mecazda ağırlık tartılamaz: B’deki sözler “kırıcı, üzücü” anlamında.', ' is the load’s real weight, which a scale can measure: literal meaning. A figurative weight cannot be weighed: in B the words are “hurtful, upsetting”.')}
						</Bubble>
						<Stack row gap={8} wrap>
							{[t('Bir örnek daha ver', 'One more example'), t('Gerçek ile yan anlam farkı', 'Literal vs. extended meaning')].map((chip) => (
								<Chip key={chip} tone="outline" size="sm">
									{chip}
								</Chip>
							))}
						</Stack>
					</Stack>
					<Stack gap={6} style={{padding: '12px 16px 14px', borderTop: `1px solid ${colors.line2}`}}>
						<div style={{height: 44, borderRadius: 22, background: colors.line2, display: 'flex', alignItems: 'center', padding: '0 16px'}}>
							<Text role="small">{t('SinoAI’ye sor', 'Ask SinoAI')}</Text>
						</div>
						<Text role="meta" align="center">
							{t('SinoAI hata yapabilir; önemli bilgileri doğrula.', 'SinoAI can make mistakes; check important facts.')}
						</Text>
					</Stack>
				</Pane>
			</Stack>
		</Tablet>
	);
};

/* ------------------------------------------------------------------ Dersler · two panes */

export const LessonTopicsSplitScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('lessons');
	const states = sectionStates(1);
	const narrow = useNarrowWide();
	return (
		<Tablet module="lessons" wash>
			<Stack row align="stretch" style={{flex: 1, minHeight: 0}}>
				<SideRail module="lessons" active={1} />
				<Stack gap={8} style={{width: narrow ? 270 : 340, flexShrink: 0, padding: '18px 16px', borderRight: `1px solid ${colors.line}`, boxSizing: 'border-box'}}>
					<Text role="meta">TYT</Text>
					<Text role="title" size={24}>
						Türkçe
					</Text>
					<Text role="small">{t('15 konu · ilk denemede %80', '15 topics · 80% first try')}</Text>
					<Stack gap={4} style={{marginTop: 8}}>
						{WORK_TOPICS.map(([name, steps, done, minutes], index) => (
							<Stack key={name} row gap={12} style={{padding: '11px 12px', borderRadius: 16, background: index === 0 ? mod.soft : 'transparent'}}>
								<div style={{width: 28, height: 28, borderRadius: 14, border: `2px solid ${index === 0 ? mod.color : colors.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box'}}>
									<Text role="meta" weight={800} color={index === 0 ? mod.ink : colors.muted}>
										{index + 1}
									</Text>
								</div>
								<Stack grow gap={0}>
									<Text role="headline" size={14.5} color={index === 0 ? mod.ink : colors.ink}>
										{name}
									</Text>
									<Text role="meta">{done ? t(`%${Math.round((done / steps) * 100)} tamamlandı`, `${Math.round((done / steps) * 100)}% done`) : t(`${steps} adım · ${minutes} dk`, `${steps} steps · ${minutes} min`)}</Text>
								</Stack>
							</Stack>
						))}
					</Stack>
				</Stack>
				<Stack gap={14} style={{flex: 1, minWidth: 0, padding: narrow ? '18px 20px' : '22px 30px', boxSizing: 'border-box'}}>
					<div style={{borderRadius: 24, padding: 22, background: mod.gradient, display: 'flex', gap: 20, alignItems: 'center'}}>
						<Stack gap={6} grow>
							<Text role="over" color="rgba(255,255,255,0.9)">
								{`${TOPIC.title} · ${TOPIC.steps} ${t('adım', 'steps')} · ${TOPIC.minutes} ${t('dk', 'min')}`}
							</Text>
							<Text role="title" size={24} color="#FFFFFF">
								{TOPIC.hook}
							</Text>
							<Stack row gap={10} wrap style={{marginTop: 6}}>
								<Button tone="white" icon="play" style={{color: mod.action}}>
									{t('Kaldığın yerden devam et', 'Continue where you left off')}
								</Button>
								<Chip tone="glass" icon="video">
									{`${t('Konu videosu', 'Topic video')} · ${TOPIC.video}`}
								</Chip>
							</Stack>
						</Stack>
						<div style={{display: narrow ? 'none' : 'flex', width: 200, height: 112, borderRadius: 16, background: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center'}}>
							<Icon name="playCircle" size={44} color="#FFFFFF" />
						</div>
					</div>
					{/* A topic is one lesson: no list of parts. "Bu konuda" says what the topic teaches; the player opens where the student left off. */}
					<Text role="section">{t('Bu konuda', 'In this topic')}</Text>
					<div style={{display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10}}>
						{TOPIC_SECTIONS.slice(0, narrow ? 8 : 10).map(([name], index) => (
							<Stack key={name} row gap={10} style={{padding: '10px 12px', borderRadius: 16, background: colors.card, border: `1px solid ${colors.line}`}}>
								<Icon name={states[index] === 'done' ? 'checkCircle' : 'check'} size={18} color={states[index] === 'done' ? mod.color : colors.subtle} />
								<Text role="headline" size={14} style={{flex: 1}}>
									{name}
								</Text>
							</Stack>
						))}
					</div>
					<Text role="meta">{t('Konu listesi solda kalır; konu değiştirmek tek dokunuş.', 'Topics stay on the left.')}</Text>
				</Stack>
			</Stack>
		</Tablet>
	);
};

/* ------------------------------------------------------------------ Ders Planı · the week */

export const PlanWeekScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('studyPlan');
	const narrow = useNarrowWide();
	const days = [t('Pzt 12', 'Mon 12'), t('Sal 13', 'Tue 13'), t('Çar 14', 'Wed 14'), t('Per 15', 'Thu 15'), t('Cum 16', 'Fri 16'), t('Cmt 17', 'Sat 17'), t('Paz 18', 'Sun 18')];
	const tasks: [number, ModuleKey, string, string, boolean?][] = [
		[0, 'lessons', t('Gerçek anlam', 'Literal meaning'), t('8 dk', '8 min'), true],
		[0, 'tests', t('Sayılar', 'Numbers'), t('20 soru', '20 q'), true],
		[1, 'lessons', t('Sözcükte Anlam', 'Word meaning'), t('10 dk', '10 min'), true],
		[1, 'flashcards', t('Mol', 'The mole'), t('20 kart', '20 cards'), true],
		[2, 'tests', t('Paragraf', 'Paragraphs'), t('20 soru', '20 q'), true],
		[2, 'exam', t('Paragraf branş', 'Paragraph exam'), t('40 soru', '40 q')],
		[3, 'lessons', t('Sözcükte Anlam', 'Word meaning'), t('8 dk', '8 min'), true],
		[3, 'tests', t('Problemler', 'Problems'), t('20 soru', '20 q')],
		[3, 'flashcards', t('Mol kavramı', 'The mole'), t('20 kart', '20 cards')],
		[4, 'lessons', t('Söz Yorumu', 'Reading statements'), t('12 dk', '12 min')],
		[4, 'tests', t('Üslü sayılar', 'Exponents'), t('20 soru', '20 q')],
		[5, 'exam', t('TYT Deneme 5', 'SAT Practice Test 5'), '10:00'],
		[6, 'lessons', t('Haftalık tekrar', 'Weekly review'), t('30 dk', '30 min')],
	];
	return (
		<Tablet module="studyPlan" wash>
			<Stack row align="stretch" style={{flex: 1, minHeight: 0}}>
				<SideRail module="studyPlan" active={2} />
				<Stack gap={14} style={{flex: 1, padding: '18px 26px 24px', boxSizing: 'border-box', minWidth: 0}}>
					<Stack row justify="space-between">
						<Stack gap={2}>
							<Text role="title" size={26}>
								{t('Bu hafta', 'This week')}
							</Text>
							<Text role="small">{t('12–18 Ekim · 13 görev · 7 sa 40 dk', '12–18 Oct · 13 tasks · 7 h 40 m')}</Text>
						</Stack>
						<Stack row gap={10}>
							<div style={{width: narrow ? 190 : 230}}>
								<Segmented items={[t('Gün', 'Day'), t('Hafta', 'Week'), t('Ay', 'Month')]} active={1} module="studyPlan" />
							</div>
							<Button tone="module" module="studyPlan" icon="plus">
								{t('Görev ekle', 'Add task')}
							</Button>
						</Stack>
					</Stack>
					<div style={{flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: narrow ? 6 : 10, minHeight: 0}}>
						{days.map((day, index) => (
							<Stack key={day} gap={8} style={{padding: 8, borderRadius: 18, background: index === 3 ? colors.card : 'transparent', border: index === 3 ? `1.5px solid ${mod.line}` : `1px dashed ${colors.line}`}}>
								<Text role="headline" size={13.5} color={index === 3 ? mod.ink : colors.ink2} align="center">
									{day}
								</Text>
								{tasks
									.filter(([dayIndex]) => dayIndex === index)
									.map(([, module, title, amount, done]) => (
										<div data-ui={done ? 'disabled' : undefined} key={title} style={{padding: '8px 9px', borderRadius: 12, background: MODULES[module] ? colors.card : colors.card, border: `1px solid ${colors.line}`, borderLeft: `4px solid ${MODULES[module].color.light}`, opacity: done ? 0.55 : 1}}>
											<Text role="headline" size={13} style={{textDecoration: done ? 'line-through' : undefined}}>
												{title}
											</Text>
											<Text role="meta" size={12}>
												{amount}
											</Text>
										</div>
									))}
							</Stack>
						))}
					</div>
					<Text role="meta">{t('Görevi sürükleyip başka güne bırakabilirsin; plan kalan günleri yeniden dağıtır.', 'Drag a task to another day; the plan rebalances.')}</Text>
				</Stack>
				{/* Narrower than an iPad 11" the week takes the whole width; today is the highlighted column and Sıradakini başlat stays on the day view. */}
				<Stack gap={12} style={{display: narrow ? 'none' : 'flex', width: 330, flexShrink: 0, padding: '18px 20px 24px 0', boxSizing: 'border-box'}}>
					<Text role="section">{t('Bugün', 'Today')}</Text>
					<PlanTaskCard module="tests" source={t('TYT Matematik · denemende net kaybettin', 'TYT Maths · cost you nets')} title={t('Problemler · Orta', 'Problems · Medium')} amount={t('20 soru · 25 dk', '20 q · 25 min')} now />
					<PlanTaskCard module="flashcards" source={t('TYT Kimya · Bilgi Kartları', 'TYT Chemistry · Flashcards')} title={t('Mol kavramı', 'The mole')} amount={t('20 kart · 10 dk', '20 cards · 10 min')} />
					<Button tone="module" module="tests" size="lg" block icon="play">
						{t('Sıradakini başlat', 'Start next')}
					</Button>
				</Stack>
			</Stack>
		</Tablet>
	);
};

/* ------------------------------------------------------------------ Split View */

/** Split View / Stage Manager: next to another app the window is phone-wide, so the app shows its phone layout as is. */
export const SplitViewScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<Tablet>
			<Stack row gap={10} align="stretch" style={{flex: 1, minHeight: 0, padding: '0 10px 22px'}}>
				<div style={{width: 390, height: 772, flexShrink: 0, borderRadius: 22, overflow: 'hidden', boxShadow: UI_SHADOW.float, position: 'relative'}}>
					<div style={{position: 'absolute', top: -50}}>
						<PlanTodayScreen />
					</div>
				</div>
				<div style={{width: 6, alignSelf: 'center', height: 60, borderRadius: 3, background: colors.subtle}} />
				<div style={{flex: 1, borderRadius: 22, background: colors.card, border: `1px solid ${colors.line}`, padding: 28, display: 'flex', flexDirection: 'column', gap: 14}}>
					<Text role="over">{t('Başka bir uygulama', 'Another app')}</Text>
					{[0.9, 0.75, 0.82, 0.6, 0.88, 0.7, 0.4].map((width, index) => (
						<div key={index} style={{width: `${width * 100}%`, height: 12, borderRadius: 6, background: colors.line2}} />
					))}
					<div style={{marginTop: 'auto', padding: 16, borderRadius: 16, background: colors.line2}}>
						<Text role="small" color={colors.ink2}>
							{t('Pencere 600 pt’nin altına inince Sınavika telefon düzenine geçer; 600–899 pt dikey tablet, 900 pt ve üstü geniş düzen. Oturum ve deneme süresi pencere değişince kesilmez.', 'Below 600 pt the app uses its phone layout; the exam timer never stops on resize.')}
						</Text>
					</div>
				</div>
			</Stack>
		</Tablet>
	);
};
