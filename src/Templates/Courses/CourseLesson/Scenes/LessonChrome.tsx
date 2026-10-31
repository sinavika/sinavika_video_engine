import React from 'react';
import {Animated} from '../../../../Components/Animations/Animated';
import {ChromeBar} from '../../../../Components/Layouts/SafeArea';
import {useVideoLayout} from '../../../../Components/Layouts/VideoLayout';
import {BrandMark} from '../../../../Components/Overlays/BrandMark';
import {Badge} from '../../../../Components/Typography/Badge';
import {RichInline} from '../../../../Components/Typography/RichText';
import {Text} from '../../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY} from '../../../../Configurations/BrandTypography';
import {COURSE_DESIGN} from '../../../../Courses/CourseDesign';
import type {LessonScript} from '../../../../Courses/LessonScript';
import {textWidth} from '../../../../Images/Components/TextMeasure';
import {CHROME_HEIGHT, SPACING} from '../../../../Themes/DesignTokens';
import {useTheme} from '../../../../Themes/ThemeContext';

export const TYPE = COURSE_DESIGN.type;

/** Small lesson pill: the lesson's colour and name, as on the Reels covers. */
const LessonPill: React.FC<{name: string}> = ({name}) => {
	const {colors, typography} = useTheme();
	const {u} = useVideoLayout();
	const tone = colors.lesson ?? {fill: colors.accent, on: colors.onAccent};
	return <div style={{padding: `${u(10)}px ${u(22)}px`, borderRadius: u(12), backgroundColor: tone.fill, color: tone.on, fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(TYPE.label + 4), lineHeight: 1}}>{name}</div>;
};

/**
 * The lesson's frame. 'classic': the lesson bar on top, then each card's own row (kind, section and number), then
 * its title. 'studio' (camp lessons, owner's choice on 31 Oct 2026): the card's kind and title take the top row
 * beside the logo, and where the viewer is (lesson, camp, chapter) moves to a band at the bottom (StudioBand), so
 * the figure and the text get the room the two header rows took. CourseLesson on its own and vertical video keep
 * the classic frame.
 */
type LessonLayout = 'classic' | 'studio';

const LessonLayoutContext = React.createContext<LessonLayout>('classic');

export const LessonLayoutProvider: React.FC<{layout: LessonLayout; children: React.ReactNode}> = ({layout, children}) => <LessonLayoutContext.Provider value={layout}>{children}</LessonLayoutContext.Provider>;

/** True on horizontal video in the studio layout. */
export const useStudio = (): boolean => {
	const layout = React.useContext(LessonLayoutContext);
	const {isLandscape} = useVideoLayout();
	return layout === 'studio' && isLandscape;
};

/** Height of the studio's top row (the chrome bar's own height), in reference pixels. */
export const STUDIO_HEADING_HEIGHT = CHROME_HEIGHT - SPACING.md;

/** Room kept at the right of the studio's top row for the logo. */
const STUDIO_LOGO_ROOM = 280;

/**
 * The studio's top row: the scene's kind as a badge and its title, beside the logo. A long title takes a smaller
 * size (measured, down to 70%) instead of a second line, which would run into the scene under it.
 */
export const StudioHeading: React.FC<{badge?: string; title?: string; size?: number}> = ({badge, title, size = TYPE.cardTitle - 4}) => {
	const {u, contentWidth} = useVideoLayout();
	const badgeRoom = badge ? textWidth(badge.toLocaleUpperCase('tr'), {size: TYPE.label, weight: 800, letterSpacingEm: 0.06}) + 48 + SPACING.md : 0;
	const room = contentWidth / u(1) - STUDIO_LOGO_ROOM - badgeRoom;
	const plain = title ? title.replace(/\*\*|\$/g, '') : '';
	const natural = plain ? textWidth(plain, {size, weight: 800}) : 0;
	const fitted = natural > room ? Math.max(size * 0.7, (size * room) / natural) : size;
	return (
		<div style={{height: u(STUDIO_HEADING_HEIGHT), flexShrink: 0, display: 'flex', alignItems: 'center', gap: u(SPACING.md), paddingRight: u(STUDIO_LOGO_ROOM), minWidth: 0}}>
			{badge ? (
				<Animated animation={{preset: 'slide', direction: 'down', distance: 24}} style={{flexShrink: 0}}>
					<Badge lesson size={TYPE.label}>
						{badge}
					</Badge>
				</Animated>
			) : null}
			{title ? (
				<Animated animation={{preset: 'slide', direction: 'right', distance: 50}} delaySeconds={0.1} style={{minWidth: 0}}>
					<Text variant="title" size={fitted} style={{whiteSpace: 'nowrap'}}>
						<RichInline text={title} />
					</Text>
				</Animated>
			) : null}
		</div>
	);
};

/** The bar at the top of every scene of the lesson: lesson, topic, and the logo. In the studio layout, the logo only. */
export const LessonChrome: React.FC<{script: LessonScript}> = ({script}) => {
	const {u} = useVideoLayout();
	const studio = useStudio();
	if (studio) {
		return (
			<ChromeBar style={{justifyContent: 'flex-end'}}>
				<BrandMark />
			</ChromeBar>
		);
	}
	return (
		<ChromeBar style={{justifyContent: 'space-between'}}>
			<div style={{display: 'flex', alignItems: 'center', gap: u(16), minWidth: 0}}>
				<LessonPill name={script.lessonName} />
				<Text variant="label" tone="muted" size={TYPE.label} style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
					{script.title}
				</Text>
			</div>
			<BrandMark />
		</ChromeBar>
	);
};

/** Box a card's visual is drawn in, in actual pixels: beside the text on horizontal video, under it on vertical. */
export const useVisualBox = (fullWidth: boolean, captioned = true) => {
	const {u, isLandscape, contentWidth, contentHeight} = useVideoLayout();
	const studio = useStudio();
	if (studio) {
		// Under the top row only; a lone figure also leaves room for its caption (StudioCard measures it).
		const height = contentHeight - u(STUDIO_HEADING_HEIGHT) - u(SPACING.lg);
		return fullWidth ? {width: contentWidth, height} : {width: contentWidth * COURSE_DESIGN.visualShare, height};
	}
	const height = contentHeight - u(CHROME_HEIGHT) - u(150);
	// 0.86 let a tall table under a title and caption reach the chapter bar; 0.7 keeps it clear (25 Oct 2026).
	// Without a caption the figure takes the caption's room too: a map or a process drawing left a 180 px empty
	// band under it at 0.7 (28 Oct 2026).
	if (fullWidth) return {width: contentWidth, height: height * (isLandscape ? (captioned ? 0.7 : 0.84) : captioned ? 0.62 : 0.72)};
	return isLandscape ? {width: contentWidth * COURSE_DESIGN.visualShare, height} : {width: contentWidth, height: height * 0.5};
};
