import {AppPromotion} from './Advertisements/AppPromotion/AppPromotion';
import {ConceptExplanation} from './Education/ConceptExplanation/ConceptExplanation';
import {ExamPreparation} from './Education/ExamPreparation/ExamPreparation';
import {QuestionSolution} from './Education/QuestionSolution/QuestionSolution';
import {QuickRevision} from './Education/QuickRevision/QuickRevision';
import {TopicExplanation} from './Education/TopicExplanation/TopicExplanation';
import type {AnyTemplateDefinition} from './TemplateDefinition';

/**
 * Adding a template: create its folder and add one line here. Studio
 * compositions, job validation, duration and rendering all read from this list.
 */
export const TEMPLATES: readonly AnyTemplateDefinition[] = [
	QuestionSolution,
	TopicExplanation,
	QuickRevision,
	ConceptExplanation,
	ExamPreparation,
	AppPromotion,
];

export const TEMPLATE_IDS: readonly string[] = TEMPLATES.map((template) => template.id);

export const findTemplate = (id: string): AnyTemplateDefinition | undefined =>
	TEMPLATES.find((template) => template.id === id);
