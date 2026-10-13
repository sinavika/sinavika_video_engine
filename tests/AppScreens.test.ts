import {describe, expect, it} from 'vitest';
import {APP_MODULES} from '../src/Components/AppScreens/AppModules';
import {APP_SCREENS, APP_SCREEN_NAMES} from '../src/Components/AppScreens/AppScreenRegistry';
import {APP_PALETTES, APP_SCREEN} from '../src/Components/AppScreens/AppScreenTokens';
import {phoneHeight} from '../src/Components/AppScreens/PhoneFrame';
import {AppScreenPropsSchema, appScreenSize} from '../src/Compositions/AppScreenProps';
import {BRAND_COLORS} from '../src/Configurations/BrandColors';
import {resolveImageJob} from '../src/Images/Renderers/ImageJob';
import {resolveVideoJob} from '../src/Renderers/VideoJob';
import {contrastRatio} from '../src/Themes/ColorPalette';
import {TEMPLATES} from '../src/Templates/TemplateRegistry';

describe('app screen registry', () => {
	it('keeps the screen names content files refer to', () => {
		expect(APP_SCREEN_NAMES).toEqual(['Home', 'ExamHome', 'Exam', 'Analysis', 'SmartSummaryHome', 'SmartSummary', 'SinoAi', 'Flashcards', 'Lessons', 'Tests', 'StudyPlan']);
	});

	it('describes every screen and ties it to a module of the app', () => {
		for (const name of APP_SCREEN_NAMES) {
			const screen = APP_SCREENS[name];
			expect(typeof screen.Component, name).toBe('function');
			expect(Object.keys(APP_MODULES), name).toContain(screen.module);
			expect(screen.title.length, name).toBeGreaterThan(2);
			expect(screen.description.length, name).toBeGreaterThan(10);
		}
	});

	it('covers every module of the app with at least one screen', () => {
		const covered = new Set(APP_SCREEN_NAMES.map((name) => APP_SCREENS[name].module));
		expect([...covered].sort()).toEqual(Object.keys(APP_MODULES).sort());
	});
});

describe('app modules', () => {
	it('gives each module the app’s five tabs with "Modüller" in the middle and "Profil" last', () => {
		for (const [name, module] of Object.entries(APP_MODULES)) {
			if (!module.tabs) continue;
			expect(module.tabs, name).toHaveLength(5);
			expect(module.tabs[2].label, name).toBe('Modüller');
			expect(module.tabs[4].label, name).toBe('Profil');
		}
		expect(APP_MODULES.Hub.tabs).toBeNull();
		expect(APP_MODULES.SinoAi.tabs).toBeNull();
	});

	it('uses the app’s own module names', () => {
		expect(Object.values(APP_MODULES).map((module) => module.title)).toEqual(['Modüller', 'Denemeler', 'Akıllı Özet', 'Bilgi Kartları', 'Dersler', 'Testler', 'Ders Planı', 'SinoAI']);
	});
});

describe('app tokens', () => {
	it('match the corporate palette in both themes', () => {
		const {brand, light, dark, status} = BRAND_COLORS;
		expect(APP_PALETTES.light).toMatchObject({primary: brand.primary, primaryContainer: brand.primaryContainer, primarySoft: brand.primaryLight, text: brand.textPrimary, background: light.background, card: light.card, outline: light.border, muted: light.textSecondary, success: status.success.light, error: status.error.light});
		expect(APP_PALETTES.dark).toMatchObject({primary: dark.primaryAccent, background: dark.background, surface: dark.surface, text: dark.textPrimary, muted: dark.textSecondary, success: status.success.dark, error: status.error.dark});
	});

	it('keep text readable in both themes', () => {
		for (const colors of Object.values(APP_PALETTES)) {
			expect(contrastRatio(colors.text, colors.background)).toBeGreaterThanOrEqual(7);
			expect(contrastRatio(colors.text, colors.card)).toBeGreaterThanOrEqual(7);
			expect(contrastRatio(colors.muted, colors.card)).toBeGreaterThanOrEqual(4.5);
			expect(contrastRatio(colors.onPrimary, colors.primary)).toBeGreaterThanOrEqual(3);
			expect(contrastRatio(colors.onPrimarySoft, colors.primarySoft)).toBeGreaterThanOrEqual(4.5);
		}
	});
});

describe('where screens are used', () => {
	it('exports a bare screen at phone screenshot resolution, or inside the phone', () => {
		expect(appScreenSize({device: false})).toEqual({width: APP_SCREEN.width * 3, height: APP_SCREEN.height * 3});
		const withPhone = appScreenSize({device: true});
		expect(withPhone.width).toBe(1120);
		expect(withPhone.height).toBe(Math.round(phoneHeight(900)) + 220);
		expect(AppScreenPropsSchema.parse({screen: 'Exam'})).toEqual({screen: 'Exam', mode: 'light', device: false});
		expect(AppScreenPropsSchema.safeParse({screen: 'Settings'}).success).toBe(false);
		expect(AppScreenPropsSchema.safeParse({screen: 'Exam', mode: 'sepia'}).success).toBe(false);
	});

	it('lets phone images pick a drawn screen by name', () => {
		const hero = {category: 'MobilePromotion', variant: 'HeroPhone', content: {title: 'Sınava hazırlık **cebinde**', cta: {label: 'Uygulamayı indir'}}};
		expect(() => resolveImageJob(hero)).not.toThrow();
		expect(() => resolveImageJob({...hero, content: {...hero.content, appScreen: 'StudyPlan'}})).not.toThrow();
		expect(() => resolveImageJob({...hero, content: {...hero.content, appScreen: 'Settings'}})).toThrow(/appScreen/);
	});

	it('lets the app ad walk through any screens, in light or dark', () => {
		const sample = TEMPLATES.find((template) => template.id === 'AppPromotion')!.sampleContent;
		const features = APP_SCREEN_NAMES.slice(0, 6).map((screen) => ({screen, headline: APP_SCREENS[screen].title.slice(0, 30), narration: 'Uygulamada.'}));
		const job = resolveVideoJob({template: 'AppPromotion', content: {...sample, features, appMode: 'dark'}});
		expect((job.inputProps.content as {appMode: string}).appMode).toBe('dark');
		expect((resolveVideoJob({template: 'AppPromotion', content: sample}).inputProps.content as {appMode: string}).appMode).toBe('light');
		expect(() => resolveVideoJob({template: 'AppPromotion', content: {...sample, features: [...features, features[0]]}})).toThrow();
	});
});
