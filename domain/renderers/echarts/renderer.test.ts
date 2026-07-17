import { describe, expect, it } from "vitest";
import { createDefaultVisualizationSpec } from "../../schema";
import { echartsRenderer } from "./renderer";
import { ECHARTS_RENDERER_ID, ECHARTS_RENDERER_VERSION } from "./defaults";
import { renderOption } from "./render-option";
import { buildOption } from "./option-builder";

describe("ECharts Renderer Slice 3 — Option → SVG", () => {
  it("supports bar only", () => {
    expect(echartsRenderer.supports("bar")).toBe(true);
    expect(echartsRenderer.supports("line")).toBe(false);
  });

  it("returns a contract-shaped RenderResult with opaque SVG for bar", async () => {
    const spec = createDefaultVisualizationSpec("bar");
    const before = JSON.stringify(spec);
    const result = await echartsRenderer.render(spec);

    expect(JSON.stringify(spec)).toBe(before);
    expect(result.success).toBe(true);
    expect(result.svg.length).toBeGreaterThan(0);
    expect(result.svg.includes("<svg")).toBe(true);
    expect(result.width).toBe(spec.layout.width);
    expect(result.height).toBe(spec.layout.height);
    expect(result.renderer).toBe(ECHARTS_RENDERER_ID);
    expect(result.version).toBe(ECHARTS_RENDERER_VERSION);
    expect(result.warnings).toEqual([]);
  });

  it("fails cleanly for unsupported kinds without throwing", async () => {
    const spec = createDefaultVisualizationSpec("line");
    const result = await echartsRenderer.render(spec);
    expect(result.success).toBe(false);
    expect(result.svg).toBe("");
    expect(result.warnings.some((w) => w.code === "unsupported-kind")).toBe(true);
  });

  it("normalizes renderOption failures into RenderResult", async () => {
    const spec = {
      ...createDefaultVisualizationSpec("bar"),
      layout: { width: 0, height: 400 }
    };
    const result = await echartsRenderer.render(spec);
    expect(result.success).toBe(false);
    expect(result.svg).toBe("");
    expect(result.warnings.some((w) => w.code === "render-failed")).toBe(true);
  });
});

describe("renderOption — ECharts boundary", () => {
  it("throws on non-positive dimensions", () => {
    const option = buildOption(createDefaultVisualizationSpec("bar"));
    expect(() => renderOption(option, 0, 100)).toThrow(/positive width/);
  });
});
