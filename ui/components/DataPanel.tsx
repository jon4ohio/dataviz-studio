import { useEffect, useState } from "react";
import {
  CANVAS_THEMES,
  CATEGORIES,
  MAX_SERIES,
  parseValues,
  type SampleChartType,
  type SampleState,
  type SeriesMark
} from "../sample";

interface Props {
  state: SampleState;
  onSetChartType: (type: SampleChartType) => void;
  onRenameSeries: (id: string, name: string) => void;
  onToggleSeries: (id: string) => void;
  onSetSeriesMark: (id: string, mark: SeriesMark) => void;
  onSetSeriesValues: (id: string, values: number[]) => void;
  onCycleSeriesColor: (id: string) => void;
  onAddSeries: () => void;
  onRemoveSeries: (id: string) => void;
  onRandomize: () => void;
}

const TYPE_GLYPHS: Record<SampleChartType, JSX.Element> = {
  line: (
    <polyline
      points="1,11 7,4 13,8 21,2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  column: (
    <g fill="currentColor">
      <rect x="1" y="7" width="4" height="6" rx="1" />
      <rect x="7" y="3" width="4" height="10" rx="1" />
      <rect x="13" y="9" width="4" height="4" rx="1" />
      <rect x="19" y="5" width="4" height="8" rx="1" />
    </g>
  ),
  bar: (
    <g fill="currentColor">
      <rect x="1" y="1" width="16" height="3.4" rx="1.2" />
      <rect x="1" y="5.8" width="22" height="3.4" rx="1.2" />
      <rect x="1" y="10.6" width="10" height="3.4" rx="1.2" />
    </g>
  ),
  area: <path d="M1 12 L7 5 L13 8 L21 2 L21 13 L1 13 Z" fill="currentColor" opacity="0.75" />,
  scatter: (
    <g fill="currentColor">
      <circle cx="4" cy="10" r="2" />
      <circle cx="10" cy="4" r="2" />
      <circle cx="15" cy="8" r="2" />
      <circle cx="20" cy="3" r="2" />
    </g>
  ),
  mixed: (
    <g>
      <rect x="2" y="6" width="4" height="7" rx="1" fill="currentColor" opacity="0.55" />
      <rect x="9" y="3" width="4" height="10" rx="1" fill="currentColor" opacity="0.55" />
      <polyline
        points="1,9 8,3 15,7 22,2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  ),
  pie: (
    <g>
      <circle cx="12" cy="7" r="6" fill="currentColor" opacity="0.55" />
      <path d="M12 7 L12 1 A6 6 0 0 1 17.6 9 Z" fill="currentColor" />
    </g>
  ),
  doughnut: (
    <circle cx="12" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="3" />
  )
};

const TYPE_NAMES: Record<SampleChartType, string> = {
  line: "Line",
  column: "Column",
  bar: "Bar",
  area: "Area",
  scatter: "Scatter",
  mixed: "Mixed",
  pie: "Pie",
  doughnut: "Doughnut"
};

const MARK_NAMES: Record<SeriesMark, string> = {
  column: "Column",
  line: "Line",
  scatter: "Scatter"
};

/** Editable value list — commits on blur or Enter, reverts on bad input. */
function ValuesField({
  id,
  values,
  onCommit
}: {
  id: string;
  values: number[];
  onCommit: (values: number[]) => void;
}) {
  const [draft, setDraft] = useState(values.join(", "));
  useEffect(() => {
    setDraft(values.join(", "));
  }, [values]);

  const commit = () => {
    const parsed = parseValues(draft, CATEGORIES.length);
    if (parsed) onCommit(parsed);
    else setDraft(values.join(", "));
  };

  return (
    <input
      className="values-input"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
      }}
      aria-label={`Values for series ${id}`}
      spellCheck={false}
    />
  );
}

export function DataPanel(props: Props) {
  const { state } = props;
  const palette = CANVAS_THEMES[state.canvasTheme].series;
  const radial = state.chartType === "pie" || state.chartType === "doughnut";

  return (
    <aside className="panel panel-data" aria-label="Data">
      <p className="eyebrow">Data</p>

      <div className="field-group">
        <p className="field-label">Chart type</p>
        <div className="type-grid" role="radiogroup" aria-label="Chart type">
          {(Object.keys(TYPE_NAMES) as SampleChartType[]).map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={state.chartType === t}
              className={`type-button${state.chartType === t ? " is-selected" : ""}`}
              onClick={() => props.onSetChartType(t)}
            >
              <svg width="24" height="14" viewBox="0 0 24 14" aria-hidden="true">
                {TYPE_GLYPHS[t]}
              </svg>
              {TYPE_NAMES[t]}
            </button>
          ))}
        </div>
      </div>

      <div className="field-group">
        <div className="field-row">
          <p className="field-label">Series</p>
          <button type="button" className="button-ghost" onClick={props.onRandomize}>
            Randomize
          </button>
        </div>

        {state.series.map((s, index) => (
          <div key={s.id} className={`series-card${s.visible ? "" : " is-off"}`}>
            <div className="series-head">
              <button
                type="button"
                className="series-swatch"
                style={{ background: palette[s.slot % palette.length] }}
                onClick={() => props.onCycleSeriesColor(s.id)}
                title="Next palette color"
                aria-label={`Change color of ${s.name}`}
              />
              <input
                className="series-name"
                value={s.name}
                onChange={(e) => props.onRenameSeries(s.id, e.target.value)}
                aria-label={`Series ${index + 1} name`}
              />
              {state.chartType === "mixed" && (
                <select
                  className="mini-select"
                  value={s.mark}
                  onChange={(e) => props.onSetSeriesMark(s.id, e.target.value as SeriesMark)}
                  aria-label={`Mark type for ${s.name}`}
                >
                  {(Object.keys(MARK_NAMES) as SeriesMark[]).map((m) => (
                    <option key={m} value={m}>
                      {MARK_NAMES[m]}
                    </option>
                  ))}
                </select>
              )}
              <button
                type="button"
                className="icon-button"
                onClick={() => props.onRemoveSeries(s.id)}
                disabled={state.series.length === 1}
                title="Remove series"
                aria-label={`Remove ${s.name}`}
              >
                ×
              </button>
            </div>
            <div className="series-body">
              <ValuesField id={s.id} values={s.values} onCommit={(v) => props.onSetSeriesValues(s.id, v)} />
              <label className="series-toggle">
                <input type="checkbox" checked={s.visible} onChange={() => props.onToggleSeries(s.id)} />
                Show
              </label>
            </div>
          </div>
        ))}

        {state.series.length < MAX_SERIES ? (
          <button type="button" className="add-series" onClick={props.onAddSeries}>
            + Add series
          </button>
        ) : (
          <p className="footnote">Four series is the validated maximum for color-safe charts.</p>
        )}

        <p className="footnote">
          {radial
            ? `${TYPE_NAMES[state.chartType]} charts read the first visible series; slices are the ${CATEGORIES.length} categories.`
            : "Sample data — the data table editor arrives in Milestone 4."}
        </p>
      </div>
    </aside>
  );
}
