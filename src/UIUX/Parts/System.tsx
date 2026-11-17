import React from 'react';
import {staticFile} from 'remotion';
import {useT, useUI} from '../Context';
import {Icon, type UIIconName} from '../Icons';
import {MODULES, moduleColor, moduleInk, type ModuleKey} from '../ModuleIdentity';
import {Stack, Text} from './Shared';

/**
 * System surfaces around the app (15 Nov 2026): the iPhone lock screen,
 * Live Activities and the Dynamic Island, notifications (iOS and Android 16
 * Live Updates) and widgets. These are the operating system's own surfaces:
 * the app fills them, it does not restyle them. Text stays at 12 pt or more;
 * materials follow the phone's light or dark mode.
 */

const W = 390;
const H = 844;

/** The material behind notifications and Live Activities on the lock screen. */
export const useMaterial = () => {
	const {mode} = useUI();
	return mode === 'dark' ? {bg: 'rgba(28, 28, 32, 0.78)', ink: '#FFFFFF', muted: 'rgba(235, 235, 245, 0.62)', line: 'rgba(255,255,255,0.12)', button: 'rgba(255,255,255,0.14)'} : {bg: 'rgba(250, 250, 252, 0.8)', ink: '#0B1C30', muted: 'rgba(11, 28, 48, 0.58)', line: 'rgba(11,28,48,0.08)', button: 'rgba(11,28,48,0.08)'};
};

/** Module colour in the phone's mode. */
export const useModule = (key: ModuleKey) => {
	const {mode} = useUI();
	return moduleColor(key, mode);
};

/** A module colour for text on the system surfaces. */
export const useModuleText = (key: ModuleKey) => {
	const {mode} = useUI();
	return moduleInk(key, mode);
};

/** The app icon: white clock mark on brand orange (the store icon). */
export const AppIcon: React.FC<{size?: number}> = ({size = 38}) => {
	const source = staticFile('Brand/SinavikaIcon.svg');
	const mark = size * 0.62;
	return (
		<div style={{width: size, height: size, borderRadius: size * 0.235, background: '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
			<div style={{width: mark, height: mark, backgroundColor: '#FFFFFF', maskImage: `url("${source}")`, WebkitMaskImage: `url("${source}")`, maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskPosition: 'center'}} />
		</div>
	);
};

/** A ring that fills to `value` (0–1), for timers and daily minutes. */
export const SysRing: React.FC<{value: number; size: number; stroke: number; color: string; track?: string; children?: React.ReactNode}> = ({value, size, stroke, color, track = 'rgba(127,127,140,0.28)', children}) => {
	const radius = (size - stroke) / 2;
	const length = 2 * Math.PI * radius;
	return (
		<div style={{position: 'relative', width: size, height: size, flexShrink: 0}}>
			<svg width={size} height={size} style={{position: 'absolute', inset: 0, transform: 'rotate(-90deg)'}}>
				<circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={track} strokeWidth={stroke} />
				<circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${length * value} ${length}`} />
			</svg>
			<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{children}</div>
		</div>
	);
};

const IosStatus: React.FC<{ink: string}> = ({ink}) => (
	<Stack row justify="space-between" style={{height: 50, padding: '14px 30px 0 34px', boxSizing: 'border-box'}}>
		<Text role="headline" size={15.5} weight={700} color={ink}>
			9:41
		</Text>
		<Stack row gap={6}>
			<Icon name="signal" size={17} color={ink} stroke={2.4} />
			<Icon name="wifi" size={17} color={ink} />
			<Icon name="battery" size={20} color={ink} />
		</Stack>
	</Stack>
);

/** iPhone wallpaper: warm in light mode, deep navy in dark mode. */
const useWallpaper = () => {
	const {mode} = useUI();
	return mode === 'dark' ? 'radial-gradient(120% 70% at 20% 10%, #24324F 0%, #0B1220 55%, #05070D 100%)' : 'radial-gradient(120% 70% at 20% 10%, #FFE8D2 0%, #F6C9A8 38%, #9DB4D8 100%)';
};

/**
 * The iPhone lock screen. `island` replaces the plain Dynamic Island pill
 * (a Live Activity in compact form shows there only when the phone is
 * unlocked; on the lock screen the activity is the card). `clock` hides for
 * home screens; `overlay` is laid over the whole screen.
 */
export const LockScreen: React.FC<{children?: React.ReactNode; island?: React.ReactNode; clock?: boolean; widgets?: React.ReactNode; overlay?: React.ReactNode}> = ({children, island, clock = true, widgets, overlay}) => {
	const t = useT();
	const {mode} = useUI();
	const ink = mode === 'dark' ? '#FFFFFF' : '#0B1C30';
	return (
		<div style={{position: 'relative', width: W, height: H, overflow: 'hidden', background: useWallpaper()}}>
			<IosStatus ink={ink} />
			<div style={{position: 'absolute', top: 11, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>{island ?? <div style={{width: 126, height: 37, borderRadius: 20, background: '#000'}} />}</div>
			{clock ? (
				<Stack align="center" gap={0} style={{marginTop: 18}}>
					<Text role="headline" size={18} weight={700} color={ink}>
						{t('Cumartesi 15 Kasım', 'Saturday, 15 November')}
					</Text>
					<div style={{fontSize: 92, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.03em', color: ink}}>9:41</div>
				</Stack>
			) : null}
			{widgets}
			{overlay}
			{children ? (
				<Stack gap={8} style={{position: 'absolute', left: 10, right: 10, bottom: 92}}>
					{children}
				</Stack>
			) : null}
			<div style={{position: 'absolute', bottom: 8, left: '50%', width: 134, height: 5, marginLeft: -67, borderRadius: 3, background: ink, opacity: 0.85}} />
		</div>
	);
};

/** A notification on the lock screen or in Notification Centre. */
export const Notice: React.FC<{time: string; title: string; body: string; thumb?: React.ReactNode; actions?: string[]; stacked?: number}> = ({time, title, body, thumb, actions, stacked}) => {
	const m = useMaterial();
	return (
		<div style={{position: 'relative'}}>
			{stacked ? (
				<>
					<div style={{position: 'absolute', left: 16, right: 16, bottom: -12, height: 30, borderRadius: 20, background: m.bg, opacity: 0.55}} />
					{stacked > 1 ? <div style={{position: 'absolute', left: 30, right: 30, bottom: -22, height: 30, borderRadius: 18, background: m.bg, opacity: 0.35}} /> : null}
				</>
			) : null}
			<div style={{position: 'relative', borderRadius: 22, background: m.bg, backdropFilter: 'blur(24px)', padding: '12px 14px', display: 'flex', gap: 11}}>
				<AppIcon size={38} />
				<Stack grow gap={1}>
					<Stack row justify="space-between">
						<Text role="headline" size={15} color={m.ink}>
							{title}
						</Text>
						<Text role="meta" size={12} color={m.muted}>
							{time}
						</Text>
					</Stack>
					<Text role="small" size={14.5} color={m.ink} style={{lineHeight: '19px'}}>
						{body}
					</Text>
					{actions ? (
						<Stack row gap={8} style={{marginTop: 8}}>
							{actions.map((action) => (
								<div key={action} style={{flex: 1, height: 34, borderRadius: 12, background: m.button, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
									<Text role="headline" size={14} color={m.ink}>
										{action}
									</Text>
								</div>
							))}
						</Stack>
					) : null}
				</Stack>
				{thumb ? <div style={{flexShrink: 0, alignSelf: 'center'}}>{thumb}</div> : null}
			</div>
		</div>
	);
};

/** A Live Activity on the lock screen: the app's own layout inside the system material (≤ 160 pt tall). */
export const LiveActivity: React.FC<{children: React.ReactNode; tint?: string}> = ({children, tint}) => {
	const m = useMaterial();
	return <div style={{borderRadius: 24, background: tint ?? m.bg, backdropFilter: 'blur(24px)', padding: 14, boxSizing: 'border-box', maxHeight: 160, overflow: 'hidden'}}>{children}</div>;
};

/** The Dynamic Island in compact form: leading and trailing either side of the camera. */
export const IslandCompact: React.FC<{leading: React.ReactNode; trailing: React.ReactNode}> = ({leading, trailing}) => (
	<div style={{height: 37, minWidth: 200, borderRadius: 20, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', boxSizing: 'border-box'}}>
		<div style={{display: 'flex', alignItems: 'center'}}>{leading}</div>
		<div style={{width: 64}} />
		<div style={{display: 'flex', alignItems: 'center'}}>{trailing}</div>
	</div>
);

/** Two activities at once: the island shrinks to a pill and a circle (minimal). */
export const IslandMinimal: React.FC<{main: React.ReactNode; second: React.ReactNode}> = ({main, second}) => (
	<Stack row gap={8}>
		<div style={{height: 37, width: 180, borderRadius: 20, background: '#000', display: 'flex', alignItems: 'center', padding: '0 12px', boxSizing: 'border-box'}}>{main}</div>
		<div style={{width: 37, height: 37, borderRadius: 19, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{second}</div>
	</Stack>
);

/** The Dynamic Island expanded (long press): up to 370 × 160 pt. */
export const IslandExpanded: React.FC<{children: React.ReactNode}> = ({children}) => <div style={{width: 370, borderRadius: 44, background: '#000', padding: '16px 20px 18px', boxSizing: 'border-box'}}>{children}</div>;

/** A labelled specimen on a spec sheet (the Dynamic Island page). */
export const Specimen: React.FC<{label: string; note: string; children: React.ReactNode}> = ({label, note, children}) => {
	const {mode} = useUI();
	const ink = mode === 'dark' ? '#FFFFFF' : '#0B1C30';
	return (
		<Stack gap={8} align="center">
			{children}
			<Stack gap={1} align="center">
				<Text role="headline" size={14} color={ink}>
					{label}
				</Text>
				<Text role="meta" size={12} color={ink} align="center" style={{opacity: 0.7, maxWidth: 330}}>
					{note}
				</Text>
			</Stack>
		</Stack>
	);
};

/* ------------------------------------------------------------------ Android 16 */

/** Android notification shade surfaces (Material 3): light and dark. */
export const useShade = () => {
	const {mode} = useUI();
	return mode === 'dark' ? {bg: '#111318', card: '#1E2128', ink: '#E3E3E8', muted: '#A9ABB3', chip: '#2B2F38', track: '#3A3E48'} : {bg: '#ECEFF4', card: '#FFFFFF', ink: '#1B1C20', muted: '#5D6068', chip: '#EEF0F5', track: '#E2E5EC'};
};

/** The Android notification shade with the status bar: a Live Update chip sits by the clock. */
export const AndroidShade: React.FC<{chip?: React.ReactNode; children: React.ReactNode}> = ({chip, children}) => {
	const s = useShade();
	const t = useT();
	return (
		<div style={{position: 'relative', width: W, height: H, overflow: 'hidden', background: s.bg}}>
			<Stack row justify="space-between" style={{height: 44, padding: '12px 22px 0', boxSizing: 'border-box'}}>
				<Stack row gap={8}>
					<Text role="headline" size={15} color={s.ink}>
						9:41
					</Text>
					{chip}
				</Stack>
				<div style={{width: 14, height: 14, borderRadius: 7, background: '#000', position: 'absolute', left: '50%', marginLeft: -7, top: 14}} />
				<Stack row gap={6}>
					<Icon name="wifi" size={16} color={s.ink} />
					<Icon name="signal" size={16} color={s.ink} stroke={2.4} />
					<Icon name="battery" size={19} color={s.ink} />
				</Stack>
			</Stack>
			<Stack row justify="space-between" style={{padding: '10px 22px 14px'}}>
				<Text role="title" size={22} color={s.ink}>
					{t('Cmt, 15 Kas', 'Sat, 15 Nov')}
				</Text>
				<Stack row gap={10}>
					{(['settings', 'moon'] as UIIconName[]).map((icon) => (
						<div key={icon} style={{width: 40, height: 40, borderRadius: 20, background: s.chip, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							<Icon name={icon} size={19} color={s.ink} />
						</div>
					))}
				</Stack>
			</Stack>
			<Stack gap={4} style={{padding: '0 12px'}}>
				{children}
			</Stack>
		</div>
	);
};

/** One Android notification card; `first`/`last` round the group's outer corners (Material 3 grouping). */
export const AndroidCard: React.FC<{icon?: UIIconName; color: string; app: string; time: string; title: string; body: string; children?: React.ReactNode; actions?: string[]; first?: boolean; last?: boolean}> = ({icon = 'bell', color, app, time, title, body, children, actions, first, last}) => {
	const s = useShade();
	const big = 24;
	const small = 6;
	return (
		<div style={{background: s.card, borderRadius: `${first ? big : small}px ${first ? big : small}px ${last ? big : small}px ${last ? big : small}px`, padding: '14px 16px'}}>
			<Stack row gap={12} align="flex-start">
				<div style={{width: 36, height: 36, borderRadius: 18, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
					<Icon name={icon} size={19} color="#FFFFFF" stroke={2.1} />
				</div>
				<Stack grow gap={2}>
					<Text role="meta" size={12} color={s.muted}>
						{app} · {time}
					</Text>
					<Text role="headline" size={15} color={s.ink}>
						{title}
					</Text>
					<Text role="small" size={14} color={s.muted}>
						{body}
					</Text>
				</Stack>
			</Stack>
			{children ? <div style={{marginTop: 12, marginLeft: 48}}>{children}</div> : null}
			{actions ? (
				<Stack row gap={8} style={{marginTop: 12, marginLeft: 48}}>
					{actions.map((action) => (
						<div key={action} style={{height: 34, padding: '0 16px', borderRadius: 17, background: s.chip, display: 'flex', alignItems: 'center'}}>
							<Text role="headline" size={14} color={s.ink}>
								{action}
							</Text>
						</div>
					))}
				</Stack>
			) : null}
		</div>
	);
};

/** Android 16 progress-centric Live Update: segments for the parts, a point for the current one. */
export const ProgressSegments: React.FC<{segments: number; done: number; within: number; color: string}> = ({segments, done, within, color}) => {
	const s = useShade();
	return (
		<Stack row gap={4} style={{position: 'relative', height: 14}}>
			{Array.from({length: segments}, (_, index) => (
				<div key={index} style={{flex: 1, height: 6, borderRadius: 3, background: s.track, overflow: 'hidden'}}>
					<div style={{width: `${index < done ? 100 : index === done ? within * 100 : 0}%`, height: '100%', background: color}} />
				</div>
			))}
		</Stack>
	);
};

/** Module icon tile in the module colour (thumbnails in notifications and widgets). */
export const ModuleThumb: React.FC<{module: ModuleKey; size?: number; children?: React.ReactNode}> = ({module, size = 52, children}) => {
	const color = useModule(module);
	return <div style={{width: size, height: size, borderRadius: size * 0.26, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>{children ?? <Icon name={MODULES[module].icon} size={size * 0.48} color="#FFFFFF" stroke={2.1} />}</div>;
};
