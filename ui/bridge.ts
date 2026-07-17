import { useCallback, useEffect, useRef, useState } from "react";
import type { ChartPluginMeta } from "@domain/persistence";
import type { PluginMessage, UIMessage } from "@shared/messages";

/**
 * UI side of the Message Bridge. "preview" means the UI is running in a
 * plain browser tab (vite dev) with no plugin runtime on the other side.
 */
export type BridgeStatus = "connecting" | "online" | "preview";

function post(msg: UIMessage): void {
  parent.postMessage({ pluginMessage: msg }, "*");
}

export function useBridge() {
  const [status, setStatus] = useState<BridgeStatus>("connecting");
  const [latency, setLatency] = useState<number | null>(null);
  const [hasSelection, setHasSelection] = useState(false);
  const [managedMeta, setManagedMeta] = useState<ChartPluginMeta | null>(null);
  const pingStart = useRef<number | null>(null);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const msg = (event.data && event.data.pluginMessage) as PluginMessage | undefined;
      if (!msg) return;
      switch (msg.type) {
        case "plugin-ready":
          setStatus("online");
          break;
        case "pong":
          if (pingStart.current !== null) {
            setLatency(Math.max(1, Math.round(performance.now() - pingStart.current)));
            pingStart.current = null;
          }
          break;
        case "selection-changed":
          setHasSelection(msg.hasSelection);
          break;
        case "managed-selection":
          setManagedMeta(msg.meta);
          break;
        default: {
          const _exhaustive: never = msg;
          void _exhaustive;
          break;
        }
      }
    };
    window.addEventListener("message", onMessage);
    post({ type: "ui-ready" });
    // No plugin-ready after 2s → we are outside Figma.
    const fallback = window.setTimeout(() => {
      setStatus((s) => (s === "connecting" ? "preview" : s));
    }, 2000);
    return () => {
      window.removeEventListener("message", onMessage);
      window.clearTimeout(fallback);
    };
  }, []);

  const ping = useCallback(() => {
    pingStart.current = performance.now();
    post({ type: "ping" });
  }, []);

  // Measure round-trip as soon as the runtime announces itself.
  useEffect(() => {
    if (status === "online") ping();
  }, [status, ping]);

  const notify = useCallback((message: string) => {
    post({ type: "notify", message });
  }, []);

  const insertChart = useCallback(
    (payload: {
      svg: string;
      width: number;
      height: number;
      meta: ChartPluginMeta;
    }) => {
      post({ type: "insert-chart", ...payload });
    },
    []
  );

  return { status, latency, hasSelection, managedMeta, ping, notify, insertChart };
}
