import React from 'react';
import {AbsoluteFill} from 'remotion';
import {VideoFrame} from '../Components/Layouts/VideoFrame';
import {themeVars, UIProvider} from '../UIUX/Context';
import {Icon} from '../UIUX/Icons';
import {Card, Chip, Stack, Text} from '../UIUX/Parts/Shared';
import {KpiCard, NetBars, TodayCard, WeekStrip} from '../UIUX/Parts/Study';
import {findScreen} from '../UIUX/Registry';
import {screenSize} from '../UIUX/UIUXProps';
import {FEATURE_GRAPHIC, STORE_CREATIVE, STORE_SLIDES, type StoreFloat, type StoreSlide} from './StoreListing';
import type {StoreSetProps} from './StoreProps';

/**
 * The store picture set (owner, 14 Nov 2026: look "Turuncu" chosen from three
 * concepts). A study app first, SinoAI last. Full brand orange ground, the
 * key words under a highlighter stroke, a large device showing the current
 * UI/UX drawing (phone, iPad or browser) and one piece of real UI floating
 * off its edge.
 *
 * Apple iOS 27 creative safe areas: search 3:2 2168 × 1030 at (836, 765) on
 * 3840 × 2560; header 21:9 1646 × 661 at (1097, 493) on 3840 × 1646; the
 * universal 16:9 asset 1402 × 962 at (1921, 660) on 5244 × 2950. Text lives
 * only inside them; cards around them may crop. Google Play feature graphic:
 * no device, no white or dark ground, no badge.
 */

const LOOK = {
	bg: 'linear-gradient(160deg, #F97316 0%, #EA580C 45%, #C2410C 100%)',
	ink: '#FFFFFF',
	sub: 'rgba(255,255,255,0.9)',
	mark: 'rgba(11, 28, 48, 0.28)',
	glow: 'rgba(255, 255, 255, 0.18)',
	shadow: '0 40px 90px -30px rgba(67, 20, 7, 0.55)',
};

type Lang = 'tr' | 'en';
type Float = StoreFloat;
type Words = [string, string, string];

/** "Bugün *ne çalışacağını* bil" → before, marked words, after. */
const words = (text: string): Words => {
	const match = /^(.*?)\*([^*]+)\*(.*)$/.exec(text);
	return match ? [match[1], match[2], match[3]] : [text, '', ''];
};

/** Headline with the key words under a highlighter stroke. */
const Headline: React.FC<{parts: Words; size: number; align?: 'left' | 'center'}> = ({parts, size, align = 'left'}) => (
	<div style={{fontSize: size, fontWeight: 800, lineHeight: 1.06, letterSpacing: '-0.03em', color: LOOK.ink, textAlign: align, textWrap: 'balance'}}>
		{parts[0]}
		<span style={{background: `linear-gradient(transparent 58%, ${LOOK.mark} 58%, ${LOOK.mark} 92%, transparent 92%)`, padding: '0 0.08em', margin: '0 -0.04em'}}>{parts[1]}</span>
		{parts[2]}
	</div>
);

/** A UI/UX drawing at its own canvas size, scaled to `width`. */
const Drawing: React.FC<{id: string; width: number; lang: Lang}> = ({id, width, lang}) => {
	const screen = findScreen(id);
	const size = screenSize(screen.platform, screen.height, screen.portrait);
	const scale = width / size.width;
	return (
		<div style={{width, height: size.height * scale, overflow: 'hidden', position: 'relative', background: '#FFFFFF'}}>
			<div style={{width: size.width, height: size.height, transform: `scale(${scale})`, transformOrigin: 'top left'}}>
				<UIProvider lang={lang} mode="light">
					<div style={{...themeVars('light'), width: size.width, height: size.height}}>
						<screen.Component />
					</div>
				</UIProvider>
			</div>
		</div>
	);
};

/** A phone around a mobile drawing: iPhone (Dynamic Island) or Android (punch hole). `width` is the outer width. */
const Phone: React.FC<{id: string; width: number; android?: boolean; lang: Lang}> = ({id, width, android, lang}) => {
	const bezel = width * (android ? 0.028 : 0.035);
	const inner = width - bezel * 2;
	const s = inner / 390;
	return (
		<div style={{width, borderRadius: width * (android ? 0.11 : 0.155), background: '#0B0B0F', padding: bezel, boxSizing: 'border-box', boxShadow: `${LOOK.shadow}, inset 0 0 0 ${width * 0.006}px #3A3A40`}}>
			<div style={{borderRadius: width * (android ? 0.085 : 0.125), overflow: 'hidden', position: 'relative'}}>
				<Drawing id={id} width={inner} lang={lang} />
				{android ? (
					<div style={{position: 'absolute', top: 14 * s, left: '50%', width: 22 * s, height: 22 * s, marginLeft: -11 * s, borderRadius: '50%', background: '#000'}} />
				) : (
					<div style={{position: 'absolute', top: 11 * s, left: '50%', width: 120 * s, height: 35 * s, marginLeft: -60 * s, borderRadius: 20 * s, background: '#000'}} />
				)}
			</div>
		</div>
	);
};

/** An iPad in landscape around a tablet drawing. */
const Tablet: React.FC<{id: string; width: number; lang: Lang}> = ({id, width, lang}) => {
	const bezel = width * 0.022;
	return (
		<div style={{width, borderRadius: width * 0.045, background: '#0B0B0F', padding: bezel, boxSizing: 'border-box', boxShadow: `${LOOK.shadow}, inset 0 0 0 ${width * 0.004}px #3A3A40`}}>
			<div style={{borderRadius: width * 0.025, overflow: 'hidden'}}>
				<Drawing id={id} width={width - bezel * 2} lang={lang} />
			</div>
		</div>
	);
};

/** A browser window around a web drawing. */
const Browser: React.FC<{id: string; width: number; lang: Lang}> = ({id, width, lang}) => {
	const bar = width * 0.03;
	return (
		<div style={{width, borderRadius: width * 0.012, overflow: 'hidden', background: '#E5E7EB', boxShadow: LOOK.shadow}}>
			<div style={{height: bar, display: 'flex', alignItems: 'center', gap: bar * 0.3, padding: `0 ${bar * 0.5}px`}}>
				{['#F87171', '#FBBF24', '#34D399'].map((color) => (
					<div key={color} style={{width: bar * 0.32, height: bar * 0.32, borderRadius: '50%', background: color}} />
				))}
				<div style={{flex: 1, height: bar * 0.56, marginLeft: bar * 0.4, borderRadius: bar * 0.28, background: '#FFFFFF'}} />
			</div>
			<Drawing id={id} width={width} lang={lang} />
		</div>
	);
};

/** A piece of real UI floating off the device, drawn at UI scale `scale`. */
const FloatCard: React.FC<{kind: Float; scale: number; lang: Lang}> = ({kind, scale, lang}) => {
	if (kind === 'none') return null;
	const en = lang === 'en';
	return (
		<div style={{transform: `scale(${scale})`, transformOrigin: 'top left', width: kind === 'step' ? 330 : 360}}>
			<UIProvider lang={lang} mode="light">
				<div style={{...themeVars('light'), borderRadius: 26, boxShadow: LOOK.shadow}}>
					{kind === 'today' ? <TodayCard /> : null}
					{kind === 'kpi' ? <KpiCard icon="clock" label={en ? 'This week' : 'Bu hafta'} value={en ? '4 h 10 m' : '4 sa 10 dk'} delta="%22" /> : null}
					{kind === 'step' ? (
						<Card padding={16} radius={24}>
							<Stack row gap={12}>
								<div style={{width: 44, height: 44, borderRadius: 22, background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
									<Icon name="check" size={24} color="#FFFFFF" />
								</div>
								<Stack gap={2}>
									<Text role="section" size={18}>
										{en ? 'Correct!' : 'Doğru!'}
									</Text>
									<Text role="small">{en ? 'Comes back in 3 days to stick' : '3 gün sonra tekrar gelir, unutmazsın'}</Text>
								</Stack>
							</Stack>
						</Card>
					) : null}
					{kind === 'nets' ? (
						<Card padding={16} radius={24}>
							<Stack gap={10}>
								<Stack row justify="space-between">
									<Text role="headline" size={16}>
										{en ? 'My TYT nets' : 'TYT net gelişimim'}
									</Text>
									<Chip tone="success" icon="trend" size="sm">
										+20,25
									</Chip>
								</Stack>
								<NetBars height={120} items={[['D2', 64], ['D3', 72], ['D4', 78.5], ['D5', 84.25]]} />
							</Stack>
						</Card>
					) : null}
				</div>
			</UIProvider>
		</div>
	);
};

/** Free-standing UI card for the banners. */
const UICard: React.FC<{kind: 'week' | 'kpi' | 'kpi2' | 'today'; left: number; top: number; scale: number; rotate: number; lang: Lang}> = ({kind, left, top, scale, rotate, lang}) => {
	const en = lang === 'en';
	return (
		<div style={{position: 'absolute', left, top, transform: `rotate(${rotate}deg) scale(${scale})`, transformOrigin: 'top left', width: kind === 'today' ? 360 : 400}}>
			<UIProvider lang={lang} mode="light">
				<div style={{...themeVars('light'), borderRadius: 26, background: '#FFFFFF', boxShadow: LOOK.shadow, padding: kind === 'week' ? 14 : 0}}>
					{kind === 'week' ? <WeekStrip /> : null}
					{kind === 'today' ? <TodayCard /> : null}
					{kind === 'kpi' ? <KpiCard icon="clock" label={en ? 'This week' : 'Bu hafta'} value={en ? '4 h 10 m' : '4 sa 10 dk'} delta="%22" /> : null}
					{kind === 'kpi2' ? <KpiCard icon="target" label={en ? 'Accuracy' : 'Doğru oranı'} value="%62" delta="%6" /> : null}
				</div>
			</UIProvider>
		</div>
	);
};

const Ground: React.FC<{children: React.ReactNode}> = ({children}) => <AbsoluteFill style={{background: LOOK.bg, overflow: 'hidden'}}>{children}</AbsoluteFill>;

const Glow: React.FC<{x: number; y: number; d: number}> = ({x, y, d}) => <div style={{position: 'absolute', left: x - d / 2, top: y - d / 2, width: d, height: d, borderRadius: '50%', background: LOOK.glow, filter: `blur(${d * 0.09}px)`}} />;

/* ------------------------------------------------------------------ portrait shots */

/** Phone shot on a 1206 × 2622 stage, fitted and centred in any portrait size (Android 9:16 gets side margins of ground). */
const PhoneShot: React.FC<{slide: StoreSlide; w: number; h: number; android: boolean; lang: Lang}> = ({slide, w, h, android, lang}) => {
	const u = Math.min(w / 1206, h / 2622);
	const x0 = (w - 1206 * u) / 2;
	const y0 = (h - 2622 * u) / 2;
	const at: Record<Exclude<Float, 'none'>, [number, number, number]> = {today: [36, 1560, 2.25], step: [36, 1420, 2.35], nets: [36, 1500, 2.2], kpi: [36, 1640, 2.3]};
	return (
		<Ground>
			<div style={{position: 'absolute', left: x0 + 96 * u, width: 1014 * u, top: y0 + 170 * u}}>
				<Headline parts={words(slide.headline[lang])} size={124 * u} />
				<div style={{marginTop: 34 * u, fontSize: 46 * u, fontWeight: 600, lineHeight: 1.3, color: LOOK.sub, maxWidth: 940 * u}}>{slide.subline[lang]}</div>
			</div>
			<Glow x={w / 2} y={y0 + 1400 * u} d={1000 * u} />
			<div style={{position: 'absolute', left: x0 + (slide.float === 'none' ? 103 : 163) * u, top: y0 + 690 * u}}>
				<Phone id={slide.screens.phone} width={1000 * u} android={android} lang={lang} />
			</div>
			{slide.float !== 'none' ? (
				<div style={{position: 'absolute', left: x0 + at[slide.float][0] * u, top: y0 + at[slide.float][1] * u}}>
					<FloatCard kind={slide.float} scale={at[slide.float][2] * u} lang={lang} />
				</div>
			) : null}
		</Ground>
	);
};

/** iPad shot on a 2064 × 2752 stage: a landscape iPad with the tablet drawing; a slide without one shows the phone. */
const TabletShot: React.FC<{slide: StoreSlide; w: number; h: number; lang: Lang}> = ({slide, w, h, lang}) => {
	const u = Math.min(w / 2064, h / 2752);
	const x0 = (w - 2064 * u) / 2;
	const y0 = (h - 2752 * u) / 2;
	return (
		<Ground>
			<div style={{position: 'absolute', left: x0 + 130 * u, width: 1800 * u, top: y0 + 190 * u}}>
				<Headline parts={words(slide.headline[lang])} size={150 * u} />
				<div style={{marginTop: 40 * u, fontSize: 60 * u, fontWeight: 600, lineHeight: 1.3, color: LOOK.sub, maxWidth: 1600 * u}}>{slide.subline[lang]}</div>
			</div>
			<Glow x={w / 2} y={y0 + 1700 * u} d={1600 * u} />
			{slide.screens.tablet ? (
				<div style={{position: 'absolute', left: x0 + 92 * u, top: y0 + 860 * u}}>
					<Tablet id={slide.screens.tablet} width={1880 * u} lang={lang} />
				</div>
			) : (
				<div style={{position: 'absolute', left: x0 + 597 * u, top: y0 + 740 * u}}>
					<Phone id={slide.screens.phone} width={870 * u} lang={lang} />
				</div>
			)}
			{slide.float !== 'none' && slide.screens.tablet ? (
				<div style={{position: 'absolute', left: x0 + 60 * u, top: y0 + 1980 * u}}>
					<FloatCard kind={slide.float} scale={2.4 * u} lang={lang} />
				</div>
			) : null}
		</Ground>
	);
};

/* ------------------------------------------------------------------ desktop (Chromebook, 16:9) */

const DesktopShot: React.FC<{slide: StoreSlide; w: number; lang: Lang}> = ({slide, w, lang}) => {
	const u = w / 1920;
	return (
		<Ground>
			<div style={{position: 'absolute', left: 100 * u, width: 600 * u, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 26 * u}}>
				<Headline parts={words(slide.headline[lang])} size={78 * u} />
				<div style={{fontSize: 30 * u, fontWeight: 600, lineHeight: 1.3, color: LOOK.sub}}>{slide.subline[lang]}</div>
			</div>
			<Glow x={1300 * u} y={540 * u} d={900 * u} />
			<div style={{position: 'absolute', left: 760 * u, top: 150 * u}}>
				<Browser id={slide.screens.web} width={1220 * u} lang={lang} />
			</div>
			{slide.float !== 'none' ? (
				<div style={{position: 'absolute', left: 640 * u, top: 690 * u}}>
					<FloatCard kind={slide.float} scale={1.0 * u} lang={lang} />
				</div>
			) : null}
		</Ground>
	);
};

/* ------------------------------------------------------------------ App Store search result (3:2) */

const Search: React.FC<{w: number; textless: boolean; lang: Lang}> = ({w, textless, lang}) => {
	const u = w / 3840;
	return (
		<Ground>
			{textless ? null : (
				<div style={{position: 'absolute', left: 836 * u, top: 765 * u, width: 1150 * u, height: 1030 * u, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
					<Headline parts={words(STORE_CREATIVE.search.headline[lang])} size={200 * u} />
				</div>
			)}
			<Glow x={(textless ? 1920 : 2550) * u} y={1500 * u} d={1500 * u} />
			<div style={{position: 'absolute', left: (textless ? 1430 : 2060) * u, top: 360 * u}}>
				<Phone id="m-hub-moduller" width={980 * u} lang={lang} />
			</div>
			<div style={{position: 'absolute', left: (textless ? 2150 : 2780) * u, top: 1180 * u}}>
				<FloatCard kind="nets" scale={2.2 * u} lang={lang} />
			</div>
		</Ground>
	);
};

/* ------------------------------------------------------------------ App Store product page header (21:9) */

const Header: React.FC<{w: number; textless: boolean; lang: Lang}> = ({w, textless, lang}) => {
	const u = w / 3840;
	return (
		<Ground>
			<UICard kind="week" left={120 * u} top={380 * u} scale={2.6 * u} rotate={-4} lang={lang} />
			<UICard kind="kpi" left={120 * u} top={980 * u} scale={2.2 * u} rotate={3} lang={lang} />
			<UICard kind="kpi2" left={2900 * u} top={260 * u} scale={2.3 * u} rotate={4} lang={lang} />
			{textless ? (
				<UICard kind="today" left={1540 * u} top={330 * u} scale={2.1 * u} rotate={0} lang={lang} />
			) : (
				<>
					<UICard kind="today" left={2820 * u} top={860 * u} scale={2.1 * u} rotate={-3} lang={lang} />
					<div style={{position: 'absolute', left: 1097 * u, top: 493 * u, width: 1646 * u, height: 661 * u, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<Headline parts={words(STORE_CREATIVE.header.headline[lang])} size={190 * u} align="center" />
					</div>
				</>
			)}
		</Ground>
	);
};

/* ------------------------------------------------------------------ universal 16:9 (header and search, 5244 × 2950) */

const Universal: React.FC<{w: number; phrase: 'header' | 'search'; textless: boolean; lang: Lang}> = ({w, phrase, textless, lang}) => {
	const u = w / 5244;
	// safe area 1402 × 962 at (1921, 660): only the phrase lives there.
	return (
		<Ground>
			<Glow x={2622 * u} y={1475 * u} d={2200 * u} />
			<UICard kind="week" left={260 * u} top={420 * u} scale={3.1 * u} rotate={-4} lang={lang} />
			<UICard kind="kpi" left={300 * u} top={1500 * u} scale={2.7 * u} rotate={3} lang={lang} />
			<UICard kind="kpi2" left={3820 * u} top={380 * u} scale={2.7 * u} rotate={4} lang={lang} />
			<div style={{position: 'absolute', left: 3700 * u, top: 1300 * u}}>
				<FloatCard kind="nets" scale={2.9 * u} lang={lang} />
			</div>
			{textless ? (
				<UICard kind="today" left={2042 * u} top={560 * u} scale={3.2 * u} rotate={0} lang={lang} />
			) : (
				<div style={{position: 'absolute', left: 1921 * u, top: 660 * u, width: 1402 * u, height: 962 * u, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<Headline parts={words(STORE_CREATIVE[phrase].headline[lang])} size={168 * u} align="center" />
				</div>
			)}
		</Ground>
	);
};

/* ------------------------------------------------------------------ Google Play feature graphic (1024 × 500) */

const Feature: React.FC<{w: number; lang: Lang}> = ({w, lang}) => {
	const u = w / 1024;
	return (
		<Ground>
			<div style={{position: 'absolute', left: 64 * u, top: 0, bottom: 0, width: 470 * u, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16 * u}}>
				<Headline parts={words(FEATURE_GRAPHIC.headline[lang])} size={58 * u} />
				<div style={{fontSize: 21 * u, fontWeight: 600, color: LOOK.sub, lineHeight: 1.35}}>{FEATURE_GRAPHIC.subline[lang]}</div>
			</div>
			<UICard kind="today" left={600 * u} top={70 * u} scale={0.95 * u} rotate={-3} lang={lang} />
			<div style={{position: 'absolute', left: 690 * u, top: 300 * u}}>
				<FloatCard kind="step" scale={0.85 * u} lang={lang} />
			</div>
		</Ground>
	);
};

export const StoreSet: React.FC<StoreSetProps> = ({kind, device, slide, textless, width, height, lang}) => {
	const sixteenNine = Math.abs(width / height - 16 / 9) < 0.02;
	return (
		<VideoFrame themeId="SinavikaLight" lang={lang}>
			{kind === 'shot' && device === 'desktop' ? <DesktopShot slide={STORE_SLIDES[slide]} w={width} lang={lang} /> : null}
			{kind === 'shot' && device === 'ipad' ? <TabletShot slide={STORE_SLIDES[slide]} w={width} h={height} lang={lang} /> : null}
			{kind === 'shot' && (device === 'iphone' || device === 'android') ? <PhoneShot slide={STORE_SLIDES[slide]} w={width} h={height} android={device === 'android'} lang={lang} /> : null}
			{kind === 'search' && !sixteenNine ? <Search w={width} textless={textless} lang={lang} /> : null}
			{kind === 'header' && !sixteenNine ? <Header w={width} textless={textless} lang={lang} /> : null}
			{(kind === 'search' || kind === 'header') && sixteenNine ? <Universal w={width} phrase={kind} textless={textless} lang={lang} /> : null}
			{kind === 'feature' ? <Feature w={width} lang={lang} /> : null}
		</VideoFrame>
	);
};
