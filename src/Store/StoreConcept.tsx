import React from 'react';
import {AbsoluteFill} from 'remotion';
import {VideoFrame} from '../Components/Layouts/VideoFrame';
import {themeVars, UIProvider} from '../UIUX/Context';
import {Icon} from '../UIUX/Icons';
import {Card, Chip, Stack, Text} from '../UIUX/Parts/Shared';
import {KpiCard, NetBars, TodayCard, WeekStrip} from '../UIUX/Parts/Study';
import {findScreen} from '../UIUX/Registry';
import type {StoreConceptProps} from './StoreProps';

/**
 * New store picture concepts (owner, 14 Nov 2026): a study app first, SinoAI
 * in the background. Three looks (defter: cream notebook with a highlighter
 * mark; turuncu: full brand orange; lacivert: navy with the dark-ground
 * orange #F97316) and four kinds: the first three iPhone shots, the iOS 27
 * search result (3:2, safe area 2168 × 1030 at 836, 765 on 3840 × 2560), the
 * product page header (21:9, safe area 1646 × 661 at 1097, 493 on
 * 3840 × 1646; no phone: the screenshots sit right below it) and the Google
 * Play feature graphic (1024 × 500, no device imagery, no white ground).
 * Phones show the current UI/UX drawings, the same ones the apps follow.
 */

type Look = {bg: string; ink: string; sub: string; accent: string; mark: string; glow: string; cardShadow: string; dots?: string};
const LOOKS: Record<StoreConceptProps['concept'], Look> = {
	defter: {bg: '#FFF7ED', ink: '#0B1C30', sub: '#475569', accent: '#C2410C', mark: 'rgba(251, 146, 60, 0.42)', glow: 'rgba(234, 88, 12, 0.14)', cardShadow: '0 40px 90px -30px rgba(120, 53, 15, 0.35)', dots: 'rgba(11, 28, 48, 0.08)'},
	turuncu: {bg: 'linear-gradient(160deg, #F97316 0%, #EA580C 45%, #C2410C 100%)', ink: '#FFFFFF', sub: 'rgba(255,255,255,0.88)', accent: '#FFFFFF', mark: 'rgba(11, 28, 48, 0.28)', glow: 'rgba(255, 255, 255, 0.18)', cardShadow: '0 40px 90px -30px rgba(67, 20, 7, 0.55)'},
	lacivert: {bg: 'radial-gradient(120% 80% at 70% 85%, #1E2A4A 0%, #0F172A 60%)', ink: '#FFFFFF', sub: '#CBD5E1', accent: '#F97316', mark: 'rgba(249, 115, 22, 0.35)', glow: 'rgba(249, 115, 22, 0.28)', cardShadow: '0 40px 90px -30px rgba(0, 0, 0, 0.7)'},
};

type Slide = {screen: string; title: [string, string, string]; titleEn: [string, string, string]; sub: string; subEn: string; float: 'today' | 'step' | 'nets'};
/** Headline in three parts: before, the marked words, after. */
const SLIDES: Slide[] = [
	{screen: 'm-hub-moduller', title: ['Bugün ', 'ne çalışacağını', ' bil'], titleEn: ['Know ', 'what to study', ' today'], sub: 'Planın her gün sıradaki işi önüne koyar.', subEn: 'Your plan puts the next task in front of you.', float: 'today'},
	{screen: 'm-ders-grupla', title: ['Konuyu ', 'adım adım', ' öğren'], titleEn: ['Learn it ', 'step by step', ''], sub: 'Kısa mikro dersler; her adımda sen de cevaplarsın.', subEn: 'Short micro-lessons where you answer every step.', float: 'step'},
	{screen: 'm-deneme-sonuclar', title: ['Denemeni çöz, ', 'netini', ' gör'], titleEn: ['Take mock exams, ', 'see your score', ''], sub: 'Türkiye geneli denemeler, net gelişimin ve eksik konuların.', subEn: 'Nationwide exams, your score trend and your gaps.', float: 'nets'},
];

/** Headline with the key words under a highlighter stroke. */
const Headline: React.FC<{parts: [string, string, string]; size: number; look: Look; align?: 'left' | 'center'}> = ({parts, size, look, align = 'left'}) => (
	<div style={{fontSize: size, fontWeight: 800, lineHeight: 1.06, letterSpacing: '-0.03em', color: look.ink, textAlign: align, textWrap: 'balance'}}>
		{parts[0]}
		<span style={{background: `linear-gradient(transparent 58%, ${look.mark} 58%, ${look.mark} 92%, transparent 92%)`, padding: '0 0.08em', margin: '0 -0.04em', color: look.accent === '#FFFFFF' ? look.ink : look.ink}}>{parts[1]}</span>
		{parts[2]}
	</div>
);

/** An iPhone (Dynamic Island) showing a UI/UX drawing. `width` is the outer width in px. */
const Phone: React.FC<{screen: string; width: number; tilt?: number; shadow: string; lang: 'tr' | 'en'}> = ({screen, width, tilt = 0, shadow, lang}) => {
	const {Component} = findScreen(screen);
	const bezel = width * 0.035;
	const inner = width - bezel * 2;
	const scale = inner / 390;
	const height = 844 * scale + bezel * 2;
	return (
		<div style={{width, height, borderRadius: width * 0.155, background: '#0B0B0F', padding: bezel, boxSizing: 'border-box', boxShadow: `${shadow}, inset 0 0 0 ${width * 0.006}px #3A3A40`, transform: tilt ? `rotate(${tilt}deg)` : undefined, position: 'relative'}}>
			<div style={{width: inner, height: 844 * scale, borderRadius: width * 0.125, overflow: 'hidden', position: 'relative', background: '#FFFFFF'}}>
				<div style={{width: 390, height: 844, transform: `scale(${scale})`, transformOrigin: 'top left'}}>
					<UIProvider lang={lang} mode="light">
						<div style={{...themeVars('light'), width: 390, height: 844}}>
							<Component />
						</div>
					</UIProvider>
				</div>
				<div style={{position: 'absolute', top: 11 * scale, left: '50%', width: 120 * scale, height: 35 * scale, marginLeft: -60 * scale, borderRadius: 20 * scale, background: '#000'}} />
			</div>
		</div>
	);
};

/** A piece of real UI floating off the phone, at UI scale `scale`. */
const Float: React.FC<{kind: Slide['float']; scale: number; shadow: string; lang: 'tr' | 'en'}> = ({kind, scale, shadow, lang}) => (
	<div style={{transform: `scale(${scale})`, transformOrigin: 'top left', width: kind === 'today' ? 360 : kind === 'nets' ? 360 : 330, filter: 'none'}}>
		<UIProvider lang={lang} mode="light">
			<div style={{...themeVars('light'), borderRadius: 26, boxShadow: shadow}}>
				{kind === 'today' ? <TodayCard /> : null}
				{kind === 'step' ? (
					<Card padding={16} radius={24}>
						<Stack row gap={12}>
							<div style={{width: 44, height: 44, borderRadius: 22, background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
								<Icon name="check" size={24} color="#FFFFFF" />
							</div>
							<Stack gap={2}>
								<Text role="section" size={18}>
									{lang === 'en' ? 'Correct!' : 'Doğru!'}
								</Text>
								<Text role="small">{lang === 'en' ? 'Comes back in 3 days to stick' : '3 gün sonra tekrar gelir, unutmazsın'}</Text>
							</Stack>
						</Stack>
					</Card>
				) : null}
				{kind === 'nets' ? (
					<Card padding={16} radius={24}>
						<Stack gap={10}>
							<Stack row justify="space-between">
								<Text role="headline" size={16}>
									{lang === 'en' ? 'My TYT nets' : 'TYT net gelişimim'}
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

const Ground: React.FC<{look: Look; children: React.ReactNode}> = ({look, children}) => (
	<AbsoluteFill style={{background: look.bg, overflow: 'hidden'}}>
		{look.dots ? <AbsoluteFill style={{backgroundImage: `radial-gradient(${look.dots} 3px, transparent 3.5px)`, backgroundSize: '56px 56px'}} /> : null}
		{children}
	</AbsoluteFill>
);

/* ------------------------------------------------------------------ iPhone screenshot */

/** Where the floating UI piece sits on a shot: left, top (px on 1206 wide), UI scale. It overlaps the phone's left edge. */
const FLOAT_AT: Record<Slide['float'], [number, number, number]> = {today: [36, 1560, 2.25], step: [36, 1420, 2.35], nets: [36, 1500, 2.2]};

const Shot: React.FC<{look: Look; slide: Slide; w: number; lang: 'tr' | 'en'}> = ({look, slide, w, lang}) => {
	const u = w / 1206;
	return (
		<Ground look={look}>
			<div style={{position: 'absolute', left: 96 * u, right: 96 * u, top: 170 * u}}>
				<Headline parts={lang === 'en' ? slide.titleEn : slide.title} size={124 * u} look={look} />
				<div style={{marginTop: 34 * u, fontSize: 46 * u, fontWeight: 600, lineHeight: 1.3, color: look.sub, maxWidth: 940 * u}}>{lang === 'en' ? slide.subEn : slide.sub}</div>
			</div>
			<div style={{position: 'absolute', left: (w - 1000 * u) / 2, top: 900 * u, width: 1000 * u, height: 1000 * u, borderRadius: '50%', background: look.glow, filter: `blur(${90 * u}px)`}} />
			<div style={{position: 'absolute', left: (w - 1000 * u) / 2 + 60 * u, top: 690 * u}}>
				<Phone screen={slide.screen} width={1000 * u} shadow={look.cardShadow} lang={lang} />
			</div>
			<div style={{position: 'absolute', left: FLOAT_AT[slide.float][0] * u, top: FLOAT_AT[slide.float][1] * u}}>
				<Float kind={slide.float} scale={FLOAT_AT[slide.float][2] * u} shadow={look.cardShadow} lang={lang} />
			</div>
		</Ground>
	);
};

/* ------------------------------------------------------------------ iOS 27 search result (3:2) */

const Search: React.FC<{look: Look; w: number; lang: 'tr' | 'en'}> = ({look, w, lang}) => {
	const u = w / 3840;
	// safe area 2168 × 1030 at (836, 765)
	return (
		<Ground look={look}>
			<div style={{position: 'absolute', left: 836 * u, top: 765 * u, width: 1150 * u, height: 1030 * u, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
				<Headline parts={lang === 'en' ? ['Study ', 'with a plan', ''] : ['Planlı çalış, ', 'netini', ' artır']} size={200 * u} look={look} />
			</div>
			<div style={{position: 'absolute', left: 2060 * u, top: 360 * u}}>
				<Phone screen="m-hub-moduller" width={980 * u} shadow={look.cardShadow} lang={lang} />
			</div>
			<div style={{position: 'absolute', left: 2780 * u, top: 1180 * u}}>
				<Float kind="nets" scale={2.2 * u} shadow={look.cardShadow} lang={lang} />
			</div>
		</Ground>
	);
};

/* ------------------------------------------------------------------ iOS 27 product page header (21:9) */

const Header: React.FC<{look: Look; w: number; lang: 'tr' | 'en'}> = ({look, w, lang}) => {
	const u = w / 3840;
	const card = (kind: 'week' | 'kpi' | 'kpi2', left: number, top: number, scale: number, rotate: number) => (
		<div style={{position: 'absolute', left: left * u, top: top * u, transform: `rotate(${rotate}deg) scale(${scale * u})`, transformOrigin: 'top left', width: 400}}>
			<UIProvider lang={lang} mode="light">
				<div style={{...themeVars('light'), borderRadius: 26, background: '#FFFFFF', boxShadow: look.cardShadow, padding: kind === 'week' ? 14 : 0}}>
					{kind === 'week' ? <WeekStrip /> : kind === 'kpi' ? <KpiCard icon="clock" label={lang === 'en' ? 'This week' : 'Bu hafta'} value={lang === 'en' ? '4 h 10 m' : '4 sa 10 dk'} delta="%22" /> : <KpiCard icon="target" label={lang === 'en' ? 'Accuracy' : 'Doğru oranı'} value="%62" delta="%6" />}
				</div>
			</UIProvider>
		</div>
	);
	// safe area 1646 × 661 at (1097, 493): only the phrase lives there; the cards are decoration and may crop.
	return (
		<Ground look={look}>
			{card('week', 120, 380, 2.6, -4)}
			{card('kpi', 120, 980, 2.2, 3)}
			{card('kpi2', 2900, 260, 2.3, 4)}
			<div style={{position: 'absolute', left: 2820 * u, top: 860 * u, transform: `rotate(-3deg) scale(${2.1 * u})`, transformOrigin: 'top left', width: 360}}>
				<UIProvider lang={lang} mode="light">
					<div style={{...themeVars('light'), borderRadius: 26, boxShadow: look.cardShadow}}>
						<TodayCard />
					</div>
				</UIProvider>
			</div>
			<div style={{position: 'absolute', left: 1097 * u, top: 493 * u, width: 1646 * u, height: 661 * u, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<Headline parts={lang === 'en' ? ['One step ', 'ahead', ' every day'] : ['Her gün ', 'bir adım', ' öne']} size={190 * u} look={look} align="center" />
			</div>
		</Ground>
	);
};

/* ------------------------------------------------------------------ Google Play feature graphic (1024 × 500) */

const Feature: React.FC<{look: Look; w: number; lang: 'tr' | 'en'}> = ({look, w, lang}) => {
	const u = w / 1024;
	return (
		<Ground look={look}>
			<div style={{position: 'absolute', left: 64 * u, top: 0, bottom: 0, width: 470 * u, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16 * u}}>
				<Headline parts={lang === 'en' ? ['Exam prep ', 'built around you', ''] : ['Sana göre ', 'sınav', ' hazırlığı']} size={58 * u} look={look} />
				<div style={{fontSize: 21 * u, fontWeight: 600, color: look.sub, lineHeight: 1.35}}>{lang === 'en' ? 'Lessons, quizzes, mock exams and a daily plan.' : 'Ders, test, deneme ve günlük plan.'}</div>
			</div>
			<div style={{position: 'absolute', left: 600 * u, top: 70 * u, transform: `rotate(-3deg) scale(${0.95 * u})`, transformOrigin: 'top left', width: 360}}>
				<UIProvider lang={lang} mode="light">
					<div style={{...themeVars('light'), borderRadius: 26, boxShadow: look.cardShadow}}>
						<TodayCard />
					</div>
				</UIProvider>
			</div>
			<div style={{position: 'absolute', left: 690 * u, top: 300 * u}}>
				<Float kind="step" scale={0.85 * u} shadow={look.cardShadow} lang={lang} />
			</div>
		</Ground>
	);
};

export const StoreConcept: React.FC<StoreConceptProps> = ({concept, kind, slide, width, lang}) => {
	const look = LOOKS[concept];
	return (
		<VideoFrame themeId="SinavikaLight" lang={lang}>
			{kind === 'shot' ? <Shot look={look} slide={SLIDES[slide]} w={width} lang={lang} /> : null}
			{kind === 'search' ? <Search look={look} w={width} lang={lang} /> : null}
			{kind === 'header' ? <Header look={look} w={width} lang={lang} /> : null}
			{kind === 'feature' ? <Feature look={look} w={width} lang={lang} /> : null}
		</VideoFrame>
	);
};
