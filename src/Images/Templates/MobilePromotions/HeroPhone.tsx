import React from 'react';
import {Icon} from '../../../Components/Illustrations/Icon';
import {FitBox} from '../../../Components/Layouts/FitBox';
import {Badge} from '../../../Components/Typography/Badge';
import {RichText} from '../../../Components/Typography/RichText';
import {Text} from '../../../Components/Typography/Text';
import {plainText, richText} from '../../../Schemas/RichText';
import {withAlpha} from '../../../Themes/Theme';
import {useTheme} from '../../../Themes/ThemeContext';
import {z} from 'zod';
import {StoreBadges} from '../../../Components/Brand/StoreBadge';
import {CallToAction} from '../../Components/CallToAction';
import {PhoneMockup} from '../../Components/DeviceMockups';
import {ImageFrame, useImageLayout} from '../../Components/ImageFrame';
import {defineImageTemplate} from '../../ImageTemplateDefinition';
import {AppScreenSchema, BrandingSchema, CallToActionSchema, ScreenshotSchema} from '../../Schemas/ImageFields';

const HeroPhoneSchema = z.object({
	eyebrow: plainText(36).optional(),
	/** `**word**` is drawn in the accent colour. */
	title: richText(80),
	subtitle: richText(170).optional(),
	features: z.array(plainText(42)).max(4).default([]),
	/** The real app screen to show. Without one, a neutral placeholder screen is drawn. */
	screenshot: ScreenshotSchema.optional(),
	/** The drawn app screen to show when no screenshot is given. */
	appScreen: AppScreenSchema.optional(),
	cta: CallToActionSchema.optional(),
	/** Show App Store / Google Play availability. */
	stores: z.boolean().default(true),
	branding: BrandingSchema,
});

type Content = z.infer<typeof HeroPhoneSchema>;

const HeroPhoneImage: React.FC<{content: Content}> = ({content}) => {
	const {colors} = useTheme();
	const {u, wide, tall, width, height} = useImageLayout();
	const phoneWidth = wide ? 400 : tall ? 540 : 470;

	const copy = (
		<div style={{display: 'flex', flexDirection: 'column', gap: u(26)}}>
			{content.eyebrow ? <Badge tone="accent">{content.eyebrow}</Badge> : null}
			<RichText text={content.title} variant="headline" size={wide ? 92 : 86} />
			{content.subtitle ? <RichText text={content.subtitle} size={36} tone="muted" /> : null}
			{content.features.length > 0 ? (
				<div style={{display: 'flex', flexDirection: 'column', gap: u(14)}}>
					{content.features.map((feature) => (
						<div key={feature} style={{display: 'flex', alignItems: 'center', gap: u(14)}}>
							<div style={{width: u(40), height: u(40), borderRadius: '50%', backgroundColor: colors.success, color: colors.onStatus, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
								<Icon name="check" size={24} strokeWidth={3.2} />
							</div>
							<Text size={32} weight={600}>
								{feature}
							</Text>
						</div>
					))}
				</div>
			) : null}
			{content.cta ? <CallToAction action={content.cta} /> : null}
			{content.stores ? <StoreBadges height={84} align="flex-start" /> : null}
		</div>
	);

	// The phone is anchored to a corner and deliberately runs off the edge: it reads as a product shot, not a pasted picture.
	const phone = (
		<div
			style={{
				position: 'absolute',
				right: wide ? u(170) : u(-40),
				bottom: wide ? u(-110) : tall ? u(130) : u(-420),
				filter: `drop-shadow(0 0 ${u(90)}px ${withAlpha(colors.primary, 0.35)})`,
			}}
		>
			<PhoneMockup screenshot={content.screenshot} screen={content.appScreen} width={phoneWidth} tilt={wide ? 5 : 7} />
		</div>
	);

	return (
		<ImageFrame backdrop="spotlight" branding={content.branding}>
			{phone}
			<FitBox align={wide ? 'center' : 'start'} style={{maxWidth: wide ? width * 0.5 : tall ? undefined : width * 0.56, maxHeight: tall ? height * 0.42 : undefined}}>
				{copy}
			</FitBox>
		</ImageFrame>
	);
};

/** One phone, one promise: headline and benefits beside a large, tilted device. */
export const HeroPhone = defineImageTemplate({
	category: 'MobilePromotion',
	variant: 'HeroPhone',
	title: 'Mobil tanıtım: tek telefon',
	description: 'Başlık, avantaj listesi, mağaza rozetleri ve büyük, eğik bir telefon mockup’ı.',
	contentSchema: HeroPhoneSchema,
	sampleContent: {
		eyebrow: 'Sınavika mobil',
		title: 'Sınava hazırlık artık **cebinde**',
		subtitle: 'Soru çöz, konu tekrar et, ilerlemeni takip et.',
		features: ['Adım adım soru çözümleri', 'Kişiye özel çalışma planı', 'Günlük hızlı tekrarlar'],
		cta: {label: 'Hemen başla', note: 'Ücretsiz dene'},
	},
	defaultTheme: 'SinavikaBrand',
	defaultSize: 'Portrait',
	outputName: (content) => content.eyebrow ?? content.title,
	Component: HeroPhoneImage,
});
