import React from 'react';
import {z} from 'zod';
import {AbsoluteFill, interpolate} from 'remotion';
import {useVideoLayout} from '../../../Components/Layouts/VideoLayout';
import {SoundEffect} from '../../../Components/Sounds/SoundEffect';
import {Text} from '../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../Configurations/BrandTypography';
import {appEndScenes} from '../../../Scenes/AppEndScene';
import {estimateReadingSeconds} from '../../../Scenes/SceneDuration';
import type {TemplateScene} from '../../../Scenes/ScenePlan';
import {createNarrator, VoiceScriptSchema, type VoiceClips} from '../../../Scenes/Voiceover';
import {plainText} from '../../../Schemas/RichText';
import {Icon} from '../../../UIUX/Icons';
import {MODULES} from '../../../UIUX/ModuleIdentity';
import {defineTemplate} from '../../TemplateDefinition';
import {At, CLAMP, ease, PhoneShot, PromoStage, Slam, useLand, useSeconds} from '../PromoKit/PromoKit';
import {PROMO_PHONE_SCREEN_NAMES, PROMO_PHONE_SCREENS} from '../PromoKit/PromoScreens';

/**
 * The week as a till receipt (Kasım 2026, 6 Kasım): a small navy printer on a
 * white table prints the week line by line (the fields Ders Planı's İstatistik
 * really shows: completed tasks, time studied, plan adherence, streak), the
 * receipt is torn off and pinned beside the phone, and it signs off "Pazartesi
 * görüşürüz". Stop-motion feel: everything moves in small steps.
 */

const narration = z.string().trim().min(1).max(170);

const StudyReceiptSchema = z.object({
	hook: z.object({lines: z.tuple([plainText(24), plainText(24)]), narration}),
	receipt: z.object({
		title: plainText(20),
		period: plainText(24),
		rows: z.array(z.object({label: plainText(22), value: plainText(12)})).min(3).max(6),
		footer: plainText(26),
		narration,
	}),
	app: z.object({screen: z.enum(PROMO_PHONE_SCREEN_NAMES), place: plainText(30), narration}),
	close: z.object({line: plainText(40), narration}),
	script: VoiceScriptSchema,
	outro: z.object({enabled: z.boolean().default(true)}).default({enabled: true}),
});
type Content = z.infer<typeof StudyReceiptSchema>;

const NAVY = '#0B1C30';
const ORANGE = '#EA580C';
const PAPER = '#FFFFFF';
const GREY = '#64748B';
const PLAN = MODULES.studyPlan.color.light;

const RECEIPT_W = 560;
const ROW_H = 74;

const Ground: React.FC = () => <AbsoluteFill style={{background: 'radial-gradient(80% 60% at 50% 35%, #FFFFFF 0%, #F1F5F9 60%, #E2E8F0 100%)'}} />;

/** Stop-motion: a value moves in steps of 1/12 s. */
const stepped = (seconds: number) => Math.floor(seconds * 12) / 12;

/** The receipt itself; `shown` rows are printed, `cut` adds the torn zigzag edge. */
const Receipt: React.FC<{content: Content; shown: number; footer: boolean; cut: boolean}> = ({content, shown, footer, cut}) => {
	const {u} = useVideoLayout();
	const {receipt} = content;
	// The torn edge, walked from the right corner back to the left one so the outline never crosses itself.
	const zig = Array.from({length: 15}, (_, index) => `${100 - (index / 14) * 100}% ${index % 2 ? 100 : 96}%`).join(', ');
	return (
		<div style={{width: u(RECEIPT_W), background: PAPER, padding: `${u(40)}px ${u(40)}px ${u(cut ? 60 : 30)}px`, boxSizing: 'border-box', boxShadow: `0 ${u(20)}px ${u(40)}px -${u(16)}px rgba(15,23,42,0.35)`, clipPath: cut ? `polygon(0 0, 100% 0, ${zig})` : undefined}}>
			<Text variant="display" size={46} weight={TYPE.weights.kinetic} color={NAVY} align="center" style={{letterSpacing: '0.1em'}}>
				{receipt.title}
			</Text>
			<Text size={30} weight={TYPE.weights.strong} color={GREY} align="center" style={{marginTop: u(6)}}>
				{receipt.period}
			</Text>
			<div style={{height: 0, borderTop: `${u(3)}px dashed #CBD5E1`, margin: `${u(24)}px 0`}} />
			{receipt.rows.slice(0, shown).map((row) => (
				<div key={row.label} style={{height: u(ROW_H), display: 'flex', alignItems: 'center', gap: u(12)}}>
					<Text size={34} weight={TYPE.weights.strong} color={NAVY} style={{whiteSpace: 'nowrap'}}>
						{row.label}
					</Text>
					<div style={{flex: 1, borderBottom: `${u(3)}px dotted #CBD5E1`, transform: `translateY(${u(10)}px)`}} />
					<Text variant="display" size={38} weight={TYPE.weights.kinetic} color={NAVY} style={{whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums lining-nums'}}>
						{row.value}
					</Text>
				</div>
			))}
			{footer ? (
				<>
					<div style={{height: 0, borderTop: `${u(3)}px dashed #CBD5E1`, margin: `${u(20)}px 0`}} />
					<Text size={34} weight={TYPE.weights.display} color={ORANGE} align="center">
						{receipt.footer}
					</Text>
				</>
			) : null}
		</div>
	);
};

/** The printer on the table; the receipt comes out of its slot, `out` rows long. */
const Printer: React.FC<{content: Content; shown: number; footer: boolean; shake: number}> = ({content, shown, footer, shake}) => {
	const {u} = useVideoLayout();
	return (
		<>
			<At x={476 - RECEIPT_W / 2} y={470} w={RECEIPT_W}>
				<div style={{transform: `translateX(${shake * u(3)}px)`}}>
					<Receipt content={content} shown={shown} footer={footer} cut={false} />
				</div>
			</At>
			<At x={476 - 380} y={330} w={760}>
				<div style={{height: u(170), borderRadius: u(40), background: 'linear-gradient(180deg, #1E3A5F 0%, #0B1C30 100%)', boxShadow: `0 ${u(30)}px ${u(60)}px -${u(24)}px rgba(15,23,42,0.6)`, position: 'relative', transform: `translateX(${shake * u(4)}px)`}}>
					<div style={{position: 'absolute', left: u(90), right: u(90), bottom: u(28), height: u(16), borderRadius: u(8), background: '#020617'}} />
					<div style={{position: 'absolute', right: u(40), top: u(36), width: u(22), height: u(22), borderRadius: '50%', background: shake ? '#22C55E' : '#334155'}} />
				</div>
			</At>
		</>
	);
};

const Stage: React.FC<{children: React.ReactNode}> = ({children}) => (
	<PromoStage ground={<Ground />}>
		{children}
	</PromoStage>
);

const HookScene: React.FC<{content: Content}> = ({content}) => {
	const seconds = useSeconds();
	return (
		<Stage>
			<Printer content={content} shown={0} footer={false} shake={Math.floor(seconds * 16) % 2} />
			<SoundEffect id="printer" atSeconds={0} volume={0.6} />
			<At y={70} w={952}>
				<Slam text={content.hook.lines[0]} at={0} size={TYPE.adScale.headline} color={NAVY} />
			</At>
			<At y={185} w={952}>
				<Slam text={content.hook.lines[1]} at={0.3} size={TYPE.adScale.headline} color={ORANGE} />
			</At>
		</Stage>
	);
};

const PrintScene: React.FC<{content: Content; seconds: number}> = ({content, seconds: total}) => {
	const seconds = stepped(useSeconds());
	const rows = content.receipt.rows.length;
	const per = (total - 0.6) / rows;
	const shown = Math.min(rows, Math.floor(seconds / per) + 1);
	const printing = seconds % per < per * 0.5;
	return (
		<Stage>
			<Printer content={content} shown={shown} footer={false} shake={printing ? Math.floor(seconds * 24) % 2 : 0} />
			{/* One printer line for each row, as long as the paper moves. */}
			{content.receipt.rows.map((_, index) => <SoundEffect key={index} id="printer" atSeconds={index * per} seconds={Math.min(0.8, per * 0.6)} />)}
		</Stage>
	);
};

const AppScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const tear = ease(interpolate(stepped(seconds), [0.1, 0.6], [0, 1], CLAMP));
	const phone = useLand(0.4, 150, 20);
	const Screen = PROMO_PHONE_SCREENS[content.app.screen];
	const place = ease(interpolate(seconds, [0.9, 1.3], [0, 1], CLAMP));
	return (
		<Stage>
			<SoundEffect id="paperTear" atSeconds={0.1} />
			<SoundEffect id="transitionWhoosh" atSeconds={0.4} volume={0.7} />
			<SoundEffect id="success" atSeconds={0.9} />
			<At x={430 + (1 - phone) * 500} y={300} w={480}>
				<div style={{filter: `drop-shadow(0 ${u(40)}px ${u(60)}px rgba(15,23,42,0.35))`}}>
					<PhoneShot width={480}>
						<Screen />
					</PhoneShot>
				</div>
			</At>
			<At x={interpolate(tear, [0, 1], [476 - RECEIPT_W / 2, 20])} y={interpolate(tear, [0, 1], [470, 360])} w={RECEIPT_W}>
				<div style={{transform: `rotate(${-tear * 6}deg) scale(${interpolate(tear, [0, 1], [1, 0.72])})`, transformOrigin: 'top left'}}>
					<Receipt content={content} shown={content.receipt.rows.length} footer={false} cut />
				</div>
			</At>
			<At y={140} w={952}>
				<div style={{display: 'flex', justifyContent: 'center', opacity: place}}>
					<div style={{display: 'flex', alignItems: 'center', gap: u(14), padding: `${u(16)}px ${u(30)}px`, borderRadius: u(999), background: PLAN}}>
						<Icon name="chart" size={u(36)} color="#FFFFFF" stroke={2.4} />
						<Text size={40} weight={TYPE.weights.display} color="#FFFFFF">
							{content.app.place}
						</Text>
					</div>
				</div>
			</At>
		</Stage>
	);
};

const CloseScene: React.FC<{content: Content}> = ({content}) => {
	const seconds = useSeconds();
	const line = ease(interpolate(seconds, [0.1, 0.5], [0, 1], CLAMP));
	return (
		<Stage>
			<At x={476 - RECEIPT_W / 2} y={520} w={RECEIPT_W}>
				<div style={{transform: 'rotate(-2deg)'}}>
					<Receipt content={content} shown={content.receipt.rows.length} footer cut />
				</div>
			</At>
			<At y={120} w={952}>
				<div style={{opacity: line}}>
					<Text variant="display" size={TYPE.adScale.headline} weight={TYPE.weights.kinetic} color={NAVY} align="center">
						{content.close.line}
					</Text>
				</div>
			</At>
		</Stage>
	);
};

const SAMPLE: z.input<typeof StudyReceiptSchema> = {
	hook: {lines: ['Bu hafta kaç saat', 'çalıştın?'], narration: 'Bu hafta kaç saat çalıştın?'},
	receipt: {
		title: 'BU HAFTA',
		period: '2–8 Kasım',
		rows: [
			{label: 'Tamamlanan görev', value: '12'},
			{label: 'Çalışılan süre', value: '6 sa 20 dk'},
			{label: 'Plana uyum', value: '%80'},
			{label: 'Güncel seri', value: '5 gün'},
		],
		footer: 'Pazartesi görüşürüz.',
		narration: 'Tamamlanan görev, çalışılan süre, güncel serin.',
	},
	app: {screen: 'planToday', place: 'Ders Planı › İstatistik', narration: 'Haftanı Ders Planı’nın istatistik ekranında gör.'},
	close: {line: 'Gelecek haftanın fişi daha uzun olsun.', narration: 'Gelecek haftanın fişi daha uzun olsun.'},
};

const buildScenes = (content: Content, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const beat = (text: string, min: number) => estimateReadingSeconds([text], {baseSeconds: 1, minSeconds: min, maxSeconds: 7});
	const say = createNarrator(voiceClips, content.script);
	const hook = say('hook', content.hook.narration, beat(content.hook.narration, 2), 1.8);
	const print = say('print', content.receipt.narration, Math.max(beat(content.receipt.narration, 4.4), 4.4), 4.2);
	const app = say('app', content.app.narration, Math.max(beat(content.app.narration, 3.6), 3.6), 3.4);
	const close = say('close', content.close.narration, Math.max(beat(content.close.narration, 3), 3), 2.8);
	return [
		{id: 'hook', seconds: hook.seconds, label: 'Hook', voice: [hook], element: <HookScene content={content} />},
		{id: 'print', seconds: print.seconds, label: 'Fiş', voice: [print], element: <PrintScene content={content} seconds={print.seconds} />},
		{id: 'app', seconds: app.seconds, label: 'Uygulama', voice: [app], element: <AppScene content={content} />},
		{id: 'close', seconds: close.seconds, label: 'Kapanış', voice: [close], element: <CloseScene content={content} />},
		...appEndScenes(content.outro.enabled, say),
	];
};

export const StudyReceipt = defineTemplate({
	id: 'StudyReceipt',
	category: 'Advertisements',
	title: 'Haftanın fişi',
	description: 'Beyaz masada küçük lacivert yazıcı haftayı fiş olarak basar (Ders Planı İstatistik alanları), fiş koparılıp telefonun yanına iğnelenir ve "Pazartesi görüşürüz" der. Stop-motion adımlarla.',
	contentSchema: StudyReceiptSchema,
	sampleContent: SAMPLE,
	defaultTheme: 'SinavikaLight',
	transition: {preset: 'none'},
	targetSeconds: {min: 12, max: 22},
	buildScenes,
});
