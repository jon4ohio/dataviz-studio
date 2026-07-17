/** Selection helpers for the plugin runtime. Read-only — no document mutations. */

export function hasSelection(): boolean {
  return figma.currentPage.selection.length > 0;
}

export function onSelectionChange(callback: (hasSelection: boolean) => void): void {
  figma.on("selectionchange", () => callback(hasSelection()));
}
