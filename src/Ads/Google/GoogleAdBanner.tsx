import React from 'react';
import {AbsoluteFill} from 'remotion';
import {UIProvider, useT} from '../../UIUX/Context';
import {Icon} from '../../UIUX/Icons';
import type {ModuleKey} from '../../UIUX/ModuleIdentity';
import {Logo} from '../../UIUX/Parts/Shared';
import {DeviceBrowser} from '../../UIUX/Parts/Web';
import {AdWebScreen} from './AdScreens';
import {findConcept, PLATFORM_LINE, type DisplaySize} from './GoogleAdsPlan';
import type {GoogleAdBannerProps} from './GoogleAdsProps';
import {ExamTag} from './ExamTag';
import {ProofCard} from './ProofCard';

/**
 * Display-network banners in the IAB sizes Google serves most (uploaded image
 * ads, web site promotion). Same language as the Google Ads pictures: module
 * ground, white wordmark, the hook, the proof card; the browser appears only
 * where there is room for it. No buttons, prices or contact details; the
 * last line says where the click goes.
 */

const GROUND: Record<ModuleKey, [string, string]> = {
	exam: ['#F26B1D', '#C2410C'],
	lessons: ['#0EA5E9', '#0369A1'],
	tests: ['#6366F1', '#3730A3'],
	studyPlan: ['#14B8A6', '#0F766E'],
	smartSummary: ['#8B5CF6', '#5B21B6'],
	flashcards: ['#EC4899', '#9D174D'],
	sinoAi: ['#334155', '#0F172A'],
};

type Place = {x: number; y: number};
type BannerLayout = {
	pad: number;
	logo: number;
	head: number;
	headW: number;
	/** Supporting line under the hook; omitted on strips. */
	sub?: number;
	/** Where-it-goes line; `inline` puts it at the right end of a strip. */
	line: number;
	lineAt: 'below' | 'bottom' | 'inline';
	proof?: Place & {w: number; scale: number};
	device?: Place & {w: number};
	/** Strips: logo, hook and line sit in one row. */
	row?: boolean;
	/** Exam tag font size; banners too small for it carry the exam in the hook. */
	tag?: number;
};

const LAYOUTS: Record<DisplaySize, BannerLayout> = {
	'300x250': {tag: 9.5, pad: 16, logo: 15, head: 23, headW: 268, line: 11.5, lineAt: 'bottom', proof: {x: 92, y: 128, w: 440, scale: 0.46}},
	'336x280': {tag: 10, pad: 18, logo: 16, head: 25, headW: 300, line: 12, lineAt: 'bottom', proof: {x: 104, y: 142, w: 440, scale: 0.5}},
	'250x250': {tag: 8.5, pad: 14, logo: 13, head: 20, headW: 222, line: 10.5, lineAt: 'bottom', proof: {x: 70, y: 126, w: 440, scale: 0.4}},
	'300x600': {tag: 11, pad: 20, logo: 17, head: 30, headW: 260, sub: 14, line: 12.5, lineAt: 'bottom', device: {x: 24, y: 262, w: 420}, proof: {x: 20, y: 370, w: 440, scale: 0.59}},
	'160x600': {pad: 12, logo: 12, head: 22, headW: 136, sub: 12, line: 11, lineAt: 'bottom', proof: {x: 8, y: 330, w: 440, scale: 0.33}},
	'728x90': {pad: 16, logo: 15, head: 24, headW: 330, line: 13, lineAt: 'inline', row: true},
	'970x250': {tag: 12, pad: 28, logo: 18, head: 34, headW: 420, sub: 15, line: 13, lineAt: 'below', device: {x: 480, y: 34, w: 500}, proof: {x: 640, y: 96, w: 440, scale: 0.5}},
	'320x100': {pad: 12, logo: 12, head: 19, headW: 296, line: 11, lineAt: 'bottom'},
	'320x50': {pad: 10, logo: 11, head: 15.5, headW: 200, line: 0, lineAt: 'inline', row: true},
};

const Hook: React.FC<{text: string; size: number; width: number}> = ({text, size, width}) => (
	<div style={{width, fontSize: size, fontWeight: 800, lineHeight: 1.06, letterSpacing: '-0.03em', color: '#FFFFFF', textWrap: 'balance'}}>{text}</div>
);

/** Where the click goes; it may wrap only on narrow banners (160 px), never on strips. */
const WhereLine: React.FC<{text: string; size: number; wrap?: boolean}> = ({text, size, wrap}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: size * 0.4, fontSize: size, fontWeight: 800, lineHeight: 1.2, color: '#FFFFFF', whiteSpace: wrap ? 'normal' : 'nowrap'}}>
		<Icon name="globe" size={size * 1.15} color="#FFFFFF" stroke={2.2} />
		<span>{text}</span>
	</div>
);

const Banner: React.FC<GoogleAdBannerProps> = ({exam, concept: conceptId, size}) => {
	const t = useT();
	const concept = findConcept(exam, conceptId);
	const layout = LAYOUTS[size];
	const [from, to] = GROUND[concept.module];
	const [width, height] = size.split('x').map(Number);
	const hook = t(concept.headline);
	const line = t(PLATFORM_LINE.web);
	return (
		<AbsoluteFill style={{background: `linear-gradient(150deg, ${from} 0%, ${to} 100%)`, overflow: 'hidden'}}>
			<div style={{position: 'absolute', width: Math.max(width, height) * 0.9, aspectRatio: '1', right: -Math.max(width, height) * 0.35, top: -Math.max(width, height) * 0.5, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 68%)'}} />
			{layout.device ? (
				<div style={{position: 'absolute', left: layout.device.x, top: layout.device.y, filter: 'drop-shadow(0 18px 30px rgba(2, 8, 23, 0.35))'}}>
					<DeviceBrowser width={layout.device.w} title="sinavika.com">
						<AdWebScreen concept={concept} />
					</DeviceBrowser>
				</div>
			) : null}
			{layout.proof ? <ProofCard proof={concept.proof} width={layout.proof.w} scale={layout.proof.scale} style={{left: layout.proof.x, top: layout.proof.y}} /> : null}
			{layout.row ? (
				<div style={{position: 'absolute', inset: 0, padding: `0 ${layout.pad}px`, display: 'flex', alignItems: 'center', gap: layout.pad * 1.1}}>
					<Logo wordmark height={layout.logo} color="#FFFFFF" />
					<div style={{width: 1, alignSelf: 'stretch', margin: `${layout.pad}px 0`, background: 'rgba(255,255,255,0.35)'}} />
					<Hook text={hook} size={layout.head} width={layout.headW} />
					{layout.line ? (
						<div style={{marginLeft: 'auto'}}>
							<WhereLine text={line} size={layout.line} />
						</div>
					) : null}
				</div>
			) : (
				<div style={{position: 'absolute', left: layout.pad, top: layout.pad, display: 'flex', flexDirection: 'column'}}>
					<Logo wordmark height={layout.logo} color="#FFFFFF" />
					{layout.tag ? (
						<div style={{marginTop: layout.head * 0.4}}>
							<ExamTag exam={exam} size={layout.tag} maxWidth={layout.headW} />
						</div>
					) : null}
					<div style={{marginTop: layout.head * (layout.tag ? 0.3 : 0.5)}}>
						<Hook text={hook} size={layout.head} width={layout.headW} />
					</div>
					{layout.sub ? <div style={{marginTop: layout.sub * 0.6, width: layout.headW, fontSize: layout.sub, fontWeight: 600, lineHeight: 1.3, color: 'rgba(255,255,255,0.88)', textWrap: 'pretty'}}>{t(concept.subline)}</div> : null}
					{layout.lineAt === 'below' ? (
						<div style={{marginTop: layout.line * 1.2}}>
							<WhereLine text={line} size={layout.line} />
						</div>
					) : null}
				</div>
			)}
			{layout.lineAt === 'bottom' ? (
				<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, padding: `${layout.pad * 1.6}px ${layout.pad}px ${layout.pad * 0.8}px`, background: `linear-gradient(180deg, ${to}00 0%, ${to}E6 45%, ${to} 100%)`}}>
					<WhereLine text={line} size={layout.line} wrap={width < 200} />
				</div>
			) : null}
		</AbsoluteFill>
	);
};

export const GoogleAdBanner: React.FC<GoogleAdBannerProps> = (props) => (
	<UIProvider lang={props.lang} mode="light">
		<Banner {...props} />
	</UIProvider>
);
