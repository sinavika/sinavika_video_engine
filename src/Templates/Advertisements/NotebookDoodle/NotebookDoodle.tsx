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
import {MODULES} from '../../../UIUX/ModuleIdentity';
import {defineTemplate} from '../../TemplateDefinition';
import {At, CLAMP, ease, PromoStage, Slam, useSeconds} from '../PromoKit/PromoKit';
import {CameraZoom, Morph, Tap, type Key, type Shape} from '../PromoKit/PromoMotion';

/**
 * A full notebook page (Kasım 2026, 11 Kasım). The notes go faint and question
 * marks drift over them; a viewfinder frames the page, a tap takes the photo,
 * and the page itself shrinks into SinoAI's attachment chip (one shape, no
 * cut). Out of the chip rise a flash card and a test; they settle into the
 * library beside what was made before. Notes are drawn as strokes, not a
 * handwriting font: Manrope is the only face.
 */

const narration = z.string().trim().min(1).max(170);

const NotebookDoodleSchema = z.object({
	hook: z.object({lines: z.tuple([plainText(22), plainText(22)]), narration}),
	/** The headings on the page (the rest are scribbled lines). */
	headings: z.array(plainText(24)).min(2).max(4),
	snap: z.object({file: plainText(26), narration}),
	make: z.object({card: z.object({front: plainText(44), meta: plainText(24)}), test: z.object({title: plainText(26), meta: plainText(24)}), narration}),
	library: z.object({title: plainText(16), items: z.array(z.object({title: plainText(24), meta: plainText(20), module: z.enum(['flashcards', 'tests', 'smartSummary', 'lessons'])})).min(3).max(6), narration}),
	script: VoiceScriptSchema,
	outro: z.object({enabled: z.boolean().default(true)}).default({enabled: true}),
});
type Content = z.infer<typeof NotebookDoodleSchema>;

const INK = '#0B1C30';
const ORANGE = '#EA580C';
const WHITE = '#FFFFFF';
const LINE = '#E2E8F0';
const PEN = '#1E3A8A';

const PAGE: Shape = {x: 96, y: 330, w: 760, h: 1000, radius: 26, fill: WHITE};
const CHIP: Shape = {x: 176, y: 620, w: 600, h: 116, radius: 58, fill: '#F1F5F9'};

const Ground: React.FC = () => <AbsoluteFill style={{background: 'radial-gradient(80% 60% at 50% 40%, #FFFFFF 0%, #EEF2F6 70%, #E2E8F0 100%)'}} />;

/** A wavy pen stroke standing for a written line. */
const Scribble: React.FC<{width: number; seed: number; opacity: number}> = ({width, seed, opacity}) => {
	const {u} = useVideoLayout();
	const points = Array.from({length: 14}, (_, index) => {
		const x = (index / 13) * width;
		const y = 14 + Math.sin(index * 1.7 + seed) * 6 + Math.sin(index * 0.6 + seed * 2) * 3;
		return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
	}).join(' ');
	return (
		<svg width={u(width)} height={u(28)} viewBox={`0 0 ${width} 28`} style={{display: 'block', opacity}}>
			<path d={points} fill="none" stroke={PEN} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
};

/** The page's content: squared paper, headings and lines of notes; `fade` takes them away. */
const PageNotes: React.FC<{content: Content; fade: number}> = ({content, fade}) => {
	const {u} = useVideoLayout();
	return (
		<div style={{position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${LINE} ${u(2)}px, transparent ${u(2)}px), linear-gradient(90deg, ${LINE} ${u(2)}px, transparent ${u(2)}px)`, backgroundSize: `${u(40)}px ${u(40)}px`, padding: `${u(50)}px ${u(46)}px`, boxSizing: 'border-box', filter: fade > 0 ? `blur(${u(fade * 3)}px)` : undefined}}>
			{content.headings.map((heading, index) => (
				<div key={heading} style={{marginBottom: u(30), opacity: 1 - fade * 0.8}}>
					<Text variant="display" size={40} weight={TYPE.weights.kinetic} color={PEN} style={{textDecoration: 'underline'}}>
						{heading}
					</Text>
					{[0, 1, 2, 3].map((line) => (
						<div key={line} style={{marginTop: u(10)}}>
							<Scribble width={(line % 3 === 2 ? 380 : 600) - index * 20} seed={index * 4 + line} opacity={1 - fade * 0.85} />
						</div>
					))}
				</div>
			))}
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
		<Morph keys={[{at: 0, to: PAGE}]} shadow="0 30px 60px -30px rgba(15,23,42,0.35)" render={() => <PageNotes content={content} fade={0} />} />
		<At y={70} w={952}>
			<Slam text={content.hook.lines[0]} at={0} size={TYPE.adScale.headline} color={INK} />
		</At>
		<At y={180} w={952}>
			<Slam text={content.hook.lines[1]} at={0.35} size={TYPE.adScale.headline} color={ORANGE} />
		</At>
	</Stage>
);

/** Question marks drifting over the faded notes, one more on every beat. */
const Doubts: React.FC = () => {
	const beat = useBeat();
	const seconds = useSeconds();
	return (
		<>
			{Array.from({length: Math.min(6, beat.index + 2)}, (_, index) => (
				<At key={index} x={150 + ((index * 233) % 600)} y={420 + ((index * 317) % 700) - seconds * 20}>
					<div style={{transform: `rotate(${(index % 2 ? 1 : -1) * (10 + index * 4)}deg)`, opacity: 0.85}}>
						<Text variant="display" size={110 + (index % 3) * 30} weight={TYPE.weights.kinetic} color="#94A3B8">
							?
						</Text>
					</div>
				</At>
			))}
		</>
	);
};

const SnapScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const fade = ease(interpolate(seconds, [0, 0.6], [0, 1], CLAMP));
	const finder = interpolate(seconds, [0.5, 0.8], [0, 1], CLAMP) * (1 - interpolate(seconds, [1.35, 1.5], [0, 1], CLAMP));
	const shutter = interpolate(seconds, [1.2, 1.26, 1.4], [0, 0.9, 0], CLAMP);
	// The page becomes the attachment: the same white sheet shrinks into SinoAI's chip.
	const keys: Key<Shape>[] = [
		{at: 0, to: PAGE},
		{at: 1.45, to: CHIP},
	];
	return (
		<Stage>
			<Morph
				keys={keys}
				shadow="0 30px 60px -30px rgba(15,23,42,0.35)"
				render={(index) =>
					index === 0 ? (
						<PageNotes content={content} fade={fade} />
					) : (
						<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', gap: u(18), padding: `0 ${u(28)}px`}}>
							<div style={{width: u(70), height: u(70), borderRadius: u(18), background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
								<Icon name="image" size={u(40)} color={PEN} stroke={2.2} />
							</div>
							<Text size={36} weight={TYPE.weights.display} color={INK}>
								{content.snap.file}
							</Text>
						</div>
					)
				}
			/>
			{seconds < 1.45 ? <Doubts /> : null}
			{/* The viewfinder's corners around the page, then the shutter. */}
			<div style={{position: 'absolute', left: u(PAGE.x - 30), top: u(PAGE.y - 30), width: u(PAGE.w + 60), height: u(PAGE.h + 60), opacity: finder}}>
				{[[0, 0], [1, 0], [0, 1], [1, 1]].map(([right, bottom], index) => (
					<div key={index} style={{position: 'absolute', [right ? 'right' : 'left']: 0, [bottom ? 'bottom' : 'top']: 0, width: u(90), height: u(90), borderStyle: 'solid', borderColor: ORANGE, borderWidth: 0, [`border${bottom ? 'Bottom' : 'Top'}Width`]: u(10), [`border${right ? 'Right' : 'Left'}Width`]: u(10), borderRadius: u(12)}} />
				))}
			</div>
			<At x={476 - 60} y={1360} w={120}>
				<div style={{width: u(120), height: u(120), borderRadius: '50%', border: `${u(8)}px solid ${INK}`, background: WHITE, opacity: finder, boxSizing: 'border-box'}} />
			</At>
			<Tap x={476} y={1420} at={1.15} sound="shutter" />
			<AbsoluteFill style={{background: WHITE, opacity: shutter}} />
		</Stage>
	);
};

const Made: React.FC<{icon: 'cards' | 'quiz'; color: string; title: string; meta: string}> = ({icon, color, title, meta}) => {
	const {u} = useVideoLayout();
	return (
		<div style={{padding: u(30), borderRadius: u(36), background: WHITE, border: `${u(2)}px solid ${LINE}`, boxShadow: `0 ${u(24)}px ${u(48)}px -${u(24)}px rgba(15,23,42,0.3)`, display: 'flex', flexDirection: 'column', gap: u(16)}}>
			<div style={{width: u(76), height: u(76), borderRadius: u(22), background: color, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<Icon name={icon} size={u(42)} color={WHITE} stroke={2.2} />
			</div>
			<Text variant="display" size={40} weight={TYPE.weights.kinetic} color={INK} style={{lineHeight: 1.15}}>
				{title}
			</Text>
			<Text size={30} weight={TYPE.weights.strong} color="#64748B">
				{meta}
			</Text>
		</div>
	);
};

const MakeScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const rise = (delay: number) => ease(interpolate(seconds, [delay, delay + 0.5], [0, 1], CLAMP));
	return (
		<Stage>
			<CameraZoom keys={[{at: 0, to: {x: 476, y: 765, zoom: 1}}, {at: 0.9, to: {x: 476, y: 900, zoom: 1.08}}]}>
				<Morph keys={[{at: 0, to: CHIP}]} render={() => (
					<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', gap: u(18), padding: `0 ${u(28)}px`}}>
						<div style={{width: u(70), height: u(70), borderRadius: u(18), background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							<Icon name="image" size={u(40)} color={PEN} stroke={2.2} />
						</div>
						<Text size={36} weight={TYPE.weights.display} color={INK}>
							{content.snap.file}
						</Text>
					</div>
				)} />
				<SoundEffect id="pop" atSeconds={0.3} />
				<SoundEffect id="pop" atSeconds={0.6} />
				<At x={70} y={800 + (1 - rise(0.3)) * 300} w={400}>
					<div style={{opacity: rise(0.3)}}>
						<Made icon="cards" color={MODULES.flashcards.color.light} title={content.make.card.front} meta={content.make.card.meta} />
					</div>
				</At>
				<At x={490} y={800 + (1 - rise(0.6)) * 300} w={392}>
					<div style={{opacity: rise(0.6)}}>
						<Made icon="quiz" color={MODULES.tests.color.light} title={content.make.test.title} meta={content.make.test.meta} />
					</div>
				</At>
			</CameraZoom>
		</Stage>
	);
};

const LibraryScene: React.FC<{content: Content}> = ({content}) => {
	const {u} = useVideoLayout();
	const seconds = useSeconds();
	const icon = {flashcards: 'cards', tests: 'quiz', smartSummary: 'scan', lessons: 'book'} as const;
	return (
		<Stage>
			<At x={70} y={220} w={812}>
				<div style={{display: 'flex', alignItems: 'center', gap: u(16)}}>
					<Icon name="layers" size={u(54)} color={INK} stroke={2.2} />
					<Text variant="display" size={TYPE.adScale.headline} weight={TYPE.weights.kinetic} color={INK}>
						{content.library.title}
					</Text>
				</div>
			</At>
			<SoundEffect id="flip" atSeconds={0} />
			<SoundEffect id="pop" atSeconds={0.24} volume={0.6} />
			<At x={70} y={380} w={812}>
				<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: u(24)}}>
					{content.library.items.map((item, index) => {
						const show = ease(interpolate(seconds, [index * 0.12, index * 0.12 + 0.4], [0, 1], CLAMP));
						const color = MODULES[item.module].color.light;
						return (
							<div key={item.title} style={{opacity: show, transform: `translateY(${(1 - show) * u(40)}px)`, padding: u(26), borderRadius: u(30), background: WHITE, border: `${u(2)}px solid ${index < 2 ? color : LINE}`, display: 'flex', flexDirection: 'column', gap: u(12)}}>
								<div style={{width: u(60), height: u(60), borderRadius: u(18), background: `${color}1F`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
									<Icon name={icon[item.module]} size={u(34)} color={color} stroke={2.2} />
								</div>
								<Text size={32} weight={TYPE.weights.display} color={INK}>
									{item.title}
								</Text>
								<Text size={26} weight={TYPE.weights.strong} color="#64748B">
									{item.meta}
								</Text>
							</div>
						);
					})}
				</div>
			</At>
		</Stage>
	);
};

const SAMPLE: z.input<typeof NotebookDoodleSchema> = {
	hook: {lines: ['Defterin dolu.', 'Aklında ne kaldı?'], narration: 'Defterin dolu. Aklında ne kaldı?'},
	headings: ['Hücre bölünmesi', 'Mitoz evreleri', 'Mayoz farkı'],
	snap: {file: 'defter-sayfasi.jpg', narration: 'Sayfanın fotoğrafını SinoAI’ye at.'},
	make: {card: {front: 'Mitozun evreleri nelerdir?', meta: 'Bilgi Kartları · 12 kart'}, test: {title: 'Hücre bölünmesi', meta: 'Test · 10 soru'}, narration: 'Notlarından bilgi kartı ve test hazırlasın.'},
	library: {
		title: 'Kütüphane',
		items: [
			{title: 'Mitoz evreleri', meta: '12 kart', module: 'flashcards'},
			{title: 'Hücre bölünmesi', meta: 'Test · 10 soru', module: 'tests'},
			{title: 'Mayoz özeti', meta: 'Özet · 1 sayfa', module: 'smartSummary'},
			{title: 'Kalıtım', meta: '20 kart', module: 'flashcards'},
		],
		narration: 'Ürettiği her şey kütüphanende durur.',
	},
};

const buildScenes = (content: Content, voiceClips: VoiceClips = {}): TemplateScene[] => {
	const beat = (text: string, min: number) => estimateReadingSeconds([text], {baseSeconds: 1, minSeconds: min, maxSeconds: 7});
	const say = createNarrator(voiceClips, content.script);
	const hook = say('hook', content.hook.narration, beat(content.hook.narration, 2.4), 2.2);
	const snap = say('snap', content.snap.narration, Math.max(beat(content.snap.narration, 3.2), 3.2), 3);
	const make = say('make', content.make.narration, Math.max(beat(content.make.narration, 3.4), 3.4), 3.2);
	const library = say('library', content.library.narration, Math.max(beat(content.library.narration, 3), 3), 2.8);
	return [
		{id: 'hook', seconds: hook.seconds, label: 'Hook', voice: [hook], element: <HookScene content={content} />},
		{id: 'snap', seconds: snap.seconds, label: 'Fotoğraf', voice: [snap], element: <SnapScene content={content} />},
		{id: 'make', seconds: make.seconds, label: 'Üretim', voice: [make], element: <MakeScene content={content} />},
		{id: 'library', seconds: library.seconds, label: 'Kütüphane', voice: [library], element: <LibraryScene content={content} />},
		...appEndScenes(content.outro.enabled, say),
	];
};

export const NotebookDoodle = defineTemplate({
	id: 'NotebookDoodle',
	category: 'Advertisements',
	title: 'Defter sayfası',
	description: 'Dolu kareli defter sayfası silikleşir, soru işaretleri uçuşur; vizör sayfayı çeker ve sayfa tek parça hâlinde SinoAI’nin ek çipine dönüşür; çipten bilgi kartı ve test yükselir, kütüphaneye dizilir.',
	contentSchema: NotebookDoodleSchema,
	sampleContent: SAMPLE,
	defaultTheme: 'SinavikaLight',
	transition: {preset: 'none'},
	targetSeconds: {min: 12, max: 22},
	buildScenes,
});
