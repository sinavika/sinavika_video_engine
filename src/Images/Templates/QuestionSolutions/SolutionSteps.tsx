import React from 'react';
import {z} from 'zod';
import {Icon} from '../../../Components/Illustrations/Icon';
import {Card} from '../../../Components/Layouts/Card';
import {FitBox} from '../../../Components/Layouts/FitBox';
import {Badge} from '../../../Components/Typography/Badge';
import {MathExpression} from '../../../Components/Typography/MathExpression';
import {RichText} from '../../../Components/Typography/RichText';
import {Text} from '../../../Components/Typography/Text';
import {latex, plainText, richText} from '../../../Schemas/RichText';
import {useTheme} from '../../../Themes/ThemeContext';
import {ImageFrame, useImageLayout} from '../../Components/ImageFrame';
import {defineImageTemplate} from '../../ImageTemplateDefinition';
import {BrandingSchema} from '../../Schemas/ImageFields';

const SolutionStepsSchema = z.object({
	subject: plainText(30).optional(),
	question: richText(300),
	steps: z
		.array(z.object({title: plainText(60), formula: latex(160).optional(), note: richText(140).optional()}))
		.min(2)
		.max(5),
	answer: richText(80),
	branding: BrandingSchema,
});

type Content = z.infer<typeof SolutionStepsSchema>;

const SolutionStepsImage: React.FC<{content: Content}> = ({content}) => {
	const {colors, typography} = useTheme();
	const {u} = useImageLayout();
	const rail = u(64);

	return (
		<ImageFrame backdrop="canvas" branding={content.branding}>
			<FitBox fill>
				<div style={{display: 'flex', flexDirection: 'column', gap: u(30)}}>
					<Badge tone="primary" icon="pencil" size={28}>
						{content.subject ? `${content.subject} · Adım adım çözüm` : 'Adım adım çözüm'}
					</Badge>
					<Card padding={32} radius="md">
						<RichText text={content.question} size={36} weight={500} />
					</Card>
					<div style={{position: 'relative', display: 'flex', flexDirection: 'column', gap: u(22)}}>
						{/* The rail joins the step numbers into one path from question to answer. */}
						<div style={{position: 'absolute', left: rail / 2 - u(3), top: rail / 2, bottom: rail / 2, width: u(6), borderRadius: u(6), backgroundColor: colors.border}} />
						{content.steps.map((step, index) => (
							<div key={index} style={{position: 'relative', display: 'flex', gap: u(26), alignItems: 'flex-start'}}>
								<div
									style={{
										width: rail,
										height: rail,
										borderRadius: '50%',
										backgroundColor: colors.primary,
										color: colors.onPrimary,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										fontFamily: typography.display,
										fontWeight: typography.displayWeight,
										fontSize: u(32),
										flexShrink: 0,
									}}
								>
									{index + 1}
								</div>
								<div style={{display: 'flex', flexDirection: 'column', gap: u(8), flex: 1, minWidth: 0, paddingTop: u(8)}}>
									<Text variant="subtitle" size={38}>
										{step.title}
									</Text>
									{step.formula ? (
										<Text size={42}>
											<MathExpression latex={step.formula} />
										</Text>
									) : null}
									{step.note ? <RichText text={step.note} size={29} tone="muted" /> : null}
								</div>
							</div>
						))}
					</div>
					<Card tone={{fill: colors.success, on: colors.onStatus}} padding={30} radius="md">
						<div style={{display: 'flex', alignItems: 'center', gap: u(20)}}>
							<Icon name="check" size={56} strokeWidth={3} />
							<div>
								<Text variant="label" size={24}>
									Cevap
								</Text>
								<RichText text={content.answer} variant="title" size={52} />
							</div>
						</div>
					</Card>
				</div>
			</FitBox>
		</ImageFrame>
	);
};

/** A worked solution on one image: the question, numbered steps on a rail, and the answer in a success panel. */
export const SolutionSteps = defineImageTemplate({
	category: 'QuestionSolution',
	variant: 'SolutionSteps',
	title: 'Soru: adım adım çözüm',
	description: 'Soru kartı, ray üzerinde numaralı çözüm adımları ve vurgulu cevap paneli.',
	contentSchema: SolutionStepsSchema,
	sampleContent: {
		subject: 'Matematik',
		question: '$3(x - 2) + 4 = 2x + 7$ ise $x$ kaçtır?',
		steps: [
			{title: 'Parantezi aç', formula: '3x - 6 + 4 = 2x + 7'},
			{title: 'Sabitleri birleştir', formula: '3x - 2 = 2x + 7'},
			{title: 'Bilinmeyeni yalnız bırak', formula: '3x - 2x = 7 + 2', note: 'Taraf değiştiren terimin **işareti değişir**.'},
		],
		answer: '$x = 9$',
	},
	defaultTheme: 'SinavikaBrand',
	defaultSize: 'Portrait',
	outputName: (content) => `${content.subject ?? ''} Adim Adim Cozum`,
	Component: SolutionStepsImage,
});
