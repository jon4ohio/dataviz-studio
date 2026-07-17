import type { ChartType, VisualizationSpec } from "../../schema";
import type { RenderResult, VisualizationRenderer } from "../types";
import { buildOption } from "./option-builder";
import { ECHARTS_RENDERER_ID, ECHARTS_RENDERER_VERSION } from "./defaults";
import { renderOption } from "./render-option";

/**
 * ECharts Renderer — public orchestration only.
 * buildOption / renderOption may throw; this layer normalizes into RenderResult.
 */

function failureResult(
  width: number,
  height: number,
  code: string,
  message: string
): RenderResult {
  return {
    success: false,
    svg: "",
    width,
    height,
    renderer: ECHARTS_RENDERER_ID,
    version: ECHARTS_RENDERER_VERSION,
    warnings: [{ code, message }]
  };
}

export const echartsRenderer: VisualizationRenderer = {
  id: ECHARTS_RENDERER_ID,
  version: ECHARTS_RENDERER_VERSION,

  supports(type: ChartType): boolean {
    return type === "bar";
  },

  async render(spec: VisualizationSpec): Promise<RenderResult> {
    const width = spec.layout.width;
    const height = spec.layout.height;

    if (!this.supports(spec.kind)) {
      return failureResult(
        width,
        height,
        "unsupported-kind",
        `ECharts Renderer supports bar only; got ${spec.kind}`
      );
    }

    try {
      const option = buildOption(spec);
      const svg = renderOption(option, width, height);
      return {
        success: true,
        svg,
        width,
        height,
        renderer: ECHARTS_RENDERER_ID,
        version: ECHARTS_RENDERER_VERSION,
        warnings: []
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return failureResult(width, height, "render-failed", message);
    }
  }
};
