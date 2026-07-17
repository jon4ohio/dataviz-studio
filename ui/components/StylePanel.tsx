import {
  CANVAS_THEMES,
  SIZE_LIMITS,
  clampSize,
  type SampleState,
  type ValueLabels
} from "../sample";

interface Props {
  state: SampleState;
  onChange: (patch: Partial<SampleState>) => void;
}

const LABEL_MODES: { value: ValueLabels; name: string }[] = [
  { value: "none", name: "None" },
  { value: "ends", name: "Ends" },
  { value: "all", name: "All" }
];

export function StylePanel({ state, onChange }: Props) {
  const palette = CANVAS_THEMES[state.canvasTheme].series;
  const radial = state.chartType === "pie" || state.chartType === "doughnut";
  const canSmooth = ["line", "area", "mixed"].includes(state.chartType);
  const canStack = ["column", "area"].includes(state.chartType);

  // Free typing while focused; clamp to the valid range on blur (the
  // preview clamps independently, so transient values never break it).
  const editSize = (key: "width" | "height", raw: string) => {
    const n = Number(raw);
    if (Number.isFinite(n)) onChange({ [key]: n });
  };
  const clampOnBlur = (key: "width" | "height") => {
    const clamped =
      key === "width"
        ? clampSize(state.width, SIZE_LIMITS.minW, SIZE_LIMITS.maxW)
        : clampSize(state.height, SIZE_LIMITS.minH, SIZE_LIMITS.maxH);
    onChange({ [key]: clamped });
  };

  return (
    <aside className="panel panel-style" aria-label="Style">
      <p className="eyebrow">Style</p>

      <div className="field-group">
        <p className="field-label">Title</p>
        <input
          className="text-input"
          value={state.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Chart title"
          aria-label="Chart title"
        />
        <label className="check-row">
          <input
            type="checkbox"
            checked={state.showTitle}
            onChange={(e) => onChange({ showTitle: e.target.checked })}
          />
          Show title
        </label>
        <div className="segmented seg-sm" role="radiogroup" aria-label="Title alignment">
          {(["left", "center", "right"] as const).map((align) => (
            <button
              key={align}
              type="button"
              role="radio"
              aria-checked={state.titleAlign === align}
              className={state.titleAlign === align ? "is-selected" : ""}
              onClick={() => onChange({ titleAlign: align })}
              disabled={!state.showTitle}
            >
              {align[0].toUpperCase() + align.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="field-group">
        <p className="field-label">Legend</p>
        <label className="check-row">
          <input
            type="checkbox"
            checked={state.showLegend}
            onChange={(e) => onChange({ showLegend: e.target.checked })}
          />
          Show legend
        </label>
        <div className="segmented seg-sm" role="radiogroup" aria-label="Legend position">
          {(["top", "bottom"] as const).map((pos) => (
            <button
              key={pos}
              type="button"
              role="radio"
              aria-checked={state.legendPosition === pos}
              className={state.legendPosition === pos ? "is-selected" : ""}
              onClick={() => onChange({ legendPosition: pos })}
              disabled={!state.showLegend}
            >
              {pos === "top" ? "Top" : "Bottom"}
            </button>
          ))}
        </div>
      </div>

      <div className={`field-group${radial ? " is-disabled" : ""}`}>
        <p className="field-label">Axes</p>
        <label className="check-row">
          <input
            type="checkbox"
            checked={state.showXAxis}
            disabled={radial}
            onChange={(e) => onChange({ showXAxis: e.target.checked })}
          />
          X axis labels
        </label>
        <label className="check-row">
          <input
            type="checkbox"
            checked={state.showYAxis}
            disabled={radial}
            onChange={(e) => onChange({ showYAxis: e.target.checked })}
          />
          Y axis labels
        </label>
        <label className="check-row">
          <input
            type="checkbox"
            checked={state.showGrid}
            disabled={radial}
            onChange={(e) => onChange({ showGrid: e.target.checked })}
          />
          Gridlines
        </label>
      </div>

      <div className="field-group">
        <p className="field-label">Marks</p>
        <p className="field-sublabel">Value labels</p>
        <div className="segmented seg-sm" role="radiogroup" aria-label="Value labels">
          {LABEL_MODES.map((mode) => (
            <button
              key={mode.value}
              type="button"
              role="radio"
              aria-checked={state.valueLabels === mode.value}
              className={state.valueLabels === mode.value ? "is-selected" : ""}
              onClick={() => onChange({ valueLabels: mode.value })}
            >
              {mode.name}
            </button>
          ))}
        </div>
        <label className={`check-row${canSmooth ? "" : " is-disabled"}`}>
          <input
            type="checkbox"
            checked={state.smooth}
            disabled={!canSmooth}
            onChange={(e) => onChange({ smooth: e.target.checked })}
          />
          Smooth lines
        </label>
        <label className={`check-row${canStack ? "" : " is-disabled"}`}>
          <input
            type="checkbox"
            checked={state.stacked}
            disabled={!canStack}
            onChange={(e) => onChange({ stacked: e.target.checked })}
          />
          Stack series
        </label>
      </div>

      <div className="field-group">
        <p className="field-label">Canvas</p>
        <div className="segmented" role="radiogroup" aria-label="Canvas theme">
          {(["light", "dark"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              role="radio"
              aria-checked={state.canvasTheme === mode}
              className={state.canvasTheme === mode ? "is-selected" : ""}
              onClick={() => onChange({ canvasTheme: mode })}
            >
              {mode === "light" ? "Light" : "Dark"}
            </button>
          ))}
        </div>
        <div className="size-row">
          <label>
            <span className="field-sublabel">Width</span>
            <input
              className="text-input"
              type="number"
              min={SIZE_LIMITS.minW}
              max={SIZE_LIMITS.maxW}
              value={state.width}
              onChange={(e) => editSize("width", e.target.value)}
              onBlur={() => clampOnBlur("width")}
            />
          </label>
          <label>
            <span className="field-sublabel">Height</span>
            <input
              className="text-input"
              type="number"
              min={SIZE_LIMITS.minH}
              max={SIZE_LIMITS.maxH}
              value={state.height}
              onChange={(e) => editSize("height", e.target.value)}
              onBlur={() => clampOnBlur("height")}
            />
          </label>
        </div>
      </div>

      <div className="field-group">
        <p className="field-label">Palette</p>
        <div className="palette-row">
          {state.series.map((s) => (
            <div key={s.id} className="palette-slot">
              <span
                className="palette-swatch"
                style={{ background: palette[s.slot % palette.length] }}
              />
              <span className="palette-name">{s.name}</span>
            </div>
          ))}
        </div>
        <p className="footnote">
          Validated for color-vision safety on both canvases. Palette memory arrives in Milestone 6.
        </p>
      </div>
    </aside>
  );
}
