import type {AnyImageTemplateDefinition} from './ImageTemplateDefinition';
import {Update} from './Templates/Announcements/Update';
import {Offer} from './Templates/Campaigns/Offer';
import {PromoDeck} from './Templates/Campaigns/PromoDeck';
import {PromoStory} from './Templates/Campaigns/PromoStory';
import {SlideDeck} from './Templates/Carousels/SlideDeck';
import {TipList} from './Templates/ExamTips/TipList';
import {Spotlight} from './Templates/FeatureSpotlights/Spotlight';
import {BoldQuestion} from './Templates/HookContents/BoldQuestion';
import {MythFact} from './Templates/HookContents/MythFact';
import {Process} from './Templates/Infographics/Process';
import {Stats} from './Templates/Infographics/Stats';
import {DualPhones} from './Templates/MobilePromotions/DualPhones';
import {HeroPhone} from './Templates/MobilePromotions/HeroPhone';
import {AppTrio} from './Templates/ProfileGrids/AppTrio';
import {GrowthLine} from './Templates/ProfileGrids/GrowthLine';
import {QuestionCard} from './Templates/QuestionSolutions/QuestionCard';
import {SolutionSteps} from './Templates/QuestionSolutions/SolutionSteps';
import {CampCover} from './Templates/Thumbnails/CampCover';
import {VideoCover} from './Templates/Thumbnails/VideoCover';
import {ConceptCard} from './Templates/TopicExplanations/ConceptCard';
import {Timeline} from './Templates/TopicExplanations/Timeline';
import {BrowserHero} from './Templates/WebPromotions/BrowserHero';
import {DeviceDuo} from './Templates/WebPromotions/DeviceDuo';

/**
 * Every image design, grouped by category. The first design listed for a
 * category is its default variant.
 *
 * Adding a design: create its file and add one line here. This registry is
 * separate from the video TemplateRegistry on purpose: the two sides evolve
 * independently and only share the design system.
 */
export const IMAGE_TEMPLATES: readonly AnyImageTemplateDefinition[] = [
	HeroPhone,
	DualPhones,
	BrowserHero,
	DeviceDuo,
	QuestionCard,
	SolutionSteps,
	ConceptCard,
	Timeline,
	BoldQuestion,
	MythFact,
	Spotlight,
	Stats,
	Process,
	TipList,
	SlideDeck,
	Update,
	Offer,
	PromoDeck,
	PromoStory,
	VideoCover,
	CampCover,
	GrowthLine,
	AppTrio,
];

export const IMAGE_CATEGORIES: readonly string[] = [...new Set(IMAGE_TEMPLATES.map((template) => template.category))];

export const imageVariantsOf = (category: string): AnyImageTemplateDefinition[] =>
	IMAGE_TEMPLATES.filter((template) => template.category === category);

/** The named variant of a category, or the category's first design when no variant is given. */
export const findImageTemplate = (category: string, variant?: string): AnyImageTemplateDefinition | undefined =>
	imageVariantsOf(category).find((template) => !variant || template.variant === variant);
