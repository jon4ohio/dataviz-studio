/**
 * VisualizationSpec → ECharts Option (internal only).
 * Compiler: same Spec → same Option. Must never be exported as platform API.
 */

import type { VisualizationSpec } from "../../schema";
import { BAR_OPTION_DEFAULTS } from "./defaults";
import {
  cellToCategoryLabel,
  cellToNumber,
  columnValues,
  mapLegendPosition
} from "./mappings";

/** Internal bar chart option shape — not part of the public platform API. */
export interface EChartsBarOption {
  readonly animation: false;
  readonly progressive: 0;
  readonly toolbox: { readonly show: false };
  readonly tooltip: { readonly show: false };
  readonly title: {
    readonly text: string;
    readonly show: boolean;
  };
  readonly legend: {
    readonly show: boolean;
    readonly orient: "horizontal" | "vertical";
    readonly top?: string;
    readonly bottom?: string;
    readonly left?: string;
    readonly right?: string;
    readonly data: readonly string[];
  };
  readonly grid: {
    readonly containLabel: true;
    readonly left: string;
    readonly right: string;
    readonly top: string;
    readonly bottom: string;
  };
  readonly xAxis: {
    readonly type: "value";
    readonly splitLine: { readonly show: boolean };
  };
  readonly yAxis: {
    readonly type: "category";
    readonly data: readonly string[];
    readonly inverse: true;
    readonly axisTick: { readonly show: false };
  };
  readonly series: readonly {
    readonly type: "bar";
    readonly name: string;
    readonly data: readonly number[];
    readonly barMaxWidth: number;
    readonly itemStyle?: { readonly borderRadius?: number };
  }[];
  readonly color?: readonly string[];
}

function resolveCategoryFieldId(spec: VisualizationSpec): string {
  const id = spec.encoding.category?.fieldId ?? spec.encoding.x?.fieldId;
  if (!id) {
    throw new Error("bar option requires category (or x) encoding");
  }
  return id;
}

function resolveMeasureFieldIds(spec: VisualizationSpec): { id: string; name: string }[] {
  if (spec.dataset.series && spec.dataset.series.length > 0) {
    const measures: { id: string; name: string }[] = [];
    for (const s of spec.dataset.series) {
      for (const fieldId of s.fieldIds) {
        const field = spec.dataset.fields.find((f) => f.id === fieldId);
        measures.push({ id: fieldId, name: s.name || field?.name || fieldId });
      }
    }
    if (measures.length > 0) return measures;
  }
  const yId = spec.encoding.y?.fieldId;
  if (!yId) {
    throw new Error("bar option requires y encoding or dataset.series measures");
  }
  const field = spec.dataset.fields.find((f) => f.id === yId);
  return [{ id: yId, name: field?.name || yId }];
}

/**
 * Compile a bar VisualizationSpec into a deterministic internal ECharts Option.
 * @throws if kind is not bar or required encodings/fields are missing
 */
export function buildOption(spec: VisualizationSpec): EChartsBarOption {
  if (spec.kind !== "bar") {
    throw new Error(`buildOption supports bar only; got ${spec.kind}`);
  }

  const categoryFieldId = resolveCategoryFieldId(spec);
  const categories = columnValues(spec.dataset, categoryFieldId).map(cellToCategoryLabel);
  const measures = resolveMeasureFieldIds(spec);
  const showGrid = spec.style.showGrid ?? true;
  const legendPos = mapLegendPosition(spec.legend.position);
  const cornerRadius = spec.style.cornerRadius;

  const series = measures.map((m) => {
    const values = columnValues(spec.dataset, m.id).map(cellToNumber);
    return {
      type: "bar" as const,
      name: m.name,
      data: values,
      barMaxWidth: 48,
      ...(cornerRadius !== undefined
        ? { itemStyle: { borderRadius: cornerRadius } }
        : {})
    };
  });

  const padding = spec.layout.padding;
  const option: EChartsBarOption = {
    ...BAR_OPTION_DEFAULTS,
    title: {
      text: spec.title,
      show: spec.title.length > 0
    },
    legend: {
      show: spec.legend.show,
      ...legendPos,
      data: series.map((s) => s.name)
    },
    grid: {
      containLabel: true,
      left: padding?.left !== undefined ? `${padding.left}` : "8%",
      right: padding?.right !== undefined ? `${padding.right}` : "8%",
      top: padding?.top !== undefined ? `${padding.top}` : "12%",
      bottom: padding?.bottom !== undefined ? `${padding.bottom}` : "12%"
    },
    xAxis: {
      type: "value",
      splitLine: { show: showGrid }
    },
    yAxis: {
      type: "category",
      data: categories,
      inverse: true,
      axisTick: { show: false }
    },
    series,
    ...(spec.style.colorPalette && spec.style.colorPalette.length > 0
      ? { color: [...spec.style.colorPalette] }
      : {})
  };

  return option;
}
