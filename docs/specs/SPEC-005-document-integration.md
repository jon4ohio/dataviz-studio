# SPEC-005: Milestone 4 — Document Integration

**Contract:** Specification  
**Problem coordinated:** Can a rendered visualization become a first-class design artifact without compromising the canonical model?

## Vocabulary

| Term | Meaning |
|------|---------|
| **Document Projection** | The persisted Figma representation of a visualization |
| **Renderer** | Produces a `RenderResult` |
| **Projection** | Materializes that result into the Figma document |
| **Restoration** | Reconstructs editor state from the stored `VisualizationSpec` |

## Guiding principle

> **A Figma node is a cached projection of a VisualizationSpec, never the source of truth.**

Re-render, theme change, and renderer upgrades always start from the stored Spec. Aligns with [ADR-001](../decisions/ADR-001-canonical-schema-source-of-truth.md) and the [Architecture Contract](../architecture/contract.md).

## Requirements

### Deliverables

- SVG insertion into the Figma document as a **Document Projection**
- Auto sizing, grouping, and naming of inserted nodes
- Semantic plugin metadata on the root managed node (no SVG / engine options)
- Selection support (none / active / managed)
- **Restoration:** selection → read metadata → migrate → `VisualizationSpec` → editor → Renderer → `RenderResult` → update node
- Managed updates replace the Document Projection while preserving the managed root identity

### Metadata (semantic only)

`ChartPluginMeta` v2 stores only information that cannot be regenerated:

- `schemaVersion`
- `pluginVersion`
- `rendererId`
- `rendererVersion`
- `spec` (`VisualizationSpec`)

Never store SVG, ECharts options, or renderer internals. Rule of thumb: if deleting a field would not lose user intent, it does not belong in metadata.

Layout chrome used when materializing nodes is derived at **Projection** time — not part of the metadata SoT.

All reads go through: `readMeta` → `migrateChartPluginMeta` → validated `ChartPluginMeta`.

### Current baseline

A thin export slice already exists (Auto Layout chart frames + versioned plugin data). This milestone completes **round-trip editing** and hardens document concerns—not greenfield insert.

## Acceptance

- [x] Round-trip editing works without loss of Spec data (Restoration from metadata, not from SVG)
- [x] Managed selection restores editor state from document metadata
- [x] Re-export updates the existing managed node without orphaning metadata (preserves root identity)
- [x] Document integration consumes `RenderResult`; it does not parse ECharts options

## References

- [Architecture Contract](../architecture/contract.md)
- [ADR-001](../decisions/ADR-001-canonical-schema-source-of-truth.md)
- [SPEC-001](SPEC-001-v1-product-scope.md)
- [SPEC-004](SPEC-004-echarts-renderer.md)
- Tag `v0.1.0-renderer-foundation`
- `domain/persistence/`, `plugin/`
