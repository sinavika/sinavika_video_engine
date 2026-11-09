import React from 'react';
import {useColors, useModuleColors, useT, UIProvider} from '../Context';
import {Icon, type UIIconName} from '../Icons';
import {alpha, MODULES, type ModuleKey} from '../ModuleIdentity';
import {UI_CANVAS, UI_RADIUS, UI_SHADOW} from '../Tokens';
import {PEN, usePen, type PenColor} from './Ink';
import {Stack, Text} from './Shared';

/**
 * Tablet parts (iPad 11" and Android tablets, 1194 × 834 landscape, 834 × 1194
 * portrait). The app's layout modes on tablets: portrait = tabletPortrait
 * (600–899 pt), landscape = tabletWide (≥ 900 pt), where the scratchpad sits
 * in a right column of 38 %. The pen tools follow the app's annotation kit:
 * Kalem, Fosforlu kalem, Silgi; İnce / Orta / Kalın; Geri al, İleri al;
 * Parmakla çizim; Kaydır / Çizim on the question.
 */

const {width: LW, height: LH} = UI_CANVAS.tablet;

const tabletSize = (portrait?: boolean) => (portrait ? {width: LH, height: LW} : {width: LW, height: LH});

const StatusBar: React.FC = () => {
	const colors = useColors();
	const t = useT();
	return (
		<Stack row justify="space-between" style={{height: 30, padding: '8px 26px 0', flexShrink: 0, boxSizing: 'border-box'}}>
			<Stack row gap={8}>
				<Text role="meta" size={13} weight={700} color={colors.ink}>
					9:41
				</Text>
				<Text role="meta" size={13} weight={600} color={colors.ink}>
					{t('Salı 4 Kas', 'Tue 4 Nov')}
				</Text>
			</Stack>
			<Stack row gap={6}>
				<Icon name="wifi" size={15} color={colors.ink} />
				<Text role="meta" size={12} weight={700} color={colors.ink}>
					%82
				</Text>
				<Icon name="battery" size={19} color={colors.ink} />
			</Stack>
		</Stack>
	);
};

/** The tablet canvas: status bar on top, home indicator at the bottom. */
export const Tablet: React.FC<{module?: ModuleKey; portrait?: boolean; wash?: boolean; children: React.ReactNode; overlay?: React.ReactNode}> = ({module, portrait, wash, children, overlay}) => (
	<UIProvider module={module}>
		<TabletCanvas portrait={portrait} wash={wash} overlay={overlay}>
			{children}
		</TabletCanvas>
	</UIProvider>
);

const TabletCanvas: React.FC<{portrait?: boolean; wash?: boolean; children: React.ReactNode; overlay?: React.ReactNode}> = ({portrait, wash, children, overlay}) => {
	const colors = useColors();
	const mod = useModuleColors();
	const size = tabletSize(portrait);
	return (
		<div style={{position: 'relative', ...size, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: wash ? `linear-gradient(180deg, ${mod.wash} 0%, ${colors.bg} 30%), ${colors.bg}` : colors.bg}}>
			<StatusBar />
			{children}
			{overlay}
			<div style={{position: 'absolute', left: '50%', bottom: 8, width: 200, height: 5, marginLeft: -100, borderRadius: 3, background: colors.ink, opacity: 0.85, zIndex: 40}} />
		</div>
	);
};

export const RoundButton: React.FC<{icon: UIIconName; on?: boolean; size?: number; label?: string}> = ({icon, on, size = 40, label}) => {
	const colors = useColors();
	const mod = useModuleColors();
	return (
		<div style={{height: size, minWidth: size, padding: label ? '0 14px 0 11px' : 0, boxSizing: 'border-box', borderRadius: size / 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: on ? mod.soft : colors.card, border: `1px solid ${on ? mod.line : colors.line}`, flexShrink: 0}}>
			<Icon name={icon} size={size * 0.5} color={on ? mod.ink : colors.ink} />
			{label ? (
				<Text role="small" weight={700} color={on ? mod.ink : colors.ink}>
					{label}
				</Text>
			) : null}
		</div>
	);
};

/**
 * Top bar of solving on a tablet: exit, what is being solved, time or
 * progress, and the two pen surfaces as toggles (Taslak kâğıdı, Soruya yaz).
 */
export const SolveBar: React.FC<{title: string; sub?: string; center?: React.ReactNode; scratch?: boolean; overlay?: boolean; pen?: boolean; compact?: boolean; right?: React.ReactNode}> = ({title, sub, center, scratch, overlay, pen = true, compact, right}) => {
	const t = useT();
	return (
		<Stack row gap={14} style={{height: 64, padding: '0 22px', flexShrink: 0}}>
			<RoundButton icon="x" />
			<Stack gap={1} style={{minWidth: 0}}>
				{sub ? <Text role="meta">{sub}</Text> : null}
				<Text role="headline" size={16} style={{whiteSpace: 'nowrap'}}>
					{title}
				</Text>
			</Stack>
			<div style={{flex: 1, display: 'flex', justifyContent: 'center'}}>{center}</div>
			{pen ? (
				<>
					<RoundButton icon="notebook" on={scratch} label={compact ? undefined : t('Taslak kâğıdı', 'Scratchpad')} />
					<RoundButton icon="pen" on={overlay} label={compact ? undefined : t('Soruya yaz', 'Write on question')} />
				</>
			) : null}
			{right}
		</Stack>
	);
};

/** The exam timer and progress as the bar's centre. */
export const TimerProgress: React.FC<{time: string; value: number; label: string}> = ({time, value, label}) => {
	const colors = useColors();
	const mod = useModuleColors();
	return (
		<Stack gap={5} align="center" style={{width: 260}}>
			<Stack row gap={8}>
				<Icon name="clock" size={16} color={mod.ink} />
				<Text role="headline" size={16} tnum>
					{time}
				</Text>
				<Text role="meta">{label}</Text>
			</Stack>
			<div style={{alignSelf: 'stretch', height: 5, borderRadius: 3, background: colors.line2}}>
				<div style={{width: `${value * 100}%`, height: '100%', borderRadius: 3, background: mod.color}} />
			</div>
		</Stack>
	);
};

type PenTool = 'pen' | 'highlighter' | 'eraser';
type PenWidth = 'thin' | 'medium' | 'thick';

const PEN_SWATCHES: PenColor[] = ['ink', 'blue', 'red', 'green'];
const MARKER_SWATCHES: PenColor[] = ['yellow', 'mint', 'pink'];

const Divider: React.FC<{vertical?: boolean}> = ({vertical}) => {
	const colors = useColors();
	return <div style={vertical ? {height: 1, width: 28, background: colors.line} : {width: 1, height: 28, background: colors.line}} />;
};

const ToolButton: React.FC<{icon: UIIconName; on?: boolean; dim?: boolean; size?: number}> = ({icon, on, dim, size = 40}) => {
	const colors = useColors();
	const mod = useModuleColors();
	return (
		<div style={{width: size, height: size, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: on ? mod.soft : 'transparent', boxShadow: on ? `inset 0 0 0 1.5px ${mod.line}` : undefined, flexShrink: 0}}>
			<Icon name={icon} size={22} color={on ? mod.ink : dim ? colors.subtle : colors.ink2} stroke={on ? 2.2 : 1.9} />
		</div>
	);
};

const Swatch: React.FC<{color: PenColor; on?: boolean}> = ({color, on}) => {
	const colors = useColors();
	const fill = usePen(color);
	const marker = color in {yellow: 1, mint: 1, pink: 1};
	return (
		<div style={{width: 30, height: 30, borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: on ? `0 0 0 2px ${colors.card}, 0 0 0 4px ${colors.ink}` : undefined, flexShrink: 0}}>
			<div style={{width: 24, height: 24, borderRadius: 12, background: marker ? PEN[color].light.replace(/[\d.]+\)$/, '0.9)') : fill, border: `1px solid ${alpha('#0B1C30', 0.12)}`}} />
		</div>
	);
};

const WidthDot: React.FC<{width: PenWidth; on?: boolean}> = ({width, on}) => {
	const colors = useColors();
	const mod = useModuleColors();
	const size = {thin: 4, medium: 8, thick: 14}[width];
	return (
		<div style={{width: 30, height: 30, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: on ? mod.soft : 'transparent'}}>
			<div style={{width: size, height: size, borderRadius: size / 2, background: on ? mod.ink : colors.ink2}} />
		</div>
	);
};

/**
 * The pen toolbar (the app's annotation kit): tool, colour, width, undo and
 * redo, finger drawing, clear. Floating pill; `vertical` docks it to an edge
 * so it never covers the text.
 */
export const PenToolbar: React.FC<{tool?: PenTool; color?: PenColor; width?: PenWidth; finger?: boolean; vertical?: boolean; mode?: 'draw' | 'scroll'; clear?: boolean; compact?: boolean; style?: React.CSSProperties}> = ({tool = 'pen', color = 'ink', width = 'medium', finger, vertical, mode, clear = true, compact, style}) => {
	const colors = useColors();
	const t = useT();
	const swatches = tool === 'highlighter' ? MARKER_SWATCHES : PEN_SWATCHES;
	return (
		<div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', alignItems: 'center', gap: 6, padding: vertical ? '10px 7px' : '7px 10px', borderRadius: 22, background: colors.card, border: `1px solid ${colors.line}`, boxShadow: UI_SHADOW.float, ...style}}>
			{mode ? (
				<>
					<div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: 2, padding: 3, borderRadius: 14, background: colors.line2}}>
						<ModePill icon="hand" label={t('Kaydır', 'Scroll')} on={mode === 'scroll'} vertical={vertical} />
						<ModePill icon="pen" label={t('Çiz', 'Draw')} on={mode === 'draw'} vertical={vertical} />
					</div>
					<Divider vertical={vertical} />
				</>
			) : null}
			<ToolButton icon="pen" on={tool === 'pen'} />
			<ToolButton icon="highlighter" on={tool === 'highlighter'} />
			<ToolButton icon="eraser" on={tool === 'eraser'} />
			<Divider vertical={vertical} />
			{swatches.map((swatch) => (
				<Swatch key={swatch} color={swatch} on={tool !== 'eraser' && swatch === color} />
			))}
			<Divider vertical={vertical} />
			{compact
				? null
				: (['thin', 'medium', 'thick'] as PenWidth[]).map((option) => <WidthDot key={option} width={option} on={option === width} />)}
			{compact ? null : <Divider vertical={vertical} />}
			<ToolButton icon="undo" />
			<ToolButton icon="redo" dim />
			{compact ? null : <ToolButton icon="hand" on={finger} />}
			{clear && !compact ? <ToolButton icon="trash" /> : null}
		</div>
	);
};

const ModePill: React.FC<{icon: UIIconName; label: string; on?: boolean; vertical?: boolean}> = ({icon, label, on, vertical}) => {
	const colors = useColors();
	const mod = useModuleColors();
	return (
		<div style={{height: 34, padding: vertical ? 0 : '0 11px', width: vertical ? 34 : undefined, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: on ? colors.card : 'transparent', boxShadow: on ? UI_SHADOW.card : undefined}}>
			<Icon name={icon} size={17} color={on ? mod.ink : colors.muted} />
			{vertical ? null : (
				<Text role="small" weight={700} color={on ? mod.ink : colors.muted}>
					{label}
				</Text>
			)}
		</div>
	);
};

/** Paper of the scratchpad: dot grid, the page's header and its ink. */
export const Scratchpad: React.FC<{width: number | string; height: number | string; title?: string; page?: string; children?: React.ReactNode; style?: React.CSSProperties; header?: boolean}> = ({width, height, title, page = '1 / 1', children, style, header = true}) => {
	const colors = useColors();
	const t = useT();
	const dot = alpha(colors.ink, 0.13);
	return (
		<div style={{position: 'relative', width, height, boxSizing: 'border-box', borderRadius: UI_RADIUS.xl, background: colors.card, border: `1px solid ${colors.line}`, boxShadow: UI_SHADOW.card, overflow: 'hidden', display: 'flex', flexDirection: 'column', flexShrink: 0, ...style}}>
			{header ? (
				<Stack row justify="space-between" style={{height: 52, padding: '0 14px 0 18px', borderBottom: `1px solid ${colors.line2}`, flexShrink: 0}}>
					<Stack row gap={8}>
						<Icon name="notebook" size={18} color={colors.ink2} />
						<Text role="headline">{title ?? t('Taslak kâğıdı', 'Scratchpad')}</Text>
						<Text role="meta">{page}</Text>
					</Stack>
					<Stack row gap={4}>
						<ToolButton icon="plus" size={34} />
						<ToolButton icon="eyeOff" size={34} />
						<ToolButton icon="x" size={34} />
					</Stack>
				</Stack>
			) : null}
			<div style={{position: 'relative', flex: 1, backgroundImage: `radial-gradient(${dot} 1.3px, transparent 1.4px)`, backgroundSize: '24px 24px', backgroundPosition: '12px 12px'}}>{children}</div>
		</div>
	);
};

/** The question map strip: answered, flagged, current, empty. */
export const QuestionStrip: React.FC<{states: (0 | 1 | 2 | 3 | 4)[]; start?: number}> = ({states, start = 1}) => {
	const colors = useColors();
	const mod = useModuleColors();
	return (
		<Stack row gap={6}>
			{states.map((state, index) => {
				// 0 empty, 1 answered, 2 current, 3 flagged, 4 has notes
				const look = [
					{bg: colors.card, ink: colors.muted, line: colors.line},
					{bg: mod.soft, ink: mod.ink, line: mod.line},
					{bg: mod.action, ink: '#FFFFFF', line: mod.action},
					{bg: colors.warningSoft, ink: colors.warningInk, line: colors.warning},
					{bg: colors.card, ink: colors.ink2, line: colors.line},
				][state];
				return (
					<div key={index} style={{position: 'relative', width: 34, height: 34, borderRadius: 10, background: look.bg, border: `1.5px solid ${look.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box'}}>
						<Text role="meta" size={12} weight={800} color={look.ink} tnum>
							{start + index}
						</Text>
						{state === 4 ? <div style={{position: 'absolute', right: -3, top: -3, width: 14, height: 14, borderRadius: 7, background: colors.card, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name="pen" size={11} color={mod.ink} /></div> : null}
					</div>
				);
			})}
		</Stack>
	);
};

/** A small caption chip over a drawing ("Notların bu soruya kayıtlı"). */
export const InkNote: React.FC<{icon?: UIIconName; children: React.ReactNode}> = ({icon = 'check', children}) => {
	const colors = useColors();
	return (
		<Stack row gap={7} style={{padding: '7px 12px', borderRadius: 14, background: colors.card, border: `1px solid ${colors.line}`, boxShadow: UI_SHADOW.card, alignSelf: 'flex-start'}}>
			<Icon name={icon} size={15} color={colors.successInk} />
			<Text role="meta" color={colors.ink2}>
				{children}
			</Text>
		</Stack>
	);
};

/** The module's navigation on a tablet in landscape: a side rail instead of the floating tab bar. */
export const SideRail: React.FC<{module: ModuleKey; active?: number}> = ({module, active = 0}) => {
	const colors = useColors();
	const t = useT();
	const mod = useModuleColors(module);
	const tabs = MODULES[module].tabs;
	const items: {label: string; icon: UIIconName}[] = [
		...(tabs ? tabs.map((tab) => ({label: t(tab.label), icon: tab.icon})) : []),
		{label: t('Modüller', 'Modules'), icon: 'grid'},
		{label: t('Profil', 'Profile'), icon: 'user'},
	];
	return (
		<Stack gap={6} align="center" style={{width: 96, padding: '14px 0', flexShrink: 0, borderRight: `1px solid ${colors.line}`, background: colors.card}}>
			{items.map((item, index) => {
				const on = index === active;
				return (
					<React.Fragment key={item.label}>
						{index === (tabs ? 3 : 0) ? <div style={{flex: 1}} /> : null}
						<Stack align="center" gap={4} style={{width: 76, padding: '10px 0', borderRadius: 18, background: on ? mod.soft : 'transparent'}}>
							<Icon name={item.icon} size={23} color={on ? mod.color : colors.muted} stroke={on ? 2.2 : 1.9} />
							<Text role="meta" size={12} weight={on ? 800 : 600} color={on ? mod.ink : colors.muted} align="center">
								{item.label}
							</Text>
						</Stack>
					</React.Fragment>
				);
			})}
			<div style={{height: 12}} />
		</Stack>
	);
};

