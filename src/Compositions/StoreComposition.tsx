import React from 'react';
import {Composition, Folder} from 'remotion';
import {StoreScreenshot} from '../Store/StoreScreenshot';
import {STORE_COMPOSITION_ID, StoreScreenshotPropsSchema, type StoreScreenshotProps} from '../Store/StoreProps';

const DEFAULT_PROPS: StoreScreenshotProps = StoreScreenshotPropsSchema.parse({});

/** App Store and Google Play pictures: one composition, sized from its props (see Store/StoreListing.ts). */
export const StoreComposition: React.FC = () => (
	<Folder name="Store">
		<Composition
			id={STORE_COMPOSITION_ID}
			component={StoreScreenshot}
			schema={StoreScreenshotPropsSchema}
			defaultProps={DEFAULT_PROPS}
			durationInFrames={1}
			fps={30}
			width={DEFAULT_PROPS.width}
			height={DEFAULT_PROPS.height}
			calculateMetadata={({props}) => {
				const parsed = StoreScreenshotPropsSchema.parse(props);
				return {props: parsed, width: parsed.width, height: parsed.height};
			}}
		/>
	</Folder>
);
