import { useId, type CSSProperties, type ReactNode } from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { theme } from "@remotion-studio/video-themes";
import { Caption, MediaFrame, Stack } from "./components";

export type ChartDatum = {
  label: string;
  value: number;
  color?: string;
};

export type ChartMilestone = {
  index: number;
  label: string;
  note?: string;
  side?: "top" | "bottom";
  color?: string;
};

export type RacingBarDatum = ChartDatum & {
  id: string;
  gradient?: readonly [string, string];
};

export type RacingBarSnapshot = {
  label: string;
  values: RacingBarDatum[];
};

export type ComparisonSeries = {
  id: string;
  label: string;
  gradient?: readonly [string, string];
};

export type ComparisonDatum = {
  label: string;
  note?: string;
  values: Record<string, number>;
};

export type ComparisonChartProps = {
  series: ComparisonSeries[];
  data: ComparisonDatum[];
  orientation?: "horizontal" | "vertical";
  width?: number;
  height?: number;
  maxValue?: number;
  from?: number;
  duration?: number;
  stagger?: number;
  unit?: string;
  showLegend?: boolean;
  showValues?: boolean;
  showGrid?: boolean;
  baselineSeriesId?: string;
  deltaSeriesId?: string;
  formatValueLabel?: (
    value: number,
    datum: ComparisonDatum,
    series: ComparisonSeries,
  ) => string;
  style?: CSSProperties;
};

export type ChartFrameProps = {
  title?: ReactNode;
  caption?: ReactNode;
  children: ReactNode;
  style?: CSSProperties;
  contentStyle?: CSSProperties;
};

export type BarChartProps = {
  data: ChartDatum[];
  width?: number;
  height?: number;
  maxValue?: number;
  from?: number;
  duration?: number;
  stagger?: number;
  unit?: string;
  showValues?: boolean;
  showAxisLabels?: boolean;
  style?: CSSProperties;
};

export type LineChartProps = {
  data: ChartDatum[];
  width?: number;
  height?: number;
  minValue?: number;
  maxValue?: number;
  from?: number;
  duration?: number;
  color?: string;
  showDots?: boolean;
  showArea?: boolean;
  showAxisLabels?: boolean;
  showValueLabels?: boolean;
  unit?: string;
  curve?: "linear" | "smooth";
  milestones?: ChartMilestone[];
  clipPathId?: string;
  style?: CSSProperties;
};

export type PieChartProps = {
  data: ChartDatum[];
  size?: number;
  innerRadius?: number;
  from?: number;
  duration?: number;
  stagger?: number;
  showLegend?: boolean;
  centerLabel?: ReactNode;
  style?: CSSProperties;
};

export type RacingBarChartProps = {
  snapshots: RacingBarSnapshot[];
  width?: number;
  height?: number;
  visibleCount?: number;
  maxValue?: number;
  from?: number;
  duration?: number;
  unit?: string;
  showYear?: boolean;
  labelWidth?: number;
  footerHeight?: number;
  footerText?: string;
  fillStyle?: "gradient" | "solid";
  style?: CSSProperties;
};

const chartPalette = [
  theme.colors.primary,
  theme.colors.category.qg,
  theme.colors.success,
  theme.colors.warning,
  theme.colors.category.qo,
  theme.colors.muted,
] as const;

const seriesGradients = theme.chart.seriesGradients;

const chartFont = theme.typography.family;
const svgTextStyle = {
  fontFamily: chartFont,
  letterSpacing: 0,
} as const;

const clampValue = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const standardEasing = Easing.bezier(...theme.motion.easing.standard);

const getProgress = (frame: number, from: number, duration: number) =>
  interpolate(frame, [from, from + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: standardEasing,
  });

const getLinearProgress = (frame: number, from: number, duration: number) =>
  interpolate(frame, [from, from + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const getMaxValue = (data: ChartDatum[], maxValue?: number) =>
  Math.max(maxValue ?? Math.max(...data.map((item) => item.value), 1), 1);

const formatValue = (value: number, unit = "") =>
  `${Number.isInteger(value) ? value.toString() : value.toFixed(1)}${unit}`;

const formatCompactValue = (value: number, unit = "") =>
  `${Math.round(value)}${unit}`;

const buildLinearPath = (points: { x: number; y: number }[]) =>
  points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

const buildSmoothPath = (points: { x: number; y: number }[]) => {
  if (points.length <= 2) {
    return buildLinearPath(points);
  }

  return points
    .map((point, index) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`;
      }

      const previous = points[index - 1];
      const beforePrevious = points[index - 2] ?? previous;
      const next = points[index + 1] ?? point;
      const controlPointA = {
        x: previous.x + (point.x - beforePrevious.x) / 6,
        y: previous.y + (point.y - beforePrevious.y) / 6,
      };
      const controlPointB = {
        x: point.x - (next.x - previous.x) / 6,
        y: point.y - (next.y - previous.y) / 6,
      };

      return `C ${controlPointA.x} ${controlPointA.y}, ${controlPointB.x} ${controlPointB.y}, ${point.x} ${point.y}`;
    })
    .join(" ");
};

const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

const describeSlice = (
  centerX: number,
  centerY: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number,
) => {
  const safeEndAngle =
    endAngle - startAngle >= 359.99 ? startAngle + 359.99 : endAngle;
  const outerStart = polarToCartesian(
    centerX,
    centerY,
    outerRadius,
    startAngle,
  );
  const outerEnd = polarToCartesian(
    centerX,
    centerY,
    outerRadius,
    safeEndAngle,
  );
  const largeArcFlag = safeEndAngle - startAngle <= 180 ? "0" : "1";

  if (innerRadius <= 0) {
    return [
      `M ${centerX} ${centerY}`,
      `L ${outerStart.x} ${outerStart.y}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
      "Z",
    ].join(" ");
  }

  const innerEnd = polarToCartesian(
    centerX,
    centerY,
    innerRadius,
    safeEndAngle,
  );
  const innerStart = polarToCartesian(
    centerX,
    centerY,
    innerRadius,
    startAngle,
  );

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
};

export const ChartFrame = ({
  title,
  caption,
  children,
  style,
  contentStyle,
}: ChartFrameProps) => (
  <MediaFrame variant="raised" padding="md" style={style}>
    <Stack gap="sm" style={{ height: "100%" }}>
      {title || caption ? (
        <Stack gap="xxs">
          {title ? (
            <div
              style={{
                color: theme.colors.ink,
                fontSize: theme.typography.size.caption,
                fontWeight: theme.typography.weight.medium,
                lineHeight: theme.typography.lineHeight.title,
              }}
            >
              {title}
            </div>
          ) : null}
          {caption ? (
            <Caption size="label" maxWidth="100%">
              {caption}
            </Caption>
          ) : null}
        </Stack>
      ) : null}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "grid",
          placeItems: "center",
          ...contentStyle,
        }}
      >
        {children}
      </div>
    </Stack>
  </MediaFrame>
);

export const BarChart = ({
  data,
  width = 620,
  height = 360,
  maxValue,
  from = 0,
  duration = theme.motion.duration.sceneChange,
  stagger = 3,
  unit = "",
  showValues = true,
  showAxisLabels = false,
  style,
}: BarChartProps) => {
  const frame = useCurrentFrame();
  const max = getMaxValue(data, maxValue);
  const margin = { top: 28, right: 24, bottom: 62, left: 44 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const slotWidth = chartWidth / Math.max(data.length, 1);
  const barWidth = Math.min(64, slotWidth * 0.58);
  const gridValues = [0.25, 0.5, 0.75, 1];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: "100%", height: "100%", ...style }}
    >
      {gridValues.map((ratio) => {
        const y = margin.top + chartHeight * (1 - ratio);

        return (
          <g key={ratio}>
            <line
              x1={margin.left}
              x2={width - margin.right}
              y1={y}
              y2={y}
              stroke={theme.colors.hairlineSoft}
              strokeWidth={1}
            />
            {showAxisLabels ? (
              <text
                x={margin.left - 12}
                y={y + 7}
                fill={theme.colors.muted}
                fontSize={18}
                textAnchor="end"
                style={svgTextStyle}
              >
                {formatValue(Math.round(max * ratio), unit)}
              </text>
            ) : null}
          </g>
        );
      })}
      <line
        x1={margin.left}
        x2={width - margin.right}
        y1={margin.top + chartHeight}
        y2={margin.top + chartHeight}
        stroke={theme.colors.hairline}
        strokeWidth={1}
      />
      {data.map((item, index) => {
        const progress = getProgress(frame, from + index * stagger, duration);
        const targetHeight =
          (clampValue(item.value, 0, max) / max) * chartHeight;
        const barHeight = targetHeight * progress;
        const x = margin.left + slotWidth * index + (slotWidth - barWidth) / 2;
        const y = margin.top + chartHeight - barHeight;

        return (
          <g key={`${item.label}-${index}`}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={item.color ?? chartPalette[index % chartPalette.length]}
              rx={4}
            />
            {showValues ? (
              <text
                x={x + barWidth / 2}
                y={Math.max(margin.top + 18, y - 10)}
                fill={theme.colors.body}
                fontSize={20}
                fontWeight={theme.typography.weight.medium}
                textAnchor="middle"
                opacity={progress}
                style={svgTextStyle}
              >
                {formatValue(item.value, unit)}
              </text>
            ) : null}
            <text
              x={x + barWidth / 2}
              y={height - 24}
              fill={theme.colors.muted}
              fontSize={20}
              textAnchor="middle"
              style={svgTextStyle}
            >
              {item.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

type ComparisonLegendEntry = {
  item: ComparisonSeries;
  index: number;
  x: number;
  y: number;
};

const getComparisonLegendLayout = ({
  series,
  x,
  y,
  maxWidth,
}: {
  series: ComparisonSeries[];
  x: number;
  y: number;
  maxWidth: number;
}) => {
  const rowGap = 28;
  const entries: ComparisonLegendEntry[] = [];
  let offsetX = 0;
  let row = 0;

  series.forEach((item, index) => {
    const itemWidth = Math.max(92, item.label.length * 14 + 42);

    if (offsetX > 0 && offsetX + itemWidth > maxWidth) {
      row += 1;
      offsetX = 0;
    }

    entries.push({
      item,
      index,
      x: x + offsetX,
      y: y + row * rowGap,
    });
    offsetX += itemWidth;
  });

  return { entries, rows: row + 1, rowGap };
};

const ComparisonLegend = ({
  entries,
  gradientIds,
}: {
  entries: ComparisonLegendEntry[];
  gradientIds: string[];
}) => (
  <g>
    {entries.map(({ item, index, x, y }) => (
      <g key={item.id} transform={`translate(${x} ${y})`}>
        <rect
          x={0}
          y={-12}
          width={24}
          height={8}
          rx={4}
          fill={`url(#${gradientIds[index]})`}
        />
        <text
          x={34}
          y={0}
          fill={theme.colors.muted}
          fontSize={19}
          fontWeight={theme.typography.weight.medium}
          style={svgTextStyle}
        >
          {item.label}
        </text>
      </g>
    ))}
  </g>
);

export const ComparisonChart = ({
  series,
  data,
  orientation = "horizontal",
  width = orientation === "horizontal" ? 920 : 720,
  height = 520,
  maxValue,
  from = 0,
  duration = theme.motion.duration.sceneChange,
  stagger = 2,
  unit = "",
  showLegend = true,
  showValues = true,
  showGrid = true,
  baselineSeriesId,
  deltaSeriesId,
  formatValueLabel,
  style,
}: ComparisonChartProps) => {
  const frame = useCurrentFrame();
  const generatedId = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  if (series.length === 0 || series.length > 4) {
    throw new Error("ComparisonChart requires between 1 and 4 series.");
  }

  if (new Set(series.map((item) => item.id)).size !== series.length) {
    throw new Error("ComparisonChart series ids must be unique.");
  }

  const gradients = series.map(
    (item, index) =>
      item.gradient ?? seriesGradients[index % seriesGradients.length],
  );
  const gradientIds = series.map(
    (_, index) => `comparison-${generatedId}-${index}`,
  );
  const allValues = data.flatMap((datum) =>
    series.map((item) => Math.max(0, datum.values[item.id] ?? 0)),
  );
  const max = Math.max(maxValue ?? Math.max(...allValues, 1), 1);
  const baselineId = baselineSeriesId ?? series[0]?.id;
  const deltaId = deltaSeriesId;
  const labelForValue = (
    value: number,
    datum: ComparisonDatum,
    item: ComparisonSeries,
  ) => formatValueLabel?.(value, datum, item) ?? formatValue(value, unit);
  const deltaFor = (datum: ComparisonDatum, item: ComparisonSeries) => {
    if (!deltaId || item.id !== deltaId || item.id === baselineId) {
      return null;
    }

    const baseline = datum.values[baselineId] ?? 0;
    if (baseline === 0) {
      return null;
    }

    return ((datum.values[item.id] ?? 0) - baseline) / baseline;
  };
  if (orientation === "horizontal") {
    const horizontalLegend = getComparisonLegendLayout({
      series,
      x: 192,
      y: 30,
      maxWidth: width - 216,
    });
    const margin = {
      top: showLegend
        ? 38 + horizontalLegend.rows * horizontalLegend.rowGap
        : 18,
      right: deltaId ? 118 : 36,
      bottom: 18,
      left: 192,
    };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    const groupHeight = chartHeight / Math.max(data.length, 1);
    const seriesGap = 5;
    const availableBarHeight = Math.max(
      8,
      groupHeight - Math.min(24, groupHeight * 0.28),
    );
    const barHeight = Math.min(
      28,
      (availableBarHeight - seriesGap * (series.length - 1)) / series.length,
    );
    const groupBarsHeight =
      barHeight * series.length + seriesGap * (series.length - 1);

    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: "100%", height: "100%", ...style }}
      >
        <defs>
          {series.map((item, index) => (
            <linearGradient
              key={item.id}
              id={gradientIds[index]}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor={gradients[index][0]} />
              <stop offset="100%" stopColor={gradients[index][1]} />
            </linearGradient>
          ))}
        </defs>
        {showLegend ? (
          <ComparisonLegend
            entries={horizontalLegend.entries}
            gradientIds={gradientIds}
          />
        ) : null}
        {showGrid
          ? [0.25, 0.5, 0.75, 1].map((ratio) => {
              const x = margin.left + chartWidth * ratio;
              return (
                <line
                  key={ratio}
                  x1={x}
                  x2={x}
                  y1={margin.top - 8}
                  y2={height - margin.bottom}
                  stroke={theme.colors.hairlineSoft}
                  strokeWidth={1}
                />
              );
            })
          : null}
        {data.map((datum, datumIndex) => {
          const groupY = margin.top + datumIndex * groupHeight;
          const barsY = groupY + (groupHeight - groupBarsHeight) / 2;

          return (
            <g key={`${datum.label}-${datumIndex}`}>
              {datumIndex > 0 ? (
                <line
                  x1={margin.left}
                  x2={width - margin.right}
                  y1={groupY}
                  y2={groupY}
                  stroke={theme.colors.hairlineSoft}
                  strokeWidth={1}
                />
              ) : null}
              <text
                x={margin.left - 20}
                y={groupY + groupHeight / 2 - (datum.note ? 5 : -7)}
                fill={theme.colors.body}
                fontSize={21}
                fontWeight={theme.typography.weight.semibold}
                textAnchor="end"
                style={svgTextStyle}
              >
                {datum.label}
              </text>
              {datum.note ? (
                <text
                  x={margin.left - 20}
                  y={groupY + groupHeight / 2 + 20}
                  fill={theme.colors.muted}
                  fontSize={16}
                  textAnchor="end"
                  style={svgTextStyle}
                >
                  {datum.note}
                </text>
              ) : null}
              {series.map((item, seriesIndex) => {
                const value = Math.max(0, datum.values[item.id] ?? 0);
                const progress = getProgress(
                  frame,
                  from + (datumIndex * series.length + seriesIndex) * stagger,
                  duration,
                );
                const targetWidth =
                  (clampValue(value, 0, max) / max) * chartWidth;
                const currentWidth = targetWidth * progress;
                const y = barsY + seriesIndex * (barHeight + seriesGap);
                const valueInside = currentWidth > 48;
                const delta = deltaFor(datum, item);

                return (
                  <g key={item.id} opacity={progress}>
                    <rect
                      x={margin.left}
                      y={y}
                      width={currentWidth}
                      height={barHeight}
                      rx={4}
                      fill={`url(#${gradientIds[seriesIndex]})`}
                    />
                    {showValues ? (
                      <text
                        x={
                          valueInside
                            ? margin.left + currentWidth - 10
                            : margin.left + currentWidth + 8
                        }
                        y={y + barHeight / 2 + 6}
                        fill={
                          valueInside ? theme.colors.canvas : theme.colors.body
                        }
                        fontSize={17}
                        fontWeight={theme.typography.weight.semibold}
                        textAnchor={valueInside ? "end" : "start"}
                        style={svgTextStyle}
                      >
                        {labelForValue(value, datum, item)}
                      </text>
                    ) : null}
                    {delta !== null ? (
                      <text
                        x={
                          margin.left +
                          currentWidth +
                          (valueInside || !showValues ? 12 : 70)
                        }
                        y={y + barHeight / 2 + 6}
                        fill={gradients[seriesIndex][1]}
                        fontSize={17}
                        fontWeight={theme.typography.weight.semibold}
                        textAnchor="start"
                        style={svgTextStyle}
                      >
                        {`${delta > 0 ? "+" : ""}${Math.round(delta * 100)}%`}
                      </text>
                    ) : null}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    );
  }

  const verticalLegend = getComparisonLegendLayout({
    series,
    x: 48,
    y: 30,
    maxWidth: width - 72,
  });
  const margin = {
    top: showLegend ? 38 + verticalLegend.rows * verticalLegend.rowGap : 18,
    right: 24,
    bottom: 82,
    left: 48,
  };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const slotWidth = chartWidth / Math.max(data.length, 1);
  const groupWidth = slotWidth * 0.76;
  const seriesGap = 5;
  const barWidth = Math.min(
    42,
    (groupWidth - seriesGap * (series.length - 1)) / series.length,
  );
  const actualGroupWidth =
    barWidth * series.length + seriesGap * (series.length - 1);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: "100%", height: "100%", ...style }}
    >
      <defs>
        {series.map((item, index) => (
          <linearGradient
            key={item.id}
            id={gradientIds[index]}
            x1="0%"
            y1="100%"
            x2="0%"
            y2="0%"
          >
            <stop offset="0%" stopColor={gradients[index][0]} />
            <stop offset="100%" stopColor={gradients[index][1]} />
          </linearGradient>
        ))}
      </defs>
      {showLegend ? (
        <ComparisonLegend
          entries={verticalLegend.entries}
          gradientIds={gradientIds}
        />
      ) : null}
      {showGrid
        ? [0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = margin.top + chartHeight * (1 - ratio);
            return (
              <line
                key={ratio}
                x1={margin.left}
                x2={width - margin.right}
                y1={y}
                y2={y}
                stroke={theme.colors.hairlineSoft}
                strokeWidth={1}
              />
            );
          })
        : null}
      <line
        x1={margin.left}
        x2={width - margin.right}
        y1={margin.top + chartHeight}
        y2={margin.top + chartHeight}
        stroke={theme.colors.hairline}
        strokeWidth={1}
      />
      {data.map((datum, datumIndex) => {
        const groupX =
          margin.left +
          datumIndex * slotWidth +
          (slotWidth - actualGroupWidth) / 2;

        return (
          <g key={`${datum.label}-${datumIndex}`}>
            {series.map((item, seriesIndex) => {
              const value = Math.max(0, datum.values[item.id] ?? 0);
              const progress = getProgress(
                frame,
                from + (datumIndex * series.length + seriesIndex) * stagger,
                duration,
              );
              const targetHeight =
                (clampValue(value, 0, max) / max) * chartHeight;
              const currentHeight = targetHeight * progress;
              const x = groupX + seriesIndex * (barWidth + seriesGap);
              const y = margin.top + chartHeight - currentHeight;
              const valueInside = currentHeight > 58;
              const delta = deltaFor(datum, item);

              return (
                <g key={item.id} opacity={progress}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={currentHeight}
                    rx={4}
                    fill={`url(#${gradientIds[seriesIndex]})`}
                  />
                  {showValues ? (
                    <text
                      x={x + barWidth / 2}
                      y={valueInside ? y + 20 : y - 8}
                      fill={
                        valueInside ? theme.colors.canvas : theme.colors.body
                      }
                      fontSize={15}
                      fontWeight={theme.typography.weight.semibold}
                      textAnchor="middle"
                      style={svgTextStyle}
                    >
                      {labelForValue(value, datum, item)}
                    </text>
                  ) : null}
                  {delta !== null ? (
                    <text
                      x={x + barWidth / 2}
                      y={y - 26}
                      fill={gradients[seriesIndex][1]}
                      fontSize={15}
                      fontWeight={theme.typography.weight.semibold}
                      textAnchor="middle"
                      style={svgTextStyle}
                    >
                      {`${delta > 0 ? "+" : ""}${Math.round(delta * 100)}%`}
                    </text>
                  ) : null}
                </g>
              );
            })}
            <text
              x={margin.left + datumIndex * slotWidth + slotWidth / 2}
              y={height - 42}
              fill={theme.colors.body}
              fontSize={19}
              fontWeight={theme.typography.weight.medium}
              textAnchor="middle"
              style={svgTextStyle}
            >
              {datum.label}
            </text>
            {datum.note ? (
              <text
                x={margin.left + datumIndex * slotWidth + slotWidth / 2}
                y={height - 18}
                fill={theme.colors.muted}
                fontSize={15}
                textAnchor="middle"
                style={svgTextStyle}
              >
                {datum.note}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
};

export const LineChart = ({
  data,
  width = 640,
  height = 360,
  minValue,
  maxValue,
  from = 0,
  duration = theme.motion.duration.sceneChange,
  color = theme.colors.primary,
  showDots = true,
  showArea = true,
  showAxisLabels = true,
  showValueLabels = false,
  unit = "",
  curve = "smooth",
  milestones = [],
  clipPathId,
  style,
}: LineChartProps) => {
  const frame = useCurrentFrame();
  const generatedId = useId();
  const areaClipPathId =
    clipPathId ?? `line-area-${generatedId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const progress = getProgress(frame, from, duration);
  const values = data.map((item) => item.value);
  const min = minValue ?? Math.min(0, ...values);
  const max = Math.max(maxValue ?? Math.max(...values, 1), min + 1);
  const margin = { top: 28, right: 28, bottom: 58, left: 54 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const yForValue = (value: number) =>
    margin.top + chartHeight - ((value - min) / (max - min)) * chartHeight;
  const xForIndex = (index: number) =>
    margin.left +
    (data.length <= 1
      ? chartWidth / 2
      : (chartWidth * index) / (data.length - 1));
  const points = data.map((item, index) => ({
    ...item,
    x: xForIndex(index),
    y: yForValue(item.value),
  }));
  const milestoneByIndex = new Map(
    milestones.map((milestone) => [milestone.index, milestone]),
  );
  const topPath =
    curve === "smooth" ? buildSmoothPath(points) : buildLinearPath(points);
  const linePath = topPath;
  const areaPath =
    points.length > 0
      ? [
          `M ${points[0].x} ${margin.top + chartHeight}`,
          topPath.replace(/^M /, "L "),
          `L ${points[points.length - 1].x} ${margin.top + chartHeight}`,
          "Z",
        ].join(" ")
      : "";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: "100%", height: "100%", ...style }}
    >
      {[0, 0.5, 1].map((ratio) => {
        const y = margin.top + chartHeight * (1 - ratio);

        return (
          <g key={ratio}>
            <line
              x1={margin.left}
              x2={width - margin.right}
              y1={y}
              y2={y}
              stroke={theme.colors.hairlineSoft}
              strokeWidth={1}
            />
            {showAxisLabels ? (
              <text
                x={margin.left - 12}
                y={y + 7}
                fill={theme.colors.muted}
                fontSize={18}
                textAnchor="end"
                style={svgTextStyle}
              >
                {formatValue(min + (max - min) * ratio, unit)}
              </text>
            ) : null}
          </g>
        );
      })}
      {showArea ? (
        <clipPath id={areaClipPathId}>
          <rect
            x={margin.left}
            y={margin.top}
            width={chartWidth * progress}
            height={chartHeight}
          />
        </clipPath>
      ) : null}
      {showArea ? (
        <path
          d={areaPath}
          fill={color}
          opacity={0.14}
          clipPath={`url(#${areaClipPathId})`}
        />
      ) : null}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - progress}
      />
      {points.map((point, index) => {
        const milestone = milestoneByIndex.get(index);
        const dotProgress = getProgress(
          frame,
          from + (duration / Math.max(points.length - 1, 1)) * index - 2,
          8,
        );
        const valueLabelY =
          milestone && (milestone.side ?? "top") === "top"
            ? point.y + 30
            : point.y - 16;

        return (
          <g key={`${point.label}-${index}`}>
            {showDots ? (
              <circle
                cx={point.x}
                cy={point.y}
                r={7 * dotProgress}
                fill={theme.colors.canvas}
                stroke={color}
                strokeWidth={3}
              />
            ) : null}
            {showValueLabels ? (
              <text
                x={point.x}
                y={valueLabelY}
                fill={theme.colors.body}
                fontSize={18}
                fontWeight={theme.typography.weight.medium}
                textAnchor="middle"
                opacity={dotProgress}
                style={svgTextStyle}
              >
                {formatValue(point.value, unit)}
              </text>
            ) : null}
            <text
              x={point.x}
              y={height - 24}
              fill={theme.colors.muted}
              fontSize={18}
              textAnchor="middle"
              style={svgTextStyle}
            >
              {point.label}
            </text>
          </g>
        );
      })}
      {milestones.map((milestone) => {
        const point = points[milestone.index];

        if (!point) {
          return null;
        }

        const milestoneProgress = getProgress(
          frame,
          from + (duration / Math.max(points.length - 1, 1)) * milestone.index,
          10,
        );
        const side = milestone.side ?? "top";
        const labelY = side === "top" ? point.y - 54 : point.y + 58;
        const noteY = labelY + 24;
        const ruleEndY = side === "top" ? point.y - 13 : point.y + 13;
        const milestoneColor = milestone.color ?? color;
        const isNearRightEdge = point.x > width - margin.right - 150;
        const textX = isNearRightEdge ? point.x - 12 : point.x + 12;
        const textAnchor = isNearRightEdge ? "end" : "start";

        return (
          <g
            key={`${milestone.index}-${milestone.label}`}
            opacity={milestoneProgress}
          >
            <line
              x1={point.x}
              x2={point.x}
              y1={labelY + (side === "top" ? 26 : -8)}
              y2={ruleEndY}
              stroke={milestoneColor}
              strokeWidth={2}
            />
            <rect
              x={point.x - 6}
              y={labelY - 17}
              width={12}
              height={12}
              fill={milestoneColor}
            />
            <text
              x={textX}
              y={labelY}
              fill={theme.colors.ink}
              fontSize={20}
              fontWeight={theme.typography.weight.medium}
              textAnchor={textAnchor}
              style={svgTextStyle}
            >
              {milestone.label}
            </text>
            {milestone.note ? (
              <text
                x={textX}
                y={noteY}
                fill={theme.colors.muted}
                fontSize={17}
                textAnchor={textAnchor}
                style={svgTextStyle}
              >
                {milestone.note}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
};

export const RacingBarChart = ({
  snapshots,
  width = 860,
  height = 470,
  visibleCount = 6,
  maxValue,
  from = 0,
  duration = 120,
  unit = "",
  showYear = true,
  labelWidth = 230,
  footerHeight = 88,
  footerText,
  fillStyle = "gradient",
  style,
}: RacingBarChartProps) => {
  const frame = useCurrentFrame();
  const generatedId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const plotClipPathId = `racing-bars-${generatedId}`;
  const safeSnapshots =
    snapshots.length > 0 ? snapshots : [{ label: "", values: [] }];
  const segmentCount = Math.max(safeSnapshots.length - 1, 0);
  const localProgress = getLinearProgress(frame, from, duration);
  const timelinePosition = localProgress * segmentCount;
  const leftIndex =
    segmentCount === 0
      ? 0
      : Math.min(segmentCount - 1, Math.floor(timelinePosition));
  const rightIndex = Math.min(safeSnapshots.length - 1, leftIndex + 1);
  const rawSegmentProgress =
    segmentCount === 0 ? 1 : clampValue(timelinePosition - leftIndex, 0, 1);
  const segmentProgress = standardEasing(rawSegmentProgress);
  const leftSnapshot = safeSnapshots[leftIndex];
  const rightSnapshot = safeSnapshots[rightIndex];
  const allIds = Array.from(
    new Set(
      safeSnapshots.flatMap((snapshot) =>
        snapshot.values.map((item) => item.id),
      ),
    ),
  );
  const max = Math.max(
    maxValue ??
      Math.max(
        ...safeSnapshots.flatMap((snapshot) =>
          snapshot.values.map((item) => item.value),
        ),
        1,
      ),
    1,
  );
  const margin = {
    top: 34,
    right: 104,
    bottom: showYear ? footerHeight : 36,
    left: labelWidth,
  };
  const chartWidth = width - margin.left - margin.right;
  const chartBottom = height - margin.bottom;
  const rowGap = 12;
  const rowHeight =
    (height - margin.top - margin.bottom - rowGap * (visibleCount - 1)) /
    visibleCount;
  const barHeight = Math.min(38, rowHeight * 0.62);
  const leftValues = new Map(
    leftSnapshot.values.map((item) => [item.id, item]),
  );
  const rightValues = new Map(
    rightSnapshot.values.map((item) => [item.id, item]),
  );
  const getRankMap = (snapshot: RacingBarSnapshot) =>
    new Map(
      [...snapshot.values]
        .sort((a, b) => b.value - a.value)
        .map((item, index) => [item.id, index]),
    );
  const leftRanks = getRankMap(leftSnapshot);
  const rightRanks = getRankMap(rightSnapshot);
  const currentItems = allIds
    .map((id, paletteIndex) => {
      const left = leftValues.get(id);
      const right = rightValues.get(id);
      const value =
        (left?.value ?? 0) +
        ((right?.value ?? left?.value ?? 0) - (left?.value ?? 0)) *
          segmentProgress;
      const leftRank = leftRanks.get(id) ?? visibleCount + paletteIndex;
      const rightRank = rightRanks.get(id) ?? visibleCount + paletteIndex;
      const rank = leftRank + (rightRank - leftRank) * segmentProgress;
      const source = right ?? left;

      return {
        id,
        label: source?.label ?? id,
        value,
        color:
          source?.color ?? chartPalette[paletteIndex % chartPalette.length],
        gradient:
          source?.gradient ??
          seriesGradients[paletteIndex % seriesGradients.length],
        gradientId: `racing-gradient-${generatedId}-${paletteIndex}`,
        rank,
      };
    })
    .filter((item) => item.rank < visibleCount + 0.75 || item.value > 0)
    .sort((a, b) => a.rank - b.rank || a.label.localeCompare(b.label))
    .slice(0, visibleCount + 2);
  const numericLeftLabel = Number(leftSnapshot.label);
  const numericRightLabel = Number(rightSnapshot.label);
  const timelineLabel =
    Number.isFinite(numericLeftLabel) && Number.isFinite(numericRightLabel)
      ? Math.round(
          numericLeftLabel +
            (numericRightLabel - numericLeftLabel) * segmentProgress,
        ).toString()
      : segmentProgress < 0.5
        ? leftSnapshot.label
        : rightSnapshot.label;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: "100%", height: "100%", ...style }}
    >
      <defs>
        <clipPath id={plotClipPathId}>
          <rect x={0} y={0} width={width} height={chartBottom} />
        </clipPath>
        {currentItems.map((item) => (
          <linearGradient
            key={item.gradientId}
            id={item.gradientId}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor={item.gradient[0]} />
            <stop offset="100%" stopColor={item.gradient[1]} />
          </linearGradient>
        ))}
      </defs>
      <g clipPath={`url(#${plotClipPathId})`}>
        {[0.25, 0.5, 0.75, 1].map((ratio) => {
          const x = margin.left + chartWidth * ratio;

          return (
            <line
              key={ratio}
              x1={x}
              x2={x}
              y1={margin.top - 8}
              y2={chartBottom}
              stroke={theme.colors.hairlineSoft}
              strokeWidth={1}
            />
          );
        })}
        {currentItems.map((item, index) => {
          const previousItem = currentItems[index - 1];
          const previousDistance = previousItem
            ? Math.abs(item.rank - previousItem.rank)
            : 1;
          const labelOpacity =
            index === 0
              ? 1
              : interpolate(previousDistance, [0.25, 0.65], [0.28, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                });
          const barWidth = (clampValue(item.value, 0, max) / max) * chartWidth;
          const y =
            margin.top +
            item.rank * (rowHeight + rowGap) +
            (rowHeight - barHeight) / 2;
          const opacity = interpolate(
            item.rank,
            [visibleCount - 0.15, visibleCount + 0.65],
            [1, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          );

          return (
            <g key={item.id} opacity={opacity}>
              <rect
                x={margin.left}
                y={y}
                width={chartWidth}
                height={barHeight}
                fill={theme.colors.surfaceSoft}
                rx={4}
              />
              <rect
                x={margin.left}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={
                  fillStyle === "gradient"
                    ? `url(#${item.gradientId})`
                    : item.color
                }
                rx={4}
              />
              <g opacity={labelOpacity}>
                <text
                  x={margin.left - 20}
                  y={y + barHeight / 2 + 8}
                  fill={theme.colors.muted}
                  fontSize={22}
                  textAnchor="end"
                  style={svgTextStyle}
                >
                  {index + 1}
                </text>
                <text
                  x={margin.left - 52}
                  y={y + barHeight / 2 + 8}
                  fill={theme.colors.body}
                  fontSize={22}
                  fontWeight={
                    index === 0
                      ? theme.typography.weight.semibold
                      : theme.typography.weight.medium
                  }
                  textAnchor="end"
                  style={svgTextStyle}
                >
                  {item.label}
                </text>
                <text
                  x={margin.left + Math.max(18, barWidth - 14)}
                  y={y + barHeight / 2 + 7}
                  fill={barWidth > 88 ? theme.colors.canvas : theme.colors.body}
                  fontSize={20}
                  fontWeight={theme.typography.weight.medium}
                  textAnchor={barWidth > 88 ? "end" : "start"}
                  style={svgTextStyle}
                >
                  {formatCompactValue(item.value, unit)}
                </text>
              </g>
            </g>
          );
        })}
      </g>
      {showYear ? (
        <g>
          <line
            x1={margin.left}
            x2={width - margin.right}
            y1={chartBottom + 16}
            y2={chartBottom + 16}
            stroke={theme.colors.hairlineSoft}
            strokeWidth={1}
          />
          {footerText ? (
            <text
              x={margin.left}
              y={height - 28}
              fill={theme.colors.muted}
              fontSize={22}
              fontWeight={theme.typography.weight.medium}
              textAnchor="start"
              style={svgTextStyle}
            >
              {footerText}
            </text>
          ) : null}
          <text
            x={width - margin.right}
            y={height - 20}
            fill={theme.colors.hairline}
            fontSize={72}
            fontWeight={theme.typography.weight.semibold}
            textAnchor="end"
            style={svgTextStyle}
          >
            {timelineLabel}
          </text>
        </g>
      ) : null}
    </svg>
  );
};

export const PieChart = ({
  data,
  size = 360,
  innerRadius = 0,
  from = 0,
  duration = theme.motion.duration.sceneChange,
  stagger = 4,
  showLegend = true,
  centerLabel,
  style,
}: PieChartProps) => {
  const frame = useCurrentFrame();
  const total = Math.max(
    data.reduce((sum, item) => sum + Math.max(0, item.value), 0),
    1,
  );
  const radius = size * 0.36;
  const center = size / 2;
  let currentAngle = 0;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: showLegend ? `${size}px 1fr` : `${size}px`,
        alignItems: "center",
        gap: theme.space.md,
        width: "100%",
        ...style,
      }}
    >
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: "100%" }}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill={innerRadius > 0 ? "none" : theme.colors.surfaceSoft}
          stroke={innerRadius > 0 ? theme.colors.hairlineSoft : "none"}
          strokeWidth={innerRadius > 0 ? radius - innerRadius : 0}
        />
        {data.map((item, index) => {
          const startAngle = currentAngle;
          const sweep = (Math.max(0, item.value) / total) * 360;
          const progress = getProgress(frame, from + index * stagger, duration);
          const endAngle = startAngle + sweep * progress;
          currentAngle += sweep;

          return (
            <path
              key={`${item.label}-${index}`}
              d={describeSlice(
                center,
                center,
                radius,
                innerRadius,
                startAngle,
                endAngle,
              )}
              fill={item.color ?? chartPalette[index % chartPalette.length]}
            />
          );
        })}
        {innerRadius > 0 && centerLabel ? (
          <text
            x={center}
            y={center + 8}
            textAnchor="middle"
            fill={theme.colors.ink}
            fontSize={26}
            fontWeight={theme.typography.weight.medium}
            style={svgTextStyle}
          >
            {centerLabel}
          </text>
        ) : null}
      </svg>
      {showLegend ? (
        <Stack gap="xs">
          {data.map((item, index) => (
            <div
              key={`${item.label}-${index}`}
              style={{
                display: "grid",
                gridTemplateColumns: "18px 1fr auto",
                alignItems: "center",
                gap: theme.space.xs,
                color: theme.colors.body,
                fontSize: theme.typography.size.label,
                lineHeight: theme.typography.lineHeight.caption,
              }}
            >
              <span
                style={{
                  width: 14,
                  height: 14,
                  background:
                    item.color ?? chartPalette[index % chartPalette.length],
                }}
              />
              <span>{item.label}</span>
              <span style={{ color: theme.colors.muted }}>
                {Math.round((Math.max(0, item.value) / total) * 100)}%
              </span>
            </div>
          ))}
        </Stack>
      ) : null}
    </div>
  );
};
