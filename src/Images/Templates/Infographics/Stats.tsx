import React from 'react';
import {z} from 'zod';
import {Card} from '../../../Components/Layouts/Card';
import {FitBox} from '../../../Components/Layouts/FitBox';
import {Text} from '../../../Components/Typography/Text';
import {plainText} from '../../../Schemas/RichText';
import {withAlpha} from '../../../Themes/Theme';
import {useTheme} from '../../../Themes/ThemeContext';
import {ImageFrame, useImageLayout} from '../../Components/ImageFrame';
import {defineImageTemplate} from '../../ImageTemplateDefinition';
import {BrandingSchema} from '../../Schemas/ImageFields';

const StatsSchema = z.object({
	title: plainText(70),
	subtitle: plainText(120).optional(),
	stats: z
		.array(z.object({value: plainText(10), label: plainText(40)}))
		.min(2)
		.max(4),
	/** An optional bar chart under the figures. */
	bars: z
		.object({
			title: plainText(60).optional(),
			unit: plainText(8).optional(),
			items: z
				.array(z.object({label: plainText(24), value: z.number().min(0)}))
				.min(2)
				.max(6),
		})
		.optional(),
	/** Where the numbers come from. Always give one for real data. */
	source: plainText(90).optional(),
	branding: BrandingSchema,
});

type Content = z.infer<typeof StatsSchema>;

const StatsImage: React.FC<{content: Content}> = ({content}) => {
	const {colors, typography} = useTheme();
	const {u, wide} = useImageLayout();
	const {bars} = content;
	const peak = bars ? Math.max(...bars.items.map((item) => item.value), 1) : 1;
	const columns = wide ? content.stats.length : Math.min(2, content.stats.length);

	return (
		<ImageFrame backdrop="canvas" branding={content.branding}>
			<FitBox fill>
				<div style={{display: 'flex', flexDirection: 'column', gap: u(34)}}>
					<div>
						<Text variant="headline" size={78}>
							{content.title}
						</Text>
						{content.subtitle ? (
							<Text size={32} tone="muted" style={{marginTop: u(12)}}>
								{content.subtitle}
							</Text>
						) : null}
					</div>
					<div style={{display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: u(20)}}>
						{content.stats.map((stat, index) => {
							const tone = colors.categorical[index % colors.categorical.length];
							return (
								<Card key={index} tone={index === 0 ? tone : 'surface'} padding={30} radius="lg">
									<Text variant="display" size={96} tone="emphasis" style={{whiteSpace: 'nowrap'}}>
										{stat.value}
									</Text>
									<Text size={28} tone="muted" weight={600} style={{marginTop: u(6)}}>
										{stat.label}
									</Text>
								</Card>
							);
						})}
					</div>
					{bars ? (
						<Card padding={32} radius="lg">
							{bars.title ? (
								<Text variant="subtitle" size={32} style={{marginBottom: u(22)}}>
									{bars.title}
								</Text>
							) : null}
							<div style={{display: 'flex', flexDirection: 'column', gap: u(16)}}>
								{bars.items.map((item, index) => (
									<div key={index} style={{display: 'flex', alignItems: 'center', gap: u(18)}}>
										<Text size={26} weight={600} style={{width: u(220), flexShrink: 0}}>
											{item.label}
										</Text>
										<div style={{flex: 1, height: u(34), borderRadius: u(10), backgroundColor: withAlpha(colors.onSurface, 0.08)}}>
											<div
												style={{
													width: `${Math.max(3, (item.value / peak) * 100)}%`,
													height: '100%',
													borderRadius: u(10),
													backgroundColor: item.value === peak ? colors.primary : withAlpha(colors.primary, 0.45),
												}}
											/>
										</div>
										<div style={{width: u(110), flexShrink: 0, textAlign: 'right', fontFamily: typography.display, fontWeight: typography.displayWeight, fontSize: u(30), color: colors.onSurface}}>
											{item.value}
											{bars.unit ?? ''}
										</div>
									</div>
								))}
							</div>
						</Card>
					) : null}
					{content.source ? (
						<Text size={22} tone="muted">
							Kaynak: {content.source}
						</Text>
					) : null}
				</div>
			</FitBox>
		</ImageFrame>
	);
};

/** Data at a glance: a few very large figures, optionally a horizontal bar chart, and the source. */
export const Stats = defineImageTemplate({
	category: 'Infographics',
	variant: 'Stats',
	title: 'İnfografik: sayılar ve çubuk grafik',
	description: 'Dev rakamlı istatistik kutuları, isteğe bağlı yatay çubuk grafik ve kaynak satırı.',
	contentSchema: StatsSchema,
	sampleContent: {
		title: 'TYT bir bakışta',
		subtitle: 'Tek oturum, dört test',
		stats: [
			{value: '120', label: 'soru'},
			{value: '165', label: 'dakika'},
			{value: '4', label: 'test'},
			{value: '82 sn', label: 'soru başına ortalama'},
		],
		bars: {
			title: 'Testlere göre soru sayısı',
			items: [
				{label: 'Türkçe', value: 40},
				{label: 'Temel Matematik', value: 40},
				{label: 'Sosyal Bilimler', value: 20},
				{label: 'Fen Bilimleri', value: 20},
			],
		},
		source: 'ÖSYM sınav kılavuzu',
	},
	defaultTheme: 'SinavikaLight',
	defaultSize: 'Portrait',
	outputName: (content) => `Infografik ${content.title}`,
	Component: StatsImage,
});
