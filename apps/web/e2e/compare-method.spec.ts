import { expect, test } from "@playwright/test";

test("compare keeps raw sensors separate and filters day/night", async ({ page }) => {
  await page.goto("/compare");
  await expect(page.getByRole("heading", { name: /Two histories/ })).toBeVisible({ timeout: 20_000 });
  await expect(page.locator(".series-card")).toHaveCount(2);
  await expect(page.locator(".series-card").first()).toContainText("MODIS · Terra + Aqua");
  await expect(page.locator(".series-card").nth(1)).toContainText("VIIRS · Suomi-NPP");
  await expect(page.locator(".comparison-warning")).toContainText("Raw counts are not directly comparable");

  const initialPath = await page.locator(".series-card path").first().getAttribute("d");
  await page.getByRole("button", { name: "Day", exact: true }).click();
  await expect(page).toHaveURL(/day=D/);
  await expect.poll(async () => page.locator(".series-card path").first().getAttribute("d")).not.toBe(initialPath);

  await page.getByRole("button", { name: "Seasonal reference", exact: true }).click();
  await expect(page.locator(".comparison-warning")).toContainText("Within-sensor indices are not harmonized");
  await expect(page.getByRole("button", { name: "Day", exact: true })).toBeDisabled();
  await expect(page.locator(".series-card").first()).toContainText("MODIS seasonal reference index");
  await expect(page.locator(".series-card").nth(1)).toContainText("VIIRS SNPP seasonal reference index");

  await page.getByLabel("Region").selectOption("california");
  await expect(page).toHaveURL(/region=california/);
  await expect(page.getByText("California, USA", { exact: false }).first()).toBeVisible();
  await expect(page.locator(".fleet-row")).not.toHaveCount(0);
});

test("method route exposes provenance and explicit limitations", async ({ page }) => {
  await page.goto("/method");
  await expect(page.getByRole("heading", { name: /Read the signal/ })).toBeVisible();
  await expect(page.getByText(/positive-only/i).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: /No calibration is accepted yet/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /NASA FIRMS archive/ })).toHaveAttribute("href", /firms\.modaps\.eosdis\.nasa\.gov/);
  await expect(page.getByRole("link", { name: /Portolan FIRMS catalog/ })).toHaveAttribute("href", /source\.coop/);
});

test("captures compare and method at desktop and mobile sizes", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/compare");
  await expect(page.getByRole("heading", { name: /Two histories/ })).toBeVisible({ timeout: 20_000 });
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(1440);
  await page.screenshot({ path: "../../artifacts/screenshots/phase06-compare-1440x900.png" });
  await page.getByRole("button", { name: "Seasonal reference", exact: true }).click();
  await expect(page.locator(".series-card svg path")).toHaveCount(2);
  await page.screenshot({ path: "../../artifacts/screenshots/phase06-reference-1440x900.png" });
  await page.locator(".fleet-section").scrollIntoViewIfNeeded();
  await page.screenshot({ path: "../../artifacts/screenshots/phase06-fleet-1440x900.png" });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/compare");
  await expect(page.getByRole("heading", { name: /Two histories/ })).toBeVisible({ timeout: 20_000 });
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(390);
  await page.screenshot({ path: "../../artifacts/screenshots/phase06-compare-390x844.png" });
  await page.locator(".series-card").first().scrollIntoViewIfNeeded();
  await page.screenshot({ path: "../../artifacts/screenshots/phase06-series-390x844.png" });

  await page.goto("/method");
  await expect(page.getByRole("heading", { name: /Read the signal/ })).toBeVisible();
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(390);
  await page.screenshot({ path: "../../artifacts/screenshots/phase06-method-390x844.png" });
});
