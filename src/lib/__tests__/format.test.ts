import {
  EVENT_PAYLOAD_MAX_CHARS,
  EVENT_PAYLOAD_TRUNCATED_MARKER,
  formatRequests,
  formatStroops,
  formatTime,
  safeFormatTimestamp,
  safeStringify,
} from "../format";

describe("format", () => {
  it("formatStroops scales to XLM", () => {
    expect(formatStroops(0)).toBe("0 XLM");
    expect(formatStroops(10_000_000)).toBe("1.00 XLM");
    expect(formatStroops(1_000)).toBe("1,000 stroops");
  });
  it("formatStroops groups large XLM values and preserves sub-cent precision", () => {
    expect(formatStroops(12_345_678_900)).toBe("1,234.56789 XLM");
    expect(formatStroops(1)).toBe("1 stroop");
    expect(formatStroops(999)).toBe("999 stroops");
    expect(formatStroops(1_000)).toBe("1,000 stroops");
  });
  it("formatRequests adds separators", () => {
    expect(formatRequests(1234567)).toBe("1,234,567");
  });
  it("formatTime returns HH:MM:SS", () => {
    expect(formatTime(0)).toBe("00:00:00");
  });
});

describe("safeStringify", () => {
  it("stringifies a plain object", () => {
    expect(safeStringify({ a: 1 })).toBe('{\n  "a": 1\n}');
  });

  it("returns an empty `{}` / `[]` shape for empty objects / arrays", () => {
    expect(safeStringify({})).toBe("{}");
    expect(safeStringify([])).toBe("[]");
  });

  it("serialises arrays and primitives", () => {
    expect(safeStringify([1, "two", null])).toBe('[\n  1,\n  "two",\n  null\n]');
  });

  it("handles null and undefined safely", () => {
    expect(safeStringify(null)).toBe("null");
    // JSON.stringify(undefined) returns `undefined`; we surface a placeholder
    // rather than dumping a raw `undefined` to the DOM.
    expect(safeStringify(undefined)).toBe("[undefined]");
  });

  it("handles symbols and functions at the top level via a stable sentinel", () => {
    expect(safeStringify(Symbol("x"))).toBe("[symbol]");
    expect(safeStringify(() => undefined)).toBe("[function]");
  });

  it("handles circular references by replacing them with [Circular]", () => {
    const o: Record<string, unknown> = { name: "loop" };
    o.self = o;
    const result = safeStringify(o);
    expect(result).toContain("[Circular]");
    expect(result).toContain('"name": "loop"');
  });

  it("handles deeply nested arrays with circular references", () => {
    const arr: unknown[] = [1];
    arr.push(arr);
    const result = safeStringify(arr);
    // `JSON.stringify([1, [Circular]])` pretty-printed in 2-space indent.
    expect(result).toContain("[Circular]");
    expect(result).toContain("1");
  });

  it("replaces bigint values with a tagged marker instead of throwing", () => {
    const result = safeStringify({ amount: BigInt(10) });
    expect(result).toContain("[BigInt:10]");
  });

  it("replaces functions and undefined leaves with safe markers", () => {
    const result = safeStringify({ fn: () => undefined, missing: undefined });
    expect(result).toContain("[Function]");
    expect(result).toContain("[undefined]");
  });

  it("truncates oversized payloads and appends the visible marker", () => {
    const huge = { data: "x".repeat(EVENT_PAYLOAD_MAX_CHARS * 2) };
    const result = safeStringify(huge);
    expect(result.length).toBeLessThanOrEqual(
      EVENT_PAYLOAD_MAX_CHARS + EVENT_PAYLOAD_TRUNCATED_MARKER.length + 32
    );
    expect(result).toContain(EVENT_PAYLOAD_TRUNCATED_MARKER.trim());
  });

  it("leaves small payloads untouched", () => {
    const small = { hi: 1 };
    const result = safeStringify(small);
    expect(result.endsWith(EVENT_PAYLOAD_TRUNCATED_MARKER.trim())).toBe(false);
  });

  it("falls back to a sentinel string instead of throwing if stringify explodes", () => {
    const trap: Record<string, unknown> = {};
    Object.defineProperty(trap, "boom", {
      enumerable: true,
      get() {
        throw new Error("nope");
      },
    });
    expect(safeStringify(trap)).toBe("[unserialisable]");
  });
});

describe("safeFormatTimestamp", () => {
  it("returns an ISO string for a finite numeric timestamp", () => {
    expect(safeFormatTimestamp(0)).toBe("1970-01-01T00:00:00.000Z");
  });

  it("parses numeric strings that represent a finite value", () => {
    expect(safeFormatTimestamp("1700000000000")).toBe(
      new Date(1700000000000).toISOString()
    );
  });

  it("falls back for NaN, Infinity, and non-numeric input", () => {
    expect(safeFormatTimestamp(NaN)).toBe("—");
    expect(safeFormatTimestamp(Infinity)).toBe("—");
    expect(safeFormatTimestamp("not a date")).toBe("—");
    expect(safeFormatTimestamp(undefined)).toBe("—");
    expect(safeFormatTimestamp(null)).toBe("—");
  });

  it("honours a custom fallback string", () => {
    expect(safeFormatTimestamp(NaN, "n/a")).toBe("n/a");
  });

  it("returns the default em-dash fallback when none is provided", () => {
    // The renderer uses the em dash by default so the missing-time placeholder
    // doesn't visually collide with a numeric timestamp.
    expect(safeFormatTimestamp(NaN)).toBe("\u2014");
  });
});
