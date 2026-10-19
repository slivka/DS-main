import { defineConfig, devices } from "@playwright/test";

/**
 * Lokálně i na CI se testuje proti dev serveru: 11 specifikací importuje v prohlížeči
 * zdrojové moduly (`import("/src/lib/app-zoom.ts")`), které produkční build neobsahuje.
 */
const ci = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: ci ? "test-results" : "/tmp/slivka-playwright-results",
  fullyParallel: false,
  workers: ci ? 4 : 1,
  ...(ci ? { retries: 1, reporter: [["github"], ["html", { open: "never" }]] } : {}),
  timeout: 90_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: "http://localhost:8080",
    acceptDownloads: true,
    trace: "retain-on-failure",
    viewport: { width: 1280, height: 1800 },
  },
  webServer: {
    command: "bun run dev",
    url: "http://localhost:8080",
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
