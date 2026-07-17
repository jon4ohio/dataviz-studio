import { build } from "esbuild";

// Plugin runtime bundle: a single ES2017 IIFE, as required by the Figma sandbox.
await build({
  entryPoints: ["plugin/code.ts"],
  bundle: true,
  outfile: "dist/code.js",
  platform: "browser",
  format: "iife",
  target: "es2017",
  logLevel: "info"
});
