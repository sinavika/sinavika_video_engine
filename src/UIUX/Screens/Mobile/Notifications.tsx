import React from 'react';
import {useColors, useT, useUI} from '../../Context';
import {Icon, type UIIconName} from '../../Icons';
import {AppHeader, Content, Phone, SectionTitle} from '../../Parts/Mobile';
import {Card, List, ListRow, Stack, Text, Toggle} from '../../Parts/Shared';
import {AndroidCard, AndroidShade, AppIcon, IslandCompact, IslandExpanded, IslandMinimal, LiveActivity, LockScreen, ModuleThumb, Notice, ProgressSegments, Specimen, SysRing, useMaterial, useModule, useModuleText, useShade} from '../../Parts/System';
import {alpha, moduleAction, MODULES} from '../../ModuleIdentity';

/**
 * Notifications, Live Activities, the Dynamic Island, Android 16 Live Updates
 * and widgets (15 Nov 2026). Patterns taken from the best study apps (a live
 * countdown on the lock screen, the lesson in the Dynamic Island, an evening
 * streak reminder, rich notifications with a picture) in Sınavika's own
 * calm voice: a Live Activity only for something with a real clock (a live
 * exam, a focus session, the end of the day), never fake urgency.
 */

const White: React.FC<{size: number; weight?: number; children: React.ReactNode; color?: string}> = ({size, weight = 700, children, color = '#FFFFFF'}) => (
	<Text role="headline" size={size} weight={weight} color={color} tnum>
		{children}
	</Text>
);

/* ------------------------------------------------------------------ live exam countdown */

export const LockLiveExamScreen: React.FC = () => {
	const t = useT();
	const m = useMaterial();
	const exam = useModule('exam');
	return (
		<LockScreen>
			<LiveActivity>
				<Stack gap={10}>
					<Stack row justify="space-between">
						<Stack row gap={8}>
							<Icon name="exam" size={18} color={exam} stroke={2.2} />
							<Text role="headline" size={14} color={m.ink}>
								{t('TYT Deneme 5 · Türkiye geneli', 'SAT Practice Test 5 · nationwide')}
							</Text>
						</Stack>
						<Text role="meta" size={12} color={exam}>
							{t('CANLI', 'LIVE')}
						</Text>
					</Stack>
					<Stack row justify="space-between" align="flex-end">
						<Stack gap={0}>
							<div style={{fontSize: 40, fontWeight: 800, lineHeight: 1, color: m.ink, fontVariantNumeric: 'tabular-nums'}}>14:32</div>
							<Text role="small" size={13} color={m.muted}>
								{t('sonra başlıyor · 12.480 kişi hazır', 'until start · 12,480 ready')}
							</Text>
						</Stack>
						<div style={{height: 38, padding: '0 18px', borderRadius: 19, background: moduleAction('exam'), display: 'flex', alignItems: 'center'}}>
							<White size={15}>{t('Hazırım', "I'm ready")}</White>
						</div>
					</Stack>
					<div style={{height: 6, borderRadius: 3, background: m.line, overflow: 'hidden'}}>
						<div style={{width: '76%', height: '100%', background: exam}} />
					</div>
				</Stack>
			</LiveActivity>
			<Notice time={t('şimdi', 'now')} title={t('Ders Planı', 'Study plan')} body={t('Bugün 3 görev, 90 dakika. Sıradaki: Problemler · 20 soru.', 'Today 3 tasks, 90 minutes. Next: Problems · 20 questions.')} thumb={<ModuleThumb module="studyPlan" size={44} />} />
		</LockScreen>
	);
};

/* ------------------------------------------------------------------ focus session */

export const LockFocusScreen: React.FC = () => {
	const t = useT();
	const m = useMaterial();
	const tests = useModule('tests');
	return (
		<LockScreen>
			<LiveActivity>
				<Stack row gap={14}>
					<SysRing value={0.25} size={86} stroke={8} color={tests}>
						<Stack gap={0} align="center">
							<div style={{fontSize: 22, fontWeight: 800, color: m.ink, fontVariantNumeric: 'tabular-nums'}}>18:42</div>
							<Text role="meta" size={12} color={m.muted}>
								{t('kaldı', 'left')}
							</Text>
						</Stack>
					</SysRing>
					<Stack grow gap={6}>
						<Stack row gap={8}>
							<Icon name="focus" size={16} color={tests} stroke={2.2} />
							<Text role="meta" size={12} color={m.muted}>
								{t('ODAK · 25 DK', 'FOCUS · 25 MIN')}
							</Text>
						</Stack>
						<Text role="headline" size={17} color={m.ink}>
							{t('Problemler · Orta', 'Problems · Medium')}
						</Text>
						<Text role="small" size={13} color={m.muted}>
							{t('8 / 20 soru · bugün 2 / 5 görev', '8 / 20 questions · today 2 / 5 tasks')}
						</Text>
						<Stack row gap={8} style={{marginTop: 2}}>
							<div style={{width: 128, height: 34, borderRadius: 17, background: m.button, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6}}>
								<Icon name="pause" size={15} color={m.ink} stroke={2.4} />
								<Text role="headline" size={14} color={m.ink}>
									{t('Duraklat', 'Pause')}
								</Text>
							</div>
						</Stack>
					</Stack>
				</Stack>
			</LiveActivity>
		</LockScreen>
	);
};

/* ------------------------------------------------------------------ Dynamic Island sheet */

export const IslandSheetScreen: React.FC = () => {
	const t = useT();
	const tests = useModule('tests');
	const exam = useModule('exam');
	const lessons = useModule('lessons');
	return (
		<LockScreen
			clock={false}
			overlay={
				<>
					<div style={{position: 'absolute', top: 70, left: 0, right: 0}}>
						<Stack gap={26} align="center">
							<Specimen label={t('Kompakt · odak oturumu', 'Compact · focus session')} note={t('Solda halka, sağda kalan süre. Uygulama kapalıyken de görünür.', 'Ring on the left, time left on the right. Visible with the app closed.')}>
								<IslandCompact
									leading={<SysRing value={0.25} size={22} stroke={3.5} color={tests} />}
									trailing={
										<White size={14} color={tests}>
											18:42
										</White>
									}
								/>
							</Specimen>
							<Specimen label={t('Minimal · iki etkinlik', 'Minimal · two activities')} note={t('Odak ve canlı deneme aynı anda: önemli olan büyük kalır.', 'Focus and a live exam at once: the important one stays large.')}>
								<IslandMinimal
									main={
										<Stack row justify="space-between" style={{width: '100%'}}>
											<SysRing value={0.25} size={22} stroke={3.5} color={tests} />
											<White size={14} color={tests}>
												18:42
											</White>
										</Stack>
									}
									second={<Icon name="exam" size={18} color={exam} stroke={2.2} />}
								/>
							</Specimen>
							<Specimen label={t('Genişletilmiş · denemede', 'Expanded · during an exam')} note={t('Uzun basınca: soru, kalan süre ve boşlar. Denemeye bir dokunuşla dönülür.', 'Long press: question, time left and blanks. One tap returns to the exam.')}>
								<IslandExpanded>
									<Stack gap={10}>
										<Stack row justify="space-between">
											<Stack row gap={8}>
												<Icon name="exam" size={20} color={exam} stroke={2.2} />
												<White size={15}>{t('TYT Deneme 5', 'SAT Practice Test 5')}</White>
											</Stack>
											<White size={22} color={exam}>
												1:42:18
											</White>
										</Stack>
										<Stack row justify="space-between">
											<White size={13} weight={600} color="rgba(255,255,255,0.7)">
												{t('Soru 34 / 120 · 12 boş', 'Question 34 / 120 · 12 blank')}
											</White>
											<White size={13} weight={600} color="rgba(255,255,255,0.7)">
												{t('kaldı', 'left')}
											</White>
										</Stack>
										<div style={{height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.18)', overflow: 'hidden'}}>
											<div style={{width: '28%', height: '100%', background: exam}} />
										</div>
									</Stack>
								</IslandExpanded>
							</Specimen>
							<Specimen label={t('Genişletilmiş · konu', 'Expanded · topic')} note={t('Adım ilerlemesi ve kaldığın yer; bitince “Tamamlandı” ile kapanır.', 'Step progress and where you are; closes with “Done” at the end.')}>
								<IslandExpanded>
									<Stack row gap={12}>
										<SysRing value={0.13} size={46} stroke={5} color={lessons}>
											<White size={13}>4/30</White>
										</SysRing>
										<Stack grow gap={2}>
											<White size={15}>{t('Sözcükte Anlam', 'Word meaning')}</White>
											<White size={13} weight={600} color="rgba(255,255,255,0.7)">
												{t('Türkçe · 29 dk kaldı', 'Reading & Writing · 29 min left')}
											</White>
										</Stack>
										<div style={{height: 34, padding: '0 14px', borderRadius: 17, background: moduleAction('lessons'), display: 'flex', alignItems: 'center'}}>
											<White size={14}>{t('Devam', 'Resume')}</White>
										</div>
									</Stack>
								</IslandExpanded>
							</Specimen>
						</Stack>
					</div>
				</>
			}
		/>
	);
};

/* ------------------------------------------------------------------ evening streak */

export const LockStreakScreen: React.FC = () => {
	const t = useT();
	const m = useMaterial();
	return (
		<LockScreen>
			<LiveActivity>
				<Stack gap={10}>
					<Stack row gap={12}>
						<div style={{width: 46, height: 46, borderRadius: 23, background: 'rgba(245, 158, 11, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							<Icon name="flame" size={26} color="#F59E0B" stroke={2.2} />
						</div>
						<Stack grow gap={1}>
							<Text role="headline" size={16} color={m.ink}>
								{t('Serin 5 gün', 'Your streak: 5 days')}
							</Text>
							<Text role="small" size={13} color={m.muted}>
								{t('Bugünün 10 dakikası kaldı · gün 23:59’da biter', "Today's 10 minutes left · the day ends at 23:59")}
							</Text>
						</Stack>
					</Stack>
					<Stack row gap={6}>
						{[1, 1, 1, 1, 1, 0, 0].map((on, index) => (
							<div key={index} style={{flex: 1, height: 8, borderRadius: 4, background: index === 5 ? 'rgba(245, 158, 11, 0.45)' : on ? '#F59E0B' : m.line}} />
						))}
					</Stack>
					<Stack row gap={8}>
						<div style={{flex: 1, height: 36, borderRadius: 18, background: moduleAction('flashcards'), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6}}>
							<Icon name="cards" size={16} color="#FFFFFF" stroke={2.2} />
							<Text role="headline" size={14} color="#FFFFFF">
								{t('12 kart · 5 dk', '12 cards · 5 min')}
							</Text>
						</div>
					</Stack>
				</Stack>
			</LiveActivity>
			<Notice stacked={2} time={t('2 sa önce', '2h ago')} title={t('Deneme sonucun hazır', 'Your exam result is ready')} body={t('TYT Deneme 5: 78,5 net. 2 bildirim daha var.', 'SAT Practice Test 5: 78.5 nets. 2 more notifications.')} />
		</LockScreen>
	);
};

/* ------------------------------------------------------------------ rich notifications */

/** Net bars as a notification picture. */
const MiniBars: React.FC<{values: number[]; color: string; height?: number}> = ({values, color, height = 34}) => (
	<Stack row gap={3} align="flex-end" style={{height}}>
		{values.map((value, index) => (
			<div key={index} style={{width: 7, height: Math.max(4, value * height), borderRadius: 2, background: color, opacity: index === values.length - 1 ? 1 : 0.55}} />
		))}
	</Stack>
);

export const RichNotificationsScreen: React.FC = () => {
	const t = useT();
	const exam = useModule('exam');
	return (
		<LockScreen>
			<Notice
				time={t('şimdi', 'now')}
				title={t('Deneme sonucun hazır', 'Your exam result is ready')}
				body={t('TYT Deneme 5: 78,5 net, geçen denemeden +6,5. En çok Geometri’de kazandın.', 'SAT Practice Test 5: 78.5 nets, +6.5 on last time. Your biggest gain: Geometry.')}
				thumb={
					<div style={{width: 52, height: 52, borderRadius: 13, background: alpha(MODULES.exam.color.light, 0.14), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<MiniBars values={[0.55, 0.64, 0.72, 0.84]} color={exam} />
					</div>
				}
			/>
			<Notice time={t('12 dk', '12m')} title={t('Testin hazır', 'Your test is ready')} body={t('SinoAI, Problemler için 20 soruluk testini hazırladı.', 'SinoAI made your 20-question Problems test.')} thumb={<ModuleThumb module="sinoAi" size={52} />} />
			<Notice time={t('1 sa', '1h')} title={t('12 kart tekrar zamanı', '12 cards due')} body={t('Kimya · Mol. Aklında kalsın diye bugün tekrar et.', 'Chemistry · Mole. Review today so it sticks.')} thumb={<ModuleThumb module="flashcards" size={52} />} />
			<Notice time={t('dün', 'yesterday')} title={t('Planına eklendi', 'Added to your plan')} body={t('Yarın 10:00 · Paragraf, 20 soru. Denemende net kaybettiğin konu.', 'Tomorrow 10:00 · Reading, 20 questions. Where your exam lost nets.')} thumb={<ModuleThumb module="studyPlan" size={52} />} />
		</LockScreen>
	);
};

/** Long press on the result notification: the picture opens with actions. */
export const ExpandedNotificationScreen: React.FC = () => {
	const t = useT();
	const m = useMaterial();
	const exam = useModule('exam');
	const {mode} = useUI();
	const lessons: [string, number, number][] = [
		[t('Türkçe', 'Reading & Writing'), 31.25, 2.5],
		[t('Matematik', 'Maths'), 24.5, 3],
		[t('Fen', 'Science'), 12.75, 1.25],
		[t('Sosyal', 'Social'), 10, -0.25],
	];
	return (
		<LockScreen
			clock={false}
			overlay={
				<>
					<div style={{position: 'absolute', inset: 0, background: mode === 'dark' ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.35)', backdropFilter: 'blur(14px)'}} />
					<Stack gap={10} style={{position: 'absolute', top: 120, left: 12, right: 12}}>
						<div style={{borderRadius: 26, background: m.bg, overflow: 'hidden'}}>
							<Stack gap={12} style={{padding: 16, background: alpha(MODULES.exam.color.light, mode === 'dark' ? 0.16 : 0.08)}}>
								<Stack row justify="space-between" align="flex-end">
									<Stack gap={0}>
										<Text role="meta" size={12} color={exam}>
											{t('TYT DENEME 5', 'TYT EXAM 5')}
										</Text>
										<div style={{fontSize: 38, fontWeight: 800, color: m.ink, lineHeight: 1.1}}>{t('78,5 net', '78.5 nets')}</div>
									</Stack>
									<div style={{padding: '4px 10px', borderRadius: 12, background: 'rgba(5, 150, 105, 0.16)'}}>
										<Text role="headline" size={14} color="#059669">
											+6,5
										</Text>
									</div>
								</Stack>
								<Stack gap={8}>
									{lessons.map(([name, net, delta]) => (
										<Stack key={name} row gap={10}>
											<Text role="small" size={13} color={m.ink} style={{width: 78}}>
												{name}
											</Text>
											<div style={{flex: 1, height: 10, borderRadius: 5, background: m.line, overflow: 'hidden'}}>
												<div style={{width: `${(net / 40) * 100}%`, height: '100%', background: exam}} />
											</div>
											<Text role="headline" size={13} color={delta >= 0 ? '#059669' : '#DC2626'} style={{width: 44, textAlign: 'right'}}>
												{delta >= 0 ? '+' : ''}
												{String(delta).replace('.', ',')}
											</Text>
										</Stack>
									))}
								</Stack>
							</Stack>
							<Stack row gap={11} style={{padding: '12px 16px 14px'}}>
								<AppIcon size={32} />
								<Stack grow gap={0}>
									<Text role="headline" size={15} color={m.ink}>
										{t('Deneme sonucun hazır', 'Your exam result is ready')}
									</Text>
									<Text role="small" size={13} color={m.muted}>
										{t('En çok Geometri’de kazandın; Sosyal biraz düştü.', 'Geometry gained most; Social dipped a little.')}
									</Text>
								</Stack>
							</Stack>
						</div>
						<div style={{borderRadius: 18, background: m.bg, overflow: 'hidden'}}>
							{[t('Yanlışlarımı çalış', 'Study my mistakes'), t('Sosyal’i planıma ekle', 'Add Social to my plan')].map((label, index) => (
								<Stack key={label} row justify="space-between" style={{padding: '14px 16px', borderTop: index ? `1px solid ${m.line}` : undefined}}>
									<Text role="headline" size={16} color={m.ink}>
										{label}
									</Text>
									<Icon name={(['refresh', 'calendar'] as UIIconName[])[index]} size={19} color={m.ink} />
								</Stack>
							))}
						</div>
					</Stack>
				</>
			}
		/>
	);
};

/* ------------------------------------------------------------------ Android 16 */

export const AndroidLiveUpdateScreen: React.FC = () => {
	const t = useT();
	const s = useShade();
	const tests = useModule('tests');
	const exam = useModule('exam');
	const cards = useModule('flashcards');
	return (
		<AndroidShade
			chip={
				<div style={{height: 24, padding: '0 10px', borderRadius: 12, background: moduleAction('tests'), display: 'flex', alignItems: 'center', gap: 5}}>
					<Icon name="clock" size={13} color="#FFFFFF" stroke={2.4} />
					<Text role="headline" size={12.5} color="#FFFFFF" tnum>
						18:42
					</Text>
				</div>
			}
		>
			<div style={{background: s.card, borderRadius: 24, padding: '14px 16px', marginBottom: 8}}>
				<Stack row gap={12}>
					<div style={{width: 36, height: 36, borderRadius: 18, background: tests, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<Icon name="focus" size={19} color="#FFFFFF" stroke={2.1} />
					</div>
					<Stack grow gap={1}>
						<Text role="meta" size={12} color={s.muted}>
							{t('Sınavika · Odak · canlı', 'Sınavika · Focus · live')}
						</Text>
						<Text role="headline" size={16} color={s.ink}>
							{t('Problemler · 18 dk kaldı', 'Problems · 18 min left')}
						</Text>
					</Stack>
					<Text role="headline" size={20} color={tests} tnum>
						8/20
					</Text>
				</Stack>
				<div style={{marginTop: 14}}>
					<ProgressSegments segments={5} done={2} within={0.4} color={tests} />
					<Stack row justify="space-between" style={{marginTop: 6}}>
						<Text role="meta" size={12} color={s.muted}>
							{t('Bugünün görevleri', "Today's tasks")}
						</Text>
						<Text role="meta" size={12} color={s.muted}>
							{t('3. görev', 'task 3')}
						</Text>
					</Stack>
				</div>
				<Stack row gap={8} style={{marginTop: 12}}>
					{[t('Duraklat', 'Pause'), t('Bitir', 'End')].map((label) => (
						<div key={label} style={{height: 34, padding: '0 18px', borderRadius: 17, background: s.chip, display: 'flex', alignItems: 'center'}}>
							<Text role="headline" size={14} color={s.ink}>
								{label}
							</Text>
						</div>
					))}
				</Stack>
			</div>
			<AndroidCard first icon="exam" color={exam} app="Sınavika" time={t('şimdi', 'now')} title={t('Deneme sonucun hazır', 'Your exam result is ready')} body={t('TYT Deneme 5: 78,5 net, +6,5.', 'SAT Practice Test 5: 78.5 nets, +6.5.')}>
				<div style={{height: 92, borderRadius: 16, background: alpha(MODULES.exam.color.light, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<MiniBars values={[0.48, 0.58, 0.66, 0.74, 0.86]} color={exam} height={60} />
				</div>
			</AndroidCard>
			<AndroidCard last icon="cards" color={cards} app="Sınavika" time={t('1 sa', '1h')} title={t('12 kart tekrar zamanı', '12 cards due')} body={t('Kimya · Mol', 'Chemistry · Mole')} actions={[t('Başla', 'Start'), t('Akşam hatırlat', 'Remind tonight')]} />
		</AndroidShade>
	);
};

/* ------------------------------------------------------------------ widgets */

export const LockWidgetsScreen: React.FC = () => {
	const t = useT();
	const {mode} = useUI();
	const ink = mode === 'dark' ? '#FFFFFF' : '#0B1C30';
	const glass = mode === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.45)';
	return (
		<LockScreen
			widgets={
				<Stack row gap={10} justify="center" style={{marginTop: 14}}>
					<div style={{width: 68, height: 68, borderRadius: 34, background: glass, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<SysRing value={0.5} size={58} stroke={5} color={ink} track="rgba(127,127,140,0.3)">
							<Stack gap={0} align="center">
								<Text role="headline" size={15} color={ink} tnum>
									45
								</Text>
								<Text role="meta" size={12} color={ink}>
									{t('dk', 'min')}
								</Text>
							</Stack>
						</SysRing>
					</div>
					<div style={{width: 158, height: 68, borderRadius: 18, background: glass, padding: '8px 12px', boxSizing: 'border-box'}}>
						<Text role="meta" size={12} color={ink} style={{opacity: 0.75}}>
							{t('SIRADAKİ', 'NEXT')}
						</Text>
						<Text role="headline" size={15} color={ink}>
							{t('Problemler', 'Problems')}
						</Text>
						<Text role="meta" size={12} color={ink} style={{opacity: 0.75}}>
							{t('20 soru · 25 dk', '20 questions · 25 min')}
						</Text>
					</div>
					<div style={{width: 68, height: 68, borderRadius: 34, background: glass, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
						<Icon name="flame" size={20} color={ink} stroke={2.2} />
						<Text role="headline" size={15} color={ink}>
							5
						</Text>
					</div>
				</Stack>
			}
		>
			<Notice time="08:30" title={t('Günaydın, plan hazır', 'Morning, your plan is ready')} body={t('Bugün 3 görev, 90 dakika. İlk görev 25 dakika.', 'Today 3 tasks, 90 minutes. The first takes 25 minutes.')} />
		</LockScreen>
	);
};

export const HomeWidgetsScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const plan = useModule('studyPlan');
	const examText = useModuleText('exam');
	const tasks: [string, string, boolean][] = [
		[t('Sözcükte Anlam', 'Word meaning'), t('Dersler · 4 dk', 'Lessons · 4 min'), true],
		[t('Problemler · Orta', 'Problems · Medium'), t('Testler · 20 soru', 'Tests · 20 questions'), false],
		[t('12 kart', '12 cards'), t('Bilgi Kartları · 5 dk', 'Flashcards · 5 min'), false],
	];
	const tile: React.CSSProperties = {background: colors.card, borderRadius: 24, padding: 16, boxSizing: 'border-box', boxShadow: '0 12px 30px -18px rgba(0,0,0,0.5)'};
	return (
		<LockScreen
			clock={false}
			overlay={
				<>
					<Stack gap={14} style={{position: 'absolute', top: 70, left: 22, right: 22}}>
						<Stack row gap={14}>
							<div style={{...tile, width: 163, height: 163}}>
								<Stack gap={8}>
									<Stack row justify="space-between">
										<AppIcon size={22} />
										<Stack row gap={3}>
											<Icon name="flame" size={14} color="#F59E0B" stroke={2.4} />
											<Text role="meta" size={12} color={colors.ink}>
												5
											</Text>
										</Stack>
									</Stack>
									<SysRing value={0.5} size={74} stroke={8} color={plan} track={colors.line}>
										<Text role="headline" size={15} color={colors.ink} tnum>
											45/90
										</Text>
									</SysRing>
									<Text role="meta" size={12} color={colors.muted}>
										{t('Bugün · 2 / 5 görev', 'Today · 2 / 5 tasks')}
									</Text>
								</Stack>
							</div>
							<div style={{...tile, width: 163, height: 163}}>
								<Stack gap={6}>
									<Text role="meta" size={12} color={examText}>
										{t('SIRADAKİ DENEME', 'NEXT EXAM')}
									</Text>
									<Text role="headline" size={16} color={colors.ink}>
										{t('TYT Deneme 5', 'SAT Practice Test 5')}
									</Text>
									<div style={{fontSize: 30, fontWeight: 800, color: colors.ink, lineHeight: 1.1}}>{t('2 gün', '2 days')}</div>
									<Text role="meta" size={12} color={colors.muted}>
										{t('Cumartesi 10:00 · canlı', 'Saturday 10:00 · live')}
									</Text>
								</Stack>
							</div>
						</Stack>
						<div style={{...tile, height: 163}}>
							<Stack gap={8}>
								<Stack row justify="space-between">
									<Text role="headline" size={15} color={colors.ink}>
										{t('Bugünün planı', "Today's plan")}
									</Text>
									<Text role="meta" size={12} color={plan}>
										45 / 90 {t('dk', 'min')}
									</Text>
								</Stack>
								{tasks.map(([title, sub, done]) => (
									<Stack key={title} row gap={10}>
										<div style={{width: 22, height: 22, borderRadius: 11, border: done ? 'none' : `2px solid ${colors.line}`, background: done ? plan : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box'}}>{done ? <Icon name="check" size={13} color="#FFFFFF" stroke={3} /> : null}</div>
										<Stack grow gap={0}>
											<Text role="headline" size={14} color={done ? colors.muted : colors.ink} style={{textDecoration: done ? 'line-through' : undefined}}>
												{title}
											</Text>
											<Text role="meta" size={12} color={colors.muted}>
												{sub}
											</Text>
										</Stack>
									</Stack>
								))}
							</Stack>
						</div>
						<Text role="meta" size={12} color={colors.muted} align="center">
							{t('Görev yuvarlağına dokununca görev tamamlanır; uygulama açılmaz.', 'Tap a task circle to finish it without opening the app.')}
						</Text>
					</Stack>
				</>
			}
		/>
	);
};

/* ------------------------------------------------------------------ settings */

export const NotificationSettingsScreen: React.FC = () => {
	const t = useT();
	const colors = useColors();
	const row = (icon: UIIconName, title: string, subtitle: string, on: boolean) => <ListRow icon={icon} plainIcon title={title} subtitle={subtitle} trailing={<Toggle on={on} />} />;
	return (
		<Phone>
			<AppHeader left="back" title={t('Bildirimler', 'Notifications')} />
			<Content tabBar={false} gap={12}>
				<Card tone="soft" padding={14}>
					<Stack row gap={10}>
						<Icon name="info" size={18} color={colors.ink2} />
						<Text role="small">{t('Günde en çok 2 hatırlatma gönderiyoruz; 22:00–08:00 arası sessiz.', 'We send at most 2 reminders a day; quiet from 22:00 to 08:00.')}</Text>
					</Stack>
				</Card>
				<SectionTitle title={t('Canlı etkinlikler', 'Live Activities')} />
				<List>
					{row('exam', t('Canlı deneme başlangıcı', 'Live exam start'), t('Kilit ekranında geri sayım, 15 dk önce', 'Lock screen countdown, 15 min before'), true)}
					{row('focus', t('Odak oturumu', 'Focus session'), t('Kalan süre ve Duraklat / Bitir', 'Time left and Pause / End'), true)}
					{row('flame', t('Akşam seri hatırlatması', 'Evening streak reminder'), t('Yalnız bugün çalışmadıysan, 20:00’de', 'Only if you have not studied today, at 20:00'), true)}
				</List>
				<SectionTitle title={t('Hatırlatmalar', 'Reminders')} />
				<List>
					{row('calendar', t('Günün planı', "Today's plan"), '08:30', true)}
					{row('cards', t('Kart tekrarı', 'Card review'), t('Tekrar zamanı gelince', 'When cards are due'), true)}
					{row('chart', t('Deneme sonucu', 'Exam result'), t('Sonuç hazır olunca', 'When the result is ready'), true)}
					{row('sparkles', t('SinoAI üretimleri', 'SinoAI results'), t('Test ya da özet hazır olunca', 'When a test or summary is ready'), false)}
				</List>
				<SectionTitle title={t('Saat', 'Watch')} />
				<List>
					<ListRow icon="clock" plainIcon title="Apple Watch" subtitle={t('Bağlı · plan, odak ve kartlar', 'Connected · plan, focus and cards')} />
				</List>
			</Content>
		</Phone>
	);
};

/* ------------------------------------------------------------------ Android home screen widgets */

/** Android home screen widgets (Material You, Glance): 2×2 today ring, 4×2 interactive plan, 2×1 next exam. Colours follow the wallpaper's tones. */
export const AndroidWidgetsScreen: React.FC = () => {
	const t = useT();
	const {mode} = useUI();
	const plan = useModule('studyPlan');
	const exam = useModule('exam');
	const dark = mode === 'dark';
	const surface = dark ? '#2A211C' : '#FFF1E8';
	const ink = dark ? '#F6E7DE' : '#2B1A10';
	const muted = dark ? '#CBB8AC' : '#6E5547';
	const container = dark ? '#4A3427' : '#FFDCC7';
	const wallpaper = dark ? 'linear-gradient(170deg, #3B2A22 0%, #17110E 60%, #0C0907 100%)' : 'linear-gradient(170deg, #FFD9C0 0%, #F7B98F 45%, #C9A28A 100%)';
	const widget: React.CSSProperties = {background: surface, borderRadius: 28, padding: 16, boxSizing: 'border-box'};
	const tasks: [string, string, boolean][] = [
		[t('Sözcükte Anlam', 'Word meaning'), t('Dersler · 4 dk', 'Lessons · 4 min'), true],
		[t('Problemler · Orta', 'Problems · Medium'), t('Testler · 20 soru', 'Tests · 20 questions'), false],
		[t('12 kart', '12 cards'), t('Bilgi Kartları · 5 dk', 'Flashcards · 5 min'), false],
	];
	return (
		<div style={{position: 'relative', width: 390, height: 844, overflow: 'hidden', background: wallpaper}}>
			<Stack row justify="space-between" style={{height: 44, padding: '12px 22px 0', boxSizing: 'border-box'}}>
				<Text role="headline" size={15} color={ink}>
					9:41
				</Text>
				<div style={{width: 14, height: 14, borderRadius: 7, background: '#000', position: 'absolute', left: '50%', marginLeft: -7, top: 14}} />
				<Stack row gap={6}>
					<Icon name="wifi" size={16} color={ink} />
					<Icon name="battery" size={19} color={ink} />
				</Stack>
			</Stack>
			<Stack gap={14} style={{padding: '20px 18px 0'}}>
				<Stack row gap={14}>
					<div style={{...widget, width: 168, height: 168}}>
						<Stack gap={6} align="center">
							<Stack row justify="space-between" style={{width: '100%'}}>
								<AppIcon size={24} />
								<Stack row gap={3}>
									<Icon name="flame" size={14} color="#F59E0B" stroke={2.4} />
									<Text role="meta" size={12} color={ink}>
										5
									</Text>
								</Stack>
							</Stack>
							<SysRing value={0.5} size={86} stroke={10} color={plan} track={container}>
								<Stack gap={0} align="center">
									<Text role="headline" size={18} color={ink} tnum>
										45
									</Text>
									<Text role="meta" size={12} color={muted}>
										/ 90 {t('dk', 'min')}
									</Text>
								</Stack>
							</SysRing>
							<Text role="meta" size={12} color={muted}>
								{t('2 / 5 görev', '2 / 5 tasks')}
							</Text>
						</Stack>
					</div>
					<Stack gap={14} style={{flex: 1}}>
						<div style={{...widget, height: 77, padding: '10px 14px', background: container}}>
							<Text role="meta" size={12} color={dark ? exam : '#9A3412'}>
								{t('SIRADAKİ DENEME', 'NEXT EXAM')}
							</Text>
							<Text role="headline" size={14} color={ink}>
								{t('TYT Deneme 5 · 2 gün', 'SAT Practice Test 5 · 2 days')}
							</Text>
							<Text role="meta" size={12} color={muted}>
								{t('Cumartesi 10:00 · canlı', 'Saturday 10:00 · live')}
							</Text>
						</div>
						<div style={{...widget, height: 77, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px'}}>
							<div style={{width: 48, height: 48, borderRadius: 24, background: plan, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
								<Icon name="play" size={20} color="#FFFFFF" stroke={2.6} />
							</div>
							<Stack gap={0}>
								<Text role="headline" size={14} color={ink}>
									{t('Odak başlat', 'Start focus')}
								</Text>
								<Text role="meta" size={12} color={muted}>
									25 {t('dk', 'min')}
								</Text>
							</Stack>
						</div>
					</Stack>
				</Stack>
				<div style={widget}>
					<Stack gap={9}>
						<Stack row justify="space-between">
							<Text role="headline" size={16} color={ink}>
								{t('Bugünün planı', "Today's plan")}
							</Text>
							<div style={{padding: '4px 10px', borderRadius: 12, background: container}}>
								<Text role="meta" size={12} color={ink}>
									45 / 90 {t('dk', 'min')}
								</Text>
							</div>
						</Stack>
						{tasks.map(([title, sub, done]) => (
							<Stack key={title} row gap={12} style={{background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)', borderRadius: 16, padding: '7px 10px'}}>
								<div style={{width: 24, height: 24, borderRadius: 6, border: done ? 'none' : `2px solid ${muted}`, background: done ? plan : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box'}}>{done ? <Icon name="check" size={14} color="#FFFFFF" stroke={3} /> : null}</div>
								<Stack grow gap={0}>
									<Text role="headline" size={14} color={done ? muted : ink} style={{textDecoration: done ? 'line-through' : undefined}}>
										{title}
									</Text>
									<Text role="meta" size={12} color={muted}>
										{sub}
									</Text>
								</Stack>
							</Stack>
						))}
					</Stack>
				</div>
				<Text role="meta" size={12} color={ink} align="center" style={{opacity: 0.8}}>
					{t('Widget’lar büyütülüp küçültülebilir; renkler duvar kâğıdından gelir.', 'Widgets resize; colours come from the wallpaper.')}
				</Text>
			</Stack>
			<div style={{position: 'absolute', left: 18, right: 18, bottom: 34, height: 54, borderRadius: 27, background: surface, display: 'flex', alignItems: 'center', padding: '0 18px', gap: 12}}>
				<Icon name="search" size={20} color={muted} />
				<Text role="small" size={15} color={muted}>
					{t('Ara', 'Search')}
				</Text>
			</div>
		</div>
	);
};
