# Repository Instructions

## Purpose

This repository is a personal Remotion studio for producing multiple videos from one codebase. Keep it as one Git repository and treat each video as a composition-owned module, not as a nested project or nested Git repository.

The repository is still in its foundation phase. Do not invent a component system, theme API, visual language, TTS provider abstraction, or publishing workflow until the user defines those requirements.

## Communication

- Communicate with the user in Chinese unless they request another language.
- Use English for code identifiers, filenames, technical comments, and repository documentation unless the content itself must be Chinese.
- State assumptions and report verification results. Do not hide failed commands or unverified visual changes.

## Repository Layout

- `src/Root.tsx`: Register Remotion compositions.
- `src/videos/<video-id>/`: Own one video's compositions, scenes, content, schemas, and timing.
- `packages/`: Hold code that is demonstrably reusable across videos.
- `public/shared/`: Hold approved assets intentionally shared by multiple rendered videos.
- `public/videos/<video-id>/`: Hold approved render assets for one video.
- `resources/voices/`: Hold local TTS reference voices. Contents are private and ignored by Git by default.
- `.tmp/tts/<video-id>/`: Hold temporary TTS generations and intermediate audio.
- `docs/`: Hold production and visual-system documentation once those systems are defined.
- `scripts/`: Hold deterministic repository automation.
- `.agents/skills/`: Hold focused, repository-specific agent workflows.
- `out/`: Hold generated renders. Never commit it.

## Toolchain

- Use the Node.js version in `.nvmrc` and npm as the package manager.
- Run `npm install` only from the repository root.
- Keep one root `package-lock.json`; include lockfile changes whenever dependencies change.
- Keep all `remotion` and `@remotion/*` packages on the same exact version.
- Prefer existing dependencies. Explain why a new production dependency is necessary before adding it.

Useful commands:

```bash
npm run dev
npm run lint
npm run build
npx remotion still <composition-id> --frame=<frame>
npx remotion render <composition-id>
```

## Remotion Rules

- Make rendering deterministic for every frame.
- Drive animation with `useCurrentFrame()`, `interpolate()`, and Remotion timing utilities. Use `spring()` only when physical motion is intentional.
- Do not use CSS animations, CSS transitions, Tailwind `animate-*`, or Tailwind `transition-*` classes.
- Use Tailwind for static layout, typography, spacing, and color. Use inline styles for frame-dependent values such as opacity, translation, rotation, and scale.
- Do not use `Date.now()`, unseeded `Math.random()`, timers, or runtime state that can differ between rendered frames. Use Remotion's seeded `random()` when randomness is needed.
- Use `<Sequence>` or `<Series>` for timing and scene assembly. Keep durations and frame offsets explicit and named.
- Keep composition dimensions, FPS, duration, defaults, and schema close to the composition implementation.
- Use `staticFile()` for files under `public/`, `<Img>` for images, and media components from `@remotion/media` for audio and video.
- Do not hard-code machine-specific absolute paths in tracked code or configuration. Accept paths through arguments, environment variables, or video-local configuration.

## Code Boundaries

- Start video-specific code inside `src/videos/<video-id>/`.
- Extract code to `packages/` only after it has a clear reusable contract or is used by multiple videos.
- Keep content, timing data, and rendering components separate when doing so reduces scene complexity.
- Avoid large catch-all composition files. Split scenes by narrative responsibility.
- Do not modify unrelated videos when implementing one video.

## Assets And Audio

- Namespace all video assets under `public/videos/<video-id>/` to prevent collisions.
- Put approved voiceover used by a render in `public/videos/<video-id>/audio/voiceover/`.
- Put reusable TTS reference recordings in `resources/voices/<voice-id>/`; do not commit them unless the user explicitly chooses Git LFS or another versioning policy.
- Put auditions, failed generations, split segments, denoising intermediates, and other temporary TTS files under `.tmp/tts/<video-id>/`.
- Do not globally ignore media extensions: approved render inputs may need to be versioned.
- Never commit secrets, credentials, environment files, generated bundles, or final renders.

## Verification

- Run `npm run lint` after TypeScript, configuration, or dependency changes.
- Run `npm run build` after changes to shared packages, bundling, Tailwind integration, Remotion configuration, or dependencies.
- For visual work, inspect representative frames in Remotion Studio and render stills at scene boundaries or other high-risk frames.
- Render a full video when the user requests it or when timing, audio synchronization, transitions, or codecs need end-to-end verification.
- When a dev server is needed, start it, confirm it responds, and provide the local URL.

## Git Hygiene

- Preserve user changes and work with the existing worktree. Never discard unrelated modifications.
- Keep generated files in ignored directories and source files in tracked directories.
- Keep changes scoped to the requested workflow. Avoid opportunistic refactors.
- Before finishing, run `git diff --check` and report the final worktree status.

