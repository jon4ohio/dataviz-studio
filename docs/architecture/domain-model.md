# Domain Model — DataViz Studio

**Contract:** Domain Model  
**Problem coordinated:** What vocabulary and meanings does the platform share—independent of TypeScript representation?

This document defines **meaning**. The schema under `domain/schema/` is one **representation** of these concepts. Do not treat this file as a mirror of interfaces.

```text
Domain Model     ← meaning (this document)
        │
        ▼
Schema           ← representation (domain/schema/)
        │
        ▼
Validation       ← parse → structural → semantic → normalize
        │
        ▼
Registry         ← metadata about kinds (not rendering)
```

## Entity vocabulary

### Data

| Concept | Meaning |
|---------|---------|
| Dataset | Tabular information the platform can encode |
| Field | A named column with a declared role and value type |
| Value | A single cell (string, number, boolean, or null) |
| Series | A named grouping of related measure fields or value sequences |

### Visualization

| Concept | Meaning |
|---------|---------|
| Visualization | A presentation of a dataset (schema type: `VisualizationSpec`) |
| Chart Type | Registry identity of a visualization kind (e.g. `bar`, `scatter`) |
| Encoding | Mapping of fields to visual channels (position, color, size, …) |
| Layer | A composable mark/encoding unit within one visualization |
| Annotation | Non-data-driven callout (label, reference line intent, note) |

**Layer** is first-class even when the first usable release uses a single primary layer. Multi-mark compositions (e.g. scatter + regression + average) are layers of one visualization—not separate charts.

**Scale** (linear / category / time / …) is an encoding concern (scale *kind*). Tick generation and layout math remain **renderer-owned** ([Architecture Contract](contract.md)).

### Presentation

| Concept | Meaning |
|---------|---------|
| Theme | Shared presentation rules referenced by id |
| Legend | Intent for whether/where a legend appears |
| Layout | Size, padding, and plot-area intent |
| Style | Mark- and chrome-level visual preferences |

### Rendering

| Concept | Meaning |
|---------|---------|
| VisualizationRenderer | Adapter that turns a visualization into host-agnostic output |
| RenderResult | Renderer output (`success`, `svg`, size, `renderer` / `version`, warnings)—not editable SoT; no Figma nodes |
| Visualization Registry | Metadata describing visualization kinds |

## Relationships

```text
Visualization
    ├── Dataset
    ├── Encoding
    ├── Layer[]          (may be a single primary layer)
    ├── Theme (ref)
    ├── Annotation[]
    ├── Metadata
    └── Chart Type

Dataset
    ├── Field[]
    └── rows of Value (and optional Series groupings)

VisualizationRenderer
    └── consumes Visualization → RenderResult

Visualization Registry
    └── describes Chart Types (metadata only)
```

## Lifecycle

```text
Import Data
      ↓
Dataset
      ↓
Visualization
      ↓
Validation
      ↓
Registry lookup
      ↓
Renderer
      ↓
RenderResult
      ↓
Figma Node
```

## Visualization Registry

**Owns:** chart metadata, default configuration, supported encodings, capability flags.

**Does NOT own:** rendering, layout, SVG generation.

## Validation stages

```text
Parse → Structural Validation → Semantic Validation → Normalization
```

- **Structural:** missing fields, wrong types
- **Semantic:** kind-specific encoding rules (e.g. bar needs a category dimension; scatter needs two measures)
- **Normalization:** fill defaults from the registry, normalize ids and presentation tokens

## Serialization

`serialize` / `deserialize` preserve **intent**, not implementation.

- Allowed: `kind = "bar"`, dataset, encodings, theme refs
- Forbidden in the model: `renderer = "echarts"`, embedded SVG, Figma node ids

See [ADR-001](../decisions/ADR-001-canonical-schema-source-of-truth.md).

## Public Platform API

After [SPEC-003](../specs/SPEC-003-canonical-schema.md), these contracts are the public platform API:

- `VisualizationSpec`
- `Dataset`
- Visualization Registry
- `VisualizationRenderer`
- `RenderResult`

These contracts are considered **stable** after SPEC-003. Changes require an ADR or an approved breaking-change proposal.

## Glossary

| Term | Meaning |
|------|---------|
| Dataset | Raw tabular information |
| Visualization | A presentation of a dataset |
| Encoding | Mapping data to visual channels |
| Layer | A composable mark/encoding unit within a visualization |
| Theme | Shared presentation rules |
| Registry | Metadata describing visualization kinds |
| Renderer | Converts a visualization into output |
| RenderResult | Renderer output independent of host application |

## References

- [Architecture Contract](contract.md)
- [SPEC-003](../specs/SPEC-003-canonical-schema.md)
- [ADR-001](../decisions/ADR-001-canonical-schema-source-of-truth.md)
- Schema representation: `domain/schema/`
- Renderer contracts: `domain/renderers/`
