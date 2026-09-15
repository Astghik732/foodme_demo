import { clearStoredAuth, readStoredAuth } from "@/lib/auth-storage";

const RAW_API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";
// Render's blueprint `fromService` injects a bare host (no scheme); prepend https:// so it works.
const API_BASE_URL: string = /^https?:\/\//.test(RAW_API_BASE_URL) ? RAW_API_BASE_URL : `https://${RAW_API_BASE_URL}`;

export class ApiRequestError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function authHeaders(): HeadersInit {
  const token = readStoredAuth()?.token;
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...authHeaders(),
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    if (res.status === 401 && path.startsWith("/api/customer")) {
      clearStoredAuth();
    }
    let message = res.statusText;
    try {
      const body = await res.json();
      message = body.message || message;
    } catch {
      // response had no JSON body
    }
    throw new ApiRequestError(message, res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
};

export { API_BASE_URL };
