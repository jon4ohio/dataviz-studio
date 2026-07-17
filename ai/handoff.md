# Handoff

**Contract:** Handoff  
**Updated:** 2026-07-17

## Delta

- **SPEC-004 Slice 2 complete:** deterministic `buildOption(spec)` for `bar` only (`option-builder` / `mappings` / static `defaults`); Option snapshot + determinism tests; no ECharts runtime yet.
- Slice 1 placeholder renderer unchanged. Public platform API untouched.
- Reviewer checklist applies to further renderer PRs.

## Horizon

1. SPEC-004 Slice 3 — Option → Apache ECharts → SVG (confine `echarts` to `domain/renderers/echarts/`).
2. SPEC-004 Slice 4 — end-to-end Spec → `RenderResult` + preview for `bar`.
3. **Stop.** Move to [SPEC-005](../docs/specs/SPEC-005-document-integration.md) document round-trip before adding other chart kinds.

## Blocks

None.
