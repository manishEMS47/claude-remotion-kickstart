---
allowed-tools: Read, AskUserQuestion, Bash(curl*, jq*, base64*, ffprobe*, mkdir*, ls*)
argument-hint: [text] [--provider 60db|elevenlabs] [--voice <id>] [--out <name>]
description: Generate a voiceover with 60db or ElevenLabs (unified, consistent output)
---

## context

Generate a spoken voiceover from text and save it as an mp3 in
`public/audio/` so it can be used in a Remotion composition.

Two providers are supported behind a single, consistent interface:

- **60db** (`--provider 60db`) — `POST https://api.60db.ai/tts-synthesize`,
  auth `Authorization: Bearer $SIXTYDB_API_KEY`. Returns JSON with
  base64 audio. See @context/60db.md for full reference.
- **ElevenLabs** (`--provider elevenlabs`) —
  `POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}`,
  auth `xi-api-key: $ELEVENLABS_API_KEY`. Returns mp3 bytes directly.

**Default provider is `60db`.** Whichever provider is used, the output is
normalized identically: a single `public/audio/<name>.mp3` plus a printed
summary (provider, voice, path, duration). This keeps voiceovers
interchangeable between providers.

The relevant API key for the chosen provider must already be set in the
environment (`SIXTYDB_API_KEY` or `ELEVENLABS_API_KEY`).

## task

Generate a voiceover from the text in `$1`:

1. **Parse arguments**:
   - `$1` is the text to speak (required, max 5000 chars).
   - `--provider 60db|elevenlabs` (optional, default `60db`).
   - `--voice <id>` (optional voice id; if omitted use the provider default).
   - `--out <name>` (optional output filename stem; default `voiceover`).
   - Ensure the output directory exists: `mkdir -p public/audio`.

2. **If `--provider 60db`** (default):
   - Call the synthesize endpoint and decode the base64 audio to mp3:

     ```bash
     curl -sS -X POST https://api.60db.ai/tts-synthesize \
       -H "Authorization: Bearer $SIXTYDB_API_KEY" \
       -H "Content-Type: application/json" \
       -d "$(jq -n --arg t "$1" '{text:$t, output_format:"mp3"}')" \
       -o /tmp/60db_tts.json
     jq -r '.audio_base64' /tmp/60db_tts.json | base64 -d > public/audio/<name>.mp3
     ```

   - Add `voice_id` to the JSON body when `--voice` is provided
     (use `jq -n --arg t "$1" --arg v "<id>" '{text:$t, voice_id:$v, output_format:"mp3"}'`).
   - Read `duration_seconds` from the JSON for the summary.
   - To pick a voice, list available voices first:
     `curl -sS https://api.60db.ai/myvoices -H "Authorization: Bearer $SIXTYDB_API_KEY" | jq '.data[] | {voice_id, name, model}'`
   - On Windows, if `base64`/`jq` are unavailable, decode with PowerShell:
     `[IO.File]::WriteAllBytes("public/audio/<name>.mp3", [Convert]::FromBase64String((Get-Content /tmp/60db_tts.json | ConvertFrom-Json).audio_base64))`

3. **If `--provider elevenlabs`**:
   - Default voice id `21m00Tcm4TlvDq8ikWAM` (Rachel) when `--voice` is omitted.
   - The response is mp3 bytes — write straight to the file with `-o`:

     ```bash
     curl -sS -X POST "https://api.elevenlabs.io/v1/text-to-speech/<voice_id>" \
       -H "xi-api-key: $ELEVENLABS_API_KEY" \
       -H "Content-Type: application/json" \
       -d "$(jq -n --arg t "$1" '{text:$t, model_id:"eleven_multilingual_v2"}')" \
       -o public/audio/<name>.mp3
     ```

   - List voices with:
     `curl -sS https://api.elevenlabs.io/v1/voices -H "xi-api-key: $ELEVENLABS_API_KEY" | jq '.voices[] | {voice_id, name}'`

4. **Verify and report** (same for both providers):
   - Confirm the file exists and is non-empty (`ls -la public/audio/<name>.mp3`).
   - If `duration_seconds` was not returned (ElevenLabs), get it with
     `ffprobe -v error -show_entries format=duration -of csv=p=0 public/audio/<name>.mp3`.
   - Print a summary: provider, voice id, output path, duration in seconds.
   - Show how to use it in a composition:

     ```tsx
     import { Audio, staticFile, prefetch } from "remotion";

     prefetch(staticFile("audio/<name>.mp3"));
     // ...
     <Audio src={staticFile("audio/<name>.mp3")} />
     ```

   - Suggest running `/transcribe public/audio/<name>.mp3` to get word-level
     timestamps for captions.

## examples

```
# Default (60db), default voice
/generate-voiceover "Welcome to the channel. Today we are building a video with Claude."

# 60db with a specific voice
/generate-voiceover "This uses a custom 60db voice" --provider 60db --voice <voice_id>

# ElevenLabs, custom filename
/generate-voiceover "An ElevenLabs voiceover" --provider elevenlabs --out intro
```

## notes

- Keep text under 5000 characters per call; split long scripts into multiple
  files (`intro`, `body`, `outro`) and sequence them in the composition.
- 60db quality/expressiveness is controlled by `stability` (0–100) and
  `similarity` (0–100); `speed` accepts `0.5`–`2.0`.
- Both providers write to the **same** `public/audio/` location with the same
  naming, so switching `--provider` does not change how the composition
  references the audio.
- For low-latency/realtime use, 60db also exposes `/tts-stream` (NDJSON) and a
  WebSocket API — see @context/60db.md. For rendering, prefer `/tts-synthesize`.
