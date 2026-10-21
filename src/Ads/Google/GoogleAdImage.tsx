import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {UIProvider, useT} from '../../UIUX/Context';
import {Icon} from '../../UIUX/Icons';
import type {ModuleKey} from '../../UIUX/ModuleIdentity';
import {Logo} from '../../UIUX/Parts/Shared';
import {DeviceBrowser, DevicePhone} from '../../UIUX/Parts/Web';
import {AdMobileScreen, AdWebScreen} from './AdScreens';
import {findConcept, PLATFORM_LINE, type AdConcept, type AdFormat, type AdPlatform} from './GoogleAdsPlan';
import type {GoogleAdImageProps, GoogleAdLayerProps, GoogleAdLogoProps} from './GoogleAdsProps';
import {ExamTag} from './ExamTag';
import {ProofCard} from './ProofCard';

/**
 * A Google Ads picture. One idea per picture: a short hook, one supporting
 * line, the real product in a phone or a browser, and the proof card that
 * makes the hook believable at a glance. The ground is the module's colour,
 * so each concept is recognisable in rotation and stands out on white pages.
 * No buttons, prices or contact details on the picture; text stays within
 * about a fifth of the area.
 */

/** Ground per module: its identity colour, deepened so white text and the white card sit well. SinoAI is neutral ink. */
const GROUND: Record<ModuleKey, [string, string]> = {
	exam: ['#F26B1D', '#C2410C'],
	lessons: ['#0EA5E9', '#0369A1'],
	tests: ['#6366F1', '#3730A3'],
	studyPlan: ['#14B8A6', '#0F766E'],
	smartSummary: ['#8B5CF6', '#5B21B6'],
	flashcards: ['#EC4899', '#9D174D'],
	sinoAi: ['#334155', '#0F172A'],
};

type Box = {x: number; y: number; w: number};
type Layout = {pad: number; logo: number; head: number; sub: number; textW: number; device: Box; proof: Box & {scale: number}; line: number; lineY?: number; rotate?: number};

/** Positions per format, platform and copy; tuned by eye on the rendered set. */
const LAYOUT: Record<AdFormat, Record<AdPlatform, {copy: Layout; bare: Layout}>> = {
	yatay: {
		mobile: {
			copy: {pad: 64, logo: 28, head: 60, sub: 24, textW: 540, line: 21, device: {x: 862, y: 58, w: 290}, proof: {x: 596, y: 262, w: 440, scale: 0.78}, rotate: 4},
			bare: {pad: 0, logo: 0, head: 0, sub: 0, textW: 0, line: 0, device: {x: 690, y: 46, w: 330}, proof: {x: 170, y: 150, w: 440, scale: 1}, rotate: 4},
		},
		web: {
			copy: {pad: 64, logo: 28, head: 56, sub: 23, textW: 470, line: 21, device: {x: 600, y: 96, w: 720}, proof: {x: 560, y: 300, w: 440, scale: 0.7}},
			bare: {pad: 0, logo: 0, head: 0, sub: 0, textW: 0, line: 0, device: {x: 330, y: 70, w: 900}, proof: {x: 60, y: 210, w: 440, scale: 0.9}},
		},
	},
	kare: {
		mobile: {
			copy: {pad: 84, logo: 34, head: 84, sub: 32, textW: 940, line: 26, device: {x: 660, y: 492, w: 430}, proof: {x: 84, y: 640, w: 440, scale: 1.18}, rotate: 4},
			bare: {pad: 0, logo: 0, head: 0, sub: 0, textW: 0, line: 0, device: {x: 560, y: 110, w: 560}, proof: {x: 64, y: 330, w: 440, scale: 1.4}, rotate: 4},
		},
		web: {
			copy: {pad: 84, logo: 34, head: 84, sub: 32, textW: 940, line: 26, device: {x: 330, y: 560, w: 1000}, proof: {x: 84, y: 720, w: 440, scale: 1.08}},
			bare: {pad: 0, logo: 0, head: 0, sub: 0, textW: 0, line: 0, device: {x: 230, y: 420, w: 1100}, proof: {x: 64, y: 90, w: 440, scale: 1.3}},
		},
	},
	dikey: {
		mobile: {
			copy: {pad: 84, logo: 34, head: 92, sub: 34, textW: 980, line: 27, device: {x: 640, y: 600, w: 480}, proof: {x: 84, y: 800, w: 440, scale: 1.25}, rotate: 4},
			bare: {pad: 0, logo: 0, head: 0, sub: 0, textW: 0, line: 0, device: {x: 500, y: 130, w: 660}, proof: {x: 56, y: 470, w: 440, scale: 1.55}, rotate: 4},
		},
		web: {
			copy: {pad: 84, logo: 34, head: 92, sub: 34, textW: 980, line: 27, device: {x: 300, y: 610, w: 1040}, proof: {x: 84, y: 800, w: 440, scale: 1.18}},
			bare: {pad: 0, logo: 0, head: 0, sub: 0, textW: 0, line: 0, device: {x: 170, y: 560, w: 1250}, proof: {x: 64, y: 150, w: 440, scale: 1.5}},
		},
	},
};

/** The device with the concept's screen. */
const Device: React.FC<{concept: AdConcept; platform: AdPlatform; width: number; rotate?: number}> = ({concept, platform, width, rotate}) =>
	platform === 'mobile' ? (
		<DevicePhone width={width} rotate={rotate}>
			<AdMobileScreen concept={concept} />
		</DevicePhone>
	) : (
		<DeviceBrowser width={width} title="sinavika.com">
			<AdWebScreen concept={concept} />
		</DeviceBrowser>
	);

const Ground: React.FC<{module: ModuleKey}> = ({module}) => {
	const [from, to] = GROUND[module];
	return (
		<AbsoluteFill style={{background: `linear-gradient(150deg, ${from} 0%, ${to} 100%)`, overflow: 'hidden'}}>
			<div style={{position: 'absolute', width: '90%', aspectRatio: '1', right: '-30%', top: '-45%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 68%)'}} />
			<div style={{position: 'absolute', width: '70%', aspectRatio: '1', left: '-28%', bottom: '-40%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0) 70%)'}} />
		</AbsoluteFill>
	);
};

const Picture: React.FC<GoogleAdImageProps> = ({exam, concept: conceptId, platform, format, textless}) => {
	const t = useT();
	const concept = findConcept(exam, conceptId);
	const layout = LAYOUT[format][platform][textless ? 'bare' : 'copy'];
	const {device, proof} = layout;
	return (
		<AbsoluteFill>
			<Ground module={concept.module} />
			<div style={{position: 'absolute', left: device.x, top: device.y, filter: 'drop-shadow(0 40px 60px rgba(2, 8, 23, 0.35))'}}>
				<Device concept={concept} platform={platform} width={device.w} rotate={layout.rotate} />
			</div>
			<ProofCard proof={concept.proof} width={proof.w} scale={proof.scale} style={{left: proof.x, top: proof.y}} />
			{textless ? null : (
				<div style={{position: 'absolute', left: layout.pad, top: layout.pad, width: layout.textW, display: 'flex', flexDirection: 'column'}}>
					<Logo wordmark height={layout.logo} color="#FFFFFF" />
					<div style={{marginTop: layout.head * 0.42}}>
						<ExamTag exam={exam} size={layout.sub * 0.78} maxWidth={layout.textW} />
					</div>
					<div style={{marginTop: layout.head * 0.3, fontSize: layout.head, fontWeight: 800, lineHeight: 1.04, letterSpacing: '-0.035em', color: '#FFFFFF', textWrap: 'balance'}}>{t(concept.headline)}</div>
					<div style={{marginTop: layout.sub * 0.7, fontSize: layout.sub, fontWeight: 600, lineHeight: 1.32, color: 'rgba(255,255,255,0.88)', textWrap: 'pretty'}}>{t(concept.subline)}</div>
					<div style={{display: 'flex', alignItems: 'center', gap: layout.line * 0.45, marginTop: layout.sub * 1.1, fontSize: layout.line, fontWeight: 800, color: '#FFFFFF'}}>
						<Icon name={platform === 'mobile' ? 'phone' : 'globe'} size={layout.line * 1.15} color="#FFFFFF" stroke={2.2} />
						{t(PLATFORM_LINE[platform])}
					</div>
				</div>
			)}
		</AbsoluteFill>
	);
};

export const GoogleAdImage: React.FC<GoogleAdImageProps> = (props) => (
	<UIProvider lang={props.lang} mode="light">
		<Picture {...props} />
	</UIProvider>
);

/** HTML5 layers: the device alone, or the proof card alone, on transparency. */
export const GoogleAdLayer: React.FC<GoogleAdLayerProps> = ({lang, exam, concept: conceptId, platform, layer}) => {
	const concept = findConcept(exam, conceptId);
	return (
		<UIProvider lang={lang} mode="light">
			<AbsoluteFill style={{backgroundColor: 'transparent'}}>
				{layer === 'device' ? <Device concept={concept} platform={platform} width={platform === 'mobile' ? 300 : 640} /> : <ProofCard proof={concept.proof} width={440} style={{left: 20, top: 10}} />}
			</AbsoluteFill>
		</UIProvider>
	);
};

/** Logo assets for the campaign: square (icon on orange) and landscape 4:1 (lock-up on white). */
export const GoogleAdLogo: React.FC<GoogleAdLogoProps> = ({kind}) =>
	kind === 'kare' ? (
		<AbsoluteFill style={{background: '#EA580C', alignItems: 'center', justifyContent: 'center'}}>
			<Img src={staticFile('Brand/SinavikaIcon.svg')} style={{width: '58%', height: '58%', objectFit: 'contain'}} />
		</AbsoluteFill>
	) : (
		<AbsoluteFill style={{background: '#FFFFFF', alignItems: 'center', justifyContent: 'center'}}>
			<Logo height={150} color="#EA580C" />
		</AbsoluteFill>
	);

