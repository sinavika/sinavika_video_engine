import React from 'react';
import {z} from 'zod';
import {Card} from '../../../Components/Layouts/Card';
import {Badge} from '../../../Components/Typography/Badge';
import {RichText} from '../../../Components/Typography/RichText';
import {Text} from '../../../Components/Typography/Text';
import {plainText, richText} from '../../../Schemas/RichText';
import {CallToAction} from '../../Components/CallToAction';
import {BrowserMockup} from '../../Components/DeviceMockups';
import {ImageFrame, useImageLayout} from '../../Components/ImageFrame';
import {defineImageTemplate} from '../../ImageTemplateDefinition';
import {BrandingSchema, CallToActionSchema, ScreenshotSchema} from '../../Schemas/ImageFields';

const BrowserHeroSchema = z.object({
	eyebrow: plainText(36).optional(),
	title: richText(80),
	subtitle: richText(160).optional(),
	/** The real web screen to show. Without one, a neutral placeholder dashboard is drawn. */
	screenshot: ScreenshotSchema.optional(),
	url: plainText(60).optional(),
	/** Up to three figures floated over the window. */
	highlights: z
		.array(z.object({value: plainText(12), label: plainText(30)}))
		.max(3)
		.default([]),
	cta: CallToActionSchema.optional(),
	branding: BrandingSchema,
});

type Content = z.infer<typeof BrowserHeroSchema>;

const BrowserHeroImage: React.FC<{content: Content}> = ({content}) => {
	const {u, wide} = useImageLayout();

	const copy = (
		<div style={{display: 'flex', flexDirection: 'column', gap: u(22), flex: wide ? 1 : 'none', minWidth: 0}}>
			{content.eyebrow ? <Badge tone="primary">{content.eyebrow}</Badge> : null}
			<RichText text={content.title} variant="headline" size={wide ? 80 : 76} />
			{content.subtitle ? <RichText text={content.subtitle} size={33} tone="muted" /> : null}
			{content.cta ? <CallToAction action={content.cta} /> : null}
		</div>
	);

	return (
		<ImageFrame backdrop="canvas" branding={content.branding}>
			<div style={{display: 'flex', flexDirection: wide ? 'row' : 'column', alignItems: wide ? 'center' : 'stretch', gap: u(wide ? 64 : 44), flex: 1, minHeight: 0}}>
				{copy}
				{/* The window takes whatever room the copy leaves, so it never runs under the logo. */}
				<div style={{position: 'relative', flex: wide ? 1.25 : 1, minHeight: 0, minWidth: 0, alignSelf: 'stretch', margin: wide ? `${u(60)}px 0` : 0}}>
					<BrowserMockup screenshot={content.screenshot} url={content.url} />
					{/* Figures overlap the window's edge, alternating sides, to add depth. */}
					{content.highlights.map((highlight, index) => (
						<div
							key={index}
							style={{
								position: 'absolute',
								[index % 2 === 0 ? 'right' : 'left']: u(-28),
								[index % 2 === 0 ? 'bottom' : 'top']: u(index % 2 === 0 ? 36 : 110),
							}}
						>
							<Card padding={22} radius="md">
								<Text variant="title" size={46} tone="emphasis" style={{whiteSpace: 'nowrap'}}>
									{highlight.value}
								</Text>
								<Text size={22} tone="muted" weight={600} style={{whiteSpace: 'nowrap'}}>
									{highlight.label}
								</Text>
							</Card>
						</div>
					))}
				</div>
			</div>
		</ImageFrame>
	);
};

/** SaaS-style web promotion: headline above (or beside) a browser window with floating figures. */
export const BrowserHero = defineImageTemplate({
	category: 'WebPromotion',
	variant: 'BrowserHero',
	title: 'Web tanıtım: tarayıcı penceresi',
	description: 'Başlık, tarayıcı mockup’ı içinde web ekranı ve pencerenin üzerine binen sayı kartları.',
	contentSchema: BrowserHeroSchema,
	sampleContent: {
		eyebrow: 'Sınavika web',
		title: 'Bütün çalışman **tek panelde**',
		subtitle: 'Deneme sonuçların, eksik konuların ve haftalık planın aynı ekranda.',
		url: 'sinavika.com/panel',
		highlights: [
			{value: 'Konu konu', label: 'ilerleme takibi'},
			{value: 'Haftalık', label: 'çalışma planı'},
		],
		cta: {label: 'Panele göz at'},
	},
	defaultTheme: 'SinavikaBrand',
	defaultSize: 'Square',
	outputName: (content) => content.eyebrow ?? content.title,
	Component: BrowserHeroImage,
});
