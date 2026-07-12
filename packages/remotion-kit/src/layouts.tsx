import type { CSSProperties, PropsWithChildren, ReactNode } from "react";
import { getCanvasFormat, theme } from "@remotion-studio/video-themes";
import { useVideoConfig } from "remotion";
import {
  BodyText,
  Eyebrow,
  FadeIn,
  SafeArea,
  Scene,
  Stack,
  Title,
} from "./components";
import { KineticTitle } from "./text-effects";

type LayoutTone = "paper" | "inverse";
type LayoutGap = keyof typeof theme.space | number;

export type PageHeaderContent = {
  brand?: ReactNode;
  section?: ReactNode;
  index?: ReactNode;
};

export type PageFooterContent = {
  subtitle?: ReactNode;
};

export type PageLayoutProps = PropsWithChildren<{
  header: PageHeaderContent;
  footer?: PageFooterContent;
  tone?: LayoutTone;
  contentStyle?: CSSProperties;
  style?: CSSProperties;
}>;

const chromeColors = (tone: LayoutTone) => ({
  strong: tone === "inverse" ? theme.colors.canvas : theme.colors.ink,
  muted: tone === "inverse" ? theme.colors.mutedSoft : theme.colors.muted,
  rule: tone === "inverse" ? theme.colors.body : theme.colors.hairline,
});

const ChromeText = ({
  children,
  tone,
  align,
}: {
  children: ReactNode;
  tone: LayoutTone;
  align?: CSSProperties["textAlign"];
}) => {
  const colors = chromeColors(tone);

  return (
    <div
      style={{
        minWidth: 0,
        overflow: "hidden",
        color: colors.muted,
        fontSize: theme.typography.size.label,
        lineHeight: 1,
        textAlign: align,
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
};

export const PageHeader = ({
  brand,
  section,
  index,
  tone = "paper",
}: PageHeaderContent & { tone?: LayoutTone }) => {
  const colors = chromeColors(tone);

  return (
    <div
      style={{
        height: theme.layout.headerHeight,
        boxSizing: "border-box",
        display: "grid",
        gridTemplateColumns:
          "minmax(260px, 0.8fr) minmax(0, 1.7fr) minmax(120px, 0.5fr)",
        alignItems: "center",
        columnGap: theme.space.md,
        borderBottom: `${theme.stroke.hairline}px solid ${colors.rule}`,
      }}
    >
      <ChromeText tone={tone}>{brand}</ChromeText>
      <ChromeText tone={tone}>{section}</ChromeText>
      <ChromeText tone={tone} align="right">
        {index}
      </ChromeText>
    </div>
  );
};

export const PageFooter = ({
  subtitle,
  tone = "paper",
}: PageFooterContent & { tone?: LayoutTone }) => {
  const colors = chromeColors(tone);
  const { width, height } = useVideoConfig();
  const format = getCanvasFormat(width, height);

  return (
    <div
      style={{
        height: theme.layout.footerHeight[format],
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderTop: `${theme.stroke.hairline}px solid ${colors.rule}`,
        padding: `${theme.layout.footerPadding.top}px 0 ${theme.layout.footerPadding.bottom}px`,
      }}
    >
      {subtitle ? <PageSubtitle tone={tone}>{subtitle}</PageSubtitle> : null}
    </div>
  );
};

export type PageSubtitleProps = PropsWithChildren<{
  tone?: LayoutTone;
  style?: CSSProperties;
}>;

export const PageSubtitle = ({
  children,
  tone = "paper",
  style,
}: PageSubtitleProps) => {
  const { width, height } = useVideoConfig();
  const format = getCanvasFormat(width, height);

  return (
    <div
      style={{
        maxWidth: theme.layout.subtitle.maxWidth,
        boxSizing: "border-box",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: tone === "inverse" ? theme.colors.canvas : theme.colors.ink,
        color: tone === "inverse" ? theme.colors.ink : theme.colors.canvas,
        borderRadius: theme.layout.subtitle.radius,
        padding: `${theme.layout.subtitle.paddingY}px ${theme.layout.subtitle.paddingX}px`,
        fontSize: theme.typography.size.caption,
        fontWeight: theme.typography.weight.medium,
        lineHeight: theme.layout.subtitle.lineHeight,
        textAlign: "center",
        textWrap: "balance",
        ...style,
      }}
    >
      <span
        style={{
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: theme.layout.subtitle.maxLines[format],
          overflow: "hidden",
        }}
      >
        {children}
      </span>
    </div>
  );
};

export const PageLayout = ({
  children,
  header,
  footer,
  tone = "paper",
  contentStyle,
  style,
}: PageLayoutProps) => {
  const { width, height } = useVideoConfig();
  const format = getCanvasFormat(width, height);

  return (
    <Scene tone={tone} style={style}>
      <SafeArea
        style={{
          display: "grid",
          gridTemplateRows: `${theme.layout.headerHeight}px minmax(0, 1fr) ${theme.layout.footerHeight[format]}px`,
          rowGap: theme.layout.regionGap[format],
        }}
      >
        <PageHeader {...header} tone={tone} />
        <main
          style={{
            minWidth: 0,
            minHeight: 0,
            overflow: "hidden",
            ...contentStyle,
          }}
        >
          {children}
        </main>
        <PageFooter {...footer} tone={tone} />
      </SafeArea>
    </Scene>
  );
};

export type ContentLayoutVariant =
  | "full"
  | "split"
  | "stack"
  | "focus"
  | "surround";
export type ContentLayoutRatio = "1:1" | "2:3" | "3:2" | "1:2" | "2:1";

export type ContentLayoutProps = {
  variant?: ContentLayoutVariant;
  primary: ReactNode;
  secondary?: ReactNode;
  tertiary?: ReactNode;
  ratio?: ContentLayoutRatio;
  reverse?: boolean;
  gap?: LayoutGap;
  align?: CSSProperties["alignItems"];
  justify?: CSSProperties["justifyContent"];
  responsive?: boolean;
  style?: CSSProperties;
  primaryStyle?: CSSProperties;
  secondaryStyle?: CSSProperties;
  tertiaryStyle?: CSSProperties;
};

const ratioTracks: Record<ContentLayoutRatio, [number, number]> = {
  "1:1": [1, 1],
  "2:3": [2, 3],
  "3:2": [3, 2],
  "1:2": [1, 2],
  "2:1": [2, 1],
};

const LayoutSlot = ({
  children,
  style,
  align = "stretch",
}: PropsWithChildren<{
  style?: CSSProperties;
  align?: CSSProperties["alignItems"];
}>) => (
  <div
    style={{
      boxSizing: "border-box",
      width: "100%",
      height: "100%",
      minWidth: 0,
      minHeight: 0,
      display: "flex",
      flexDirection: "column",
      justifyContent:
        align === "center"
          ? "center"
          : align === "flex-end"
            ? "flex-end"
            : "flex-start",
      ...style,
    }}
  >
    {children}
  </div>
);

export const ContentLayout = ({
  variant = "full",
  primary,
  secondary,
  tertiary,
  ratio = "1:1",
  reverse = false,
  gap = theme.layout.contentGap,
  align = "stretch",
  justify = "stretch",
  responsive = true,
  style,
  primaryStyle,
  secondaryStyle,
  tertiaryStyle,
}: ContentLayoutProps) => {
  const { width, height } = useVideoConfig();
  const format = getCanvasFormat(width, height);
  const resolvedGap = typeof gap === "number" ? gap : theme.space[gap];
  const isPortraitStack = responsive && format === "portrait";
  const [firstTrack, secondTrack] = ratioTracks[ratio];
  const first = reverse ? secondary : primary;
  const second = reverse ? primary : secondary;
  const firstStyle = reverse ? secondaryStyle : primaryStyle;
  const secondStyle = reverse ? primaryStyle : secondaryStyle;

  if (variant === "focus") {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: align,
          justifyContent: justify === "stretch" ? "center" : justify,
          ...style,
        }}
      >
        <LayoutSlot
          align={align}
          style={{
            width: "100%",
            maxWidth: theme.layout.centerMaxWidth,
            ...primaryStyle,
          }}
        >
          {primary}
        </LayoutSlot>
      </div>
    );
  }

  if (variant === "surround") {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "grid",
          gridTemplateColumns: isPortraitStack
            ? "minmax(0, 1fr)"
            : `${theme.layout.surroundRailWidth}px minmax(0, 1fr) ${theme.layout.surroundRailWidth}px`,
          gridTemplateRows: isPortraitStack
            ? "auto minmax(0, 1fr) auto"
            : "minmax(0, 1fr)",
          gap: resolvedGap,
          alignItems: align,
          ...style,
        }}
      >
        <LayoutSlot align={align} style={secondaryStyle}>
          {secondary}
        </LayoutSlot>
        <LayoutSlot align={align} style={primaryStyle}>
          {primary}
        </LayoutSlot>
        <LayoutSlot align={align} style={tertiaryStyle}>
          {tertiary}
        </LayoutSlot>
      </div>
    );
  }

  if (variant === "split" || variant === "stack") {
    const stack = variant === "stack" || isPortraitStack;

    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "grid",
          gridTemplateColumns: stack
            ? "minmax(0, 1fr)"
            : `minmax(0, ${firstTrack}fr) minmax(0, ${secondTrack}fr)`,
          gridTemplateRows: stack
            ? `minmax(0, ${firstTrack}fr) minmax(0, ${secondTrack}fr)`
            : "minmax(0, 1fr)",
          gap: resolvedGap,
          alignItems: align,
          ...style,
        }}
      >
        <LayoutSlot align={align} style={firstStyle}>
          {first}
        </LayoutSlot>
        <LayoutSlot align={align} style={secondStyle}>
          {second}
        </LayoutSlot>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100%", ...style }}>
      <LayoutSlot
        align={align}
        style={{ width: "100%", height: "100%", ...primaryStyle }}
      >
        {primary}
      </LayoutSlot>
    </div>
  );
};

export type PageIntroProps = {
  eyebrow: ReactNode;
  title: ReactNode;
  body?: ReactNode;
  size?: "display" | "title" | "subtitle";
  maxWidth?: number | string;
  align?: "left" | "center" | "right";
  tone?: LayoutTone;
  style?: CSSProperties;
};

export const PageIntro = ({
  eyebrow,
  title,
  body,
  size = "title",
  maxWidth = theme.layout.introWidth,
  align = "left",
  tone = "paper",
  style,
}: PageIntroProps) => {
  const alignItems =
    align === "center"
      ? "center"
      : align === "right"
        ? "flex-end"
        : "flex-start";
  const textTone = tone === "inverse" ? "inverse" : "ink";
  const supportingTone = tone === "inverse" ? "inverse" : "body";

  return (
    <Stack
      gap="md"
      align={alignItems}
      style={{ maxWidth, textAlign: align, ...style }}
    >
      <Eyebrow tone={tone === "inverse" ? "inverse" : "muted"}>
        {eyebrow}
      </Eyebrow>
      <Title size={size} maxWidth={maxWidth} align={align} tone={textTone}>
        {title}
      </Title>
      {body ? (
        <BodyText
          maxWidth={maxWidth}
          size="caption"
          tone={supportingTone}
          style={{ textAlign: align }}
        >
          {body}
        </BodyText>
      ) : null}
    </Stack>
  );
};

export type CoverPageProps = {
  brand: ReactNode;
  edition?: ReactNode;
  eyebrow: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  visual?: ReactNode;
  footer?: ReactNode;
  from?: number;
  tone?: LayoutTone;
};

export const CoverPage = ({
  brand,
  edition,
  eyebrow,
  title,
  subtitle,
  visual,
  footer,
  from = 0,
  tone = "paper",
}: CoverPageProps) => {
  const colors = chromeColors(tone);
  const { width, height } = useVideoConfig();
  const format = getCanvasFormat(width, height);

  return (
    <Scene tone={tone}>
      <SafeArea
        style={{
          display: "grid",
          gridTemplateRows: `${theme.layout.headerHeight}px minmax(0, 1fr) ${theme.layout.coverFooterHeight}px`,
          rowGap: theme.layout.regionGap[format],
        }}
      >
        <PageHeader brand={brand} index={edition} tone={tone} />
        <ContentLayout
          variant={visual ? "split" : "focus"}
          ratio="3:2"
          align="center"
          primary={
            <FadeIn from={from} y={20}>
              <Stack gap="lg">
                <Eyebrow tone={tone === "inverse" ? "inverse" : "muted"}>
                  {eyebrow}
                </Eyebrow>
                <Title
                  size="display"
                  maxWidth={1120}
                  tone={tone === "inverse" ? "inverse" : "ink"}
                >
                  {title}
                </Title>
                {subtitle ? (
                  <BodyText
                    maxWidth={920}
                    size="caption"
                    tone={tone === "inverse" ? "inverse" : "body"}
                  >
                    {subtitle}
                  </BodyText>
                ) : null}
              </Stack>
            </FadeIn>
          }
          secondary={
            visual ? (
              <FadeIn from={from + 8} y={16}>
                {visual}
              </FadeIn>
            ) : undefined
          }
        />
        <div
          style={{
            minWidth: 0,
            minHeight: 0,
            borderTop: `${theme.stroke.hairline}px solid ${colors.rule}`,
            paddingTop: theme.space.xs,
          }}
        >
          <FadeIn from={from + 14} y={10}>
            {footer}
          </FadeIn>
        </div>
      </SafeArea>
    </Scene>
  );
};

export type SectionPageProps = {
  brand: ReactNode;
  section: ReactNode;
  index?: ReactNode;
  title: string;
  subtitle?: ReactNode;
  from?: number;
  align?: "left" | "center" | "right";
  tone?: LayoutTone;
};

export const SectionPage = ({
  brand,
  section,
  index,
  title,
  subtitle,
  from = 0,
  align = "left",
  tone = "inverse",
}: SectionPageProps) => (
  <PageLayout tone={tone} header={{ brand, section, index }}>
    <ContentLayout
      variant="focus"
      align="center"
      justify={align === "center" ? "center" : "flex-start"}
      primary={
        <KineticTitle
          eyebrow={section}
          title={title}
          caption={subtitle}
          from={from}
          by="char"
          stagger={2}
          maxWidth={1180}
          align={align}
          tone={tone}
        />
      }
    />
  </PageLayout>
);
