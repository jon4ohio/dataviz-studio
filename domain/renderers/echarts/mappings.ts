/**
 * Platform concept → ECharts value lookups (boring mapping only).
 * Business / assembly logic belongs in option-builder.ts.
 */

import type { CellValue, Dataset } from "../../schema";
import type { LegendSpec } from "../../schema";

export function fieldIndex(dataset: Dataset, fieldId: string): number {
  const index = dataset.fields.findIndex((f) => f.id === fieldId);
  if (index < 0) {
    throw new Error(`Unknown field id: ${fieldId}`);
  }
  return index;
}

/** Column values in row order for a field id. */
export function columnValues(dataset: Dataset, fieldId: string): CellValue[] {
  const index = fieldIndex(dataset, fieldId);
  return dataset.rows.map((row) => row[index] ?? null);
}

/** Category / axis label from a cell. */
export function cellToCategoryLabel(value: CellValue): string {
  if (value === null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

/** Numeric measure; non-finite → 0 for stable Option output. */
export function cellToNumber(value: CellValue): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  if (typeof value === "boolean") return value ? 1 : 0;
  return 0;
}

/** Legend position → ECharts legend orient / top / bottom / left / right flags. */
export function mapLegendPosition(position: LegendSpec["position"]): {
  readonly orient: "horizontal" | "vertical";
  readonly top?: string;
  readonly bottom?: string;
  readonly left?: string;
  readonly right?: string;
} {
  switch (position) {
    case "top":
      return { orient: "horizontal", top: "0%" };
    case "bottom":
      return { orient: "horizontal", bottom: "0%" };
    case "left":
      return { orient: "vertical", left: "0%" };
    case "right":
      return { orient: "vertical", right: "0%" };
    default: {
      const _exhaustive: never = position;
      return _exhaustive;
    }
  }
}
