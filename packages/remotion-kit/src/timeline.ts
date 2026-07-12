import { Easing, interpolate, useCurrentFrame } from "remotion";
import { theme } from "@remotion-studio/video-themes";

export type FrameRange = {
  from: number;
  duration: number;
};

export const seconds = (value: number, fps: number) => Math.round(value * fps);

export const range = (from: number, duration: number): FrameRange => ({
  from,
  duration,
});

export const after = (previous: FrameRange, duration: number): FrameRange => ({
  from: previous.from + previous.duration,
  duration,
});

export const stagger = (index: number, gap = 5) => index * gap;

export const localFrame = (frame: number, from: number) => frame - from;

export const revealProgress = (
  frame: number,
  from = 0,
  duration = theme.motion.duration.enter,
) =>
  interpolate(frame, [from, from + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...theme.motion.easing.standard),
  });

export const exitProgress = (
  frame: number,
  from: number,
  duration = theme.motion.duration.exit,
) =>
  interpolate(frame, [from, from + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...theme.motion.easing.precise),
  });

export const useRevealProgress = (from = 0, duration = theme.motion.duration.enter) => {
  const frame = useCurrentFrame();
  return revealProgress(frame, from, duration);
};
