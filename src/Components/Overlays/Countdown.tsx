import React from 'react';
import {Easing, interpolate} from 'remotion';
import {BRAND_TYPOGRAPHY} from '../../Configurations/BrandTypography';
import {withAlpha} from '../../Themes/Theme';
import {useTheme} from '../../Themes/ThemeContext';
import {useVideoLayout} from '../Layouts/VideoLayout';

/**
 * The time to think: a ring that empties, the seconds left set large, and
 * each new second popping in, so the pause reads as a timer and not as the
 * video having stopped.
 */
export const Countdown: React.FC<{left: number; total: number; label?: string; size?: number}> = ({left, total, label = 'Düşün', size: sizeIn = 220}) => {
	const {colors, typography} = useTheme();
	const {u} = useVideoLayout();
	const size = u(sizeIn);
	const radius = size / 2 - u(14);
	const share = Math.max(0, left / total);
	const lesson = colors.lesson?.fill ?? colors.accent;
	const second = Math.max(1, Math.ceil(left));
	// How far into the current second: 0 when it has just begun.
	const into = 1 - (left - Math.floor(left) || 1);
	const pop = interpolate(into, [0, 0.25], [1.28, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(2))});
	return (
		<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: u(14)}}>
			<div style={{position: 'relative', width: size, height: size}}>
				<svg width={size} height={size} style={{position: 'absolute', inset: 0, transform: 'rotate(-90deg)'}}>
					<circle cx={size / 2} cy={size / 2} r={radius} fill={withAlpha(lesson, 0.06)} stroke={withAlpha(lesson, 0.15)} strokeWidth={u(18)} />
					<circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={lesson} strokeWidth={u(18)} strokeLinecap="round" strokeDasharray={2 * Math.PI * radius} strokeDashoffset={2 * Math.PI * radius * (1 - share)} />
				</svg>
				<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(sizeIn * 0.44), color: lesson, transform: `scale(${pop})`}}>{second}</div>
			</div>
			<div style={{fontFamily: typography.display, fontWeight: BRAND_TYPOGRAPHY.weights.kinetic, fontSize: u(34), color: lesson, letterSpacing: '0.08em', textTransform: 'uppercase'}}>{label}</div>
		</div>
	);
};
