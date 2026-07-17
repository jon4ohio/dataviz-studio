import {
  PLUGIN_DATA_KEY,
  serializeMeta,
  type ChartPluginMeta,
  type DocumentProjectionChrome
} from "../domain/persistence";

function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "").trim();
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return {
    r: parseInt(full.slice(0, 2), 16) / 255,
    g: parseInt(full.slice(2, 4), 16) / 255,
    b: parseInt(full.slice(4, 6), 16) / 255
  };
}

function solidPaint(hex: string): SolidPaint {
  return { type: "SOLID", color: hexToRgb(hex) };
}

function alignFromTitle(
  align: DocumentProjectionChrome["titleAlign"]
): "MIN" | "CENTER" | "MAX" {
  switch (align) {
    case "left":
      return "MIN";
    case "center":
      return "CENTER";
    case "right":
      return "MAX";
    default: {
      const _exhaustive: never = align;
      return _exhaustive;
    }
  }
}

async function loadFonts(): Promise<void> {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
}

function createSwatch(color: string): FrameNode {
  const swatch = figma.createFrame();
  swatch.name = "Swatch";
  swatch.resize(10, 10);
  swatch.fills = [solidPaint(color)];
  swatch.cornerRadius = 2;
  swatch.layoutSizingHorizontal = "FIXED";
  swatch.layoutSizingVertical = "FIXED";
  return swatch;
}

function createLegendItem(name: string, color: string, ink2: string): FrameNode {
  const row = figma.createFrame();
  row.name = `Series · ${name}`;
  row.layoutMode = "HORIZONTAL";
  row.primaryAxisAlignItems = "CENTER";
  row.counterAxisAlignItems = "CENTER";
  row.itemSpacing = 6;
  row.fills = [];
  row.layoutSizingHorizontal = "HUG";
  row.layoutSizingVertical = "HUG";

  row.appendChild(createSwatch(color));

  const label = figma.createText();
  label.name = "Label";
  label.fontName = { family: "Inter", style: "Regular" };
  label.fontSize = 11;
  label.characters = name;
  label.fills = [solidPaint(ink2)];
  row.appendChild(label);

  return row;
}

function createLegend(chrome: DocumentProjectionChrome): FrameNode {
  const legend = figma.createFrame();
  legend.name = "Legend";
  legend.layoutMode = "HORIZONTAL";
  legend.primaryAxisAlignItems = "MIN";
  legend.counterAxisAlignItems = "CENTER";
  legend.itemSpacing = 16;
  legend.fills = [];
  legend.layoutSizingHorizontal = "HUG";
  legend.layoutSizingVertical = "HUG";

  for (const item of chrome.legendItems) {
    legend.appendChild(createLegendItem(item.name, item.color, chrome.theme.ink2));
  }

  return legend;
}

function buildPlot(svg: string, width: number, height: number): FrameNode {
  const plot = figma.createFrame();
  plot.name = "Plot";
  plot.resize(width, height);
  plot.fills = [];
  plot.clipsContent = true;
  plot.layoutMode = "NONE";
  plot.layoutSizingHorizontal = "FIXED";
  plot.layoutSizingVertical = "FIXED";

  const svgRoot = figma.createNodeFromSvg(svg);
  svgRoot.name = "SVG";

  // Prefer moving the SVG frame into Plot when sizes match; otherwise reparent children.
  if (Math.abs(svgRoot.width - width) < 1 && Math.abs(svgRoot.height - height) < 1) {
    plot.appendChild(svgRoot);
    svgRoot.x = 0;
    svgRoot.y = 0;
  } else {
    const children = [...svgRoot.children];
    for (const child of children) {
      plot.appendChild(child);
    }
    svgRoot.remove();
  }

  return plot;
}

function applyChromeLayout(root: FrameNode, chrome: DocumentProjectionChrome): void {
  root.layoutMode = "VERTICAL";
  root.primaryAxisAlignItems = "MIN";
  root.counterAxisAlignItems = alignFromTitle(chrome.titleAlign);
  root.itemSpacing = 12;
  root.paddingTop = 16;
  root.paddingBottom = 16;
  root.paddingLeft = 16;
  root.paddingRight = 16;
  root.fills = [solidPaint(chrome.theme.surface)];
  root.strokes = [];
  root.cornerRadius = 0;
  root.layoutSizingHorizontal = "HUG";
  root.layoutSizingVertical = "HUG";
}

function populateProjection(
  root: FrameNode,
  svg: string,
  width: number,
  height: number,
  chrome: DocumentProjectionChrome
): void {
  root.name = `Chart / ${chrome.title.trim() || "Untitled"}`;
  applyChromeLayout(root, chrome);

  const showLegend = chrome.showLegend && chrome.legendItems.length > 0;
  const legendTop = showLegend && chrome.legendPosition === "top";
  const legendBottom = showLegend && chrome.legendPosition === "bottom";

  if (chrome.showTitle && chrome.title.trim() !== "") {
    const title = figma.createText();
    title.name = "Title";
    title.fontName = { family: "Inter", style: "Medium" };
    title.fontSize = 14;
    title.characters = chrome.title;
    title.fills = [solidPaint(chrome.theme.ink)];
    title.textAlignHorizontal =
      chrome.titleAlign === "left" ? "LEFT" : chrome.titleAlign === "right" ? "RIGHT" : "CENTER";
    title.layoutSizingHorizontal = "FILL";
    root.appendChild(title);
  }

  if (legendTop) {
    root.appendChild(createLegend(chrome));
  }

  root.appendChild(buildPlot(svg, width, height));

  if (legendBottom) {
    root.appendChild(createLegend(chrome));
  }
}

export type ProjectChartArgs = {
  svg: string;
  width: number;
  height: number;
  meta: ChartPluginMeta;
  chrome: DocumentProjectionChrome;
};

/**
 * Insert a Document Projection: Auto Layout chrome + plot SVG + semantic plugin metadata.
 * The Figma node is a cached projection of VisualizationSpec — never the source of truth.
 */
export async function insertChart(args: ProjectChartArgs): Promise<FrameNode> {
  const { svg, width, height, meta, chrome } = args;
  await loadFonts();

  const root = figma.createFrame();
  populateProjection(root, svg, width, height, chrome);
  root.setPluginData(PLUGIN_DATA_KEY, serializeMeta(meta));

  const center = figma.viewport.center;
  root.x = center.x - root.width / 2;
  root.y = center.y - root.height / 2;

  figma.currentPage.appendChild(root);
  figma.currentPage.selection = [root];
  figma.viewport.scrollAndZoomIntoView([root]);
  figma.notify("Chart inserted");

  return root;
}

/**
 * Replace the Document Projection under an existing managed root (preserve identity).
 */
export async function updateChart(
  root: FrameNode,
  args: Omit<ProjectChartArgs, "meta"> & { meta: ChartPluginMeta }
): Promise<FrameNode> {
  const { svg, width, height, meta, chrome } = args;
  await loadFonts();

  for (const child of [...root.children]) {
    child.remove();
  }

  populateProjection(root, svg, width, height, chrome);
  root.setPluginData(PLUGIN_DATA_KEY, serializeMeta(meta));

  figma.currentPage.selection = [root];
  figma.notify("Chart updated");

  return root;
}
