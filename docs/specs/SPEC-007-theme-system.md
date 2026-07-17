# SPEC-007: Milestone 6 — Theme System

**Contract:** Specification  
**Problem coordinated:** How does a reusable visualization design system apply across kinds and sessions?

## Requirements

### Components

- Typography
- Spacing
- Colors / palettes
- Grid
- Axis
- Legend
- Marks
- Background

### Themes

Ship a small set of named themes suitable for design work (e.g. corporate, minimal, accessible). Exact theme list may evolve; capability matters more than brand names.

### Persistence

- Palette memory
- Saved palettes
- Recent colors
- Kind-aware defaults via Visualization Registry where appropriate

### Deferred

- Figma Variables
- Design token libraries / team theme sync

Themes are **platform-owned**. Renderers apply theme tokens when producing SVG; they do not own the theme model.

## Acceptance

- [ ] Themes can be applied across the initial Cartesian family
- [ ] Palette reuse is visible and reliable across sessions
- [ ] Theme identity round-trips through document metadata with the spec

## References

- [Architecture Contract](../architecture/contract.md)
- [SPEC-001](SPEC-001-v1-product-scope.md) — reuse palette flow
- [SPEC-003](SPEC-003-canonical-schema.md)
- `domain/theme/`
