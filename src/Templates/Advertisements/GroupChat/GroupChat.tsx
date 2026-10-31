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
import {defineTemplate} from '../../TemplateDefinition';
import {At, CLAMP, ease, PromoStage, Slam, TypeOn, useLand, useSeconds} from '../PromoKit/PromoKit';
import {CameraZoom, Morph, Tap, type Shape} from '../PromoKit/PromoMotion';

/**
 * A class group chat at night (Kasım 2026, 15 Kasım). A question photo sits
 * unanswered: "seen" climbs, someone starts typing and stops. The chat's own
 * message box grows into a browser window (one shape, no cut): sinavika.com,
 * SinoAI without an account; the photo goes in, the answer comes step by step.
 * The window folds back into the message box and the student answers the
 * group. The chat is a generic, unbranded messenger and plainly fiction.
 */

const narration = z.string().trim().min(1).max(170);
const message = z.object({from: plainText(12), text: plainText(40), time: plainText(5)});

const GroupChatSchema = z.object({
	hook: z.object({lines: z.tuple([plainText(22), plainText(22)]), narration}),
	group: z.object({name: plainText(22), members: z.number().int().min(3).max(99), time: plainText(5)}),
	/** Messages before the question: the group was talking a moment ago. */
	earlier: z.array(message).min(1).max(2),
	question: z.object({from: plainText(12), label: plainText(12), formula: plainText(44), options: z.array(plainText(6)).length(5), text: plainText(30), time: plainText(5)}),
	silence: z.object({seen: z.number().int().min(2).max(99), typing: plainText(12), line: plainText(22), narration}),
	ask: z.object({url: plainText(26), title: plainText(20), note: plainText(28), file: plainText(18), prompt: plainText(36), narration}),
	answer: z.object({steps: z.array(plainText(44)).min(2).max(3), result: plainText(18), narration}),
	back: z.object({line: plainText(24), message: plainText(48), reactions: z.array(z.object({from: plainText(12), text: plainText(26)})).min(2).max(3), narration}),
	script: VoiceScriptSchema,
	outro: z.object({enabled: z.boolean().default(true)}).default({enabled: true}),
});
type Content = z.infer<typeof GroupChatSchema>;

const NIGHT = '#07101C';
const BAR = '#0F1B2B';
const BUBBLE = '#1A2738';
const ORANGE = '#EA580C';
const WHITE = '#FFFFFF';
const SOFT = '#E2E8F0';
const MUTED = '#8696AA';
const INK = '#0B1C30';
const LINE = '#E2E8F0';
/** Sender names in the group, by order of appearance. */
const NAME_COLORS = ['#7DD3FC', '#FCA5A5', '#86EFAC', '#C4B5FD'];

/** The message box at the bottom of the chat; the same shape becomes the browser. */
const COMPOSER: Shape = {x: 30, y: 1250, w: 892, h: 96, radius: 48, fill: BUBBLE};
const BROWSER: Shape = {x: 46, y: 160, w: 860, h: 1060, radius: 34, fill: WHITE};
/** Where the messages stack: bottom-anchored above the composer. */
const LIST = {top: 400, bottom: 1226};

const Ground: React.FC = () => <AbsoluteFill style={{background: `radial-gradient(90% 55% at 50% 0%, #13243A 0%, ${NIGHT} 60%)`}} />;

const nameColor = (content: Content, name: string): string => {
	const names = [...content.earlier.map((item) => item.from), content.question.from, ...content.back.reactions.map((item) => item.from)];
	return NAME_COLORS[Math.max(0, [...new Set(names)].indexOf(name)) % NAME_COLORS.length];
};

const Header: React.FC<{content: Content; status?: string}> = ({content, status}) => {
	const {u} = useVideoLayout();
	return (
		<div style={{position: 'absolute', left: u(20), top: u(10), width: u(912), height: u(120), borderRadius: u(32), background: BAR, display: 'flex', alignItems: 'center', gap: u(20), padding: `0 ${u(28)}px`, boxSizing: 'border-box'}}>
			<Icon name="left" size={u(40)} color={SOFT} stroke={2.4} />
			<div style={{width: u(76), height: u(76), borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
				<Icon name="user" size={u(40)} color={SOFT} stroke={2} />
			</div>
			<div style={{display: 'flex', flexDirection: 'column', gap: u(4), flex: 1, minWidth: 0}}>
				<Text size={38} weight={TYPE.weights.display} color={WHITE}>
					{content.group.name}
				</Text>
				<Text size={28} weight={TYPE.weights.strong} color={status ? '#86EFAC' : MUTED}>
					{status ?? `${content.group.members} üye`}
				</Text>
			</div>
			<div style={{display: 'flex', alignItems: 'center', gap: u(10), padding: `${u(10)}px ${u(18)}px`, borderRadius: u(999), background: '#1E293B'}}>
				<Icon name="moon" size={u(30)} color="#FDE68A" stroke={2.2} />
				<Text size={32} weight={TYPE.weights.display} color={SOFT} style={{fontVariantNumeric: 'tabular-nums lining-nums'}}>
					{content.group.time}
				</Text>
			</div>
		</div>
	);
};

/** A message from someone in the group (left) or from the student (right, orange). */
const Bubble: React.FC<{from?: string; color?: string; time: string; mine?: boolean; children: React.ReactNode}> = ({from, color, time, mine, children}) => {
	const {u} = useVideoLayout();
	return (
		<div style={{alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: u(760), padding: `${u(18)}px ${u(24)}px ${u(14)}px`, borderRadius: u(30), borderBottomLeftRadius: mine ? u(30) : u(8), borderBottomRightRadius: mine ? u(8) : u(30), background: mine ? ORANGE : BUBBLE, display: 'flex', flexDirection: 'column', gap: u(6)}}>
			{from ? (
				<Text size={28} weight={TYPE.weights.display} color={color ?? MUTED}>
					{from}
				</Text>
			) : null}
			{children}
			<Text size={24} weight={TYPE.weights.strong} color={mine ? 'rgba(255,255,255,0.8)' : MUTED} align="right" style={{fontVariantNumeric: 'tabular-nums lining-nums'}}>
				{time}
			</Text>
		</div>
	);
};

const Said: React.FC<{text: string; mine?: boolean}> = ({text, mine}) => (
	<Text size={42} weight={TYPE.weights.strong} color={mine ? WHITE : SOFT} style={{lineHeight: 1.3}}>
		{text}
	</Text>
);

/** The photographed question: a white paper with the item and its options. */
const QuestionPhoto: React.FC<{content: Content; width?: number}> = ({content, width = 640}) => {
	const {u} = useVideoLayout();
	const question = content.question;
	return (
		<div style={{width: u(width), padding: u(28), borderRadius: u(18), background: '#F8FAFC', boxSizing: 'border-box', transform: 'rotate(-1deg)', display: 'flex', flexDirection: 'column', gap: u(16)}}>
			<Text size={26} weight={TYPE.weights.kinetic} color={ORANGE}>
				{question.label}
			</Text>
			<Text size={44} weight={TYPE.weights.display} color={INK} style={{lineHeight: 1.3}}>
				{question.formula}
			</Text>
			<div style={{display: 'flex', flexWrap: 'wrap', gap: `${u(8)}px ${u(22)}px`}}>
				{question.options.map((option, index) => (
					<Text key={option} size={34} weight={TYPE.weights.strong} color="#334155">
						{`${'ABCDE'[index]}) ${option}`}
					</Text>
				))}
			</div>
		</div>
	);
};

/** The question as it was posted: the photo, then the plea under it. */
const QuestionMessages: React.FC<{content: Content}> = ({content}) => (
	<>
		<Bubble from={content.question.from} color={nameColor(content, content.question.from)} time={content.question.time}>
			<QuestionPhoto content={content} />
		</Bubble>
		<Bubble time={content.question.time}>
			<Said text={content.question.text} />
		</Bubble>
	</>
);

/** The message list, anchored at the bottom like a chat: new messages push the old ones up and out. */
const List: React.FC<{children: React.ReactNode; dim?: number}> = ({children, dim = 0}) => {
	const {u} = useVideoLayout();
	return (
		<div style={{position: 'absolute', left: u(30), top: u(LIST.top), width: u(892), height: u(LIST.bottom - LIST.top), overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: u(16), opacity: 1 - dim, filter: dim > 0.02 ? `blur(${u(dim * 8)}px)` : undefined, maskImage: `linear-gradient(to bottom, transparent 0, black ${u(140)}px)`, WebkitMaskImage: `linear-gradient(to bottom, transparent 0, black ${u(140)}px)`}}>
			{children}
		</div>
	);
};

/** The chat's message box: a placeholder, an attach button, the send button. */
const ComposerFace: React.FC = () => {
	const {u} = useVideoLayout();
	return (
		<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', gap: u(18), padding: `0 ${u(18)}px 0 ${u(30)}px`}}>
			<Icon name="plus" size={u(40)} color={MUTED} stroke={2.4} />
			<Text size={34} weight={TYPE.weights.strong} color={MUTED} style={{flex: 1}}>
				Mesaj yaz
			</Text>
			<div style={{width: u(64), height: u(64), borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<Icon name="send" size={u(32)} color={SOFT} stroke={2.2} />
			</div>
		</div>
	);
};

const Stage: React.FC<{children: React.ReactNode}> = ({children}) => (
	<PromoStage ground={<Ground />}>
		{children}
	</PromoStage>
);

const HookScene: React.FC<{content: Content}> = ({content}) => (
	<Stage>
		<Header content={content} />
		<List>
			{content.earlier.map((item) => (
				<Bubble key={item.text} from={item.from} color={nameColor(content, item.from)} time={item.time}>
					<Said text={item.text} />
				</Bubble>
			))}
			<QuestionMessages content={content} />
		</List>
		<Morph keys={[{at: 0, to: COMPOSER}]} render={() => <ComposerFace />} />
		<At y={170} w={952}>
			<Slam text={content.hook.lines[0]} at={0} size={TYPE.adScale.headline} color={WHITE} />
		</At>
		<At y={290} w={952}>
			<Slam text={content.hook.lines[1]} at={0.35} size={TYPE.adScale.headline * 0.82} color={ORANGE} />
		</At>
	</Stage>
);

/** Typing dots that rise one after another. */
const Dots: React.FC = () => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	return (
		<div style={{display: 'flex', gap: u(10), padding: `${u(8)}px ${u(4)}px`}}>
			{[0, 1, 2].map((index) => (
				<div key={index} style={{width: u(16), height: u(16), borderRadius: '50%', background: MUTED, transform: `translateY(${-Math.max(0, Math.sin(seconds * 9 - index * 0.9)) * u(8)}px)`}} />
			))}
		</div>
	);
};

const SilenceScene: React.FC<{content: Content; seconds: number}> = ({content, seconds: total}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	// "Seen" climbs, someone starts typing and gives up; the question stays unanswered.
	const seen = Math.round(interpolate(seconds, [0, Math.min(1.6, total * 0.6)], [3, content.silence.seen], CLAMP));
	const typingFrom = 0.55;
	const typingUntil = Math.min(total - 0.5, 1.75);
	const typing = seconds >= typingFrom && seconds < typingUntil;
	const line = useLand(0.15, 150, 20);
	return (
		<Stage>
			<Header content={content} status={typing ? `${content.silence.typing} yazıyor…` : undefined} />
			<List>
				<QuestionMessages content={content} />
				<div style={{alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: u(10), paddingLeft: u(10)}}>
					<Icon name="eye" size={u(30)} color={MUTED} stroke={2.2} />
					<Text size={30} weight={TYPE.weights.display} color={MUTED} style={{fontVariantNumeric: 'tabular-nums lining-nums'}}>
						{`Görüldü · ${seen}`}
					</Text>
				</div>
				{typing ? (
					<div style={{alignSelf: 'flex-start', padding: `${u(18)}px ${u(26)}px`, borderRadius: u(30), borderBottomLeftRadius: u(8), background: BUBBLE}}>
						<Dots />
					</div>
				) : null}
			</List>
			<SoundEffect id="pop" atSeconds={typingFrom} volume={0.5} />
			<Morph keys={[{at: 0, to: COMPOSER}]} render={() => <ComposerFace />} />
			<At y={200} w={952}>
				<div style={{opacity: Math.min(1, line * 1.4), transform: `scale(${interpolate(line, [0, 1], [1.15, 1])})`}}>
					<Text variant="display" size={TYPE.adScale.headline} weight={TYPE.weights.kinetic} color={WHITE} align="center">
						{content.silence.line}
					</Text>
				</div>
			</At>
		</Stage>
	);
};

/** The SinoAI page as a guest sees it on the site: the title, a note and the box to ask in. */
const BrowserBar: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	return (
		<div style={{position: 'absolute', left: 0, top: 0, right: 0, height: u(96), background: '#F1F5F9', borderBottom: `${u(2)}px solid ${LINE}`, display: 'flex', alignItems: 'center', gap: u(22), padding: `0 ${u(30)}px`}}>
			<div style={{display: 'flex', gap: u(10)}}>
				{['#F87171', '#FBBF24', '#34D399'].map((color) => (
					<div key={color} style={{width: u(18), height: u(18), borderRadius: '50%', background: color}} />
				))}
			</div>
			<div style={{flex: 1, height: u(58), borderRadius: u(29), background: WHITE, border: `${u(2)}px solid ${LINE}`, display: 'flex', alignItems: 'center', gap: u(12), padding: `0 ${u(22)}px`}}>
				<Icon name="lock" size={u(26)} color="#64748B" stroke={2.2} />
				<Text size={30} weight={TYPE.weights.display} color={INK}>
					{content.ask.url}
				</Text>
			</div>
		</div>
	);
};

const AskPage: React.FC<{content: Content; attachAt: number; typeAt: number}> = ({content, attachAt, typeAt}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const attach = ease(interpolate(seconds, [attachAt, attachAt + 0.35], [0, 1], CLAMP));
	return (
		<>
			<BrowserBar content={content} />
			<div style={{position: 'absolute', left: 0, right: 0, top: u(170), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u(18)}}>
				<Icon name="sparkles" size={u(70)} color={INK} stroke={1.8} />
				<Text variant="display" size={68} weight={TYPE.weights.kinetic} color={INK} align="center">
					{content.ask.title}
				</Text>
				<div style={{padding: `${u(10)}px ${u(24)}px`, borderRadius: u(999), background: '#FFF7ED'}}>
					<Text size={32} weight={TYPE.weights.display} color={ORANGE}>
						{content.ask.note}
					</Text>
				</div>
			</div>
			<div style={{position: 'absolute', left: u(40), right: u(40), top: u(520), borderRadius: u(36), border: `${u(2)}px solid ${LINE}`, boxShadow: `0 ${u(24)}px ${u(48)}px -${u(30)}px rgba(15,23,42,0.4)`, padding: u(28), display: 'flex', flexDirection: 'column', gap: u(22)}}>
				<div style={{alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: u(14), padding: `${u(12)}px ${u(20)}px`, borderRadius: u(20), background: '#F1F5F9', opacity: attach, transform: `translateY(${(1 - attach) * -u(60)}px) scale(${interpolate(attach, [0, 1], [1.2, 1])})`}}>
					<Icon name="image" size={u(34)} color={INK} stroke={2.2} />
					<Text size={30} weight={TYPE.weights.display} color={INK}>
						{content.ask.file}
					</Text>
				</div>
				<div style={{minHeight: u(100)}}>
					<TypeOn text={content.ask.prompt} at={typeAt} charsPerSecond={30} size={38} color={INK} caret={ORANGE} />
				</div>
				<div style={{display: 'flex', alignItems: 'center', gap: u(12)}}>
					<div style={{display: 'flex', alignItems: 'center', gap: u(10), padding: `${u(10)}px ${u(18)}px`, borderRadius: u(999), border: `${u(2)}px solid ${LINE}`}}>
						<Icon name="image" size={u(28)} color="#475569" stroke={2.2} />
						<Text size={28} weight={TYPE.weights.strong} color="#475569">
							Fotoğraf ekle
						</Text>
					</div>
					<div style={{flex: 1}} />
					<div style={{width: u(72), height: u(72), borderRadius: '50%', background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<Icon name="up" size={u(38)} color={WHITE} stroke={2.6} />
					</div>
				</div>
			</div>
		</>
	);
};

/** Where the send button sits on the canvas (inside the browser's ask box). */
const SEND = {x: BROWSER.x + BROWSER.w - 40 - 28 - 36, y: BROWSER.y + 520 + 28 + 100 + 22 + 60 + 22 + 36};

const AskScene: React.FC<{content: Content; seconds: number}> = ({content, seconds: total}) => {
	const seconds = useSeconds();
	// The message box grows into the browser; the chat behind it goes dark.
	const dim = ease(interpolate(seconds, [0.05, 0.45], [0, 1], CLAMP));
	const attachAt = 0.75;
	const typeAt = 1.05;
	const sendAt = Math.max(typeAt + content.ask.prompt.length / 30 + 0.2, total - 0.55);
	return (
		<Stage>
			<div style={{position: 'absolute', inset: 0, opacity: 1 - dim}}>
				<Header content={content} />
			</div>
			<List dim={dim}>
				<QuestionMessages content={content} />
			</List>
			<Morph
				keys={[
					{at: 0, to: COMPOSER},
					{at: 0.1, to: BROWSER},
				]}
				shadow="0 40px 80px -30px rgba(0,0,0,0.6)"
				render={(index) => (index === 0 ? <ComposerFace /> : <AskPage content={content} attachAt={attachAt} typeAt={typeAt} />)}
			/>
			<SoundEffect id="pop" atSeconds={attachAt} />
			<Tap x={SEND.x} y={SEND.y} at={sendAt} color="rgba(234,88,12,0.6)" />
		</Stage>
	);
};

/** SinoAI's reply: the photo the student sent, then the steps one after another and the answer. */
const AnswerPage: React.FC<{content: Content; stepAt: (index: number) => number; resultAt: number}> = ({content, stepAt, resultAt}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const show = (at: number) => ease(interpolate(seconds, [at, at + 0.3], [0, 1], CLAMP));
	return (
		<>
			<BrowserBar content={content} />
			<div style={{position: 'absolute', left: u(36), right: u(36), top: u(130), display: 'flex', flexDirection: 'column', gap: u(22)}}>
				<div style={{alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: u(14), padding: `${u(16)}px ${u(24)}px`, borderRadius: u(28), borderBottomRightRadius: u(8), background: '#F1F5F9'}}>
					<Icon name="image" size={u(34)} color={INK} stroke={2.2} />
					<Text size={30} weight={TYPE.weights.display} color={INK}>
						{content.ask.file}
					</Text>
				</div>
				<div style={{display: 'flex', gap: u(18), alignItems: 'flex-start'}}>
					<div style={{width: u(68), height: u(68), borderRadius: '50%', background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
						<Icon name="sparkles" size={u(36)} color={WHITE} stroke={2.2} />
					</div>
					<div style={{display: 'flex', flexDirection: 'column', gap: u(16), flex: 1}}>
						{content.answer.steps.map((step, index) => (
							<div key={step} style={{opacity: show(stepAt(index)), transform: `translateY(${(1 - show(stepAt(index))) * u(30)}px)`, display: 'flex', gap: u(16), alignItems: 'flex-start', padding: `${u(20)}px ${u(22)}px`, borderRadius: u(24), border: `${u(2)}px solid ${LINE}`, background: WHITE}}>
								<div style={{width: u(48), height: u(48), borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
									<Text size={28} weight={TYPE.weights.kinetic} color={INK}>
										{String(index + 1)}
									</Text>
								</div>
								<Text size={40} weight={TYPE.weights.strong} color={INK} style={{lineHeight: 1.3}}>
									{step}
								</Text>
							</div>
						))}
						<div style={{alignSelf: 'flex-start', opacity: show(resultAt), transform: `scale(${interpolate(show(resultAt), [0, 1], [1.2, 1])})`, display: 'flex', alignItems: 'center', gap: u(12), padding: `${u(16)}px ${u(28)}px`, borderRadius: u(999), background: ORANGE}}>
							<Icon name="check" size={u(36)} color={WHITE} stroke={3} />
							<Text size={38} weight={TYPE.weights.kinetic} color={WHITE}>
								{content.answer.result}
							</Text>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

const AnswerScene: React.FC<{content: Content; seconds: number}> = ({content, seconds: total}) => {
	const steps = content.answer.steps.length;
	const stepAt = (index: number) => 0.25 + index * Math.min(0.7, (total - 1.2) / (steps + 1));
	const resultAt = stepAt(steps - 1) + 0.6;
	return (
		<Stage>
			<CameraZoom
				keys={[
					{at: 0, to: {x: 476, y: 690, zoom: 1}},
					{at: 0.2, to: {x: 476, y: 560, zoom: 1.22}},
				]}
			>
				<Morph keys={[{at: 0, to: BROWSER}]} shadow="0 40px 80px -30px rgba(0,0,0,0.6)" render={() => <AnswerPage content={content} stepAt={stepAt} resultAt={resultAt} />} />
			</CameraZoom>
			{content.answer.steps.map((step, index) => <SoundEffect key={step} id="pop" atSeconds={stepAt(index)} volume={0.6} />)}
			<SoundEffect id="success" atSeconds={resultAt} />
		</Stage>
	);
};

/** One message arriving: it rises in from below with a soft pop. */
const Arrive: React.FC<{at: number; children: React.ReactNode}> = ({at, children}) => {
	const seconds = useSeconds();
	const land = useLand(at, 200, 22);
	if (seconds < at) return null;
	return (
		<div style={{display: 'flex', flexDirection: 'column', opacity: Math.min(1, land * 1.6), transform: `translateY(${(1 - land) * 60}px) scale(${interpolate(land, [0, 1], [0.92, 1])})`}}>
			{children}
			<SoundEffect id="pop" atSeconds={0} volume={0.6} />
		</div>
	);
};

const BackScene: React.FC<{content: Content; seconds: number}> = ({content, seconds: total}) => {
	const seconds = useSeconds();
	const back = ease(interpolate(seconds, [0.05, 0.45], [0, 1], CLAMP));
	const mineAt = 0.55;
	const reactionAt = (index: number) => mineAt + 0.55 + index * Math.min(0.45, (total - mineAt - 1) / content.back.reactions.length);
	const line = useLand(0.2, 150, 20);
	return (
		<Stage>
			<div style={{position: 'absolute', inset: 0, opacity: back}}>
				<Header content={content} />
			</div>
			<List dim={1 - back}>
				<QuestionMessages content={content} />
				<div style={{alignSelf: 'flex-end'}}>
					<Arrive at={mineAt}>
						<Bubble time={content.group.time} mine>
							<Said text={content.back.message} mine />
						</Bubble>
					</Arrive>
				</div>
				{content.back.reactions.map((reaction, index) => (
					<Arrive key={reaction.text} at={reactionAt(index)}>
						<Bubble from={reaction.from} color={nameColor(content, reaction.from)} time={content.group.time}>
							<Said text={reaction.text} />
						</Bubble>
					</Arrive>
				))}
			</List>
			<Morph
				keys={[
					{at: 0, to: BROWSER},
					{at: 0.05, to: COMPOSER},
				]}
				render={(index) => (index === 0 ? null : <ComposerFace />)}
			/>
			<At y={190} w={952}>
				<div style={{opacity: Math.min(1, line * 1.4) * back, transform: `scale(${interpolate(line, [0, 1], [1.15, 1])})`}}>
					<Text variant="display" size={TYPE.adScale.headline * 0.9} weight={TYPE.weights.kinetic} color={WHITE} align="center">
						{content.back.line}
					</Text>
				</div>
			</At>
		</Stage>
	);
};

const SAMPLE: z.input<typeof GroupChatSchema> = {
	hook: {lines: ['Grup sessiz.', 'Soru hâlâ cevapsız.'], narration: 'Grup sessiz. Soru hâlâ cevapsız.'},
	group: {name: '12-C Sınıf Grubu', members: 32, time: '00.40'},
	earlier: [
		{from: 'Mert', text: 'Yarınki deneme kaçta?', time: '23.58'},
		{from: 'Zeynep', text: '09.30 diye duydum', time: '00.02'},
	],
	question: {from: 'Elif', label: 'Soru 7', formula: 'f(x) = (3x² − 2)⁴ ise f′(1) kaçtır?', options: ['12', '18', '24', '36', '48'], text: 'Bunu çözebilen var mı?', time: '00.40'},
	silence: {seen: 31, typing: 'Mert', line: '31 kişi gördü.', narration: 'Bekleme.'},
	ask: {url: 'sinavika.com/sinoai', title: 'SinoAI’ye sor', note: 'Hesap açmadan dene', file: 'soru-7.jpg', prompt: 'Bunu adım adım anlatır mısın?', narration: 'sinavika.com’da SinoAI’ye hesap açmadan sor.'},
	answer: {
		steps: ['Zincir kuralı: dış türev × iç türev', 'f′(x) = 4(3x² − 2)³ · 6x', 'x = 1 için 4 · 1³ · 6 = 24'],
		result: 'Cevap: C) 24',
		narration: 'Cevabı adım adım anlatsın.',
	},
	back: {
		line: 'Sonra gruba sen yaz.',
		message: 'SinoAI’ye sordum, adım adım anlattı. Cevap C.',
		reactions: [
			{from: 'Elif', text: 'Kurtardın!'},
			{from: 'Zeynep', text: 'Zincir kuralıymış, tamam'},
		],
		narration: 'Sonra gruba sen yaz.',
	},
};

const buildScenes = (content: Content, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const beat = (text: string, min: number) => estimateReadingSeconds([text], {baseSeconds: 1, minSeconds: min, maxSeconds: 7});
	const say = createNarrator(voiceClips, content.script);
	const hook = say('hook', content.hook.narration, beat(content.hook.narration, 2.4), 2.2);
	const silence = say('silence', content.silence.narration, Math.max(beat(content.silence.narration, 2), 2), 2);
	const ask = say('ask', content.ask.narration, Math.max(beat(content.ask.narration, 3.4), 3.4), 3.4);
	const answer = say('answer', content.answer.narration, Math.max(beat(content.answer.narration, 2.8), 2.8), 2.8);
	const back = say('back', content.back.narration, Math.max(beat(content.back.narration, 2.6), 2.6), 2.6);
	return [
		{id: 'hook', seconds: hook.seconds, label: 'Hook', voice: [hook], element: <HookScene content={content} />},
		{id: 'silence', seconds: silence.seconds, label: 'Sessizlik', voice: [silence], element: <SilenceScene content={content} seconds={silence.seconds} />},
		{id: 'ask', seconds: ask.seconds, label: 'Sor', voice: [ask], element: <AskScene content={content} seconds={ask.seconds} />},
		{id: 'answer', seconds: answer.seconds, label: 'Cevap', voice: [answer], element: <AnswerScene content={content} seconds={answer.seconds} />},
		{id: 'back', seconds: back.seconds, label: 'Gruba dönüş', voice: [back], element: <BackScene content={content} seconds={back.seconds} />},
		...appEndScenes(content.outro.enabled, say),
	];
};

export const GroupChat = defineTemplate({
	id: 'GroupChat',
	category: 'Advertisements',
	title: 'Sessiz grup',
	description: 'Gece sınıf grubunda cevapsız bir soru fotoğrafı; “görüldü” artar, biri yazar ve vazgeçer. Sohbetin mesaj kutusu tarayıcı penceresine dönüşür: sinavika.com’da hesap açmadan SinoAI, cevap adım adım; pencere mesaj kutusuna geri döner, gruba öğrenci yazar.',
	contentSchema: GroupChatSchema,
	sampleContent: SAMPLE,
	defaultTheme: 'SinavikaDark',
	transition: {preset: 'none'},
	targetSeconds: {min: 12, max: 22},
	buildScenes,
});
