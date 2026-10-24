/// <reference types="vite/client" />

const API_BASE = (import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "");

function getToken(): string | null {
  try {
    return localStorage.getItem("accessToken");
  } catch {
    return null;
  }
}

function setToken(token: string | null) {
  if (token) {
    localStorage.setItem("accessToken", token);
  } else {
    localStorage.removeItem("accessToken");
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: "omit",
  });

  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");
  const body = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = (isJson && body?.error) ? body.error : (isJson && body?.message) ? body.message : `Request failed with status ${response.status}`;
    const error = new Error(message) as Error & { status: number };
    error.status = response.status;
    throw error;
  }

  return body as T;
}

export const api = {
  get: <T>(endpoint: string) => apiClient<T>(endpoint, { method: "GET" }),
  post: <T>(endpoint: string, data: unknown) =>
    apiClient<T>(endpoint, { method: "POST", body: JSON.stringify(data) }),
  patch: <T>(endpoint: string, data: unknown) =>
    apiClient<T>(endpoint, { method: "PATCH", body: JSON.stringify(data) }),
  put: <T>(endpoint: string, data: unknown) =>
    apiClient<T>(endpoint, { method: "PUT", body: JSON.stringify(data) }),
  delete: <T>(endpoint: string) =>
    apiClient<T>(endpoint, { method: "DELETE" }),
};

export { getToken, setToken, API_BASE };
