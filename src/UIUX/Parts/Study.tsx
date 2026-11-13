import React from 'react';
import {useAccent, useColors, useModuleColors, useT} from '../Context';
import {Icon, type UIIconName} from '../Icons';
import {MODULES, type ModuleKey} from '../ModuleIdentity';
import {UI_SHADOW} from '../Tokens';
import {Bar, Button, Stack, Text, Tile} from './Shared';

/**
 * Study parts shared by mobile, tablet and web (5–8 Nov 2026): the week strip,
 * today's plan card and its states (plan, no plan, day done, trial ended),
 * the action card, plan filter chips and task cards, net bars, the state
 * block, KPI cards, the stacked study bars and the study-hours heatmap.
 * Every platform draws these same parts, so the three stay in step.
 */

export type HubState = 'plan' | 'noPlan' | 'done' | 'expired';

/** The week strip: today in the accent, a dot under days with finished tasks, a ring for today's share. */
export const WeekStrip: React.FC<{today?: number; done?: number[]; share?: number; module?: ModuleKey}> = ({today = 3, done = [0, 1, 2], share = 0.4, module}) => {
	const colors = useColors();
	const accent = useAccent(module);
	const t = useT();
	const days = [t('Pzt', 'Mon'), t('Sal', 'Tue'), t('Çar', 'Wed'), t('Per', 'Thu'), t('Cum', 'Fri'), t('Cmt', 'Sat'), t('Paz', 'Sun')];
	return (
		<Stack row justify="space-between">
			{days.map((day, index) => {
				const on = index === today;
				return (
					<Stack key={day} align="center" gap={5} style={{width: 46, padding: '8px 0 9px', borderRadius: 22, background: on ? colors.card : 'transparent', boxShadow: on ? UI_SHADOW.card : undefined}}>
						<Text role="meta" color={on ? accent.ink : colors.muted} weight={on ? 800 : 600}>
							{day}
						</Text>
						<div style={{position: 'relative', width: 34, height: 34, borderRadius: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', background: on ? accent.soft : colors.card, border: on ? undefined : `1px solid ${colors.line}`}}>
							{on ? (
								<svg width={34} height={34} style={{position: 'absolute', inset: 0, transform: 'rotate(-90deg)'}}>
									<circle cx={17} cy={17} r={15.5} fill="none" stroke={accent.color} strokeWidth={2.5} strokeDasharray={`${share * 97.4} 97.4`} strokeLinecap="round" />
								</svg>
							) : null}
							<Text role="headline" size={14} color={on ? accent.ink : colors.ink} tnum>
								{12 + index}
							</Text>
						</div>
						<div style={{width: 5, height: 5, borderRadius: 3, background: done.includes(index) ? accent.color : 'transparent'}} />
					</Stack>
				);
			})}
		</Stack>
	);
};

/** What an action card shows above its button: progress, a countdown, or why it is locked. */
type ActionMeter = {progress: number; label: string} | {countdown: [string, string][]} | {locked: string};

/**
 * One of the two big action cards: over-line, title, one line, a meter that
 * says something (how far, how long until), one verb. Same part on phone,
 * tablet and web.
 */
export const ActionCard: React.FC<{module: ModuleKey; over: string; title: string; line: string; action: string; icon?: UIIconName; meter?: ActionMeter}> = ({module, over, title, line, action, icon, meter}) => {
	const colors = useColors();
	const mod = useModuleColors(module);
	return (
		<div style={{flex: 1, borderRadius: 24, background: colors.card, border: `1px solid ${colors.line}`, boxShadow: UI_SHADOW.card, padding: 14, display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0}}>
			<Stack row justify="space-between">
				<Text role="over" color={mod.ink}>
					{over}
				</Text>
				<Icon name="right" size={16} color={colors.subtle} />
			</Stack>
			<Text role="section" size={17} style={{lineHeight: '22px'}}>
				{title}
			</Text>
			<Text role="small">{line}</Text>
			<div style={{minHeight: 64, boxSizing: 'border-box', borderRadius: 16, background: mod.soft, margin: '4px 0', padding: '10px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8}}>
				{meter && 'progress' in meter ? (
					<>
						<Stack row justify="space-between">
							<Text role="small" weight={700} color={mod.ink}>
								{meter.label}
							</Text>
							<Text role="meta" weight={800} color={mod.ink}>
								%{Math.round(meter.progress * 100)}
							</Text>
						</Stack>
						<Bar value={Math.max(meter.progress, 0.02)} color={mod.color} track={colors.card} height={8} />
					</>
				) : meter && 'countdown' in meter ? (
					<Stack row gap={6} justify="center">
						{meter.countdown.map(([value, unit]) => (
							<Stack key={unit} align="center" gap={0} style={{flex: 1, padding: '4px 0', borderRadius: 10, background: colors.card}}>
								<Text role="headline" size={17} tnum>
									{value}
								</Text>
								<Text role="meta" size={12}>
									{unit}
								</Text>
							</Stack>
						))}
					</Stack>
				) : meter && 'locked' in meter ? (
					<Stack row gap={8} justify="center">
						<Icon name="lock" size={16} color={mod.ink} />
						<Text role="small" weight={700} color={mod.ink}>
							{meter.locked}
						</Text>
					</Stack>
				) : (
					<Stack align="center">
						<Tile module={module} icon={icon} size={42} solid />
					</Stack>
				)}
			</div>
			<Button tone="module" module={module} size="sm" block>
				{action}
			</Button>
		</div>
	);
};

/** Today's plan on the home screen: progress and the next task with its own button; other states below. */
export const TodayCard: React.FC<{state?: HubState}> = ({state = 'plan'}) => {
	const t = useT();
	const colors = useColors();
	const plan = useModuleColors('studyPlan');
	if (state === 'noPlan') return <NoPlanCard />;
	if (state === 'done') return <DayDoneCard />;
	if (state === 'expired') return <ExpiredCard />;
	return (
		<div style={{borderRadius: 24, background: colors.card, border: `1px solid ${colors.line}`, boxShadow: UI_SHADOW.card, padding: 16, display: 'flex', flexDirection: 'column', gap: 12}}>
			<Stack row justify="space-between">
				<Stack gap={2}>
					<Text role="over" color={plan.ink}>
						{t('Bugünün planı', 'Today’s plan')}
					</Text>
					<Text role="headline" size={16}>
						{t('2 / 5 görev · 45 / 90 dk', '2 / 5 tasks · 45 / 90 min')}
					</Text>
				</Stack>
				<Text role="small" weight={700} color={plan.ink}>
					{t('Tümü', 'All')}
				</Text>
			</Stack>
			<Bar value={0.45} color={plan.color} track={plan.track} height={8} />
			<Stack row gap={12} style={{padding: '10px 12px', borderRadius: 18, background: colors.line2}}>
				<Tile module="tests" size={40} />
				<Stack grow gap={1}>
					<Text role="meta">{t('Sıradaki · Testler', 'Next · Quizzes')}</Text>
					<Text role="headline">{t('Problemler · Orta', 'Problems · Medium')}</Text>
					<Text role="small">{t('20 soru · 25 dk', '20 questions · 25 min')}</Text>
				</Stack>
				<Button tone="module" module="tests" size="sm" icon="play">
					{t('Başla', 'Start')}
				</Button>
			</Stack>
		</div>
	);
};

/** No plan yet (new student): what the plan knows already, one button, and a first step that needs no plan. */
const NoPlanCard: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const plan = useModuleColors('studyPlan');
	return (
		<div style={{borderRadius: 24, background: colors.card, border: `1.5px solid ${plan.line}`, boxShadow: UI_SHADOW.card, padding: 16, display: 'flex', flexDirection: 'column', gap: 12}}>
			<Stack row gap={12} align="flex-start">
				<Tile module="studyPlan" size={46} solid />
				<Stack grow gap={3}>
					<Text role="over" color={plan.ink}>
						{t('Planın yok', 'No plan yet')}
					</Text>
					<Text role="section" size={17} style={{lineHeight: '22px'}}>
						{t('Planını 1 dakikada hazırlayalım', 'Let’s build your plan in a minute')}
					</Text>
				</Stack>
			</Stack>
			<Stack gap={6} style={{padding: '10px 12px', borderRadius: 16, background: plan.wash}}>
				{[
					[t('Sınavın', 'Exam'), t('TYT · 245 gün', 'TYT · 245 days')],
					[t('Haftada', 'Per week'), t('5 gün · günde 90 dk', '5 days · 90 min a day')],
					[t('Zorlandığın', 'Hard for you'), t('Matematik, Fizik', 'Maths, Physics')],
				].map(([label, value]) => (
					<Stack key={label} row justify="space-between">
						<Text role="small">{label}</Text>
						<Text role="small" weight={700} color={colors.ink}>
							{value}
						</Text>
					</Stack>
				))}
				<Text role="meta">{t('Bunları kayıtta söyledin; istersen değiştirirsin.', 'From your sign-up; you can change them.')}</Text>
			</Stack>
			<Button tone="module" module="studyPlan" block icon="sparkles">
				{t('Planımı hazırla', 'Build my plan')}
			</Button>
			<Text role="small" align="center" weight={700} color={plan.ink}>
				{t('Kendi planımı kuracağım', 'I’ll make my own')}
			</Text>
		</div>
	);
};

/** Every task of the day is done: the streak grows, tomorrow is one tap away, extra is optional. */
const DayDoneCard: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<div style={{borderRadius: 24, background: colors.card, border: `1.5px solid ${colors.success}`, boxShadow: UI_SHADOW.card, padding: 16, display: 'flex', flexDirection: 'column', gap: 12}}>
			<Stack row gap={12}>
				<div style={{width: 46, height: 46, borderRadius: 23, background: colors.success, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<Icon name="check" size={24} color="#FFFFFF" />
				</div>
				<Stack grow gap={2}>
					<Text role="section" size={17}>
						{t('Bugünkü planın bitti', 'Today’s plan is done')}
					</Text>
					<Text role="small">{t('5 / 5 görev · 92 dk · seri 6 gün', '5 / 5 tasks · 92 min · 6-day streak')}</Text>
				</Stack>
			</Stack>
			<Stack row gap={8}>
				<Button tone="ghost" size="sm" style={{flex: 1}} icon="calendar">
					{t('Yarına bak', 'See tomorrow')}
				</Button>
				<Button tone="moduleSoft" module="tests" size="sm" style={{flex: 1}} icon="quiz">
					{t('Fazladan 10 soru', '10 extra questions')}
				</Button>
			</Stack>
		</div>
	);
};

/** The trial or the subscription ended: progress is kept, modules wait; one way back (no payment, no access). */
const ExpiredCard: React.FC = () => {
	const t = useT();
	const colors = useColors();
	return (
		<div style={{borderRadius: 24, background: colors.brandWash, border: `1.5px solid ${colors.brandSoft}`, padding: 16, display: 'flex', flexDirection: 'column', gap: 10}}>
			<Stack row gap={12} align="flex-start">
				<div style={{width: 46, height: 46, borderRadius: 15, background: colors.card, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
					<Icon name="lock" size={22} color={colors.brandDeep} />
				</div>
				<Stack grow gap={3}>
					<Text role="section" size={17}>
						{t('3 günlük deneme süren bitti', 'Your 3-day trial has ended')}
					</Text>
					<Text role="small" color={colors.ink2}>
						{t('Planın, ilerlemen ve notların duruyor. Abone olunca kaldığın yerden devam edersin.', 'Your plan, progress and notes are kept.')}
					</Text>
				</Stack>
			</Stack>
			<Button block>{t('Paketleri gör', 'See plans')}</Button>
			<Text role="meta" align="center">
				{t('Mağaza aboneliğini geri yükle', 'Restore a store purchase')}
			</Text>
		</div>
	);
};

/** A filter chip row that scrolls sideways. */
export const FilterChips: React.FC<{items: string[]; active?: number; module?: ModuleKey}> = ({items, active = 0, module = 'studyPlan'}) => {
	const colors = useColors();
	const mod = useModuleColors(module);
	return (
		<div style={{display: 'flex', gap: 8, overflow: 'hidden', margin: '0 -18px', padding: '0 18px'}}>
			{items.map((item, index) => (
				<div key={item} style={{flexShrink: 0, padding: '8px 14px', borderRadius: 14, background: index === active ? mod.action : colors.card, border: index === active ? undefined : `1px solid ${colors.line}`}}>
					<Text role="small" weight={700} color={index === active ? '#FFFFFF' : colors.ink2}>
						{item}
					</Text>
				</div>
			))}
		</div>
	);
};

/**
 * A plan task card (study-plan calendar task): where it comes from on top
 * (exam · lesson · module), the topic in bold, the module badge, and how much
 * it is (questions, micro-lessons, cards) or its time on the right.
 */
export const PlanTaskCard: React.FC<{module: ModuleKey | 'own'; source: string; title: string; amount: string; badge?: string; done?: boolean; now?: boolean}> = ({module, source, title, amount, badge, done, now}) => {
	const colors = useColors();
	const t = useT();
	const key: ModuleKey = module === 'own' ? 'studyPlan' : module;
	const mod = useModuleColors(key);
	return (
		<div style={{padding: '12px 14px 12px', borderRadius: 20, background: colors.card, border: `1.5px solid ${now ? mod.line : colors.line}`, boxShadow: now ? UI_SHADOW.card : undefined, display: 'flex', flexDirection: 'column', gap: 8, opacity: done ? 0.62 : 1}}>
			<Stack row justify="space-between" align="flex-start" gap={10}>
				<Stack gap={2} grow>
					<Text role="meta" size={12.5}>
						{source}
					</Text>
					<Text role="headline" size={15.5} style={{textDecoration: done ? 'line-through' : undefined}}>
						{title}
					</Text>
				</Stack>
				<div style={{width: 26, height: 26, borderRadius: 13, border: done ? undefined : `2px solid ${colors.line}`, background: done ? colors.success : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
					{done ? <Icon name="check" size={15} color="#FFFFFF" /> : null}
				</div>
			</Stack>
			<Stack row justify="space-between">
				<Stack row gap={8}>
					{module === 'own' ? null : <Tile module={key} size={26} />}
					<div style={{padding: '3px 10px', borderRadius: 8, background: module === 'own' ? colors.line2 : mod.soft}}>
						<Text role="over" size={12} color={module === 'own' ? colors.ink2 : mod.ink}>
							{badge ?? (module === 'own' ? t('Kendi görevin', 'Your task') : t(MODULES[key].name))}
						</Text>
					</div>
				</Stack>
				<Text role="small" weight={600} color={colors.ink2}>
					{amount}
				</Text>
			</Stack>
		</div>
	);
};

/** Net bars with the value on each bar and the exam under it (owner's reference: Deneme Performansım). */
export const NetBars: React.FC<{items: [string, number, boolean?][]; max?: number; height?: number}> = ({items, max = 120, height = 150}) => {
	const colors = useColors();
	const mod = useModuleColors('exam');
	return (
		<Stack gap={6}>
			<div style={{position: 'relative', height, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10, padding: '0 4px'}}>
				{[0.25, 0.5, 0.75, 1].map((line) => (
					<div key={line} style={{position: 'absolute', left: 0, right: 0, bottom: height * line, borderTop: `1px dashed ${colors.line}`}} />
				))}
				{items.map(([label, value, own]) => (
					<div key={label} style={{position: 'relative', flex: 1, height: Math.max((value / max) * height, 30), borderRadius: '14px 14px 6px 6px', background: own ? `repeating-linear-gradient(135deg, ${mod.soft} 0 6px, ${mod.track} 6px 12px)` : `linear-gradient(180deg, ${mod.color} 0%, ${mod.action} 100%)`, display: 'flex', justifyContent: 'center', paddingTop: 8, boxSizing: 'border-box'}}>
						<Text role="headline" size={13.5} color={own ? mod.ink : '#FFFFFF'} tnum>
							{value.toLocaleString('tr-TR')}
						</Text>
					</div>
				))}
			</div>
			<Stack row justify="space-between" gap={10} style={{padding: '0 4px'}}>
				{items.map(([label]) => (
					<Text key={label} role="meta" size={12} align="center" style={{flex: 1}}>
						{label}
					</Text>
				))}
			</Stack>
		</Stack>
	);
};

/** An empty or finished state: the module's tile, a title, a reason, one main action, an optional second. */
export const StateBlock: React.FC<{module?: ModuleKey; icon?: UIIconName; tone?: 'module' | 'success' | 'warning' | 'error'; title: string; text: string; action?: string; second?: string; children?: React.ReactNode}> = ({module, icon, tone = 'module', title, text, action, second, children}) => {
	const colors = useColors();
	const mod = useModuleColors(module);
	const fill = {module: mod.soft, success: colors.successSoft, warning: colors.warningSoft, error: colors.errorSoft}[tone];
	const ink = {module: mod.color, success: colors.successInk, warning: colors.warningInk, error: colors.errorInk}[tone];
	return (
		<Stack align="center" gap={10} style={{padding: '22px 18px 20px', borderRadius: 24, background: colors.card, border: `1px solid ${colors.line}`, boxShadow: UI_SHADOW.card, textAlign: 'center'}}>
			<div style={{width: 64, height: 64, borderRadius: 22, background: fill, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<Icon name={icon ?? 'info'} size={30} color={ink} />
			</div>
			<Text role="section" size={18} align="center">
				{title}
			</Text>
			<Text role="body" size={15} align="center" style={{lineHeight: '22px'}}>
				{text}
			</Text>
			{children}
			{action ? (
				<Button tone={module ? 'module' : 'primary'} module={module} block style={{marginTop: 4}}>
					{action}
				</Button>
			) : null}
			{second ? (
				<Text role="small" weight={700} color={module ? mod.ink : colors.brandDeep}>
					{second}
				</Text>
			) : null}
		</Stack>
	);
};

/* ------------------------------------------------------------------ analytics parts (owner's reference, 8 Nov 2026) */

/** A KPI card: label, an icon tile, the big number, the change against the last period, its period. */
export const KpiCard: React.FC<{label: string; value: string; delta?: string; down?: boolean; period?: string; icon: UIIconName; module?: ModuleKey; compact?: boolean}> = ({label, value, delta, down, period, icon, module, compact}) => {
	const colors = useColors();
	const accent = useAccent(module);
	return (
		<div style={{flex: 1, minWidth: 0, boxSizing: 'border-box', borderRadius: 22, background: colors.card, border: `1px solid ${colors.line}`, padding: compact ? '12px 14px' : '16px 18px', display: 'flex', flexDirection: 'column', gap: compact ? 6 : 10}}>
			<Stack row justify="space-between" align="flex-start">
				<Text role="small" weight={600} color={colors.ink2}>
					{label}
				</Text>
				<div style={{width: compact ? 30 : 36, height: compact ? 30 : 36, borderRadius: 18, background: accent.soft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
					<Icon name={icon} size={compact ? 15 : 18} color={accent.ink} />
				</div>
			</Stack>
			<Stack row gap={8} align="center" wrap>
				<Text role="num" size={compact ? 22 : 28} tnum>
					{value}
				</Text>
				{delta ? (
					<div style={{padding: '2px 8px', borderRadius: 8, background: down ? colors.errorSoft : colors.successSoft}}>
						<Text role="meta" weight={800} color={down ? colors.errorInk : colors.successInk}>
							{down ? '↘' : '↗'} {delta}
						</Text>
					</div>
				) : null}
			</Stack>
			{period ? <Text role="meta">{period}</Text> : null}
		</div>
	);
};

/** Study minutes per day or week, stacked by module; one bar raised with its tooltip (planned vs studied). */
export const StudyBars: React.FC<{bars: {label: string; parts: [ModuleKey, number][]}[]; active?: number; tooltip?: {title: string; rows: [string, string][]}; height?: number; max?: number}> = ({bars, active, tooltip, height = 150, max}) => {
	const colors = useColors();
	const top = max ?? Math.max(...bars.map((bar) => bar.parts.reduce((sum, [, value]) => sum + value, 0)), 1);
	return (
		<div style={{position: 'relative'}}>
			<div style={{position: 'relative', height, display: 'flex', alignItems: 'flex-end', gap: 10}}>
				{[0.33, 0.66, 1].map((line) => (
					<div key={line} style={{position: 'absolute', left: 0, right: 0, bottom: height * line, borderTop: `1px dashed ${colors.line}`}} />
				))}
				{bars.map((bar, index) => {
					const total = bar.parts.reduce((sum, [, value]) => sum + value, 0);
					const dim = active !== undefined && index !== active;
					return (
						<div key={bar.label} style={{position: 'relative', flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end'}}>
							<div style={{width: '100%', height: `${(total / top) * 100}%`, minHeight: 6, borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column-reverse', background: colors.line2, opacity: dim ? 0.35 : 1}}>
								{bar.parts.map(([module, value]) => (
									<div key={module} style={{height: `${(value / (total || 1)) * 100}%`, background: MODULES[module].color.light}} />
								))}
							</div>
							{index === active ? <div style={{position: 'absolute', left: '50%', top: `${100 - (total / top) * 100}%`, width: 10, height: 10, marginLeft: -5, marginTop: -5, borderRadius: 5, background: colors.card, border: `2.5px solid ${colors.ink}`}} /> : null}
						</div>
					);
				})}
			</div>
			<Stack row gap={10} style={{marginTop: 8}}>
				{bars.map((bar, index) => (
					<Text key={bar.label} role="meta" align="center" weight={index === active ? 800 : 600} color={index === active ? colors.ink : colors.muted} style={{flex: 1}}>
						{bar.label}
					</Text>
				))}
			</Stack>
			{tooltip && active !== undefined ? (
				<div style={{position: 'absolute', left: `calc(${((active + 1) / bars.length) * 100}% - 4px)`, top: 4, minWidth: 150, padding: '10px 12px', borderRadius: 14, background: colors.card, boxShadow: UI_SHADOW.float, border: `1px solid ${colors.line}`, display: 'flex', flexDirection: 'column', gap: 4, transform: active > bars.length / 2 ? 'translateX(-115%)' : undefined}}>
					<Text role="headline" size={13.5}>
						{tooltip.title}
					</Text>
					{tooltip.rows.map(([name, value]) => (
						<Stack key={name} row justify="space-between" gap={14}>
							<Text role="meta">{name}</Text>
							<Text role="meta" weight={800} color={colors.ink}>
								{value}
							</Text>
						</Stack>
					))}
				</div>
			) : null}
		</div>
	);
};

/** A donut with its legend: where the study time went (share per module). */
export const StudyDonut: React.FC<{parts: [ModuleKey, number][]; center: string; sub: string; size?: number; legend?: 'right' | 'below'}> = ({parts, center, sub, size = 150, legend = 'right'}) => {
	const colors = useColors();
	const t = useT();
	const total = parts.reduce((sum, [, value]) => sum + value, 0);
	const r = size / 2 - 12;
	const c = 2 * Math.PI * r;
	let offset = 0;
	return (
		<Stack row={legend === 'right'} gap={18} align="center">
			<div style={{position: 'relative', width: size, height: size, flexShrink: 0}}>
				<svg width={size} height={size} style={{transform: 'rotate(-90deg)'}}>
					<circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={colors.line2} strokeWidth={16} />
					{parts.map(([module, value]) => {
						const length = (value / total) * c;
						const dash = <circle key={module} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={MODULES[module].color.light} strokeWidth={16} strokeDasharray={`${Math.max(length - 4, 0)} ${c}`} strokeDashoffset={-offset} strokeLinecap="round" />;
						offset += length;
						return dash;
					})}
				</svg>
				<Stack align="center" justify="center" style={{position: 'absolute', inset: 0}}>
					<Text role="section" size={size > 130 ? 22 : 17} tnum>
						{center}
					</Text>
					<Text role="meta">{sub}</Text>
				</Stack>
			</div>
			<Stack gap={8} grow>
				{parts.map(([module, value]) => (
					<Stack key={module} row gap={8} justify="space-between">
						<Stack row gap={8}>
							<div style={{width: 10, height: 10, borderRadius: 3, background: MODULES[module].color.light}} />
							<Text role="small" color={colors.ink2}>
								{t(MODULES[module].name)}
							</Text>
						</Stack>
						<Text role="headline" size={14} tnum>
							%{Math.round((value / total) * 100)}
						</Text>
					</Stack>
				))}
			</Stack>
		</Stack>
	);
};

/** When you study best: days × hours, the share of right answers by cell (darker = more right). */
export const StudyHeatmap: React.FC<{cells: number[][]; days: string[]; hours: string[]; cell?: number; module?: ModuleKey}> = ({cells, days, hours, cell = 30, module}) => {
	const colors = useColors();
	const accent = useAccent(module);
	return (
		<Stack gap={4}>
			{cells.map((row, dayIndex) => (
				<Stack key={days[dayIndex]} row gap={4}>
					<Text role="meta" style={{width: 34}}>
						{days[dayIndex]}
					</Text>
					{row.map((value, hourIndex) => (
						<div key={hourIndex} style={{flex: 1, height: cell * 0.72, minWidth: 0, borderRadius: 6, background: value <= 0 ? colors.line2 : accent.color, opacity: value <= 0 ? 1 : 0.18 + value * 0.82}} />
					))}
				</Stack>
			))}
			<Stack row gap={4} style={{paddingLeft: 38}}>
				{hours.map((hour) => (
					<Text key={hour} role="meta" align="center" style={{flex: 1}}>
						{hour}
					</Text>
				))}
			</Stack>
		</Stack>
	);
};

/** Sample week × hour grid (0 = no study, 0–1 = share of right answers). */
export const HEATMAP_SAMPLE: number[][] = [
	[0, 0, 0.4, 0.5, 0.3, 0.6, 0.8, 0.7],
	[0, 0, 0.3, 0.4, 0, 0.7, 0.9, 0.6],
	[0, 0.2, 0, 0.5, 0.6, 0.6, 0.85, 0.5],
	[0, 0, 0.35, 0, 0.5, 0.75, 0.95, 0.65],
	[0, 0, 0, 0.45, 0.4, 0.5, 0.6, 0],
	[0.3, 0.6, 0.75, 0.7, 0.4, 0.3, 0, 0],
	[0.25, 0.55, 0.7, 0.5, 0, 0, 0.3, 0.2],
];

/** A way into a module area as one full-width row: tile, title, one line, chevron (results entries on phone and web). */
export const EntryRow: React.FC<{module: ModuleKey; icon: UIIconName; title: string; sub: string; strong?: boolean}> = ({module, icon, title, sub, strong}) => {
	const colors = useColors();
	const mod = useModuleColors(module);
	return (
		<Stack row gap={14} style={{padding: '14px 16px', borderRadius: 20, background: strong ? mod.wash : colors.card, border: `1px solid ${strong ? mod.line : colors.line}`}}>
			<Tile module={module} icon={icon} size={42} solid={strong} />
			<Stack grow gap={1}>
				<Text role="headline" size={15.5}>
					{title}
				</Text>
				<Text role="small">{sub}</Text>
			</Stack>
			<Icon name="right" size={18} color={colors.subtle} />
		</Stack>
	);
};
