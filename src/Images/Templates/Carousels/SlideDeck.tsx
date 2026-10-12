import React from 'react';
import {z} from 'zod';
import {Icon} from '../../../Components/Illustrations/Icon';
import {Card} from '../../../Components/Layouts/Card';
import {FitBox} from '../../../Components/Layouts/FitBox';
import {Badge} from '../../../Components/Typography/Badge';
import {MathExpression} from '../../../Components/Typography/MathExpression';
import {RichText} from '../../../Components/Typography/RichText';
import {Text} from '../../../Components/Typography/Text';
import {latex, plainText, richText} from '../../../Schemas/RichText';
import {withAlpha} from '../../../Themes/Theme';
import {useInk, useTheme} from '../../../Themes/ThemeContext';
import {ImageFrame, useImageLayout} from '../../Components/ImageFrame';
import {defineImageTemplate} from '../../ImageTemplateDefinition';
import {BrandingSchema} from '../../Schemas/ImageFields';

const SlideDeckSchema = z.object({
	subject: plainText(30).optional(),
	title: plainText(60),
	subtitle: plainText(110).optional(),
	slides: z
		.array(
			z.object({
				heading: plainText(50),
				text: richText(260).optional(),
				formula: latex(180).optional(),
				bullets: z.array(richText(90)).max(4).optional(),
			}),
		)
		.min(2)
		.max(8),
	closing: z.object({title: plainText(60), action: plainText(40).default('Kaydet ve tekrar et')}),
	branding: BrandingSchema,
});

type Content = z.infer<typeof SlideDeckSchema>;

/** Cover + content slides + closing. */
const pageCount = (content: Content): number => content.slides.length + 2;

/** The strip every slide shares: where you are, and that there is more. It is what makes the set one piece. */
const DeckFooter: React.FC<{page: number; total: number}> = ({page, total}) => {
	const ink = useInk();
	const {u} = useImageLayout();
	const isLast = page === total - 1;
	return (
		<div style={{display: 'flex', alignItems: 'center', gap: u(20), flexShrink: 0, marginTop: u(28)}}>
			<div style={{display: 'flex', gap: u(8), flex: 1}}>
				{Array.from({length: total}, (_, index) => (
					<div key={index} style={{flex: index === page ? 3 : 1, height: u(8), borderRadius: u(8), backgroundColor: withAlpha(ink.text, index === page ? 1 : 0.25)}} />
				))}
			</div>
			<Text size={26} weight={700} style={{whiteSpace: 'nowrap'}}>
				{page + 1} / {total}
			</Text>
			{isLast ? null : <Icon name="arrowRight" size={38} color={ink.text} strokeWidth={2.8} />}
		</div>
	);
};

const SlideDeckImage: React.FC<{content: Content; page: number}> = ({content, page}) => {
	const {colors, typography} = useTheme();
	const {u} = useImageLayout();
	const total = pageCount(content);

	if (page === 0) {
		return (
			<ImageFrame backdrop="gradient" branding={content.branding}>
				<div style={{flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: u(30)}}>
					{content.subject ? (
						<Badge tone={{fill: colors.accent, on: colors.onAccent}} icon="book" size={28}>
							{content.subject}
						</Badge>
					) : null}
					<Text variant="display" size={126}>
						{content.title}
					</Text>
					{content.subtitle ? (
						<Text size={40} tone="muted" weight={500}>
							{content.subtitle}
						</Text>
					) : null}
				</div>
				<DeckFooter page={page} total={total} />
			</ImageFrame>
		);
	}

	if (page === total - 1) {
		return (
			<ImageFrame backdrop="gradient" branding={content.branding}>
				<div style={{flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: u(34)}}>
					<Icon name="star" size={130} strokeWidth={2} />
					<Text variant="headline" size={90} align="center">
						{content.closing.title}
					</Text>
					<Badge tone={{fill: colors.accent, on: colors.onAccent}} icon="flag" size={34}>
						{content.closing.action}
					</Badge>
				</div>
				<DeckFooter page={page} total={total} />
			</ImageFrame>
		);
	}

	const slide = content.slides[page - 1];
	return (
		<ImageFrame backdrop="canvas" branding={content.branding}>
			<div style={{display: 'flex', alignItems: 'baseline', gap: u(22), flexShrink: 0}}>
				<div style={{fontFamily: typography.display, fontWeight: typography.displayWeight, fontSize: u(150 * typography.displayScale), lineHeight: 0.85, color: colors.canvasAccent}}>
					{String(page).padStart(2, '0')}
				</div>
				<Text variant="title" size={56} style={{flex: 1, minWidth: 0}}>
					{slide.heading}
				</Text>
			</div>
			<FitBox fill style={{marginTop: u(30)}}>
				<div style={{display: 'flex', flexDirection: 'column', gap: u(26)}}>
					{slide.text ? <RichText text={slide.text} size={40} /> : null}
					{slide.formula ? (
						<Card tone="primary" padding={34} radius="lg">
							<Text size={64} align="center">
								<MathExpression latex={slide.formula} display style={{margin: 0}} />
							</Text>
						</Card>
					) : null}
					{slide.bullets?.map((bullet, index) => (
						<Card key={index} padding={22} radius="md" elevated={false}>
							<div style={{display: 'flex', alignItems: 'center', gap: u(18)}}>
								<div style={{width: u(16), height: u(16), borderRadius: '50%', backgroundColor: colors.accent, flexShrink: 0}} />
								<RichText text={bullet} size={34} style={{flex: 1, minWidth: 0}} />
							</div>
						</Card>
					))}
				</div>
			</FitBox>
			<DeckFooter page={page} total={total} />
		</ImageFrame>
	);
};

/**
 * A swipeable series from one job: a cover, numbered content slides and a
 * closing slide. All slides share the frame, type and the progress strip, so
 * the set stays one design however many slides it has.
 */
export const SlideDeck = defineImageTemplate({
	category: 'Carousel',
	variant: 'SlideDeck',
	title: 'Kaydırmalı seri',
	description: 'Kapak, numaralı içerik slaytları ve kapanış; hepsinde ortak ilerleme şeridi.',
	contentSchema: SlideDeckSchema,
	sampleContent: {
		subject: 'Matematik',
		title: 'Üslü sayılarda 3 kural',
		subtitle: 'Kaydır, 30 saniyede tekrar et.',
		slides: [
			{heading: 'Çarpmada üsler toplanır', formula: 'a^m \\cdot a^n = a^{m+n}', text: 'Tabanlar aynı olmalı: $2^3 \\cdot 2^4 = 2^7$'},
			{heading: 'Bölmede üsler çıkarılır', formula: '\\dfrac{a^m}{a^n} = a^{m-n}', text: 'Örnek: $\\dfrac{5^6}{5^2} = 5^4$'},
			{heading: 'Üssün üssünde çarpılır', formula: '(a^m)^n = a^{m \\cdot n}', bullets: ['$(3^2)^4 = 3^8$', 'Parantez yoksa kural **uygulanmaz**']},
		],
		closing: {title: 'Üç kural, tek şart: tabanlar aynı'},
	},
	defaultTheme: 'SinavikaBrand',
	defaultSize: 'Portrait',
	pageCount,
	outputName: (content) => `${content.subject ?? ''} ${content.title}`,
	Component: SlideDeckImage,
});
