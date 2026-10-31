import React from 'react';
import {z} from 'zod';
import {AbsoluteFill, interpolate} from 'remotion';
import {useVideoLayout} from '../../../Components/Layouts/VideoLayout';
import {SoundEffect} from '../../../Components/Sounds/SoundEffect';
import {Text} from '../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../Configurations/BrandTypography';
import {appEndScenes} from '../../../Scenes/AppEndScene';
import {useBeat} from '../../../Scenes/Rhythm';
import {estimateReadingSeconds} from '../../../Scenes/SceneDuration';
import type {TemplateScene} from '../../../Scenes/ScenePlan';
import {createNarrator, VoiceScriptSchema, type VoiceClips} from '../../../Scenes/Voiceover';
import {plainText} from '../../../Schemas/RichText';
import {Icon} from '../../../UIUX/Icons';
import {defineTemplate} from '../../TemplateDefinition';
import {At, CLAMP, ease, PhoneShot, PromoStage, Slam, useSeconds} from '../PromoKit/PromoKit';
import {PROMO_PHONE_SCREEN_NAMES, PROMO_PHONE_SCREENS} from '../PromoKit/PromoScreens';
import {Morph, Tap, type Shape} from '../PromoKit/PromoMotion';

/**
 * A print shop for one student (Kasım 2026, 13 Kasım). In a dark press room
 * the student's goal is set in lead type, one block a beat; one black shape
 * then carries the job: a "Hazırlanıyor %" pill that becomes the booklet's
 * cover, pages riffling under it, and the booklet becomes the phone where a
 * fingertip picks full or branch exam. Navy, white and one orange band.
 */

const narration = z.string().trim().min(1).max(170);

const PrintShopSchema = z.object({
	hook: z.object({lines: z.tuple([plainText(24), plainText(24)]), narration}),
	/** The goal, set in lead type: each entry one row of blocks. */
	type: z.object({rows: z.array(plainText(14)).min(1).max(3), narration}),
	booklet: z.object({title: plainText(24), meta: plainText(26)}),
	choose: z.object({screen: z.enum(PROMO_PHONE_SCREEN_NAMES), options: z.tuple([plainText(18), plainText(18)]), pick: z.number().int().min(0).max(1), narration}),
	script: VoiceScriptSchema,
	outro: z.object({enabled: z.boolean().default(true)}).default({enabled: true}),
});
type Content = z.infer<typeof PrintShopSchema>;

const NAVY = '#0B1C30';
const NIGHT = '#050B14';
const ORANGE = '#EA580C';
const WHITE = '#FFFFFF';
const METAL = 'linear-gradient(180deg, #E2E8F0 0%, #94A3B8 100%)';

const PILL: Shape = {x: 236, y: 690, w: 480, h: 120, radius: 60, fill: '#020617'};
const BOOK: Shape = {x: 186, y: 380, w: 580, h: 800, radius: 18, fill: WHITE};
const PHONE: Shape = {x: 266, y: 250, w: 420, h: 900, radius: 60, fill: '#020617'};

const Ground: React.FC = () => <AbsoluteFill style={{background: `radial-gradient(70% 45% at 50% 30%, #16304F 0%, ${NAVY} 50%, ${NIGHT} 100%)`}} />;

/** The press: two rollers turning at the top of the frame. */
const Rollers: React.FC = () => {
	const {u} = useVideoLayout();
	const turn = useSeconds() * 280;
	return (
		<>
			{[0, 1].map((index) => (
				<div key={index} style={{position: 'absolute', left: u(96), top: u(300 + index * 70), width: u(760), height: u(60), borderRadius: u(30), background: 'linear-gradient(180deg, #334155 0%, #0F172A 100%)', overflow: 'hidden', boxShadow: `0 ${u(10)}px ${u(20)}px rgba(0,0,0,0.5)`}}>
					<div style={{position: 'absolute', inset: 0, background: `repeating-linear-gradient(90deg, transparent 0 ${u(40)}px, rgba(255,255,255,0.08) ${u(40)}px ${u(46)}px)`, transform: `translateX(${((turn * (index ? -1 : 1)) % 46) * u(1)}px)`}} />
				</div>
			))}
		</>
	);
};

const Stage: React.FC<{children: React.ReactNode}> = ({children}) => (
	<PromoStage ground={<Ground />}>
		{children}
	</PromoStage>
);

const HookScene: React.FC<{content: Content}> = ({content}) => (
	<Stage>
		<Rollers />
		<SoundEffect id="printer" atSeconds={0} volume={0.6} />
		<At y={560} w={952}>
			<Slam text={content.hook.lines[0]} at={0} size={TYPE.adScale.headline} color={WHITE} />
		</At>
		<At y={680} w={952}>
			<Slam text={content.hook.lines[1]} at={0.35} size={TYPE.adScale.headline} color={ORANGE} />
		</At>
	</Stage>
);

/** One lead block with a letter on its face. */
const Block: React.FC<{letter: string; drop: number}> = ({letter, drop}) => {
	const {u} = useVideoLayout();
	return (
		<div style={{width: u(letter === ' ' ? 24 : 62), height: u(84), borderRadius: u(8), background: letter === ' ' ? 'transparent' : METAL, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translateY(${(1 - drop) * -u(90)}px)`, opacity: Math.min(1, drop * 2), boxShadow: letter === ' ' ? 'none' : `inset 0 ${u(-6)}px 0 rgba(15,23,42,0.25)`}}>
			<Text variant="display" size={44} weight={TYPE.weights.kinetic} color={NAVY}>
				{letter === ' ' ? '' : letter}
			</Text>
		</div>
	);
};

const PrintScene: React.FC<{content: Content; seconds: number}> = ({content, seconds: total}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const beat = useBeat();
	// Set the type first: one row of blocks per beat, each block dropping in a little after the one before.
	const typeEnds = beat.at(content.type.rows.length + 1);
	const printAt = Math.min(typeEnds, total * 0.5);
	const percent = Math.round(100 * ease(interpolate(seconds, [printAt + 0.2, printAt + 1.1], [0, 1], CLAMP)));
	const keys = [
		{at: 0, to: {...PILL, w: 0, x: 476, h: 0, y: 750}},
		{at: printAt, to: PILL},
		{at: printAt + 1.25, to: BOOK},
	];
	return (
		<Stage>
			<Rollers />
			{/* A metal clack as each row of type is set, the press as it prints, the pages as the booklet appears. */}
			{content.type.rows.map((row, rowIndex) => <SoundEffect key={row} id="reelStop" atSeconds={beat.at(rowIndex)} />)}
			<SoundEffect id="press" atSeconds={printAt} />
			<SoundEffect id="flip" atSeconds={printAt + 1.3} volume={0.7} />
			<div style={{opacity: 1 - interpolate(seconds, [printAt - 0.1, printAt + 0.2], [0, 1], CLAMP)}}>
				{content.type.rows.map((row, rowIndex) => (
					<At key={row} y={500 + rowIndex * 124} w={952}>
						<div style={{display: 'flex', justifyContent: 'center', gap: u(8)}}>
							{[...row.toLocaleUpperCase('tr')].map((letter, index) => {
								const at = beat.at(rowIndex) + index * 0.04;
								return <Block key={index} letter={letter} drop={ease(interpolate(seconds, [at, at + 0.25], [0, 1], CLAMP))} />;
							})}
						</div>
					</At>
				))}
			</div>
			<Morph
				keys={keys}
				shadow="0 40px 80px -30px rgba(0,0,0,0.6)"
				render={(index) =>
					index <= 1 ? (
						<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: u(16)}}>
							<Text variant="display" size={42} weight={TYPE.weights.kinetic} color={WHITE} style={{whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums lining-nums'}}>
								{`Hazırlanıyor %${percent}`}
							</Text>
						</div>
					) : (
						<Cover content={content} />
					)
				}
			/>
		</Stage>
	);
};

/** The booklet's cover: an orange band with the exam, the student's line under it, pages riffling behind. */
const Cover: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	return (
		<div style={{position: 'absolute', inset: 0, padding: u(50), boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: u(30)}}>
			<div style={{padding: `${u(30)}px ${u(34)}px`, borderRadius: u(16), background: ORANGE}}>
				<Text variant="display" size={54} weight={TYPE.weights.kinetic} color={WHITE} style={{lineHeight: 1.05}}>
					{content.booklet.title}
				</Text>
			</div>
			<Text size={36} weight={TYPE.weights.display} color={NAVY}>
				{content.booklet.meta}
			</Text>
			{[0, 1, 2, 3, 4, 5].map((index) => (
				<div key={index} style={{height: u(14), width: `${92 - (index % 3) * 18}%`, borderRadius: u(7), background: '#E2E8F0'}} />
			))}
		</div>
	);
};

const ChooseScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const Screen = PROMO_PHONE_SCREENS[content.choose.screen];
	const phone = interpolate(seconds, [0.55, 0.85], [0, 1], CLAMP);
	const options = ease(interpolate(seconds, [0.9, 1.3], [0, 1], CLAMP));
	const tapAt = 1.7;
	const picked = seconds >= tapAt + 0.05;
	return (
		<Stage>
			{/* The booklet folds into the phone's shape, then the phone itself appears. */}
			<Morph keys={[{at: 0, to: BOOK}, {at: 0.05, to: PHONE}]} render={(index) => (index === 0 ? <Cover content={content} /> : null)} />
			<At x={PHONE.x} y={PHONE.y} w={PHONE.w}>
				<div style={{opacity: phone}}>
					<PhoneShot width={PHONE.w}>
						<Screen />
					</PhoneShot>
				</div>
			</At>
			<At x={70} y={1200} w={812}>
				<div style={{display: 'flex', gap: u(20), justifyContent: 'center', opacity: options, transform: `translateY(${(1 - options) * u(40)}px)`}}>
					{content.choose.options.map((option, index) => {
						const on = picked && index === content.choose.pick;
						return (
							<div key={option} style={{display: 'flex', alignItems: 'center', gap: u(12), padding: `${u(22)}px ${u(30)}px`, borderRadius: u(999), background: on ? ORANGE : WHITE, boxShadow: `0 ${u(20)}px ${u(40)}px -${u(16)}px rgba(0,0,0,0.5)`}}>
								<Icon name={on ? 'check' : 'exam'} size={u(34)} color={on ? WHITE : NAVY} stroke={2.6} />
								<Text size={38} weight={TYPE.weights.display} color={on ? WHITE : NAVY}>
									{option}
								</Text>
							</div>
						);
					})}
				</div>
			</At>
			<SoundEffect id="pop" atSeconds={0.9} />
			<Tap x={content.choose.pick === 0 ? 300 : 650} y={1240} at={tapAt} />
			<SoundEffect id="success" atSeconds={tapAt + 0.05} />
		</Stage>
	);
};

const SAMPLE: z.input<typeof PrintShopSchema> = {
	hook: {lines: ['Sadece sana basılmış', 'bir deneme?'], narration: 'Sadece sana basılmış bir deneme?'},
	type: {rows: ['TYT', 'MATEMATİK', 'BRANŞ'], narration: 'SinoAI hedefine göre hazırlar.'},
	booklet: {title: 'TYT · Branş denemesi', meta: 'Matematik · sana özel'},
	choose: {screen: 'sinoStudy', options: ['Tam deneme', 'Branş denemesi'], pick: 1, narration: 'Tam deneme ya da branş denemesi, sen seç.'},
};

const buildScenes = (content: Content, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const beat = (text: string, min: number) => estimateReadingSeconds([text], {baseSeconds: 1, minSeconds: min, maxSeconds: 8});
	const say = createNarrator(voiceClips, content.script);
	const hook = say('hook', content.hook.narration, beat(content.hook.narration, 2.4), 2.2);
	const print = say('print', content.type.narration, Math.max(beat(content.type.narration, 5.2), 5.2), 5);
	const choose = say('choose', content.choose.narration, Math.max(beat(content.choose.narration, 4.2), 4.2), 4);
	return [
		{id: 'hook', seconds: hook.seconds, label: 'Hook', voice: [hook], element: <HookScene content={content} />},
		{id: 'print', seconds: print.seconds, label: 'Baskı', voice: [print], element: <PrintScene content={content} seconds={print.seconds} />},
		{id: 'choose', seconds: choose.seconds, label: 'Seçim', voice: [choose], element: <ChooseScene content={content} />},
		...appEndScenes(content.outro.enabled, say),
	];
};

export const PrintShop = defineTemplate({
	id: 'PrintShop',
	category: 'Advertisements',
	title: 'Sana özel baskı',
	description: 'Karanlık matbaada hedef kurşun harflerle vuruş vuruş dizilir; tek siyah şekil “Hazırlanıyor %” hapından kitapçık kapağına, kitapçıktan telefona dönüşür; parmak tam ya da branş denemesini seçer.',
	contentSchema: PrintShopSchema,
	sampleContent: SAMPLE,
	defaultTheme: 'SinavikaDark',
	transition: {preset: 'none'},
	targetSeconds: {min: 10, max: 22},
	buildScenes,
});
