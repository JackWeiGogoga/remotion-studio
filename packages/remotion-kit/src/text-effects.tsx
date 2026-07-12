import type { CSSProperties, ReactNode } from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { theme } from "@remotion-studio/video-themes";
import { Caption, Eyebrow, FadeIn, Stack, Title } from "./components";

export type RevealTextBy = "char" | "word" | "line";
export type RevealTextPreset = "fade" | "rise" | "slide" | "pop" | "soft";
export type RevealTextOrder = "forward" | "reverse";

export type RevealTextProps = {
  text?: string | number;
  children?: string | number;
  by?: RevealTextBy;
  preset?: RevealTextPreset;
  order?: RevealTextOrder;
  from?: number;
  stagger?: number;
  duration?: number;
  y?: number;
  x?: number;
  blur?: number;
  easing?: readonly [number, number, number, number];
  as?: "span" | "div";
  style?: CSSProperties;
  lineStyle?: CSSProperties;
  itemStyle?: CSSProperties;
};

const resolveText = (text: RevealTextProps["text"], children: ReactNode) => {
  if (text !== undefined) {
    return String(text);
  }

  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }

  return "";
};

const splitLine = (line: string, by: RevealTextBy) => {
  if (by === "line") {
    return [line];
  }

  if (by === "word") {
    return line.split(/(\s+)/).filter((token) => token.length > 0);
  }

  return Array.from(line);
};

const countAnimatedTokens = (lines: string[], by: RevealTextBy) =>
  lines.reduce(
    (total, line) =>
      total +
      splitLine(line, by).filter((token) => !/^\s+$/.test(token)).length,
    0,
  );

const getTokenStyle = ({
  preset,
  progress,
  x,
  y,
  blur,
}: {
  preset: RevealTextPreset;
  progress: number;
  x: number;
  y: number;
  blur: number;
}): CSSProperties => {
  const hidden = 1 - progress;

  if (preset === "fade") {
    return { opacity: progress };
  }

  if (preset === "slide") {
    return {
      opacity: progress,
      translate: `${hidden * x}px 0`,
    };
  }

  if (preset === "pop") {
    return {
      opacity: progress,
      scale: interpolate(progress, [0, 1], [0.92, 1]),
    };
  }

  if (preset === "soft") {
    return {
      opacity: progress,
      translate: `0 ${hidden * y}px`,
      filter: `blur(${hidden * blur}px)`,
    };
  }

  return {
    opacity: progress,
    translate: `0 ${hidden * y}px`,
  };
};

export const RevealText = ({
  text,
  children,
  by = "char",
  preset = "rise",
  order = "forward",
  from = 0,
  stagger = by === "char" ? 2 : 4,
  duration = theme.motion.duration.enter,
  y = 18,
  x = 28,
  blur = 6,
  easing = theme.motion.easing.standard,
  as = "span",
  style,
  lineStyle,
  itemStyle,
}: RevealTextProps) => {
  const frame = useCurrentFrame();
  const content = resolveText(text, children);
  const lines = content.split(/\r?\n/);
  const animatedTokenCount = countAnimatedTokens(lines, by);
  let tokenIndex = -1;

  const contentNode = lines.map((line, lineIndex) => {
    const tokens = splitLine(line, by);

    return (
      <span
        key={`${line}-${lineIndex}`}
        style={{
          display: "block",
          ...lineStyle,
        }}
      >
        {tokens.map((token, index) => {
          const isWhitespace = /^\s+$/.test(token);

          if (isWhitespace) {
            return (
              <span key={`${token}-${index}`} style={{ whiteSpace: "pre" }}>
                {token}
              </span>
            );
          }

          tokenIndex += 1;

          const delayIndex =
            order === "reverse"
              ? animatedTokenCount - tokenIndex - 1
              : tokenIndex;
          const tokenFrom = from + delayIndex * stagger;
          const progress = interpolate(
            frame,
            [tokenFrom, tokenFrom + duration],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(easing[0], easing[1], easing[2], easing[3]),
            },
          );

          return (
            <span
              key={`${token}-${index}`}
              style={{
                display: "inline-block",
                whiteSpace: "pre",
                transformOrigin: "50% 70%",
                ...getTokenStyle({ preset, progress, x, y, blur }),
                ...itemStyle,
              }}
            >
              {token.length === 0 ? "\u00a0" : token}
            </span>
          );
        })}
      </span>
    );
  });

  const rootStyle: CSSProperties = {
    display: as === "span" ? "inline-block" : "block",
    whiteSpace: "pre-wrap",
    ...style,
  };

  if (as === "div") {
    return <div style={rootStyle}>{contentNode}</div>;
  }

  return <span style={rootStyle}>{contentNode}</span>;
};

export type KineticTitleProps = {
  eyebrow?: ReactNode;
  title: string;
  caption?: ReactNode;
  by?: RevealTextBy;
  preset?: RevealTextPreset;
  from?: number;
  stagger?: number;
  duration?: number;
  size?: "display" | "title" | "subtitle";
  maxWidth?: number | string;
  align?: "left" | "center" | "right";
  eyebrowMarker?: boolean;
  style?: CSSProperties;
  titleStyle?: CSSProperties;
  captionStyle?: CSSProperties;
};

export const KineticTitle = ({
  eyebrow,
  title,
  caption,
  by = "char",
  preset = "rise",
  from = 0,
  stagger = by === "char" ? 2 : 5,
  duration = theme.motion.duration.enter,
  size = "display",
  maxWidth = 1120,
  align = "left",
  eyebrowMarker = true,
  style,
  titleStyle,
  captionStyle,
}: KineticTitleProps) => {
  const alignItems =
    align === "center"
      ? "center"
      : align === "right"
        ? "flex-end"
        : "flex-start";

  return (
    <Stack
      gap="md"
      align={alignItems}
      style={{
        textAlign: align,
        ...style,
      }}
    >
      {eyebrow ? (
        <FadeIn from={from} y={10}>
          <Eyebrow marker={eyebrowMarker}>{eyebrow}</Eyebrow>
        </FadeIn>
      ) : null}
      <Title size={size} maxWidth={maxWidth} align={align} style={titleStyle}>
        <RevealText
          text={title}
          by={by}
          preset={preset}
          from={from + 6}
          stagger={stagger}
          duration={duration}
        />
      </Title>
      {caption ? (
        <FadeIn from={from + 14} y={12}>
          <Caption maxWidth={maxWidth} align={align} style={captionStyle}>
            {caption}
          </Caption>
        </FadeIn>
      ) : null}
    </Stack>
  );
};
