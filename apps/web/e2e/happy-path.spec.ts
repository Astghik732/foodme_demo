import { test, expect } from "@playwright/test";

test("explore -> chef -> add 2 dishes -> cart total -> cash checkout -> success", async ({ page }) => {
  await page.goto("/explore");

  const firstChefCard = page.locator("a.cc_card").first();
  await expect(firstChefCard).toBeVisible();
  await firstChefCard.click();

  await expect(page).toHaveURL(/\/chef\/\d+/);

  const dishButtons = page.locator("button.dc_card");
  await expect(dishButtons.first()).toBeVisible();

  // Add first dish
  await dishButtons.nth(0).click();
  await page.getByRole("button", { name: "Add to cart" }).click();

  // Add second dish
  await dishButtons.nth(1).click();
  await page.getByRole("button", { name: "Add to cart" }).click();

  const cartPanel = page.locator("aside.uc-panel");
  await expect(cartPanel.locator(".cic_root")).toHaveCount(2);

  await cartPanel.getByRole("link", { name: "Go to checkout" }).click();
  await expect(page).toHaveURL(/\/checkout/);

  await page.getByLabel("Full name").fill("Ann Test");
  await page.getByLabel("Phone").fill("+37491234567");
  await page.getByLabel("Email").fill("ann@example.com");
  await page.getByLabel("City").fill("Yerevan");
  await page.getByLabel("Street").fill("Abovyan");

  await page.getByRole("button", { name: "Place order" }).click();

  await expect(page).toHaveURL(/\/orders\/success/);
  await expect(page.getByText("Order placed!")).toBeVisible();
});
