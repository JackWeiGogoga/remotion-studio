import type { ComponentProps, CSSProperties } from "react";
import {
  InnerLine,
  Pre,
  type AnnotationHandler,
  type HighlightedCode,
} from "codehike/code";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { theme } from "@remotion-studio/video-themes";

export type LineSelection = number | string | readonly number[];

export type CodeFocusStep = {
  lines: LineSelection;
  from: number;
};

type CodeLineProps = ComponentProps<NonNullable<AnnotationHandler["Line"]>>;

export type CodeBlockProps = {
  code: HighlightedCode;
  showLineNumbers?: boolean;
  focusLines?: LineSelection;
  focusFrom?: number;
  focusDuration?: number;
  focusSteps?: readonly CodeFocusStep[];
  revealFrom?: number;
  revealDuration?: number;
  revealStagger?: number;
  style?: CSSProperties;
};

export type CodeFrameProps = CodeBlockProps & {
  filename?: string;
  languageLabel?: string;
  style?: CSSProperties;
  codeStyle?: CSSProperties;
};

const clampInterpolation = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const betweenIntegerFrames = (
  from: number,
  duration: number,
): [number, number] => [from - 0.001, from + Math.max(duration, 1) - 0.001];

export const parseLineSelection = (selection?: LineSelection): Set<number> => {
  if (selection === undefined) {
    return new Set<number>();
  }

  if (typeof selection === "number") {
    return new Set([selection]);
  }

  if (Array.isArray(selection)) {
    return new Set(
      selection.filter((line) => Number.isInteger(line) && line > 0),
    );
  }

  const lines = new Set<number>();

  for (const part of String(selection).split(",")) {
    const [rawStart, rawEnd] = part.trim().split("-");
    const start = Number(rawStart);
    const end = rawEnd === undefined ? start : Number(rawEnd);

    if (
      !Number.isInteger(start) ||
      !Number.isInteger(end) ||
      start < 1 ||
      end < start
    ) {
      continue;
    }

    for (let line = start; line <= end; line += 1) {
      lines.add(line);
    }
  }

  return lines;
};

const getAnnotatedFocusLines = (code: HighlightedCode): Set<number> => {
  const lines = new Set<number>();

  for (const annotation of code.annotations) {
    if (
      (annotation.name === "focus" || annotation.name === "mark") &&
      "fromLineNumber" in annotation
    ) {
      for (
        let line = annotation.fromLineNumber;
        line <= annotation.toLineNumber;
        line += 1
      ) {
        lines.add(line);
      }
    }
  }

  return lines;
};

const getStepFocus = ({
  frame,
  lineNumber,
  steps,
  duration,
}: {
  frame: number;
  lineNumber: number;
  steps: readonly CodeFocusStep[];
  duration: number;
}) => {
  const sortedSteps = [...steps].sort((a, b) => a.from - b.from);
  let activeIndex = -1;

  for (let index = 0; index < sortedSteps.length; index += 1) {
    if (frame >= sortedSteps[index].from) {
      activeIndex = index;
    }
  }

  if (activeIndex < 0) {
    return { amount: 0, globalAmount: 0 };
  }

  const activeStep = sortedSteps[activeIndex];
  const previousStep = sortedSteps[activeIndex - 1];
  const activeLines = parseLineSelection(activeStep.lines);
  const previousLines = parseLineSelection(previousStep?.lines);
  const progress = interpolate(
    frame,
    betweenIntegerFrames(activeStep.from, duration),
    [0, 1],
    {
      ...clampInterpolation,
      easing: Easing.bezier(...theme.motion.easing.precise),
    },
  );
  const wasFocused = previousLines.has(lineNumber);
  const isFocused = activeLines.has(lineNumber);

  if (wasFocused && isFocused) {
    return { amount: 1, globalAmount: activeIndex === 0 ? progress : 1 };
  }

  if (isFocused) {
    return { amount: progress, globalAmount: activeIndex === 0 ? progress : 1 };
  }

  if (wasFocused) {
    return { amount: 1 - progress, globalAmount: 1 };
  }

  return { amount: 0, globalAmount: activeIndex === 0 ? progress : 1 };
};

export const CodeBlock = ({
  code,
  showLineNumbers = true,
  focusLines,
  focusFrom = 0,
  focusDuration = theme.motion.duration.enter,
  focusSteps = [],
  revealFrom = 0,
  revealDuration = theme.motion.duration.fast,
  revealStagger = theme.code.revealStagger,
  style,
}: CodeBlockProps) => {
  const frame = useCurrentFrame();
  const annotatedFocusLines = getAnnotatedFocusLines(code);
  const selectedFocusLines =
    focusLines === undefined
      ? annotatedFocusLines
      : parseLineSelection(focusLines);
  const hasStaticFocus = selectedFocusLines.size > 0;

  const Line = (props: CodeLineProps) => {
    const { lineNumber } = props;
    const revealStart = revealFrom + (lineNumber - 1) * revealStagger;
    const revealProgress = interpolate(
      frame,
      [revealStart, revealStart + revealDuration],
      [0, 1],
      {
        ...clampInterpolation,
        easing: Easing.bezier(...theme.motion.easing.standard),
      },
    );
    const stableStaticFocusProgress = hasStaticFocus
      ? interpolate(
          frame,
          betweenIntegerFrames(focusFrom, focusDuration),
          [0, 1],
          {
            ...clampInterpolation,
            easing: Easing.bezier(...theme.motion.easing.precise),
          },
        )
      : 0;
    const stepFocus = getStepFocus({
      frame,
      lineNumber,
      steps: focusSteps,
      duration: focusDuration,
    });
    const focusAmount =
      focusSteps.length > 0
        ? stepFocus.amount
        : selectedFocusLines.has(lineNumber)
          ? stableStaticFocusProgress
          : 0;
    const globalFocusAmount =
      focusSteps.length > 0
        ? stepFocus.globalAmount
        : stableStaticFocusProgress;
    const focusOpacity = Math.min(
      1,
      interpolate(globalFocusAmount, [0, 1], [1, theme.code.unfocusedOpacity]) +
        focusAmount * (1 - theme.code.unfocusedOpacity),
    );
    return (
      <InnerLine
        merge={props}
        style={{
          ...props.style,
          position: "relative",
          display: "grid",
          gridTemplateColumns: showLineNumbers
            ? `${theme.code.gutterWidth}px minmax(0, 1fr)`
            : "minmax(0, 1fr)",
          minHeight: theme.code.lineHeight,
          alignItems: "center",
          opacity: revealProgress * focusOpacity,
          backgroundImage:
            focusAmount > 0
              ? `linear-gradient(${theme.code.focusBackground}, ${theme.code.focusBackground})`
              : "none",
          backgroundRepeat: "no-repeat",
          backgroundSize: `${focusAmount * 100}% 100%`,
          borderLeftWidth: theme.stroke.strong,
          borderLeftStyle: "solid",
          borderLeftColor:
            focusAmount > 0
              ? theme.code.focusRule
              : theme.code.focusTransparent,
        }}
      >
        {showLineNumbers ? (
          <span
            style={{
              alignSelf: "stretch",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              borderRight: `${theme.stroke.hairline}px solid ${theme.code.gutter}`,
              color: theme.colors.mutedSoft,
              paddingRight: theme.space.sm,
              userSelect: "none",
            }}
          >
            {lineNumber.toString().padStart(2, "0")}
          </span>
        ) : null}
        <span
          style={{
            display: "block",
            paddingLeft: showLineNumbers ? theme.space.sm : 0,
            paddingRight: theme.code.paddingX,
            whiteSpace: "pre",
          }}
        >
          {props.children}
        </span>
      </InnerLine>
    );
  };

  return (
    <Pre
      code={code}
      handlers={[{ name: "archive-line", Line }]}
      style={{
        margin: 0,
        padding: `${theme.code.paddingY}px 0`,
        overflow: "hidden",
        background: theme.code.background,
        color: theme.code.syntax.plain,
        fontFamily: theme.typography.monoFamily,
        fontSize: theme.code.fontSize,
        fontWeight: theme.typography.weight.regular,
        lineHeight: `${theme.code.lineHeight}px`,
        tabSize: 2,
        ...style,
      }}
    />
  );
};

export const CodeFrame = ({
  code,
  filename = "untitled",
  languageLabel,
  style,
  codeStyle,
  ...codeProps
}: CodeFrameProps) => (
  <div
    style={{
      display: "grid",
      gridTemplateRows: `${theme.code.headerHeight}px minmax(0, 1fr)`,
      overflow: "hidden",
      border: `${theme.stroke.hairline}px solid ${theme.colors.hairline}`,
      borderRadius: theme.radius.media,
      background: theme.code.background,
      ...style,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        minWidth: 0,
        background: theme.code.headerBackground,
        color: theme.colors.body,
        borderBottom: `${theme.stroke.hairline}px solid ${theme.colors.hairline}`,
        padding: `0 ${theme.code.paddingX}px`,
        fontFamily: theme.typography.monoFamily,
        fontSize: theme.typography.size.label,
        fontWeight: theme.typography.weight.medium,
        lineHeight: 1,
      }}
    >
      <span
        style={{
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {filename}
      </span>
      <span
        style={{
          color: theme.colors.muted,
          fontWeight: theme.typography.weight.regular,
        }}
      >
        {languageLabel ?? code.lang}
      </span>
    </div>
    <CodeBlock
      code={code}
      {...codeProps}
      style={{ height: "100%", ...codeStyle }}
    />
  </div>
);

export type { HighlightedCode } from "codehike/code";
