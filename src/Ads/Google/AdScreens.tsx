import React from 'react';
import {useColors, useModuleColors, useT} from '../../UIUX/Context';
import {Icon} from '../../UIUX/Icons';
import {MODULES} from '../../UIUX/ModuleIdentity';
import {AppHeader, Content, ModuleScreen, PageTitle, Phone} from '../../UIUX/Parts/Mobile';
import {Bar, Button, Card, Chip, List, Ring, Stack, Text, Tile} from '../../UIUX/Parts/Shared';
import {Grid, ModuleHead, Panel, WCard} from '../../UIUX/Parts/Web';
import {PlanTask} from '../../UIUX/Screens/Mobile/Plan';
import type {AdConcept, AdProof} from './GoogleAdsPlan';

/**
 * The product screens inside the ads: the real UI/UX parts, filled with the
 * concept's exam data (a KPSS ad never shows a TYT screen). One body per proof
 * kind; the phone wraps it in the module screen, the browser in the panel.
 */

type Kind<K extends AdProof['kind']> = Extract<AdProof, {kind: K}>;

const LossBody: React.FC<{proof: Kind<'loss'>; wide?: boolean}> = ({proof, wide}) => {
	const t = useT();
	const colors = useColors();
	return (
		<Stack gap={12}>
			<Card tone="module" module="exam" padding={14}>
				<Stack row gap={10}>
					<Icon name="target" size={20} color={MODULES.exam.color.light} />
					<Text role="small" color={colors.ink2}>
						{t('Son denemende en çok bu 3 konudan net kaybettin.', 'In your last mock you lost the most on these 3 topics.')}
					</Text>
				</Stack>
			</Card>
			<List>
				{proof.rows.map((row, index) => (
					<Stack key={row.topic.tr} row gap={12} align="flex-start" style={{padding: wide ? 18 : 14}}>
						<div style={{width: 28, height: 28, borderRadius: 9, background: colors.errorSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
							<Text role="headline" size={13} color={colors.error}>
								{index + 1}
							</Text>
						</div>
						<Stack grow gap={6}>
							<Stack row justify="space-between">
								<Text role="headline">{t(row.topic)}</Text>
								<Text role="headline" color={colors.error}>
									{t(row.loss)}
								</Text>
							</Stack>
							<Text role="small">{t(row.lesson)}</Text>
							<Stack row gap={6}>
								<Chip tone="module" module="lessons" icon="book" size="sm">
									{t('Mikro ders', 'Micro-lesson')}
								</Chip>
								<Chip tone="module" module="tests" icon="quiz" size="sm">
									{t('10 soru', '10 questions')}
								</Chip>
							</Stack>
						</Stack>
					</Stack>
				))}
			</List>
			<Button size="lg" block icon="plus">
				{t('Bu hafta planıma ekle', 'Add to this week’s plan')}
			</Button>
		</Stack>
	);
};

const TasksBody: React.FC<{proof: Kind<'tasks'>}> = ({proof}) => {
	const t = useT();
	const mod = useModuleColors('studyPlan');
	return (
		<Stack gap={10}>
			<Card padding={14}>
				<Stack row gap={14}>
					<Ring value={0.33} size={60} stroke={7} color={mod.color} track={mod.track}>
						<Text role="headline">1/3</Text>
					</Ring>
					<Stack grow gap={2}>
						<Text role="headline">{t(proof.title)}</Text>
						<Text role="small">{t(proof.meta)}</Text>
					</Stack>
					<Button tone="module" module="studyPlan" size="sm" icon="clock">
						{t('Odak', 'Focus')}
					</Button>
				</Stack>
			</Card>
			{proof.tasks.map((task, index) => (
				<PlanTask key={task.text.tr} module={task.module} title={t(task.text)} meta={t(task.sub)} done={task.done} now={!task.done && index === proof.tasks.findIndex((entry) => !entry.done)} />
			))}
		</Stack>
	);
};

const StepsBody: React.FC<{proof: Kind<'steps'>}> = ({proof}) => {
	const t = useT();
	const colors = useColors();
	const mod = useModuleColors('smartSummary');
	return (
		<Stack gap={12}>
			<div style={{height: 120, borderRadius: 18, background: '#F5F1E8', border: `1px solid ${colors.line}`, padding: 16, boxSizing: 'border-box'}}>
				<Text role="small" color="#3F3A33" style={{lineHeight: '19px'}}>
					{t('Bir sınıftaki kızların sayısının erkeklerin sayısına oranı 3/5’tir. Erkekler kızlardan 12 fazla olduğuna göre sınıf mevcudu kaçtır?', 'In a class the ratio of girls to boys is 3/5. There are 12 more boys than girls. How many students are there?')}
				</Text>
			</div>
			<Chip tone="module" module="smartSummary" icon="book" size="sm">
				{t(proof.topic)}
			</Chip>
			<Card padding={16}>
				<Stack gap={12}>
					{proof.steps.map((step, index) => (
						<Stack key={step.tr} row gap={10} align="flex-start">
							<div style={{width: 24, height: 24, borderRadius: 12, background: mod.soft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
								<Text role="meta" weight={800} color={mod.color}>
									{index + 1}
								</Text>
							</div>
							<Text role="body" color={colors.ink}>
								{t(step)}
							</Text>
						</Stack>
					))}
					<div style={{padding: '10px 14px', borderRadius: 12, background: colors.successSoft}}>
						<Text role="headline" color={colors.success}>
							{t(proof.answer)}
						</Text>
					</div>
				</Stack>
			</Card>
		</Stack>
	);
};

const TYT_LESSONS: [string, string, number, number][] = [
	['Türkçe', 'Turkish', 33, 40],
	['Sosyal Bilimler', 'Social sciences', 15, 20],
	['Temel Matematik', 'Basic maths', 21.75, 40],
	['Fen Bilimleri', 'Science', 10, 20],
];

const ScoreBody: React.FC<{proof: Kind<'score'>}> = ({proof}) => {
	const t = useT();
	const colors = useColors();
	return (
		<Card padding={18}>
			<Stack row gap={16}>
				<Ring value={0.65} size={104} stroke={10} color={MODULES.exam.color.light}>
					<Stack align="center">
						<Text role="num" size={28}>
							{t(proof.net)}
						</Text>
						<Text role="meta">net</Text>
					</Stack>
				</Ring>
				<Stack gap={6} grow>
					<Chip tone="success" icon="trend">
						{t(proof.delta)}
					</Chip>
					<Text role="small">
						{t(proof.rankLabel)} <b style={{color: colors.ink}}>{t(proof.rank)}</b> {t(proof.rankOf)}
					</Text>
				</Stack>
			</Stack>
			<Stack gap={10} style={{marginTop: 16}}>
				{TYT_LESSONS.map(([tr, en, score, total]) => (
					<Stack key={tr} gap={4}>
						<Stack row justify="space-between">
							<Text role="small" weight={700} color={colors.ink}>
								{t(tr, en)}
							</Text>
							<Text role="small">
								{String(score).replace('.', t(',', '.'))} / {total}
							</Text>
						</Stack>
						<Bar value={score / total} color={MODULES.exam.color.light} />
					</Stack>
				))}
			</Stack>
		</Card>
	);
};

const CardBody: React.FC<{proof: Kind<'card'>}> = ({proof}) => {
	const t = useT();
	const mod = useModuleColors('flashcards');
	return (
		<Stack gap={12}>
			<Stack row justify="space-between">
				<Text role="headline">{t(proof.title)}</Text>
				<Chip tone="module" module="flashcards" size="sm">
					{t(proof.meta)}
				</Chip>
			</Stack>
			<Bar value={0.38} color={mod.color} track={mod.track} height={6} />
			<Card padding={22} style={{minHeight: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
				<Stack gap={14} align="center">
					<Chip tone="module" module="flashcards" size="sm">
						{t(proof.deck)}
					</Chip>
					<Text role="title" size={24} align="center">
						{t(proof.front)}
					</Text>
					<Chip tone="outline" icon="refresh">
						{t('Çevir', 'Flip')}
					</Chip>
				</Stack>
			</Card>
		</Stack>
	);
};

const ChatBody: React.FC<{proof: Kind<'chat'>}> = ({proof}) => {
	const t = useT();
	const colors = useColors();
	return (
		<Stack gap={18}>
			<Stack align="flex-end">
				<div style={{maxWidth: '82%', padding: '12px 16px', borderRadius: 20, background: colors.line2}}>
					<Text role="body" color={colors.ink}>
						{t(proof.question)}
					</Text>
				</div>
			</Stack>
			<Stack row gap={10} align="flex-start">
				<Icon name="sparkles" size={20} color={colors.ink} stroke={1.7} />
				<Stack gap={10} grow>
					<Text role="body" color={colors.ink} style={{lineHeight: '23px'}}>
						{t(proof.answer)}
					</Text>
					<Text role="small">{t(proof.note)}</Text>
				</Stack>
			</Stack>
			<Stack row gap={8} wrap>
				{[t('Benzer 3 soru', '3 similar questions'), t('Kart yap', 'Make a card')].map((label) => (
					<Chip key={label} tone="outline">
						{label}
					</Chip>
				))}
			</Stack>
		</Stack>
	);
};

const Body: React.FC<{proof: AdProof; wide?: boolean}> = ({proof, wide}) => {
	switch (proof.kind) {
		case 'loss':
			return <LossBody proof={proof} wide={wide} />;
		case 'tasks':
			return <TasksBody proof={proof} />;
		case 'steps':
			return <StepsBody proof={proof} />;
		case 'score':
			return <ScoreBody proof={proof} />;
		case 'card':
			return <CardBody proof={proof} />;
		case 'chat':
			return <ChatBody proof={proof} />;
	}
};

const SCREEN_TITLE: Record<AdProof['kind'], [string, string]> = {
	loss: ['Eksik konu analizi', 'Gap analysis'],
	tasks: ['Bugün', 'Today'],
	steps: ['Çözüm', 'Solution'],
	score: ['Sonuç', 'Result'],
	card: ['Kartlar', 'Cards'],
	chat: ['SinoAI', 'SinoAI'],
};

/** The concept as a phone screen (390 × 844). */
export const AdMobileScreen: React.FC<{concept: AdConcept}> = ({concept}) => {
	const t = useT();
	const colors = useColors();
	const {proof, module} = concept;
	if (proof.kind === 'chat') {
		return (
			<Phone bg={colors.card}>
				<AppHeader left="menu" title="SinoAI" logo={false} right={<Icon name="newChat" size={20} color={colors.ink2} />} />
				<Content tabBar={false} padding="18px 20px 20px">
					<Body proof={proof} />
				</Content>
				<div style={{padding: '0 16px 34px'}}>
					<Stack row gap={10} style={{padding: '12px 10px 12px 18px', borderRadius: 26, border: `1px solid ${colors.line}`, boxShadow: '0 10px 24px -16px rgba(15,23,42,0.35)'}}>
						<Text role="body" color={colors.subtle} style={{flex: 1}}>
							{t('SinoAI’ye sor', 'Ask SinoAI')}
						</Text>
						<div style={{width: 34, height: 34, borderRadius: 17, background: colors.ink, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							<Icon name="up" size={17} color={colors.card} stroke={2.4} />
						</div>
					</Stack>
				</div>
			</Phone>
		);
	}
	const title = t(...SCREEN_TITLE[proof.kind]);
	const focused = proof.kind === 'loss' || proof.kind === 'score' || proof.kind === 'steps';
	return (
		<ModuleScreen module={module} tab={focused ? 2 : 0} header={focused ? <AppHeader left="back" title={proof.kind === 'score' ? t(proof.title) : title} right={<div style={{width: 40}} />} /> : undefined}>
			<Content gap={12}>
				{focused ? null : <PageTitle module={module} title={title} />}
				<Body proof={proof} />
			</Content>
		</ModuleScreen>
	);
};

/** The concept as a web panel page (1440 × 900). */
export const AdWebScreen: React.FC<{concept: AdConcept}> = ({concept}) => {
	const t = useT();
	const colors = useColors();
	const {proof, module, exam} = concept;
	const identity = MODULES[module];
	const countdown = {kpss: t('KPSS hazırlığı', 'KPSS prep'), yks: t('YKS’ye 245 gün', '245 days to YKS'), sat: 'Digital SAT prep', act: 'ACT prep'}[exam];
	if (proof.kind === 'chat') {
		return (
			<Panel active="sinoAi" countdown={countdown}>
				<div style={{flex: 1, borderRadius: 24, background: colors.card, border: `1px solid ${colors.line}`, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '36px 0 24px'}}>
					<div style={{width: 720, flex: 1, display: 'flex', flexDirection: 'column', gap: 18}}>
						<ChatBody proof={proof} />
						<div style={{flex: 1}} />
						<Stack row gap={10} style={{padding: '16px 14px 16px 22px', borderRadius: 28, border: `1px solid ${colors.line}`, boxShadow: '0 12px 30px -18px rgba(15,23,42,0.3)'}}>
							<Text role="body" color={colors.subtle} style={{flex: 1}}>
								{t('Devam et…', 'Reply…')}
							</Text>
							<div style={{width: 38, height: 38, borderRadius: 19, background: colors.ink, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
								<Icon name="up" size={19} color={colors.card} stroke={2.4} />
							</div>
						</Stack>
					</div>
				</div>
			</Panel>
		);
	}
	const title = proof.kind === 'score' ? t(proof.title) : t(...SCREEN_TITLE[proof.kind]);
	return (
		<Panel active={module} countdown={countdown}>
			<ModuleHead module={module} title={title} sub={t(identity.tagline)} />
			<Grid columns="1.35fr 1fr" gap={18}>
				<WCard>
					<Body proof={proof} wide />
				</WCard>
				<WCard title={t('Sıradaki adım', 'Next step')}>
					<Stack gap={12}>
						<Stack row gap={12}>
							<Tile module="studyPlan" icon="calendar" size={40} />
							<Stack grow gap={2}>
								<Text role="headline">{t('Ders Planı’na eklendi', 'Added to Study Plan')}</Text>
								<Text role="small">{t('Bu hafta · 3 görev', 'This week · 3 tasks')}</Text>
							</Stack>
						</Stack>
						<Stack row gap={12}>
							<Tile module="sinoAi" icon="sparkles" size={40} />
							<Stack grow gap={2}>
								<Text role="headline">{t('SinoAI’ye sor', 'Ask SinoAI')}</Text>
								<Text role="small">{t('Takıldığın yerde adım adım', 'Step by step where you’re stuck')}</Text>
							</Stack>
						</Stack>
					</Stack>
				</WCard>
			</Grid>
		</Panel>
	);
};
