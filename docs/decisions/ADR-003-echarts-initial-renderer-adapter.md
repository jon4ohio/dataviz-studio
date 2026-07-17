# ADR-003: Apache ECharts is the initial renderer adapter

## Status

**Status:** Accepted  
**Date:** 2026-07-17  
**Decision Maker(s):** Jon Ohio  
**Supersedes:** [ADR-002](ADR-002-v1-echarts-only.md)

## Context

DataViz Studio is a design-first visualization **platform** with a stable `VisualizationRenderer` interface ([Architecture Contract](../architecture/contract.md), [ADR-001](ADR-001-canonical-schema-source-of-truth.md)). Multiple long-term engines (Apache ECharts, AntV G2, D3.js, or a first-party renderer) may implement that interface. Shipping more than one adapter before the model, document round-trip, and editor are proven would delay a usable product.

**In scope:** Which library is the first adapter behind `VisualizationRenderer`.  
**Out of scope:** Platform pipeline and ownership boundaries (Architecture Contract); which visualization families ship when (SPECs / EXECUTION_PLAN); speculative first-party Cartesian engines.

## Decision Drivers

- Time-to-usable product over multi-adapter completeness
- Preserve renderer replaceability so G2/D3/others can arrive without rewriting the editor
- Avoid treating any engine as part of the platform architecture ([Architecture Contract](../architecture/contract.md))
- Avoid coupling editor state to engine config ([ADR-001](ADR-001-canonical-schema-source-of-truth.md))

## Options Considered

### Option A: ECharts as the initial renderer adapter

- **Description:** Implement one Apache ECharts adapter that translates `VisualizationSpec` → engine option → `RenderResult` (SVG); defer additional adapters.
- **Pros:** Focused delivery; proves schema → render → document path; covers the initial Cartesian family.
- **Cons:** Some families may wait until a later adapter or ECharts capability is sufficient.
- **Effort:** Medium
- **Notes:** Adapter lives behind `VisualizationRenderer`; platform code never imports ECharts.

### Option B: Ship ECharts + G2 + D3 before first usable release

- **Description:** Implement three adapters before document round-trip and theme/data pipeline are solid.
- **Pros:** Broader family coverage earlier.
- **Cons:** High coordination cost; likely delays export/re-edit polish; risks incomplete Specs.
- **Effort:** High
- **Notes:** Rejected for the first usable release.

### Option C: Build a first-party Cartesian engine first

- **Description:** Own layout, scales, axes, marks, and SVG generation before shipping charts.
- **Pros:** Maximum control over SVG cleanliness and Figma mapping.
- **Cons:** Large implementation surface before product validation.
- **Effort:** High
- **Notes:** Deferred until ECharts is a demonstrated bottleneck; would require a new ADR.

## Decision

**Apache ECharts is the initial renderer adapter implementing the `VisualizationRenderer` interface.**

ECharts translates between the platform model and its own API. It does not define the visualization model, editor state, persistence, or document metadata. Adding or replacing adapters later does not require changing application architecture above `VisualizationRenderer`.

## Consequences

### Positive

- Clear Milestone 3 ([SPEC-004](../specs/SPEC-004-echarts-renderer.md)) scope
- Multi-adapter ambition does not stall document round-trip
- Wording keeps ECharts out of the platform architecture

### Negative / Trade-offs

- Advanced families may wait for later adapters or ECharts coverage
- **Migration / rollback:** A second adapter or first-party renderer requires a new ADR and Spec work—not a silent expansion of SPEC-004

### Operational Impact

- Contributors implement transforms only inside the ECharts adapter module
- **Migration / rollback:** Remove or replace the adapter without changing `VisualizationSpec` consumers

### Risks

| Risk | Likelihood | Impact | Mitigation | Owner/Role | Review Trigger |
|------|------------|--------|------------|------------|----------------|
| Pressure to add a second adapter before round-trip is reliable | Med | High | Defer until [SPEC-005](../specs/SPEC-005-document-integration.md) exit criteria; keep `VisualizationRenderer` frozen | Project maintainer | Proposal to add second adapter before first usable release |
| ECharts fields leak into `VisualizationSpec` | Med | High | Schema validation must reject engine-specific fields; Architecture Contract coupling rule | Project maintainer | First Cartesian type lands |

## Review Schedule

- **Next review:** When SPEC-005 (Document Integration) exit criteria are met, or when proposing a second adapter
- **Review owner:** Project maintainer

## Related ADRs

- [ADR-001](ADR-001-canonical-schema-source-of-truth.md) — schema SoT enables deferred adapters
- [ADR-002](ADR-002-v1-echarts-only.md) — superseded by this ADR

## References

- [Architecture Contract](../architecture/contract.md)
- [SPEC-001](../specs/SPEC-001-v1-product-scope.md)
- [SPEC-004](../specs/SPEC-004-echarts-renderer.md)
- [EXECUTION_PLAN.md](../../EXECUTION_PLAN.md)
