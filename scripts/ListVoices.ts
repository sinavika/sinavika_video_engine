/**
 * Shows who narrates what, and lets you listen before committing to a voice.
 *
 *   npm run voices
 *       The voice profiles, which of their voices this ElevenLabs account can
 *       use, and who is cast for each profile right now.
 *
 *   npm run voices -- --audition "Dikkat! Bu soru sınavda çıkabilir."
 *       Speaks the sentence with every usable voice of the catalogue and saves
 *       the clips to out/Auditions/. Costs sentence length x number of voices.
 *
 *   npm run voices -- --audition "..." --profile Energizer --model stable
 *       Auditions only one profile's shortlist, optionally with the steadier model.
 */
import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {parseArgs} from 'node:util';
import {
	VOICES,
	VOICE_MODELS,
	VOICE_PROFILES,
	VOICE_PROFILE_KEYS,
	type VoiceKey,
	type VoiceModelKey,
	type VoiceProfileKey,
} from '../src/Configurations/Voices';
import {ELEVENLABS_SPEECH} from '../src/Services/ElevenLabsSpeech';
import {castVoice} from '../src/Services/VoiceCasting';

const {values} = parseArgs({
	options: {
		audition: {type: 'string'},
		profile: {type: 'string'},
		model: {type: 'string'},
		out: {type: 'string', default: 'out/Auditions'},
	},
});

const available = await ELEVENLABS_SPEECH.availableVoiceIds();
const remaining = await ELEVENLABS_SPEECH.remainingCharacters();
const usable = (voice: VoiceKey) => available.has(VOICES[voice].elevenLabsId);
const describe = (voice: VoiceKey) => {
	const {name, origin, character} = VOICES[voice];
	return `${usable(voice) ? '✓' : '·'} ${name.padEnd(12)} ${(origin === 'native' ? 'Türkçe' : 'çok dilli').padEnd(10)} ${character}`;
};

if (!values.audition) {
	console.log(`ElevenLabs hesabı: bu dönem ${remaining ?? '?'} karakter kaldı.  ✓ kullanılabilir   · hesapta yok\n`);
	for (const key of VOICE_PROFILE_KEYS) {
		const profile = VOICE_PROFILES[key];
		const cast = castVoice({profile: key}, available);
		console.log(`${key}: ${profile.description}`);
		console.log(`  Şu an seslendiren: ${cast.voiceName} (${cast.modelId}, tempo ${cast.pace})`);
		profile.voices.forEach((voice) => console.log(`    ${describe(voice)}`));
		console.log('');
	}
	const missing = (Object.keys(VOICES) as VoiceKey[]).filter((voice) => VOICES[voice].origin === 'native' && !usable(voice));
	if (missing.length > 0) {
		console.log('Hesaba eklenmemiş Türkçe sesler (dinlemek ve "My Voices"a eklemek için; API kullanımı ücretli plan ister):');
		missing.forEach((voice) =>
			console.log(`  ${VOICES[voice].name.padEnd(12)} https://elevenlabs.io/app/voice-library?voiceId=${VOICES[voice].elevenLabsId}`),
		);
	}
	process.exit(0);
}

const profileKey = values.profile as VoiceProfileKey | undefined;
if (profileKey && !VOICE_PROFILES[profileKey]) {
	console.error(`Bilinmeyen profil: ${values.profile}. Seçenekler: ${VOICE_PROFILE_KEYS.join(', ')}`);
	process.exit(2);
}
const model = (values.model ?? 'expressive') as VoiceModelKey;
if (!VOICE_MODELS[model]) {
	console.error(`Bilinmeyen model: ${values.model}. Seçenekler: ${Object.keys(VOICE_MODELS).join(', ')}`);
	process.exit(2);
}

const candidates = (profileKey ? [...VOICE_PROFILES[profileKey].voices] : (Object.keys(VOICES) as VoiceKey[])).filter(usable);
const cost = values.audition.length * candidates.length;
if (remaining !== null && cost > remaining) {
	console.error(`Bu deneme ${cost} karakter harcar; hesapta ${remaining} karakter kaldı.`);
	process.exit(1);
}

await mkdir(values.out, {recursive: true});
console.log(`${candidates.length} ses, toplam ${cost} karakter:`);
for (const voice of candidates) {
	const cast = castVoice({profile: profileKey ?? 'Teacher', voice, model}, available);
	const file = path.join(values.out, `${voice}-${cast.modelId}.mp3`);
	await writeFile(file, await ELEVENLABS_SPEECH.synthesize(values.audition, cast));
	console.log(`  ${file}`);
}
process.exit(0);
