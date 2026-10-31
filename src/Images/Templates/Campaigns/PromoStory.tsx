import React from 'react';
import {z} from 'zod';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {BrandMark} from '../../../Components/Overlays/BrandMark';
import {Text} from '../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../Configurations/BrandTypography';
import {plainText} from '../../../Schemas/RichText';
import {BrowserShot, PhoneShot} from '../../../Templates/Advertisements/PromoKit/PromoKit';
import {PROMO_PHONE_SCREEN_NAMES, PROMO_PHONE_SCREENS, PROMO_WEB_SCREEN_NAMES, PROMO_WEB_SCREENS} from '../../../Templates/Advertisements/PromoKit/PromoScreens';
import {Icon} from '../../../UIUX/Icons';
import {MODULES, MODULE_ORDER, type ModuleKey} from '../../../UIUX/ModuleIdentity';
import {POST_TYPE} from '../../../Configurations/SocialIdentity';
import {lineCount, overflowNote} from '../../Components/TextMeasure';
import {defineImageTemplate} from '../../ImageTemplateDefinition';

/**
 * The campaign's daily story (1080 × 1920): a hook that points to the day's
 * post. Buffer cannot add interactive stickers, so choices are drawn as boxes
 * and links are written out. Platform UI covers the top and bottom ~250 px,
 * so everything readable stays in the middle band.
 *
 * Type is fixed (Configurations/SocialIdentity, POST_TYPE.story) and the
 * text and the picture keep their places on every story; text that would
 * reach the picture or the footer is refused before rendering (checkLayout).
 */

const MODULE_KEYS = MODULE_ORDER as unknown as [ModuleKey, ...ModuleKey[]];

const PromoStorySchema = z.object({
	name: plainText(60),
	/** `black` is for remembrance days (10 Kasım): a plain black ground, nothing else. */
	tone: z.enum(['light', 'dark', 'module', 'black']).default('light'),
	module: z.enum(MODULE_KEYS).default('exam'),
	/** Small label above the hook: "Yeni reels", "Bu akşam reels’te"… */
	label: plainText(30).optional(),
	hook: plainText(80),
	sub: plainText(90).optional(),
	/** Drawn choice boxes (not a poll sticker). */
	options: z.array(plainText(22)).max(4).optional(),
	visual: z
		.discriminatedUnion('kind', [
			z.object({kind: z.literal('phone'), screen: z.enum(PROMO_PHONE_SCREEN_NAMES)}),
			z.object({kind: z.literal('web'), screen: z.enum(PROMO_WEB_SCREEN_NAMES)}),
			z.object({kind: z.literal('numeral'), value: plainText(6)}),
			z.object({kind: z.literal('icons'), modules: z.array(z.enum(MODULE_KEYS)).min(2).max(7)}),
			z.object({kind: z.literal('card'), front: plainText(60), meta: plainText(30)}),
			/** An archive photograph from `public/` (public-domain only), shown in black and white with a line under it. */
			z.object({kind: z.literal('photo'), src: z.string().regex(/^Media\//), caption: plainText(40)}),
			/** A blackboard with a few words in chalk (24 Kasım). */
			z.object({kind: z.literal('board'), text: plainText(24)}),
		])
		.optional(),
	footer: plainText(40).optional(),
});
type Content = z.infer<typeof PromoStorySchema>;

const INK = '#0B1C30';

const S = POST_TYPE.story;
/** The text column and the fixed places, in pixels of the 1080 × 1920 story. */
const SIDE = 80;
const GAP = 26;
const LABEL_PAD = 12;
const LABEL_LINE = 1.2;
const OPTION_GAP = 18;
const OPTION_SIDE_PAD = 24;
const FOOTER_BOTTOM = 280;
const FOOTER_ROW = 70;
/** Room kept between the text and the picture or the footer. */
const CLEAR = 40;

const textTopOf = (content: Content) => (content.visual ? 300 : 560);
const visualTopOf = (content: Content) => (content.visual?.kind === 'photo' ? PHOTO.top : content.options?.length ? 1180 : 920);
/** The archive photograph: larger than the other pictures, it is the story. */
const PHOTO = {top: 640, height: 820};
const optionPadOf = (content: Content) => (content.visual ? 30 : 44);
const optionSizeOf = (content: Content) => (content.visual ? S.option : S.optionAlone);

/** What a story cannot set at its fixed sizes and places (checkLayout). */
const storyIssues = (content: Content, frame: {width: number; height: number}): string[] => {
	const box = frame.width - 2 * SIDE;
	const optionBox = (box - OPTION_GAP) / 2 - 2 * OPTION_SIDE_PAD - 4;
	const issues: string[] = [];
	const lines = (where: string, text: string | undefined, width: number, setting: {size: number; weight: number; letterSpacingEm?: number}, allowed: number): number => {
		if (!text) return 0;
		const count = lineCount(text, width, setting);
		if (count > allowed) issues.push(`${where} "${text}" ${setting.size} puntoda ${overflowNote(count, allowed)}. Kısalt.`);
		return Math.min(count, allowed);
	};
	let bottom = textTopOf(content);
	if (content.label) bottom += 2 * LABEL_PAD + S.label * LABEL_LINE + GAP;
	lines('Etiket', content.label, box - 48, {size: S.label, weight: S.labelWeight}, 1);
	bottom += lines('Hook', content.hook, box, {size: S.hook, weight: S.hookWeight, letterSpacingEm: S.hookLetterSpacingEm}, S.hookLines) * S.hook * S.hookLineHeight;
	if (content.sub) bottom += GAP + lines('Alt satır', content.sub, box, {size: S.sub, weight: S.subWeight}, S.subLines) * S.sub * S.subLineHeight;
	const options = content.options ?? [];
	if (options.length > 0) {
		const size = optionSizeOf(content);
		const heights = options.map((option) => 2 * optionPadOf(content) + 4 + lines('Seçenek', option, optionBox, {size, weight: S.optionWeight}, S.optionLines) * size * S.optionLineHeight);
		const rows = Array.from({length: Math.ceil(options.length / 2)}, (_, row) => Math.max(heights[row * 2], heights[row * 2 + 1] ?? 0));
		bottom += GAP + OPTION_GAP + rows.reduce((sum, row) => sum + row, 0) + OPTION_GAP * (rows.length - 1);
	}
	if (content.visual?.kind === 'photo') lines('Fotoğraf satırı', content.visual.caption, box, {size: 40, weight: 800}, 1);
	if (content.visual?.kind === 'board') lines('Tahta yazısı', content.visual.text, 900 - 44 - 60, {size: 150, weight: 800}, 2);
	if (content.visual?.kind === 'card') {
		lines('Kartın ön yüzü', content.visual.front, 820 - 120, {size: S.cardFront, weight: 800}, S.cardFrontLines);
		lines('Kartın küçük satırı', content.visual.meta, 820 - 120, {size: S.cardMeta, weight: 700}, 1);
	}
	const limit = content.visual ? visualTopOf(content) : frame.height - FOOTER_BOTTOM - FOOTER_ROW;
	if (bottom + CLEAR > limit) issues.push(`Hikâyenin yazısı ${Math.round(bottom)} px'te bitiyor; ${content.visual ? 'görsel' : 'alt satır'} ${limit} px'te başlıyor. Hook'u, alt satırı ya da seçenekleri kısalt.`);
	return issues;
};

const PromoStoryImage: React.FC<{content: Content}> = ({content}) => {
	const accent = content.module === 'sinoAi' ? '#334155' : MODULES[content.module].color.light;
	const ground = content.tone === 'black' ? '#000000' : content.tone === 'dark' ? 'radial-gradient(70% 45% at 50% 35%, #1B2B44 0%, #0B1C30 55%, #070F1C 100%)' : content.tone === 'module' ? `linear-gradient(160deg, ${accent} 0%, ${accent}DD 100%)` : 'radial-gradient(80% 60% at 50% 30%, #FFFFFF 0%, #F5F6F8 100%)';
	const ink = content.tone === 'light' ? INK : '#FFFFFF';
	const soft = content.tone === 'light' ? '#64748B' : 'rgba(255,255,255,0.82)';
	const visual = content.visual;
	// A story with only choices is centred; one with a picture keeps the hook up top.
	const top = textTopOf(content);
	const bleeds = visual?.kind === 'phone';

	return (
		<AbsoluteFill style={{background: ground, overflow: 'hidden'}}>
			<div style={{position: 'absolute', left: SIDE, right: SIDE, top, display: 'flex', flexDirection: 'column', gap: GAP}}>
				{content.label ? (
					<div style={{alignSelf: 'flex-start', padding: `${LABEL_PAD}px 24px`, borderRadius: 999, background: content.tone === 'light' ? `${accent}18` : 'rgba(255,255,255,0.16)'}}>
						<Text size={S.label} weight={S.labelWeight} color={content.tone === 'light' ? accent : '#FFFFFF'} style={{lineHeight: LABEL_LINE, whiteSpace: 'nowrap'}}>
							{content.label}
						</Text>
					</div>
				) : null}
				<Text variant="display" size={S.hook} weight={S.hookWeight} color={ink} style={{lineHeight: S.hookLineHeight, letterSpacing: `${S.hookLetterSpacingEm}em`}}>
					{content.hook}
				</Text>
				{content.sub ? (
					<Text size={S.sub} weight={S.subWeight} color={soft} style={{lineHeight: S.subLineHeight}}>
						{content.sub}
					</Text>
				) : null}
				{content.options?.length ? (
					<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: OPTION_GAP, marginTop: OPTION_GAP}}>
						{content.options.map((option) => (
							<div key={option} style={{padding: `${optionPadOf(content)}px ${OPTION_SIDE_PAD}px`, borderRadius: 30, background: content.tone === 'light' ? '#FFFFFF' : 'rgba(255,255,255,0.14)', border: content.tone === 'light' ? '2px solid #E2E8F0' : '2px solid rgba(255,255,255,0.25)', textAlign: 'center'}}>
								<Text size={optionSizeOf(content)} weight={S.optionWeight} color={ink} align="center" style={{lineHeight: S.optionLineHeight}}>
									{option}
								</Text>
							</div>
						))}
					</div>
				) : null}
			</div>
			{visual ? (
				<div style={{position: 'absolute', left: 0, right: 0, top: visualTopOf(content), display: 'flex', justifyContent: 'center'}}>
					{visual.kind === 'phone'
						? (() => {
								const Screen = PROMO_PHONE_SCREENS[visual.screen];
								return (
									<div style={{filter: 'drop-shadow(0 40px 70px rgba(0,0,0,0.35))'}}>
										<PhoneShot width={560} rotate={-3}>
											<Screen />
										</PhoneShot>
									</div>
								);
							})()
						: null}
					{visual.kind === 'web'
						? (() => {
								const Screen = PROMO_WEB_SCREENS[visual.screen];
								return (
									<div style={{filter: 'drop-shadow(0 40px 70px rgba(0,0,0,0.35))'}}>
										<BrowserShot width={940} title="sinavika.com">
											<Screen />
										</BrowserShot>
									</div>
								);
							})()
						: null}
					{visual.kind === 'numeral' ? (
						<div style={{width: 520, height: 520, borderRadius: '50%', background: content.tone === 'module' ? '#FFFFFF' : '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 40px 90px -30px rgba(234,88,12,0.6)'}}>
							<Text variant="display" size={300} weight={TYPE.weights.kinetic} color={content.tone === 'module' ? accent : '#FFFFFF'} style={{lineHeight: 1, letterSpacing: '-0.05em'}}>
								{visual.value}
							</Text>
						</div>
					) : null}
					{visual.kind === 'icons' ? (
						<div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 220px)', gap: 30}}>
							{visual.modules.map((key) => (
								<div key={key} style={{height: 220, borderRadius: 60, background: content.tone === 'light' ? '#FFFFFF' : 'rgba(255,255,255,0.12)', border: content.tone === 'light' ? '2px solid #E2E8F0' : 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14}}>
									<Icon name={MODULES[key].icon} size={84} color={key === 'sinoAi' ? ink : MODULES[key].color.light} stroke={1.8} />
									<Text size={26} weight={TYPE.weights.strong} color={ink} align="center">
										{MODULES[key].name.tr}
									</Text>
								</div>
							))}
						</div>
					) : null}
					{visual.kind === 'photo' ? (
						<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34}}>
							<Img src={staticFile(visual.src)} style={{height: PHOTO.height, width: 'auto', borderRadius: 12, filter: 'grayscale(1) contrast(1.05)', boxShadow: '0 40px 90px -30px rgba(255,255,255,0.12)'}} />
							<Text size={40} weight={TYPE.weights.display} color={ink} align="center" style={{letterSpacing: '0.04em'}}>
								{visual.caption}
							</Text>
						</div>
					) : null}
					{visual.kind === 'board' ? (
						<div style={{width: 900, height: 560, borderRadius: 18, border: '22px solid #475569', background: 'radial-gradient(120% 90% at 30% 20%, #2B3A3F 0%, #1C2629 70%)', boxShadow: 'inset 0 0 80px rgba(0,0,0,0.6), 0 40px 90px -30px rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', position: 'relative', overflow: 'hidden'}}>
							<div style={{position: 'absolute', inset: 0, background: 'repeating-radial-gradient(circle at 20% 30%, rgba(255,255,255,0.035) 0 2px, transparent 2px 9px)'}} />
							<Text variant="display" size={150} weight={TYPE.weights.display} color="rgba(255,255,255,0.92)" align="center" style={{letterSpacing: '0.01em', textShadow: '0 0 6px rgba(255,255,255,0.35)', transform: 'rotate(-3deg)'}}>
								{visual.text}
							</Text>
						</div>
					) : null}
					{visual.kind === 'card' ? (
						<div style={{width: 820, padding: '70px 60px', borderRadius: 56, background: '#FFFFFF', boxShadow: '0 40px 90px -30px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', gap: 30, alignItems: 'center'}}>
							<Text size={S.cardMeta} weight={TYPE.weights.strong} color={accent} align="center">
								{visual.meta}
							</Text>
							<Text variant="display" size={S.cardFront} weight={TYPE.weights.display} color={INK} align="center">
								{visual.front}
							</Text>
						</div>
					) : null}
				</div>
			) : null}
			<div style={{position: 'absolute', left: SIDE, right: SIDE, bottom: FOOTER_BOTTOM, display: bleeds ? 'none' : 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
				<BrandMark size="chrome" color={ink} />
				{content.footer ? (
					<Text size={32} weight={TYPE.weights.strong} color={soft}>
						{content.footer}
					</Text>
				) : null}
			</div>
		</AbsoluteFill>
	);
};

export const PromoStory = defineImageTemplate({
	category: 'Campaigns',
	variant: 'PromoStory',
	title: 'Tanıtım hikâyesi',
	description: 'Kampanyanın günlük hikâyesi: günün gönderisine çağıran hook, çizili seçenekler ve tek görsel.',
	contentSchema: PromoStorySchema,
	sampleContent: {name: 'Kaç uygulama', tone: 'light', label: 'Soru', hook: 'Telefonunda kaç ders uygulaması var?', options: ['1', '2', '3', '4+'], footer: 'Akşam cevabı paylaşıyoruz'},
	defaultTheme: 'SinavikaLight',
	defaultSize: 'Story',
	outputName: (content) => content.name,
	checkLayout: storyIssues,
	Component: PromoStoryImage,
});
