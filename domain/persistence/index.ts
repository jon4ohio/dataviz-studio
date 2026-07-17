/**
 * Versioned metadata for managed chart nodes (Document Projection).
 *
 * A Figma node is a cached projection of a VisualizationSpec, never the source of truth.
 * ChartPluginMeta is semantic only — no SVG, ECharts options, or renderer internals.
 */

import {
  validateVisualizationSpec,
  type VisualizationSpec
} from "../schema";

export const PLUGIN_DATA_KEY = "dataviz-studio";

export const PLUGIN_VERSION = "0.1.0";

/** Current persistence schema. Bump when ChartPluginMeta shape changes. */
export const META_SCHEMA_VERSION = 2 as const;

/** Legend entry used when materializing Auto Layout chrome (not persisted). */
export interface ChartLegendItem {
  name: string;
  color: string;
}

/** Theme colors applied to the Auto Layout chart frame (not persisted). */
export interface ChartFrameTheme {
  surface: string;
  ink: string;
  ink2: string;
}

/**
 * Ephemeral chrome for Projection into Figma — derived at project time, not SoT.
 */
export interface DocumentProjectionChrome {
  title: string;
  showTitle: boolean;
  titleAlign: "left" | "center" | "right";
  showLegend: boolean;
  legendPosition: "top" | "bottom";
  theme: ChartFrameTheme;
  legendItems: ChartLegendItem[];
}

/**
 * Semantic plugin metadata on the managed root.
 * If deleting a field would not lose user intent, it does not belong here.
 */
export interface ChartPluginMeta {
  schemaVersion: typeof META_SCHEMA_VERSION;
  pluginVersion: string;
  rendererId: string;
  rendererVersion: string;
  spec: VisualizationSpec;
}

export function serializeMeta(meta: ChartPluginMeta): string {
  return JSON.stringify(meta);
}

/**
 * Schema migration entry point. Today: identity (v2 → v2).
 * Future bumps go here so every read has one path: parse → migrate → validate.
 */
export function migrateChartPluginMeta(meta: unknown): unknown {
  return meta;
}

function isTitleAlign(value: unknown): value is DocumentProjectionChrome["titleAlign"] {
  return value === "left" || value === "center" || value === "right";
}

function isLegendPosition(value: unknown): value is "top" | "bottom" {
  return value === "top" || value === "bottom";
}

/**
 * Parse plugin data. Returns null when missing, malformed, unsupported version,
 * or when `spec` fails visualization validation.
 */
export function parseMeta(raw: string | null | undefined): ChartPluginMeta | null {
  if (!raw) return null;
  try {
    const migrated = migrateChartPluginMeta(JSON.parse(raw) as unknown);
    if (typeof migrated !== "object" || migrated === null || Array.isArray(migrated)) {
      return null;
    }
    const parsed = migrated as Record<string, unknown>;
    if (parsed.schemaVersion !== META_SCHEMA_VERSION) return null;
    if (typeof parsed.pluginVersion !== "string") return null;
    if (typeof parsed.rendererId !== "string" || parsed.rendererId.length === 0) return null;
    if (typeof parsed.rendererVersion !== "string" || parsed.rendererVersion.length === 0) {
      return null;
    }
    const specResult = validateVisualizationSpec(parsed.spec);
    if (!specResult.ok || !specResult.value) return null;
    return {
      schemaVersion: META_SCHEMA_VERSION,
      pluginVersion: parsed.pluginVersion,
      rendererId: parsed.rendererId,
      rendererVersion: parsed.rendererVersion,
      spec: specResult.value
    };
  } catch {
    return null;
  }
}

/** Build v2 semantic metadata for a managed chart. */
export function buildChartMeta(input: {
  rendererId: string;
  rendererVersion: string;
  spec: VisualizationSpec;
}): ChartPluginMeta {
  return {
    schemaVersion: META_SCHEMA_VERSION,
    pluginVersion: PLUGIN_VERSION,
    rendererId: input.rendererId,
    rendererVersion: input.rendererVersion,
    spec: input.spec
  };
}

/** Derive Projection chrome from Spec + ephemeral presentation (editor / defaults). */
export function buildProjectionChrome(input: {
  spec: VisualizationSpec;
  showTitle: boolean;
  titleAlign: DocumentProjectionChrome["titleAlign"];
  theme: ChartFrameTheme;
  legendItems: ChartLegendItem[];
}): DocumentProjectionChrome {
  const legendPos = input.spec.legend.position;
  return {
    title: input.spec.title,
    showTitle: input.showTitle,
    titleAlign: isTitleAlign(input.titleAlign) ? input.titleAlign : "left",
    showLegend: input.spec.legend.show,
    legendPosition: isLegendPosition(legendPos) ? legendPos : "bottom",
    theme: input.theme,
    legendItems: input.legendItems
  };
}
