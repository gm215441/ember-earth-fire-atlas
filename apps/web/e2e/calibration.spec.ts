import { expect, test } from "@playwright/test";

test("unvalidated calibration stays experimental and keeps source streams separate", async ({ page }) => {
  await page.goto("/compare");
  await expect(page.getByRole("heading", { name: /Two histories/ })).toBeVisible({ timeout: 20_000 });
  const section = page.locator(".calibration-section");
  await expect(section).toContainText("not validated", { ignoreCase: true });
  await expect(section).toContainText("Release decision: keep the sensor series separate");
  await expect(section.locator(".calibration-gates > div")).toHaveCount(5);
  await expect(section.locator('[data-passed="false"]')).toContainText("at least 3 independent held-out regions");
  await expect(section.getByRole("img", { name: /Held-out MAE by year/ })).toBeVisible();
  await expect(page.getByText("Validated harmonized index", { exact: true })).toHaveCount(0);
});

test("method route reports the executed split and failed release gate", async ({ page }) => {
  await page.goto("/method#validation");
  await expect(page.getByRole("heading", { name: /No calibration is accepted yet/ })).toBeVisible();
  await expect(page.locator("#validation")).toContainText("ember-overlap-ratio-v1");
  await expect(page.locator("#validation")).toContainText("2013–2018");
  await expect(page.locator("#validation")).toContainText("2019–2024");
  await expect(page.locator("#validation")).toContainText("geographic-breadth gate failed", { ignoreCase: true });
});

test("captures experimental results at desktop and mobile sizes", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/compare");
  const section = page.locator(".calibration-section");
  await expect(section).toContainText("not validated", { ignoreCase: true, timeout: 20_000 });
  await section.scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(1440);
  await page.screenshot({ path: "../../artifacts/screenshots/phase08-calibration-1440x900.png" });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/compare");
  await expect(page.locator(".calibration-section")).toContainText("not validated", { ignoreCase: true, timeout: 20_000 });
  await page.locator(".calibration-copy .eyebrow").evaluate((element) => window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 20));
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(390);
  await page.screenshot({ path: "../../artifacts/screenshots/phase08-calibration-390x844.png" });
  await page.locator(".calibration-plot").evaluate((element) => window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 20));
  await page.screenshot({ path: "../../artifacts/screenshots/phase08-calibration-plot-390x844.png" });

  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/data/calibration-validation-series.svg");
  await expect(page.locator("svg")).toBeVisible();
  await page.screenshot({ path: "../../artifacts/screenshots/phase08-validation-series-1280x720.png" });
});
