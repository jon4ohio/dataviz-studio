/**
 * ECharts boundary: Option → SVG string.
 * Knows nothing about VisualizationSpec or RenderResult. May throw.
 */

import * as echarts from "echarts";
import type { EChartsBarOption } from "./option-builder";

/**
 * Render an internal bar option to an SVG string.
 * Lifecycle: init → setOption → renderToSVGString → dispose (always).
 */
export function renderOption(
  option: EChartsBarOption,
  width: number,
  height: number
): string {
  if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) {
    throw new Error(`renderOption requires positive width/height; got ${width}x${height}`);
  }

  let chart: echarts.ECharts | null = null;
  try {
    chart = echarts.init(null, null, {
      renderer: "svg",
      ssr: true,
      width,
      height
    });
    chart.setOption(option as unknown as echarts.EChartsCoreOption);
    const svg = chart.renderToSVGString();
    if (typeof svg !== "string" || svg.length === 0) {
      throw new Error("ECharts produced an empty SVG string");
    }
    return svg;
  } finally {
    if (chart) {
      chart.dispose();
    }
  }
}
