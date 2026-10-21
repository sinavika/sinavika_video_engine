/**
 * Builds the HTML5 banner for Google Ads: one self-contained index.html with
 * its layers (device and proof card as PNG, the white wordmark as SVG, Manrope
 * as WOFF2), animated in CSS. Google's rules it follows: the size in the
 * `ad.size` meta tag, every click through `ExitApi.exit()`, no other outside
 * files, at most 30 seconds of animation (two 10-second plays, then it rests on
 * the last frame).
 */
import type {AdConcept, AdLang, AdPlatform} from './GoogleAdsPlan';
import {EXAM_TAG, PLATFORM_CTA, PLATFORM_LINE} from './GoogleAdsPlan';

export type BannerSize = {width: number; height: number};

const GROUND: Record<string, [string, string]> = {
	exam: ['#F26B1D', '#C2410C'],
	lessons: ['#0EA5E9', '#0369A1'],
	tests: ['#6366F1', '#3730A3'],
	studyPlan: ['#14B8A6', '#0F766E'],
	smartSummary: ['#8B5CF6', '#5B21B6'],
	flashcards: ['#EC4899', '#9D174D'],
	sinoAi: ['#334155', '#0F172A'],
};

const escape = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

type Place = {x: number; y: number; w: number};
type BannerLayout = {head: number; headW: number; headY: number; device: Place; proof: Place; cta: {x: number; y: number; w: number}; logo: number};

const LAYOUTS: Record<string, Record<AdPlatform, BannerLayout>> = {
	'320x480': {
		mobile: {logo: 15, headY: 44, head: 27, headW: 288, device: {x: 150, y: 150, w: 172}, proof: {x: 10, y: 214, w: 236}, cta: {x: 16, y: 418, w: 288}},
		web: {logo: 15, headY: 44, head: 27, headW: 288, device: {x: 36, y: 130, w: 300}, proof: {x: 10, y: 196, w: 236}, cta: {x: 16, y: 418, w: 288}},
	},
	'480x320': {
		mobile: {logo: 14, headY: 40, head: 24, headW: 200, device: {x: 352, y: 22, w: 120}, proof: {x: 206, y: 96, w: 196}, cta: {x: 16, y: 262, w: 186}},
		web: {logo: 14, headY: 40, head: 24, headW: 200, device: {x: 214, y: 26, w: 280}, proof: {x: 196, y: 150, w: 180}, cta: {x: 16, y: 262, w: 186}},
	},
};

export const buildBannerHtml = ({concept, lang, platform, size, files}: {concept: AdConcept; lang: AdLang; platform: AdPlatform; size: BannerSize; files: {device: string; proof: string; wordmark: string; fonts: string[]}}): string => {
	const key = `${size.width}x${size.height}`;
	const layout = LAYOUTS[key][platform];
	const [from, to] = GROUND[concept.module];
	const headline = escape(concept.headline[lang]);
	const tag = escape(EXAM_TAG[concept.exam]);
	const cta = escape(PLATFORM_CTA[platform][lang]);
	const line = escape(PLATFORM_LINE[platform][lang]);
	const fontFaces = files.fonts.map((font, index) => `@font-face{font-family:Manrope;src:url(${font}) format('woff2');font-weight:200 800;font-display:block;unicode-range:${index ? 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF' : 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD'};}`).join('');
	return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="ad.size" content="width=${size.width},height=${size.height}">
<meta name="viewport" content="width=${size.width},height=${size.height}">
<title>Sınavika</title>
<script type="text/javascript" src="https://tpc.googlesyndication.com/pagead/gadgets/html5/api/exitapi.js"></script>
<style>
${fontFaces}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${size.width}px;height:${size.height}px;overflow:hidden;background:${to}}
#ad{position:relative;width:${size.width}px;height:${size.height}px;overflow:hidden;cursor:pointer;font-family:Manrope,Arial,sans-serif;color:#fff;background:linear-gradient(150deg,${from} 0%,${to} 100%);-webkit-font-smoothing:antialiased}
#glow{position:absolute;width:${size.width * 0.95}px;height:${size.width * 0.95}px;right:-${size.width * 0.35}px;top:-${size.width * 0.5}px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.24) 0%,rgba(255,255,255,0) 68%)}
#logo{position:absolute;left:16px;top:16px;height:${layout.logo}px}
#tag{position:absolute;left:16px;top:${layout.headY - 2}px;max-width:${size.width - 32}px;padding:3px 9px;border-radius:999px;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);font-size:10px;font-weight:700;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#head{position:absolute;left:16px;top:${layout.headY + 24}px;width:${layout.headW}px;font-size:${layout.head}px;font-weight:800;line-height:1.06;letter-spacing:-.03em}
#device{position:absolute;left:${layout.device.x}px;top:${layout.device.y}px;width:${layout.device.w}px;filter:drop-shadow(0 18px 24px rgba(2,8,23,.35))}
#proof{position:absolute;left:${layout.proof.x}px;top:${layout.proof.y}px;width:${layout.proof.w}px}
#cta{position:absolute;left:${layout.cta.x}px;top:${layout.cta.y}px;width:${layout.cta.w}px;height:44px;border-radius:22px;background:#fff;color:#0B1C30;font-size:16px;font-weight:800;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 10px 24px -10px rgba(2,8,23,.5)}
#scrim{position:absolute;left:0;right:0;bottom:0;height:${size.height - layout.cta.y + 46}px;background:linear-gradient(180deg,${to}00 0%,${to}E6 38%,${to} 100%)}
#line{position:absolute;left:${layout.cta.x}px;top:${layout.cta.y - 22}px;width:${layout.cta.w}px;font-size:11.5px;font-weight:700;color:rgba(255,255,255,.9);text-align:center}
.play #tag{animation:fade .5s ease .1s both}
.play #head{animation:rise .7s cubic-bezier(.2,.8,.2,1) .2s both}
.play #device{animation:up .9s cubic-bezier(.2,.8,.2,1) 1.4s both}
.play #proof{animation:pop .7s cubic-bezier(.3,1.4,.4,1) 2.6s both}
.play #scrim,.play #line{animation:fade .6s ease 4.2s both}
.play #cta{animation:fade .6s ease 4.2s both,pulse 1.6s ease-in-out 5.4s 2}
@keyframes rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes up{from{opacity:0;transform:translateY(${Math.round(size.height * 0.45)}px)}to{opacity:1;transform:none}}
@keyframes pop{from{opacity:0;transform:scale(.82) translateY(10px)}to{opacity:1;transform:none}}
@keyframes fade{from{opacity:0}to{opacity:1}}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
</style>
</head>
<body>
<div id="ad" class="play" onclick="ExitApi.exit()">
<div id="glow"></div>
<img id="device" src="${files.device}" alt="">
<img id="proof" src="${files.proof}" alt="">
<img id="logo" src="${files.wordmark}" alt="Sınavika">
${size.height > size.width ? '<div id="scrim"></div>' : ''}
<div id="tag">${tag}</div>
<div id="head">${headline}</div>
<div id="line">${line}</div>
<div id="cta">${cta} <span aria-hidden="true">→</span></div>
</div>
<script>
// Plays twice (about 20 seconds in all), then rests on the last frame.
(function(){var ad=document.getElementById('ad');setTimeout(function(){ad.classList.remove('play');void ad.offsetWidth;ad.classList.add('play');},10000);})();
</script>
</body>
</html>
`;
};
