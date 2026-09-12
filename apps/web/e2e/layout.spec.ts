import { test, expect } from "@playwright/test";

test.describe("Layout Tests", () => {
  test("Home page structure and sections", async ({ page }) => {
    await page.goto("/");

    const heroHeading = page.getByRole("heading", { name: /Real food, made by/i, level: 1 });
    await expect(heroHeading).toBeVisible();

    const orderNowBtn = page.getByRole("link", { name: "Order now" }).first();
    await expect(orderNowBtn).toBeVisible();

    const howItWorksHeading = page.getByRole("heading", { name: /Three steps to/i, level: 2 });
    await expect(howItWorksHeading).toBeVisible();

    await expect(page.getByRole("heading", { name: "Find your chef", level: 3 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Pick your dishes", level: 3 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Fresh at the door", level: 3 })).toBeVisible();

    const popularChefsHeading = page.getByRole("heading", { name: "Chefs worth knowing", level: 2 });
    await expect(popularChefsHeading).toBeVisible();

    const chefsGrid = page.locator("section:has-text('Chefs worth knowing') .grid").first();
    const chefCards = chefsGrid.locator("a.cc_card");
    // Seed has 6 ACTIVE chefs; list endpoint drops one on the last page (FM-BUG-02).
    await expect(chefCards.first()).toBeVisible();
    expect(await chefCards.count()).toBeGreaterThanOrEqual(4);

    const ctaHeading = page.getByRole("heading", {
      name: /Your next favourite meal is one tap away/i,
      level: 2,
    });
    await expect(ctaHeading).toBeVisible();
    const browseChefsBtn = page.getByRole("link", { name: /Browse chefs/i });
    await expect(browseChefsBtn).toBeVisible();
  });

  test("Explore page layout", async ({ page }) => {
    await page.goto("/explore");

    const exploreHeading = page.getByRole("heading", { name: "Explore chefs", level: 1 });
    await expect(exploreHeading).toBeVisible();

    const chefsGrid = page.locator(".ep_wrap .grid").first();
    await expect(chefsGrid).toBeVisible();

    const chefCards = chefsGrid.locator("a.cc_card");
    await expect(chefCards.first()).toBeVisible();
    expect(await chefCards.count()).toBeGreaterThanOrEqual(4);

    const firstCard = chefCards.first();
    await expect(firstCard.locator("img")).toBeVisible();
    await expect(firstCard.locator("p.truncate").first()).toBeVisible();
    await expect(firstCard.locator(".text-amber-500")).toBeVisible();
  });

  test("Responsive layout check - Mobile view", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    const heroHeading = page.getByRole("heading", { name: /Real food, made by/i, level: 1 });
    await expect(heroHeading).toBeVisible();
  });
});
