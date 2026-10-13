import React, {useMemo} from 'react';
import {Audio, Composition, Folder, Img, Sequence, staticFile, useVideoConfig} from 'remotion';
import {VideoFrame} from '../Components/Layouts/VideoFrame';
import {VIDEO_COVER} from '../Configurations/VideoCover';
import {DEFAULT_FPS, VIDEO_FORMATS, VIDEO_FORMAT_IDS} from '../Configurations/VideoFormats';
import {OUTRO_SCENE_ID} from '../Scenes/BrandOutroScene';
import {SceneSeries} from '../Scenes/SceneSeries';
import {createVideoPropsSchema, type VideoProps} from '../Schemas/VideoProps';
import {
	compositionId,
	templateDurationInFrames,
	type AnyTemplateDefinition,
} from '../Templates/TemplateDefinition';
import {lessonTheme} from '../Themes/LessonAccent';

/** The component Remotion renders for a template: theme and fonts around the template's scenes. */
const createVideoComponent = (template: AnyTemplateDefinition) => {
	const TemplateVideo: React.FC<VideoProps<unknown>> = ({theme, content, voiceClips, lesson, coverSrc, soundtrackSrc}) => {
		const scenes = useMemo(() => template.buildScenes(content, voiceClips), [content, voiceClips]);
		const {fps} = useVideoConfig();
		return (
			<VideoFrame themeId={theme} theme={lessonTheme(theme, lesson)}>
				<SceneSeries
					scenes={scenes}
					transition={template.transition}
					overlay={template.renderOverlay ? (plan) => template.renderOverlay?.(content, plan) : undefined}
					overlayEndsAt={OUTRO_SCENE_ID}
					voiceClips={voiceClips}
				/>
				{soundtrackSrc ? <Audio src={staticFile(soundtrackSrc)} /> : null}
				{coverSrc ? (
					<Sequence name="Cover" durationInFrames={Math.max(1, Math.round(VIDEO_COVER.holdSeconds * fps))}>
						<Img src={staticFile(coverSrc)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
					</Sequence>
				) : null}
			</VideoFrame>
		);
	};
	TemplateVideo.displayName = template.id;
	return TemplateVideo;
};

/**
 * Registers one composition per video format for a template. Props are
 * validated here, so a composition can never be rendered with content its
 * template would draw incorrectly; duration and FPS follow from the props.
 */
export const TemplateCompositions: React.FC<{template: AnyTemplateDefinition}> = ({template}) => {
	const {component, schema, defaultProps} = useMemo(() => {
		const propsSchema = createVideoPropsSchema(template.contentSchema, template.supportedThemes);
		return {
			component: createVideoComponent(template),
			schema: propsSchema,
			defaultProps: propsSchema.parse({
				theme: template.defaultTheme,
				fps: DEFAULT_FPS,
				content: template.sampleContent,
			}),
		};
	}, [template]);

	return (
		<Folder name={template.id}>
			{VIDEO_FORMAT_IDS.map((formatId) => {
				const format = VIDEO_FORMATS[formatId];
				return (
					<Composition
						key={formatId}
						id={compositionId(template.id, formatId)}
						component={component}
						schema={schema}
						defaultProps={defaultProps}
						width={format.width}
						height={format.height}
						fps={DEFAULT_FPS}
						durationInFrames={templateDurationInFrames(template, defaultProps.content, DEFAULT_FPS)}
						calculateMetadata={({props}) => {
							const parsed = schema.parse(props);
							return {
								props: parsed,
								fps: parsed.fps,
								durationInFrames: templateDurationInFrames(template, parsed.content, parsed.fps, parsed.voiceClips),
							};
						}}
					/>
				);
			})}
		</Folder>
	);
};
