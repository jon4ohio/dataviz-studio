import type { PluginMessage, UIMessage } from "../shared/messages";
import { UI_SIZE } from "../shared/uiLayout";
import { PLUGIN_DATA_KEY, parseMeta } from "../domain/persistence";
import { hasSelection, onSelectionChange } from "./selection";
import { insertChart, updateChart } from "./insertChart";

const send = (msg: PluginMessage) => figma.ui.postMessage(msg);

function emitSelectionState(): void {
  send({ type: "selection-changed", hasSelection: hasSelection() });
  const node = figma.currentPage.selection[0];
  if (!node) {
    send({ type: "managed-selection", meta: null });
    return;
  }
  const raw = node.getPluginData(PLUGIN_DATA_KEY);
  send({ type: "managed-selection", meta: parseMeta(raw) });
}

figma.showUI(__html__, {
  width: UI_SIZE.workbench.width,
  height: UI_SIZE.workbench.height,
  themeColors: true
});

figma.ui.onmessage = (msg: UIMessage) => {
  switch (msg.type) {
    case "ui-ready":
      send({ type: "plugin-ready" });
      emitSelectionState();
      break;
    case "ping":
      send({ type: "pong" });
      break;
    case "notify":
      figma.notify(msg.message);
      break;
    case "resize-ui":
      figma.ui.resize(msg.width, msg.height);
      break;
    case "insert-chart":
      void insertChart({
        svg: msg.svg,
        width: msg.width,
        height: msg.height,
        meta: msg.meta,
        chrome: msg.chrome
      }).then(() => emitSelectionState());
      break;
    case "update-chart": {
      const node = figma.currentPage.selection[0];
      if (!node || node.type !== "FRAME") {
        figma.notify("Select a managed chart to update");
        break;
      }
      const existing = parseMeta(node.getPluginData(PLUGIN_DATA_KEY));
      if (!existing) {
        figma.notify("Selection is not a managed DataViz chart");
        break;
      }
      void updateChart(node, {
        svg: msg.svg,
        width: msg.width,
        height: msg.height,
        meta: msg.meta,
        chrome: msg.chrome
      }).then(() => emitSelectionState());
      break;
    }
    default: {
      const _exhaustive: never = msg;
      void _exhaustive;
      break;
    }
  }
};

onSelectionChange(() => emitSelectionState());
