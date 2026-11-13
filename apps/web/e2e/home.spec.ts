import { expect, test } from "@playwright/test";

test("renders the EMBER hero without implying harmonization", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Every place has a history of burning.",
    }),
  ).toBeVisible();
  await expect(
    page.getByText(/raw mixed fleet · not harmonized/i),
  ).toBeVisible();
});

test("changes the rendered real-data snapshot", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("8.4M")).toBeVisible();
  await page.getByRole("button", { name: /2020 01/ }).click();
  await expect(page.getByText("4.1M")).toBeVisible();
});

test("captures desktop and mobile phase 02 evidence", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(
    1440,
  );
  await page.screenshot({
    path: "../../artifacts/screenshots/phase02-home-1440x900.png",
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(
    390,
  );
  await page.screenshot({
    path: "../../artifacts/screenshots/phase02-home-390x844.png",
    fullPage: true,
  });
});
