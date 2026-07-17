# DataViz Studio — Execution roadmap

**Objective:** Build a Figma plugin as a design-first **visualization platform**: canonical model, pluggable renderers, SVG document output, and editable round-trip.

**Owned elsewhere (do not duplicate):**

| Topic | Owner |
|-------|-------|
| Pipeline, ownership, invariants | [Architecture Contract](docs/architecture/contract.md) |
| Product scope, UI flows | [SPEC-001](docs/specs/SPEC-001-v1-product-scope.md) |
| Milestones 1–8 | [SPEC-002](docs/specs/SPEC-002-foundation.md) … [SPEC-009](docs/specs/SPEC-009-release-preparation.md) |
| Canonical schema as SoT | [ADR-001](docs/decisions/ADR-001-canonical-schema-source-of-truth.md) |
| ECharts as initial renderer adapter | [ADR-003](docs/decisions/ADR-003-echarts-initial-renderer-adapter.md) |
| Orientation / continuity | [Entry](docs/project/entry.md), [Handoff](ai/handoff.md) |

This file owns **build order**, **testing strategy**, **risks**, and **Future Product Experience** only.

## Build order

1. Scaffold the plugin and UI shell ([SPEC-002](docs/specs/SPEC-002-foundation.md)) — **complete**.
2. Canonical visualization model, Visualization Registry, validation, serialization ([SPEC-003](docs/specs/SPEC-003-canonical-schema.md)).
3. ECharts Renderer implementing `VisualizationRenderer` — **`bar` only** first ([SPEC-004](docs/specs/SPEC-004-echarts-renderer.md)); other Cartesian kinds after the architecture is proven.
4. Document integration: insert, metadata, round-trip editing ([SPEC-005](docs/specs/SPEC-005-document-integration.md)).
5. Data pipeline into the model ([SPEC-006](docs/specs/SPEC-006-data-pipeline.md)).
6. Theme system ([SPEC-007](docs/specs/SPEC-007-theme-system.md)).
7. Additional visualization families ([SPEC-008](docs/specs/SPEC-008-visualization-families.md)).
8. Release preparation ([SPEC-009](docs/specs/SPEC-009-release-preparation.md)).

This order keeps the project testable early and avoids building UI or document features against an unstable model. Capabilities expand by **layer and family**, not by isolated one-off chart types.

## Testing strategy

### Unit tests

- Schema validation
- Default spec generation
- Data normalization
- Spec-to-adapter transforms (ECharts option generation inside the adapter only)
- Metadata serialization

### Integration tests

- Create visualization from sample data
- Render preview via `VisualizationRenderer`
- Export to document
- Reopen selected managed visualization
- Edit and re-export without regression

### Manual QA

- Large datasets
- Missing values
- Negative values
- Long labels
- Small frame sizes
- Repeated editing cycles

## Major risks

### Risk 1: Coupling the product to ECharts

If editor state or persistence becomes ECharts config, future adapters get expensive fast.

**Mitigation:** Enforce [ADR-001](docs/decisions/ADR-001-canonical-schema-source-of-truth.md) and the [Architecture Contract](docs/architecture/contract.md) coupling rule; keep ECharts option generation inside the adapter.

### Risk 2: SVG output not mapping cleanly into Figma workflows

Some generated structures may become messy or hard to edit visually after insertion.

**Mitigation:** Inspect real imported SVG structure early; test grouping, naming, and layer cleanliness during [SPEC-004](docs/specs/SPEC-004-echarts-renderer.md) / [SPEC-005](docs/specs/SPEC-005-document-integration.md).

### Risk 3: Round-trip editing breaks after schema changes

If metadata versions drift, existing visualizations may stop reopening correctly.

**Mitigation:** Version stored metadata from day one; write migration helpers when the model changes ([SPEC-005](docs/specs/SPEC-005-document-integration.md)).

### Risk 4: Premature platform service extraction

Building speculative layout/scale/axis platform engines before patterns repeat wastes time and blurs ownership.

**Mitigation:** Architecture Contract invariant — extract shared services from repeated patterns only; layout/geometry stay renderer-owned until a new ADR says otherwise.

### Risk 5: Multi-adapter ambition slows the first usable release

Trying to ship ECharts, G2, and D3 immediately will likely delay launch.

**Mitigation:** [ADR-003](docs/decisions/ADR-003-echarts-initial-renderer-adapter.md); keep `VisualizationRenderer` stable; add adapters only after document round-trip is reliable.

## Future Product Experience

These are **feature expansions**, not architectural milestones. Do not block release on them unless SPEC-001 explicitly pulls one forward.

```text
Future Product Experience

Templates
Recommendations
Asset Library
Marketplace
AI Assistance
Collaboration
Cloud Data Sources
```

## Additional renderer adapters

When the renderer interface has proven stable (typically after SPEC-005), new implementations may be added behind `VisualizationRenderer` (G2, D3, or a first-party renderer). Each requires a new ADR. Do not treat “post-V1 G2” as the architecture story—adapters are interchangeable implementations.

## Suggested next focus

Target: prove the renderer contract end to end on **`bar` only**.

1. [SPEC-004](docs/specs/SPEC-004-echarts-renderer.md) four slices: skeleton → Spec→Option → SVG → integration (`VisualizationSpec` → `RenderResult`).
2. Then [SPEC-005](docs/specs/SPEC-005-document-integration.md): document insert, metadata, round-trip.
3. Do **not** revisit SPEC-003 unless a change alters the platform language (then ADR).

Honor [ADR-001](docs/decisions/ADR-001-canonical-schema-source-of-truth.md), [ADR-003](docs/decisions/ADR-003-echarts-initial-renderer-adapter.md), and the [Architecture Contract](docs/architecture/contract.md).
