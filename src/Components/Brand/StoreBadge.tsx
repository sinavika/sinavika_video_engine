import React from 'react';
import {STORE_BADGES} from '../../Configurations/SocialIdentity';
import {BRAND_TYPOGRAPHY as TYPE} from '../../Configurations/BrandTypography';
import {StoreLogo} from '../Illustrations/StoreLogo';
import {useVideoLayout} from '../Layouts/VideoLayout';
import {Text} from '../Typography/Text';

type StoreBadgeLang = 'tr' | 'en';

/**
 * The App Store and Google Play badges: the one design every video and image
 * uses to say where to get the app (Configurations/SocialIdentity). The store's
 * mark, a small line (the platform in Turkish, the stores' own words in
 * English) and the store's name, on brand charcoal.
 * `height` is in reference pixels; `onDark` adds the thin outline a dark
 * ground needs.
 */
export const StoreBadge: React.FC<{store: (typeof STORE_BADGES.stores)[number]; height?: number; onDark?: boolean; lang?: StoreBadgeLang}> = ({store, height = 92, onDark = false, lang = 'tr'}) => {
	const {u} = useVideoLayout();
	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: u(height * 0.2),
				height: u(height),
				boxSizing: 'border-box',
				padding: `0 ${u(height * 0.34)}px 0 ${u(height * 0.26)}px`,
				borderRadius: u(height * 0.24),
				backgroundColor: STORE_BADGES.fill,
				border: onDark ? `${u(2)}px solid ${STORE_BADGES.borderOnDark}` : 'none',
				flexShrink: 0,
			}}
		>
			<StoreLogo store={store.id} size={height * 0.5} color={STORE_BADGES.text} />
			<div style={{display: 'flex', flexDirection: 'column', gap: u(height * 0.03)}}>
				<Text size={height * 0.19} weight={TYPE.weights.strong} color={STORE_BADGES.text} style={{lineHeight: 1, opacity: 0.82, whiteSpace: 'nowrap'}}>
					{store.small[lang]}
				</Text>
				<Text size={height * 0.34} weight={TYPE.weights.display} color={STORE_BADGES.text} style={{lineHeight: 1, whiteSpace: 'nowrap'}}>
					{store.name}
				</Text>
			</div>
		</div>
	);
};

/** Both badges side by side (or stacked), always in the same order: App Store, Google Play. */
export const StoreBadges: React.FC<{height?: number; onDark?: boolean; lang?: StoreBadgeLang; direction?: 'row' | 'column'; align?: 'flex-start' | 'center'}> = ({height = 92, onDark = false, lang = 'tr', direction = 'row', align = 'center'}) => {
	const {u} = useVideoLayout();
	return (
		<div style={{display: 'flex', flexDirection: direction, alignItems: align, justifyContent: align, gap: u(height * 0.2), flexWrap: 'nowrap'}}>
			{STORE_BADGES.stores.map((store) => (
				<StoreBadge key={store.id} store={store} height={height} onDark={onDark} lang={lang} />
			))}
		</div>
	);
};
