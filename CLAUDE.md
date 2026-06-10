# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a Remotion video project designed to make it easier to create videos programmatically with Claude. The project uses React, TypeScript, and Tailwind CSS.

## Package Manager

**Always use `pnpm` for all commands.** Do not use `npm` or `npx`.

## Common Commands

```bash
# Install dependencies
pnpm i

# Start development preview
pnpm run dev

# Lint code
pnpm run lint

# Render a composition (by ID)
pnpm exec remotion render Example1-Landscape

# Render still image
pnpm exec remotion still Example1-Landscape

# Upgrade Remotion
pnpm run upgrade
```

## Architecture

### Project Structure

```
src/
├── components/              # Reusable components (black/white theme, className override)
│   ├── TitleSlide.tsx       # Full-screen title
│   ├── ContentSlide.tsx     # Header + body text
│   ├── CodeSlide.tsx        # Code with title
│   ├── DiagramSlide.tsx     # Mermaid/D2 diagrams
│   ├── VideoSlide.tsx       # Video playback
│   ├── BRollVideo.tsx       # B-roll with zoom
│   ├── ZoomableVideo.tsx    # Video with zoom segments
│   ├── Screenshot.tsx       # Scrolling screenshot
│   ├── Logo.tsx             # Logo overlay (animated)
│   ├── Caption.tsx          # Subtitle/caption overlay
│   ├── AsciiPlayer.tsx      # Terminal recording playback
│   ├── Code.tsx             # Syntax-highlighted code
│   ├── Diagram.tsx          # Diagram renderer
│   └── Music.tsx            # Background music with fade
├── compositions/
│   ├── example1/            # Reference: basic slideshow
│   └── example2/            # Reference: multi-feature demo
├── utils/
│   ├── createComposition.tsx  # Helper to create compositions
│   └── segmentTranscript.ts   # Parse transcripts for timing
├── config.ts                # Timing utilities: secondsToFrames(), framesToSeconds()
├── presets.ts               # VIDEO_PRESETS (aspect ratios, 60fps)
├── content.ts               # Sample content for component previews
└── Root.tsx                 # Composition registry
```

### Quick Start

1. **Run `/new-composition my-video`** - Create a new composition with boilerplate
2. **Edit `src/compositions/my-video/content.ts`** - Change the text
3. **Edit `src/compositions/my-video/config.ts`** - Adjust timing (in seconds)
4. **Run `pnpm exec remotion render MyVideo`** - Render your video

### Key Concepts

**Components** have black/white defaults with `className` prop for theming:

```tsx
// Default black background, white text
<TitleSlide title="Hello" />

// Custom theme via Tailwind classes
<TitleSlide title="Hello" className="bg-blue-900 text-yellow-300" />
```

**Transitions** use Remotion's built-in `<TransitionSeries>`, not component props:

```tsx
// GOOD: Use Remotion's TransitionSeries for fades
<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={180}>
    <TitleSlide title="Hello" />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({ durationInFrames: 30 })}
  />
  <TransitionSeries.Sequence durationInFrames={300}>
    <ContentSlide header="Main" content="..." />
  </TransitionSeries.Sequence>
</TransitionSeries>
```

**Timing** uses `<Sequence>` for positioning, not component props:

```tsx
import { secondsToFrames } from "../../config";

// GOOD: Position with Sequence (secondsToFrames defaults to 60fps)
<Sequence from={secondsToFrames(5.2)} durationInFrames={secondsToFrames(2.7)}>
  <Logo src="logo.svg" />
</Sequence>
```

### Timing Utilities

All utilities default to **60fps** and can be used anywhere (components, config files, etc.):

```tsx
import { secondsToFrames, framesToSeconds } from "../../config";

// Convert seconds to frames (defaults to 60fps)
secondsToFrames(2.5)        // => 150 frames
secondsToFrames(2.5, 30)    // => 75 frames (custom fps)

// Convert frames to seconds
framesToSeconds(150)        // => 2.5 seconds
framesToSeconds(150, 30)    // => 5 seconds (custom fps)
```

Use these for transcript-based timing:

```tsx
// In config.ts - define segment timing from transcript
export const SEGMENTS = {
  intro: { start: 0, end: 3.2 },
  feature: { start: 3.2, end: 8.5 },
};

// In Composition.tsx
<Sequence from={secondsToFrames(SEGMENTS.intro.start)}>
  <IntroSegment />
</Sequence>
```

### Composition Pattern

Use the `createComposition` helper:

```typescript
import { createComposition } from "../../utils/createComposition";

const MyVideoComposition: React.FC = () => {
  // ... video content
};

export const MyVideo = createComposition({
  name: "MyVideo",
  component: MyVideoComposition,
  durationInSeconds: 10,
  preset: "Landscape-1080p",
});
```

### Root.tsx Structure

- `Examples` folder with reference compositions
- `Components` folder with previews for each component
- Use `/new-composition` to add your own compositions

### Video Presets

All videos run at **60fps**. Available in `src/presets.ts`:

- `Landscape-720p`: 1280x720 @ 60fps
- `Landscape-1080p`: 1920x1080 @ 60fps
- `Square-1080p`: 1080x1080 @ 60fps
- `Portrait-1080p`: 1080x1920 @ 60fps

### Styling

- Use Tailwind CSS classes
- Default theme: `bg-black text-white`
- Override via `className` prop on most components
- Code uses `github-dark` theme by default
- AsciiPlayer uses `nord` theme by default

### Preloading Assets

For seamless playback in the Studio, prefetch audio/video assets. Use `staticFile()` for local files in `public/`:

```tsx
import { prefetch, staticFile } from "remotion";

// Prefetch at module level (outside component)
prefetch(staticFile("audio/music.mp3"));
prefetch(staticFile("audio/voiceover.mp3"));

const MyComposition: React.FC = () => {
  // <Audio> automatically uses prefetched blob URL
  return <Audio src={staticFile("audio/music.mp3")} />;
};
```

### Remotion Context

Reference `@context/remotion.md` for detailed Remotion patterns and APIs.
Reference `@context/remotion-video.md` for details around embedding videos.
Reference `@context/remotion-audio.md` for details around embedding audio.
Reference `@context/60db.md` for the 60db audio API (TTS + STT, used by `/generate-voiceover` and `/transcribe --provider 60db`).
Reference `@context/deepgram.md` for advanced Deepgram transcription options.

Use the `remotion-documentation` MCP tool for specific questions.

## Slash Commands

### /new-composition

Create a new video composition with boilerplate structure.

**Usage:** `/new-composition my-video-name`

Creates:

- Folder structure with config, content, segments
- Composition.tsx with createComposition helper
- Title and content segments

### /transcribe

Transcribe audio from video/audio files using Deepgram (default) or 60db.

**Usage:** `/transcribe path/to/media.mp4 [--provider deepgram|60db]`

Features:

- Auto-extracts audio from video files
- Outputs timestamped JSON transcript
- Use timestamps for precise segment timing
- Provider-agnostic: `normalizeTranscript()` (`src/utils/loadTranscript.ts`)
  converts either provider's output into the shape `segmentTranscript()` /
  `<Caption>` expect

### /generate-voiceover

Generate a voiceover from text using 60db (default) or ElevenLabs, behind a
single unified interface with consistent output.

**Usage:** `/generate-voiceover "Your script text" [--provider 60db|elevenlabs] [--voice <id>] [--out <name>]`

Features:

- Saves a normalized mp3 to `public/audio/<name>.mp3` for either provider
- 60db: `POST /tts-synthesize` (base64 JSON); ElevenLabs: REST `text-to-speech` (mp3 bytes)
- Reports provider, voice, path, and duration; suggests `/transcribe` for captions
- See `@context/60db.md` for the full 60db API (TTS, streaming, WebSocket, STT, voices)

### /generate-image

Generate images using Nano Banana Pro via Replicate.

**Usage:** `/generate-image A futuristic city at sunset`

### /generate-video

Generate videos using Veo 3.1 via Replicate.

**Usage:** `/generate-video A camera flying through clouds`

### /screenshot

Take full page screenshots at 1280x720 viewport.

**Usage:** `/screenshot https://example.com`

## MCP Tools

### Playwright

- Visit websites and take screenshots
- Debug compositions in browser
- Capture reference images

### ElevenLabs

- **Text-to-speech**: Generate voiceovers
- **Voice library**: Search and use voices
- **Sound effects**: Generate from text descriptions
- **Music generation**: Create background music

### Replicate

- **Veo 3.1**: Generate videos with audio
- **Nano Banana Pro**: Generate/edit images

## Component Reference

| Component     | Props                                                                                | Notes                 |
| ------------- | ------------------------------------------------------------------------------------ | --------------------- |
| TitleSlide    | `title`, `className?`                                                                | Full-screen title     |
| ContentSlide  | `header`, `content`, `className?`                                                    | Header + body         |
| CodeSlide     | `title?`, `code`, `language`, `highlightLines?`, `animatedHighlights?`, `className?` | Code with title       |
| DiagramSlide  | `title?`, `type`, `diagram`, `theme?`, `sketch?`, `className?`                       | Mermaid/D2            |
| VideoSlide    | `filename`, `startTime?`                                                             | Video playback        |
| BRollVideo    | `filename`, `startTime?`, `endTime?`, `zoomStart?`, `zoomEnd?`, `playbackRate?`      | B-roll with zoom      |
| ZoomableVideo | `src`, `zoomSegments`                                                                | Multiple zoom regions |
| Screenshot    | `src`, `scrollSpeed?`, `scrollDelaySeconds?`                                         | Scrolling screenshot  |
| Logo          | `src`, `alt?`, `position?`, `size?`                                                  | Animated logo overlay |
| Caption       | `transcript`, `className?`                                                           | Subtitle overlay      |
| AsciiPlayer   | `mode`, `castFile`, `playbackSpeed?`, `startTime?`, `theme?`                         | Terminal recording    |
| Code          | `code`, `language`, `highlightLines?`, `animatedHighlights?`, `theme?`               | Syntax highlighting   |
| Diagram       | `type`, `diagram`, `theme?`, `sketch?`                                               | Render diagrams       |
| Music         | `src`, `volume?`, `fadeInSeconds?`, `fadeOutSeconds?`, `loop?`                       | Background audio      |

## Workflow Examples

### Basic Video Creation

1. Run `/new-composition my-video` to create a new composition
2. Edit `src/compositions/my-video/content.ts` with your text
3. Edit `src/compositions/my-video/config.ts` for timing
4. Add/modify segments as needed
5. Render: `pnpm exec remotion render MyVideo`

### AI-Generated Assets

1. Use `/generate-image` for reference images
2. Use `/generate-video` for video clips
3. Use ElevenLabs MCP tools for voiceovers
4. Combine assets in Remotion compositions

### Timed Content from Transcripts

1. `/transcribe video.mp4` to get timestamps
2. Parse `results.channels[0].alternatives[0].words`
3. Create segments timed to the transcript
4. Use `<Sequence from={...}>` for precise positioning

---

- Don't run the dev server unless explicitly asked
