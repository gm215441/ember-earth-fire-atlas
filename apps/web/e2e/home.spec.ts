import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('[data-globe-ready="true"]')).toBeVisible({
    timeout: 20_000,
  });
});

test("renders the EMBER hero without implying harmonization", async ({
  page,
}) => {
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Every place has a history of burning.",
    }),
  ).toBeVisible();
  await expect(
    page.locator(".hero-frame").getByText("Raw mixed fleet · not harmonized", {
      exact: true,
    }),
  ).toBeVisible();
});

test("changes the rendered real-data snapshot", async ({ page }) => {
  const globeStage = page.locator(".globe-stage");
  await expect(globeStage.getByText("8.4M", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /2020 01/ }).click();
  await expect(globeStage.getByText("4.1M", { exact: true })).toBeVisible();
});

test("clicking the globe returns a geolocated selection", async ({ page }) => {
  const canvas = page.locator(".globe-host canvas");
  const bounds = await canvas.boundingBox();
  expect(bounds).not.toBeNull();

  await canvas.click({
    position: {
      x: Math.round((bounds?.width ?? 600) / 2),
      y: Math.round((bounds?.height ?? 600) / 2),
    },
  });

  await expect(page.getByTestId("globe-selection")).toContainText(
    /selected coordinate/i,
  );
  await expect(page.getByTestId("globe-selection")).toContainText(/[NS].*[EW]/);
});

test("timeline playback remains responsive and pauses on interaction", async ({
  page,
}) => {
  const timeline = page.locator(".timeline-ribbon");
  await page.getByRole("button", { name: "Play timeline" }).click();
  await expect(timeline).toHaveAttribute("data-timeline-state", "playing");
  await page.getByRole("button", { name: "Pause timeline" }).click();
  await expect(timeline).toHaveAttribute("data-timeline-state", "paused");
});

test("captures distinct real months and responsive phase 03 evidence", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.reload();
  await expect(page.locator('[data-globe-ready="true"]')).toBeVisible({
    timeout: 20_000,
  });
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(
    1440,
  );
  await page.screenshot({
    path: "../../artifacts/screenshots/phase03-home-2025-08-1440x900.png",
  });

  await page.getByRole("button", { name: "2020 01" }).click();
  await expect(
    page.locator(".globe-stage").getByText("4.1M", { exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "../../artifacts/screenshots/phase03-home-2020-01-1440x900.png",
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.locator('[data-globe-ready="true"]')).toBeVisible({
    timeout: 20_000,
  });
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(
    390,
  );
  await page.screenshot({
    path: "../../artifacts/screenshots/phase03-home-390x844.png",
    fullPage: true,
  });
});

test("keeps the browser console clean", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.reload();
  await expect(page.locator('[data-globe-ready="true"]')).toBeVisible({
    timeout: 20_000,
  });
  expect(errors).toEqual([]);
});

test("documentary scroll does not overwrite a manual month", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.reload();
  const documentary = page.locator(".documentary");
  await expect(documentary).toHaveAttribute("data-enhanced", "true");

  await page.getByRole("button", { name: "2020-01" }).click();
  await expect(page.getByRole("button", { name: "2020-01" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  await page.locator('[data-documentary-marker="2"]').scrollIntoViewIfNeeded();
  await expect(documentary).toHaveAttribute("data-active-scene", "2");
  await expect(documentary).toHaveAttribute("data-period", "2020-01");
});

test("documentary motion can be paused without scroll lock", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.reload();
  const documentary = page.locator(".documentary");
  await expect(documentary).toHaveAttribute("data-enhanced", "true");
  await page.getByRole("button", { name: "Pause motion" }).click();
  await expect(documentary).toHaveAttribute("data-motion-paused", "true");
  await expect(documentary).not.toHaveAttribute("data-enhanced", "true");
  expect(
    await page.evaluate(() => getComputedStyle(document.body).overflowY),
  ).not.toBe("hidden");
});

test("captures four distinct documentary states and the compact layout", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.reload();
  const documentary = page.locator(".documentary");
  await expect(documentary).toHaveAttribute("data-enhanced", "true");

  for (const scene of [0, 1, 2, 3]) {
    await page
      .locator(`[data-documentary-marker="${scene}"]`)
      .scrollIntoViewIfNeeded();
    await expect(documentary).toHaveAttribute(
      "data-active-scene",
      String(scene),
    );
    await page.screenshot({
      path: `../../artifacts/screenshots/phase04-scene-${scene + 1}-1440x900.png`,
    });
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator(".documentary-header").scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(
    390,
  );
  await page.screenshot({
    path: "../../artifacts/screenshots/phase04-documentary-390x844.png",
  });

  await page.locator('[data-documentary-panel="2"]').scrollIntoViewIfNeeded();
  await page.screenshot({
    path: "../../artifacts/screenshots/phase04-sensor-390x844.png",
  });

  await page.locator('[data-documentary-panel="3"]').scrollIntoViewIfNeeded();
  await page.screenshot({
    path: "../../artifacts/screenshots/phase04-region-390x844.png",
  });
});
