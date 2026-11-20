import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {useTheme} from '../../Themes/ThemeContext';
import {SoundEffect} from '../Sounds/SoundEffect';
import {landing} from './StoryCard';
import {STORY_COLORS, useStoryLook} from './StoryLook';
import {Paper} from './StoryMaterial';

/**
 * The anonymous comment of "Dediniz, yaptık" (Sosyal Medya, 20 Nov 2026): what a student wrote to us, in a speech
 * bubble on the look's paper. No user name, no avatar, no Instagram or TikTok furniture (the series' honesty rule:
 * docs/Social/Sinavika-Tr-Icerik-Yaklasimi.md "Ana seri"). The same bubble closes the reel empty, with a blinking
 * cursor: "Sırada ne var? Yoruma yaz."
 *
 * The words come in as the voice reads them: one by one (`reveal: 'words'`, `times` from the voice when the template
 * has them), typed letter by letter with the cursor and the keyboard's sound (`'type'`), or all at once (`'all'`). A
 * bubble can carry the hook itself (`size` up to 96) or follow it. `keywords` are marked with the highlighter.
 */

/** The pace of words without voice timings, and of typed letters. */
const WORD_SECONDS = 0.11;
const LETTER_SECONDS = 0.035;
const BLINK_SECONDS = 1;

type CommentReveal = 'words' | 'type' | 'all';

/** How many words (or letters, when typed) of `text` show `seconds` into the scene. */
export const commentShown = (text: string, reveal: CommentReveal, at: number, seconds: number, times?: readonly number[]): number => {
	if (seconds < at) return 0;
	if (reveal === 'all') return Infinity;
	if (reveal === 'type') return Math.floor((seconds - at) / LETTER_SECONDS) + 1;
	const words = text.split(/\s+/);
	if (times?.length) return times.filter((time) => time <= seconds).length;
	return Math.min(words.length, Math.floor((seconds - at) / WORD_SECONDS) + 1);
};

/** The cursor's blink: on for the first half of every second. */
export const cursorOn = (seconds: number, at: number): boolean => seconds >= at && ((seconds - at) % BLINK_SECONDS) / BLINK_SECONDS < 0.55;

const normal = (word: string) => word.toLocaleLowerCase('tr').replace(/[.,!?;:"“”'’…]/g, '');

export const StoryComment: React.FC<{
	/** The student's sentence; leave it out for the empty bubble with the cursor. */
	text?: string;
	at?: number;
	reveal?: CommentReveal;
	/** When each word lands (seconds of the scene), from the voice. */
	times?: readonly number[];
	keywords?: readonly string[];
	/** A short line above the sentence, e.g. "Bize yazdınız". */
	label?: string;
	width?: number;
	size?: number;
	/** The bubble's tail: lower left (the student speaks to us) or lower right. */
	tail?: 'left' | 'right';
	tilt?: number;
}> = ({text, at = 0, reveal = 'words', times, keywords = [], label, width = 860, size = 58, tail = 'left', tilt = -1.5}) => {
	const seconds = useCurrentFrame() / useVideoConfig().fps;
	const look = useStoryLook();
	const {typography} = useTheme();
	const shown = text ? commentShown(text, reveal, at, seconds, times) : 0;
	const marked = new Set(keywords.flatMap((keyword) => keyword.split(/\s+/).map(normal)));
	const typed = reveal === 'type' && text ? text.slice(0, shown) : null;
	const typing = typed !== null && typed.length < (text?.length ?? 0);
	const caret = !text || typing;
	const blink = typing || cursorOn(seconds, at + 0.25);
	const tailSide = tail === 'left' ? {left: width * 0.14} : {right: width * 0.14};
	const words = text?.split(/\s+/) ?? [];
	return (
		<div style={{position: 'relative', display: 'inline-block', ...landing(seconds, at, tilt)}}>
			<Paper width={width} padding={size * 0.9} curl={false} style={{borderRadius: size * 0.9, minHeight: size * 2.6}}>
				{label ? <div style={{fontFamily: typography.body, fontWeight: 700, fontSize: Math.max(30, size * 0.5), color: STORY_COLORS.pencil, marginBottom: size * 0.35}}>{label}</div> : null}
				<div style={{fontFamily: typography.display, fontWeight: 800, fontSize: size, lineHeight: 1.22, color: STORY_COLORS.ink}}>
					{typed !== null
						? typed
						: words.map((word, index) => {
								const on = index < shown;
								const key = marked.has(normal(word));
								return (
									<React.Fragment key={index}>
										<span style={{opacity: on ? 1 : 0, color: key ? look.cardAccent : undefined, display: 'inline-block', transform: on ? undefined : 'translateY(0.25em)'}}>{word}</span>{' '}
									</React.Fragment>
								);
							})}
					{caret ? <span style={{display: 'inline-block', width: size * 0.08, height: size * 1.05, marginLeft: size * 0.06, verticalAlign: 'text-bottom', background: look.cardAccent, opacity: blink ? 1 : 0}} /> : null}
				</div>
			</Paper>
			{/* The tail: a paper triangle under the bubble, in the paper's own colour. */}
			<svg width={size * 1.3} height={size * 1.1} viewBox="0 0 26 22" style={{position: 'absolute', bottom: -size * 0.95, ...tailSide, transform: tail === 'right' ? 'scaleX(-1)' : undefined, filter: 'drop-shadow(0 6px 6px rgba(15,23,42,0.12))'}}>
				<path d="M2 0 L26 0 Q12 8 0 22 Q6 10 2 0 Z" fill={look.paper} />
			</svg>
			<SoundEffect id="pop" atSeconds={at} volume={0.7} />
			{typed !== null && text ? <SoundEffect id="typing" atSeconds={at} volume={0.45} /> : null}
		</div>
	);
};
