import type {ReactNode} from 'react';
import type {z} from 'zod';
import type {VideoFormatId} from '../Configurations/VideoFormats';
import {CATEGORY_VOICE_PROFILES, type VoiceProfileKey} from '../Configurations/Voices';
import type {ScenePlan, TemplateScene} from '../Scenes/ScenePlan';
import {planTemplateScenes} from '../Scenes/SceneSeries';
import type {SceneTransition} from '../Scenes/SceneTransition';
import type {VoiceClips} from '../Scenes/Voiceover';
import {THEME_IDS, type ThemeId} from '../Themes/ThemeRegistry';

export type TemplateCategory = keyof typeof CATEGORY_VOICE_PROFILES;

/**
 * Everything the engine needs to know about a template. A template owns its
 * content schema and turns validated content into scenes; previewing,
 * validating, timing and rendering are generic and never mention a template
 * by name.
 */
export type TemplateDefinition<Schema extends z.ZodType> = {
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
	/** Intended length of the video without its outro. Rendering outside it is reported as a warning. */
	targetSeconds?: {min: number; max: number};
	/** Persistent chrome above the scenes. Hidden during the outro. */
	renderOverlay?: (content: z.output<Schema>, plan: ScenePlan) => ReactNode;
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

export const templateDurationInFrames = (
	template: AnyTemplateDefinition,
	content: unknown,
	fps: number,
	voiceClips: VoiceClips = {},
): number =>
	planTemplateScenes(template.buildScenes(content, voiceClips), template.transition, fps).durationInFrames;

export const compositionId = (templateId: string, formatId: VideoFormatId): string =>
	`${templateId}-${formatId}`;
