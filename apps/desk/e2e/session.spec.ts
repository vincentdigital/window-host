import { expect, test } from "@playwright/test";

test("desk session API drives bus and reports snapshot", async ({ page }) => {
  await page.goto("/?scene=playground");
  const snap = await page.evaluate(() => window.__windowHost!.getSnapshot());
  expect(snap.sceneId).toBe("playground");
  expect(snap.panes.some((p) => p.id === "listen")).toBe(true);

  await page.evaluate(() =>
    window.__windowHost!.dispatch({
      type: "bus.publish",
      topic: "demo.ping",
      payload: { message: "playwright-session" },
    }),
  );
  await expect(page.getByText("playwright-session")).toBeVisible();
});
