import React from 'react';
import {AbsoluteFill} from 'remotion';
import {z} from 'zod';
import {BrandMark} from '../../../Components/Overlays/BrandMark';
import {BRAND_TYPOGRAPHY} from '../../../Configurations/BrandTypography';
import {courseLessonColor} from '../../../Configurations/LessonColors';
import {plainText} from '../../../Schemas/RichText';
import {mixColors, readableOn} from '../../../Themes/ColorPalette';
import {withAlpha} from '../../../Themes/Theme';
import {useTheme} from '../../../Themes/ThemeContext';
import {useImageLayout} from '../../Components/ImageFrame';
import {defineImageTemplate} from '../../ImageTemplateDefinition';

const CampCoverSchema = z
	.object({
		/** The lesson code (TRK, MAT, ...): the cover is painted in its colour, so a lesson is found by its colour. */
		lessonCode: z.string().min(1).max(20),
		/** The camp's name: "TYT Türkçe kampı". */
		camp: plainText(40),
		/** The lesson's number in the camp and how many there are. */
		number: z.number().int().min(1).max(99),
		total: z.number().int().min(2).max(99),
		/** The topic: "Sözcükte Anlam". */
		title: plainText(48),
		/** The exams, as chips: "YKS", "TYT". */
		exams: z.array(plainText(10)).max(4).default([]),
		/** What the video is, in two or three words: "Konu anlatımı", "Hızlı tekrar". */
		kind: plainText(24).default('Konu anlatımı'),
	})
	.refine((content) => content.number <= content.total, {path: ['number'], message: 'number must not exceed total.'});

type Content = z.infer<typeof CampCoverSchema>;

/**
 * The cover of a camp video, the same for every lesson of every camp so the
 * series is recognised on a channel page: the whole cover in the lesson's
 * colour (a student looking for Türkçe looks for its colour), the lesson
 * number set huge, the topic, the camp's name and where the lesson stands in
 * the camp. Built to read at thumbnail size: three things, all large.
 */
const CampCoverImage: React.FC<{content: Content}> = ({content}) => {
	const {colors, typography} = useTheme();
	const {u, wide, tall} = useImageLayout();
	const fill = courseLessonColor(content.lessonCode) ?? colors.primary;
	const ink = readableOn(fill);
	const deep = mixColors(fill, '#000000', 0.35);
	const number = String(content.number).padStart(2, '0');
	const titleSize = (content.title.length <= 14 ? 168 : content.title.length <= 24 ? 140 : 112) * (wide ? 1 : 0.9);
	const dot = (content.total > 30 ? 16 : content.total > 16 ? 22 : 30) * (wide ? 1 : 0.8);

	const chips = (
		<div style={{display: 'flex', flexWrap: 'wrap', gap: u(14), alignItems: 'center'}}>
			<div style={{padding: `${u(12)}px ${u(26)}px`, borderRadius: u(999), backgroundColor: ink, color: fill, fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(40), lineHeight: 1}}>{content.camp}</div>
			{content.exams.map((exam) => (
				<div key={exam} style={{padding: `${u(10)}px ${u(22)}px`, borderRadius: u(999), border: `${u(4)}px solid ${ink}`, color: ink, fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(34), lineHeight: 1}}>
					{exam}
				</div>
			))}
		</div>
	);

	const lessonNumber = (
		<div style={{display: 'flex', flexDirection: 'column', alignItems: wide ? 'flex-start' : 'flex-start', flexShrink: 0}}>
			<div style={{fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(54), color: withAlpha(ink, 0.82), lineHeight: 1, letterSpacing: '0.04em'}}>DERS</div>
			<div style={{fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(wide ? 400 : 360), color: ink, lineHeight: 0.86, letterSpacing: '-0.04em', textShadow: `0 ${u(14)}px ${u(40)}px ${withAlpha(deep, 0.6)}`}}>{number}</div>
		</div>
	);

	const title = (
		<div style={{display: 'flex', flexDirection: 'column', gap: u(18), minWidth: 0}}>
			<div style={{fontFamily: typography.display, fontWeight: 700, fontSize: u(44), color: withAlpha(ink, 0.85), lineHeight: 1}}>{content.kind}</div>
			<div style={{fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(titleSize), color: ink, lineHeight: 0.98, letterSpacing: '-0.02em'}}>{content.title}</div>
		</div>
	);

	const progress = (
		<div style={{display: 'flex', alignItems: 'center', gap: u(dot * 0.5), flexWrap: 'wrap'}}>
			{Array.from({length: content.total}, (_, index) => {
				const lesson = index + 1;
				const current = lesson === content.number;
				return <div key={lesson} style={{width: u(current ? dot * 2.4 : dot), height: u(dot), borderRadius: u(dot), backgroundColor: current ? ink : lesson < content.number ? withAlpha(ink, 0.6) : 'transparent', border: lesson > content.number ? `${u(3)}px solid ${withAlpha(ink, 0.45)}` : 'none'}} />;
			})}
		</div>
	);

	return (
		<AbsoluteFill
			style={{
				backgroundColor: fill,
				backgroundImage: `radial-gradient(circle at 92% 0%, ${withAlpha('#FFFFFF', 0.16)} 0%, transparent 42%), linear-gradient(160deg, transparent 52%, ${withAlpha(deep, 0.55)} 100%)`,
				padding: u(72),
				// On vertical covers the profile grid crops the top and bottom: keep everything in the middle.
				paddingTop: u(tall ? 260 : 64),
				paddingBottom: u(tall ? 260 : 64),
				display: 'flex',
				flexDirection: 'column',
				gap: u(tall ? 60 : 36),
			}}
		>
			<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: u(24)}}>
				{chips}
				{wide ? <BrandMark color={ink} /> : null}
			</div>
			<div style={{flex: 1, minHeight: 0, display: 'flex', flexDirection: wide ? 'row' : 'column', alignItems: wide ? 'center' : 'flex-start', justifyContent: wide ? 'flex-start' : 'center', gap: u(wide ? 64 : 40)}}>
				{lessonNumber}
				{title}
			</div>
			{/* Vertical covers have no room beside the progress: the logo goes under it. */}
			<div style={{display: 'flex', flexDirection: wide ? 'row' : 'column', alignItems: wide ? 'center' : 'flex-start', justifyContent: 'space-between', gap: u(wide ? 24 : 40)}}>
				{progress}
				{wide ? null : <BrandMark color={ink} />}
			</div>
		</AbsoluteFill>
	);
};

/** The cover of every camp video (YouTube lesson and reel): lesson colour, lesson number, topic, camp. */
export const CampCover = defineImageTemplate({
	category: 'Thumbnails',
	variant: 'CampCover',
	title: 'Kapak: kamp dersi',
	description: 'Ders renginde zemin, dev ders numarası, konu, kamp adı ve kampın ilerlemesi: YouTube serisi kapağı.',
	contentSchema: CampCoverSchema,
	sampleContent: {lessonCode: 'TRK', camp: 'TYT Türkçe kampı', number: 1, total: 15, title: 'Sözcükte Anlam', exams: ['YKS', 'TYT']},
	defaultTheme: 'SinavikaLight',
	defaultSize: 'Landscape',
	outputName: (content) => `Kapak ${content.camp} ${content.number} ${content.title}`,
	Component: CampCoverImage,
});
