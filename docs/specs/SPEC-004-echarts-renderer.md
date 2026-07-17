# SPEC-004: Milestone 3 — ECharts Renderer

**Contract:** Specification  
**Problem coordinated:** How do V1 chart types become valid SVG from the canonical schema?

## Requirements

### Deliverables

- ECharts integration
- Schema-to-option transformer
- SVG rendering path
- Preview generation

Build order note: implement ECharts SVG for `bar` first, then remaining V1 chart types ([EXECUTION_PLAN.md](../../EXECUTION_PLAN.md)).

## Acceptance

- [ ] Each V1 chart type renders from the canonical schema into valid SVG

## References

- [ADR-001](../decisions/ADR-001-canonical-schema-source-of-truth.md)
- [ADR-002](../decisions/ADR-002-v1-echarts-only.md)
- [SPEC-003](SPEC-003-canonical-schema.md)
- `domain/transform/`, `domain/renderers/`
