# SPEC-002: Milestone 1 — Foundation

**Contract:** Specification  
**Problem coordinated:** What must exist for a loadable plugin with a stable UI ↔ plugin development loop?

## Requirements

### Deliverables

- Plugin scaffold
- Build system
- Typed codebase
- UI shell
- Message bridge between UI and plugin thread

### Stack

- TypeScript
- React for UI
- Vite (or equivalent) lightweight build
- Shared types for plugin/UI contracts (`shared/`)

## Acceptance

- [x] Plugin loads in Figma
- [x] UI can send commands to plugin thread
- [x] Basic development workflow is stable (`npm run build` / `npm run typecheck` / Figma import)

## References

- [README.md](../../README.md) — setup and bridge verification
- [SPEC-001](SPEC-001-v1-product-scope.md)
- `shared/messages.ts`, `plugin/`, `ui/`
