import { clearStoredAuth, readStoredAuth } from "@/lib/auth-storage";

// Same-origin deploy: the backend serves this SPA and the API from one host, so
// the production default is an empty base (relative "/api/..." calls). Local `npm run
// dev` talks to the backend on :8081. An explicit VITE_API_BASE_URL still wins.
const ENV_BASE = import.meta.env.VITE_API_BASE_URL as string | undefined;
const RAW_API_BASE_URL: string = ENV_BASE ?? (import.meta.env.DEV ? "http://localhost:8081" : "");
// A bare host (no scheme) gets https:// prepended for back-compat; "" stays relative.
const API_BASE_URL: string =
  RAW_API_BASE_URL === "" || /^https?:\/\//.test(RAW_API_BASE_URL)
    ? RAW_API_BASE_URL
    : `https://${RAW_API_BASE_URL}`;

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
