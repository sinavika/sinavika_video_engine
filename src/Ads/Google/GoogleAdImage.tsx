import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {UIProvider, useT} from '../../UIUX/Context';
import {Icon} from '../../UIUX/Icons';
import {Logo} from '../../UIUX/Parts/Shared';
import {DeviceBrowser, DevicePhone} from '../../UIUX/Parts/Web';
import {AdMobileScreen, AdWebScreen} from './AdScreens';
import {adGroundOf} from './AdGround';
import {findConcept, PLATFORM_LINE, type AdConcept, type AdFormat, type AdPlatform} from './GoogleAdsPlan';
import type {GoogleAdImageProps, GoogleAdLayerProps, GoogleAdLogoProps} from './GoogleAdsProps';
import {ExamTag} from './ExamTag';
import {ProofCard} from './ProofCard';

/**
 * A Google Ads picture. One idea per picture: a short hook, one supporting
 * line, the real product in a phone or a browser, and the proof card that
 * makes the hook believable at a glance. The ground is brand orange or
 * brand navy (AdGround), alternating by concept, with the white logo.
 * No buttons, prices or contact details on the picture; text stays within
 * about a fifth of the area.
 */

type Box = {x: number; y: number; w: number};
type Layout = {pad: number; logo: number; head: number; sub: number; textW: number; device: Box; proof: (Box & {scale: number}) | null; line: number; rotate?: number};

/**
 * Positions per format, platform and copy, in pixels of the 1200-wide picture.
 * Nothing lies over text (owner, 30 Oct 2026: "yazılar üst üste binmiş"): the
 * copy keeps the top (or the left column), and the device and the proof card
 * sit side by side under it, never over each other, and whole inside the
 * picture (a phone running off the edge cut its menu). Where no proof card
 * fits beside the device, there is none.
 */
const LAYOUT: Record<AdFormat, Record<AdPlatform, {copy: Layout; bare: Layout}>> = {
	yatay: {
		mobile: {
			copy: {pad: 56, logo: 36, head: 56, sub: 22, textW: 500, line: 20, device: {x: 900, y: 40, w: 250}, proof: {x: 586, y: 300, w: 440, scale: 0.64}, rotate: 4},
			bare: {pad: 0, logo: 0, head: 0, sub: 0, textW: 0, line: 0, device: {x: 760, y: 30, w: 260}, proof: {x: 150, y: 150, w: 440, scale: 1}, rotate: 4},
		},
		web: {
			copy: {pad: 56, logo: 36, head: 52, sub: 21, textW: 470, line: 20, device: {x: 580, y: 110, w: 580}, proof: null},
			bare: {pad: 0, logo: 0, head: 0, sub: 0, textW: 0, line: 0, device: {x: 360, y: 44, w: 800}, proof: {x: 40, y: 190, w: 440, scale: 0.62}},
		},
	},
	kare: {
		mobile: {
			copy: {pad: 84, logo: 46, head: 84, sub: 32, textW: 1000, line: 26, device: {x: 770, y: 600, w: 260}, proof: {x: 84, y: 650, w: 440, scale: 1.2}, rotate: 4},
			bare: {pad: 0, logo: 0, head: 0, sub: 0, textW: 0, line: 0, device: {x: 640, y: 60, w: 490}, proof: {x: 64, y: 420, w: 440, scale: 1.05}, rotate: 4},
		},
		web: {
			copy: {pad: 84, logo: 46, head: 84, sub: 32, textW: 1000, line: 26, device: {x: 580, y: 660, w: 560}, proof: {x: 84, y: 660, w: 440, scale: 1.05}},
			bare: {pad: 0, logo: 0, head: 0, sub: 0, textW: 0, line: 0, device: {x: 64, y: 460, w: 1072}, proof: {x: 64, y: 80, w: 440, scale: 1.1}},
		},
	},
	dikey: {
		mobile: {
			copy: {pad: 84, logo: 46, head: 92, sub: 34, textW: 1030, line: 27, device: {x: 720, y: 640, w: 380}, proof: {x: 84, y: 700, w: 440, scale: 1.2}, rotate: 4},
			bare: {pad: 0, logo: 0, head: 0, sub: 0, textW: 0, line: 0, device: {x: 545, y: 70, w: 610}, proof: {x: 56, y: 560, w: 440, scale: 0.98}, rotate: 4},
		},
		web: {
			copy: {pad: 84, logo: 46, head: 92, sub: 34, textW: 1030, line: 27, device: {x: 270, y: 1040, w: 660}, proof: {x: 84, y: 690, w: 440, scale: 1.1}},
			bare: {pad: 0, logo: 0, head: 0, sub: 0, textW: 0, line: 0, device: {x: 64, y: 640, w: 1072}, proof: {x: 64, y: 110, w: 440, scale: 1.4}},
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

const Ground: React.FC<{concept: AdConcept}> = ({concept}) => {
	const [from, to] = adGroundOf(concept);
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
			<Ground concept={concept} />
			<div style={{position: 'absolute', left: device.x, top: device.y, filter: 'drop-shadow(0 40px 60px rgba(2, 8, 23, 0.35))'}}>
				<Device concept={concept} platform={platform} width={device.w} rotate={layout.rotate} />
			</div>
			{proof ? <ProofCard proof={concept.proof} width={proof.w} scale={proof.scale} style={{left: proof.x, top: proof.y}} /> : null}
			{textless ? null : (
				<div style={{position: 'absolute', left: layout.pad, top: layout.pad, width: layout.textW, display: 'flex', flexDirection: 'column'}}>
					<Logo height={layout.logo} color="#FFFFFF" />
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

