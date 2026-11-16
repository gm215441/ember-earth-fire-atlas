import { expect, test } from "@playwright/test";

const routes = [
  "",
  "explore/?region=california&start=2025-01-01&end=2025-12-31",
  "calendar/?region=california&year=2025&sensor=VIIRS_SNPP&date=2025-07-04",
  "compare/?region=california&start=2013&end=2025&focus=VIIRS_SNPP",
  "passport/?region=punjab&year=2025&sensor=MODIS&date=2025-04-29",
  "method/",
  "analogs/?stream=VIIRS_SNPP",
  "tour/?step=3",
];

test("exported GitHub Pages routes load data without broken assets", async ({ page }, testInfo) => {
  const browserErrors: string[] = [];
  const failedResponses: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text());
  });
  page.on("response", (response) => {
    if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`);
  });

  for (const route of routes) {
    const response = await page.goto(route, { waitUntil: "networkidle" });
    expect(response?.ok(), `HTTP response for ${route || "home"}`).toBe(true);
    await expect(page.locator("h1").first()).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `horizontal overflow for ${route || "home"}`).toBeLessThanOrEqual(1);
  }

  expect(failedResponses, "HTTP error responses").toEqual([]);
  expect(browserErrors, "browser console errors").toEqual([]);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("", { waitUntil: "networkidle" });
  await page.screenshot({ path: testInfo.outputPath("github-pages-home-1440x900.png"), fullPage: false });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("explore/?region=california&start=2025-01-01&end=2025-12-31", { waitUntil: "networkidle" });
  await page.screenshot({ path: testInfo.outputPath("github-pages-explore-390x844.png"), fullPage: false });
});
