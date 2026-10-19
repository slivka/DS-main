import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "/dev-server/tests/e2e", outputDir: "/tmp/pw-base-results", workers: 1,
  timeout: 90_000, expect: { timeout: 10_000 },
  use: { baseURL: "http://localhost:8091", acceptDownloads: true, viewport: { width: 1280, height: 1800 } },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
