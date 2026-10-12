import React from 'react';
import {Icon} from '../../Components/Illustrations/Icon';
import {Text} from '../../Components/Typography/Text';
import {readableOn} from '../../Themes/ColorPalette';
import {useInk, useTheme} from '../../Themes/ThemeContext';
import type {CallToActionContent} from '../Schemas/ImageFields';
import {useImageLayout} from './ImageFrame';

type CallToActionProps = {
	action: CallToActionContent;
	/** Use on coloured backdrops: the button takes the text colour instead of the primary colour. */
	inverse?: boolean;
	/** Label size in reference pixels. */
	size?: number;
};

/** The button-shaped call to action of an image, with an optional note beside it. */
export const CallToAction: React.FC<CallToActionProps> = ({action, inverse = false, size = 34}) => {
	const {colors, typography, shape} = useTheme();
	const ink = useInk();
	const {u} = useImageLayout();
	const fill = inverse ? ink.text : colors.primary;
	const label = inverse ? readableOn(ink.text) : colors.onPrimary;
	const pill = shape.radius.sm < 10 ? shape.radius.md : 999;

	return (
		<div style={{display: 'flex', alignItems: 'center', gap: u(24), flexWrap: 'wrap'}}>
			<div
				style={{
					display: 'inline-flex',
					alignItems: 'center',
					gap: u(size * 0.4),
					padding: `${u(size * 0.62)}px ${u(size * 1.1)}px`,
					borderRadius: u(pill),
					backgroundColor: fill,
					color: label,
					fontFamily: typography.display,
					fontWeight: typography.displayWeight,
					fontSize: u(size * typography.displayScale),
					lineHeight: 1,
					whiteSpace: 'nowrap',
					boxShadow: `0 ${u(14)}px ${u(34)}px rgba(0, 0, 0, 0.18)`,
				}}
			>
				{action.label}
				<Icon name="arrowRight" size={size * 0.9} strokeWidth={2.8} />
			</div>
			{action.note ? (
				<Text size={size * 0.8} tone="muted" weight={600}>
					{action.note}
				</Text>
			) : null}
		</div>
	);
};

const STORES = [
	{line: "App Store'dan", action: 'İndirin'},
	{line: "Google Play'den", action: 'Edinin'},
] as const;

/**
 * Store availability badges. Deliberately plain text on dark pills: the
 * stores' own logos are trademarks and are not redrawn here. Swap in the
 * official badge artwork if it is licensed for the campaign.
 */
export const StoreBadges: React.FC = () => {
	const {typography} = useTheme();
	const {u} = useImageLayout();
	return (
		<div style={{display: 'flex', gap: u(16), flexWrap: 'wrap'}}>
			{STORES.map((store) => (
				<div
					key={store.line}
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: u(12),
						padding: `${u(12)}px ${u(22)}px`,
						borderRadius: u(16),
						backgroundColor: '#0E0F14',
						color: '#FFFFFF',
						fontFamily: typography.body,
					}}
				>
					<Icon name="arrowRight" size={30} strokeWidth={2.6} style={{transform: 'rotate(90deg)'}} />
					<div>
						<div style={{fontSize: u(17), opacity: 0.75, lineHeight: 1.2}}>{store.line}</div>
						<div style={{fontSize: u(25), fontWeight: 700, lineHeight: 1.15}}>{store.action}</div>
					</div>
				</div>
			))}
		</div>
	);
};
