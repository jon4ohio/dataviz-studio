# SPEC-008: Milestone 7 — Visualization Families

**Contract:** Specification  
**Problem coordinated:** How do we expand capabilities by **family** (shared encodings and registry metadata) rather than one-off chart types?

## Requirements

### Approach

Add families through the Visualization Registry and renderer adapters. Prefer extending the ECharts adapter where it remains sufficient; introduce a new adapter only via a new ADR when the interface is proven and ECharts is a real bottleneck.

### Families (order)

1. **Circular** — pie, doughnut, polar, radar
2. **Hierarchy** — treemap, sunburst, tree
3. **Flow & networks** — sankey, force graph, chord, network
4. **Statistical** — histogram, box plot, violin, density
5. **Geographic** — maps, GeoJSON, projections, markers, heatmaps

Each family shares registry metadata, defaults, and validation patterns. Do not treat each chart as an isolated milestone.

## Acceptance

- [ ] At least one additional family beyond Cartesian is registered, validated, and rendered through `VisualizationRenderer`
- [ ] Family additions do not require changes to platform code above the registry / renderer boundary
- [ ] Document round-trip still works for new family kinds

## References

- [Architecture Contract](../architecture/contract.md)
- [ADR-003](../decisions/ADR-003-echarts-initial-renderer-adapter.md)
- [SPEC-003](SPEC-003-canonical-schema.md)
- [SPEC-004](SPEC-004-echarts-renderer.md)
- [SPEC-005](SPEC-005-document-integration.md)
