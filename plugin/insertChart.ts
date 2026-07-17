import {
  PLUGIN_DATA_KEY,
  serializeMeta,
  type ChartPluginMeta
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
  align: ChartPluginMeta["titleAlign"]
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

function createLegend(meta: ChartPluginMeta): FrameNode {
  const legend = figma.createFrame();
  legend.name = "Legend";
  legend.layoutMode = "HORIZONTAL";
  legend.primaryAxisAlignItems = "MIN";
  legend.counterAxisAlignItems = "CENTER";
  legend.itemSpacing = 16;
  legend.fills = [];
  legend.layoutSizingHorizontal = "HUG";
  legend.layoutSizingVertical = "HUG";

  for (const item of meta.legendItems) {
    legend.appendChild(createLegendItem(item.name, item.color, meta.theme.ink2));
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

/**
 * Insert a named Auto Layout chart frame: Title / Plot / Legend + plugin metadata.
 */
export async function insertChart(args: {
  svg: string;
  width: number;
  height: number;
  meta: ChartPluginMeta;
}): Promise<FrameNode> {
  const { svg, width, height, meta } = args;
  await loadFonts();

  const root = figma.createFrame();
  root.name = `Chart / ${meta.title.trim() || "Untitled"}`;
  root.layoutMode = "VERTICAL";
  root.primaryAxisAlignItems = "MIN";
  root.counterAxisAlignItems = alignFromTitle(meta.titleAlign);
  root.itemSpacing = 12;
  root.paddingTop = 16;
  root.paddingBottom = 16;
  root.paddingLeft = 16;
  root.paddingRight = 16;
  root.fills = [solidPaint(meta.theme.surface)];
  root.strokes = [];
  root.cornerRadius = 0;
  root.layoutSizingHorizontal = "HUG";
  root.layoutSizingVertical = "HUG";

  const showLegend = meta.showLegend && meta.legendItems.length > 0;
  const legendTop = showLegend && meta.legendPosition === "top";
  const legendBottom = showLegend && meta.legendPosition === "bottom";

  if (meta.showTitle && meta.title.trim() !== "") {
    const title = figma.createText();
    title.name = "Title";
    title.fontName = { family: "Inter", style: "Medium" };
    title.fontSize = 14;
    title.characters = meta.title;
    title.fills = [solidPaint(meta.theme.ink)];
    title.textAlignHorizontal =
      meta.titleAlign === "left" ? "LEFT" : meta.titleAlign === "right" ? "RIGHT" : "CENTER";
    title.layoutSizingHorizontal = "FILL";
    root.appendChild(title);
  }

  if (legendTop) {
    root.appendChild(createLegend(meta));
  }

  root.appendChild(buildPlot(svg, width, height));

  if (legendBottom) {
    root.appendChild(createLegend(meta));
  }

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
