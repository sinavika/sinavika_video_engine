import React from 'react';
import {z} from 'zod';
import {Icon} from '../../../Components/Illustrations/Icon';
import {Card} from '../../../Components/Layouts/Card';
import {FitBox} from '../../../Components/Layouts/FitBox';
import {RichText} from '../../../Components/Typography/RichText';
import {Text} from '../../../Components/Typography/Text';
import {plainText, richText} from '../../../Schemas/RichText';
import {useTheme} from '../../../Themes/ThemeContext';
import {CallToAction} from '../../Components/CallToAction';
import {ImageFrame, useImageLayout} from '../../Components/ImageFrame';
import {defineImageTemplate} from '../../ImageTemplateDefinition';
import {BrandingSchema, CallToActionSchema, IconNameSchema} from '../../Schemas/ImageFields';

const UpdateSchema = z.object({
	badge: plainText(14).default('Yeni'),
	title: plainText(70),
	description: richText(180).optional(),
	items: z
		.array(z.object({icon: IconNameSchema.default('check'), text: plainText(70)}))
		.max(4)
		.default([]),
	/** A date or version, e.g. "12 Ekim" or "Sürüm 2.4". */
	date: plainText(30).optional(),
	cta: CallToActionSchema.optional(),
	branding: BrandingSchema,
});

type Content = z.infer<typeof UpdateSchema>;

const UpdateImage: React.FC<{content: Content}> = ({content}) => {
	const {colors, typography} = useTheme();
	const {u, wide} = useImageLayout();

	return (
		<ImageFrame backdrop="primary" branding={content.branding}>
			<FitBox fill>
				<div style={{display: 'flex', flexDirection: wide ? 'row' : 'column', gap: u(wide ? 60 : 36), alignItems: wide ? 'center' : 'stretch'}}>
					<div style={{display: 'flex', flexDirection: 'column', gap: u(24), flex: 1, minWidth: 0}}>
						<div style={{display: 'flex', alignItems: 'center', gap: u(20)}}>
							{/* The rotated sticker is the one loud element; everything else stays calm. */}
							<div
								style={{
									padding: `${u(14)}px ${u(30)}px`,
									borderRadius: u(16),
									backgroundColor: colors.accent,
									color: colors.onAccent,
									fontFamily: typography.display,
									fontWeight: typography.displayWeight,
									fontSize: u(46 * typography.displayScale),
									lineHeight: 1,
									textTransform: 'uppercase',
									transform: 'rotate(-4deg)',
									boxShadow: `0 ${u(12)}px ${u(28)}px rgba(0, 0, 0, 0.22)`,
								}}
							>
								{content.badge}
							</div>
							{content.date ? (
								<Text size={30} tone="muted" weight={600}>
									{content.date}
								</Text>
							) : null}
						</div>
						<Text variant="display" size={104}>
							{content.title}
						</Text>
						{content.description ? <RichText text={content.description} size={36} tone="muted" /> : null}
						{content.cta ? <CallToAction action={content.cta} inverse /> : null}
					</div>
					{content.items.length > 0 ? (
						<Card padding={34} radius="lg" style={{flex: wide ? 0.85 : 'none', minWidth: 0}}>
							<Text variant="label" tone="muted" size={24} style={{marginBottom: u(20)}}>
								Neler değişti
							</Text>
							<div style={{display: 'flex', flexDirection: 'column', gap: u(20)}}>
								{content.items.map((item, index) => (
									<div key={index} style={{display: 'flex', alignItems: 'center', gap: u(18)}}>
										<div style={{width: u(56), height: u(56), borderRadius: u(16), backgroundColor: colors.surfaceAlt, color: colors.primaryText, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
											<Icon name={item.icon} size={32} />
										</div>
										<Text size={32} weight={600} style={{flex: 1, minWidth: 0}}>
											{item.text}
										</Text>
									</div>
								))}
							</div>
						</Card>
					) : null}
				</div>
			</FitBox>
		</ImageFrame>
	);
};

/** News from the product: a tilted "Yeni" sticker, a big headline and a "what changed" card on the brand colour. */
export const Update = defineImageTemplate({
	category: 'Announcements',
	variant: 'Update',
	title: 'Duyuru: yenilik ve güncelleme',
	description: 'Marka rengi zeminde eğik etiket, büyük başlık ve "neler değişti" kartı.',
	contentSchema: UpdateSchema,
	sampleContent: {
		badge: 'Yeni',
		title: 'Sesli konu anlatımı geldi',
		description: 'Konu özetlerini artık **dinleyerek** de tekrar edebilirsin.',
		items: [
			{icon: 'bolt', text: 'Hızlı tekrar videoları'},
			{icon: 'book', text: 'Sesli konu özetleri'},
			{icon: 'clock', text: 'Kaldığın yerden devam'},
		],
		date: 'Örnek duyuru',
		cta: {label: 'Hemen dene'},
	},
	defaultTheme: 'SinavikaBrand',
	defaultSize: 'Square',
	outputName: (content) => `Duyuru ${content.title}`,
	Component: UpdateImage,
});
