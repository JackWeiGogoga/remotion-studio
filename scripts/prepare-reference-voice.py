#!/usr/bin/env python3
import argparse
import json
import subprocess
from datetime import date
from pathlib import Path


def probe(path: Path) -> dict:
    result = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration:stream=sample_rate,channels",
            "-of",
            "json",
            str(path),
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    data = json.loads(result.stdout)
    stream = data["streams"][0]
    return {
        "durationSeconds": round(float(data["format"]["duration"]), 6),
        "sampleRateHz": int(stream["sample_rate"]),
        "channels": int(stream["channels"]),
    }


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Convert a recorded reference voice into the repository voice library format.",
    )
    parser.add_argument("--input", required=True, help="Input recording, for example a .m4a file.")
    parser.add_argument("--speaker", required=True, help="Stable lowercase speaker id, e.g. jackwei.")
    parser.add_argument("--style", default="natural", help="Short style tag, e.g. natural, calm, course.")
    parser.add_argument("--language", default="cn", help="Language tag: cn, en, or cn-en.")
    parser.add_argument("--version", type=int, required=True, help="Reference version number.")
    parser.add_argument("--date", default=date.today().isoformat(), help="YYYY-MM-DD date prefix.")
    parser.add_argument(
        "--voices-dir",
        default="resources/voices",
        help="Voice library root containing one directory per speaker.",
    )
    parser.add_argument(
        "--visibility",
        choices=("private", "tracked"),
        default="private",
        help="Store the reference under the speaker's private or tracked tier.",
    )
    parser.add_argument("--notes", default="", help="Manifest note for this reference.")
    args = parser.parse_args()

    input_path = Path(args.input).expanduser().resolve()
    if not input_path.is_file():
        raise FileNotFoundError(f"Missing input recording: {input_path}")

    speaker = args.speaker.strip().lower()
    filename = f"{args.date}-{speaker}-{args.style}-{args.language}-v{args.version:02d}.wav"
    speaker_root = Path(args.voices_dir).expanduser().resolve() / speaker
    reference_dir = speaker_root / args.visibility
    output_path = reference_dir / filename
    manifest_path = reference_dir / "manifest.json"
    reference_dir.mkdir(parents=True, exist_ok=True)

    subprocess.run(
        [
            "ffmpeg",
            "-hide_banner",
            "-loglevel",
            "error",
            "-y",
            "-i",
            str(input_path),
            "-af",
            "silenceremove=start_periods=1:start_duration=0.05:start_threshold=-45dB,"
            "aresample=48000,aformat=sample_rates=48000:channel_layouts=mono,"
            "alimiter=limit=0.92:level=false",
            str(output_path),
        ],
        check=True,
    )

    meta = probe(output_path)
    if manifest_path.exists():
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    else:
        manifest = {"speaker": speaker, "default": filename, "references": []}

    manifest["speaker"] = speaker
    manifest["visibility"] = args.visibility
    manifest["default"] = filename
    manifest["references"] = [
        item for item in manifest.get("references", []) if item.get("file") != filename
    ]
    reference = {
        "file": filename,
        "style": args.style,
        "language": args.language,
        "version": args.version,
        **meta,
        "sourceFile": str(input_path) if args.visibility == "private" else input_path.name,
        "notes": args.notes,
    }
    manifest["references"].append(reference)
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(output_path)
    print(manifest_path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
