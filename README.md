# Remotion Studio

Personal workspace for building videos with Remotion. The repository currently contains only the base scaffold and a blank composition used to verify that Remotion Studio starts correctly.

## Bootstrap

The repository was initialized with the official Remotion CLI:

```bash
npx create-video@latest --yes --blank remotion-studio
```

At initialization time, `create-video@4.0.487` was resolved. The generated scaffold included Tailwind CSS v4 integration, which was intentionally retained for static styling.

## Commands

```bash
npm install
npm run dev
npm run lint
npm run build
```

## Structure

```text
.agents/skills/  Repository-specific agent workflows
docs/            Production and visual documentation
packages/        Shared workspace packages
public/shared/   Shared fonts, audio, and brand assets
public/videos/   Approved render assets namespaced by video ID
resources/voices/ Speaker-first TTS references with private/tracked tiers
scripts/         Repository automation
src/videos/      Video compositions and scenes
.tmp/tts/        Temporary TTS output, ignored by Git
out/             Generated renders, ignored by Git
```

Tailwind CSS is available for static layout and styling. Frame-dependent animation must be driven by Remotion APIs such as `useCurrentFrame()` and `interpolate()` rather than CSS transitions or animation classes.

## Audio

Use the scene-based workflow in [docs/audio-workflow.md](docs/audio-workflow.md) for local IndexTTS voiceover generation, cleanup, frame-count timing, and artifact repair. References are grouped by speaker under `resources/voices/<speaker>/`: `private/` holds ignored local recordings, `tracked/` holds approved versioned fallbacks, and `profile.json` records the preferred and fallback references.

## License

This repository is private and unlicensed. Remotion has separate licensing terms for some organizations; see the [Remotion license](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
