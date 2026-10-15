import React from 'react';
import {z} from 'zod';
import {Icon} from '../../../Components/Illustrations/Icon';
import {Card} from '../../../Components/Layouts/Card';
import {FitBox} from '../../../Components/Layouts/FitBox';
import {Badge} from '../../../Components/Typography/Badge';
import {Text} from '../../../Components/Typography/Text';
import {plainText} from '../../../Schemas/RichText';
import {withAlpha} from '../../../Themes/Theme';
import {useInk, useTheme} from '../../../Themes/ThemeContext';
import {CallToAction} from '../../Components/CallToAction';
import {ImageFrame, useImageLayout} from '../../Components/ImageFrame';
import {defineImageTemplate} from '../../ImageTemplateDefinition';
import {BrandingSchema, CallToActionSchema} from '../../Schemas/ImageFields';
import {BRAND_TYPOGRAPHY} from '../../../Configurations/BrandTypography';

const OfferSchema = z.object({
	eyebrow: plainText(40).optional(),
	title: plainText(60),
	/** The number that sells, e.g. "%40" or "2 ay". */
	discount: plainText(8),
	discountLabel: plainText(20).default('indirim'),
	oldPrice: plainText(14).optional(),
	newPrice: plainText(14).optional(),
	/** Shown after the new price, e.g. "/ ay". */
	period: plainText(12).optional(),
	perks: z.array(plainText(50)).max(3).default([]),
	deadline: plainText(50).optional(),
	code: plainText(16).optional(),
	cta: CallToActionSchema,
	branding: BrandingSchema,
});

type Content = z.infer<typeof OfferSchema>;

const OfferImage: React.FC<{content: Content}> = ({content}) => {
	const {colors, typography} = useTheme();
	const ink = useInk();
	const {u, wide} = useImageLayout();

	// The discount is set as large as the canvas allows and sits in a burst, so the offer is read before anything else.
	const size = wide ? 430 : 330;
	const burst = (
		<div
			style={{
				width: u(size),
				height: u(size),
				borderRadius: '50%',
				backgroundColor: colors.accent,
				color: colors.onAccent,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				transform: 'rotate(-8deg)',
				boxShadow: `0 ${u(30)}px ${u(70)}px rgba(0, 0, 0, 0.28), 0 0 0 ${u(16)}px ${withAlpha(colors.accent, 0.3)}`,
				flexShrink: 0,
				alignSelf: 'center',
			}}
		>
			<div style={{fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(size * (content.discount.length > 4 ? 0.25 : 0.34)), lineHeight: 0.95, letterSpacing: '-0.03em'}}>
				{content.discount}
			</div>
			<div style={{fontFamily: typography.display, fontWeight: typography.displayWeight, fontSize: u(size * 0.11), textTransform: 'uppercase'}}>{content.discountLabel}</div>
		</div>
	);

	return (
		<ImageFrame backdrop="gradient" branding={content.branding}>
			<FitBox fill>
				<div style={{display: 'flex', flexDirection: wide ? 'row' : 'column', alignItems: wide ? 'center' : 'stretch', gap: u(wide ? 70 : 36)}}>
					{burst}
					<div style={{display: 'flex', flexDirection: 'column', gap: u(24), flex: 1, minWidth: 0}}>
						{content.eyebrow ? <Badge tone={{fill: ink.text, on: colors.primary}} size={27}>{content.eyebrow}</Badge> : null}
						<Text variant="headline" size={84}>
							{content.title}
						</Text>
						{content.newPrice ? (
							<div style={{display: 'flex', alignItems: 'baseline', gap: u(20), flexWrap: 'wrap'}}>
								{content.oldPrice ? (
									<Text size={44} tone="muted" weight={600} style={{textDecoration: 'line-through'}}>
										{content.oldPrice}
									</Text>
								) : null}
								<Text variant="display" size={104} style={{whiteSpace: 'nowrap'}}>
									{content.newPrice}
									{content.period ? <span style={{fontSize: '0.4em', opacity: 0.8}}> {content.period}</span> : null}
								</Text>
							</div>
						) : null}
						{content.perks.map((perk) => (
							<div key={perk} style={{display: 'flex', alignItems: 'center', gap: u(14)}}>
								<Icon name="check" size={36} color={ink.text} strokeWidth={3.2} />
								<Text size={32} weight={600}>
									{perk}
								</Text>
							</div>
						))}
						<div style={{display: 'flex', alignItems: 'center', gap: u(24), flexWrap: 'wrap'}}>
							<CallToAction action={content.cta} inverse />
							{content.code ? (
								<Card padding={16} radius="sm" elevated={false} style={{border: `${u(3)}px dashed ${colors.border}`}}>
									<Text size={20} tone="muted" weight={700}>
										KOD
									</Text>
									<Text size={34} weight={800} style={{fontFamily: typography.mono, letterSpacing: '0.06em'}}>
										{content.code}
									</Text>
								</Card>
							) : null}
						</div>
						{content.deadline ? (
							<div style={{display: 'flex', alignItems: 'center', gap: u(12)}}>
								<Icon name="clock" size={32} color={ink.text} />
								<Text size={28} weight={600}>
									{content.deadline}
								</Text>
							</div>
						) : null}
					</div>
				</div>
			</FitBox>
		</ImageFrame>
	);
};

/** Conversion-first: the discount in a burst, old and new price, perks, a coupon code and a deadline. */
export const Offer = defineImageTemplate({
	category: 'Campaigns',
	variant: 'Offer',
	title: 'Kampanya: indirim teklifi',
	description: 'Dev indirim rozeti, eski ve yeni fiyat, avantajlar, kupon kodu, son tarih ve CTA.',
	contentSchema: OfferSchema,
	sampleContent: {
		eyebrow: 'Örnek kampanya',
		title: 'Yıllık planda sınav dönemi fırsatı',
		discount: '%40',
		oldPrice: '₺000',
		newPrice: '₺000',
		period: '/ ay',
		perks: ['Sınırsız soru çözümü', 'Kişiye özel çalışma planı'],
		deadline: 'Son gün: örnek tarih',
		code: 'SINAV40',
		cta: {label: 'Fırsatı yakala'},
	},
	defaultTheme: 'VibrantDynamic',
	defaultSize: 'Square',
	outputName: (content) => `Kampanya ${content.title}`,
	Component: OfferImage,
});
