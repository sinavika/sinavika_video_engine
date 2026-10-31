import React from 'react';
import {z} from 'zod';
import {Icon} from '../../../Components/Illustrations/Icon';
import {FitBox} from '../../../Components/Layouts/FitBox';
import {Badge} from '../../../Components/Typography/Badge';
import {RichText} from '../../../Components/Typography/RichText';
import {Text} from '../../../Components/Typography/Text';
import {plainText, richText} from '../../../Schemas/RichText';
import {useTheme} from '../../../Themes/ThemeContext';
import {ImageFrame, useImageLayout} from '../../Components/ImageFrame';
import {defineImageTemplate} from '../../ImageTemplateDefinition';
import {BrandingSchema} from '../../Schemas/ImageFields';

const TipListSchema = z.object({
	exam: plainText(20).optional(),
	title: plainText(60),
	tips: z
		.array(z.object({title: plainText(50), detail: richText(120).optional()}))
		.min(3)
		.max(6),
	closing: plainText(80).optional(),
	branding: BrandingSchema,
});

type Content = z.infer<typeof TipListSchema>;

const TipListImage: React.FC<{content: Content}> = ({content}) => {
	const {colors, typography} = useTheme();
	const {u, wide, padding} = useImageLayout();

	return (
		<ImageFrame backdrop="surface" branding={content.branding}>
			{/* A coloured header band, bleeding to the edges, over a plain sheet: like a page from a study planner. */}
			<div style={{backgroundColor: colors.primary, color: colors.onPrimary, margin: `${-padding}px ${-padding}px 0`, padding: `${u(56)}px ${padding}px ${u(48)}px`, display: 'flex', flexDirection: 'column', gap: u(18), flexShrink: 0}}>
				<Badge tone={{fill: colors.accent, on: colors.onAccent}} icon="lightbulb" size={27}>
					{content.exam ? `${content.exam} · Sınav taktikleri` : 'Sınav taktikleri'}
				</Badge>
				<Text variant="headline" size={78} color={colors.onPrimary}>
					{content.title}
				</Text>
			</div>
			<div style={{flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', paddingTop: u(40)}}>
				<FitBox fill align="start">
					<div style={{display: 'grid', gridTemplateColumns: `repeat(${wide ? 2 : 1}, minmax(0, 1fr))`, columnGap: u(48), rowGap: u(26)}}>
						{content.tips.map((tip, index) => (
							<div key={index} style={{display: 'flex', gap: u(24), alignItems: 'flex-start', paddingBottom: u(24), borderBottom: `${u(3)}px dashed ${colors.border}`}}>
								<div style={{fontFamily: typography.display, fontWeight: typography.displayWeight, fontSize: u(84 * typography.displayScale), lineHeight: 0.9, color: colors.primaryText, width: u(84), flexShrink: 0}}>
									{index + 1}
								</div>
								<div style={{flex: 1, minWidth: 0}}>
									<Text variant="subtitle" size={38}>
										{tip.title}
									</Text>
									{tip.detail ? <RichText text={tip.detail} size={28} tone="muted" style={{marginTop: u(6)}} /> : null}
								</div>
							</div>
						))}
					</div>
					{content.closing ? (
						<div style={{display: 'flex', alignItems: 'center', gap: u(16), marginTop: u(30)}}>
							<Icon name="flag" size={40} color={colors.primaryText} />
							<Text size={32} weight={700}>
								{content.closing}
							</Text>
						</div>
					) : null}
				</FitBox>
			</div>
		</ImageFrame>
	);
};

/** A numbered list of exam tactics on a planner-style sheet with a coloured header band. */
export const TipList = defineImageTemplate({
	category: 'ExamTips',
	variant: 'TipList',
	title: 'Sınav taktikleri: numaralı liste',
	description: 'Renkli başlık bandı altında, kesik çizgilerle ayrılmış büyük numaralı taktikler.',
	contentSchema: TipListSchema,
	sampleContent: {
		exam: 'TYT',
		title: 'Sınavda süre kazandıran 4 taktik',
		tips: [
			{title: 'Turlama yap', detail: 'İlk turda **emin olduklarını** çöz, takıldıklarını işaretle.'},
			{title: 'Güçlü dersinle başla', detail: 'İlk netler tempoyu ve özgüveni artırır.'},
			{title: 'Şıkları ele', detail: 'Yanlış olduğundan emin olduğun seçenekleri çiz.'},
			{title: 'Saatine bak', detail: 'Her 20 soruda bir süreyi kontrol et.'},
		],
		closing: 'Deneme sınavlarında prova et.',
	},
	defaultTheme: 'SinavikaLight',
	defaultSize: 'Portrait',
	outputName: (content) => `${content.exam ?? ''} ${content.title}`,
	Component: TipListImage,
});
