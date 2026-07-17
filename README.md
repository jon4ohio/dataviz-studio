# DataViz Studio for Figma

A design-first **visualization platform** delivered as a Figma plugin. This
repository has completed **Milestone 1 — Foundation** and a thin **document
export** slice: a loadable plugin with a React UI shell, a typed UI ↔ plugin
message bridge, frozen domain boundaries, and Auto Layout frames on insert.
The preview draws an interactive *sample* chart in plain SVG; the ECharts
**renderer adapter** arrives in Milestone 3. Full round-trip editor reopen is
Milestone 4 ([SPEC-005](docs/specs/SPEC-005-document-integration.md)).

Architecture (pipeline, ownership, invariants) is normative in
[docs/architecture/contract.md](docs/architecture/contract.md). Vocabulary
(meaning) is in [docs/architecture/domain-model.md](docs/architecture/domain-model.md);
TypeScript representation lives under `domain/schema/`. Apache ECharts is
not part of the platform architecture—only the initial
`VisualizationRenderer` adapter ([ADR-003](docs/decisions/ADR-003-echarts-initial-renderer-adapter.md)).

Milestone 2 (canonical model) is implemented and **frozen** as the public
platform API. Milestone 3 (ECharts Renderer) is complete for `bar`, including
preview via `RenderResult`. Next is document integration
([SPEC-005](docs/specs/SPEC-005-document-integration.md)). After merging the
renderer work, tag `v0.1.0-renderer-foundation` before starting SPEC-005.

For contributors and agents: start at [docs/project/entry.md](docs/project/entry.md)
(project coordination).

## Setup

```sh
npm install
npm run build
```

Then in the Figma desktop app: **Plugins → Development → Import plugin from
manifest…** and pick `manifest.json` in this folder. Run the plugin from
**Plugins → Development → DataViz Studio**.

## Development

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server for the UI in a browser tab (bridge shows "Browser preview") |
| `npm run build` | Builds `dist/index.html` (single-file UI) and `dist/code.js` (plugin runtime) |
| `npm run typecheck` | Type-checks the UI/shared/domain project and the plugin runtime project |
| `npm run test` | Unit tests for the canonical schema (Dataset, Registry, validation/codec) |

After changing plugin or UI code, run `npm run build` and re-run the plugin in
Figma. The UI is bundled into one HTML document because the Figma plugin
iframe cannot load relative assets.

## Verifying the bridge and export

Inside Figma, the top bar shows:

- **Bridge** — turns green when the plugin runtime answers `ui-ready` with
  `plugin-ready`; clicking the chip sends a `ping` and shows the `pong`
  round-trip time.
- **Selection** — *none* / *active* / *managed* (managed = a DataViz Studio
  chart with versioned plugin data).
- **Export to canvas** — inserts an Auto Layout frame:

  ```text
  Chart / {title}
  ├── Title
  ├── Plot          (sample SVG vectors)
  └── Legend        (optional)
  ```

  Metadata is stored on the root frame (`dataviz-studio` plugin data, schema
  version 1). Editor reopen from that metadata is not wired yet (Milestone 4).

In a plain browser (`npm run dev`), Export explains that Figma is required.

## Architecture

```text
plugin/    Figma plugin runtime (insert Auto Layout charts + selection)
ui/        React editor shell — Data | Preview | Style
shared/    Message Bridge contracts (the only cross-runtime interface)
domain/    schema / transform / renderers / theme / persistence / import
           (schema + persistence are live; transform/renderers adapters stubbed)
```

Pipeline and invariants: [Architecture Contract](docs/architecture/contract.md).
All UI ↔ runtime communication passes through the typed contracts in
`shared/messages.ts`. Specs and ADRs live under `docs/`; build order and
Future Product Experience are in [EXECUTION_PLAN.md](EXECUTION_PLAN.md).
