// Lightweight wrapper around fetch() for the AgentPay backend API.
// Centralises base URL resolution and error handling so call sites stay
// small.

import { resolveApiBase } from "./resolveApiBase";

// Resolved at module load time so any misconfiguration surfaces during boot
// rather than at the first fetch.
const API_BASE = resolveApiBase();

export type ApiError = {
  error: string;
  message: string;
  requestId?: string;
};

async function readResponseBody(res: Response): Promise<unknown | undefined> {
  const responseBody: unknown = (res as Response & { body?: unknown }).body;
  if (typeof responseBody === "string") {
    if (responseBody.trim().length === 0) return undefined;
    return JSON.parse(responseBody);
  }

  const parsed = await res.json();
  return parsed === null ? undefined : parsed;
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  // Spread `init` first so caller-provided top-level keys win, then re-apply
  // `headers` so our default `Content-Type: application/json` is preserved
  // unless the caller explicitly overrides it via `init.headers`.
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (res.status === 204) return undefined as T;
  let body: T | ApiError | undefined;
  try {
    body = (await readResponseBody(res)) as T | ApiError | undefined;
  } catch {
    if (!res.ok) {
      const err = new Error(res.statusText || "Request failed");
      throw err;
    }
    throw new Error("Response body was not valid JSON");
  }
  if (!res.ok) {
    const apiError = (body ?? {}) as Partial<ApiError>;
    const err = new Error(apiError.message || res.statusText || "Request failed");
    throw Object.assign(err, apiError);
  }
  return body as T;
}

export const apiGet = <T>(path: string) => apiFetch<T>(path);
export const apiPost = <T>(path: string, body: unknown) =>
  apiFetch<T>(path, { method: "POST", body: JSON.stringify(body) });
export const apiPatch = <T>(path: string, body: unknown) =>
  apiFetch<T>(path, { method: "PATCH", body: JSON.stringify(body) });
export const apiDelete = (path: string) =>
  apiFetch<void>(path, { method: "DELETE" });
