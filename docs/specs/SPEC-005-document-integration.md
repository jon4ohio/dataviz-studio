# SPEC-005: Milestone 4 — Document Integration

**Contract:** Specification  
**Problem coordinated:** How do visualizations round-trip between the editor and the Figma **document** without loss?

## Requirements

### Deliverables

- SVG insertion into the Figma document
- Auto sizing, grouping, and naming of inserted nodes
- Plugin data / metadata on the root managed node
- Selection support (none / active / managed)
- Reopen for editing: selection → read metadata → restore `VisualizationSpec` → populate UI
- Update existing managed node after edits

### Metadata

Store at least:

- `VisualizationSpec`
- Theme / palette identity as needed
- Schema / metadata version
- Renderer id and renderer version
- Plugin version

Metadata must be versioned from day one (see risks in [EXECUTION_PLAN.md](../../EXECUTION_PLAN.md)).

### Current baseline

A thin export slice already exists (Auto Layout chart frames + versioned plugin data). This milestone completes **round-trip editing** and hardens document concerns—not greenfield insert.

## Acceptance

- [ ] Round-trip editing works without loss of data or styling
- [ ] Managed selection restores editor state from document metadata
- [ ] Re-export updates the existing managed node without orphaning metadata
- [ ] Document integration consumes `RenderResult`; it does not parse ECharts options

## References

- [Architecture Contract](../architecture/contract.md)
- [ADR-001](../decisions/ADR-001-canonical-schema-source-of-truth.md)
- [SPEC-001](SPEC-001-v1-product-scope.md)
- [SPEC-004](SPEC-004-echarts-renderer.md)
- `domain/persistence/`, `plugin/`
