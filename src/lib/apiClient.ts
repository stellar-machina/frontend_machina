// Lightweight wrapper around fetch() for the AgentPay backend API.
// Centralises base URL resolution and error handling so call sites stay
// small.

import { resolveApiBase } from "./resolveApiBase";

// Resolved at module load time so any misconfiguration surfaces during boot
// rather than at the first fetch.
const API_BASE = resolveApiBase();
const DEFAULT_API_TIMEOUT_MS = 10_000;

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

export type ApiFetchInit = RequestInit & {
  /** Request timeout in milliseconds. Pass 0 or a negative value to disable. */
  timeoutMs?: number;
};

export class ApiTimeoutError extends Error {
  timeoutMs: number;

  constructor(timeoutMs: number) {
    super(`request timed out after ${timeoutMs}ms`);
    this.name = "ApiTimeoutError";
    this.timeoutMs = timeoutMs;
  }
}

function shouldUseTimeout(timeoutMs: number) {
  return Number.isFinite(timeoutMs) && timeoutMs > 0;
}

async function readJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return undefined;
  }
}

function createHttpError(status: number, body: unknown) {
  const apiError =
    body && typeof body === "object" ? (body as Partial<ApiError>) : undefined;
  const message =
    typeof apiError?.message === "string" && apiError.message.length > 0
      ? apiError.message
      : `Request failed with status ${status}`;
  const err = new Error(message);

  return Object.assign(err, apiError ?? {}, {
    error:
      typeof apiError?.error === "string" && apiError.error.length > 0
        ? apiError.error
        : "http_error",
  });
}

/**
 * Fetch JSON from the AgentPay API.
 *
 * `timeoutMs` defaults to 10 seconds. A caller-provided `signal` is composed
 * with the internal timeout signal, so whichever aborts first wins. Timers and
 * caller abort listeners are always cleared after the request settles.
 */
export async function apiFetch<T>(
  path: string,
  init: ApiFetchInit = {}
): Promise<T> {
  const { timeoutMs, signal: callerSignal, headers, ...restInit } = init;
  const effectiveTimeoutMs = timeoutMs ?? DEFAULT_API_TIMEOUT_MS;
  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let timeoutError: ApiTimeoutError | undefined;

  const abortFromCaller = () => {
    controller.abort(callerSignal?.reason);
  };

  if (callerSignal?.aborted) {
    abortFromCaller();
  } else {
    callerSignal?.addEventListener("abort", abortFromCaller, { once: true });
  }

  if (shouldUseTimeout(effectiveTimeoutMs) && !controller.signal.aborted) {
    timeoutId = setTimeout(() => {
      timeoutError = new ApiTimeoutError(effectiveTimeoutMs);
      controller.abort(timeoutError);
    }, effectiveTimeoutMs);
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...restInit,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(headers ?? {}),
      },
    });
    if (res.status === 204) return undefined as T;
    const body = (await readJson(res)) as T | ApiError | undefined;
    if (!res.ok) {
      throw createHttpError(res.status, body);
    }
    return body as T;
  } catch (error) {
    if (timeoutError !== undefined) {
      throw timeoutError;
    }
    throw error;
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    callerSignal?.removeEventListener("abort", abortFromCaller);
  }
}

export const apiGet = <T>(path: string, init: ApiFetchInit = {}) =>
  apiFetch<T>(path, init);
export const apiPost = <T>(
  path: string,
  body: unknown,
  init: ApiFetchInit = {}
) => apiFetch<T>(path, { ...init, method: "POST", body: JSON.stringify(body) });
export const apiPatch = <T>(
  path: string,
  body: unknown,
  init: ApiFetchInit = {}
) => apiFetch<T>(path, { ...init, method: "PATCH", body: JSON.stringify(body) });
export const apiDelete = (path: string, init: ApiFetchInit = {}) =>
  apiFetch<void>(path, { ...init, method: "DELETE" });
