import React from 'react';
import {easeFrom} from '../../../../Animations/Motion';
import {Animated, Stagger} from '../../../../Components/Animations/Animated';
import {Icon} from '../../../../Components/Illustrations/Icon';
import {FitBox} from '../../../../Components/Layouts/FitBox';
import {SafeArea} from '../../../../Components/Layouts/SafeArea';
import {useVideoLayout} from '../../../../Components/Layouts/VideoLayout';
import {Badge} from '../../../../Components/Typography/Badge';
import {RichInline, RichText} from '../../../../Components/Typography/RichText';
import {Text} from '../../../../Components/Typography/Text';
import {CourseVisual} from '../../../../Components/Visuals/CourseVisual';
import {strikeStyle, useSceneSeconds} from '../../../../Components/Visuals/VisualFrame';
import {type CourseVisual as CourseVisualSpec, naturalAspect} from '../../../../Components/Visuals/VisualSchema';
import {VisualTimelineProvider} from '../../../../Components/Visuals/VisualTimeline';
import {BRAND_TYPOGRAPHY} from '../../../../Configurations/BrandTypography';
import {COURSE_DESIGN} from '../../../../Courses/CourseDesign';
import type {CardCues, Cues} from '../../../../Courses/LessonCue';
import type {LessonCard} from '../../../../Courses/LessonScript';
import {CHROME_HEIGHT, SPACING} from '../../../../Themes/DesignTokens';
import {withAlpha} from '../../../../Themes/Theme';
import {useTheme} from '../../../../Themes/ThemeContext';
import {lineCount} from '../../../../Images/Components/TextMeasure';
import {STUDIO_HEADING_HEIGHT, StudioHeading, TYPE, useStudio, useVisualBox} from './LessonChrome';

const CARD_KINDS: Record<Exclude<LessonCard['kind'], 'question' | 'predict'>, string> = {
	concept: 'Kavram',
	rule: 'Kural',
	example: 'Örnek',
	mistake: 'Sık yapılan hata',
	visual: 'Şekil',
};

type TextCard = Exclude<LessonCard, {kind: 'question' | 'visual' | 'predict'}>;

type FigureCard = Exclude<LessonCard, {kind: 'question' | 'predict'}>;

/** 0 → 1 over `duration` seconds from `from`, with the lesson's easing. */

/**
 * An item of a rule, arriving as the narrator comes to it. While it is the one
 * being said its number grows and its line takes a light tint of the lesson
 * colour; the next item takes the tint over. Items not yet said keep their
 * place, so nothing on the card moves when they arrive.
 */
const RuleItem: React.FC<{index: number; text: string; at: number; until?: number; marks?: Cues}> = ({index, text, at, until, marks}) => {
	const {colors, typography} = useTheme();
	const {u} = useVideoLayout();
	const seconds = useSceneSeconds();
	const lesson = colors.lesson?.fill ?? colors.accent;
	const show = easeFrom(seconds, at, 0.45);
	const active = until === undefined ? show : Math.min(show, 1 - easeFrom(seconds, until, 0.4));
	return (
		// The tint reaches out to the left of the text only: a negative right margin made the item 14 px wider than its
		// card at every scale, and the fitting box then shrank the whole rule card to its smallest size (GEO 2, 4.1).
		<div style={{display: 'flex', gap: u(18), alignItems: 'baseline', margin: `0 0 ${u(SPACING.sm)}px ${-u(14)}px`, padding: `${u(6)}px ${u(14)}px`, borderRadius: u(16), backgroundColor: withAlpha(lesson, 0.08 * active), opacity: show, transform: `translateX(${(show - 1) * u(40)}px)`}}>
			<div style={{fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(TYPE.cardBody), color: lesson, transform: `scale(${1 + 0.18 * active})`, transformOrigin: 'center bottom'}}>{index + 1}</div>
			<RichText text={text} size={TYPE.cardBody} markCues={marks} />
		</div>
	);
};

/** The wrong belief of a mistake card, struck through when the narrator turns to the correction. */
const WrongBelief: React.FC<{text: string; struckAt: number}> = ({text, struckAt}) => {
	const {colors} = useTheme();
	const {u} = useVideoLayout();
	const seconds = useSceneSeconds();
	const struck = easeFrom(seconds, struckAt, 0.45);
	return (
		<div style={{display: 'flex', gap: u(18), alignItems: 'flex-start', padding: u(24), borderRadius: u(20), backgroundColor: withAlpha(colors.danger, 0.1), opacity: 1 - 0.3 * struck}}>
			<Icon name="cross" size={48} color={colors.danger} />
			<Text size={TYPE.cardBody}>
				<span style={strikeStyle(struck, withAlpha(colors.danger, 0.8), u(5))}>
					<RichInline text={text} />
				</span>
			</Text>
		</div>
	);
};

const CardText: React.FC<{card: TextCard; cues?: CardCues}> = ({card, cues}) => {
	const {colors, typography} = useTheme();
	const {u} = useVideoLayout();
	switch (card.kind) {
		case 'concept':
			return <RichText text={card.text} size={TYPE.cardBody} markCues={cues?.marks} />;
		case 'rule':
			if (cues?.items) {
				const items = cues.items;
				return (
					<div>
						{card.items.map((item, index) => (
							<RuleItem key={index} index={index} text={item} at={items[index]} until={items[index + 1]} marks={cues.itemMarks?.[index]} />
						))}
					</div>
				);
			}
			return (
				<Stagger delaySeconds={0.4} stepSeconds={0.5} animation={{preset: 'slide', direction: 'left', distance: 40}}>
					{card.items.map((item, index) => (
						<div key={index} style={{display: 'flex', gap: u(18), alignItems: 'baseline', marginBottom: u(SPACING.sm)}}>
							<div style={{fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(TYPE.cardBody), color: colors.lesson?.fill ?? colors.accent}}>{index + 1}</div>
							<RichText text={item} size={TYPE.cardBody} />
						</div>
					))}
				</Stagger>
			);
		case 'example':
			return (
				<>
					<div style={{padding: `${u(24)}px ${u(30)}px`, borderLeft: `${u(10)}px solid ${colors.lesson?.fill ?? colors.accent}`, backgroundColor: withAlpha(colors.lesson?.fill ?? colors.accent, 0.08), borderRadius: u(16)}}>
						<RichText text={card.example} size={TYPE.example} weight={typography.strongWeight} markCues={cues?.marks} />
					</div>
					{card.explanation ? (
						<Animated animation={{preset: 'slide', direction: 'up', distance: 24}} delaySeconds={cues?.explanation ?? 0.8}>
							<RichText text={card.explanation} size={TYPE.cardBody - 4} tone="muted" markCues={cues?.explanationMarks} />
						</Animated>
					) : null}
				</>
			);
		case 'mistake': {
			// The correction comes when the narrator turns to it; the wrong belief is struck through just before.
			const rightAt = cues?.right ?? 0.9;
			const whyAt = cues?.why ?? rightAt + 0.7;
			return (
				<>
					<WrongBelief text={card.wrong} struckAt={rightAt - 0.15} />
					<Animated animation={{preset: 'slide', direction: 'up', distance: 30}} delaySeconds={rightAt}>
						<div style={{display: 'flex', gap: u(18), alignItems: 'flex-start', padding: u(24), borderRadius: u(20), backgroundColor: withAlpha(colors.success, 0.12)}}>
							<Animated animation={{preset: 'scale', easing: 'overshoot'}} delaySeconds={rightAt + 0.15}>
								<Icon name="check" size={48} color={colors.success} />
							</Animated>
							<RichText text={card.right} size={TYPE.cardBody} markCues={cues?.rightMarks} />
						</div>
					</Animated>
					{card.why ? (
						<Animated delaySeconds={whyAt}>
							<RichText text={card.why} size={TYPE.cardBody - 6} tone="muted" markCues={cues?.whyMarks} />
						</Animated>
					) : null}
				</>
			);
		}
	}
};

/** The title and text of a card. Beside a figure (or alone) it is fitted to its room; above a lone figure it keeps its natural height. */
const TextColumn: React.FC<{fit: boolean; children: React.ReactNode}> = ({fit, children}) => {
	const {u} = useVideoLayout();
	const column = <div style={{display: 'flex', flexDirection: 'column', gap: u(SPACING.lg), justifyContent: 'center'}}>{children}</div>;
	if (!fit) return <div style={{minWidth: 0, alignSelf: 'stretch'}}>{column}</div>;
	return <FitBox style={{flex: 1}}>{column}</FitBox>;
};

/**
 * One card of a section: its kind, its title, the text, and its visual beside
 * or under it. With beats, the visual follows them: `beatStarts` are the
 * seconds into the scene at which each beat's sentence starts.
 */
/**
 * Visuals that are a scene of their own (a battle told stage by stage): on horizontal video the card gives them the
 * whole frame under a one-line header. Under a title and caption a battle shrank to a band 370 px high, where its
 * soldiers, standards and arrows were too small to follow (29 Oct 2026).
 */
const FULL_SCENE_KINDS: readonly CourseVisualSpec['kind'][] = ['battle', 'process', 'picture'];

/** A visual card shown as a scene: the badge, title and caption in one band on top, the figure filling the rest. */
const SceneCard: React.FC<{card: Extract<FigureCard, {kind: 'visual'}>; section: string; number: string; beatStarts?: number[]; beatEnds?: number[]; sceneSeconds?: number}> = ({card, section, number, beatStarts, beatEnds, sceneSeconds}) => {
	const {u, contentWidth, contentHeight} = useVideoLayout();
	const box = {width: contentWidth, height: contentHeight - u(CHROME_HEIGHT) - u(118)};
	return (
		<SafeArea chrome gap={SPACING.md}>
			<div style={{display: 'flex', alignItems: 'center', gap: u(SPACING.md), flexShrink: 0}}>
				<Animated animation={{preset: 'slide', direction: 'down', distance: 24}}>
					<Badge lesson size={TYPE.label}>
						{CARD_KINDS[card.kind]}
					</Badge>
				</Animated>
				<Animated animation={{preset: 'slide', direction: 'right', distance: 40}} delaySeconds={0.1} style={{flexShrink: 0}}>
					{/* The title only: the scene names its own stages and notes, and a caption beside the title was cut short. */}
					<Text variant="title" size={TYPE.cardTitle - 8} style={{whiteSpace: 'nowrap'}}>
						<RichInline text={card.title} />
					</Text>
				</Animated>
				{/* The section's name gives way to a long title: it is shortened, never written over. */}
				<Text variant="label" tone="muted" size={TYPE.label} style={{flex: 1, minWidth: 0, textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
					{section} · {number}
				</Text>
			</div>
			<div style={{flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<div style={{width: box.width, height: box.height, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<VisualTimelineProvider beats={card.beats} starts={beatStarts} ends={beatEnds} sceneSeconds={sceneSeconds} openFirst>
						<CourseVisual visual={card.visual} width={box.width} height={box.height} delaySeconds={0.5} />
					</VisualTimelineProvider>
				</div>
			</div>
		</SafeArea>
	);
};

/** Widest line of a text card in the studio layout, before it grows into spare room: about 60 letters a line. */
const STUDIO_TEXT_WIDTH = 1300;

/**
 * A card in the studio layout (camp lessons since 31 Oct 2026): its kind and title in the top row, so the card's room starts
 * right under it. A lone figure takes the whole width and all the height its caption (measured) leaves; text,
 * alone or beside a figure, is fitted as on the classic card and may grow a little into spare room.
 */
const StudioCard: React.FC<{card: FigureCard; beatStarts?: number[]; beatEnds?: number[]; sceneSeconds?: number; cues?: CardCues}> = ({card, beatStarts, beatEnds, sceneSeconds, cues}) => {
	const {u, contentWidth, contentHeight} = useVideoLayout();
	const visual: CourseVisualSpec | undefined = 'visual' in card ? card.visual : undefined;
	const aspect = visual ? naturalAspect(visual) : undefined;
	const scene = card.kind === 'visual' && FULL_SCENE_KINDS.includes(card.visual.kind);
	// A tall figure stands beside its caption; with no caption (the title is in the top row now) it stands alone, centred.
	const onlyVisual = card.kind === 'visual' && (scene || !card.caption || !(aspect !== undefined && aspect < COURSE_DESIGN.besideAspect));
	const caption = card.kind === 'visual' && !scene ? card.caption : undefined;
	const captionSize = TYPE.cardBody - 6;
	const captionLines = caption ? Math.min(3, lineCount(caption.replace(/\*\*|\$/g, ''), contentWidth / u(1), {size: captionSize, weight: 500})) : 0;
	const below = contentHeight - u(STUDIO_HEADING_HEIGHT) - u(SPACING.lg);
	const box = onlyVisual ? {width: contentWidth, height: below - (captionLines ? u(captionLines * captionSize * 1.4 + SPACING.md) : 0)} : {width: contentWidth * COURSE_DESIGN.visualShare, height: below};
	const figure = visual ? (
		<div style={{width: box.width, height: box.height, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
			<VisualTimelineProvider beats={'beats' in card ? card.beats : undefined} starts={beatStarts} ends={beatEnds} sceneSeconds={sceneSeconds} openFirst>
				<CourseVisual visual={visual} width={box.width} height={box.height} delaySeconds={0.5} />
			</VisualTimelineProvider>
		</div>
	) : null;
	const captionText = card.kind === 'visual' && card.caption ? <RichText text={card.caption} size={captionSize} tone="muted" markCues={cues?.marks} /> : null;
	return (
		<SafeArea gap={SPACING.lg}>
			<StudioHeading badge={CARD_KINDS[card.kind]} title={card.title} />
			{onlyVisual ? (
				<div style={{flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: u(SPACING.md), alignItems: 'center'}}>
					{caption ? (
						<Animated delaySeconds={0.3} style={{alignSelf: 'stretch'}}>
							{captionText}
						</Animated>
					) : null}
					{figure}
				</div>
			) : (
				<div style={{flex: 1, minHeight: 0, display: 'flex', flexDirection: 'row', gap: u(SPACING.xl), alignItems: 'stretch'}}>
					<FitBox fill maxScale={visual ? 1 : 1.15} style={{flex: 1}}>
						<Animated delaySeconds={0.3}>
							<div style={{display: 'flex', flexDirection: 'column', gap: u(SPACING.md), maxWidth: visual ? undefined : u(STUDIO_TEXT_WIDTH)}}>
								{card.kind === 'visual' ? captionText : <CardText card={card} cues={cues} />}
							</div>
						</Animated>
					</FitBox>
					{figure}
				</div>
			)}
		</SafeArea>
	);
};

export const LessonCardScene: React.FC<{card: FigureCard; section: string; number: string; beatStarts?: number[]; beatEnds?: number[]; sceneSeconds?: number; cues?: CardCues}> = ({card, section, number, beatStarts, beatEnds, sceneSeconds, cues}) => {
	const {u, isLandscape} = useVideoLayout();
	const studio = useStudio();
	if (studio) return <StudioCard card={card} beatStarts={beatStarts} beatEnds={beatEnds} sceneSeconds={sceneSeconds} cues={cues} />;
	if (isLandscape && card.kind === 'visual' && FULL_SCENE_KINDS.includes(card.visual.kind)) {
		return <SceneCard card={card} section={section} number={number} beatStarts={beatStarts} beatEnds={beatEnds} sceneSeconds={sceneSeconds} />;
	}
	const visual: CourseVisualSpec | undefined = 'visual' in card ? card.visual : undefined;
	// A tall figure of a visual card stands beside its title and caption, like the figure of a rule card.
	const aspect = visual ? naturalAspect(visual) : undefined;
	const onlyVisual = card.kind === 'visual' && !(isLandscape && aspect !== undefined && aspect < COURSE_DESIGN.besideAspect);
	const box = useVisualBox(onlyVisual, card.kind !== 'visual' || Boolean(card.caption));

	return (
		<SafeArea chrome gap={SPACING.lg}>
			<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0}}>
				<Animated animation={{preset: 'slide', direction: 'down', distance: 24}}>
					<Badge lesson size={TYPE.label}>
						{CARD_KINDS[card.kind]}
					</Badge>
				</Animated>
				<Text variant="label" tone="muted" size={TYPE.label}>
					{section} · {number}
				</Text>
			</div>
			<div style={{flex: 1, minHeight: 0, display: 'flex', flexDirection: onlyVisual || !isLandscape ? 'column' : 'row', gap: u(SPACING.xl), alignItems: onlyVisual ? 'center' : 'stretch'}}>
				{/* The text side scales down to fit when a long rule or concept sits beside a figure; nothing is cut off. */}
				<TextColumn fit={!onlyVisual}>
					<Animated animation={{preset: 'slide', direction: 'right', distance: 60}} delaySeconds={0.1}>
						<Text variant="title" size={TYPE.cardTitle}>
							{/* A title may name a point or a formula ("Ağırlık merkezi $G$"): drawn as math, not as typed. */}
							<RichInline text={card.title} />
						</Text>
					</Animated>
					{card.kind === 'visual' ? (
						card.caption ? (
							<Animated delaySeconds={0.3}>
								<RichText text={card.caption} size={TYPE.cardBody - 6} tone="muted" markCues={cues?.marks} />
							</Animated>
						) : null
					) : (
						<Animated delaySeconds={0.3}>
							<div style={{display: 'flex', flexDirection: 'column', gap: u(SPACING.md)}}>
								<CardText card={card} cues={cues} />
							</div>
						</Animated>
					)}
				</TextColumn>
				{visual ? (
					<div style={{width: box.width, height: box.height, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<VisualTimelineProvider beats={'beats' in card ? card.beats : undefined} starts={beatStarts} ends={beatEnds} sceneSeconds={sceneSeconds} openFirst>
							<CourseVisual visual={visual} width={box.width} height={box.height} delaySeconds={0.5} />
						</VisualTimelineProvider>
					</div>
				) : null}
			</div>
		</SafeArea>
	);
};
