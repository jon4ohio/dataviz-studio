# Handoff

**Contract:** Handoff  
**Updated:** 2026-07-17

## Delta

- **SPEC-004 complete (Slices 1–4):** Preview for `bar` consumes `RenderResult` (`previewResult` state, branch on `success`, stale Spec guard, contract-driven fallback). Export still on sample path (SPEC-005).
- Renderer architecture validated end-to-end: Spec → Renderer → RenderResult → UI Preview.
- **Do not** add line/area/scatter via ECharts next.

## Horizon

1. After merge: tag **`v0.1.0-renderer-foundation`** (architectural checkpoint).
2. [SPEC-005](../docs/specs/SPEC-005-document-integration.md) — document insert + metadata + round-trip (Spec → RenderResult → Figma → Spec).
3. Then SPEC-006; expand chart coverage only after round-trip works.

## Blocks

None.
