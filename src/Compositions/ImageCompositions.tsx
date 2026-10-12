import React, {useMemo} from 'react';
import {Composition, Folder, Freeze} from 'remotion';
import {VideoFrame} from '../Components/Layouts/VideoFrame';
import {imageCompositionId, type AnyImageTemplateDefinition} from '../Images/ImageTemplateDefinition';
import {IMAGE_SIZES} from '../Images/Schemas/ImageSizes';
import {createImagePropsSchema, type ImageProps} from '../Images/Schemas/ImageProps';
import {applyPalette} from '../Themes/ColorPalette';
import {getTheme} from '../Themes/ThemeRegistry';

/**
 * Shared components that animate (diagrams, highlights) are frozen at a
 * frame where every entrance has long finished, so an image shows them in
 * their final state. Remotion clamps the frame to the composition's length,
 * which is why an image is registered as a composition this long rather than
 * as a one-frame still; whichever frame is rendered, the picture is the same.
 */
const SETTLED_FRAME = 600;
const IMAGE_FPS = 30;

const createImageComponent = (template: AnyImageTemplateDefinition) => {
	const TemplateImage: React.FC<ImageProps<unknown>> = ({theme, palette, content, page}) => {
		const paletteTheme = useMemo(() => (palette ? applyPalette(getTheme(theme), palette) : undefined), [theme, palette]);
		return (
			<VideoFrame themeId={theme} theme={paletteTheme}>
				<Freeze frame={SETTLED_FRAME}>
					<template.Component content={content} page={page} />
				</Freeze>
			</VideoFrame>
		);
	};
	TemplateImage.displayName = `${template.category}${template.variant}`;
	return TemplateImage;
};

/** Registers an image design. Its size comes from the props, so one composition serves every format. */
export const ImageCompositions: React.FC<{template: AnyImageTemplateDefinition}> = ({template}) => {
	const {component, schema, defaultProps} = useMemo(() => {
		const propsSchema = createImagePropsSchema(template.contentSchema);
		const {width, height} = IMAGE_SIZES[template.defaultSize];
		return {
			component: createImageComponent(template),
			schema: propsSchema,
			defaultProps: propsSchema.parse({theme: template.defaultTheme, size: {width, height}, content: template.sampleContent}),
		};
	}, [template]);

	return (
		<Composition
			id={imageCompositionId(template.category, template.variant)}
			durationInFrames={SETTLED_FRAME + 1}
			fps={IMAGE_FPS}
			component={component}
			schema={schema}
			defaultProps={defaultProps}
			width={defaultProps.size.width}
			height={defaultProps.size.height}
			calculateMetadata={({props}) => {
				const parsed = schema.parse(props);
				return {props: parsed, width: parsed.size.width, height: parsed.size.height};
			}}
		/>
	);
};

/** All designs of one category, in a Studio folder of their own. */
export const ImageCategoryFolder: React.FC<{category: string; templates: AnyImageTemplateDefinition[]}> = ({category, templates}) => (
	<Folder name={category}>
		{templates.map((template) => (
			<ImageCompositions key={template.variant} template={template} />
		))}
	</Folder>
);
