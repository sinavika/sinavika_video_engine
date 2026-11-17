import type {ScenePlan, TemplateScene} from './ScenePlan';
import {slotLead, spokenSeconds, type VoiceClips} from './Voiceover';

/**
 * The pace a template promises, checked on the real recording (Sosyal Medya, 15 Nov 2026): a word count and the
 * estimated length said nothing about the 0.6–0.95 s of silence after every line. Measured from the clips' word
 * timings and the scene plan, the same numbers the render plays.
 *
 * - maxLineGapSeconds: silence between the end of one spoken line and the start of the next;
 * - maxSceneSeconds: a scene's length (the closing card not counted);
 * - maxPictureGapSeconds: time without a picture change, from scene cuts and the moments a template reports.
 */
export type TempoLimits = {maxLineGapSeconds: number; maxSceneSeconds?: number; maxPictureGapSeconds?: number};

/** Where a spoken line sits in the video: its start, the end of its last word, and its id. */
const spokenLines = (scenes: readonly TemplateScene[], plan: ScenePlan, clips: VoiceClips, fps: number) =>
	scenes.flatMap((scene, index) => {
		let offset = 0;
		return (scene.voice ?? []).flatMap((slot) => {
			const clip = clips[slot.id];
			const start = plan.scenes[index].from / fps + offset + slotLead(slot);
			offset += slot.seconds;
			return clip ? [{id: slot.id, start, end: start + spokenSeconds(clip)}] : [];
		});
	});

const sec = (value: number) => `${value.toFixed(2).replace('.', ',')} sn`;

/**
 * Every place the video breaks its tempo, as warnings. `pictureChanges` are a template's own changes inside each
 * scene (seconds from the scene's start: sub-beats, cards landing), one list per scene; scene cuts always count.
 * The closing card (`skip`) is not measured.
 */
export const tempoWarnings = (scenes: readonly TemplateScene[], plan: ScenePlan, clips: VoiceClips, fps: number, limits: TempoLimits, pictureChanges: readonly (readonly number[])[] = [], skip: readonly string[] = ['outro', 'card']): string[] => {
	const warnings: string[] = [];
	const lines = spokenLines(scenes, plan, clips, fps);
	for (let index = 1; index < lines.length; index++) {
		const gap = lines[index].start - lines[index - 1].end;
		if (gap > limits.maxLineGapSeconds + 1e-6) warnings.push(`Tempo: "${lines[index - 1].id}" ile "${lines[index].id}" arasında ${sec(gap)} sessizlik; sınır ${sec(limits.maxLineGapSeconds)}.`);
	}
	const measured = scenes.map((scene, index) => ({scene, planned: plan.scenes[index]})).filter(({scene}) => !skip.includes(scene.id));
	if (limits.maxSceneSeconds !== undefined) {
		for (const {scene, planned} of measured) {
			const seconds = planned.durationInFrames / fps;
			if (seconds > limits.maxSceneSeconds + 1e-6) warnings.push(`Tempo: "${scene.id}" sahnesi ${sec(seconds)}; sınır ${sec(limits.maxSceneSeconds)}.`);
		}
	}
	if (limits.maxPictureGapSeconds !== undefined && measured.length > 0) {
		const changes = [
			...measured.map(({planned}) => planned.from / fps),
			...scenes.flatMap((scene, index) => (skip.includes(scene.id) ? [] : (pictureChanges[index] ?? []).map((at) => plan.scenes[index].from / fps + at))),
		].sort((a, b) => a - b);
		const last = measured.at(-1)!;
		const end = (last.planned.from + last.planned.durationInFrames) / fps;
		[...changes, end].forEach((at, index, all) => {
			if (index === 0) return;
			const gap = at - all[index - 1];
			if (gap > limits.maxPictureGapSeconds! + 1e-6) warnings.push(`Tempo: ${sec(all[index - 1])} ile ${sec(at)} arasında görüntü ${sec(gap)} değişmiyor; sınır ${sec(limits.maxPictureGapSeconds!)}.`);
		});
	}
	return warnings;
};
