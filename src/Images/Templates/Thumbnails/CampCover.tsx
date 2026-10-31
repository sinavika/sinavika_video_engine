import React from 'react';
import {z} from 'zod';
import {Text} from '../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY} from '../../../Configurations/BrandTypography';
import {courseLessonColor} from '../../../Configurations/LessonColors';
import {COVER_STANDARD as C} from '../../../Configurations/SocialIdentity';
import {plainText} from '../../../Schemas/RichText';
import {mixColors} from '../../../Themes/ColorPalette';
import {withAlpha} from '../../../Themes/Theme';
import {useTheme} from '../../../Themes/ThemeContext';
import {BrandCover, coverIssues, seriesTitleOf, useCoverLayout, useSeriesTitle, type BrandCoverText} from '../../Components/BrandCover';
import {useImageLayout} from '../../Components/ImageFrame';
import {defineImageTemplate} from '../../ImageTemplateDefinition';

const CampCoverSchema = z
	.object({
		/** The lesson code (TRK, MAT, ...): the cover stands on the lesson's colour. None for the camp's intro (brand navy). */
		lessonCode: z.string().min(1).max(20).optional(),
		/** The camp's name, the cover's label: "TYT Türkçe kampı". */
		camp: plainText(40),
		/** The lesson's number in the camp; 0 is the camp's intro ("BÖLÜM 00"). */
		number: z.number().int().min(0).max(99),
		/** How many lessons the camp has: one progress dot each. */
		total: z.number().int().min(2).max(99).optional(),
		/** The topic: "Sözcükte Anlam". Never shortened: the longest camp title (57 letters) fits. */
		title: plainText(64),
		/** Every lesson title of the camp (Curriculum/Camps): the title size is chosen once for the whole camp, so all its covers match. */
		series: z.array(plainText(64)).max(99).default([]),
		/** One part of the title set white on orange (the intro: "başlıyor"). Must be part of the title. */
		emphasis: plainText(30).optional(),
		/** The exams, as pills beside the label: "YKS", "TYT". */
		exams: z.array(plainText(10)).max(4).default([]),
		/** What the video is, in two or three words: "Konu anlatımı", "Hızlı tekrar". */
		kind: plainText(24).default('Konu anlatımı'),
		/** The intro's lessons (codes): a dot in each lesson's colour instead of the progress. */
		lessons: z.array(z.string().min(1).max(20)).max(16).default([]),
	})
	.refine((content) => content.total === undefined || content.number <= content.total, {path: ['number'], message: 'number must not exceed total.'})
	.refine((content) => !content.emphasis || content.title.includes(content.emphasis), {path: ['emphasis'], message: 'emphasis must be a part of the title.'});

type Content = z.infer<typeof CampCoverSchema>;

/** A lesson's colour lifted for a dark ground (as on dark themes, courseLessonTheme), so even a deep colour shows. */
const lifted = (code: string): string | undefined => {
	const color = courseLessonColor(code);
	return color ? mixColors(color, '#FFFFFF', 0.55) : undefined;
};

/** "DERS · Konu anlatımı", the lesson number set huge, and the camp's progress (or the intro's lesson colours): the series' own part. */
const LessonNumber: React.FC<{content: Content; text: BrandCoverText; onNavy: boolean; title: {size: number; lines: number}}> = ({content, text, onNavy, title}) => {
	const {typography} = useTheme();
	const {u, width} = useImageLayout();
	const layout = useCoverLayout(text, {titleSize: title.size, reserveLines: title.lines});
	const count = content.total ?? content.lessons.length;
	const dot = (count > 30 ? 16 : count > 16 ? 22 : 28) * (layout.wide ? 1 : 0.85);
	const place: React.CSSProperties = layout.wide
		? {position: 'absolute', right: width - layout.right, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', maxWidth: width * 0.36}
		: // Under the room of the camp's longest title: the same place on every lesson of the camp.
		  {position: 'absolute', left: layout.left, top: layout.reserveBottom + u(72), width: layout.right - layout.left, display: 'flex', flexDirection: 'column', alignItems: 'flex-start'};
	// The current lesson is brand orange on navy; on a lesson's colour orange can clash, so it is white there.
	const current = onNavy ? C.mark : '#FFFFFF';
	const row = (dots: React.ReactNode) => <div style={{display: 'flex', flexWrap: 'wrap', gap: u(dot * 0.5), marginTop: u(34), maxWidth: layout.wide ? width * 0.36 : layout.right - layout.left, justifyContent: layout.wide ? 'flex-end' : 'flex-start'}}>{dots}</div>;
	return (
		<div style={place}>
			<Text size={38} weight={BRAND_TYPOGRAPHY.weights.display} color={C.muted} style={{letterSpacing: '0.04em', lineHeight: 1}}>
				{`${content.number === 0 ? 'BÖLÜM' : 'DERS'} · ${content.kind}`}
			</Text>
			<div style={{display: 'flex', alignItems: 'baseline', gap: u(18), marginTop: u(10)}}>
				<span style={{fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(layout.wide ? 360 : 300), color: C.title, lineHeight: 0.86, letterSpacing: '-0.04em'}}>{String(content.number).padStart(2, '0')}</span>
				{content.total ? <span style={{fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.display, fontSize: u(64), color: C.muted, lineHeight: 1}}>{`/ ${content.total}`}</span> : null}
			</div>
			{content.total
				? row(
						Array.from({length: content.total}, (_, index) => {
							const lesson = index + 1;
							const now = lesson === content.number;
							return <div key={lesson} style={{width: u(now ? dot * 2.4 : dot), height: u(dot), borderRadius: u(dot), backgroundColor: now ? current : lesson < content.number ? withAlpha('#FFFFFF', 0.6) : 'transparent', border: lesson > content.number ? `${u(3)}px solid ${withAlpha('#FFFFFF', 0.4)}` : 'none'}} />;
						}),
					)
				: content.lessons.length
					? row(content.lessons.map((code) => <div key={code} style={{width: u(dot * 1.2), height: u(dot * 1.2), borderRadius: '50%', backgroundColor: lifted(code) ?? C.muted}} />))
					: null}
		</div>
	);
};

/**
 * The cover of every camp video, YouTube lesson and reel (owner, 29 Oct 2026:
 * "çok iyi olmuş, sakın bozma"). The one cover layout (Images/Components/
 * BrandCover): the logo top left, the camp as the label, the exams, the
 * topic, and the series' part: the lesson number and the camp's progress.
 * One title size and fixed places for the whole camp (`series`). A lesson's
 * cover stands on the lesson's own colour, so a lesson is found by its colour
 * on the channel; the camp's intro stands on brand navy with a dot
 * in each of its lessons' colours.
 */
const coverText = (content: Content): BrandCoverText => ({title: content.title, emphasis: content.emphasis, tag: content.camp, tagColor: content.lessonCode && courseLessonColor(content.lessonCode) ? '#FFFFFF' : undefined, exams: content.exams});

const CampCoverImage: React.FC<{content: Content}> = ({content}) => {
	const colour = content.lessonCode ? courseLessonColor(content.lessonCode) : undefined;
	const text = coverText(content);
	const title = useSeriesTitle([...content.series, content.title]);
	return (
		<BrandCover {...text} ground={colour ?? C.ground} titleSize={title.size} reserveLines={title.lines}>
			<LessonNumber content={content} text={text} onNavy={!colour} title={title} />
		</BrandCover>
	);
};

export const CampCover = defineImageTemplate({
	category: 'Thumbnails',
	variant: 'CampCover',
	title: 'Kapak: kamp dersi',
	description: 'Kamp kapağı: ders renginde zemin (tanıtımda lacivert), sol üstte logo, kamp etiketi, konu, dev ders numarası ve kampın ilerlemesi.',
	contentSchema: CampCoverSchema,
	sampleContent: {lessonCode: 'TRK', camp: 'TYT Türkçe kampı', number: 1, total: 15, title: 'Sözcükte Anlam', exams: ['YKS', 'TYT']},
	defaultTheme: 'SinavikaDark',
	defaultSize: 'Landscape',
	outputName: (content) => `Kapak ${content.camp} ${content.number} ${content.title}`,
	checkLayout: (content, frame) => coverIssues(coverText(content), frame, seriesTitleOf([...content.series, content.title], frame.width, frame.height).size),
	Component: CampCoverImage,
});
