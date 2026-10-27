import { expect, test } from "@playwright/test";

test("duet scene persists split after drag", async ({ page }) => {
  await page.goto("/?scene=duet");
  const divider = page.getByRole("separator");
  await expect(divider).toBeVisible();
  const box = await divider.boundingBox();
  if (!box) throw new Error("no divider box");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + 120, box.y + box.height / 2);
  await page.mouse.up();
  const stored = await page.evaluate(() => localStorage.getItem("window-host.layout.duet.split-horizontal"));
  expect(stored).not.toBeNull();
  const ratio = Number(stored);
  expect(ratio).toBeGreaterThan(0.5);
});

test("rail scene shows three panes", async ({ page }) => {
  await page.goto("/?scene=rail");
  await expect(page.getByLabel("Zoom out")).toBeVisible();
  await expect(page.getByLabel("Zoom in")).toBeVisible();
  await expect(page.getByText("Focus")).toBeVisible();
});
