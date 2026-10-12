import React from 'react';
import {z} from 'zod';
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

const ConceptCardSchema = z.object({
	subject: plainText(30).optional(),
	title: plainText(50),
	definition: richText(220),
	formula: z.object({latex: latex(200), caption: plainText(90).optional()}).optional(),
	points: z.array(richText(110)).max(4).default([]),
	branding: BrandingSchema,
});

type Content = z.infer<typeof ConceptCardSchema>;

const ConceptCardImage: React.FC<{content: Content}> = ({content}) => {
	const {colors} = useTheme();
	const {u, wide} = useImageLayout();

	const formula = content.formula ? (
		<Card tone="primary" padding={36} radius="lg" style={{flex: wide ? 1 : 'none'}}>
			<Text size={66} align="center">
				<MathExpression latex={content.formula.latex} display style={{margin: 0}} />
			</Text>
			{content.formula.caption ? (
				<Text size={26} tone="muted" align="center" style={{marginTop: u(12)}}>
					{content.formula.caption}
				</Text>
			) : null}
		</Card>
	) : null;

	return (
		<ImageFrame backdrop="canvas" branding={content.branding}>
			<FitBox fill>
				<div style={{display: 'flex', flexDirection: 'column', gap: u(30)}}>
					{content.subject ? (
						<Badge lesson tone="accent" icon="book" size={27}>
							{content.subject} · Konu özeti
						</Badge>
					) : null}
					<div style={{borderLeft: `${u(14)}px solid ${colors.canvasAccent}`, paddingLeft: u(28)}}>
						<Text variant="display" size={104}>
							{content.title}
						</Text>
					</div>
					<RichText text={content.definition} size={38} />
					<div style={{display: 'flex', flexDirection: wide ? 'row' : 'column', gap: u(26), alignItems: 'stretch'}}>
						{formula}
						{content.points.length > 0 ? (
							<div style={{display: 'flex', flexDirection: 'column', gap: u(14), flex: 1, minWidth: 0}}>
								{content.points.map((point, index) => (
									<Card key={index} padding={22} radius="md" elevated={false}>
										<div style={{display: 'flex', alignItems: 'center', gap: u(18)}}>
											<div style={{width: u(16), height: u(16), borderRadius: '50%', backgroundColor: colors.accent, flexShrink: 0}} />
											<RichText text={point} size={32} style={{flex: 1, minWidth: 0}} />
										</div>
									</Card>
								))}
							</div>
						) : null}
					</div>
				</div>
			</FitBox>
		</ImageFrame>
	);
};

/** One concept on one card: big title, definition, the key formula and the points to remember. */
export const ConceptCard = defineImageTemplate({
	category: 'TopicExplanation',
	variant: 'ConceptCard',
	title: 'Konu: kavram ve formül kartı',
	description: 'Büyük başlık, tanım, öne çıkan formül paneli ve akılda kalacak maddeler.',
	contentSchema: ConceptCardSchema,
	sampleContent: {
		subject: 'Matematik',
		title: 'Üslü Sayılar',
		definition: 'Bir sayının kendisiyle tekrarlı çarpımının kısa gösterimidir: $a^n$ ifadesinde $a$ **taban**, $n$ **üs**.',
		formula: {latex: 'a^m \\cdot a^n = a^{m+n}', caption: 'Tabanlar aynıysa üsler toplanır'},
		points: ['Bölmede üsler **çıkarılır**', '$a^0 = 1$, $a \\neq 0$', '$a^{-n} = \\dfrac{1}{a^n}$'],
	},
	defaultTheme: 'AcademicLight',
	defaultSize: 'Portrait',
	outputName: (content) => `${content.subject ?? ''} ${content.title}`,
	Component: ConceptCardImage,
});
