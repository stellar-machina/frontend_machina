"use client";

import { useEffect, useState } from "react";

/**
 * Persist client state to `window.localStorage` under `key`.
 *
 * The `initial` value is used for the first render and as the fallback when the
 * key is missing, unreadable, or contains invalid JSON. localStorage is read
 * only after mount, which keeps server rendering safe. Writes update React
 * state first and then best-effort persist; quota/storage errors are ignored.
 */
export function useLocalState<T>(
  key: string,
  initial: T,
): [T, (next: T) => void] {
  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        // localStorage is only available after mount; hydrate persisted state once.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setValue(JSON.parse(raw) as T);
      }
    } catch {
      /* ignore */
    }
  }, [key]);

  const write = (next: T) => {
    setValue(next);
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch {
      /* ignore quota errors */
    }
  };

  return [value, write];
}
