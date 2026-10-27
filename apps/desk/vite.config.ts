import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@window-host/schema": path.resolve(__dirname, "../../packages/schema/src/index.ts"),
      "@window-host/core": path.resolve(__dirname, "../../packages/core/src/index.ts"),
      "@window-host/widgets": path.resolve(__dirname, "../../packages/widgets/src/index.ts"),
      "@window-host/shell": path.resolve(__dirname, "../../packages/shell/src/index.ts"),
    },
  },
  publicDir: "public",
});
