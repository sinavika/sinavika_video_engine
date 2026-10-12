import React from 'react';
import {FONT_SIZES} from '../../Themes/DesignTokens';
import {useTheme} from '../../Themes/ThemeContext';
import {Icon, type IconName} from '../Illustrations/Icon';
import {resolveTone, type Tone} from '../Layouts/Card';
import {useVideoLayout} from '../Layouts/VideoLayout';

type BadgeProps = {
	tone?: Tone;
	/** A subject label: drawn in the lesson's colour when the theme carries one, in `tone` otherwise. */
	lesson?: boolean;
	icon?: IconName;
	/** Font size in reference pixels. */
	size?: number;
	children: React.ReactNode;
};

/** Small pill label: subject, card type, step counter. */
export const Badge: React.FC<BadgeProps> = ({tone = 'primary', lesson = false, icon, size = FONT_SIZES.label, children}) => {
	const theme = useTheme();
	const {u} = useVideoLayout();
	const {fill, ink, outlined} = resolveTone(theme, lesson && theme.colors.lesson ? theme.colors.lesson : tone);
	const pill = theme.shape.radius.sm < 10 ? theme.shape.radius.sm : 999;

	return (
		<div
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				alignSelf: 'flex-start',
				gap: u(size * 0.4),
				padding: `${u(size * 0.36)}px ${u(size * 0.72)}px`,
				borderRadius: u(pill),
				backgroundColor: fill,
				border: `${u(Math.min(theme.shape.borderWidth, 3))}px solid ${outlined ? theme.colors.border : 'transparent'}`,
				color: ink.text,
				fontFamily: theme.typography.body,
				fontSize: u(size),
				fontWeight: theme.typography.strongWeight,
				letterSpacing: '0.06em',
				lineHeight: 1.1,
				textTransform: theme.typography.labelTransform,
				whiteSpace: 'nowrap',
				flexShrink: 0,
			}}
		>
			{icon ? <Icon name={icon} size={size * 1.1} strokeWidth={2.6} /> : null}
			{children}
		</div>
	);
};
