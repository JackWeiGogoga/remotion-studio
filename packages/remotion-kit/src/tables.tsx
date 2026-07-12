import type { CSSProperties, ReactNode } from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { theme } from "@remotion-studio/video-themes";

export type DataTableCellTone =
  | "default"
  | "muted"
  | "primary"
  | "success"
  | "warning"
  | "error";

export type DataTableCell =
  | ReactNode
  | {
      value: ReactNode;
      note?: ReactNode;
      tone?: DataTableCellTone;
      strong?: boolean;
      marker?: boolean;
    };

export type DataTableRow = object;

export type DataTableColumn<Row extends DataTableRow = DataTableRow> = {
  key: keyof Row & string;
  header: ReactNode;
  width?: number | string;
  align?: CSSProperties["textAlign"];
  emphasis?: boolean;
  monospace?: boolean;
  value?: (row: Row, index: number) => DataTableCell;
};

export type DataTableProps<Row extends DataTableRow = DataTableRow> = {
  columns: DataTableColumn<Row>[];
  rows: Row[];
  rowKey?: (row: Row, index: number) => string;
  caption?: ReactNode;
  footer?: ReactNode;
  density?: "compact" | "comfortable";
  from?: number;
  revealDuration?: number;
  revealStagger?: number;
  highlightRows?: number[];
  style?: CSSProperties;
};

const toneColor = (tone: DataTableCellTone) => {
  if (tone === "muted") {
    return theme.colors.muted;
  }

  if (tone === "primary") {
    return theme.colors.primary;
  }

  if (tone === "success") {
    return theme.colors.success;
  }

  if (tone === "warning") {
    return theme.colors.warning;
  }

  if (tone === "error") {
    return theme.colors.error;
  }

  return theme.colors.body;
};

const normalizeCell = (cell: DataTableCell) => {
  if (
    cell &&
    typeof cell === "object" &&
    !("type" in cell) &&
    ("value" in cell || "note" in cell || "tone" in cell)
  ) {
    return cell as Exclude<DataTableCell, ReactNode>;
  }

  return {
    value: cell,
  };
};

const gridTemplateFor = <Row extends DataTableRow>(
  columns: DataTableColumn<Row>[],
) =>
  columns
    .map((column) => {
      if (typeof column.width === "number") {
        return `${column.width}px`;
      }

      return column.width ?? "minmax(0, 1fr)";
    })
    .join(" ");

export const DataTable = <Row extends DataTableRow>({
  columns,
  rows,
  rowKey,
  caption,
  footer,
  density = "comfortable",
  from = 0,
  revealDuration = theme.motion.duration.enter,
  revealStagger = 3,
  highlightRows = [],
  style,
}: DataTableProps<Row>) => {
  const frame = useCurrentFrame();
  const gridTemplateColumns = gridTemplateFor(columns);
  const rowMinHeight = density === "compact" ? 58 : 72;
  const cellPadding = density === "compact" ? "12px 16px" : "16px 18px";

  return (
    <div
      style={{
        width: "100%",
        border: `${theme.stroke.hairline}px solid ${theme.colors.hairline}`,
        background: theme.colors.surface,
        color: theme.colors.body,
        fontFamily: theme.typography.family,
        letterSpacing: 0,
        overflow: "hidden",
        ...style,
      }}
    >
      {caption ? (
        <div
          style={{
            minHeight: 50,
            display: "flex",
            alignItems: "center",
            borderBottom: `${theme.stroke.hairline}px solid ${theme.colors.hairline}`,
            background: theme.colors.surface,
            color: theme.colors.muted,
            padding: "0 18px",
            fontSize: theme.typography.size.label,
            fontWeight: theme.typography.weight.regular,
            lineHeight: 1,
          }}
        >
          {caption}
        </div>
      ) : null}
      <div
        style={{
          display: "grid",
          gridTemplateColumns,
          minHeight: 54,
          alignItems: "stretch",
          borderBottom: `${theme.stroke.strong}px solid ${theme.colors.ink}`,
          background: theme.colors.surfaceStrong,
        }}
      >
        {columns.map((column, index) => (
          <div
            key={column.key}
            style={{
              padding: "14px 18px",
              borderLeft:
                index === 0
                  ? "none"
                  : `${theme.stroke.hairline}px solid ${theme.colors.hairline}`,
              color: column.emphasis ? theme.colors.ink : theme.colors.muted,
              fontSize: theme.typography.size.label,
              fontWeight: theme.typography.weight.semibold,
              lineHeight: 1.18,
              textAlign: column.align,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {column.header}
          </div>
        ))}
      </div>
      {rows.map((row, rowIndex) => {
        const rowProgress = interpolate(
          frame,
          [
            from + rowIndex * revealStagger,
            from + rowIndex * revealStagger + revealDuration,
          ],
          [0, 1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(...theme.motion.easing.standard),
          },
        );
        const isHighlighted = highlightRows.includes(rowIndex);

        return (
          <div
            key={rowKey ? rowKey(row, rowIndex) : rowIndex}
            style={{
              display: "grid",
              gridTemplateColumns,
              minHeight: rowMinHeight,
              alignItems: "stretch",
              borderBottom:
                rowIndex === rows.length - 1
                  ? "none"
                  : `${theme.stroke.hairline}px solid ${theme.colors.hairlineSoft}`,
              background: isHighlighted
                ? `${theme.colors.primary}12`
                : rowIndex % 2 === 0
                  ? theme.colors.surface
                  : theme.colors.surfaceSoft,
              opacity: rowProgress,
              translate: `0 ${Math.round((1 - rowProgress) * 10)}px`,
            }}
          >
            {columns.map((column, columnIndex) => {
              const normalized = normalizeCell(
                column.value
                  ? column.value(row, rowIndex)
                  : (row[column.key] as DataTableCell),
              );
              const tone = normalized.tone ?? "default";

              return (
                <div
                  key={column.key}
                  style={{
                    minWidth: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: theme.space.xs,
                    padding: cellPadding,
                    borderLeft:
                      columnIndex === 0
                        ? "none"
                        : `${theme.stroke.hairline}px solid ${theme.colors.hairlineSoft}`,
                    color: toneColor(tone),
                    fontFamily: column.monospace
                      ? theme.typography.monoFamily
                      : theme.typography.family,
                    fontSize: theme.typography.size.label,
                    fontWeight:
                      normalized.strong || column.emphasis
                        ? theme.typography.weight.semibold
                        : theme.typography.weight.medium,
                    lineHeight: theme.typography.lineHeight.caption,
                    textAlign: column.align,
                    justifyContent:
                      column.align === "right"
                        ? "flex-end"
                        : column.align === "center"
                          ? "center"
                          : "flex-start",
                  }}
                >
                  {normalized.marker ? (
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        flex: "0 0 auto",
                        background: toneColor(tone),
                      }}
                    />
                  ) : null}
                  <span
                    style={{
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {normalized.value}
                  </span>
                  {normalized.note ? (
                    <span
                      style={{
                        color: theme.colors.muted,
                        fontSize: 20,
                        fontWeight: theme.typography.weight.regular,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {normalized.note}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        );
      })}
      {footer ? (
        <div
          style={{
            minHeight: 54,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `${theme.stroke.hairline}px solid ${theme.colors.hairline}`,
            padding: "0 18px",
            color: theme.colors.muted,
            fontSize: theme.typography.size.label,
            lineHeight: 1,
          }}
        >
          {footer}
        </div>
      ) : null}
    </div>
  );
};
