import React from 'react';
import {AbsoluteFill} from 'remotion';
import {themeVars, useColors} from '../UIUX/Context';
import {Icon, type UIIconName} from '../UIUX/Icons';
import {MODULES, type ModuleKey} from '../UIUX/ModuleIdentity';
import {Logo, Text} from '../UIUX/Parts/Shared';
import {findScreen} from '../UIUX/Registry';
import {screenSize} from '../UIUX/UIUXProps';
import {PITCH_DECK_PAGE_COUNT} from './PitchDeckDeck';

/**
 * Building blocks of the investor deck. Colours, type and module identity come
 * from the UI/UX system (src/UIUX), so the deck looks like the product: brand
 * orange for emphasis, module colours only for way-finding, Manrope throughout.
 */
export const DECK = {width: 1920, height: 1080, pad: 104, radius: 32, total: PITCH_DECK_PAGE_COUNT} as const;

export const trNumber = (value: number, digits = 0): string => value.toLocaleString('tr-TR', {minimumFractionDigits: digits, maximumFractionDigits: digits});

/** Thousands of dollars with one decimal, signed: 68506 → "+68,5 bin $". Every money cell of a table uses this one form. */
export const kUsd = (value: number): string => `${value >= 0 ? '+' : '−'}${trNumber(Math.abs(value) / 1000, 1)} bin $`;

/** 68506 → "68,5 bin $"; 1164286 → "1,16 milyon". */
export const compact = (value: number, unit = ''): string => {
	const abs = Math.abs(value);
	const sign = value < 0 ? '−' : '';
	const tail = unit ? ` ${unit}` : '';
	if (abs >= 1_000_000) return `${sign}${trNumber(abs / 1_000_000, 2)} milyon${tail}`;
	if (abs >= 10_000) return `${sign}${trNumber(abs / 1000, 1)} bin${tail}`;
	return `${sign}${trNumber(abs)}${tail}`;
};

export const usd = (value: number): string => `${value < 0 ? '−' : ''}${trNumber(Math.abs(Math.round(value)))} $`;

type SlideProps = {
	index: number;
	eyebrow?: string;
	title?: React.ReactNode;
	lead?: React.ReactNode;
	footnote?: React.ReactNode;
	background?: string;
	dark?: boolean;
	children?: React.ReactNode;
};

/** One 1920×1080 page: eyebrow, title, lead, content, then footnote, logo and page number on the bottom line. */
export const Slide: React.FC<SlideProps> = ({index, eyebrow, title, lead, footnote, background, dark, children}) => {
	const colors = useColors();
	const ink = dark ? '#FFFFFF' : colors.ink;
	return (
		<AbsoluteFill style={{...themeVars('light'), background: background ?? colors.bg, padding: `${DECK.pad - 24}px ${DECK.pad}px ${DECK.pad - 40}px`, display: 'flex', flexDirection: 'column'}}>
			{eyebrow ? (
				<Text role="over" size={20} weight={800} color={dark ? '#FFFFFF' : colors.brand} style={{letterSpacing: '0.14em'}}>
					{eyebrow}
				</Text>
			) : null}
			{title ? (
				<Text role="display" size={64} color={ink} style={{lineHeight: '74px', marginTop: eyebrow ? 18 : 0, maxWidth: 1500}}>
					{title}
				</Text>
			) : null}
			{lead ? (
				<Text role="body" size={27} color={dark ? 'rgba(255,255,255,0.86)' : colors.ink2} style={{lineHeight: '40px', marginTop: 22, maxWidth: 1420}}>
					{lead}
				</Text>
			) : null}
			<div style={{flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', marginTop: title || lead ? 48 : 0}}>{children}</div>
			<div style={{display: 'flex', alignItems: 'flex-end', gap: 40, marginTop: 28}}>
				<Logo height={30} wordmark color={dark ? '#FFFFFF' : colors.brand} />
				<div style={{flex: 1}}>
					{footnote ? (
						<Text role="meta" size={16} color={dark ? 'rgba(255,255,255,0.7)' : colors.muted} style={{lineHeight: '22px'}}>
							{footnote}
						</Text>
					) : null}
				</div>
				<Text role="headline" size={20} color={dark ? '#FFFFFF' : colors.brand} tnum>
					{String(index).padStart(2, '0')} / {DECK.total}
				</Text>
			</div>
		</AbsoluteFill>
	);
};

export const Panel: React.FC<{children: React.ReactNode; tone?: 'card' | 'brand' | 'soft' | 'ink'; padding?: number; style?: React.CSSProperties}> = ({children, tone = 'card', padding = 40, style}) => {
	const colors = useColors();
	const look = {card: {background: colors.card, border: `1px solid ${colors.line}`}, brand: {background: `linear-gradient(135deg, ${colors.brand} 0%, #F97316 100%)`, border: 'none'}, soft: {background: colors.brandWash, border: `1px solid ${colors.brandSoft}`}, ink: {background: colors.ink, border: 'none'}}[tone];
	return <div style={{...look, borderRadius: DECK.radius, padding, boxShadow: tone === 'card' ? '0 24px 60px -40px rgba(15, 23, 42, 0.35)' : undefined, ...style}}>{children}</div>;
};

/** Big number with its meaning and its limit. */
export const Stat: React.FC<{value: string; label: string; note?: string; tone?: 'card' | 'brand' | 'soft'; size?: number; padding?: number}> = ({value, label, note, tone = 'card', size = 72, padding = 40}) => {
	const colors = useColors();
	const onBrand = tone === 'brand';
	return (
		<Panel tone={tone} padding={padding} style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 12}}>
			<Text role="num" size={size} weight={800} color={onBrand ? '#FFFFFF' : colors.ink} style={{lineHeight: `${size + 6}px`, whiteSpace: 'nowrap'}}>
				{value}
			</Text>
			<Text role="headline" size={25} color={onBrand ? '#FFFFFF' : colors.ink} style={{lineHeight: '32px'}}>
				{label}
			</Text>
			{note ? (
				<Text role="small" size={19} color={onBrand ? 'rgba(255,255,255,0.85)' : colors.muted} style={{lineHeight: '27px'}}>
					{note}
				</Text>
			) : null}
		</Panel>
	);
};

/** Numbered point: orange number tile, title, sentence. */
export const Point: React.FC<{n?: number; icon?: UIIconName; module?: ModuleKey; title: string; text?: string; size?: 'md' | 'lg'}> = ({n, icon, module, title, text, size = 'md'}) => {
	const colors = useColors();
	const color = module ? MODULES[module].color.light : colors.brand;
	const tile = size === 'lg' ? 76 : 64;
	return (
		<div style={{display: 'flex', gap: 26, alignItems: 'flex-start'}}>
			<div style={{width: tile, height: tile, borderRadius: 20, background: module ? `${color}1F` : colors.brand, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
				{icon ? (
					<Icon name={icon} size={tile * 0.5} color={module ? color : '#FFFFFF'} />
				) : (
					<Text role="num" size={28} weight={800} color="#FFFFFF">
						{String(n ?? 0).padStart(2, '0')}
					</Text>
				)}
			</div>
			<div style={{display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4}}>
				<Text role="title" size={size === 'lg' ? 34 : 29} color={colors.ink} style={{lineHeight: size === 'lg' ? '42px' : '36px'}}>
					{title}
				</Text>
				{text ? (
					<Text role="body" size={22} color={colors.ink2} style={{lineHeight: '32px'}}>
						{text}
					</Text>
				) : null}
			</div>
		</div>
	);
};

/** A real product screen from the UI/UX drawings, scaled into a phone or browser frame. */
export const Screen: React.FC<{id: string; width: number; style?: React.CSSProperties; crop?: number}> = ({id, width, style, crop}) => {
	const screen = findScreen(id);
	const size = screenSize(screen.platform, screen.height);
	const scale = width / size.width;
	const height = (crop ?? size.height) * scale;
	const mobile = screen.platform === 'mobile';
	const {Component} = screen;
	return (
		<div style={{width, height, borderRadius: mobile ? 44 * (width / 390) : 18, overflow: 'hidden', position: 'relative', flexShrink: 0, background: '#FFFFFF', boxShadow: '0 40px 80px -36px rgba(15, 23, 42, 0.5), 0 0 0 1px rgba(15, 23, 42, 0.06)', ...style}}>
			<div style={{...themeVars('light'), width: size.width, height: size.height, transform: `scale(${scale})`, transformOrigin: 'top left'}}>
				<Component />
			</div>
		</div>
	);
};

/** Vertical bars on one zero-based axis. */
export const BarPair: React.FC<{items: {label: string; value: number; display: string; strong?: boolean}[]; height: number; barWidth?: number}> = ({items, height, barWidth = 150}) => {
	const colors = useColors();
	const max = Math.max(...items.map((item) => item.value));
	return (
		<div style={{display: 'flex', alignItems: 'flex-end', gap: 70, height}}>
			{items.map((item) => (
				<div key={item.label} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
					<Text role="num" size={38} weight={800} color={item.strong ? colors.brand : colors.ink2}>
						{item.display}
					</Text>
					<div style={{width: barWidth, height: ((height - 150) * item.value) / max, borderRadius: '18px 18px 0 0', background: item.strong ? colors.brand : colors.brandSoft}} />
					<div style={{width: barWidth + 40, borderTop: `2px solid ${colors.line}`, paddingTop: 12, textAlign: 'center'}}>
						<Text role="headline" size={21} color={colors.ink2}>
							{item.label}
						</Text>
					</div>
				</div>
			))}
		</div>
	);
};

type Series = {label: string; values: number[]; color: string; dashed?: boolean; area?: boolean};

/** Monthly line chart with a zero-based axis. */
export const LineChart: React.FC<{series: Series[]; width: number; height: number; xLabels: string[]; yStep: number; yFormat: (value: number) => string}> = ({series, width, height, xLabels, yStep, yFormat}) => {
	const colors = useColors();
	const left = 96;
	const bottom = 44;
	const plotW = width - left - 16;
	const plotH = height - bottom - 12;
	const max = Math.ceil(Math.max(...series.flatMap((line) => line.values)) / yStep) * yStep;
	const x = (index: number) => left + (plotW * index) / (xLabels.length - 1);
	const y = (value: number) => 12 + plotH - (plotH * value) / max;
	const ticks = Array.from({length: Math.round(max / yStep) + 1}, (_, index) => index * yStep);
	return (
		<svg width={width} height={height} style={{fontFamily: 'inherit', overflow: 'visible'}}>
			{ticks.map((tick) => (
				<g key={tick}>
					<line x1={left} x2={width - 16} y1={y(tick)} y2={y(tick)} stroke={colors.line} strokeWidth={1.5} />
					<text x={left - 14} y={y(tick) + 6} textAnchor="end" fontSize={17} fill={colors.muted} fontWeight={600}>
						{yFormat(tick)}
					</text>
				</g>
			))}
			{xLabels.map((label, index) => (
				<text key={label} x={x(index)} y={height - 8} textAnchor="middle" fontSize={17} fill={colors.muted} fontWeight={600}>
					{label}
				</text>
			))}
			{series.map((line) => {
				const path = line.values.map((value, index) => `${index === 0 ? 'M' : 'L'}${x(index)},${y(value)}`).join(' ');
				return (
					<g key={line.label}>
						{line.area ? <path d={`${path} L${x(line.values.length - 1)},${y(0)} L${x(0)},${y(0)} Z`} fill={line.color} opacity={0.08} /> : null}
						<path d={path} fill="none" stroke={line.color} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={line.dashed ? '12 10' : undefined} />
					</g>
				);
			})}
		</svg>
	);
};

export const Legend: React.FC<{items: {label: string; color: string; dashed?: boolean}[]}> = ({items}) => (
	<div style={{display: 'flex', gap: 34}}>
		{items.map((item) => (
			<div key={item.label} style={{display: 'flex', alignItems: 'center', gap: 12}}>
				<div style={{width: 34, height: 0, borderTop: `5px ${item.dashed ? 'dashed' : 'solid'} ${item.color}`}} />
				<Text role="small" size={19} weight={600}>
					{item.label}
				</Text>
			</div>
		))}
	</div>
);

/** Label-value row of a small table or waterfall. */
export const Row: React.FC<{label: string; value: string; strong?: boolean; tone?: 'negative' | 'positive'; border?: boolean}> = ({label, value, strong, tone, border}) => {
	const colors = useColors();
	const color = tone === 'positive' ? colors.success : strong ? colors.ink : colors.ink2;
	return (
		<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '13px 0', borderTop: border ? `2px solid ${colors.line}` : undefined}}>
			<Text role={strong ? 'headline' : 'body'} size={strong ? 24 : 22} color={strong ? colors.ink : colors.ink2}>
				{label}
			</Text>
			<Text role="num" size={strong ? 30 : 23} weight={strong ? 800 : 600} color={color} tnum>
				{value}
			</Text>
		</div>
	);
};
