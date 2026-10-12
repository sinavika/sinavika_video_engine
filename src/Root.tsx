import React from 'react';
import {Folder} from 'remotion';
import {ImageCategoryFolder} from './Compositions/ImageCompositions';
import {TemplateCompositions} from './Compositions/TemplateCompositions';
import {IMAGE_CATEGORIES, imageVariantsOf} from './Images/ImageTemplateRegistry';
import {TEMPLATES} from './Templates/TemplateRegistry';

const CATEGORIES = [...new Set(TEMPLATES.map((template) => template.category))];

/**
 * Videos: every registered video template in every format, grouped by category.
 * Images: every registered image design, grouped by category, under "Images".
 */
export const Root: React.FC = () => (
	<>
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
