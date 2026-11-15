import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/explore?region=punjab&start=2025-01-01&end=2025-12-31");
  await expect(page.getByRole("heading", { name: "Choose a place and slice." })).toBeVisible({ timeout: 20_000 });
});

test("regional filters alter real source counts and preserve URL state", async ({ page }) => {
  const fullCount = page.locator(".map-summary > div").first().locator("strong");
  await expect(fullCount).toHaveText("239,359");
  await expect(page).toHaveURL(/region=punjab/);

  await page.getByLabel("Sensor family").selectOption("modis");
  await expect(fullCount).not.toHaveText("239,359");
  await expect(page).toHaveURL(/sensor=modis/);

  await page.getByRole("button", { name: "NRT", exact: true }).click();
  await expect(page.getByText("No detections match this slice.")).toBeVisible();
  await expect(page.getByText(/does not mean the area was observed and fire-free/i)).toBeVisible();

  await page.getByRole("button", { name: "All", exact: true }).first().click();
  await page.getByLabel("Sensor family").selectOption("viirs");
  await page.getByLabel("Satellite platform").selectOption("Suomi-NPP");
  await expect(fullCount).not.toHaveText("0");
  await expect(page).toHaveURL(/platform=Suomi-NPP/);

  await page.getByLabel("Start UTC").fill("2025-08-01");
  await page.getByLabel("End UTC").fill("2025-08-31");
  await expect(page).toHaveURL(/start=2025-08-01/);
  await expect(fullCount).not.toHaveText("239,359");
});

test("map, row inspection, provenance, and filtered CSV remain functional", async ({ page }) => {
  const map = page.locator(".regional-map");
  await expect(map).toHaveAttribute("data-map-loaded", "true", { timeout: 25_000 });
  await expect(page.locator(".maplibregl-ctrl-attrib")).toContainText(/OpenFreeMap|OpenMapTiles|OpenStreetMap/);

  await page.locator(".observation-list button").first().click();
  await expect(page.getByRole("heading", { name: "Selected source row" })).toBeVisible();
  await expect(page.locator(".observation-detail")).toContainText("UTC");
  await expect(page.locator(".observation-detail")).toContainText(/MODIS|VIIRS/);

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Download filtered display rows/ }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^ember-punjab-.*display-sample\.csv$/);

  await page.locator(".provenance-drawer summary").click();
  const sourceLink = page.getByRole("link", { name: /Open exact raw Parquet source/ });
  await expect(sourceLink).toHaveAttribute("href", /year=2025\/detections\.parquet/);

  await page.locator(".maplibregl-ctrl-zoom-in").click();
  await expect(page).toHaveURL(/zoom=/);
});

test("captures desktop and mobile regional explorer states", async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator(".regional-map")).toHaveAttribute("data-map-loaded", "true", { timeout: 25_000 });
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(1440);
  await page.screenshot({ path: "../../artifacts/screenshots/phase05-explore-punjab-1440x900.png" });

  await page.getByLabel("Curated region").selectOption("california");
  await expect(page.locator(".map-summary > div").first().locator("strong")).toHaveText("141,384");
  await expect(page.locator(".regional-map")).toHaveAttribute("data-map-loaded", "true", { timeout: 25_000 });
  await page.screenshot({ path: "../../artifacts/screenshots/phase05-explore-california-1440x900.png" });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/explore?region=punjab&start=2025-01-01&end=2025-12-31");
  await expect(page.getByRole("heading", { name: "Choose a place and slice." })).toBeVisible({ timeout: 20_000 });
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(390);
  await page.screenshot({ path: "../../artifacts/screenshots/phase05-explore-controls-390x844.png" });
  await page.locator(".map-column").scrollIntoViewIfNeeded();
  await expect(page.locator(".regional-map")).toHaveAttribute("data-map-loaded", "true", { timeout: 25_000 });
  await page.screenshot({ path: "../../artifacts/screenshots/phase05-explore-map-390x844.png" });
});
