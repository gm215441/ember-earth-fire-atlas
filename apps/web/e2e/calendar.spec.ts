import { expect, test } from "@playwright/test";

test("calendar selection changes daily reading, URL, and real coordinate map", async ({ page }) => {
  await page.goto("/calendar?region=punjab&year=2025&sensor=MODIS&date=2025-04-29");
  await expect(page.getByRole("heading", { name: /Find the season/ })).toBeVisible({ timeout: 20_000 });
  await expect(page.locator(".calendar-reading")).toContainText("prior sample", { ignoreCase: true });
  await expect(page.locator(".calendar-map header")).toContainText("2025-04-29 UTC");
  await expect(page.locator(".calendar-point")).not.toHaveCount(0);
  const firstCount = await page.locator(".calendar-reading > h2").textContent();
  const firstPointCount = await page.locator(".calendar-point").count();

  await page.getByRole("button", { name: /^2025-04-27:/ }).click();
  await expect(page).toHaveURL(/date=2025-04-27/);
  await expect(page.locator(".calendar-map header")).toContainText("2025-04-27 UTC");
  await expect.poll(async () => page.locator(".calendar-reading > h2").textContent()).not.toBe(firstCount);
  await expect.poll(async () => page.locator(".calendar-point").count()).not.toBe(firstPointCount);
  await expect(page.locator(".reference-card")).toContainText("not a forecast or emergency rating");
  await expect(page.getByRole("link", { name: /Open this date in Explore/ })).toHaveAttribute("href", /start=2025-04-27&end=2025-04-27/);
  const compareLink = page.getByRole("link", { name: /Compare this year/ });
  await expect(compareLink).toHaveAttribute("href", /region=punjab&start=2025&end=2025&focus=MODIS/);
  await compareLink.click();
  await expect(page).toHaveURL(/\/compare\?.*focus=MODIS/);
  await expect(page.locator(".series-card").first()).toHaveClass(/is-focused/);
});

test("calendar uses prior history and refuses unavailable historical coordinates", async ({ page }) => {
  await page.goto("/calendar?region=california&year=2024&sensor=VIIRS_SNPP&date=2024-08-15");
  await expect(page.getByRole("heading", { name: /Find the season/ })).toBeVisible({ timeout: 20_000 });
  await expect(page.locator(".calendar-map")).toContainText("Historical coordinate layer unavailable");
  await expect(page.locator(".calendar-reading")).toContainText(/prior|unavailable|not enough/i);
  await expect(page).toHaveURL(/region=california/);
  await expect(page).toHaveURL(/sensor=VIIRS_SNPP/);
});

test("captures the calendar at desktop and mobile sizes", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/calendar?region=punjab&year=2025&sensor=MODIS&date=2025-04-29");
  await expect(page.getByRole("heading", { name: /Find the season/ })).toBeVisible({ timeout: 20_000 });
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(1440);
  await page.screenshot({ path: "../../artifacts/screenshots/phase07-calendar-1440x900.png" });
  await page.locator(".calendar-workbench").scrollIntoViewIfNeeded();
  await page.screenshot({ path: "../../artifacts/screenshots/phase07-days-1440x900.png" });
  await page.locator(".calendar-map").scrollIntoViewIfNeeded();
  await page.screenshot({ path: "../../artifacts/screenshots/phase07-map-1440x900.png" });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/calendar?region=punjab&year=2025&sensor=MODIS&date=2025-04-29");
  await expect(page.getByRole("heading", { name: /Find the season/ })).toBeVisible({ timeout: 20_000 });
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(390);
  await page.screenshot({ path: "../../artifacts/screenshots/phase07-calendar-390x844.png" });
  await page.locator(".day-grid").scrollIntoViewIfNeeded();
  await page.screenshot({ path: "../../artifacts/screenshots/phase07-days-390x844.png" });
  await page.locator(".calendar-map").scrollIntoViewIfNeeded();
  await page.screenshot({ path: "../../artifacts/screenshots/phase07-map-390x844.png" });
});
