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
