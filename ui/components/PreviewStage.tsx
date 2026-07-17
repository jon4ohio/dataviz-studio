import { useEffect, useRef, useState, type MouseEvent } from "react";
import type { VisualizationSpec } from "@domain/schema";
import { echartsRenderer, type RenderResult } from "@domain/renderers";
import { CANVAS_THEMES, CATEGORIES, SIZE_LIMITS, clampSize, type SampleState } from "../sample";
import { SampleChart, type CartesianType, type VisibleSeries } from "./SampleChart";
import { RadialChart } from "./RadialChart";

interface Props {
  state: SampleState;
  visualizationSpec: VisualizationSpec;
  onToggleSeries: (id: string) => void;
}

export function PreviewStage({ state, visualizationSpec, onToggleSeries }: Props) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  /** Renderer-agnostic preview contract state (bar path). */
  const [previewResult, setPreviewResult] = useState<RenderResult | null>(null);
  const [previewPending, setPreviewPending] = useState(false);
  const renderGenerationRef = useRef(0);

  const theme = CANVAS_THEMES[state.canvasTheme];
  const radial = state.chartType === "pie" || state.chartType === "doughnut";
  const usePlatformRenderer = state.chartType === "bar";
  const chartW = clampSize(state.width, SIZE_LIMITS.minW, SIZE_LIMITS.maxW);
  const chartH = clampSize(state.height, SIZE_LIMITS.minH, SIZE_LIMITS.maxH);

  // Color follows the entity: each series keeps its palette slot even when
  // siblings are hidden — a toggle must never repaint the survivors.
  const visible: VisibleSeries[] = state.series
    .filter((s) => s.visible)
    .map((data) => ({ data, color: theme.series[data.slot % theme.series.length] }));
  const radialSeries = visible.length > 0 ? visible[0].data : null;

  useEffect(() => {
    if (!usePlatformRenderer) {
      setPreviewResult(null);
      setPreviewPending(false);
      return;
    }

    const generation = ++renderGenerationRef.current;
    let cancelled = false;
    setPreviewPending(true);

    void echartsRenderer.render(visualizationSpec).then((result) => {
      // Only the latest VisualizationSpec render may update preview state.
      if (cancelled || generation !== renderGenerationRef.current) return;
      setPreviewResult(result);
      setPreviewPending(false);
    });

    return () => {
      cancelled = true;
    };
  }, [usePlatformRenderer, visualizationSpec]);

  const trackCursor = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setCursor({
      x: Math.min(event.clientX - rect.left + 14, rect.width - 180),
      y: Math.min(event.clientY - rect.top + 14, rect.height - 90)
    });
  };

  let readoutLeft: string;
  if (usePlatformRenderer) {
    if (previewPending && !previewResult) {
      readoutLeft = "RENDERER · PENDING";
    } else if (previewResult?.success) {
      readoutLeft = `RENDERER · ${previewResult.renderer.toUpperCase()} · BAR`;
    } else if (previewResult && !previewResult.success) {
      readoutLeft = "RENDERER · PREVIEW UNAVAILABLE";
    } else {
      readoutLeft = "RENDERER · BAR";
    }
  } else if (radial && radialSeries) {
    readoutLeft = `SAMPLE RENDERER · SERIES ${radialSeries.name.toUpperCase()}`;
  } else {
    readoutLeft = "SAMPLE RENDERER";
  }

  let readoutRight = `${chartW}×${chartH} · ${state.chartType.toUpperCase()}`;
  if (!usePlatformRenderer && hoverIndex !== null) {
    if (radial && radialSeries) {
      const total = Math.max(1, radialSeries.values.reduce((a, b) => a + b, 0));
      const v = radialSeries.values[hoverIndex];
      readoutRight = `${CATEGORIES[hoverIndex]} · ${v} (${Math.round((v / total) * 100)}%)`;
    } else {
      readoutRight = `${CATEGORIES[hoverIndex]} · ${visible
        .map((s) => `${s.data.name} ${s.data.values[hoverIndex]}`)
        .join(" · ")}`;
    }
  }

  const legend = state.showLegend && (radial ? radialSeries !== null : visible.length >= 2) && (
    <ul className="legend">
      {radial
        ? CATEGORIES.map((c, i) => (
            <li key={c}>
              <span className="legend-item" style={{ color: theme.ink2 }}>
                <span
                  className="legend-chip"
                  style={{ background: theme.series[i % theme.series.length] }}
                />
                {c}
              </span>
            </li>
          ))
        : state.series.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className={`legend-item${s.visible ? "" : " is-off"}`}
                style={{ color: theme.ink2 }}
                onClick={() => onToggleSeries(s.id)}
                aria-pressed={s.visible}
              >
                <span
                  className="legend-chip"
                  style={{ background: theme.series[s.slot % theme.series.length] }}
                />
                {s.name}
              </button>
            </li>
          ))}
    </ul>
  );

  const tooltip = hoverIndex !== null && (radial ? radialSeries !== null : visible.length > 0) && (
    <div
      className="tooltip"
      style={{
        left: cursor.x,
        top: cursor.y,
        background: theme.surface,
        borderColor: theme.grid,
        color: theme.ink2
      }}
    >
      <p className="tooltip-head" style={{ color: theme.ink }}>
        {CATEGORIES[hoverIndex]}
      </p>
      {radial && radialSeries ? (
        <p className="tooltip-row">
          <span
            className="legend-chip"
            style={{ background: theme.series[hoverIndex % theme.series.length] }}
          />
          <span className="tooltip-name">{radialSeries.name}</span>
          <span className="tooltip-value" style={{ color: theme.ink }}>
            {radialSeries.values[hoverIndex]}
          </span>
        </p>
      ) : (
        visible.map((s) => (
          <p key={s.data.id} className="tooltip-row">
            <span className="legend-chip" style={{ background: s.color }} />
            <span className="tooltip-name">{s.data.name}</span>
            <span className="tooltip-value" style={{ color: theme.ink }}>
              {s.data.values[hoverIndex]}
            </span>
          </p>
        ))
      )}
    </div>
  );

  const platformPreview = usePlatformRenderer && (
    <div className="plot-canvas" style={{ maxWidth: chartW }}>
      {previewPending && !previewResult ? (
        <div className="plot-empty" style={{ color: theme.ink2, width: chartW, height: chartH }}>
          <p>Rendering preview…</p>
        </div>
      ) : previewResult?.success ? (
        <div
          className="platform-preview-svg"
          style={{ width: chartW, height: chartH }}
          dangerouslySetInnerHTML={{ __html: previewResult.svg }}
        />
      ) : (
        <div className="plot-empty" style={{ color: theme.ink2, width: chartW, height: chartH }}>
          <p>Preview unavailable</p>
          {previewResult?.warnings.map((w) => (
            <p key={w.code}>{w.message}</p>
          ))}
        </div>
      )}
    </div>
  );

  const samplePreview =
    visible.length === 0 ? (
      <div className="plot-empty" style={{ color: theme.ink2 }}>
        <p>All series are hidden.</p>
        <p>Turn one on in the Data panel to see the preview.</p>
      </div>
    ) : (
      <div className="plot-canvas" style={{ maxWidth: chartW }}>
        {radial && radialSeries ? (
          <RadialChart
            series={radialSeries}
            doughnut={state.chartType === "doughnut"}
            theme={theme}
            width={chartW}
            height={chartH}
            valueLabels={state.valueLabels}
            hoverIndex={hoverIndex}
            onHover={setHoverIndex}
          />
        ) : (
          <SampleChart
            type={state.chartType as CartesianType}
            series={visible}
            theme={theme}
            width={chartW}
            height={chartH}
            showXAxis={state.showXAxis}
            showYAxis={state.showYAxis}
            showGrid={state.showGrid}
            smooth={state.smooth}
            stacked={state.stacked}
            valueLabels={state.valueLabels}
            hoverIndex={hoverIndex}
            onHover={setHoverIndex}
          />
        )}
      </div>
    );

  return (
    <section className="stage" aria-label="Preview">
      <div
        className="plot-bed"
        style={{ background: theme.surface, borderColor: theme.grid }}
        data-canvas={state.canvasTheme}
      >
        <span className="crop crop-tl" aria-hidden="true" />
        <span className="crop crop-tr" aria-hidden="true" />
        <span className="crop crop-bl" aria-hidden="true" />
        <span className="crop crop-br" aria-hidden="true" />

        <div className="plot-body" onMouseMove={usePlatformRenderer ? undefined : trackCursor}>
          {!usePlatformRenderer && state.showTitle && state.title.trim() !== "" && (
            <h2 className="plot-title" style={{ color: theme.ink, textAlign: state.titleAlign }}>
              {state.title}
            </h2>
          )}

          {!usePlatformRenderer && state.legendPosition === "top" && legend}

          {usePlatformRenderer ? platformPreview : samplePreview}

          {!usePlatformRenderer && state.legendPosition === "bottom" && legend}
          {!usePlatformRenderer && tooltip}
        </div>

        <div className="readout" style={{ borderColor: theme.grid, color: theme.muted }}>
          <span>{readoutLeft}</span>
          <span>{readoutRight}</span>
        </div>
      </div>
    </section>
  );
}
