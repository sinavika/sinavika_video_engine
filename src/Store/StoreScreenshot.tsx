import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {AppIcon} from '../Components/AppScreens/AppScreenParts';
import {APP_SCREENS} from '../Components/AppScreens/AppScreenRegistry';
import {PhoneFrame, TabletFrame, phoneHeight} from '../Components/AppScreens/PhoneFrame';
import {SinoAiScreen} from '../Components/AppScreens/Screens/AssistantScreens';
import {VideoFrame} from '../Components/Layouts/VideoFrame';
import {BRAND} from '../Configurations/Brand';
import {BRAND_COLORS} from '../Configurations/BrandColors';
import {Icon} from '../UIUX/Icons';
import {MODULES, type ModuleKey} from '../UIUX/ModuleIdentity';
import {FEATURE_GRAPHIC, STORE_CREATIVE, STORE_SLIDES, type StoreCreativeKind, type StoreLanguage, type StoreScreen, type StoreSlide, type StoreStyle} from './StoreListing';
import type {StoreScreenshotProps} from './StoreProps';

const {brand} = BRAND_COLORS;

/** Colours of each look. The wave runs on across the slides, so the set reads as one strip in the store. */
const LOOKS: Record<StoreStyle, {top: string; bottom: string; wave: string; waveSoft: string; ink: string; muted: string; accent: string; logo: string; chip: string; chipInk: string}> = {
	acik: {top: '#FFFFFF', bottom: '#FFF3EA', wave: brand.primary, waveSoft: brand.primaryDim, ink: brand.charcoal, muted: '#475569', accent: brand.primary, logo: brand.primary, chip: '#FFFFFF', chipInk: brand.charcoal},
	koyu: {top: brand.charcoal, bottom: '#1A2340', wave: brand.primary, waveSoft: '#FB923C', ink: '#FFFFFF', muted: '#CBD5E1', accent: '#FB923C', logo: '#FFFFFF', chip: 'rgba(255,255,255,0.1)', chipInk: '#FFFFFF'},
	turuncu: {top: brand.primary, bottom: brand.primaryContainer, wave: brand.charcoal, waveSoft: '#FDBA74', ink: '#FFFFFF', muted: '#FFEDD5', accent: brand.charcoal, logo: '#FFFFFF', chip: 'rgba(255,255,255,0.18)', chipInk: '#FFFFFF'},
};

/** The wave's upper edge at panorama position x (one unit per slide), as a share of the height. */
const waveEdge = (x: number, lift: number) => lift + 0.075 * Math.sin(x * 1.7 + 0.4) + 0.035 * Math.sin(x * 0.63 + 1.9);

const wavePath = (from: number, lift: number) => {
	const steps = 40;
	const points = Array.from({length: steps + 1}, (_, index) => {
		const x = from - 0.1 + (index / steps) * 1.2;
		return `${x.toFixed(4)} ${waveEdge(x, lift).toFixed(4)}`;
	});
	return `M${points.join(' L')} L${(from + 1.1).toFixed(4)} 1.2 L${(from - 0.1).toFixed(4)} 1.2 Z`;
};

/** The panorama background: this slide's part of one long wave. */
const Backdrop: React.FC<{look: StoreStyle; index: number; lift: number}> = ({look, index, lift}) => {
	const colors = LOOKS[look];
	return (
		<AbsoluteFill style={{background: `linear-gradient(180deg, ${colors.top} 0%, ${colors.bottom} 100%)`}}>
			<svg width="100%" height="100%" viewBox={`${index} 0 1 1`} preserveAspectRatio="none" style={{position: 'absolute', inset: 0}}>
				<path d={wavePath(index, lift - 0.045)} fill={colors.waveSoft} opacity={look === 'acik' ? 0.55 : 0.45} />
				<path d={wavePath(index, lift)} fill={colors.wave} />
			</svg>
		</AbsoluteFill>
	);
};

/** "Sınav hazırlığın *tek yerde*": the starred words in the accent colour. */
const Headline: React.FC<{text: string; size: number; color: string; accent: string; align: 'center' | 'left'}> = ({text, size, color, accent, align}) => (
	<div style={{fontSize: size, fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.025em', color, textAlign: align, textWrap: 'balance'}}>
		{text.split('*').map((part, index) => (
			<span key={`${index}-${part}`} style={{color: index % 2 === 1 ? accent : color}}>
				{part}
			</span>
		))}
	</div>
);

const Logo: React.FC<{height: number; color: string}> = ({height, color}) => {
	const source = staticFile(BRAND.logo.src);
	return (
		<div style={{position: 'relative', height, width: height * BRAND.logo.aspectRatio}}>
			<Img src={source} style={{position: 'absolute', width: '100%', height: '100%', opacity: 0}} />
			<div style={{position: 'absolute', inset: 0, backgroundColor: color, maskImage: `url("${source}")`, WebkitMaskImage: `url("${source}")`, maskSize: '100% 100%', WebkitMaskSize: '100% 100%'}} />
		</div>
	);
};

/**
 * Safe area: devices, badges and text stay this share of the width inside
 * the picture's sides, so no phone model or store frame crops them. Only the
 * phones' lower edge runs off the bottom, on purpose.
 */
const SAFE = 0.06;

/** Keeps a box of the given width inside the safe area. */
const clampX = (x: number, width: number, W: number) => Math.min(Math.max(x, W * SAFE), W * (1 - SAFE) - width);

/** The `tool` line: what the module does, on its own soft background with the module's icon. */
const ToolLine: React.FC<{tool: NonNullable<StoreSlide['tool']>; lang: StoreLanguage; look: StoreStyle; unit: number; align: 'center' | 'left'; maxWidth: number}> = ({tool, lang, look, unit, align, maxWidth}) => {
	const identity = MODULES[tool.module as ModuleKey];
	// SinoAI has no colour of its own: a neutral ink tile (white on the dark and orange looks).
	const sino = tool.module === 'sinoAi';
	const accent = sino ? (look === 'acik' ? '#1E293B' : '#FFFFFF') : identity.color.light;
	const fill = look === 'acik' ? '#FFFFFF' : look === 'koyu' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.16)';
	const ink = look === 'acik' ? brand.charcoal : '#FFFFFF';
	return (
		<div style={{display: 'flex', alignItems: 'center', gap: unit * 20, maxWidth, alignSelf: align === 'center' ? 'center' : 'flex-start', padding: `${unit * 20}px ${unit * 30}px ${unit * 20}px ${unit * 20}px`, borderRadius: unit * 30, background: fill, border: look === 'acik' ? `${unit * 2}px solid #FED7AA` : 'none', boxShadow: look === 'acik' ? `0 ${unit * 10}px ${unit * 30}px rgba(234, 88, 12, 0.10)` : 'none', boxSizing: 'border-box'}}>
			<div style={{width: unit * 64, height: unit * 64, borderRadius: unit * 20, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
				<Icon name={identity.icon} size={unit * 34} color={sino && look !== 'acik' ? '#1E293B' : '#FFFFFF'} />
			</div>
			<div style={{fontSize: unit * 31, fontWeight: 600, lineHeight: 1.35, color: ink, textAlign: 'left', textWrap: 'balance'}}>{tool.text[lang]}</div>
		</div>
	);
};

const Badge: React.FC<{icon: Parameters<typeof AppIcon>[0]['name']; text: string; size: number}> = ({icon, text, size}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: size * 0.45, padding: `${size * 0.42}px ${size * 0.7}px ${size * 0.42}px ${size * 0.42}px`, borderRadius: size * 2, backgroundColor: '#FFFFFF', boxShadow: `0 ${size * 0.5}px ${size * 1.6}px rgba(15, 23, 42, 0.22)`, whiteSpace: 'nowrap'}}>
		<div style={{width: size * 1.9, height: size * 1.9, borderRadius: size, backgroundColor: brand.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
			<AppIcon name={icon} size={size * 1.1} color="#FFFFFF" />
		</div>
		<div style={{fontSize: size, fontWeight: 800, color: brand.charcoal, letterSpacing: '-0.01em'}}>{text}</div>
	</div>
);

const ScreenFor: React.FC<{screen: StoreScreen; lang: StoreLanguage}> = ({screen, lang}) => {
	if (typeof screen === 'string') {
		const Component = APP_SCREENS[screen].Component;
		return <Component />;
	}
	return <SinoAiScreen chat={screen.sinoAi[lang]} />;
};

/** Proof points floating by the phone cluster of the App Store creative. */
const CREATIVE_BADGES: Record<StoreCreativeKind, readonly {icon: Parameters<typeof AppIcon>[0]['name']; text: Record<StoreLanguage, string>}[]> = {
	header: [
		{icon: 'flame', text: {tr: '5 günlük seri', en: '5-day streak'}},
		{icon: 'chart', text: {tr: 'Son deneme +6,5 net', en: 'Last exam +6.5 points'}},
	],
	search: [
		{icon: 'checklist', text: {tr: 'Bugünün planı hazır', en: "Today's plan is ready"}},
		{icon: 'sparkles', text: {tr: 'SinoAI adım adım anlatır', en: 'SinoAI explains step by step'}},
	],
};

/**
 * App Store creative (header and search results, iOS 27+): wide artwork, copy on
 * the left and three phones on the right. Without copy, the phones move to the
 * middle so Apple's own text can sit on either side.
 */
const StoreCreative: React.FC<StoreScreenshotProps & {kind: StoreCreativeKind}> = ({kind, lang, look, textless, width: W, height: H}) => {
	const colors = LOOKS[look];
	const copy = STORE_CREATIVE[kind];
	const unit = H / 1000;
	// The phones fill most of the height; on 21:9 the picture is lower, so they are a little taller relative to it.
	const front = Math.min((H * 0.86) / phoneHeight(1), W * 0.23);
	const side = front * 0.84;
	const centre = textless ? W * 0.5 : W * 0.66;
	const top = Math.max(H * 0.07, (H - phoneHeight(front)) * 0.42);
	const textW = centre - side * 1.62 - W * 0.1;
	const badges = CREATIVE_BADGES[kind];
	const badgeSize = unit * 30;
	// Badge width estimate (icon disc + text), to keep the second one inside the picture.
	const badgeWidth = (text: string) => badgeSize * (3.3 + 0.56 * text.length);
	const secondText = badges[1].text[lang];
	return (
		<VideoFrame themeId="SinavikaLight">
			<Backdrop look={look} index={kind === 'header' ? 0 : 3} lift={0.74} />
			<div style={{position: 'absolute', left: centre - side * 1.42, top: top + H * 0.09, transform: 'rotate(-7deg)'}}>
				<PhoneFrame width={side} lang={lang}>
					<ScreenFor screen={copy.screens[1]} lang={lang} />
				</PhoneFrame>
			</div>
			<div style={{position: 'absolute', left: centre + side * 0.42, top: top + H * 0.09, transform: 'rotate(7deg)'}}>
				<PhoneFrame width={side} lang={lang}>
					<ScreenFor screen={copy.screens[2]} lang={lang} />
				</PhoneFrame>
			</div>
			<div style={{position: 'absolute', left: centre - front / 2, top}}>
				<PhoneFrame width={front} lang={lang}>
					<ScreenFor screen={copy.screens[0]} lang={lang} />
				</PhoneFrame>
			</div>
			<div style={{position: 'absolute', left: textless ? centre - side * 1.9 : centre - side * 1.58, top: top + H * 0.14}}>
				<Badge icon={badges[0].icon} text={badges[0].text[lang]} size={badgeSize} />
			</div>
			<div style={{position: 'absolute', left: Math.min(centre + side * 0.15, W * (1 - SAFE) - badgeWidth(secondText)), top: Math.min(top + phoneHeight(front) * 0.82, H * 0.86)}}>
				<Badge icon={badges[1].icon} text={secondText} size={badgeSize} />
			</div>
			{textless ? null : (
				<div style={{position: 'absolute', left: W * 0.065, top: H * 0.13, width: textW, display: 'flex', flexDirection: 'column', gap: unit * 36}}>
					<Logo height={unit * 66} color={colors.logo} />
					<Headline text={copy.headline[lang]} size={Math.min(unit * 96, textW * 0.115)} color={colors.ink} accent={colors.accent} align="left" />
					<div style={{fontSize: Math.min(unit * 38, textW * 0.046), fontWeight: 500, lineHeight: 1.4, color: colors.muted, textWrap: 'balance'}}>{copy.subline[lang]}</div>
				</div>
			)}
		</VideoFrame>
	);
};

/** One store picture. Everything is sized from the picture, so one design serves every store size. */
export const StoreScreenshot: React.FC<StoreScreenshotProps> = (props) => {
	const {lang, look, platform, device, width: W, height: H} = props;
	if (device === 'header' || device === 'search') return <StoreCreative {...props} kind={device} />;
	const colors = LOOKS[look];
	const feature = device === 'feature';
	const slide = STORE_SLIDES[props.slide];
	const headline = feature ? FEATURE_GRAPHIC.headline[lang] : slide.headline[lang];
	const subline = feature ? FEATURE_GRAPHIC.subline[lang] : slide.subline[lang];
	const screens: readonly StoreScreen[] = feature ? FEATURE_GRAPHIC.screens : slide.screens;
	const variant = platform === 'android' ? 'android' : 'ios';
	const landscape = W > H;

	if (landscape) {
		// Desktop (Chromebook) shots and the feature graphic: copy on the left, devices on the right.
		const unit = H / 1000;
		const phoneW = (feature ? 1.05 : 0.86) * H / 2.16;
		const pair = screens.length > 1;
		return (
			<VideoFrame themeId="SinavikaLight">
				<Backdrop look={look} index={feature ? 0 : props.slide} lift={feature ? 0.86 : 0.82} />
				<AbsoluteFill style={{flexDirection: 'row', alignItems: 'center', padding: `0 ${W * 0.07}px`}}>
					<div style={{width: W * (feature ? 0.42 : 0.42), display: 'flex', flexDirection: 'column', gap: unit * 34}}>
						{feature || slide.logo ? <Logo height={unit * (feature ? 70 : 64)} color={colors.logo} /> : null}
						<Headline text={headline} size={unit * (feature ? 92 : 78)} color={colors.ink} accent={colors.accent} align="left" />
						<div style={{fontSize: unit * (feature ? 40 : 34), fontWeight: 500, lineHeight: 1.4, color: colors.muted}}>{subline}</div>
						{!feature && slide.tool ? <ToolLine tool={slide.tool} lang={lang} look={look} unit={unit * 0.92} align="left" maxWidth={W * 0.42} /> : null}
					</div>
				</AbsoluteFill>
				<div style={{position: 'absolute', left: W * (1 - SAFE) - phoneW * (pair ? 1.84 : 1.42), top: H * (feature ? 0.14 : 0.08), width: W * 0.4, height: H}}>
					{pair ? (
						<>
							<div style={{position: 'absolute', left: 0, top: H * 0.07, transform: 'rotate(-6deg)'}}>
								<PhoneFrame width={phoneW * 0.92} lang={lang} variant={variant}>
									<ScreenFor screen={screens[1]} lang={lang} />
								</PhoneFrame>
							</div>
							<div style={{position: 'absolute', left: phoneW * 0.78, top: 0, transform: 'rotate(4deg)'}}>
								<PhoneFrame width={phoneW} lang={lang} variant={variant}>
									<ScreenFor screen={screens[0]} lang={lang} />
								</PhoneFrame>
							</div>
						</>
					) : (
						<div style={{position: 'absolute', left: phoneW * 0.42, top: 0}}>
							<PhoneFrame width={phoneW} lang={lang} variant={variant}>
								<ScreenFor screen={screens[0]} lang={lang} />
							</PhoneFrame>
						</div>
					)}
					{!feature && slide.badge ? (
						<div style={{position: 'absolute', left: -phoneW * 0.25, top: H * 0.58}}>
							<Badge icon={slide.badge.icon} text={slide.badge.text[lang]} size={unit * 30} />
						</div>
					) : null}
				</div>
			</VideoFrame>
		);
	}

	// Portrait: phones and tablets. Sizes follow the shorter of width and a 9:16 height, so text fits tall and wide shapes alike.
	const base = Math.min(W, H / 1.78);
	const unit = base / 1000;
	const tablet = device === 'tablet';
	const pair = screens.length > 1;
	const textTop = H * 0.055 + (slide.logo ? 0 : unit * 20);
	const logoBlock = slide.logo ? unit * 110 : 0;
	const chipsBlock = slide.chips ? unit * 100 : 0;
	const toolBlock = slide.tool ? unit * 170 : 0;
	const deviceTop = textTop + logoBlock + unit * 410 + chipsBlock + toolBlock;
	const left = props.slide % 2 === 0;

	let devices: React.ReactNode;
	let badgeAt = {x: 0, y: 0};
	if (tablet) {
		const available = H - deviceTop;
		const tabletW = Math.min(W * (pair ? 0.76 : 1 - SAFE * 2), (available * 1.12) * props.tabletAspect);
		const tabletH = tabletW / props.tabletAspect;
		const x = pair ? W * SAFE * 1.2 : (W - tabletW) / 2;
		devices = (
			<>
				<div style={{position: 'absolute', left: x, top: deviceTop}}>
					<TabletFrame width={tabletW} height={tabletH} canvasWidth={props.canvasWidth} lang={lang}>
						<ScreenFor screen={screens[0]} lang={lang} />
					</TabletFrame>
				</div>
				{pair ? (
					<div style={{position: 'absolute', left: W * (1 - SAFE) - tabletW * 0.38, top: deviceTop + tabletH * 0.3, transform: 'rotate(4deg)'}}>
						<PhoneFrame width={tabletW * 0.36} lang={lang} variant={variant}>
							<ScreenFor screen={screens[1]} lang={lang} />
						</PhoneFrame>
					</div>
				) : null}
			</>
		);
		badgeAt = {x: left ? x : x + tabletW * 0.5, y: deviceTop - unit * 66};
	} else if (pair) {
		const phoneW = W * 0.5;
		devices = (
			<>
				<div style={{position: 'absolute', left: W * SAFE * 1.3, top: deviceTop + unit * 90, transform: 'rotate(-6deg)'}}>
					<PhoneFrame width={phoneW * 0.94} lang={lang} variant={variant}>
						<ScreenFor screen={screens[1]} lang={lang} />
					</PhoneFrame>
				</div>
				<div style={{position: 'absolute', left: W * (1 - SAFE * 1.3) - phoneW, top: deviceTop, transform: 'rotate(4deg)'}}>
					<PhoneFrame width={phoneW} lang={lang} variant={variant}>
						<ScreenFor screen={screens[0]} lang={lang} />
					</PhoneFrame>
				</div>
			</>
		);
		badgeAt = {x: W * SAFE, y: deviceTop + unit * 20};
	} else {
		const phoneW = Math.min(W * 0.72, ((H - deviceTop) * 1.18) / 2.16);
		const x = (W - phoneW) / 2;
		devices = (
			<div style={{position: 'absolute', left: x, top: deviceTop}}>
				<PhoneFrame width={phoneW} lang={lang} variant={variant}>
					<ScreenFor screen={screens[0]} lang={lang} />
				</PhoneFrame>
			</div>
		);
		// On the phone's top edge, over the gap above it: never on the screen's content.
		badgeAt = {x: left ? x - unit * 40 : x + phoneW * 0.3, y: deviceTop - unit * 66};
	}
	// Badges never leave the safe area (width estimated from the text).
	const badgeText = slide.badge ? slide.badge.text[lang] : '';
	badgeAt = {x: clampX(badgeAt.x, unit * 34 * (3.3 + 0.56 * badgeText.length), W), y: badgeAt.y};

	return (
		<VideoFrame themeId="SinavikaLight">
			<Backdrop look={look} index={props.slide} lift={tablet ? 0.62 : 0.58} />
			<div style={{position: 'absolute', left: 0, right: 0, top: textTop, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: unit * 28, padding: `0 ${W * SAFE * 1.2}px`}}>
				{slide.logo ? <Logo height={unit * 80} color={colors.logo} /> : null}
				<Headline text={headline} size={unit * 92} color={colors.ink} accent={colors.accent} align="center" />
				<div style={{fontSize: unit * 40, fontWeight: 600, lineHeight: 1.4, color: colors.muted, textAlign: 'center', maxWidth: base * 0.86, textWrap: 'balance'}}>{subline}</div>
				{slide.tool ? <ToolLine tool={slide.tool} lang={lang} look={look} unit={unit} align="center" maxWidth={Math.min(W * (1 - SAFE * 2), base * 0.92)} /> : null}
				{slide.chips ? (
					<div style={{display: 'flex', gap: unit * 16, flexWrap: 'wrap', justifyContent: 'center'}}>
						{slide.chips[lang].map((chip) => (
							<div key={chip} style={{padding: `${unit * 14}px ${unit * 26}px`, borderRadius: 999, backgroundColor: colors.chip, border: look === 'acik' ? `${unit * 2}px solid #FED7AA` : 'none', fontSize: unit * 32, fontWeight: 700, color: colors.chipInk}}>
								{chip}
							</div>
						))}
					</div>
				) : null}
			</div>
			{devices}
			{slide.badge ? (
				<div style={{position: 'absolute', left: badgeAt.x, top: badgeAt.y}}>
					<Badge icon={slide.badge.icon} text={slide.badge.text[lang]} size={unit * 34} />
				</div>
			) : null}
		</VideoFrame>
	);
};
