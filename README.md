![Claude Remotion Kickstart](public/images/logo.png)

Create videos programmatically with Claude Code and Remotion. This starter kit provides pre-built components, AI integrations, and a streamlined workflow for generating professional videos.

**[Watch the demo on YouTube](https://youtu.be/z7Bkf3Vc63U)** to see how it works.

> **WARNING:** This repository was put together as an experiment with a significant amount of vibe-coding. There are surely many bugs and inconsistencies in the documentation. If I get around to cleaning things up in the future, I'll remove this warning. Use at your own risk, and have fun!

## Features

- **Pre-built video components** - Title slides, code blocks, diagrams, captions, and more
- **AI-powered asset generation** - Generate images, videos, and voiceovers with slash commands
- **Configurable rendering** - Customize fps and resolution with video presets
- **Tailwind CSS styling** - Customize everything with familiar utility classes
- **Transcript-based timing** - Sync visuals to voiceovers with word-level timestamps

## Prerequisites

### Required

- **Node.js 20+** - [Download](https://nodejs.org/)
- **pnpm** - Install with `npm install -g pnpm`
- **Claude Code** - [Install Claude Code](https://docs.anthropic.com/en/docs/claude-code) to use slash commands
- **ffmpeg** - Required for video/audio processing
  - macOS: `brew install ffmpeg`
  - Ubuntu/Debian: `sudo apt install ffmpeg`
  - Windows: [Download](https://ffmpeg.org/download.html)

### Optional (for AI features)

These are only needed if you want to use the AI-powered slash commands:

- **Replicate API key** - For image/video generation (`/generate-image`, `/generate-video`)
- **Deepgram API key** - For transcription (`/transcribe`)
- **ElevenLabs API key** - For voiceovers and sound effects (via MCP or `/generate-voiceover`)
- **60db API key** - For voiceovers and transcription (`/generate-voiceover`, `/transcribe --provider 60db`)

## Installation

### Create from template

This is a GitHub template repository. To start a new project:

1. Click **"Use this template"** at the top of [this repository](https://github.com/jhartquist/claude-remotion-kickstart)
2. Choose **"Create a new repository"**
3. Name your repository and create it
4. Clone your new repository:

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
cd YOUR-REPO-NAME

# Install dependencies
pnpm install
```

> **Note:** Using the template creates an independent repository with a clean git history. This is different from forking, which maintains a connection to the original repo.

## Environment Variables

Environment variables must be set in your shell for AI features to work. A `.env` file will not be read automatically.

```bash
# Replicate - for /generate-image and /generate-video
export REPLICATE_API_TOKEN=your_replicate_token

# Deepgram - for /transcribe
export DEEPGRAM_API_KEY=your_deepgram_key

# ElevenLabs - for voiceovers (via MCP server or /generate-voiceover)
export ELEVENLABS_API_KEY=your_elevenlabs_key

# 60db - for voiceovers and transcription (/generate-voiceover, /transcribe --provider 60db)
export SIXTYDB_API_KEY=your_60db_key
```

## Quick Start

A starter composition called `MyVideo` is already included—you can start editing right away.

### 1. Preview in the studio

```bash
pnpm run dev
```

Open <http://localhost:3000> to see the example videos and `MyVideo`.

### 2. Edit your content

```typescript
// src/compositions/my-video/content.ts
export const CONTENT = {
  title: "My First Video",
  subtitle: "Created with Claude and Remotion",
};
```

### 3. Render the final video

```bash
pnpm exec remotion render MyVideo
```

Output will be saved to `out/MyVideo.mp4`.

### 4. Create more compositions

When you're ready to create additional videos, use the Claude Code slash command:

```bash
/new-composition another-video
```

This creates a new folder in `src/compositions/` with boilerplate config, content, and segments.

## Commands

```bash
# Start development preview
pnpm run dev

# Render a composition
pnpm exec remotion render <CompositionId>

# Render a still frame
pnpm exec remotion still <CompositionId>

# Lint code
pnpm run lint

# Upgrade Remotion
pnpm run upgrade
```

## GitHub Actions

A workflow is included to render videos in CI. By default it's manual-only to avoid using CI minutes unexpectedly.

To run it, go to **Actions > Render video > Run workflow** in your GitHub repo. The rendered video is uploaded as an artifact you can download.

To render automatically on pull requests, add `pull_request` to the trigger:

```yaml
on:
  pull_request:
  workflow_dispatch:
```

## Slash Commands (Claude Code)

When using Claude Code, these slash commands are available:

| Command                    | Description                               |
| -------------------------- | ----------------------------------------- |
| `/new-composition <name>`     | Create a new composition with boilerplate     |
| `/generate-image <prompt>`    | Generate an image with Nano Banana Pro        |
| `/generate-video <prompt>`    | Generate a video with Veo 3.1                 |
| `/generate-voiceover <text>`  | Generate a voiceover with 60db or ElevenLabs  |
| `/transcribe <file>`          | Transcribe audio/video with Deepgram or 60db  |
| `/screenshot <url>`           | Take a full-page screenshot                   |

## Video Presets

Custom presets can be easily created in `src/presets.ts`. Default presets render at 60fps:

| Preset            | Resolution | Aspect Ratio |
| ----------------- | ---------- | ------------ |
| `Landscape-720p`  | 1280×720   | 16:9         |
| `Landscape-1080p` | 1920×1080  | 16:9         |
| `Square-1080p`    | 1080×1080  | 1:1          |
| `Portrait-1080p`  | 1080×1920  | 9:16         |

## Components

### Slides

| Component      | Description                                 |
| -------------- | ------------------------------------------- |
| `TitleSlide`   | Full-screen title with optional subtitle    |
| `ContentSlide` | Header with body text                       |
| `CodeSlide`    | Syntax-highlighted code with optional title |
| `DiagramSlide` | Mermaid or D2 diagrams                      |
| `VideoSlide`   | Embed video files                           |

### Overlays

| Component | Description                       |
| --------- | --------------------------------- |
| `Logo`    | Animated logo in corner           |
| `Caption` | Subtitle/caption overlay          |
| `Music`   | Background audio with fade in/out |

### Media

| Component       | Description                        |
| --------------- | ---------------------------------- |
| `BRollVideo`    | Video with zoom and timing control |
| `ZoomableVideo` | Video with multiple zoom segments  |
| `Screenshot`    | Scrolling screenshot animation     |
| `AsciiPlayer`   | Terminal recording playback        |
| `Code`          | Syntax-highlighted code block      |
| `Diagram`       | Mermaid/D2 diagram renderer        |

## Styling

Components use a black/white default theme. Override with Tailwind classes:

```tsx
// Default: black background, white text
<TitleSlide title="Hello" />

// Custom theme
<TitleSlide
  title="Hello"
  className="bg-gradient-to-r from-blue-900 to-purple-900 text-yellow-300"
/>
```

## Timing

Use `secondsToFrames()` to convert seconds to frames:

```tsx
import { secondsToFrames } from "../../config";
import { Sequence } from "remotion";

// Show logo from 5.2s to 7.9s
<Sequence from={secondsToFrames(5.2)} durationInFrames={secondsToFrames(2.7)}>
  <Logo src="logo.svg" />
</Sequence>;
```

## Transitions

Use Remotion's built-in `TransitionSeries` for transitions:

```tsx
import { TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { linearTiming } from "@remotion/transitions";

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={180}>
    <TitleSlide title="Hello" />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({ durationInFrames: 30 })}
  />
  <TransitionSeries.Sequence durationInFrames={300}>
    <ContentSlide header="Welcome" content="..." />
  </TransitionSeries.Sequence>
</TransitionSeries>;
```

## Project Structure

```
src/
├── components/          # Reusable video components
├── compositions/        # Your video projects
│   ├── example1/        # Basic slideshow example
│   └── example2/        # Multi-feature demo
├── utils/               # Helper functions
├── config.ts            # Timing utilities
├── presets.ts           # Video resolution presets
└── Root.tsx             # Composition registry

public/                  # Static assets (images, audio, video)
```

## Resources

- [Remotion Documentation](https://www.remotion.dev/docs/)
- [Remotion Discord](https://discord.gg/6VzzNDwUwV)
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code)

## License

This starter kit is [MIT licensed](LICENSE).

**Note:** Remotion itself has separate licensing requirements. Companies with 3+ employees need a Remotion license to render videos. See the [Remotion License](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md) for details.
