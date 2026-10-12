import React from 'react';
import {z} from 'zod';
import {Icon} from '../../../Components/Illustrations/Icon';
import {FitBox} from '../../../Components/Layouts/FitBox';
import {Text} from '../../../Components/Typography/Text';
import {plainText} from '../../../Schemas/RichText';
import {useInk, useTheme} from '../../../Themes/ThemeContext';
import {ImageFrame, useImageLayout} from '../../Components/ImageFrame';
import {defineImageTemplate} from '../../ImageTemplateDefinition';
import {BrandingSchema} from '../../Schemas/ImageFields';

const ProcessSchema = z.object({
	title: plainText(70),
	subtitle: plainText(120).optional(),
	steps: z
		.array(z.object({title: plainText(40), detail: plainText(100).optional()}))
		.min(3)
		.max(5),
	branding: BrandingSchema,
});

type Content = z.infer<typeof ProcessSchema>;

const ProcessImage: React.FC<{content: Content}> = ({content}) => {
	const {colors, typography, shape} = useTheme();
	const ink = useInk();
	const {u, wide} = useImageLayout();

	return (
		<ImageFrame backdrop="gradient" branding={content.branding}>
			<FitBox fill>
				<div style={{display: 'flex', flexDirection: 'column', gap: u(40)}}>
					<div>
						<Text variant="headline" size={80}>
							{content.title}
						</Text>
						{content.subtitle ? (
							<Text size={33} tone="muted" style={{marginTop: u(12)}}>
								{content.subtitle}
							</Text>
						) : null}
					</div>
					<div style={{display: 'flex', flexDirection: wide ? 'row' : 'column', alignItems: 'stretch', gap: u(14)}}>
						{content.steps.map((step, index) => (
							<React.Fragment key={index}>
								{index > 0 ? (
									<div style={{alignSelf: 'center', color: ink.text, opacity: 0.7, transform: wide ? undefined : 'rotate(90deg)', flexShrink: 0}}>
										<Icon name="arrowRight" size={44} strokeWidth={2.8} />
									</div>
								) : null}
								{/* Cards stay white on the gradient so the steps read as the solid part of the image. */}
								<div
									style={{
										flex: 1,
										minWidth: 0,
										display: 'flex',
										flexDirection: wide ? 'column' : 'row',
										alignItems: wide ? 'flex-start' : 'center',
										gap: u(22),
										padding: u(26),
										borderRadius: u(shape.radius.lg),
										backgroundColor: colors.surface,
										boxShadow: `0 ${u(18)}px ${u(44)}px rgba(0, 0, 0, 0.16)`,
									}}
								>
									<div
										style={{
											width: u(78),
											height: u(78),
											borderRadius: u(22),
											backgroundColor: colors.categorical[index % colors.categorical.length].fill,
											color: colors.categorical[index % colors.categorical.length].on,
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											fontFamily: typography.display,
											fontWeight: typography.displayWeight,
											fontSize: u(44),
											flexShrink: 0,
										}}
									>
										{index + 1}
									</div>
									<div style={{minWidth: 0}}>
										<Text variant="subtitle" size={36} color={colors.onSurface}>
											{step.title}
										</Text>
										{step.detail ? (
											<Text size={26} color={colors.onSurfaceMuted} style={{marginTop: u(6)}}>
												{step.detail}
											</Text>
										) : null}
									</div>
								</div>
							</React.Fragment>
						))}
					</div>
				</div>
			</FitBox>
		</ImageFrame>
	);
};

/** A process in three to five numbered cards joined by arrows, on a gradient. */
export const Process = defineImageTemplate({
	category: 'Infographics',
	variant: 'Process',
	title: 'İnfografik: süreç adımları',
	description: 'Oklarla bağlanan numaralı adım kartları; dikeyde alt alta, yatayda yan yana.',
	contentSchema: ProcessSchema,
	sampleContent: {
		title: 'Bir soruyu kalıcı öğrenmenin 4 adımı',
		steps: [
			{title: 'Çöz', detail: 'Önce süre tutmadan, kendi başına dene'},
			{title: 'Kontrol et', detail: 'Çözümü adım adım karşılaştır'},
			{title: 'Not al', detail: 'Hatanın nedenini tek cümleyle yaz'},
			{title: 'Tekrar et', detail: 'Üç gün sonra benzer bir soru çöz'},
		],
	},
	defaultTheme: 'SinavikaBrand',
	defaultSize: 'Portrait',
	outputName: (content) => `Surec ${content.title}`,
	Component: ProcessImage,
});
