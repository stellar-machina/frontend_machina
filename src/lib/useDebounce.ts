"use client";

import { useEffect, useState } from "react";

/**
 * Return a value that lags behind `value` by `delayMs` milliseconds.
 *
 * The initial value is returned immediately. On later value or delay changes,
 * the pending timer is cleared before a new one is scheduled, so only the most
 * recent value is published after the debounce window.
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}
