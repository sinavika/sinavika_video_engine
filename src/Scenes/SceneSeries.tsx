import {TransitionSeries, linearTiming} from '@remotion/transitions';
import React from 'react';
import {Audio, Sequence, staticFile, useVideoConfig} from 'remotion';
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

/** Plans a template's scenes for a given FPS. Also used to compute the video duration. */
export const planTemplateScenes = (
	scenes: readonly TemplateScene[],
	transition: SceneTransition | SceneTransition[],
	fps: number,
): ScenePlan => planScenes(scenes, fps, transitionSeconds(asList(transition)[0]));

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
				return (
					<Sequence
						key={slot.id}
						layout="none"
						name={`Voice: ${slot.id}`}
						from={plan.scenes[index].from + secondsToFrames(VOICE_LEAD_SECONDS, fps)}
					>
						<Audio src={staticFile(clip.src)} playbackRate={clip.playbackRate} />
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
							{scene.element}
							<SceneVoice scene={scene} clips={voiceClips} />
						</TransitionSeries.Sequence>
					);
					if (index === 0 || plan.transitionFrames === 0) return [sequence];
					const spec = transitions[(index - 1) % transitions.length];
					return [
						<TransitionSeries.Transition
							key={`${scene.id}-transition`}
							presentation={toPresentation(spec)}
							timing={linearTiming({durationInFrames: plan.transitionFrames})}
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
