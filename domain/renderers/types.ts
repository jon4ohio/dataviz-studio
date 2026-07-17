import type { ChartType, VisualizationSpec } from "../schema";

/**
 * Rendering contracts — Public Platform API.
 * Strengthened under SPEC-004 before first renderer implementation.
 * Further breaking changes require an ADR or approved proposal.
 *
 * Meaning: docs/architecture/domain-model.md
 */

export interface RenderWarning {
  readonly code: string;
  readonly message: string;
}

/** Optional debug payload for regression and renderer comparison (host-agnostic). */
export interface RenderDiagnostics {
  readonly durationMs?: number;
  readonly notes?: readonly string[];
}

/**
 * Stable renderer output contract. No Figma nodes — document integration is SPEC-005.
 */
export interface RenderResult {
  readonly success: boolean;
  readonly svg: string;
  readonly width: number;
  readonly height: number;
  /** Renderer implementation id (e.g. "echarts"). */
  readonly renderer: string;
  /** Renderer package / adapter version — not the host plugin version. */
  readonly version: string;
  readonly warnings: readonly RenderWarning[];
  readonly diagnostics?: RenderDiagnostics;
}

/**
 * Pure transformation: VisualizationSpec → RenderResult.
 * Must not mutate the spec, touch Figma, storage, UI, or the network.
 */
export interface VisualizationRenderer {
  readonly id: string;
  readonly version: string;
  supports(type: ChartType): boolean;
  render(spec: VisualizationSpec): Promise<RenderResult>;
}
