import type {ReactNode} from 'react';
import type {z} from 'zod';
import type {VideoFormatId} from '../Configurations/VideoFormats';
import {CATEGORY_VOICE_PROFILES, type VoiceModelKey, type VoiceProfileKey} from '../Configurations/Voices';
import type {ScenePlan, TemplateScene} from '../Scenes/ScenePlan';
import {snapScenesToBeats, type Beats} from '../Scenes/Rhythm';
import {planTemplateScenes} from '../Scenes/SceneSeries';
import type {SceneTransition} from '../Scenes/SceneTransition';
import type {TempoLimits} from '../Scenes/TempoCheck';
import {slotLead, spokenSeconds, type VoiceClips} from '../Scenes/Voiceover';
import type {Theme} from '../Themes/Theme';
import {THEME_IDS, type ThemeId} from '../Themes/ThemeRegistry';

type TemplateCategory = keyof typeof CATEGORY_VOICE_PROFILES;

/**
 * Everything the engine needs to know about a template. A template owns its
 * content schema and turns validated content into scenes; previewing,
 * validating, timing and rendering are generic and never mention a template
 * by name.
 */
type TemplateDefinition<Schema extends z.ZodType> = {
	/** Also the first part of the composition id. Letters and digits only. */
	id: string;
	category: TemplateCategory;
	title: string;
	description: string;
	contentSchema: Schema;
	/** Valid example content. Shown in Remotion Studio and exercised by the tests. */
	sampleContent: z.input<Schema>;
	defaultTheme: ThemeId;
	supportedThemes: readonly [ThemeId, ...ThemeId[]];
	transition: SceneTransition | SceneTransition[];
	/**
	 * Pure: the same content and clips always yield the same scenes and durations.
	 * `voiceClips` holds the generated audio per voice line; where a clip exists
	 * its length sets the timing.
	 */
	buildScenes: (content: z.output<Schema>, voiceClips?: VoiceClips) => TemplateScene[];
	/** Who narrates this template. See Configurations/Voices. Defaults to the category's profile. */
	voiceProfile: VoiceProfileKey;
	/** The speech model this template is narrated with, when it is not the voice's default (Configurations/Voices). A job can still name another. */
	voiceModel?: VoiceModelKey;
	/** Intended length of the video without its outro. Rendering outside it is reported as a warning. */
	targetSeconds?: {min: number; max: number};
	/** The theme for this content, when the template colours by something of its own (e.g. a lesson code). Defaults to the lesson colour of the job. */
	themeFor?: (themeId: ThemeId, content: z.output<Schema>) => Theme | undefined;
	/** Persistent chrome above the scenes. Hidden during the outro. */
	renderOverlay?: (content: z.output<Schema>, plan: ScenePlan) => ReactNode;
	/** `false` keeps the scenes' own lengths even with music: no cut is moved onto a beat (a remembrance stays still). Default true. */
	cutsOnBeat?: boolean;
	/**
	 * The pace the template promises, checked on the real recording at render and by `validate --narration`
	 * (Scenes/TempoCheck). `pictureChanges` gives the moments inside each scene where the picture changes (seconds
	 * from the scene's start, one list per scene); scene cuts always count.
	 */
	tempo?: {limits: TempoLimits; pictureChanges?: (content: z.output<Schema>, voiceClips: VoiceClips) => number[][]};
};

type Defaulted = 'supportedThemes' | 'voiceProfile';
type TemplateInput<Schema extends z.ZodType> = Omit<TemplateDefinition<Schema>, Defaulted> &
	Partial<Pick<TemplateDefinition<Schema>, Defaulted>>;

/**
 * Themes are opt-out: a template supports every theme unless it lists a subset.
 * The narrator defaults to the voice profile of the template's category.
 */
export const defineTemplate = <Schema extends z.ZodType>(
	template: TemplateInput<Schema>,
): TemplateDefinition<Schema> => ({
	supportedThemes: THEME_IDS,
	voiceProfile: CATEGORY_VOICE_PROFILES[template.category],
	...template,
});

// The registry holds templates with different schemas; their content types are erased there.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyTemplateDefinition = TemplateDefinition<any>;

/**
 * How far each cut may wait for the beat in a template that promises a tempo: the line-gap limit less the silence the
 * cut already has (the last line's tail after its last word and the next line's lead). Unvoiced cuts are free.
 */
const beatRoom = (scenes: readonly TemplateScene[], voiceClips: VoiceClips, maxLineGapSeconds: number) => (index: number): number => {
	const last = scenes[index].voice?.at(-1);
	const next = scenes[index + 1]?.voice?.[0];
	const clip = last ? voiceClips[last.id] : undefined;
	if (!last || !next || !clip) return Number.POSITIVE_INFINITY;
	const spokenInScene = (scenes[index].voice ?? []).reduce((total, slot) => total + slot.seconds, 0);
	const silence = last.seconds - slotLead(last) - spokenSeconds(clip) + (scenes[index].seconds - spokenInScene) + slotLead(next);
	return Math.max(0, maxLineGapSeconds - silence);
};

/** A template's scenes as they play: built from the content and voice, every cut moved onto the music's beat when there is a grid (Scenes/Rhythm). */
export const templateScenes = (template: AnyTemplateDefinition, content: unknown, voiceClips: VoiceClips = {}, beats?: Beats): TemplateScene[] => {
	const scenes = template.buildScenes(content, voiceClips);
	return snapScenesToBeats(scenes, beats, template.tempo ? beatRoom(scenes, voiceClips, template.tempo.limits.maxLineGapSeconds) : undefined);
};

export const templateDurationInFrames = (
	template: AnyTemplateDefinition,
	content: unknown,
	fps: number,
	voiceClips: VoiceClips = {},
	beats?: Beats,
): number =>
	planTemplateScenes(templateScenes(template, content, voiceClips, beats), template.transition, fps).durationInFrames;

export const compositionId = (templateId: string, formatId: VideoFormatId): string =>
	`${templateId}-${formatId}`;
