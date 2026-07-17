# ADR-001: Canonical schema is the editable source of truth

## Status

**Status:** Accepted  
**Date:** 2026-07-17  
**Decision Maker(s):** Jon Ohio  
**Supersedes:** None

## Context

DataViz Studio must support visual editing, canvas export, and reopen/edit of inserted charts, with room for multiple rendering engines over time. If editor state or persistence were engine-specific config (or generated SVG), future engines and round-trip editing would couple to one vendor’s model.

**In scope:** What is treated as editable project state for visualizations.  
**Out of scope:** Which engine ships in V1 (see [ADR-002](ADR-002-v1-echarts-only.md)).

## Decision Drivers

- Must reopen and edit charts without loss of data or styling
- Must keep a path to additional engines without rewriting the editor
- Must not treat generated SVG as the editable state

## Options Considered

### Option A: Canonical visualization schema as SoT

- **Description:** Persist and edit a engine-agnostic schema (plus dataset/theme metadata); renderers map schema → engine config → SVG.
- **Pros:** Round-trip editing stays stable; engines are adapters; editor owns one model.
- **Cons:** Requires an upfront schema and transform layer before polishing engine-specific features.
- **Effort:** Medium
- **Notes:** Aligns with frozen `VisualizationRenderer` / `RenderResult` boundaries.

### Option B: ECharts option objects as editor state

- **Description:** Store and edit ECharts `option` (or similar) directly; treat SVG as derived only.
- **Pros:** Faster early previews for ECharts-only paths.
- **Cons:** Locks product to ECharts; re-edit and multi-engine become expensive; conflicts with design-first positioning.
- **Effort:** Low short-term / High long-term
- **Notes:** Rejected for V1 architecture.

## Decision

**We will use Option A** because round-trip editing and multi-engine readiness require one editable model that is not engine config or SVG.

Renderers convert canonical schema into engine-specific config; SVG is output only. Persistence stores schema, dataset, theme/palette, and renderer identity—not editable SVG.

## Consequences

### Positive

- Editor, validation, and metadata share one model
- ECharts (and later engines) stay behind a transform/adapter boundary

### Negative / Trade-offs

- Schema and transforms must be designed before deep engine polish
- **Migration / rollback:** Would require a new ADR and migration of stored plugin metadata if SoT changed

### Risks

| Risk | Likelihood | Impact | Mitigation | Owner/Role | Review Trigger |
|------|------------|--------|------------|------------|----------------|
| Schema under-specified and leaks ECharts fields | Med | High | Keep schema validation engine-agnostic; transform owns ECharts-only fields | Project maintainer | First ECharts chart type lands |

## Review Schedule

- **Next review:** After Milestone 3 (ECharts renderer) exit criteria, or when a second engine is proposed
- **Review owner:** Project maintainer

## Related ADRs

- [ADR-002](ADR-002-v1-echarts-only.md) — constrains which renderer ships in V1

## References

- [SPEC-001](../specs/SPEC-001-v1-product-scope.md) — V1 product scope
- [SPEC-003](../specs/SPEC-003-canonical-schema.md) — schema milestone
- Domain stubs: `domain/` (`VisualizationRenderer`, `RenderResult`)
