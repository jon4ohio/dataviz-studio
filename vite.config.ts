import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import path from "node:path";

// The UI must ship as a single self-contained HTML document — the Figma
// plugin iframe cannot load relative asset URLs.
export default defineConfig({
  root: "ui",
  plugins: [react(), viteSingleFile()],
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "shared"),
      "@domain": path.resolve(__dirname, "domain")
    }
  },
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: false,
    target: "es2017"
  }
});
