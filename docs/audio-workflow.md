# Audio Workflow

This repository uses a scene-based IndexTTS pipeline with speaker-first reference storage.

## Reference Layout

```text
resources/voices/<speaker>/
  profile.json                  # preferred and fallback relative paths
  README.md                     # speaker-specific policy
  private/
    manifest.json               # local metadata, ignored by Git
    YYYY-MM-DD-...-vNN.wav      # local preferred references
  tracked/
    manifest.json               # versioned metadata
    YYYY-MM-DD-...-vNN.wav      # approved repository fallback
```

Use `profile.json` as the source of truth. Resolve `preferredReference` first and use `fallbackReference` only when the preferred file is unavailable.

For `jackwei`:

- Preferred: `resources/voices/jackwei/private/2026-07-13-jackwei-natural-cn-v02.wav`
- Fallback: `resources/voices/jackwei/tracked/2026-07-02-jackwei-natural-cn-v01.wav`

The preferred v02 reference was user-validated without the recurring short "chi" artifacts heard with earlier productions. Keep it private unless the user explicitly chooses a versioning policy such as Git LFS.

## Reference Naming

Use `YYYY-MM-DD-speaker-style-language-vNN.wav`.

Prepare a private reference:

```bash
python3 scripts/prepare-reference-voice.py \
  --input ~/Downloads/my-reference.m4a \
  --voices-dir resources/voices \
  --speaker jackwei \
  --visibility private \
  --style natural \
  --language cn \
  --version 3 \
  --notes "Natural Chinese reference"
```

Use `--visibility tracked` only for an explicitly approved versioned fallback. Tracked manifests must not contain machine-specific absolute source paths.

## Production Layout

```text
.tmp/tts/<video-id>/
  scene-01.txt
  indextts-<reference-id>/
  indextts-<reference-id>-clean/
  indextts-rewrite/
  indextts-rewrite-clean/

public/videos/<video-id>/audio/voiceover/
  scene-01.wav
```

Use reference-specific temporary directory names so regeneration never overwrites prior auditions.

## Generate And Clean

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

Cleanup may trim leading silence, add short fades, convert to 48 kHz mono, and limit peaks with makeup gain disabled. Preserve sentence-level pauses and the complete generated tail. Removing internal pauses can create click/"chi" artifacts; threshold-based tail trimming can swallow final syllables.

Copy only selected cleaned WAVs into the video asset namespace and use the measured frame counts in Remotion.

## Artifact Repair

1. Cut a clip around the reported timestamp.
2. Compare raw and clean WAVs.
3. If the defect appears only after cleanup, repair cleanup and re-clean all affected scenes.
4. If the raw WAV is defective, rewrite the sentence with shorter clauses and regenerate only that scene.
5. Keep baselines and rewrites separate until approval.

Do not stack de-essers or heavy EQ over model-generated phoneme artifacts.
