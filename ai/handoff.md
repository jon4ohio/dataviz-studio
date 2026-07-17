# Handoff

**Contract:** Handoff  
**Updated:** 2026-07-17

## Delta

- **SPEC-004 Slice 3 complete:** `renderOption(option, w, h)` (ECharts SVG SSR, dispose in-call); `renderer.ts` orchestrates Spec → Option → SVG → `RenderResult` and normalizes failures. ECharts confined to `domain/renderers/echarts/`.
- Slice 2 Option snapshots unchanged. Public platform API untouched.

## Horizon

1. SPEC-004 Slice 4 — end-to-end Spec → `RenderResult` + editor preview for `bar`.
2. **Stop.** Move to [SPEC-005](../docs/specs/SPEC-005-document-integration.md) document round-trip before other chart kinds.
3. Then SPEC-006; expand chart coverage last.

## Blocks

None.
