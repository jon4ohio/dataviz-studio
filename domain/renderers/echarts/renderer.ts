import type { ChartType, VisualizationSpec } from "../../schema";
import type { RenderResult, VisualizationRenderer } from "../types";
import { ECHARTS_RENDERER_ID, ECHARTS_RENDERER_VERSION } from "./defaults";

/**
 * Slice 1 — renderer skeleton.
 * Pure: Spec → placeholder RenderResult. No ECharts, no option builder, no Figma.
 */

function placeholderSvg(width: number, height: number, title: string): string {
  const safeTitle = title.replace(/[<>&"]/g, "");
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<rect width="100%" height="100%" fill="#f4f4f5"/>`,
    `<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="#71717a" font-family="system-ui,sans-serif" font-size="14">`,
    `ECharts Renderer (placeholder) — ${safeTitle}`,
    `</text>`,
    `</svg>`
  ].join("");
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
      return {
        success: false,
        svg: "",
        width,
        height,
        renderer: ECHARTS_RENDERER_ID,
        version: ECHARTS_RENDERER_VERSION,
        warnings: [
          {
            code: "unsupported-kind",
            message: `ECharts Renderer Slice 1 supports bar only; got ${spec.kind}`
          }
        ]
      };
    }

    return {
      success: true,
      svg: placeholderSvg(width, height, spec.title || spec.kind),
      width,
      height,
      renderer: ECHARTS_RENDERER_ID,
      version: ECHARTS_RENDERER_VERSION,
      warnings: []
    };
  }
};
