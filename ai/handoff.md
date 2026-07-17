# Handoff

**Contract:** Handoff  
**Updated:** 2026-07-17

## Delta

- **SPEC-004 closed on main** (PR #6). Tag **`v0.1.0-renderer-foundation`** — stable platform API, renderer interface, ECharts `bar`, preview via `RenderResult` (not document integration / data / themes).
- **SPEC-005 Document Projection shipped on branch:** semantic `ChartPluginMeta` v2, `migrateChartPluginMeta`, bar insert from `RenderResult`, Restoration from Spec, update-in-place preserving managed root identity.

## Horizon

1. Merge SPEC-005 branch; treat document lifecycle as stable.
2. Then SPEC-006; expand chart coverage only after this lands on main.
3. **Do not** add line/area/scatter via ECharts next.

## Blocks

None.
