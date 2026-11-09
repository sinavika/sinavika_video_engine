import React from 'react';
import {useColors, useModuleColors, useT} from '../../Context';
import {Icon} from '../../Icons';
import {MODULES, type ModuleKey} from '../../ModuleIdentity';
import {Button, Card, Chip, OptionRow, Segmented, Stack, Text, Tile} from '../../Parts/Shared';
import {QuestionStrip, RoundButton, SideRail, SolveBar, Tablet, TimerProgress} from '../../Parts/Tablet';
import {UI_RADIUS, UI_SHADOW} from '../../Tokens';
import {HEATMAP_SAMPLE, KpiCard, PlanTaskCard, StudyBars, StudyDonut, StudyHeatmap} from '../../Parts/Study';
import {PlanTodayScreen} from '../Mobile/Plan';
import {AGIR_QUESTION, Kind, MICRO_LESSONS, microStates, Rich, TOPIC, WORK_TOPICS} from '../Mobile/Lessons';

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
	return (
		<span style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 24, height: 24, padding: '0 6px', boxSizing: 'border-box', borderRadius: 6, background: colors.card, border: `1px solid ${colors.line}`, borderBottomWidth: 2.5, fontSize: 12, fontWeight: 800, color: colors.ink}}>{children}</span>
	);
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
			<SolveBar pen={false} title={t('TYT Deneme 5', 'TYT Exam 5')} sub={t('Temel Matematik', 'Basic Maths')} center={<TimerProgress time="1:42:18" value={0.38} label={t('kaldı', 'left')} />} right={<Stack row gap={10}><Chip tone="outline" icon="language">{t('Klavye bağlı', 'Keyboard on')}</Chip><Button size="sm">{t('Bitir', 'Finish')}</Button></Stack>} />
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
						<KeyHint keys={['İ']} label={t('işaretle', 'flag')} />
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
	const lessons = useModuleColors('lessons');
	const Bubble: React.FC<{me?: boolean; children: React.ReactNode}> = ({me, children}) => (
		<div style={{alignSelf: me ? 'flex-end' : 'flex-start', maxWidth: '88%', padding: '10px 13px', borderRadius: me ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: me ? colors.ink : colors.line2}}>
			<Text role="body" size={14.5} color={me ? colors.bg : colors.ink} style={{lineHeight: '21px'}}>
				{children}
			</Text>
		</div>
	);
	return (
		<Tablet module="lessons" wash>
			<SolveBar pen={false} title="TYT tarzı soru" sub={`${TOPIC.title} · 5 / 5`} center={<div style={{width: 260, height: 5, borderRadius: 3, background: colors.line2}}><div style={{width: '90%', height: '100%', borderRadius: 3, background: lessons.color}} /></div>} right={<RoundButton icon="sparkles" on label="SinoAI" />} />
			<Stack row gap={20} align="stretch" style={{flex: 1, minHeight: 0, padding: '4px 22px 26px'}}>
				<Pane style={{flex: 1}}>
					<Kind>TYT tarzı · 5 / 5</Kind>
					<Text role="headline" size={20} weight={700} color={colors.ink} style={{lineHeight: '30px'}}>
						<Rich text={AGIR_QUESTION.stem} />
					</Text>
					<Stack gap={8}>
						{AGIR_QUESTION.options.map((option, index) => (
							<OptionRow key={option} letter={'ABCDE'[index]} text={option} state={index === 2 ? 'wrong' : 'idle'} />
						))}
					</Stack>
					<Stack row justify="flex-end" style={{marginTop: 'auto'}}>
						<Button tone="module" module="lessons" size="lg" style={{minWidth: 220}}>
							Yeniden seç
						</Button>
					</Stack>
				</Pane>
				<Pane style={{width: 400, flexShrink: 0, padding: 0, gap: 0}}>
					<Stack row gap={10} style={{padding: '14px 18px', borderBottom: `1px solid ${colors.line2}`}}>
						<Tile module="sinoAi" size={34} />
						<Stack grow gap={0}>
							<Text role="headline">SinoAI</Text>
							<Text role="meta">Bu adımı biliyor</Text>
						</Stack>
						<Icon name="x" size={20} color={colors.ink2} />
					</Stack>
					<Stack gap={10} style={{flex: 1, padding: 16}}>
						<Bubble me>Neden C yanlış? Kamyon da zor çıkıyor.</Bubble>
						<Bubble>
							C’de <b>ağır</b> yükün tartıyla ölçülen ağırlığını anlatıyor; anlam gerçek. Mecazda ağırlık tartılamaz: B’deki sözler “kırıcı, üzücü” anlamında.
						</Bubble>
						<Stack row gap={8} wrap>
							{['Bir örnek daha ver', 'Gerçek ile yan anlam farkı'].map((chip) => (
								<Chip key={chip} tone="outline" size="sm">
									{chip}
								</Chip>
							))}
						</Stack>
					</Stack>
					<Stack gap={6} style={{padding: '12px 16px 14px', borderTop: `1px solid ${colors.line2}`}}>
						<div style={{height: 44, borderRadius: 22, background: colors.line2, display: 'flex', alignItems: 'center', padding: '0 16px'}}>
							<Text role="small">SinoAI’ye sor</Text>
						</div>
						<Text role="meta" align="center">
							SinoAI hata yapabilir; önemli bilgileri doğrula.
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
	const states = microStates(1);
	return (
		<Tablet module="lessons" wash>
			<Stack row align="stretch" style={{flex: 1, minHeight: 0}}>
				<SideRail module="lessons" active={1} />
				<Stack gap={8} style={{width: 340, flexShrink: 0, padding: '18px 16px', borderRight: `1px solid ${colors.line}`, boxSizing: 'border-box'}}>
					<Text role="meta">TYT</Text>
					<Text role="title" size={24}>
						Türkçe
					</Text>
					<Text role="small">15 konu · ilk denemede %80</Text>
					<Stack gap={4} style={{marginTop: 8}}>
						{WORK_TOPICS.map(([name, micro, done, minutes], index) => (
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
									<Text role="meta">
										{micro} mikro ders · {minutes} dk{done ? ` · ${done} bitti` : ''}
									</Text>
								</Stack>
							</Stack>
						))}
					</Stack>
				</Stack>
				<Stack gap={14} style={{flex: 1, padding: '22px 30px', boxSizing: 'border-box'}}>
					<div style={{borderRadius: 24, padding: 22, background: mod.gradient, display: 'flex', gap: 20, alignItems: 'center'}}>
						<Stack gap={6} grow>
							<Text role="over" color="rgba(255,255,255,0.9)">
								{TOPIC.title} · 13 mikro ders
							</Text>
							<Text role="title" size={24} color="#FFFFFF">
								{TOPIC.hook}
							</Text>
							<Stack row gap={10} style={{marginTop: 6}}>
								<Button tone="white" icon="play" style={{color: mod.ink}}>
									Mecaz anlamla devam et
								</Button>
								<Chip tone="glass" icon="video">
									{`Konu videosu · ${TOPIC.video}`}
								</Chip>
							</Stack>
						</Stack>
						<div style={{width: 200, height: 112, borderRadius: 16, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							<Icon name="playCircle" size={44} color="#FFFFFF" />
						</div>
					</div>
					<Text role="section">Mikro dersler</Text>
					<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10}}>
						{MICRO_LESSONS.slice(0, 10).map(([name, steps, minutes], index) => (
							<Stack key={name} row gap={10} style={{padding: '10px 12px', borderRadius: 16, background: colors.card, border: `1px solid ${states[index] === 'now' ? mod.color : colors.line}`}}>
								<div style={{width: 26, height: 26, borderRadius: 13, background: states[index] === 'done' ? mod.color : colors.line2, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
									{states[index] === 'done' ? <Icon name="check" size={14} color="#FFFFFF" /> : <Text role="meta" weight={800}>{index + 1}</Text>}
								</div>
								<Stack grow gap={0}>
									<Text role="headline" size={14}>
										{name}
									</Text>
									<Text role="meta">
										{steps} adım · {minutes} dk
									</Text>
								</Stack>
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
	const days = [t('Pzt 12', 'Mon 12'), t('Sal 13', 'Tue 13'), t('Çar 14', 'Wed 14'), t('Per 15', 'Thu 15'), t('Cum 16', 'Fri 16'), t('Cmt 17', 'Sat 17'), t('Paz 18', 'Sun 18')];
	const tasks: [number, ModuleKey, string, string, boolean?][] = [
		[0, 'lessons', 'Gerçek anlam', '8 dk', true],
		[0, 'tests', 'Sayılar', '20 soru', true],
		[1, 'lessons', 'Mecaz anlam', '10 dk', true],
		[1, 'flashcards', 'Mol', '20 kart', true],
		[2, 'tests', 'Paragraf', '20 soru', true],
		[2, 'exam', 'Paragraf branş', '40 soru'],
		[3, 'lessons', 'Sözcükte Anlam', '8 dk', true],
		[3, 'tests', 'Problemler', '20 soru'],
		[3, 'flashcards', 'Mol kavramı', '20 kart'],
		[4, 'lessons', 'Söz Yorumu', '12 dk'],
		[4, 'tests', 'Üslü sayılar', '20 soru'],
		[5, 'exam', 'TYT Deneme 5', '10:00'],
		[6, 'lessons', 'Haftalık tekrar', '30 dk'],
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
							<div style={{width: 230}}>
								<Segmented items={[t('Gün', 'Day'), t('Hafta', 'Week'), t('Ay', 'Month')]} active={1} module="studyPlan" />
							</div>
							<Button tone="module" module="studyPlan" icon="plus">
								{t('Görev ekle', 'Add task')}
							</Button>
						</Stack>
					</Stack>
					<div style={{flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10, minHeight: 0}}>
						{days.map((day, index) => (
							<Stack key={day} gap={8} style={{padding: 8, borderRadius: 18, background: index === 3 ? colors.card : 'transparent', border: index === 3 ? `1.5px solid ${mod.line}` : `1px dashed ${colors.line}`}}>
								<Text role="headline" size={13.5} color={index === 3 ? mod.ink : colors.ink2} align="center">
									{day}
								</Text>
								{tasks
									.filter(([dayIndex]) => dayIndex === index)
									.map(([, module, title, amount, done]) => (
										<div key={title} style={{padding: '8px 9px', borderRadius: 12, background: MODULES[module] ? colors.card : colors.card, border: `1px solid ${colors.line}`, borderLeft: `4px solid ${MODULES[module].color.light}`, opacity: done ? 0.55 : 1}}>
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
				<Stack gap={12} style={{width: 330, flexShrink: 0, padding: '18px 20px 24px 0', boxSizing: 'border-box'}}>
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

/* ------------------------------------------------------------------ Statistics dashboard */

export const StatisticsDashboardScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const days = [t('Pzt', 'Mon'), t('Sal', 'Tue'), t('Çar', 'Wed'), t('Per', 'Thu'), t('Cum', 'Fri'), t('Cmt', 'Sat'), t('Paz', 'Sun')];
	return (
		<Tablet>
			<Stack gap={14} style={{flex: 1, padding: '12px 28px 24px', boxSizing: 'border-box'}}>
				<Stack row justify="space-between">
					<Stack row gap={12}>
						<RoundButton icon="left" />
						<Text role="title" size={26}>
							{t('İstatistiklerim', 'My statistics')}
						</Text>
					</Stack>
					<div style={{width: 360}}>
						<Segmented items={[t('Bu hafta', 'This week'), t('Son 30 gün', 'Last 30 days'), t('Tümü', 'All')]} active={1} />
					</div>
				</Stack>
				<Stack row gap={12}>
					<KpiCard compact icon="clock" label={t('Çalışma süresi', 'Study time')} value={t('19 sa 40 dk', '19 h 40 m')} delta="%22" />
					<KpiCard compact icon="quiz" label={t('Çözülen soru', 'Questions')} value="742" delta="%31" />
					<KpiCard compact icon="target" label={t('Doğru oranı', 'Accuracy')} value="%62" delta="%6" />
					<KpiCard compact icon="trend" label={t('TYT net', 'TYT net')} value="84,25" delta="5,75" />
				</Stack>
				<Stack row gap={14} align="stretch" style={{flex: 1, minHeight: 0}}>
					<Pane style={{flex: 1.15}}>
						<Text role="headline" size={16}>
							{t('Haftalık çalışma', 'Weekly study')}
						</Text>
						<StudyBars height={170} active={2} tooltip={{title: t('3. hafta', 'Week 3'), rows: [[t('Planlanan', 'Planned'), t('6 sa', '6 h')], [t('Çalışılan', 'Studied'), t('6 sa 5 dk', '6 h 5 m')]]}} bars={WEEKS(t)} />
						<StudyDonut size={120} center={t('19 sa', '19 h')} sub={t('toplam', 'total')} parts={[['lessons', 520], ['tests', 370], ['exam', 260], ['flashcards', 125]]} />
					</Pane>
					<Pane style={{flex: 1}}>
						<Text role="headline" size={16}>
							{t('En verimli saatlerin', 'Your best hours')}
						</Text>
						<StudyHeatmap cells={HEATMAP_SAMPLE} days={days} hours={['06', '09', '12', '15', '18', '20', '22', '24']} cell={34} />
						<Card tone="soft" padding={12} style={{marginTop: 'auto'}}>
							<Text role="small" color={colors.ink2}>
								{t('Hafta içi 18:00–20:00 arası en çok doğru yapıyorsun; Ders Planı zor dersleri bu saate koyar. Fizik en zayıf dersin: bu hafta 2 Fizik görevi eklendi.', 'You are most accurate 18:00–20:00; the plan puts hard subjects there.')}
							</Text>
						</Card>
					</Pane>
				</Stack>
			</Stack>
		</Tablet>
	);
};

const WEEKS = (t: (tr: string, en: string) => string) => [
	{label: t('1. hf', 'W1'), parts: [['lessons', 80], ['tests', 60], ['exam', 40], ['flashcards', 20]] as [ModuleKey, number][]},
	{label: t('2. hf', 'W2'), parts: [['lessons', 110], ['tests', 70], ['exam', 0], ['flashcards', 30]] as [ModuleKey, number][]},
	{label: t('3. hf', 'W3'), parts: [['lessons', 90], ['tests', 85], ['exam', 165], ['flashcards', 25]] as [ModuleKey, number][]},
	{label: t('4. hf', 'W4'), parts: [['lessons', 130], ['tests', 70], ['exam', 0], ['flashcards', 50]] as [ModuleKey, number][]},
	{label: t('Bu hf', 'Now'), parts: [['lessons', 110], ['tests', 85], ['exam', 55], ['flashcards', 0]] as [ModuleKey, number][]},
];

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

/* ------------------------------------------------------------------ Testler · two panes */

export const TestSolutionsSplitScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('tests');
	const rows: [number, 'ok' | 'no' | 'empty'][] = [
		[1, 'ok'],
		[2, 'ok'],
		[3, 'no'],
		[4, 'no'],
		[5, 'ok'],
		[6, 'no'],
		[7, 'no'],
		[8, 'empty'],
		[9, 'no'],
		[10, 'ok'],
	];
	return (
		<Tablet module="tests" wash>
			<Stack row align="stretch" style={{flex: 1, minHeight: 0}}>
				<SideRail module="tests" active={2} />
				<Stack gap={10} style={{width: 330, flexShrink: 0, padding: '18px 16px', borderRight: `1px solid ${colors.line}`, boxSizing: 'border-box'}}>
					<Text role="meta">{t('Temel Kavramlar · Kolay', 'Basics · Easy')}</Text>
					<Text role="title" size={22}>
						{t('Çözümler · 5 / 20', 'Solutions · 5 / 20')}
					</Text>
					<Segmented items={[t('Yanlış', 'Wrong'), t('Boş', 'Blank'), t('Tümü', 'All')]} active={2} module="tests" />
					<Stack gap={4}>
						{rows.map(([number, state]) => (
							<Stack key={number} row gap={12} style={{padding: '9px 10px', borderRadius: 14, background: number === 3 ? mod.soft : 'transparent'}}>
								<div style={{width: 28, height: 28, borderRadius: 9, background: state === 'ok' ? colors.successSoft : state === 'no' ? colors.errorSoft : colors.line2, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
									<Icon name={state === 'ok' ? 'check' : state === 'no' ? 'x' : 'minus'} size={15} color={state === 'ok' ? colors.successInk : state === 'no' ? colors.errorInk : colors.muted} />
								</div>
								<Text role="headline" size={14.5} style={{flex: 1}} color={number === 3 ? mod.ink : colors.ink}>
									{t(`Soru ${number}`, `Question ${number}`)}
								</Text>
								<Text role="meta">{state === 'ok' ? '' : t('%50 bildi', '50% got it')}</Text>
							</Stack>
						))}
					</Stack>
				</Stack>
				<Stack gap={12} style={{flex: 1, padding: '22px 30px', boxSizing: 'border-box'}}>
					<Text role="meta">{t('Soru 3 / 20', 'Question 3 / 20')}</Text>
					<Text role="body" size={19} weight={600} color={colors.ink} style={{lineHeight: '30px'}}>
						{t('Aşağıdakilerden hangisi tam sayıdır ama doğal sayı değildir?', 'Which is an integer but not a natural number?')}
					</Text>
					<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9}}>
						<OptionRow letter="A" text="−4" state="correct" />
						<OptionRow letter="B" text="0" />
						<OptionRow letter="C" text="3/2" state="wrong" />
						<OptionRow letter="D" text="7" />
					</div>
					<Pane>
						<Text role="headline">{t('Çözüm', 'Solution')}</Text>
						<Text role="body">{t('Doğal sayılar 0 ve pozitif tam sayılardır. −4 tam sayıdır ama negatif olduğu için doğal değildir; 3/2 tam sayı değildir.', 'Natural numbers are 0 and the positive integers.')}</Text>
					</Pane>
					<Stack row gap={10} style={{marginTop: 'auto'}}>
						<Button tone="moduleSoft" module="lessons" icon="book">
							{t('Konuyu çalış', 'Study the topic')}
						</Button>
						<div style={{flex: 1}} />
						<Button tone="ghost" icon="left" />
						<Button tone="module" module="tests" iconRight="right">
							{t('Sonraki yanlış', 'Next mistake')}
						</Button>
					</Stack>
				</Stack>
			</Stack>
		</Tablet>
	);
};
