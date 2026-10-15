import {moduleName} from '../../../Configurations/ProductMessaging';
import React from 'react';
import {z} from 'zod';
import {RichText} from '../../../Components/Typography/RichText';
import {plainText, richText} from '../../../Schemas/RichText';
import {useTheme} from '../../../Themes/ThemeContext';
import {CallToAction} from '../../Components/CallToAction';
import {PhoneMockup} from '../../Components/DeviceMockups';
import {ImageFrame, useImageLayout} from '../../Components/ImageFrame';
import {defineImageTemplate} from '../../ImageTemplateDefinition';
import {AppScreenSchema, BrandingSchema, CallToActionSchema, ScreenshotSchema} from '../../Schemas/ImageFields';

const DualPhonesSchema = z.object({
	title: richText(70),
	subtitle: richText(140).optional(),
	/** Two or three app screens shown side by side, each with a short caption. */
	screens: z
		.array(z.object({label: plainText(28), screenshot: ScreenshotSchema.optional(), appScreen: AppScreenSchema.optional()}))
		.min(2)
		.max(3),
	cta: CallToActionSchema.optional(),
	branding: BrandingSchema,
});

type Content = z.infer<typeof DualPhonesSchema>;

const DualPhonesImage: React.FC<{content: Content}> = ({content}) => {
	const {colors, typography} = useTheme();
	const {u, wide, tall} = useImageLayout();
	const count = content.screens.length;
	const phoneWidth = wide ? 270 : tall ? (count === 3 ? 310 : 420) : count === 3 ? 300 : 370;
	const middle = (count - 1) / 2;

	return (
		<ImageFrame backdrop="gradient" branding={content.branding}>
			<div style={{display: 'flex', flexDirection: wide ? 'row' : 'column', alignItems: 'center', gap: u(wide ? 60 : 36), flex: 1, minHeight: 0}}>
				<div style={{display: 'flex', flexDirection: 'column', gap: u(22), alignItems: wide ? 'flex-start' : 'center', flex: wide ? 1 : 'none'}}>
					<RichText text={content.title} variant="headline" size={wide ? 84 : 78} align={wide ? 'left' : 'center'} />
					{content.subtitle ? <RichText text={content.subtitle} size={34} tone="muted" align={wide ? 'left' : 'center'} /> : null}
					{content.cta ? <CallToAction action={content.cta} inverse /> : null}
				</div>
				{/*
				  The phones stand on the bottom edge of this stage and are cut off by it when
				  the canvas is short, so they can never run into the headline or the logo.
				*/}
				<div
					style={{
						display: 'flex',
						alignItems: 'flex-start',
						justifyContent: 'center',
						gap: u(count === 3 ? 18 : 44),
						flex: 1,
						minHeight: 0,
						alignSelf: 'stretch',
						overflow: 'hidden',
						padding: `${u(8)}px ${u(20)}px 0`,
					}}
				>
					{content.screens.map((screen, index) => (
						// The outer phones lean away from the centre and sit lower, so the group reads as a fan.
						<div key={index} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u(18), marginTop: u(Math.abs(index - middle) * 40)}}>
							<div
								style={{
									padding: `${u(8)}px ${u(20)}px`,
									borderRadius: u(999),
									backgroundColor: colors.surface,
									color: colors.onSurface,
									fontFamily: typography.body,
									fontWeight: typography.strongWeight,
									fontSize: u(25),
									whiteSpace: 'nowrap',
								}}
							>
								{screen.label}
							</div>
							<PhoneMockup screenshot={screen.screenshot} screen={screen.appScreen} width={phoneWidth} tilt={(index - middle) * 4} />
						</div>
					))}
				</div>
			</div>
		</ImageFrame>
	);
};

/** Two or three screens side by side: a tour of the app, or a before/after comparison. */
export const DualPhones = defineImageTemplate({
	category: 'MobilePromotion',
	variant: 'DualPhones',
	title: 'Mobil tanıtım: çoklu telefon',
	description: 'Yan yana iki ya da üç uygulama ekranı; her birinin üstünde kısa etiket.',
	contentSchema: DualPhonesSchema,
	sampleContent: {
		title: 'Çöz, öğren, **takip et.**',
		subtitle: 'Sınavika’nın üç ekranı, tek bir çalışma düzeni.',
		screens: [
			{label: moduleName('exam'), appScreen: 'Exam'},
			{label: moduleName('flashcards'), appScreen: 'Flashcards'},
			{label: 'İstatistikler', appScreen: 'Analysis'},
		],
		cta: {label: 'Uygulamayı indir'},
	},
	defaultTheme: 'SinavikaBrand',
	defaultSize: 'Portrait',
	outputName: (content) => `Mobil Ekranlar ${content.title}`,
	Component: DualPhonesImage,
});
