/**
 * Milestone 1 sample state. This is placeholder content that makes the
 * shell interactive — it is NOT the canonical schema (Milestone 2) or a
 * rendering engine (Milestone 3). The preview draws plain SVG in React.
 */

export type SampleChartType =
  | "line"
  | "column"
  | "bar"
  | "area"
  | "scatter"
  | "mixed"
  | "pie"
  | "doughnut";

/** Per-series mark, used when chartType === "mixed". */
export type SeriesMark = "column" | "line" | "scatter";

export type ValueLabels = "none" | "ends" | "all";

export interface SampleSeries {
  id: string;
  name: string;
  values: number[];
  visible: boolean;
  /** Index into the validated 8-slot palette. Color follows the entity. */
  slot: number;
  mark: SeriesMark;
}

export interface SampleState {
  chartType: SampleChartType;
  title: string;
  showTitle: boolean;
  titleAlign: "left" | "center" | "right";
  showLegend: boolean;
  legendPosition: "top" | "bottom";
  showXAxis: boolean;
  showYAxis: boolean;
  showGrid: boolean;
  valueLabels: ValueLabels;
  smooth: boolean;
  stacked: boolean;
  canvasTheme: "light" | "dark";
  width: number;
  height: number;
  series: SampleSeries[];
}

export const CATEGORIES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

/** All-pairs color-vision validation holds through four series. */
export const MAX_SERIES = 4;

export const SIZE_LIMITS = { minW: 240, maxW: 960, minH: 180, maxH: 720 };

export const INITIAL_STATE: SampleState = {
  chartType: "mixed",
  title: "Monthly performance",
  showTitle: true,
  titleAlign: "center",
  showLegend: true,
  legendPosition: "bottom",
  showXAxis: true,
  showYAxis: true,
  showGrid: true,
  valueLabels: "ends",
  smooth: false,
  stacked: false,
  canvasTheme: "dark",
  width: 640,
  height: 400,
  series: [
    { id: "s1", name: "Revenue", values: [120, 168, 146, 190, 178, 224], visible: true, slot: 0, mark: "column" },
    { id: "s2", name: "Costs", values: [86, 92, 110, 98, 118, 124], visible: true, slot: 1, mark: "line" },
    { id: "s3", name: "Signups", values: [34, 58, 49, 77, 66, 91], visible: true, slot: 2, mark: "scatter" }
  ]
};

/**
 * Chart-surface themes. Series steps come from the validated categorical
 * palette (8 slots), re-stepped per surface — not an automatic flip.
 */
export interface CanvasTheme {
  surface: string;
  ink: string;
  ink2: string;
  muted: string;
  grid: string;
  baseline: string;
  series: string[];
}

export const CANVAS_THEMES: Record<"light" | "dark", CanvasTheme> = {
  light: {
    surface: "#fcfcfb",
    ink: "#0b0b0b",
    ink2: "#52514e",
    muted: "#898781",
    grid: "#e1e0d9",
    baseline: "#c3c2b7",
    series: ["#2a78d6", "#008300", "#e87ba4", "#eda100", "#1baf7a", "#eb6834", "#4a3aa7", "#e34948"]
  },
  dark: {
    surface: "#1a1a19",
    ink: "#ffffff",
    ink2: "#c3c2b7",
    muted: "#898781",
    grid: "#2c2c2a",
    baseline: "#383835",
    series: ["#3987e5", "#008300", "#d55181", "#c98500", "#199e70", "#d95926", "#9085e9", "#e66767"]
  }
};

/** Smallest palette slot not taken by another series. */
export function nextFreeSlot(series: SampleSeries[]): number {
  const used = new Set(series.map((s) => s.slot));
  for (let i = 0; i < 8; i++) if (!used.has(i)) return i;
  return series.length % 8;
}

/** Advance a series to the next slot that no sibling occupies. */
export function cycleSlot(series: SampleSeries[], id: string): number {
  const current = series.find((s) => s.id === id);
  if (!current) return 0;
  const used = new Set(series.filter((s) => s.id !== id).map((s) => s.slot));
  for (let step = 1; step <= 8; step++) {
    const candidate = (current.slot + step) % 8;
    if (!used.has(candidate)) return candidate;
  }
  return current.slot;
}

/**
 * Parse a pasted/edited value list ("120, 200 150 …"). Returns null when
 * nothing numeric was entered; otherwise pads/trims to `length`.
 */
export function parseValues(text: string, length: number): number[] | null {
  const nums = text
    .split(/[^0-9.\-]+/)
    .filter((t) => t !== "")
    .map(Number)
    .filter((n) => Number.isFinite(n))
    .map((n) => Math.round(Math.max(0, Math.min(999, n))));
  if (nums.length === 0) return null;
  while (nums.length < length) nums.push(nums[nums.length - 1]);
  return nums.slice(0, length);
}

/** Random walk within the sample's value range. */
export function randomizeValues(values: number[]): number[] {
  let v = 40 + Math.random() * 140;
  return values.map(() => {
    v = Math.max(12, Math.min(240, v + (Math.random() - 0.45) * 64));
    return Math.round(v);
  });
}

export function clampSize(value: number, min: number, max: number): number {
  return Math.round(Math.max(min, Math.min(max, value)));
}
