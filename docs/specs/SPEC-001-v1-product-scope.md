# SPEC-001: V1 product scope

**Contract:** Specification  
**Problem coordinated:** What is in (and out of) the first usable DataViz Studio release?

## Requirements

### Product positioning

- Design-first visualization tool: visual chart creation, SVG-native output, persistent editability, reusable themes/color memory, engine abstraction behind the scenes
- Primary output: SVG on the Figma canvas
- Critical capability: reopen and edit inserted charts using stored plugin metadata

### Included in V1

- Figma plugin shell and visual editor UI
- Canonical visualization schema (see [SPEC-003](SPEC-003-canonical-schema.md), [ADR-001](../decisions/ADR-001-canonical-schema-source-of-truth.md))
- ECharts renderer with SVG output only ([ADR-002](../decisions/ADR-002-v1-echarts-only.md))
- Chart types: line, bar, area, pie, doughnut, scatter, mixed
- Manual data table editor; CSV paste/import
- Styling: colors, typography, axes, legends, labels, gridlines, border radius where applicable
- Color memory and saved palettes
- Insert SVG onto canvas; reopen/edit via plugin metadata

### Explicitly deferred from V1

- AntV G2 integration; D3.js integration
- Google Sheets sync
- Excel file parsing beyond paste/import if it slows V1
- Templates marketplace; AI chart recommendations
- Team sharing and cloud sync; PNG/PDF export

### UI layout intent

- Left: chart type and data
- Center: live preview
- Right: styling and layout controls

### Core user flows

**Create chart:** choose type → paste/edit data → adjust styles → insert into canvas.

**Edit existing chart:** select on canvas → open plugin → read metadata → restore editor → regenerate SVG after edits.

**Reuse palette:** create/adjust colors → save palette → suggest recent palettes on next chart.

### Architecture intent (non-decision)

Data flow: input/import → normalize dataset → visualization schema → apply theme/style → renderer adapter → engine SVG → insert + store metadata.

Recommended modules: `plugin/`, `ui/`, `domain/schema/`, `domain/transform/`, `domain/renderers/`, `domain/theme/`, `domain/persistence/`, `domain/import/`.

Narrow renderer interface (frozen early):

```ts
interface VisualizationRenderer {
  id: string;
  supports(type: ChartType): boolean;
  render(spec: VisualizationSpec): Promise<RenderResult>;
}
```

`RenderResult` includes at minimum: `svg`, `width`, `height`, `engine`, `engineVersion`.

Metadata on inserted nodes: visualization schema, raw or normalized dataset, theme id or palette, renderer id, renderer version, plugin version.

## Acceptance

- [ ] V1 deliverables above are implemented without shipping deferred engines or deferred features
- [ ] Create, edit-existing, and reuse-palette flows work end to end
- [ ] Inserted charts reopen with data and styling preserved

## References

- [ADR-001](../decisions/ADR-001-canonical-schema-source-of-truth.md)
- [ADR-002](../decisions/ADR-002-v1-echarts-only.md)
- Milestone Specs: [SPEC-002](SPEC-002-foundation.md) … [SPEC-009](SPEC-009-release-preparation.md)
- [EXECUTION_PLAN.md](../../EXECUTION_PLAN.md) — build order, testing, risks
