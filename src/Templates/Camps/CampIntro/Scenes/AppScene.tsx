import React from 'react';
import {APP_SCREENS, type AppScreenName} from '../../../../Components/AppScreens/AppScreenRegistry';
import {PhoneFrame} from '../../../../Components/AppScreens/PhoneFrame';
import {useVideoLayout} from '../../../../Components/Layouts/VideoLayout';
import {Text} from '../../../../Components/Typography/Text';
import {BRAND_TYPOGRAPHY as TYPE} from '../../../../Configurations/BrandTypography';
import {Box, C, Kicker, Rise, Stage, Title} from './IntroKit';

// ─── 9. The app ─────────────────────────────────────────────────────────────

type IntroScreen = {screen: AppScreenName; caption: string};

/** The camp continues in Sınavika: phones rise on the brand orange as their module is named, each with its line above it. */
export const AppScene: React.FC<{kicker: string; title: string; screens: readonly IntroScreen[]; screenAt: readonly number[]}> = ({kicker, title, screens, screenAt}) => {
	const {u} = useVideoLayout();
	// The phones bleed off the bottom edge on purpose (ad framing); their lines sit above them, always readable.
	const width = 360;
	const gap = 110;
	const totalWidth = screens.length * width + (screens.length - 1) * gap;
	return (
		<Stage ground={`linear-gradient(140deg, #F26B1D 0%, ${C.orange} 45%, #C2410C 100%)`}>
			<Kicker text={kicker} color={C.white} />
			<Title text={title} color={C.white} size={88} />
			{screens.map((item, index) => {
				const Screen = APP_SCREENS[item.screen].Component;
				const x = (1920 - totalWidth) / 2 + index * (width + gap);
				return (
					<Box key={item.screen + index} x={x} y={300} w={width}>
						<Rise at={screenAt[index] + 0.15}>
							<div style={{width: u(width), padding: `${u(14)}px ${u(18)}px`, boxSizing: 'border-box', borderRadius: u(22), background: C.white, marginBottom: u(26)}}>
								<Text size={30} weight={TYPE.weights.display} color={C.ink} align="center" style={{lineHeight: 1.2}}>
									{item.caption}
								</Text>
							</div>
						</Rise>
						<Rise at={screenAt[index]} distance={160}>
							<div style={{transform: `rotate(${(index - (screens.length - 1) / 2) * 3}deg)`}}>
								<PhoneFrame width={u(width)} style={{boxShadow: `0 ${u(40)}px ${u(90)}px rgba(0,0,0,0.35)`}}>
									<Screen />
								</PhoneFrame>
							</div>
						</Rise>
					</Box>
				);
			})}
		</Stage>
	);
};
