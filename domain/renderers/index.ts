import type { ChartType, VisualizationSpec } from "../schema";

/**
 * Frozen contracts for all rendering engines (Apache ECharts in V1;
 * AntV G2 and D3.js later). Implementations arrive in Milestone 3.
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
