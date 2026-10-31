import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BrandMark} from '../../Components/Overlays/BrandMark';
import {Text} from '../../Components/Typography/Text';
import {BRAND} from '../../Configurations/Brand';
import {BRAND_TYPOGRAPHY as TYPE} from '../../Configurations/BrandTypography';
import {COVER_STANDARD as C, coverShape, titleLinesAllowed} from '../../Configurations/SocialIdentity';
import {imageFrameOf, useImageLayout} from './ImageFrame';
import {lineCount, overflowNote, seriesSize, textWidth as measuredWidth} from './TextMeasure';

/**
 * The cover of every social post: a reel's first frame (VideoCover) and the
 * first image of a feed post (PromoDeck). One ground, one logo place, one
 * type, one highlight (Configurations/SocialIdentity, COVER_STANDARD), so the
 * profile grid reads as one brand whatever colours the videos use inside.
 *
 * Everything sits inside what the profile grid shows of the image (gridInsets):
 * the logo top left, then the label and the title. Type and places are fixed:
 * - one title size per shape (COVER_STANDARD.titleSizes), or one per series;
 * - the title starts at the same place on every cover of a shape, whether or
 *   not it has a label: under the logo when the cover has a picture, around
 *   the middle when it has none (so it never looks empty);
 * - lines are measured (TextMeasure), not guessed, so a picture placed under
 *   the title never meets it and a title is never cut.
 * Pictures are placed by the caller as `children` (a full-frame layer), using
 * useCoverLayout to know where the text ends.
 */

export type BrandCoverText = {
	title: string;
	/** The one word or phrase set white on orange. Must be part of the title. */
	emphasis?: string;
	/** A short label above the title: the series, feature or lesson. Never the brand's name (the logo says it). */
	tag?: string;
	/** The tag's accent, e.g. a lesson colour; brand orange by default. */
	tagColor?: string;
	/** Exam names in outlined pills beside the tag: "YKS", "KPSS". */
	exams?: readonly string[];
};

/** The tag to show: none when it only repeats the brand name. */
const tagOf = (tag: string | undefined): string | undefined => {
	const clean = tag?.trim();
	if (!clean) return undefined;
	return clean.toLocaleLowerCase('tr').replace(/[^\p{L}]/gu, '') === BRAND.name.toLocaleLowerCase('tr') ? undefined : clean;
};

/** Room above the title for the label, kept even without one so the title always starts at the same place. */
const LABEL_BLOCK = 74;

/** A cover's text column without React: the shape, the column's width and the title's box at a size (the title's own left padding off), in reference pixels. */
const coverColumn = (width: number, height: number) => {
	const {unit, insets} = imageFrameOf(width, height);
	const shape = coverShape(width, height);
	const column = ((shape === 'wide' ? 0.58 : 1) * (width - insets.left - insets.right)) / unit;
	return {shape, column, box: (size: number) => column - 0.08 * size};
};
/** How a cover title is set, for measuring. */
const TITLE = {weight: C.titleWeight, letterSpacingEm: C.titleLetterSpacingEm};

type CoverLayoutOptions = {
	/** No picture under the title: the text sits around the middle. */
	centred?: boolean;
	/** A series' one title size (useSeriesTitle); otherwise the shape's. */
	titleSize?: number;
	/** Lines kept for the title when placing things at fixed places: the series' longest title, or the shape's maximum. */
	reserveLines?: number;
};

/**
 * Where a cover's text sits, in actual pixels. `titleTop` is fixed for a
 * shape (or a series); `textBottom` is where this title ends, `reserveBottom`
 * where the longest title of the series would end.
 */
export const useCoverLayout = (text: BrandCoverText, options: CoverLayoutOptions = {}) => {
	const {u, width, height, insets} = useImageLayout();
	const {shape, column, box} = coverColumn(width, height);
	const wide = shape === 'wide';
	const textWidth = u(column);
	const base = options.titleSize ?? C.titleSizes[shape];
	// A planned title fits its shape's size (tests); an unplanned one too long for it steps down rather than spill or be cut.
	const titleSize = options.titleSize ?? seriesSize([text.title], C.seriesTitleSteps.filter((step) => step <= base), box(base), (size) => titleLinesAllowed(shape, size), TITLE).size;
	const maxLines = titleLinesAllowed(shape, titleSize);
	const measured = lineCount(text.title, box(titleSize), {...TITLE, size: titleSize});
	const lines = Number.isFinite(measured) ? Math.min(measured, maxLines + 1) : maxLines;
	const lineHeight = u(titleSize) * C.titleLineHeight;
	const anchored = options.centred || wide;
	const reserve = Math.max(lines, options.reserveLines ?? (anchored ? maxLines : lines));
	const logoBlock = u(BRAND.logo.sizes.cover) * (1 + 2 * BRAND.logo.clearSpaceRatio);
	const freeTop = insets.top + logoBlock + u(wide ? 24 : 56) + u(LABEL_BLOCK);
	const titleTop = anchored ? Math.max(freeTop, (height - reserve * lineHeight) / 2 + u(LABEL_BLOCK) / 2) : freeTop;
	return {
		left: insets.left,
		right: width - insets.right,
		top: insets.top,
		bottom: height - insets.bottom,
		labelTop: titleTop - u(LABEL_BLOCK),
		titleTop,
		textBottom: titleTop + lines * lineHeight,
		reserveBottom: titleTop + reserve * lineHeight,
		textWidth,
		titleSize,
		wide,
		shape,
	};
};

/** One title size for a whole series (a camp), from all its titles, for a cover `width` × `height`. */
export const seriesTitleOf = (titles: readonly string[], width: number, height: number): {size: number; lines: number} => {
	const {shape, box} = coverColumn(width, height);
	// The box is measured at the largest step; smaller steps lose less to the title's left padding, so this errs on the safe side.
	return seriesSize(titles, C.seriesTitleSteps, box(C.seriesTitleSteps[0]), (size) => titleLinesAllowed(shape, size), TITLE);
};

/** The label row's width (tag pill and exam pills), in reference pixels, as BrandCover draws it. */
const labelWidth = (text: BrandCoverText): number => {
	const tag = tagOf(text.tag);
	const pills = [...(tag ? [22 * 2 + 14 + 12 + measuredWidth(tag, {size: 34, weight: 800})] : []), ...(text.exams ?? []).map((exam) => 20 * 2 + 3 * 2 + measuredWidth(exam, {size: 30, weight: 800}))];
	return pills.reduce((sum, pill) => sum + pill, 0) + 14 * Math.max(0, pills.length - 1);
};

/**
 * What a cover cannot set at its fixed size (`titleSize` for a series), one
 * sentence each, for a template's checkLayout: a title longer than the lines
 * its size may take, a label row wider than the column (it would be cut).
 */
export const coverIssues = (text: BrandCoverText, frame: {width: number; height: number}, titleSize?: number): string[] => {
	const {shape, column, box} = coverColumn(frame.width, frame.height);
	const size = titleSize ?? C.titleSizes[shape];
	const allowed = titleLinesAllowed(shape, size);
	const lines = lineCount(text.title, box(size), {...TITLE, size});
	return [
		...(lines > allowed ? [`Kapak başlığı "${text.title}" ${size} puntoda ${overflowNote(lines, allowed)}. Kısalt.`] : []),
		...(labelWidth(text) > column ? [`Kapak etiketi "${[tagOf(text.tag), ...(text.exams ?? [])].filter(Boolean).join(' · ')}" tek satıra sığmıyor, kesilir. Kısalt.`] : []),
	];
};

/** One title size for a whole series (a camp), from all its titles, for the cover being drawn. */
export const useSeriesTitle = (titles: readonly string[]): {size: number; lines: number} => {
	const {width, height} = useImageLayout();
	return seriesTitleOf(titles, width, height);
};

/**
 * The mark is painted only from the top of the tall letters to the bottom of
 * the low ones: a full inline background reached up over the line above and hid
 * its descenders ("sayılar" read "savılar").
 */
export const markPaint = (color: string): string => `linear-gradient(to bottom, transparent 0.2em, ${color} 0.2em, ${color} calc(100% - 0.04em), transparent calc(100% - 0.04em))`;

/** The title with its one marked phrase (punctuation right after it goes on the mark too: "çöz."). */
const CoverTitle: React.FC<{title: string; emphasis?: string; size: number}> = ({title, emphasis, size}) => {
	const at = emphasis ? title.indexOf(emphasis) : -1;
	const end = at < 0 ? -1 : at + emphasis!.length + (title.slice(at + emphasis!.length).match(/^[.!?…]+/)?.[0].length ?? 0);
	return (
		// The mark's padding is matched by the title's own, so a line that starts on the mark lines up with the logo and label.
		<Text variant="display" size={size} weight={C.titleWeight} color={C.title} style={{lineHeight: C.titleLineHeight, letterSpacing: `${C.titleLetterSpacingEm}em`, paddingLeft: '0.08em'}}>
			{at < 0 ? (
				title
			) : (
				<>
					{title.slice(0, at)}
					<span style={{background: markPaint(C.mark), color: C.markText, padding: '0 0.08em', margin: '0 -0.08em', borderRadius: '0.1em', boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone'}}>{title.slice(at, end)}</span>
					{title.slice(end)}
				</>
			)}
		</Text>
	);
};

/** "Kaydır →" under the title of a carousel's cover. */
const SwipeCue: React.FC = () => {
	const {u} = useImageLayout();
	return (
		<div style={{alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: u(12), padding: `${u(12)}px ${u(24)}px`, borderRadius: u(999), background: C.tagFill, marginTop: u(8)}}>
			<Text size={30} weight={TYPE.weights.strong} color={C.title}>
				Kaydır
			</Text>
			<svg width={u(36)} height={u(22)} viewBox="0 0 40 24" fill="none" stroke={C.title} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
				<path d="M2 12 H36 M26 2 L36 12 L26 22" />
			</svg>
		</div>
	);
};

/**
 * `ground` is the brand navy everywhere except the camp series, whose lesson
 * covers stand on the lesson's own colour (owner, 29 Oct 2026); the layout,
 * logo and type stay the same.
 */
export const BrandCover: React.FC<BrandCoverText & CoverLayoutOptions & {swipe?: boolean; ground?: string; children?: React.ReactNode}> = ({centred = false, titleSize, reserveLines, swipe = false, ground = C.ground, children, ...text}) => {
	const {u} = useImageLayout();
	const layout = useCoverLayout(text, {centred, titleSize, reserveLines});
	const tag = tagOf(text.tag);
	const accent = text.tagColor ?? C.mark;
	return (
		<AbsoluteFill style={{background: ground, overflow: 'hidden'}}>
			{children}
			<div style={{position: 'absolute', left: layout.left, top: layout.top}}>
				<BrandMark size="cover" color={C.logoColor} />
			</div>
			{tag || text.exams?.length ? (
				// The label sits on the line just above the title, the same place on every cover.
				<div style={{position: 'absolute', left: layout.left, top: layout.labelTop, width: layout.textWidth, height: u(LABEL_BLOCK - 18), display: 'flex', alignItems: 'center', gap: u(14), flexWrap: 'nowrap', overflow: 'hidden'}}>
					{tag ? (
						<div style={{display: 'flex', alignItems: 'center', gap: u(12), padding: `${u(10)}px ${u(22)}px`, borderRadius: u(999), background: C.tagFill, flexShrink: 0}}>
							<div style={{width: u(14), height: u(14), borderRadius: '50%', background: accent}} />
							<Text size={34} weight={TYPE.weights.display} color={C.tagText} style={{lineHeight: 1, whiteSpace: 'nowrap'}}>
								{tag}
							</Text>
						</div>
					) : null}
					{text.exams?.map((exam) => (
						<div key={exam} style={{padding: `${u(8)}px ${u(20)}px`, borderRadius: u(999), border: `${u(3)}px solid ${C.muted}`, flexShrink: 0}}>
							<Text size={30} weight={TYPE.weights.display} color={C.title} style={{lineHeight: 1}}>
								{exam}
							</Text>
						</div>
					))}
				</div>
			) : null}
			<div style={{position: 'absolute', left: layout.left, top: layout.titleTop, width: layout.textWidth, display: 'flex', flexDirection: 'column', gap: u(18)}}>
				<CoverTitle title={text.title} emphasis={text.emphasis} size={layout.titleSize} />
				{swipe ? <SwipeCue /> : null}
			</div>
		</AbsoluteFill>
	);
};
