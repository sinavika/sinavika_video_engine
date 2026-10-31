import {TransitionSeries, linearTiming} from '@remotion/transitions';
import React from 'react';
import {Audio, Easing, Sequence, interpolate, staticFile, useVideoConfig} from 'remotion';
import {secondsToFrames} from '../Animations/Motion';
import {planScenes, type ScenePlan, type TemplateScene} from './ScenePlan';
import {toPresentation, transitionSeconds, type SceneTransition} from './SceneTransition';
import {VOICE_LEAD_SECONDS, type VoiceClips} from './Voiceover';

type SceneSeriesProps = {
	scenes: TemplateScene[];
	/** One transition for every cut, or a list that is cycled through. */
	transition: SceneTransition | SceneTransition[];
	/** Persistent chrome drawn above the scenes (progress, brand). */
	overlay?: (plan: ScenePlan) => React.ReactNode;
	/** Hide the overlay from this scene onwards, e.g. during the outro. */
	overlayEndsAt?: string;
	/** Generated audio for the scenes' voice lines. Lines without a clip stay silent. */
	voiceClips?: VoiceClips;
};

const asList = (transition: SceneTransition | SceneTransition[]): SceneTransition[] =>
	Array.isArray(transition) ? transition : [transition];

/**
 * Plans a template's scenes for a given FPS. Also used to compute the video duration.
 *
 * Consecutive scenes overlap by one transition. A scene that speaks is
 * lengthened by that overlap, so its voice has finished before the next
 * scene's voice starts: without it, with 0.7 s cross-fades, the next line
 * began a quarter of a second before the last one ended and the narration
 * sounded cut and late (owner, 25 Oct 2026). Between two spoken lines there
 * is always the lead and tail of the voice (VOICE_LEAD_SECONDS + VOICE_TAIL_SECONDS).
 */
export const planTemplateScenes = (
	scenes: readonly TemplateScene[],
	transition: SceneTransition | SceneTransition[],
	fps: number,
): ScenePlan => {
	const overlap = scenes.length > 1 ? transitionSeconds(asList(transition)[0]) : 0;
	const timed = scenes.map((scene, index) => (scene.voice?.length && index < scenes.length - 1 ? {...scene, seconds: scene.seconds + overlap} : scene));
	return planScenes(timed, fps, overlap);
};

/** Lines are cut at the quietest moment between words (NarrationCuts); one frame of fade is enough to keep a cut from clicking without eating the first sound. */
const CLIP_FADE_FRAMES = 1;

/** The audio of one scene: each line starts when the lines before it have had their time. */
const SceneVoice: React.FC<{scene: TemplateScene; clips: VoiceClips}> = ({scene, clips}) => {
	const {fps} = useVideoConfig();
	const slots = scene.voice ?? [];
	const plan = planScenes(slots, fps);
	return (
		<>
			{slots.map((slot, index) => {
				const clip = clips[slot.id];
				if (!clip) return null;
				// The clip is a part of the narration file: start at its offset, stop when its time is up,
				// and ease the ends so a cut inside continuous speech is never heard as a click.
				const frames = Math.max(1, Math.ceil(clip.durationSeconds * fps));
				const edge = Math.min(CLIP_FADE_FRAMES, Math.floor(frames / 2));
				return (
					<Sequence
						key={slot.id}
						layout="none"
						name={`Voice: ${slot.id}`}
						from={plan.scenes[index].from + secondsToFrames(VOICE_LEAD_SECONDS, fps)}
						durationInFrames={frames}
					>
						<Audio
							src={staticFile(clip.src)}
							trimBefore={Math.round(clip.startSeconds * fps)}
							playbackRate={clip.playbackRate}
							volume={(frame) => (edge === 0 ? 1 : interpolate(frame, [0, edge, frames - edge, frames], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}))}
						/>
					</Sequence>
				);
			})}
		</>
	);
};

/** Plays scenes back to back with transitions. The one place templates get sequenced. */
export const SceneSeries: React.FC<SceneSeriesProps> = ({
	scenes,
	transition,
	overlay,
	overlayEndsAt,
	voiceClips = {},
}) => {
	const {fps} = useVideoConfig();
	const transitions = asList(transition);
	const plan = planTemplateScenes(scenes, transitions, fps);
	const overlayEnd =
		plan.scenes.find((scene) => scene.id === overlayEndsAt)?.from ?? plan.durationInFrames;

	return (
		<>
			<TransitionSeries>
				{scenes.flatMap((scene, index) => {
					const sequence = (
						<TransitionSeries.Sequence
							key={scene.id}
							durationInFrames={plan.scenes[index].durationInFrames}
						>
							{/* No box of its own (display: contents): it only tells the layout guard which scene a text is in. */}
							<div data-layout-scene={scene.id} style={{display: 'contents'}}>
								{scene.element}
							</div>
							<SceneVoice scene={scene} clips={voiceClips} />
						</TransitionSeries.Sequence>
					);
					if (index === 0 || plan.transitionFrames === 0) return [sequence];
					const spec = scene.transitionIn ?? transitions[(index - 1) % transitions.length];
					return [
						<TransitionSeries.Transition
							key={`${scene.id}-transition`}
							presentation={toPresentation(spec)}
							// Eased in and out: a cut starts and lands softly instead of moving at one speed.
							timing={linearTiming({durationInFrames: plan.transitionFrames, easing: Easing.inOut(Easing.cubic)})}
						/>,
						sequence,
					];
				})}
			</TransitionSeries>
			{overlay && overlayEnd > 0 ? (
				<Sequence durationInFrames={overlayEnd} name="Overlay">
					{overlay(plan)}
				</Sequence>
			) : null}
		</>
	);
};
