/**
 * ECharts Renderer package — private implementation of VisualizationRenderer.
 * Public consumers import from domain/renderers (echartsRenderer), not deep paths.
 */

export { echartsRenderer } from "./renderer";
export { ECHARTS_RENDERER_ID, ECHARTS_RENDERER_VERSION } from "./defaults";
/** Internal — Spec → Option. Not part of the public platform API. */
export { buildOption, type EChartsBarOption } from "./option-builder";
