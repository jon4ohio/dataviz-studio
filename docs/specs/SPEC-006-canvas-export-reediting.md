# SPEC-006: Milestone 5 — Canvas Export and Re-editing

**Contract:** Specification  
**Problem coordinated:** How do charts round-trip between editor and Figma canvas without loss?

## Requirements

### Deliverables

- Insert SVG into Figma canvas
- Attach metadata on the inserted node
- Detect selected managed chart
- Reopen chart for editing
- Update existing chart node

Metadata must support versioning from day one (see risks in [EXECUTION_PLAN.md](../../EXECUTION_PLAN.md)).

## Acceptance

- [ ] Round-trip editing works without loss of data or styling

## References

- [ADR-001](../decisions/ADR-001-canonical-schema-source-of-truth.md)
- [SPEC-001](SPEC-001-v1-product-scope.md)
- `domain/persistence/`, `plugin/`
