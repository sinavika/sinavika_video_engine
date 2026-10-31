import {AppPromotion} from './Advertisements/AppPromotion/AppPromotion';
import {ExamJourney} from './Advertisements/ExamJourney/ExamJourney';
import {Keynote} from './Advertisements/Keynote/Keynote';
import {BeforeAfter} from './Advertisements/BeforeAfter/BeforeAfter';
import {CountdownChat} from './Advertisements/CountdownChat/CountdownChat';
import {GoogleVideoAd} from './Advertisements/GoogleVideoAd/GoogleVideoAd';
import {FlatMorph} from './Advertisements/FlatMorph/FlatMorph';
import {KineticType} from './Advertisements/KineticType/KineticType';
import {RepublicDay} from './Advertisements/RepublicDay/RepublicDay';
import {NightDesk} from './Advertisements/NightDesk/NightDesk';
import {OrbReveal} from './Advertisements/OrbReveal/OrbReveal';
import {ProfilePicker} from './Advertisements/ProfilePicker/ProfilePicker';
import {SinoAIFilm} from './Advertisements/SinoAIFilm/SinoAIFilm';
import {SlotSpin} from './Advertisements/SlotSpin/SlotSpin';
import {TearCalendar} from './Advertisements/TearCalendar/TearCalendar';
import {FocusTimer} from './Advertisements/FocusTimer/FocusTimer';
import {StudyReceipt} from './Advertisements/StudyReceipt/StudyReceipt';
import {SplitDay} from './Advertisements/SplitDay/SplitDay';
import {ThreeModes} from './Advertisements/ThreeModes/ThreeModes';
import {AtaturkMemorial} from './Advertisements/AtaturkMemorial/AtaturkMemorial';
import {NotebookDoodle} from './Advertisements/NotebookDoodle/NotebookDoodle';
import {PrintShop} from './Advertisements/PrintShop/PrintShop';
import {GroupChat} from './Advertisements/GroupChat/GroupChat';
import {StudyForecast} from './Advertisements/StudyForecast/StudyForecast';
import {PuzzleGap} from './Advertisements/PuzzleGap/PuzzleGap';
import {ScanViewfinder} from './Advertisements/ScanViewfinder/ScanViewfinder';
import {PovText} from './Advertisements/PovText/PovText';
import {CardTrick} from './Advertisements/CardTrick/CardTrick';
import {Basogretmen} from './Advertisements/Basogretmen/Basogretmen';
import {BlockWeek} from './Advertisements/BlockWeek/BlockWeek';
import {CampTrailer} from './Advertisements/CampTrailer/CampTrailer';
import {DualScreen} from './Advertisements/DualScreen/DualScreen';
import {LevelSelect} from './Advertisements/LevelSelect/LevelSelect';
import {AppShowcase} from './Advertisements/AppShowcase/AppShowcase';
import {CampIntro} from './Camps/CampIntro/CampIntro';
import {CampLesson} from './Camps/CampLesson/CampLesson';
import {CampShort} from './Camps/CampShort/CampShort';
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
	RepublicDay,
	NightDesk,
	FlatMorph,
	CountdownChat,
	BeforeAfter,
	SlotSpin,
	TearCalendar,
	FocusTimer,
	StudyReceipt,
	SplitDay,
	ThreeModes,
	AtaturkMemorial,
	NotebookDoodle,
	PrintShop,
	GroupChat,
	StudyForecast,
	PuzzleGap,
	ScanViewfinder,
	PovText,
	CardTrick,
	Basogretmen,
	BlockWeek,
	CampTrailer,
	DualScreen,
	LevelSelect,
	GoogleVideoAd,
	AppShowcase,
	CourseLesson,
	CourseShort,
	CampLesson,
	CampShort,
	CampIntro,
];

export const TEMPLATE_IDS: readonly string[] = TEMPLATES.map((template) => template.id);

export const findTemplate = (id: string): AnyTemplateDefinition | undefined =>
	TEMPLATES.find((template) => template.id === id);
