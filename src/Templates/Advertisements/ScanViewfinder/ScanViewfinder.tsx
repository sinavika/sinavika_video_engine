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
import {At, CLAMP, ease, PromoStage, Slam, useLand, useSeconds} from '../PromoKit/PromoKit';
import {CameraZoom, Morph, Tap} from '../PromoKit/PromoMotion';

/**
 * Don't erase the mistake (Kasım 2026, 20 Kasım). An eraser comes for the red
 * cross on a worked question and stops. A camera viewfinder locks onto the
 * question, a scan line passes, the shutter fires and an aperture closes on
 * the paper; it opens on Akıllı Özet's layers, one over the other: the steps,
 * the topic in short and the mistake's cause. Back on the paper the wrong line
 * is struck through and the cross becomes a tick (one shape).
 */

const narration = z.string().trim().min(1).max(170);

const ScanViewfinderSchema = z.object({
	hook: z.object({lines: z.tuple([plainText(22), plainText(22)]), narration}),
	/** The question on the paper and the student's working, line by line; `wrong` is the line with the mistake. */
	paper: z.object({label: plainText(12), question: plainText(48), options: z.array(plainText(5)).length(5), work: z.array(plainText(22)).min(3).max(4), wrong: z.number().int().min(0).max(3)}),
	scan: z.object({mode: plainText(16), narration}),
	layers: z.object({
		steps: z.object({title: plainText(22), lines: z.array(plainText(30)).min(2).max(3)}),
		topic: z.object({title: plainText(22), text: plainText(90)}),
		mistake: z.object({title: plainText(22), cause: plainText(32), detail: plainText(48)}),
		narration,
	}),
	fix: z.object({line: plainText(30), answer: plainText(10), narration}),
	script: VoiceScriptSchema,
	outro: z.object({enabled: z.boolean().default(true)}).default({enabled: true}),
});
type Content = z.infer<typeof ScanViewfinderSchema>;

const NAVY = '#0B1C30';
const ORANGE = '#EA580C';
const WHITE = '#FFFFFF';
const PEN = '#1E3A8A';
const RED = '#DC2626';
const GREEN = '#16A34A';
const SUMMARY = MODULES.smartSummary.color.light;

const PAPER = {x: 96, y: 330, w: 760, h: 790};
/** The question block on the paper, where the viewfinder locks. */
const QUESTION = {x: PAPER.x + 30, y: PAPER.y + 30, w: PAPER.w - 60, h: 300};
const WORK_TOP = PAPER.y + 380;
const WORK_ROW = 108;
/** The mark beside the student's answer (the last line of working). */
const markAt = (content: Content) => ({x: PAPER.x + PAPER.w - 150, y: WORK_TOP + (content.paper.work.length - 1) * WORK_ROW - 30});

const Ground: React.FC = () => <AbsoluteFill style={{background: `radial-gradient(80% 60% at 50% 45%, #1A2E4A 0%, ${NAVY} 70%)`}} />;

/** The worked question: the item, the options, the working in pen; `strike` crosses out the wrong line, `fixed` writes the right answer under it. */
const Paper: React.FC<{content: Content; strike?: number; fixed?: number}> = ({content, strike = 0, fixed = 0}) => {
	const {u} = useVideoLayout();
	const paper = content.paper;
	return (
		<div style={{position: 'absolute', left: u(PAPER.x), top: u(PAPER.y), width: u(PAPER.w), height: u(PAPER.h), borderRadius: u(18), background: '#FBFBF7', boxShadow: `0 ${u(40)}px ${u(80)}px -${u(30)}px rgba(0,0,0,0.6)`, backgroundImage: `repeating-linear-gradient(180deg, transparent 0 ${u(WORK_ROW - 2)}px, #DBEAFE ${u(WORK_ROW - 2)}px ${u(WORK_ROW)}px)`, backgroundPosition: `0 ${u(WORK_TOP - PAPER.y - 24)}px`}}>
			<div style={{position: 'absolute', left: u(30), top: u(30), right: u(30), display: 'flex', flexDirection: 'column', gap: u(16)}}>
				<Text size={30} weight={TYPE.weights.kinetic} color={ORANGE}>
					{paper.label}
				</Text>
				<Text size={46} weight={TYPE.weights.display} color={NAVY} style={{lineHeight: 1.25}}>
					{paper.question}
				</Text>
				<div style={{display: 'flex', gap: u(30), flexWrap: 'wrap'}}>
					{paper.options.map((option, index) => (
						<Text key={option} size={38} weight={TYPE.weights.strong} color="#334155">
							{`${'ABCDE'[index]}) ${option}`}
						</Text>
					))}
				</div>
			</div>
			{paper.work.map((line, index) => (
				<div key={line} style={{position: 'absolute', left: u(60), top: u(WORK_TOP - PAPER.y + index * WORK_ROW - 70), height: u(80), display: 'flex', alignItems: 'center'}}>
					<Text size={50} weight={TYPE.weights.strong} color={PEN} style={{fontStyle: 'italic'}}>
						{line}
					</Text>
					{index === paper.wrong && strike > 0 ? <div style={{position: 'absolute', left: u(-10), top: '52%', height: u(6), width: `calc((100% + ${u(20)}px) * ${strike})`, borderRadius: u(3), background: ORANGE}} /> : null}
				</div>
			))}
			{fixed > 0 ? (
				<div style={{position: 'absolute', left: u(60), top: u(WORK_TOP - PAPER.y + paper.work.length * WORK_ROW - 70), height: u(80), display: 'flex', alignItems: 'center', opacity: fixed, transform: `translateX(${(1 - fixed) * u(-30)}px)`}}>
					<Text size={50} weight={TYPE.weights.kinetic} color={GREEN} style={{fontStyle: 'italic'}}>
						{content.fix.answer}
					</Text>
				</div>
			) : null}
		</div>
	);
};

/** The red cross the student got, in a circle; it becomes the green tick. */
const MARK_SIZE = 110;
const Mark: React.FC<{content: Content; tickAt?: number}> = ({content, tickAt}) => {
	const {u} = useVideoLayout();
	const at = markAt(content);
	const shape = {x: at.x, y: at.y - MARK_SIZE / 2, w: MARK_SIZE, h: MARK_SIZE, radius: MARK_SIZE / 2};
	const keys = tickAt === undefined ? [{at: 0, to: {...shape, fill: RED}}] : [{at: 0, to: {...shape, fill: RED}}, {at: tickAt, to: {...shape, x: shape.x - 10, y: shape.y + WORK_ROW, fill: GREEN}}];
	return (
		<Morph
			keys={keys}
			sound={null}
			shadow={`0 ${u(14)}px ${u(30)}px -${u(10)}px rgba(0,0,0,0.4)`}
			render={(index) => (
				<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<Icon name={index === 0 ? 'x' : 'check'} size={u(64)} color={WHITE} stroke={3.4} />
				</div>
			)}
		/>
	);
};

/** A school eraser in its sleeve, drawn at (x, y), tilted. */
const Eraser: React.FC<{x: number; y: number}> = ({x, y}) => {
	const {u} = useVideoLayout();
	return (
		<div style={{position: 'absolute', left: u(x), top: u(y), width: u(260), height: u(100), transform: 'rotate(-28deg)', transformOrigin: 'left center', filter: `drop-shadow(0 ${u(24)}px ${u(24)}px rgba(0,0,0,0.45))`}}>
			<div style={{position: 'absolute', inset: 0, borderRadius: u(18), background: '#FDA4AF'}} />
			<div style={{position: 'absolute', left: u(90), top: 0, right: 0, bottom: 0, borderRadius: `0 ${u(18)}px ${u(18)}px 0`, background: '#2563EB'}} />
			<div style={{position: 'absolute', left: u(110), top: u(30), width: u(120), height: u(40), borderRadius: u(8), background: 'rgba(255,255,255,0.85)'}} />
		</div>
	);
};

const Stage: React.FC<{children: React.ReactNode}> = ({children}) => (
	<PromoStage ground={<Ground />}>
		{children}
	</PromoStage>
);

const HookScene: React.FC<{content: Content}> = ({content}) => {
	const seconds = useSeconds();
	const mark = markAt(content);
	// The eraser comes for the cross and stops just short of it.
	const come = ease(interpolate(seconds, [0, 0.55], [0, 1], CLAMP));
	return (
		<Stage>
			<Paper content={content} />
			<Mark content={content} />
			<Eraser x={interpolate(come, [0, 1], [900, mark.x + 70])} y={interpolate(come, [0, 1], [1400, mark.y + 90])} />
			<SoundEffect id="transitionWhoosh" atSeconds={0} volume={0.5} />
			<At y={80} w={952}>
				<Slam text={content.hook.lines[0]} at={0} size={TYPE.adScale.headline} color={WHITE} />
			</At>
			<At y={190} w={952}>
				<Slam text={content.hook.lines[1]} at={0.35} size={TYPE.adScale.headline * 0.9} color={ORANGE} />
			</At>
		</Stage>
	);
};

/** An aperture over the frame: an octagon of light that turns as it closes (`open` 0 → closed, 1 → wide). */
const Aperture: React.FC<{open: number; centre: {x: number; y: number}}> = ({open, centre}) => {
	const {u} = useVideoLayout();
	if (open >= 1) return null;
	const radius = 1100 * open;
	const turn = (1 - open) * 70;
	const points = Array.from({length: 8}, (_, index) => {
		const angle = ((index * 45 + turn) * Math.PI) / 180;
		return {x: centre.x + Math.cos(angle) * radius, y: centre.y + Math.sin(angle) * radius};
	});
	const hole = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ') + ' Z';
	return (
		<svg width={u(952)} height={u(1530)} viewBox="0 0 952 1530" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
			<path d={`M-600 -600 H1552 V2130 H-600 Z ${hole}`} fill="#020617" fillRule="evenodd" />
			{points.map((point, index) => {
				const next = points[(index + 2) % 8];
				return <line key={index} x1={point.x} y1={point.y} x2={point.x + (next.x - point.x) * 3} y2={point.y + (next.y - point.y) * 3} stroke="#1E293B" strokeWidth="4" />;
			})}
		</svg>
	);
};

const ScanScene: React.FC<{content: Content; seconds: number}> = ({content, seconds: total}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const ui = ease(interpolate(seconds, [0, 0.3], [0, 1], CLAMP));
	const lock = ease(interpolate(seconds, [0.2, 0.6], [0, 1], CLAMP));
	const scanFrom = 0.65;
	const scan = interpolate(seconds, [scanFrom, scanFrom + 0.8], [0, 1], CLAMP);
	const shutterAt = Math.min(total - 0.9, 1.7);
	const flash = interpolate(seconds, [shutterAt, shutterAt + 0.05, shutterAt + 0.2], [0, 0.8, 0], CLAMP);
	const close = ease(interpolate(seconds, [shutterAt + 0.15, total - 0.05], [1, 0], CLAMP));
	// The brackets go from the whole paper to the question.
	const box = {x: interpolate(lock, [0, 1], [PAPER.x - 20, QUESTION.x - 14]), y: interpolate(lock, [0, 1], [PAPER.y - 20, QUESTION.y - 14]), w: interpolate(lock, [0, 1], [PAPER.w + 40, QUESTION.w + 28]), h: interpolate(lock, [0, 1], [PAPER.h + 40, QUESTION.h + 28])};
	return (
		<Stage>
			<Paper content={content} />
			<Mark content={content} />
			<div style={{position: 'absolute', inset: 0, opacity: ui}}>
				<div style={{position: 'absolute', left: u(box.x), top: u(box.y), width: u(box.w), height: u(box.h)}}>
					{[[0, 0], [1, 0], [0, 1], [1, 1]].map(([right, bottom], index) => (
						<div key={index} style={{position: 'absolute', [right ? 'right' : 'left']: 0, [bottom ? 'bottom' : 'top']: 0, width: u(80), height: u(80), borderStyle: 'solid', borderColor: lock >= 1 ? SUMMARY : WHITE, borderWidth: 0, [`border${bottom ? 'Bottom' : 'Top'}Width`]: u(9), [`border${right ? 'Right' : 'Left'}Width`]: u(9), borderRadius: u(14)}} />
					))}
					{scan > 0 && scan < 1 ? <div style={{position: 'absolute', left: u(10), right: u(10), top: `${scan * 100}%`, height: u(6), borderRadius: u(3), background: SUMMARY, boxShadow: `0 0 ${u(30)}px ${u(10)}px rgba(124,58,237,0.45)`}} /> : null}
				</div>
				<At y={160} w={952}>
					<div style={{display: 'flex', justifyContent: 'center'}}>
						<div style={{display: 'flex', alignItems: 'center', gap: u(12), padding: `${u(14)}px ${u(28)}px`, borderRadius: u(999), background: SUMMARY}}>
							<Icon name="scan" size={u(36)} color={WHITE} stroke={2.4} />
							<Text size={36} weight={TYPE.weights.kinetic} color={WHITE}>
								{content.scan.mode}
							</Text>
						</div>
					</div>
				</At>
				<At x={476 - 66} y={1270} w={132}>
					<div style={{width: u(132), height: u(132), borderRadius: '50%', border: `${u(9)}px solid ${WHITE}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<div style={{width: u(96), height: u(96), borderRadius: '50%', background: WHITE}} />
					</div>
				</At>
			</div>
			<SoundEffect id="pop" atSeconds={0.6} volume={0.6} />
			<SoundEffect id="scanSweep" atSeconds={scanFrom} />
			<Tap x={476} y={1336} at={shutterAt} sound="shutter" color="rgba(255,255,255,0.6)" />
			<AbsoluteFill style={{background: WHITE, opacity: flash}} />
			<Aperture open={close} centre={{x: QUESTION.x + QUESTION.w / 2, y: QUESTION.y + QUESTION.h / 2}} />
			<SoundEffect id="transitionWhoosh" atSeconds={shutterAt + 0.15} volume={0.6} />
		</Stage>
	);
};

/** One of Akıllı Özet's layers: a glass card with a coloured edge, its title and body. */
const Layer: React.FC<{icon: 'list' | 'book' | 'alert'; title: string; tone: string; children: React.ReactNode}> = ({icon, title, tone, children}) => {
	const {u} = useVideoLayout();
	return (
		<div style={{padding: `${u(26)}px ${u(30)}px`, borderRadius: u(34), background: 'rgba(255,255,255,0.97)', borderLeft: `${u(12)}px solid ${tone}`, boxShadow: `0 ${u(30)}px ${u(60)}px -${u(24)}px rgba(0,0,0,0.6)`, display: 'flex', flexDirection: 'column', gap: u(12)}}>
			<div style={{display: 'flex', alignItems: 'center', gap: u(12)}}>
				<Icon name={icon} size={u(36)} color={tone} stroke={2.4} />
				<Text size={34} weight={TYPE.weights.kinetic} color={tone}>
					{title}
				</Text>
			</div>
			{children}
		</div>
	);
};

const LayersScene: React.FC<{content: Content; seconds: number}> = ({content, seconds: total}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const open = ease(interpolate(seconds, [0, 0.45], [0, 1], CLAMP));
	const layers = content.layers;
	const step = Math.min(0.8, (total - 1.4) / 3);
	const layerAt = (index: number) => 0.35 + index * step;
	const rise = (index: number) => ease(interpolate(seconds, [layerAt(index), layerAt(index) + 0.4], [0, 1], CLAMP));
	const style = (index: number): React.CSSProperties => ({opacity: rise(index), transform: `translateY(${(1 - rise(index)) * u(120)}px) scale(${interpolate(rise(index), [0, 1], [0.92, 1])})`});
	const zoomAt = layerAt(2) + 0.45;
	return (
		<Stage>
			<CameraZoom
				keys={[
					{at: 0, to: {x: 476, y: 765, zoom: 1}},
					{at: zoomAt, to: {x: 476, y: 900, zoom: 1.14}},
				]}
			>
				<At x={56} y={230} w={840}>
					<div style={{display: 'flex', flexDirection: 'column', gap: u(26)}}>
						<div style={style(0)}>
							<Layer icon="list" title={layers.steps.title} tone={SUMMARY}>
								{layers.steps.lines.map((line, index) => (
									<Text key={line} size={42} weight={TYPE.weights.display} color={NAVY}>
										{`${index + 1}. ${line}`}
									</Text>
								))}
							</Layer>
						</div>
						<div style={style(1)}>
							<Layer icon="book" title={layers.topic.title} tone={SUMMARY}>
								<Text size={36} weight={TYPE.weights.strong} color="#334155" style={{lineHeight: 1.35}}>
									{layers.topic.text}
								</Text>
							</Layer>
						</div>
						<div style={style(2)}>
							<Layer icon="alert" title={layers.mistake.title} tone={ORANGE}>
								<Text size={46} weight={TYPE.weights.kinetic} color={NAVY}>
									{layers.mistake.cause}
								</Text>
								<Text size={36} weight={TYPE.weights.strong} color="#334155" style={{lineHeight: 1.35}}>
									{layers.mistake.detail}
								</Text>
							</Layer>
						</div>
					</div>
				</At>
			</CameraZoom>
			<Aperture open={open} centre={{x: 476, y: 765}} />
			{[0, 1].map((index) => <SoundEffect key={index} id="pop" atSeconds={layerAt(index)} />)}
			<SoundEffect id="warning" atSeconds={layerAt(2)} volume={0.6} />
		</Stage>
	);
};

const FixScene: React.FC<{content: Content}> = ({content}) => {
	const seconds = useSeconds();
	const strike = ease(interpolate(seconds, [0.2, 0.55], [0, 1], CLAMP));
	const fixed = ease(interpolate(seconds, [0.6, 0.95], [0, 1], CLAMP));
	const line = useLand(0.05, 150, 20);
	const tickAt = 1.05;
	return (
		<Stage>
			<Paper content={content} strike={strike} fixed={fixed} />
			<Mark content={content} tickAt={tickAt} />
			<At y={110} w={952}>
				<div style={{opacity: Math.min(1, line * 1.5), transform: `scale(${interpolate(line, [0, 1], [1.12, 1])})`, padding: '0 40px'}}>
					<Text variant="display" size={TYPE.adScale.headline * 0.82} weight={TYPE.weights.kinetic} color={WHITE} align="center">
						{content.fix.line}
					</Text>
				</div>
			</At>
			<SoundEffect id="pop" atSeconds={0.6} volume={0.6} />
			<SoundEffect id="success" atSeconds={tickAt} />
		</Stage>
	);
};

const SAMPLE: z.input<typeof ScanViewfinderSchema> = {
	hook: {lines: ['Yanlışını silme.', 'Önce nedenini öğren.'], narration: 'Yanlışını silme. Önce nedenini öğren.'},
	paper: {label: 'Soru 12', question: '2x − 3(x − 4) = 5 ise x kaçtır?', options: ['−17', '−7', '7', '17', '3'], work: ['2x − 3x − 12 = 5', '−x = 17', 'x = −17'], wrong: 0},
	scan: {mode: 'Akıllı Özet', narration: 'Sorunun fotoğrafını çek.'},
	layers: {
		steps: {title: 'Adım adım çözüm', lines: ['−3(x − 4) = −3x + 12', '2x − 3x + 12 = 5', '−x = −7 → x = 7']},
		topic: {title: 'Konu özeti', text: 'Parantezin önündeki eksi, içindeki her terimin işaretini değiştirir.'},
		mistake: {title: 'Hatanın nedeni', cause: 'İşaret hatası', detail: 'İlk satırda −3 · (−4) = +12 olmalıydı.'},
		narration: 'Akıllı Özet adım adım çözer, konuyu özetler ve hatanı gösterir.',
	},
	fix: {line: 'Aynı yanlışı ikinci kez yapma.', answer: 'x = 7', narration: 'Aynı yanlışı ikinci kez yapma.'},
};

const buildScenes = (content: Content, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const beat = (text: string, min: number) => estimateReadingSeconds([text], {baseSeconds: 1, minSeconds: min, maxSeconds: 7});
	const say = createNarrator(voiceClips, content.script);
	const hook = say('hook', content.hook.narration, beat(content.hook.narration, 2.4), 2.2);
	const scan = say('scan', content.scan.narration, Math.max(beat(content.scan.narration, 2.8), 2.8), 2.8);
	const layers = say('layers', content.layers.narration, Math.max(beat(content.layers.narration, 4), 4), 4);
	const fix = say('fix', content.fix.narration, Math.max(beat(content.fix.narration, 2.6), 2.6), 2.4);
	return [
		{id: 'hook', seconds: hook.seconds, label: 'Hook', voice: [hook], element: <HookScene content={content} />},
		{id: 'scan', seconds: scan.seconds, label: 'Tarama', voice: [scan], element: <ScanScene content={content} seconds={scan.seconds} />},
		{id: 'layers', seconds: layers.seconds, label: 'Katmanlar', voice: [layers], element: <LayersScene content={content} seconds={layers.seconds} />},
		{id: 'fix', seconds: fix.seconds, label: 'Düzeltme', voice: [fix], element: <FixScene content={content} />},
		...appEndScenes(content.outro.enabled, say),
	];
};

export const ScanViewfinder = defineTemplate({
	id: 'ScanViewfinder',
	category: 'Advertisements',
	title: 'Yanlışını silme',
	description: 'Silgi çözülmüş sorudaki kırmızı çarpıya gelir ve durur. Vizör soruya kilitlenir, tarama çizgisi geçer, deklanşörle diyafram kâğıda kapanır; Akıllı Özet katmanlarına açılır (adımlar, konu özeti, hatanın nedeni). Kâğıtta yanlış satır çizilir, çarpı tek parça hâlinde yeşil onaya dönüşür.',
	contentSchema: ScanViewfinderSchema,
	sampleContent: SAMPLE,
	defaultTheme: 'SinavikaDark',
	transition: {preset: 'none'},
	targetSeconds: {min: 12, max: 22},
	buildScenes,
});
