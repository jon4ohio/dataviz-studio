import type { ChartType, VisualizationSpec } from "../schema";

/**
 * Rendering contracts — Public Platform API (stable after SPEC-003).
 * Changes require an ADR or an approved breaking-change proposal.
 *
 * Meaning: docs/architecture/domain-model.md
 * Implementations (e.g. ECharts adapter) arrive in Milestone 3 / SPEC-004.
 */

export interface RenderResult {
  svg: string;
  width: number;
  height: number;
  engine: string;
  engineVersion: string;
}

export interface VisualizationRenderer {
  id: string;
  supports(type: ChartType): boolean;
  render(spec: VisualizationSpec): Promise<RenderResult>;
}
