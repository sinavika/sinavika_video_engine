import React from 'react';
import {Audio, Sequence, staticFile, useVideoConfig} from 'remotion';
import {SOUND_EFFECTS, type SoundEffectId} from '../../Configurations/SoundEffects';

/** The end of a cut-short effect fades over this long, so it never clicks off. */
const FADE_SECONDS = 0.08;

/**
 * A sound effect at a second of the scene (src/Configurations/SoundEffects.ts).
 * The files are levelled under the narration, so they play at full volume
 * unless `volume` lowers one. `seconds` cuts a sound short with a short fade,
 * or loops it when it is longer than the file (typing that goes on).
 */
export const SoundEffect: React.FC<{id: SoundEffectId; atSeconds: number; volume?: number; seconds?: number}> = ({id, atSeconds, volume = 1, seconds}) => {
	const {fps} = useVideoConfig();
	const effect = SOUND_EFFECTS[id];
	const frames = seconds === undefined ? undefined : Math.max(1, Math.round(seconds * fps));
	const fade = Math.max(1, Math.round(FADE_SECONDS * fps));
	return (
		<Sequence layout="none" name={`Ses efekti: ${id}`} from={Math.max(0, Math.round(atSeconds * fps))} durationInFrames={frames}>
			<Audio
				src={staticFile(effect.file)}
				loop={seconds !== undefined && seconds > effect.seconds}
				volume={frames === undefined ? volume : (frame) => volume * Math.max(0, Math.min(1, (frames - frame) / fade))}
			/>
		</Sequence>
	);
};
