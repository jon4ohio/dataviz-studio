import { describe, expect, it } from "vitest";
import {
  createDefaultVisualizationSpec,
  getVisualizationKind,
  listVisualizationKinds
} from "./registry";

describe("Visualization Registry", () => {
  it("lists cartesian kinds with defaults and circular without", () => {
    const kinds = listVisualizationKinds();
    expect(kinds.find((k) => k.kind === "bar")?.hasDefaults).toBe(true);
    expect(kinds.find((k) => k.kind === "column")?.hasDefaults).toBe(true);
    expect(kinds.find((k) => k.kind === "pie")?.hasDefaults).toBe(false);
    expect(kinds.find((k) => k.kind === "doughnut")?.family).toBe("circular");
  });

  it("builds default bar VisualizationSpec without engine fields", () => {
    const spec = createDefaultVisualizationSpec("bar");
    expect(spec.kind).toBe("bar");
    expect(spec.layers.length).toBe(1);
    expect(spec.encoding.category?.fieldId).toBe("category");
    expect(spec.dataset.fields.length).toBeGreaterThan(0);
    expect("svg" in spec).toBe(false);
    expect("echarts" in spec).toBe(false);
  });

  it("refuses defaults for pie until family milestone", () => {
    expect(() => createDefaultVisualizationSpec("pie")).toThrow(/No default preset/);
    expect(getVisualizationKind("pie")?.hasDefaults).toBe(false);
  });
});
