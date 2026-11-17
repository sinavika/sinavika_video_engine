import React from 'react';
import {Composition, Folder, Sequence} from 'remotion';
import {StoryCamera} from '../Components/Story/StoryCamera';
import {StoryCursor} from '../Components/Story/StoryCursor';
import {STORY_LOOKS, StoryLookProvider, type StoryLookName} from '../Components/Story/StoryLook';
import {StoryGround} from '../Components/Story/StoryMaterial';
import {StoryStage} from '../Components/Story/StoryStage';
import {StoryDevice} from '../Components/Story/StoryDevice';
import {StoryPhone} from '../Components/Story/StoryPhone';
import {CompareBars, ExamSheet, NetChart, QuestionCard, StickyNote, TopicList} from '../Components/Story/StoryCard';
import {StoryStudent} from '../Components/Story/StoryStudent';
import {KeyPhrase, NumberPop} from '../Components/Story/StoryType';
import {VideoFrame} from '../Components/Layouts/VideoFrame';

/**
 * The story kit on one sheet (src/Components/Story): every card, the student's poses, the kinetic type and the camera,
 * in short scenes on one of the ready looks (`--props='{"look":"paper"}'`, warm grey by default). Not a template and
 * never published: it is where the kit is looked at and checked (`npx remotion still StoryKit --frame N`), as the
 * UI/UX sheets are for the app's drawings.
 */

const FPS = 30;
const SCENE = 3.5;
const STORY_KIT_COMPOSITION_ID = 'StoryKit';

const Ground: React.FC<{children: React.ReactNode}> = ({children}) => <StoryGround>{children}</StoryGround>;

const Place: React.FC<{x: number; y: number; children: React.ReactNode}> = ({x, y, children}) => <div style={{position: 'absolute', left: x, top: y}}>{children}</div>;

const StoryKitSheet: React.FC<{look: StoryLookName}> = ({look}) => (
	<VideoFrame themeId="SinavikaDark">
		<StoryLookProvider look={STORY_LOOKS[look]}>
		<StoryStage>
		{/* 1. The hook: a key phrase on the voice and the student slumped, then caught by the fact. */}
		<Sequence durationInFrames={SCENE * FPS}>
			<Ground>
				<StoryCamera moves={[{kind: 'punch', at: 0}, {kind: 'shake', at: 2.1}]}>
					<Place x={90} y={300}>
						<KeyPhrase text="Günde 8 saat çalışıp netlerin artmıyorsa" keywords={['8 saat', 'artmıyorsa']} at={0.1} />
					</Place>
					<Place x={320} y={860}>
						<StoryStudent keys={[{at: 0, pose: 'slumped'}, {at: 2.1, pose: 'surprised'}]} size={440} />
					</Place>
				</StoryCamera>
			</Ground>
		</Sequence>
		{/* 2. The problem on paper: a test marked as the voice reads it, a sticky note. */}
		<Sequence from={SCENE * FPS} durationInFrames={SCENE * FPS}>
			<Ground>
				<StoryCamera moves={[{kind: 'punch', at: 0}, {kind: 'flash', at: 1.6}]}>
					<Place x={120} y={360}>
						<ExamSheet
							title="TYT Deneme 4 · Matematik"
							at={0}
							rows={[
								{number: 1, choice: 'B', result: 'right', at: 0.4},
								{number: 2, choice: 'D', result: 'wrong', at: 0.7},
								{number: 3, choice: 'A', result: 'wrong', at: 1},
								{number: 4, choice: '', result: 'blank'},
								{number: 5, choice: 'C', result: 'right', at: 1.3},
							]}
							net={{text: 'Net: 1,5', at: 1.7}}
						/>
					</Place>
					<Place x={560} y={1180}>
						<StickyNote text="Aynı hata, 3. kez!" at={2} />
					</Place>
				</StoryCamera>
			</Ground>
		</Sequence>
		{/* 3. The evidence: nets stuck in place, hours against planned hours. */}
		<Sequence from={SCENE * 2 * FPS} durationInFrames={SCENE * FPS}>
			<Ground>
				<StoryCamera moves={[{kind: 'whipIn', at: 0}, {kind: 'punch', at: 1.8}]}>
					<Place x={160} y={300}>
						<NetChart title="Son 5 deneme" values={[52, 54, 51, 53, 52]} labels={['1', '2', '3', '4', '5']} at={0.1} />
					</Place>
					<Place x={160} y={1000}>
						<CompareBars
							title="Haftalık çalışma"
							at={1.8}
							rows={[
								{label: 'Plansız 8 saat', value: 0.9, text: '+0 net', tone: 'muted'},
								{label: 'Planlı 3 saat', value: 0.42, text: '+6 net'},
							]}
						/>
					</Place>
				</StoryCamera>
			</Ground>
		</Sequence>
		{/* 4. The turn: the gaps circled, a question crossed, the student pleased, a number landing. */}
		<Sequence from={SCENE * 3 * FPS} durationInFrames={SCENE * FPS}>
			<Ground>
				<StoryCamera moves={[{kind: 'punch', at: 0}]}>
					<Place x={90} y={240}>
						<TopicList
							title="Eksik konular"
							at={0}
							items={[
								{text: 'Problemler', ok: true},
								{text: 'Fonksiyonlar', ok: false, at: 0.5},
								{text: 'Olasılık', ok: false, at: 0.8},
								{text: 'Üslü sayılar', ok: true},
							]}
						/>
					</Place>
					<Place x={790} y={700}>
						<NumberPop to={6} from={0} at={1.4} suffix="net" size={150} />
					</Place>
					<Place x={130} y={900}>
						<QuestionCard label="Bu soruyu çözdüm" stem="f(x) = 2x + 3 ise f(4) kaçtır?" options={['8', '9', '10', '11', '12']} mark={{option: 3, kind: 'right', at: 1.6}} at={0.9} width={560} />
					</Place>
					<Place x={680} y={1150}>
						<StoryStudent keys={[{at: 0, pose: 'phone'}, {at: 2, pose: 'happy'}]} size={330} />
					</Place>
				</StoryCamera>
			</Ground>
		</Sequence>
		{/* 5. The product on every device it runs on: the tablet with the pen, both watches, the phone. */}
		<Sequence from={SCENE * 4 * FPS} durationInFrames={SCENE * FPS}>
			<Ground>
				<StoryCamera moves={[{kind: 'punch', at: 0}, {kind: 'whipOut', at: SCENE - 0.25}]}>
					<Place x={60} y={260}>
						<StoryDevice id="t-deneme-coz-isaretleme" width={960} />
					</Place>
					<Place x={90} y={1060}>
						<StoryDevice id="k-apple-plan" width={250} />
					</Place>
					<Place x={420} y={1080}>
						<StoryDevice id="k-wear-odak" width={250} />
					</Place>
					<Place x={740} y={1020}>
						<StoryDevice id="m-hub-moduller" width={250} rotate={4} />
					</Place>
				</StoryCamera>
			</Ground>
		</Sequence>
		{/* 6. The phone in the hand: the thumb hovers over a feed, thinks again, taps Sınavika; it opens on the plan and slides to a solution. */}
		<Sequence from={SCENE * 5 * FPS} durationInFrames={SCENE * FPS}>
			<Ground>
				<StoryCamera moves={[{kind: 'punch', at: 0}]}>
					<Place x={120} y={260}>
						<StoryPhone
							width={520}
							touches={[
								{at: 0.7, app: 'akis', kind: 'hover'},
								{at: 1.7, app: 'sinavika', kind: 'tap'},
							]}
							screens={[
								{id: 'm-plan-bugun', at: 1.75},
								{id: 'm-ozet-sonuc', at: 2.8},
							]}
						/>
					</Place>
					<Place x={720} y={700}>
						<StoryDevice
							screens={[
								{id: 'k-apple-bugun', at: 0},
								{id: 'k-apple-plan', at: 2.3},
							]}
							width={260}
						/>
					</Place>
				</StoryCamera>
			</Ground>
		</Sequence>
		{/* 7. UI states: a tablet page morphs into the next on a spring while the pointer clicks through it; a chip-coloured key phrase. */}
		<Sequence from={SCENE * 6 * FPS} durationInFrames={SCENE * FPS}>
			<Ground>
				<StoryCamera moves={[{kind: 'punch', at: 0}]}>
					<Place x={90} y={220}>
						<KeyPhrase text="Bir dokunuşta planın hazır" keywords={['planın']} at={0.1} />
					</Place>
					<Place x={60} y={620}>
						<StoryDevice
							screens={[
								{id: 't-deneme-coz-isaretleme', at: 0},
								{id: 't-plan-bugun', at: 1.6},
							]}
							width={960}
							transition="morph"
						/>
					</Place>
					<Place x={300} y={1500}>
						<StoryCursor
							clicks={[
								{x: 260, y: -560, at: 1.4},
								{x: 420, y: -380, at: 2.5},
							]}
						/>
					</Place>
				</StoryCamera>
			</Ground>
		</Sequence>
		</StoryStage>
		</StoryLookProvider>
	</VideoFrame>
);

export const StoryKitComposition: React.FC = () => (
	<Folder name="StoryKit">
		<Composition id={STORY_KIT_COMPOSITION_ID} component={StoryKitSheet} defaultProps={{look: 'warmGrey' as StoryLookName}} durationInFrames={SCENE * 7 * FPS} fps={FPS} width={1080} height={1920} />
	</Folder>
);
