import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "shared"),
      "@domain": path.resolve(__dirname, "domain")
    }
  },
  test: {
    include: ["domain/**/*.test.ts"],
    environment: "node"
  }
});
