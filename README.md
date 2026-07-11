# Remotion Studio

Personal workspace for building videos with Remotion. The repository currently contains only the base scaffold and a blank composition used to verify that Remotion Studio starts correctly.

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
public/videos/   Assets namespaced by video ID
scripts/         Repository automation
src/videos/      Video compositions and scenes
out/             Generated renders, ignored by Git
```

Tailwind CSS is available for static layout and styling. Frame-dependent animation must be driven by Remotion APIs such as `useCurrentFrame()` and `interpolate()` rather than CSS transitions or animation classes.

## License

This repository is private and unlicensed. Remotion has separate licensing terms for some organizations; see the [Remotion license](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
