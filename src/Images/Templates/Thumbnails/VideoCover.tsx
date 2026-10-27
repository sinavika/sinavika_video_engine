import React from 'react';
import {Img, staticFile} from 'remotion';
import {z} from 'zod';
import {Highlight} from '../../../Components/Animations/Highlight';
import {Text} from '../../../Components/Typography/Text';
import {plainText} from '../../../Schemas/RichText';
import {ImageSchema} from '../../../Schemas/Visual';
import {withAlpha} from '../../../Themes/Theme';
import {contrastRatio} from '../../../Themes/ColorPalette';
import {BRAND_COLORS} from '../../../Configurations/BrandColors';
import {useInk, useTheme} from '../../../Themes/ThemeContext';
import {ImageFrame, useImageLayout} from '../../Components/ImageFrame';
import {defineImageTemplate} from '../../ImageTemplateDefinition';
import {BrandingSchema} from '../../Schemas/ImageFields';
import {BRAND_TYPOGRAPHY} from '../../../Configurations/BrandTypography';

const VideoCoverSchema = z.object({
	/** Five words or fewer read best at thumbnail size. */
	title: plainText(48),
	/** The words of the title to mark with the highlighter. Must appear in the title. */
	emphasis: plainText(30).optional(),
	kicker: plainText(30).optional(),
	/** A short tag beside the kicker, e.g. "5 dk". */
	badge: plainText(14).optional(),
	/** The lesson the video belongs to, set in the top corner: "Türkçe", "Matematik". */
	lesson: plainText(24).optional(),
	/** The exams the video is for, set above the kicker: "KPSS", "YKS". */
	exams: z.array(plainText(10)).max(4).default([]),
	/** A big number or symbol on the right when there is no picture, e.g. "5" or "x²". */
	glyph: plainText(4).optional(),
	/** A picture for the right side: a teacher, a figure, a screenshot. */
	image: ImageSchema.optional(),
	branding: BrandingSchema,
}).refine((content) => !content.emphasis || content.title.includes(content.emphasis), {
	path: ['emphasis'],
	message: 'emphasis must be a part of the title.',
});

type Content = z.infer<typeof VideoCoverSchema>;

/** The brand's navy, for marks on an orange ground. */
const BRAND_NAVY = BRAND_COLORS.brand.textPrimary;

const resolveSource = (src: string): string => (/^(https?:|data:)/.test(src) ? src : staticFile(src));

const VideoCoverImage: React.FC<{content: Content}> = ({content}) => {
	const theme = useTheme();
	const {colors, typography} = theme;
	const ink = useInk();
	const {u, wide, tall, width, height} = useImageLayout();
	const [before, after] = content.emphasis ? content.title.split(content.emphasis) : [content.title, ''];
	const side = Math.min(width, height) * (wide ? 0.78 : 0.5);
	// On vertical covers the corner sits below the strip the profile grid crops away.
	const cornerTop = tall ? u(210) : 0;
	const size = (content.title.length <= 20 ? 190 : content.title.length <= 34 ? 150 : 124) * (wide ? 1 : 0.86);
	// The highlighter must stand out from the ground: on an orange cover an orange mark vanished ("Quiz olsun",
	// 23 Oct 2026), so a mark too close to the ground turns brand navy with white type.
	const ground = (theme.gradient ?? [colors.primary, colors.accent])[0];
	const markOnAccent = contrastRatio(colors.accent, ground) >= 1.6;
	const mark = markOnAccent ? colors.accent : BRAND_NAVY;
	const markInk = markOnAccent ? colors.onAccent : '#FFFFFF';

	// Right-hand visual: the supplied picture in a tilted frame, or an oversized glyph in a disc.
	const visual = content.image ? (
		<div style={{width: side, height: side, borderRadius: u(48), overflow: 'hidden', transform: 'rotate(4deg)', border: `${u(12)}px solid ${ink.text}`, boxShadow: `0 ${u(30)}px ${u(80)}px rgba(0, 0, 0, 0.35)`, flexShrink: 0}}>
			<Img src={resolveSource(content.image.src)} alt={content.image.alt ?? ''} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
		</div>
	) : content.glyph ? (
		<div
			style={{
				width: side,
				height: side,
				borderRadius: '50%',
				backgroundColor: colors.accent,
				color: colors.onAccent,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				fontFamily: typography.display,
				fontWeight: BRAND_TYPOGRAPHY.weights.kinetic,
				fontSize: side * (content.glyph.length > 2 ? 0.4 : 0.6),
				lineHeight: 1,
				transform: 'rotate(-6deg)',
				boxShadow: `0 ${u(30)}px ${u(80)}px rgba(0, 0, 0, 0.3), 0 0 0 ${u(22)}px ${withAlpha(colors.accent, 0.28)}`,
				flexShrink: 0,
			}}
		>
			{content.glyph}
		</div>
	) : null;

	return (
		<ImageFrame backdrop="gradient" branding={content.branding} padding={64}>
			<div style={{position: 'relative', flex: 1, minHeight: 0, display: 'flex', flexDirection: wide ? 'row' : 'column', alignItems: 'center', justifyContent: 'space-between', gap: u(48)}}>
				{content.lesson ? (
					<div style={{position: 'absolute', top: cornerTop, left: 0, padding: `${u(14)}px ${u(30)}px`, borderRadius: u(16), backgroundColor: ink.text, color: colors.primary, fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(50), lineHeight: 1}}>
						{content.lesson}
					</div>
				) : null}
				<div style={{display: 'flex', flexDirection: 'column', gap: u(26), flex: 1, minWidth: 0, justifyContent: 'center', alignSelf: tall ? 'stretch' : undefined}}>
					{content.exams.length > 0 ? (
						<div style={{display: 'flex', flexWrap: 'wrap', gap: u(14)}}>
							{content.exams.map((exam) => (
								<div key={exam} style={{padding: `${u(10)}px ${u(24)}px`, borderRadius: u(999), border: `${u(4)}px solid ${ink.text}`, color: ink.text, fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(40), lineHeight: 1}}>
									{exam}
								</div>
							))}
						</div>
					) : null}
					<div style={{display: 'flex', alignItems: 'center', gap: u(20)}}>
						{content.badge ? (
							<div style={{padding: `${u(12)}px ${u(26)}px`, borderRadius: u(14), backgroundColor: ink.text, color: colors.primary, fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(44), lineHeight: 1}}>
								{content.badge}
							</div>
						) : null}
						{content.kicker ? (
							<Text variant="label" size={38}>
								{content.kicker}
							</Text>
						) : null}
					</div>
					<Text variant="display" size={size} weight={BRAND_TYPOGRAPHY.weights.kinetic} style={{lineHeight: 1, textShadow: `0 ${u(6)}px ${u(24)}px rgba(0, 0, 0, 0.25)`}}>
						{before}
						{content.emphasis ? (
							<span style={{color: markInk, textShadow: 'none'}}>
								<Highlight color={mark}>{content.emphasis}</Highlight>
							</span>
						) : null}
						{after}
					</Text>
				</div>
				{visual}
			</div>
		</ImageFrame>
	);
};

/** A cover that reads at postage-stamp size: few words set huge, one highlighted, next to a picture or a giant glyph. */
export const VideoCover = defineImageTemplate({
	category: 'Thumbnails',
	variant: 'VideoCover',
	title: 'Kapak: video kapağı',
	description: 'Dev başlık, fosforlu vurgu, köşe etiketi ve sağda görsel ya da dev bir sayı.',
	contentSchema: VideoCoverSchema,
	sampleContent: {
		title: 'Üslü sayılar 5 dakikada',
		emphasis: '5 dakikada',
		kicker: 'Hızlı tekrar',
		lesson: 'Matematik',
		exams: ['YKS', 'KPSS'],
		glyph: 'xⁿ',
	},
	defaultTheme: 'VibrantDynamic',
	defaultSize: 'Landscape',
	outputName: (content) => `Kapak ${content.title}`,
	Component: VideoCoverImage,
});
