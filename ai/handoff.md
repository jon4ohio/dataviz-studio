# Handoff

**Contract:** Handoff  
**Updated:** 2026-07-17

## Delta

- SPEC-004 **Reviewer constraints** locked in: deterministic `buildOption`, strict echarts/ module bounds, Option snapshots as primary Slice 2 regression, snapshot-update policy, PR checklist.
- Slice 1 complete (placeholder renderer, `bar` only, no ECharts yet).
- Platform API remains frozen; chart breadth deferred until after SPEC-005.

## Horizon

1. SPEC-004 Slice 2 — deterministic `buildOption()` + **Option snapshot tests** (judge PRs with the SPEC-004 reviewer checklist); then Slice 3 (Option → SVG); then Slice 4 (Spec → `RenderResult` + preview for `bar`).
2. **Stop after Slice 4.** Do not add line/area/scatter. Move to [SPEC-005](../docs/specs/SPEC-005-document-integration.md) document round-trip.
3. Then SPEC-006 data pipeline; expand chart coverage last.

## Blocks

None.
