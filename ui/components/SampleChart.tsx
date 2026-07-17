import type { MouseEvent } from "react";
import {
  CATEGORIES,
  type CanvasTheme,
  type SampleChartType,
  type SampleSeries,
  type SeriesMark,
  type ValueLabels
} from "../sample";

export interface VisibleSeries {
  data: SampleSeries;
  color: string;
}

export type CartesianType = Exclude<SampleChartType, "pie" | "doughnut">;

interface Props {
  type: CartesianType;
  series: VisibleSeries[];
  theme: CanvasTheme;
  width: number;
  height: number;
  showXAxis: boolean;
  showYAxis: boolean;
  showGrid: boolean;
  smooth: boolean;
  stacked: boolean;
  valueLabels: ValueLabels;
  hoverIndex: number | null;
  onHover: (index: number | null) => void;
}

const MONO = 'ui-monospace, "SF Mono", SFMono-Regular, Menlo, monospace';

interface Pt {
  x: number;
  y: number;
}

function valueAxis(maxValue: number): { max: number; step: number } {
  const steps = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000];
  for (const s of steps) {
    if (maxValue <= s * 4) return { max: s * Math.max(1, Math.ceil(maxValue / s)), step: s };
  }
  const s = Math.pow(10, Math.ceil(Math.log10(maxValue / 4)));
  return { max: s * Math.ceil(maxValue / s), step: s };
}

function pathFrom(pts: Pt[], smooth: boolean): string {
  if (pts.length === 0) return "";
  if (!smooth || pts.length < 3) {
    return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  }
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`;
  }
  return d;
}

/** Column with only the data end (top) rounded, anchored to the baseline. */
function columnPath(x: number, top: number, width: number, bottom: number, rounded: boolean): string {
  const r = rounded ? Math.min(4, width / 2, bottom - top) : 0;
  return [
    `M ${x} ${bottom}`,
    `L ${x} ${top + r}`,
    `Q ${x} ${top} ${x + r} ${top}`,
    `L ${x + width - r} ${top}`,
    `Q ${x + width} ${top} ${x + width} ${top + r}`,
    `L ${x + width} ${bottom}`,
    "Z"
  ].join(" ");
}

/** Horizontal bar with only the data end (right) rounded. */
function barPath(x0: number, top: number, length: number, barH: number): string {
  const r = Math.min(4, barH / 2, length);
  return [
    `M ${x0} ${top}`,
    `L ${x0 + length - r} ${top}`,
    `Q ${x0 + length} ${top} ${x0 + length} ${top + r}`,
    `L ${x0 + length} ${top + barH - r}`,
    `Q ${x0 + length} ${top + barH} ${x0 + length - r} ${top + barH}`,
    `L ${x0} ${top + barH}`,
    "Z"
  ].join(" ");
}

function markOf(type: CartesianType, s: SampleSeries): SeriesMark | "area" {
  switch (type) {
    case "line":
      return "line";
    case "column":
    case "bar":
      return "column";
    case "area":
      return "area";
    case "scatter":
      return "scatter";
    case "mixed":
      return s.mark;
  }
}

export function SampleChart(props: Props) {
  const { type, series, theme, width: W, height: H, hoverIndex, onHover } = props;
  const horizontal = type === "bar";
  const stacking = props.stacked && (type === "column" || type === "area");
  const lastIndex = CATEGORIES.length - 1;

  const totals = CATEGORIES.map((_, i) => series.reduce((sum, s) => sum + s.data.values[i], 0));
  const maxValue = stacking
    ? Math.max(1, ...totals)
    : Math.max(1, ...series.flatMap((s) => s.data.values));
  const { max: vMax, step } = valueAxis(maxValue);

  const L = horizontal ? (props.showYAxis ? 76 : 24) : props.showYAxis ? 52 : 24;
  const R = horizontal ? 34 : 24;
  const T = 16;
  const B = props.showXAxis ? (horizontal ? 30 : 40) : 18;
  const plotW = W - L - R;
  const plotH = H - T - B;
  const slot = horizontal ? plotH / CATEGORIES.length : plotW / CATEGORIES.length;

  // Value → pixel along the value axis; slotCenter → pixel along the category axis.
  const vPix = (v: number) => (horizontal ? L + (v / vMax) * plotW : T + plotH - (v / vMax) * plotH);
  const slotCenter = (i: number) => (horizontal ? T + slot * (i + 0.5) : L + slot * (i + 0.5));
  const baseline = vPix(0);

  const ticks: number[] = [];
  for (let v = 0; v <= vMax; v += step) ticks.push(v);

  const columnSeries = series.filter((s) => markOf(type, s.data) === "column");
  const groupSpan = slot * 0.6;
  const memberW =
    columnSeries.length > 0 ? (groupSpan - 2 * (columnSeries.length - 1)) / columnSeries.length : 0;
  const memberOffset = (catIndex: number, member: number) =>
    slotCenter(catIndex) - groupSpan / 2 + member * (memberW + 2);
  const stackW = slot * 0.5;

  // Where a series' mark sits for category i — used by labels and hover markers.
  const markAnchor = (s: VisibleSeries, i: number): Pt => {
    const v = s.data.values[i];
    if (stacking) {
      const upto = series.slice(0, series.indexOf(s) + 1).reduce((sum, x) => sum + x.data.values[i], 0);
      return { x: slotCenter(i), y: vPix(upto) };
    }
    if (horizontal) {
      const member = series.indexOf(s);
      const barH = (groupSpan - 2 * (series.length - 1)) / series.length;
      const top = slotCenter(i) - groupSpan / 2 + member * (barH + 2);
      return { x: vPix(v), y: top + barH / 2 };
    }
    const mark = markOf(type, s.data);
    if (mark === "column") {
      const member = columnSeries.indexOf(s);
      return { x: memberOffset(i, member) + memberW / 2, y: vPix(v) };
    }
    return { x: slotCenter(i), y: vPix(v) };
  };

  const handleMove = (event: MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const vx = ((event.clientX - rect.left) / rect.width) * W;
    const vy = ((event.clientY - rect.top) / rect.height) * H;
    const along = horizontal ? vy : vx;
    const lo = horizontal ? T : L;
    const hi = horizontal ? T + plotH : L + plotW;
    if (along < lo || along > hi) {
      onHover(null);
      return;
    }
    onHover(Math.min(lastIndex, Math.max(0, Math.floor((along - lo) / slot))));
  };

  // --- labels ---------------------------------------------------------------

  const labelAt = (s: VisibleSeries, i: number, bold: boolean) => {
    const anchor = markAnchor(s, i);
    if (horizontal) {
      return (
        <text
          key={`lb-${s.data.id}-${i}`}
          x={anchor.x + 6}
          y={anchor.y + 3.5}
          textAnchor="start"
          fontFamily={MONO}
          fontSize={10}
          fontWeight={bold ? 600 : 400}
          fill={bold ? theme.ink : theme.ink2}
        >
          {s.data.values[i]}
        </text>
      );
    }
    return (
      <text
        key={`lb-${s.data.id}-${i}`}
        x={anchor.x}
        y={anchor.y - 8}
        textAnchor="middle"
        fontFamily={MONO}
        fontSize={10}
        fontWeight={bold ? 600 : 400}
        fill={bold ? theme.ink : theme.ink2}
      >
        {s.data.values[i]}
      </text>
    );
  };

  const totalLabelAt = (i: number, bold: boolean) => (
    <text
      key={`tl-${i}`}
      x={slotCenter(i)}
      y={vPix(totals[i]) - 8}
      textAnchor="middle"
      fontFamily={MONO}
      fontSize={10}
      fontWeight={bold ? 600 : 400}
      fill={bold ? theme.ink : theme.ink2}
    >
      {totals[i]}
    </text>
  );

  const labels: JSX.Element[] = [];
  const labelIndices =
    props.valueLabels === "all"
      ? CATEGORIES.map((_, i) => i)
      : props.valueLabels === "ends"
        ? [lastIndex]
        : [];
  for (const i of labelIndices) {
    if (i === hoverIndex) continue; // the bold hover label takes over
    if (stacking) labels.push(totalLabelAt(i, false));
    else series.forEach((s) => labels.push(labelAt(s, i, false)));
  }
  if (hoverIndex !== null) {
    if (stacking) labels.push(totalLabelAt(hoverIndex, true));
    else series.forEach((s) => labels.push(labelAt(s, hoverIndex, true)));
  }

  // --- stacked geometry -----------------------------------------------------

  const stackedColumns =
    stacking && type === "column"
      ? CATEGORIES.map((_, i) => {
          let cum = 0;
          return series.map((s, si) => {
            const from = cum;
            cum += s.data.values[i];
            const isTop = si === series.length - 1;
            const yTop = vPix(cum);
            const yBottom = si === 0 ? baseline : vPix(from) - 2; // 2px surface gap
            return { s, yTop, yBottom: Math.max(yBottom, yTop), isTop, catIndex: i };
          });
        }).flat()
      : [];

  const stackedBands =
    stacking && type === "area"
      ? series.map((s, si) => {
          const topPts = CATEGORIES.map((_, i) => {
            const upto = series.slice(0, si + 1).reduce((sum, x) => sum + x.data.values[i], 0);
            return { x: slotCenter(i), y: vPix(upto) };
          });
          const bottomPts = CATEGORIES.map((_, i) => {
            const below = series.slice(0, si).reduce((sum, x) => sum + x.data.values[i], 0);
            return { x: slotCenter(i), y: vPix(below) };
          }).reverse();
          const d = `${pathFrom(topPts, props.smooth)} L ${bottomPts
            .map((p) => `${p.x} ${p.y}`)
            .join(" L ")} Z`;
          return { s, d, topPath: pathFrom(topPts, props.smooth) };
        })
      : [];

  const seriesPts = (s: VisibleSeries): Pt[] => CATEGORIES.map((_, i) => markAnchor(s, i));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Sample ${type} chart of ${series.map((s) => s.data.name).join(", ")} across ${CATEGORIES.join(", ")}`}
      onMouseMove={handleMove}
      onMouseLeave={() => onHover(null)}
      style={{ display: "block", width: "100%", height: "auto" }}
    >
      {/* value-axis grid + ticks */}
      {ticks.map((v) => (
        <g key={v}>
          {props.showGrid && v > 0 && (
            <line
              x1={horizontal ? vPix(v) : L}
              x2={horizontal ? vPix(v) : W - R}
              y1={horizontal ? T : vPix(v)}
              y2={horizontal ? T + plotH : vPix(v)}
              stroke={theme.grid}
              strokeWidth={1}
            />
          )}
          {(horizontal ? props.showXAxis : props.showYAxis) && (
            <text
              x={horizontal ? vPix(v) : L - 8}
              y={horizontal ? T + plotH + 18 : vPix(v) + 3.5}
              textAnchor={horizontal ? "middle" : "end"}
              fontFamily={MONO}
              fontSize={10}
              fill={theme.muted}
            >
              {v}
            </text>
          )}
        </g>
      ))}

      {/* category labels */}
      {(horizontal ? props.showYAxis : props.showXAxis) &&
        CATEGORIES.map((c, i) => (
          <text
            key={c}
            x={horizontal ? L - 8 : slotCenter(i)}
            y={horizontal ? slotCenter(i) + 3.5 : T + plotH + 20}
            textAnchor={horizontal ? "end" : "middle"}
            fontFamily={MONO}
            fontSize={10}
            fill={theme.muted}
          >
            {c}
          </text>
        ))}

      {/* baseline */}
      <line
        x1={horizontal ? baseline : L}
        x2={horizontal ? baseline : W - R}
        y1={horizontal ? T : baseline}
        y2={horizontal ? T + plotH : baseline}
        stroke={theme.baseline}
        strokeWidth={1}
      />

      {/* hover locator, behind the marks */}
      {hoverIndex !== null &&
        (columnSeries.length > 0 || horizontal ? (
          <rect
            x={horizontal ? L : slotCenter(hoverIndex) - slot / 2}
            y={horizontal ? slotCenter(hoverIndex) - slot / 2 : T}
            width={horizontal ? plotW : slot}
            height={horizontal ? slot : plotH}
            fill={theme.grid}
            opacity={0.35}
          />
        ) : (
          <line
            x1={slotCenter(hoverIndex)}
            x2={slotCenter(hoverIndex)}
            y1={T}
            y2={T + plotH}
            stroke={theme.baseline}
            strokeWidth={1}
            strokeDasharray="3 3"
          />
        ))}

      {/* horizontal bars */}
      {horizontal &&
        series.map((s, si) => (
          <g key={s.data.id} fill={s.color}>
            {s.data.values.map((v, i) => {
              const barH = (groupSpan - 2 * (series.length - 1)) / series.length;
              const top = slotCenter(i) - groupSpan / 2 + si * (barH + 2);
              return <path key={i} d={barPath(L, top, vPix(v) - L, barH)} />;
            })}
          </g>
        ))}

      {/* stacked columns */}
      {stackedColumns.map((seg, i) => (
        <path
          key={i}
          d={
            seg.isTop
              ? columnPath(slotCenter(seg.catIndex) - stackW / 2, seg.yTop, stackW, seg.yBottom, true)
              : `M ${slotCenter(seg.catIndex) - stackW / 2} ${seg.yBottom} L ${slotCenter(seg.catIndex) - stackW / 2} ${seg.yTop} L ${slotCenter(seg.catIndex) + stackW / 2} ${seg.yTop} L ${slotCenter(seg.catIndex) + stackW / 2} ${seg.yBottom} Z`
          }
          fill={seg.s.color}
        />
      ))}

      {/* grouped columns */}
      {!horizontal &&
        !stacking &&
        columnSeries.map((s, member) => (
          <g key={s.data.id} fill={s.color}>
            {s.data.values.map((v, i) => (
              <path key={i} d={columnPath(memberOffset(i, member), vPix(v), memberW, baseline, true)} />
            ))}
          </g>
        ))}

      {/* stacked area bands (2px surface stroke separates neighbors) */}
      {stackedBands.map((band) => (
        <g key={band.s.data.id}>
          <path d={band.d} fill={band.s.color} opacity={0.85} />
          <path d={band.topPath} fill="none" stroke={theme.surface} strokeWidth={2} />
        </g>
      ))}

      {/* area fills */}
      {!stacking &&
        series
          .filter((s) => markOf(type, s.data) === "area")
          .map((s) => (
            <path
              key={`fill-${s.data.id}`}
              d={`${pathFrom(seriesPts(s), props.smooth)} L ${slotCenter(lastIndex)} ${baseline} L ${slotCenter(0)} ${baseline} Z`}
              fill={s.color}
              opacity={0.18}
            />
          ))}

      {/* lines (line marks and area outlines) */}
      {!stacking &&
        series
          .filter((s) => {
            const m = markOf(type, s.data);
            return m === "line" || m === "area";
          })
          .map((s) => (
            <path
              key={`line-${s.data.id}`}
              d={pathFrom(seriesPts(s), props.smooth)}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

      {/* scatter marks */}
      {!stacking &&
        series
          .filter((s) => markOf(type, s.data) === "scatter")
          .map((s) => (
            <g key={`dots-${s.data.id}`} fill={s.color} stroke={theme.surface} strokeWidth={2}>
              {s.data.values.map((_, i) => (
                <circle key={i} cx={markAnchor(s, i).x} cy={markAnchor(s, i).y} r={4.5} />
              ))}
            </g>
          ))}

      {/* hovered markers on path charts */}
      {hoverIndex !== null &&
        !stacking &&
        !horizontal &&
        series
          .filter((s) => {
            const m = markOf(type, s.data);
            return m === "line" || m === "area";
          })
          .map((s) => (
            <circle
              key={`marker-${s.data.id}`}
              cx={markAnchor(s, hoverIndex).x}
              cy={markAnchor(s, hoverIndex).y}
              r={4}
              fill={s.color}
              stroke={theme.surface}
              strokeWidth={2}
            />
          ))}

      {labels}
    </svg>
  );
}
