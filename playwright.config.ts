import { defineConfig, devices } from "@playwright/test";

/** CI (nebo E2E_PROD=1) testuje produkční build přes `vite preview`; lokálně dev server. */
const ci = Boolean(process.env.CI);
const prod = ci || process.env.E2E_PROD === "1";
const baseURL = prod ? "http://localhost:4173" : "http://localhost:8080";

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: ci ? "test-results" : "/tmp/slivka-playwright-results",
  fullyParallel: false,
  workers: ci ? 4 : 1,
  retries: ci ? 1 : 0,
  reporter: ci ? [["github"], ["html", { open: "never" }]] : "list",
  timeout: 90_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    acceptDownloads: true,
    trace: "retain-on-failure",
    viewport: { width: 1280, height: 1800 },
  },
  webServer: {
    // Build připraví předchozí krok (check:full); preview spustí worker ve workerd.
    command: prod ? "bunx vite preview --port 4173 --strictPort" : "bun run dev",
    url: baseURL,
    reuseExistingServer: !ci,
    timeout: 120_000,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
