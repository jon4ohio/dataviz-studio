/** Shared UI shell sizes — must match figma.showUI / figma.ui.resize. */

export type ShellMode = "workbench" | "minimized";

export const UI_SIZE = {
  workbench: { width: 1080, height: 700 },
  minimized: { width: 320, height: 72 }
} as const;

export function sizeForShell(mode: ShellMode): { width: number; height: number } {
  return UI_SIZE[mode];
}
