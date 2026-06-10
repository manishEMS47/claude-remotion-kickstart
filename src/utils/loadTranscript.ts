import type { TranscriptWord } from "./segmentTranscript";

/**
 * Minimal shapes of the raw word objects returned by each provider. Only the
 * fields used for caption timing are modeled.
 */
interface RawWord {
	word?: string;
	punctuated_word?: string;
	start: number;
	end: number;
	confidence?: number;
}

interface DeepgramTranscript {
	results?: {
		channels?: Array<{
			alternatives?: Array<{ words?: RawWord[] }>;
		}>;
	};
}

interface SixtyDbTranscript {
	words?: RawWord[];
	segments?: Array<{ words?: RawWord[] }>;
}

/**
 * Normalizes a raw transcript JSON response from any supported provider into a
 * single `TranscriptWord[]` shape that `segmentTranscript()` and `<Caption>`
 * understand.
 *
 * Supported shapes:
 * - **Deepgram** (`/transcribe` default): words live at
 *   `results.channels[0].alternatives[0].words` and already carry
 *   `punctuated_word`.
 * - **60db** (`/transcribe --provider 60db`): a flat `words` array (or
 *   `segments[].words[]`) of `{ word, start, end, confidence }`. There is no
 *   `punctuated_word`, so the raw `word` is used for both fields.
 *
 * This keeps the React/caption layer provider-agnostic: transcripts from
 * either backend drive captions identically.
 */
export function normalizeTranscript(json: unknown): TranscriptWord[] {
	const deepgram = json as DeepgramTranscript;
	const deepgramWords =
		deepgram.results?.channels?.[0]?.alternatives?.[0]?.words;
	if (Array.isArray(deepgramWords)) {
		return deepgramWords.map(toTranscriptWord);
	}

	const sixtyDb = json as SixtyDbTranscript;
	if (Array.isArray(sixtyDb.words) && sixtyDb.words.length > 0) {
		return sixtyDb.words.map(toTranscriptWord);
	}

	if (Array.isArray(sixtyDb.segments)) {
		return sixtyDb.segments
			.flatMap((s) => s.words ?? [])
			.map(toTranscriptWord);
	}

	throw new Error(
		"Unrecognized transcript format: expected Deepgram (results.channels) or 60db (words / segments[].words).",
	);
}

function toTranscriptWord(w: RawWord): TranscriptWord {
	const text = w.word ?? w.punctuated_word ?? "";
	return {
		word: text,
		start: Number(w.start),
		end: Number(w.end),
		confidence: typeof w.confidence === "number" ? w.confidence : 1,
		punctuated_word: w.punctuated_word ?? text,
	};
}
