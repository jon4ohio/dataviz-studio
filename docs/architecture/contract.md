# Architecture Contract — DataViz Studio

**Contract:** Architecture  
**Problem coordinated:** What pipeline, ownership boundaries, and invariants every milestone must honor?

This document is normative. Delivery milestones ([SPEC-002](../specs/SPEC-002-foundation.md) … [SPEC-009](../specs/SPEC-009-release-preparation.md)) and ADRs refine *how* and *when*; they do not override these rules.

## Pipeline

```text
Architecture Contract

VisualizationSpec
        │
        ▼
Validation
        │
        ▼
Visualization Registry
        │
        ▼
VisualizationRenderer
        │
        ▼
RenderResult
        │
        ▼
Document Integration (Figma)
```

## Coupling rule

All visualization features MUST enter the rendering pipeline through `VisualizationSpec` and exit through `VisualizationRenderer`. Product code MUST NOT couple directly to Apache ECharts or any renderer-specific API outside the renderer adapter.

## Ownership boundaries

| Platform owns | Renderer owns |
|---------------|---------------|
| Visualization model | Layout |
| Validation | Geometry |
| Serialization | Coordinate systems |
| Visualization Registry | Scale calculations |
| Themes | SVG generation |
| Persistence | |
| Plugin / document integration | |
| Editor state | |

## Visualization Registry

The **Visualization Registry** owns **metadata only**: chart metadata, defaults, supported encodings, capability flags (and later editor configuration / renderer selection hints). It does **not** own rendering, layout, or SVG generation.

Entity vocabulary and meanings live in the [Domain Model](domain-model.md)—separate from schema representation.

## Architectural invariants

The following constraints apply to every milestone:

1. `VisualizationSpec` is the only source of truth for editable visualization state.
2. Renderers are replaceable.
3. Platform code never imports renderer internals.
4. Renderer implementations never mutate the `VisualizationSpec`.
5. Shared platform services emerge from repeated patterns rather than speculative abstraction.
6. Renderers are pure: `VisualizationSpec` → `RenderResult` with no Figma, storage, UI, or network side effects, and no mutation of the spec ([SPEC-004](../specs/SPEC-004-echarts-renderer.md)).

## Separation of concerns

| Concern | Owner |
|---------|--------|
| Architecture (stable contracts) | This contract + ADRs |
| Governance (what may change / how) | ADRs, invariants, [Entry](../project/entry.md) |
| Delivery (capability milestones) | SPECs + [EXECUTION_PLAN.md](../../EXECUTION_PLAN.md) |

Apache ECharts is **not** part of the platform architecture. It is documented solely as the initial renderer adapter implementing `VisualizationRenderer` ([ADR-003](../decisions/ADR-003-echarts-initial-renderer-adapter.md)).

## References

- [Domain Model](domain-model.md) — vocabulary and meanings
- [ADR-001](../decisions/ADR-001-canonical-schema-source-of-truth.md) — editable SoT
- [ADR-003](../decisions/ADR-003-echarts-initial-renderer-adapter.md) — initial renderer adapter
- [SPEC-001](../specs/SPEC-001-v1-product-scope.md) — product scope
- Domain: `VisualizationRenderer`, `RenderResult` in `domain/`
