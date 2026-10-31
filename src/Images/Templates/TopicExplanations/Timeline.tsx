import React from 'react';
import {z} from 'zod';
import {FitBox} from '../../../Components/Layouts/FitBox';
import {Badge} from '../../../Components/Typography/Badge';
import {Text} from '../../../Components/Typography/Text';
import {plainText} from '../../../Schemas/RichText';
import {useTheme} from '../../../Themes/ThemeContext';
import {ImageFrame, useImageLayout} from '../../Components/ImageFrame';
import {defineImageTemplate} from '../../ImageTemplateDefinition';
import {BrandingSchema} from '../../Schemas/ImageFields';

const TimelineSchema = z.object({
	subject: plainText(30).optional(),
	title: plainText(60),
	events: z
		.array(z.object({date: plainText(16), title: plainText(50), detail: plainText(110).optional()}))
		.min(3)
		.max(6),
	branding: BrandingSchema,
});

type Content = z.infer<typeof TimelineSchema>;

const TimelineImage: React.FC<{content: Content}> = ({content}) => {
	const {colors, typography} = useTheme();
	const {u, wide} = useImageLayout();
	const marker = u(30);
	const palette = colors.categorical;

	// Wide images run the line left to right; everything else runs it top to bottom.
	const events = wide ? (
		<div style={{position: 'relative', display: 'grid', gridTemplateColumns: `repeat(${content.events.length}, minmax(0, 1fr))`, gap: u(24)}}>
			<div style={{position: 'absolute', left: 0, right: 0, top: u(70) + marker / 2 - u(3), height: u(6), borderRadius: u(6), backgroundColor: colors.border}} />
			{content.events.map((event, index) => (
				<div key={index} style={{position: 'relative', display: 'flex', flexDirection: 'column', gap: u(14)}}>
					<div style={{height: u(56), fontFamily: typography.display, fontWeight: typography.displayWeight, fontSize: u(46 * typography.displayScale), color: colors.canvasAccent, lineHeight: 1}}>
						{event.date}
					</div>
					<div style={{width: marker, height: marker, borderRadius: '50%', backgroundColor: palette[index % palette.length].fill, border: `${u(6)}px solid ${colors.background}`}} />
					<Text variant="subtitle" size={32}>
						{event.title}
					</Text>
					{event.detail ? (
						<Text size={25} tone="muted">
							{event.detail}
						</Text>
					) : null}
				</div>
			))}
		</div>
	) : (
		<div style={{position: 'relative', display: 'flex', flexDirection: 'column', gap: u(34)}}>
			<div style={{position: 'absolute', left: u(190) + marker / 2 - u(3), top: u(10), bottom: u(10), width: u(6), borderRadius: u(6), backgroundColor: colors.border}} />
			{content.events.map((event, index) => (
				<div key={index} style={{position: 'relative', display: 'flex', alignItems: 'flex-start', gap: u(30)}}>
					<div style={{width: u(160), flexShrink: 0, textAlign: 'right', fontFamily: typography.display, fontWeight: typography.displayWeight, fontSize: u(46 * typography.displayScale), color: colors.canvasAccent, lineHeight: 1.05}}>
						{event.date}
					</div>
					<div style={{width: marker, height: marker, marginTop: u(8), borderRadius: '50%', backgroundColor: palette[index % palette.length].fill, border: `${u(6)}px solid ${colors.background}`, flexShrink: 0}} />
					<div style={{flex: 1, minWidth: 0}}>
						<Text variant="subtitle" size={38}>
							{event.title}
						</Text>
						{event.detail ? (
							<Text size={28} tone="muted" style={{marginTop: u(6)}}>
								{event.detail}
							</Text>
						) : null}
					</div>
				</div>
			))}
		</div>
	);

	return (
		<ImageFrame backdrop="canvas" branding={content.branding}>
			<FitBox fill>
				<div style={{display: 'flex', flexDirection: 'column', gap: u(44)}}>
					<div style={{display: 'flex', flexDirection: 'column', gap: u(18)}}>
						{content.subject ? (
							<Badge lesson tone="primary" icon="clock" size={27}>
								{content.subject} · Zaman çizelgesi
							</Badge>
						) : null}
						<Text variant="headline" size={82}>
							{content.title}
						</Text>
					</div>
					{events}
				</div>
			</FitBox>
		</ImageFrame>
	);
};

/** Events in order on a line: dates large, each with a title and a one-line detail. */
export const Timeline = defineImageTemplate({
	category: 'TopicExplanation',
	variant: 'Timeline',
	title: 'Konu: zaman çizelgesi',
	description: 'Tarihleri büyük yazılmış olaylar bir çizgi üzerinde; dikeyde yukarıdan aşağı, yatayda soldan sağa.',
	contentSchema: TimelineSchema,
	sampleContent: {
		subject: 'Tarih',
		title: 'Anayasal düzene giden yol',
		events: [
			{date: '1808', title: 'Sened-i İttifak', detail: 'Padişahın yetkileri ilk kez sınırlandı'},
			{date: '1839', title: 'Tanzimat Fermanı', detail: 'Kanunun üstünlüğü kabul edildi'},
			{date: '1856', title: 'Islahat Fermanı', detail: 'Tanzimat’ın hakları genişletildi'},
			{date: '1876', title: 'Kanun-i Esasi', detail: 'İlk Osmanlı anayasası ilan edildi'},
		],
	},
	defaultTheme: 'SinavikaLight',
	defaultSize: 'Portrait',
	outputName: (content) => `${content.subject ?? ''} ${content.title}`,
	Component: TimelineImage,
});
