import type { CustomerAuthDto, CustomerProfile } from "@/types";

export const CUSTOMER_AUTH_STORAGE_KEY = "foodme.customer.auth";
export const AUTH_CHANGED_EVENT = "foodme-auth-changed";

export function readStoredAuth(): CustomerAuthDto | null {
  try {
    const raw = localStorage.getItem(CUSTOMER_AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CustomerAuthDto;
    if (!parsed?.token || !parsed.customer?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeStoredAuth(auth: CustomerAuthDto) {
  localStorage.setItem(CUSTOMER_AUTH_STORAGE_KEY, JSON.stringify(auth));
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function clearStoredAuth() {
  localStorage.removeItem(CUSTOMER_AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function storedCustomer(): CustomerProfile | null {
  return readStoredAuth()?.customer ?? null;
}
