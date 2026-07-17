# ADR-002: V1 ships Apache ECharts only

## Status

**Status:** Superseded by [ADR-003](ADR-003-echarts-initial-renderer-adapter.md)  
**Date:** 2026-07-17  
**Decision Maker(s):** Jon Ohio  
**Supersedes:** None

## Context

Long-term engines may include Apache ECharts, AntV G2, and D3.js. Building all three in V1 would delay a usable design-first release. Architecture already plans a narrow `VisualizationRenderer` interface ([ADR-001](ADR-001-canonical-schema-source-of-truth.md)).

**In scope:** Which rendering engine ships in V1.  
**Out of scope:** Post-V1 engine schedule details (see EXECUTION_PLAN post-V1 roadmap).

## Decision Drivers

- Time-to-usable V1 over multi-engine completeness
- Preserve renderer interface so G2/D3 can arrive later
- Avoid coupling editor state to the V1 engine ([ADR-001](ADR-001-canonical-schema-source-of-truth.md))

## Options Considered

### Option A: Ship ECharts only in V1

- **Description:** Implement one ECharts adapter with SVG output for V1 chart types; defer G2 and D3.
- **Pros:** Focused delivery; proves schema → render → canvas path; matches standard chart types.
- **Cons:** Some chart categories (e.g. statistical/density) wait for later engines.
- **Effort:** Medium
- **Notes:** Keep interface stable for later adapters.

### Option B: Ship ECharts + G2 + D3 in V1

- **Description:** Implement three adapters before V1 release.
- **Pros:** Broader chart coverage at launch.
- **Cons:** High coordination cost; likely delays export/re-edit polish; risks incomplete Specs.
- **Effort:** High
- **Notes:** Rejected for V1.

## Decision

**We will use Option A** because V1 success depends on schema, editor, SVG export, and re-editability—not on shipping every engine.

AntV G2 and D3.js remain post-V1; do not block V1 on them.

## Consequences

### Positive

- Clear Milestone 3 scope
- Multi-engine ambition does not stall canvas round-trip

### Negative / Trade-offs

- Advanced chart families wait for V1.2+
- **Migration / rollback:** Adding a V1 engine would be a new ADR and new Spec work, not a silent expansion of SPEC-004

### Risks

| Risk | Likelihood | Impact | Mitigation | Owner/Role | Review Trigger |
|------|------------|--------|------------|------------|----------------|
| Pressure to add G2 mid-V1 | Med | High | Defer until SPEC-006 round-trip is reliable; keep renderer interface frozen | Project maintainer | Proposal to add second engine before V1 release |

## Review Schedule

- **Next review:** When SPEC-006 exit criteria are met, or when proposing G2/D3 work
- **Review owner:** Project maintainer

## Related ADRs

- [ADR-001](ADR-001-canonical-schema-source-of-truth.md) — schema SoT enables deferred engines
- [ADR-003](ADR-003-echarts-initial-renderer-adapter.md) — supersedes this ADR (ECharts as initial renderer adapter)

## References

- [SPEC-001](../specs/SPEC-001-v1-product-scope.md) — deferred G2/D3
- [SPEC-004](../specs/SPEC-004-echarts-renderer.md) — ECharts milestone
- [EXECUTION_PLAN.md](../../EXECUTION_PLAN.md) — post-V1 roadmap
- [ADR-003](ADR-003-echarts-initial-renderer-adapter.md) — current decision
