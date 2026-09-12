import { test, expect } from "@playwright/test";

test("cart item survives a page reload right after add-to-cart", async ({ page }) => {
  await page.goto("/explore");
  await page.locator("a.cc_card").first().click();
  await expect(page).toHaveURL(/\/chef\/\d+/);

  const dishButton = page.locator("button.dc_card").first();
  await expect(dishButton).toBeVisible();
  await dishButton.click();
  await expect(page.getByRole("button", { name: "Add to cart" })).toBeVisible();
  await page.getByRole("button", { name: "Add to cart" }).click();

  // FM-FLAKE-05 FIX: Wait for cart panel to update before reloading
  const cartPanel = page.locator("aside.uc-panel");
  await expect(cartPanel.locator(".cic_root")).toHaveCount(1);

  await page.reload();

  await expect(cartPanel.locator(".cic_root")).toHaveCount(1);
});
