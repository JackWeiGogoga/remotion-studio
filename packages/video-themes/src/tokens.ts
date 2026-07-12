export const theme = {
  colors: {
    canvas: "#f5f3ee",
    surface: "#f5f3ee",
    surfaceSoft: "#e9e6e2",
    surfaceStrong: "#ebe8e3",
    ink: "#0a0a0a",
    body: "#1a1a1a",
    muted: "#6b6865",
    mutedSoft: "#a3a09c",
    hairline: "#d8d4cb",
    hairlineSoft: "#e6e3df",
    primary: "#ff5a1f",
    success: "#1f8a5f",
    warning: "#a66b00",
    error: "#b42318",
    category: {
      op: "#ff5a1f",
      gt: "#1f8a5f",
      pt: "#a66b00",
      qg: "#2458c7",
      qo: "#7b4ac9",
    },
  },
  typography: {
    family:
      '"HarmonyOS Sans SC", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif',
    monoFamily:
      '"Chivo Mono", "SF Mono", ui-monospace, Menlo, Consolas, monospace',
    weight: {
      regular: 400,
      medium: 500,
      semibold: 600,
    },
    size: {
      label: 24,
      caption: 32,
      body: 42,
      subtitle: 54,
      title: 82,
      display: 118,
    },
    lineHeight: {
      tight: 1.04,
      title: 1.12,
      body: 1.36,
      caption: 1.42,
    },
    maxChars: {
      title: 18,
      captionLine: 18,
      bodyLines: 4,
    },
  },
  space: {
    xxs: 8,
    xs: 12,
    sm: 18,
    md: 28,
    lg: 42,
    xl: 64,
    xxl: 96,
  },
  safeArea: {
    landscape: { x: 72, y: 48 },
    portrait: { x: 56, y: 72 },
    square: { x: 64, y: 56 },
  },
  layout: {
    headerHeight: 58,
    footerHeight: 116,
    footerMetaHeight: 24,
    coverFooterHeight: 58,
    subtitle: {
      maxWidth: 1380,
      paddingX: 18,
      paddingY: 5,
      radius: 2,
      lineHeight: 1.2,
      maxLines: 2,
    },
    regionGap: 24,
    contentGap: 42,
    introWidth: 560,
    centerMaxWidth: 1320,
    surroundRailWidth: 320,
  },
  radius: {
    none: 0,
    rule: 2,
    panel: 4,
    media: 6,
  },
  shadow: {
    none: "none",
    insetRule: "inset 0 0 0 1px #d8d4cb",
    mediaLift: "8px 8px 0 #d8d4cb",
    mediaStrong: "10px 10px 0 #0a0a0a",
  },
  stroke: {
    hairline: 1,
    strong: 2,
  },
  media: {
    aspectRatio: {
      landscape: "16 / 9",
      portrait: "9 / 16",
      square: "1 / 1",
      wide: "21 / 9",
      phone: "9 / 19.5",
    },
    labelHeight: 46,
  },
  code: {
    background: "#ebe8e3",
    headerBackground: "#0a0a0a",
    gutter: "#d8d4cb",
    focusTransparent: "#ff5a1f00",
    focusBackground: "#ff5a1f24",
    focusRule: "#ff5a1f",
    fontSize: 30,
    lineHeight: 42,
    headerHeight: 58,
    gutterWidth: 72,
    paddingX: 28,
    paddingY: 24,
    unfocusedOpacity: 0.28,
    revealStagger: 2,
    syntax: {
      plain: "#1a1a1a",
      comment: "#6b6865",
      keyword: "#ff5a1f",
      string: "#1f8a5f",
      constant: "#2458c7",
      function: "#7b4ac9",
      type: "#a66b00",
    },
  },
  motion: {
    duration: {
      fast: 10,
      enter: 18,
      exit: 14,
      sceneChange: 24,
    },
    easing: {
      standard: [0.16, 1, 0.3, 1],
      precise: [0.32, 0.72, 0, 1],
    },
  },
} as const;

export type CanvasFormat = "landscape" | "portrait" | "square";

export const canvasPresets = {
  landscape: { width: 1920, height: 1080, fps: 30 },
  portrait: { width: 1080, height: 1920, fps: 30 },
  square: { width: 1080, height: 1080, fps: 30 },
} as const satisfies Record<
  CanvasFormat,
  { width: number; height: number; fps: number }
>;

export const getCanvasFormat = (
  width: number,
  height: number,
): CanvasFormat => {
  if (width === height) {
    return "square";
  }

  return width > height ? "landscape" : "portrait";
};
