/**
 * Versioned metadata for charts inserted on the Figma canvas.
 * Sample-state snapshots are temporary until SPEC-003 VisualizationSpec lands.
 */

export const PLUGIN_DATA_KEY = "dataviz-studio";

export const PLUGIN_VERSION = "0.1.0";

export const META_SCHEMA_VERSION = 1 as const;

/** Legend entry used when building the Auto Layout legend on insert. */
export interface ChartLegendItem {
  name: string;
  color: string;
}

/** Theme colors applied to the Auto Layout chart frame. */
export interface ChartFrameTheme {
  surface: string;
  ink: string;
  ink2: string;
}

export interface ChartPluginMeta {
  schemaVersion: typeof META_SCHEMA_VERSION;
  rendererId: "sample-svg";
  pluginVersion: string;
  title: string;
  showTitle: boolean;
  titleAlign: "left" | "center" | "right";
  showLegend: boolean;
  legendPosition: "top" | "bottom";
  chartType: string;
  width: number;
  height: number;
  theme: ChartFrameTheme;
  legendItems: ChartLegendItem[];
  /** Opaque editor snapshot (SampleState JSON) for future reopen. */
  sampleState: unknown;
}

export function serializeMeta(meta: ChartPluginMeta): string {
  return JSON.stringify(meta);
}

/**
 * Parse plugin data. Returns null when missing, malformed, or unsupported version.
 */
export function parseMeta(raw: string | null | undefined): ChartPluginMeta | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ChartPluginMeta>;
    if (parsed.schemaVersion !== META_SCHEMA_VERSION) return null;
    if (parsed.rendererId !== "sample-svg") return null;
    if (typeof parsed.pluginVersion !== "string") return null;
    if (typeof parsed.title !== "string") return null;
    if (typeof parsed.showTitle !== "boolean") return null;
    if (parsed.titleAlign !== "left" && parsed.titleAlign !== "center" && parsed.titleAlign !== "right") {
      return null;
    }
    if (typeof parsed.showLegend !== "boolean") return null;
    if (parsed.legendPosition !== "top" && parsed.legendPosition !== "bottom") return null;
    if (typeof parsed.chartType !== "string") return null;
    if (typeof parsed.width !== "number" || typeof parsed.height !== "number") return null;
    if (!parsed.theme || typeof parsed.theme.surface !== "string") return null;
    if (!Array.isArray(parsed.legendItems)) return null;
    return parsed as ChartPluginMeta;
  } catch {
    return null;
  }
}

export function buildSampleMeta(input: {
  title: string;
  showTitle: boolean;
  titleAlign: "left" | "center" | "right";
  showLegend: boolean;
  legendPosition: "top" | "bottom";
  chartType: string;
  width: number;
  height: number;
  theme: ChartFrameTheme;
  legendItems: ChartLegendItem[];
  sampleState: unknown;
}): ChartPluginMeta {
  return {
    schemaVersion: META_SCHEMA_VERSION,
    rendererId: "sample-svg",
    pluginVersion: PLUGIN_VERSION,
    ...input
  };
}
