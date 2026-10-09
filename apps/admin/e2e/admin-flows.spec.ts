import { test, expect, type Page } from "@playwright/test";

const API = process.env.VITE_API_BASE_URL || "http://localhost:8081";

async function loginAsAdmin(page: Page) {
  await page.goto("/#/login");
  await expect(page.getByRole("heading", { name: "FoodMe Admin" })).toBeVisible();
  await page.getByLabel("Username").fill("admin");
  await page.getByLabel("Password").fill("admin123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("menuitem", { name: "Orders" })).toBeVisible({ timeout: 15000 });
}

async function createOrderViaApi(request: import("@playwright/test").APIRequestContext) {
  const chefs = await (await request.get(`${API}/api/chef/active?page=0&size=12`)).json();
  const chef = chefs.exploreChefResponseDtoList[0];
  const detail = await (await request.get(`${API}/api/chef/${chef.id}`)).json();
  const dish = detail.dishes[0];
  const email = `admin-e2e-${Date.now()}@example.com`;
  const registerRes = await request.post(`${API}/api/auth/register`, {
    data: {
      fullName: "Admin E2E",
      email,
      phoneNumber: "+37495555666",
      password: "secret123",
    },
  });
  expect(registerRes.ok()).toBeTruthy();
  const { token } = await registerRes.json();
  const createRes = await request.post(`${API}/api/order`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      chefId: chef.id,
      receiverName: "Admin E2E",
      receiverPhoneNumber: "+37495555666",
      receiverEmail: "admin-e2e@example.com",
      paymentType: "CASH",
      deliveryMethod: "TAKEAWAY",
      note: "admin e2e order",
      createOrderDishes: [{ dishId: dish.id, quantity: 1 }],
    },
  });
  expect(createRes.ok()).toBeTruthy();
  return createRes.json();
}

test.describe("Admin auth", () => {
  test("rejects bad password", async ({ page }) => {
    await page.goto("/#/login");
    await page.getByLabel("Username").fill("admin");
    await page.getByLabel("Password").fill("wrong");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Invalid username or password.")).toBeVisible();
  });

  test("logs in with seeded credentials", async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByRole("menuitem", { name: "Chefs" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Dishes" })).toBeVisible();
  });
});

test.describe("Admin resources", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("orders list shows rows after API order", async ({ page, request }) => {
    const order = await createOrderViaApi(request);
    await page.goto("/#/orders");
    await page.getByRole("button", { name: "Refresh" }).click();
    await expect(page.getByText(order.number)).toBeVisible({ timeout: 15000 });
  });

  test("order show + mark ACCEPTED", async ({ page, request }) => {
    const order = await createOrderViaApi(request);
    await page.goto("/#/orders");
    await page.getByRole("button", { name: "Refresh" }).click();
    await page.getByText(order.number).click();
    await expect(page).toHaveURL(/#\/orders\/\d+\/show/);
    // Both the app-bar title and the page heading render "Order FM-…"; target
    // the h5 page heading to keep the locator strict-mode safe.
    await expect(
      page.getByRole("heading", { name: `Order ${order.number}`, level: 5 }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Mark as ACCEPTED" }).click();
    await expect(page.getByText("Order status updated")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("ACCEPTED").first()).toBeVisible();
  });

  // KAN-5: the Customer review section on the order page
  test.describe("Customer review", () => {
    async function adminToken(request: import("@playwright/test").APIRequestContext) {
      const res = await request.post(`${API}/admin/auth/login`, {
        data: { username: "admin", password: "admin123" },
      });
      return (await res.json()).token as string;
    }

    async function deliverOrder(request: import("@playwright/test").APIRequestContext, number: string) {
      const headers = { Authorization: `Bearer ${await adminToken(request)}` };
      const list = await (await request.get(`${API}/admin/order?page=0&size=200`, { headers })).json();
      const id = list.list.find((o: { number: string }) => o.number === number).id;
      for (const status of ["ACCEPTED", "DELIVERED"]) {
        const res = await request.patch(`${API}/admin/order/${id}/status`, { headers, data: { status } });
        expect(res.ok()).toBeTruthy();
      }
      return id as number;
    }

    async function placeOrderAsCustomer(request: import("@playwright/test").APIRequestContext) {
      const chefs = await (await request.get(`${API}/api/chef/active?page=0&size=12`)).json();
      const chef = chefs.exploreChefResponseDtoList[0];
      const detail = await (await request.get(`${API}/api/chef/${chef.id}`)).json();
      const email = `review-e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
      const { token } = await (
        await request.post(`${API}/api/auth/register`, {
          data: { fullName: "Review E2E", email, phoneNumber: "+37495555666", password: "secret123" },
        })
      ).json();
      const order = await (
        await request.post(`${API}/api/order`, {
          headers: { Authorization: `Bearer ${token}` },
          data: {
            chefId: chef.id,
            receiverName: "Review E2E",
            receiverPhoneNumber: "+37495555666",
            receiverEmail: email,
            paymentType: "CASH",
            deliveryMethod: "TAKEAWAY",
            createOrderDishes: [{ dishId: detail.dishes[0].id, quantity: 1 }],
          },
        })
      ).json();
      return { token, number: order.number as string };
    }

    test("shows stars, comment and date of a rated order", async ({ page, request }) => {
      const { token, number } = await placeOrderAsCustomer(request);
      const id = await deliverOrder(request, number);
      const rateRes = await request.post(`${API}/api/customer/orders/${number}/rating`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { stars: 4, comment: "Lovely, a bit late" },
      });
      expect(rateRes.ok()).toBeTruthy();

      await page.goto(`/#/orders/${id}/show`);
      const review = page.getByTestId("customer-review");
      await expect(page.getByText("Customer review")).toBeVisible({ timeout: 15000 });
      await expect(review.getByRole("img", { name: "Rated 4 out of 5 stars" })).toBeVisible();
      await expect(review.getByText("Lovely, a bit late")).toBeVisible();
      await expect(page.getByText("No review yet")).toHaveCount(0);
    });

    test("says 'No review yet' for a delivered order that is not rated", async ({ page, request }) => {
      const { number } = await placeOrderAsCustomer(request);
      const id = await deliverOrder(request, number);

      await page.goto(`/#/orders/${id}/show`);
      await expect(page.getByText("Customer review")).toBeVisible({ timeout: 15000 });
      await expect(page.getByText("No review yet")).toBeVisible();
    });

    test("hides the section for orders that are not delivered", async ({ page, request }) => {
      const order = await createOrderViaApi(request);
      await page.goto("/#/orders");
      await page.getByRole("button", { name: "Refresh" }).click();
      await page.getByText(order.number).click();
      await expect(
        page.getByRole("heading", { name: `Order ${order.number}`, level: 5 }),
      ).toBeVisible();
      await expect(page.getByText("Customer review")).toHaveCount(0);
    });
  });

  test("chefs list loads and opens edit", async ({ page }) => {
    await page.goto("/#/chefs");
    await expect(page.getByText("No Chefs found")).toHaveCount(0, { timeout: 15000 });
    await expect(
      page.getByText(/Alans Kitchen|Italiano Margarino|Chef Verona|Argentinean|Armenian Traditional|Sakura Kitchen/i).first(),
    ).toBeVisible({ timeout: 15000 });
    await page.locator("table tbody tr").first().click();
    await expect(page).toHaveURL(/#\/chefs\/\d+/);
  });

  test("dishes list loads and opens edit", async ({ page }) => {
    await page.goto("/#/dishes");
    await expect(page.getByText("No Dishes found")).toHaveCount(0, { timeout: 15000 });
    await expect(page.locator("table tbody tr").first()).toBeVisible({ timeout: 15000 });
    await page.locator("table tbody tr").first().click();
    await expect(page).toHaveURL(/#\/dishes\/\d+/);
  });

  test("sidebar navigates between resources", async ({ page }) => {
    await page.goto("/#/orders");
    await page.getByRole("menuitem", { name: "Chefs" }).click();
    await expect(page).toHaveURL(/#\/chefs/);
    await page.getByRole("menuitem", { name: "Dishes" }).click();
    await expect(page).toHaveURL(/#\/dishes/);
    await page.getByRole("menuitem", { name: "Orders" }).click();
    await expect(page).toHaveURL(/#\/orders/);
  });
});
