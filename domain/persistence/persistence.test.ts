import { describe, expect, it } from "vitest";
import { createValidatedDefault } from "../schema";
import {
  META_SCHEMA_VERSION,
  PLUGIN_VERSION,
  buildChartMeta,
  migrateChartPluginMeta,
  parseMeta,
  serializeMeta
} from "./index";

describe("ChartPluginMeta v2", () => {
  it("round-trips semantic metadata without SVG or engine fields", () => {
    const base = createValidatedDefault("bar");
    const spec = { ...base, title: "Revenue" };
    const meta = buildChartMeta({
      rendererId: "echarts",
      rendererVersion: "0.1.0-slice3",
      spec
    });
    expect(meta.schemaVersion).toBe(META_SCHEMA_VERSION);
    expect(meta.pluginVersion).toBe(PLUGIN_VERSION);
    const raw = serializeMeta(meta);
    expect(raw).not.toMatch(/svg|echartsOption|"option"/i);
    const parsed = parseMeta(raw);
    expect(parsed).not.toBeNull();
    expect(parsed?.spec.title).toBe("Revenue");
    expect(parsed?.rendererId).toBe("echarts");
  });

  it("rejects unsupported schema versions", () => {
    const spec = createValidatedDefault("bar");
    const raw = JSON.stringify({
      schemaVersion: 1,
      pluginVersion: PLUGIN_VERSION,
      rendererId: "sample-svg",
      rendererVersion: "0.1.0",
      sampleState: {},
      spec
    });
    expect(parseMeta(raw)).toBeNull();
  });

  it("rejects metadata with invalid VisualizationSpec", () => {
    const raw = JSON.stringify({
      schemaVersion: META_SCHEMA_VERSION,
      pluginVersion: PLUGIN_VERSION,
      rendererId: "echarts",
      rendererVersion: "0.1.0",
      spec: { version: 1, title: "broken" }
    });
    expect(parseMeta(raw)).toBeNull();
  });

  it("migrateChartPluginMeta is identity for v2", () => {
    const meta = buildChartMeta({
      rendererId: "echarts",
      rendererVersion: "0.1.0",
      spec: createValidatedDefault("bar")
    });
    expect(migrateChartPluginMeta(meta)).toEqual(meta);
  });
});
