/**
 * Intent-preserving serialization for VisualizationSpec.
 * Must not persist renderer identity, SVG, or Figma node ids.
 */

import { parseVisualizationSpec, validateVisualizationSpec, type ValidationResult } from "./validate";
import type { VisualizationSpec } from "./visualization";

const FORBIDDEN_KEYS = ["renderer", "rendererId", "engine", "echarts", "option", "svg", "nodeId", "figmaNodeId"] as const;

function stripForbidden(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripForbidden);
  if (typeof value !== "object" || value === null) return value;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if ((FORBIDDEN_KEYS as readonly string[]).includes(k)) continue;
    out[k] = stripForbidden(v);
  }
  return out;
}

/** Serialize editable intent to JSON string. */
export function serializeVisualizationSpec(spec: VisualizationSpec): string {
  return JSON.stringify(stripForbidden(spec));
}

/** Deserialize JSON string; runs full validation pipeline. */
export function deserializeVisualizationSpec(json: string): ValidationResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json) as unknown;
  } catch {
    return {
      ok: false,
      issues: [{ path: "", message: "Invalid JSON", severity: "error" }]
    };
  }
  return validateVisualizationSpec(parsed);
}

/** Parse without full semantic gate (structural parse only). Prefer deserialize for restore. */
export function deserializeLoose(json: string): ValidationResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json) as unknown;
  } catch {
    return {
      ok: false,
      issues: [{ path: "", message: "Invalid JSON", severity: "error" }]
    };
  }
  return parseVisualizationSpec(parsed);
}
