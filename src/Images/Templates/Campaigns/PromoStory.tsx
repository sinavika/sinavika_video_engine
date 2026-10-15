import React from 'react';
import {z} from 'zod';
import {AbsoluteFill} from 'remotion';
import {BrandMark} from '../../../Components/Overlays/BrandMark';
import {Text} from '../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../Configurations/BrandTypography';
import {plainText} from '../../../Schemas/RichText';
import {BrowserShot, PhoneShot} from '../../../Templates/Advertisements/PromoKit/PromoKit';
import {PROMO_PHONE_SCREEN_NAMES, PROMO_PHONE_SCREENS, PROMO_WEB_SCREEN_NAMES, PROMO_WEB_SCREENS} from '../../../Templates/Advertisements/PromoKit/PromoScreens';
import {Icon} from '../../../UIUX/Icons';
import {MODULES, MODULE_ORDER, type ModuleKey} from '../../../UIUX/ModuleIdentity';
import {defineImageTemplate} from '../../ImageTemplateDefinition';

/**
 * The campaign's daily story (1080 × 1920): a hook that points to the day's
 * post. Buffer cannot add interactive stickers, so choices are drawn as boxes
 * and links are written out. Platform UI covers the top and bottom ~250 px,
 * so everything readable stays in the middle band.
 */

const MODULE_KEYS = MODULE_ORDER as unknown as [ModuleKey, ...ModuleKey[]];

const PromoStorySchema = z.object({
	name: plainText(60),
	tone: z.enum(['light', 'dark', 'module']).default('light'),
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
		])
		.optional(),
	footer: plainText(40).optional(),
});
type Content = z.infer<typeof PromoStorySchema>;

const INK = '#0B1C30';

const PromoStoryImage: React.FC<{content: Content}> = ({content}) => {
	const accent = content.module === 'sinoAi' ? '#334155' : MODULES[content.module].color.light;
	const ground = content.tone === 'dark' ? 'radial-gradient(70% 45% at 50% 35%, #1B2B44 0%, #0B1C30 55%, #070F1C 100%)' : content.tone === 'module' ? `linear-gradient(160deg, ${accent} 0%, ${accent}DD 100%)` : 'radial-gradient(80% 60% at 50% 30%, #FFFFFF 0%, #F5F6F8 100%)';
	const ink = content.tone === 'light' ? INK : '#FFFFFF';
	const soft = content.tone === 'light' ? '#64748B' : 'rgba(255,255,255,0.82)';
	const visual = content.visual;
	// A story with only choices is centred; one with a picture keeps the hook up top.
	const top = visual ? 300 : 560;
	const bleeds = visual?.kind === 'phone';

	return (
		<AbsoluteFill style={{background: ground, overflow: 'hidden'}}>
			<div style={{position: 'absolute', left: 80, right: 80, top, display: 'flex', flexDirection: 'column', gap: 26}}>
				{content.label ? (
					<div style={{alignSelf: 'flex-start', padding: '12px 24px', borderRadius: 999, background: content.tone === 'light' ? `${accent}18` : 'rgba(255,255,255,0.16)'}}>
						<Text size={32} weight={TYPE.weights.strong} color={content.tone === 'light' ? accent : '#FFFFFF'}>
							{content.label}
						</Text>
					</div>
				) : null}
				<Text variant="display" size={92} weight={TYPE.weights.kinetic} color={ink} style={{lineHeight: 1.04, letterSpacing: '-0.03em'}}>
					{content.hook}
				</Text>
				{content.sub ? (
					<Text size={40} weight={TYPE.weights.strong} color={soft} style={{lineHeight: 1.3}}>
						{content.sub}
					</Text>
				) : null}
				{content.options?.length ? (
					<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 18}}>
						{content.options.map((option) => (
							<div key={option} style={{padding: visual ? '30px 24px' : '44px 24px', borderRadius: 30, background: content.tone === 'light' ? '#FFFFFF' : 'rgba(255,255,255,0.14)', border: content.tone === 'light' ? '2px solid #E2E8F0' : '2px solid rgba(255,255,255,0.25)', textAlign: 'center'}}>
								<Text size={visual ? 40 : 46} weight={TYPE.weights.display} color={ink} align="center">
									{option}
								</Text>
							</div>
						))}
					</div>
				) : null}
			</div>
			{visual ? (
				<div style={{position: 'absolute', left: 0, right: 0, top: content.options?.length ? 1180 : 920, display: 'flex', justifyContent: 'center'}}>
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
					{visual.kind === 'card' ? (
						<div style={{width: 820, padding: '70px 60px', borderRadius: 56, background: '#FFFFFF', boxShadow: '0 40px 90px -30px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', gap: 30, alignItems: 'center'}}>
							<Text size={30} weight={TYPE.weights.strong} color={accent} align="center">
								{visual.meta}
							</Text>
							<Text variant="display" size={64} weight={TYPE.weights.display} color={INK} align="center">
								{visual.front}
							</Text>
						</div>
					) : null}
				</div>
			) : null}
			<div style={{position: 'absolute', left: 80, right: 80, bottom: 280, display: bleeds ? 'none' : 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
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
	Component: PromoStoryImage,
});
