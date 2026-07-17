# SPEC-009: Milestone 8 — Release Preparation

**Contract:** Specification  
**Problem coordinated:** What must be true before the plugin is stable enough for external users?

## Requirements

### Deliverables

- QA pass (manual scenarios in [EXECUTION_PLAN.md](../../EXECUTION_PLAN.md))
- Test coverage on schema, validation, transforms, and metadata serialization
- Sample files and sample datasets
- Plugin icon and listing copy
- Performance and accessibility checks appropriate for a Figma plugin
- Release checklist

Product Experience items (templates, recommendations, marketplace, AI, collaboration, cloud sources) are **not** release blockers; see the Future Product Experience appendix in [EXECUTION_PLAN.md](../../EXECUTION_PLAN.md).

## Acceptance

- [ ] Plugin is stable enough for external users
- [ ] Listing and samples reflect the platform positioning (not “an ECharts plugin”)
- [ ] Architecture Contract invariants still hold (no platform coupling to renderer internals)

## References

- [SPEC-001](SPEC-001-v1-product-scope.md)
- [Architecture Contract](../architecture/contract.md)
- [EXECUTION_PLAN.md](../../EXECUTION_PLAN.md) — testing strategy, Future Product Experience
