---
allowed-tools: Read, Bash(curl*, ffmpeg*)
argument-hint: [media-filename] [--provider deepgram|60db]
description: Transcribe audio from video/audio files with Deepgram or 60db
---

## context

Two transcription providers are supported behind a single interface:

- **Deepgram** (`--provider deepgram`, **default**) —
  `POST https://api.deepgram.com/v1/listen`, auth `Authorization: Token $DEEPGRAM_API_KEY`.
- **60db** (`--provider 60db`) —
  `POST https://api.60db.ai/stt` (multipart), auth `Authorization: Bearer $SIXTYDB_API_KEY`.
  See @context/60db.md.

Both write word-level timestamps. The output JSON is saved the same way for
either provider, and `src/utils/loadTranscript.ts` → `normalizeTranscript()`
turns either shape into the `TranscriptWord[]` that `segmentTranscript()` and
`<Caption>` consume — so captions work identically regardless of provider.

The relevant API key is already set in the environment (`DEEPGRAM_API_KEY` or
`SIXTYDB_API_KEY`). For advanced Deepgram settings (diarization, language
detection, etc.), read @context/deepgram.md.

## task

Transcribe the audio from the media file at `$1`:

1. **Parse arguments**:
   - `$1` is the media file path (required).
   - `--provider deepgram|60db` (optional, default `deepgram`).

2. **For video files** (mp4, mov, avi, mkv, etc.):
   - Extract audio to MP3 using ffmpeg: `ffmpeg -i input.mp4 -vn -acodec libmp3lame -q:a 2 output.mp3`
   - Use the original filename stem (e.g., video.mp4 → video.mp3)
   - Transcribe the extracted audio file.

3. **For audio files** (mp3, wav, etc.):
   - Transcribe directly.

4. **If `--provider deepgram`** (default):
   - Use `nova-3` model, `smart_format=true`, `punctuate=true`,
     `filler_words=true`, `paragraphs=true`.

     ```bash
     curl -X POST "https://api.deepgram.com/v1/listen?model=nova-3&smart_format=true&punctuate=true&filler_words=true&paragraphs=true" \
       -H "Authorization: Token $DEEPGRAM_API_KEY" \
       -H "Content-Type: audio/mpeg" \
       --data-binary @audio_file.mp3
     ```

5. **If `--provider 60db`**:
   - Send the file as multipart with word-level timestamps and confidence.
     (`return_timestamps=word` and `include_confidence=true` are required for
     caption timing.)

     ```bash
     curl -X POST https://api.60db.ai/stt \
       -H "Authorization: Bearer $SIXTYDB_API_KEY" \
       -F "file=@audio_file.mp3" \
       -F "language=auto" \
       -F "return_timestamps=word" \
       -F "include_confidence=true"
     ```

6. **Save output** (same for both providers):
   - Save the JSON response to `{original_filename_stem}_transcript.json`
   - Example: `interview.mp4` → `interview_transcript.json`
   - Report the transcript location and show a snippet of the text
     (Deepgram: `results.channels[0].alternatives[0].transcript`;
     60db: `text`).

7. **Using the transcript for captions** (provider-agnostic):

   ```tsx
   import { normalizeTranscript } from "./utils/loadTranscript";
   import { segmentTranscript } from "./utils/segmentTranscript";
   import raw from "./interview_transcript.json";

   const words = normalizeTranscript(raw); // works for Deepgram OR 60db
   const segments = segmentTranscript(words);
   // feed segment.words to <Caption words={...} />
   ```

## examples

```
# Deepgram (default)
/transcribe public/audio/voiceover.mp3

# 60db
/transcribe public/audio/voiceover.mp3 --provider 60db
```
