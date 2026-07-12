import type { CSSProperties, ReactNode } from "react";
import {
  AnimatedImage,
  Composition,
  Easing,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { z } from "zod";
import { canvasPresets, theme } from "@remotion-studio/video-themes";
import {
  BodyText,
  Caption,
  ChartFrame,
  CodeFrame,
  ComparisonChart,
  type ComparisonSeries,
  ContentLayout,
  CoverPage,
  DataTable,
  type DataTableColumn,
  Eyebrow,
  FadeIn,
  type HighlightedCode,
  KineticTitle,
  LineChart,
  MediaFrame,
  PageIntro,
  PageLayout,
  RacingBarChart,
  RevealText,
  Rule,
  SectionPage,
  Stack,
  TextFit,
  Title,
  seconds,
  stagger,
} from "@remotion-studio/remotion-kit";
import codeExample from "./fixtures/code-example.highlighted.json";

const highlightedCode = codeExample as unknown as HighlightedCode;
const fps = canvasPresets.landscape.fps;
const coverDuration = seconds(4, fps);
const sectionDuration = seconds(3, fps);
const layoutDuration = seconds(5, fps);
const typeDuration = seconds(4, fps);
const textMotionDuration = seconds(5, fps);
const mediaDuration = seconds(4, fps);
const chartLineDuration = seconds(4, fps);
const chartRaceDuration = seconds(7, fps);
const comparisonDuration = seconds(5, fps);
const tableDuration = seconds(4, fps);
const codeMotionDuration = seconds(4, fps);
const storyDuration = seconds(4, fps);
const sectionStart = coverDuration;
const layoutStart = sectionStart + sectionDuration;
const typeStart = layoutStart + layoutDuration;
const textMotionStart = typeStart + typeDuration;
const mediaStart = textMotionStart + textMotionDuration;
const chartLineStart = mediaStart + mediaDuration;
const chartRaceStart = chartLineStart + chartLineDuration;
const comparisonStart = chartRaceStart + chartRaceDuration;
const tableStart = comparisonStart + comparisonDuration;
const codeMotionStart = tableStart + tableDuration;
const narrativeStart = codeMotionStart + codeMotionDuration;

export const styleGuideSchema = z.object({
  headline: z.string(),
  caption: z.string(),
});

export type StyleGuideProps = z.infer<typeof styleGuideSchema>;

const colorRows = [
  ["纸面", "canvas", theme.colors.canvas],
  ["柔面", "surfaceSoft", theme.colors.surfaceSoft],
  ["主墨", "ink", theme.colors.ink],
  ["正文", "body", theme.colors.body],
  ["弱注", "muted", theme.colors.muted],
  ["强调", "primary", theme.colors.primary],
] as const;

const MediaFigure = ({
  children,
  caption,
  style,
}: {
  children: ReactNode;
  caption: ReactNode;
  style?: CSSProperties;
}) => (
  <Stack gap="xs" style={{ width: "100%", ...style }}>
    {children}
    <Caption size="label" align="center" maxWidth="100%">
      {caption}
    </Caption>
  </Stack>
);

const TopicChip = ({ children }: { children: ReactNode }) => (
  <span
    style={{
      display: "inline-flex",
      minHeight: 44,
      alignItems: "center",
      border: `${theme.stroke.hairline}px solid ${theme.colors.hairline}`,
      background: theme.colors.surface,
      color: theme.colors.body,
      padding: "0 16px",
      fontSize: theme.typography.size.label,
      lineHeight: 1,
    }}
  >
    {children}
  </span>
);

const guideBrand = "AI 未来推演 / Style Guide";

const GuidePage = ({
  children,
  section,
  index,
  subtitle,
}: {
  children: ReactNode;
  section: ReactNode;
  index: ReactNode;
  subtitle?: ReactNode;
}) => (
  <PageLayout
    header={{ brand: guideBrand, section, index }}
    footer={{ subtitle }}
  >
    {children}
  </PageLayout>
);

const CoverLayoutDiagram = () => (
  <div
    style={{
      height: 390,
      boxSizing: "border-box",
      border: `${theme.stroke.strong}px solid ${theme.colors.ink}`,
      padding: theme.space.md,
      display: "grid",
      gridTemplateRows: "42px minmax(0, 1fr) 76px",
      gap: theme.space.sm,
      background: theme.colors.surface,
    }}
  >
    <div
      style={{
        borderBottom: `${theme.stroke.hairline}px solid ${theme.colors.hairline}`,
        color: theme.colors.muted,
        fontSize: theme.typography.size.label,
      }}
    >
      NAVIGATION / 01
    </div>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 3fr",
        gap: theme.space.sm,
      }}
    >
      <div style={{ background: theme.colors.surfaceSoft }} />
      <div
        style={{
          border: `${theme.stroke.strong}px solid ${theme.colors.primary}`,
        }}
      />
    </div>
    <div
      style={{
        borderTop: `${theme.stroke.hairline}px solid ${theme.colors.hairline}`,
        color: theme.colors.muted,
        fontSize: theme.typography.size.label,
        paddingTop: theme.space.xs,
      }}
    >
      SUBTITLE
    </div>
  </div>
);

const CoverSlide = ({ headline, caption }: StyleGuideProps) => (
  <CoverPage
    brand="REMOTION STUDIO / ARCHIVE MONO"
    edition="STYLE GUIDE / 13 SCENES"
    eyebrow="中文知识视频 / Visual System"
    title={
      <>
        <TextFit maxChars={12} baseSize={theme.typography.size.display}>
          {headline}
        </TextFit>
        <span style={{ display: "block" }}>统一页面模板</span>
      </>
    }
    subtitle={caption}
    visual={<CoverLayoutDiagram />}
    footer={
      <Stack direction="row" gap="sm" style={{ flexWrap: "wrap" }}>
        <TopicChip>PageLayout</TopicChip>
        <TopicChip>ContentLayout</TopicChip>
        <TopicChip>标题 / 字幕 / 媒体</TopicChip>
        <TopicChip>16:9 / 9:16 / 1:1</TopicChip>
      </Stack>
    }
  />
);

const SectionTransitionSlide = () => (
  <SectionPage
    brand={guideBrand}
    section="01 / 页面系统"
    index="01 / 13"
    title={"页面先统一\n组件才有意义"}
    subtitle="SectionPage / 章节切换 / deterministic text reveal"
  />
);

const LayoutDiagram = ({
  label,
  columns,
  rows,
  areas,
}: {
  label: string;
  columns: string;
  rows: string;
  areas: string[];
}) => (
  <Stack gap="xs">
    <Caption size="label">{label}</Caption>
    <div
      style={{
        height: 164,
        border: `${theme.stroke.hairline}px solid ${theme.colors.hairline}`,
        padding: theme.space.sm,
        display: "grid",
        gridTemplateColumns: columns,
        gridTemplateRows: rows,
        gap: theme.space.xs,
      }}
    >
      {areas.map((area, index) => (
        <div
          key={`${label}-${index}`}
          style={{
            minWidth: 0,
            minHeight: 0,
            background:
              index === Math.floor(areas.length / 2)
                ? theme.colors.surfaceStrong
                : theme.colors.surfaceSoft,
            borderLeft:
              index === 0
                ? `${theme.stroke.strong}px solid ${theme.colors.primary}`
                : undefined,
            color: theme.colors.muted,
            fontSize: theme.typography.size.label,
            display: "grid",
            placeItems: "center",
          }}
        >
          {area}
        </div>
      ))}
    </div>
  </Stack>
);

const LayoutSystemSlide = () => (
  <GuidePage
    section="页面布局 / Layout"
    index="02 / 13"
    subtitle="导航、内容和字幕拥有固定槽位；内容区只选择布局，不再重新发明页面边界。"
  >
    <ContentLayout
      variant="split"
      ratio="2:3"
      primary={
        <Stack gap="lg">
          <PageIntro
            eyebrow="布局原则 / Structure"
            title="先固定页面，再组织内容。"
            body="普通页面统一顶部导航、内容起点和底部字幕槽位。封面与章节页是明确变体，因此差异是有意的。"
          />
          <Stack gap="sm">
            <BodyText size="caption">split：图文、讲解与证据。</BodyText>
            <BodyText size="caption">stack：时间线、前后对比。</BodyText>
            <BodyText size="caption">focus：标题、结论、单一对象。</BodyText>
            <BodyText size="caption">surround：中心对象与两侧注释。</BodyText>
          </Stack>
        </Stack>
      }
      secondary={
        <div
          style={{
            height: "100%",
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: theme.space.lg,
            alignContent: "center",
          }}
        >
          <LayoutDiagram
            label="split / 左右"
            columns="2fr 3fr"
            rows="1fr"
            areas={["COPY", "MEDIA"]}
          />
          <LayoutDiagram
            label="stack / 上下"
            columns="1fr"
            rows="1fr 1fr"
            areas={["TITLE", "CONTENT"]}
          />
          <LayoutDiagram
            label="focus / 聚焦"
            columns="1fr"
            rows="1fr"
            areas={["ONE IDEA"]}
          />
          <LayoutDiagram
            label="surround / 围绕"
            columns="0.8fr 1.6fr 0.8fr"
            rows="1fr"
            areas={["NOTE", "FOCUS", "NOTE"]}
          />
        </div>
      }
    />
  </GuidePage>
);

const TypeScalePanel = () => (
  <div
    style={{
      flex: 1,
      minWidth: 0,
      height: "100%",
      boxSizing: "border-box",
      borderTop: `${theme.stroke.hairline}px solid ${theme.colors.hairline}`,
      borderBottom: `${theme.stroke.hairline}px solid ${theme.colors.hairline}`,
      padding: `${theme.space.lg}px ${theme.space.lg}px ${theme.space.md}px`,
      display: "flex",
    }}
  >
    <Stack justify="space-between" style={{ width: "100%", height: "100%" }}>
      <Stack gap="lg">
        <Stack gap="sm">
          <Eyebrow>01 / 章节提示</Eyebrow>
          <Title size="display" maxWidth={900}>
            一屏只讲一个判断
          </Title>
          <Caption>Display title / 用于开场和强转折。</Caption>
        </Stack>
        <Rule />
        <Stack gap="sm">
          <Title size="title" maxWidth={900}>
            主标题负责给出结论
          </Title>
          <BodyText size="caption" maxWidth={900}>
            小标题和正文补充必要上下文，英文名词只保留关键短语，例如
            alignment、governance、Plan A。
          </BodyText>
        </Stack>
      </Stack>
      <Stack direction="row" gap="sm" style={{ flexWrap: "wrap" }}>
        <Caption size="label">图注 / 来源 / 时间</Caption>
        <Caption size="label" tone="primary">
          primary 只做少量强调
        </Caption>
      </Stack>
    </Stack>
  </div>
);

const ColorBoard = () => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: theme.space.sm,
      width: "100%",
    }}
  >
    {colorRows.map(([label, name, color], index) => (
      <FadeIn key={name} from={8 + stagger(index, 3)} y={12}>
        <div
          style={{
            height: 112,
            border: `${theme.stroke.hairline}px solid ${theme.colors.hairline}`,
            background: color,
            color:
              name === "ink" || name === "body"
                ? theme.colors.canvas
                : theme.colors.ink,
            padding: 14,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            fontSize: theme.typography.size.label,
          }}
        >
          <span>{label}</span>
          <span>{name}</span>
        </div>
      </FadeIn>
    ))}
  </div>
);

const TypographySlide = () => (
  <GuidePage
    section="文字系统 / Typography"
    index="03 / 13"
    subtitle="标题、小标题、正文和图注各占一个层级，所有页面从同一内容基线开始。"
  >
    <ContentLayout
      variant="split"
      ratio="2:3"
      primary={
        <Stack gap="lg">
          <PageIntro
            eyebrow="排版原则 / Hierarchy"
            title="标题先建立层级，再谈装饰。"
            body="中文视频最常见的问题不是字体不酷，而是标题、小标题、正文抢同一个位置。模板默认把它们分成三层。"
            size="subtitle"
          />
          <ColorBoard />
        </Stack>
      }
      secondary={<TypeScalePanel />}
    />
  </GuidePage>
);

const TextMotionSlide = () => (
  <GuidePage
    section="文字动效 / Text Motion"
    index="04 / 13"
    subtitle="逐字用于短中文标题，逐词用于英文短句，逐行用于两到三层判断。"
  >
    <ContentLayout
      variant="split"
      ratio="2:3"
      primary={
        <Stack gap="lg">
          <PageIntro
            eyebrow="动效原则 / Reveal"
            title="逐字出现适合转场，不适合长段落。"
            body="RevealText 负责可组合的拆字、拆词、拆行；KineticTitle 负责章节标题。所有动画都由当前帧驱动。"
          />
          <Stack gap="sm">
            <BodyText size="caption">char：中文短标题，制造节奏。</BodyText>
            <BodyText size="caption">word：英文短句，保持可读性。</BodyText>
            <BodyText size="caption">line：两到三行判断，逐层出现。</BodyText>
          </Stack>
        </Stack>
      }
      secondary={
        <div
          style={{
            height: "100%",
            boxSizing: "border-box",
            borderTop: `${theme.stroke.hairline}px solid ${theme.colors.hairline}`,
            borderBottom: `${theme.stroke.hairline}px solid ${theme.colors.hairline}`,
            padding: `${theme.space.xl}px ${theme.space.lg}px ${theme.space.lg}px`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <KineticTitle
            eyebrow="04 / 章节转场"
            title={"未来不是\n线性发生"}
            caption="KineticTitle / char reveal / rise"
            from={6}
            by="char"
            stagger={2}
            maxWidth={920}
          />
          <Rule />
          <Stack gap="md">
            <Stack gap="xs">
              <Caption size="label">RevealText / word / soft</Caption>
              <BodyText size="caption" maxWidth={980}>
                <RevealText
                  text="AI systems move from tools to actors."
                  by="word"
                  preset="soft"
                  from={54}
                  stagger={5}
                />
              </BodyText>
            </Stack>
            <Stack gap="xs">
              <Caption size="label">RevealText / line / slide</Caption>
              <Title size="subtitle" maxWidth={980}>
                <RevealText
                  text={"先给判断\n再补证据"}
                  by="line"
                  preset="slide"
                  from={82}
                  stagger={10}
                  x={44}
                />
              </Title>
            </Stack>
          </Stack>
        </div>
      }
    />
  </GuidePage>
);

const MediaSystemSlide = () => (
  <GuidePage
    section="媒体系统 / Media"
    index="05 / 13"
    subtitle="图片和动图进入固定内容区；图注位于媒体下方，不遮挡素材本身。"
  >
    <ContentLayout
      variant="split"
      ratio="2:3"
      align="center"
      primary={
        <Stack gap="lg">
          <PageIntro
            eyebrow="素材规则 / Evidence"
            title="图片是证据，不是背景装饰。"
            body="截图、封面、长图和动图都进入稳定容器。标签不压在图片上，来源和说明放在图注里。"
          />
          <Stack gap="sm">
            <BodyText size="caption">cover：用于叙事裁切，保留焦点。</BodyText>
            <BodyText size="caption">
              contain：用于截图和文档，不损失信息。
            </BodyText>
            <BodyText size="caption">
              caption：低权重说明，不抢主标题。
            </BodyText>
          </Stack>
        </Stack>
      }
      secondary={
        <Stack
          direction="row"
          gap="lg"
          align="center"
          style={{ height: "100%" }}
        >
          <MediaFigure caption="推文截图 / contain" style={{ flex: 1.4 }}>
            <MediaFrame
              src="videos/style-guide/images/tweet.png"
              alt="Daniel Kokotajlo tweet screenshot"
              aspectRatio="970 / 346"
              fit="contain"
              variant="raised"
              padding="xs"
              width="100%"
            />
          </MediaFigure>
          <MediaFigure caption="AI 2027 / contain" style={{ flex: 0.8 }}>
            <MediaFrame
              src="videos/style-guide/images/ai-2027.webp"
              alt="AI 2027 cover"
              aspectRatio="1080 / 1526"
              fit="contain"
              objectPosition="center top"
              variant="screen"
              padding="xs"
              width="100%"
            />
          </MediaFigure>
        </Stack>
      }
    />
  </GuidePage>
);

const llmTimeline = [
  { label: "2017", value: 12 },
  { label: "2018", value: 18 },
  { label: "2020", value: 34 },
  { label: "2022", value: 48 },
  { label: "2023", value: 66 },
  { label: "2024", value: 78 },
  { label: "2025", value: 88 },
];

const llmMilestones = [
  { index: 0, label: "Transformer", note: "架构起点" },
  { index: 2, label: "GPT-3", note: "规模跃迁" },
  { index: 3, label: "ChatGPT", note: "进入大众视野", side: "bottom" as const },
  { index: 4, label: "GPT-4", note: "能力平台化" },
  { index: 6, label: "Agents", note: "工具与工作流" },
];

const languageSnapshots = [
  {
    label: "2019",
    values: [
      { id: "js", label: "JavaScript", value: 92, color: theme.colors.primary },
      {
        id: "python",
        label: "Python",
        value: 78,
        color: theme.colors.category.qg,
      },
      { id: "java", label: "Java", value: 70, color: theme.colors.warning },
      { id: "ts", label: "TypeScript", value: 40, color: theme.colors.success },
      { id: "go", label: "Go", value: 38, color: theme.colors.category.qo },
      { id: "rust", label: "Rust", value: 20, color: theme.colors.muted },
    ],
  },
  {
    label: "2020",
    values: [
      { id: "js", label: "JavaScript", value: 91, color: theme.colors.primary },
      {
        id: "python",
        label: "Python",
        value: 84,
        color: theme.colors.category.qg,
      },
      { id: "java", label: "Java", value: 66, color: theme.colors.warning },
      { id: "ts", label: "TypeScript", value: 49, color: theme.colors.success },
      { id: "go", label: "Go", value: 42, color: theme.colors.category.qo },
      { id: "rust", label: "Rust", value: 28, color: theme.colors.muted },
    ],
  },
  {
    label: "2021",
    values: [
      { id: "js", label: "JavaScript", value: 90, color: theme.colors.primary },
      {
        id: "python",
        label: "Python",
        value: 88,
        color: theme.colors.category.qg,
      },
      { id: "java", label: "Java", value: 62, color: theme.colors.warning },
      { id: "ts", label: "TypeScript", value: 57, color: theme.colors.success },
      { id: "go", label: "Go", value: 45, color: theme.colors.category.qo },
      { id: "rust", label: "Rust", value: 35, color: theme.colors.muted },
    ],
  },
  {
    label: "2022",
    values: [
      {
        id: "python",
        label: "Python",
        value: 91,
        color: theme.colors.category.qg,
      },
      { id: "js", label: "JavaScript", value: 88, color: theme.colors.primary },
      { id: "ts", label: "TypeScript", value: 65, color: theme.colors.success },
      { id: "java", label: "Java", value: 58, color: theme.colors.warning },
      { id: "go", label: "Go", value: 49, color: theme.colors.category.qo },
      { id: "rust", label: "Rust", value: 43, color: theme.colors.muted },
    ],
  },
  {
    label: "2023",
    values: [
      {
        id: "python",
        label: "Python",
        value: 94,
        color: theme.colors.category.qg,
      },
      { id: "js", label: "JavaScript", value: 87, color: theme.colors.primary },
      { id: "ts", label: "TypeScript", value: 73, color: theme.colors.success },
      { id: "rust", label: "Rust", value: 52, color: theme.colors.muted },
      { id: "go", label: "Go", value: 51, color: theme.colors.category.qo },
      { id: "java", label: "Java", value: 55, color: theme.colors.warning },
    ],
  },
  {
    label: "2024",
    values: [
      {
        id: "python",
        label: "Python",
        value: 96,
        color: theme.colors.category.qg,
      },
      { id: "js", label: "JavaScript", value: 86, color: theme.colors.primary },
      { id: "ts", label: "TypeScript", value: 79, color: theme.colors.success },
      { id: "rust", label: "Rust", value: 59, color: theme.colors.muted },
      { id: "go", label: "Go", value: 55, color: theme.colors.category.qo },
      { id: "java", label: "Java", value: 53, color: theme.colors.warning },
    ],
  },
  {
    label: "2025",
    values: [
      {
        id: "python",
        label: "Python",
        value: 97,
        color: theme.colors.category.qg,
      },
      { id: "js", label: "JavaScript", value: 85, color: theme.colors.primary },
      { id: "ts", label: "TypeScript", value: 83, color: theme.colors.success },
      { id: "rust", label: "Rust", value: 64, color: theme.colors.muted },
      { id: "go", label: "Go", value: 58, color: theme.colors.category.qo },
      { id: "java", label: "Java", value: 51, color: theme.colors.warning },
    ],
  },
];

type ModelCapabilityRow = {
  model: string;
  release: string;
  context: string;
  modality: string;
  signal: string;
  status: "观察" | "转折" | "成熟" | "高风险";
};

const modelCapabilityRows: ModelCapabilityRow[] = [
  {
    model: "GPT-3",
    release: "2020",
    context: "2K",
    modality: "text",
    signal: "规模跃迁",
    status: "观察",
  },
  {
    model: "ChatGPT",
    release: "2022",
    context: "4K",
    modality: "dialogue",
    signal: "大众采用",
    status: "转折",
  },
  {
    model: "GPT-4",
    release: "2023",
    context: "32K",
    modality: "text + vision",
    signal: "能力平台化",
    status: "成熟",
  },
  {
    model: "Claude 3.5",
    release: "2024",
    context: "200K",
    modality: "long context",
    signal: "工作流替代",
    status: "成熟",
  },
  {
    model: "Agent systems",
    release: "2025",
    context: "tool use",
    modality: "actions",
    signal: "自主执行",
    status: "高风险",
  },
];

const modelTableColumns: DataTableColumn<ModelCapabilityRow>[] = [
  { key: "model", header: "模型 / 系统", width: "1.35fr", emphasis: true },
  {
    key: "release",
    header: "时间",
    width: 108,
    align: "center",
    monospace: true,
  },
  {
    key: "context",
    header: "上下文",
    width: 160,
    align: "right",
    monospace: true,
  },
  { key: "modality", header: "形态", width: "1.1fr" },
  { key: "signal", header: "信号", width: "1.15fr" },
  {
    key: "status",
    header: "状态",
    width: 150,
    align: "center",
    value: (row) => ({
      value: row.status,
      marker: true,
      strong: row.status === "转折" || row.status === "高风险",
      tone:
        row.status === "高风险"
          ? "error"
          : row.status === "转折"
            ? "primary"
            : row.status === "成熟"
              ? "success"
              : "muted",
    }),
  },
];

const LlmTimelineChartSlide = () => (
  <GuidePage
    section="图表系统 / Line Chart"
    index="06 / 13"
    subtitle="折线揭示趋势，里程碑只标记真正改变叙事方向的节点。"
  >
    <ContentLayout
      variant="split"
      ratio="1:2"
      primary={
        <Stack gap="lg">
          <PageIntro
            eyebrow="趋势叙事 / Timeline"
            title="折线图适合讲技术路线的跃迁。"
            body="这里用演示指数表达 LLM 从架构突破到产品化、工具化的节奏。真实项目里可以替换成 benchmark、用户数或收入。"
            size="subtitle"
          />
          <Stack gap="sm">
            <BodyText size="caption">
              milestone：标出转折点，而不是堆满标签。
            </BodyText>
            <BodyText size="caption">
              area reveal：用淡色面积承托趋势。
            </BodyText>
            <BodyText size="caption">
              demo index：示例指数，不代表精确统计。
            </BodyText>
          </Stack>
        </Stack>
      }
      secondary={
        <ChartFrame
          title="大语言模型发展节奏"
          caption="LineChart / LLM timeline / demo index"
          style={{ height: "100%", minWidth: 0 }}
        >
          <LineChart
            data={llmTimeline}
            minValue={0}
            maxValue={100}
            from={12}
            duration={86}
            unit=""
            showValueLabels
            milestones={llmMilestones}
            width={920}
            height={520}
          />
        </ChartFrame>
      }
    />
  </GuidePage>
);

const RacingBarChartSlide = () => (
  <GuidePage
    section="图表系统 / Racing Bar"
    index="07 / 13"
    subtitle="排名位置、数值和年份同时连续插值，底部文字区不会再与图形争抢空间。"
  >
    <ContentLayout
      variant="split"
      ratio="1:2"
      primary={
        <Stack gap="lg">
          <PageIntro
            eyebrow="排名叙事 / Ranking"
            title="动态条形图适合讲排名变化。"
            body="UP 主常用它展示语言、城市、产品、模型的长期变化。关键不是柱子会动，而是排名、数值和年份同步变化。"
            size="subtitle"
          />
          <Stack gap="sm">
            <BodyText size="caption">position：排名位置连续插值。</BodyText>
            <BodyText size="caption">value：柱子长度和数值同步变化。</BodyText>
            <BodyText size="caption">
              footer：年份和说明放进独立文本区。
            </BodyText>
          </Stack>
        </Stack>
      }
      secondary={
        <ChartFrame
          title="编程语言欢迎度变化"
          caption="RacingBarChart / popularity index / demo data"
          style={{ height: "100%", minWidth: 0 }}
        >
          <RacingBarChart
            snapshots={languageSnapshots}
            from={12}
            duration={168}
            unit=""
            visibleCount={6}
            maxValue={100}
            footerText="timeline / demo snapshots"
            width={920}
            height={540}
          />
        </ChartFrame>
      }
    />
  </GuidePage>
);

const comparisonSeries: ComparisonSeries[] = [
  { id: "ts5", label: "TypeScript 5" },
  { id: "ts6", label: "TypeScript 6" },
  { id: "ts7", label: "TypeScript 7" },
  { id: "optimized", label: "TS 7 optimized" },
];

const comparisonData = [
  {
    label: "VS Code",
    note: "2.3M LoC",
    values: { ts5: 5.8, ts6: 5.2, ts7: 4.4, optimized: 4.0 },
  },
  {
    label: "Sentry",
    note: "1.9M LoC",
    values: { ts5: 5.4, ts6: 4.9, ts7: 4.6, optimized: 4.2 },
  },
  {
    label: "Bluesky",
    note: "628K LoC",
    values: { ts5: 2.2, ts6: 1.8, ts7: 1.3, optimized: 1.1 },
  },
  {
    label: "Playwright",
    note: "528K LoC",
    values: { ts5: 1.3, ts6: 1.0, ts7: 0.9, optimized: 0.8 },
  },
];

const ComparisonChartSlide = () => (
  <GuidePage
    section="图表系统 / Comparison"
    index="08 / 13"
    subtitle="多组对比先统一量纲，再决定横向或纵向；颜色只负责区分系列。"
  >
    <ContentLayout
      variant="split"
      ratio="1:2"
      primary={
        <Stack gap="lg">
          <PageIntro
            eyebrow="多组对比 / Up to 4 series"
            title="同一量纲，最多比较四组数据。"
            body="适合版本、方案、地区和模型之间的横向比较。横版容纳长名称，竖版强调总体量级。"
            size="subtitle"
          />
          <Stack gap="sm">
            <BodyText size="caption">series：一到四组，图例固定排序。</BodyText>
            <BodyText size="caption">
              delta：只突出一个系列相对基准的变化。
            </BodyText>
            <BodyText size="caption">
              gradient：低反差渐变，增强质感但不抢数据。
            </BodyText>
          </Stack>
        </Stack>
      }
      secondary={
        <div
          style={{
            height: "100%",
            minWidth: 0,
            display: "grid",
            gridTemplateColumns: "1.28fr 0.92fr",
            gap: theme.space.sm,
          }}
        >
          <ChartFrame
            title="大型项目内存占用"
            caption="horizontal / baseline delta / demo data"
            style={{ height: "100%", minWidth: 0 }}
          >
            <ComparisonChart
              series={comparisonSeries}
              data={comparisonData}
              orientation="horizontal"
              maxValue={6.2}
              unit=" GB"
              baselineSeriesId="ts5"
              deltaSeriesId="optimized"
              from={10}
              duration={74}
              width={780}
              height={560}
            />
          </ChartFrame>
          <ChartFrame
            title="纵向分组表达"
            caption="vertical / four series / same scale"
            style={{ height: "100%", minWidth: 0 }}
          >
            <ComparisonChart
              series={comparisonSeries}
              data={comparisonData.slice(0, 3)}
              orientation="vertical"
              maxValue={6.2}
              unit=""
              from={18}
              duration={74}
              width={540}
              height={560}
            />
          </ChartFrame>
        </div>
      }
    />
  </GuidePage>
);

const TableSystemSlide = () => (
  <GuidePage
    section="表格系统 / DataTable"
    index="09 / 13"
    subtitle="列宽、状态与逐行进入遵循固定规则，观众可以快速扫到结论。"
  >
    <ContentLayout
      variant="split"
      ratio="1:2"
      primary={
        <Stack gap="lg">
          <PageIntro
            eyebrow="信息密度 / Ledger"
            title="表格适合承载密集但有秩序的信息。"
            body="它不是网页表格搬运，而是视频里的 ledger：列宽固定、状态明确、每行逐帧进入，观众能快速扫到结论。"
            size="subtitle"
          />
          <Stack gap="sm">
            <BodyText size="caption">column：先定义宽度、对齐和强调。</BodyText>
            <BodyText size="caption">cell：状态色只用于小标记。</BodyText>
            <BodyText size="caption">
              row reveal：逐行进入，不靠 CSS 动画。
            </BodyText>
          </Stack>
        </Stack>
      }
      secondary={
        <Stack justify="center" style={{ height: "100%", minWidth: 0 }}>
          <DataTable
            columns={modelTableColumns}
            rows={modelCapabilityRows}
            rowKey={(row) => row.model}
            highlightRows={[1, 4]}
            from={10}
            revealStagger={4}
            footer={
              <>
                <span>demo data / 用于模板演示</span>
                <span>status: observation ledger</span>
              </>
            }
          />
        </Stack>
      }
    />
  </GuidePage>
);

const MotionStrip = () => {
  const frame = useCurrentFrame();
  const cycleFrame = frame % 72;
  const phaseFrame = cycleFrame <= 36 ? cycleFrame : 72 - cycleFrame;
  const standardProgress = interpolate(phaseFrame, [0, 36], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...theme.motion.easing.standard),
  });
  const preciseProgress = interpolate(phaseFrame, [0, 36], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...theme.motion.easing.precise),
  });

  return (
    <MediaFrame variant="stroke" padding="md">
      <Stack gap="sm">
        {[
          ["standard easing", standardProgress],
          ["precise easing", preciseProgress],
        ].map(([name, progress]) => (
          <div
            key={name}
            style={{
              position: "relative",
              width: "100%",
              height: 58,
              border: `${theme.stroke.hairline}px solid ${theme.colors.hairlineSoft}`,
              background: theme.colors.canvas,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: `${Number(progress) * 100}%`,
                width: 228,
                height: "100%",
                background:
                  name === "standard easing"
                    ? theme.colors.ink
                    : theme.colors.primary,
                color:
                  name === "standard easing"
                    ? theme.colors.canvas
                    : theme.colors.ink,
                display: "flex",
                alignItems: "center",
                paddingLeft: 18,
                fontSize: theme.typography.size.label,
                translate: `${Number(progress) * -228}px 0`,
              }}
            >
              {name}
            </div>
          </div>
        ))}
      </Stack>
    </MediaFrame>
  );
};

const CodeMotionSlide = () => (
  <GuidePage
    section="代码与动效 / Code + Motion"
    index="10 / 13"
    subtitle="代码先离线高亮，再按当前帧聚焦；命令行样式只在真正的代码语境中出现。"
  >
    <ContentLayout
      variant="split"
      ratio="2:3"
      primary={
        <Stack gap="lg">
          <PageIntro
            eyebrow="代码讲解 / Walkthrough"
            title="代码和动效也要服从叙事。"
            body="CodeFrame 先离线高亮，再在时间线上做 focus。动效只用 useCurrentFrame、interpolate 和固定 easing。"
            size="subtitle"
          />
          <MotionStrip />
        </Stack>
      }
      secondary={
        <CodeFrame
          code={highlightedCode}
          filename="WelcomeScene.tsx"
          focusSteps={[
            { lines: "2-7", from: 16 },
            { lines: "9-13", from: 62 },
          ]}
          focusDuration={theme.motion.duration.enter}
          revealFrom={0}
          revealStagger={theme.code.revealStagger}
          style={{ height: "100%", minHeight: 0 }}
        />
      }
    />
  </GuidePage>
);

type StorySlideProps = {
  section: string;
  index: string;
  subtitle: ReactNode;
  eyebrow: string;
  title: ReactNode;
  body?: ReactNode;
  quote?: ReactNode;
  media: ReactNode;
  ratio?: "1:1" | "2:3" | "3:2" | "1:2" | "2:1";
};

const StorySlide = ({
  section,
  index,
  subtitle,
  eyebrow,
  title,
  body,
  quote,
  media,
  ratio = "1:1",
}: StorySlideProps) => (
  <GuidePage section={section} index={index} subtitle={subtitle}>
    <ContentLayout
      variant="split"
      ratio={ratio}
      align="center"
      primary={
        <FadeIn from={0} y={18}>
          <Stack gap="md">
            <PageIntro
              eyebrow={eyebrow}
              title={title}
              body={body}
              size="subtitle"
              maxWidth={760}
            />
            {quote ? (
              <div
                style={{
                  maxWidth: 820,
                  borderLeft: `${theme.stroke.strong}px solid ${theme.colors.primary}`,
                  paddingLeft: theme.space.md,
                }}
              >
                <BodyText maxWidth={760} size="caption">
                  {quote}
                </BodyText>
              </div>
            ) : null}
          </Stack>
        </FadeIn>
      }
      secondary={
        <FadeIn
          from={8}
          y={18}
          style={{
            height: "100%",
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {media}
        </FadeIn>
      }
    />
  </GuidePage>
);

const TweetStory = () => (
  <StorySlide
    section="叙事示例 / Source"
    index="11 / 13"
    subtitle="他们给出的不是更乐观的预测，而是一条主动选择的路径。"
    eyebrow="01 / 来源"
    title="Daniel Kokotajlo 是这么介绍的："
    quote={
      <Stack gap="sm">
        <span>
          “在 AI 2027 中，我们预测 AI 将接管世界，或让权力发生不可逆的集中。
        </span>
        <span>
          而在 AI 2040: Plan A 中，我们写下了我们的正面愿景：事情本应如何发生。”
        </span>
      </Stack>
    }
    media={
      <MediaFigure
        caption="Daniel Kokotajlo 推文截图"
        style={{ maxWidth: 980 }}
      >
        <MediaFrame
          src="videos/style-guide/images/tweet.png"
          alt="Daniel Kokotajlo tweet about AI 2027 and AI 2040 Plan A"
          aspectRatio="970 / 346"
          fit="contain"
          variant="raised"
          padding="xs"
          width="100%"
        />
      </MediaFigure>
    }
    ratio="2:3"
  />
);

const Ai2027Story = () => (
  <StorySlide
    section="叙事示例 / Context"
    index="12 / 13"
    subtitle="理解 Plan A 之前，需要先理解《AI 2027》给出的风险基线。"
    eyebrow="02 / 背景"
    title="如果你没读过《AI 2027》，这里补个课。"
    body="它不是新闻摘要，而是一份按时间推进的未来场景：从模型能力、组织竞争，到 governance 失效的连锁反应。"
    media={
      <MediaFigure caption="《AI 2027》原文封面" style={{ maxWidth: 610 }}>
        <MediaFrame
          src="videos/style-guide/images/ai-2027.webp"
          alt="AI 2027 article cover"
          aspectRatio="1080 / 1526"
          fit="contain"
          variant="screen"
          padding="xs"
          width="100%"
          style={{ maxHeight: 820 }}
        />
      </MediaFigure>
    }
    ratio="2:3"
  />
);

const ForecastProcessStory = () => (
  <StorySlide
    section="叙事示例 / Timeline"
    index="13 / 13"
    subtitle="逐月推演把抽象风险变成一条可以检查、质疑和讨论的时间线。"
    eyebrow="03 / 推演"
    title="2025 年 4 月，他们发布了一份逐月推演的 AI 未来场景。"
    body="参与者包括 Daniel Kokotajlo、Scott Alexander、Eli Lifland、Thomas Larsen 和 Romeo Dean。"
    media={
      <MediaFigure caption="AI 2027 逐月推演过程" style={{ maxWidth: 700 }}>
        <MediaFrame
          aspectRatio="640 / 667"
          variant="screen"
          padding="xs"
          width="100%"
        >
          <AnimatedImage
            src={staticFile("videos/style-guide/images/forecast-process.gif")}
            width={640}
            height={667}
            fit="cover"
            loopBehavior="loop"
            durationInFrames={storyDuration}
            style={{
              width: "100%",
              height: "100%",
            }}
          />
        </MediaFrame>
      </MediaFigure>
    }
    ratio="1:1"
  />
);

export const StyleGuide = ({ headline, caption }: StyleGuideProps) => (
  <>
    <Sequence durationInFrames={coverDuration}>
      <CoverSlide headline={headline} caption={caption} />
    </Sequence>
    <Sequence from={sectionStart} durationInFrames={sectionDuration}>
      <SectionTransitionSlide />
    </Sequence>
    <Sequence from={layoutStart} durationInFrames={layoutDuration}>
      <LayoutSystemSlide />
    </Sequence>
    <Sequence from={typeStart} durationInFrames={typeDuration}>
      <TypographySlide />
    </Sequence>
    <Sequence from={textMotionStart} durationInFrames={textMotionDuration}>
      <TextMotionSlide />
    </Sequence>
    <Sequence from={mediaStart} durationInFrames={mediaDuration}>
      <MediaSystemSlide />
    </Sequence>
    <Sequence from={chartLineStart} durationInFrames={chartLineDuration}>
      <LlmTimelineChartSlide />
    </Sequence>
    <Sequence from={chartRaceStart} durationInFrames={chartRaceDuration}>
      <RacingBarChartSlide />
    </Sequence>
    <Sequence from={comparisonStart} durationInFrames={comparisonDuration}>
      <ComparisonChartSlide />
    </Sequence>
    <Sequence from={tableStart} durationInFrames={tableDuration}>
      <TableSystemSlide />
    </Sequence>
    <Sequence from={codeMotionStart} durationInFrames={codeMotionDuration}>
      <CodeMotionSlide />
    </Sequence>
    <Sequence from={narrativeStart} durationInFrames={storyDuration}>
      <TweetStory />
    </Sequence>
    <Sequence
      from={narrativeStart + storyDuration}
      durationInFrames={storyDuration}
    >
      <Ai2027Story />
    </Sequence>
    <Sequence
      from={narrativeStart + storyDuration * 2}
      durationInFrames={storyDuration}
    >
      <ForecastProcessStory />
    </Sequence>
  </>
);

export const StyleGuideComposition = () => (
  <Composition
    id="style-guide"
    component={StyleGuide}
    durationInFrames={narrativeStart + storyDuration * 3}
    fps={fps}
    width={canvasPresets.landscape.width}
    height={canvasPresets.landscape.height}
    schema={styleGuideSchema}
    defaultProps={{
      headline: "AI 未来推演",
      caption:
        "一套面向中文知识视频的 Remotion visual system：标题清楚、媒体克制、动效逐帧确定。",
    }}
  />
);
