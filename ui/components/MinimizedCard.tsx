import type { BridgeStatus } from "../bridge";

interface Props {
  title: string;
  status: BridgeStatus;
  hasSelection: boolean;
  managedChart: boolean;
  onExpand: () => void;
}

const BRIDGE_HINT: Record<BridgeStatus, string> = {
  connecting: "Connecting",
  online: "Online",
  preview: "Preview"
};

export function MinimizedCard({
  title,
  status,
  hasSelection,
  managedChart,
  onExpand
}: Props) {
  const selectionLabel = managedChart ? "managed" : hasSelection ? "active" : "none";

  return (
    <button
      type="button"
      className="minimized-card"
      onClick={onExpand}
      title="Expand DataViz Studio"
    >
      <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
        <rect x="2" y="11" width="4" height="7" rx="1.5" fill="#2a78d6" />
        <rect x="8" y="6" width="4" height="12" rx="1.5" fill="#008300" />
        <rect x="14" y="2" width="4" height="16" rx="1.5" fill="#e87ba4" />
      </svg>
      <div className="minimized-card-text">
        <strong className="minimized-card-title">{title.trim() || "Untitled chart"}</strong>
        <span className="minimized-card-meta">
          {BRIDGE_HINT[status]} · Selection {selectionLabel}
        </span>
      </div>
      <span className="minimized-card-action">Expand</span>
    </button>
  );
}
