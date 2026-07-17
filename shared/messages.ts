/**
 * Message Bridge — the canonical contract between the React UI and the
 * Figma plugin runtime. All cross-runtime communication passes through
 * these types; future milestones extend them, never bypass them.
 */

import type { ChartPluginMeta, DocumentProjectionChrome } from "../domain/persistence";

/** Payload shared by insert and update Document Projection messages. */
export type ProjectChartPayload = {
  svg: string;
  width: number;
  height: number;
  meta: ChartPluginMeta;
  chrome: DocumentProjectionChrome;
};

/** Messages sent from the UI iframe to the plugin runtime. */
export type UIMessage =
  | { type: "ui-ready" }
  | { type: "ping" }
  | { type: "notify"; message: string }
  | { type: "resize-ui"; width: number; height: number }
  | ({ type: "insert-chart" } & ProjectChartPayload)
  | ({ type: "update-chart" } & ProjectChartPayload);

/** Messages sent from the plugin runtime to the UI iframe. */
export type PluginMessage =
  | { type: "plugin-ready" }
  | { type: "pong" }
  | { type: "selection-changed"; hasSelection: boolean }
  | { type: "managed-selection"; meta: ChartPluginMeta | null };
