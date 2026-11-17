import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND_TYPOGRAPHY} from '../../Configurations/BrandTypography';
import {useTheme} from '../../Themes/ThemeContext';
import {STORY_INK, useStoryLook, type StoryTone} from './StoryLook';

/**
 * Kinetic type of the story reels: the key phrase only, never the narration word for word (no subtitles, owner 30 Oct
 * 2026). Words drop in one by one on the voice; the words that matter are painted and get a highlighter stroke. Ink, accent and type size come from the reel's look
 * (StoryLook) unless given.
 */

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/**
 * A word as keywords are matched: lower case, its punctuation dropped, the same on both sides ("bırakma!" in the text
 * and "bırakma" or "bırakma!" as a keyword). A word of symbols only ("≠", "%") is kept as it is, so it can be a keyword
 * too (Sosyal Medya, 15 Nov 2026: such keywords were never painted).
 */
export const keyOf = (word: string): string => {
	const lower = word.toLocaleLowerCase('tr');
	const plain = lower.replace(/[^\p{L}\p{N}]/gu, '');
	return plain || lower.trim();
};
const settle = (value: number) => 1 - (1 - value) ** 3;

/**
 * A phrase that lands word by word from `at` (seconds of the scene), each word `step` after the one before, or at its
 * own time in `times` (from phraseCues, so a word lands as it is said). Words in `keywords` are painted `accent` and
 * marked; the rest are ink. Wraps within `width`.
 */
export const KeyPhrase: React.FC<{text: string; keywords?: readonly string[]; at?: number; step?: number; times?: readonly number[]; size?: number; width?: number; tone?: StoryTone; accent?: string; align?: 'left' | 'center'}> = ({
	text,
	keywords = [],
	at = 0,
	step = 0.11,
	times,
	size: givenSize = 92,
	width = 900,
	tone,
	accent: givenAccent,
	align = 'center',
}) => {
	const {typography} = useTheme();
	const look = useStoryLook();
	const size = givenSize * look.typeScale;
	const accent = givenAccent ?? look.accent;
	const seconds = useCurrentFrame() / useVideoConfig().fps;
	const marked = new Set(keywords.flatMap((keyword) => keyword.split(/\s+/).map(keyOf)));
	const words = text.split(/\s+/).filter(Boolean);
	const ink = tone ? STORY_INK[tone] : look.ink;
	return (
		<div style={{width, display: 'flex', flexWrap: 'wrap', justifyContent: align === 'center' ? 'center' : 'flex-start', columnGap: size * 0.26, rowGap: size * 0.08, fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: size, lineHeight: 1.08, letterSpacing: '-0.01em'}}>
			{words.map((word, index) => {
				const start = times?.[index] ?? at + index * step;
				const land = settle(interpolate(seconds, [start, start + 0.22], [0, 1], CLAMP));
				const key = marked.has(keyOf(word));
				const stroke = key ? interpolate(seconds, [start + 0.12, start + 0.42], [0, 1], CLAMP) : 0;
				return (
					<span key={index} style={{position: 'relative', display: 'inline-block', opacity: land, transform: `translateY(${(1 - land) * size * 0.5}px) scale(${1 + (1 - land) * 0.35})`, transformOrigin: '50% 80%', color: key ? accent : ink}}>
						{key ? <span style={{position: 'absolute', left: '-4%', bottom: '6%', height: '34%', width: `${108 * stroke}%`, background: accent, opacity: 0.22, borderRadius: size * 0.08, transform: 'skewX(-12deg)'}} /> : null}
						<span style={{position: 'relative'}}>{word}</span>
					</span>
				);
			})}
		</div>
	);
};

/**
 * A number that counts from `from` to `to` between `at` and `at + count` seconds, then lands: it grows past its size
 * and settles, so the eye catches the last value. `decimals` and `suffix` ("net", "%") as the number reads.
 */
export const NumberPop: React.FC<{to: number; from?: number; at?: number; count?: number; decimals?: number; suffix?: string; size?: number; color?: string}> = ({to, from = 0, at = 0, count = 0.7, decimals = 0, suffix = '', size: givenSize = 180, color: givenColor}) => {
	const {typography} = useTheme();
	const look = useStoryLook();
	const size = givenSize * look.typeScale;
	const color = givenColor ?? look.accent;
	const seconds = useCurrentFrame() / useVideoConfig().fps;
	const progress = settle(interpolate(seconds, [at, at + count], [0, 1], CLAMP));
	const value = from + (to - from) * progress;
	const landed = interpolate(seconds, [at + count, at + count + 0.12, at + count + 0.32], [0, 1, 0], CLAMP);
	const shown = seconds < at ? 0 : 1;
	return (
		<span style={{display: 'inline-block', opacity: shown, transform: `scale(${1 + 0.16 * landed})`, fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: size, color, fontVariantNumeric: 'tabular-nums', lineHeight: 1}}>
			{value.toLocaleString('tr-TR', {minimumFractionDigits: decimals, maximumFractionDigits: decimals})}
			{suffix ? <span style={{fontSize: size * 0.42, marginLeft: size * 0.08}}>{suffix}</span> : null}
		</span>
	);
};
