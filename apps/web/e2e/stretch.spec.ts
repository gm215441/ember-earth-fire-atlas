import { expect, test } from "@playwright/test";

test("seasonal analog uses real sensor-separated profiles and preserves stream state", async ({ page }) => {
  await page.goto("/analogs?stream=MODIS");
  await expect(page.getByRole("heading", { name: /Same instrument/ })).toBeVisible({ timeout: 20_000 });
  await expect(page.locator(".analog-verdict")).toContainText("35.7");
  await expect(page.locator(".analog-verdict")).toContainText("-3 months");
  await expect(page.locator(".analog-verdict")).toContainText("81.6");
  await expect(page.locator(".analog-profile")).toHaveCount(2);
  await expect(page.locator(".analog-method")).toContainText("not", { ignoreCase: true });
  await expect(page.locator(".analog-method")).toContainText("Only two curated AOIs");

  await page.getByRole("button", { name: "VIIRS Suomi-NPP" }).click();
  await expect(page).toHaveURL(/stream=VIIRS_SNPP/);
  await expect(page.locator(".analog-controls")).toContainText("12 common profile years");
  await expect(page.locator(".analog-verdict")).toContainText("81.1");
});

test("guided science tour is keyboard-operable and announces factual checkpoints", async ({ page }) => {
  await page.goto("/tour?step=1");
  await expect(page.getByRole("heading", { name: "Begin with a detection, not a fire." })).toBeVisible({ timeout: 20_000 });
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page).toHaveURL(/step=2/);
  await expect(page.getByRole("heading", { name: "Keep the sensor histories separate." })).toBeVisible();

  await page.getByRole("button", { name: /A better fit can still fail release/ }).click();
  await expect(page.locator(".tour-facts")).toContainText("4/5 passed");
  await page.keyboard.press("ArrowRight");
  await expect(page).toHaveURL(/step=5/);
  await expect(page.getByRole("heading", { name: "End with a source-linked sheet." })).toBeVisible();
  await expect(page.getByRole("link", { name: /Generate the evidence sheet/ })).toHaveAttribute("href", /passport\?region=punjab/);
});

test("captures both stretch extensions at desktop and mobile sizes", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/analogs?stream=MODIS");
  await expect(page.getByRole("heading", { name: /Same instrument/ })).toBeVisible({ timeout: 20_000 });
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(1440);
  await page.screenshot({ path: "../../artifacts/screenshots/phase10-analogs-1440x900.png" });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.getByRole("heading", { name: /Same instrument/ })).toBeVisible({ timeout: 20_000 });
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(390);
  await page.screenshot({ path: "../../artifacts/screenshots/phase10-analogs-390x844.png" });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/tour?step=3");
  await expect(page.getByRole("heading", { name: "Context comes only from the past." })).toBeVisible({ timeout: 20_000 });
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(1440);
  await page.screenshot({ path: "../../artifacts/screenshots/phase10-tour-1440x900.png" });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.getByRole("heading", { name: "Context comes only from the past." })).toBeVisible({ timeout: 20_000 });
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(390);
  await page.screenshot({ path: "../../artifacts/screenshots/phase10-tour-390x844.png" });
});
