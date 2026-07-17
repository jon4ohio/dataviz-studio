# SPEC-003: Milestone 2 — Canonical Visualization Model

**Contract:** Specification  
**Problem coordinated:** How is every visualization fully represented without engine-, SVG-, or Figma-specific config?

## Requirements

### Deliverables

- `Dataset` model (dimensions, measures, series as appropriate)
- Visualization type / family identifiers used by the platform
- `VisualizationSpec` (layout, encoding, style, theme references, metadata as needed)
- **Visualization Registry** — registration of visualization kinds, capabilities, defaults, supported encodings, and editor configuration hooks
- Validation rules (missing data, invalid mappings, unsupported options, defaults)
- Serialization: `VisualizationSpec` ↔ JSON (powers persistence later)
- Default presets per registered visualization kind

### Exit criteria (model purity)

- Every supported visualization can be represented as a `VisualizationSpec`
- Nothing in the model references Apache ECharts
- Nothing in the model references SVG structure
- Nothing in the model references Figma APIs or node IDs

Editor UI and preview **consume** the model; they do not replace it as source of truth ([Architecture Contract](../architecture/contract.md)).

## Acceptance

- [ ] A visualization can be fully represented without referencing ECharts-specific config
- [ ] Spec validates, serializes to JSON, and deserializes without loss of editable fields
- [ ] Visualization Registry can resolve at least the initial Cartesian kinds with defaults
- [ ] Preview / controls in the UI bind to `VisualizationSpec` (even if rendering is still sample SVG until SPEC-004)

## References

- [Architecture Contract](../architecture/contract.md)
- [ADR-001](../decisions/ADR-001-canonical-schema-source-of-truth.md)
- [SPEC-001](SPEC-001-v1-product-scope.md)
- `domain/schema/`
