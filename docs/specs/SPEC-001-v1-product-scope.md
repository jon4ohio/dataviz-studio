# SPEC-001: Product scope — first usable release

**Contract:** Specification  
**Problem coordinated:** What is in (and out of) the first usable DataViz Studio release, and how do architecture vs delivery stay separate?

## Requirements

### Product positioning

- Design-first **visualization platform**: visual creation, SVG-native document output, persistent editability, reusable themes, pluggable renderers behind the scenes
- Primary output: SVG on the Figma document
- Critical capability: reopen and edit inserted visualizations using stored plugin metadata
- Architecture is stable; delivery milestones add capabilities on top of it ([Architecture Contract](../architecture/contract.md))

### Included in the first usable release

- Figma plugin shell and visual editor UI (binds to `VisualizationSpec` from Milestone 2 onward)
- Canonical visualization model, validation, Visualization Registry, serialization ([SPEC-003](SPEC-003-canonical-schema.md), [ADR-001](../decisions/ADR-001-canonical-schema-source-of-truth.md))
- Apache ECharts as the **initial renderer adapter** only ([ADR-003](../decisions/ADR-003-echarts-initial-renderer-adapter.md), [SPEC-004](SPEC-004-echarts-renderer.md))
- Initial **Cartesian family**: bar, column, line, area, scatter, mixed
- Document integration: insert SVG, metadata, selection, round-trip editing ([SPEC-005](SPEC-005-document-integration.md))
- Data pipeline: manual table + CSV / paste; JSON; Excel if it does not slow delivery ([SPEC-006](SPEC-006-data-pipeline.md))
- Theme system: colors, typography, axes, legends, labels, gridlines ([SPEC-007](SPEC-007-theme-system.md))
- Editor UI that creates and edits Cartesian visualizations from the model (not a separate milestone)

### Explicitly deferred

- Additional renderer adapters (AntV G2, D3.js, first-party Cartesian engine)
- Speculative platform ownership of layout / scales / geometry (remain renderer-owned until patterns demand extraction)
- Full visualization families beyond Cartesian ([SPEC-008](SPEC-008-visualization-families.md))
- Google Sheets sync; cloud data sources
- Templates, recommendations, marketplace, AI assistance, collaboration ([EXECUTION_PLAN.md](../../EXECUTION_PLAN.md) — Future Product Experience)
- Figma Variables / design-token libraries; team theme sharing
- PNG/PDF export

### UI layout intent

**Workbench** (default, `1080×700`):

- Left: visualization type and data
- Center: live preview
- Right: styling and layout controls
- Top bar includes minimize control

**Minimized floating card** (`320×72`):

- Compact card with title, bridge/selection hint, and Expand
- Same editor state is kept while minimized (layout/chrome only changes)

| Trigger | Mode |
|---------|------|
| Minimize control | Minimized |
| Successful export to document | Minimized |
| Plugin UI blur (canvas focus; best-effort) | Minimized |
| Expand / click minimized card | Workbench |
| Managed visualization selected while minimized | Workbench |

Blur is best-effort across Figma hosts; export, manual minimize/expand, and managed-selection expand are the reliable paths. Host window position is owned by Figma (card is not canvas-draggable).

### Core user flows

**Create:** choose type → paste/edit data → adjust styles → insert into document.

**Edit existing:** select on canvas → open plugin → read metadata → restore `VisualizationSpec` → regenerate SVG after edits.

**Reuse theme / palette:** adjust colors → save → suggest recent palettes on next visualization.

### Architecture (pointer only)

Normative pipeline, ownership, and invariants live in the [Architecture Contract](../architecture/contract.md). Do not duplicate them here.

Narrow renderer interface (frozen early):

```ts
interface VisualizationRenderer {
  id: string;
  supports(type: ChartType): boolean;
  render(spec: VisualizationSpec): Promise<RenderResult>;
}
```

`RenderResult` includes at minimum: `success`, `svg`, `width`, `height`, `renderer`, `version`, `warnings` (see [SPEC-004](SPEC-004-echarts-renderer.md)).

Document metadata on inserted nodes: `VisualizationSpec`, dataset, theme id or palette, renderer id, renderer version, plugin version—not editable SVG.

Recommended modules: `plugin/`, `ui/`, `domain/schema/`, `domain/transform/`, `domain/renderers/`, `domain/theme/`, `domain/persistence/`, `domain/import/`.

## Acceptance

- [ ] First usable release deliverables above are implemented without shipping deferred adapters or Product Experience features
- [ ] Create, edit-existing, and reuse-palette flows work end to end
- [ ] Inserted visualizations reopen with data and styling preserved
- [ ] Manual minimize/expand toggles workbench ↔ floating card and resizes the plugin window in Figma
- [ ] Successful export collapses to the minimized card; editor state is preserved on expand
- [ ] Selecting a managed visualization while minimized expands to the workbench
- [ ] Platform code does not import ECharts outside the renderer adapter

## References

- [Architecture Contract](../architecture/contract.md)
- [ADR-001](../decisions/ADR-001-canonical-schema-source-of-truth.md)
- [ADR-003](../decisions/ADR-003-echarts-initial-renderer-adapter.md)
- Milestone Specs: [SPEC-002](SPEC-002-foundation.md) … [SPEC-009](SPEC-009-release-preparation.md)
- [EXECUTION_PLAN.md](../../EXECUTION_PLAN.md) — build order, testing, risks, Future Product Experience
- `shared/uiLayout.ts`, `shared/messages.ts` (`resize-ui`)
