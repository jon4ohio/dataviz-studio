# Handoff

**Contract:** Handoff  
**Updated:** 2026-07-17

## Delta

- **Architecture Governance Realignment:** normative [Architecture Contract](../docs/architecture/contract.md) (pipeline, ownership, invariants); [ADR-003](../docs/decisions/ADR-003-echarts-initial-renderer-adapter.md) supersedes ADR-002 (ECharts as initial **renderer adapter**, not platform architecture); capability milestones remapped (Document Integration, Data Pipeline, Theme System, Visualization Families).
- Shell modes: workbench (`1080×700`) vs minimized floating card (`320×72`) via `resize-ui`; collapse on minimize/export/blur; expand on card click or managed selection.
- Milestone 1 Foundation remains complete: loadable plugin, typed UI ↔ plugin bridge, React UI shell, sample SVG preview (not ECharts yet). Thin document export slice exists; full round-trip is Milestone 4 ([SPEC-005](../docs/specs/SPEC-005-document-integration.md)).

## Horizon

1. [SPEC-003](../docs/specs/SPEC-003-canonical-schema.md) — Canonical Visualization Model (Visualization Registry, validation, serialization) before renderer work.
2. [SPEC-004](../docs/specs/SPEC-004-echarts-renderer.md) — ECharts adapter for `bar` first, then remaining initial Cartesian family.
3. Follow build order in [EXECUTION_PLAN.md](../EXECUTION_PLAN.md).

## Blocks

None.
