/**
 * Light bridge between Milestone 1 SampleState and VisualizationSpec.
 * Editor state speaks the canonical model; Restoration hydrates from Spec.
 */

import {
  VISUALIZATION_SPEC_VERSION,
  type ChartType,
  type Dataset,
  type VisualizationSpec
} from "@domain/schema";
import type { SampleChartType, SampleSeries, SampleState, SeriesMark } from "./sample";
import { CATEGORIES, INITIAL_STATE } from "./sample";

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

function isSampleChartType(t: string): t is SampleChartType {
  return isChartType(t);
}

function metaString(spec: VisualizationSpec, key: string): string | undefined {
  const v = spec.metadata[key];
  return typeof v === "string" ? v : undefined;
}

function metaBool(spec: VisualizationSpec, key: string, fallback: boolean): boolean {
  const v = spec.metadata[key];
  return typeof v === "boolean" ? v : fallback;
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
    metadata: {
      showTitle: state.showTitle,
      titleAlign: state.titleAlign,
      canvasTheme: state.canvasTheme,
      showXAxis: state.showXAxis,
      showYAxis: state.showYAxis,
      valueLabels: state.valueLabels,
      smooth: state.smooth,
      stacked: state.stacked,
      seriesUi: JSON.stringify(
        state.series.map((s) => ({
          id: s.id,
          visible: s.visible,
          slot: s.slot,
          mark: s.mark
        }))
      )
    }
  };
}

/**
 * Restoration: VisualizationSpec → SampleState (editor).
 * Never reverse-engineers SVG.
 */
export function visualizationSpecToSampleState(spec: VisualizationSpec): SampleState {
  const measures = spec.dataset.fields.filter((f) => f.role === "measure");
  const categoryField = spec.dataset.fields.find((f) => f.role === "dimension");
  const categoryIndex = categoryField
    ? spec.dataset.fields.findIndex((f) => f.id === categoryField.id)
    : -1;

  let seriesUi: Array<{ id: string; visible?: boolean; slot?: number; mark?: SeriesMark }> = [];
  const seriesUiRaw = metaString(spec, "seriesUi");
  if (seriesUiRaw) {
    try {
      seriesUi = JSON.parse(seriesUiRaw) as typeof seriesUi;
    } catch {
      seriesUi = [];
    }
  }
  const seriesUiById = new Map(seriesUi.map((s) => [s.id, s]));

  const series: SampleSeries[] = measures.map((field, index) => {
    const fieldIndex = spec.dataset.fields.findIndex((f) => f.id === field.id);
    const values = spec.dataset.rows.map((row) => {
      const cell = fieldIndex >= 0 ? row[fieldIndex] : 0;
      return typeof cell === "number" ? cell : Number(cell) || 0;
    });
    const ui = seriesUiById.get(field.id);
    const mark: SeriesMark =
      ui?.mark === "column" || ui?.mark === "line" || ui?.mark === "scatter"
        ? ui.mark
        : "line";
    return {
      id: field.id,
      name: field.name,
      values:
        values.length === CATEGORIES.length
          ? values
          : [...values, ...new Array(Math.max(0, CATEGORIES.length - values.length)).fill(0)].slice(
              0,
              CATEGORIES.length
            ),
      visible: ui?.visible ?? true,
      slot: typeof ui?.slot === "number" ? ui.slot : index % 8,
      mark
    };
  });

  const titleAlignRaw = metaString(spec, "titleAlign");
  const titleAlign =
    titleAlignRaw === "left" || titleAlignRaw === "center" || titleAlignRaw === "right"
      ? titleAlignRaw
      : INITIAL_STATE.titleAlign;

  const canvasThemeRaw = metaString(spec, "canvasTheme");
  const canvasTheme = canvasThemeRaw === "light" || canvasThemeRaw === "dark" ? canvasThemeRaw : "dark";

  const valueLabelsRaw = metaString(spec, "valueLabels");
  const valueLabels =
    valueLabelsRaw === "none" || valueLabelsRaw === "ends" || valueLabelsRaw === "all"
      ? valueLabelsRaw
      : INITIAL_STATE.valueLabels;

  const chartType: SampleChartType = isSampleChartType(spec.kind) ? spec.kind : "bar";

  // Prefer category labels from Spec when they match editor length (sample CATEGORIES).
  if (categoryIndex >= 0 && spec.dataset.rows.length === CATEGORIES.length) {
    // Categories stay as sample CATEGORIES for the current editor grid.
    void categoryIndex;
  }

  return {
    chartType,
    title: spec.title,
    showTitle: metaBool(spec, "showTitle", spec.title.trim() !== ""),
    titleAlign,
    showLegend: spec.legend.show,
    legendPosition: spec.legend.position === "top" ? "top" : "bottom",
    showXAxis: metaBool(spec, "showXAxis", true),
    showYAxis: metaBool(spec, "showYAxis", true),
    showGrid: spec.style.showGrid ?? true,
    valueLabels,
    smooth: metaBool(spec, "smooth", false),
    stacked: metaBool(spec, "stacked", false),
    canvasTheme,
    width: spec.layout.width,
    height: spec.layout.height,
    series: series.length > 0 ? series : INITIAL_STATE.series
  };
}
