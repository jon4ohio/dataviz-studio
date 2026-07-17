# DataViz Studio for Figma

A design-first data visualization plugin for Figma. This repository is at
**Milestone 1 — Foundation** plus a thin **canvas export** slice: a loadable
plugin with a React UI shell, a typed UI ↔ plugin message bridge, frozen
domain boundaries, and Auto Layout chart frames on insert. The preview draws
an interactive *sample* chart in plain SVG; Apache ECharts arrives in
Milestone 3. Full round-trip editor reopen is still Milestone 5 / SPEC-006.

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
  version 1). Editor reopen from that metadata is not wired yet.

In a plain browser (`npm run dev`), Export explains that Figma is required.

## Architecture

```text
plugin/    Figma plugin runtime (insert Auto Layout charts + selection)
ui/        React editor shell — Data | Preview | Style
shared/    Message Bridge contracts (the only cross-runtime interface)
domain/    schema / transform / renderers / theme / persistence / import
           (persistence serialize/parse is live; other modules are stubs)
```

All UI ↔ runtime communication passes through the typed contracts in
`shared/messages.ts`. Specs and ADRs live under `docs/`; build order and risks
are in [EXECUTION_PLAN.md](EXECUTION_PLAN.md).
