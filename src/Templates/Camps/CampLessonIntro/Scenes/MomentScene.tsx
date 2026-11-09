import React from 'react';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import {ThemeBackground} from '../../../../Components/Layouts/ThemeBackground';
import {useVideoLayout} from '../../../../Components/Layouts/VideoLayout';
import {MuteSoundEffects} from '../../../../Components/Sounds/SoundEffect';
import {Text} from '../../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../../Configurations/BrandTypography';
import type {Theme} from '../../../../Themes/Theme';
import {ThemeProvider} from '../../../../Themes/ThemeContext';
import {Box, C, Kicker, Rise, Stage} from '../../CampIntro/Scenes/IntroKit';

/** The lesson screen inside the episode: a 16:9 window on the left, in reference pixels. */
const WINDOW = {x: 100, y: 230, width: 1120};

/**
 * One moment of a real camp lesson, playing in a window, with what the viewer does at that moment beside it: the
 * scene of the lesson (its own theme and lesson colour, its own motion, its sound effects muted under the episode's
 * narration) starting `from` seconds into it; on the right the moment's name, a box "Sen ne yapmalısın?" with the one
 * thing to do, and the research it rests on in small letters.
 */
export const MomentScene: React.FC<{
	kicker: string;
	color: string;
	badge: string;
	title: string;
	todo: string;
	evidence?: string;
	theme: Theme;
	lesson: React.ReactNode;
	from: number;
	todoAt: number;
}> = ({kicker, color, badge, title, todo, evidence, theme, lesson, from, todoAt}) => {
	const {u} = useVideoLayout();
	const {fps} = useVideoConfig();
	const scale = WINDOW.width / 1920;
	return (
		<Stage ground={C.navy}>
			<Kicker text={kicker} color={C.white} />
			<Box x={WINDOW.x} y={WINDOW.y} w={WINDOW.width} h={WINDOW.width * (9 / 16)}>
				<Rise at={0.1} distance={60}>
					<div style={{position: 'relative', width: u(WINDOW.width), height: u(WINDOW.width * (9 / 16)), borderRadius: u(24), overflow: 'hidden', boxShadow: `0 0 0 ${u(4)}px rgba(255,255,255,0.14), 0 ${u(40)}px ${u(90)}px rgba(0,0,0,0.5)`}}>
						<div style={{position: 'absolute', left: 0, top: 0, width: u(1920), height: u(1080), transform: `scale(${scale})`, transformOrigin: '0 0'}}>
							<ThemeProvider theme={theme}>
								<MuteSoundEffects>
									<AbsoluteFill style={{backgroundColor: theme.colors.background, color: theme.colors.text}}>
										<ThemeBackground />
										<Sequence from={-Math.round(from * fps)} layout="none">
											{lesson}
										</Sequence>
									</AbsoluteFill>
								</MuteSoundEffects>
							</ThemeProvider>
						</div>
					</div>
				</Rise>
			</Box>
			<Box x={1290} y={230} w={530}>
				<Rise at={0.25}>
					<div style={{display: 'inline-block', padding: `${u(10)}px ${u(22)}px`, borderRadius: u(999), background: color}}>
						<Text size={28} weight={TYPE.weights.kinetic} color={C.white} style={{letterSpacing: '0.04em', textTransform: 'uppercase'}}>
							{badge}
						</Text>
					</div>
				</Rise>
				<Rise at={0.4}>
					<Text variant="display" size={60} weight={TYPE.weights.kinetic} color={C.white} style={{lineHeight: 1.08, marginTop: u(24), letterSpacing: '-0.02em'}}>
						{title}
					</Text>
				</Rise>
				<Rise at={todoAt} distance={50}>
					<div style={{marginTop: u(40), padding: u(30), borderRadius: u(26), background: C.white, display: 'flex', flexDirection: 'column', gap: u(12)}}>
						<Text size={26} weight={TYPE.weights.kinetic} color={color} style={{letterSpacing: '0.06em', textTransform: 'uppercase'}}>
							Sen ne yapmalısın?
						</Text>
						<Text size={36} weight={TYPE.weights.display} color={C.ink} style={{lineHeight: 1.3}}>
							{todo}
						</Text>
					</div>
				</Rise>
				{evidence ? (
					<Rise at={todoAt + 0.6}>
						<Text size={24} weight={TYPE.weights.strong} color="rgba(255,255,255,0.7)" style={{marginTop: u(24), lineHeight: 1.35}}>
							{evidence}
						</Text>
					</Rise>
				) : null}
			</Box>
		</Stage>
	);
};
