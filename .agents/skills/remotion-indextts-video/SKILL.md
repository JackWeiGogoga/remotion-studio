---
name: remotion-indextts-video
description: Build, regenerate, diagnose, and repair Remotion voiceover videos in this remotion-studio repository using local IndexTTS, speaker profiles, reference voices, scene scripts, safe cleanup, measured frame timing, and approved render assets. Use for new narration, reference-voice changes, voice cloning, "chi"/click/burst artifacts, swallowed endings, or audio-timeline synchronization.
---

# Remotion IndexTTS Video

Work inside `/Users/jackwei/data/remotion-studio`. Read `docs/audio-workflow.md` before changing audio conventions.

## Voice Selection

1. Read `resources/voices/<speaker>/profile.json`.
2. Use `preferredReference` when the file exists.
3. Use `fallbackReference` only when the preferred private file is unavailable, and report the fallback.
4. For `jackwei`, prefer `resources/voices/jackwei/private/2026-07-13-jackwei-natural-cn-v02.wav`. The user validated this reference without the prior recurring "chi" artifacts.

Keep private and tracked references under the same speaker root:

```text
resources/voices/<speaker>/
  profile.json
  private/       # local, ignored by Git
  tracked/       # approved fallback references
```

## Generate

1. Write `.tmp/tts/<video-id>/scene-XX.txt` files.
2. Generate raw audio into a reference-specific directory so previous runs remain available.
3. Clean into a separate directory with `scripts/clean-voiceover.py`.
4. Copy only selected cleaned WAVs to `public/videos/<video-id>/audio/voiceover/`.
5. Replace Remotion timing with measured frame counts.
6. Render a still, then the full video when timing or audio changed.

```bash
python3 scripts/generate-indextts-voiceover.py \
  --device mps \
  --voice resources/voices/jackwei/private/2026-07-13-jackwei-natural-cn-v02.wav \
  --input-dir .tmp/tts/<video-id> \
  --output-dir .tmp/tts/<video-id>/indextts-voice0713 \
  --start 1 \
  --end 8

python3 scripts/clean-voiceover.py \
  --input-dir .tmp/tts/<video-id>/indextts-voice0713 \
  --output-dir .tmp/tts/<video-id>/indextts-voice0713-clean \
  --fps 30 \
  --tail-frames 24 \
  --print-frames
```

Cleanup must preserve internal pauses and the complete generated tail. It may trim leading silence, add short fades, convert to 48 kHz mono, and limit peaks without automatic makeup gain.

## Diagnose And Repair

1. Cut a review clip around the reported timestamp.
2. Compare raw and cleaned WAVs before changing text.
3. If only the cleaned WAV is bad, fix cleanup; do not regenerate.
4. If the raw WAV contains a model phoneme, click, burst, swallowed syllable, or stop-start artifact, rewrite the affected scene with shorter clauses and regenerate only that scene.
5. Keep raw, clean, rewrite, and rewrite-clean outputs separate until approval.

Do not stack de-essers or heavy EQ over model-generated phoneme artifacts.

## Verify

Run `npm run lint`, `git diff --check`, a representative still, a full render, and `ffprobe` on the final MP4. Decode the final audio/video streams and provide short review clips for reported artifacts or sentence endings.
