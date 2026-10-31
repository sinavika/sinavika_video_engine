import React from 'react';
import {z} from 'zod';
import {Picture} from '../../../Components/Illustrations/Picture';
import {Card} from '../../../Components/Layouts/Card';
import {FitBox} from '../../../Components/Layouts/FitBox';
import {Badge} from '../../../Components/Typography/Badge';
import {RichText} from '../../../Components/Typography/RichText';
import {Text} from '../../../Components/Typography/Text';
import {plainText, richText} from '../../../Schemas/RichText';
import {ImageSchema} from '../../../Schemas/Visual';
import {useTheme} from '../../../Themes/ThemeContext';
import {POST_TYPE} from '../../../Configurations/SocialIdentity';
import {ImageFrame, useImageLayout} from '../../Components/ImageFrame';
import {defineImageTemplate} from '../../ImageTemplateDefinition';
import {BrandingSchema} from '../../Schemas/ImageFields';

const QuestionCardSchema = z.object({
	subject: plainText(30).optional(),
	source: plainText(40).optional(),
	question: richText(500),
	/** A figure that belongs to the question. */
	image: ImageSchema.optional(),
	options: z.array(richText(100)).min(2).max(5).optional(),
	/** The line that invites an answer. */
	prompt: plainText(60).default('Cevabını yorumlara yaz!'),
	branding: BrandingSchema,
});

type Content = z.infer<typeof QuestionCardSchema>;

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

const QuestionCardImage: React.FC<{content: Content}> = ({content}) => {
	const {colors, typography, shape} = useTheme();
	const {u, wide} = useImageLayout();
	const options = content.options ?? [];
	const short = options.every((option) => option.length <= 16);

	return (
		<ImageFrame backdrop="canvas" branding={content.branding}>
			<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: u(20), marginBottom: u(28)}}>
				<Badge lesson tone="primary" icon="question" size={28}>
					{content.subject ? `${content.subject} · Günün sorusu` : 'Günün sorusu'}
				</Badge>
				{content.source ? (
					<Text size={26} tone="muted" weight={600}>
						{content.source}
					</Text>
				) : null}
			</div>
			<Card padding={wide ? 44 : 52} radius="lg" style={{flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column'}}>
				<FitBox>
					<div style={{display: 'flex', flexDirection: wide ? 'row' : 'column', gap: u(36), alignItems: wide ? 'center' : 'stretch'}}>
						<div style={{display: 'flex', flexDirection: 'column', gap: u(30), flex: 1, minWidth: 0}}>
							<RichText text={content.question} size={POST_TYPE.questionCard.question} weight={500} />
							{content.image ? <Picture image={content.image} height={300} /> : null}
						</div>
						{options.length > 0 ? (
							<div style={{display: 'grid', gridTemplateColumns: `repeat(${short && !wide ? 2 : 1}, minmax(0, 1fr))`, gap: u(16), flex: wide ? 0.8 : 'none'}}>
								{options.map((option, index) => (
									<div
										key={index}
										style={{
											display: 'flex',
											alignItems: 'center',
											gap: u(18),
											padding: u(18),
											borderRadius: u(shape.radius.md),
											backgroundColor: colors.surfaceAlt,
										}}
									>
										<div
											style={{
												width: u(58),
												height: u(58),
												borderRadius: '50%',
												backgroundColor: colors.primary,
												color: colors.onPrimary,
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												fontFamily: typography.display,
												fontWeight: typography.displayWeight,
												fontSize: u(28),
												flexShrink: 0,
											}}
										>
											{LETTERS[index]}
										</div>
										<RichText text={option} size={36} weight={typography.strongWeight} style={{minWidth: 0}} />
									</div>
								))}
							</div>
						) : null}
					</div>
				</FitBox>
			</Card>
			<Text variant="subtitle" size={38} tone="emphasis" align="center" style={{marginTop: u(28)}}>
				{content.prompt}
			</Text>
		</ImageFrame>
	);
};

/** A single question to share: the question, its figure and options on one card, with an invitation to answer. */
export const QuestionCard = defineImageTemplate({
	category: 'QuestionSolution',
	variant: 'QuestionCard',
	title: 'Soru: tek soruluk paylaşım',
	description: 'Soru metni, isteğe bağlı şekil ve seçenekler; altında cevaba davet eden satır.',
	contentSchema: QuestionCardSchema,
	sampleContent: {
		subject: 'Matematik',
		source: 'TYT Temel Matematik',
		question: '$3(x - 2) + 4 = 2x + 7$ denklemini sağlayan $x$ değeri kaçtır?',
		options: ['$7$', '$8$', '$9$', '$10$', '$11$'],
	},
	defaultTheme: 'SinavikaBrand',
	defaultSize: 'Square',
	outputName: (content) => `${content.source ?? content.subject ?? ''} Sorusu`,
	Component: QuestionCardImage,
});
