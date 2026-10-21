import React from 'react';
import {Composition, Folder} from 'remotion';
import {z} from 'zod';
import {VideoFrame} from '../Components/Layouts/VideoFrame';
import {UIProvider} from '../UIUX/Context';
import {DECK} from './PitchDeckParts';
import {PITCH_DECK_ID, PITCH_DECK_PAGE_COUNT} from './PitchDeckDeck';
import {PITCH_DECK_SLIDES} from './PitchDeckSlides';

/** The investor deck as 1920×1080 pictures: one composition, the page number in the props. */
export const PitchDeckPropsSchema = z.object({
	slide: z.number().int().min(1).max(PITCH_DECK_PAGE_COUNT).default(1),
});
export type PitchDeckProps = z.infer<typeof PitchDeckPropsSchema>;

const SlidePicture: React.FC<PitchDeckProps> = ({slide}) => {
	const Page = PITCH_DECK_SLIDES[slide - 1];
	return (
		<VideoFrame themeId="SinavikaLight" lang="tr">
			<UIProvider lang="tr" mode="light">
				<Page />
			</UIProvider>
		</VideoFrame>
	);
};

export const PitchDeckComposition: React.FC = () => (
	<Folder name="PitchDeck">
		<Composition id={PITCH_DECK_ID} component={SlidePicture} schema={PitchDeckPropsSchema} defaultProps={PitchDeckPropsSchema.parse({})} durationInFrames={1} fps={30} width={DECK.width} height={DECK.height} />
	</Folder>
);
