import { expect, type APIRequestContext, type Page } from "@playwright/test";

export async function createAccountAtCheckout(
  page: Page,
  name = "Casey Delivery",
) {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  const email = `e2e-${suffix}@example.com`;
  const password = "secret123";

  await page.getByRole("tab", { name: "Create account" }).click();
  const form = page.getByRole("form", { name: "Create account" });
  await form.getByLabel("Full name").fill(name);
  await form.getByLabel("Email").fill(email);
  await form.getByLabel("Phone").fill("+37493333444");
  await form.getByLabel("Password").fill(password);
  await form.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText(new RegExp(`Signed in as ${name}`))).toBeVisible();

  return { email, password, name };
}

/**
 * Registers a customer and places a cash order through the API. With `deliver`, an admin
 * then moves it NEW -> ACCEPTED -> DELIVERED so it can be rated.
 */
export async function createOrderViaApi(
  request: APIRequestContext,
  apiBase: string,
  { deliver }: { deliver: boolean },
) {
  const email = `rate-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
  const registerRes = await request.post(`${apiBase}/api/auth/register`, {
    data: { fullName: "Rating E2E", email, phoneNumber: "+37490000001", password: "secret123" },
  });
  expect(registerRes.ok()).toBeTruthy();
  const auth = await registerRes.json();

  const chefs = await (await request.get(`${apiBase}/api/chef/active?page=0&size=12`)).json();
  const chef = chefs.exploreChefResponseDtoList[0];
  const detail = await (await request.get(`${apiBase}/api/chef/${chef.id}`)).json();
  const dish = detail.dishes[0];

  const orderRes = await request.post(`${apiBase}/api/order`, {
    headers: { Authorization: `Bearer ${auth.token}` },
    data: {
      chefId: chef.id,
      receiverName: "Rating E2E",
      receiverPhoneNumber: "+37490000001",
      receiverEmail: email,
      paymentType: "CASH",
      deliveryMethod: "TAKEAWAY",
      createOrderDishes: [{ dishId: dish.id, quantity: 1 }],
    },
  });
  expect(orderRes.ok()).toBeTruthy();
  const order = await orderRes.json();

  if (deliver) {
    const loginRes = await request.post(`${apiBase}/admin/auth/login`, {
      data: { username: "admin", password: "admin123" },
    });
    expect(loginRes.ok()).toBeTruthy();
    const adminHeaders = { Authorization: `Bearer ${(await loginRes.json()).token}` };
    const list = await (
      await request.get(`${apiBase}/admin/order?page=0&size=200`, { headers: adminHeaders })
    ).json();
    const id = list.list.find((o: { number: string }) => o.number === order.number)?.id;
    expect(id).toBeTruthy();
    for (const status of ["ACCEPTED", "DELIVERED"]) {
      const res = await request.patch(`${apiBase}/admin/order/${id}/status`, {
        headers: adminHeaders,
        data: { status },
      });
      expect(res.ok()).toBeTruthy();
    }
  }

  return { auth, number: order.number as string, chefId: chef.id as number };
}

export async function signInViaStorage(page: Page, auth: unknown) {
  await page.addInitScript((value) => {
    localStorage.setItem("foodme.customer.auth", JSON.stringify(value));
  }, auth);
}

export async function registerCustomerViaApi(
  request: APIRequestContext,
  apiBase: string,
) {
  const email = `api-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
  const res = await request.post(`${apiBase}/api/auth/register`, {
    data: {
      fullName: "E2E Customer",
      email,
      phoneNumber: "+37490000000",
      password: "secret123",
    },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  return { token: body.token as string, email };
}
