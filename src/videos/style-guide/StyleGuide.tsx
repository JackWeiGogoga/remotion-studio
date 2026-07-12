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
  DataTable,
  type DataTableColumn,
  Eyebrow,
  FadeIn,
  type HighlightedCode,
  LineChart,
  MediaFrame,
  RacingBarChart,
  Rule,
  SafeArea,
  Scene,
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
const typeDuration = seconds(4, fps);
const mediaDuration = seconds(4, fps);
const chartLineDuration = seconds(4, fps);
const chartRaceDuration = seconds(7, fps);
const tableDuration = seconds(4, fps);
const codeMotionDuration = seconds(4, fps);
const storyDuration = seconds(4, fps);
const narrativeStart =
  coverDuration +
  typeDuration +
  mediaDuration +
  chartLineDuration +
  chartRaceDuration +
  tableDuration +
  codeMotionDuration;

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

const slideRuleStyle: CSSProperties = {
  marginBottom: theme.space.lg,
};

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

const SectionText = ({
  eyebrow,
  title,
  body,
  maxWidth = 980,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  body?: ReactNode;
  maxWidth?: number;
}) => (
  <Stack gap="md" style={{ maxWidth }}>
    <Eyebrow>{eyebrow}</Eyebrow>
    <Title size="title" maxWidth={maxWidth}>
      {title}
    </Title>
    {body ? (
      <BodyText maxWidth={maxWidth} size="caption">
        {body}
      </BodyText>
    ) : null}
  </Stack>
);

const CoverSlide = ({ headline, caption }: StyleGuideProps) => (
  <Stack style={{ height: "100%" }} justify="space-between">
    <Stack direction="row" justify="space-between" align="flex-start">
      <FadeIn from={0} y={20}>
        <Stack gap="lg">
          <Eyebrow>Style Guide / 模板演示</Eyebrow>
          <Title size="display" maxWidth={1120}>
            <TextFit maxChars={12} baseSize={theme.typography.size.display}>
              {headline}
            </TextFit>
            <span style={{ display: "block" }}>视频模板</span>
          </Title>
          <BodyText maxWidth={920} size="caption">
            {caption}
          </BodyText>
        </Stack>
      </FadeIn>
      <FadeIn from={8} y={16}>
        <MediaFrame
          variant="raised"
          width={500}
          aspectRatio="landscape"
          padding="md"
        >
          <Stack gap="sm" style={{ height: "100%" }}>
            <Caption size="label">safe area / layout check</Caption>
            <div
              style={{
                flex: 1,
                border: `${theme.stroke.strong}px solid ${theme.colors.primary}`,
                display: "grid",
                placeItems: "center",
                color: theme.colors.muted,
                fontSize: theme.typography.size.label,
              }}
            >
              16:9 / 9:16 / 1:1
            </div>
          </Stack>
        </MediaFrame>
      </FadeIn>
    </Stack>
    <FadeIn from={16} y={12}>
      <Stack direction="row" gap="sm" style={{ flexWrap: "wrap" }}>
        <TopicChip>中文叙事</TopicChip>
        <TopicChip>AI 2027</TopicChip>
        <TopicChip>MediaFrame</TopicChip>
        <TopicChip>Charts</TopicChip>
        <TopicChip>CodeFrame</TopicChip>
        <TopicChip>deterministic motion</TopicChip>
      </Stack>
    </FadeIn>
  </Stack>
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
      padding: `${theme.space.xl}px ${theme.space.lg}px ${theme.space.lg}px`,
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
  <Stack style={{ height: "100%" }}>
    <Rule style={slideRuleStyle} />
    <Stack direction="row" gap="xl" align="stretch" style={{ flex: 1 }}>
      <Stack gap="xl" style={{ width: 620 }}>
        <SectionText
          eyebrow="文字系统 / Typography"
          title="标题先建立层级，再谈装饰。"
          body="中文视频最常见的问题不是字体不酷，而是标题、小标题、正文抢同一个位置。模板默认把它们分成三层。"
        />
        <ColorBoard />
      </Stack>
      <TypeScalePanel />
    </Stack>
  </Stack>
);

const MediaSystemSlide = () => (
  <Stack style={{ height: "100%" }}>
    <Rule style={slideRuleStyle} />
    <Stack direction="row" gap="xl" align="center" style={{ flex: 1 }}>
      <Stack gap="lg" style={{ width: 620 }}>
        <SectionText
          eyebrow="媒体系统 / Media"
          title="图片是证据，不是背景装饰。"
          body="截图、封面、长图和动图都进入稳定容器。标签不压在图片上，来源和说明放在图注里。"
        />
        <Stack gap="sm">
          <BodyText size="caption">cover：用于叙事裁切，保留焦点。</BodyText>
          <BodyText size="caption">
            contain：用于截图和文档，不损失信息。
          </BodyText>
          <BodyText size="caption">caption：低权重说明，不抢主标题。</BodyText>
        </Stack>
      </Stack>
      <Stack direction="row" gap="lg" align="center" style={{ flex: 1 }}>
        <MediaFigure caption="推文截图 / contain" style={{ maxWidth: 580 }}>
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
        <MediaFigure caption="AI 2027 / contain" style={{ maxWidth: 360 }}>
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
    </Stack>
  </Stack>
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
  <Stack style={{ height: "100%" }}>
    <Rule style={slideRuleStyle} />
    <Stack direction="row" gap="xl" align="stretch" style={{ flex: 1 }}>
      <Stack gap="lg" style={{ width: 560 }}>
        <SectionText
          eyebrow="图表系统 / Charts"
          title="折线图适合讲技术路线的跃迁。"
          body="这里用演示指数表达 LLM 从架构突破到产品化、工具化的节奏。真实项目里可以替换成 benchmark、用户数或收入。"
        />
        <Stack gap="sm">
          <BodyText size="caption">
            milestone：标出转折点，而不是堆满标签。
          </BodyText>
          <BodyText size="caption">area reveal：用淡色面积承托趋势。</BodyText>
          <BodyText size="caption">
            demo index：示例指数，不代表精确统计。
          </BodyText>
        </Stack>
      </Stack>
      <ChartFrame
        title="大语言模型发展节奏"
        caption="LineChart / LLM timeline / demo index"
        style={{ flex: 1, minWidth: 0 }}
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
    </Stack>
  </Stack>
);

const RacingBarChartSlide = () => (
  <Stack style={{ height: "100%" }}>
    <Rule style={slideRuleStyle} />
    <Stack direction="row" gap="xl" align="stretch" style={{ flex: 1 }}>
      <Stack gap="lg" style={{ width: 520 }}>
        <SectionText
          eyebrow="动态排名 / Racing Bar"
          title="动态条形图适合讲排名变化。"
          body="UP 主常用它展示语言、城市、产品、模型的长期变化。关键不是柱子会动，而是排名、数值和年份同步变化。"
        />
        <Stack gap="sm">
          <BodyText size="caption">position：排名位置连续插值。</BodyText>
          <BodyText size="caption">value：柱子长度和数值同步变化。</BodyText>
          <BodyText size="caption">footer：年份和说明放进独立文本区。</BodyText>
        </Stack>
      </Stack>
      <ChartFrame
        title="编程语言欢迎度变化"
        caption="RacingBarChart / popularity index / demo data"
        style={{ flex: 1, minWidth: 0 }}
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
    </Stack>
  </Stack>
);

const TableSystemSlide = () => (
  <Stack style={{ height: "100%" }}>
    <Rule style={slideRuleStyle} />
    <Stack direction="row" gap="xl" align="stretch" style={{ flex: 1 }}>
      <Stack gap="lg" style={{ width: 540 }}>
        <SectionText
          eyebrow="表格系统 / DataTable"
          title="表格适合承载密集但有秩序的信息。"
          body="它不是网页表格搬运，而是视频里的 ledger：列宽固定、状态明确、每行逐帧进入，观众能快速扫到结论。"
        />
        <Stack gap="sm">
          <BodyText size="caption">column：先定义宽度、对齐和强调。</BodyText>
          <BodyText size="caption">cell：状态色只用于小标记。</BodyText>
          <BodyText size="caption">
            row reveal：逐行进入，不靠 CSS 动画。
          </BodyText>
        </Stack>
      </Stack>
      <Stack justify="center" style={{ flex: 1, minWidth: 0 }}>
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
    </Stack>
  </Stack>
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
  <Stack style={{ height: "100%" }}>
    <Rule style={slideRuleStyle} />
    <Stack direction="row" gap="xl" align="stretch" style={{ flex: 1 }}>
      <Stack gap="lg" style={{ width: 610 }}>
        <SectionText
          eyebrow="代码与动效 / Code + Motion"
          title="代码和动效也要服从叙事。"
          body="CodeFrame 先离线高亮，再在时间线上做 focus。动效只用 useCurrentFrame、interpolate 和固定 easing。"
        />
        <MotionStrip />
      </Stack>
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
        style={{ flex: 1, minHeight: 0 }}
      />
    </Stack>
  </Stack>
);

type StorySlideProps = {
  eyebrow: string;
  title: ReactNode;
  body?: ReactNode;
  quote?: ReactNode;
  media: ReactNode;
  mediaFlex?: number;
  copyFlex?: number;
};

const StorySlide = ({
  eyebrow,
  title,
  body,
  quote,
  media,
  mediaFlex = 1,
  copyFlex = 1,
}: StorySlideProps) => (
  <Stack style={{ height: "100%" }}>
    <Rule style={slideRuleStyle} />
    <Stack
      direction="row"
      gap="xl"
      align="center"
      style={{ flex: 1, minHeight: 0 }}
    >
      <FadeIn from={0} y={18} style={{ flex: copyFlex, minWidth: 0 }}>
        <Stack gap="md">
          <Eyebrow>{eyebrow}</Eyebrow>
          <Title size="subtitle" maxWidth={760}>
            {title}
          </Title>
          {body ? (
            <BodyText maxWidth={760} size="caption">
              {body}
            </BodyText>
          ) : null}
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
      <FadeIn
        from={8}
        y={18}
        style={{
          flex: mediaFlex,
          minWidth: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        {media}
      </FadeIn>
    </Stack>
  </Stack>
);

const TweetStory = () => (
  <StorySlide
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
    copyFlex={0.8}
    mediaFlex={1.2}
  />
);

const Ai2027Story = () => (
  <StorySlide
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
    copyFlex={0.75}
    mediaFlex={1.25}
  />
);

const ForecastProcessStory = () => (
  <StorySlide
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
    copyFlex={0.95}
    mediaFlex={1.05}
  />
);

export const StyleGuide = ({ headline, caption }: StyleGuideProps) => (
  <Scene>
    <SafeArea>
      <Sequence durationInFrames={coverDuration} layout="none">
        <CoverSlide headline={headline} caption={caption} />
      </Sequence>
      <Sequence
        from={coverDuration}
        durationInFrames={typeDuration}
        layout="none"
      >
        <TypographySlide />
      </Sequence>
      <Sequence
        from={coverDuration + typeDuration}
        durationInFrames={mediaDuration}
        layout="none"
      >
        <MediaSystemSlide />
      </Sequence>
      <Sequence
        from={coverDuration + typeDuration + mediaDuration}
        durationInFrames={chartLineDuration}
        layout="none"
      >
        <LlmTimelineChartSlide />
      </Sequence>
      <Sequence
        from={coverDuration + typeDuration + mediaDuration + chartLineDuration}
        durationInFrames={chartRaceDuration}
        layout="none"
      >
        <RacingBarChartSlide />
      </Sequence>
      <Sequence
        from={
          coverDuration +
          typeDuration +
          mediaDuration +
          chartLineDuration +
          chartRaceDuration
        }
        durationInFrames={tableDuration}
        layout="none"
      >
        <TableSystemSlide />
      </Sequence>
      <Sequence
        from={
          coverDuration +
          typeDuration +
          mediaDuration +
          chartLineDuration +
          chartRaceDuration +
          tableDuration
        }
        durationInFrames={codeMotionDuration}
        layout="none"
      >
        <CodeMotionSlide />
      </Sequence>
      <Sequence
        from={narrativeStart}
        durationInFrames={storyDuration}
        layout="none"
      >
        <TweetStory />
      </Sequence>
      <Sequence
        from={narrativeStart + storyDuration}
        durationInFrames={storyDuration}
        layout="none"
      >
        <Ai2027Story />
      </Sequence>
      <Sequence
        from={narrativeStart + storyDuration * 2}
        durationInFrames={storyDuration}
        layout="none"
      >
        <ForecastProcessStory />
      </Sequence>
    </SafeArea>
  </Scene>
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
