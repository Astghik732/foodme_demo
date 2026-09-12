import { test, expect } from "@playwright/test";

const API = process.env.VITE_API_BASE_URL || "http://localhost:8081";

test("explore -> chef -> add 2 dishes -> cart total -> cash checkout -> success", async ({
  page,
}) => {
  await page.goto("/explore");

  const firstChefCard = page.locator("a.cc_card").first();
  await expect(firstChefCard).toBeVisible();
  await firstChefCard.click();

  await expect(page).toHaveURL(/\/chef\/\d+/);

  const dishButtons = page.locator("button.dc_card");
  await expect(dishButtons.first()).toBeVisible();

  await dishButtons.nth(0).click();
  await page.getByRole("button", { name: "Add to cart" }).click();

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

test("dish modal additions raise cart line price", async ({ page }) => {
  const chefs = await page.request.get(`${API}/api/chef/active?page=0&size=12`);
  expect(chefs.ok()).toBeTruthy();
  const chefBody = await chefs.json();

  let chefId: number | null = null;
  let dishName: string | null = null;
  for (const chef of chefBody.exploreChefResponseDtoList) {
    const detail = await (await page.request.get(`${API}/api/chef/${chef.id}`)).json();
    // Prefer a dish early in the sorted list so it is visible without scrolling forever.
    const found = (detail.dishes || [])
      .slice(0, 12)
      .find((d: { additions?: unknown[]; nameEn?: string }) => d.additions && d.additions.length > 0);
    if (found) {
      chefId = chef.id;
      dishName = found.nameEn;
      break;
    }
  }
  expect(chefId).toBeTruthy();
  expect(dishName).toBeTruthy();

  await page.goto(`/chef/${chefId}`);
  const dishBtn = page.locator("button.dc_card").filter({ hasText: dishName! }).first();
  await dishBtn.scrollIntoViewIfNeeded();
  await dishBtn.click();

  await expect(page.getByRole("heading", { name: "Additions" })).toBeVisible();
  await page.locator('input[type="checkbox"]').first().check();

  await page.getByRole("button", { name: "Add to cart" }).click();
  const cartPanel = page.locator("aside.uc-panel");
  await expect(cartPanel.locator(".cic_root")).toHaveCount(1);
});

test("takeaway checkout succeeds without address", async ({ page }) => {
  await page.goto("/explore");
  await page.locator("a.cc_card").first().click();
  await expect(page).toHaveURL(/\/chef\/\d+/);

  await page.locator("button.dc_card").first().click();
  await page.getByRole("button", { name: "Add to cart" }).click();
  await page.locator("aside.uc-panel").getByRole("link", { name: "Go to checkout" }).click();

  await page.getByRole("button", { name: "Takeaway" }).click();

  await page.getByLabel("Full name").fill("Bob Pickup");
  await page.getByLabel("Phone").fill("+37491111222");
  await page.getByLabel("Email").fill("bob@example.com");

  await page.getByRole("button", { name: "Place order" }).click();
  await expect(page).toHaveURL(/\/orders\/success/);
  await expect(page.getByText("Order placed!")).toBeVisible();
});

test("admin can login and list orders after a storefront checkout", async ({
  page,
  request,
}) => {
  const chefsRes = await request.get(`${API}/api/chef/active?page=0&size=12`);
  const chefs = await chefsRes.json();
  const chef = chefs.exploreChefResponseDtoList[0];
  const chefDetail = await (await request.get(`${API}/api/chef/${chef.id}`)).json();
  const dish = chefDetail.dishes[0];
  expect(dish).toBeTruthy();

  const createRes = await request.post(`${API}/api/order`, {
    data: {
      chefId: chef.id,
      receiverName: "Admin Smoke",
      receiverPhoneNumber: "+37490000000",
      receiverEmail: "admin-smoke@example.com",
      paymentType: "CASH",
      deliveryMethod: "TAKEAWAY",
      note: "e2e admin visibility",
      createOrderDishes: [{ dishId: dish.id, quantity: 1 }],
    },
  });
  expect(createRes.ok()).toBeTruthy();
  const order = await createRes.json();
  expect(order.number).toBeTruthy();

  const login = await request.post(`${API}/admin/auth/login`, {
    data: { username: "admin", password: "admin123" },
  });
  expect(login.ok()).toBeTruthy();
  const { token } = await login.json();
  expect(token).toBeTruthy();

  const orders = await request.get(`${API}/admin/order?page=0&size=20`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(orders.ok()).toBeTruthy();
  const body = await orders.json();
  const list = body.list || body.content || body.orders || [];
  const found = Array.isArray(list)
    ? list.some((o: { number?: string }) => o.number === order.number)
    : JSON.stringify(body).includes(order.number);
  expect(found).toBeTruthy();

  await page.goto("http://localhost:3001/#/login");
  await expect(
    page.getByLabel(/username/i).or(page.locator('input[name="username"]')),
  ).toBeVisible({ timeout: 15000 });
});
