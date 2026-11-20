import React from 'react';
import {UIProvider} from '../../UIUX/Context';
import {findScreen} from '../../UIUX/Registry';
import type {AdConcept} from './GoogleAdsPlan';

/**
 * The product screens inside the ads: the real UI/UX drawings from the
 * Registry (owner, 20 Nov 2026: "UI/UX'ten son ekranları al"), never a copy
 * drawn for the ad. Turkish ads draw the Turkish screens, English ads the
 * English ones (the UIProvider language comes from the picture), and each
 * concept names its own drawing (`concept.screen`), so the ad always shows
 * what the app shows today.
 *
 * The exam persona (`exam`) makes a KPSS ad draw KPSS data and an ACT ad ACT
 * data on the same screens (UI/UX, 20 Nov 2026); without it a Turkish screen
 * is a TYT student and an English one an SAT student.
 */
const Drawing: React.FC<{id: string; exam: AdConcept['exam']}> = ({id, exam}) => {
	const screen = findScreen(id);
	return (
		<UIProvider exam={exam}>
			<screen.Component />
		</UIProvider>
	);
};

/** The concept's phone screen, at the phone canvas (390 × 844) that DevicePhone scales. */
export const AdMobileScreen: React.FC<{concept: AdConcept}> = ({concept}) => <Drawing id={concept.screen.mobile} exam={concept.exam} />;

/** The concept's web panel page, at the web canvas (1440 × 900) that DeviceBrowser scales. */
export const AdWebScreen: React.FC<{concept: AdConcept}> = ({concept}) => (
	<UIProvider web>
		<Drawing id={concept.screen.web} exam={concept.exam} />
	</UIProvider>
);
