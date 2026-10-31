import React from 'react';
import {z} from 'zod';
import {AbsoluteFill, interpolate} from 'remotion';
import {useVideoLayout} from '../../../Components/Layouts/VideoLayout';
import {Text} from '../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../Configurations/BrandTypography';
import {appEndScenes} from '../../../Scenes/AppEndScene';
import {estimateReadingSeconds} from '../../../Scenes/SceneDuration';
import type {TemplateScene} from '../../../Scenes/ScenePlan';
import {createNarrator, VoiceScriptSchema, type VoiceClips} from '../../../Scenes/Voiceover';
import {plainText} from '../../../Schemas/RichText';
import {Icon} from '../../../UIUX/Icons';
import {defineTemplate} from '../../TemplateDefinition';
import {At, BrowserShot, CLAMP, ease, PromoStage, TypeOn, useLand, useSeconds} from '../PromoKit/PromoKit';
import {PROMO_WEB_SCREEN_NAMES, PROMO_WEB_SCREENS} from '../PromoKit/PromoScreens';

/**
 * A game countdown on white: a giant orange 3, 2, 1, and under each number one
 * question asked and answered in a quiet chat. Ends on the web page where the
 * questions can be asked without an account. Light, quick, playful.
 */

const narration = z.string().trim().min(1).max(170);

const CountdownChatSchema = z.object({
	hook: z.object({lines: z.tuple([plainText(26), plainText(20)]), narration}),
	rounds: z.array(z.object({tag: plainText(20), question: plainText(70), answer: plainText(110), narration})).length(3),
	site: z.object({screen: z.enum(PROMO_WEB_SCREEN_NAMES), url: plainText(32), narration}),
	script: VoiceScriptSchema,
	outro: z.object({enabled: z.boolean().default(true)}).default({enabled: true}),
});
type Content = z.infer<typeof CountdownChatSchema>;

const ORANGE = '#EA580C';
const INK = '#0B1C30';
const GREY = '#64748B';
const SOFT = '#F1F5F9';
const LINE = '#E2E8F0';

const Stage: React.FC<{children: React.ReactNode}> = ({children}) => (
	<PromoStage ground={<AbsoluteFill style={{background: '#FFFFFF'}} />}>
		{children}
	</PromoStage>
);

/** The countdown numeral: lands huge, then shrinks into a badge at the top. */
const Numeral: React.FC<{value: number; settle: number}> = ({value, settle}) => {
	const {u} = useVideoLayout();
	const land = useLand(0, 260, 14);
	const s = ease(settle);
	return (
		<At x={interpolate(s, [0, 1], [176, 40])} y={interpolate(s, [0, 1], [380, 40])} w={interpolate(s, [0, 1], [600, 160])}>
			<div style={{display: 'flex', justifyContent: 'center', transform: `scale(${interpolate(land, [0, 1], [1.8, 1])})`, opacity: Math.min(1, land * 1.4)}}>
				<div style={{width: u(interpolate(s, [0, 1], [560, 150])), height: u(interpolate(s, [0, 1], [560, 150])), borderRadius: '50%', background: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 ${u(30)}px ${u(60)}px -${u(30)}px rgba(234,88,12,0.6)`}}>
					<Text variant="display" size={interpolate(s, [0, 1], [400, 100])} weight={TYPE.weights.kinetic} color="#FFFFFF" style={{lineHeight: 1}}>
						{value}
					</Text>
				</div>
			</div>
		</At>
	);
};

const HookScene: React.FC<{content: Content}> = ({content}) => {
	const line = useLand(0.6);
	return (
		<Stage>
			<Numeral value={3} settle={0} />
			<At y={1060} w={952}>
				<div style={{opacity: line, transform: `translateY(${(1 - line) * 30}px)`}}>
					<Text variant="display" size={TYPE.adScale.headline * 0.9} weight={TYPE.weights.display} color={INK} align="center">
						{content.hook.lines[0]}
					</Text>
					<Text variant="display" size={TYPE.adScale.headline * 0.9} weight={TYPE.weights.kinetic} color={ORANGE} align="center">
						{content.hook.lines[1]}
					</Text>
				</div>
			</At>
		</Stage>
	);
};

const RoundScene: React.FC<{content: Content; index: number}> = ({content, index}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const round = content.rounds[index];
	const settle = interpolate(seconds, [0.45, 0.95], [0, 1], CLAMP);
	const askAt = 1.0;
	const answerAt = askAt + round.question.length / 30 + 0.45;
	const ask = interpolate(seconds, [askAt - 0.1, askAt + 0.2], [0, 1], CLAMP);
	const thinking = seconds > answerAt - 0.4 && seconds < answerAt;
	return (
		<Stage>
			<Numeral value={3 - index} settle={settle} />
			<At x={230} y={86}>
				<div style={{opacity: settle, padding: `${u(12)}px ${u(24)}px`, borderRadius: u(999), border: `${u(2)}px solid ${LINE}`}}>
					<Text size={34} weight={TYPE.weights.strong} color={GREY}>
						{round.tag}
					</Text>
				</div>
			</At>
			<At x={60} y={330} w={832}>
				<div style={{display: 'flex', flexDirection: 'column', gap: u(40)}}>
					<div style={{alignSelf: 'flex-end', maxWidth: u(700), padding: `${u(26)}px ${u(34)}px`, borderRadius: u(40), background: SOFT, opacity: ask, transform: `translateY(${(1 - ask) * u(30)}px)`}}>
						<TypeOn text={round.question} at={askAt} charsPerSecond={30} size={44} weight={TYPE.weights.strong} color={INK} />
					</div>
					<div style={{display: 'flex', gap: u(22), alignItems: 'flex-start', opacity: seconds > answerAt - 0.4 ? 1 : 0}}>
						<Icon name="sparkles" size={u(56)} color={INK} stroke={1.7} />
						<div style={{flex: 1, paddingTop: u(4)}}>
							{thinking ? (
								<div style={{display: 'flex', gap: u(12), paddingTop: u(14)}}>
									{[0, 1, 2].map((dot) => (
										<div key={dot} style={{width: u(16), height: u(16), borderRadius: u(8), background: GREY, opacity: 0.3 + 0.7 * Math.abs(Math.sin(seconds * 6 + dot))}} />
									))}
								</div>
							) : (
								<TypeOn text={round.answer} at={answerAt} charsPerSecond={55} size={46} weight={TYPE.weights.body} color={INK} caret={GREY} />
							)}
						</div>
					</div>
				</div>
			</At>
		</Stage>
	);
};

const SiteScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const Screen = PROMO_WEB_SCREENS[content.site.screen];
	const rise = ease(interpolate(seconds, [0, 0.7], [0, 1], CLAMP));
	return (
		<Stage>
			<At y={220} w={952}>
				<div style={{opacity: rise}}>
					<Text variant="display" size={TYPE.adScale.headline * 0.8} weight={TYPE.weights.kinetic} color={ORANGE} align="center">
						{content.site.url}
					</Text>
				</div>
			</At>
			<At y={interpolate(rise, [0, 1], [700, 420])} x={36}>
				<div style={{opacity: rise, transform: `perspective(${u(2000)}px) rotateX(${(1 - rise) * 14}deg)`, boxShadow: `0 ${u(40)}px ${u(80)}px -${u(40)}px rgba(15,23,42,0.4)`, borderRadius: u(16)}}>
					<BrowserShot width={880} title={content.site.url}>
						<Screen />
					</BrowserShot>
				</div>
			</At>
		</Stage>
	);
};

const SAMPLE: z.input<typeof CountdownChatSchema> = {
	hook: {lines: ['Üç soru hakkın var.', 'Kayıt yok.'], narration: 'Üç soru hakkın var, kayıt yok.'},
	rounds: [
		{tag: 'TYT Matematik', question: 'Bir sayının %20’si 36 ise sayı kaçtır?', answer: '36’yı 0,2’ye böl: 180. Yüzde sorularında önce “tamamı” yaz.', narration: 'Matematik mi?'},
		{tag: 'KPSS Vatandaşlık', question: 'Anayasa Mahkemesi kaç üyeden oluşur?', answer: '15 üyeden. 3’ünü TBMM, 12’sini Cumhurbaşkanı seçer.', narration: 'Vatandaşlık mı? Ne sorarsan.'},
		{tag: 'Plan', question: 'Bu hafta ne çalışayım?', answer: 'Hesap açarsan hedefine ve son denemene göre plan çıkarırım.', narration: 'Beğenirsen hedefine göre plan da çıkarsın.'},
	],
	site: {screen: 'siteSinoGuest', url: 'sinavika.com/sinoai', narration: 'SinoAI’yi hesap açmadan dene.'},
};

const buildScenes = (content: Content, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const beat = (text: string, min: number) => estimateReadingSeconds([text], {baseSeconds: 1.2, minSeconds: min, maxSeconds: 9});
	const say = createNarrator(voiceClips, content.script);
	const hook = say('hook', content.hook.narration, beat(content.hook.narration, 2.4), 2.2);
	const rounds = content.rounds.map((round, index) => {
		const needed = 1.0 + round.question.length / 30 + 0.45 + round.answer.length / 55 + 0.8;
		return say(`round-${index + 1}`, round.narration, Math.max(beat(round.narration, 3), needed), needed);
	});
	const site = say('site', content.site.narration, beat(content.site.narration, 2.8), 2.6);
	return [
		{id: 'hook', seconds: hook.seconds, label: 'Hook', voice: [hook], element: <HookScene content={content} />},
		...rounds.map((slot, index) => ({id: `round-${index + 1}`, seconds: slot.seconds, label: `${3 - index}`, voice: [slot], element: <RoundScene content={content} index={index} />})),
		{id: 'site', seconds: site.seconds, label: 'Site', voice: [site], element: <SiteScene content={content} />},
		...appEndScenes(content.outro.enabled, say),
	];
};

export const CountdownChat = defineTemplate({
	id: 'CountdownChat',
	category: 'Advertisements',
	title: 'Üç soru geri sayımı',
	description: 'Web/SinoAI tanıtımı: beyaz zeminde dev turuncu 3-2-1, her rakamda bir soru ve cevap; sonunda kayıtsız deneme sayfası.',
	contentSchema: CountdownChatSchema,
	sampleContent: SAMPLE,
	defaultTheme: 'SinavikaLight',
	transition: {preset: 'none'},
	targetSeconds: {min: 16, max: 34},
	buildScenes,
});
