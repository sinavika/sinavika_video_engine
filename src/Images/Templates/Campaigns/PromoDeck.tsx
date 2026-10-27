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
import {useImageLayout} from '../../Components/ImageFrame';
import {defineImageTemplate} from '../../ImageTemplateDefinition';
import {GRID_ICON_ROOM} from '../ProfileGrids/ProfileGridLayout';

/**
 * The promotion campaign's posts (Ekim 2026): one schema, six looks, so each
 * post in the calendar has its own design while sharing the slide kinds.
 *
 * - floating: white, tilted floating cards (folio-style feature cards)
 * - tool:     SinoAI; white and ink, neutral, one tool per slide
 * - proof:    the module's colour and a big white proof card (Google Ads set)
 * - rail:     paper, big step numbers on a rail
 * - browser:  warm dark desk light, the web panel in a browser window
 * - persona:  bold colour blocks, one kind of student per slide
 *
 * Everything stays inside what the profile grid shows of the post and clear
 * of Instagram's corner icon (gridInsets). A title can mark one word or
 * phrase (`emphasis`) on the accent, chosen for what the post sells, never
 * the last word by default (Tuğçe's review, 26 Oct 2026).
 *
 * No page counter or progress bar (carousel rule). A cover may carry a
 * small "Kaydır" cue when its job asks for one (`swipe`), as the brand owner
 * asked for the persona carousel (October 2026).
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
	look: z.enum(['floating', 'tool', 'proof', 'rail', 'browser', 'persona']),
	module: z.enum(MODULE_KEYS).default('exam'),
	slides: z.array(SlideSchema).min(1).max(10),
});
type Content = z.infer<typeof PromoDeckSchema>;

const INK = '#0B1C30';
const GREY = '#64748B';
const LINE = '#E2E8F0';
const ORANGE = '#EA580C';
const moduleColor = (key: ModuleKey) => (key === 'sinoAi' ? '#334155' : MODULES[key].color.light);

/** Look-dependent paint. */
const LOOK = {
	floating: {ground: 'radial-gradient(90% 70% at 50% 20%, #FFFFFF 0%, #F6F6F7 60%, #EDEEF1 100%)', ink: INK, soft: GREY, accent: ORANGE},
	tool: {ground: '#FFFFFF', ink: INK, soft: GREY, accent: INK},
	proof: {ground: '', ink: '#FFFFFF', soft: 'rgba(255,255,255,0.86)', accent: '#FFFFFF'},
	rail: {ground: '#FBF7F2', ink: INK, soft: '#78716C', accent: ORANGE},
	browser: {ground: 'radial-gradient(60% 40% at 85% 0%, rgba(234,88,12,0.28) 0%, rgba(234,88,12,0) 70%), linear-gradient(165deg, #1B2B44 0%, #0B1C30 55%, #070F1C 100%)', ink: '#FFFFFF', soft: '#CBD5E1', accent: '#FB923C'},
	persona: {ground: '', ink: '#FFFFFF', soft: 'rgba(255,255,255,0.86)', accent: '#FFFFFF'},
} as const;

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
			<span style={{background: accent, color: '#FFFFFF', padding: '0 0.12em', borderRadius: '0.12em', boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone'}}>{slide.title.slice(at, end)}</span>
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
const PersonaGrid: React.FC<{content: Content; height: number}> = ({content, height}) => {
	const {insets} = useImageLayout();
	const people = content.slides.filter((slide) => slide.kind === 'persona').slice(0, 4);
	return (
		<div style={{position: 'absolute', left: insets.left, right: insets.right, top: height * 0.36, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28}}>
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
					<Text size={44} weight={TYPE.weights.kinetic} color="#FFFFFF" style={{lineHeight: 1.05}}>
						{person.kicker}
					</Text>
				</div>
			))}
		</div>
	);
};

/** "Kaydır →": the cover's invitation to swipe. */
const SwipeCue: React.FC<{height: number; ink: string}> = ({height, ink}) => {
	const {insets} = useImageLayout();
	return (
	<div style={{position: 'absolute', right: insets.right, top: height - 150, display: 'flex', alignItems: 'center', gap: 14, padding: '16px 26px', borderRadius: 999, background: 'rgba(255,255,255,0.14)', border: '2px solid rgba(255,255,255,0.28)'}}>
		<Text size={32} weight={TYPE.weights.strong} color={ink}>
			Kaydır
		</Text>
		<svg width={40} height={24} viewBox="0 0 40 24" fill="none" stroke={ink} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
			<path d="M2 12 H36 M26 2 L36 12 L26 22" />
		</svg>
	</div>
	);
};

/**
 * The fanned module cards of the floating cover, spaced to stay inside what the profile grid shows (the outer cards
 * were cut, 26 Oct 2026). The middle card lies on top; cards right of it carry their name on the right, where no
 * neighbour covers it.
 */
const Fan: React.FC<{height: number}> = ({height}) => {
	const keys = MODULE_ORDER;
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: height * 0.42, height: height * 0.5}}>
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
		<div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 46, padding: 90, textAlign: 'center'}}>
			<BrandMark size="hero" color={paint.ink} />
			<Text variant="display" size={74} weight={TYPE.weights.kinetic} color={paint.ink} align="center" style={{lineHeight: 1.08}}>
				{slide.title}
			</Text>
			{slide.text ? (
				<Text size={38} weight={TYPE.weights.strong} color={paint.soft} align="center">
					{slide.text}
				</Text>
			) : null}
			<div style={{height: height * 0.02}} />
		</div>
	);
};

const PromoDeckImage: React.FC<{content: Content; page: number}> = ({content, page}) => {
	const {width: canvasWidth, height, insets} = useImageLayout();
	// Left and right edges of the content: inside what the profile grid shows, with a margin.
	const L = insets.left;
	const R = canvasWidth - insets.right;
	const slide = content.slides[Math.min(page, content.slides.length - 1)];
	const paint = LOOK[content.look];
	const ground = groundOf(content, slide);
	const color = moduleColor(slide.module ?? content.module);
	const tall = height > 1200;
	// Big for a cover or a single post, a step smaller when the title is long: the column is narrower now that it
	// keeps clear of the grid's edges and corner icon, and a long title must not run into the phone below.
	const lead = slide.kind === 'cover' || content.slides.length === 1;
	const titleSize = slide.title.length > 40 ? (lead ? 76 : 60) : lead ? 92 : 72;
	// Where the picture below the title may start: under the title's rows.
	const titleRows = Math.ceil((slide.title.length * titleSize * 0.58) / (R - L - GRID_ICON_ROOM));
	const below = (tall ? 96 : 80) + (slide.kicker ? 80 : 0) + titleRows * titleSize * 1.06 + (slide.text ? 120 : 0) + 60;

	const header = (
		<Abs x={L} y={tall ? 96 : 80} w={R - L - GRID_ICON_ROOM}>
			{slide.kicker ? (
				<div style={{display: 'inline-flex', alignItems: 'center', gap: 12, padding: '12px 22px', borderRadius: 999, background: content.look === 'proof' || content.look === 'persona' ? 'rgba(255,255,255,0.18)' : content.look === 'browser' ? 'rgba(255,255,255,0.1)' : `${color}14`, marginBottom: 26}}>
					{slide.icon ? <Icon name={slide.icon} size={30} color={content.look === 'proof' || content.look === 'persona' || content.look === 'browser' ? '#FFFFFF' : color} stroke={2.2} /> : null}
					<Text size={28} weight={TYPE.weights.strong} color={content.look === 'proof' || content.look === 'persona' || content.look === 'browser' ? '#FFFFFF' : color}>
						{slide.kicker}
					</Text>
				</div>
			) : null}
			<Text variant="display" size={titleSize} weight={TYPE.weights.kinetic} color={paint.ink} style={{lineHeight: 1.04, letterSpacing: '-0.03em'}}>
				<Title slide={slide} accent={content.look === 'proof' || content.look === 'persona' ? INK : ORANGE} />
			</Text>
			{slide.text ? (
				<div style={{marginTop: 22}}>
					<Text size={38} weight={TYPE.weights.strong} color={paint.soft} style={{lineHeight: 1.3}}>
						{slide.text}
					</Text>
				</div>
			) : null}
		</Abs>
	);

	/** The widest phone that still fits whole between `top` and the bottom margin (a device is about 2.2 times as tall as wide). */
	const fit = (top: number, wanted: number) => Math.round(Math.min(wanted, (height - top - 64) / 2.2));

	let body: React.ReactNode = null;
	if (slide.kind === 'closing') return (
		<AbsoluteFill style={{background: ground}}>
			<Closing content={content} slide={slide} height={height} />
		</AbsoluteFill>
	);
	if (slide.kind === 'cover' && slide.fan) body = <Fan height={height} />;
	else if (slide.kind === 'cover' && content.look === 'persona') body = <PersonaGrid content={content} height={height} />;
	else if (slide.proof) {
		const [exam, id] = slide.proof.split('/') as [AdExam, string];
		const concept = findConcept(exam, id);
		body = (
			<>
				{/* The phone fills the ground: an empty field of colour read as a stain (Tuğçe's review, 26 Oct 2026). */}
				{slide.phone ? (
					<Abs x={R - fit(height * 0.3, 600)} y={height * 0.3}>
						<Phone screen={slide.phone} width={fit(height * 0.3, 600)} rotate={4} />
					</Abs>
				) : null}
				<ProofCard proof={concept.proof} width={440} scale={1.25} style={{left: L, top: height * 0.52}} />
			</>
		);
	} else if (slide.kind === 'step') {
		const top = Math.max(height * 0.3, below);
		const width = fit(top, 520);
		body = (
			<>
				<Abs x={L - 30} y={height * 0.4}>
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
				<Abs x={L} y={height * 0.42}>
					<div style={{width: 240, height: 240, borderRadius: 72, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<Icon name={slide.icon ?? 'grad'} size={140} color="#FFFFFF" stroke={1.6} />
					</div>
				</Abs>
				<Abs x={520} y={height * 0.36}>
					<Phone screen={slide.phone} width={fit(height * 0.36, 480)} rotate={-4} />
				</Abs>
			</>
		);
	} else if (slide.web) {
		body = (
			<Abs x={content.look === 'browser' ? L - 20 : L} y={height * (tall ? 0.42 : 0.4)}>
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
			<Abs x={0} y={height * 0.45} w={canvasWidth}>
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
			{body}
			{header}
			{slide.kind === 'cover' && !slide.phone && !slide.web ? (
				<Abs x={L} y={height - insets.bottom - 50}>
					<BrandMark size="chrome" color={paint.ink} />
				</Abs>
			) : null}
			{slide.kind === 'cover' && slide.swipe ? <SwipeCue height={height} ink={paint.ink} /> : null}
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
	Component: PromoDeckImage,
});
