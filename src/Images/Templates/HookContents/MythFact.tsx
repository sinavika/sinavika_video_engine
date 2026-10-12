import React from 'react';
import {z} from 'zod';
import {Icon} from '../../../Components/Illustrations/Icon';
import {FitBox} from '../../../Components/Layouts/FitBox';
import {Badge} from '../../../Components/Typography/Badge';
import {RichText} from '../../../Components/Typography/RichText';
import {Text} from '../../../Components/Typography/Text';
import {plainText, richText} from '../../../Schemas/RichText';
import {InkProvider, useTheme} from '../../../Themes/ThemeContext';
import {ImageFrame, useImageLayout} from '../../Components/ImageFrame';
import {defineImageTemplate} from '../../ImageTemplateDefinition';
import {BrandingSchema} from '../../Schemas/ImageFields';

const MythFactSchema = z.object({
	label: plainText(40).default('Doğru bilinen yanlış'),
	myth: plainText(120),
	fact: richText(170),
	/** Where the fact comes from. Shown small; include it whenever the claim is not self-evident. */
	source: plainText(70).optional(),
	branding: BrandingSchema,
});

type Content = z.infer<typeof MythFactSchema>;

const MythFactImage: React.FC<{content: Content}> = ({content}) => {
	const {colors, shape} = useTheme();
	const {u, wide} = useImageLayout();

	const panel = (kind: 'myth' | 'fact') => {
		const isMyth = kind === 'myth';
		const fill = isMyth ? colors.danger : colors.success;
		return (
			<InkProvider ink={{text: colors.onStatus, muted: colors.onStatus, emphasis: colors.onStatus}}>
				<div
					style={{
						flex: 1,
						minWidth: 0,
						display: 'flex',
						flexDirection: 'column',
						gap: u(20),
						padding: u(44),
						borderRadius: u(shape.radius.lg),
						backgroundColor: fill,
						color: colors.onStatus,
						// The two panels lean against each other; the fact sits on top.
						transform: `rotate(${isMyth ? -1.6 : 1.2}deg)`,
						boxShadow: `0 ${u(24)}px ${u(60)}px rgba(0, 0, 0, 0.2)`,
					}}
				>
					<div style={{display: 'flex', alignItems: 'center', gap: u(16)}}>
						<div style={{width: u(64), height: u(64), borderRadius: '50%', backgroundColor: colors.onStatus, color: fill, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							<Icon name={isMyth ? 'cross' : 'check'} size={40} strokeWidth={3.4} />
						</div>
						<Text variant="label" size={30}>
							{isMyth ? 'Yanlış' : 'Doğrusu'}
						</Text>
					</div>
					{isMyth ? (
						<Text variant="title" size={48} style={{textDecoration: 'line-through', textDecorationThickness: u(3), opacity: 0.9}}>
							{content.myth}
						</Text>
					) : (
						<RichText text={content.fact} variant="title" size={48} />
					)}
				</div>
			</InkProvider>
		);
	};

	return (
		<ImageFrame backdrop="canvas" branding={content.branding}>
			<FitBox fill>
				<div style={{display: 'flex', flexDirection: 'column', gap: u(40)}}>
					<Badge tone="primary" icon="alert" size={30}>
						{content.label}
					</Badge>
					<div style={{display: 'flex', flexDirection: wide ? 'row' : 'column', gap: u(wide ? 40 : 30), padding: `0 ${u(10)}px`}}>
						{panel('myth')}
						{panel('fact')}
					</div>
					{content.source ? (
						<Text size={24} tone="muted">
							Kaynak: {content.source}
						</Text>
					) : null}
				</div>
			</FitBox>
		</ImageFrame>
	);
};

/** A common misconception and its correction as two leaning panels: red and struck through, then green. */
export const MythFact = defineImageTemplate({
	category: 'HookContent',
	variant: 'MythFact',
	title: 'Hook: doğru bilinen yanlış',
	description: 'Üstü çizili kırmızı "yanlış" paneli ile yeşil "doğrusu" paneli; isteğe bağlı kaynak satırı.',
	contentSchema: MythFactSchema,
	sampleContent: {
		myth: 'Bir sayıyı bölmek, onu her zaman küçültür.',
		fact: '$0$ ile $1$ arasındaki bir sayıya bölmek sayıyı **büyütür**: $6 \\div \\frac{1}{2} = 12$',
	},
	defaultTheme: 'SinavikaBrand',
	defaultSize: 'Portrait',
	outputName: (content) => `Dogru Bilinen Yanlis ${content.myth}`,
	Component: MythFactImage,
});
