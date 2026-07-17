import type { BridgeStatus } from "../bridge";

interface Props {
  status: BridgeStatus;
  latency: number | null;
  hasSelection: boolean;
  managedChart: boolean;
  onPing: () => void;
  onExport: () => void;
}

const BRIDGE_LABEL: Record<BridgeStatus, string> = {
  connecting: "Connecting",
  online: "Bridge online",
  preview: "Browser preview"
};

export function TopBar({
  status,
  latency,
  hasSelection,
  managedChart,
  onPing,
  onExport
}: Props) {
  return (
    <header className="topbar">
      <div className="brand">
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
          <rect x="2" y="11" width="4" height="7" rx="1.5" fill="#2a78d6" />
          <rect x="8" y="6" width="4" height="12" rx="1.5" fill="#008300" />
          <rect x="14" y="2" width="4" height="16" rx="1.5" fill="#e87ba4" />
        </svg>
        <div className="brand-text">
          <strong>DataViz Studio</strong>
          <span className="brand-eyebrow">FOR FIGMA · MILESTONE 1</span>
        </div>
      </div>

      <div className="topbar-status">
        <button
          type="button"
          className={`chip chip-${status}`}
          onClick={onPing}
          disabled={status !== "online"}
          title={
            status === "online"
              ? "Ping the plugin runtime again"
              : "The plugin runtime responds when running inside Figma"
          }
        >
          <span className="dot" aria-hidden="true" />
          {BRIDGE_LABEL[status]}
          {status === "online" && latency !== null && <em>{latency}ms</em>}
        </button>

        <div className={`chip chip-selection${hasSelection ? " is-active" : ""}`}>
          <span className="dot" aria-hidden="true" />
          Selection
          <em>{managedChart ? "managed" : hasSelection ? "active" : "none"}</em>
        </div>

        <button
          type="button"
          className="button-primary"
          onClick={onExport}
          title={
            status === "online"
              ? "Insert the current chart onto the canvas as an Auto Layout frame"
              : "Available when running inside Figma"
          }
        >
          Export to canvas
        </button>
      </div>
    </header>
  );
}
