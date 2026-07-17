# Handoff

**Contract:** Handoff  
**Updated:** 2026-07-17

## Delta

- **Platform definition complete (Phase 1):** Architecture Contract, ADRs, Domain Model, SPEC-003 schema / validation / registry, Public Platform API **frozen**. Work is now **implementation-driven** (validate contracts, don’t redesign them).
- SPEC-004 reframed as **ECharts Renderer** (not “adapter” milestone title): internal Spec → Option → ECharts → SVG → `RenderResult`; **`bar` only**; four slices (skeleton → option → SVG → integration).
- UI still binds to `VisualizationSpec`; preview remains sample SVG until SPEC-004 Slice 4.

## Horizon

1. [SPEC-004](../docs/specs/SPEC-004-echarts-renderer.md) — ECharts Renderer, four slices, `bar` only; prove `VisualizationSpec` → `RenderResult`.
2. [SPEC-005](../docs/specs/SPEC-005-document-integration.md) — document integration + round-trip (first user-perceived “native Figma” moment).
3. Follow build order in [EXECUTION_PLAN.md](../EXECUTION_PLAN.md).

## Blocks

None.
