import React from 'react';
import {useColors, useModuleColors, UIProvider} from '../Context';
import {Icon, type UIIconName} from '../Icons';
import {MODULES, type ModuleKey} from '../ModuleIdentity';
import {UI_CANVAS} from '../Tokens';
import {Text} from './Shared';
import {PanelInTablet} from './Web';

/**
 * iPhone Duo (Apple's foldable, announced 9 Sep 2026; HIG "Designing for
 * iPhone Duo"). Sizes as measured in the Xcode 27.2 iPhone Duo simulator
 * (mac-iphone, 19 Nov 2026; App Store screenshot sizes ÷ 3 agree):
 * - outer display held upright, 466 × 678 pt, safe area right 84, bottom 34
 *   (content 382 × 644);
 * - inner display open wide, 951 × 669 pt, safe area right 84, bottom 34
 *   (content 867 × 635); held tall 669 × 951 with the usual bars.
 *
 * The trailing 84 pt strip is iOS's own: the system draws the Dynamic Island,
 * the time and the status icons at its top, and UIKit lays the tab bar out
 * vertically at its bottom. The drawings show the system items for the
 * device's look; the app draws only its tab icons and toolbar items in the
 * strip (icon only). The code decides by `traitCollection.verticalBarEdge`,
 * never by size; the folding region comes from
 * `UIView.reservedRegions(kind: .division)`.
 */

/** iOS's trailing safe-area strip on both Duo displays. */
export const DUO_RAIL = 84;
/** Bottom safe area (home indicator). */
export const DUO_BOTTOM = 34;
/** Inner display: where the toolbar starts in the strip, under the system items (time, status; no island). */
export const DUO_TOOLBAR_TOP = 132;
/**
 * Outer display: where the toolbar starts, under the system items. iOS reports
 * their place as `reservedRegions(kind: .occlusion)`: 174 pt tall on the outer
 * display (simulator, mac-iphone 19 Nov 2026); at 132 the toolbar met the Wi‑Fi
 * ring. The app reads the region; the drawing uses 180.
 */
export const DUO_OUTER_TOOLBAR_TOP = 180;
/** Partly open: the folding region at the inner display's centre, 40 pt (simulator, mac-iphone 19 Nov 2026: x 455.5–495.5). */
export const DUO_FOLD = 40;
/** Partly open: the trailing pane's width, between the fold (951 / 2 + 20) and the strip (951 − 84), less the page's 22 pt trailing padding: 349. */
export const DUO_FOLD_PANE = Math.floor(UI_CANVAS.duoInner.width - DUO_RAIL - (UI_CANVAS.duoInner.width + DUO_FOLD) / 2) - 22;
/** Partly open: the space between the two panes, the whole fold (rounded up), so the leading pane ends at or before the fold's start (455). */
export const DUO_FOLD_SPACE = DUO_FOLD + 1;

const Island: React.FC = () => <div style={{width: 26, height: 62, borderRadius: 13, background: '#000000'}} />;

/** The strip's top, drawn by iOS: the Dynamic Island (outer display) and the status bar, stacked. */
const RailStatus: React.FC<{island?: boolean}> = ({island}) => {
	const colors = useColors();
	return (
		<div data-ui="statusbar" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, paddingTop: island ? 10 : 14}}>
			{island ? <Island /> : null}
			<Text role="headline" size={12.5} weight={700} color={colors.ink}>
				9:41
			</Text>
			<div style={{display: 'flex', gap: 3, alignItems: 'center'}}>
				<Icon name="wifi" size={13} color={colors.ink} />
				<Icon name="battery" size={16} color={colors.ink} />
			</div>
		</div>
	);
};

/** iOS's trailing strip. Children are the app's bars placed in it (tab bar at the bottom, toolbar under the system items). */
export const DuoRail: React.FC<{island?: boolean; children?: React.ReactNode}> = ({island, children}) => {
	const colors = useColors();
	return (
		<div data-ui="duo-rail" style={{position: 'absolute', top: 0, right: 0, bottom: 0, width: DUO_RAIL, background: colors.card, borderLeft: `1px solid ${colors.line}`, zIndex: 4}}>
			<RailStatus island={island} />
			{children}
		</div>
	);
};

/** One icon of a vertical bar: 44 pt target, the active one in a soft pill. */
export const RailButton: React.FC<{icon: UIIconName; on?: boolean; badge?: string; color?: string; soft?: string}> = ({icon, on, badge, color, soft}) => {
	const colors = useColors();
	return (
		<div style={{position: 'relative', width: 46, height: 44, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: on ? (soft ?? colors.line2) : 'transparent'}}>
			<Icon name={icon} size={22} color={on ? (color ?? colors.ink) : colors.ink2} stroke={on ? 2.2 : 1.9} />
			{badge ? (
				<div style={{position: 'absolute', top: 3, right: 4, minWidth: 16, height: 16, padding: '0 3px', boxSizing: 'border-box', borderRadius: 8, background: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<Text role="meta" size={9} weight={800} color="#FFFFFF">
						{badge}
					</Text>
				</div>
			) : null}
		</div>
	);
};

/** A group of rail buttons at a fixed place in the rail. */
export const RailGroup: React.FC<{top?: number; bottom?: number; children: React.ReactNode; label?: string}> = ({top, bottom, children, label}) => (
	<div data-ui={label} style={{position: 'absolute', right: 0, width: DUO_RAIL, top, bottom, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, zIndex: 6}}>
		{children}
	</div>
);

/**
 * Inner display, open wide (951 × 669): the page of the tablet and the web
 * (without the web's menu and top bar) on the leading side, the rail on the
 * trailing edge: status, then the toolbar (notifications), then the app's
 * places (Modüller, the page's module, Profil).
 */
export const DuoInner: React.FC<{module?: ModuleKey; children: React.ReactNode}> = ({module, children}) => (
	<UIProvider canvas={{width: UI_CANVAS.duoInner.width, height: UI_CANVAS.duoInner.height}} duo="inner" noPencil module={module}>
		<DuoInnerCanvas module={module}>{children}</DuoInnerCanvas>
	</UIProvider>
);

const DuoInnerCanvas: React.FC<{module?: ModuleKey; children: React.ReactNode}> = ({module, children}) => {
	const colors = useColors();
	const mod = useModuleColors(module);
	const {width, height} = UI_CANVAS.duoInner;
	return (
		<div data-ui="screen" style={{position: 'relative', width, height, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: module ? `linear-gradient(180deg, ${mod.wash} 0%, ${colors.bg} 40%), ${colors.bg}` : colors.bg}}>
			<div data-ui="scroll-y" style={{flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', paddingTop: 18, marginRight: DUO_RAIL, boxSizing: 'border-box'}}>
				<PanelInTablet>{children}</PanelInTablet>
			</div>
			<DuoRail>
				<RailGroup top={DUO_TOOLBAR_TOP} label="duo-toolbar">
					<RailButton icon="bell" badge="3" />
					<RailButton icon="sparkles" />
				</RailGroup>
				<DuoPlaces module={module} />
			</DuoRail>
		</div>
	);
};

/** The app's places on the inner rail: Modüller, the open module (in its colour), Profil. */
const DuoPlaces: React.FC<{module?: ModuleKey}> = ({module}) => {
	const mod = useModuleColors(module);
	return (
		<RailGroup bottom={DUO_BOTTOM} label="duo-tabbar">
			<RailButton icon="grid" on={!module} />
			{module ? <RailButton icon={MODULES[module].icon as UIIconName} on color={mod.color} soft={mod.soft} /> : null}
			<RailButton icon="user" />
		</RailGroup>
	);
};

/**
 * Inner display for the phone-only flows (sign-in, onboarding, payment): the
 * phone screen as a centred column of 430 pt, as a form sheet on iPad, on the
 * brand's quiet background; the rail keeps the status only.
 */
export const DuoCentered: React.FC<{children: React.ReactNode}> = ({children}) => {
	const colors = useColors();
	const {width, height} = UI_CANVAS.duoInner;
	return (
		<UIProvider duo="inner">
			<div data-ui="screen" style={{position: 'relative', width, height, overflow: 'hidden', background: colors.line2, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingRight: DUO_RAIL, boxSizing: 'border-box'}}>
				<div style={{width: 430, height, overflow: 'hidden', boxShadow: '0 0 0 1px rgba(15,23,42,0.06), 0 20px 40px -24px rgba(15,23,42,0.35)'}}>
					<UIProvider canvas={{width: 430, height}} duo="sheet">
						{children}
					</UIProvider>
				</div>
				<DuoRail />
			</div>
		</UIProvider>
	);
};

/** Outer display wrapper: the phone screen at 466 × 678 (upright) with iOS's trailing strip. */
export const DuoOuter: React.FC<{children: React.ReactNode}> = ({children}) => (
	<UIProvider canvas={{width: UI_CANVAS.duoOuter.width, height: UI_CANVAS.duoOuter.height}} duo="outer" noPencil>
		{children}
	</UIProvider>
);

