import React from 'react';
import {Folder} from 'remotion';
import {AppScreenComposition} from './Compositions/AppScreenComposition';
import {GoogleAdsComposition} from './Ads/Google/GoogleAdsComposition';
import {StoreComposition} from './Compositions/StoreComposition';
import {UIUXComposition} from './UIUX/UIUXComposition';
import {PitchDeckComposition} from './PitchDeck/PitchDeckComposition';
import {ImageCategoryFolder} from './Compositions/ImageCompositions';
import {TemplateCompositions} from './Compositions/TemplateCompositions';
import {IMAGE_CATEGORIES, imageVariantsOf} from './Images/ImageTemplateRegistry';
import {TEMPLATES} from './Templates/TemplateRegistry';

const CATEGORIES = [...new Set(TEMPLATES.map((template) => template.category))];

/**
 * Videos: every registered video template in every format, grouped by category.
 * Images: every registered image design, grouped by category, under "Images".
 * AppScreens: the drawn mobile app screens, as pictures.
 * Store: App Store and Google Play screenshots and the Play feature graphic.
 * PitchDeck: the investor deck pages (npm run pitch-deck).
 */
export const Root: React.FC = () => (
	<>
		<AppScreenComposition />
		<StoreComposition />
		<GoogleAdsComposition />
		<UIUXComposition />
		<PitchDeckComposition />
		<Folder name="Images">
			{IMAGE_CATEGORIES.map((category) => (
				<ImageCategoryFolder key={category} category={category} templates={imageVariantsOf(category)} />
			))}
		</Folder>
		{CATEGORIES.map((category) => (
			<Folder key={category} name={category}>
				{TEMPLATES.filter((template) => template.category === category).map((template) => (
					<TemplateCompositions key={template.id} template={template} />
				))}
			</Folder>
		))}
	</>
);
