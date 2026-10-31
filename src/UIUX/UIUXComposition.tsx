import React from 'react';
import {AbsoluteFill, Composition, Folder} from 'remotion';
import {VideoFrame} from '../Components/Layouts/VideoFrame';
import {themeVars, UIProvider} from './Context';
import {Text} from './Parts/Shared';
import {findScreen, UI_SCREENS, type UIScreen} from './Registry';
import {BOARD, screenSize, UIUX_BOARD_ID, UIUX_SCREEN_ID, UIUXBoardPropsSchema, UIUXScreenPropsSchema, type UIUXBoardProps, type UIUXScreenProps} from './UIUXProps';

/**
 * The UI/UX drawings as pictures: one screen at its own size, or a board of
 * several screens with their titles. Which screen comes from the props.
 */
const ScreenPicture: React.FC<UIUXScreenProps> = ({id, lang, mode}) => {
	const {Component} = findScreen(id);
	return (
		<VideoFrame themeId="SinavikaLight" lang={lang}>
			<UIProvider lang={lang} mode={mode}>
				<AbsoluteFill style={themeVars(mode)}>
					<Component />
				</AbsoluteFill>
			</UIProvider>
		</VideoFrame>
	);
};

const boardCell = (screen: UIScreen) => {
	const size = screenSize(screen.platform, screen.height);
	const width = screen.platform === 'mobile' ? BOARD.mobileWidth : BOARD.webWidth;
	return {size, width, scale: width / size.width, height: (size.height * width) / size.width};
};

const boardSize = ({ids, columns}: Pick<UIUXBoardProps, 'ids' | 'columns'>): {width: number; height: number} => {
	const cells = ids.map((id) => boardCell(findScreen(id)));
	const cellWidth = Math.max(...cells.map((cell) => cell.width));
	const rows: number[] = [];
	cells.forEach((cell, index) => {
		const row = Math.floor(index / columns);
		rows[row] = Math.max(rows[row] ?? 0, cell.height);
	});
	return {
		width: Math.round(BOARD.padding * 2 + columns * cellWidth + (columns - 1) * BOARD.gap),
		height: Math.round(BOARD.padding * 2 + BOARD.header + rows.reduce((sum, height) => sum + height + BOARD.caption + BOARD.gap, 0)),
	};
};

const BoardPicture: React.FC<UIUXBoardProps> = ({ids, title, lang, mode, columns}) => {
	const dark = mode === 'dark';
	const ink = dark ? '#F1F5F9' : '#0B1C30';
	const screens = ids.map(findScreen);
	const cells = screens.map(boardCell);
	const cellWidth = Math.max(...cells.map((cell) => cell.width));
	const rowHeights: number[] = [];
	cells.forEach((cell, index) => {
		const row = Math.floor(index / columns);
		rowHeights[row] = Math.max(rowHeights[row] ?? 0, cell.height);
	});
	const rowTop = (row: number) => BOARD.padding + BOARD.header + rowHeights.slice(0, row).reduce((sum, height) => sum + height + BOARD.caption + BOARD.gap, 0);
	return (
		<VideoFrame themeId="SinavikaLight" lang={lang}>
			<UIProvider lang={lang} mode={mode}>
				<AbsoluteFill style={{...themeVars(mode), background: dark ? '#05070A' : '#E9ECF1'}}>
					<div style={{position: 'absolute', left: BOARD.padding, top: BOARD.padding}}>
						<Text role="display" size={44} color={ink}>
							{title}
						</Text>
						<Text role="body" size={20} style={{marginTop: 10}}>
							Sınavika UI/UX · {screens.length} ekran · {dark ? 'koyu' : 'açık'} tema
						</Text>
					</div>
					{screens.map((screen, index) => {
						const cell = cells[index];
						const column = index % columns;
						const row = Math.floor(index / columns);
						const {Component} = screen;
						return (
							<div key={screen.id} style={{position: 'absolute', left: BOARD.padding + column * (cellWidth + BOARD.gap), top: rowTop(row), width: cell.width}}>
								<Text role="headline" size={17} color={ink} style={{height: 26, whiteSpace: 'nowrap', overflow: 'hidden'}}>
									{screen.title}
								</Text>
								<Text role="meta" size={13} style={{height: 26}}>
									{screen.id}
								</Text>
								<div style={{position: 'relative', width: cell.width, height: cell.height, marginTop: BOARD.caption - 52, borderRadius: screen.platform === 'mobile' ? 34 : 14, overflow: 'hidden', boxShadow: '0 20px 50px -24px rgba(15, 23, 42, 0.45)', background: dark ? '#0F1115' : '#FFFFFF'}}>
									<div style={{width: cell.size.width, height: cell.size.height, transform: `scale(${cell.scale})`, transformOrigin: 'top left'}}>
										<Component />
									</div>
								</div>
							</div>
						);
					})}
				</AbsoluteFill>
			</UIProvider>
		</VideoFrame>
	);
};

export const UIUXComposition: React.FC = () => (
	<Folder name="UIUX">
		<Composition
			id={UIUX_SCREEN_ID}
			component={ScreenPicture}
			schema={UIUXScreenPropsSchema}
			defaultProps={UIUXScreenPropsSchema.parse({})}
			durationInFrames={1}
			fps={30}
			width={390}
			height={844}
			calculateMetadata={({props}) => {
				const parsed = UIUXScreenPropsSchema.parse(props);
				const screen = findScreen(parsed.id);
				return {props: parsed, ...screenSize(screen.platform, screen.height)};
			}}
		/>
		<Composition
			id={UIUX_BOARD_ID}
			component={BoardPicture}
			schema={UIUXBoardPropsSchema}
			defaultProps={UIUXBoardPropsSchema.parse({ids: UI_SCREENS.slice(0, 4).map((screen) => screen.id), title: 'Modüller'})}
			durationInFrames={1}
			fps={30}
			width={1920}
			height={1080}
			calculateMetadata={({props}) => {
				const parsed = UIUXBoardPropsSchema.parse(props);
				return {props: parsed, ...boardSize(parsed)};
			}}
		/>
	</Folder>
);
