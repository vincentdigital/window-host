import path from "node:path";
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: "http://127.0.0.1:4173" },
  webServer: {
    command: "npm run build -w @window-host/desk && npm run preview -w @window-host/desk -- --host 127.0.0.1 --port 4173",
    cwd: path.join(import.meta.dirname, "../.."),
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
