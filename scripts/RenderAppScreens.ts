/**
 * Exports the drawn app screens as pictures, e.g. for stories, LinkedIn
 * posts, store listings or a quick look at the catalogue.
 *
 *   npm run screens                                  (every screen, light, bare)
 *   npm run screens -- --mode both --device          (light and dark, inside the phone)
 *   npm run screens -- --screen Exam --screen SinoAi --mode dark
 *   npm run screens -- --list                        (names and what each screen shows)
 *
 * Files go to Outputs/AppScreens/<Screen>_<mode>[_Telefon].png and are
 * replaced on every run: this is a catalogue, not a numbered production.
 */
import path from 'node:path';
import {parseArgs} from 'node:util';
import {APP_SCREENS, APP_SCREEN_NAMES, type AppScreenName} from '../src/Components/AppScreens/AppScreenRegistry';
import {APP_MODES, type AppMode} from '../src/Components/AppScreens/AppScreenTokens';
import {renderAppScreen} from '../src/Renderers/AppScreenRenderer';
import {outputRoot} from '../src/Services/OutputFiles';

const {values} = parseArgs({
	options: {
		screen: {type: 'string', multiple: true},
		mode: {type: 'string', default: 'light'},
		device: {type: 'boolean', default: false},
		'out-dir': {type: 'string'},
		list: {type: 'boolean', default: false},
	},
});

if (values.list) {
	APP_SCREEN_NAMES.forEach((name) => console.log(`${name.padEnd(18)} ${APP_SCREENS[name].title.padEnd(24)} ${APP_SCREENS[name].description}`));
	process.exit(0);
}

const screens = (values.screen ?? APP_SCREEN_NAMES) as string[];
const unknown = screens.filter((name) => !(APP_SCREEN_NAMES as readonly string[]).includes(name));
const modes = values.mode === 'both' ? APP_MODES : ([values.mode] as string[]);
if (unknown.length > 0 || modes.some((mode) => !(APP_MODES as readonly string[]).includes(mode))) {
	console.error(`Bilinmeyen ${unknown.length > 0 ? `ekran: ${unknown.join(', ')}` : `mod: ${values.mode}`}. Ekranlar: ${APP_SCREEN_NAMES.join(', ')}. Modlar: light, dark, both.`);
	process.exit(2);
}

const directory = values['out-dir'] ?? path.join(outputRoot(), 'AppScreens');
for (const screen of screens as AppScreenName[]) {
	for (const mode of modes as AppMode[]) {
		const file = path.join(directory, `${screen}_${mode}${values.device ? '_Telefon' : ''}.png`);
		const result = await renderAppScreen({screen, mode, device: values.device}, {outputPath: file});
		console.log(`✓ ${path.relative(process.cwd(), result.outputPath)}  ${result.width}x${result.height}`);
	}
}
