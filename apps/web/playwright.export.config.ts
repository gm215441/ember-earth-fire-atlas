import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e-export",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: process.env.STATIC_SITE_URL,
    channel: "msedge",
    ...devices["Desktop Chrome"],
  },
});
