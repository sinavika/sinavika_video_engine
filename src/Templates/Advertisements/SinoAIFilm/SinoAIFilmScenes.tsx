import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {useVideoLayout} from '../../../Components/Layouts/VideoLayout';
import {Text} from '../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../Configurations/BrandTypography';
import {Icon, type UIIconName} from '../../../UIUX/Icons';
import {At, CLAMP, ease, PromoStage, PromoSubtitle, Slam, TypeOn, useLand, useSeconds, wordCues} from '../PromoKit/PromoKit';
import {SINO_FILM_CPS, type SinoAIFilmContent} from './SinoAIFilmSchema';

/**
 * SinoAI's product film: white, quiet, one centred column, like a chat app's
 * own launch film. No colour of its own (SinoAI is neutral); ink on white,
 * a single soft grey light. Orange appears only in the Sınavika logo.
 */

type Content = SinoAIFilmContent;

const INK = '#0B1C30';
const INK2 = '#334155';
const MUTED = '#94A3B8';
const LINE = '#E2E8F0';
const SOFT = '#F1F5F9';

const Ground: React.FC = () => (
	<AbsoluteFill style={{background: 'radial-gradient(120% 70% at 50% 0%, #FFFFFF 0%, #FAFBFC 55%, #F3F5F8 100%)'}} />
);

const Stage: React.FC<{content: Content; narration: string; shown?: string; children: React.ReactNode}> = ({content, narration, shown, children}) => (
	<PromoStage ground={<Ground />}>
		{children}
		<PromoSubtitle text={narration} shown={shown} enabled={content.subtitles} ink="#FFFFFF" fill={INK} />
	</PromoStage>
);

const Composer: React.FC<{content: Content; typedAt: number; sentAt: number; lift?: number}> = ({content, typedAt, sentAt, lift = 0}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const land = useLand(0.05, 140);
	const sent = interpolate(seconds, [sentAt, sentAt + 0.25], [0, 1], CLAMP);
	return (
		<div style={{width: u(860), padding: `${u(30)}px ${u(26)}px ${u(24)}px ${u(36)}px`, borderRadius: u(44), background: '#FFFFFF', border: `${u(2)}px solid ${LINE}`, boxShadow: `0 ${u(30)}px ${u(70)}px -${u(30)}px rgba(15,23,42,0.28)`, transform: `translateY(${(1 - land) * u(60) - lift}px)`, opacity: land, boxSizing: 'border-box'}}>
			<div style={{minHeight: u(124)}}>{seconds < typedAt ? <Text size={46} weight={TYPE.weights.body} color={MUTED}>SinoAI’ye sor</Text> : <TypeOn text={content.ask.question} at={typedAt} charsPerSecond={SINO_FILM_CPS} size={46} color={INK} weight={TYPE.weights.strong} />}</div>
			<div style={{display: 'flex', alignItems: 'center', gap: u(14), marginTop: u(18)}}>
				{(['plus', 'image'] as UIIconName[]).map((icon) => (
					<div key={icon} style={{width: u(58), height: u(58), borderRadius: u(29), border: `${u(2)}px solid ${LINE}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<Icon name={icon} size={u(26)} color={INK2} />
					</div>
				))}
				<div style={{flex: 1}} />
				<div style={{width: u(70), height: u(70), borderRadius: u(35), background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 - Math.sin(sent * Math.PI) * 0.16})`}}>
					<Icon name="up" size={u(32)} color="#FFFFFF" stroke={2.6} />
				</div>
			</div>
		</div>
	);
};

export const HookScene: React.FC<{content: Content}> = ({content}) => (
	<Stage content={content} narration={content.hook.narration} shown={content.hook.lines.join(' ')}>
		<At y={520} w={952}>
			<Slam text={content.hook.lines[0]} at={0.1} size={TYPE.adScale.hook} color={MUTED} />
		</At>
		<At y={700} w={952}>
			<Slam text={content.hook.lines[1]} at={0.9} size={TYPE.adScale.hook} color={INK} />
		</At>
	</Stage>
);

export const AskScene: React.FC<{content: Content}> = ({content}) => {
	const typedAt = 0.55;
	const sentAt = typedAt + content.ask.question.length / SINO_FILM_CPS + 0.35;
	return (
		<Stage content={content} narration={content.ask.narration}>
			<At y={380} w={952}>
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: useVideoLayout().u(20)}}>
					<Icon name="sparkles" size={useVideoLayout().u(84)} color={INK} stroke={1.5} />
					<Text variant="display" size={64} weight={TYPE.weights.display} color={INK} align="center">
						Bugün ne öğrenelim?
					</Text>
				</div>
			</At>
			<At y={640} x={46}>
				<Composer content={content} typedAt={typedAt} sentAt={sentAt} />
			</At>
		</Stage>
	);
};

const Spinner: React.FC<{size: number}> = ({size}) => {
	const seconds = useSeconds();
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" style={{transform: `rotate(${seconds * 400}deg)`}}>
			<circle cx="12" cy="12" r="9" fill="none" stroke={LINE} strokeWidth="3" />
			<path d="M12 3 a9 9 0 0 1 9 9" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
		</svg>
	);
};

export const ThinkScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const step = 0.9;
	return (
		<Stage content={content} narration={content.think.narration}>
			<At y={300} x={50} w={852}>
				<div style={{alignSelf: 'flex-end', marginLeft: 'auto', maxWidth: u(760), padding: `${u(26)}px ${u(34)}px`, borderRadius: u(38), background: SOFT}}>
					<Text size={42} weight={TYPE.weights.strong} color={INK}>
						{content.ask.question}
					</Text>
				</div>
			</At>
			<At y={640} x={50} w={852}>
				<div style={{display: 'flex', flexDirection: 'column', gap: u(44)}}>
					{content.think.steps.map((item, index) => {
						const start = 0.5 + index * step;
						const visible = interpolate(seconds, [start, start + 0.3], [0, 1], CLAMP);
						const done = seconds > start + step * 0.85;
						return (
							<div key={item.label} style={{display: 'flex', alignItems: 'center', gap: u(22), opacity: visible, transform: `translateY(${(1 - visible) * u(24)}px)`}}>
								<div style={{width: u(44), height: u(44), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{done ? <Icon name="checkCircle" size={u(48)} color={INK} stroke={2} /> : <Spinner size={u(44)} />}</div>
								<div style={{flex: 1}}>
									<Text size={46} weight={TYPE.weights.strong} color={done ? INK : INK2}>
										{item.label}
									</Text>
								</div>
								<div style={{padding: `${u(10)}px ${u(20)}px`, borderRadius: u(999), border: `${u(2)}px solid ${LINE}`, background: '#FFFFFF'}}>
									<Text size={32} weight={TYPE.weights.strong} color={INK2}>
										{item.detail}
									</Text>
								</div>
							</div>
						);
					})}
				</div>
			</At>
		</Stage>
	);
};

export const AnswerScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const streamEnd = 0.4 + content.answer.text.length / 60;
	return (
		<Stage content={content} narration={content.answer.narration}>
			<At y={260} x={50} w={852}>
				<div style={{display: 'flex', gap: u(22), alignItems: 'flex-start'}}>
					<Icon name="sparkles" size={u(56)} color={INK} stroke={1.7} />
					<div style={{flex: 1}}>
						<TypeOn text={content.answer.text} at={0.4} charsPerSecond={60} size={50} weight={TYPE.weights.body} color={INK} caret={MUTED} />
					</div>
				</div>
			</At>
			<At y={760} x={90} w={772}>
				<div style={{borderRadius: u(30), border: `${u(2)}px solid ${LINE}`, background: '#FFFFFF', overflow: 'hidden', boxShadow: `0 ${u(20)}px ${u(50)}px -${u(30)}px rgba(15,23,42,0.25)`}}>
					{content.answer.plan.map((row, index) => {
						const visible = interpolate(seconds, [streamEnd + index * 0.3, streamEnd + index * 0.3 + 0.3], [0, 1], CLAMP);
						return (
							<div key={row.day} style={{display: 'flex', alignItems: 'center', gap: u(24), padding: `${u(32)}px ${u(34)}px`, borderTop: index ? `${u(2)}px solid ${SOFT}` : undefined, opacity: visible, transform: `translateX(${(1 - visible) * u(30)}px)`}}>
								<div style={{width: u(110)}}>
									<Text size={34} weight={TYPE.weights.strong} color={MUTED}>
										{row.day}
									</Text>
								</div>
								<Text size={42} weight={TYPE.weights.strong} color={INK}>
									{row.task}
								</Text>
							</div>
						);
					})}
				</div>
			</At>
		</Stage>
	);
};

export const MakeScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const zoomAt = 0.4 + content.make.items.length * 0.45 + 0.4;
	const zoom = ease(interpolate(seconds, [zoomAt, zoomAt + 1.1], [0, 1], CLAMP));
	return (
		<Stage content={content} narration={content.make.narration}>
			<At y={380} x={0} w={952}>
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u(36), transform: `scale(${1 + zoom * 0.22}) translateY(${zoom * u(90)}px)`, transformOrigin: '50% 0%'}}>
					{content.make.items.map((item, index) => {
						const land = interpolate(seconds, [0.4 + index * 0.45, 0.4 + index * 0.45 + 0.5], [0, 1], CLAMP);
						const focus = index === 0 ? 1 : 1 - zoom * 0.55;
						return (
							<div key={item.title} style={{width: u(860), display: 'flex', alignItems: 'center', gap: u(30), padding: `${u(42)}px ${u(40)}px`, borderRadius: u(36), background: '#FFFFFF', border: `${u(2)}px solid ${LINE}`, boxShadow: `0 ${u(26)}px ${u(60)}px -${u(30)}px rgba(15,23,42,0.3)`, opacity: ease(land) * focus, transform: `translateX(${(1 - ease(land)) * u(520)}px) rotate(${(1 - ease(land)) * 4}deg)`}}>
								<div style={{width: u(110), height: u(110), borderRadius: u(32), background: SOFT, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
									<Icon name={item.icon} size={u(54)} color={INK} stroke={1.9} />
								</div>
								<div style={{flex: 1}}>
									<Text size={52} weight={TYPE.weights.display} color={INK}>
										{item.title}
									</Text>
									<Text size={34} weight={TYPE.weights.strong} color={MUTED}>
										{item.meta}
									</Text>
								</div>
								<Icon name="right" size={u(36)} color={MUTED} />
							</div>
						);
					})}
				</div>
			</At>
		</Stage>
	);
};

export const WordsScene: React.FC<{content: Content; spoken?: string; voiceSeconds?: number}> = ({content, spoken, voiceSeconds}) => {
	const words = content.words.words;
	const cues = wordCues(spoken ?? content.words.narration, words, voiceSeconds, [0.05, 0.72, 1.42]);
	return (
		<Stage content={content} narration={content.words.narration} shown={words.join(' ')}>
			{words.map((word, index) => (
				<At key={word} y={560} w={952}>
					<Slam text={word} at={cues[index]} out={index < words.length - 1 ? cues[index + 1] - 0.12 : undefined} size={TYPE.adScale.numeral * 0.8} color={INK} />
				</At>
			))}
		</Stage>
	);
};

