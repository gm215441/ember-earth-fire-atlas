import { mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

test.describe.configure({ timeout: 180_000 });

const evidenceDir = resolve("../../artifacts/screenshots/qa");
mkdirSync(evidenceDir, { recursive: true });

const routes = [
  { id: "home", path: "/", ready: ".hero-shell" },
  { id: "explore", path: "/explore?region=punjab&start=2025-01-01&end=2025-12-31", ready: ".explorer-shell" },
  { id: "calendar", path: "/calendar?region=punjab&year=2025&sensor=MODIS&date=2025-04-29", ready: ".calendar-shell" },
  { id: "compare", path: "/compare?region=punjab&start=2003&end=2025", ready: ".compare-shell" },
  { id: "passport", path: "/passport?region=punjab&year=2025&sensor=MODIS&date=2025-04-29", ready: ".passport-sheet" },
  { id: "method", path: "/method", ready: ".method-shell" },
] as const;

const viewports = [
  { id: "1440x900", width: 1440, height: 900 },
  { id: "1280x720", width: 1280, height: 720 },
  { id: "390x844", width: 390, height: 844 },
  { id: "360x740", width: 360, height: 740 },
] as const;

for (const viewport of viewports) {
  test(`visual route matrix at ${viewport.id}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const consoleErrors: string[] = [];
    const badLocalResponses: string[] = [];
    page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
    page.on("response", (response) => {
      const url = new URL(response.url());
      if ((url.hostname === "localhost" || url.hostname === "127.0.0.1") && response.status() >= 400) badLocalResponses.push(`${response.status()} ${url.pathname}`);
    });

    for (const route of routes) {
      consoleErrors.length = 0;
      badLocalResponses.length = 0;
      await page.goto(route.path);
      await expect(page.locator(route.ready)).toBeVisible({ timeout: 30_000 });
      if (route.id === "home") {
        await expect(page.locator('[data-globe-ready="true"]')).toBeVisible({ timeout: 30_000 });
      }
      if (route.id === "explore") {
        await expect(page.locator(".regional-map")).toHaveAttribute("data-map-loaded", "true", { timeout: 30_000 });
      }
      expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(viewport.width);
      expect(consoleErrors, `${route.id} console errors`).toEqual([]);
      expect(badLocalResponses, `${route.id} local HTTP failures`).toEqual([]);
      if (route.id === "explore") await expect(page.locator(".maplibregl-ctrl-attrib")).toBeAttached({ timeout: 20_000 });
      await page.screenshot({ path: resolve(evidenceDir, `${route.id}-${viewport.id}.png`) });
    }
  });
}

test("WebGL unavailable shows the real-data accessible Earth fallback", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "WebGL2RenderingContext", { configurable: true, value: undefined });
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (type === "webgl" || type === "webgl2" || type === "experimental-webgl") return null;
      return original.call(this, type as "2d", ...(args as []));
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.goto("/");
  await expect(page.getByRole("img", { name: /WebGL unavailable.*2025-08/ })).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole("link", { name: /Explore the atlas/ })).toBeVisible();
  await page.screenshot({ path: resolve(evidenceDir, "home-webgl-fallback-1280x720.png") });
});

test("source failure and zero rows remain explicit instead of fabricated", async ({ page }) => {
  await page.route("**/data/regional-2025.json", (route) => route.fulfill({ status: 503, contentType: "application/json", body: "{}" }));
  await page.goto("/explore");
  await expect(page.getByRole("heading", { name: "The observation record is unavailable." })).toBeVisible({ timeout: 20_000 });
  await expect(page.locator(".explorer-error")).toContainText("No substitute data was inserted");
  await page.unroute("**/data/regional-2025.json");

  const dataset = JSON.parse(readFileSync(resolve("public/data/regional-2025.json"), "utf8"));
  for (const region of Object.values(dataset.regions) as Array<{ observations: unknown[]; dailyCounts: unknown[] }>) {
    region.observations = [];
    region.dailyCounts = [];
  }
  await page.route("**/data/regional-2025.json", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(dataset) }));
  await page.goto("/explore");
  await expect(page.locator(".map-empty")).toContainText("0 matching source rows", { timeout: 20_000 });
  await expect(page.locator(".map-empty")).toContainText("does not mean the area was observed and fire-free");
});

test("reduced motion, delayed data, and keyboard-only navigation stay usable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".documentary")).not.toHaveAttribute("data-enhanced", "true");

  await page.route("**/data/regional-calendar-series.json", async (route) => {
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 1_200));
    await route.continue();
  });
  await page.goto("/calendar?region=punjab&year=2025&sensor=MODIS&date=2025-04-29");
  await expect(page.getByRole("status")).toContainText("Loading daily sensor histories");
  await expect(page.locator(".calendar-shell")).toBeVisible({ timeout: 20_000 });
  await page.unroute("**/data/regional-calendar-series.json");

  let reachedSelect = false;
  for (let index = 0; index < 16; index += 1) {
    await page.keyboard.press("Tab");
    reachedSelect = await page.evaluate(() => document.activeElement?.tagName === "SELECT");
    if (reachedSelect) break;
  }
  expect(reachedSelect).toBe(true);
  const focusStyle = await page.evaluate(() => {
    const element = document.activeElement as HTMLElement;
    const style = getComputedStyle(element);
    return { outline: style.outlineStyle, width: style.outlineWidth, shadow: style.boxShadow };
  });
  expect(focusStyle.outline !== "none" || focusStyle.shadow !== "none").toBe(true);

  await page.goto("/passport?region=punjab&year=2025&sensor=MODIS&date=2025-04-29");
  let reachedPrint = false;
  for (let index = 0; index < 12; index += 1) {
    await page.keyboard.press("Tab");
    reachedPrint = await page.evaluate(() => document.activeElement?.textContent?.includes("Print / Save PDF") ?? false);
    if (reachedPrint) break;
  }
  expect(reachedPrint).toBe(true);
});

test("local cold navigation records bounded layout shift and load timing", async ({ page }) => {
  await page.addInitScript(() => {
    const target = window as typeof window & { __emberQa?: { cls: number; lcp: number; longTasks: number } };
    target.__emberQa = { cls: 0, lcp: 0, longTasks: 0 };
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as Array<PerformanceEntry & { hadRecentInput?: boolean; value?: number }>) {
        if (!entry.hadRecentInput) target.__emberQa!.cls += entry.value ?? 0;
      }
    }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      target.__emberQa!.lcp = entries.at(-1)?.startTime ?? 0;
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => { target.__emberQa!.longTasks += list.getEntries().length; }).observe({ type: "longtask", buffered: true });
  });
  await page.goto("/");
  await expect(page.locator('[data-globe-ready="true"]')).toBeVisible({ timeout: 30_000 });
  await page.waitForTimeout(800);
  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    const qa = (window as typeof window & { __emberQa?: { cls: number; lcp: number; longTasks: number } }).__emberQa!;
    return { ...qa, domContentLoaded: navigation.domContentLoadedEventEnd, loadEvent: navigation.loadEventEnd };
  });
  console.log(`EMBER_QA_METRICS ${JSON.stringify(metrics)}`);
  expect(metrics.cls).toBeLessThan(0.1);
  expect(metrics.lcp).toBeLessThan(5_000);
  expect(metrics.loadEvent).toBeLessThan(8_000);
});
