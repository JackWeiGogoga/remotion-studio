#!/usr/bin/env python3
import argparse
import sys
from pathlib import Path


def scene_path(input_dir: Path, scene: int) -> Path:
    return input_dir / f"scene-{scene:02d}.txt"


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Generate scene-based Remotion voiceovers with local IndexTTS2.",
    )
    parser.add_argument(
        "--index-tts-dir",
        default="/Users/jackwei/data/github/tts/index-tts",
        help="Path to the local index-tts checkout.",
    )
    parser.add_argument(
        "--voice",
        required=True,
        help="Reference speaker WAV resolved from resources/voices/<speaker>/profile.json.",
    )
    parser.add_argument(
        "--input-dir",
        required=True,
        help="Directory containing scene-01.txt, scene-02.txt, and so on.",
    )
    parser.add_argument(
        "--output-dir",
        required=True,
        help="Directory for generated raw scene wav files.",
    )
    parser.add_argument("--device", default="mps", help="Runtime device: mps, cpu, cuda, etc.")
    parser.add_argument("--fp16", action="store_true", help="Use FP16 inference.")
    parser.add_argument("--use-emo-text", action="store_true", help="Let IndexTTS infer emotion from text.")
    parser.add_argument(
        "--emotion-weight",
        type=float,
        default=0.25,
        help="Emotion strength passed to IndexTTS.",
    )
    parser.add_argument("--start", type=int, default=1, help="First scene number.")
    parser.add_argument("--end", type=int, required=True, help="Last scene number.")
    args = parser.parse_args()

    index_tts_dir = Path(args.index_tts_dir).expanduser().resolve()
    model_dir = index_tts_dir / "checkpoints"
    cfg_path = model_dir / "config.yaml"
    voice = Path(args.voice).expanduser().resolve()
    input_dir = Path(args.input_dir).expanduser().resolve()
    output_dir = Path(args.output_dir).expanduser().resolve()

    if not cfg_path.is_file():
        raise FileNotFoundError(f"Missing IndexTTS config: {cfg_path}")
    if not voice.is_file():
        raise FileNotFoundError(f"Missing voice reference audio: {voice}")
    if not input_dir.is_dir():
        raise NotADirectoryError(f"Missing input directory: {input_dir}")
    if args.start < 1 or args.end < args.start:
        raise ValueError("--start and --end must form a positive inclusive range")

    for scene in range(args.start, args.end + 1):
        path = scene_path(input_dir, scene)
        if not path.is_file():
            raise FileNotFoundError(f"Missing scene text file: {path}")

    sys.path.insert(0, str(index_tts_dir))
    from indextts.infer_v2 import IndexTTS2

    output_dir.mkdir(parents=True, exist_ok=True)

    tts = IndexTTS2(
        cfg_path=str(cfg_path),
        model_dir=str(model_dir),
        use_fp16=args.fp16,
        use_cuda_kernel=False,
        use_deepspeed=False,
        device=args.device,
    )

    for scene in range(args.start, args.end + 1):
        scene_id = f"{scene:02d}"
        text_path = scene_path(input_dir, scene)
        output_path = output_dir / f"scene-{scene_id}.wav"
        text = text_path.read_text(encoding="utf-8").strip()
        if not text:
            raise ValueError(f"Empty scene text file: {text_path}")

        print(f"Generating {output_path.name} from {text_path.name}...")
        tts.infer(
            spk_audio_prompt=str(voice),
            text=text,
            output_path=str(output_path),
            emo_alpha=args.emotion_weight,
            use_emo_text=args.use_emo_text,
            use_random=False,
            verbose=True,
        )

    print(f"Done. Output: {output_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
