import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {VideoFrame} from '../Components/Layouts/VideoFrame';
import {themeVars, UIProvider} from '../UIUX/Context';
import {Icon} from '../UIUX/Icons';
import {Card, Chip, Stack, Text} from '../UIUX/Parts/Shared';
import {KpiCard, NetBars, TodayCard, WeekStrip} from '../UIUX/Parts/Study';
import {findScreen} from '../UIUX/Registry';
import {screenSize} from '../UIUX/UIUXProps';
import {UI_CANVAS} from '../UIUX/Tokens';
import {FEATURE_GRAPHIC, STORE_CREATIVE, STORE_SLIDES, SUBSCRIPTION_ICONS, type StoreFloat, type StoreSlide} from './StoreListing';
import {fitStage, FRAME, GAP, MARK, markBoxStyle, PHONE_STAGE, phoneBox, TABLET_STAGE, tabletStageDevice, type TextBlock} from './StoreLayout';
import type {StoreSetProps} from './StoreProps';
import {LOOKS, TURUNCU, type Look} from './StoreLooks';

/**
 * The store picture set. Main look "Turuncu" (owner, 14 Nov 2026), with
 * three alternatives: krem, lacivert and seritli (Turuncu with one ribbon
 * through the gallery). A study app first, SinoAI last. The key words sit in
 * a solid box (navy on orange), a large device shows the current UI/UX
 * drawing (phone, iPad or browser) and one piece of real UI floats off its
 * edge.
 *
 * Apple iOS 27 creative safe areas: search 3:2 2168 × 1030 at (836, 765) on
 * 3840 × 2560; header 21:9 1646 × 661 at (1097, 493) on 3840 × 1646; the
 * universal 16:9 asset 1402 × 962 at (1921, 660) on 5244 × 2950. Text lives
 * only inside them; cards around them may crop. Google Play feature graphic:
 * no device, no white or dark ground, no badge.
 */

const LookContext = React.createContext<Look>(TURUNCU);
const useLook = () => React.useContext(LookContext);

/** A percentage as each language writes it: Turkish puts the sign first (%62), English after (62%). */
const percent = (value: number, lang: 'tr' | 'en'): string => (lang === 'en' ? `${value}%` : `%${value}`);

type Lang = 'tr' | 'en';
type Float = StoreFloat;
type Words = [string, string, string];

/** "Bugün *ne çalışacağını* bil" → before, marked words, after. */
const words = (text: string): Words => {
	const match = /^(.*?)\*([^*]+)\*(.*)$/.exec(text);
	return match ? [match[1], match[2], match[3]] : [text, '', ''];
};

/** Headline with the key words in a solid box (the box hugs the words, same baseline). */
const Headline: React.FC<{
	parts: Words;
	size: number;
	align?: 'left' | 'center';
}> = ({parts, size, align = 'left'}) => {
	const look = useLook();
	return (
		<div
			style={{
				fontSize: size,
				fontWeight: 800,
				lineHeight: MARK.lineHeight,
				letterSpacing: '-0.03em',
				color: look.ink,
				textAlign: align,
				textWrap: 'balance',
			}}
		>
			{parts[0]}
			<span
				style={{
					background: look.markBg,
					color: look.markInk,
					...markBoxStyle(),
					paddingLeft: '0.16em',
					paddingRight: '0.16em',
					borderRadius: '0.14em',
					whiteSpace: 'nowrap',
				}}
			>
				{parts[1]}
			</span>
			{parts[2]}
		</div>
	);
};

/** A UI/UX drawing at its own canvas size, scaled to `width`. */
const Drawing: React.FC<{id: string; width: number; lang: Lang; bg?: string}> = ({id, width, lang, bg = '#FFFFFF'}) => {
	const screen = findScreen(id);
	const size = screenSize(screen.platform, screen.height, screen.portrait, screen.round, screen.pose);
	const scale = width / size.width;
	return (
		<div
			style={{
				width,
				height: size.height * scale,
				overflow: 'hidden',
				position: 'relative',
				background: bg,
			}}
		>
			<div
				style={{
					width: size.width,
					height: size.height,
					transform: `scale(${scale})`,
					transformOrigin: 'top left',
				}}
			>
				<UIProvider lang={lang} mode="light">
					<div
						style={{
							...themeVars('light'),
							width: size.width,
							height: size.height,
						}}
					>
						<screen.Component />
					</div>
				</UIProvider>
			</div>
		</div>
	);
};

/** A phone around a mobile drawing: iPhone (Dynamic Island) or Android (punch hole). `width` is the outer width. */
const Phone: React.FC<{
	id: string;
	width: number;
	android?: boolean;
	lang: Lang;
}> = ({id, width, android, lang}) => {
	const look = useLook();
	const frame = FRAME[android ? 'android' : 'iphone'];
	const bezel = width * frame.bezel;
	const inner = width - bezel * 2;
	const s = inner / 390;
	return (
		<div
			style={{
				width,
				borderRadius: width * frame.radius,
				background: '#0B0B0F',
				padding: bezel,
				boxSizing: 'border-box',
				boxShadow: `${look.shadow}, inset 0 0 0 ${width * 0.006}px #3A3A40`,
			}}
		>
			<div
				style={{
					borderRadius: width * frame.screenRadius,
					overflow: 'hidden',
					position: 'relative',
				}}
			>
				<Drawing id={id} width={inner} lang={lang} />
				{android ? (
					<div
						style={{
							position: 'absolute',
							top: 14 * s,
							left: '50%',
							width: 22 * s,
							height: 22 * s,
							marginLeft: -11 * s,
							borderRadius: '50%',
							background: '#000',
						}}
					/>
				) : (
					<div
						style={{
							position: 'absolute',
							top: 11 * s,
							left: '50%',
							width: 120 * s,
							height: 35 * s,
							marginLeft: -60 * s,
							borderRadius: 20 * s,
							background: '#000',
						}}
					/>
				)}
			</div>
		</div>
	);
};

/** An iPad in landscape around a tablet drawing. */
const Tablet: React.FC<{id: string; width: number; lang: Lang}> = ({id, width, lang}) => {
	const look = useLook();
	const bezel = width * FRAME.tablet.bezel;
	return (
		<div
			style={{
				width,
				borderRadius: width * FRAME.tablet.radius,
				background: '#0B0B0F',
				padding: bezel,
				boxSizing: 'border-box',
				boxShadow: `${look.shadow}, inset 0 0 0 ${width * 0.004}px #3A3A40`,
			}}
		>
			<div style={{borderRadius: width * FRAME.tablet.screenRadius, overflow: 'hidden'}}>
				<Drawing id={id} width={width - bezel * 2} lang={lang} />
			</div>
		</div>
	);
};

/** A browser window around a web drawing. */
const Browser: React.FC<{id: string; width: number; lang: Lang}> = ({id, width, lang}) => {
	const look = useLook();
	const bar = width * 0.03;
	return (
		<div
			style={{
				width,
				borderRadius: width * 0.012,
				overflow: 'hidden',
				background: '#E5E7EB',
				boxShadow: look.shadow,
			}}
		>
			<div
				style={{
					height: bar,
					display: 'flex',
					alignItems: 'center',
					gap: bar * 0.3,
					padding: `0 ${bar * 0.5}px`,
				}}
			>
				{['#F87171', '#FBBF24', '#34D399'].map((color) => (
					<div
						key={color}
						style={{
							width: bar * 0.32,
							height: bar * 0.32,
							borderRadius: '50%',
							background: color,
						}}
					/>
				))}
				<div
					style={{
						flex: 1,
						height: bar * 0.56,
						marginLeft: bar * 0.4,
						borderRadius: bar * 0.28,
						background: '#FFFFFF',
					}}
				/>
			</div>
			<Drawing id={id} width={width} lang={lang} />
		</div>
	);
};

/** A store screenshot of a watch: only the app's screen on black, edge to edge (Play WO-G5, App Store watch sizes). */
const WatchShot: React.FC<{id: string; w: number; lang: Lang}> = ({id, w, lang}) => (
	<AbsoluteFill style={{background: '#000000'}}>
		<Drawing id={id} width={w} lang={lang} bg="#000000" />
	</AbsoluteFill>
);

/** A piece of real UI floating off the device, drawn at UI scale `scale`. */
const FloatCard: React.FC<{kind: Float; scale?: number; width?: number; lang: Lang}> = ({kind, scale, width, lang}) => {
	const look = useLook();
	if (kind === 'none') return null;
	const en = lang === 'en';
	const own = kind === 'step' ? 330 : 360;
	return (
		<div
			style={{
				/* `width`: drawn that wide and held by its bottom edge (phone and iPad shots); `scale`: from the top. */
				transform: `scale(${width ? width / own : (scale ?? 1)})`,
				transformOrigin: width ? 'bottom left' : 'top left',
				width: own,
			}}
		>
			<UIProvider lang={lang} mode="light">
				<div
					style={{
						...themeVars('light'),
						borderRadius: 26,
						boxShadow: look.shadow,
					}}
				>
					{kind === 'today' ? <TodayCard /> : null}
					{kind === 'kpi' ? <KpiCard icon="clock" label={en ? 'This week' : 'Bu hafta'} value={en ? '4 h 10 m' : '4 sa 10 dk'} delta={percent(22, lang)} /> : null}
					{kind === 'step' ? (
						<Card padding={16} radius={24}>
							<Stack row gap={12}>
								<div
									style={{
										width: 44,
										height: 44,
										borderRadius: 22,
										background: '#059669',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
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
										{en ? 'My SAT Math scores' : 'TYT net gelişimim'}
									</Text>
									<Chip tone="success" icon="trend" size="sm">
										{en ? '+110' : '+20,25'}
									</Chip>
								</Stack>
								{/* English store = SAT student (UI/UX persona, 18 Nov 2026): a section score out of 800, never TYT nets. */}
								<NetBars
									height={120}
									max={en ? 800 : 120}
									items={
										en
											? [
													['T2', 610],
													['T3', 650],
													['T4', 680],
													['T5', 720],
												]
											: [
													['D2', 64],
													['D3', 72],
													['D4', 78.5],
													['D5', 84.25],
												]
									}
								/>
							</Stack>
						</Card>
					) : null}
				</div>
			</UIProvider>
		</div>
	);
};

/** Free-standing UI card for the banners. */
const UICard: React.FC<{
	kind: 'week' | 'kpi' | 'kpi2' | 'today';
	left: number;
	top: number;
	scale: number;
	rotate: number;
	lang: Lang;
}> = ({kind, left, top, scale, rotate, lang}) => {
	const look = useLook();
	const en = lang === 'en';
	return (
		<div
			style={{
				position: 'absolute',
				left,
				top,
				transform: `rotate(${rotate}deg) scale(${scale})`,
				transformOrigin: 'top left',
				width: kind === 'today' ? 360 : 400,
			}}
		>
			<UIProvider lang={lang} mode="light">
				<div
					style={{
						...themeVars('light'),
						borderRadius: 26,
						background: '#FFFFFF',
						boxShadow: look.shadow,
						padding: kind === 'week' ? 14 : 0,
					}}
				>
					{kind === 'week' ? <WeekStrip /> : null}
					{kind === 'today' ? <TodayCard /> : null}
					{kind === 'kpi' ? <KpiCard icon="clock" label={en ? 'This week' : 'Bu hafta'} value={en ? '4 h 10 m' : '4 sa 10 dk'} delta={percent(22, lang)} /> : null}
					{kind === 'kpi2' ? <KpiCard icon="target" label={en ? 'Accuracy' : 'Doğru oranı'} value={percent(62, lang)} delta={percent(6, lang)} /> : null}
				</div>
			</UIProvider>
		</div>
	);
};

const Ground: React.FC<{children: React.ReactNode}> = ({children}) => {
	const look = useLook();
	return (
		<AbsoluteFill style={{background: look.bg, overflow: 'hidden'}}>
			{look.dots ? (
				<AbsoluteFill
					style={{
						backgroundImage: `radial-gradient(${look.dots} 3px, transparent 3.5px)`,
						backgroundSize: '56px 56px',
					}}
				/>
			) : null}
			{children}
		</AbsoluteFill>
	);
};

/**
 * Seritli: one ribbon through the whole gallery. Its wave is a function of the
 * shot index plus x / width, so the right edge of a shot meets the left edge
 * of the next one in every size. `y` and `amp` are in image pixels.
 */
const Ribbon: React.FC<{
	index: number;
	w: number;
	y: number;
	amp: number;
	thick: number;
}> = ({index, w, y, amp, thick}) => {
	const look = useLook();
	if (!look.ribbon) return null;
	const points = Array.from({length: 81}, (_, i) => {
		const x = (i / 80) * w;
		const t = index + x / w;
		return [x, y + amp * Math.sin(t * Math.PI * 0.9 + 0.6)] as const;
	});
	const d = points.map(([x, py], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${py.toFixed(1)}`).join(' ');
	return (
		<svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={w} height={1}>
			<path d={d} fill="none" stroke={look.ribbon.color} strokeWidth={thick} strokeLinecap="butt" />
			<path d={d} fill="none" stroke={look.ribbon.line} strokeWidth={thick * 0.06} strokeDasharray={`${thick * 0.5} ${thick * 0.35}`} />
		</svg>
	);
};

const Glow: React.FC<{x: number; y: number; d: number}> = ({x, y, d}) => {
	const look = useLook();
	return (
		<div
			style={{
				position: 'absolute',
				left: x - d / 2,
				top: y - d / 2,
				width: d,
				height: d,
				borderRadius: '50%',
				background: look.glow,
				filter: `blur(${d * 0.09}px)`,
			}}
		/>
	);
};

/* ------------------------------------------------------------------ portrait shots */

/** Phone shot on a 1206 × 2622 stage, fitted and centred in any portrait size (Android 9:16 gets side margins of ground). */
const PhoneShot: React.FC<{
	slide: StoreSlide;
	index: number;
	w: number;
	h: number;
	android: boolean;
	lang: Lang;
}> = ({slide, index, w, h, android, lang}) => {
	const stage = PHONE_STAGE;
	const {u, x0, y0} = fitStage(stage, w, h);
	const phone = phoneBox(android);
	return (
		<Ground>
			<TextArea text={stage.text} slide={slide} lang={lang} u={u} x0={x0} y0={y0} />
			<Glow x={w / 2} y={y0 + (phone.y + phone.height * 0.38) * u} d={1000 * u} />
			<Ribbon index={index} w={w} y={y0 + (phone.y + 80) * u} amp={55 * u} thick={120 * u} />
			<div style={{position: 'absolute', left: x0 + phone.x * u, top: y0 + phone.y * u}}>
				<Phone id={slide.screens.phone} width={phone.width * u} android={android} lang={lang} />
			</div>
			<Float kind={slide.float} at={stage.float} u={u} x0={x0} y0={y0} h={h} lang={lang} />
		</Ground>
	);
};

/** Headline and subline at a stage's text block. */
const TextArea: React.FC<{text: TextBlock; slide: StoreSlide; lang: Lang; u: number; x0: number; y0: number}> = ({text, slide, lang, u, x0, y0}) => {
	const look = useLook();
	return (
		<div style={{position: 'absolute', left: x0 + text.x * u, width: text.width * u, top: y0 + text.y * u}}>
			<Headline parts={words(slide.headline[lang])} size={text.size * u} />
			<div
				style={{
					marginTop: text.subGap * u,
					fontSize: text.subSize * u,
					fontWeight: 600,
					lineHeight: text.subLineHeight,
					color: look.sub,
					maxWidth: text.subWidth * u,
				}}
			>
				{slide.subline[lang]}
			</div>
		</div>
	);
};

/** The floating card: fixed left edge, width and baseline (its bottom), whatever its height. */
const Float: React.FC<{kind: Float; at: {x: number; width: number; bottom: number}; u: number; x0: number; y0: number; h: number; lang: Lang}> = ({kind, at, u, x0, y0, h, lang}) =>
	kind === 'none' ? null : (
		<div style={{position: 'absolute', left: x0 + at.x * u, bottom: h - (y0 + at.bottom * u)}}>
			<FloatCard kind={kind} width={at.width * u} lang={lang} />
		</div>
	);

/** iPad shot on a 2064 × 2752 stage: a landscape iPad with the tablet drawing; a slide without one shows the phone. */
const TabletShot: React.FC<{
	slide: StoreSlide;
	index: number;
	w: number;
	h: number;
	lang: Lang;
}> = ({slide, index, w, h, lang}) => {
	const stage = TABLET_STAGE;
	const {u, x0, y0} = fitStage(stage, w, h);
	const device = tabletStageDevice(Boolean(slide.screens.tablet));
	return (
		<Ground>
			<TextArea text={stage.text} slide={slide} lang={lang} u={u} x0={x0} y0={y0} />
			<Glow x={w / 2} y={y0 + (device.y + device.height * 0.55) * u} d={1600 * u} />
			<Ribbon index={index} w={w} y={y0 + 940 * u} amp={55 * u} thick={150 * u} />
			<div style={{position: 'absolute', left: x0 + device.x * u, top: y0 + device.y * u}}>{slide.screens.tablet ? <Tablet id={slide.screens.tablet} width={device.width * u} lang={lang} /> : <Phone id={slide.screens.phone} width={device.width * u} lang={lang} />}</div>
			{slide.screens.tablet ? <Float kind={slide.float} at={stage.float} u={u} x0={x0} y0={y0} h={h} lang={lang} /> : null}
		</Ground>
	);
};

/* ------------------------------------------------------------------ iPhone Duo */

/** The Duo drawing for a slide: outer display = f-dis-<phone>, inner display = f-ic-<web> (the test slide shows the scratch paper). */
const duoId = (slide: StoreSlide, inner: boolean): string => (inner ? (slide.screens.web === 'w-test-coz' ? 'f-ic-test-taslak' : `f-ic-${slide.screens.web.slice(2)}`) : `f-dis-${slide.screens.phone.slice(2)}`);

/**
 * iPhone Duo around a Duo drawing (sizes from the Xcode simulator, 19 Nov
 * 2026). Closed: an upright body (the outer display, 466 × 678) with the
 * spine on its leading edge. Open: the inner display (951 × 669) with the
 * hinge marked at the top and bottom of the frame. Same black frame as the
 * other devices.
 */
const Duo: React.FC<{id: string; width: number; lang: Lang; open?: boolean}> = ({id, width, lang, open}) => {
	const look = useLook();
	const bezel = width * (open ? 0.018 : 0.034);
	const inner = width - bezel * 2;
	const notch = {position: 'absolute', left: '50%', width: width * 0.012, marginLeft: -width * 0.006, height: bezel * 0.55, background: '#26262C', borderRadius: bezel} as const;
	return (
		<div style={{position: 'relative', width, borderRadius: width * (open ? 0.04 : 0.11), background: '#0B0B0F', padding: bezel, boxSizing: 'border-box', boxShadow: `${look.shadow}, inset 0 0 0 ${width * 0.004}px #3A3A40`}}>
			{open ? (
				<>
					<div style={{...notch, top: bezel * 0.22}} />
					<div style={{...notch, bottom: bezel * 0.22}} />
				</>
			) : (
				<div style={{position: 'absolute', left: 0, top: width * 0.12, bottom: width * 0.12, width: bezel * 0.45, borderRadius: bezel, background: 'linear-gradient(90deg, #3A3A42, #16161B)'}} />
			)}
			<div style={{borderRadius: width * (open ? 0.025 : 0.085), overflow: 'hidden'}}>
				<Drawing id={id} width={inner} lang={lang} />
			</div>
		</div>
	);
};

/**
 * Duo shot. Outer (closed, upright 1398 × 2034): the headline on top, the
 * closed Duo under it, as the iPhone pictures. Inner (open, landscape
 * 2853 × 2007): the headline on the leading side with a small closed Duo
 * under it (one phone, two displays), the open Duo on the trailing side.
 */
const DuoShot: React.FC<{slide: StoreSlide; index: number; w: number; h: number; lang: Lang; open: boolean}> = ({slide, index, w, h, lang, open}) => {
	const look = useLook();
	if (!open) {
		const u = w / 1398;
		// The whole device stays inside the picture (16 Nov rule): the closed Duo is
		// its frame (bezel 0.034 × width) around a 466 × 678 display; its bottom
		// sits GAP.bottom above the edge.
		const deviceWidth = 960 * u;
		const deviceHeight = deviceWidth * (1 - 2 * 0.034) * (UI_CANVAS.duoOuter.height / UI_CANVAS.duoOuter.width) + deviceWidth * 2 * 0.034;
		const deviceTop = h - GAP.bottom * u - deviceHeight;
		return (
			<Ground>
				<Glow x={w / 2} y={deviceTop + 700 * u} d={1300 * u} />
				<Ribbon index={index} w={w} y={h * 0.86} amp={40 * u} thick={100 * u} />
				<div style={{position: 'absolute', left: 100 * u, right: 100 * u, top: 150 * u, textAlign: 'center'}}>
					<Headline parts={words(slide.headline[lang])} size={92 * u} />
					<div style={{marginTop: 24 * u, fontSize: 40 * u, fontWeight: 600, lineHeight: 1.3, color: look.sub}}>{slide.subline[lang]}</div>
				</div>
				<div style={{position: 'absolute', left: (w - deviceWidth) / 2, top: deviceTop}}>
					<Duo id={duoId(slide, false)} width={deviceWidth} lang={lang} />
				</div>
			</Ground>
		);
	}
	const u = w / 2853;
	const deviceWidth = 1840 * u;
	const deviceLeft = w - deviceWidth - 110 * u;
	const deviceHeight = deviceWidth * (669 / 951);
	const deviceTop = (h - deviceHeight) / 2;
	const textWidth = deviceLeft - 2 * 110 * u;
	return (
		<Ground>
			<Glow x={deviceLeft + deviceWidth / 2} y={h / 2} d={2000 * u} />
			<Ribbon index={index} w={w} y={h * 0.82} amp={40 * u} thick={130 * u} />
			<div style={{position: 'absolute', left: 110 * u, width: textWidth, top: 260 * u}}>
				<Headline parts={words(slide.headline[lang])} size={120 * u} />
				<div style={{marginTop: 30 * u, fontSize: 44 * u, fontWeight: 600, lineHeight: 1.3, color: look.sub}}>{slide.subline[lang]}</div>
			</div>
			<div style={{position: 'absolute', left: 300 * u, bottom: 120 * u}}>
				<Duo id={duoId(slide, false)} width={400 * u} lang={lang} />
			</div>
			<div style={{position: 'absolute', left: deviceLeft, top: deviceTop}}>
				<Duo id={duoId(slide, true)} width={deviceWidth} lang={lang} open />
			</div>
		</Ground>
	);
};

/* ------------------------------------------------------------------ desktop (Chromebook, 16:9) */

const DesktopShot: React.FC<{
	slide: StoreSlide;
	index: number;
	w: number;
	lang: Lang;
}> = ({slide, index, w, lang}) => {
	const look = useLook();
	const u = w / 1920;
	return (
		<Ground>
			<div
				style={{
					position: 'absolute',
					left: 100 * u,
					width: 600 * u,
					top: 0,
					bottom: 0,
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					gap: 26 * u,
				}}
			>
				<Headline parts={words(slide.headline[lang])} size={78 * u} />
				<div
					style={{
						fontSize: 30 * u,
						fontWeight: 600,
						lineHeight: 1.3,
						color: look.sub,
					}}
				>
					{slide.subline[lang]}
				</div>
			</div>
			<Glow x={1300 * u} y={540 * u} d={900 * u} />
			<Ribbon index={index} w={w} y={1012 * u} amp={22 * u} thick={56 * u} />
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
				<div
					style={{
						position: 'absolute',
						left: 836 * u,
						top: 765 * u,
						width: 1150 * u,
						height: 1030 * u,
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
					}}
				>
					<Headline parts={words(STORE_CREATIVE.search.headline[lang])} size={200 * u} />
				</div>
			)}
			<Glow x={(textless ? 1920 : 2550) * u} y={1500 * u} d={1500 * u} />
			<div
				style={{
					position: 'absolute',
					left: (textless ? 1430 : 2060) * u,
					top: 360 * u,
				}}
			>
				<Phone id="m-hub-moduller" width={980 * u} lang={lang} />
			</div>
			<div
				style={{
					position: 'absolute',
					left: (textless ? 2150 : 2780) * u,
					top: 1180 * u,
				}}
			>
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
					<div
						style={{
							position: 'absolute',
							left: 1097 * u,
							top: 493 * u,
							width: 1646 * u,
							height: 661 * u,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<Headline parts={words(STORE_CREATIVE.header.headline[lang])} size={190 * u} align="center" />
					</div>
				</>
			)}
		</Ground>
	);
};

/* ------------------------------------------------------------------ universal 16:9 (header and search, 5244 × 2950) */

const Universal: React.FC<{
	w: number;
	phrase: 'header' | 'search';
	textless: boolean;
	lang: Lang;
}> = ({w, phrase, textless, lang}) => {
	const u = w / 5244;
	// safe area 1402 × 962 at (1921, 660): only the phrase lives there.
	return (
		<Ground>
			<Glow x={2622 * u} y={1475 * u} d={2200 * u} />
			<UICard kind="week" left={300 * u} top={360 * u} scale={4.2 * u} rotate={-4} lang={lang} />
			<UICard kind="kpi" left={420 * u} top={1640 * u} scale={3.8 * u} rotate={3} lang={lang} />
			<UICard kind="kpi2" left={3560 * u} top={300 * u} scale={3.8 * u} rotate={4} lang={lang} />
			<div style={{position: 'absolute', left: 3560 * u, top: 1250 * u}}>
				<FloatCard kind="nets" scale={4 * u} lang={lang} />
			</div>
			{textless ? (
				<UICard kind="today" left={1902 * u} top={700 * u} scale={4 * u} rotate={0} lang={lang} />
			) : (
				<div
					style={{
						position: 'absolute',
						left: 1921 * u,
						top: 660 * u,
						width: 1402 * u,
						height: 962 * u,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<Headline parts={words(STORE_CREATIVE[phrase].headline[lang])} size={250 * u} align="center" />
				</div>
			)}
		</Ground>
	);
};

/* ------------------------------------------------------------------ Google Play feature graphic (1024 × 500) */

const Feature: React.FC<{w: number; lang: Lang}> = ({w, lang}) => {
	const look = useLook();
	const u = w / 1024;
	return (
		<Ground>
			<div
				style={{
					position: 'absolute',
					left: 64 * u,
					top: 0,
					bottom: 0,
					width: 470 * u,
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					gap: 16 * u,
				}}
			>
				<Headline parts={words(FEATURE_GRAPHIC.headline[lang])} size={58 * u} />
				<div
					style={{
						fontSize: 21 * u,
						fontWeight: 600,
						color: look.sub,
						lineHeight: 1.35,
					}}
				>
					{FEATURE_GRAPHIC.subline[lang]}
				</div>
			</div>
			<UICard kind="today" left={600 * u} top={70 * u} scale={0.95 * u} rotate={-3} lang={lang} />
			<div style={{position: 'absolute', left: 690 * u, top: 300 * u}}>
				<FloatCard kind="step" scale={0.85 * u} lang={lang} />
			</div>
		</Ground>
	);
};

/**
 * A Google Play subscription icon: the store look's ground, the app's clock
 * mark, the exam in big type and, for KPSS, the level in the key-word box.
 * Everything sits inside the middle 72 % so a round crop keeps it whole.
 */
const SubscriptionIcon: React.FC<{w: number; product?: string}> = ({w, product}) => {
	const look = useLook();
	const item = SUBSCRIPTION_ICONS.find((icon) => icon.id === product);
	if (!item) throw new Error(`Bilinmeyen abonelik: ${product}`);
	const u = w / 1024;
	const level = 'level' in item ? item.level : undefined;
	const mark = staticFile('Brand/SinavikaIcon.svg');
	return (
		<Ground>
			<AbsoluteFill style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34 * u}}>
				<div style={{width: 190 * u, height: 190 * u, backgroundColor: '#FFFFFF', maskImage: `url("${mark}")`, WebkitMaskImage: `url("${mark}")`, maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskPosition: 'center'}} />
				<div style={{fontSize: (level ? 230 : 280) * u, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, color: look.ink}}>{item.exam}</div>
				{level ? (
					<div style={{fontSize: 92 * u, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1, color: look.markInk, background: look.markBg, borderRadius: 22 * u, padding: `${22 * u}px ${40 * u}px ${28 * u}px`}}>{level}</div>
				) : null}
			</AbsoluteFill>
		</Ground>
	);
};

export const StoreSet: React.FC<StoreSetProps> = ({look, kind, device, slide, textless, width, height, lang, screen, product}) => {
	const sixteenNine = Math.abs(width / height - 16 / 9) < 0.02;
	return (
		<VideoFrame themeId="SinavikaLight" lang={lang}>
			<LookContext.Provider value={LOOKS[look]}>
				{kind === 'shot' && device === 'desktop' ? <DesktopShot slide={STORE_SLIDES[slide]} index={slide} w={width} lang={lang} /> : null}
				{kind === 'shot' && (device === 'duoOuter' || device === 'duoInner') ? <DuoShot slide={STORE_SLIDES[slide]} index={slide} w={width} h={height} lang={lang} open={device === 'duoInner'} /> : null}
				{kind === 'shot' && device === 'ipad' ? <TabletShot slide={STORE_SLIDES[slide]} index={slide} w={width} h={height} lang={lang} /> : null}
				{kind === 'shot' && (device === 'iphone' || device === 'android') ? <PhoneShot slide={STORE_SLIDES[slide]} index={slide} w={width} h={height} android={device === 'android'} lang={lang} /> : null}
				{kind === 'search' && !sixteenNine ? <Search w={width} textless={textless} lang={lang} /> : null}
				{kind === 'header' && !sixteenNine ? <Header w={width} textless={textless} lang={lang} /> : null}
				{(kind === 'search' || kind === 'header') && sixteenNine ? <Universal w={width} phrase={kind} textless={textless} lang={lang} /> : null}
				{kind === 'feature' ? <Feature w={width} lang={lang} /> : null}
				{kind === 'subicon' ? <SubscriptionIcon w={width} product={product} /> : null}
				{kind === 'watch' && screen ? <WatchShot id={screen} w={width} lang={lang} /> : null}
			</LookContext.Provider>
		</VideoFrame>
	);
};
