import React from 'react';
import {z} from 'zod';
import {Icon} from '../../../Components/Illustrations/Icon';
import {Card} from '../../../Components/Layouts/Card';
import {Badge} from '../../../Components/Typography/Badge';
import {RichText} from '../../../Components/Typography/RichText';
import {Text} from '../../../Components/Typography/Text';
import {plainText, richText} from '../../../Schemas/RichText';
import {withAlpha} from '../../../Themes/Theme';
import {useTheme} from '../../../Themes/ThemeContext';
import {CallToAction} from '../../Components/CallToAction';
import {PhoneMockup} from '../../Components/DeviceMockups';
import {ImageFrame, useImageLayout} from '../../Components/ImageFrame';
import {defineImageTemplate} from '../../ImageTemplateDefinition';
import {BrandingSchema, CallToActionSchema, IconNameSchema, ScreenshotSchema} from '../../Schemas/ImageFields';

const SpotlightSchema = z.object({
	eyebrow: plainText(36).default('Öne çıkan özellik'),
	feature: plainText(40),
	description: richText(160),
	benefits: z
		.array(z.object({icon: IconNameSchema.default('check'), text: plainText(60)}))
		.min(2)
		.max(4),
	/** The screen where the feature lives. Without one, a neutral placeholder screen is drawn. */
	screenshot: ScreenshotSchema.optional(),
	cta: CallToActionSchema.optional(),
	branding: BrandingSchema,
});

type Content = z.infer<typeof SpotlightSchema>;

const SpotlightImage: React.FC<{content: Content}> = ({content}) => {
	const {colors} = useTheme();
	const {u, wide, tall} = useImageLayout();
	const ring = wide ? 640 : tall ? 760 : 620;

	// The phone stands inside concentric rings: a literal spotlight on one screen.
	const stage = (
		<div style={{position: 'relative', width: u(ring), height: u(ring), flexShrink: 0, alignSelf: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
			{[1, 0.76, 0.52].map((scale, index) => (
				<div
					key={scale}
					style={{
						position: 'absolute',
						width: u(ring * scale),
						height: u(ring * scale),
						borderRadius: '50%',
						backgroundColor: withAlpha(colors.primary, 0.1 + index * 0.08),
						border: `${u(2)}px solid ${withAlpha(colors.primary, 0.25)}`,
					}}
				/>
			))}
			<PhoneMockup screenshot={content.screenshot} width={ring * 0.4} />
		</div>
	);

	return (
		<ImageFrame backdrop="canvas" branding={content.branding}>
			<div style={{display: 'flex', flexDirection: wide ? 'row' : 'column', alignItems: wide ? 'center' : 'stretch', justifyContent: 'center', gap: u(wide ? 70 : 36), flex: 1, minHeight: 0}}>
				<div style={{display: 'flex', flexDirection: 'column', gap: u(22), flex: wide ? 1 : 'none', minWidth: 0, order: wide ? 0 : 1}}>
					<Badge tone="accent" icon="star" size={27}>
						{content.eyebrow}
					</Badge>
					<Text variant="headline" size={wide ? 86 : 78}>
						{content.feature}
					</Text>
					<RichText text={content.description} size={33} tone="muted" />
					<div style={{display: 'grid', gridTemplateColumns: `repeat(${wide || tall ? 1 : 2}, minmax(0, 1fr))`, gap: u(14)}}>
						{content.benefits.map((benefit, index) => (
							<Card key={index} padding={18} radius="md" elevated={false}>
								<div style={{display: 'flex', alignItems: 'center', gap: u(16)}}>
									<div style={{width: u(52), height: u(52), borderRadius: u(14), backgroundColor: colors.primary, color: colors.onPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
										<Icon name={benefit.icon} size={30} />
									</div>
									<Text size={27} weight={600} style={{flex: 1, minWidth: 0}}>
										{benefit.text}
									</Text>
								</div>
							</Card>
						))}
					</div>
					{content.cta ? <CallToAction action={content.cta} /> : null}
				</div>
				{stage}
			</div>
		</ImageFrame>
	);
};

/** One feature, nothing else: the screen it lives on inside spotlight rings, with its benefits as tiles. */
export const Spotlight = defineImageTemplate({
	category: 'FeatureSpotlight',
	variant: 'Spotlight',
	title: 'Özellik: tek özellik vurgusu',
	description: 'Halkalar içinde telefon ekranı, özelliğin adı, açıklaması ve ikonlu fayda kutuları.',
	contentSchema: SpotlightSchema,
	sampleContent: {
		feature: 'Adım adım çözüm',
		description: 'Takıldığın soruda yalnızca cevabı değil, **her adımın nedenini** gör.',
		benefits: [
			{icon: 'pencil', text: 'Her adım ayrı ayrı açıklanır'},
			{icon: 'lightbulb', text: 'Kritik noktalarda ipucu'},
			{icon: 'target', text: 'Benzer sorularla pekiştirme'},
			{icon: 'clock', text: 'Kendi hızında ilerle'},
		],
	},
	defaultTheme: 'SinavikaBrand',
	defaultSize: 'Portrait',
	outputName: (content) => `Ozellik ${content.feature}`,
	Component: SpotlightImage,
});
