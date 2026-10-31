/**
 * Shows who narrates Sınavika, and lets you listen before committing to a voice.
 *
 *   npm run voices
 *       The brand voices in order of preference, which of them this ElevenLabs
 *       account can use, and who would narrate right now.
 *
 *   npm run voices -- --audition "Dikkat! Bu soru sınavda çıkabilir."
 *       Speaks the sentence with every usable voice of the catalogue and saves
 *       the clips to Outputs/Auditions/. Costs sentence length x number of voices.
 *
 *   npm run voices -- --audition "..." --brand
 *       Auditions only the usable brand voices (native Turkish speakers).
 *
 *   npm run voices -- --audition "..." --model expressive
 *       Uses one model for every voice instead of each voice's own.
 */
import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {parseArgs} from 'node:util';
import {
	BRAND_VOICES,
	VOICES,
	VOICE_MODELS,
	VOICE_PROFILES,
	VOICE_PROFILE_KEYS,
	type VoiceKey,
	type VoiceModelKey,
} from '../src/Configurations/Voices';
import {ELEVENLABS_SPEECH, SPEECH_AUDIO, SPEECH_CONCURRENCY} from '../src/Services/ElevenLabsSpeech';
import {VoiceCastingError, castVoice} from '../src/Services/VoiceCasting';

const {values} = parseArgs({
	options: {
		audition: {type: 'string'},
		brand: {type: 'boolean', default: false},
		model: {type: 'string'},
		out: {type: 'string', default: 'Outputs/Auditions'},
	},
});

const available = await ELEVENLABS_SPEECH.availableVoiceIds();
const remaining = await ELEVENLABS_SPEECH.remainingCharacters();
const usable = (voice: VoiceKey) => available.has(VOICES[voice].elevenLabsId);
const describe = (voice: VoiceKey) => {
	const {name, origin, character} = VOICES[voice];
	return `${usable(voice) ? '✓' : '·'} ${name.padEnd(14)} ${(origin === 'native' ? 'Türkçe' : 'çok dilli').padEnd(10)} ${character}`;
};

const library = (voice: VoiceKey) => `https://elevenlabs.io/app/voice-library?voiceId=${VOICES[voice].elevenLabsId}`;

if (!values.audition) {
	console.log(`ElevenLabs hesabı: bu dönem ${remaining ?? '?'} karakter kaldı · ses ${SPEECH_AUDIO.outputFormat} · aynı anda ${SPEECH_CONCURRENCY} istek.  ✓ kullanılabilir   · kullanılamıyor\n`);
	console.log('Marka sesi (ana dili Türkçe; listedeki ilk kullanılabilir ses her şeyi seslendirir):');
	BRAND_VOICES.forEach((voice) => console.log(`  ${describe(voice)}`));
	console.log('');
	try {
		const cast = castVoice({profile: 'Promoter'}, available);
		console.log(`Şu an seslendiren: ${cast.voiceName} (${cast.modelId}, tempo ${cast.pace})`);
		if (cast.note) console.log(`  Not: ${cast.note}`);
	} catch (error) {
		if (!(error instanceof VoiceCastingError)) throw error;
		console.log('Şu an seslendiren: YOK. Ana dili Türkçe seslerin hiçbiri bu hesapta API ile kullanılamıyor.');
		console.log('  Bu sesler ElevenLabs ses kütüphanesindedir: hesap ücretli plana (ya da API kredisine) geçmeli');
		console.log('  ve seçilen ses "My Voices"a eklenmelidir. Dinlemek ve eklemek için:');
		BRAND_VOICES.forEach((voice) => console.log(`    ${VOICES[voice].name.padEnd(14)} ${library(voice)}`));
		console.log('  O zamana kadar bir iş, ana dili Türkçe olmayan yedek sesi ancak açıkça isteyerek kullanır:');
		console.log('    "voiceover": {"standIn": true}');
	}
	console.log('\nAnlatım rolleri (sesi değil, söyleyişi belirler) ve yedek sesleri:');
	for (const key of VOICE_PROFILE_KEYS) {
		const profile = VOICE_PROFILES[key];
		console.log(`  ${key.padEnd(10)} ${profile.description}`);
		console.log(`  ${''.padEnd(10)} yedek: ${profile.standIns.map((voice) => `${usable(voice) ? '✓' : '·'} ${VOICES[voice].name}`).join(', ')}`);
	}
	process.exit(0);
}

const model = values.model as VoiceModelKey | undefined;
if (model && !VOICE_MODELS[model]) {
	console.error(`Bilinmeyen model: ${values.model}. Seçenekler: ${Object.keys(VOICE_MODELS).join(', ')}`);
	process.exit(2);
}

const candidates = (values.brand ? [...BRAND_VOICES] : (Object.keys(VOICES) as VoiceKey[])).filter(usable);
if (candidates.length === 0) {
	console.error('Denenecek kullanılabilir ses yok. Ayrıntı için: npm run voices');
	process.exit(1);
}
const cost = values.audition.length * candidates.length;
if (remaining !== null && cost > remaining) {
	console.error(`Bu deneme ${cost} karakter harcar; hesapta ${remaining} karakter kaldı.`);
	process.exit(1);
}

await mkdir(values.out, {recursive: true});
console.log(`${candidates.length} ses, toplam ${cost} karakter:`);
for (const voice of candidates) {
	const cast = castVoice({profile: 'Promoter', voice, model}, available);
	const file = path.join(values.out, `${voice}-${cast.modelId}.${SPEECH_AUDIO.extension}`);
	await writeFile(file, (await ELEVENLABS_SPEECH.narrate(values.audition, cast)).audio);
	console.log(`  ${file}`);
}
process.exit(0);
