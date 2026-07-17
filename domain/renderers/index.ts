/**
 * Rendering contracts — Public Platform API.
 * ECharts implementation lives under ./echarts (private; import echartsRenderer from here).
 */

export type {
  RenderDiagnostics,
  RenderResult,
  RenderWarning,
  VisualizationRenderer
} from "./types";

export { echartsRenderer } from "./echarts";
