import { describe, expect, it } from "vitest";
import {
  createDefaultVisualizationSpec,
  deserializeVisualizationSpec,
  serializeVisualizationSpec,
  validateSemantics,
  validateStructure,
  validateVisualizationSpec
} from "./index";

describe("Validation and codec", () => {
  it("round-trips a default bar spec preserving intent", () => {
    const original = createDefaultVisualizationSpec("bar");
    const json = serializeVisualizationSpec(original);
    const restored = deserializeVisualizationSpec(json);
    expect(restored.ok).toBe(true);
    expect(restored.value?.kind).toBe("bar");
    expect(restored.value?.dataset.rows).toEqual(original.dataset.rows);
    expect(restored.value?.encoding.category?.fieldId).toBe("category");
  });

  it("rejects forbidden implementation fields", () => {
    const base = createDefaultVisualizationSpec("bar");
    const dirty = { ...base, svg: "<svg/>", renderer: "echarts", option: {} };
    const result = validateVisualizationSpec(dirty);
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.path === "svg")).toBe(true);
    expect(result.issues.some((i) => i.path === "renderer")).toBe(true);
  });

  it("fails semantic validation when scatter lacks two measures", () => {
    const spec = createDefaultVisualizationSpec("scatter");
    const broken = {
      ...spec,
      encoding: { x: { fieldId: "x", scaleKind: "linear" as const } }
    };
    const issues = validateSemantics(broken);
    expect(issues.some((i) => i.message.includes("x and y"))).toBe(true);
  });

  it("flags unknown encoding field ids structurally", () => {
    const spec = createDefaultVisualizationSpec("bar");
    const broken = {
      ...spec,
      encoding: {
        category: { fieldId: "nope", scaleKind: "category" as const },
        y: { fieldId: "value", scaleKind: "linear" as const }
      }
    };
    const issues = validateStructure(broken);
    expect(issues.some((i) => i.message.includes("Unknown fieldId"))).toBe(true);
  });

  it("rejects echarts pollution on validate", () => {
    const spec = createDefaultVisualizationSpec("line");
    const result = validateVisualizationSpec({ ...spec, echarts: { option: 1 } });
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.path === "echarts")).toBe(true);
  });
});
