/**
 * Light bridge from Milestone 1 SampleState → VisualizationSpec.
 * Preview still uses sample SVG until SPEC-004; editor state begins to
 * speak the canonical model (SPEC-003 acceptance).
 */

import {
  VISUALIZATION_SPEC_VERSION,
  type ChartType,
  type Dataset,
  type VisualizationSpec
} from "@domain/schema";
import type { SampleState } from "./sample";
import { CATEGORIES } from "./sample";

function isChartType(t: string): t is ChartType {
  return (
    t === "line" ||
    t === "bar" ||
    t === "column" ||
    t === "area" ||
    t === "pie" ||
    t === "doughnut" ||
    t === "scatter" ||
    t === "mixed"
  );
}

export function sampleStateToVisualizationSpec(state: SampleState): VisualizationSpec {
  const kind: ChartType = isChartType(state.chartType) ? state.chartType : "bar";
  const fields = [
    { id: "category", name: "Category", role: "dimension" as const, valueType: "string" as const },
    ...state.series.map((s) => ({
      id: s.id,
      name: s.name,
      role: "measure" as const,
      valueType: "number" as const
    }))
  ];
  const rows = CATEGORIES.map((cat, rowIndex) => [
    cat,
    ...state.series.map((s) => s.values[rowIndex] ?? 0)
  ]);
  const dataset: Dataset = {
    id: "editor",
    fields,
    rows,
    series: state.series.map((s) => ({ id: s.id, name: s.name, fieldIds: [s.id] }))
  };

  const measureId = state.series[0]?.id ?? "value";
  const encoding =
    kind === "scatter"
      ? {
          x: { fieldId: measureId, scaleKind: "linear" as const },
          y: { fieldId: measureId, scaleKind: "linear" as const }
        }
      : kind === "pie" || kind === "doughnut"
        ? {
            category: { fieldId: "category", scaleKind: "category" as const },
            angle: { fieldId: measureId, scaleKind: "linear" as const }
          }
        : kind === "bar" || kind === "column"
          ? {
              category: { fieldId: "category", scaleKind: "category" as const },
              y: { fieldId: measureId, scaleKind: "linear" as const }
            }
          : {
              x: { fieldId: "category", scaleKind: "category" as const },
              y: { fieldId: measureId, scaleKind: "linear" as const }
            };

  return {
    version: VISUALIZATION_SPEC_VERSION,
    id: "editor-draft",
    title: state.title,
    kind,
    dataset,
    encoding,
    layers: [
      {
        id: "primary",
        mark:
          kind === "line"
            ? "line"
            : kind === "area"
              ? "area"
              : kind === "scatter"
                ? "point"
                : kind === "pie" || kind === "doughnut"
                  ? "arc"
                  : "bar",
        encoding
      }
    ],
    annotations: [],
    layout: { width: state.width, height: state.height },
    style: { showGrid: state.showGrid },
    themeId: null,
    legend: {
      show: state.showLegend,
      position: state.legendPosition === "top" ? "top" : "bottom"
    },
    metadata: {}
  };
}
