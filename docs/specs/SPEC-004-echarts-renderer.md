# SPEC-004: Milestone 3 — ECharts Renderer Adapter

**Contract:** Specification  
**Problem coordinated:** How does the first `VisualizationRenderer` adapter turn a `VisualizationSpec` into a `RenderResult`?

## Requirements

### Deliverables

- ECharts renderer adapter implementing `VisualizationRenderer`
- Schema-to-ECharts-option transform (adapter-only; not part of the platform model)
- SVG rendering path producing `RenderResult`
- Preview generation in the editor from the adapter

### Initial Cartesian family

Support via this adapter (implement **`bar` first**, then the rest of the family):

- Bar
- Column
- Line
- Area
- Scatter
- Mixed

Do not expand this milestone to Circular, Hierarchy, Flow, Statistical, or Geographic families ([SPEC-008](SPEC-008-visualization-families.md)).

### Ownership

Per [Architecture Contract](../architecture/contract.md): layout, geometry, coordinate systems, scales, and SVG generation are **renderer-owned**. Platform code MUST NOT import ECharts outside this adapter.

## Acceptance

- [ ] `VisualizationRenderer` is implemented by an ECharts adapter
- [ ] Each initial Cartesian kind renders from `VisualizationSpec` into a valid `RenderResult` (SVG)
- [ ] Editor preview uses the adapter output for supported kinds
- [ ] No ECharts types or option fields appear on `VisualizationSpec`

## References

- [Architecture Contract](../architecture/contract.md)
- [ADR-001](../decisions/ADR-001-canonical-schema-source-of-truth.md)
- [ADR-003](../decisions/ADR-003-echarts-initial-renderer-adapter.md)
- [SPEC-003](SPEC-003-canonical-schema.md)
- `domain/transform/`, `domain/renderers/`
