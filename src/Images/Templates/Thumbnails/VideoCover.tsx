import React from 'react';
import {Img, staticFile} from 'remotion';
import {z} from 'zod';
import {COVER_STANDARD} from '../../../Configurations/SocialIdentity';
import {LESSON_GROUPS, lessonGroupOf} from '../../../Configurations/LessonColors';
import {BRAND_TYPOGRAPHY} from '../../../Configurations/BrandTypography';
import {plainText} from '../../../Schemas/RichText';
import {ImageSchema} from '../../../Schemas/Visual';
import {useTheme} from '../../../Themes/ThemeContext';
import {BrandCover, coverIssues, useCoverLayout, type BrandCoverText} from '../../Components/BrandCover';
import {useImageLayout} from '../../Components/ImageFrame';
import {textWidth} from '../../Components/TextMeasure';
import {defineImageTemplate} from '../../ImageTemplateDefinition';

const VideoCoverSchema = z.object({
	/** Five words or fewer read best at thumbnail size. */
	title: plainText(48),
	/** The words of the title to mark with the highlighter. Must appear in the title. */
	emphasis: plainText(30).optional(),
	/** The label above the title when the video has no lesson: the series or feature ("SinoAI", "Hızlı tekrar"). */
	kicker: plainText(30).optional(),
	/** A short tag after the label, e.g. "5 dk". */
	badge: plainText(14).optional(),
	/** The lesson the video belongs to: "Türkçe", "Matematik". Shown as the label, in the lesson's colour. */
	lesson: plainText(24).optional(),
	/** The exams the video is for, beside the label: "KPSS", "YKS". */
	exams: z.array(plainText(10)).max(4).default([]),
	/** A big number or symbol under (or beside) the title when there is no picture, e.g. "5" or "x²". */
	glyph: plainText(4).optional(),
	/** A picture under (or beside) the title: a figure, a screenshot, an archive photo. */
	image: ImageSchema.optional(),
}).refine((content) => !content.emphasis || content.title.includes(content.emphasis), {
	path: ['emphasis'],
	message: 'emphasis must be a part of the title.',
});

type Content = z.infer<typeof VideoCoverSchema>;

const resolveSource = (src: string): string => (/^(https?:|data:)/.test(src) ? src : staticFile(src));

/** The picture or glyph, in the space the cover leaves: under the title on the right (vertical), or beside it (wide). */
const CoverVisual: React.FC<{content: Content; text: BrandCoverText}> = ({content, text}) => {
	const {typography} = useTheme();
	const {u, width} = useImageLayout();
	const layout = useCoverLayout(text);
	const gap = u(56);
	const top = layout.wide ? layout.top : layout.textBottom + gap;
	const room = Math.max(0, Math.min(layout.bottom - top, layout.wide ? width * 0.36 : (layout.right - layout.left) * 0.72));
	const box: React.CSSProperties = layout.wide
		? {position: 'absolute', right: width - layout.right, top: layout.top, bottom: layout.top, display: 'flex', alignItems: 'center'}
		: {position: 'absolute', right: width - layout.right, top, width: room, height: room};
	if (content.image) {
		return (
			<div style={box}>
				<div style={{width: room, height: room, borderRadius: u(44), overflow: 'hidden', transform: 'rotate(3deg)', border: `${u(10)}px solid ${COVER_STANDARD.title}`, boxShadow: `0 ${u(30)}px ${u(70)}px rgba(0, 0, 0, 0.4)`}}>
					<Img src={resolveSource(content.image.src)} alt={content.image.alt ?? ''} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
				</div>
			</div>
		);
	}
	if (!content.glyph) return null;
	// The largest of two sizes at which the glyph's measured width stays inside its circle.
	const glyphSize = [0.6, 0.4].map((share) => room * share).find((candidate) => textWidth(content.glyph!, {size: candidate, weight: 800}) <= room * 0.72) ?? room * 0.4;
	return (
		<div style={box}>
			<div
				style={{
					width: room,
					height: room,
					borderRadius: '50%',
					backgroundColor: COVER_STANDARD.mark,
					color: COVER_STANDARD.markText,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					fontFamily: typography.display,
					fontWeight: BRAND_TYPOGRAPHY.weights.kinetic,
					fontSize: glyphSize,
					lineHeight: 1,
					transform: 'rotate(-6deg)',
					boxShadow: `0 ${u(30)}px ${u(70)}px rgba(0, 0, 0, 0.35), 0 0 0 ${u(20)}px ${COVER_STANDARD.tagFill}`,
				}}
			>
				{content.glyph}
			</div>
		</div>
	);
};

/**
 * A video's cover in the one cover standard (Images/Components/BrandCover):
 * navy, the logo top left, the label, the title with one marked phrase, and a
 * glyph or picture when given. The video's own theme does not change it.
 */
const coverText = (content: Content): BrandCoverText => {
	const group = lessonGroupOf(content.lesson);
	return {
		title: content.title,
		emphasis: content.emphasis,
		tag: [content.lesson ?? content.kicker, content.badge].filter(Boolean).join(' · ') || undefined,
		tagColor: group ? LESSON_GROUPS[group].dark : undefined,
		exams: content.exams,
	};
};

const VideoCoverImage: React.FC<{content: Content}> = ({content}) => {
	const text = coverText(content);
	const pictured = Boolean(content.image || content.glyph);
	return (
		<BrandCover {...text} centred={!pictured}>
			{pictured ? <CoverVisual content={content} text={text} /> : null}
		</BrandCover>
	);
};

/** A cover that reads at postage-stamp size: few words set big, one marked, on the brand's one cover design. */
export const VideoCover = defineImageTemplate({
	category: 'Thumbnails',
	variant: 'VideoCover',
	title: 'Kapak: video kapağı',
	description: 'Tek kapak standardı: lacivert zemin, sol üstte logo, etiket, tek vurgulu başlık; varsa görsel ya da dev bir sayı.',
	contentSchema: VideoCoverSchema,
	sampleContent: {
		title: 'Üslü sayılar 5 dakikada',
		emphasis: '5 dakikada',
		kicker: 'Hızlı tekrar',
		lesson: 'Matematik',
		exams: ['YKS', 'KPSS'],
		glyph: 'xⁿ',
	},
	defaultTheme: 'SinavikaDark',
	defaultSize: 'Landscape',
	outputName: (content) => `Kapak ${content.title}`,
	checkLayout: (content, frame) => coverIssues(coverText(content), frame),
	Component: VideoCoverImage,
});
