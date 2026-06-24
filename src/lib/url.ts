/**
 * URL helpers for hardened link rendering.
 *
 * Security goals:
 * - Block tabnabbing for target="_blank" links at the JSX call site via
 *   rel="noopener noreferrer".
 * - Validate any href derived from backend/user input so unsafe schemes
 *   (javascript:, data:, etc.) cannot be rendered.
 */

export type SafeHrefResult = { ok: true; href: string } | { ok: false };

const UNSAFE_SCHEMES = new Set(["javascript:", "data:"]);

function normaliseScheme(input: string): string | null {
  // Reject leading whitespace and control chars: keep this strict so we don't
  // accidentally accept obfuscated schemes.
  const s = input.trim();
  const colonIndex = s.indexOf(":");
  if (colonIndex <= 0) return null;

  const scheme = s.slice(0, colonIndex).toLowerCase();
  return `${scheme}:`;
}

/**
 * Validate a link href.
 *
 * Accepts:
 * - absolute http(s) URLs
 * - relative URLs starting with `/`
 * - hash-only links like `#section`
 * - `mailto:` and `tel:` are intentionally rejected to keep the helper
 *   focused on web navigation.
 *
 * Rejects:
 * - javascript:, data:
 * - any other non-http(s) scheme
 */
export function safeHref(href: string | null | undefined): SafeHrefResult {
  if (!href) return { ok: false };

  const trimmed = href.trim();
  if (!trimmed) return { ok: false };

  // Allow in-page navigation.
  if (trimmed.startsWith("#")) return { ok: true, href: trimmed };

  // Reject protocol-relative URLs: `//example.com`.
  if (trimmed.startsWith("//")) return { ok: false };

  // Allow internal relative navigation.
  if (trimmed.startsWith("/")) return { ok: true, href: trimmed };

  const scheme = normaliseScheme(trimmed);
  if (!scheme) return { ok: false };

  if (UNSAFE_SCHEMES.has(scheme)) return { ok: false };
  if (scheme === "http:" || scheme === "https:") return { ok: true, href: trimmed };

  return { ok: false };
}

