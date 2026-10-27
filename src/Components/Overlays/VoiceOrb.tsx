import {useWindowedAudioData, visualizeAudio} from '@remotion/media-utils';
import React from 'react';
import {interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {mixColors} from '../../Themes/ColorPalette';
import {withAlpha} from '../../Themes/Theme';
import {useVideoLayout} from '../Layouts/VideoLayout';

/**
 * Where a spoken line sits: in which narration file, from which second of it,
 * and when it starts in the scene (seconds after the scene begins).
 */
export type VoiceTrack = {src: string; fileStartSeconds: number; sceneStartSeconds: number; durationSeconds: number; playbackRate: number};

/** How many past frames the voice level is averaged over: about a third of a second, so the orb follows phrases, not syllables. */
const SMOOTHING_FRAMES = 10;
const SMOOTHING_DECAY = 0.82;

/**
 * How loud the voice is now, 0 to 1, from the narration audio itself; 0
 * between lines. Averaged over the last third of a second with more weight on
 * the latest frames: per frame it jumped with every syllable (owner, 25 Oct
 * 2026: "konuşunca çok zıplıyor").
 */
const useVoiceLevel = (tracks: readonly VoiceTrack[]): number => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const now = frame / fps;
	const track = tracks.find((item) => now >= item.sceneStartSeconds && now < item.sceneStartSeconds + item.durationSeconds) ?? tracks[0];
	const fileFrameAt = (seconds: number) => Math.max(0, Math.round((track.fileStartSeconds + (seconds - track.sceneStartSeconds) * track.playbackRate) * fps));
	const {audioData, dataOffsetInSeconds} = useWindowedAudioData({src: staticFile(track.src), frame: fileFrameAt(now), fps, windowInSeconds: 8});
	if (!audioData) return 0;
	let sum = 0;
	let weights = 0;
	for (let back = 0; back < SMOOTHING_FRAMES; back++) {
		const at = now - back / fps;
		const weight = SMOOTHING_DECAY ** back;
		weights += weight;
		const inside = tracks.find((item) => at >= item.sceneStartSeconds && at < item.sceneStartSeconds + item.durationSeconds) === track;
		if (!inside) continue;
		const bins = visualizeAudio({audioData, frame: fileFrameAt(at), fps, numberOfSamples: 32, dataOffsetInSeconds, optimizeFor: 'speed'});
		// Speech lives in the low bins; they are scaled so a normal sentence fills most of the range.
		sum += weight * Math.min(1, (bins.slice(0, 12).reduce((total, value) => total + value, 0) / 12) * 9);
	}
	return sum / weights;
};

/** The orb following real narration. A separate component, so the audio hook is only used when there is audio. */
const SpeakingOrb: React.FC<OrbProps & {tracks: readonly VoiceTrack[]}> = ({tracks, ...props}) => <OrbBody {...props} voice={useVoiceLevel(tracks)} />;

type OrbProps = {size: number; color: string; delaySeconds?: number};

/**
 * SinoAI speaking: a soft, glowing sphere whose colours swirl slowly inside
 * and which swells with the voice, like the voice mode of a chat assistant.
 * It follows the narration's loudness (`tracks`); silent or without audio it
 * breathes gently. Drawn on the lesson colour, in white and the colour's tints.
 */
export const VoiceOrb: React.FC<OrbProps & {tracks?: readonly VoiceTrack[]}> = ({tracks = [], ...props}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const seconds = frame / fps;
	// Without audio (layout checks, previews) a slow wave stands in for speech, so the motion can still be judged.
	return tracks.length > 0 ? <SpeakingOrb {...props} tracks={tracks} /> : <OrbBody {...props} voice={0.35 + 0.25 * Math.sin(seconds * 5.1) * Math.sin(seconds * 1.7)} />;
};

/** The sphere itself; `voice` (0 to 1) is how loud the speech is now. */
const OrbBody: React.FC<OrbProps & {voice: number}> = ({size, color, delaySeconds = 0.2, voice}) => {
	const {u} = useVideoLayout();
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const seconds = frame / fps;
	const appear = interpolate(seconds, [delaySeconds, delaySeconds + 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const breath = 0.035 * Math.sin(seconds * Math.PI * 0.8);
	// Gentle: the orb swells a little with the voice and settles between phrases.
	const swell = 1 + breath + 0.07 * voice;
	const px = u(size);
	const light = mixColors(color, '#FFFFFF', 0.78);
	const mid = mixColors(color, '#FFFFFF', 0.4);
	const deep = mixColors(color, '#000000', 0.25);
	// The colours inside turn slowly, and faster while SinoAI speaks.
	const spin = seconds * (24 + 30 * voice);

	const blob = (turn: number, colour: string, scale: number, offset: number) => {
		const angle = seconds * turn * (1 + 0.4 * voice) + offset;
		const x = Math.cos(angle) * px * 0.18;
		const y = Math.sin(angle * 1.3) * px * 0.16;
		const r = 40 + 12 * Math.sin(seconds * 1.6 + offset);
		return (
			<div
				style={{
					position: 'absolute',
					left: '50%',
					top: '50%',
					width: px * scale,
					height: px * scale,
					marginLeft: (-px * scale) / 2 + x,
					marginTop: (-px * scale) / 2 + y,
					borderRadius: `${r}% ${100 - r}% ${55 + 8 * Math.cos(angle)}% ${45 - 8 * Math.cos(angle)}% / ${50 + 10 * Math.sin(angle)}% ${50 - 10 * Math.sin(angle)}%`,
					background: colour,
					filter: `blur(${px * 0.07}px)`,
					transform: `rotate(${angle * 40}deg) scale(${1 + 0.08 * voice})`,
				}}
			/>
		);
	};

	return (
		<div style={{position: 'relative', width: px, height: px, flexShrink: 0, opacity: appear, transform: `scale(${(0.85 + 0.15 * appear) * swell})`}}>
			{/* The glow around it grows with the voice. */}
			<div style={{position: 'absolute', inset: -px * (0.14 + 0.07 * voice), borderRadius: '50%', background: `radial-gradient(circle, ${withAlpha('#FFFFFF', 0.3 + 0.25 * voice)} 0%, ${withAlpha('#FFFFFF', 0)} 68%)`}} />
			<div style={{position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden', background: `radial-gradient(circle at 32% 28%, #FFFFFF 0%, ${light} 30%, ${mid} 70%, ${color} 100%)`, boxShadow: `inset 0 ${-px * 0.08}px ${px * 0.16}px ${withAlpha(deep, 0.45)}, 0 ${px * 0.05}px ${px * 0.2}px ${withAlpha('#000000', 0.2)}`}}>
				{/* A slowly turning swirl of the lesson's tones. */}
				<div style={{position: 'absolute', inset: '-25%', background: `conic-gradient(from ${spin}deg, ${light}, ${color}, #FFFFFF, ${mid}, ${deep}, ${light})`, filter: `blur(${px * 0.1}px)`, opacity: 0.75}} />
				{blob(0.7, withAlpha(deep, 0.7), 0.62, 0)}
				{blob(-0.5, withAlpha('#FFFFFF', 0.9), 0.5, 2.1)}
				{blob(0.9, withAlpha(mid, 0.85), 0.44, 4.2)}
				{/* A highlight, as on glass. */}
				<div style={{position: 'absolute', left: '16%', top: '10%', width: '40%', height: '26%', borderRadius: '50%', background: withAlpha('#FFFFFF', 0.6), filter: `blur(${px * 0.035}px)`}} />
			</div>
		</div>
	);
};
