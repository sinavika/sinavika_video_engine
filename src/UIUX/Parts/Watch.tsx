import React from 'react';
import {Icon, type UIIconName} from '../Icons';
import {moduleColor, type ModuleKey} from '../ModuleIdentity';
import {UI_CANVAS} from '../Tokens';
import {Stack, Text} from './Shared';

/**
 * Watch surfaces (15 Nov 2026): Apple Watch (208 × 248 pt, 46 mm) and round
 * Wear OS faces (227 × 227 dp). Watches are dark in both themes; module
 * colours use their dark-theme value. Everything reads in about two seconds:
 * one number, one line, one action. Text never under 12 pt.
 */

export const WATCH_INK = '#FFFFFF';
export const WATCH_MUTED = 'rgba(235, 235, 245, 0.62)';
export const WATCH_CARD = '#1C1C1E';

/** Module colour on the watch (the dark-theme value reads on black). */
export const watchColor = (key: ModuleKey): string => moduleColor(key, 'dark');

/** Apple Watch screen: title top left in the accent, time top right (watchOS). */
export const AppleWatch: React.FC<{title?: string; accent?: string; children: React.ReactNode}> = ({title, accent = '#FB923C', children}) => (
	<div style={{width: UI_CANVAS.watch.width, height: UI_CANVAS.watch.height, background: '#000', position: 'relative', overflow: 'hidden', boxSizing: 'border-box', padding: '10px 12px 0'}}>
		<Stack row justify="space-between" style={{height: 22, padding: '0 4px'}}>
			<Text role="headline" size={15} color={accent}>
				{title ?? ''}
			</Text>
			<Text role="headline" size={15} color={WATCH_INK} tnum>
				9:41
			</Text>
		</Stack>
		<div style={{marginTop: 6}}>{children}</div>
	</div>
);

/** Round Wear OS screen; content stays inside the inscribed square, rings run along the edge; `button` is a Material 3 edge button hugging the bottom curve. */
export const WearRound: React.FC<{children: React.ReactNode; edge?: React.ReactNode; button?: React.ReactNode}> = ({children, edge, button}) => {
	const size = UI_CANVAS.watchRound.width;
	return (
		<div style={{width: size, height: size, background: '#000', borderRadius: '50%', position: 'relative', overflow: 'hidden'}}>
			{edge}
			<Stack row justify="center" style={{position: 'absolute', top: 12, left: 0, right: 0}}>
				<Text role="meta" size={12} color={WATCH_INK} tnum>
					9:41
				</Text>
			</Stack>
			<div style={{position: 'absolute', inset: 30, bottom: button ? 64 : 30, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>{children}</div>
			{button ? <div style={{position: 'absolute', left: 0, right: 0, bottom: 14, display: 'flex', justifyContent: 'center'}}>{button}</div> : null}
		</div>
	);
};

/** A progress arc along a round screen's edge (Wear OS). `gap` (degrees) leaves the bottom open for an edge button. */
export const EdgeArc: React.FC<{value: number; color: string; size?: number; stroke?: number; gap?: number}> = ({value, color, size = UI_CANVAS.watchRound.width, stroke = 7, gap = 0}) => {
	const radius = size / 2 - stroke / 2 - 3;
	const length = 2 * Math.PI * radius;
	const track = length * (1 - gap / 360);
	// Without a gap the arc starts at 12 o'clock; with one it starts just after the bottom gap (clockwise).
	const start = gap ? 90 + gap / 2 : -90;
	return (
		<svg width={size} height={size} style={{position: 'absolute', inset: 0, transform: `rotate(${start}deg)`}}>
			<circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${track} ${length}`} />
			<circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${track * value} ${length}`} />
		</svg>
	);
};

/** A watch button: full-width pill (Apple) or round (Wear OS). */
export const WatchButton: React.FC<{label?: string; icon?: UIIconName; color: string; tone?: 'solid' | 'soft'; round?: number}> = ({label, icon, color, tone = 'solid', round}) => {
	const bg = tone === 'solid' ? color : `${color}33`;
	const ink = tone === 'solid' ? '#000' : color;
	if (round) {
		return <div style={{width: round, height: round, borderRadius: round / 2, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{icon ? <Icon name={icon} size={round * 0.46} color={ink} stroke={2.6} /> : null}</div>;
	}
	return (
		<div style={{height: 40, borderRadius: 20, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6}}>
			{icon ? <Icon name={icon} size={17} color={ink} stroke={2.6} /> : null}
			{label ? (
				<Text role="headline" size={15} color={ink}>
					{label}
				</Text>
			) : null}
		</div>
	);
};

/** A dark card (watchOS list row or Smart Stack widget). */
export const WatchCard: React.FC<{children: React.ReactNode; padding?: string}> = ({children, padding = '9px 11px'}) => <div style={{background: WATCH_CARD, borderRadius: 18, padding}}>{children}</div>;

/** Material 3 (Wear OS) edge button: the screen's main action, wide and hugging the bottom of the round screen. */
export const EdgeButton: React.FC<{label: string; icon?: UIIconName; color: string}> = ({label, icon, color}) => (
	<div style={{width: 120, height: 46, borderRadius: '23px 23px 60px 60px / 23px 23px 34px 34px', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, paddingBottom: 6, boxSizing: 'border-box'}}>
		{icon ? <Icon name={icon} size={15} color="#000" stroke={2.8} /> : null}
		<Text role="headline" size={13} color="#000">
			{label}
		</Text>
	</div>
);
