import { describe, expect, it } from "vitest";
import { createDefaultVisualizationSpec } from "../../schema";
import { buildOption } from "./option-builder";

describe("buildOption — bar translation (Slice 2)", () => {
  it("produces a stable Option snapshot for the default bar Spec", () => {
    const spec = createDefaultVisualizationSpec("bar");
    const option = buildOption(spec);
    expect(option).toMatchSnapshot();
  });

  it("is deterministic for the same VisualizationSpec", () => {
    const spec = createDefaultVisualizationSpec("bar");
    const a = buildOption(spec);
    const b = buildOption(spec);
    expect(a).toEqual(b);
  });

  it("does not mutate the VisualizationSpec", () => {
    const spec = createDefaultVisualizationSpec("bar");
    const before = JSON.stringify(spec);
    buildOption(spec);
    expect(JSON.stringify(spec)).toBe(before);
  });

  it("throws for non-bar kinds", () => {
    const spec = createDefaultVisualizationSpec("line");
    expect(() => buildOption(spec)).toThrow(/bar only/);
  });

  it("maps categories and measure values from encoding", () => {
    const spec = createDefaultVisualizationSpec("bar");
    const option = buildOption(spec);
    expect(option.animation).toBe(false);
    expect(option.yAxis.type).toBe("category");
    expect(option.yAxis.data).toEqual(["A", "B", "C", "D"]);
    expect(option.xAxis.type).toBe("value");
    expect(option.series).toHaveLength(1);
    expect(option.series[0]?.type).toBe("bar");
    expect(option.series[0]?.data).toEqual([12, 19, 8, 15]);
  });
});
