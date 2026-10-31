import React from 'react';
import {z} from 'zod';
import {AbsoluteFill} from 'remotion';
import {findConcept, type AdExam} from '../../../Ads/Google/GoogleAdsPlan';
import {ProofCard} from '../../../Ads/Google/ProofCard';
import {BrandMark} from '../../../Components/Overlays/BrandMark';
import {Text} from '../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../Configurations/BrandTypography';
import {plainText} from '../../../Schemas/RichText';
import {PhoneShot, BrowserShot} from '../../../Templates/Advertisements/PromoKit/PromoKit';
import {PROMO_PHONE_SCREEN_NAMES, PROMO_PHONE_SCREENS, PROMO_WEB_SCREEN_NAMES, PROMO_WEB_SCREENS} from '../../../Templates/Advertisements/PromoKit/PromoScreens';
import {Icon} from '../../../UIUX/Icons';
import {MODULES, MODULE_ORDER, type ModuleKey} from '../../../UIUX/ModuleIdentity';
import {BRAND_COLORS} from '../../../Configurations/BrandColors';
import {POST_TYPE} from '../../../Configurations/SocialIdentity';
import {BrandCover, coverIssues, markPaint, useCoverLayout, type BrandCoverText} from '../../Components/BrandCover';
import {imageFrameOf, useImageLayout} from '../../Components/ImageFrame';
import {lineCount, overflowNote, seriesSize} from '../../Components/TextMeasure';
import {defineImageTemplate} from '../../ImageTemplateDefinition';
import {GRID_ICON_ROOM} from '../ProfileGrids/ProfileGridLayout';

/**
 * The promotion campaign's posts (Ekim 2026): one schema, six looks, so each
 * post in the calendar has its own design while sharing the slide kinds.
 *
 * - floating: white, tilted floating cards (folio-style feature cards)
 * - tool:     SinoAI; white and ink, neutral, one tool per slide
 * - proof:    the module's colour and a big white proof card (Google Ads set)
 * - rail:     light, big step numbers on a rail
 * - browser:  warm dark desk light, the web panel in a browser window
 * - persona:  bold colour blocks, one kind of student per slide
 * - mood:      a day's mood as the kicker, its situation as the title, the
 *              one module for that day as a big card beside its screen
 * - prompt:    SinoAI's composer: each title sits in the input box as the
 *              sentence to type, the answer's screen under it
 * - diagnosis: navy; one reason per page, its number in a fixed orange box
 * - flow:      a flowchart on dotted paper: the worry in a node, an arrow,
 *              the module that answers it in its own colour
 * - checklist: navy with a ruled paper card: one question, one empty box
 *   (the last five added for Kasım 2026)
 *
 * The first image of every post is the cover and follows the one cover
 * standard (Images/Components/BrandCover): navy, logo top left, label and
 * title with one marked phrase, whatever the look; the looks start from the
 * second image. Everything stays inside what the profile grid shows of the
 * post and clear of Instagram's corner icon (gridInsets). A title can mark one word or
 * phrase (`emphasis`) on the accent, chosen for what the post sells, never
 * the last word by default (Tuğçe's review, 26 Oct 2026).
 *
 * No page counter or progress bar (carousel rule). A cover may carry a
 * small "Kaydır" cue when its job asks for one (`swipe`), as the brand owner
 * asked for the persona carousel (October 2026).
 *
 * Type is fixed (Configurations/SocialIdentity, POST_TYPE): every page after
 * the cover sets its title in the post's one size, and the pictures start
 * under the deepest text of the post, the same place on every page
 * (deckLayout). A post whose text does not fit is refused before rendering
 * (checkLayout).
 */

const MODULE_KEYS = MODULE_ORDER as unknown as [ModuleKey, ...ModuleKey[]];
const ICONS = ['grad', 'target', 'briefcase', 'eye', 'book', 'quiz', 'exam', 'cards', 'calendar', 'note', 'layers', 'sparkles', 'chat', 'image', 'upload', 'clock', 'moon', 'flame', 'globe', 'phone', 'check', 'play', 'camera', 'list', 'chart', 'bookmark'] as const;

const SlideSchema = z.object({
	kind: z.enum(['cover', 'feature', 'step', 'persona', 'proof', 'closing']),
	kicker: plainText(30).optional(),
	title: plainText(70),
	/** The word or phrase of the title set on the accent, e.g. the verb the post sells ("çöz"). Must appear in the title. */
	emphasis: plainText(30).optional(),
	text: plainText(140).optional(),
	module: z.enum(MODULE_KEYS).optional(),
	icon: z.enum(ICONS).optional(),
	number: plainText(4).optional(),
	phone: z.enum(PROMO_PHONE_SCREEN_NAMES).optional(),
	web: z.enum(PROMO_WEB_SCREEN_NAMES).optional(),
	/** A Google Ads concept whose proof card the slide shows: "yks/net-kaybi". */
	proof: z.string().regex(/^(yks|kpss)\/[a-z-]+$/).optional(),
	/** On the cover of the floating look: the module cards fanned out. */
	fan: z.boolean().optional(),
	/** On a cover: a small "Kaydır" cue, bottom right. */
	swipe: z.boolean().optional(),
}).refine((slide) => !slide.emphasis || slide.title.includes(slide.emphasis), {path: ['emphasis'], message: 'emphasis must be a part of the title.'});
type Slide = z.infer<typeof SlideSchema>;

const PromoDeckSchema = z.object({
	name: plainText(60),
	look: z.enum(['floating', 'tool', 'proof', 'rail', 'browser', 'persona', 'mood', 'prompt', 'diagnosis', 'flow', 'checklist']),
	module: z.enum(MODULE_KEYS).default('exam'),
	slides: z.array(SlideSchema).min(1).max(10),
});
type Content = z.infer<typeof PromoDeckSchema>;

const {brand, light, dark} = BRAND_COLORS;
const INK = brand.textPrimary;
const GREY = light.textSecondary;
const LINE = light.border;
const ORANGE = brand.primary;
const moduleColor = (key: ModuleKey) => (key === 'sinoAi' ? '#334155' : MODULES[key].color.light);

/** Look-dependent paint. */
const LOOK = {
	floating: {ground: `radial-gradient(90% 70% at 50% 20%, #FFFFFF 0%, ${light.surfaceLow} 60%, ${light.surfaceContainer} 100%)`, ink: INK, soft: GREY, accent: ORANGE},
	tool: {ground: '#FFFFFF', ink: INK, soft: GREY, accent: INK},
	proof: {ground: '', ink: '#FFFFFF', soft: 'rgba(255,255,255,0.86)', accent: '#FFFFFF'},
	rail: {ground: light.background, ink: INK, soft: GREY, accent: ORANGE},
	browser: {ground: 'radial-gradient(60% 40% at 85% 0%, rgba(234,88,12,0.28) 0%, rgba(234,88,12,0) 70%), linear-gradient(165deg, #1B2B44 0%, #0B1C30 55%, #070F1C 100%)', ink: '#FFFFFF', soft: dark.textSecondary, accent: dark.primaryAccent},
	persona: {ground: '', ink: '#FFFFFF', soft: 'rgba(255,255,255,0.86)', accent: '#FFFFFF'},
	mood: {ground: `linear-gradient(180deg, #FFFFFF 0%, ${light.background} 100%)`, ink: INK, soft: GREY, accent: ORANGE},
	prompt: {ground: '#FFFFFF', ink: INK, soft: GREY, accent: INK},
	diagnosis: {ground: 'linear-gradient(165deg, #1B2B44 0%, #0B1C30 100%)', ink: '#FFFFFF', soft: dark.textSecondary, accent: ORANGE},
	flow: {ground: `radial-gradient(circle, #CBD5E1 1.6px, transparent 1.9px) 0 0 / 38px 38px, ${light.background}`, ink: INK, soft: GREY, accent: ORANGE},
	checklist: {ground: '#0B1C30', ink: '#FFFFFF', soft: dark.textSecondary, accent: ORANGE},
} as const;

/** Looks whose ground is dark or a strong colour: the kicker and its icon go white there. */
const ON_DARK = new Set<Content['look']>(['proof', 'persona', 'browser', 'diagnosis', 'checklist']);

const PROOF_GROUND: Partial<Record<ModuleKey, string>> = {exam: 'linear-gradient(150deg, #F26B1D, #C2410C)', studyPlan: 'linear-gradient(150deg, #14B8A6, #0F766E)', smartSummary: 'linear-gradient(150deg, #8B5CF6, #5B21B6)', flashcards: 'linear-gradient(150deg, #EC4899, #9D174D)', lessons: 'linear-gradient(150deg, #0EA5E9, #0369A1)', tests: 'linear-gradient(150deg, #6366F1, #3730A3)', sinoAi: 'linear-gradient(150deg, #334155, #0F172A)'};

const groundOf = (content: Content, slide: Slide): string => {
	if (content.look === 'proof') return PROOF_GROUND[slide.module ?? content.module] ?? PROOF_GROUND.exam!;
	if (content.look === 'persona') return slide.kind === 'cover' || slide.kind === 'closing' ? INK : PROOF_GROUND[slide.module ?? content.module] ?? PROOF_GROUND.exam!;
	return LOOK[content.look].ground;
};

/** The title, with its `emphasis` set white on the accent like the reel covers. */
const Title: React.FC<{slide: Slide; accent: string}> = ({slide, accent}) => {
	if (!slide.emphasis) return <>{slide.title}</>;
	const at = slide.title.indexOf(slide.emphasis);
	// Punctuation right after the marked words goes on the mark too ("çöz."), as on the reel covers.
	const end = at + slide.emphasis.length + (slide.title.slice(at + slide.emphasis.length).match(/^[.!?…]+/)?.[0].length ?? 0);
	return (
		<>
			{slide.title.slice(0, at)}
			<span style={{background: markPaint(accent), color: '#FFFFFF', padding: '0 0.12em', borderRadius: '0.12em', boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone'}}>{slide.title.slice(at, end)}</span>
			{slide.title.slice(end)}
		</>
	);
};

/**
 * A big step number in a box of fixed width, centred, in tabular figures. A
 * narrow "1" set left-aligned looked smaller than "2" and "3" (Tuğçe's review,
 * 26 Oct 2026); narrow figures also get a slight optical boost.
 */
const StepNumber: React.FC<{value: string; color: string}> = ({value, color}) => (
	<div style={{width: 240, display: 'flex', justifyContent: 'center'}}>
		<Text variant="display" size={300} weight={TYPE.weights.kinetic} color={color} align="center" style={{lineHeight: 0.9, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums lining-nums', transform: /^[17]$/.test(value) ? 'scale(1.08)' : undefined}}>
			{value}
		</Text>
	</div>
);

const Abs: React.FC<{x: number; y: number; w?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({x, y, w, style, children}) => <div style={{position: 'absolute', left: x, top: y, width: w, ...style}}>{children}</div>;

const Phone: React.FC<{screen: Slide['phone']; width: number; rotate?: number}> = ({screen, width, rotate}) => {
	if (!screen) return null;
	const Screen = PROMO_PHONE_SCREENS[screen];
	return (
		<div style={{filter: 'drop-shadow(0 40px 60px rgba(15,23,42,0.28))'}}>
			<PhoneShot width={width} rotate={rotate}>
				<Screen />
			</PhoneShot>
		</div>
	);
};

const Browser: React.FC<{screen: Slide['web']; width: number}> = ({screen, width}) => {
	if (!screen) return null;
	const Screen = PROMO_WEB_SCREENS[screen];
	return (
		<div style={{filter: 'drop-shadow(0 40px 70px rgba(0,0,0,0.45))'}}>
			<BrowserShot width={width} title="sinavika.com">
				<Screen />
			</BrowserShot>
		</div>
	);
};

/** The persona cover: one tile per student type of the deck, in its module's colour, so the first slide already asks "which one are you?". */
const PersonaGrid: React.FC<{content: Content; height: number; top: number}> = ({content, height, top}) => {
	const {insets} = useImageLayout();
	const people = content.slides.filter((slide) => slide.kind === 'persona').slice(0, 4);
	return (
		<div style={{position: 'absolute', left: insets.left, right: insets.right, top, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28}}>
			{people.map((person, index) => (
				<div key={person.kicker ?? index} style={{height: height * 0.2, borderRadius: 36, background: PROOF_GROUND[person.module ?? content.module] ?? PROOF_GROUND.exam, padding: 30, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 30px 50px -30px rgba(0,0,0,0.6)', transform: `rotate(${index % 2 === 0 ? -1.5 : 1.5}deg)`}}>
					<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
						<div style={{width: 64, height: 64, borderRadius: 20, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							{person.icon ? <Icon name={person.icon} size={36} color="#FFFFFF" stroke={2.2} /> : null}
						</div>
						<Text size={30} weight={TYPE.weights.display} color="rgba(255,255,255,0.7)">
							{index + 1}
						</Text>
					</div>
					<Text size={P.personaName} weight={TYPE.weights.kinetic} color="#FFFFFF" style={{lineHeight: 1.05}}>
						{person.kicker}
					</Text>
				</div>
			))}
		</div>
	);
};

/**
 * The fanned module cards of the floating cover, spaced to stay inside what the profile grid shows (the outer cards
 * were cut, 26 Oct 2026). The middle card lies on top; cards right of it carry their name on the right, where no
 * neighbour covers it.
 */
const Fan: React.FC<{height: number; top: number}> = ({height, top}) => {
	const keys = MODULE_ORDER;
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top, height: height * 0.5}}>
			{keys.map((key, index) => {
				const offset = index - (keys.length - 1) / 2;
				return (
					<div key={key} style={{position: 'absolute', left: '50%', top: 60 + offset * offset * 12, width: 146, height: 210, marginLeft: -73, transform: `translateX(${offset * 108}px) rotate(${offset * 4}deg)`, transformOrigin: '50% 120%', borderRadius: 36, background: '#FFFFFF', boxShadow: '0 30px 60px -28px rgba(15,23,42,0.35)', border: `2px solid ${LINE}`, padding: 14, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: offset > 0 ? 'flex-end' : 'flex-start', textAlign: offset > 0 ? 'right' : 'left', zIndex: 10 - Math.abs(Math.round(offset))}}>
						<div style={{width: 62, height: 62, borderRadius: 20, background: `${moduleColor(key)}1F`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							<Icon name={MODULES[key].icon} size={34} color={moduleColor(key)} stroke={2} />
						</div>
						<Text size={20} weight={TYPE.weights.display} color={INK} align={offset > 0 ? 'right' : 'left'} style={{lineHeight: 1.1, wordBreak: 'keep-all', overflowWrap: 'normal'}}>
							{MODULES[key].name.tr}
						</Text>
					</div>
				);
			})}
		</div>
	);
};

const Closing: React.FC<{content: Content; slide: Slide; height: number}> = ({content, slide, height}) => {
	const paint = LOOK[content.look];
	return (
		<div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 46, padding: CLOSING_PADDING, textAlign: 'center'}}>
			<BrandMark size="hero" color={paint.ink} />
			<Text variant="display" size={P.closingTitle} weight={TYPE.weights.kinetic} color={paint.ink} align="center" style={{lineHeight: 1.08}}>
				{slide.title}
			</Text>
			{slide.text ? (
				<Text size={P.closingText} weight={TYPE.weights.strong} color={paint.soft} align="center" style={{lineHeight: 1.3}}>
					{slide.text}
				</Text>
			) : null}
			<div style={{height: height * 0.02}} />
		</div>
	);
};

/**
 * The first image of a post: the one cover standard, with the slide's picture
 * (phone, browser, proof, fanned modules or student types) under the title.
 */
const CoverSlide: React.FC<{content: Content; slide: Slide}> = ({content, slide}) => {
	const {width, height} = useImageLayout();
	const persona = (content.look === 'persona' || content.look === 'mood') && slide.kind === 'cover';
	const pictured = Boolean(slide.fan || persona || slide.proof || slide.web || slide.phone);
	const text: BrandCoverText = {title: slide.title, emphasis: slide.emphasis, tag: slide.kicker, tagColor: slide.module ? moduleColor(slide.module) : undefined};
	const cover = useCoverLayout(text, {centred: !pictured});
	const top = cover.textBottom + (slide.swipe ? 96 : 0) + 56;
	/** The widest phone that still fits whole between `from` and the bottom margin (a device is about 2.2 times as tall as wide). */
	const fit = (from: number, wanted: number) => Math.round(Math.max(0, Math.min(wanted, (cover.bottom - from) / 2.2)));
	let body: React.ReactNode = null;
	if (slide.fan) body = <Fan height={height} top={top - 60} />;
	else if (persona) body = <PersonaGrid content={content} height={height} top={top} />;
	else if (slide.proof) {
		const [exam, id] = slide.proof.split('/') as [AdExam, string];
		const concept = findConcept(exam, id);
		const phone = fit(top, 520);
		body = (
			<>
				{slide.phone ? (
					<Abs x={cover.right - phone} y={top}>
						<Phone screen={slide.phone} width={phone} rotate={4} />
					</Abs>
				) : null}
				<ProofCard proof={concept.proof} width={440} scale={1.2} style={{left: cover.left, top: top + (cover.bottom - top) * 0.3}} />
			</>
		);
	} else if (slide.web) {
		body = (
			<Abs x={cover.left} y={top}>
				<Browser screen={slide.web} width={cover.right - cover.left} />
			</Abs>
		);
	} else if (slide.phone) {
		const phone = fit(top, 640);
		body = (
			<Abs x={(width - phone) / 2} y={top}>
				<Phone screen={slide.phone} width={phone} />
			</Abs>
		);
	}
	return (
		<BrandCover {...text} centred={!pictured} swipe={slide.swipe}>
			{body}
		</BrandCover>
	);
};

const P = POST_TYPE.page;
const TITLE_SET = {weight: P.titleWeight, letterSpacingEm: P.titleLetterSpacingEm};
const TEXT_SET = {weight: P.textWeight};
/** The kicker pill: its padding, its one line and the gap under it, so its height is known before rendering. */
const KICKER_PAD = 12;
const KICKER_LINE = 1.2;
const KICKER_GAP = 26;
const KICKER_BLOCK = 2 * KICKER_PAD + P.kicker * KICKER_LINE + KICKER_GAP;
const TEXT_GAP = 22;
/** Space between the deepest text and the pictures. */
const PICTURE_GAP = 60;
const CLOSING_PADDING = 90;

/** The pages after the cover: they share one title size. */
const innerPages = (content: Content): Slide[] => content.slides.filter((slide, index) => index > 0 && slide.kind !== 'closing');

/**
 * Where a post's text and pictures go, worked out once for the whole post
 * without a browser: the post's one title size (the largest step every page
 * title fits in), and the line under its deepest text, where pictures start
 * at the latest, so they sit at the same place on every page. In actual pixels.
 */
const deckLayout = (content: Content, width: number, height: number) => {
	const {unit, insets} = imageFrameOf(width, height);
	const column = width - insets.left - insets.right - GRID_ICON_ROOM;
	const box = column / unit;
	const top = height > 1200 ? 96 : 80;
	const pages = innerPages(content);
	const title = seriesSize(pages.map((slide) => slide.title), P.titleSteps, box, () => P.titleLines, TITLE_SET);
	const bottomOf = (slide: Slide) => {
		const titleLines = Math.min(P.titleLines, lineCount(slide.title, box, {...TITLE_SET, size: title.size}));
		const textLines = slide.text ? Math.min(P.textLines, lineCount(slide.text, box, {...TEXT_SET, size: P.text})) : 0;
		return top + unit * ((slide.kicker ? KICKER_BLOCK : 0) + titleLines * title.size * P.titleLineHeight + (slide.text ? TEXT_GAP + textLines * P.text * P.textLineHeight : 0));
	};
	return {top, column, box, titleSize: title.size, pictureTop: Math.max(top, ...pages.map(bottomOf)) + PICTURE_GAP * unit};
};

/** What a post cannot set at its fixed sizes, page by page (checkLayout). */
const deckIssues = (content: Content, frame: {width: number; height: number}): string[] => {
	const {unit, insets} = imageFrameOf(frame.width, frame.height);
	const layout = deckLayout(content, frame.width, frame.height);
	const closingBox = (frame.width - 2 * CLOSING_PADDING * unit) / unit;
	const personaBox = ((frame.width - insets.left - insets.right - 28 * unit) / 2 - 60 * unit) / unit;
	const issues: string[] = [];
	const check = (where: string, text: string | undefined, box: number, setting: {size: number; weight: number; letterSpacingEm?: number}, allowed: number) => {
		if (!text) return;
		const lines = lineCount(text, box, setting);
		if (lines > allowed) issues.push(`${where} "${text}" ${setting.size} puntoda ${overflowNote(lines, allowed)}. Kısalt.`);
	};
	content.slides.forEach((slide, index) => {
		const page = `${index + 1}. sayfa:`;
		if (index === 0 && slide.kind !== 'closing') {
			issues.push(...coverIssues({title: slide.title, tag: slide.kicker}, frame).map((issue) => `${page} ${issue}`));
			if (content.look === 'persona' || content.look === 'mood') for (const person of innerPages(content).filter((other) => other.kind === 'persona').slice(0, 4)) check(`${page} öğrenci kartı`, person.kicker, personaBox, {size: P.personaName, weight: 800}, P.personaNameLines);
			return;
		}
		if (slide.kind === 'closing') {
			check(`${page} başlık`, slide.title, closingBox, {size: P.closingTitle, weight: 800}, P.closingTitleLines);
			check(`${page} metin`, slide.text, closingBox, {size: P.closingText, weight: P.textWeight}, P.closingTextLines);
			return;
		}
		// The kicker pill keeps its padding and icon beside the words.
		check(`${page} etiket`, slide.kicker, layout.box - 44 - (slide.icon ? 42 : 0), {size: P.kicker, weight: P.kickerWeight}, 1);
		check(`${page} başlık`, slide.title, layout.box, {...TITLE_SET, size: layout.titleSize}, P.titleLines);
		check(`${page} metin`, slide.text, layout.box, {...TEXT_SET, size: P.text}, P.textLines);
	});
	return issues;
};

const PromoDeckImage: React.FC<{content: Content; page: number}> = ({content, page}) => {
	const {width: canvasWidth, height, insets} = useImageLayout();
	// Left and right edges of the content: inside what the profile grid shows, with a margin.
	const L = insets.left;
	const R = canvasWidth - insets.right;
	const slide = content.slides[Math.min(page, content.slides.length - 1)];
	if (page === 0 && slide.kind !== 'closing') return <CoverSlide content={content} slide={slide} />;
	const paint = LOOK[content.look];
	const ground = groundOf(content, slide);
	const color = moduleColor(slide.module ?? content.module);
	const tall = height > 1200;
	// One title size for every page of the post and one line under its deepest text: pictures start there at the latest.
	const layout = deckLayout(content, canvasWidth, height);
	const below = layout.pictureTop;

	const header = (
		<Abs x={L} y={layout.top} w={layout.column}>
			{slide.kicker ? (
				<div style={{display: 'inline-flex', alignItems: 'center', gap: 12, padding: `${KICKER_PAD}px 22px`, borderRadius: 999, background: content.look === 'proof' || content.look === 'persona' ? 'rgba(255,255,255,0.18)' : ON_DARK.has(content.look) ? 'rgba(255,255,255,0.1)' : `${color}14`, marginBottom: KICKER_GAP}}>
					{slide.icon ? <Icon name={slide.icon} size={30} color={ON_DARK.has(content.look) ? '#FFFFFF' : color} stroke={2.2} /> : null}
					<Text size={P.kicker} weight={P.kickerWeight} color={ON_DARK.has(content.look) ? '#FFFFFF' : color} style={{lineHeight: KICKER_LINE, whiteSpace: 'nowrap'}}>
						{slide.kicker}
					</Text>
				</div>
			) : null}
			<Text variant="display" size={layout.titleSize} weight={P.titleWeight} color={paint.ink} style={{lineHeight: P.titleLineHeight, letterSpacing: `${P.titleLetterSpacingEm}em`}}>
				<Title slide={slide} accent={content.look === 'proof' || content.look === 'persona' ? INK : ORANGE} />
			</Text>
			{slide.text ? (
				<div style={{marginTop: TEXT_GAP}}>
					<Text size={P.text} weight={P.textWeight} color={paint.soft} style={{lineHeight: P.textLineHeight}}>
						{slide.text}
					</Text>
				</div>
			) : null}
		</Abs>
	);

	/** The widest phone that still fits whole between `top` and the bottom margin (a device is about 2.2 times as tall as wide). */
	const fit = (top: number, wanted: number) => Math.round(Math.min(wanted, (height - top - 64) / 2.2));

	let body: React.ReactNode = null;
	// Behind the title of the prompt and flow looks: the composer box, the flowchart node. Drawn around the column, never
	// inside it, so the title keeps its measured width and size.
	const titleTop = layout.top + (slide.kicker ? KICKER_BLOCK : 0);
	const titleHeight = Math.min(P.titleLines, lineCount(slide.title, layout.box, {...TITLE_SET, size: layout.titleSize})) * layout.titleSize * P.titleLineHeight;
	const frame = (content.look === 'prompt' || content.look === 'flow') && slide.kind !== 'closing' ? (
		<div style={{position: 'absolute', left: L - 30, top: titleTop - 26, width: layout.column + 60 + (content.look === 'prompt' ? 70 : 0), height: titleHeight + 52, borderRadius: content.look === 'prompt' ? 40 : 28, background: '#FFFFFF', border: content.look === 'prompt' ? `2px solid ${LINE}` : `4px solid ${INK}`, boxShadow: content.look === 'prompt' ? '0 30px 60px -30px rgba(15,23,42,0.25)' : 'none', boxSizing: 'border-box'}}>
			{content.look === 'prompt' ? (
				<div style={{position: 'absolute', right: 18, bottom: 18, width: 64, height: 64, borderRadius: '50%', background: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<Icon name="up" size={34} color="#FFFFFF" stroke={2.8} />
				</div>
			) : null}
		</div>
	) : null;
	const moduleKey = slide.module ?? content.module;
	/** A module as a big card: its icon on its colour, and its name. */
	const ModuleCard: React.FC<{width: number}> = ({width}) => (
		<div style={{width, padding: 34, borderRadius: 40, background: '#FFFFFF', boxShadow: '0 30px 60px -30px rgba(15,23,42,0.3)', border: `2px solid ${LINE}`, display: 'flex', flexDirection: 'column', gap: 22, boxSizing: 'border-box'}}>
			<div style={{width: 120, height: 120, borderRadius: 36, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<Icon name={MODULES[moduleKey].icon} size={68} color="#FFFFFF" stroke={2} />
			</div>
			<Text variant="display" size={46} weight={TYPE.weights.kinetic} color={INK} style={{lineHeight: 1.05}}>
				{MODULES[moduleKey].name.tr}
			</Text>
		</div>
	);
	if (slide.kind !== 'closing' && content.look === 'mood') {
		const top = Math.max(height * 0.36, below);
		const phone = fit(top, 440);
		body = (
			<>
				<Abs x={L} y={top + 40}>
					<ModuleCard width={Math.min(400, R - L - phone - 40)} />
				</Abs>
				<Abs x={R - phone} y={top}>
					<Phone screen={slide.phone} width={phone} rotate={3} />
				</Abs>
			</>
		);
	} else if (slide.kind !== 'closing' && content.look === 'prompt') {
		const top = Math.max(height * 0.34, below);
		const phone = fit(top, 560);
		body = (
			<Abs x={(canvasWidth - phone) / 2} y={top}>
				<Phone screen={slide.phone} width={phone} />
			</Abs>
		);
	} else if (slide.kind !== 'closing' && content.look === 'diagnosis') {
		const top = Math.max(height * 0.36, below);
		const phone = fit(top, 500);
		body = (
			<>
				{slide.number ? <Abs x={L} y={top}>
					<div style={{width: 260, height: 260, borderRadius: 64, background: ORANGE, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 30px 60px -30px rgba(234,88,12,0.7)'}}>
						<Text size={30} weight={TYPE.weights.display} color="rgba(255,255,255,0.86)" style={{letterSpacing: '0.12em', lineHeight: 1}}>
							NEDEN
						</Text>
						<Text variant="display" size={170} weight={TYPE.weights.kinetic} color="#FFFFFF" align="center" style={{lineHeight: 1, fontVariantNumeric: 'tabular-nums lining-nums'}}>
							{slide.number}
						</Text>
					</div>
				</Abs> : null}
				<Abs x={slide.number ? R - phone : (canvasWidth - phone) / 2} y={top}>
					<Phone screen={slide.phone} width={phone} rotate={slide.number ? -3 : 0} />
				</Abs>
			</>
		);
	} else if (slide.kind !== 'closing' && content.look === 'flow') {
		const nodeTop = titleTop + titleHeight + 26 + 90;
		const top = Math.max(height * 0.36, below, nodeTop + 170);
		const phone = fit(top, 420);
		body = (
			<>
				{/* The arrow from the worry down to the module that answers it. */}
				<div style={{position: 'absolute', left: L + 60, top: titleTop + titleHeight + 26, width: 6, height: nodeTop - (titleTop + titleHeight + 26) - 10, background: INK}} />
				<div style={{position: 'absolute', left: L + 63 - 18, top: nodeTop - 26, width: 0, height: 0, borderLeft: '18px solid transparent', borderRight: '18px solid transparent', borderTop: `22px solid ${INK}`}} />
				<Abs x={L} y={nodeTop}>
					<div style={{display: 'inline-flex', alignItems: 'center', gap: 20, padding: '24px 40px 24px 26px', borderRadius: 999, background: color, boxShadow: `0 24px 50px -24px ${color}`}}>
						<div style={{width: 84, height: 84, borderRadius: '50%', background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							<Icon name={MODULES[moduleKey].icon} size={48} color="#FFFFFF" stroke={2.2} />
						</div>
						<Text variant="display" size={50} weight={TYPE.weights.kinetic} color="#FFFFFF" style={{whiteSpace: 'nowrap'}}>
							{MODULES[moduleKey].name.tr}
						</Text>
					</div>
				</Abs>
				<Abs x={R - phone} y={top}>
					<Phone screen={slide.phone} width={phone} rotate={3} />
				</Abs>
			</>
		);
	} else if (slide.kind !== 'closing' && content.look === 'checklist') {
		const top = Math.max(height * 0.42, below);
		body = (
			<Abs x={L - 10} y={top} w={R - L + 20}>
				<div style={{height: height - top - 90, borderRadius: 34, background: `repeating-linear-gradient(180deg, transparent 0 63px, #DBEAFE 63px 66px), #FFFFFF`, boxShadow: '0 40px 80px -30px rgba(0,0,0,0.5)', padding: '50px 54px', boxSizing: 'border-box', display: 'flex', alignItems: 'flex-start', gap: 40}}>
					<div style={{width: 150, height: 150, borderRadius: 30, border: `9px solid ${INK}`, flexShrink: 0, boxSizing: 'border-box'}} />
					<div style={{display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 10}}>
						<Text size={34} weight={TYPE.weights.display} color={GREY} style={{letterSpacing: '0.08em'}}>
							{`SORU ${slide.number ?? ''}`}
						</Text>
						<Text size={40} weight={TYPE.weights.strong} color={INK}>
							Cevabın:
						</Text>
					</div>
				</div>
			</Abs>
		);
	}
	if (slide.kind === 'closing') return (
		<AbsoluteFill style={{background: ground}}>
			<Closing content={content} slide={slide} height={height} />
		</AbsoluteFill>
	);
	if (body) {
		// The new looks above drew their own body.
	} else if (slide.proof) {
		const [exam, id] = slide.proof.split('/') as [AdExam, string];
		const concept = findConcept(exam, id);
		body = (
			<>
				{/* The phone fills the ground: an empty field of colour read as a stain (Tuğçe's review, 26 Oct 2026). */}
				{slide.phone ? (
					<Abs x={R - fit(Math.max(height * 0.3, below), 600)} y={Math.max(height * 0.3, below)}>
						<Phone screen={slide.phone} width={fit(Math.max(height * 0.3, below), 600)} rotate={4} />
					</Abs>
				) : null}
				<ProofCard proof={concept.proof} width={440} scale={1.25} style={{left: L, top: Math.max(height * 0.52, below)}} />
			</>
		);
	} else if (slide.kind === 'step') {
		const top = Math.max(height * 0.3, below);
		const width = fit(top, 520);
		body = (
			<>
				<Abs x={L - 30} y={Math.max(height * 0.4, below)}>
					<StepNumber value={slide.number ?? ''} color={paint.accent} />
					<div style={{width: 8, height: height * 0.3, background: `${paint.accent}33`, borderRadius: 4, marginLeft: 116, marginTop: 20}} />
				</Abs>
				<Abs x={R - width} y={top}>
					<Phone screen={slide.phone} width={width} />
				</Abs>
			</>
		);
	} else if (slide.kind === 'persona') {
		body = (
			<>
				<Abs x={L} y={Math.max(height * 0.42, below + height * 0.06)}>
					<div style={{width: 240, height: 240, borderRadius: 72, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<Icon name={slide.icon ?? 'grad'} size={140} color="#FFFFFF" stroke={1.6} />
					</div>
				</Abs>
				<Abs x={520} y={Math.max(height * 0.36, below)}>
					<Phone screen={slide.phone} width={fit(Math.max(height * 0.36, below), 480)} rotate={-4} />
				</Abs>
			</>
		);
	} else if (slide.web) {
		body = (
			<Abs x={content.look === 'browser' ? L - 20 : L} y={Math.max(height * (tall ? 0.42 : 0.4), below)}>
				<Browser screen={slide.web} width={content.look === 'browser' ? 1180 : 1000} />
			</Abs>
		);
	} else if (slide.phone) {
		const tilt = content.look === 'floating' ? (page % 2 ? -6 : 6) : 0;
		const top = Math.max(height * (tall ? (slide.kind === 'cover' ? 0.33 : 0.3) : 0.31), below);
		const width = fit(top, content.look === 'tool' ? 580 : 660);
		body = (
			<Abs x={content.look === 'tool' ? (canvasWidth - width) / 2 : page % 2 ? L : R - width} y={top}>
				<Phone screen={slide.phone} width={width} rotate={tilt} />
			</Abs>
		);
	} else if (slide.icon && content.look === 'tool') {
		body = (
			<Abs x={0} y={Math.max(height * 0.45, below)} w={canvasWidth}>
				<div style={{display: 'flex', justifyContent: 'center'}}>
					<div style={{width: 380, height: 380, borderRadius: 120, background: '#F1F5F9', border: `2px solid ${LINE}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<Icon name={slide.icon} size={190} color={INK} stroke={1.3} />
					</div>
				</div>
			</Abs>
		);
	}

	return (
		<AbsoluteFill style={{background: ground, overflow: 'hidden'}}>
			{frame}
			{body}
			{header}
		</AbsoluteFill>
	);
};

export const PromoDeck = defineImageTemplate({
	category: 'Campaigns',
	variant: 'PromoDeck',
	title: 'Tanıtım gönderisi',
	description: 'Kampanya gönderileri: altı görünüş (yüzen kartlar, SinoAI, kanıt kartı, adım, tarayıcı, öğrenci tipi), sayfa sayfa.',
	contentSchema: PromoDeckSchema,
	sampleContent: {
		name: 'Yedi modül, tek uygulama',
		look: 'floating',
		slides: [
			{kind: 'cover', title: 'Sınava hazırlanmak için 7 uygulama mı? Bir tane yeter.', fan: true},
			{kind: 'feature', kicker: 'Denemeler', icon: 'exam', module: 'exam', title: 'Türkiye geneli denemeler, konu konu sonuç.', phone: 'yksLoss'},
			{kind: 'closing', title: 'Hepsi tek uygulamada.', text: 'Sınavika’yı ücretsiz indir.'},
		],
	},
	defaultTheme: 'SinavikaLight',
	defaultSize: 'Portrait',
	pageCount: (content) => content.slides.length,
	outputName: (content) => content.name,
	checkLayout: deckIssues,
	Component: PromoDeckImage,
});
