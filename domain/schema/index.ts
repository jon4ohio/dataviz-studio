/**
 * Canonical visualization schema — the single source of truth for every
 * chart. Fully specified in Milestone 2; only the identifiers other
 * contracts depend on are frozen here.
 */

export type ChartType =
  | "line"
  | "bar"
  | "area"
  | "pie"
  | "doughnut"
  | "scatter"
  | "mixed";

/** Placeholder for the canonical spec. Expanded in Milestone 2. */
export interface VisualizationSpec {
  readonly type: ChartType;
}
