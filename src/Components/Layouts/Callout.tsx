import React from 'react';
import {SPACING} from '../../Themes/DesignTokens';
import {withAlpha} from '../../Themes/Theme';
import {useTheme} from '../../Themes/ThemeContext';
import {Icon, type IconName} from '../Illustrations/Icon';
import {Text} from '../Typography/Text';
import {useVideoLayout} from './VideoLayout';

type CalloutTone = 'primary' | 'accent' | 'success' | 'warning' | 'danger';

type CalloutProps = {
	tone?: CalloutTone;
	icon: IconName;
	label?: string;
	style?: React.CSSProperties;
	children: React.ReactNode;
};

/** A tinted aside with an icon: hints, tips, warnings, key takeaways. */
export const Callout: React.FC<CalloutProps> = ({tone = 'accent', icon, label, style, children}) => {
	const {colors, shape} = useTheme();
	const {u} = useVideoLayout();
	const palette = {
		primary: [colors.primary, colors.onPrimary],
		accent: [colors.accent, colors.onAccent],
		success: [colors.success, colors.onStatus],
		warning: [colors.warning, colors.onStatus],
		danger: [colors.danger, colors.onStatus],
	} as const;
	const [fill, on] = palette[tone];

	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'flex-start',
				gap: u(SPACING.md),
				padding: u(SPACING.lg),
				borderRadius: u(shape.radius.md),
				backgroundColor: withAlpha(fill, 0.14),
				border: `${u(Math.max(2, shape.borderWidth))}px solid ${withAlpha(fill, 0.55)}`,
				...style,
			}}
		>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					width: u(64),
					height: u(64),
					borderRadius: u(shape.radius.sm),
					backgroundColor: fill,
					color: on,
					flexShrink: 0,
				}}
			>
				<Icon name={icon} size={38} />
			</div>
			<div style={{display: 'flex', flexDirection: 'column', gap: u(SPACING.xs), minWidth: 0, flex: 1}}>
				{label ? <Text variant="label">{label}</Text> : null}
				{children}
			</div>
		</div>
	);
};
