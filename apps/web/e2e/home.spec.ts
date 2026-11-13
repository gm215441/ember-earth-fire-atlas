import { expect, test } from "@playwright/test";

test("renders the EMBER preflight shell without implying observations", async ({
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
    page.getByText(/no scientific observations are rendered in preflight/i),
  ).toBeVisible();
});

test("captures desktop and mobile preflight evidence", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.screenshot({
    path: "../../artifacts/screenshots/phase00-home-1440x900.png",
    fullPage: true,
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.screenshot({
    path: "../../artifacts/screenshots/phase00-home-390x844.png",
    fullPage: true,
  });
});
