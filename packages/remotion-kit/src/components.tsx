import type { CSSProperties, PropsWithChildren, ReactNode } from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { getCanvasFormat, theme } from "@remotion-studio/video-themes";
import { revealProgress } from "./timeline";

type ThemeSpaceName = keyof typeof theme.space;
type ThemeRadiusName = keyof typeof theme.radius;
type ThemeAspectName = keyof typeof theme.media.aspectRatio;
type TextTone = "ink" | "body" | "muted" | "primary" | "inverse";

const resolveMediaSource = (src: string) => {
  if (/^(?:[a-z][a-z\d+\-.]*:|\/)/i.test(src)) {
    return src;
  }

  return staticFile(src);
};

const resolveSpace = (value: ThemeSpaceName | number | string | undefined) => {
  if (typeof value === "number" || value === undefined) {
    return value;
  }

  if (value in theme.space) {
    return theme.space[value as ThemeSpaceName];
  }

  return value;
};

const resolveRadius = (value: ThemeRadiusName | "full" | number) => {
  if (typeof value === "number") {
    return value;
  }

  if (value === "full") {
    return 9999;
  }

  return theme.radius[value];
};

const resolveAspectRatio = (
  value: ThemeAspectName | CSSProperties["aspectRatio"] | undefined,
) => {
  if (typeof value === "string" && value in theme.media.aspectRatio) {
    return theme.media.aspectRatio[value as ThemeAspectName];
  }

  return value;
};

const resolveTextColor = (tone: TextTone) => {
  if (tone === "inverse") {
    return theme.colors.canvas;
  }

  return theme.colors[tone];
};

type SceneProps = PropsWithChildren<{
  tone?: "paper" | "inverse";
  style?: CSSProperties;
}>;

export const Scene = ({ children, tone = "paper", style }: SceneProps) => (
  <AbsoluteFill
    style={{
      background: tone === "paper" ? theme.colors.canvas : theme.colors.ink,
      color: tone === "paper" ? theme.colors.body : theme.colors.canvas,
      fontFamily: theme.typography.family,
      letterSpacing: 0,
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </AbsoluteFill>
);

export const SafeArea = ({
  children,
  style,
}: PropsWithChildren<{ style?: CSSProperties }>) => {
  const { width, height } = useVideoConfig();
  const format = getCanvasFormat(width, height);
  const inset = theme.safeArea[format];

  return (
    <AbsoluteFill
      style={{
        boxSizing: "border-box",
        padding: `${inset.y}px ${inset.x}px`,
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

type StackProps = PropsWithChildren<{
  gap?: keyof typeof theme.space | number;
  align?: CSSProperties["alignItems"];
  justify?: CSSProperties["justifyContent"];
  direction?: CSSProperties["flexDirection"];
  style?: CSSProperties;
}>;

export const Stack = ({
  children,
  gap = "md",
  align = "stretch",
  justify = "flex-start",
  direction = "column",
  style,
}: StackProps) => (
  <div
    style={{
      display: "flex",
      flexDirection: direction,
      alignItems: align,
      justifyContent: justify,
      gap: typeof gap === "number" ? gap : theme.space[gap],
      ...style,
    }}
  >
    {children}
  </div>
);

type TitleProps = {
  children: ReactNode;
  size?: "display" | "title" | "subtitle";
  maxWidth?: number | string;
  tone?: TextTone;
  align?: CSSProperties["textAlign"];
  style?: CSSProperties;
};

export const Title = ({
  children,
  size = "title",
  maxWidth = 1300,
  tone = "ink",
  align,
  style,
}: TitleProps) => (
  <div
    style={{
      maxWidth,
      color: resolveTextColor(tone),
      fontSize: theme.typography.size[size],
      fontWeight:
        size === "display"
          ? theme.typography.weight.semibold
          : theme.typography.weight.medium,
      lineHeight: theme.typography.lineHeight.title,
      textAlign: align,
      textWrap: "balance",
      letterSpacing: 0,
      ...style,
    }}
  >
    {children}
  </div>
);

export type EyebrowMarker = boolean | "bar" | "none";

export const Eyebrow = ({
  children,
  tone = "muted",
  marker = "bar",
  style,
}: PropsWithChildren<{
  tone?: TextTone;
  marker?: EyebrowMarker;
  style?: CSSProperties;
}>) => {
  const resolvedMarker =
    marker === true ? "bar" : marker === false ? "none" : marker;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: theme.space.xs,
        color: resolveTextColor(tone),
        fontSize: theme.typography.size.label,
        fontWeight: theme.typography.weight.medium,
        lineHeight: 1.2,
        letterSpacing: 0,
        ...style,
      }}
    >
      {resolvedMarker === "bar" ? (
        <span
          style={{
            width: theme.typography.eyebrow.markerWidth,
            height: theme.typography.eyebrow.markerHeight,
            borderRadius: theme.typography.eyebrow.markerRadius,
            background: theme.colors.primary,
            flex: "0 0 auto",
          }}
        />
      ) : null}
      <span>{children}</span>
    </div>
  );
};

export const BodyText = ({
  children,
  maxWidth = 980,
  tone = "body",
  size = "body",
  style,
}: PropsWithChildren<{
  maxWidth?: number | string;
  tone?: TextTone;
  size?: "body" | "caption";
  style?: CSSProperties;
}>) => (
  <div
    style={{
      maxWidth,
      color: resolveTextColor(tone),
      fontSize: theme.typography.size[size],
      fontWeight: theme.typography.weight.regular,
      lineHeight: theme.typography.lineHeight.body,
      textWrap: "pretty",
      letterSpacing: 0,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Caption = ({
  children,
  maxWidth = 1000,
  tone = "muted",
  size = "caption",
  align,
  style,
}: PropsWithChildren<{
  maxWidth?: number | string;
  tone?: TextTone;
  size?: "caption" | "label";
  align?: CSSProperties["textAlign"];
  style?: CSSProperties;
}>) => (
  <div
    style={{
      maxWidth,
      color: resolveTextColor(tone),
      fontSize: theme.typography.size[size],
      fontWeight: theme.typography.weight.regular,
      lineHeight: theme.typography.lineHeight.caption,
      textAlign: align,
      textWrap: "pretty",
      letterSpacing: 0,
      ...style,
    }}
  >
    {children}
  </div>
);

export type MediaFrameVariant = "plain" | "stroke" | "screen" | "raised";

export type MediaFrameProps = PropsWithChildren<{
  src?: string;
  alt?: string;
  fit?: "cover" | "contain";
  objectPosition?: CSSProperties["objectPosition"];
  aspectRatio?: ThemeAspectName | CSSProperties["aspectRatio"];
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
  minHeight?: CSSProperties["minHeight"];
  variant?: MediaFrameVariant;
  radius?: ThemeRadiusName | "full" | number;
  padding?: ThemeSpaceName | number | string;
  label?: string;
  labelReserve?: number;
  revealFrom?: number;
  revealDuration?: number;
  revealY?: number;
  revealScale?: number;
  style?: CSSProperties;
  imageStyle?: CSSProperties;
  contentStyle?: CSSProperties;
}>;

export type MediaFigureProps = Omit<
  MediaFrameProps,
  "width" | "height" | "style"
> & {
  caption: ReactNode;
  captionAlign?: CSSProperties["textAlign"];
  captionGap?: ThemeSpaceName | number;
  fitAxis?: "width" | "height";
  maxWidth?: CSSProperties["maxWidth"];
  style?: CSSProperties;
  frameStyle?: CSSProperties;
};

export const MediaFrame = ({
  children,
  src,
  alt = "",
  fit = "cover",
  objectPosition = "center",
  aspectRatio,
  width,
  height,
  minHeight,
  variant = "stroke",
  radius = "media",
  padding,
  label,
  labelReserve = 0,
  revealFrom,
  revealDuration = theme.motion.duration.enter,
  revealY = 18,
  revealScale = 0.985,
  style,
  imageStyle,
  contentStyle,
}: MediaFrameProps) => {
  const frame = useCurrentFrame();
  const shouldReveal = revealFrom !== undefined && revealDuration > 0;
  const revealOpacity = shouldReveal
    ? interpolate(frame, [revealFrom, revealFrom + revealDuration], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.bezier(...theme.motion.easing.standard),
      })
    : undefined;
  const revealTranslate = shouldReveal
    ? interpolate(
        frame,
        [revealFrom, revealFrom + revealDuration],
        [revealY, 0],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(...theme.motion.easing.standard),
        },
      )
    : undefined;
  const revealScaleValue = shouldReveal
    ? interpolate(
        frame,
        [revealFrom, revealFrom + revealDuration],
        [revealScale, 1],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(...theme.motion.easing.standard),
        },
      )
    : undefined;

  const variantStyle: Record<MediaFrameVariant, CSSProperties> = {
    plain: {
      border: 0,
      background: "transparent",
      boxShadow: theme.shadow.none,
    },
    stroke: {
      border: `${theme.stroke.hairline}px solid ${theme.colors.hairline}`,
      background: theme.colors.surfaceSoft,
      boxShadow: theme.shadow.none,
    },
    screen: {
      border: `${theme.stroke.strong}px solid ${theme.colors.ink}`,
      background: theme.colors.ink,
      boxShadow: theme.shadow.mediaLift,
    },
    raised: {
      border: `${theme.stroke.hairline}px solid ${theme.colors.hairline}`,
      background: theme.colors.surface,
      boxShadow: theme.shadow.mediaLift,
    },
  };
  const mediaLabelHeight = Math.max(theme.media.labelHeight, labelReserve);

  return (
    <div
      style={{
        position: "relative",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        width,
        height,
        minHeight,
        aspectRatio: resolveAspectRatio(
          aspectRatio ?? (src ? "landscape" : undefined),
        ),
        overflow: "hidden",
        borderRadius: resolveRadius(radius),
        padding: resolveSpace(padding),
        transformOrigin: "center",
        opacity: revealOpacity,
        translate:
          revealTranslate === undefined ? undefined : `0 ${revealTranslate}px`,
        scale: revealScaleValue,
        ...variantStyle[variant],
        ...style,
      }}
    >
      {label ? (
        <div
          style={{
            position: "relative",
            zIndex: 1,
            boxSizing: "border-box",
            width: "100%",
            minHeight: mediaLabelHeight,
            borderBottom: `${theme.stroke.hairline}px solid ${theme.colors.hairline}`,
            background: theme.colors.surface,
            color: theme.colors.muted,
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            fontSize: theme.typography.size.label,
            fontWeight: theme.typography.weight.regular,
            lineHeight: 1,
          }}
        >
          {label}
        </div>
      ) : null}
      <div
        style={{
          position: "relative",
          width: "100%",
          flex: "1 1 auto",
          height:
            src || aspectRatio || height || minHeight ? "100%" : undefined,
          minHeight: 0,
          overflow: "hidden",
          ...contentStyle,
        }}
      >
        {src ? (
          <Img
            alt={alt}
            src={resolveMediaSource(src)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: fit,
              objectPosition,
              display: "block",
              userSelect: "none",
              ...imageStyle,
            }}
          />
        ) : (
          (children ?? (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "grid",
                placeItems: "center",
                color: theme.colors.muted,
                fontSize: theme.typography.size.label,
              }}
            >
              missing media
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const getAspectRatioNumber = (value: CSSProperties["aspectRatio"]): number => {
  if (typeof value === "number") {
    return value > 0 ? value : 16 / 9;
  }

  const [rawWidth, rawHeight] = String(value ?? "").split("/");
  const width = Number(rawWidth);
  const height = Number(rawHeight);

  if (Number.isFinite(width) && Number.isFinite(height) && height > 0) {
    return width / height;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue > 0
    ? numericValue
    : 16 / 9;
};

export const MediaFigure = ({
  caption,
  captionAlign = "center",
  captionGap = "xs",
  fitAxis,
  maxWidth = "100%",
  aspectRatio = "landscape",
  variant = "stroke",
  style,
  frameStyle,
  ...mediaFrameProps
}: MediaFigureProps) => {
  const resolvedAspectRatio = resolveAspectRatio(aspectRatio);
  const ratio = getAspectRatioNumber(resolvedAspectRatio);
  const resolvedFitAxis = fitAxis ?? (ratio > 1 ? "width" : "height");
  const isWidthFit = resolvedFitAxis === "width";
  const shadowReserve =
    variant === "raised" || variant === "screen" ? theme.space.xs : 0;

  // The figure is a flex column of [media, caption]. The caption track is
  // `flex: 0 0 auto`, so it always reserves its own height and can never be
  // clipped by the page's bottom region. The media wrapper decides how the
  // remaining space is used:
  //  - height-fit: `flex: 1 1 auto` so the media fills the space; the frame is
  //    `height: 100%` and therefore its bottom edge sits right above the caption.
  //  - width-fit: `flex: 0 1 auto` so the wrapper shrinks to the media's own
  //    (width-derived) height; the whole media+caption group is centered as a
  //    unit, keeping the caption hugging the image instead of dropping to the
  //    bottom of a tall track.
  return (
    <div
      style={{
        boxSizing: "border-box",
        width: "100%",
        height: "100%",
        maxWidth,
        maxHeight: "100%",
        minWidth: 0,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: isWidthFit ? "center" : "flex-start",
        rowGap:
          typeof captionGap === "number" ? captionGap : theme.space[captionGap],
        ...style,
      }}
    >
      <div
        style={{
          boxSizing: "border-box",
          width: "100%",
          flex: isWidthFit ? "0 1 auto" : "1 1 auto",
          minWidth: 0,
          minHeight: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          paddingRight: shadowReserve,
          paddingBottom: shadowReserve,
        }}
      >
        <MediaFrame
          {...mediaFrameProps}
          aspectRatio={resolvedAspectRatio}
          variant={variant}
          width={isWidthFit ? "100%" : "auto"}
          height={isWidthFit ? "auto" : "100%"}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            ...frameStyle,
          }}
        />
      </div>
      <Caption
        size="label"
        align={captionAlign}
        maxWidth="100%"
        style={{ flex: "0 0 auto", width: "100%" }}
      >
        {caption}
      </Caption>
    </div>
  );
};

type TextFitProps = {
  children: ReactNode;
  maxChars?: number;
  baseSize?: number;
  minSize?: number;
  style?: CSSProperties;
};

export const TextFit = ({
  children,
  maxChars = theme.typography.maxChars.title,
  baseSize = theme.typography.size.title,
  minSize = 44,
  style,
}: TextFitProps) => {
  const text = String(children);
  const size = Math.max(
    minSize,
    Math.min(baseSize, (baseSize * maxChars) / Math.max(text.length, 1)),
  );

  return (
    <span
      style={{
        display: "inline-block",
        fontSize: size,
        lineHeight: theme.typography.lineHeight.tight,
        ...style,
      }}
    >
      {children}
    </span>
  );
};

type FadeInProps = PropsWithChildren<{
  from?: number;
  duration?: number;
  y?: number;
  style?: CSSProperties;
}>;

export const FadeIn = ({
  children,
  from = 0,
  duration = theme.motion.duration.enter,
  y = 22,
  style,
}: FadeInProps) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        opacity: interpolate(frame, [from, from + duration], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(...theme.motion.easing.standard),
        }),
        translate: `0 ${interpolate(frame, [from, from + duration], [y, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(...theme.motion.easing.standard),
        })}px`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Rule = ({ style }: { style?: CSSProperties }) => (
  <div
    style={{
      height: theme.stroke.hairline,
      width: "100%",
      background: theme.colors.hairline,
      ...style,
    }}
  />
);

export const Prompt = ({
  children,
  active = false,
}: PropsWithChildren<{ active?: boolean }>) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      minHeight: 44,
      border: `${theme.stroke.hairline}px solid ${active ? theme.colors.ink : theme.colors.hairline}`,
      background: active ? theme.colors.ink : theme.colors.surface,
      color: active ? theme.colors.canvas : theme.colors.body,
      padding: "0 16px",
      fontSize: theme.typography.size.label,
      lineHeight: 1,
    }}
  >
    <span
      style={{
        color: active ? theme.colors.primary : theme.colors.primary,
        marginRight: 10,
      }}
    >
      $
    </span>
    {children}
  </span>
);

export const useProgressiveReveal = revealProgress;
