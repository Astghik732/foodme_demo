import { test, expect } from "@playwright/test";
import { createOrderViaApi, signInViaStorage } from "./auth";

// KAN-5: customers rate delivered orders from My Orders (1-5 stars + optional comment).
const API = process.env.VITE_API_BASE_URL || "http://localhost:8081";

test.describe("Order ratings", () => {
  test("customer rates a delivered order and the rating survives a reload", async ({ page, request }) => {
    const { auth, number } = await createOrderViaApi(request, API, { deliver: true });
    await signInViaStorage(page, auth);

    await page.goto("/orders");
    await page.getByRole("button", { name: `Rate order ${number}` }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByPlaceholder("Tell us about your order")).toBeVisible();
    await dialog.getByRole("radio", { name: "4 stars" }).click();
    await dialog.getByPlaceholder("Tell us about your order").fill("Tasty and hot");
    await dialog.getByRole("button", { name: "Submit rating" }).click();

    await expect(dialog).toBeHidden();
    const rated = page.getByTestId(`order-rating-${number}`);
    await expect(rated.getByRole("img", { name: "Rated 4 out of 5 stars" })).toBeVisible();
    await expect(rated.getByText("Tasty and hot")).toBeVisible();
    await expect(page.getByRole("button", { name: `Rate order ${number}` })).toHaveCount(0);

    await page.reload();
    await expect(
      page.getByTestId(`order-rating-${number}`).getByRole("img", { name: "Rated 4 out of 5 stars" }),
    ).toBeVisible();

    // R13: the rating also shows on the tracking page
    await page.goto(`/tracking/${number}`);
    await expect(page.getByText("Your rating")).toBeVisible();
    await expect(page.getByRole("img", { name: "Rated 4 out of 5 stars" })).toBeVisible();
  });

  test("orders that are not delivered have no rating option", async ({ page, request }) => {
    const { auth, number } = await createOrderViaApi(request, API, { deliver: false });
    await signInViaStorage(page, auth);

    await page.goto("/orders");
    await expect(page.getByText(number)).toBeVisible();
    await expect(page.getByRole("button", { name: /Rate order/ })).toHaveCount(0);
  });

  test("submitting without choosing stars asks for a rating", async ({ page, request }) => {
    const { auth, number } = await createOrderViaApi(request, API, { deliver: true });
    await signInViaStorage(page, auth);

    await page.goto("/orders");
    await page.getByRole("button", { name: `Rate order ${number}` }).click();
    await page.getByRole("button", { name: "Submit rating" }).click();

    await expect(page.getByRole("dialog").getByText("Choose a star rating")).toBeVisible();
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("a failed save shows the reason and lets the customer try again", async ({ page, request }) => {
    const { auth, number } = await createOrderViaApi(request, API, { deliver: true });
    await signInViaStorage(page, auth);

    await page.route("**/api/customer/orders/*/rating", (route) =>
      route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ message: "Order already reviewed." }),
      }),
    );

    await page.goto("/orders");
    await page.getByRole("button", { name: `Rate order ${number}` }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("radio", { name: "2 stars" }).click();
    await dialog.getByRole("button", { name: "Submit rating" }).click();

    await expect(dialog.getByRole("alert").filter({ hasText: "Order already reviewed." })).toBeVisible();

    await page.unroute("**/api/customer/orders/*/rating");
    await dialog.getByRole("button", { name: "Try again" }).click();
    await expect(dialog).toBeHidden();
    await expect(
      page.getByTestId(`order-rating-${number}`).getByRole("img", { name: "Rated 2 out of 5 stars" }),
    ).toBeVisible();
  });

  test("stars can be chosen with the keyboard", async ({ page, request }) => {
    const { auth, number } = await createOrderViaApi(request, API, { deliver: true });
    await signInViaStorage(page, auth);

    await page.goto("/orders");
    await page.getByRole("button", { name: `Rate order ${number}` }).click();
    const dialog = page.getByRole("dialog");

    await dialog.getByRole("radio", { name: "1 star" }).focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await expect(dialog.getByRole("radio", { name: "3 stars" })).toBeChecked();
    await page.keyboard.press("End");
    await expect(dialog.getByRole("radio", { name: "5 stars" })).toBeChecked();
  });

  test.describe("mobile", () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test("rating window fits a phone screen", async ({ page, request }) => {
      const { auth, number } = await createOrderViaApi(request, API, { deliver: true });
      await signInViaStorage(page, auth);

      await page.goto("/orders");
      await page.getByRole("button", { name: `Rate order ${number}` }).click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();

      const box = await dialog.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(375);
      await expect(dialog.getByRole("button", { name: "Submit rating" })).toBeInViewport();
    });
  });
});
