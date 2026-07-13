# Jackwei Voice References

Use `profile.json` as the source of truth for reference priority.

- `private/` contains local preferred references and is ignored by Git.
- `tracked/` contains approved repository fallbacks.
- Keep filenames immutable; add a higher `vNN` for a new recording.
- Do not promote a private WAV to `tracked/` without explicit approval.
