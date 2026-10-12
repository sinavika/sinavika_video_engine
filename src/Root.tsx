import React from 'react';
import {Folder} from 'remotion';
import {TemplateCompositions} from './Compositions/TemplateCompositions';
import {TEMPLATES} from './Templates/TemplateRegistry';

const CATEGORIES = [...new Set(TEMPLATES.map((template) => template.category))];

/** Every registered template, in every video format, grouped by category. */
export const Root: React.FC = () => (
	<>
		{CATEGORIES.map((category) => (
			<Folder key={category} name={category}>
				{TEMPLATES.filter((template) => template.category === category).map((template) => (
					<TemplateCompositions key={template.id} template={template} />
				))}
			</Folder>
		))}
	</>
);
