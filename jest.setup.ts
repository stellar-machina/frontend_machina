import "@testing-library/jest-dom";

// Minimal Response polyfill for the jsdom test environment: jest-environment-jsdom
// 29 sometimes strips the native Response global, so a tiny shim lets the
// apiFetch tests use `new Response(JSON.stringify(body), { status })` without
// pulling in undici.
if (typeof global.Response === "undefined") {
  class ResponsePolyfill {
    body: string;
    status: number;
    statusText: string;
    constructor(body?: BodyInit | null, init?: ResponseInit) {
      this.body =
        typeof body === "string" ? body : body == null ? "" : String(body);
      this.status = init?.status ?? 200;
      this.statusText = init?.statusText ?? "";
    }
    get ok() {
      return this.status >= 200 && this.status < 300;
    }
    async json() {
      return JSON.parse(this.body || "null");
    }
  }
  (global as unknown as { Response: typeof ResponsePolyfill }).Response =
    ResponsePolyfill as unknown as typeof global.Response;
}

jest.mock("next/font/google", () => ({
  Geist: () => ({
    variable: "--font-geist-sans",
    style: { fontFamily: "Geist" },
  }),
  Geist_Mono: () => ({
    variable: "--font-geist-mono",
    style: { fontFamily: "Geist Mono" },
  }),
}));
