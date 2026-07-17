# SPEC-004: Milestone 3 — ECharts Renderer

**Contract:** Specification  
**Problem coordinated:** How does the first `VisualizationRenderer` turn a `VisualizationSpec` into a `RenderResult`?

The architectural concept is the **renderer**. An adapter to Apache ECharts is an implementation detail *inside* that renderer. Product code depends only on `VisualizationRenderer` → `RenderResult`.

## Phase context

Platform definition ([SPEC-003](SPEC-003-canonical-schema.md)) is **frozen** as a public API. This milestone **validates** those contracts with the first renderer implementation—not by extending the platform language.

## Public responsibility

```text
VisualizationSpec  →  RenderResult
```

Everything else is private to the renderer package.

## Internal translation pipeline

```text
VisualizationSpec
        │
        ▼
ECharts Renderer (VisualizationRenderer)
        │
        ▼
ECharts Option          ← internal only; never escapes the renderer
        │
        ▼
Apache ECharts
        │
        ▼
SVG
        │
        ▼
RenderResult
```

**ECharts Option is an internal representation.** It must not appear on `VisualizationSpec`, in document metadata, or in UI/shared modules.

## Ownership / import boundary

| Outside renderer | Inside renderer only |
|------------------|----------------------|
| `VisualizationSpec` | `echarts` / `echarts/core` |
| `VisualizationRenderer` | Option builders / transforms |
| `RenderResult` consumers | SVG extraction from ECharts |

Platform, UI, plugin, and schema code MUST NOT import ECharts.

## Scope: `bar` only

The Visualization Registry may still list other Cartesian kinds. This milestone implements **`bar` only**.

Line, area, scatter, column, and mixed are incremental additions to the same translation layer **after** the renderer architecture is proven—not part of SPEC-004 exit criteria. Circular and other families remain [SPEC-008](SPEC-008-visualization-families.md).

## Implementation slices

### Slice 1 — Renderer skeleton

- Module implementing `VisualizationRenderer`
- `supports("bar")` (and rejects others for now)
- `render(spec)` returns a placeholder `RenderResult` (valid empty/minimal SVG + width/height + engine metadata)

### Slice 2 — Bar translation

- `VisualizationSpec` → ECharts Option (internal)
- Unit-test generated option shape (no SVG required yet)

### Slice 3 — SVG rendering

- Drive Apache ECharts with the option → extract SVG
- Verify SVG string is non-empty and well-formed enough for insert

### Slice 4 — Integration

- End-to-end: `VisualizationSpec` → `render()` → `RenderResult`
- First contract test:

```text
assert success
assert svg exists / non-empty
assert width, height
assert engine / engineVersion metadata
```

- Wire editor preview to the renderer for `bar` (sample SVG remains for unsupported kinds)

## Acceptance

- [ ] `VisualizationRenderer` is implemented as the ECharts Renderer (ECharts confined inside the package)
- [ ] `bar` renders from `VisualizationSpec` into a valid `RenderResult`
- [ ] ECharts Option never appears outside the renderer
- [ ] No ECharts types or option fields appear on `VisualizationSpec`
- [ ] Contract integration test: `render()` succeeds with svg, width, height, engine metadata
- [ ] Editor preview uses renderer output for `bar`

## After this milestone

Move promptly to [SPEC-005](SPEC-005-document-integration.md) (document insert + metadata + round-trip)—where users first perceive a native Figma design tool.

## References

- [Architecture Contract](../architecture/contract.md)
- [Domain Model](../architecture/domain-model.md)
- [ADR-001](../decisions/ADR-001-canonical-schema-source-of-truth.md)
- [ADR-003](../decisions/ADR-003-echarts-initial-renderer-adapter.md) — ECharts as initial renderer implementation
- [SPEC-003](SPEC-003-canonical-schema.md) — frozen public platform API
- `domain/renderers/` (public contract), renderer implementation package (private ECharts)
