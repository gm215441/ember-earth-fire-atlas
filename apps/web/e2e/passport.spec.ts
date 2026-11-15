import { mkdirSync, statSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

const outputDir = resolve("../../output/pdf");

test("passport preserves selection and prints computed source-linked facts", async ({ page }) => {
  await page.goto("/passport?region=punjab&year=2025&sensor=MODIS&date=2025-04-29");
  await expect(page.getByRole("heading", { name: "Punjab, Pakistan", exact: true })).toBeVisible({ timeout: 20_000 });
  await expect(page.locator(".passport-lead")).toContainText("largest raw monthly count");
  await expect(page.locator(".passport-selected")).toContainText("195");
  await expect(page.locator(".passport-signature > div > div")).toHaveCount(12);
  await expect(page.locator(".passport-footer")).toContainText("region=punjab&year=2025&sensor=MODIS&date=2025-04-29");
  await expect(page.getByRole("link", { name: "NASA FIRMS archive" })).toHaveAttribute("href", /firms\.modaps\.eosdis\.nasa\.gov/);
  await expect(page.getByRole("link", { name: "Portolan catalog" })).toHaveAttribute("href", /source\.coop/);
  await expect(page.locator(".passport-provenance")).toContainText("unvalidated", { ignoreCase: true });
});

test("print action remains available on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/passport?region=california&year=2025&sensor=VIIRS_SNPP&date=2025-08-15");
  const printButton = page.getByRole("button", { name: "Print / Save PDF" });
  await expect(printButton).toBeVisible({ timeout: 20_000 });
  await page.evaluate(() => { window.print = () => { document.documentElement.dataset.printRequested = "true"; }; });
  await printButton.click();
  await expect(page.locator("html")).toHaveAttribute("data-print-requested", "true");
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(390);
});

test("captures browser and creates A4 plus Letter print artifacts", async ({ page }) => {
  mkdirSync(outputDir, { recursive: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/passport?region=punjab&year=2025&sensor=MODIS&date=2025-04-29");
  await expect(page.getByRole("heading", { name: "Punjab, Pakistan", exact: true })).toBeVisible({ timeout: 20_000 });
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(1440);
  await page.screenshot({ path: "../../artifacts/screenshots/phase09-passport-1440x900.png" });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.getByRole("heading", { name: "Punjab, Pakistan", exact: true })).toBeVisible({ timeout: 20_000 });
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(390);
  await page.screenshot({ path: "../../artifacts/screenshots/phase09-passport-390x844.png" });

  await page.emulateMedia({ media: "print" });
  await page.pdf({ path: resolve(outputDir, "ember-punjab-passport-a4.pdf"), format: "A4", printBackground: true, margin: { top: "0", right: "0", bottom: "0", left: "0" } });
  await page.pdf({ path: resolve(outputDir, "ember-punjab-passport-letter.pdf"), format: "Letter", printBackground: true, margin: { top: "0", right: "0", bottom: "0", left: "0" } });
  expect(statSync(resolve(outputDir, "ember-punjab-passport-a4.pdf")).size).toBeGreaterThan(50_000);
  expect(statSync(resolve(outputDir, "ember-punjab-passport-letter.pdf")).size).toBeGreaterThan(50_000);
});
