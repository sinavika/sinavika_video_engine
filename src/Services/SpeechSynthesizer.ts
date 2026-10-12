import {MsEdgeTTS, OUTPUT_FORMAT} from 'msedge-tts';
import type {VoiceoverProvider} from '../Configurations/Voiceover';

export type SpeechRequest = {
	text: string;
	/** Provider voice name, e.g. tr-TR-EmelNeural. */
	voice: string;
	language: string;
	/** Relative speed and pitch, e.g. "+6%". */
	rate: string;
	pitch: string;
};

/** Turns text into MP3 bytes. Adding a provider is one more function of this shape. */
export type SpeechSynthesizer = (request: SpeechRequest) => Promise<Buffer>;

const escapeXml = (text: string): string =>
	text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const SYNTHESIS_TIMEOUT_MILLISECONDS = 30_000;

/** One connection per voice, reused for every line: opening a socket per line gets throttled. */
const edgeClients = new Map<string, Promise<MsEdgeTTS>>();

const edgeClient = (voice: string, language: string): Promise<MsEdgeTTS> => {
	const key = `${voice}|${language}`;
	let client = edgeClients.get(key);
	if (!client) {
		client = (async () => {
			const created = new MsEdgeTTS();
			await created.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3, {voiceLocale: language});
			return created;
		})();
		edgeClients.set(key, client);
		client.catch(() => edgeClients.delete(key));
	}
	return client;
};

const dropEdgeClient = async (voice: string, language: string): Promise<void> => {
	const key = `${voice}|${language}`;
	const client = edgeClients.get(key);
	edgeClients.delete(key);
	(await client?.catch(() => undefined))?.close();
};

/**
 * Microsoft Edge's read-aloud service. Needs no account, which makes it handy
 * for development and previews. It is not an official API, throttles bursts
 * and has no service guarantee: use the Azure provider for production.
 */
const synthesizeWithEdge: SpeechSynthesizer = async ({text, voice, language, rate, pitch}) => {
	try {
		const client = await edgeClient(voice, language);
		const {audioStream} = client.toStream(escapeXml(text), {rate, pitch});
		return await new Promise<Buffer>((resolve, reject) => {
			const chunks: Buffer[] = [];
			const timer = setTimeout(() => reject(new Error('Speech synthesis timed out.')), SYNTHESIS_TIMEOUT_MILLISECONDS);
			const finish = () => {
				clearTimeout(timer);
				if (chunks.length === 0) reject(new Error('Speech synthesis returned no audio.'));
				else resolve(Buffer.concat(chunks));
			};
			audioStream.on('data', (chunk: Buffer) => chunks.push(chunk));
			audioStream.on('end', finish);
			audioStream.on('close', finish);
			audioStream.on('error', (error) => {
				clearTimeout(timer);
				reject(error);
			});
		});
	} catch (error) {
		// A failed socket is not reused; the next attempt opens a fresh one.
		await dropEdgeClient(voice, language);
		throw error;
	}
};

/**
 * Azure AI Speech (official). Reads AZURE_SPEECH_KEY and AZURE_SPEECH_REGION
 * from the environment. Offers the same voices as the Edge provider.
 */
const synthesizeWithAzure: SpeechSynthesizer = async ({text, voice, language, rate, pitch}) => {
	const key = process.env.AZURE_SPEECH_KEY;
	const region = process.env.AZURE_SPEECH_REGION;
	if (!key || !region) {
		throw new Error('The azure voice-over provider needs AZURE_SPEECH_KEY and AZURE_SPEECH_REGION to be set.');
	}
	const response = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
		method: 'POST',
		headers: {
			'Ocp-Apim-Subscription-Key': key,
			'Content-Type': 'application/ssml+xml',
			'X-Microsoft-OutputFormat': 'audio-24khz-96kbitrate-mono-mp3',
			'User-Agent': 'sinavika-video-engine',
		},
		body: `<speak version="1.0" xml:lang="${language}"><voice name="${voice}"><prosody rate="${rate}" pitch="${pitch}">${escapeXml(text)}</prosody></voice></speak>`,
		signal: AbortSignal.timeout(SYNTHESIS_TIMEOUT_MILLISECONDS),
	});
	if (!response.ok) {
		throw new Error(`Azure Speech responded ${response.status} ${response.statusText}.`);
	}
	return Buffer.from(await response.arrayBuffer());
};

export const SPEECH_SYNTHESIZERS: Record<VoiceoverProvider, SpeechSynthesizer> = {
	edge: synthesizeWithEdge,
	azure: synthesizeWithAzure,
};
