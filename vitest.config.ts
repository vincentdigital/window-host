import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: [
      "packages/**/*.test.ts",
      "packages/**/*.test.tsx",
      "test/**/*.test.ts",
      "test/**/*.test.tsx",
    ],
  },
  resolve: {
    alias: {
      "@window-host/schema": path.resolve(__dirname, "packages/schema/src/index.ts"),
      "@window-host/core": path.resolve(__dirname, "packages/core/src/index.ts"),
      "@window-host/widgets": path.resolve(__dirname, "packages/widgets/src/index.ts"),
      "@window-host/shell": path.resolve(__dirname, "packages/shell/src/index.ts"),
    },
  },
});
