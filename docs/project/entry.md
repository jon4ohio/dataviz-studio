# Project Entry — DataViz Studio

**Contract:** Project Entry  
**Problem coordinated:** Where am I? What is this project?

## Purpose

DataViz Studio is a design-first Figma plugin for creating editable, SVG-based data visualizations through a visual editor. It is not an “ECharts plugin”; engines sit behind a canonical schema and a narrow renderer interface.

Current delivery: **Milestone 1 — Foundation** (loadable plugin, typed UI ↔ plugin bridge, UI shell, sample SVG preview). See [SPEC-002](../specs/SPEC-002-foundation.md).

## Where truths live

| Question | Owner |
|----------|-------|
| V1 product scope and user flows | [SPEC-001](../specs/SPEC-001-v1-product-scope.md) |
| Milestone 1 Foundation | [SPEC-002](../specs/SPEC-002-foundation.md) |
| Milestone 2 Canonical Schema | [SPEC-003](../specs/SPEC-003-canonical-schema.md) |
| Milestone 3 ECharts Renderer | [SPEC-004](../specs/SPEC-004-echarts-renderer.md) |
| Milestone 4 Editor Controls | [SPEC-005](../specs/SPEC-005-editor-controls.md) |
| Milestone 5 Canvas Export and Re-editing | [SPEC-006](../specs/SPEC-006-canvas-export-reediting.md) |
| Milestone 6 Color System | [SPEC-007](../specs/SPEC-007-color-system.md) |
| Milestone 7 Import and Polish | [SPEC-008](../specs/SPEC-008-import-and-polish.md) |
| Milestone 8 Release Preparation | [SPEC-009](../specs/SPEC-009-release-preparation.md) |
| Why canonical schema is editable SoT | [ADR-001](../decisions/ADR-001-canonical-schema-source-of-truth.md) |
| Why V1 ships ECharts only | [ADR-002](../decisions/ADR-002-v1-echarts-only.md) |
| Build order, testing, risks, post-V1 | [EXECUTION_PLAN.md](../../EXECUTION_PLAN.md) |
| What changed recently / what’s next | [Handoff](../../ai/handoff.md) |
| Visitor setup and architecture sketch | [README.md](../../README.md) |

## Contract implementations

| Contract | Implementation | Location |
|----------|----------------|----------|
| Decision Records | [Operational ADR](https://github.com/jon4ohio/operational-adr) (Tier 0 lean) | `docs/decisions/` |
| Specification | Anchor Spec (problem / requirements / acceptance / references) | `docs/specs/` |
| Handoff | Anchor Handoff | `ai/handoff.md` |

## AI context

Root `AGENTS.md` is a dispatch layer only — not durable project truth. Orient from this Entry, then Handoff, then the Spec or ADR for the task.
