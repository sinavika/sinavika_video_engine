import React from 'react';
import {z} from 'zod';
import {Icon} from '../../../Components/Illustrations/Icon';
import {RichText} from '../../../Components/Typography/RichText';
import {Text} from '../../../Components/Typography/Text';
import {plainText, richText} from '../../../Schemas/RichText';
import {useTheme} from '../../../Themes/ThemeContext';
import {CallToAction} from '../../Components/CallToAction';
import {BrowserMockup, PhoneMockup} from '../../Components/DeviceMockups';
import {ImageFrame, useImageLayout} from '../../Components/ImageFrame';
import {defineImageTemplate} from '../../ImageTemplateDefinition';
import {BrandingSchema, CallToActionSchema, ScreenshotSchema} from '../../Schemas/ImageFields';

const DeviceDuoSchema = z.object({
	title: richText(70),
	subtitle: richText(140).optional(),
	desktopScreenshot: ScreenshotSchema.optional(),
	mobileScreenshot: ScreenshotSchema.optional(),
	url: plainText(60).optional(),
	points: z.array(plainText(50)).max(3).default([]),
	cta: CallToActionSchema.optional(),
	branding: BrandingSchema,
});

type Content = z.infer<typeof DeviceDuoSchema>;

const DeviceDuoImage: React.FC<{content: Content}> = ({content}) => {
	const {colors} = useTheme();
	const {u, wide, tall, width, padding} = useImageLayout();
	const stageWidth = (wide ? width * 0.52 : width - padding * 2) / u(1);
	const windowWidth = stageWidth * 0.9;
	const windowHeight = windowWidth * (tall ? 0.78 : 0.62);

	const devices = (
		<div style={{position: 'relative', width: u(stageWidth), height: u(windowHeight + 70), flexShrink: 0, alignSelf: 'center'}}>
			<BrowserMockup screenshot={content.desktopScreenshot} url={content.url} width={windowWidth} height={windowHeight} />
			{/* The phone stands in front of the window's corner: same product, two screens. */}
			<PhoneMockup screenshot={content.mobileScreenshot} width={stageWidth * 0.27} style={{position: 'absolute', right: 0, bottom: 0}} />
		</div>
	);

	return (
		<ImageFrame backdrop="surface" branding={content.branding}>
			<div style={{display: 'flex', flexDirection: wide ? 'row' : 'column', alignItems: wide ? 'center' : 'stretch', justifyContent: 'center', gap: u(wide ? 64 : 48), flex: 1, minHeight: 0}}>
				<div style={{display: 'flex', flexDirection: 'column', gap: u(22), flex: wide ? 1 : 'none', minWidth: 0}}>
					<RichText text={content.title} variant="headline" size={wide ? 80 : 74} />
					{content.subtitle ? <RichText text={content.subtitle} size={33} tone="muted" /> : null}
					{content.points.map((point) => (
						<div key={point} style={{display: 'flex', alignItems: 'center', gap: u(14)}}>
							<Icon name="check" size={34} color={colors.success} strokeWidth={3.2} />
							<Text size={31} weight={600}>
								{point}
							</Text>
						</div>
					))}
					{content.cta ? <CallToAction action={content.cta} /> : null}
				</div>
				{devices}
			</div>
		</ImageFrame>
	);
};

/** The same product on desktop and phone: a browser window with a phone overlapping its corner. */
export const DeviceDuo = defineImageTemplate({
	category: 'WebPromotion',
	variant: 'DeviceDuo',
	title: 'Web tanıtım: masaüstü ve mobil',
	description: 'Tarayıcı penceresi ile köşesine binen telefon; masaüstü ve mobil kullanım birlikte.',
	contentSchema: DeviceDuoSchema,
	sampleContent: {
		title: 'Evde bilgisayarda, yolda **telefonda**',
		subtitle: 'Kaldığın yerden devam et; ilerlemen bütün cihazlarında aynı.',
		url: 'sinavika.com',
		points: ['Tek hesap, bütün cihazlar', 'Anında eşitlenen ilerleme'],
		cta: {label: 'Ücretsiz dene'},
	},
	defaultTheme: 'SinavikaBrand',
	defaultSize: 'Landscape',
	outputName: (content) => `Web ve Mobil ${content.title}`,
	Component: DeviceDuoImage,
});
