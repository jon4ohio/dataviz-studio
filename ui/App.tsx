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
import { sampleStateToVisualizationSpec } from "./sampleToSpec";
import { getVisualizationKind } from "@domain/schema";
import { buildSampleMeta } from "@domain/persistence";
import type { ShellMode } from "@shared/uiLayout";
import { legendItemsForExport, renderSampleSvg } from "./exportSvg";
import { TopBar } from "./components/TopBar";
import { MinimizedCard } from "./components/MinimizedCard";
import { DataPanel } from "./components/DataPanel";
import { PreviewStage } from "./components/PreviewStage";
import { StylePanel } from "./components/StylePanel";

const BLUR_MINIMIZE_MS = 150;

export function App() {
  const bridge = useBridge();
  const [state, setState] = useState<SampleState>(INITIAL_STATE);
  const [shellMode, setShellMode] = useState<ShellMode>("workbench");
  const shellModeRef = useRef(shellMode);
  /** Skip one managed-selection expand after export (insert selects the new chart). */
  const skipManagedExpandRef = useRef(false);
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
    if (next === null || shellModeRef.current !== "minimized") return;
    if (skipManagedExpandRef.current) {
      skipManagedExpandRef.current = false;
      return;
    }
    expand();
  }, [bridge.managedMeta, expand]);

  const patch = (p: Partial<SampleState>) => setState((s) => ({ ...s, ...p }));

  /** Canonical model binding — preview still sample SVG until SPEC-004. */
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

    const { svg, width, height } = renderSampleSvg(state);
    const theme = CANVAS_THEMES[state.canvasTheme];
    const meta = buildSampleMeta({
      title: state.title,
      showTitle: state.showTitle,
      titleAlign: state.titleAlign,
      showLegend: state.showLegend,
      legendPosition: state.legendPosition,
      chartType: state.chartType,
      width: clampSize(state.width, SIZE_LIMITS.minW, SIZE_LIMITS.maxW),
      height: clampSize(state.height, SIZE_LIMITS.minH, SIZE_LIMITS.maxH),
      theme: { surface: theme.surface, ink: theme.ink, ink2: theme.ink2 },
      legendItems: legendItemsForExport(state),
      sampleState: state
    });

    bridge.insertChart({ svg, width, height, meta });
    skipManagedExpandRef.current = true;
    minimize();
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
          onToggleSeries={(id) => updateSeries(id, (s) => ({ ...s, visible: !s.visible }))}
        />
        <StylePanel state={state} onChange={patch} />
      </main>
    </div>
  );
}
