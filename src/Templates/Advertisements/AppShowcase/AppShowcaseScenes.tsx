import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {APP_SCREEN} from '../../../Components/AppScreens/AppScreenTokens';
import {PhoneFrame} from '../../../Components/AppScreens/PhoneFrame';
import {StoreBadges} from '../../../Components/Brand/StoreBadge';
import {useVideoLayout} from '../../../Components/Layouts/VideoLayout';
import {BrandMark} from '../../../Components/Overlays/BrandMark';
import {themeVars, UIProvider} from '../../../UIUX/Context';
import {Icon} from '../../../UIUX/Icons';
import {MODULES} from '../../../UIUX/ModuleIdentity';
import {findScreen} from '../../../UIUX/Registry';
import {CLAMP, useLand, useSeconds} from '../PromoKit/PromoKit';
import type {AppShowcaseContent, ShowcaseBeat} from './AppShowcaseSchema';

/**
 * The app showcase film: a launch-style product film on the brand's orange.
 * Phones (metal rim, side buttons) swing in 3D, walk through the app's
 * screens and lift details off the screen toward the camera; big white type
 * lands word by word. A navy wall of every screen, then the end card with
 * the stores. Every screen is the current UI/UX drawing (src/UIUX, the same
 * as Desktop\Sinavika-UIUX3); captures of the old live app were dropped on
 * 14 Nov 2026.
 */

const ORANGE = '#EA580C';
const ORANGE_HI = '#FB923C';
const ORANGE_LO = '#C2410C';
const NAVY = '#0B1C30';
const WHITE = '#FFFFFF';

type Content = AppShowcaseContent;
type Lang = Content['lang'];

/** The orange ground: two slow light blobs and a dotted texture; it never stands still. */
const OrangeGround: React.FC = () => {
	const seconds = useSeconds();
	const drift = Math.sin(seconds * 0.7);
	return (
		<AbsoluteFill style={{background: `linear-gradient(125deg, ${ORANGE_HI} 0%, ${ORANGE} 45%, ${ORANGE_LO} 100%)`, overflow: 'hidden'}}>
			<div style={{position: 'absolute', width: '70%', aspectRatio: '1', left: `${-18 + drift * 3}%`, top: '-45%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 65%)'}} />
			<div style={{position: 'absolute', width: '60%', aspectRatio: '1', right: `${-14 - drift * 3}%`, bottom: '-50%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,237,213,0.35) 0%, rgba(255,237,213,0) 62%)'}} />
			<AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(255,255,255,0.16) 1.6px, transparent 1.6px)', backgroundSize: '34px 34px', opacity: 0.6}} />
		</AbsoluteFill>
	);
};

/** A mobile UI/UX drawing on the app canvas (390 × 844), in the film's language. */
const Drawing: React.FC<{id: string; lang: Lang}> = ({id, lang}) => {
	const screen = findScreen(id);
	return (
		<UIProvider lang={lang} mode="light" module={screen.module}>
			<div style={{...themeVars('light'), width: APP_SCREEN.width, height: APP_SCREEN.height}}>
				<screen.Component />
			</div>
		</UIProvider>
	);
};

/** Seconds each screen of a flow stays before the next slides in. */
const FLOW_STEP = 1.7;

/** Screens one after another, the next sliding in from the right (a short walk through the app); the last one holds. */
const Flow: React.FC<{ids: readonly string[]; lang: Lang; delay?: number}> = ({ids, lang, delay = 0}) => {
	const seconds = useSeconds() - delay;
	return (
		<div style={{position: 'relative', width: APP_SCREEN.width, height: APP_SCREEN.height, overflow: 'hidden'}}>
			{ids.map((id, index) => {
				const enter = index === 0 ? 1 : interpolate(seconds, [index * FLOW_STEP, index * FLOW_STEP + 0.32], [0, 1], CLAMP);
				const leave = index === ids.length - 1 ? 0 : interpolate(seconds, [(index + 1) * FLOW_STEP, (index + 1) * FLOW_STEP + 0.32], [0, 1], CLAMP);
				if (enter <= 0 || leave >= 1) return null;
				return (
					<div key={`${id}-${index}`} style={{position: 'absolute', inset: 0, transform: `translateX(${(1 - enter) * APP_SCREEN.width - leave * APP_SCREEN.width * 0.3}px)`, opacity: 1 - leave * 0.6}}>
						<Drawing id={id} lang={lang} />
					</div>
				);
			})}
		</div>
	);
};

/** A phone in 3D space. `turn` is the settled rotation; it swings in from `from` degrees further. */
const Phone3D: React.FC<{children: React.ReactNode; width: number; content: Content; turn?: number; tilt?: number; delay?: number; from?: number}> = ({children, width, content, turn = 0, tilt = 0, delay = 0, from = 40}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const land = useLand(delay, 120, 18);
	const float = Math.sin((seconds + delay) * 1.4) * u(8);
	const ry = turn + (1 - land) * from;
	const rx = tilt + (1 - land) * 18;
	return (
		<div style={{perspective: u(2400)}}>
			<div style={{transform: `translateY(${(1 - land) * u(520) + float}px) rotateY(${ry}deg) rotateX(${rx}deg)`, transformStyle: 'preserve-3d', opacity: Math.min(1, land * 2), filter: `drop-shadow(0 ${u(40)}px ${u(50)}px rgba(60, 20, 0, 0.35))`}}>
				<PhoneFrame width={u(width)} variant={content.variant} lang={content.lang} rim>
					{children}
				</PhoneFrame>
			</div>
		</div>
	);
};

/** A word that lands: in big, blurred and low; out sharp. */
const Word: React.FC<{text: string; at: number; size: number; color: string; band?: boolean}> = ({text, at, size, color, band}) => {
	const {u} = useVideoLayout();
	const land = useLand(at, 210, 18);
	return (
		<span style={{display: 'inline-block', opacity: Math.min(1, land * 1.6), transform: `translateY(${(1 - land) * u(70)}px) scale(${1 + (1 - land) * 0.4})`, filter: `blur(${(1 - Math.min(1, land)) * u(10)}px)`, fontSize: u(size), fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.02, color, marginRight: u(size * 0.24), padding: band ? `${u(4)}px ${u(18)}px` : undefined, background: band ? WHITE : undefined, borderRadius: band ? u(18) : undefined}}>
			{text}
		</span>
	);
};

/** A headline line by line, word by word. The second line sits on a white band in orange. */
const Kinetic: React.FC<{lines: readonly [string, string]; at?: number; size?: number; align?: 'left' | 'center'}> = ({lines, at = 0.15, size = 104, align = 'left'}) => {
	const {u} = useVideoLayout();
	const first = lines[0].split(' ');
	const second = lines[1].split(' ');
	return (
		<div style={{display: 'flex', flexDirection: 'column', gap: u(18), alignItems: align === 'center' ? 'center' : 'flex-start', textAlign: align}}>
			<div>
				{first.map((word, index) => (
					<Word key={`a${index}`} text={word} at={at + index * 0.09} size={size} color={WHITE} />
				))}
			</div>
			<div>
				{second.map((word, index) => (
					<Word key={`b${index}`} text={word} at={at + (first.length + index) * 0.09 + 0.1} size={size} color={ORANGE} band />
				))}
			</div>
		</div>
	);
};

const ModuleChip: React.FC<{module: ShowcaseBeat['module']; text: string; at?: number}> = ({module, text, at = 0}) => {
	const {u} = useVideoLayout();
	const land = useLand(at, 220, 20);
	const identity = MODULES[module];
	return (
		<div style={{display: 'inline-flex', alignItems: 'center', gap: u(14), padding: `${u(10)}px ${u(24)}px ${u(10)}px ${u(10)}px`, borderRadius: u(999), background: WHITE, opacity: land, transform: `scale(${0.7 + land * 0.3})`, transformOrigin: 'left center', boxShadow: `0 ${u(16)}px ${u(30)}px -${u(14)}px rgba(60,20,0,0.5)`}}>
			<div style={{width: u(52), height: u(52), borderRadius: u(26), background: identity.color.light, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<Icon name={identity.icon} size={u(28)} color={WHITE} stroke={2.2} />
			</div>
			<div style={{fontSize: u(30), fontWeight: 800, color: NAVY}}>{text}</div>
		</div>
	);
};

/** A region of the screen lifted toward the camera: the same drawing, larger, on a white card. */
const PopOut: React.FC<{id: string; lang: Lang; pop: NonNullable<ShowcaseBeat['pop']>; width: number; at: number}> = ({id, lang, pop, width, at}) => {
	const {u} = useVideoLayout();
	const land = useLand(at, 150, 16);
	const cardW = u(width);
	const fullW = cardW / pop.w;
	const fullH = fullW * (APP_SCREEN.height / APP_SCREEN.width);
	const cardH = fullH * pop.h;
	return (
		<div style={{width: cardW, height: cardH, borderRadius: u(26), overflow: 'hidden', position: 'relative', background: WHITE, border: `${u(5)}px solid ${WHITE}`, boxShadow: `0 ${u(40)}px ${u(70)}px -${u(20)}px rgba(40,10,0,0.55)`, opacity: Math.min(1, land * 2), transform: `scale(${0.55 + land * 0.45}) translateY(${(1 - land) * u(60)}px)`}}>
			<div style={{position: 'absolute', left: -pop.x * fullW, top: -pop.y * fullH, width: APP_SCREEN.width, height: APP_SCREEN.height, transform: `scale(${fullW / APP_SCREEN.width})`, transformOrigin: 'top left'}}>
				<Drawing id={id} lang={lang} />
			</div>
		</div>
	);
};

const Counter: React.FC<{index: number; total: number}> = ({index, total}) => {
	const {u} = useVideoLayout();
	return (
		<div style={{fontSize: u(26), fontWeight: 800, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.12em'}}>
			{String(index + 1).padStart(2, '0')} <span style={{opacity: 0.55}}>/ {String(total).padStart(2, '0')}</span>
		</div>
	);
};


export const HookScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const giant = interpolate(seconds, [0, 4], [u(260), u(-140)]);
	return (
		<AbsoluteFill>
			<OrangeGround />
			<div style={{position: 'absolute', top: u(700), left: giant, fontSize: u(360), fontWeight: 800, color: 'transparent', WebkitTextStroke: `${u(3)}px rgba(255,255,255,0.16)`, whiteSpace: 'nowrap', letterSpacing: '-0.04em'}}>Sınavika</div>
			<div style={{position: 'absolute', left: u(130), top: 0, bottom: 0, width: u(980), display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
				<Kinetic lines={content.hook.lines} size={112} />
			</div>
			<div style={{position: 'absolute', right: u(230), top: u(90)}}>
				<Phone3D width={420} content={content} turn={-14} tilt={4} delay={0.05} from={50}>
					<Flow ids={content.hook.screens} lang={content.lang} delay={0.6} />
				</Phone3D>
			</div>
		</AbsoluteFill>
	);
};

export const FanScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const spread = useLand(0.25, 110, 18);
	const positions = [
		{x: -u(430) * spread, turn: 26, z: 0.86, delay: 0.1},
		{x: u(430) * spread, turn: -26, z: 0.86, delay: 0.16},
		{x: 0, turn: 0, z: 1, delay: 0},
	];
	const screens = [content.fan.screens[1], content.fan.screens[2], content.fan.screens[0]];
	return (
		<AbsoluteFill>
			<OrangeGround />
			<div style={{position: 'absolute', top: u(70), left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
				<div style={{fontSize: u(78), fontWeight: 800, color: WHITE, letterSpacing: '-0.03em', opacity: interpolate(seconds, [0.05, 0.35], [0, 1], CLAMP), transform: `translateY(${interpolate(seconds, [0.05, 0.4], [u(-30), 0], CLAMP)}px)`}}>{content.fan.headline}</div>
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: u(205), display: 'flex', justifyContent: 'center'}}>
				{[0, 1, 2].map((index) => (
					<div key={index} style={{position: 'absolute', transform: `translateX(${positions[index].x}px) scale(${positions[index].z})`, zIndex: index === 2 ? 2 : 1}}>
						<Phone3D width={330} content={content} turn={positions[index].turn} delay={positions[index].delay} from={30}>
							<Drawing id={screens[index]} lang={content.lang} />
						</Phone3D>
					</div>
				))}
			</div>
			<div style={{position: 'absolute', left: u(80), right: u(80), bottom: u(46), display: 'flex', justifyContent: 'center', gap: u(14), flexWrap: 'wrap'}}>
				{content.fan.chips.map((chip, index) => {
					const land = interpolate(seconds, [0.7 + index * 0.08, 1 + index * 0.08], [0, 1], CLAMP);
					return (
						<div key={chip} style={{padding: `${u(12)}px ${u(24)}px`, borderRadius: u(999), background: index % 2 === 0 ? WHITE : NAVY, color: index % 2 === 0 ? NAVY : WHITE, fontSize: u(26), fontWeight: 800, opacity: land, transform: `translateY(${(1 - land) * u(30)}px)`}}>
							{chip}
						</div>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};

export const BeatScene: React.FC<{content: Content; index: number}> = ({content, index}) => {
	const {u} = useVideoLayout();
	const beat = content.beats[index];
	const phoneLeft = index % 2 === 1;
	const turn = phoneLeft ? 16 : -16;
	const text = (
		<div style={{display: 'flex', flexDirection: 'column', gap: u(34), alignItems: 'flex-start'}}>
			<Counter index={index} total={content.beats.length} />
			<ModuleChip module={beat.module} text={beat.kicker} at={0.05} />
			<Kinetic lines={beat.headline} at={0.2} size={96} />
		</div>
	);
	const phone = (
		<div style={{position: 'relative'}}>
			<Phone3D width={400} content={content} turn={turn} tilt={3} delay={0} from={phoneLeft ? -45 : 45}>
				<Flow ids={beat.screens} lang={content.lang} delay={0.9} />
			</Phone3D>
			{beat.pop ? (
				<div style={{position: 'absolute', top: u(phoneLeft ? 600 : 330), [phoneLeft ? 'right' : 'left']: -u(phoneLeft ? 150 : 320)} as React.CSSProperties}>
					<PopOut id={beat.screens[0]} lang={content.lang} pop={beat.pop} width={phoneLeft ? 400 : 440} at={0.75} />
				</div>
			) : null}
		</div>
	);
	return (
		<AbsoluteFill>
			<OrangeGround />
			<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `0 ${u(phoneLeft ? 110 : 130)}px 0 ${u(phoneLeft ? 230 : 130)}px`}}>
				{phoneLeft ? phone : text}
				{phoneLeft ? <div style={{width: u(820)}}>{text}</div> : phone}
			</div>
		</AbsoluteFill>
	);
};

/** A tilted wall of every screen sliding past, on navy. */
export const WallScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const shift = interpolate(seconds, [0, 4], [0, -u(360)]);
	const screens = content.wall.screens;
	const rows = [screens.slice(0, Math.ceil(screens.length / 2)), screens.slice(Math.ceil(screens.length / 2))];
	return (
		<AbsoluteFill style={{background: `radial-gradient(120% 90% at 50% 40%, #16304F 0%, ${NAVY} 70%)`, overflow: 'hidden'}}>
			<div style={{position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%, -50%) perspective(${u(2000)}px) rotateX(24deg) rotateZ(-14deg)`}}>
				{rows.map((row, r) => (
					<div key={r} style={{display: 'flex', gap: u(40), marginBottom: u(40), transform: `translateX(${(r % 2 === 0 ? shift : -shift) - u(200)}px)`}}>
						{[...row, ...row].map((id, i) => (
							<PhoneFrame key={`${r}-${i}`} width={u(260)} variant={content.variant} lang={content.lang}>
								<Drawing id={id} lang={content.lang} />
							</PhoneFrame>
						))}
					</div>
				))}
			</div>
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(11,28,48,0) 30%, rgba(11,28,48,0.85) 100%)'}} />
			<div style={{position: 'absolute', left: 0, right: 0, bottom: u(110), display: 'flex', justifyContent: 'center'}}>
				<Kinetic lines={content.wall.lines} at={0.2} size={84} align="center" />
			</div>
		</AbsoluteFill>
	);
};

export const ClosingScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const logo = useLand(0.05, 200);
	const button = useLand(0.45, 220, 16);
	const stores = useLand(0.7, 220, 18);
	const [left, centre, right] = content.closing.screens;
	return (
		<AbsoluteFill>
			<OrangeGround />
			<div style={{position: 'absolute', left: u(130), top: 0, bottom: 0, width: u(820), display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: u(34)}}>
				<div style={{opacity: logo, transform: `scale(${0.85 + logo * 0.15})`, transformOrigin: 'left center'}}>
					<BrandMark size="card" color={WHITE} />
				</div>
				<div style={{fontSize: u(58), fontWeight: 800, lineHeight: 1.12, color: WHITE, letterSpacing: '-0.02em', opacity: logo}}>{content.closing.line}</div>
				<div style={{alignSelf: 'flex-start', padding: `${u(24)}px ${u(64)}px`, borderRadius: u(999), background: WHITE, color: ORANGE, fontSize: u(46), fontWeight: 800, opacity: button, transform: `scale(${0.8 + button * 0.2})`, transformOrigin: 'left center', boxShadow: `0 ${u(20)}px ${u(40)}px -${u(16)}px rgba(60,20,0,0.5)`}}>
					{content.closing.cta}
				</div>
				<div style={{opacity: stores, transform: `translateY(${(1 - stores) * u(30)}px)`}}>
					<StoreBadges height={92} lang={content.lang} align="flex-start" />
				</div>
			</div>
			<div style={{position: 'absolute', right: u(120), top: u(150), display: 'flex', alignItems: 'flex-start'}}>
				<div style={{marginRight: -u(120), marginTop: u(90), zIndex: 1}}>
					<Phone3D width={300} content={content} turn={22} delay={0.2} from={30}>
						<Drawing id={left} lang={content.lang} />
					</Phone3D>
				</div>
				<div style={{zIndex: 2}}>
					<Phone3D width={350} content={content} turn={-6} delay={0.05} from={30}>
						<Drawing id={centre} lang={content.lang} />
					</Phone3D>
				</div>
				<div style={{marginLeft: -u(120), marginTop: u(90), zIndex: 1}}>
					<Phone3D width={300} content={content} turn={-24} delay={0.3} from={30}>
						<Drawing id={right} lang={content.lang} />
					</Phone3D>
				</div>
			</div>
		</AbsoluteFill>
	);
};
