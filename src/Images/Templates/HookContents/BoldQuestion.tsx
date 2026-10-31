import React from 'react';
import {z} from 'zod';
import {Highlight} from '../../../Components/Animations/Highlight';
import {Icon} from '../../../Components/Illustrations/Icon';
import {Badge} from '../../../Components/Typography/Badge';
import {Text} from '../../../Components/Typography/Text';
import {plainText} from '../../../Schemas/RichText';
import {withAlpha} from '../../../Themes/Theme';
import {useInk, useTheme} from '../../../Themes/ThemeContext';
import {POST_TYPE} from '../../../Configurations/SocialIdentity';
import {ImageFrame, imageFrameOf, useImageLayout} from '../../Components/ImageFrame';
import {lineCount, overflowNote} from '../../Components/TextMeasure';
import {defineImageTemplate} from '../../ImageTemplateDefinition';
import {BrandingSchema} from '../../Schemas/ImageFields';

const BoldQuestionSchema = z.object({
	eyebrow: plainText(30).optional(),
	/** The line that stops the scroll. Keep it true: curiosity, not a claim the content cannot back up. */
	hook: plainText(90),
	/** The words of the hook to mark with the highlighter. Must appear in the hook. */
	emphasis: plainText(40).optional(),
	teaser: plainText(110).optional(),
	/** Where the answer is: next slide, caption, video. */
	cue: plainText(40).default('Cevap açıklamada'),
	branding: BrandingSchema,
}).refine((content) => !content.emphasis || content.hook.includes(content.emphasis), {
	path: ['emphasis'],
	message: 'emphasis must be a part of the hook text.',
});

type Content = z.infer<typeof BoldQuestionSchema>;

const H = POST_TYPE.hookPost;
const isWide = (width: number, height: number) => width / height > 1.25;
/** The hook's column, in reference pixels: inside the grid insets, three quarters of a wide image. */
const hookBox = (width: number, height: number) => {
	const {unit, insets} = imageFrameOf(width, height);
	return ((width - insets.left - insets.right) * (isWide(width, height) ? 0.74 : 1)) / unit;
};

/** A hook too long for the one hook size, or a teaser too long, is refused before rendering. */
const hookIssues = (content: Content, frame: {width: number; height: number}): string[] => {
	const box = hookBox(frame.width, frame.height);
	const size = isWide(frame.width, frame.height) ? H.hookWide : H.hook;
	const hook = lineCount(content.hook, box, {size, weight: H.hookWeight, letterSpacingEm: H.hookLetterSpacingEm});
	const teaser = content.teaser ? lineCount(content.teaser, box, {size: H.teaser, weight: H.teaserWeight}) : 0;
	return [
		...(hook > H.hookLines ? [`Hook "${content.hook}" ${size} puntoda ${overflowNote(hook, H.hookLines)}. Kısalt.`] : []),
		...(teaser > H.teaserLines ? [`Alt satır "${content.teaser}" ${H.teaser} puntoda ${overflowNote(teaser, H.teaserLines)}. Kısalt.`] : []),
	];
};

const BoldQuestionImage: React.FC<{content: Content}> = ({content}) => {
	const {colors} = useTheme();
	const ink = useInk();
	const {u, wide} = useImageLayout();
	const [before, after] = content.emphasis ? content.hook.split(content.emphasis) : [content.hook, ''];
	// One size per shape, whatever the hook's length (punto sabitliği); a hook that does not fit is refused (hookIssues).
	const size = wide ? H.hookWide : H.hook;

	return (
		<ImageFrame backdrop="gradient" branding={content.branding}>
			{/* An oversized question mark bleeds off the corner: texture, not content. */}
			<div style={{position: 'absolute', right: u(-190), top: u(-170), opacity: 0.12}}>
				<Icon name="question" size={760} strokeWidth={1.6} />
			</div>
			<div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: u(36), flex: 1, minHeight: 0, maxWidth: wide ? '74%' : undefined}}>
				{content.eyebrow ? <Badge tone={{fill: colors.accent, on: colors.onAccent}} size={30}>{content.eyebrow}</Badge> : null}
				<Text variant="display" size={size} weight={H.hookWeight} style={{letterSpacing: `${H.hookLetterSpacingEm}em`}}>
					{before}
					{content.emphasis ? (
						<span style={{color: colors.onAccent}}>
							<Highlight color={colors.accent}>{content.emphasis}</Highlight>
						</span>
					) : null}
					{after}
				</Text>
				{content.teaser ? (
					<Text size={H.teaser} tone="muted" weight={H.teaserWeight}>
						{content.teaser}
					</Text>
				) : null}
				<div style={{display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: u(16), padding: `${u(16)}px ${u(28)}px`, borderRadius: u(999), border: `${u(3)}px solid ${withAlpha(ink.text, 0.5)}`}}>
					<Text size={32} weight={700}>
						{content.cue}
					</Text>
				</div>
			</div>
		</ImageFrame>
	);
};

/** A scroll-stopper: one very large line on a gradient, part of it under a highlighter, and a cue to the answer. */
export const BoldQuestion = defineImageTemplate({
	category: 'HookContent',
	variant: 'BoldQuestion',
	title: 'Hook: büyük soru',
	description: 'Gradyan zeminde dev bir merak cümlesi, fosforlu vurgu ve cevabın nerede olduğunu söyleyen ipucu.',
	contentSchema: BoldQuestionSchema,
	sampleContent: {
		eyebrow: 'Günün sorusu',
		hook: '0,999… gerçekten 1’e eşit mi?',
		emphasis: '1’e eşit',
		teaser: 'Evet, tam olarak eşit. İspatı tek satır sürüyor.',
		cue: 'Cevap açıklamada',
	},
	defaultTheme: 'SinavikaBrand',
	defaultSize: 'Square',
	outputName: (content) => `${content.eyebrow ?? ''} Hook`,
	checkLayout: hookIssues,
	Component: BoldQuestionImage,
});
