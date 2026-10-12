import React from 'react';
import {z} from 'zod';
import {Highlight} from '../../../Components/Animations/Highlight';
import {Icon} from '../../../Components/Illustrations/Icon';
import {Badge} from '../../../Components/Typography/Badge';
import {Text} from '../../../Components/Typography/Text';
import {plainText} from '../../../Schemas/RichText';
import {withAlpha} from '../../../Themes/Theme';
import {useInk, useTheme} from '../../../Themes/ThemeContext';
import {ImageFrame, useImageLayout} from '../../Components/ImageFrame';
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

const BoldQuestionImage: React.FC<{content: Content}> = ({content}) => {
	const {colors} = useTheme();
	const ink = useInk();
	const {u, wide} = useImageLayout();
	const [before, after] = content.emphasis ? content.hook.split(content.emphasis) : [content.hook, ''];
	const length = content.hook.length;
	const size = (length <= 34 ? 150 : length <= 60 ? 122 : 100) * (wide ? 0.92 : 1);

	return (
		<ImageFrame backdrop="gradient" branding={content.branding}>
			{/* An oversized question mark bleeds off the corner: texture, not content. */}
			<div style={{position: 'absolute', right: u(-190), top: u(-170), opacity: 0.12}}>
				<Icon name="question" size={760} strokeWidth={1.6} />
			</div>
			<div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: u(36), flex: 1, minHeight: 0, maxWidth: wide ? '74%' : undefined}}>
				{content.eyebrow ? <Badge tone={{fill: colors.accent, on: colors.onAccent}} size={30}>{content.eyebrow}</Badge> : null}
				<Text variant="display" size={size}>
					{before}
					{content.emphasis ? (
						<span style={{color: colors.onAccent}}>
							<Highlight color={colors.accent}>{content.emphasis}</Highlight>
						</span>
					) : null}
					{after}
				</Text>
				{content.teaser ? (
					<Text size={40} tone="muted" weight={500}>
						{content.teaser}
					</Text>
				) : null}
				<div style={{display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: u(16), padding: `${u(16)}px ${u(28)}px`, borderRadius: u(999), border: `${u(3)}px solid ${withAlpha(ink.text, 0.5)}`}}>
					<Text size={32} weight={700}>
						{content.cue}
					</Text>
					<Icon name="arrowRight" size={34} strokeWidth={2.8} />
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
	Component: BoldQuestionImage,
});
