# SPEC-004: Milestone 3 — ECharts Renderer

**Contract:** Specification  
**Problem coordinated:** How does the first `VisualizationRenderer` turn a `VisualizationSpec` into a `RenderResult`?

The architectural concept is the **renderer**. Wiring to Apache ECharts is an implementation detail *inside* that renderer. Product code depends only on `VisualizationSpec` → `render()` → `RenderResult`.

## Phase context

Platform definition ([SPEC-003](SPEC-003-canonical-schema.md)) is **frozen** as a public API. This milestone **validates** those contracts with the first renderer—not by extending the platform language.

Architecture is **closed for modification, open for extension**: implement against the contracts; do not reopen the model unless a change alters the platform language (then ADR).

## Renderer purity

The renderer is a **pure transformation**.

```text
VisualizationSpec
        │
        ▼
render()
        │
        ▼
RenderResult
```

It MUST have **no observable side effects**. It must not:

- mutate `VisualizationSpec`
- create Figma nodes
- read the Figma document
- access plugin storage
- update UI state
- perform network requests

Its only responsibility:

> **Transform a valid `VisualizationSpec` into a `RenderResult`.**

Document insert, metadata, and round-trip belong to [SPEC-005](SPEC-005-document-integration.md). There is **no Figma node** on `RenderResult`.

## Public responsibility

```text
VisualizationSpec  →  RenderResult
```

Everything else is private to the renderer package.

## `RenderResult` (stable output contract)

```ts
interface RenderResult {
  success: boolean;
  svg: string;
  width: number;
  height: number;
  renderer: string;
  version: string;
  warnings: RenderWarning[];
  diagnostics?: RenderDiagnostics;
}
```

Fields may be empty or minimal early, but the shape is stable for insertion, debugging, renderer comparison, regression tests, and future renderer selection.

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

## Package layout

```text
domain/renderers/
  index.ts                 ← public VisualizationRenderer / RenderResult
  echarts/
    renderer.ts            ← VisualizationRenderer implementation
    option-builder.ts      ← Spec → Option (Slice 2+)
    defaults.ts
    mappings.ts
```

Platform, UI, plugin, and schema code MUST NOT import `echarts` or anything under `domain/renderers/echarts/` except through the public renderer export.

## Reviewer constraints

These rules do not change architecture—they define how reviewers evaluate SPEC-004 implementation. Public contracts remain frozen ([SPEC-003](SPEC-003-canonical-schema.md)).

### Deterministic `option-builder`

Treat `buildOption(spec)` as a **compiler**, not a helper.

```text
VisualizationSpec
        ↓
buildOption(spec)
        ↓
ECharts Option
```

Same `VisualizationSpec` MUST always produce the same Option object. Forbidden: hidden defaults based on runtime state, random IDs, time-dependent values.

### Module responsibilities

| File | Owns | Must not own |
|------|------|----------------|
| `renderer.ts` | Orchestrate Spec → Option → SVG → `RenderResult` | Mapping / business rules |
| `option-builder.ts` | Spec → Option translation | ECharts instance / SVG / Figma |
| `defaults.ts` | Static defaults only | Runtime / random / clock |
| `mappings.ts` | Platform concept → ECharts value lookup | Business logic (push to builder or schema validation) |

If business logic appears in `mappings.ts`, it usually belongs in the option builder or in validation.

### Option snapshots (Slice 2 primary test)

Primary regression for Slice 2+: `VisualizationSpec` → `buildOption()` → assert Option structure. SVG tests (Slice 3+) are secondary; Option snapshots remain stable if ECharts SVG output churns.

### Snapshot update policy

> Option snapshot updates are expected only when the `VisualizationSpec` → Option translation intentionally changes. Snapshot-only PRs without an accompanying explanation should be treated as regressions until reviewed.

Snapshots are a **contract**, not a convenience.

### Reviewer checklist (every PR)

| Check | Pass criteria |
|-------|----------------|
| Determinism | Same `VisualizationSpec` produces an identical Option |
| Purity | No mutation of `VisualizationSpec` |
| Module boundaries | Logic remains within the owning module |
| Snapshot stability | Option snapshots pass without updates unless intentionally changed |
| Public API | No changes to frozen contracts without ADR approval |

## Scope: `bar` only

The Visualization Registry may still list other Cartesian kinds. This milestone implements **`bar` only**.

Do **not** add line, area, scatter, column, or mixed before [SPEC-005](SPEC-005-document-integration.md). Round-tripping one chart through the document is more valuable than six kinds that cannot be edited. Other Cartesian kinds are incremental after document integration is proven. Circular and other families remain [SPEC-008](SPEC-008-visualization-families.md).

## Implementation slices

### Slice 1 — Renderer skeleton (intentionally boring)

No ECharts. No option generation. No real SVG rendering.

- Implement `VisualizationRenderer` for `bar` (`supports("bar")` only)
- `render(spec)` returns placeholder `RenderResult`: minimal SVG, correct dimensions from the spec, `renderer` id, `version`, `success: true`, empty `warnings`
- Unit-test the contract; prove purity (input unchanged)

### Slice 2 — Bar translation

- Deterministic `buildOption(spec)` in `option-builder.ts` (`VisualizationSpec` → ECharts Option)
- **Primary tests:** Option snapshot / structure asserts (same Spec → identical Option)
- No SVG required yet

**Status:** Complete (`domain/renderers/echarts/option-builder.ts`).

### Slice 3 — SVG rendering

- Option → Apache ECharts → SVG via narrow `renderOption()`
- Failures stay localized to the rendering step; `renderer.ts` normalizes into `RenderResult`

**Status:** Complete (`domain/renderers/echarts/render-option.ts`).

### Slice 4 — Integration

- End-to-end: `VisualizationSpec` → `render()` → `RenderResult`
- Contract assertions: `success`, non-empty `svg`, `width`, `height`, `renderer`, `version`
- Wire editor preview to the renderer for `bar` only (sample SVG for unsupported kinds)

## Acceptance

- [x] Renderer purity holds for Slice 1 (placeholder; no Figma / storage / UI / network; no spec mutation)
- [x] `VisualizationRenderer` implemented as ECharts Renderer package (ECharts confined inside from Slice 3)
- [x] `bar` only in scope for this milestone (Slice 1 supports bar only)
- [x] ECharts Option never appears outside the renderer
- [x] No ECharts types or option fields on `VisualizationSpec`
- [x] Contract unit test covers placeholder `RenderResult` shape (Slice 1)
- [ ] Editor preview uses renderer output for `bar` (Slice 4)

## After this milestone

**Stop expanding chart types.** Move to [SPEC-005](SPEC-005-document-integration.md).

Disciplined sequence:

1. SPEC-004 — one renderer, one chart (`bar`), one contract  
2. SPEC-005 — one document integration, one metadata format, one round-trip  
3. SPEC-006 — one data pipeline  
4. **Then** expand chart coverage  

## References

- [Architecture Contract](../architecture/contract.md)
- [Domain Model](../architecture/domain-model.md)
- [ADR-001](../decisions/ADR-001-canonical-schema-source-of-truth.md)
- [ADR-003](../decisions/ADR-003-echarts-initial-renderer-adapter.md)
- [SPEC-003](SPEC-003-canonical-schema.md) — frozen public platform API
- `domain/renderers/`
