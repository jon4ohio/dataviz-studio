/**
 * Message Bridge — the canonical contract between the React UI and the
 * Figma plugin runtime. All cross-runtime communication passes through
 * these types; future milestones extend them, never bypass them.
 */

import type { ChartPluginMeta } from "../domain/persistence";

/** Messages sent from the UI iframe to the plugin runtime. */
export type UIMessage =
  | { type: "ui-ready" }
  | { type: "ping" }
  | { type: "notify"; message: string }
  | { type: "resize-ui"; width: number; height: number }
  | {
      type: "insert-chart";
      svg: string;
      width: number;
      height: number;
      meta: ChartPluginMeta;
    };

/** Messages sent from the plugin runtime to the UI iframe. */
export type PluginMessage =
  | { type: "plugin-ready" }
  | { type: "pong" }
  | { type: "selection-changed"; hasSelection: boolean }
  | { type: "managed-selection"; meta: ChartPluginMeta | null };
