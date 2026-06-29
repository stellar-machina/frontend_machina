const STROOPS_PER_XLM = 10_000_000;
const DEFAULT_LOCALE = "en-US";

const xlmFormatter = new Intl.NumberFormat(DEFAULT_LOCALE, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 7,
});

const integerFormatter = new Intl.NumberFormat(DEFAULT_LOCALE, {
  maximumFractionDigits: 0,
});

/**
 * Format a stroops amount using Stellar's 1 XLM = 10,000,000 stroops ratio.
 * Zero remains `0 XLM`; non-zero sub-cent values stay in grouped raw stroops
 * so tiny balances are not hidden as `0.00 XLM`.
 */
export function formatStroops(stroops: number): string {
  const xlm = stroops / STROOPS_PER_XLM;
  if (xlm === 0) return "0 XLM";
  if (xlm < 0.01) {
    const unit = Math.abs(stroops) === 1 ? "stroop" : "stroops";
    return `${integerFormatter.format(stroops)} ${unit}`;
  }
  return `${xlmFormatter.format(xlm)} XLM`;
}

/** Format a numeric request count with thousands separators. */
export function formatRequests(n: number): string {
  return integerFormatter.format(n);
}

/** Format an absolute timestamp into a short HH:MM:SS string. */
export function formatTime(ms: number): string {
  const d = new Date(ms);
  return d.toISOString().slice(11, 19);
}

/**
 * Maximum number of characters any single serialised payload is allowed to
 * occupy in the event log before the renderer truncates it with a marker.
 *
 * Lower so a single event never dominates the page (DOM cost + scroll). Keep
 * the value stable so callers / tests can rely on it.
 */
export const EVENT_PAYLOAD_MAX_CHARS = 5000;

/** Marker appended to truncated payloads so readers can spot the cut-off. */
export const EVENT_PAYLOAD_TRUNCATED_MARKER = "\n…(truncated)";

/**
 * Safely serialise an arbitrary value to JSON, defending against:
 *   - circular references (replaced with `[Circular]`)
 *   - values JSON can't represent natively, e.g. `BigInt` (replaced with a
 *     stringified marker)
 * Then truncate the result to at most `maxChars` characters and append a
 * visible marker so the operator can see the cut-off.
 *
 * The function never throws so it can be used inside render code without
 * needing an error boundary.
 */
export function safeStringify(
  value: unknown,
  maxChars: number = EVENT_PAYLOAD_MAX_CHARS
): string {
  // Top-level `undefined` / functions / symbols: `JSON.stringify` returns
  // `undefined` and never invokes the replacer consistently. Surface them
  // as a sentinel so callers always get a renderable string.
  if (
    value === undefined ||
    typeof value === "function" ||
    typeof value === "symbol"
  ) {
    return `[${typeof value}]`;
  }
  const seen = new WeakSet<object>();
  let serialised = "";
  try {
    serialised = JSON.stringify(
      value,
      (_key, v) => {
        if (typeof v === "bigint") return `[BigInt:${v.toString()}]`;
        if (typeof v === "function") return "[Function]";
        if (typeof v === "symbol") return "[Symbol]";
        if (typeof v === "undefined") return "[undefined]";
        if (v !== null && typeof v === "object") {
          if (seen.has(v)) return "[Circular]";
          seen.add(v);
        }
        return v;
      },
      2
    );
  } catch {
    // Defensive: JSON.stringify should be total after the replacer above,
    // but we still refuse to throw inside render code.
    return "[unserialisable]";
  }
  if (serialised === undefined) return "[undefined]";
  if (serialised.length <= maxChars) return serialised;
  return (
    serialised.slice(0, Math.max(0, maxChars)) + EVENT_PAYLOAD_TRUNCATED_MARKER
  );
}

type TimestampInput = number | string | null | undefined;

/**
 * Format a timestamp that may be malformed into a safe ISO string. Non-finite
 * numbers, nullish arguments, and unparseable values fall back to the
 * placeholder so the page never throws `Invalid time value`.
 */
export function safeFormatTimestamp(
  value: TimestampInput,
  fallback: string = "\u2014"
): string {
  if (value === null || value === undefined) return fallback;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  const d = new Date(n);
  if (Number.isNaN(d.getTime())) return fallback;
  return d.toISOString();
}
