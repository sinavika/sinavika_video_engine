import React from 'react';
import {Img, staticFile} from 'remotion';
import {BRAND} from '../../Configurations/Brand';
import {useTheme} from '../../Themes/ThemeContext';
import {useColors, useModuleColors, useUI} from '../Context';
import {Icon, type UIIconName} from '../Icons';
import {alpha, MODULES, moduleGradient, type ModuleKey} from '../ModuleIdentity';
import {UI_RADIUS, UI_SHADOW, UI_TYPE, type UITypeRole} from '../Tokens';

/**
 * Parts shared by mobile, web panel and site drawings. Screens are built from
 * these only, so a token or shape changes in one place.
 */

type TextProps = {
	role?: UITypeRole;
	size?: number;
	weight?: number;
	color?: string;
	align?: 'left' | 'center' | 'right';
	tnum?: boolean;
	style?: React.CSSProperties;
	children: React.ReactNode;
};

export const Text: React.FC<TextProps> = ({role = 'body', size, weight, color, align, tnum, style, children}) => {
	const {typography} = useTheme();
	const colors = useColors();
	const [fontSize, lineHeight, roleWeight] = UI_TYPE[role];
	const scale = size ? size / fontSize : 1;
	const defaultColor = role === 'body' ? colors.ink2 : role === 'small' || role === 'meta' || role === 'over' ? colors.muted : colors.ink;
	return (
		<div
			style={{
				fontFamily: typography.body,
				fontSize: size ?? fontSize,
				lineHeight: `${lineHeight * scale}px`,
				fontWeight: weight ?? roleWeight,
				color: color ?? defaultColor,
				textAlign: align,
				letterSpacing: role === 'over' ? '0.08em' : ['display', 'hero', 'title', 'num'].includes(role) ? '-0.02em' : '-0.005em',
				textTransform: role === 'over' ? 'uppercase' : undefined,
				fontVariantNumeric: tnum || role === 'num' ? 'tabular-nums' : undefined,
				...style,
			}}
		>
			{children}
		</div>
	);
};

type StackProps = {gap?: number; row?: boolean; align?: React.CSSProperties['alignItems']; justify?: React.CSSProperties['justifyContent']; wrap?: boolean; grow?: boolean; style?: React.CSSProperties; children?: React.ReactNode};

export const Stack: React.FC<StackProps> = ({gap = 0, row, align, justify, wrap, grow, style, children}) => (
	<div style={{display: 'flex', flexDirection: row ? 'row' : 'column', gap, alignItems: align ?? (row ? 'center' : undefined), justifyContent: justify, flexWrap: wrap ? 'wrap' : undefined, flex: grow ? 1 : undefined, minWidth: grow ? 0 : undefined, ...style}}>
		{children}
	</div>
);

export const Spacer: React.FC = () => <div style={{flex: 1}} />;

type ButtonTone = 'primary' | 'dark' | 'soft' | 'ghost' | 'white' | 'module' | 'moduleSoft' | 'disabled' | 'glass';

type ButtonProps = {tone?: ButtonTone; size?: 'sm' | 'md' | 'lg'; block?: boolean; icon?: UIIconName; iconRight?: UIIconName; module?: ModuleKey; style?: React.CSSProperties; children?: React.ReactNode};

export const Button: React.FC<ButtonProps> = ({tone = 'primary', size = 'md', block, icon, iconRight, module, style, children}) => {
	const colors = useColors();
	const mod = useModuleColors(module);
	const height = {sm: 36, md: 46, lg: 54}[size];
	const font = {sm: 13, md: 15, lg: 16}[size];
	const tones: Record<ButtonTone, React.CSSProperties> = {
		primary: {background: colors.brand, color: colors.onBrand, boxShadow: UI_SHADOW.brand},
		dark: {background: colors.ink, color: colors.bg},
		soft: {background: colors.brandSoft, color: colors.brandDeep},
		ghost: {background: colors.card, color: colors.ink, border: `1.5px solid ${colors.line}`},
		white: {background: '#FFFFFF', color: '#0B1C30'},
		module: {background: mod.color, color: '#FFFFFF'},
		moduleSoft: {background: mod.soft, color: mod.color},
		disabled: {background: colors.line, color: colors.subtle},
		glass: {background: 'rgba(255, 255, 255, 0.2)', color: '#FFFFFF'},
	};
	const {typography} = useTheme();
	return (
		<div
			style={{
				boxSizing: 'border-box',
				height,
				padding: children ? `0 ${size === 'sm' ? 14 : 20}px` : 0,
				width: children ? (block ? '100%' : undefined) : height,
				borderRadius: UI_RADIUS.full,
				display: 'inline-flex',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 8,
				fontFamily: typography.body,
				fontSize: font,
				fontWeight: 700,
				whiteSpace: 'nowrap',
				flexShrink: 0,
				...tones[tone],
				...style,
			}}
		>
			{icon ? <Icon name={icon} size={font + 3} /> : null}
			{children}
			{iconRight ? <Icon name={iconRight} size={font + 3} /> : null}
		</div>
	);
};

type ChipTone = 'neutral' | 'brand' | 'module' | 'success' | 'warning' | 'error' | 'dark' | 'outline' | 'glass' | 'moduleSolid';

export const Chip: React.FC<{tone?: ChipTone; icon?: UIIconName; module?: ModuleKey; size?: 'sm' | 'md'; style?: React.CSSProperties; children: React.ReactNode}> = ({tone = 'neutral', icon, module, size = 'md', style, children}) => {
	const colors = useColors();
	const mod = useModuleColors(module);
	const {typography} = useTheme();
	const tones: Record<ChipTone, React.CSSProperties> = {
		neutral: {background: colors.line2, color: colors.ink2},
		brand: {background: colors.brandSoft, color: colors.brandDeep},
		module: {background: mod.soft, color: mod.color},
		moduleSolid: {background: mod.color, color: '#FFFFFF'},
		success: {background: colors.successSoft, color: colors.success},
		warning: {background: colors.warningSoft, color: colors.warning},
		error: {background: colors.errorSoft, color: colors.error},
		dark: {background: colors.ink, color: colors.bg},
		outline: {background: colors.card, color: colors.ink2, border: `1.5px solid ${colors.line}`},
		glass: {background: 'rgba(255, 255, 255, 0.2)', color: '#FFFFFF'},
	};
	return (
		<div
			style={{
				boxSizing: 'border-box',
				display: 'inline-flex',
				alignItems: 'center',
				gap: 5,
				height: size === 'sm' ? 22 : 28,
				padding: `0 ${size === 'sm' ? 8 : 11}px`,
				borderRadius: UI_RADIUS.full,
				fontFamily: typography.body,
				fontSize: size === 'sm' ? 10.5 : 12,
				fontWeight: 700,
				whiteSpace: 'nowrap',
				flexShrink: 0,
				alignSelf: 'flex-start',
				...tones[tone],
				...style,
			}}
		>
			{icon ? <Icon name={icon} size={size === 'sm' ? 12 : 14} /> : null}
			{children}
		</div>
	);
};

type CardTone = 'card' | 'flat' | 'soft' | 'module' | 'moduleLine' | 'dark';

export const Card: React.FC<{tone?: CardTone; padding?: number; radius?: number; module?: ModuleKey; style?: React.CSSProperties; children?: React.ReactNode}> = ({tone = 'card', padding = 16, radius = UI_RADIUS.lg, module, style, children}) => {
	const colors = useColors();
	const mod = useModuleColors(module);
	const tones: Record<CardTone, React.CSSProperties> = {
		card: {background: colors.card, border: `1px solid ${colors.line}`, boxShadow: UI_SHADOW.card},
		flat: {background: colors.card, border: `1px solid ${colors.line}`},
		soft: {background: colors.line2},
		module: {background: mod.wash, border: `1px solid ${mod.line}`},
		moduleLine: {background: colors.card, border: `1.5px solid ${mod.line}`, boxShadow: UI_SHADOW.card},
		dark: {background: colors.ink, color: colors.bg},
	};
	return <div style={{boxSizing: 'border-box', padding, borderRadius: radius, ...tones[tone], ...style}}>{children}</div>;
};

/** A module's icon on its tinted tile. `solid` paints the module gradient. */
export const Tile: React.FC<{module?: ModuleKey; icon?: UIIconName; size?: number; solid?: boolean; color?: string; style?: React.CSSProperties}> = ({module, icon, size = 42, solid, color, style}) => {
	const colors = useColors();
	const {mode} = useUI();
	const moduleColors = useModuleColors(module);
	const mod = module ? moduleColors : null;
	const name = icon ?? (module ? MODULES[module].icon : 'info');
	const fill = solid ? (module ? moduleGradient(module, mode) : colors.brand) : (mod?.soft ?? colors.line2);
	const ink = solid ? '#FFFFFF' : (color ?? mod?.color ?? colors.ink2);
	return (
		<div style={{width: size, height: size, borderRadius: size * 0.32, background: fill, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, ...style}}>
			<Icon name={name} size={size * 0.5} color={ink} />
		</div>
	);
};

export const Ring: React.FC<{value: number; size?: number; stroke?: number; color?: string; track?: string; children?: React.ReactNode}> = ({value, size = 56, stroke = 6, color, track, children}) => {
	const colors = useColors();
	const radius = (size - stroke) / 2;
	const circumference = 2 * Math.PI * radius;
	return (
		<div style={{position: 'relative', width: size, height: size, flexShrink: 0}}>
			<svg width={size} height={size} style={{transform: 'rotate(-90deg)'}}>
				<circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={track ?? colors.line2} strokeWidth={stroke} />
				<circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color ?? colors.brand} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${(circumference * Math.min(value, 1)).toFixed(1)} ${circumference.toFixed(1)}`} />
			</svg>
			<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{children}</div>
		</div>
	);
};

export const Bar: React.FC<{value: number; color?: string; track?: string; height?: number; style?: React.CSSProperties}> = ({value, color, track, height = 8, style}) => {
	const colors = useColors();
	return (
		<div style={{height, minHeight: height, maxHeight: height, borderRadius: height, background: track ?? colors.line2, overflow: 'hidden', flex: '1 1 auto', minWidth: 20, ...style}}>
			<div style={{width: `${Math.round(Math.min(value, 1) * 100)}%`, height: '100%', borderRadius: height, background: color ?? colors.brand}} />
		</div>
	);
};

/** Five-step level bars (Testler). */
export const Levels: React.FC<{done: number; color?: string; height?: number}> = ({done, color, height = 18}) => {
	const colors = useColors();
	return (
		<Stack row gap={3}>
			{[0, 1, 2, 3, 4].map((step) => (
				<div key={step} style={{width: 8, height, borderRadius: 3, background: step < done ? (color ?? colors.brand) : colors.line}} />
			))}
		</Stack>
	);
};

export const Toggle: React.FC<{on?: boolean; module?: ModuleKey}> = ({on, module}) => {
	const colors = useColors();
	const mod = useModuleColors(module);
	return (
		<div style={{width: 46, height: 28, borderRadius: 14, background: on ? (module ? mod.color : colors.brand) : colors.line, position: 'relative', flexShrink: 0}}>
			<div style={{position: 'absolute', top: 3, left: on ? 21 : 3, width: 22, height: 22, borderRadius: 11, background: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.25)'}} />
		</div>
	);
};

export const Avatar: React.FC<{initials?: string; size?: number; module?: ModuleKey}> = ({initials = 'AY', size = 40}) => {
	const {typography} = useTheme();
	return (
		<div style={{width: size, height: size, borderRadius: size / 2, background: 'linear-gradient(135deg, #FB923C, #EA580C)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: typography.body, fontWeight: 800, fontSize: size * 0.36, flexShrink: 0}}>
			{initials}
		</div>
	);
};

/** The wordmark without the icon (public site): `kaynak/sinavika-yazi-*.svg`, 567.98 × 100. */
const WORDMARK = {src: 'Brand/SinavikaWordmark.svg', aspectRatio: 567.98 / 100};

/** The Sınavika logo in any colour: icon and wordmark, or the wordmark alone. */
export const Logo: React.FC<{height?: number; color?: string; wordmark?: boolean}> = ({height = 26, color, wordmark}) => {
	const colors = useColors();
	const logo = wordmark ? WORDMARK : BRAND.logo;
	const source = staticFile(logo.src);
	return (
		<div style={{position: 'relative', height, width: height * logo.aspectRatio, flexShrink: 0}}>
			<Img src={source} style={{position: 'absolute', width: '100%', height: '100%', opacity: 0}} />
			<div style={{position: 'absolute', inset: 0, backgroundColor: color ?? colors.brand, maskImage: `url("${source}")`, WebkitMaskImage: `url("${source}")`, maskSize: '100% 100%', WebkitMaskSize: '100% 100%'}} />
		</div>
	);
};

type FieldProps = {label?: string; value?: string; placeholder?: string; icon?: UIIconName; trailing?: React.ReactNode; focus?: boolean; error?: string; hint?: string; height?: number};

export const Field: React.FC<FieldProps> = ({label, value, placeholder, icon, trailing, focus, error, hint, height = 50}) => {
	const colors = useColors();
	const {typography} = useTheme();
	return (
		<Stack gap={7}>
			{label ? (
				<Text role="small" weight={700} color={colors.ink2}>
					{label}
				</Text>
			) : null}
			<div
				style={{
					boxSizing: 'border-box',
					height,
					borderRadius: UI_RADIUS.md,
					background: colors.card,
					border: `1.5px solid ${error ? colors.error : focus ? colors.brand : colors.line}`,
					boxShadow: focus ? `0 0 0 4px ${alpha('#EA580C', 0.1)}` : undefined,
					display: 'flex',
					alignItems: 'center',
					gap: 10,
					padding: '0 14px',
					fontFamily: typography.body,
					fontSize: 15,
					fontWeight: 500,
					color: value ? colors.ink : colors.subtle,
				}}
			>
				{icon ? <Icon name={icon} size={18} color={colors.muted} /> : null}
				<span style={{flex: 1, whiteSpace: 'nowrap', overflow: 'hidden'}}>{value ?? placeholder}</span>
				{trailing}
			</div>
			{error || hint ? (
				<Text role="meta" color={error ? colors.error : colors.muted}>
					{error ?? hint}
				</Text>
			) : null}
		</Stack>
	);
};

export const Segmented: React.FC<{items: string[]; active?: number; module?: ModuleKey; dark?: boolean}> = ({items, active = 0, module, dark}) => {
	const colors = useColors();
	const mod = useModuleColors(module);
	const {typography} = useTheme();
	return (
		<div style={{display: 'flex', padding: 4, borderRadius: UI_RADIUS.full, background: colors.line2}}>
			{items.map((item, index) => {
				const on = index === active;
				return (
					<div
						key={item}
						style={{
							flex: 1,
							height: 34,
							borderRadius: UI_RADIUS.full,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							fontFamily: typography.body,
							fontSize: 13,
							fontWeight: 700,
							whiteSpace: 'nowrap',
							padding: '0 10px',
							background: on ? (dark ? colors.ink : colors.card) : 'transparent',
							color: on ? (dark ? colors.bg : module ? mod.color : colors.ink) : colors.muted,
							boxShadow: on && !dark ? '0 1px 3px rgba(15, 23, 42, 0.12)' : undefined,
						}}
					>
						{item}
					</div>
				);
			})}
		</div>
	);
};

/** A row of a list: icon tile, title, subtitle and something on the right. */
export const ListRow: React.FC<{module?: ModuleKey; icon?: UIIconName; title: string; subtitle?: string; meta?: string; trailing?: React.ReactNode; chevron?: boolean; plainIcon?: boolean; tileSize?: number}> = ({module, icon, title, subtitle, meta, trailing, chevron = true, plainIcon, tileSize = 38}) => {
	const colors = useColors();
	return (
		<Stack row gap={12} style={{padding: '12px 14px'}}>
			{icon || module ? plainIcon ? <Tile icon={icon} size={tileSize} color={colors.ink2} /> : <Tile module={module} icon={icon} size={tileSize} /> : null}
			<Stack grow gap={2}>
				<Text role="headline">{title}</Text>
				{subtitle ? <Text role="small">{subtitle}</Text> : null}
				{meta ? <Text role="meta">{meta}</Text> : null}
			</Stack>
			{trailing}
			{chevron && !trailing ? <Icon name="right" size={18} color={colors.subtle} /> : null}
		</Stack>
	);
};

/** Rows inside one card, separated by hairlines. */
export const List: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => {
	const colors = useColors();
	const items = React.Children.toArray(children);
	return (
		<Card padding={0} style={{overflow: 'hidden', ...style}}>
			{items.map((child, index) => (
				<div key={index} style={{borderTop: index ? `1px solid ${colors.line2}` : undefined}}>
					{child}
				</div>
			))}
		</Card>
	);
};

export type OptionState = 'idle' | 'selected' | 'correct' | 'wrong';

export const OptionRow: React.FC<{letter: string; text: string; state?: OptionState; module?: ModuleKey}> = ({letter, text, state = 'idle', module}) => {
	const colors = useColors();
	const mod = useModuleColors(module);
	const look = {
		idle: {line: colors.line, fill: colors.card, badge: colors.line2, ink: colors.ink2},
		selected: {line: mod.color, fill: mod.wash, badge: mod.color, ink: '#FFFFFF'},
		correct: {line: colors.success, fill: colors.successSoft, badge: colors.success, ink: '#FFFFFF'},
		wrong: {line: colors.error, fill: colors.errorSoft, badge: colors.error, ink: '#FFFFFF'},
	}[state];
	return (
		<Stack row gap={12} style={{padding: '11px 14px', borderRadius: UI_RADIUS.md, border: `1.5px solid ${look.line}`, background: look.fill}}>
			<div style={{width: 30, height: 30, borderRadius: 10, background: look.badge, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
				{state === 'correct' ? <Icon name="check" size={16} color="#FFFFFF" /> : state === 'wrong' ? <Icon name="x" size={16} color="#FFFFFF" /> : <Text role="headline" size={14} color={look.ink}>{letter}</Text>}
			</div>
			<Text role="body" color={colors.ink} weight={600}>
				{text}
			</Text>
		</Stack>
	);
};

/** A small line chart: points 0..1, drawn left to right. */
export const Sparkline: React.FC<{points: number[]; color?: string; width?: number; height?: number; fill?: boolean; dot?: boolean}> = ({points, color, width = 160, height = 60, fill = true, dot = true}) => {
	const colors = useColors();
	const stroke = color ?? colors.brand;
	const coords = points.map((value, index) => [(index / (points.length - 1)) * (width - 8) + 4, height - 6 - value * (height - 12)] as const);
	const line = coords.map(([x, y], index) => `${index ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
	const last = coords[coords.length - 1];
	return (
		<svg width={width} height={height} style={{display: 'block', flexShrink: 0}}>
			{fill ? <path d={`${line} L${last[0]} ${height} L${coords[0][0]} ${height} Z`} fill={alpha(stroke.startsWith('#') ? stroke : '#EA580C', 0.12)} /> : null}
			<path d={line} fill="none" stroke={stroke} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
			{dot ? <circle cx={last[0]} cy={last[1]} r={4.5} fill="#FFFFFF" stroke={stroke} strokeWidth={2.6} /> : null}
		</svg>
	);
};

/** Vertical bars (weekly hours). Values 0..1. */
export const Bars: React.FC<{values: number[]; labels?: string[]; color?: string; highlight?: number; height?: number; barWidth?: number}> = ({values, labels, color, highlight, height = 96, barWidth = 22}) => {
	const colors = useColors();
	const mod = useModuleColors();
	const strong = color ?? mod.color;
	return (
		<Stack row justify="space-between" align="flex-end" style={{height: height + (labels ? 22 : 0)}}>
			{values.map((value, index) => (
				<Stack key={index} align="center" gap={6}>
					<div style={{width: barWidth, height: Math.max(4, value * height), borderRadius: 7, background: index === highlight ? strong : alpha(strong.startsWith('#') ? strong : '#EA580C', 0.22)}} />
					{labels ? <Text role="meta" color={index === highlight ? strong : colors.muted}>{labels[index]}</Text> : null}
				</Stack>
			))}
		</Stack>
	);
};

export const Dots: React.FC<{count: number; active: number; colors?: string[]}> = ({count, active, colors: tints}) => {
	const colors = useColors();
	return (
		<Stack row gap={5} justify="center">
			{Array.from({length: count}, (_, index) => (
				<div key={index} style={{width: index === active ? 18 : 6, height: 6, borderRadius: 3, background: index === active ? (tints?.[index] ?? colors.brand) : colors.line}} />
			))}
		</Stack>
	);
};

export const Skeleton: React.FC<{width?: number | string; height?: number; radius?: number}> = ({width = '100%', height = 12, radius = 6}) => {
	const colors = useColors();
	return <div style={{width, height, borderRadius: radius, background: colors.line2}} />;
};

/** A step progress line of n segments. */
export const Steps: React.FC<{count: number; done: number; color?: string}> = ({count, done, color}) => {
	const colors = useColors();
	return (
		<Stack row gap={5} grow>
			{Array.from({length: count}, (_, index) => (
				<div key={index} style={{flex: 1, height: 5, borderRadius: 3, background: index < done ? (color ?? colors.brand) : colors.line}} />
			))}
		</Stack>
	);
};

/** Big decorative icon in the corner of a gradient card, at low opacity. */
export const Watermark: React.FC<{icon: UIIconName; size?: number; right?: number; bottom?: number; opacity?: number}> = ({icon, size = 120, right = -14, bottom = -18, opacity = 0.18}) => (
	<div style={{position: 'absolute', right, bottom, opacity, transform: 'rotate(-12deg)'}}>
		<Icon name={icon} size={size} color="#FFFFFF" stroke={1.4} />
	</div>
);

/** Glow circles behind gradient cards: the translucent layers of the module colour. */
export const Glow: React.FC<{size?: number; top?: number; right?: number; opacity?: number}> = ({size = 220, top = -90, right = -70, opacity = 0.14}) => (
	<div style={{position: 'absolute', top, right, width: size, height: size, borderRadius: size / 2, background: `rgba(255, 255, 255, ${opacity})`}} />
);
