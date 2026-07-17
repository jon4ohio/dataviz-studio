import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useBridge } from "./bridge";
import {
  CANVAS_THEMES,
  CATEGORIES,
  INITIAL_STATE,
  MAX_SERIES,
  SIZE_LIMITS,
  clampSize,
  cycleSlot,
  nextFreeSlot,
  randomizeValues,
  type SampleSeries,
  type SampleState,
  type SeriesMark
} from "./sample";
import { sampleStateToVisualizationSpec, visualizationSpecToSampleState } from "./sampleToSpec";
import { getVisualizationKind } from "@domain/schema";
import { buildChartMeta, buildProjectionChrome } from "@domain/persistence";
import { echartsRenderer } from "@domain/renderers";
import type { ShellMode } from "@shared/uiLayout";
import { legendItemsForExport, renderSampleSvg } from "./exportSvg";
import { TopBar } from "./components/TopBar";
import { MinimizedCard } from "./components/MinimizedCard";
import { DataPanel } from "./components/DataPanel";
import { PreviewStage } from "./components/PreviewStage";
import { StylePanel } from "./components/StylePanel";

const BLUR_MINIMIZE_MS = 150;
const SAMPLE_RENDERER_ID = "sample-svg";
const SAMPLE_RENDERER_VERSION = "0.1.0";

export function App() {
  const bridge = useBridge();
  const [state, setState] = useState<SampleState>(INITIAL_STATE);
  const [shellMode, setShellMode] = useState<ShellMode>("workbench");
  const shellModeRef = useRef(shellMode);
  /** Skip one managed-selection expand after export (insert selects the new chart). */
  const skipManagedExpandRef = useRef(false);
  /** Spec id last restored — avoid re-hydrating on every selection tick. */
  const restoredSpecKeyRef = useRef<string | null>(null);
  const { resizeUi } = bridge;

  shellModeRef.current = shellMode;

  const applyShellMode = useCallback(
    (mode: ShellMode) => {
      if (shellModeRef.current !== mode) {
        shellModeRef.current = mode;
        setShellMode(mode);
        resizeUi(mode);
      }
    },
    [resizeUi]
  );

  const minimize = useCallback(() => applyShellMode("minimized"), [applyShellMode]);
  const expand = useCallback(() => applyShellMode("workbench"), [applyShellMode]);

  // Best-effort: collapse when focus leaves the plugin iframe (canvas click).
  useEffect(() => {
    let timer: number | undefined;
    const onBlur = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (shellModeRef.current === "workbench") minimize();
      }, BLUR_MINIMIZE_MS);
    };
    const onFocus = () => {
      window.clearTimeout(timer);
    };
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
    };
  }, [minimize]);

  // Expand when the user selects a managed chart while minimized (edit flow).
  useEffect(() => {
    const next = bridge.managedMeta;
    if (next === null) {
      restoredSpecKeyRef.current = null;
      return;
    }
    if (shellModeRef.current === "minimized") {
      if (skipManagedExpandRef.current) {
        skipManagedExpandRef.current = false;
        return;
      }
      expand();
    }
  }, [bridge.managedMeta, expand]);

  // Restoration: managed selection → VisualizationSpec → editor (never from SVG).
  useEffect(() => {
    const meta = bridge.managedMeta;
    if (!meta) {
      restoredSpecKeyRef.current = null;
      return;
    }
    const key = JSON.stringify(meta.spec);
    if (restoredSpecKeyRef.current === key) return;
    restoredSpecKeyRef.current = key;
    setState(visualizationSpecToSampleState(meta.spec));
  }, [bridge.managedMeta]);

  const patch = (p: Partial<SampleState>) => setState((s) => ({ ...s, ...p }));

  /** Canonical model binding — controls drive Spec; preview consumes RenderResult for bar. */
  const visualizationSpec = useMemo(() => sampleStateToVisualizationSpec(state), [state]);
  const registryMeta = getVisualizationKind(visualizationSpec.kind);

  const updateSeries = (id: string, update: (s: SampleSeries) => SampleSeries) =>
    setState((s) => ({
      ...s,
      series: s.series.map((sr) => (sr.id === id ? update(sr) : sr))
    }));

  const addSeries = () =>
    setState((s) => {
      if (s.series.length >= MAX_SERIES) return s;
      const next: SampleSeries = {
        id: `s-${Math.random().toString(36).slice(2, 8)}`,
        name: `Series ${s.series.length + 1}`,
        values: randomizeValues(new Array(CATEGORIES.length).fill(0)),
        visible: true,
        slot: nextFreeSlot(s.series),
        mark: "line"
      };
      return { ...s, series: [...s.series, next] };
    });

  const removeSeries = (id: string) =>
    setState((s) =>
      s.series.length <= 1 ? s : { ...s, series: s.series.filter((sr) => sr.id !== id) }
    );

  const randomize = () =>
    setState((s) => ({
      ...s,
      series: s.series.map((sr) => ({ ...sr, values: randomizeValues(sr.values) }))
    }));

  const handleExport = () => {
    if (bridge.status !== "online") {
      window.alert("Export requires the Figma plugin runtime. Open the plugin inside Figma.");
      return;
    }

    void (async () => {
      const width = clampSize(state.width, SIZE_LIMITS.minW, SIZE_LIMITS.maxW);
      const height = clampSize(state.height, SIZE_LIMITS.minH, SIZE_LIMITS.maxH);
      const theme = CANVAS_THEMES[state.canvasTheme];

      let svg: string;
      let outW: number;
      let outH: number;
      let rendererId: string;
      let rendererVersion: string;

      if (state.chartType === "bar") {
        const result = await echartsRenderer.render({
          ...visualizationSpec,
          layout: { ...visualizationSpec.layout, width, height }
        });
        if (!result.success || !result.svg) {
          const detail = result.warnings[0]?.message ?? "Renderer failed";
          window.alert(`Export failed: ${detail}`);
          return;
        }
        svg = result.svg;
        outW = result.width;
        outH = result.height;
        rendererId = result.renderer;
        rendererVersion = result.version;
      } else {
        const sample = renderSampleSvg(state);
        svg = sample.svg;
        outW = sample.width;
        outH = sample.height;
        rendererId = SAMPLE_RENDERER_ID;
        rendererVersion = SAMPLE_RENDERER_VERSION;
      }

      const specForMeta = {
        ...visualizationSpec,
        layout: { ...visualizationSpec.layout, width: outW, height: outH }
      };
      const meta = buildChartMeta({
        rendererId,
        rendererVersion,
        spec: specForMeta
      });
      const chrome = buildProjectionChrome({
        spec: specForMeta,
        showTitle: state.showTitle,
        titleAlign: state.titleAlign,
        theme: { surface: theme.surface, ink: theme.ink, ink2: theme.ink2 },
        legendItems: legendItemsForExport(state)
      });

      const mode = bridge.managedMeta !== null ? "update" : "insert";
      bridge.projectChart({ svg, width: outW, height: outH, meta, chrome }, mode);
      skipManagedExpandRef.current = true;
      minimize();
    })();
  };

  if (shellMode === "minimized") {
    return (
      <div className="app shell-minimized">
        <MinimizedCard
          title={state.title}
          status={bridge.status}
          hasSelection={bridge.hasSelection}
          managedChart={bridge.managedMeta !== null}
          onExpand={expand}
        />
      </div>
    );
  }

  return (
    <div className="app">
      <TopBar
        status={bridge.status}
        latency={bridge.latency}
        hasSelection={bridge.hasSelection}
        managedChart={bridge.managedMeta !== null}
        onPing={bridge.ping}
        onExport={handleExport}
        onMinimize={minimize}
      />
      <main className="workbench">
        <DataPanel
          state={state}
          modelKindLabel={registryMeta?.label ?? visualizationSpec.kind}
          modelFamily={registryMeta?.family ?? "cartesian"}
          onSetChartType={(chartType) => patch({ chartType })}
          onRenameSeries={(id, name) => updateSeries(id, (s) => ({ ...s, name }))}
          onToggleSeries={(id) => updateSeries(id, (s) => ({ ...s, visible: !s.visible }))}
          onSetSeriesMark={(id, mark: SeriesMark) => updateSeries(id, (s) => ({ ...s, mark }))}
          onSetSeriesValues={(id, values) => updateSeries(id, (s) => ({ ...s, values }))}
          onCycleSeriesColor={(id) =>
            setState((s) => ({
              ...s,
              series: s.series.map((sr) =>
                sr.id === id ? { ...sr, slot: cycleSlot(s.series, id) } : sr
              )
            }))
          }
          onAddSeries={addSeries}
          onRemoveSeries={removeSeries}
          onRandomize={randomize}
        />
        <PreviewStage
          state={state}
          visualizationSpec={visualizationSpec}
          onToggleSeries={(id) => updateSeries(id, (s) => ({ ...s, visible: !s.visible }))}
        />
        <StylePanel state={state} onChange={patch} />
      </main>
    </div>
  );
}
