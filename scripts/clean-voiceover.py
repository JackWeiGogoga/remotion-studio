#!/usr/bin/env python3
import argparse
import math
import subprocess
from pathlib import Path


def duration_seconds(path: Path) -> float:
    result = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=nk=1:nw=1",
            str(path),
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    return float(result.stdout.strip())


def clean_file(input_path: Path, output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    audio_filter = (
        "silenceremove=start_periods=1:start_duration=0.05:start_threshold=-42dB:"
        "start_silence=0.02,"
        "aformat=sample_rates=48000:channel_layouts=mono,"
        "afade=t=in:st=0:d=0.012,"
        "areverse,afade=t=in:st=0:d=0.018,areverse,"
        "alimiter=limit=0.92:level=false"
    )
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
            audio_filter,
            str(output_path),
        ],
        check=True,
    )


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Lightly clean scene wav files and print Remotion frame counts.",
    )
    parser.add_argument("--input-dir", required=True, help="Directory containing scene-*.wav files.")
    parser.add_argument("--output-dir", required=True, help="Directory for cleaned wav files.")
    parser.add_argument("--fps", type=float, default=30.0, help="Composition fps for frame counts.")
    parser.add_argument(
        "--tail-frames",
        type=int,
        default=24,
        help="Extra visual buffer frames to add to each audio duration.",
    )
    parser.add_argument("--print-frames", action="store_true", help="Print TypeScript-style frame values.")
    args = parser.parse_args()

    input_dir = Path(args.input_dir).expanduser().resolve()
    output_dir = Path(args.output_dir).expanduser().resolve()
    files = sorted(input_dir.glob("scene-*.wav"))
    if not files:
        raise FileNotFoundError(f"No scene-*.wav files found in {input_dir}")

    for input_path in files:
        output_path = output_dir / input_path.name
        clean_file(input_path, output_path)
        dur = duration_seconds(output_path)
        audio_frames = math.ceil(dur * args.fps)
        frames = audio_frames + args.tail_frames
        if args.print_frames:
            stem = input_path.stem.replace("scene-", "scene")
            print(f"{stem}: {frames}, // audio {audio_frames}f, {dur:.6f}s")
        else:
            print(f"{output_path.name}: {dur:.6f}s")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
