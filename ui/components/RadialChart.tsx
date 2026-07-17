import type { MouseEvent } from "react";
import { CATEGORIES, type CanvasTheme, type SampleSeries, type ValueLabels } from "../sample";

interface Props {
  /** Pie and doughnut read one series; slices are the categories. */
  series: SampleSeries;
  doughnut: boolean;
  theme: CanvasTheme;
  width: number;
  height: number;
  valueLabels: ValueLabels;
  hoverIndex: number | null;
  onHover: (index: number | null) => void;
}

const MONO = 'ui-monospace, "SF Mono", SFMono-Regular, Menlo, monospace';
const TAU = Math.PI * 2;

function polar(cx: number, cy: number, r: number, angle: number): { x: number; y: number } {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function slicePath(
  cx: number,
  cy: number,
  r0: number,
  r1: number,
  a0: number,
  a1: number
): string {
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const p0 = polar(cx, cy, r1, a0);
  const p1 = polar(cx, cy, r1, a1);
  if (r0 <= 0) {
    return `M ${cx} ${cy} L ${p0.x} ${p0.y} A ${r1} ${r1} 0 ${large} 1 ${p1.x} ${p1.y} Z`;
  }
  const q1 = polar(cx, cy, r0, a1);
  const q0 = polar(cx, cy, r0, a0);
  return [
    `M ${p0.x} ${p0.y}`,
    `A ${r1} ${r1} 0 ${large} 1 ${p1.x} ${p1.y}`,
    `L ${q1.x} ${q1.y}`,
    `A ${r0} ${r0} 0 ${large} 0 ${q0.x} ${q0.y}`,
    "Z"
  ].join(" ");
}

export function RadialChart({
  series,
  doughnut,
  theme,
  width: W,
  height: H,
  valueLabels,
  hoverIndex,
  onHover
}: Props) {
  const cx = W / 2;
  const cy = H / 2;
  const R = Math.min(W, H) / 2 - 44; // leave room for outside labels
  const r0 = doughnut ? R * 0.55 : 0;

  const total = Math.max(1, series.values.reduce((a, b) => a + b, 0));
  let acc = -Math.PI / 2;
  const slices = series.values.map((v, i) => {
    const a0 = acc;
    const a1 = (acc += (v / total) * TAU);
    return { i, v, a0, a1, mid: (a0 + a1) / 2, share: v / total };
  });

  const handleMove = (event: MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const vx = ((event.clientX - rect.left) / rect.width) * W - cx;
    const vy = ((event.clientY - rect.top) / rect.height) * H - cy;
    const dist = Math.hypot(vx, vy);
    if (dist < r0 || dist > R) {
      onHover(null);
      return;
    }
    let angle = Math.atan2(vy, vx);
    if (angle < -Math.PI / 2) angle += TAU; // slices start at 12 o'clock
    const hit = slices.find((s) => angle >= s.a0 && angle < s.a1);
    onHover(hit ? hit.i : null);
  };

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Sample ${doughnut ? "doughnut" : "pie"} chart of ${series.name} by ${CATEGORIES.join(", ")}`}
      onMouseMove={handleMove}
      onMouseLeave={() => onHover(null)}
      style={{ display: "block", width: "100%", height: "auto" }}
    >
      {slices.map((s) => {
        const hovered = s.i === hoverIndex;
        const shift = hovered ? polar(0, 0, 5, s.mid) : { x: 0, y: 0 };
        return (
          <path
            key={s.i}
            d={slicePath(cx + shift.x, cy + shift.y, r0, R, s.a0, s.a1)}
            fill={theme.series[s.i % theme.series.length]}
            stroke={theme.surface}
            strokeWidth={2}
          />
        );
      })}

      {/* outside labels for slices big enough to own one */}
      {valueLabels !== "none" &&
        slices
          .filter((s) => s.share >= 0.08)
          .map((s) => {
            const p = polar(cx, cy, R + 14, s.mid);
            const onRight = Math.cos(s.mid) >= 0;
            return (
              <text
                key={`label-${s.i}`}
                x={p.x}
                y={p.y + 3}
                textAnchor={onRight ? "start" : "end"}
                fontFamily={MONO}
                fontSize={10}
                fontWeight={s.i === hoverIndex ? 600 : 400}
                fill={s.i === hoverIndex ? theme.ink : theme.ink2}
              >
                {CATEGORIES[s.i]} {Math.round(s.share * 100)}%
              </text>
            );
          })}

      {doughnut && (
        <g textAnchor="middle">
          <text x={cx} y={cy - 2} fontFamily={MONO} fontSize={16} fontWeight={600} fill={theme.ink}>
            {total}
          </text>
          <text x={cx} y={cy + 14} fontFamily={MONO} fontSize={9} fill={theme.muted}>
            TOTAL
          </text>
        </g>
      )}
    </svg>
  );
}
