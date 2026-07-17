import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  CANVAS_THEMES,
  CATEGORIES,
  SIZE_LIMITS,
  clampSize,
  type SampleState
} from "./sample";
import { SampleChart, type CartesianType, type VisibleSeries } from "./components/SampleChart";
import { RadialChart } from "./components/RadialChart";

const noop = (): void => undefined;

/**
 * Build a clean SVG string for canvas export — no hover overlays or interactivity.
 */
export function renderSampleSvg(state: SampleState): { svg: string; width: number; height: number } {
  const theme = CANVAS_THEMES[state.canvasTheme];
  const width = clampSize(state.width, SIZE_LIMITS.minW, SIZE_LIMITS.maxW);
  const height = clampSize(state.height, SIZE_LIMITS.minH, SIZE_LIMITS.maxH);
  const radial = state.chartType === "pie" || state.chartType === "doughnut";

  const visible: VisibleSeries[] = state.series
    .filter((s) => s.visible)
    .map((data) => ({ data, color: theme.series[data.slot % theme.series.length] }));

  let markup: string;

  if (visible.length === 0) {
    markup = renderToStaticMarkup(
      createElement(
        "svg",
        {
          xmlns: "http://www.w3.org/2000/svg",
          viewBox: `0 0 ${width} ${height}`,
          width,
          height
        },
        createElement("rect", {
          x: 0,
          y: 0,
          width,
          height,
          fill: theme.surface
        }),
        createElement(
          "text",
          {
            x: width / 2,
            y: height / 2,
            textAnchor: "middle",
            fill: theme.ink2,
            fontFamily: "ui-monospace, SF Mono, Menlo, monospace",
            fontSize: 12
          },
          "No visible series"
        )
      )
    );
  } else if (radial) {
    markup = renderToStaticMarkup(
      createElement(RadialChart, {
        series: visible[0].data,
        doughnut: state.chartType === "doughnut",
        theme,
        width,
        height,
        valueLabels: state.valueLabels,
        hoverIndex: null,
        onHover: noop
      })
    );
  } else {
    markup = renderToStaticMarkup(
      createElement(SampleChart, {
        type: state.chartType as CartesianType,
        series: visible,
        theme,
        width,
        height,
        showXAxis: state.showXAxis,
        showYAxis: state.showYAxis,
        showGrid: state.showGrid,
        smooth: state.smooth,
        stacked: state.stacked,
        valueLabels: state.valueLabels,
        hoverIndex: null,
        onHover: noop
      })
    );
  }

  const svg = ensureSvgRoot(markup, width, height, theme.surface);
  return { svg, width, height };
}

/** Legend items for the Auto Layout frame (visible series, or pie categories). */
export function legendItemsForExport(state: SampleState): { name: string; color: string }[] {
  const theme = CANVAS_THEMES[state.canvasTheme];
  const radial = state.chartType === "pie" || state.chartType === "doughnut";
  const visible = state.series.filter((s) => s.visible);

  if (radial) {
    if (visible.length === 0) return [];
    return CATEGORIES.map((name, i) => ({
      name,
      color: theme.series[i % theme.series.length]
    }));
  }

  return visible.map((s) => ({
    name: s.name,
    color: theme.series[s.slot % theme.series.length]
  }));
}

function ensureSvgRoot(markup: string, width: number, height: number, surface: string): string {
  let svg = markup.trim();
  if (!svg.startsWith("<svg")) {
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">${svg}</svg>`;
  }
  if (!/\sxmlns=/.test(svg)) {
    svg = svg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  if (!/\swidth=/.test(svg)) {
    svg = svg.replace("<svg", `<svg width="${width}"`);
  }
  if (!/\sheight=/.test(svg)) {
    svg = svg.replace("<svg", `<svg height="${height}"`);
  }
  // Solid surface behind vectors so transparent areas read as the canvas theme.
  if (!svg.includes('data-export-bg="true"')) {
    svg = svg.replace(
      /(<svg[^>]*>)/,
      `$1<rect data-export-bg="true" x="0" y="0" width="${width}" height="${height}" fill="${surface}"/>`
    );
  }
  return svg;
}
