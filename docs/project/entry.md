# Project Entry — DataViz Studio

**Contract:** Project Entry  
**Problem coordinated:** Where am I? What is this project?

## Purpose

DataViz Studio is a design-first **visualization platform** delivered as a Figma plugin: editable, SVG-based visualizations through a visual editor, with a canonical model and pluggable renderers. It is not an “ECharts plugin”; engines sit behind `VisualizationRenderer` as adapters.

Current delivery: **Phase 2 — Platform Execution**. Milestone 2 ([SPEC-003](../specs/SPEC-003-canonical-schema.md)) is complete and **frozen** as the public platform API. Next: Milestone 3 — ECharts Renderer ([SPEC-004](../specs/SPEC-004-echarts-renderer.md)), `bar` only.

## Where truths live

| Question | Owner |
|----------|-------|
| Pipeline, ownership, architectural invariants | [Architecture Contract](../architecture/contract.md) |
| Entity vocabulary and meanings (not TypeScript) | [Domain Model](../architecture/domain-model.md) |
| First usable release product scope and user flows | [SPEC-001](../specs/SPEC-001-v1-product-scope.md) |
| Milestone 1 Foundation (complete) | [SPEC-002](../specs/SPEC-002-foundation.md) |
| Milestone 2 Canonical Visualization Model | [SPEC-003](../specs/SPEC-003-canonical-schema.md) |
| Milestone 3 ECharts Renderer | [SPEC-004](../specs/SPEC-004-echarts-renderer.md) |
| Milestone 4 Document Integration | [SPEC-005](../specs/SPEC-005-document-integration.md) |
| Milestone 5 Data Pipeline | [SPEC-006](../specs/SPEC-006-data-pipeline.md) |
| Milestone 6 Theme System | [SPEC-007](../specs/SPEC-007-theme-system.md) |
| Milestone 7 Visualization Families | [SPEC-008](../specs/SPEC-008-visualization-families.md) |
| Milestone 8 Release Preparation | [SPEC-009](../specs/SPEC-009-release-preparation.md) |
| Why canonical schema is editable SoT | [ADR-001](../decisions/ADR-001-canonical-schema-source-of-truth.md) |
| Why ECharts is the initial renderer adapter | [ADR-003](../decisions/ADR-003-echarts-initial-renderer-adapter.md) |
| Build order, testing, risks, Future Product Experience | [EXECUTION_PLAN.md](../../EXECUTION_PLAN.md) |
| What changed recently / what’s next | [Handoff](../../ai/handoff.md) |
| Visitor setup and architecture sketch | [README.md](../../README.md) |

## Contract implementations

| Contract | Implementation | Location |
|----------|----------------|----------|
| Architecture | Project Architecture Contract | `docs/architecture/contract.md` |
| Domain Model | Project vocabulary (meaning) | `docs/architecture/domain-model.md` |
| Decision Records | [Operational ADR](https://github.com/jon4ohio/operational-adr) (Tier 0 lean) | `docs/decisions/` |
| Specification | Anchor Spec (problem / requirements / acceptance / references) | `docs/specs/` |
| Handoff | Anchor Handoff | `ai/handoff.md` |

## AI context

Root `AGENTS.md` is a dispatch layer only — not durable project truth. Orient from this Entry, then Handoff, then the Spec, ADR, or Architecture Contract for the task.
