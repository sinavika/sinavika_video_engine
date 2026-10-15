import React from 'react';
import {z} from 'zod';
import {AbsoluteFill, interpolate} from 'remotion';
import {useVideoLayout} from '../../../Components/Layouts/VideoLayout';
import {BrandMark} from '../../../Components/Overlays/BrandMark';
import {Text} from '../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../Configurations/BrandTypography';
import {OUTRO_SCENE_ID} from '../../../Scenes/BrandOutroScene';
import {estimateReadingSeconds} from '../../../Scenes/SceneDuration';
import type {TemplateScene} from '../../../Scenes/ScenePlan';
import {createNarrator, VoiceScriptSchema, type VoiceClips} from '../../../Scenes/Voiceover';
import {plainText} from '../../../Schemas/RichText';
import {UIProvider} from '../../../UIUX/Context';
import {Icon} from '../../../UIUX/Icons';
import {defineTemplate} from '../../TemplateDefinition';
import {At, CLAMP, ease, PromoStage, PromoSubtitle, Slam, useLand, useSeconds} from '../PromoKit/PromoKit';
import {PROMO_PHONE_SCREEN_NAMES, PROMO_PHONE_SCREENS} from '../PromoKit/PromoScreens';

/**
 * "Kim çalışıyor?": the language of a streaming service's profile screen.
 * A dark room, four profiles, a cursor picks one, a cinematic title opens and
 * the app plays out as episodes. Near-black ground, orange light; no other
 * brand's name, logo, colours or sound.
 */

const narration = z.string().trim().min(1).max(160);

export const ProfilePickerSchema = z.object({
	question: z.object({watch: plainText(36), study: plainText(30), narration}),
	pick: z.object({title: plainText(24), profiles: z.array(z.object({label: plainText(16), sub: plainText(16)})).length(4), pickIndex: z.number().int().min(0).max(3), narration}),
	title: z.object({name: plainText(14), tagline: plainText(36), narration}),
	episodes: z.object({heading: plainText(20), items: z.array(z.object({number: plainText(10), title: plainText(26), screen: z.enum(PROMO_PHONE_SCREEN_NAMES)})).length(3), narration}),
	next: z.object({text: plainText(34), narration}),
	closing: z.object({cta: plainText(30), channels: plainText(40).default('App Store · Google Play · sinavika.com'), narration}),
	subtitles: z.boolean().default(true),
	script: VoiceScriptSchema,
	outro: z.object({enabled: z.boolean().default(true)}).default({enabled: true}),
});
type Content = z.infer<typeof ProfilePickerSchema>;

const NIGHT = '#08090B';
const ORANGE = '#EA580C';
const GLOW = '#FB923C';
const WHITE = '#F8FAFC';
const DIM = '#8A94A6';
/** Profile tile colours: brand orange and module tones, deepened for the dark room. */
const TILE = [
	['#F97316', '#9A3412'],
	['#0EA5E9', '#075985'],
	['#14B8A6', '#115E59'],
	['#64748B', '#1E293B'],
];

const Ground: React.FC<{light?: number}> = ({light = 0.4}) => (
	<AbsoluteFill style={{background: `radial-gradient(70% 45% at 50% 38%, rgba(234,88,12,${0.18 * light}) 0%, ${NIGHT} 70%)`}} />
);

const Stage: React.FC<{content: Content; narration: string; shown?: string; light?: number; children: React.ReactNode}> = ({content, narration: text, shown, light, children}) => (
	<PromoStage ground={<Ground light={light} />}>
		{children}
		<PromoSubtitle text={text} shown={shown} enabled={content.subtitles} ink={NIGHT} fill={WHITE} />
	</PromoStage>
);

const QuestionScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const strike = ease(interpolate(seconds, [0.9, 1.3], [0, 1], CLAMP));
	return (
		<Stage content={content} narration={content.question.narration} shown={`${content.question.watch} ${content.question.study}`} light={0.2}>
			<At y={520} w={952}>
				<div style={{position: 'relative', display: 'flex', justifyContent: 'center', opacity: useLand(0.05)}}>
					<Text variant="display" size={TYPE.adScale.headline} weight={TYPE.weights.kinetic} color={interpolate(strike, [0, 1], [1, 0.45]) > 0.7 ? WHITE : DIM} align="center" style={{lineHeight: 1.05}}>
						{content.question.watch}
					</Text>
					<div style={{position: 'absolute', left: u(60), top: '52%', height: u(10), width: `${strike * 88}%`, background: ORANGE, borderRadius: u(5)}} />
				</div>
			</At>
			<At y={820} w={952}>
				<Slam text={content.question.study} at={1.45} size={TYPE.adScale.hook} color={GLOW} />
			</At>
		</Stage>
	);
};

const Cursor: React.FC<{x: number; y: number; press: number}> = ({x, y, press}) => {
	const {u} = useVideoLayout();
	return (
		<svg width={u(70)} height={u(70)} viewBox="0 0 24 24" style={{position: 'absolute', left: u(x), top: u(y), transform: `scale(${1 - press * 0.15})`, filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))'}}>
			<path d="M4 2 L4 20 L9 15 L12.5 22 L15.5 20.5 L12 13.8 L19 13.8 Z" fill="#FFFFFF" stroke="#0B0B0B" strokeWidth="1.2" strokeLinejoin="round" />
		</svg>
	);
};

const PickScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const tile = 330;
	const gap = 70;
	const left = (952 - tile * 2 - gap) / 2;
	const top = 500;
	const target = {x: left + (content.pick.pickIndex % 2) * (tile + gap) + tile * 0.55, y: top + Math.floor(content.pick.pickIndex / 2) * (tile + 120) + tile * 0.5};
	const travel = ease(interpolate(seconds, [0.9, 2.0], [0, 1], CLAMP));
	const press = interpolate(seconds, [2.2, 2.32, 2.5], [0, 1, 0], CLAMP);
	const chosen = interpolate(seconds, [2.3, 2.6], [0, 1], CLAMP);
	return (
		<Stage content={content} narration={content.pick.narration} shown={content.pick.title}>
			<At y={300} w={952}>
				<div style={{opacity: useLand(0.05)}}>
					<Text variant="display" size={TYPE.adScale.headline} weight={TYPE.weights.display} color={WHITE} align="center">
						{content.pick.title}
					</Text>
				</div>
			</At>
			{content.pick.profiles.map((profile, index) => {
				const land = useLand(0.3 + index * 0.12, 180);
				const hot = index === content.pick.pickIndex;
				const [from, to] = TILE[index];
				const x = left + (index % 2) * (tile + gap);
				const y = top + Math.floor(index / 2) * (tile + 120);
				return (
					<At key={profile.label} x={x} y={y} w={tile}>
						<div style={{opacity: land * (hot ? 1 : 1 - chosen * 0.6), transform: `scale(${interpolate(land, [0, 1], [0.85, 1]) * (hot ? 1 + travel * 0.05 + chosen * 0.04 : 1)})`}}>
							<div style={{width: u(tile), height: u(tile), borderRadius: u(36), background: `linear-gradient(145deg, ${from}, ${to})`, border: hot && travel > 0.6 ? `${u(8)}px solid ${WHITE}` : `${u(8)}px solid transparent`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
								<Icon name={(['grad', 'target', 'briefcase', 'eye'] as const)[index]} size={u(150)} color="rgba(255,255,255,0.95)" stroke={1.6} />
							</div>
							<div style={{marginTop: u(20), textAlign: 'center'}}>
								<Text size={40} weight={TYPE.weights.strong} color={hot && travel > 0.6 ? WHITE : DIM} align="center">
									{profile.label}
								</Text>
								<Text size={28} weight={TYPE.weights.body} color={DIM} align="center">
									{profile.sub}
								</Text>
							</div>
						</div>
					</At>
				);
			})}
			<Cursor x={interpolate(travel, [0, 1], [820, target.x])} y={interpolate(travel, [0, 1], [1380, target.y])} press={press} />
		</Stage>
	);
};

const TitleScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const open = ease(interpolate(seconds, [0, 0.9], [0, 1], CLAMP));
	const sweep = interpolate(seconds, [0.4, 1.8], [-40, 140], CLAMP);
	return (
		<Stage content={content} narration={content.title.narration} shown={`${content.title.name} ${content.title.tagline}`} light={1.4}>
			<At y={560} w={952}>
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u(30), transform: `scale(${interpolate(open, [0, 1], [1.25, 1])})`, opacity: open}}>
					<div style={{fontFamily: 'inherit', fontWeight: 800, fontSize: u(150), letterSpacing: '-0.02em', lineHeight: 1, background: `linear-gradient(100deg, ${ORANGE} 0%, ${ORANGE} ${sweep - 20}%, #FFE4D2 ${sweep}%, ${ORANGE} ${sweep + 20}%, ${ORANGE} 100%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>
						{content.title.name}
					</div>
					<Text size={40} weight={TYPE.weights.strong} color={DIM} align="center" style={{letterSpacing: '0.04em'}}>
						{content.title.tagline}
					</Text>
				</div>
			</At>
		</Stage>
	);
};

const Episode: React.FC<{item: Content['episodes']['items'][number]; active: number; done: number}> = ({item, active, done}) => {
	const {u} = useVideoLayout();
	const Screen = PROMO_PHONE_SCREENS[item.screen];
	const w = 820;
	const h = 470;
	const scale = u(w) / 390;
	return (
		<div style={{width: u(w), opacity: interpolate(active, [0, 1], [0.45, 1]), transform: `scale(${interpolate(active, [0, 1], [0.94, 1])})`}}>
			<div style={{position: 'relative', width: u(w), height: u(h), borderRadius: u(24), overflow: 'hidden', border: `${u(3)}px solid ${active > 0.5 ? WHITE : 'transparent'}`, boxSizing: 'border-box', background: '#111'}}>
				<div style={{width: 390, height: 844, transform: `scale(${scale}) translateY(-120px)`, transformOrigin: 'top left'}}>
					<UIProvider lang="tr" mode="light">
						<Screen />
					</UIProvider>
				</div>
				<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: u(8), background: 'rgba(255,255,255,0.2)'}}>
					<div style={{width: `${done * 100}%`, height: '100%', background: ORANGE}} />
				</div>
			</div>
			<div style={{display: 'flex', gap: u(18), alignItems: 'baseline', marginTop: u(16)}}>
				<Text size={30} weight={TYPE.weights.strong} color={DIM}>
					{item.number}
				</Text>
				<Text size={44} weight={TYPE.weights.display} color={WHITE}>
					{item.title}
				</Text>
			</div>
		</div>
	);
};

const EpisodesScene: React.FC<{content: Content; seconds: number}> = ({content, seconds: total}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const per = Math.max(1.6, (total - 0.6) / 3);
	const current = Math.min(2, Math.floor(Math.max(0, seconds - 0.3) / per));
	const shift = ease(interpolate(seconds - 0.3 - current * per, [0, 0.45], [0, 1], CLAMP));
	// One episode fills the window; the next one slides up as its turn comes.
	const scroll = current > 0 ? current - 1 + shift : 0;
	return (
		<Stage content={content} narration={content.episodes.narration} light={0.6}>
			<At y={150} x={66}>
				<Text size={52} weight={TYPE.weights.display} color={WHITE}>
					{content.episodes.heading}
				</Text>
			</At>
			<At y={250} x={66} w={820} h={600} style={{overflow: 'hidden'}}>
				<div style={{display: 'flex', flexDirection: 'column', gap: u(46), transform: `translateY(${-scroll * u(586)}px)`}}>
					{content.episodes.items.map((item, index) => {
						const active = index === current ? shift : index < current ? 0 : 0;
						const done = index < current ? 1 : index === current ? interpolate(seconds - 0.3 - index * per, [0, per], [0, 1], CLAMP) : 0;
						return <Episode key={item.number} item={item} active={index === current ? Math.max(active, 0.6) : 0} done={done} />;
					})}
				</div>
			</At>
		</Stage>
	);
};

const NextScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const ring = interpolate(seconds, [0.3, 2.4], [0, 1], CLAMP);
	const r = 120;
	const c = 2 * Math.PI * r;
	return (
		<Stage content={content} narration={content.next.narration} shown={content.next.text} light={0.8}>
			<At y={420} w={952}>
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u(60), opacity: useLand(0.05)}}>
					<Text variant="display" size={TYPE.adScale.headline * 0.82} weight={TYPE.weights.display} color={WHITE} align="center">
						{content.next.text}
					</Text>
					<div style={{position: 'relative', width: u(r * 2 + 30), height: u(r * 2 + 30), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<svg width={u(r * 2 + 30)} height={u(r * 2 + 30)} style={{position: 'absolute', transform: 'rotate(-90deg)'}}>
							<circle cx={u(r + 15)} cy={u(r + 15)} r={u(r)} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={u(10)} />
							<circle cx={u(r + 15)} cy={u(r + 15)} r={u(r)} fill="none" stroke={ORANGE} strokeWidth={u(10)} strokeLinecap="round" strokeDasharray={u(c)} strokeDashoffset={u(c) * (1 - ring)} />
						</svg>
						<div style={{transform: `scale(${0.9 + ring * 0.1})`}}>
							<BrandMark size="chrome" color={WHITE} />
						</div>
					</div>
				</div>
			</At>
		</Stage>
	);
};

const ClosingScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const logo = useLand(0.05, 130);
	const cta = useLand(0.4);
	return (
		<Stage content={content} narration={content.closing.narration} shown={content.closing.cta} light={1.2}>
			<At y={460} w={952}>
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u(60)}}>
					<div style={{opacity: logo, transform: `scale(${interpolate(logo, [0, 1], [0.85, 1])})`}}>
						<BrandMark size="hero" color={WHITE} />
					</div>
					<div style={{opacity: cta, transform: `translateY(${(1 - cta) * u(40)}px)`, padding: `${u(26)}px ${u(54)}px`, borderRadius: u(999), background: ORANGE}}>
						<Text size={TYPE.adScale.action * 1.4} weight={TYPE.weights.kinetic} color="#FFFFFF">
							{content.closing.cta}
						</Text>
					</div>
					<div style={{opacity: cta}}>
						<Text size={TYPE.adScale.action} weight={TYPE.weights.strong} color={DIM} align="center">
							{content.closing.channels}
						</Text>
					</div>
				</div>
			</At>
		</Stage>
	);
};

const SAMPLE: z.input<typeof ProfilePickerSchema> = {
	question: {watch: 'Bu akşam ne izliyoruz?', study: 'Ne çalışıyoruz?', narration: 'Bu akşam ne izliyoruz? Yanlış soru. Bu akşam ne çalışıyoruz?'},
	pick: {
		title: 'Kim çalışıyor?',
		profiles: [
			{label: 'YKS', sub: 'Sayısal'},
			{label: 'YKS', sub: 'Eşit Ağırlık'},
			{label: 'KPSS', sub: 'Lisans'},
			{label: 'Misafir', sub: 'Göz atıyor'},
		],
		pickIndex: 0,
		narration: 'Profilini seç.',
	},
	title: {name: 'Sınavika', tagline: 'Bölüm bölüm sınav hazırlığı', narration: 'Sınavika’da bu akşamın bölümleri hazır.'},
	episodes: {
		heading: 'Bölümler',
		items: [
			{number: 'Bölüm 1', title: 'Netini ölç', screen: 'yksLoss'},
			{number: 'Bölüm 2', title: 'Bugün ne çalışacağın', screen: 'yksPlan'},
			{number: 'Bölüm 3', title: 'Takıldığın yer', screen: 'sinoChat'},
		],
		narration: 'Önce netini ölç, sonra bugün ne çalışacağını gör, takıldığın yerde SinoAI’ye sor.',
	},
	next: {text: 'Sıradaki bölüm: senin denemen.', narration: 'Sıradaki bölüm senin denemen.'},
	closing: {cta: 'Sınavika’yı ücretsiz indir', narration: 'Sınavika’yı ücretsiz indir.'},
};

const buildScenes = (content: Content, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const beat = (text: string, min: number) => estimateReadingSeconds([text], {baseSeconds: 1.2, minSeconds: min, maxSeconds: 9});
	const say = createNarrator(voiceClips, content.script);
	const question = say('question', content.question.narration, beat(content.question.narration, 3), 2.8);
	const pick = say('pick', content.pick.narration, beat(content.pick.narration, 3.4), 3.2);
	const title = say('title', content.title.narration, beat(content.title.narration, 2.4), 2.2);
	const episodes = say('episodes', content.episodes.narration, beat(content.episodes.narration, 6), 5.4);
	const next = say('next', content.next.narration, beat(content.next.narration, 2.6), 2.6);
	const closing = say('closing', content.closing.narration, beat(content.closing.narration, 2.6), 2.4);
	return [
		{id: 'question', seconds: question.seconds, label: 'Soru', voice: [question], element: <QuestionScene content={content} />},
		{id: 'pick', seconds: pick.seconds, label: 'Profil', voice: [pick], element: <PickScene content={content} />},
		{id: 'title', seconds: title.seconds, label: 'Başlık', voice: [title], element: <TitleScene content={content} />},
		{id: 'episodes', seconds: episodes.seconds, label: 'Bölümler', voice: [episodes], element: <EpisodesScene content={content} seconds={episodes.seconds} />},
		{id: 'next', seconds: next.seconds, label: 'Sıradaki', voice: [next], element: <NextScene content={content} />},
		...(content.outro.enabled ? [{id: OUTRO_SCENE_ID, seconds: closing.seconds, label: 'Kapanış', voice: [closing], element: <ClosingScene content={content} />}] : []),
	];
};

export const ProfilePicker = defineTemplate({
	id: 'ProfilePicker',
	category: 'Advertisements',
	title: 'Kim çalışıyor?',
	description: 'Mobil uygulama tanıtımı: profil seçim ekranı, sinematik başlık, bölüm bölüm ürün. Koyu oda, turuncu ışık.',
	contentSchema: ProfilePickerSchema,
	sampleContent: SAMPLE,
	defaultTheme: 'SinavikaDark',
	transition: [
		{preset: 'fade', durationSeconds: 0.3},
		{preset: 'fade', durationSeconds: 0.5},
		{preset: 'fade', durationSeconds: 0.4},
		{preset: 'fade', durationSeconds: 0.3},
		{preset: 'fade', durationSeconds: 0.4},
	],
	targetSeconds: {min: 18, max: 34},
	buildScenes,
});
