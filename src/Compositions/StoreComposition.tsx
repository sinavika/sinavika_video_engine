import React from 'react';
import {Composition, Folder} from 'remotion';
import {StoreSet} from '../Store/StoreSet';
import {STORE_SET_ID, StoreSetPropsSchema, type StoreSetProps} from '../Store/StoreProps';

const DEFAULT_PROPS: StoreSetProps = StoreSetPropsSchema.parse({});

/** App Store and Google Play pictures: one composition, sized from its props (see Store/StoreListing.ts). */
export const StoreComposition: React.FC = () => (
	<Folder name="Store">
		<Composition
			id={STORE_SET_ID}
			component={StoreSet}
			schema={StoreSetPropsSchema}
			defaultProps={DEFAULT_PROPS}
			durationInFrames={1}
			fps={30}
			width={DEFAULT_PROPS.width}
			height={DEFAULT_PROPS.height}
			calculateMetadata={({props}) => {
				const parsed = StoreSetPropsSchema.parse(props);
				return {props: parsed, width: parsed.width, height: parsed.height};
			}}
		/>
	</Folder>
);
