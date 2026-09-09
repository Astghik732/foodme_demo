import { test, expect } from "@playwright/test";

test("dish modal opens and dish can be added to cart", async ({ page }) => {
  await page.goto("/explore");
  await page.locator("a.cc_card").first().click();
  await expect(page).toHaveURL(/\/chef\/\d+/);

  const dishButton = page.locator("button.dc_card").first();
  await expect(dishButton).toBeVisible();
  await dishButton.click();

  // FM-FLAKE-01
  await page.waitForTimeout(300);

  await page.getByRole("button", { name: "Add to cart" }).click();

  const cartPanel = page.locator("aside.uc-panel");
  await expect(cartPanel.locator(".cic_root")).toHaveCount(1);
});
