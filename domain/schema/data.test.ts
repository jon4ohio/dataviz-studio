import { describe, expect, it } from "vitest";
import {
  assertDatasetStructure,
  createEmptyDataset,
  type Dataset
} from "./data";

describe("Dataset structure", () => {
  it("creates an empty dataset", () => {
    const ds = createEmptyDataset("d1");
    expect(ds.id).toBe("d1");
    expect(ds.fields).toEqual([]);
    expect(ds.rows).toEqual([]);
    expect(assertDatasetStructure(ds)).toEqual([]);
  });

  it("accepts aligned rows and fields", () => {
    const ds: Dataset = {
      id: "sales",
      fields: [
        { id: "cat", name: "Category", role: "dimension", valueType: "string" },
        { id: "amt", name: "Amount", role: "measure", valueType: "number" }
      ],
      rows: [
        ["North", 10],
        ["South", 20]
      ],
      series: [{ id: "s1", name: "Amount", fieldIds: ["amt"] }]
    };
    expect(assertDatasetStructure(ds)).toEqual([]);
  });

  it("flags row width mismatches and unknown series fields", () => {
    const ds: Dataset = {
      id: "bad",
      fields: [{ id: "a", name: "A", role: "measure", valueType: "number" }],
      rows: [[1, 2]],
      series: [{ id: "s1", name: "X", fieldIds: ["missing"] }]
    };
    const errors = assertDatasetStructure(ds);
    expect(errors.some((e) => e.includes("Row 0"))).toBe(true);
    expect(errors.some((e) => e.includes("unknown field"))).toBe(true);
  });
});
