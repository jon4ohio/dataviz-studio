# DataViz Studio — Execution roadmap

**Objective:** Build a Figma plugin for editable, SVG-based data visualizations with a path to multiple rendering engines over time.

**Owned elsewhere (do not duplicate):**

| Topic | Owner |
|-------|-------|
| V1 scope, UI flows, architecture intent | [SPEC-001](docs/specs/SPEC-001-v1-product-scope.md) |
| Milestones 1–8 | [SPEC-002](docs/specs/SPEC-002-foundation.md) … [SPEC-009](docs/specs/SPEC-009-release-preparation.md) |
| Canonical schema as SoT | [ADR-001](docs/decisions/ADR-001-canonical-schema-source-of-truth.md) |
| V1 ECharts-only | [ADR-002](docs/decisions/ADR-002-v1-echarts-only.md) |
| Orientation / continuity | [Entry](docs/project/entry.md), [Handoff](ai/handoff.md) |

This file owns **build order**, **testing strategy**, **risks**, and **post-V1 roadmap** only.

## Build order

1. Scaffold the plugin and UI shell ([SPEC-002](docs/specs/SPEC-002-foundation.md)).
2. Define the canonical schema before touching renderer logic ([SPEC-003](docs/specs/SPEC-003-canonical-schema.md)).
3. Implement ECharts SVG rendering for one chart type first: `bar` ([SPEC-004](docs/specs/SPEC-004-echarts-renderer.md)).
4. Add the remaining standard chart types.
5. Build the data editor.
6. Build styling panels ([SPEC-005](docs/specs/SPEC-005-editor-controls.md)).
7. Implement export to canvas.
8. Add metadata round-trip editing ([SPEC-006](docs/specs/SPEC-006-canvas-export-reediting.md)).
9. Add palette memory ([SPEC-007](docs/specs/SPEC-007-color-system.md)).
10. Harden import, validation, and UX ([SPEC-008](docs/specs/SPEC-008-import-and-polish.md)).

This order keeps the project testable from the first week and avoids building UI controls for a rendering model that is still unstable.

## Testing strategy

### Unit tests

- Schema validation
- Default spec generation
- Data normalization
- Schema-to-ECharts transforms
- Metadata serialization

### Integration tests

- Create chart from sample data
- Render preview
- Export to canvas
- Reopen selected chart
- Edit and re-export without regression

### Manual QA

- Large datasets
- Missing values
- Negative values
- Long labels
- Small frame sizes
- Repeated editing cycles

## Major risks

### Risk 1: Coupling the product to ECharts options

If the editor state becomes ECharts config, future engine support gets expensive fast.

**Mitigation:** Enforce [ADR-001](docs/decisions/ADR-001-canonical-schema-source-of-truth.md); keep ECharts option generation in one transform layer.

### Risk 2: SVG output not mapping cleanly into Figma workflows

Some generated structures may become messy or hard to edit visually after insertion.

**Mitigation:** Inspect real imported SVG structure early; test grouping, naming, and layer cleanliness during [SPEC-004](docs/specs/SPEC-004-echarts-renderer.md).

### Risk 3: Round-trip editing breaks after schema changes

If metadata versions drift, existing charts may stop reopening correctly.

**Mitigation:** Version stored metadata from day one; write migration helpers when schema changes ([SPEC-006](docs/specs/SPEC-006-canvas-export-reediting.md)).

### Risk 4: Multi-engine ambition slows V1

Trying to support ECharts, G2, and D3 immediately will likely delay launch.

**Mitigation:** [ADR-002](docs/decisions/ADR-002-v1-echarts-only.md); keep renderer interface stable; schedule G2 only after round-trip editing is reliable.

## Post-V1 roadmap

### V1.1

- Templates
- More sample datasets
- Improved theme presets
- Better axis and label ergonomics

### V1.2

- AntV G2 for histogram, box plot, violin, density
- Engine selection hidden behind chart categories

### V2

- D3.js for network, hierarchy, and map-heavy visualizations
- Advanced custom layout types

### V2+

- Figma variables support
- Design token integration
- Team theme libraries
- Smart chart recommendations

## Suggested next focus

Target: prove the architecture end to end on one chart type (`bar`).

1. Complete [SPEC-003](docs/specs/SPEC-003-canonical-schema.md) (`VisualizationSpec`, `Dataset`, `ChartType`).
2. Advance [SPEC-004](docs/specs/SPEC-004-echarts-renderer.md) for `bar` SVG preview.
3. Toward [SPEC-006](docs/specs/SPEC-006-canvas-export-reediting.md): insert SVG, store and read back metadata.

Honor [ADR-001](docs/decisions/ADR-001-canonical-schema-source-of-truth.md) and [ADR-002](docs/decisions/ADR-002-v1-echarts-only.md). Success means the architecture is proven; remaining V1 work becomes iterative.
