import {AppPromotion} from './Advertisements/AppPromotion/AppPromotion';
import {ExamJourney} from './Advertisements/ExamJourney/ExamJourney';
import {Keynote} from './Advertisements/Keynote/Keynote';
import {BeforeAfter} from './Advertisements/BeforeAfter/BeforeAfter';
import {CountdownChat} from './Advertisements/CountdownChat/CountdownChat';
import {GoogleVideoAd} from './Advertisements/GoogleVideoAd/GoogleVideoAd';
import {FlatMorph} from './Advertisements/FlatMorph/FlatMorph';
import {KineticType} from './Advertisements/KineticType/KineticType';
import {NightDesk} from './Advertisements/NightDesk/NightDesk';
import {OrbReveal} from './Advertisements/OrbReveal/OrbReveal';
import {ProfilePicker} from './Advertisements/ProfilePicker/ProfilePicker';
import {SinoAIFilm} from './Advertisements/SinoAIFilm/SinoAIFilm';
import {AppShowcase} from './Advertisements/AppShowcase/AppShowcase';
import {CourseLesson} from './Courses/CourseLesson/CourseLesson';
import {CourseShort} from './Courses/CourseShort/CourseShort';
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
	ExamJourney,
	SinoAIFilm,
	ProfilePicker,
	OrbReveal,
	Keynote,
	KineticType,
	NightDesk,
	FlatMorph,
	CountdownChat,
	BeforeAfter,
	GoogleVideoAd,
	AppShowcase,
	CourseLesson,
	CourseShort,
];

export const TEMPLATE_IDS: readonly string[] = TEMPLATES.map((template) => template.id);

export const findTemplate = (id: string): AnyTemplateDefinition | undefined =>
	TEMPLATES.find((template) => template.id === id);
