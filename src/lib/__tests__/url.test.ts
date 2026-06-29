import { safeHref } from "../url";

describe("safeHref", () => {
  it("rejects null/undefined/empty", () => {
    expect(safeHref(undefined)).toEqual({ ok: false });
    expect(safeHref(null)).toEqual({ ok: false });
    expect(safeHref("")).toEqual({ ok: false });
    expect(safeHref("   ")).toEqual({ ok: false });
  });

  it("allows in-page hash links", () => {
    expect(safeHref("#section")).toEqual({ ok: true, href: "#section" });
    expect(safeHref("   #s2  ")).toEqual({ ok: true, href: "#s2" });
  });

  it("allows internal relative links starting with slash", () => {
    expect(safeHref("/settings")).toEqual({ ok: true, href: "/settings" });
    expect(safeHref("  /a/b?c=1 ")).toEqual({ ok: true, href: "/a/b?c=1" });
  });

  it("allows absolute http(s) URLs", () => {
    expect(safeHref("https://example.com")).toEqual({ ok: true, href: "https://example.com" });
    expect(safeHref("http://example.com/path?a=b")).toEqual({ ok: true, href: "http://example.com/path?a=b" });
  });

  it("rejects javascript: scheme", () => {
    expect(safeHref("javascript:alert(1)" as string)).toEqual({ ok: false });
    expect(safeHref("  javascript:alert(1)  ")).toEqual({ ok: false });
    // Obfuscated/extra whitespace inside scheme should still be rejected.
    expect(safeHref("java script:alert(1)" as string)).toEqual({ ok: false });
  });

  it("rejects data: scheme", () => {
    expect(safeHref("data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==" as string)).toEqual({ ok: false });
    expect(safeHref("  data:text/plain,hi  " as string)).toEqual({ ok: false });
  });

  it("rejects non-http(s) schemes", () => {
    expect(safeHref("mailto:test@example.com" as string)).toEqual({ ok: false });
    expect(safeHref("tel:+123456" as string)).toEqual({ ok: false });
    expect(safeHref("ftp://example.com" as string)).toEqual({ ok: false });
    expect(safeHref("chrome://extensions" as string)).toEqual({ ok: false });
  });

  it("rejects malformed hrefs without a valid scheme", () => {
    // Contains ':' but no scheme at the beginning.
    expect(safeHref("//example.com" as string)).toEqual({ ok: false });
    expect(safeHref("example.com:80" as string)).toEqual({ ok: false });

    // A protocol-relative URL ("//example.com") should be rejected since the
    // scheme is not explicitly http(s).
    expect(safeHref("//example.com" as string)).toEqual({ ok: false });
    expect(safeHref("//example.com" as string)).toEqual({ ok: false });
  });
});

